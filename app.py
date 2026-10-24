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

    def __init__(self, pick=None):
        self._window = None
        self._pick = pick
        self._lib = None

    # --- startup
    def init(self):
        lib = None
        root = settings.get("library")
        if root and Path(root).is_dir():
            lib = self._scan(root)
        favs = settings.get("favourites")
        items = settings.get("fav_items")
        return {
            "version": VERSION,
            "theme": settings.get("theme"),
            "welcomed": bool(settings.get("welcomed")),
            "library": lib,
            "favourites": favs,
            "favItems": self._fav_items_for_page(items),
            "tags": settings.get("tags"),
            "tagMap": settings.get("tag_map"),
            "menu": self._menu_status(),
            "startFolder": self._start_folder(),
            "places": settings.places(),
            "pick": self._pick_info(),
            "store": str(settings.ICON_STORE),
            "limits": {"top": menu.TOP_MAX, "group": menu.GROUP_MAX},
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

    # --- library
    def _scan(self, root):
        self._lib = library.scan(root)
        return self._lib

    def set_library(self, path):
        path = Path(path)
        if not path.is_dir():
            raise ValueError("That folder does not exist.")
        lib = self._scan(path)
        settings.put("library", str(path))
        return lib

    def choose_library(self):
        start = settings.get("library") or str(settings.documents())
        path = self._choose_folder(start)
        return self.set_library(path) if path else None

    def rescan(self):
        root = settings.get("library")
        return self.set_library(root) if root else None

    def preview(self, icon_id):
        path = self._icon_path(icon_id, copy=False)
        return library.preview_url(path, 128) if path else None

    def _icon_path(self, icon_id, copy=True):
        """The file for a library icon or a favourite. With copy=True the result is the copy in the
        app's own icon folder, which is what folders should point at."""
        items = settings.get("fav_items")
        if icon_id in items and Path(items[icon_id]["ico"]).is_file():
            return Path(items[icon_id]["ico"])
        root = settings.get("library")
        if not root:
            raise ValueError("Choose an icon library first.")
        src = library.resolve(root, icon_id)
        if not copy:
            return src
        return folders.copy_icon_to_store(src, settings.ICON_STORE, src.name)

    # --- favourites, menu folders, tags
    def _fav_items_for_page(self, items):
        return {k: {"label": v["label"], "file": Path(v["ico"]).name, "thumb": library.preview_url(v["ico"], 64)}
                for k, v in items.items()}

    def save_favourites(self, favs):
        items = settings.get("fav_items")
        seen = set()

        def take(icon_id):
            if not isinstance(icon_id, str) or icon_id in seen:
                return False
            if icon_id not in items or not Path(items[icon_id]["ico"]).is_file():
                src = library.resolve(settings.get("library"), icon_id)
                stored = folders.copy_icon_to_store(src, settings.ICON_STORE, src.name)
                items[icon_id] = {"label": library.pretty_name(src.stem), "ico": str(stored)}
            seen.add(icon_id)
            return True

        groups = []
        for g in (favs.get("groups") or [])[:menu.TOP_MAX]:
            wanted = [i for i in (g.get("items") or []) if isinstance(i, str)]
            kept = []
            for i in wanted:
                if len(kept) < menu.GROUP_MAX and take(i):
                    kept.append(i)
            name = str(g.get("name") or "Folder").strip()[:60] or "Folder"
            groups.append({"id": str(g.get("id") or f"g{len(groups)}")[:40], "name": name, "items": kept})
        root = []
        for i in favs.get("root") or []:
            if len(groups) + len(root) < menu.TOP_MAX and take(i):
                root.append(i)
        items = {k: v for k, v in items.items() if k in seen}
        clean = {"root": root, "groups": groups}
        settings.put("favourites", clean)
        settings.put("fav_items", items)
        status = self._write_menu()
        return {"favourites": clean, "favItems": self._fav_items_for_page(items), "menu": status}

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
            spec = menu.build_spec(settings.get("favourites"), settings.get("fav_items"), options)
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
        out = []
        for p in folders.child_folders(path):
            out.append({"name": os.path.basename(p), "path": p,
                        "hasChildren": folders.has_child_folders(p),
                        "custom": bool(folders.folder_icon(p))})
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
    settings.put("library", str(lib))
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
        if os.name == "nt":
            attrs = folders._get_attrs(targets / "A" / "desktop.ini")
            check("desktop.ini is hidden + system", attrs & 0x2 and attrs & 0x4)
            fattrs = folders._get_attrs(targets / "A")
            check("folder A is marked as a system/read-only folder", fattrs & 0x1 or fattrs & 0x4)
            check("menu entry on folders", menu.read_value("Directory\\shell\\NiSHIcons", "MUIVerb") == "NiSH Icons")
            sub = menu.read_value("Directory\\shell\\NiSHIcons", "ExtendedSubCommandsKey")
            check("menu folder 'Smoke folder' in the menu", menu.read_value(f"{sub}\\shell\\01", "MUIVerb") == "Smoke folder")
            cmd = menu.read_value(f"{sub}.g01\\shell\\01\\command")
            check("menu favourite runs --apply", bool(cmd) and "--apply" in cmd and '"%1"' in cmd)
            check("menu entry on shortcuts", menu.read_value("lnkfile\\shell\\NiSHIcons", "MUIVerb") == "NiSH Icons")
            check("Windows still treats shortcuts as shortcuts (IsShortcut visible)", menu.shortcut_class_intact())
            menu.remove()
            check("menu removed again", not menu.installed())
        data = settings._load()
        check("tags saved", any(t["name"] == "Smoke tag" for t in data.get("tags", [])))
        check("favourites saved with copies", all(Path(v["ico"]).is_file() for v in data.get("fav_items", {}).values())
              and len(data.get("fav_items", {})) == 2)
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
    api = Api(pick=pick)
    if not smoke and settings.get("menu").get("enabled", True) and settings.get("library"):
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
