/* NiSH Icons - the window. Talks to Python through window.pywebview.api (see app.py).
   Opened in an ordinary browser it uses the stand-in in mock.js, for previews and tests. */
'use strict';

const SVG = {
  grid: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  star: (on, size = 16) => `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${on ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>`,
  folder: (size = 18) => `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2h8.5A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z"/></svg>`,
  shortcut: (size = 18) => `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2.5"/><rect x="5.5" y="12.5" width="6" height="6" rx="1" fill="var(--surface, #fff)"/><path d="M7.4 16.6l2.6-2.6M8 14h2v2"/></svg>`,
  apply: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2h8.5A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z"/><path d="M9 13l2 2 4-4" stroke-linecap="round"/></svg>',
  menu: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="12" height="14" rx="2"/><path d="M7 8h6M7 11h6M7 14h3"/><path d="M15 15l5 2-2 1-1 2z"/></svg>',
  gear: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/></svg>',
  search: '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
  x: '<svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.4"/></svg>',
  plus: '<svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.5"/></svg>',
  trash: '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
  right: '<svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 5l7 7-7 7"/></svg>',
  down: '<svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 9l7 7 7-7"/></svg>',
  check: '<svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12"><path d="M2 6.5l2.5 2.5L10 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  tag: '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 12V4.5A1.5 1.5 0 0 1 4.5 3H12l9 9-9 9z"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/></svg>',
  reset: '<svg aria-hidden="true" width="20" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v4h4"/></svg>',
  library: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2h8.5A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z"/></svg>',
  store: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 19h16"/></svg>',
  theme: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/></svg>',
  info: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.01"/></svg>',
};

const S = {
  api: null, version: '', theme: 'system', welcomed: false,
  lib: null, byId: {},
  favs: { root: [], groups: [] }, favItems: {}, tags: [], tagMap: {},
  menu: { options: { enabled: true, folders: true, shortcuts: true, background: true }, installed: false, error: null },
  startFolder: '', places: [], pick: null, store: '', limits: { top: 12, group: 16 },
  view: 'library', filter: 'all', query: '', selected: null, big: {},
  tagEdit: null, tree: null, checked: new Set(), includeSub: false, busy: false, lastResult: null,
};

// ------------------------------------------------------------------ helpers

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const baseName = (p) => { const s = String(p).replace(/[\\/]+$/, ''); const i = Math.max(s.lastIndexOf('\\'), s.lastIndexOf('/')); return (i >= 0 ? s.slice(i + 1) : s) || s; };
const newId = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

let toastTimer = null;
function toast(msg, ms = 3800) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}

function errText(e) {
  const m = (e && (e.message || e.toString())) || 'Something went wrong';
  return m.replace(/^Error:\s*/, '');
}

async function call(name, ...args) {
  try {
    return await S.api[name](...args);
  } catch (e) {
    toast(errText(e), 6000);
    throw e;
  }
}

function icon(id) {
  if (S.byId[id]) return S.byId[id];
  const f = S.favItems[id];
  if (f) return { id, label: f.label, file: f.file, thumb: f.thumb, colour: 'other' };
  return null;
}

const allFavs = () => S.favs.root.concat(...S.favs.groups.map((g) => g.items));
const isFav = (id) => allFavs().includes(id);
const topCount = () => S.favs.groups.length + S.favs.root.length;
const groupOf = (id) => S.favs.groups.find((g) => g.items.includes(id)) || null;

