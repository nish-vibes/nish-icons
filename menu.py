"""The "NiSH Icons" entry in Explorer's right-click menu.

Everything is written under HKEY_CURRENT_USER\\Software\\Classes, which every user may change
without admin rights. The menu is a cascade:  NiSH Icons > (your menu folders >) your favourites,
Reset to default icon, More icons...  Each favourite runs  NiSHIcons.exe --apply <icon> <folder>.

On Windows 11 these classic entries appear under "Show more options" (or Shift + right-click).
"""
import os
import sys
from pathlib import Path

ROOT = "Software\\Classes"
SUB_PREFIX = "NiSHIcons.Menu"
VERB = "NiSHIcons"
TOP_MAX = 12      # menu folders + loose favourites at the top of the menu
GROUP_MAX = 16    # favourites inside one menu folder

CONTEXTS = {
    # option name: (where the entry goes, what Windows passes for the clicked item)
    "folders": ("Directory\\shell\\" + VERB, "%1"),
    "background": ("Directory\\Background\\shell\\" + VERB, "%V"),
    "shortcuts": ("lnkfile\\shell\\" + VERB, "%1"),
}

SEPARATOR_BEFORE = 0x20


def launcher():
    """How Explorer should start us: the .exe itself, or python + app.py while developing."""
    if getattr(sys, "frozen", False):
        return f'"{sys.executable}"'
    py = Path(sys.executable)
    pyw = py.with_name("pythonw.exe")
    exe = pyw if pyw.exists() else py
    return f'"{exe}" "{Path(__file__).resolve().parent / "app.py"}"'


def app_icon():
    if getattr(sys, "frozen", False):
        return f"{sys.executable},0"
    return str(Path(__file__).resolve().parent / "assets" / "icon.ico")


def folder_glyph():
    return os.path.join(os.environ.get("SystemRoot", "C:\\Windows"), "System32", "shell32.dll") + ",3"


def build_spec(favourites, fav_items, options, start=None, icon=None):
    """{key path under Software\\Classes: {value name: value}}. "" is a key's default value;
    ints become DWORDs. Pure data, so it can be tested anywhere."""
    start = start or launcher()
    icon = icon or app_icon()
    spec = {}
    if not options.get("enabled", True):
        return spec
    groups = [g for g in favourites.get("groups", []) if g.get("items")]
    loose = [i for i in favourites.get("root", []) if i in fav_items]
    top = []
    for g in groups:
        items = [i for i in g["items"] if i in fav_items][:GROUP_MAX]
        if items:
            top.append(("group", g, items))
    top += [("fav", i, None) for i in loose]
    top = top[:TOP_MAX]

    for ctx, (key, arg) in CONTEXTS.items():
        if not options.get(ctx, True):
            continue
        sub = f"{SUB_PREFIX}.{ctx}"
        spec[key] = {"MUIVerb": "NiSH Icons", "Icon": icon, "ExtendedSubCommandsKey": sub}

        def fav_entry(path, fav_id):
            item = fav_items[fav_id]
            spec[path] = {"MUIVerb": item["label"], "Icon": item["ico"]}
            spec[path + "\\command"] = {"": f'{start} --apply "{item["ico"]}" "{arg}"'}

        n = 0
        for kind, what, items in top:
            n += 1
            path = f"{sub}\\shell\\{n:02d}"
            if kind == "group":
                gsub = f"{sub}.g{n:02d}"
                spec[path] = {"MUIVerb": what.get("name") or "Folder", "Icon": folder_glyph(),
                              "ExtendedSubCommandsKey": gsub}
                for k, fav_id in enumerate(items, 1):
                    fav_entry(f"{gsub}\\shell\\{k:02d}", fav_id)
            else:
                fav_entry(path, what)
        n += 1
        path = f"{sub}\\shell\\{n:02d}"
        spec[path] = {"MUIVerb": "Reset to default icon", "CommandFlags": SEPARATOR_BEFORE}
        spec[path + "\\command"] = {"": f'{start} --reset "{arg}"'}
        n += 1
        path = f"{sub}\\shell\\{n:02d}"
        spec[path] = {"MUIVerb": "More icons…" if top else "Choose an icon…"}
        spec[path + "\\command"] = {"": f'{start} --pick "{arg}"'}
    return spec


# ------------------------------------------------------------------ registry (Windows only)

def _winreg():
    import winreg
    return winreg


def _delete_tree(winreg, parent, name):
    try:
        key = winreg.OpenKey(parent, name, 0, winreg.KEY_ALL_ACCESS)
    except OSError:
        return
    with key:
        while True:
            try:
                child = winreg.EnumKey(key, 0)
            except OSError:
                break
            _delete_tree(winreg, key, child)
    try:
        winreg.DeleteKey(parent, name)
    except OSError:
        pass


def remove():
    if os.name != "nt":
        return
    winreg = _winreg()
    hkcu = winreg.HKEY_CURRENT_USER
    for key, _arg in CONTEXTS.values():
        _delete_tree(winreg, hkcu, f"{ROOT}\\{key}")
    try:
        classes = winreg.OpenKey(hkcu, ROOT, 0, winreg.KEY_READ)
    except OSError:
        return
    ours, i = [], 0
    with classes:
        while True:
            try:
                name = winreg.EnumKey(classes, i)
            except OSError:
                break
            if name.startswith(SUB_PREFIX):
                ours.append(name)
            i += 1
    for name in ours:
        _delete_tree(winreg, hkcu, f"{ROOT}\\{name}")


def write(spec):
    """Replace our menu with `spec`. Returns None, or an error message."""
    if os.name != "nt":
        return "The right-click menu only exists on Windows."
    winreg = _winreg()
    try:
        remove()
        for path in sorted(spec, key=lambda p: p.count("\\")):
            with winreg.CreateKeyEx(winreg.HKEY_CURRENT_USER, f"{ROOT}\\{path}", 0, winreg.KEY_WRITE) as k:
                for name, value in spec[path].items():
                    if isinstance(value, int):
                        winreg.SetValueEx(k, name, 0, winreg.REG_DWORD, value)
                    else:
                        winreg.SetValueEx(k, name, 0, winreg.REG_SZ, str(value))
        return None
    except OSError as e:
        return f"Windows did not accept the menu: {e}"


def read_value(path, name=""):
    """For tests and the status line."""
    if os.name != "nt":
        return None
    winreg = _winreg()
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, f"{ROOT}\\{path}") as k:
            return winreg.QueryValueEx(k, name)[0]
    except OSError:
        return None


def shortcut_class_intact():
    """Our per-user lnkfile key must not hide the system's own values for shortcuts."""
    if os.name != "nt":
        return True
    winreg = _winreg()
    try:
        with winreg.OpenKey(winreg.HKEY_CLASSES_ROOT, "lnkfile") as k:
            winreg.QueryValueEx(k, "IsShortcut")
        return True
    except OSError:
        return False


def installed():
    return any(read_value(key, "MUIVerb") for key, _ in CONTEXTS.values())
