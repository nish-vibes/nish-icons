"""Settings kept in %LOCALAPPDATA%\\NiSH Icons\\settings.json, plus the folder where chosen icons are
copied to (%LOCALAPPDATA%\\NiSH Icons\\icons). Both sit outside the app, so a new version of the .exe
keeps them, and folders keep their icon even if the icon library is moved or deleted."""
import json
import os
import sys
from pathlib import Path

APP_NAME = "NiSH Icons"


def data_dir():
    base = os.environ.get("LOCALAPPDATA") or os.path.join(Path.home(), ".local", "share")
    return Path(base) / APP_NAME


FILE = data_dir() / "settings.json"
ICON_STORE = data_dir() / "icons"

DEFAULTS = {
    "libraries": [],             # saved icon libraries: [{"id", "name", "path"}]
    "start_folder": None,        # where "Apply icons" starts browsing
    "favourites": [],            # icon ids, from any library
    "menu_items": [],            # the right-click menu, in order:
                                 #   {"kind": "icon", "id"} or {"kind": "group", "id", "name", "items": [icon ids]}
    "saved_icons": {},           # icon id -> {"label", "ico", "colour", "lib"} for favourites and menu icons
                                 #   (ico = the copy in ICON_STORE, so they work even if a library moves)
    "tags": [],                  # [{"id", "name"}]
    "tag_map": {},               # icon id -> [tag ids]
    "menu": {"enabled": True, "folders": True, "shortcuts": True, "background": True},
    "theme": "system",           # system | light | dark
    "welcomed": False,
    "window": None,
    "shortcut_backup": {},       # .lnk path -> its original icon, so Reset can put it back
}


def _load():
    try:
        data = json.loads(FILE.read_text(encoding="utf-8"))
        data = data if isinstance(data, dict) else {}
    except Exception:
        return {}
    if "library" in data or isinstance(data.get("favourites"), dict) or "fav_items" in data:
        data = migrate(data)
        _save(data)
    return data


def new_id(prefix):
    import secrets
    return prefix + secrets.token_hex(4)


def migrate(data):
    """Settings from NiSH Icons 1.0 (one library, a favourites menu) -> several libraries,
    favourites and a separate, ordered right-click menu. Nothing the user made is lost."""
    data = dict(data)
    libs = list(data.get("libraries") or [])
    old_root = data.pop("library", None)
    lib_id = None
    if old_root:
        same = [l for l in libs if os.path.normcase(l.get("path", "")) == os.path.normcase(old_root)]
        if same:
            lib_id = same[0]["id"]
        else:
            lib_id = new_id("L")
            libs.append({"id": lib_id, "name": Path(old_root).name or str(old_root), "path": str(old_root)})
    data["libraries"] = libs

    def rekey(old):
        if not isinstance(old, str) or ":" in old.split("/")[0]:
            return old
        return f"{lib_id}:{old}" if lib_id else f"old:{old}"

    favs = data.get("favourites")
    if isinstance(favs, dict):
        groups = favs.get("groups") or []
        root = favs.get("root") or []
        order = []
        for g in groups:
            order.append({"kind": "group", "id": str(g.get("id") or new_id("g")), "name": g.get("name") or "Folder",
                          "items": [rekey(i) for i in g.get("items") or []]})
        order += [{"kind": "icon", "id": rekey(i)} for i in root]
        if not data.get("menu_items"):
            data["menu_items"] = order
        flat = [rekey(i) for i in root]
        for g in groups:
            flat += [rekey(i) for i in g.get("items") or []]
        data["favourites"] = flat
    items = data.pop("fav_items", None) or {}
    saved = dict(data.get("saved_icons") or {})
    lib_name = next((l["name"] for l in libs if l["id"] == lib_id), "")
    for k, v in items.items():
        saved.setdefault(rekey(k), {"label": v.get("label", k), "ico": v.get("ico", ""), "colour": "other", "lib": lib_name})
    data["saved_icons"] = saved
    data["tag_map"] = {rekey(k): v for k, v in (data.get("tag_map") or {}).items()}
    return data


def _save(data):
    FILE.parent.mkdir(parents=True, exist_ok=True)
    tmp = FILE.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, indent=1, ensure_ascii=False), encoding="utf-8")
    os.replace(tmp, FILE)


def get(key, default=None):
    if default is None and key in DEFAULTS:
        default = json.loads(json.dumps(DEFAULTS[key]))   # a fresh copy
    return _load().get(key, default)


def put(key, value):
    data = _load()
    data[key] = value
    _save(data)


def clear():
    """Forget everything (used by "Remove NiSH Icons"). The icon copies stay, because folders use them."""
    try:
        FILE.unlink()
    except OSError:
        pass


def app_dir():
    """The folder the .exe (or app.py) is in."""
    if getattr(sys, "frozen", False):
        return Path(sys.executable).resolve().parent
    return Path(__file__).resolve().parent


def known_folder(guid_parts, fallback):
    """A Windows known folder (Documents, Downloads ...), also when Windows has moved it into OneDrive."""
    if os.name == "nt":
        try:
            import ctypes
            from ctypes import wintypes

            class GUID(ctypes.Structure):
                _fields_ = [("a", wintypes.DWORD), ("b", wintypes.WORD), ("c", wintypes.WORD),
                            ("d", ctypes.c_ubyte * 8)]
            a, b, c, d = guid_parts
            fid = GUID(a, b, c, (ctypes.c_ubyte * 8)(*d))
            out = ctypes.c_wchar_p()
            if ctypes.windll.shell32.SHGetKnownFolderPath(ctypes.byref(fid), 0, None, ctypes.byref(out)) == 0:
                path = out.value
                ctypes.windll.ole32.CoTaskMemFree(out)
                if path and Path(path).is_dir():
                    return Path(path)
        except Exception:
            pass
    return Path.home() / fallback


def documents():
    return known_folder((0xFDD39AD0, 0x238F, 0x46AF, (0xAD, 0xB4, 0x6C, 0x85, 0x48, 0x03, 0x69, 0xC7)), "Documents")


def start_menu_programs():
    """Your own Start menu shortcuts (%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs)."""
    base = os.environ.get("APPDATA") or str(Path.home() / "AppData" / "Roaming")
    return Path(base) / "Microsoft" / "Windows" / "Start Menu" / "Programs"


def places():
    """Quick places for the folder browser."""
    found = [("Home", Path.home()),
             ("Desktop", known_folder((0xB4BFCC3A, 0xDB2C, 0x424C, (0xB0, 0x29, 0x7F, 0xE9, 0x9A, 0x87, 0xC6, 0x41)), "Desktop")),
             ("Documents", documents()),
             ("Downloads", known_folder((0x374DE290, 0x123F, 0x4565, (0x91, 0x64, 0x39, 0xC4, 0x92, 0x5E, 0x46, 0x7B)), "Downloads")),
             ("Pictures", known_folder((0x33E28130, 0x4E1E, 0x4676, (0x83, 0x5A, 0x98, 0x39, 0x5C, 0x3B, 0xC3, 0xBB)), "Pictures")),
             ("Music", known_folder((0x4BD8D571, 0x6D19, 0x48D3, (0xBE, 0x97, 0x42, 0x22, 0x20, 0x08, 0x0E, 0x43)), "Music")),
             ("Start menu", start_menu_programs())]
    out, seen = [], set()
    for name, path in found:
        key = str(path).lower()
        if path.is_dir() and key not in seen:
            seen.add(key)
            out.append({"name": name, "path": str(path)})
    return out