function applyTheme() {
  const dark = S.theme === 'dark' || (S.theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
}

// ------------------------------------------------------------------ data changes

function setLibrary(lib) {
  S.lib = lib;
  S.byId = {};
  if (lib) lib.icons.forEach((i) => { S.byId[i.id] = i; });
  if (S.selected && !icon(S.selected)) S.selected = null;
  if (!S.selected && lib && lib.icons.length) S.selected = lib.icons[0].id;
  if (S.filter !== 'all' && !S.filter.startsWith('tag:') && !(lib && lib.colours.some((c) => c.id === S.filter))) S.filter = 'all';
}

async function saveFavs(next) {
  const before = S.favs;
  S.favs = next;
  renderFavParts();
  try {
    const r = await call('save_favourites', next);
    S.favs = r.favourites;
    S.favItems = r.favItems;
    S.menu = r.menu;
  } catch (e) {
    S.favs = before;
  }
  renderFavParts();
  renderStatus();
}

const cloneFavs = () => ({ root: S.favs.root.slice(), groups: S.favs.groups.map((g) => ({ id: g.id, name: g.name, items: g.items.slice() })) });
function withoutFav(f, id) {
  f.root = f.root.filter((x) => x !== id);
  f.groups.forEach((g) => { g.items = g.items.filter((x) => x !== id); });
  return f;
}

async function toggleFav(id) {
  if (isFav(id)) return saveFavs(withoutFav(cloneFavs(), id));
  if (topCount() >= S.limits.top) {
    toast(`The top of the right-click menu is full (${S.limits.top} entries). Put some favourites into a menu folder first.`);
    return;
  }
  const f = cloneFavs();
  f.root.push(id);
  return saveFavs(f);
}

async function moveFav(id, gid) {
  const f = withoutFav(cloneFavs(), id);
  if (gid) {
    const g = f.groups.find((x) => x.id === gid);
    if (!g) return;
    if (g.items.length >= S.limits.group) { toast(`A menu folder holds up to ${S.limits.group} icons.`); return; }
    g.items.push(id);
  } else {
    if (f.groups.length + f.root.length >= S.limits.top) { toast('The top of the right-click menu is full. Remove something there first.'); return; }
    f.root.push(id);
  }
  return saveFavs(f);
}

async function addGroup() {
  if (topCount() >= S.limits.top) { toast('The top of the right-click menu is full. Remove something there first.'); return null; }
  const f = cloneFavs();
  const g = { id: newId('g'), name: 'New folder', items: [] };
  f.groups.push(g);
  const saving = saveFavs(f);          // the new folder is drawn straight away; focus its name now
  const input = document.querySelector(`input[data-gid="${CSS.escape(g.id)}"]`);
  if (input) { input.focus(); input.select(); }
  await saving;
  return g.id;
}

async function renameGroup(gid, name) {
  const f = cloneFavs();
  const g = f.groups.find((x) => x.id === gid);
  if (!g) return;
  g.name = name.trim() || 'Folder';
  return saveFavs(f);
}

async function deleteGroup(gid) {
  const f = cloneFavs();
  const g = f.groups.find((x) => x.id === gid);
  if (!g) return;
  if (f.groups.length - 1 + f.root.length + g.items.length > S.limits.top) {
    toast('There is not enough room at the top of the menu for this folder\'s icons. Move or remove some first.');
    return;
  }
  f.groups = f.groups.filter((x) => x.id !== gid);
  f.root = f.root.concat(g.items);
  return saveFavs(f);
}

async function saveTags() {
  try { await call('save_tags', S.tags, S.tagMap); } catch (e) { /* toast shown */ }
}

async function addTag(name) {
  name = (name || '').trim();
  if (!name) return null;
  const same = S.tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
  if (same) { S.filter = 'tag:' + same.id; S.tagEdit = null; renderChips(); renderGrid(); return same.id; }
  const t = { id: newId('t'), name: name.slice(0, 40) };
  S.tags.push(t);
  S.filter = 'tag:' + t.id;
  S.tagEdit = null;
  renderChips(); renderGrid(); renderAside();
  await saveTags();
  return t.id;
}

async function renameTag(id, name) {
  const t = S.tags.find((x) => x.id === id);
  name = (name || '').trim();
  S.tagEdit = null;
  if (t && name) t.name = name.slice(0, 40);
  renderChips(); renderAside();
  await saveTags();
}

async function deleteTag(id) {
  S.tags = S.tags.filter((t) => t.id !== id);
  Object.keys(S.tagMap).forEach((k) => {
    S.tagMap[k] = S.tagMap[k].filter((x) => x !== id);
    if (!S.tagMap[k].length) delete S.tagMap[k];
  });
  if (S.filter === 'tag:' + id) S.filter = 'all';
  renderChips(); renderGrid(); renderAside();
  await saveTags();
}

async function toggleTag(iconId, tagId) {
  const list = (S.tagMap[iconId] || []).slice();
  const i = list.indexOf(tagId);
  if (i >= 0) list.splice(i, 1); else list.push(tagId);
  if (list.length) S.tagMap[iconId] = list; else delete S.tagMap[iconId];
  renderAside();
  if (S.filter === 'tag:' + tagId) renderGrid();
  await saveTags();
}

async function setMenu(options) {
  try {
    S.menu = await call('set_menu', options);
  } catch (e) { /* toast shown */ }
  renderContent();
  renderStatus();
}

// ------------------------------------------------------------------ views

function show(view) {
  S.view = view;
  if (view === 'apply' && !S.tree) setStart(S.startFolder);
  renderAll();
}

function renderAll() {
  applyTheme();
  const app = $('#app');
  if (S.view === 'welcome') {
    app.innerHTML = `<div class="shell"><div class="content" id="content"></div></div>${statusHTML()}`;
  } else {
    app.innerHTML = `<div class="shell">${navHTML()}<div class="content" id="content"></div></div>${statusHTML()}`;
  }
  renderContent();
}

function navHTML() {
  const b = (view, svg, label, extra = '') => `<button type="button" class="navbtn${S.view === view ? ' on' : ''}" data-action="nav" data-view="${view}" title="${label}"${S.view === view ? ' aria-current="page"' : ''}>${svg}<span class="label">${label}</span>${extra}</button>`;
  return `<nav class="nav" aria-label="Main">
    ${b('library', SVG.grid, 'Library')}
    ${b('favourites', SVG.star(false, 18), 'Favourites', `<span class="count">${allFavs().length}</span>`)}
    ${b('apply', SVG.apply, 'Folders & shortcuts')}
    ${b('menu', SVG.menu, 'Right-click menu')}
    <div class="grow"></div>
    ${b('settings', SVG.gear, 'Settings')}
  </nav>`;
}

function statusHTML() {
  const on = S.menu.installed;
  const text = S.menu.error ? 'Right-click menu: ' + S.menu.error : on ? 'Right-click menu is on' : 'Right-click menu is off';
  return `<div class="status" id="status"><span style="display:flex;align-items:center;gap:6px"><span class="dot ${on ? 'on' : 'off'}"></span>${esc(text)}</span><span>No admin rights needed</span><span style="margin-left:auto">NiSH Icons ${esc(S.version)}</span></div>`;
}

function renderStatus() {
  const s = $('#status');
  if (s) s.outerHTML = statusHTML();
  const nav = $('.nav');
  if (nav) nav.outerHTML = navHTML();
}

function renderContent() {
  const c = $('#content');
  if (!c) return;
  if (S.view === 'library' || S.view === 'favourites') {
    c.innerHTML = libraryHTML() + '<aside class="aside" id="aside" aria-label="Selected icon and right-click menu"></aside>';
    renderChips(); renderGrid(); renderAside();
  } else if (S.view === 'apply') {
    c.innerHTML = applyHTML();
    renderTree();
  } else if (S.view === 'menu') {
    c.innerHTML = menuHTML();
  } else if (S.view === 'settings') {
    c.innerHTML = settingsHTML();
  } else if (S.view === 'welcome') {
    c.innerHTML = welcomeHTML();
  }
}

function pickBannerHTML() {
  if (!S.pick) return '';
  const sel = S.selected && icon(S.selected);
  return `<div class="banner" role="region" aria-label="Choosing an icon">
    <img src="${esc(sel ? sel.thumb : '')}" alt="" width="32" height="32" style="${sel ? '' : 'visibility:hidden'}">
    <div class="grow"><strong>Choose an icon for “${esc(S.pick.name)}”</strong><div class="small muted">${esc(S.pick.path)}</div></div>
    <button type="button" class="btn primary" data-action="pick-apply"${sel ? '' : ' disabled'}>Use this icon</button>
    <button type="button" class="btn" data-action="close">Cancel</button>
  </div>`;
}

function libraryHTML() {
  const heading = S.view === 'favourites' ? 'Favourites' : 'Library';
  if (!S.lib) {
    return `<main class="main" id="main">${pickBannerHTML()}<h1>${heading}</h1>
      <div class="dashed"><p style="margin-bottom:12px">Choose the folder that holds your .ico files.</p>
      <button type="button" class="btn primary" data-action="choose-library">Choose icon library…</button></div>
      ${S.view === 'favourites' ? '<div class="grid" id="grid"></div>' : '<div id="grid" hidden></div>'}<div id="chips" hidden></div><p id="empty" hidden></p></main>`;
  }
  return `<main class="main" id="main">
    ${pickBannerHTML()}
    <div style="display:flex;flex-wrap:wrap;align-items:flex-end;gap:12px 16px">
      <div style="flex:1;min-width:0"><h1>${heading}</h1>
        <p class="small muted" style="margin-top:4px;overflow-wrap:anywhere">${esc(S.lib.root)} · ${plural(S.lib.icons.length, 'icon', 'icons')}${S.lib.unreadable ? ` · ${S.lib.unreadable} could not be read` : ''}</p></div>
      <button type="button" class="btn" data-action="choose-library">${SVG.folder(16)}Change library</button>
    </div>
    <div class="toolbar">
      <div class="search"><label for="search" class="sr">Search icons</label>${SVG.search}
        <input id="search" class="field" type="search" placeholder="Search icons" value="${esc(S.query)}" data-action="search" autocomplete="off"></div>
      <div class="chips" id="chips" role="group" aria-label="Filter by colour or tag"></div>
    </div>
    <p class="empty" id="empty" hidden></p>
    <div class="grid" id="grid"></div>
  </main>`;
}

function renderChips() {
  const box = $('#chips');
  if (!box || !S.lib) return;
  const chip = (id, label, inner) => `<button type="button" class="chip" data-action="filter" data-filter="${esc(id)}" aria-pressed="${S.filter === id}">${inner}${esc(label)}</button>`;
  let h = chip('all', 'All', '');
  S.lib.colours.forEach((c) => { h += chip(c.id, c.label, `<span class="swatch" style="background:${esc(c.dot)}"></span>`); });
  S.tags.forEach((t) => { h += chip('tag:' + t.id, t.name, SVG.tag); });
  const te = S.tagEdit;
  if (te) {
    h += `<span class="tagform"><label for="tagname" class="sr">${te.mode === 'add' ? 'Name of the new tag' : 'New name for the tag'}</label>
      <input id="tagname" class="field" type="text" maxlength="40" placeholder="Tag name" value="${esc(te.name || '')}" data-action="tagname">
      <button type="button" class="btn primary" data-action="tag-save">${te.mode === 'add' ? 'Add' : 'Rename'}</button>
      <button type="button" class="iconbtn" data-action="tag-cancel" aria-label="Cancel">${SVG.x}</button></span>`;
  } else {
    h += `<button type="button" class="chip add" data-action="tag-new">${SVG.plus}New tag</button>`;
    if (S.filter.startsWith('tag:')) {
      const id = S.filter.slice(4);
      h += `<button type="button" class="btn" data-action="tag-rename" data-tag="${esc(id)}">Rename tag</button>
            <button type="button" class="btn" data-action="tag-delete" data-tag="${esc(id)}">Delete tag</button>`;
    }
  }
  box.innerHTML = h;
  if (te) { const i = $('#tagname'); if (i) { i.focus(); i.select(); } }
}

function visibleIcons() {
  let list = S.view === 'favourites' ? allFavs().map(icon).filter(Boolean) : (S.lib ? S.lib.icons : []);
  if (S.filter.startsWith('tag:')) {
    const t = S.filter.slice(4);
    list = list.filter((i) => (S.tagMap[i.id] || []).includes(t));
  } else if (S.filter !== 'all') {
    list = list.filter((i) => i.colour === S.filter);
  }
  const q = S.query.trim().toLowerCase();
  if (q) list = list.filter((i) => i.label.toLowerCase().includes(q) || (i.file || '').toLowerCase().includes(q));
  return list;
}

function tileHTML(i) {
  const fav = isFav(i.id);
  return `<div class="tile" data-id="${esc(i.id)}">
    <button type="button" class="pick" data-action="select" data-id="${esc(i.id)}" aria-pressed="${S.selected === i.id}" title="${esc(i.file || i.label)}">
      <img src="${esc(i.thumb)}" alt=""><span class="name">${esc(i.label)}</span></button>
    <button type="button" class="star${fav ? ' on' : ''}" data-action="star" data-id="${esc(i.id)}" aria-pressed="${fav}" aria-label="${fav ? 'Remove ' + esc(i.label) + ' from favourites' : 'Add ' + esc(i.label) + ' to favourites'}">${SVG.star(fav)}</button>
  </div>`;
}

function renderGrid() {
  const grid = $('#grid');
  const empty = $('#empty');
  if (!grid) return;
  const list = visibleIcons();
  grid.innerHTML = list.map(tileHTML).join('');
  if (empty) {
    let msg = '';
    if (!list.length) {
      if (S.view === 'favourites' && !allFavs().length) msg = 'No favourites yet. Click the star on an icon in the Library to add it.';
      else if (S.filter.startsWith('tag:') && !S.query) msg = 'No icons have this tag yet. Select an icon and tick the tag on the right.';
      else msg = 'No icons match your search.';
    }
    empty.textContent = msg;
    empty.hidden = !msg;
  }
}

function renderFavParts() {
  // star states in the grid, the aside, nav count
  if ($('#grid')) {
    if (S.view === 'favourites') renderGrid();
    else document.querySelectorAll('#grid .star').forEach((b) => {
      const on = isFav(b.dataset.id);
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on);
      b.innerHTML = SVG.star(on);
    });
  }
  renderAside();
  const c = $('.nav .navbtn[data-view="favourites"] .count');
  if (c) c.textContent = allFavs().length;
  if (S.view === 'menu') renderContent();
}

