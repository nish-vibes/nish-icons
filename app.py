"""NiSH Icons - give folders and shortcuts their own icon from a library of favourites, straight
from Explorer's right-click menu. For Windows, no admin rights needed.

Run:  python app.py                         the window
      python app.py --apply ICON TARGET     what the right-click menu runs (no window)
      python app.py --reset TARGET          back to the default icon (no window)
      python app.py --pick TARGET           opens the window to choose an icon for TARGET
      python app.py --smoketest OUTDIR      opens the window, clicks through everything, writes a report
"""
import os
import struct
import sys
import time
from pathlib import Path

import folders
import library
import menu
import settings

VERSION = "dev"


def resource(*parts):
    base = Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parent))
    return base.joinpath(*parts)


try:
    VERSION = resource("VERSION").read_text(encoding="utf-8").strip() or VERSION
except OSError:
    pass


def message_box(text, title=settings.APP_NAME, error=False):
    """A plain Windows message box. NISH_ICONS_QUIET=1 prints instead, so tests and build
    servers (where nobody can click OK) never wait forever."""
    if os.name == "nt" and not os.environ.get("NISH_ICONS_QUIET"):
        import ctypes
        ctypes.windll.user32.MessageBoxW(None, text, title, 0x10 if error else 0x40)
    else:
        print(text)


# ------------------------------------------------------------------ the model behind the window

