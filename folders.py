"""Giving folders and shortcuts their own icon - all within the user's own rights, no admin needed.

Folders: Windows reads a hidden desktop.ini inside the folder (the same file that
Properties > Customize > Change Icon writes), as long as the folder is marked as a "system folder".

Shortcuts (.lnk): the icon is stored inside the shortcut file itself. We edit that file directly,
following Microsoft's published .lnk format, so nothing else has to be installed.
"""
import os
import struct
import threading
from pathlib import Path

INI = "desktop.ini"
SECTION = "[.ShellClassInfo]"
ICON_KEYS = ("iconresource", "iconfile", "iconindex")

FILE_ATTRIBUTE_READONLY = 0x1
FILE_ATTRIBUTE_HIDDEN = 0x2
FILE_ATTRIBUTE_SYSTEM = 0x4
FILE_ATTRIBUTE_NORMAL = 0x80

if os.name == "nt":
    import ctypes
    _k32 = ctypes.windll.kernel32
    _shell32 = ctypes.windll.shell32
    _shlwapi = ctypes.windll.shlwapi
    _k32.GetFileAttributesW.restype = ctypes.c_uint32


def _get_attrs(path):
    if os.name != "nt":
        return 0
    a = _k32.GetFileAttributesW(str(path))
    return 0 if a == 0xFFFFFFFF else a


def _set_attrs(path, attrs):
    if os.name == "nt":
        if not _k32.SetFileAttributesW(str(path), attrs or FILE_ATTRIBUTE_NORMAL):
            raise ctypes.WinError()


def _make_system_folder(folder):
    if os.name == "nt":
        if not _shlwapi.PathMakeSystemFolderW(str(folder)):
            # fall back to the System attribute, which Explorer accepts too
            _set_attrs(folder, (_get_attrs(folder) | FILE_ATTRIBUTE_SYSTEM) & ~FILE_ATTRIBUTE_NORMAL)


def _unmake_system_folder(folder):
    if os.name == "nt":
        _shlwapi.PathUnmakeSystemFolderW(str(folder))


# ------------------------------------------------------------------ desktop.ini

def read_ini_lines(ini):
    data = Path(ini).read_bytes()
    if data[:2] in (b"\xff\xfe", b"\xfe\xff"):
        text = data.decode("utf-16")
    elif data[:3] == b"\xef\xbb\xbf":
        text = data[3:].decode("utf-8", "replace")
    else:
        try:
            text = data.decode("mbcs" if os.name == "nt" else "utf-8")
        except (UnicodeDecodeError, LookupError):
            text = data.decode("latin-1")
    return text.splitlines()


def _is_icon_line(line):
    key = line.split("=", 1)[0].strip().lower() if "=" in line else ""
    return key in ICON_KEYS


def _write_ini(ini, lines):
    ini = Path(ini)
    if ini.exists():
        _set_attrs(ini, FILE_ATTRIBUTE_NORMAL)
    text = "\r\n".join(lines).rstrip("\r\n") + "\r\n"
    ini.write_bytes(b"\xff\xfe" + text.encode("utf-16-le"))
    _set_attrs(ini, FILE_ATTRIBUTE_HIDDEN | FILE_ATTRIBUTE_SYSTEM)


def ini_with_icon(lines, icon):
    """desktop.ini lines with our IconResource in [.ShellClassInfo]; every other line is kept."""
    out, placed, in_section = [], False, False
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("["):
            if in_section and not placed:
                out.append(f"IconResource={icon},0")
                placed = True
            in_section = stripped.lower() == SECTION.lower()
            out.append(line)
            continue
        if in_section and _is_icon_line(line):
            if not placed:
                out.append(f"IconResource={icon},0")
                placed = True
            continue
        out.append(line)
    if in_section and not placed:
        out.append(f"IconResource={icon},0")
        placed = True
    if not placed:
        out = [SECTION, f"IconResource={icon},0"] + ([""] if out else []) + out
    return out