function selectIcon(id) {
  S.selected = id;
  document.querySelectorAll('#grid .pick').forEach((b) => b.setAttribute('aria-pressed', b.dataset.id === id));
  renderAside();
  if (S.pick) {
    const banner = $('.banner');
    if (banner) banner.outerHTML = pickBannerHTML();
  }
}

function loadBig(id) {
  if (S.big[id] !== undefined) return;
  S.big[id] = null;
  S.api.preview(id).then((url) => {
    S.big[id] = url || null;
    if (S.selected === id && url) document.querySelectorAll('img[data-big]').forEach((im) => { im.src = url; });
  }).catch(() => {});
}

function favRowHTML(id, loose) {
  const i = icon(id);
  if (!i) return '';
  return `<div class="favrow${loose ? ' loose' : ''}${S.selected === id ? ' on' : ''}">
    <button type="button" class="open" data-action="select" data-id="${esc(id)}"><img src="${esc(i.thumb)}" alt=""><span class="t">${esc(i.label)}</span></button>
    <button type="button" class="iconbtn" data-action="unfav" data-id="${esc(id)}" aria-label="Remove ${esc(i.label)} from favourites">${SVG.x}</button></div>`;
}

function renderAside() {
  const aside = $('#aside');
  if (!aside) return;
  const id = S.selected;
  const i = id && icon(id);
  let h = '';
  if (!i) {
    h += '<section class="card"><p class="muted">Click an icon to see it here.</p></section>';
  } else {
    const fav = isFav(id);
    loadBig(id);
    const big = S.big[id] || i.thumb;
    const myTags = S.tagMap[id] || [];
    const grp = groupOf(id);
    h += `<section class="card selected" aria-label="Selected icon">
      <img class="big" data-big src="${esc(big)}" alt="${esc(i.label)}">
      <div class="sizes" aria-hidden="true">${[16, 24, 32, 48].map((s) => `<img src="${esc(i.thumb)}" alt="" width="${s}" height="${s}">`).join('')}</div>
      <div style="text-align:center"><h2 style="font-size:16px;line-height:22px">${esc(i.label)}</h2><p class="small muted">${esc(i.file || '')}</p></div>
      <div class="actions">
        ${S.pick
          ? `<button type="button" class="btn primary wide" data-action="pick-apply">Use for “${esc(S.pick.name)}”</button>`
          : '<button type="button" class="btn primary wide" data-action="nav" data-view="apply">Apply to folders & shortcuts…</button>'}
        <button type="button" class="btn wide" data-action="star" data-id="${esc(id)}">${fav ? 'Remove from favourites' : 'Add to favourites'}</button>
      </div>
      <div class="sub"><span class="label">Tags</span>
        ${S.tags.length
          ? `<div class="chips" role="group" aria-label="Tags on this icon">${S.tags.map((t) => {
              const on = myTags.includes(t.id);
              return `<button type="button" class="chip small" data-action="tag-toggle" data-tag="${esc(t.id)}" aria-pressed="${on}">${on ? SVG.check : ''}${esc(t.name)}</button>`;
            }).join('')}</div>`
          : '<p class="small muted">Make your own tags with “New tag” above the icons.</p>'}
      </div>
      ${fav ? `<div class="sub"><span class="label">Menu folder</span><div class="chips" role="group" aria-label="Menu folder for this icon">
        <button type="button" class="chip small" data-action="move" data-gid="" aria-pressed="${!grp}">No folder</button>
        ${S.favs.groups.map((g) => `<button type="button" class="chip small" data-action="move" data-gid="${esc(g.id)}" aria-pressed="${grp && grp.id === g.id ? 'true' : 'false'}">${esc(g.name)}</button>`).join('')}
        </div></div>` : ''}
    </section>`;
  }
  const n = allFavs().length;
  h += `<section class="menu-list" aria-label="Right-click menu">
    <div style="display:flex;align-items:baseline;gap:8px"><h2 style="flex:1">Right-click menu</h2><span class="small muted">${plural(n, 'favourite', 'favourites')}</span></div>
    <p class="small muted">Shown under NiSH Icons when you right-click a folder. Sort favourites into folders and click a folder name to rename it.</p>
    ${S.favs.groups.map((g) => `<div class="group">
      <div class="group-head">${SVG.folder(16)}
        <input type="text" class="rename" maxlength="60" value="${esc(g.name)}" data-action="rename-group" data-gid="${esc(g.id)}" aria-label="Rename menu folder ${esc(g.name)}">
        <span class="small muted">${g.items.length}</span>
        <button type="button" class="iconbtn" data-action="delete-group" data-gid="${esc(g.id)}" aria-label="Delete menu folder ${esc(g.name)} (its icons stay as favourites)">${SVG.trash}</button></div>
      ${g.items.map((x) => favRowHTML(x, false)).join('')}
      ${g.items.length ? '' : '<p class="small muted" style="padding:0 0 6px 36px">Empty: select a favourite and pick this folder.</p>'}
    </div>`).join('')}
    <div style="display:flex;flex-direction:column;gap:4px">${S.favs.root.map((x) => favRowHTML(x, true)).join('')}</div>
    ${n ? '' : '<p class="dashed">Click the star on an icon to add it here.</p>'}
    ${topCount() >= S.limits.top ? `<p class="small warn">The top of the menu is full (${S.limits.top} entries). Put favourites into folders to make room.</p>` : ''}
    <button type="button" class="btn" style="align-self:flex-start" data-action="add-group">${SVG.plus}New menu folder</button>
  </section>`;
  // Keep a folder name that is being typed when the panel is redrawn underneath it.
  const ae = document.activeElement;
  const keep = ae && aside.contains(ae) && ae.dataset.action === 'rename-group'
    ? { gid: ae.dataset.gid, value: ae.value, s: ae.selectionStart, e: ae.selectionEnd } : null;
  const top = aside.scrollTop;
  aside.innerHTML = h;
  aside.scrollTop = top;
  if (keep) {
    const i = aside.querySelector(`input[data-gid="${CSS.escape(keep.gid)}"]`);
    if (i) { i.value = keep.value; i.focus(); i.setSelectionRange(keep.s, keep.e); }
  }
}