class Api:
    """Everything the page may ask Python for. Only methods are exposed to JavaScript."""

    def __init__(self, pick=None, test_library=None):
        self._window = None
        self._pick = pick
        self._test_library = test_library   # only for the build's smoke test
        self._libs = {}       # library id -> scan result (cached)
        self._open = {}       # libraries opened but not saved: id -> {"id", "name", "path"}

    # --- startup
    def init(self):
        return {
            "version": VERSION,
            "theme": settings.get("theme"),
            "welcomed": bool(settings.get("welcomed")),
            "libraries": self._library_list(),
            "favourites": settings.get("favourites"),
            "menuItems": menu.tidy(settings.get("menu_items"), settings.get("saved_icons")),
            "savedIcons": self._saved_for_page(),
            "tags": settings.get("tags"),
            "tagMap": settings.get("tag_map"),
            "menu": self._menu_status(),
            "startFolder": self._start_folder(),
            "places": settings.places(),
            "pick": self._pick_info(),
            "store": str(settings.ICON_STORE),
            "limits": {"top": menu.TOP_MAX, "group": menu.GROUP_MAX},
            "testLibrary": self._test_library,
        }

    def _pick_info(self):
        if not self._pick:
            return None
        p = Path(self._pick)
        return {"path": str(p), "name": p.stem if folders.is_shortcut(p) else (p.name or str(p))}

    def _start_folder(self):
        chosen = settings.get("start_folder")
        if chosen and Path(chosen).is_dir():
            return chosen
        return str(settings.documents())

    # --- libraries
    def _records(self):
        """Saved libraries first, then the ones opened this session but not saved."""
        saved = [dict(l, saved=True) for l in settings.get("libraries")]
        return saved + [dict(l, saved=False) for l in self._open.values()]

    def _record(self, lib_id):
        for rec in self._records():
            if rec["id"] == lib_id:
                return rec
        raise ValueError("That library is not open any more.")

    def _library_list(self):
        out = []
        for rec in self._records():
            scan = self._libs.get(rec["id"])
            out.append({"id": rec["id"], "name": rec["name"], "path": rec["path"], "saved": rec["saved"],
                        "exists": Path(rec["path"]).is_dir(),
                        "count": len(scan["icons"]) if scan else None})
        return out

    def library(self, lib_id, fresh=False):
        """The icons of one library (scanned once, then cached)."""
        rec = self._record(lib_id)
        if fresh or lib_id not in self._libs:
            if not Path(rec["path"]).is_dir():
                raise ValueError(f"The folder for “{rec['name']}” is missing: {rec['path']}")
            self._libs[lib_id] = library.scan(rec["path"], prefix=lib_id + ":")
        scan = self._libs[lib_id]
        return dict(scan, id=lib_id, name=rec["name"], path=rec["path"], saved=rec["saved"])

    def open_path(self, path, save=False):
        """Open a folder of icons as a library. A folder that already is one is just shown."""
        path = Path(path)
        if not path.is_dir():
            raise ValueError("That folder does not exist.")
        key = os.path.normcase(str(path.resolve()))
        for rec in self._records():
            if os.path.normcase(str(Path(rec["path"]).resolve())) == key:
                if save and not rec["saved"]:
                    self.save_library(rec["id"])
                return {"library": self.library(rec["id"]), "libraries": self._library_list()}
        rec = {"id": settings.new_id("L"), "name": path.name or str(path), "path": str(path)}
        self._open[rec["id"]] = rec
        if save:
            self.save_library(rec["id"])
        return {"library": self.library(rec["id"]), "libraries": self._library_list()}

    def open_folder(self, save=False):
        recs = self._records()
        start = recs[-1]["path"] if recs else str(settings.documents())
        path = self._choose_folder(start)
        return self.open_path(path, save) if path else None

    def save_library(self, lib_id):
        rec = self._open.pop(lib_id, None)
        if rec:
            libs = settings.get("libraries")
            libs.append(rec)
            settings.put("libraries", libs)
        return self._library_list()

    def close_library(self, lib_id):
        """Forget a library: an unsaved one is closed, a saved one is taken off the list. The folder
        itself, and favourites and menu icons that came from it, are left alone."""
        self._open.pop(lib_id, None)
        settings.put("libraries", [l for l in settings.get("libraries") if l["id"] != lib_id])
        self._libs.pop(lib_id, None)
        return self._library_list()

    def relocate_library(self, lib_id):
        rec = self._record(lib_id)
        path = self._choose_folder(rec["path"] if Path(rec["path"]).is_dir() else str(settings.documents()))
        if not path:
            return None
        return self.move_library(lib_id, path)

    def move_library(self, lib_id, path):
        if not Path(path).is_dir():
            raise ValueError("That folder does not exist.")
        if lib_id in self._open:
            self._open[lib_id]["path"] = str(path)
        else:
            self._record(lib_id)
            settings.put("libraries", [dict(l, path=str(path)) if l["id"] == lib_id else l
                                       for l in settings.get("libraries")])
        return {"library": self.library(lib_id, fresh=True), "libraries": self._library_list()}

    def rescan(self, lib_id=None):
        """Look for new icons: in one library, or in every library opened so far."""
        if lib_id:
            return {"library": self.library(lib_id, fresh=True), "libraries": self._library_list()}
        self._libs.clear()
        return {"library": None, "libraries": self._library_list()}

    def preview(self, icon_id):
        path = self._icon_path(icon_id, copy=False)
        return library.preview_url(path, 128) if path else None

    def _source(self, icon_id):
        """The original file of an icon in one of the libraries, and that library."""
        lib_id, _, rel = str(icon_id).partition(":")
        rec = self._record(lib_id)
        return library.resolve(rec["path"], rel), rec

    def _icon_path(self, icon_id, copy=True):
        """The file for an icon. With copy=True it is the copy in the app's own icon folder, which is
        what folders and shortcuts point at."""
        saved = settings.get("saved_icons")
        if icon_id in saved and Path(saved[icon_id]["ico"]).is_file():
            return Path(saved[icon_id]["ico"])
        src, _rec = self._source(icon_id)
        if not copy:
            return src
        return folders.copy_icon_to_store(src, settings.ICON_STORE, src.name)

    # --- favourites, the right-click menu, tags
    def _saved_for_page(self, saved=None):
        saved = settings.get("saved_icons") if saved is None else saved
        return {k: {"label": v["label"], "file": Path(v["ico"]).name, "colour": v.get("colour", "other"),
                    "lib": v.get("lib", ""), "thumb": library.preview_url(v["ico"], 64)}
                for k, v in saved.items()}

    def _keep(self, wanted):
        """Every icon id in `wanted` gets a copy in the icon folder; ids nobody uses any more leave the
        list (their files stay, because folders may point at them). Returns the new list."""
        saved = settings.get("saved_icons")
        keep = {}
        for icon_id in wanted:
            if icon_id in keep:
                continue
            if icon_id in saved and Path(saved[icon_id]["ico"]).is_file():
                keep[icon_id] = saved[icon_id]
                continue
            try:
                src, rec = self._source(icon_id)
            except Exception:
                continue
            stored = folders.copy_icon_to_store(src, settings.ICON_STORE, src.name)
            keep[icon_id] = {"label": library.pretty_name(src.stem), "ico": str(stored),
                             "colour": library.colour_of(src.stem), "lib": rec["name"]}
        settings.put("saved_icons", keep)
        return keep

    @staticmethod
    def _menu_ids(entries):
        ids = []
        for e in entries:
            ids += (e.get("items") or []) if e.get("kind") == "group" else [e.get("id")]
        return [i for i in ids if isinstance(i, str)]

    def _sync(self, favourites, entries):
        favourites = [i for i in dict.fromkeys(favourites or []) if isinstance(i, str)]
        raw = [e for e in entries or [] if isinstance(e, dict)]
        saved = self._keep(favourites + self._menu_ids(raw))
        favourites = [i for i in favourites if i in saved]
        entries = menu.tidy(raw, saved)
        settings.put("favourites", favourites)
        settings.put("menu_items", entries)
        saved = self._keep(favourites + self._menu_ids(entries))
        status = self._write_menu()
        return {"favourites": favourites, "menuItems": entries, "savedIcons": self._saved_for_page(saved),
                "menu": status}

    def save_favourites(self, favourites):
        return self._sync(list(favourites or []), settings.get("menu_items"))

    def save_menu_items(self, entries):
        return self._sync(settings.get("favourites"), entries)

    def save_tags(self, tags, tag_map):
        clean_tags, ids = [], set()
        for t in tags or []:
            tid, name = str(t.get("id", ""))[:40], str(t.get("name", "")).strip()[:40]
            if tid and name and tid not in ids:
                ids.add(tid)
                clean_tags.append({"id": tid, "name": name})
        clean_map = {}
        for k, v in (tag_map or {}).items():
            kept = [x for x in v if x in ids]
            if kept:
                clean_map[str(k)] = kept
        settings.put("tags", clean_tags)
        settings.put("tag_map", clean_map)

    # --- right-click menu
    def _menu_status(self, error=None):
        options = settings.get("menu")
        return {"options": options, "installed": menu.installed(), "error": error}

    def _write_menu(self):
        options = settings.get("menu")
        error = None
        if options.get("enabled", True):
            spec = menu.build_spec(settings.get("menu_items"), settings.get("saved_icons"), options)
            error = menu.write(spec)
        else:
            menu.remove()
        return self._menu_status(error)

    def set_menu(self, options):
        current = settings.get("menu")
        for key in ("enabled", "folders", "shortcuts", "background"):
            if key in options:
                current[key] = bool(options[key])
        settings.put("menu", current)
        return self._write_menu()

    # --- folders
    def list_folders(self, path):
        """What the Apply tree shows inside a folder: its sub-folders, then its shortcuts."""
        out = []
        for p in folders.child_folders(path):
            out.append({"kind": "folder", "name": os.path.basename(p), "path": p,
                        "hasChildren": folders.has_children(p),
                        "custom": bool(folders.folder_icon(p))})
        changed = settings.get("shortcut_backup")
        for p in folders.child_shortcuts(path):
            out.append({"kind": "shortcut", "name": Path(p).stem, "path": p, "hasChildren": False,
                        "custom": p in changed})
        return out

    def _choose_folder(self, start):
        import webview
        kind = webview.FileDialog.FOLDER if hasattr(webview, "FileDialog") else webview.FOLDER_DIALOG
        result = self._window.create_file_dialog(kind, directory=str(start or ""))
        if not result:
            return None
        return str(result[0] if isinstance(result, (list, tuple)) else result)

    def choose_folder(self, start=None):
        return self._choose_folder(start or self._start_folder())

    def apply(self, icon_id, targets, include_sub=False):
        ico = self._icon_path(icon_id)
        backup = settings.get("shortcut_backup")
        done, failed = folders.apply_icon(ico, [str(t) for t in targets], bool(include_sub), backup)
        settings.put("shortcut_backup", backup)
        return {"done": done, "failed": [{"path": p, "error": e} for p, e in failed]}

    def reset(self, targets, include_sub=False):
        backup = settings.get("shortcut_backup")
        done, failed = folders.reset_icons([str(t) for t in targets], bool(include_sub), backup)
        settings.put("shortcut_backup", backup)
        return {"done": done, "failed": [{"path": p, "error": e} for p, e in failed]}

    # --- app
    def set_pref(self, key, value):
        if key == "theme" and value in ("system", "light", "dark"):
            settings.put("theme", value)
        elif key == "welcomed":
            settings.put("welcomed", bool(value))
        elif key == "start_folder" and isinstance(value, str) and Path(value).is_dir():
            settings.put("start_folder", value)

    def open_store(self):
        settings.ICON_STORE.mkdir(parents=True, exist_ok=True)
        if os.name == "nt":
            os.startfile(str(settings.ICON_STORE))

    def remove_everything(self):
        menu.remove()
        settings.clear()

    def close(self):
        if self._window:
            self._window.destroy()


