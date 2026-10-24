# NiSH Icons

Give your folders their own icons, straight from the right-click menu in File Explorer.
Pick an icon library, star your favourites, sort them into menu folders, and right-click any folder
to change its icon. Works without admin rights, so it's fine on a locked-down work PC.

No installer: download `NiSHIcons.exe` and double-click it.

## Download

Get `NiSHIcons.exe` from the [latest release](https://github.com/nish-vibes/nish-icons/releases/latest)
and put it somewhere it can stay (Documents, for example). Windows may show "Windows protected your PC"
the first time because the app isn't signed: click **More info → Run anyway**.

## What it does

- **Your own icon library.** Point the app at any folder of `.ico` files (sub-folders are included).
  The [Papirus](https://github.com/PapirusDevelopmentTeam/papirus-icon-theme) folder icons work well.
- **Search and filter** by name, by colour (taken from the icon names) and by **your own tags**:
  click **New tag**, then tick tags on an icon in the panel on the right.
- **Favourites.** Click the star on an icon. Favourites are what you see in the right-click menu.
- **Menu folders.** Sort favourites into folders, so the menu becomes
  *NiSH Icons › Blue › Blue Music*. Click a folder's name to rename it.
- **Right-click a folder → NiSH Icons → pick an icon.** Also on shortcuts (`.lnk`) and on the blank
  space inside a folder. **Reset to default icon** puts the normal icon back, and **More icons…**
  opens the app to choose from the whole library.
- **Apply to folders.** Tick many folders in a folder tree (optionally everything inside them too)
  and change them all at once.

On **Windows 11** the entry is in the classic menu: click **Show more options**, or hold **Shift**
while you right-click. The short new menu only accepts signed app packages, which need admin rights.

Files can't have their own icon (Windows gives every file of a type the same one), so the menu
appears on folders and shortcuts.

## How it works (and why no admin rights are needed)

- A folder's icon is set with a hidden `desktop.ini` inside it — the same file that
  **Properties → Customize → Change Icon** writes. Any other settings in that file are kept.
- The chosen icon is copied to `%LOCALAPPDATA%\NiSH Icons\icons`, and folders point at that copy,
  so they keep their icon even if you move or delete the library.
- A shortcut's icon is stored in the `.lnk` file itself. If it had its own icon before, **Reset**
  brings that one back.
- The right-click menu lives under `HKEY_CURRENT_USER\Software\Classes`, which belongs to your
  Windows account. The app refreshes it every time it starts, so if you move `NiSHIcons.exe`,
  open it once and the menu follows.
- Settings (favourites, menu folders, tags) are in `%LOCALAPPDATA%\NiSH Icons\settings.json`.

**Settings → Remove NiSH Icons from this PC** removes the menu entry and the settings. Folders keep
the icons you gave them until you reset them.

## Requirements

Windows 10 or 11. The window uses Microsoft Edge WebView2, which is already part of Windows.
If it has been removed, the app tells you how to get it back (it installs for your user, no admin needed).

## Building it yourself

GitHub Actions builds the exe on every push to `main` (see `.github/workflows/build.yml`). It runs the
tests, checks the right-click commands on a real folder and shortcut, and runs a GUI smoke test that
opens the window, clicks through everything and writes the right-click menu.
A new release is published when `VERSION` changes.

Locally on Windows:

```
pip install -r requirements.txt pyinstaller
python app.py                      # run it
python tests/test_core.py          # tests
pyinstaller NiSHIcons.spec --noconfirm
```

To preview the window in a browser without Windows, open `web/index.html`; it uses sample data
from `web/mock.js`.

## License

MIT. Icon libraries you use keep their own licenses (Papirus is GPL-3.0).