// ------------------------------------------------------------------ apply view

function applyHTML() {
  const i = S.selected && icon(S.selected);
  const favIcons = allFavs().map(icon).filter(Boolean);
  return `<main class="main" id="main">
    ${pickBannerHTML()}
    <h1>Apply to folders & shortcuts</h1>
    <div class="apply">
      <div class="left">
        <div class="card selected">
          ${i ? `<img class="big" data-big src="${esc(S.big[i.id] || i.thumb)}" alt="${esc(i.label)}"><strong>${esc(i.label)}</strong>
                 <button type="button" class="btn" data-action="nav" data-view="library">Choose another icon</button>`
              : '<p class="muted" style="text-align:center">No icon chosen yet.</p><button type="button" class="btn primary" data-action="nav" data-view="library">Choose an icon</button>'}
        </div>
        ${favIcons.length ? `<div><p class="small muted" style="margin-bottom:6px">Or use a favourite:</p><div class="chips">${favIcons.map((f) => `<button type="button" class="iconbtn" style="width:40px;height:40px" data-action="use-fav" data-id="${esc(f.id)}" aria-label="Use ${esc(f.label)}" aria-pressed="${S.selected === f.id}" title="${esc(f.label)}"><img src="${esc(f.thumb)}" alt="" width="28" height="28"></button>`).join('')}</div></div>` : ''}
        <p class="small muted">Tick folders and shortcuts on the right. Shortcuts are listed under their folder — try Desktop or Start menu. Only things you are allowed to change are changed, so nothing needs admin rights.</p>
      </div>
      <div class="right">
        <div style="display:flex;align-items:center;gap:12px"><span class="small muted" style="flex:1;min-width:0;overflow-wrap:anywhere">Start at: ${esc(S.tree ? S.tree.root : S.startFolder)}</span>
          <button type="button" class="btn" data-action="browse-start">Browse…</button></div>
        <div class="places">${S.places.map((p) => `<button type="button" class="chip small" data-action="start-at" data-path="${esc(p.path)}" aria-pressed="${S.tree && S.tree.root === p.path}">${esc(p.name)}</button>`).join('')}</div>
        <div class="tree" id="tree" role="tree" aria-label="Folders and shortcuts"></div>
        <label class="check" style="display:flex;align-items:center;gap:10px;font-size:13px;min-height:32px"><input type="checkbox" data-action="include-sub"${S.includeSub ? ' checked' : ''}> Also change every folder inside the ticked folders</label>
        <div class="footer"><span class="grow small muted" id="tickcount"></span>
          <button type="button" class="btn" data-action="reset-ticked">Reset to default</button>
          <button type="button" class="btn primary" data-action="apply-ticked"${i ? '' : ' disabled'}>Apply</button></div>
      </div>
    </div>
  </main>`;
}

