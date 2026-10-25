"""Tests for reading icons, changing folder and shortcut icons, the right-click menu layout and the
favourites model.  Run:  python tests/test_core.py   (works on Windows and elsewhere; the parts that
need Windows itself are checked by the GUI smoke test in the build)."""
import os
import struct
import sys
import tempfile
import traceback
import zlib
from pathlib import Path

os.environ["NISH_ICONS_QUIET"] = "1"   # no message boxes: nobody is there to click OK

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))

import app        # noqa: E402
import folders    # noqa: E402
import library    # noqa: E402
import menu       # noqa: E402
import settings   # noqa: E402

TESTS = []


def test(fn):
    TESTS.append(fn)
    return fn


def tmpdir():
    return Path(tempfile.mkdtemp(prefix="nishicons-test-"))


def use_temp_settings():
    d = tmpdir()
    settings.FILE = d / "settings.json"
    settings.ICON_STORE = d / "store"
    return d


# ------------------------------------------------------------------ building test icons

def dib(size, bpp, pixel_rgba, transparent_corner=True):
    """An old-style icon bitmap of one colour; for <=8 bpp a palette is used."""
    r, g, b, a = pixel_rgba
    w = h = size
    header = struct.pack("<IiiHHIIiiII", 40, w, h * 2, 1, bpp, 0, 0, 0, 0, 0, 0)
    stride = ((w * bpp + 31) // 32) * 4
    palette = b""
    if bpp <= 8:
        palette = bytes((b, g, r, 0)) + b"\x00" * (4 * ((1 << bpp) - 1))   # colour 0 = our colour
        rows = b"\x00" * stride * h
    elif bpp == 24:
        rows = (bytes((b, g, r)) * w + b"\x00" * (stride - 3 * w)) * h
    else:
        rows = bytes((b, g, r, a)) * w * h
    mask_stride = ((w + 31) // 32) * 4
    mask_rows = []
    for y in range(h):              # bottom-up: row 0 is the bottom row
        row = bytearray(mask_stride)
        if transparent_corner and y == h - 1:   # top row, first pixel see-through
            row[0] = 0x80
        mask_rows.append(bytes(row))
    return header + palette + rows + b"".join(mask_rows)


def ico(frames):
    out = struct.pack("<HHH", 0, 1, len(frames))
    offset = 6 + 16 * len(frames)
    blobs = b""
    for size, bpp, data in frames:
        dim = 0 if size >= 256 else size
        out += struct.pack("<BBBBHHII", dim, dim, 0, 0, 1, bpp, len(data), offset)
        blobs += data
        offset += len(data)
    return out + blobs


def png_size(data):
    return struct.unpack(">II", data[16:24])


def png_pixels(data):
    """Decode our own 8-bit RGBA PNGs (filter 0 only), enough to check colours."""
    pos, idat = 8, b""
    w, h = png_size(data)
    while pos < len(data):
        n = struct.unpack(">I", data[pos:pos + 4])[0]
        kind = data[pos + 4:pos + 8]
        if kind == b"IDAT":
            idat += data[pos + 8:pos + 8 + n]
        pos += 12 + n
    raw = zlib.decompress(idat)
    rows = [raw[y * (w * 4 + 1) + 1:(y + 1) * (w * 4 + 1)] for y in range(h)]
    return w, h, rows


# ------------------------------------------------------------------ library

@test
def reads_every_bitmap_depth():
    for bpp in (4, 8, 24, 32):
        data = ico([(16, bpp, dib(16, bpp, (10, 120, 200, 255)))])
        frames = library.read_frames(data)
        w, h, rgba = library.bitmap_to_rgba(frames[0].data)
        assert (w, h) == (16, 16), (bpp, w, h)
        top_left = rgba[0:4]
        if bpp < 32:   # 32-bit pictures use their own alpha; the mask only matters for the others
            assert top_left[3] == 0, f"{bpp} bpp: masked pixel should be see-through"
        middle = rgba[4 * (8 * 16 + 8):4 * (8 * 16 + 8) + 4]
        assert tuple(middle) == (10, 120, 200, 255), (bpp, tuple(middle))
    # a 32-bit picture whose alpha is all zero falls back to the mask, like Windows does
    frames = library.read_frames(ico([(16, 32, dib(16, 32, (10, 120, 200, 0)))]))
    w, h, rgba = library.bitmap_to_rgba(frames[0].data)
    assert rgba[3] == 0 and rgba[4 * 17 + 3] == 255


@test
def picks_a_sensible_frame_and_makes_a_png():
    big_png = library.png_encode(256, 256, bytes((1, 2, 3, 255)) * 256 * 256)
    data = ico([(16, 32, dib(16, 32, (9, 9, 9, 255))), (48, 32, dib(48, 32, (200, 10, 10, 255))), (256, 32, big_png)])
    d = tmpdir()
    (d / "x.ico").write_bytes(data)
    png = library.preview_png(d / "x.ico", 32)
    assert png_size(png) == (48, 48)
    w, h, rows = png_pixels(png)
    assert rows[24][24 * 4:24 * 4 + 4] == bytes((200, 10, 10, 255))
    assert library.preview_png(d / "x.ico", 128) == big_png       # PNG pictures are passed through as they are
    assert library.preview_url(d / "x.ico").startswith("data:image/png;base64,")


@test
def broken_files_are_skipped():
    d = tmpdir()
    (d / "bad.ico").write_bytes(b"hello")
    (d / "good.ico").write_bytes(ico([(16, 32, dib(16, 32, (1, 2, 3, 255)))]))
    lib = library.scan(d)
    assert [i["id"] for i in lib["icons"]] == ["good.ico"] and lib["unreadable"] == 1


@test
def scans_subfolders_names_and_colours():
    d = tmpdir()
    one = ico([(16, 32, dib(16, 32, (1, 2, 3, 255)))])
    for rel in ("folder-blue-music.ico", "pack/folder-red.ico", "pack/deep/my_icon.ico", ".hidden/x.ico", "readme.txt"):
        p = d / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_bytes(one)
    lib = library.scan(d)
    ids = {i["id"]: i for i in lib["icons"]}
    assert set(ids) == {"folder-blue-music.ico", "pack/folder-red.ico", "pack/deep/my_icon.ico"}, ids.keys()
    assert ids["folder-blue-music.ico"]["label"] == "Blue Music"
    assert ids["folder-blue-music.ico"]["colour"] == "blue"
    assert ids["pack/deep/my_icon.ico"]["label"] == "My Icon" and ids["pack/deep/my_icon.ico"]["colour"] == "other"
    assert [c["id"] for c in lib["colours"]] == ["blue", "red", "other"]


@test
def resolve_refuses_paths_outside_the_library():
    d = tmpdir()
    (d / "a.ico").write_bytes(b"x")
    assert library.resolve(d, "a.ico") == (d / "a.ico").resolve()
    for bad in ("../a.ico", "missing.ico"):
        try:
            library.resolve(d, bad)
        except library.IconError:
            continue
        raise AssertionError(bad)


# ------------------------------------------------------------------ desktop.ini

@test
def desktop_ini_new_and_existing():
    lines = folders.ini_with_icon([], "C:\\icons\\a.ico")
    assert lines == ["[.ShellClassInfo]", "IconResource=C:\\icons\\a.ico,0"]
    existing = ["[.ShellClassInfo]", "LocalizedResourceName=@shell32.dll,-21770", "IconResource=old.ico,0",
                "IconFile=x.ico", "IconIndex=3", "[ViewState]", "Mode=", "FolderType=Music"]
    out = folders.ini_with_icon(existing, "new.ico")
    assert out == ["[.ShellClassInfo]", "LocalizedResourceName=@shell32.dll,-21770", "IconResource=new.ico,0",
                   "[ViewState]", "Mode=", "FolderType=Music"], out
    other_only = ["[ViewState]", "FolderType=Pictures"]
    out = folders.ini_with_icon(other_only, "n.ico")
    assert out[:2] == ["[.ShellClassInfo]", "IconResource=n.ico,0"] and out[-2:] == other_only


@test
def desktop_ini_reset_keeps_other_settings():
    assert folders.ini_without_icon(["[.ShellClassInfo]", "IconResource=a.ico,0"]) == []
    kept = folders.ini_without_icon(["[.ShellClassInfo]", "IconResource=a.ico,0", "[ViewState]", "FolderType=Music"])
    assert kept == ["[.ShellClassInfo]", "[ViewState]", "FolderType=Music"], kept


@test
def folder_icon_round_trip_on_disk():
    d = tmpdir()
    f = d / "My folder"
    f.mkdir()
    folders.set_folder_icon(f, "C:\\store\\blue.ico")
    raw = (f / "desktop.ini").read_bytes()
    assert raw[:2] == b"\xff\xfe", "desktop.ini should be UTF-16 with a BOM"
    assert folders.folder_icon(f) == "C:\\store\\blue.ico,0"
    folders.set_folder_icon(f, "C:\\store\\red.ico")
    assert folders.folder_icon(f) == "C:\\store\\red.ico,0"
    assert raw.decode("utf-16").count("IconResource") == 1
    folders.reset_folder_icon(f)
    assert not (f / "desktop.ini").exists()
    folders.reset_folder_icon(f)        # resetting again is fine


@test
def walking_skips_hidden_and_links():
    d = tmpdir()
    for rel in ("a/one", "a/two/deep", "b", ".hidden"):
        (d / rel).mkdir(parents=True)
    if os.name == "nt":
        folders._set_attrs(d / ".hidden", folders._get_attrs(d / ".hidden") | folders.FILE_ATTRIBUTE_HIDDEN)
    else:
        os.symlink(d / "a", d / "link-to-a")
    assert [Path(p).name for p in folders.child_folders(d)] == ["a", "b"]
    subs = [Path(p).relative_to(d).as_posix() for p in folders.all_subfolders(d / "a")]
    assert subs == ["a/one", "a/two", "a/two/deep"], subs
    t = folders.expand_targets([d / "a", d / "a" / "one"], True)
    assert len(t) == 4, t
    assert folders.has_child_folders(d / "a") and not folders.has_child_folders(d / "b")


@test
def tree_lists_shortcuts_after_folders():
    d = tmpdir()
    settings.FILE = d / "settings.json"
    (d / "Work").mkdir()
    (d / "only-links").mkdir()
    app._test_shortcut(d / "only-links" / "Teams.lnk", "x")
    app._test_shortcut(d / "Notes.lnk", "x")
    app._test_shortcut(d / "apple.LNK", "x")
    (d / "readme.txt").write_text("not a shortcut")
    assert [Path(p).name for p in folders.child_shortcuts(d)] == ["apple.LNK", "Notes.lnk"]
    assert folders.has_children(d / "only-links") and not folders.has_children(d / "only-links", shortcuts=False)
    assert not folders.has_children(d / "Work")
    items = app.Api().list_folders(str(d))
    assert [(i["kind"], i["name"]) for i in items] == [("folder", "only-links"), ("folder", "Work"),
                                                       ("shortcut", "apple"), ("shortcut", "Notes")], items
    assert items[0]["hasChildren"] and not items[1]["hasChildren"]
    ico = d / "i.ico"
    app._test_icon(ico, (1, 2, 3))
    done, failed = folders.apply_icon(str(ico), [str(d / "Notes.lnk")], False, settings.get("shortcut_backup"))
    assert done == 1 and not failed, failed
    assert folders.shortcut_icon(d / "Notes.lnk") == (str(ico), 0)


@test
def apply_and_reset_many():
    d = tmpdir()
    for rel in ("x/1", "x/2", "y"):
        (d / rel).mkdir(parents=True)
    done, failed = folders.apply_icon("C:\\i.ico", [str(d / "x"), str(d / "y"), str(d / "missing")], True)
    assert done == 4 and len(failed) == 1 and failed[0][1] == "It no longer exists", (done, failed)
    assert folders.folder_icon(d / "x" / "2")
    done, failed = folders.reset_icons([str(d / "x")], True)
    assert done == 3 and not failed
    assert not folders.folder_icon(d / "x" / "1") and folders.folder_icon(d / "y")


@test
def icon_copies_are_shared_or_renamed():
    d = tmpdir()
    a, b = d / "a.ico", d / "b.ico"
    a.write_bytes(b"one")
    b.write_bytes(b"two")
    store = d / "store"
    c1 = folders.copy_icon_to_store(a, store, "same.ico")
    c2 = folders.copy_icon_to_store(a, store, "same.ico")
    c3 = folders.copy_icon_to_store(b, store, "same.ico")
    assert c1 == c2 and c3 != c1 and c3.name == "same (2).ico" and c3.read_bytes() == b"two"


# ------------------------------------------------------------------ shortcuts

def make_lnk(unicode=True, icon=None, env_icon=False, id_list=True, link_info=True):
    flags = 0x4 | 0x20                      # has name, has arguments
    if unicode:
        flags |= 0x80
    if id_list:
        flags |= 0x1
    if link_info:
        flags |= 0x2
    if icon:
        flags |= 0x40
    if env_icon:
        flags |= 0x4000
    header = bytearray(76)
    struct.pack_into("<I", header, 0, 0x4C)
    header[4:20] = folders.LNK_CLSID
    struct.pack_into("<I", header, 20, flags)
    struct.pack_into("<i", header, 56, 5 if icon else 0)
    body = b""
    if id_list:
        idl = b"\x14\x00" + b"I" * 18 + b"\x00\x00"
        body += struct.pack("<H", len(idl)) + idl
    if link_info:
        info = b"L" * 24
        body += struct.pack("<I", len(info) + 4) + info

    def s(text):
        if unicode:
            return struct.pack("<H", len(text)) + text.encode("utf-16-le")
        return struct.pack("<H", len(text)) + text.encode("cp1252")

    body += s("My comment") + s("--flag")
    if icon:
        body += s(icon)
    blocks = b""
    if env_icon:
        blocks += struct.pack("<II", 0x314, 0xA0000007) + b"\x00" * (0x314 - 8)
    tracker = struct.pack("<II", 0x60, 0xA0000003) + b"T" * (0x60 - 8)
    return bytes(header) + body + blocks + tracker + b"\x00\x00\x00\x00"


@test
def shortcut_icon_set_and_reset():
    for unicode in (True, False):
        for env in (False, True):
            d = tmpdir()
            lnk = d / "App.lnk"
            lnk.write_bytes(make_lnk(unicode=unicode, icon="C:\\old.ico" if env else None, env_icon=env))
            before = folders.parse_lnk(lnk.read_bytes())
            folders.set_shortcut_icon(lnk, "C:\\store\\Blue Music.ico")
            after = folders.parse_lnk(lnk.read_bytes())
            assert folders.shortcut_icon(lnk) == ("C:\\store\\Blue Music.ico", 0)
            assert after["strings"][0] == "My comment" and after["strings"][3] == "--flag", after["strings"]
            assert after["middle"] == before["middle"], "target information must not change"
            flags = struct.unpack_from("<I", after["header"], 20)[0]
            assert flags & 0x40 and not flags & 0x4000
            assert len(after["blocks"]) == 1 and struct.unpack_from("<I", after["blocks"][0], 4)[0] == 0xA0000003
            folders.reset_shortcut_icon(lnk)
            assert folders.shortcut_icon(lnk) is None
            folders.reset_shortcut_icon(lnk, ("C:\\Program Files\\App\\app.exe", 2))
            assert folders.shortcut_icon(lnk) == ("C:\\Program Files\\App\\app.exe", 2)


@test
def shortcut_through_apply_remembers_original():
    d = tmpdir()
    lnk = d / "Game.lnk"
    lnk.write_bytes(make_lnk(icon="C:\\game.exe"))
    backup = {}
    done, failed = folders.apply_icon("C:\\new.ico", [str(lnk)], False, backup)
    assert done == 1 and not failed and backup[str(lnk)] == ("C:\\game.exe", 5)
    folders.reset_icons([str(lnk)], False, backup)
    assert folders.shortcut_icon(lnk) == ("C:\\game.exe", 5) and str(lnk) not in backup


@test
def not_a_shortcut():
    try:
        folders.parse_lnk(b"x" * 100)
    except folders.ShortcutError:
        return
    raise AssertionError("should refuse")


# ------------------------------------------------------------------ right-click menu

ITEMS = {f"i{n}.ico": {"label": f"Icon {n}", "ico": f"C:\\store\\i{n}.ico"} for n in range(40)}


@test
def menu_layout_with_folders():
    entries = [{"kind": "group", "id": "g", "name": "Blue", "items": ["i3.ico", "i4.ico"]},
               {"kind": "icon", "id": "i1.ico"},
               {"kind": "group", "id": "e", "name": "Empty", "items": []},
               {"kind": "icon", "id": "i2.ico"}]
    spec = menu.build_spec(entries, ITEMS, {"enabled": True, "folders": True, "shortcuts": False, "background": True},
                           start='"C:\\NiSHIcons.exe"', icon="C:\\NiSHIcons.exe,0")
    top = spec["Directory\\shell\\NiSHIcons"]
    assert top["MUIVerb"] == "NiSH Icons" and top["ExtendedSubCommandsKey"] == "NiSHIcons.Menu.folders"
    assert "lnkfile\\shell\\NiSHIcons" not in spec
    sub = "NiSHIcons.Menu.folders\\shell\\"
    assert spec[sub + "01"]["MUIVerb"] == "Blue" and spec[sub + "01"]["ExtendedSubCommandsKey"] == "NiSHIcons.Menu.folders.g01"
    assert spec["NiSHIcons.Menu.folders.g01\\shell\\02"]["MUIVerb"] == "Icon 4"
    assert spec["NiSHIcons.Menu.folders.g01\\shell\\02\\command"][""] == '"C:\\NiSHIcons.exe" --apply "C:\\store\\i4.ico" "%1"'
    assert spec[sub + "02"]["MUIVerb"] == "Icon 1" and spec[sub + "03"]["MUIVerb"] == "Icon 2"
    assert spec[sub + "04"]["MUIVerb"] == "Reset to default icon" and spec[sub + "04"]["CommandFlags"] == 0x20
    assert spec[sub + "04\\command"][""] == '"C:\\NiSHIcons.exe" --reset "%1"'
    assert spec[sub + "05\\command"][""] == '"C:\\NiSHIcons.exe" --pick "%1"'
    bg = "NiSHIcons.Menu.background\\shell\\02\\command"
    assert spec[bg][""].endswith('"%V"'), "inside a folder, Windows passes the folder as %V"
    assert not any("Empty" == v.get("MUIVerb") for v in spec.values()), "empty menu folders are left out"


@test
def menu_off_and_limits():
    assert menu.build_spec([{"kind": "icon", "id": "i1.ico"}], ITEMS, {"enabled": False}) == {}
    many = [{"kind": "icon", "id": f"i{n}.ico"} for n in range(30)]
    spec = menu.build_spec(many, ITEMS, {"enabled": True}, start="x", icon="y")
    items = [k for k in spec if k.startswith("NiSHIcons.Menu.folders\\shell\\") and k.count("\\") == 2]
    assert len(items) == menu.TOP_MAX + 2, len(items)
    big = [{"kind": "group", "id": "g", "name": "Big", "items": [f"i{n}.ico" for n in range(30)]}]
    assert len(menu.tidy(big, ITEMS)[0]["items"]) == menu.GROUP_MAX


@test
def menu_tidy_keeps_order_and_one_place_per_icon():
    entries = [{"kind": "icon", "id": "i1.ico"}, {"kind": "group", "id": "g", "name": "  ", "items": ["i1.ico", "i2.ico", "nope"]},
               {"kind": "icon", "id": "i2.ico"}, {"kind": "icon", "id": "nope"}, "junk"]
    t = menu.tidy(entries, ITEMS)
    assert t == [{"kind": "icon", "id": "i1.ico"}, {"kind": "group", "id": "g", "name": "Folder", "items": ["i2.ico"]}], t


# ------------------------------------------------------------------ libraries, favourites and the menu (Api without a window)

def library_with_icons(names, name="lib"):
    d = tmpdir() / name
    d.mkdir()
    for n in names:
        (d / n).write_bytes(ico([(16, 32, dib(16, 32, (5, 5, 5, 255)))]))
    return d


@test
def several_libraries_open_save_and_remove():
    use_temp_settings()
    a = library_with_icons(["folder-blue.ico", "folder-red.ico"], "Papirus")
    b = library_with_icons(["folder-green.ico"], "Work icons")
    api = app.Api()
    r = api.open_path(str(a), save=True)
    lib_a = r["library"]
    assert lib_a["saved"] and lib_a["name"] == "Papirus" and len(lib_a["icons"]) == 2
    assert all(i["id"].startswith(lib_a["id"] + ":") for i in lib_a["icons"])
    r = api.open_path(str(b))
    lib_b = r["library"]
    assert not lib_b["saved"] and [l["saved"] for l in r["libraries"]] == [True, False]
    assert [l["name"] for l in settings.get("libraries")] == ["Papirus"], "an opened folder is not saved by itself"
    assert api.open_path(str(a))["library"]["id"] == lib_a["id"], "opening the same folder again shows the same library"
    api.save_library(lib_b["id"])
    assert [l["name"] for l in settings.get("libraries")] == ["Papirus", "Work icons"]
    moved = tmpdir() / "Papirus moved"
    a.rename(moved)
    assert app.Api().init()["libraries"][0]["exists"] is False
    r = api.move_library(lib_a["id"], str(moved))
    assert len(r["library"]["icons"]) == 2 and settings.get("libraries")[0]["path"] == str(moved)
    api.close_library(lib_a["id"])
    assert [l["name"] for l in settings.get("libraries")] == ["Work icons"] and moved.is_dir()


@test
def favourites_and_menu_are_separate_and_copied():
    use_temp_settings()
    a = library_with_icons([f"folder-c{n}.ico" for n in range(20)], "A")
    b = library_with_icons(["folder-teal.ico"], "B")
    api = app.Api()
    la = api.open_path(str(a), save=True)["library"]["id"]
    lb = api.open_path(str(b), save=True)["library"]["id"]
    ida = lambda n: f"{la}:folder-c{n}.ico"
    teal = f"{lb}:folder-teal.ico"
    r = api.save_favourites([ida(0), teal, ida(0), "Lnope:x.ico"])
    assert r["favourites"] == [ida(0), teal] and r["menuItems"] == []
    assert r["savedIcons"][teal]["lib"] == "B" and r["savedIcons"][teal]["thumb"].startswith("data:image/png")
    entries = [{"kind": "group", "id": "g1", "name": " Blue ", "items": [ida(1), ida(2)]}] + \
              [{"kind": "icon", "id": ida(n)} for n in range(3, 20)]
    r = api.save_menu_items(entries)
    m = r["menuItems"]
    assert m[0] == {"kind": "group", "id": "g1", "name": "Blue", "items": [ida(1), ida(2)]}
    assert len(m) == menu.TOP_MAX and m[1] == {"kind": "icon", "id": ida(3)}
    assert r["favourites"] == [ida(0), teal], "changing the menu leaves favourites alone"
    saved = settings.get("saved_icons")
    assert ida(1) in saved and ida(0) in saved and ida(19) not in saved, "only icons in use are kept"
    assert all(Path(v["ico"]).parent == settings.ICON_STORE and Path(v["ico"]).is_file() for v in saved.values())
    # removing the library keeps favourites and menu icons working from their copies
    api.close_library(lb)
    r = api.save_favourites([teal])
    assert r["favourites"] == [teal] and Path(settings.get("saved_icons")[teal]["ico"]).is_file()
    r = api.save_favourites([])
    assert teal not in settings.get("saved_icons") and any(settings.ICON_STORE.iterdir()), "copies stay on disk"


@test
def settings_from_version_1_are_migrated():
    d = use_temp_settings()
    lib = library_with_icons(["folder-blue.ico", "folder-red.ico"], "Papirus")
    store = d / "store"
    store.mkdir()
    (store / "folder-blue.ico").write_bytes((lib / "folder-blue.ico").read_bytes())
    import json
    settings.FILE.write_text(json.dumps({
        "library": str(lib),
        "favourites": {"root": ["folder-red.ico"], "groups": [{"id": "g1", "name": "Blue", "items": ["folder-blue.ico"]}]},
        "fav_items": {"folder-blue.ico": {"label": "Blue", "ico": str(store / "folder-blue.ico")},
                      "folder-red.ico": {"label": "Red", "ico": str(store / "folder-blue.ico")}},
        "tag_map": {"folder-red.ico": ["t1"]}, "tags": [{"id": "t1", "name": "Work"}], "welcomed": True}), encoding="utf-8")
    data = app.Api().init()
    libs = data["libraries"]
    assert len(libs) == 1 and libs[0]["path"] == str(lib) and libs[0]["saved"]
    lid = libs[0]["id"]
    assert data["favourites"] == [f"{lid}:folder-red.ico", f"{lid}:folder-blue.ico"]
    assert data["menuItems"] == [{"kind": "group", "id": "g1", "name": "Blue", "items": [f"{lid}:folder-blue.ico"]},
                                 {"kind": "icon", "id": f"{lid}:folder-red.ico"}], "the old menu keeps its order"
    assert settings.get("tag_map") == {f"{lid}:folder-red.ico": ["t1"]}
    raw = json.loads(settings.FILE.read_text(encoding="utf-8"))
    assert "library" not in raw and "fav_items" not in raw, "migrated once and saved"


@test
def tags_are_cleaned():
    use_temp_settings()
    api = app.Api()
    api.save_tags([{"id": "t1", "name": " Work "}, {"id": "t1", "name": "dup"}, {"id": "", "name": "x"}, {"id": "t2", "name": ""}],
                  {"a.ico": ["t1", "zzz"], "b.ico": ["zzz"]})
    assert settings.get("tags") == [{"id": "t1", "name": "Work"}]
    assert settings.get("tag_map") == {"a.ico": ["t1"]}


@test
def apply_through_the_api_uses_a_copy():
    use_temp_settings()
    lib = library_with_icons(["folder-blue.ico"])
    api = app.Api()
    lid = api.open_path(str(lib))["library"]["id"]
    target = tmpdir() / "Projects"
    target.mkdir()
    r = api.apply(f"{lid}:folder-blue.ico", [str(target)], False)
    assert r == {"done": 1, "failed": []}
    used = folders.folder_icon(target).rsplit(",", 1)[0]
    assert Path(used).parent == settings.ICON_STORE
    assert api.reset([str(target)])["done"] == 1 and not folders.folder_icon(target)


@test
def command_line_apply_and_reset():
    use_temp_settings()
    d = tmpdir()
    icon_file = d / "x.ico"
    icon_file.write_bytes(ico([(16, 32, dib(16, 32, (5, 5, 5, 255)))]))
    target = d / "Folder"
    target.mkdir()
    assert app.run_command(["--apply", str(icon_file), str(target)]) == 0
    assert folders.folder_icon(target) == f"{icon_file},0"
    assert app.run_command(["--reset", str(target)]) == 0
    assert not folders.folder_icon(target)
    assert app.run_command(["--apply", str(d / "missing.ico"), str(target)]) == 1


@test
def init_without_a_library():
    use_temp_settings()
    data = app.Api().init()
    assert data["libraries"] == [] and data["favourites"] == [] and data["menuItems"] == []
    assert data["limits"] == {"top": menu.TOP_MAX, "group": menu.GROUP_MAX}
    assert data["menu"]["options"]["enabled"] is True


@test
def smoketest_icons_are_real_icons():
    d = tmpdir()
    app._test_icon(d / "t.ico", (10, 20, 30))
    frames = library.read_frames((d / "t.ico").read_bytes())
    assert {f.width for f in frames} == {16, 32}
    w, h, rgba = library.bitmap_to_rgba([f for f in frames if not f.is_png][0].data)
    assert rgba[:4] == bytes((10, 20, 30, 255))


def main():
    import faulthandler
    faulthandler.dump_traceback_later(90, exit=True)    # a hang prints exactly where it is stuck
    failed = 0
    for fn in TESTS:
        print(f"start {fn.__name__}", flush=True)
        try:
            fn()
            print(f"ok    {fn.__name__}", flush=True)
        except Exception:
            failed += 1
            print(f"FAIL  {fn.__name__}")
            traceback.print_exc()
    print(f"\n{len(TESTS) - failed} passed, {failed} failed")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
