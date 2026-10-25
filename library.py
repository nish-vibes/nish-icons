"""The icon library: finding .ico files in a folder and turning them into small PNG previews for the
window. Only the standard library is used, so the .exe stays small.

An .ico file holds several pictures (16, 32, 48 ... 256 px). Each is either a PNG or an old-style
bitmap (BMP without its file header, with an extra 1-bit transparency mask underneath).
"""
import base64
import os
import re
import struct
import zlib
from pathlib import Path

PNG_SIG = b"\x89PNG\r\n\x1a\n"
MAX_ICONS = 3000
MAX_DEPTH = 4

# Colour words found in icon names -> the dot colour shown on the filter chip.
COLOURS = {
    "blue": "#5294E2", "green": "#87B158", "red": "#E25252", "teal": "#16A085", "yellow": "#F9BD30",
    "orange": "#EE923A", "deeporange": "#EB6637", "violet": "#7E57C2", "magenta": "#CA71DF",
    "pink": "#F06292", "indigo": "#5C6BC0", "cyan": "#00BAD1", "darkcyan": "#45ABB7",
    "grey": "#8E8E8E", "gray": "#8E8E8E", "bluegrey": "#607D8B", "black": "#4F4F4F",
    "white": "#E4E4E4", "brown": "#AE8E6C", "palebrown": "#D1BFAE", "paleorange": "#EECA8F",
    "carmine": "#A30002", "purple": "#8E44AD",
}


class IconError(ValueError):
    pass


class Frame:
    def __init__(self, width, height, bpp, is_png, data):
        self.width, self.height, self.bpp, self.is_png, self.data = width, height, bpp, is_png, data