function newNode(k) {
  return { kind: k.kind || 'folder', name: k.name, path: k.path, hasChildren: k.hasChildren, custom: k.custom, open: false, loaded: false, children: [] };
}

async function loadNode(path) {
  const n = S.tree.nodes[path];
  if (!n || n.loaded) return;
  const kids = await call('list_folders', path);
  n.children = kids.map((k) => k.path);
  n.hasChildren = kids.length > 0;
  kids.forEach((k) => { if (!S.tree.nodes[k.path]) S.tree.nodes[k.path] = newNode(k); });
  n.loaded = true;
}

async function setStart(path) {
  if (!path) return;
  S.startFolder = path;
  S.checked = new Set();
  S.tree = { root: path, nodes: { [path]: { name: baseName(path), path, hasChildren: true, custom: false, open: true, loaded: false, children: [] } } };
  S.api.set_pref('start_folder', path).catch(() => {});
  try { await loadNode(path); } catch (e) { /* toast shown */ }
  if (S.view === 'apply') renderContent();
}

function nodeHTML(path, depth) {
  const n = S.tree.nodes[path];
  if (!n) return '';
  const ticked = S.checked.has(path);
  let h = `<div class="node${ticked ? ' ticked' : ''}" role="treeitem"${n.hasChildren ? ` aria-expanded="${n.open}"` : ''} style="padding-left:${depth * 20 + 4}px">
    ${n.hasChildren ? `<button type="button" class="tw" data-action="twist" data-path="${esc(path)}" aria-label="${n.open ? 'Collapse' : 'Expand'} ${esc(n.name)}">${n.open ? SVG.down : SVG.right}</button>` : '<span class="spacer"></span>'}
    <label><input type="checkbox" data-action="tick" data-path="${esc(path)}"${ticked ? ' checked' : ''}>${n.kind === 'shortcut' ? SVG.shortcut(18) : SVG.folder(18)}<span>${esc(n.name)}</span>${n.kind === 'shortcut' ? '<span class="kind small muted">Shortcut</span>' : ''}</label>
    ${n.custom ? '<span class="badge">has an icon</span>' : ''}</div>`;
  if (n.open) h += n.children.map((c) => nodeHTML(c, depth + 1)).join('');
  return h;
}

function tickedKinds(paths = [...S.checked]) {
  let folders = 0, shortcuts = 0;
  paths.forEach((p) => { const n = S.tree && S.tree.nodes[p]; if ((n && n.kind === 'shortcut') || /\.lnk$/i.test(p)) shortcuts++; else folders++; });
  return { folders, shortcuts };
}

function tickedText(paths) {
  const k = tickedKinds(paths);
  const parts = [];
  if (k.folders) parts.push(plural(k.folders, 'folder', 'folders'));
  if (k.shortcuts) parts.push(plural(k.shortcuts, 'shortcut', 'shortcuts'));
  return parts.join(' and ');
}

function thingWord(n, targets) {
  const k = tickedKinds(targets);
  if (k.shortcuts && !k.folders) return plural(n, 'shortcut', 'shortcuts');
  if (k.shortcuts) return n === 1 ? '1 item' : `${n} items`;
  return plural(n, 'folder', 'folders');
}

function renderTree() {
  const t = $('#tree');
  if (!t || !S.tree) return;
  const top = $('#tree').scrollTop;
  t.innerHTML = nodeHTML(S.tree.root, 0);
  t.scrollTop = top;
  const c = $('#tickcount');
  if (c) c.textContent = S.checked.size ? tickedText() + ' ticked' + (S.includeSub && tickedKinds().folders ? ', plus every folder inside' : '') : 'Nothing ticked';
}

async function toggleTwist(path) {
  const n = S.tree.nodes[path];
  if (!n) return;
  n.open = !n.open;
  if (n.open && !n.loaded) { try { await loadNode(path); } catch (e) { n.open = false; } }
  renderTree();
}

function report(r, verb, targets) {
  S.lastResult = r;
  if (!r.failed.length) toast(`${verb} ${thingWord(r.done, targets)}. If Explorer still shows the old icon, press F5.`);
  else toast(`${verb} ${thingWord(r.done, targets)}, ${r.failed.length} could not be changed: ${r.failed[0].error} (${baseName(r.failed[0].path)})`, 8000);
  const bad = new Set(r.failed.map((f) => f.path));
  return bad;
}

async function applyTicked() {
  if (!S.selected) { toast('Choose an icon first.'); return null; }
  if (!S.checked.size) { toast('Tick at least one folder or shortcut.'); return null; }
  S.busy = true;
  try {
    const targets = [...S.checked];
    const r = await call('apply', S.selected, targets, S.includeSub);
    const bad = report(r, 'Icon applied to', targets);
    targets.forEach((p) => { if (!bad.has(p) && S.tree.nodes[p]) S.tree.nodes[p].custom = true; });
    renderTree();
    return r;
  } catch (e) { return null; } finally { S.busy = false; }
}

async function resetTicked() {
  if (!S.checked.size) { toast('Tick what you want to reset.'); return null; }
  try {
    const targets = [...S.checked];
    const r = await call('reset', targets, S.includeSub);
    const bad = report(r, 'Default icon back on', targets);
    targets.forEach((p) => { if (!bad.has(p) && S.tree.nodes[p]) S.tree.nodes[p].custom = false; });
    renderTree();
    return r;
  } catch (e) { return null; }
}

async function pickApply() {
  if (!S.pick || !S.selected) return;
  try {
    const r = await call('apply', S.selected, [S.pick.path], false);
    if (r.failed.length) { toast(`Could not change “${S.pick.name}”: ${r.failed[0].error}`, 8000); return; }
    toast(`Done. “${S.pick.name}” has its new icon.`);
    setTimeout(() => S.api.close().catch(() => {}), 1200);
  } catch (e) { /* toast shown */ }
}