# ------------------------------------------------------------------ right-click commands (no window)

def run_command(argv):
    """--apply ICON TARGET / --reset TARGET. Returns the exit code."""
    try:
        if argv[0] == "--apply":
            icon, target = argv[1], argv[2]
            if not Path(icon).is_file():
                raise FileNotFoundError("The icon file is missing. Open NiSH Icons and add the favourite again.")
            backup = settings.get("shortcut_backup")
            done, failed = folders.apply_icon(icon, [target], False, backup)
            settings.put("shortcut_backup", backup)
        else:
            target = argv[1]
            backup = settings.get("shortcut_backup")
            done, failed = folders.reset_icons([target], False, backup)
            settings.put("shortcut_backup", backup)
        if failed:
            message_box(f"Could not change {failed[0][0]}:\n\n{failed[0][1]}", error=True)
            return 1
        return 0
    except IndexError:
        message_box("Missing folder or icon.", error=True)
        return 2
    except Exception as e:
        message_box(f"Something went wrong:\n\n{e}", error=True)
        return 1


# ------------------------------------------------------------------ smoke test (used by the build)

def _test_icon(path, rgb, size=32):
    """A small but real .ico: one PNG picture and one old-style bitmap picture."""
    r, g, b = rgb
    rgba = bytes((r, g, b, 255)) * (size * size)
    png = library.png_encode(size, size, rgba)
    s = 16
    header = struct.pack("<IiiHHIIiiII", 40, s, s * 2, 1, 32, 0, 0, 0, 0, 0, 0)
    dib = header + bytes((b, g, r, 255)) * (s * s) + b"\x00" * (4 * s)
    entries = [(size, png), (s, dib)]
    out = struct.pack("<HHH", 0, 1, len(entries))
    offset = 6 + 16 * len(entries)
    blobs = b""
    for sz, data in entries:
        out += struct.pack("<BBBBHHII", sz, sz, 0, 0, 1, 32, len(data), offset)
        blobs += data
        offset += len(data)
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_bytes(out + blobs)


