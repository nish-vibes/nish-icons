// A stand-in for the Python side, used only when the page is opened in an ordinary browser
// (for previews and tests). In the app, window.pywebview.api is used instead.
window.makeMockApi = function () {
  const colours = { blue: '#5294E2', green: '#87B158', red: '#E25252', teal: '#16A085', yellow: '#F9BD30' };
  const kinds = ['', 'music', 'documents', 'pictures', 'download', 'git', 'games', 'important'];
  const folderSvg = (fill) => 'data:image/svg+xml;base64,' + btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><path d="M6 14a4 4 0 0 1 4-4h14l5 5h25a4 4 0 0 1 4 4v31a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z" fill="${fill}"/><path d="M6 22h52v28a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z" fill="${fill}" opacity=".8"/><rect x="10" y="18" width="44" height="6" rx="1" fill="#fff" opacity=".85"/></svg>`);
  const icons = [];
  Object.keys(colours).forEach((c) => kinds.forEach((k) => {
    const stem = 'folder-' + c + (k ? '-' + k : '');
    const label = stem.replace(/^folder-/, '').split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
    icons.push({ id: stem + '.ico', label, file: stem + '.ico', colour: c, thumb: folderSvg(colours[c]) });
  }));
  const lib = { root: 'C:\\Users\\nish\\Icons\\Papirus Places', icons, unreadable: 0,
    colours: Object.keys(colours).map((c) => ({ id: c, label: c[0].toUpperCase() + c.slice(1), dot: colours[c] })) };
  const tree = {
    'C:\\Users\\nish\\Documents': ['Guitar lessons', 'Projects', 'School', 'Receipts'],
    'C:\\Users\\nish\\Documents\\Projects': ['Website', 'Desktop app', 'Archive'],
    'C:\\Users\\nish\\Desktop': ['Work', 'Photos'],
  };
  const lnks = {
    'C:\\Users\\nish\\Documents': ['Lesson plans.lnk'],
    'C:\\Users\\nish\\Desktop': ['NiSH Notes.lnk', 'Spotify.lnk', 'Teams.lnk'],
  };
  const custom = new Set();
  let favs = { root: ['folder-green-documents.ico', 'folder-yellow.ico'], groups: [{ id: 'g1', name: 'Blue', items: ['folder-blue-music.ico', 'folder-blue.ico'] }] };
  let tags = [{ id: 't1', name: 'Work' }, { id: 't2', name: 'Music' }];
  let tagMap = { 'folder-blue-music.ico': ['t2'], 'folder-green-music.ico': ['t2'], 'folder-teal-git.ico': ['t1'] };
  let menu = { options: { enabled: true, folders: true, shortcuts: true, background: true }, installed: true, error: null };
  const favItems = () => { const out = {}; [].concat(favs.root, ...favs.groups.map((g) => g.items)).forEach((id) => {
    const i = icons.find((x) => x.id === id); if (i) out[id] = { label: i.label, file: i.file, thumb: i.thumb }; }); return out; };
  const wait = (v) => new Promise((r) => setTimeout(() => r(v), 5));
  const count = (targets) => targets.length;
  return {
    mock: true,
    init: () => wait({ version: 'preview', theme: 'system', welcomed: true, library: lib, favourites: favs, favItems: favItems(),
      tags, tagMap, menu, startFolder: 'C:\\Users\\nish\\Documents', store: 'C:\\Users\\nish\\AppData\\Local\\NiSH Icons\\icons',
      places: [{ name: 'Home', path: 'C:\\Users\\nish' }, { name: 'Desktop', path: 'C:\\Users\\nish\\Desktop' }, { name: 'Documents', path: 'C:\\Users\\nish\\Documents' }, { name: 'Start menu', path: 'C:\\Users\\nish\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs' }],
      pick: null, limits: { top: 12, group: 16 } }),
    choose_library: () => wait(lib),
    set_library: () => wait(lib),
    rescan: () => wait(lib),
    preview: () => wait(null),
    save_favourites: (f) => { favs = f; return wait({ favourites: favs, favItems: favItems(), menu }); },
    save_tags: (t, m) => { tags = t; tagMap = m; return wait(null); },
    set_pref: () => wait(null),
    list_folders: (path) => wait((tree[path] || []).map((n) => {
      const p = path + '\\' + n; return { kind: 'folder', name: n, path: p, hasChildren: !!(tree[p] || lnks[p]), custom: custom.has(p) }; })
      .concat((lnks[path] || []).map((n) => { const p = path + '\\' + n;
        return { kind: 'shortcut', name: n.replace(/\.lnk$/i, ''), path: p, hasChildren: false, custom: custom.has(p) }; }))),
    choose_folder: () => wait(null),
    apply: (id, targets) => { targets.forEach((t) => custom.add(t)); return wait({ done: count(targets), failed: [] }); },
    reset: (targets) => { targets.forEach((t) => custom.delete(t)); return wait({ done: count(targets), failed: [] }); },
    set_menu: (o) => { menu = { options: o, installed: !!o.enabled, error: null }; return wait(menu); },
    open_store: () => wait(null),
    remove_everything: () => wait(null),
    close: () => wait(null),
  };
};