// ------------------------------------------------------------------ menu, settings, welcome

function ctxItem(img, label, extra = '', hl = false) {
  return `<div class="it${hl ? ' hl' : ''}">${img}<span class="t">${esc(label)}</span>${extra}</div>`;
}

function menuPreviewHTML() {
  const img = (id) => { const i = icon(id); return i ? `<img src="${esc(i.thumb)}" alt="">` : '<span style="width:20px"></span>'; };
  const groups = S.favs.groups.filter((g) => g.items.length);
  let sub = '';
  groups.forEach((g, n) => { sub += ctxItem(SVG.folder(20), g.name, SVG.right, n === 0); });
  S.favs.root.forEach((id) => { const i = icon(id); if (i) sub += ctxItem(img(id), i.label); });
  if (!groups.length && !S.favs.root.length) sub += '<div class="head">No favourites yet</div>';
  sub += '<div class="sep"></div>' + ctxItem(SVG.reset, 'Reset to default icon') + ctxItem(SVG.grid, allFavs().length ? 'More icons…' : 'Choose an icon…');
  let third = '';
  if (groups.length) {
    third = `<div class="ctx" aria-label="${esc(groups[0].name)}">${groups[0].items.map((id) => { const i = icon(id); return i ? ctxItem(img(id), i.label) : ''; }).join('')}</div>`;
  }
  return `<div class="preview" aria-label="Preview of the right-click menu">
    <div class="ctx">${ctxItem('<span style="width:20px"></span>', 'Open')}${ctxItem('<span style="width:20px"></span>', 'Open in new window')}<div class="sep"></div>
      ${ctxItem('<img src="assets/icon-32.png" alt="">', 'NiSH Icons', SVG.right, true)}<div class="sep"></div>${ctxItem('<span style="width:20px"></span>', 'Properties')}</div>
    <div class="ctx">${sub}</div>${third}</div>`;
}

function menuHTML() {
  const o = S.menu.options;
  const status = S.menu.error ? `<span class="warn">${esc(S.menu.error)}</span>` : (S.menu.installed ? 'Added to your right-click menu, for your Windows account only.' : 'Not in your right-click menu right now.');
  const opt = (key, label) => `<label class="check"><input type="checkbox" data-action="menu-opt" data-opt="${key}"${o[key] ? ' checked' : ''}${o.enabled ? '' : ' disabled'}>${label}</label>`;
  return `<main class="main" id="main"><div class="page">
    <h1>Right-click menu</h1>
    <p class="muted" style="margin:4px 0 8px">Right-click a folder in File Explorer and choose <strong>NiSH Icons</strong> to give it one of your favourites.</p>
    <div class="row">${SVG.menu}<div class="grow"><div id="menuOn">Show NiSH Icons when I right-click</div><div class="small muted">${status}</div></div>
      <span class="small">${o.enabled ? 'On' : 'Off'}</span>
      <button type="button" class="switch" role="switch" aria-checked="${!!o.enabled}" aria-labelledby="menuOn" data-action="menu-toggle"></button></div>
    <div class="row indent"><span>Show it on</span>${opt('folders', 'Folders')}${opt('shortcuts', 'Shortcuts (.lnk)')}${opt('background', 'Inside a folder (blank space)')}</div>
    <h2>Preview</h2>
    ${menuPreviewHTML()}
    <div style="display:flex;gap:8px;margin:8px 0 16px"><button type="button" class="btn" data-action="nav" data-view="library">Edit favourites and menu folders</button></div>
    <p class="note"><strong>Windows 11:</strong> the entry is in the classic menu — click <em>Show more options</em> or hold Shift while you right-click. The short new menu only accepts signed app packages, and those need admin rights to install.</p>
    <p class="note" style="margin-top:8px"><strong>Files:</strong> Windows gives every file of the same type the same icon, so the menu works on folders and on shortcuts (.lnk), which can each have their own icon.</p>
  </div></main>`;
}

function settingsHTML() {
  const lib = S.lib;
  return `<main class="main" id="main"><div class="page">
    <h1>Settings</h1>
    <h2>Icons</h2>
    <div class="row">${SVG.library}<div class="grow"><div>Icon library</div><div class="small muted">${lib ? esc(lib.root) + ' · ' + plural(lib.icons.length, 'icon', 'icons') : 'Not chosen yet'}</div></div>
      ${lib ? '<button type="button" class="btn" data-action="rescan">Look for new icons</button>' : ''}
      <button type="button" class="btn" data-action="choose-library">Change…</button></div>
    <div class="row">${SVG.store}<div class="grow"><div>Where chosen icons are kept</div><div class="small muted">${esc(S.store)} — folders keep their icon even if the library moves</div></div>
      <button type="button" class="btn" data-action="open-store">Open folder</button></div>
    <h2>Right-click menu</h2>
    <div class="row">${SVG.menu}<div class="grow"><div>NiSH Icons in the right-click menu</div><div class="small muted">${S.menu.installed ? 'On' : 'Off'}${S.menu.error ? ' — ' + esc(S.menu.error) : ''}</div></div>
      <button type="button" class="btn" data-action="nav" data-view="menu">Open</button></div>
    <h2>App</h2>
    <div class="row">${SVG.theme}<label for="theme" class="grow">Theme</label>
      <select id="theme" class="field" data-action="theme" style="min-width:180px">
        <option value="system"${S.theme === 'system' ? ' selected' : ''}>Use Windows setting</option>
        <option value="light"${S.theme === 'light' ? ' selected' : ''}>Light</option>
        <option value="dark"${S.theme === 'dark' ? ' selected' : ''}>Dark</option></select></div>
    <div class="row">${SVG.info}<div class="grow"><div>NiSH Icons ${esc(S.version)}</div><div class="small muted">Folder icons from your own library — no admin rights needed.</div></div></div>
    <div class="row">${SVG.trash}<div class="grow"><div>Remove NiSH Icons from this PC</div><div class="small muted">Removes the right-click menu and settings. Icons you already set stay until you reset them.</div></div>
      <button type="button" class="btn danger" data-action="remove">Remove…</button></div>
  </div></main>`;
}

