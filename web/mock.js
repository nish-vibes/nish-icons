// A stand-in for the Python side, used only when the page is opened in an ordinary browser
// (for previews and tests). In the app, window.pywebview.api is used instead.
window.makeMockApi = function () {
  const colours = { blue: '#5294E2', green: '#87B158', red: '#E25252', teal: '#16A085', yellow: '#F9BD30' };
  const folderSvg = (fill) => 'data:image/svg+xml;base64,' + btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><path d="M6 14a4 4 0 0 1 4-4h14l5 5h25a4 4 0 0 1 4 4v31a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z" fill="${fill}"/><path d="M6 22h52v28a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z" fill="${fill}" opacity=".8"/><rect x="10" y="18" width="44" height="6" rx="1" fill="#fff" opacity=".85"/></svg>`);
  const makeLib = (id, name, path, kinds, cols) => {
    const icons = [];
    cols.forEach((c) => kinds.forEach((k) => {
      const stem = 'folder-' + c + (k ? '-' + k : '');
      const label = stem.replace(/^folder-/, '').split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
      icons.push({ id: id + ':' + stem + '.ico', label, file: stem + '.ico', colour: c, thumb: folderSvg(colours[c]) });
    }));
    return { id, name, path, icons, unreadable: 0, colours: cols.map((c) => ({ id: c, label: c[0].toUpperCase() + c.slice(1), dot: colours[c] })) };
  };
  const libs = {
    Lpap: makeLib('Lpap', 'Papirus Places', 'C:\\Users\\nish\\Icons\\Papirus Places', ['', 'music', 'documents', 'pictures', 'download', 'git', 'games', 'important'], ['blue', 'green', 'red', 'teal', 'yellow']),
    Lwork: makeLib('Lwork', 'Work icons', 'C:\\Users\\nish\\OneDrive\\Icons\\Work', ['home', 'network', 'locked'], ['blue', 'red']),
  };
  const extra = makeLib('Lflu', 'Fluent folders', 'C:\\Users\\nish\\Downloads\\Fluent folders', ['photo', 'video', 'wine'], ['teal', 'yellow']);
  let records = [{ id: 'Lpap', name: 'Papirus Places', path: libs.Lpap.path, saved: true }, { id: 'Lwork', name: 'Work icons', path: libs.Lwork.path, saved: true }];
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
  let favourites = ['Lpap:folder-blue-music.ico', 'Lpap:folder-teal-git.ico', 'Lwork:folder-blue-home.ico'];
  let menuItems = [
    { kind: 'group', id: 'g1', name: 'Blue', items: ['Lpap:folder-blue-music.ico', 'Lwork:folder-blue-home.ico', 'Lpap:folder-blue.ico'] },
    { kind: 'icon', id: 'Lpap:folder-green-documents.ico' },
    { kind: 'group', id: 'g2', name: 'Work', items: ['Lpap:folder-teal-git.ico', 'Lpap:folder-red-important.ico'] },
    { kind: 'icon', id: 'Lwork:folder-red-network.ico' },
  ];
  let tags = [{ id: 't1', name: 'Work' }, { id: 't2', name: 'Music' }];
  let tagMap = { 'Lpap:folder-blue-music.ico': ['t2'], 'Lpap:folder-green-music.ico': ['t2'], 'Lpap:folder-teal-git.ico': ['t1'] };
  let menu = { options: { enabled: true, folders: true, shortcuts: true, background: true }, installed: true, error: null };
  const all = () => Object.values(libs).concat([extra]);
  const find = (id) => { for (const l of all()) { const i = l.icons.find((x) => x.id === id); if (i) return [i, l]; } return [null, null]; };
  const saved = () => {
    const out = {};
    const ids = favourites.concat(...menuItems.map((e) => (e.kind === 'group' ? e.items : [e.id])));
    ids.forEach((id) => { const [i, l] = find(id); if (i) out[id] = { label: i.label, file: i.file, colour: i.colour, lib: l.name, thumb: i.thumb }; });
    return out;
  };
  const list = () => records.map((r) => ({ ...r, exists: true, count: (libs[r.id] || extra).icons.length }));
  const wait = (v) => new Promise((r) => setTimeout(() => r(v), 5));
  const sync = () => wait({ favourites, menuItems, savedIcons: saved(), menu });
  return {
    mock: true,
    init: () => wait({ version: 'preview', theme: 'system', welcomed: true, libraries: list(), favourites, menuItems,
      savedIcons: saved(), tags, tagMap, menu, startFolder: 'C:\\Users\\nish\\Documents', store: 'C:\\Users\\nish\\AppData\\Local\\NiSH Icons\\icons',
      places: [{ name: 'Home', path: 'C:\\Users\\nish' }, { name: 'Desktop', path: 'C:\\Users\\nish\\Desktop' }, { name: 'Documents', path: 'C:\\Users\\nish\\Documents' }, { name: 'Start menu', path: 'C:\\Users\\nish\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs' }],
      pick: null, limits: { top: 12, group: 16 }, testLibrary: null }),
    library: (id) => { const r = records.find((x) => x.id === id); return wait({ ...(libs[id] || extra), name: r.name, saved: r.saved }); },
    open_folder: (save) => {
      if (!records.find((r) => r.id === 'Lflu')) records.push({ id: 'Lflu', name: extra.name, path: extra.path, saved: !!save });
      return wait({ library: { ...extra, saved: !!save }, libraries: list() });
    },
    open_path: () => wait(null),
    save_library: (id) => { records = records.map((r) => (r.id === id ? { ...r, saved: true } : r)); return wait(list()); },
    close_library: (id) => { records = records.filter((r) => r.id !== id); return wait(list()); },
    relocate_library: () => wait(null),
    rescan: (id) => wait({ library: id ? { ...(libs[id] || extra), ...records.find((x) => x.id === id) } : null, libraries: list() }),
    preview: () => wait(null),
    save_favourites: (f) => { favourites = f; return sync(); },
    save_menu_items: (m) => { menuItems = m; return sync(); },
    save_tags: (t, m) => { tags = t; tagMap = m; return wait(null); },
    set_pref: () => wait(null),
    list_folders: (path) => wait((tree[path] || []).map((n) => {
      const p = path + '\\' + n; return { kind: 'folder', name: n, path: p, hasChildren: !!(tree[p] || lnks[p]), custom: custom.has(p) }; })
      .concat((lnks[path] || []).map((n) => { const p = path + '\\' + n;
        return { kind: 'shortcut', name: n.replace(/\.lnk$/i, ''), path: p, hasChildren: false, custom: custom.has(p) }; }))),
    choose_folder: () => wait(null),
    apply: (id, targets) => { targets.forEach((t) => custom.add(t)); return wait({ done: targets.length, failed: [] }); },
    reset: (targets) => { targets.forEach((t) => custom.delete(t)); return wait({ done: targets.length, failed: [] }); },
    set_menu: (o) => { menu = { options: o, installed: !!o.enabled, error: null }; return wait(menu); },
    open_store: () => wait(null),
    remove_everything: () => wait(null),
    close: () => wait(null),
  };
};