def read_frames(data):
    """All pictures in an .ico file."""
    if len(data) < 6:
        raise IconError("file is too small to be an icon")
    reserved, kind, count = struct.unpack_from("<HHH", data, 0)
    if reserved != 0 or kind != 1 or count == 0:
        raise IconError("not an icon file")
    frames = []
    for i in range(count):
        pos = 6 + 16 * i
        if pos + 16 > len(data):
            break
        w, h, _colors, _res, _planes, bpp, size, offset = struct.unpack_from("<BBBBHHII", data, pos)
        if size == 0 or offset + size > len(data):
            continue
        blob = data[offset:offset + size]
        if blob[:8] == PNG_SIG and len(blob) >= 24:
            w, h = struct.unpack(">II", blob[16:24])
            frames.append(Frame(w, h, 32, True, blob))
        elif len(blob) >= 40:
            bw, bh = struct.unpack_from("<ii", blob, 4)
            bpp = struct.unpack_from("<H", blob, 14)[0]
            frames.append(Frame(abs(bw), abs(bh) // 2, bpp, False, blob))
    if not frames:
        raise IconError("the icon has no readable pictures")
    return frames


def pick_frame(frames, want):
    """The smallest picture that is at least `want` pixels wide, else the biggest one.
    Among equal sizes, the one with the most colours wins."""
    big_enough = [f for f in frames if f.width >= want]
    if big_enough:
        return min(big_enough, key=lambda f: (f.width, -f.bpp))
    return max(frames, key=lambda f: (f.width, f.bpp))


def bitmap_to_rgba(blob):
    """Decode an old-style icon bitmap to (width, height, RGBA bytes)."""
    header_size = struct.unpack_from("<I", blob, 0)[0]
    width, height2, _planes, bpp, compression = struct.unpack_from("<iiHHI", blob, 4)
    colours_used = struct.unpack_from("<I", blob, 32)[0] if header_size >= 36 else 0
    width, height = abs(width), abs(height2) // 2
    bottom_up = height2 > 0
    if width == 0 or height == 0 or width > 1024 or height > 1024:
        raise IconError("unexpected picture size")
    if compression not in (0, 3) or bpp not in (1, 4, 8, 24, 32):
        raise IconError("unsupported picture format")
    pos = header_size
    if compression == 3 and header_size == 40:
        pos += 12                                 # three colour masks follow a short header
    palette = []
    if bpp <= 8:
        n = colours_used or (1 << bpp)
        for i in range(n):
            b, g, r = blob[pos + 4 * i], blob[pos + 4 * i + 1], blob[pos + 4 * i + 2]
            palette.append(bytes((r, g, b)))
        pos += 4 * n
    stride = ((width * bpp + 31) // 32) * 4
    pixels = blob[pos:pos + stride * height]
    pos += stride * height
    mask_stride = ((width + 31) // 32) * 4
    mask = blob[pos:pos + mask_stride * height]
    if len(pixels) < stride * height:
        raise IconError("picture data is cut off")
    has_mask = len(mask) >= mask_stride * height

    out = bytearray(width * height * 4)
    row_bytes = width * 4
    for row in range(height):
        src = (height - 1 - row) if bottom_up else row
        line = pixels[src * stride:(src + 1) * stride]
        o = row * row_bytes
        if bpp == 32:
            seg = line[:row_bytes]
            out[o:o + row_bytes:4] = seg[2::4]
            out[o + 1:o + row_bytes:4] = seg[1::4]
            out[o + 2:o + row_bytes:4] = seg[0::4]
            out[o + 3:o + row_bytes:4] = seg[3::4]
        elif bpp == 24:
            seg = line[:width * 3]
            out[o:o + row_bytes:4] = seg[2::3]
            out[o + 1:o + row_bytes:4] = seg[1::3]
            out[o + 2:o + row_bytes:4] = seg[0::3]
            out[o + 3:o + row_bytes:4] = b"\xff" * width
        else:
            per_byte = 8 // bpp
            top = (1 << bpp) - 1
            for x in range(width):
                byte = line[x // per_byte]
                shift = (per_byte - 1 - x % per_byte) * bpp
                idx = (byte >> shift) & top
                rgb = palette[idx] if idx < len(palette) else b"\x00\x00\x00"
                out[o + 4 * x:o + 4 * x + 3] = rgb
                out[o + 4 * x + 3] = 255

    # 32-bit pictures carry their own transparency. Older ones (or 32-bit ones whose alpha is
    # all zero) use the 1-bit mask: a set bit means "see-through".
    use_mask = bpp < 32 or not any(out[3::4])
    if use_mask:
        for row in range(height):
            src = (height - 1 - row) if bottom_up else row
            for x in range(width):
                transparent = False
                if has_mask:
                    byte = mask[src * mask_stride + x // 8]
                    transparent = bool(byte & (0x80 >> (x % 8)))
                out[row * row_bytes + 4 * x + 3] = 0 if transparent else 255
    return width, height, bytes(out)


def png_encode(width, height, rgba):
    raw = b"".join(b"\x00" + rgba[y * width * 4:(y + 1) * width * 4] for y in range(height))

    def chunk(kind, body):
        return struct.pack(">I", len(body)) + kind + body + struct.pack(">I", zlib.crc32(kind + body) & 0xFFFFFFFF)

    return (PNG_SIG + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b""))


def preview_png(path, want=64):
    """PNG bytes of the best picture in an .ico for showing at about `want` pixels."""
    frame = pick_frame(read_frames(Path(path).read_bytes()), want)
    if frame.is_png:
        return frame.data
    return png_encode(*bitmap_to_rgba(frame.data))


def data_url(png):
    return "data:image/png;base64," + base64.b64encode(png).decode("ascii")


def preview_url(path, want=64):
    try:
        return data_url(preview_png(path, want))
    except Exception:
        return None


def pretty_name(stem):
    """'folder-blue-music' -> 'Blue Music', 'my_icon' -> 'My Icon'."""
    name = re.sub(r"^folder[-_ ]+", "", stem, flags=re.I) or stem
    words = [w for w in re.split(r"[-_ ]+", name) if w]
    return " ".join(w[:1].upper() + w[1:] for w in words) or stem


def colour_of(stem):
    for word in re.split(r"[-_ ]+", stem.lower()):
        if word in COLOURS:
            return "grey" if word == "gray" else word
    return "other"


def find_icons(root, max_depth=MAX_DEPTH, limit=MAX_ICONS):
    """Paths of .ico files under `root` (sub-folders included, a few levels deep), sorted by name."""
    root = Path(root)
    found = []
    base_depth = len(root.parts)
    for dirpath, dirnames, filenames in os.walk(root):
        depth = len(Path(dirpath).parts) - base_depth
        if depth >= max_depth:
            dirnames[:] = []
        dirnames[:] = sorted(d for d in dirnames if not d.startswith("."))
        for name in filenames:
            if name.lower().endswith(".ico"):
                found.append(Path(dirpath) / name)
                if len(found) >= limit:
                    break
        if len(found) >= limit:
            break
    return sorted(found, key=lambda p: (p.stem.lower(), str(p).lower()))


def icon_id(root, path):
    return Path(path).relative_to(root).as_posix()


def scan(root, prefix=""):
    """Everything the window needs to show a library. `prefix` (the library's id plus ":") makes the
    icon ids unique when several libraries are open."""
    root = Path(root)
    icons, unreadable = [], 0
    for path in find_icons(root):
        thumb = preview_url(path, 64)
        if not thumb:
            unreadable += 1
            continue
        icons.append({"id": prefix + icon_id(root, path), "label": pretty_name(path.stem), "file": path.name,
                      "colour": colour_of(path.stem), "thumb": thumb})
    colours = sorted({i["colour"] for i in icons if i["colour"] != "other"})
    chips = [{"id": c, "label": c[:1].upper() + c[1:], "dot": COLOURS[c]} for c in colours]
    if any(i["colour"] == "other" for i in icons) and chips:
        chips.append({"id": "other", "label": "Other", "dot": "#8E44AD"})
    return {"root": str(root), "icons": icons, "unreadable": unreadable, "colours": chips}


def resolve(root, icon):
    """The real path of a library icon id, refusing anything outside the library."""
    root = Path(root).resolve()
    path = (root / icon).resolve()
    if root != path and root not in path.parents:
        raise IconError("that icon is not in the library")
    if not path.is_file():
        raise IconError("the icon file is missing")
    return path