function welcomeHTML() {
  const lib = S.lib;
  const hero = lib ? lib.icons.slice(0, 5) : [];
  const sizes = [48, 56, 72, 56, 48];
  const o = S.menu.options;
  return `<div class="welcome">
    <div class="hero" aria-hidden="true">${hero.length ? hero.map((i, n) => `<img src="${esc(i.thumb)}" alt="" width="${sizes[n]}" height="${sizes[n]}">`).join('') : '<img src="assets/icon-128.png" alt="" width="72" height="72">'}</div>
    <div style="text-align:center"><h1>Welcome to NiSH Icons</h1>
      <p class="muted" style="margin-top:6px">Give your folders their own icons, straight from the right-click menu. No admin rights needed.</p></div>
    <ol>
      <li><span class="step${lib ? ' done' : ''}">${lib ? SVG.check : '1'}</span>
        <div style="flex:1;min-width:0"><strong>Choose your icon library</strong>
          <p class="small muted" style="margin-top:2px;overflow-wrap:anywhere">${lib ? esc(lib.root) + ' · ' + plural(lib.icons.length, 'icon', 'icons') : 'A folder with .ico files — sub-folders are included.'}</p></div>
        <button type="button" class="btn${lib ? '' : ' primary'}" data-action="choose-library">${lib ? 'Change…' : 'Browse…'}</button></li>
      <li><span class="step">2</span><div style="flex:1"><strong>Star your favourites</strong>
          <p class="small muted" style="margin-top:2px">They are what you see when you right-click a folder. Sort them into menu folders if you like.</p></div>
        <span style="color:var(--star)">${SVG.star(true, 22)}</span></li>
      <li><span class="step">3</span><div style="flex:1"><strong id="wMenu">Add NiSH Icons to the right-click menu</strong>
          <p class="small muted" style="margin-top:2px">Only for your Windows account. Turn it off again any time.</p></div>
        <span class="small">${o.enabled ? 'On' : 'Off'}</span>
        <button type="button" class="switch" role="switch" aria-checked="${!!o.enabled}" aria-labelledby="wMenu" data-action="menu-toggle"></button></li>
    </ol>
    <button type="button" class="btn primary" style="min-width:200px;height:36px" data-action="get-started"${lib ? '' : ' disabled'}>Get started</button>
  </div>`;
}

function confirmRemove() {
  const root = $('#modal-root');
  root.innerHTML = `<div class="modal-back"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mTitle">
    <div class="body"><h2 id="mTitle" style="font-size:20px;line-height:28px">Remove NiSH Icons?</h2>
      <p class="muted">The right-click menu entry and the app's settings (favourites, tags, menu folders) are removed. Folders that already have an icon keep it, and the icon copies in ${esc(S.store)} stay so they keep working.</p></div>
    <div class="foot"><button type="button" class="btn" data-action="modal-close">Cancel</button><button type="button" class="btn primary" data-action="remove-confirm">Remove</button></div>
  </div></div>`;
  $('#modal-root .btn').focus();
}

async function removeEverything() {
  try { await call('remove_everything'); } catch (e) { return; }
  $('#modal-root').innerHTML = `<div class="modal-back"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mTitle">
    <div class="body"><h2 id="mTitle" style="font-size:20px;line-height:28px">NiSH Icons was removed</h2>
      <p class="muted">The right-click menu entry and the settings are gone. You can delete NiSHIcons.exe now.</p></div>
    <div class="foot"><button type="button" class="btn primary" data-action="close">Close the app</button></div></div></div>`;
}

// ------------------------------------------------------------------ events

async function onClick(e) {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const a = el.dataset.action;
  const id = el.dataset.id;
  switch (a) {
    case 'nav': show(el.dataset.view); break;
    case 'select': selectIcon(id); break;
    case 'star': await toggleFav(id); break;
    case 'unfav': await saveFavs(withoutFav(cloneFavs(), id)); break;
    case 'filter': S.filter = el.dataset.filter; S.tagEdit = null; renderChips(); renderGrid(); break;
    case 'tag-new': S.tagEdit = { mode: 'add', name: '' }; renderChips(); break;
    case 'tag-rename': { const t = S.tags.find((x) => x.id === el.dataset.tag); if (t) { S.tagEdit = { mode: 'rename', id: t.id, name: t.name }; renderChips(); } break; }
    case 'tag-delete': await deleteTag(el.dataset.tag); break;
    case 'tag-save': await saveTagEdit(); break;
    case 'tag-cancel': S.tagEdit = null; renderChips(); break;
    case 'tag-toggle': if (S.selected) await toggleTag(S.selected, el.dataset.tag); break;
    case 'move': if (S.selected) await moveFav(S.selected, el.dataset.gid || null); break;
    case 'add-group': await addGroup(); break;
    case 'delete-group': await deleteGroup(el.dataset.gid); break;
    case 'choose-library': await chooseLibrary(); break;
    case 'rescan': await rescan(); break;
    case 'use-fav': S.selected = id; renderContent(); break;
    case 'twist': await toggleTwist(el.dataset.path); break;
    case 'start-at': await setStart(el.dataset.path); break;
    case 'browse-start': { const p = await call('choose_folder', S.tree ? S.tree.root : S.startFolder).catch(() => null); if (p) await setStart(p); break; }
    case 'apply-ticked': await applyTicked(); break;
    case 'reset-ticked': await resetTicked(); break;
    case 'pick-apply': await pickApply(); break;
    case 'close': S.api.close().catch(() => {}); break;
    case 'menu-toggle': await setMenu(Object.assign({}, S.menu.options, { enabled: !S.menu.options.enabled })); break;
    case 'open-store': S.api.open_store().catch(() => {}); break;
    case 'remove': confirmRemove(); break;
    case 'remove-confirm': await removeEverything(); break;
    case 'modal-close': $('#modal-root').innerHTML = ''; break;
    case 'get-started':
      S.welcomed = true;
      S.api.set_pref('welcomed', true).catch(() => {});
      show('library');
      if (S.menu.options.enabled && !S.menu.installed) await setMenu(S.menu.options);
      break;
    default: break;
  }
}

async function onChange(e) {
  const el = e.target;
  const a = el.dataset && el.dataset.action;
  if (a === 'rename-group') await renameGroup(el.dataset.gid, el.value);
  else if (a === 'tick') {
    if (el.checked) S.checked.add(el.dataset.path); else S.checked.delete(el.dataset.path);
    renderTree();
  } else if (a === 'include-sub') { S.includeSub = el.checked; renderTree(); }
  else if (a === 'menu-opt') await setMenu(Object.assign({}, S.menu.options, { [el.dataset.opt]: el.checked }));
  else if (a === 'theme') { S.theme = el.value; applyTheme(); S.api.set_pref('theme', el.value).catch(() => {}); }
}