def ini_without_icon(lines):
    """desktop.ini lines with the icon removed. Returns [] when nothing worth keeping is left."""
    out, in_section = [], False
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("["):
            in_section = stripped.lower() == SECTION.lower()
        elif in_section and _is_icon_line(line):
            continue
        out.append(line)
    meaningful = [l for l in out if l.strip() and not l.strip().startswith("[") and not l.strip().startswith(";")]
    return out if meaningful else []


def folder_icon(folder):
    """The icon a folder currently has from its desktop.ini, or None."""
    ini = Path(folder) / INI
    try:
        lines = read_ini_lines(ini)
    except OSError:
        return None
    in_section = False
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("["):
            in_section = stripped.lower() == SECTION.lower()
        elif in_section and "=" in line and line.split("=", 1)[0].strip().lower() == "iconresource":
            return line.split("=", 1)[1].strip()
    return None


def set_folder_icon(folder, icon):
    folder = Path(folder)
    if not folder.is_dir():
        raise FileNotFoundError(f"{folder} is not a folder")
    ini = folder / INI
    lines = read_ini_lines(ini) if ini.exists() else []
    _write_ini(ini, ini_with_icon(lines, str(icon)))
    _make_system_folder(folder)


def reset_folder_icon(folder):
    folder = Path(folder)
    ini = folder / INI
    if not ini.exists():
        return
    kept = ini_without_icon(read_ini_lines(ini))
    if kept:
        _write_ini(ini, kept)
    else:
        _set_attrs(ini, FILE_ATTRIBUTE_NORMAL)
        ini.unlink()
        _unmake_system_folder(folder)


# ------------------------------------------------------------------ shortcuts (.lnk)

LNK_CLSID = bytes.fromhex("0114020000000000c000000000000046")
HAS_ID_LIST, HAS_LINK_INFO, HAS_ICON_LOCATION, IS_UNICODE, HAS_EXP_ICON = 0x1, 0x2, 0x40, 0x80, 0x4000
STRING_FLAGS = (0x4, 0x8, 0x10, 0x20, 0x40)   # name, relative path, working dir, arguments, icon location
ICON_ENV_BLOCK = 0xA0000007


class ShortcutError(ValueError):
    pass


def _ansi():
    return "mbcs" if os.name == "nt" else "cp1252"


def parse_lnk(data):
    if len(data) < 76 or struct.unpack_from("<I", data, 0)[0] != 0x4C or data[4:20] != LNK_CLSID:
        raise ShortcutError("not a Windows shortcut")
    flags = struct.unpack_from("<I", data, 20)[0]
    pos = 76
    if flags & HAS_ID_LIST:
        pos += 2 + struct.unpack_from("<H", data, pos)[0]
    if flags & HAS_LINK_INFO:
        pos += struct.unpack_from("<I", data, pos)[0]
    middle_end = pos
    strings = []
    for bit in STRING_FLAGS:
        if flags & bit:
            n = struct.unpack_from("<H", data, pos)[0]
            pos += 2
            if flags & IS_UNICODE:
                strings.append(data[pos:pos + 2 * n].decode("utf-16-le", "replace"))
                pos += 2 * n
            else:
                strings.append(data[pos:pos + n].decode(_ansi(), "replace"))
                pos += n
        else:
            strings.append(None)
    if pos > len(data):
        raise ShortcutError("the shortcut file is damaged")
    blocks = []
    while pos + 4 <= len(data):
        size = struct.unpack_from("<I", data, pos)[0]
        if size < 4:
            break
        blocks.append(data[pos:pos + size])
        pos += size
    return {"header": bytearray(data[:76]), "middle": data[76:middle_end], "strings": strings, "blocks": blocks}