def _test_shortcut(path, target):
    """A small, valid Windows shortcut (relative path only), for the smoke test."""
    header = bytearray(76)
    struct.pack_into("<I", header, 0, 0x4C)
    header[4:20] = folders.LNK_CLSID
    struct.pack_into("<I", header, 20, 0x08 | 0x80)          # HasRelativePath, IsUnicode
    rel = str(target)
    body = struct.pack("<H", len(rel)) + rel.encode("utf-16-le")
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_bytes(bytes(header) + body + b"\x00\x00\x00\x00")


def prepare_smoketest(outdir):
    settings.FILE = outdir / "settings.json"
    settings.ICON_STORE = outdir / "icon-store"
    lib = outdir / "library"
    _test_icon(lib / "folder-blue-smoke.ico", (82, 148, 226))
    _test_icon(lib / "folder-red-smoke.ico", (226, 82, 82))
    _test_icon(lib / "folder-green-one.ico", (135, 177, 88))
    _test_icon(lib / "more" / "folder-teal-two.ico", (22, 160, 133))
    _test_icon(lib / "plain.ico", (120, 120, 120))
    (lib / "broken.ico").write_bytes(b"not an icon")
    targets = outdir / "targets"
    for name in ("A", "B", "C/inner"):
        (targets / name).mkdir(parents=True, exist_ok=True)
    _test_shortcut(targets / "Smoke shortcut.lnk", ".\\A")
    other = outdir / "second library"
    _test_icon(other / "folder-yellow-other.ico", (249, 189, 48))
    settings.put("libraries", [{"id": "Lsmoke", "name": "Smoke library", "path": str(lib)}])
    settings.put("start_folder", str(targets))
    settings.put("welcomed", True)
    return targets