function onInput(e) {
  const el = e.target;
  const a = el.dataset && el.dataset.action;
  if (a === 'search') { S.query = el.value; renderGrid(); }
  else if (a === 'tagname' && S.tagEdit) S.tagEdit.name = el.value;
}

async function saveTagEdit() {
  const te = S.tagEdit;
  if (!te) return;
  if (te.mode === 'add') await addTag(te.name);
  else await renameTag(te.id, te.name);
}

async function onKey(e) {
  const el = e.target;
  const a = el.dataset && el.dataset.action;
  if (a === 'tagname') {
    if (e.key === 'Enter') { e.preventDefault(); await saveTagEdit(); }
    else if (e.key === 'Escape') { S.tagEdit = null; renderChips(); }
  } else if (a === 'rename-group' && (e.key === 'Enter' || e.key === 'Escape')) {
    e.preventDefault();
    el.blur();
  } else if (e.key === 'Escape' && $('#modal-root').innerHTML) {
    $('#modal-root').innerHTML = '';
  }
}

async function chooseLibrary() {
  let lib = null;
  try { lib = await call('choose_library'); } catch (e) { return; }
  if (!lib) return;
  setLibrary(lib);
  S.big = {};
  if (!lib.icons.length) toast('No .ico files were found in that folder.');
  renderContent();
}

async function rescan() {
  try { setLibrary(await call('rescan')); S.big = {}; renderContent(); toast('Library updated.'); } catch (e) { /* toast shown */ }
}

// ------------------------------------------------------------------ start

function getApi() {
  return new Promise((resolve) => {
    if (window.pywebview && window.pywebview.api && window.pywebview.api.init) { resolve(window.pywebview.api); return; }
    let done = false;
    window.addEventListener('pywebviewready', () => { if (!done) { done = true; resolve(window.pywebview.api); } });
    setTimeout(() => { if (!done && !window.pywebview) { done = true; resolve(window.makeMockApi()); } }, 700);
  });
}

async function start() {
  S.api = await getApi();
  const d = await S.api.init();
  S.version = d.version; S.theme = d.theme || 'system'; S.welcomed = d.welcomed;
  S.favs = d.favourites; S.favItems = d.favItems; S.tags = d.tags; S.tagMap = d.tagMap;
  S.menu = d.menu; S.startFolder = d.startFolder; S.places = d.places; S.pick = d.pick; S.store = d.store;
  S.limits = d.limits || S.limits;
  setLibrary(d.library);
  S.view = (!S.welcomed || !S.lib) && !S.pick ? 'welcome' : 'library';
  document.addEventListener('click', (e) => { onClick(e).catch(() => {}); });
  document.addEventListener('change', (e) => { onChange(e).catch(() => {}); });
  document.addEventListener('input', onInput);
  document.addEventListener('keydown', (e) => { onKey(e).catch(() => {}); });
  if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
  renderAll();
  window.NI.ready = true;
}

// ------------------------------------------------------------------ self-test (used by the build's GUI smoke test)

window.NI = {
  ready: false,
  S,
  async selfTest() {
    const steps = [];
    const step = (name, ok) => steps.push({ name, ok: !!ok });
    try {
      show('library');
      step('library shows the icons', document.querySelectorAll('#grid .tile').length === S.lib.icons.length && S.lib.icons.length >= 4);
      const search = $('#search');
      search.value = 'red'; search.dispatchEvent(new Event('input', { bubbles: true }));
      step('search finds one icon', document.querySelectorAll('#grid .tile').length === 1);
      search.value = ''; search.dispatchEvent(new Event('input', { bubbles: true }));
      const first = S.lib.icons[0].id;
      $(`#grid .pick[data-id="${CSS.escape(first)}"]`).click();
      step('clicking an icon selects it', S.selected === first && $('#aside').textContent.includes(S.lib.icons[0].label));
      await toggleFav(first);
      step('star makes a favourite (copied and saved)', isFav(first) && S.favItems[first] && S.menu);
      const gid = await addGroup();
      await renameGroup(gid, 'Smoke folder');
      await moveFav(first, gid);
      step('menu folder created, renamed and filled', S.favs.groups.length === 1 && S.favs.groups[0].name === 'Smoke folder' && S.favs.groups[0].items[0] === first);
      const second = S.lib.icons[1].id;
      await toggleFav(second);
      step('second favourite at the top of the menu', S.favs.root.includes(second));
      const tid = await addTag('Smoke tag');
      await toggleTag(first, tid);
      S.filter = 'tag:' + tid; renderGrid();
      step('own tag created and used as a filter', document.querySelectorAll('#grid .tile').length === 1);
      S.filter = 'all'; renderChips(); renderGrid();
      show('favourites');
      step('favourites view lists both', document.querySelectorAll('#grid .tile').length === 2);
      show('apply');
      await setStart(S.startFolder);
      const kids = S.tree.nodes[S.tree.root].children;
      const byName = (n) => kids.find((p) => baseName(p) === n);
      step('folder tree lists the test folders', byName('A') && byName('B') && byName('C'));
      S.selected = first;
      S.checked = new Set([byName('A')]);
      let r = await applyTicked();
      step('apply to a folder', r && r.done === 1 && !r.failed.length);
      S.checked = new Set([byName('C')]); S.includeSub = true;
      r = await applyTicked();
      step('apply to a folder and everything inside', r && r.done === 2 && !r.failed.length);
      S.includeSub = false;
      S.checked = new Set([byName('B')]);
      await applyTicked();
      r = await resetTicked();
      step('reset a folder', r && r.done === 1);
      const lnk = kids.find((p) => S.tree.nodes[p].kind === 'shortcut');
      step('folder tree lists the test shortcut', !!lnk && S.tree.nodes[lnk].name === 'Smoke shortcut' && !!document.querySelector(`[data-path="${CSS.escape(lnk)}"]`));
      S.checked = new Set([lnk]);
      r = await applyTicked();
      step('apply to a shortcut', r && r.done === 1 && !r.failed.length && S.tree.nodes[lnk].custom);
      await setMenu({ enabled: true, folders: true, shortcuts: true, background: true });
      step('right-click menu written', S.menu.installed && !S.menu.error);
      show('menu'); step('menu page shows the preview', document.querySelectorAll('.ctx').length >= 2);
      show('settings'); step('settings page', !!$('[data-action="remove"]'));
      show('welcome'); step('welcome page', !!$('[data-action="get-started"]'));
      show('library');
    } catch (err) {
      step('unexpected error: ' + errText(err), false);
    }
    window.NI_TEST = { steps };
    return steps;
  },
};

start();