def build_lnk(parts):
    header = bytearray(parts["header"])
    flags = struct.unpack_from("<I", header, 20)[0] | IS_UNICODE
    out = bytearray()
    for bit, text in zip(STRING_FLAGS, parts["strings"]):
        if text is None:
            flags &= ~bit
        else:
            flags |= bit
            out += struct.pack("<H", len(text.encode("utf-16-le")) // 2) + text.encode("utf-16-le")
    has_env = any(len(b) >= 8 and struct.unpack_from("<I", b, 4)[0] == ICON_ENV_BLOCK for b in parts["blocks"])
    flags = (flags | HAS_EXP_ICON) if has_env else (flags & ~HAS_EXP_ICON)
    struct.pack_into("<I", header, 20, flags)
    return bytes(header) + parts["middle"] + bytes(out) + b"".join(parts["blocks"]) + b"\x00\x00\x00\x00"


def shortcut_icon(lnk):
    """(icon location, index) of a shortcut, or None if it uses its target's icon."""
    parts = parse_lnk(Path(lnk).read_bytes())
    loc = parts["strings"][4]
    if not loc:
        return None
    return loc, struct.unpack_from("<i", parts["header"], 56)[0]


def _write_lnk(lnk, parts):
    lnk = Path(lnk)
    tmp = lnk.with_name(lnk.name + ".nishtmp")
    tmp.write_bytes(build_lnk(parts))
    attrs = _get_attrs(lnk)
    if attrs & FILE_ATTRIBUTE_READONLY:
        _set_attrs(lnk, attrs & ~FILE_ATTRIBUTE_READONLY)
    os.replace(tmp, lnk)
    if attrs & FILE_ATTRIBUTE_READONLY:
        _set_attrs(lnk, attrs)


def set_shortcut_icon(lnk, icon, index=0):
    parts = parse_lnk(Path(lnk).read_bytes())
    parts["strings"][4] = str(icon)
    struct.pack_into("<i", parts["header"], 56, index)
    parts["blocks"] = [b for b in parts["blocks"]
                       if not (len(b) >= 8 and struct.unpack_from("<I", b, 4)[0] == ICON_ENV_BLOCK)]
    _write_lnk(lnk, parts)


def reset_shortcut_icon(lnk, original=None):
    """Back to the target's own icon, or to `original` = (location, index) if it had its own before."""
    if original and original[0]:
        set_shortcut_icon(lnk, original[0], int(original[1]))
        return
    parts = parse_lnk(Path(lnk).read_bytes())
    parts["strings"][4] = None
    struct.pack_into("<i", parts["header"], 56, 0)
    parts["blocks"] = [b for b in parts["blocks"]
                       if not (len(b) >= 8 and struct.unpack_from("<I", b, 4)[0] == ICON_ENV_BLOCK)]
    _write_lnk(lnk, parts)


# ------------------------------------------------------------------ walking and refreshing

def is_link(entry_or_path):
    p = entry_or_path.path if hasattr(entry_or_path, "path") else str(entry_or_path)
    if os.path.islink(p):
        return True
    return bool(getattr(os.path, "isjunction", None) and os.path.isjunction(p))


def _hidden(entry):
    if entry.name.startswith(".") and os.name != "nt":
        return True
    try:
        return bool(getattr(entry.stat(follow_symlinks=False), "st_file_attributes", 0) & FILE_ATTRIBUTE_HIDDEN)
    except OSError:
        return True


def child_folders(path):
    """Visible sub-folders, sorted by name. Links and junctions are skipped (OneDrive folders are kept)."""
    out = []
    try:
        with os.scandir(path) as it:
            for e in it:
                try:
                    if e.is_dir(follow_symlinks=False) and not is_link(e) and not _hidden(e):
                        out.append(e.path)
                except OSError:
                    continue
    except OSError:
        return []
    return sorted(out, key=lambda p: os.path.basename(p).lower())


def has_child_folders(path):
    try:
        with os.scandir(path) as it:
            for e in it:
                try:
                    if e.is_dir(follow_symlinks=False) and not is_link(e) and not _hidden(e):
                        return True
                except OSError:
                    continue
    except OSError:
        pass
    return False


def all_subfolders(path, limit=20000):
    out, stack = [], [str(path)]
    while stack and len(out) < limit:
        current = stack.pop()
        kids = child_folders(current)
        out.extend(kids)
        stack.extend(reversed(kids))
    return out[:limit]


def expand_targets(paths, include_sub):
    seen, out = set(), []
    for p in paths:
        group = [str(p)] + (all_subfolders(p) if include_sub and os.path.isdir(p) else [])
        for q in group:
            key = os.path.normcase(os.path.abspath(q))
            if key not in seen:
                seen.add(key)
                out.append(q)
    return out


def _notify_shell(paths):
    notify = _shell32.SHChangeNotify
    notify.argtypes = [ctypes.c_long, ctypes.c_uint, ctypes.c_void_p, ctypes.c_void_p]
    flush = 0x3000                                                                 # SHCNF_FLUSHNOWAIT: never block on busy windows
    for p in paths[:500]:
        buf = ctypes.create_unicode_buffer(str(p))
        notify(0x00002000, 0x0005 | flush, ctypes.cast(buf, ctypes.c_void_p), None)   # SHCNE_UPDATEITEM, SHCNF_PATHW
    notify(0x08000000, flush, None, None)                                          # SHCNE_ASSOCCHANGED


def refresh_explorer(paths):
    """Tell Explorer to redraw. Runs in a side thread and is given at most 5 seconds,
    so a busy or missing desktop (for example a build server) can never freeze the app."""
    if os.name != "nt":
        return

    def work():
        try:
            _notify_shell(list(paths))
        except Exception:
            pass

    t = threading.Thread(target=work, daemon=True)
    t.start()
    t.join(5)


# ------------------------------------------------------------------ one entry point for both kinds

def is_shortcut(path):
    return str(path).lower().endswith(".lnk") and os.path.isfile(path)


def apply_icon(icon, targets, include_sub=False, backup=None):
    """Give every target the icon. Returns (number changed, [(path, error), ...]).
    `backup` is a dict that remembers shortcuts' original icons."""
    done, failed = 0, []
    expanded = expand_targets([t for t in targets if not is_shortcut(t)], include_sub)
    expanded += [t for t in targets if is_shortcut(t)]
    for t in expanded:
        try:
            if is_shortcut(t):
                if backup is not None and t not in backup:
                    backup[t] = shortcut_icon(t)
                set_shortcut_icon(t, icon)
            else:
                set_folder_icon(t, icon)
            done += 1
        except Exception as e:
            failed.append((str(t), _explain(e)))
    refresh_explorer(expanded)
    return done, failed


def reset_icons(targets, include_sub=False, backup=None):
    done, failed = 0, []
    expanded = expand_targets([t for t in targets if not is_shortcut(t)], include_sub)
    expanded += [t for t in targets if is_shortcut(t)]
    for t in expanded:
        try:
            if is_shortcut(t):
                original = backup.pop(t, None) if backup is not None else None
                reset_shortcut_icon(t, original)
            else:
                reset_folder_icon(t)
            done += 1
        except Exception as e:
            failed.append((str(t), _explain(e)))
    refresh_explorer(expanded)
    return done, failed


def _explain(e):
    if isinstance(e, PermissionError):
        return "No permission to change this one"
    if isinstance(e, FileNotFoundError):
        return "It no longer exists"
    return str(e) or e.__class__.__name__


def copy_icon_to_store(src, store, name_hint):
    """Copy an icon into the app's own icon folder (if it isn't there already) and return the copy.
    Folders point at the copy, so they keep their icon if the library is moved or deleted."""
    store = Path(store)
    store.mkdir(parents=True, exist_ok=True)
    src = Path(src)
    safe = "".join(c if c.isalnum() or c in "-_ ." else "_" for c in name_hint).strip(" .") or "icon"
    if not safe.lower().endswith(".ico"):
        safe += ".ico"
    data = src.read_bytes()
    target = store / safe
    n = 1
    while target.exists() and target.read_bytes() != data:
        n += 1
        target = store / f"{safe[:-4]} ({n}).ico"
    if not target.exists():
        tmp = target.with_suffix(".tmp")
        tmp.write_bytes(data)
        os.replace(tmp, target)
    return target