def smoketest(window, outdir, targets):
    lines, ok = [], True

    def check(name, good):
        nonlocal ok
        lines.append(("ok   " if good else "FAIL ") + name)
        ok = ok and bool(good)

    try:
        for _ in range(300):
            if window.evaluate_js("!!(window.NI && NI.ready)"):
                break
            time.sleep(0.1)
        else:
            raise RuntimeError("the page never became ready")
        lines.append("ok   page loaded")
        window.evaluate_js("NI.selfTest()")
        result = None
        for _ in range(900):
            result = window.evaluate_js("window.NI_TEST || null")
            if result:
                break
            time.sleep(0.1)
        if not result:
            raise RuntimeError("the page self-test did not finish")
        for s in result.get("steps", []):
            check("page: " + s["name"], s["ok"])

        store = settings.ICON_STORE
        ini_a = folders.folder_icon(targets / "A")
        check("folder A has a desktop.ini pointing at the icon copy", ini_a and Path(ini_a.rsplit(",", 1)[0]).parent == store)
        check("folder C and C\\inner both changed", folders.folder_icon(targets / "C") and folders.folder_icon(targets / "C" / "inner"))
        check("folder B was reset (no desktop.ini left)", not (targets / "B" / "desktop.ini").exists())
        lnk_icon = folders.shortcut_icon(targets / "Smoke shortcut.lnk")
        check("shortcut picked in the tree got the icon copy", bool(lnk_icon) and Path(lnk_icon[0]).parent == store)
        if os.name == "nt":
            attrs = folders._get_attrs(targets / "A" / "desktop.ini")
            check("desktop.ini is hidden + system", attrs & 0x2 and attrs & 0x4)
            fattrs = folders._get_attrs(targets / "A")
            check("folder A is marked as a system/read-only folder", fattrs & 0x1 or fattrs & 0x4)
            check("menu entry on folders", menu.read_value("Directory\\shell\\NiSHIcons", "MUIVerb") == "NiSH Icons")
            sub = menu.read_value("Directory\\shell\\NiSHIcons", "ExtendedSubCommandsKey")
            check("menu folder 'Smoke folder' in the menu", menu.read_value(f"{sub}\\shell\\01", "MUIVerb") == "Smoke folder")
            cmd = menu.read_value(f"{sub}.g01\\shell\\01\\command")
            check("menu icon runs --apply", bool(cmd) and "--apply" in cmd and '"%1"' in cmd)
            check("menu entry on shortcuts", menu.read_value("lnkfile\\shell\\NiSHIcons", "MUIVerb") == "NiSH Icons")
            check("Windows still treats shortcuts as shortcuts (IsShortcut visible)", menu.shortcut_class_intact())
            menu.remove()
            check("menu removed again", not menu.installed())
        data = settings._load()
        check("tags saved", any(t["name"] == "Smoke tag" for t in data.get("tags", [])))
        saved = data.get("saved_icons", {})
        check("favourites and menu icons saved with copies", all(Path(v["ico"]).is_file() for v in saved.values())
              and len(saved) == 3)
        check("second library saved", [l["name"] for l in data.get("libraries", [])] == ["Smoke library", "second library"])
        check("menu order saved (folder first)", [e["kind"] for e in data.get("menu_items", [])][:1] == ["group"])
    except Exception as e:
        check(f"{e!r}", False)
    lines.append("GUI SMOKETEST PASSED" if ok else "GUI SMOKETEST FAILED")
    Path(outdir).mkdir(parents=True, exist_ok=True)
    (Path(outdir) / "gui_smoketest.txt").write_text("\n".join(lines), encoding="utf-8")
    window.destroy()
    os._exit(0 if ok else 1)


# ------------------------------------------------------------------ window

class WindowSize:
    def __init__(self):
        self.size = None
        self.maximized = False

    def resized(self, *args):
        width, height = args[-2], args[-1]
        if not self.maximized and width >= 900 and height >= 600:
            self.size = [int(width), int(height)]

    def closing(self, *args):
        if self.size:
            settings.put("window", self.size)


def open_window(pick=None, smoke=None):
    import webview

    targets = prepare_smoketest(smoke) if smoke else None
    api = Api(pick=pick, test_library=str(smoke / "second library") if smoke else None)
    if not smoke and settings.get("menu").get("enabled", True) and settings.get("welcomed"):
        api._write_menu()     # keeps the menu pointing at this copy of the .exe, wherever it is now
    w, h = settings.get("window") or [1280, 820]
    dark = settings.get("theme") == "dark"
    window = webview.create_window(
        settings.APP_NAME if not pick else f"{settings.APP_NAME} - choose an icon",
        url=str(resource("web", "index.html")), js_api=api,
        width=max(900, int(w)), height=max(600, int(h)), min_size=(900, 600),
        background_color="#202020" if dark else "#F3F3F3")
    api._window = window
    size = WindowSize()
    window.events.resized += size.resized
    window.events.maximized += lambda *a: setattr(size, "maximized", True)
    window.events.restored += lambda *a: setattr(size, "maximized", False)
    if not smoke:
        window.events.closing += size.closing
    func, args = (smoketest, (window, smoke, targets)) if smoke else (None, ())
    try:
        storage = settings.data_dir() / "webview"
        webview.start(func, args, gui="edgechromium" if os.name == "nt" else None,
                      private_mode=True, storage_path=str(storage))
    except Exception as e:
        message_box(
            "NiSH Icons needs Microsoft Edge WebView2, which is part of Windows 10 and 11.\n\n"
            "If it is missing, install the \"Evergreen Bootstrapper\" from\n"
            "https://developer.microsoft.com/microsoft-edge/webview2/\n"
            "(it installs for your user only, no admin rights needed).\n\n"
            f"Details: {e}", error=True)
        sys.exit(1)


def main(argv=None):
    argv = list(sys.argv[1:] if argv is None else argv)
    if argv and argv[0] in ("--apply", "--reset"):
        sys.exit(run_command(argv))
    if argv and argv[0] == "--pick":
        open_window(pick=argv[1] if len(argv) > 1 else None)
        return
    if argv and argv[0] == "--smoketest":
        out = Path(argv[1] if len(argv) > 1 else "smoketest-out").resolve()
        out.mkdir(parents=True, exist_ok=True)
        open_window(smoke=out)
        return
    open_window()


if __name__ == "__main__":
    main()
