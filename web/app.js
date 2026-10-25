/* NiSH Icons - the window. Talks to Python through window.pywebview.api (see app.py).
   Opened in an ordinary browser it uses the stand-in in mock.js, for previews and tests. */
'use strict';

const SVG = {
  grid: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  star: (on, size = 16) => `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${on ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>`,
  folder: (size = 18) => `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2h8.5A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z"/></svg>`,
  shortcut: (size = 18) => `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2.5"/><rect x="5.5" y="12.5" width="6" height="6" rx="1" style="fill: var(--surface)"/><path d="M7.4 16.6l2.6-2.6M8 14h2v2"/></svg>`,
  apply: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2h8.5A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z"/><path d="M9 13l2 2 4-4" stroke-linecap="round"/></svg>',
  menu: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="12" height="14" rx="2"/><path d="M7 8h6M7 11h6M7 14h3"/><path d="M15 15l5 2-2 1-1 2z"/></svg>',
  gear: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/></svg>',
  search: '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
  x: '<svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.4"/></svg>',
  plus: '<svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.5"/></svg>',
  plusNav: '<svg aria-hidden="true" width="18" height="12" viewBox="0 0 18 12"><path d="M9 1v10M4 6h10" stroke="currentColor" stroke-width="1.5"/></svg>',
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
  save: '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/></svg>',
  grip: '<svg aria-hidden="true" width="12" height="16" viewBox="0 0 12 16" fill="currentColor"><circle cx="4" cy="3" r="1.3"/><circle cx="8" cy="3" r="1.3"/><circle cx="4" cy="8" r="1.3"/><circle cx="8" cy="8" r="1.3"/><circle cx="4" cy="13" r="1.3"/><circle cx="8" cy="13" r="1.3"/></svg>',
};

const S = {
  api: null, version: '', theme: 'system', welcomed: false,
  libraries: [], libs: {}, byId: {},
  favourites: [], menuItems: [], saved: {}, tags: [], tagMap: {},
  menu: { options: { enabled: true, folders: true, shortcuts: true, background: true }, installed: false, error: null },
  startFolder: '', places: [], pick: null, store: '', limits: { top: 12, group: 16 }, testLibrary: null,
  view: 'library', libId: null, filter: 'all', query: '', selected: null, big: {},
  tagEdit: null, askSave: null, drag: null,
  tree: null, checked: new Set(), anchor: null, includeSub: false, lastResult: null,
};

// ------------------------------------------------------------------ helpers

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const baseName = (p) => { const s = String(p).replace(/[\\/]+$/, ''); const i = Math.max(s.lastIndexOf('\\'), s.lastIndexOf('/')); return (i >= 0 ? s.slice(i + 1) : s) || s; };
const newId = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const clone = (x) => JSON.parse(JSON.stringify(x));

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

function libName(id) {
  const l = S.libraries.find((x) => x.id === id);
  return l ? l.name : '';
}

/* Which library an icon comes from (also for favourites whose library is no longer open). */
function sourceName(id) {
  return (S.saved[id] && S.saved[id].lib) || libName(String(id).split(':')[0]);
}

function icon(id) {
  if (!id) return null;
  if (S.byId[id]) return S.byId[id];
  const f = S.saved[id];
  if (f) return { id, label: f.label, file: f.file, thumb: f.thumb, colour: f.colour || 'other', lib: f.lib };
  return null;
}

const isFav = (id) => S.favourites.includes(id);
const currentLib = () => (S.libId && S.libs[S.libId]) || null;

function applyTheme() {
  const dark = S.theme === 'dark' || (S.theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
}

// ------------------------------------------------------------------ the right-click menu as data

function menuIds(entries = S.menuItems) {
  let ids = [];
  entries.forEach((e) => { ids = ids.concat(e.kind === 'group' ? e.items : [e.id]); });
  return ids;
}

function whereInMenu(id, entries = S.menuItems) {
  for (let t = 0; t < entries.length; t++) {
    const e = entries[t];
    if (e.kind === 'icon' && e.id === id) return { g: null, i: t, t };
    if (e.kind === 'group' && e.items.includes(id)) return { g: e.id, i: e.items.indexOf(id), t };
  }
  return null;
}

function without(entries, id) {
  return entries.filter((e) => !(e.kind === 'icon' && e.id === id))
    .map((e) => (e.kind === 'group' ? { kind: 'group', id: e.id, name: e.name, items: e.items.filter((x) => x !== id) } : e));
}

/* Put icon `id` into menu folder `g` (null = the top level) before position `i` (null = at the end).
   Returns the new list, or null when there is no room. */
function placed(id, g, i) {
  const cur = whereInMenu(id);
  const next = without(clone(S.menuItems), id);
  if (g) {
    const grp = next.find((e) => e.kind === 'group' && e.id === g);
    if (!grp) return null;
    if (grp.items.length >= S.limits.group && !(cur && cur.g === g)) { toast(`A menu folder holds up to ${S.limits.group} icons.`); return null; }
    grp.items.splice(i == null ? grp.items.length : Math.min(i, grp.items.length), 0, id);
  } else {
    if (next.length >= S.limits.top && !(cur && cur.g === null)) { toast(`The top of the right-click menu is full (${S.limits.top} entries). Put it in a menu folder instead.`); return null; }
    next.splice(i == null ? next.length : Math.min(i, next.length), 0, { kind: 'icon', id });
  }
  return next;
}

function movedTop(from, to) {
  const next = clone(S.menuItems);
  if (to < 0 || to >= next.length || from === to) return null;
  const [e] = next.splice(from, 1);
  next.splice(to, 0, e);
  return next;
}

// ------------------------------------------------------------------ saving

function absorb(r) {
  if (!r) return;
  if (r.favourites) S.favourites = r.favourites;
  if (r.menuItems) S.menuItems = r.menuItems;
  if (r.savedIcons) S.saved = r.savedIcons;
  if (r.menu) S.menu = r.menu;
}

async function saveMenu(next, focusGrip) {
  if (!next) return;
  const before = S.menuItems;
  S.menuItems = next;
  renderAside(focusGrip);
  try { absorb(await call('save_menu_items', next)); } catch (e) { S.menuItems = before; }
  renderAside(focusGrip);
  renderStatus();
  if (S.view === 'menu') renderContent();
}

async function saveFavs(next) {
  const before = S.favourites;
  S.favourites = next;
  renderFavParts();
  try { absorb(await call('save_favourites', next)); } catch (e) { S.favourites = before; }
  renderFavParts();
}

async function toggleFav(id) {
  return saveFavs(isFav(id) ? S.favourites.filter((x) => x !== id) : S.favourites.concat([id]));
}

async function placeInMenu(id, where) {
  if (where === 'none') return saveMenu(without(clone(S.menuItems), id));
  return saveMenu(placed(id, where === 'root' ? null : where, null));
}

async function addGroup() {
  if (S.menuItems.length >= S.limits.top) { toast(`The top of the right-click menu is full (${S.limits.top} entries). Remove something there first.`); return null; }
  const g = { kind: 'group', id: newId('g'), name: 'New folder', items: [] };
  const saving = saveMenu(S.menuItems.concat([g]));   // drawn straight away; focus its name now
  const input = document.querySelector(`input[data-gid="${CSS.escape(g.id)}"]`);
  if (input) { input.focus(); input.select(); }
  await saving;
  return g.id;
}

async function renameGroup(gid, name) {
  const next = clone(S.menuItems);
  const g = next.find((e) => e.kind === 'group' && e.id === gid);
  if (!g) return;
  g.name = name.trim() || 'Folder';
  return saveMenu(next);
}

async function deleteGroup(gid) {
  const next = [];
  S.menuItems.forEach((e) => {
    if (e.kind === 'group' && e.id === gid) e.items.forEach((id) => next.push({ kind: 'icon', id }));
    else next.push(clone(e));
  });
  if (next.length > S.limits.top) { toast('There is not enough room at the top of the menu for this folder\'s icons. Move or remove some first.'); return; }
  return saveMenu(next);
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

// ------------------------------------------------------------------ libraries

function keepLibrary(lib) {
  S.libs[lib.id] = lib;
  lib.byId = {};
  lib.icons.forEach((i) => { S.byId[i.id] = i; lib.byId[i.id] = i; });
}

async function loadLibrary(id, fresh = false) {
  if (!fresh && S.libs[id]) return S.libs[id];
  const lib = await call(fresh ? 'rescan' : 'library', id).then((r) => (fresh ? r.library : r));
  keepLibrary(lib);
  const l = S.libraries.find((x) => x.id === id);
  if (l) l.count = lib.icons.length;
  return lib;
}

async function showLibrary(id) {
  S.view = 'library';
  S.libId = id;
  if (S.filter !== 'all' && !S.filter.startsWith('tag:')) S.filter = 'all';
  renderAll();
  try {
    const lib = await loadLibrary(id);
    if (!S.selected || !icon(S.selected)) S.selected = lib.icons.length ? lib.icons[0].id : null;
  } catch (e) { /* toast shown */ }
  if (S.view === 'library' && S.libId === id) renderAll();
}

function gotLibraries(r) {
  if (!r) return null;
  if (r.libraries) S.libraries = r.libraries;
  if (r.library) keepLibrary(r.library);
  return r.library || null;
}

async function openFolder(save = false) {
  let r = null;
  try { r = await call('open_folder', save); } catch (e) { return null; }
  const lib = gotLibraries(r);
  if (!lib) return null;
  if (!lib.icons.length) toast('No .ico files were found in that folder.');
  if (S.view !== 'welcome') await showLibrary(lib.id); else renderAll();
  return lib;
}

async function openPath(path, save = false) {
  const lib = gotLibraries(await call('open_path', path, save));
  if (lib) await showLibrary(lib.id);
  return lib;
}

async function saveLibrary(id) {
  try { S.libraries = await call('save_library', id); } catch (e) { return; }
  S.askSave = null;
  toast(`“${libName(id)}” is saved as a library.`);
  renderAll();
}

async function closeLibrary(id) {
  const lib = S.libraries.find((x) => x.id === id);
  try { S.libraries = await call('close_library', id); } catch (e) { return; }
  delete S.libs[id];
  if (lib && lib.saved) toast(`“${lib.name}” was removed from your libraries. The folder itself was not touched.`);
  if (S.libId === id) {
    const next = S.libraries[0];
    if (next) await showLibrary(next.id); else { S.libId = null; show('favourites'); }
  } else renderAll();
}

async function relocateLibrary(id) {
  let r = null;
  try { r = await call('relocate_library', id); } catch (e) { return; }
  if (!gotLibraries(r)) return;
  await showLibrary(id);
}

async function rescanAll() {
  try { gotLibraries(await call('rescan')); } catch (e) { return; }
  S.libs = {}; S.byId = {}; S.big = {};
  toast('Your libraries will be read again when you open them.');
  if (S.view === 'library' && S.libId) await showLibrary(S.libId); else renderAll();
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
  const on = (view, lib) => S.view === view && (lib === undefined || S.libId === lib);
  const b = (view, svg, label, extra = '', attrs = '') => `<button type="button" class="navbtn${on(view) ? ' on' : ''}" data-action="nav" data-view="${view}" title="${esc(label)}"${on(view) ? ' aria-current="page"' : ''}${attrs}>${svg}<span class="label">${esc(label)}</span>${extra}</button>`;
  const libs = S.libraries.map((l) => {
    const cur = on('library', l.id);
    const count = l.saved ? `<span class="count">${l.count == null ? '' : l.count}</span>` : '';
    const ask = S.askSave === l.id;
    return `<div class="navlib${l.saved ? '' : ' unsaved'}">
      <button type="button" class="navbtn${cur ? ' on' : ''}" data-action="show-lib" data-lib="${esc(l.id)}" title="${esc(l.name + ' — ' + l.path)}"${cur ? ' aria-current="page"' : ''}>${SVG.grid}<span class="label">${esc(l.name)}</span>${count}</button>
      ${l.saved ? '' : `<button type="button" class="unsaved-badge" data-action="ask-save" data-lib="${esc(l.id)}" aria-expanded="${ask}" aria-label="Save the library location for ${esc(l.name)}" title="Save this library location">Not saved</button>`}
      ${ask ? `<div class="askbox" role="group" aria-label="Save the library location for ${esc(l.name)}">
          <span class="small muted">Keep this folder as a library, so it's here next time.</span>
          <div class="row-btns"><button type="button" class="btn primary small-btn" data-action="save-lib" data-lib="${esc(l.id)}">${SVG.save}Save library location</button>
          <button type="button" class="btn small-btn" data-action="ask-save" data-lib="${esc(l.id)}">Not now</button></div></div>` : ''}
    </div>`;
  }).join('');
  return `<nav class="nav" aria-label="Main">
    <span class="navhead">Main</span>
    ${b('apply', SVG.apply, 'Apply icons')}
    <div class="navsep"></div>
    <span class="navhead">Libraries</span>
    ${b('favourites', SVG.star(false, 18), 'Favourites', `<span class="count">${S.favourites.length}</span>`)}
    ${libs}
    <button type="button" class="navbtn muted-btn" data-action="open-folder" title="Open a folder…">${SVG.plusNav}<span class="label">Open a folder…</span></button>
    <div class="navsep"></div>
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
  renderNav();
}

function renderNav() {
  const nav = $('.nav');
  if (nav) nav.outerHTML = navHTML();
}

function renderContent() {
  const c = $('#content');
  if (!c) return;
  if (S.view === 'library' || S.view === 'favourites') {
    c.innerHTML = libraryHTML() + '<aside class="aside" id="aside" aria-label="Right-click menu and selected icon"></aside>';
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
  const sel = icon(S.selected);
  return `<div class="banner" role="region" aria-label="Choosing an icon">
    <img src="${esc(sel ? sel.thumb : '')}" alt="" width="32" height="32" style="${sel ? '' : 'visibility:hidden'}">
    <div class="grow"><strong>Choose an icon for “${esc(S.pick.name)}”</strong><div class="small muted">${esc(S.pick.path)}</div></div>
    <button type="button" class="btn primary" data-action="pick-apply"${sel ? '' : ' disabled'}>Use this icon</button>
    <button type="button" class="btn" data-action="close">Cancel</button>
  </div>`;
}

function favLibraryCount() {
  const names = new Set(S.favourites.map(sourceName).filter(Boolean));
  return names.size;
}

function libraryHTML() {
  const toolbar = `<div class="toolbar">
      <div class="search"><label for="search" class="sr">Search icons</label>${SVG.search}
        <input id="search" class="field" type="search" placeholder="Search icons" value="${esc(S.query)}" data-action="search" autocomplete="off"></div>
      <div class="chips" id="chips" role="group" aria-label="Filter by colour or tag"></div>
    </div>
    <p class="empty" id="empty" hidden></p>
    <div class="grid" id="grid"></div>`;
  if (S.view === 'favourites') {
    const n = favLibraryCount();
    return `<main class="main" id="main">${pickBannerHTML()}
      <div><h1>Favourites</h1><p class="small muted" style="margin-top:4px">${plural(S.favourites.length, 'icon', 'icons')}${n ? ` from ${plural(n, 'library', 'libraries')}` : ''} · copies are kept, so they stay even if a library moves</p></div>
      ${toolbar}</main>`;
  }
  const rec = S.libraries.find((l) => l.id === S.libId);
  if (!rec) {
    return `<main class="main" id="main">${pickBannerHTML()}<h1>Libraries</h1>
      <div class="dashed"><p style="margin-bottom:12px">Open a folder that holds .ico files. Sub-folders are included.</p>
      <button type="button" class="btn primary" data-action="open-folder">Open a folder…</button></div>
      <div id="grid" hidden></div><div id="chips" hidden></div><p id="empty" hidden></p></main>`;
  }
  const lib = currentLib();
  const count = lib ? ` · ${plural(lib.icons.length, 'icon', 'icons')}${lib.unreadable ? ` · ${lib.unreadable} could not be read` : ''}` : (rec.exists === false ? ' · the folder is missing' : ' · reading…');
  const buttons = rec.saved
    ? `<button type="button" class="btn" data-action="relocate-lib" data-lib="${esc(rec.id)}">${SVG.folder(16)}Change location…</button>
       <button type="button" class="btn" data-action="close-lib" data-lib="${esc(rec.id)}">Remove library</button>`
    : `<button type="button" class="btn primary" data-action="save-lib" data-lib="${esc(rec.id)}">${SVG.save}Save library location</button>
       <button type="button" class="btn" data-action="close-lib" data-lib="${esc(rec.id)}">Close</button>`;
  return `<main class="main" id="main">
    ${pickBannerHTML()}
    <div style="display:flex;flex-wrap:wrap;align-items:flex-end;gap:12px 8px">
      <div style="flex:1;min-width:220px"><h1>${esc(rec.name)}</h1>
        <p class="small muted" style="margin-top:4px;overflow-wrap:anywhere">${esc(rec.path)}${count}${rec.saved ? '' : ' · opened, not saved yet'}</p></div>
      ${buttons}
    </div>
    ${toolbar}
  </main>`;
}

function colourChips() {
  if (S.view === 'library') { const lib = currentLib(); return lib ? lib.colours : []; }
  const seen = new Set(S.favourites.map((id) => (icon(id) || {}).colour).filter((c) => c && c !== 'other'));
  const dots = { blue: '#5294E2', green: '#87B158', red: '#E25252', teal: '#16A085', yellow: '#F9BD30', orange: '#EE923A', grey: '#A0A0A0', black: '#4D4D4D', brown: '#B07A5A', pink: '#E87BB7', violet: '#8E44AD', cyan: '#3EC7D6', white: '#E6E6E6', magenta: '#CA71DF', indigo: '#5C6BC0', palebrown: '#D1BFAE', paleorange: '#EECA8F', deeporange: '#EB6637', nordic: '#81A1C1', adwaita: '#93C0EA', bluegrey: '#607D8B', darkcyan: '#45ABB7', breeze: '#57B8EC', carmine: '#A30002' };
  return [...seen].sort().map((c) => ({ id: c, label: c[0].toUpperCase() + c.slice(1), dot: dots[c] || '#8E44AD' }));
}

function renderChips() {
  const box = $('#chips');
  if (!box) return;
  const chip = (id, label, inner) => `<button type="button" class="chip" data-action="filter" data-filter="${esc(id)}" aria-pressed="${S.filter === id}">${inner}${esc(label)}</button>`;
  let h = chip('all', 'All', '');
  colourChips().forEach((c) => { h += chip(c.id, c.label, `<span class="swatch" style="background:${esc(c.dot)}"></span>`); });
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
  let list;
  if (S.view === 'favourites') list = S.favourites.map(icon).filter(Boolean);
  else { const lib = currentLib(); list = lib ? lib.icons : []; }
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
  const src = S.view === 'favourites' ? sourceName(i.id) : '';
  return `<div class="tile" data-id="${esc(i.id)}">
    <button type="button" class="pick" data-action="select" data-id="${esc(i.id)}" aria-pressed="${S.selected === i.id}" title="${esc(i.file || i.label)}">
      <img src="${esc(i.thumb)}" alt=""><span class="name">${esc(i.label)}</span>${src ? `<span class="src">${esc(src)}</span>` : ''}</button>
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
      if (S.view === 'favourites' && !S.favourites.length) msg = 'No favourites yet. Click the star on an icon in any library to add it here.';
      else if (S.view === 'library' && !currentLib()) msg = '';
      else if (S.filter.startsWith('tag:') && !S.query) msg = 'No icons have this tag yet. Select an icon and tick the tag on the right.';
      else msg = 'No icons match your search.';
    }
    empty.textContent = msg;
    empty.hidden = !msg;
  }
}

function renderFavParts() {
  if ($('#grid')) {
    if (S.view === 'favourites') renderGrid();
    else document.querySelectorAll('#grid .star').forEach((b) => {
      const on = isFav(b.dataset.id);
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on);
      b.setAttribute('aria-label', (on ? 'Remove ' : 'Add ') + (icon(b.dataset.id) || {}).label + (on ? ' from favourites' : ' to favourites'));
      b.innerHTML = SVG.star(on);
    });
  }
  renderAside();
  const c = $('.nav [data-view="favourites"] .count');
  if (c) c.textContent = S.favourites.length;
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

// --- the aside: the right-click menu first, then the selected icon

function gripHTML(kind, key, label, pos) {
  return `<button type="button" class="grip" draggable="true" data-grip="${kind}" data-key="${esc(key)}" aria-label="Move ${esc(label)} (${pos})" title="Drag to change the order, or use the arrow keys">${SVG.grip}</button>`;
}

function menuRowHTML(id, g, i, t, siblings) {
  const ic = icon(id);
  if (!ic) return '';
  const pos = `${i + 1} of ${siblings}${g ? ' in this folder' : ' at the top'}`;
  return `<div class="mrow${S.selected === id ? ' on' : ''}${g ? '' : ' loose'}" data-drop="row" data-g="${esc(g || '')}" data-i="${i}" data-t="${t}" role="listitem">
    ${gripHTML('icon', id, ic.label, pos)}
    <button type="button" class="open" data-action="select" data-id="${esc(id)}"><img src="${esc(ic.thumb)}" alt=""><span class="t">${esc(ic.label)}</span></button>
    <button type="button" class="iconbtn" data-action="menu-remove" data-id="${esc(id)}" aria-label="Remove ${esc(ic.label)} from the right-click menu">${SVG.x}</button></div>`;
}

function menuListHTML() {
  const n = menuIds().length;
  const rows = S.menuItems.map((e, t) => {
    if (e.kind === 'icon') return menuRowHTML(e.id, null, t, t, S.menuItems.length);
    return `<div class="group" data-drop="group" data-g="${esc(e.id)}" data-t="${t}" role="listitem">
      <div class="group-head">${gripHTML('group', e.id, 'menu folder ' + e.name, `${t + 1} of ${S.menuItems.length}`)}${SVG.folder(16)}
        <input type="text" class="rename" maxlength="60" value="${esc(e.name)}" data-action="rename-group" data-gid="${esc(e.id)}" aria-label="Rename menu folder ${esc(e.name)}">
        <span class="small muted">${e.items.length}</span>
        <button type="button" class="iconbtn" data-action="delete-group" data-gid="${esc(e.id)}" aria-label="Delete menu folder ${esc(e.name)} (its icons move to the top level)">${SVG.trash}</button></div>
      <div role="list" aria-label="${esc(e.name)}">${e.items.map((id, i) => menuRowHTML(id, e.id, i, t, e.items.length)).join('')}</div>
      ${e.items.length ? '' : '<p class="small muted" style="padding:0 0 6px 52px">Empty: drag an icon here, or select one and pick this folder.</p>'}
    </div>`;
  }).join('');
  return `<section class="menu-list" aria-label="Right-click menu">
    <div style="display:flex;align-items:baseline;gap:8px"><h2 style="flex:1">Right-click menu</h2><span class="small muted">${plural(n, 'icon', 'icons')}</span></div>
    <p class="small muted">Its own list, separate from your favourites. Add any icon from any library, sort them into menu folders, and click a folder name to rename it.</p>
    <div class="mlist" role="list" aria-label="Right-click menu, in order">${rows}</div>
    ${S.menuItems.length ? `<p class="small muted">Drag the handles <span aria-hidden="true">⠿</span> to change the order, or focus a handle and use the arrow keys.</p>` : '<p class="dashed">Select an icon and choose where it goes under “In the right-click menu”.</p>'}
    ${S.menuItems.length >= S.limits.top ? `<p class="small warn">The top of the menu is full (${S.limits.top} entries). Put icons into folders to make room.</p>` : ''}
    <button type="button" class="btn" style="align-self:flex-start" data-action="add-group">${SVG.plus}New menu folder</button>
  </section>`;
}

function selectedHTML() {
  const id = S.selected;
  const i = icon(id);
  if (!i) return '<section class="card"><p class="muted">Click an icon to see it here.</p></section>';
  const fav = isFav(id);
  loadBig(id);
  const big = S.big[id] || i.thumb;
  const myTags = S.tagMap[id] || [];
  const where = whereInMenu(id);
  const whereKey = where ? (where.g || 'root') : 'none';
  const src = sourceName(id);
  const choices = [{ id: 'none', name: 'Not in the menu' }, { id: 'root', name: 'Top level' }]
    .concat(S.menuItems.filter((e) => e.kind === 'group').map((g) => ({ id: g.id, name: g.name })));
  return `<section class="card selected" aria-label="Selected icon">
      <img class="big" data-big src="${esc(big)}" alt="${esc(i.label)}">
      <div class="sizes" aria-hidden="true">${[16, 24, 32, 48].map((s) => `<img src="${esc(i.thumb)}" alt="" width="${s}" height="${s}">`).join('')}</div>
      <div style="text-align:center"><h2 style="font-size:16px;line-height:22px">${esc(i.label)}</h2><p class="small muted">${esc(i.file || '')}${src ? ' · ' + esc(src) : ''}</p></div>
      <div class="actions">
        ${S.pick
          ? `<button type="button" class="btn primary wide" data-action="pick-apply">Use for “${esc(S.pick.name)}”</button>`
          : '<button type="button" class="btn primary wide" data-action="nav" data-view="apply">Apply icons…</button>'}
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
      <div class="sub"><span class="label">In the right-click menu</span>
        <div class="chips" role="group" aria-label="Where this icon goes in the right-click menu">
          ${choices.map((c) => `<button type="button" class="chip small" data-action="place" data-where="${esc(c.id)}" aria-pressed="${whereKey === c.id}">${esc(c.name)}</button>`).join('')}
        </div>
        ${!where && S.menuItems.length >= S.limits.top ? `<span class="small muted">The top level is full (${S.limits.top} entries). Put it in a menu folder instead.</span>` : ''}
      </div>
    </section>`;
}

function renderAside(focusGrip) {
  const aside = $('#aside');
  if (!aside) return;
  // Keep a folder name that is being typed when the panel is redrawn underneath it.
  const ae = document.activeElement;
  const keep = ae && aside.contains(ae) && ae.dataset.action === 'rename-group'
    ? { gid: ae.dataset.gid, value: ae.value, s: ae.selectionStart, e: ae.selectionEnd } : null;
  const gripFocus = focusGrip || (ae && aside.contains(ae) && ae.dataset.grip ? ae.dataset.key : null);
  const top = aside.scrollTop;
  aside.innerHTML = menuListHTML() + selectedHTML();
  aside.scrollTop = top;
  if (keep) {
    const i = aside.querySelector(`input[data-gid="${CSS.escape(keep.gid)}"]`);
    if (i) { i.value = keep.value; i.focus(); i.setSelectionRange(keep.s, keep.e); }
  } else if (gripFocus) {
    const g = aside.querySelector(`[data-grip][data-key="${CSS.escape(gripFocus)}"]`);
    if (g) g.focus();
  }
}

// --- moving things in the menu (drag and drop, arrow keys)

function dropTarget(el) {
  const row = el.closest('[data-drop]');
  if (!row || !$('#aside').contains(row)) return null;
  return { kind: row.dataset.drop, g: row.dataset.g || null, i: +row.dataset.i, t: +row.dataset.t, el: row };
}

function nextAfterDrop(drag, target) {
  if (drag.kind === 'group') {
    const from = S.menuItems.findIndex((e) => e.kind === 'group' && e.id === drag.key);
    const to = target.t;
    if (from < 0 || from === to) return null;
    return movedTop(from, from < to ? to - 1 : to);
  }
  const id = drag.key;
  const cur = whereInMenu(id);
  if (target.kind === 'group') return placed(id, target.g, null);
  if (target.g) {
    let at = target.i;
    if (cur && cur.g === target.g && cur.i < at) at -= 1;
    return placed(id, target.g, at);
  }
  let at = target.t;
  if (cur && cur.g === null && cur.i < at) at -= 1;
  return placed(id, null, at);
}

function onDragStart(e) {
  const g = e.target.closest && e.target.closest('[data-grip]');
  if (!g) return;
  S.drag = { kind: g.dataset.grip, key: g.dataset.key };
  try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', g.dataset.key); } catch (err) { /* old engines */ }
  const row = g.closest('.mrow, .group');
  if (row) setTimeout(() => row.classList.add('dragging'), 0);
}

function clearDropMarks() { document.querySelectorAll('.drop-over').forEach((x) => x.classList.remove('drop-over')); }

function onDragOver(e) {
  if (!S.drag) return;
  const t = dropTarget(e.target);
  if (!t) return;
  e.preventDefault();
  clearDropMarks();
  t.el.classList.add('drop-over');
}

async function onDrop(e) {
  if (!S.drag) return;
  const t = dropTarget(e.target);
  const drag = S.drag;
  S.drag = null;
  clearDropMarks();
  if (!t) return;
  e.preventDefault();
  await saveMenu(nextAfterDrop(drag, t), drag.key);
}

function onDragEnd() {
  S.drag = null;
  clearDropMarks();
  document.querySelectorAll('.dragging').forEach((x) => x.classList.remove('dragging'));
}

async function gripKey(el, step) {
  const key = el.dataset.key;
  if (el.dataset.grip === 'group') {
    const from = S.menuItems.findIndex((x) => x.kind === 'group' && x.id === key);
    return saveMenu(movedTop(from, from + step), key);
  }
  const w = whereInMenu(key);
  if (!w) return null;
  if (w.g) {
    const grp = S.menuItems[w.t];
    const to = w.i + step;
    if (to < 0 || to >= grp.items.length) return null;
    return saveMenu(placed(key, w.g, to), key);
  }
  return saveMenu(movedTop(w.t, w.t + step), key);
}

// ------------------------------------------------------------------ apply view

function applyHTML() {
  const i = icon(S.selected);
  const favIcons = S.favourites.map(icon).filter(Boolean);
  return `<main class="main" id="main">
    ${pickBannerHTML()}
    <h1>Apply icons</h1>
    <div class="apply">
      <div class="left">
        <div class="card selected">
          ${i ? `<img class="big" data-big src="${esc(S.big[i.id] || i.thumb)}" alt="${esc(i.label)}"><strong>${esc(i.label)}</strong>
                 <button type="button" class="btn" data-action="back-to-icons">Choose another icon</button>`
              : '<p class="muted" style="text-align:center">No icon chosen yet.</p><button type="button" class="btn primary" data-action="back-to-icons">Choose an icon</button>'}
        </div>
        ${favIcons.length ? `<div><p class="small muted" style="margin-bottom:6px">Or use a favourite:</p><div class="chips">${favIcons.map((f) => `<button type="button" class="iconbtn" style="width:40px;height:40px" data-action="use-fav" data-id="${esc(f.id)}" aria-label="Use ${esc(f.label)}" aria-pressed="${S.selected === f.id}" title="${esc(f.label)}"><img src="${esc(f.thumb)}" alt="" width="28" height="28"></button>`).join('')}</div></div>` : ''}
        <p class="small muted">Tick folders and shortcuts on the right. Shortcuts are listed under their folder — try Desktop or Start menu. Only things you are allowed to change are changed, so nothing needs admin rights.</p>
      </div>
      <div class="right">
        <div style="display:flex;align-items:center;gap:12px"><span class="small muted" style="flex:1;min-width:0;overflow-wrap:anywhere">Start at: ${esc(S.tree ? S.tree.root : S.startFolder)}</span>
          <button type="button" class="btn" data-action="browse-start">Browse…</button></div>
        <div class="places">${S.places.map((p) => `<button type="button" class="chip small" data-action="start-at" data-path="${esc(p.path)}" aria-pressed="${S.tree && S.tree.root === p.path}">${esc(p.name)}</button>`).join('')}</div>
        <div class="tree" id="tree" role="tree" aria-label="Folders and shortcuts" aria-multiselectable="true"></div>
        <div class="linkrow"><button type="button" class="linkbtn" data-action="tick-all">Tick all</button><button type="button" class="linkbtn" data-action="tick-clear">Clear</button></div>
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
  S.anchor = null;
  S.tree = { root: path, nodes: { [path]: { name: baseName(path), path, hasChildren: true, custom: false, open: true, loaded: false, children: [] } } };
  S.api.set_pref('start_folder', path).catch(() => {});
  try { await loadNode(path); } catch (e) { /* toast shown */ }
  if (S.view === 'apply') renderContent();
}

/* The rows of the tree as they are shown, top to bottom (for Shift-click ranges). */
function visibleRows() {
  const out = [];
  const walk = (p) => {
    const n = S.tree.nodes[p];
    if (!n) return;
    out.push(p);
    if (n.open) n.children.forEach(walk);
  };
  if (S.tree) walk(S.tree.root);
  return out;
}

function nodeHTML(path, depth) {
  const n = S.tree.nodes[path];
  if (!n) return '';
  const ticked = S.checked.has(path);
  let h = `<div class="node${ticked ? ' ticked' : ''}" role="treeitem" aria-selected="${ticked}"${n.hasChildren ? ` aria-expanded="${n.open}"` : ''} style="padding-left:${depth * 20 + 4}px">
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
  const top = t.scrollTop;
  t.innerHTML = nodeHTML(S.tree.root, 0);
  t.scrollTop = top;
  const c = $('#tickcount');
  if (c) c.textContent = S.checked.size ? tickedText() + ' ticked' + (S.includeSub && tickedKinds().folders ? ', plus every folder inside' : '') : 'Nothing ticked';
}

/* Click = tick one. Shift-click = everything between it and the last one clicked gets the same state. */
function tick(path, on, shift) {
  const rows = visibleRows();
  if (shift && S.anchor && rows.includes(S.anchor) && rows.includes(path)) {
    const a = rows.indexOf(S.anchor), b = rows.indexOf(path);
    rows.slice(Math.min(a, b), Math.max(a, b) + 1).forEach((p) => { if (on) S.checked.add(p); else S.checked.delete(p); });
  } else if (on) S.checked.add(path); else S.checked.delete(path);
  S.anchor = path;
  renderTree();
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
  return new Set(r.failed.map((f) => f.path));
}

async function applyTicked() {
  if (!S.selected) { toast('Choose an icon first.'); return null; }
  if (!S.checked.size) { toast('Tick at least one folder or shortcut.'); return null; }
  try {
    const targets = [...S.checked];
    const r = await call('apply', S.selected, targets, S.includeSub);
    const bad = report(r, 'Icon applied to', targets);
    targets.forEach((p) => { if (!bad.has(p) && S.tree.nodes[p]) S.tree.nodes[p].custom = true; });
    renderTree();
    return r;
  } catch (e) { return null; }
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

function backToIcons() {
  if (S.libId && S.libraries.some((l) => l.id === S.libId)) showLibrary(S.libId);
  else if (S.libraries.length) showLibrary(S.libraries[0].id);
  else show('favourites');
}

// ------------------------------------------------------------------ menu, settings, welcome

function ctxItem(img, label, extra = '', hl = false) {
  return `<div class="it${hl ? ' hl' : ''}">${img}<span class="t">${esc(label)}</span>${extra}</div>`;
}

function menuPreviewHTML() {
  const img = (id) => { const i = icon(id); return i ? `<img src="${esc(i.thumb)}" alt="">` : '<span style="width:20px"></span>'; };
  const shown = S.menuItems.filter((e) => e.kind === 'icon' || e.items.length);
  const firstGroup = shown.find((e) => e.kind === 'group');
  let sub = '';
  shown.forEach((e) => {
    if (e.kind === 'group') sub += ctxItem(SVG.folder(20), e.name, SVG.right, e === firstGroup);
    else { const i = icon(e.id); if (i) sub += ctxItem(img(e.id), i.label); }
  });
  if (!shown.length) sub += '<div class="head">No menu icons yet</div>';
  sub += '<div class="sep"></div>' + ctxItem(SVG.reset, 'Reset to default icon') + ctxItem(SVG.grid, shown.length ? 'More icons…' : 'Choose an icon…');
  const third = firstGroup ? `<div class="ctx" aria-label="${esc(firstGroup.name)}">${firstGroup.items.map((id) => { const i = icon(id); return i ? ctxItem(img(id), i.label) : ''; }).join('')}</div>` : '';
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
    <p class="muted" style="margin:4px 0 8px">Right-click a folder in File Explorer and choose <strong>NiSH Icons</strong> to give it one of your menu icons.</p>
    <div class="row">${SVG.menu}<div class="grow"><div id="menuOn">Show NiSH Icons when I right-click</div><div class="small muted">${status}</div></div>
      <span class="small">${o.enabled ? 'On' : 'Off'}</span>
      <button type="button" class="switch" role="switch" aria-checked="${!!o.enabled}" aria-labelledby="menuOn" data-action="menu-toggle"></button></div>
    <div class="row indent"><span>Show it on</span>${opt('folders', 'Folders')}${opt('shortcuts', 'Shortcuts (.lnk)')}${opt('background', 'Inside a folder (blank space)')}</div>
    <h2>Preview</h2>
    ${menuPreviewHTML()}
    <div style="display:flex;gap:8px;margin:8px 0 16px"><button type="button" class="btn" data-action="back-to-icons">Edit menu icons and folders</button></div>
    <p class="note"><strong>Windows 11:</strong> the entry is in the classic menu — click <em>Show more options</em> or hold Shift while you right-click. The short new menu only accepts signed app packages, and those need admin rights to install.</p>
    <p class="note" style="margin-top:8px"><strong>Files:</strong> Windows gives every file of the same type the same icon, so the menu works on folders and on shortcuts (.lnk), which can each have their own icon.</p>
  </div></main>`;
}

function librariesSummary() {
  const saved = S.libraries.filter((l) => l.saved);
  if (!saved.length) return 'No libraries saved yet';
  const names = saved.map((l) => l.name);
  const shown = names.length > 2 ? names.slice(0, 2).join(', ') + ` and ${names.length - 2} more` : names.join(' and ');
  const known = saved.every((l) => l.count != null) ? ', ' + plural(saved.reduce((a, l) => a + l.count, 0), 'icon', 'icons') : '';
  return `${shown} · ${plural(saved.length, 'location', 'locations')}${known}`;
}

function settingsHTML() {
  return `<main class="main" id="main"><div class="page">
    <h1>Settings</h1>
    <h2>Icons</h2>
    <div class="row">${SVG.library}<div class="grow"><div>Icon libraries</div><div class="small muted">${esc(librariesSummary())}</div></div>
      <button type="button" class="btn" data-action="rescan-all">Look for new icons</button>
      <button type="button" class="btn" data-action="manage-libs">Manage…</button></div>
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
    <div class="row">${SVG.info}<div class="grow"><div>NiSH Icons ${esc(S.version)}</div><div class="small muted">Folder icons from your own libraries — no admin rights needed.</div></div></div>
    <div class="row">${SVG.trash}<div class="grow"><div>Remove NiSH Icons from this PC</div><div class="small muted">Removes the right-click menu and settings. Icons you already set stay until you reset them.</div></div>
      <button type="button" class="btn danger" data-action="remove">Remove…</button></div>
  </div></main>`;
}

function manageLibraries() {
  const rows = S.libraries.map((l) => `<div class="librow">
      <div class="grow"><div>${esc(l.name)}${l.saved ? '' : ' <span class="small muted">(not saved)</span>'}</div><div class="small muted" style="overflow-wrap:anywhere">${esc(l.path)}${l.exists === false ? ' — missing' : ''}</div></div>
      ${l.saved ? '' : `<button type="button" class="btn" data-action="save-lib" data-lib="${esc(l.id)}">Save</button>`}
      <button type="button" class="btn" data-action="relocate-lib" data-lib="${esc(l.id)}">Change location…</button>
      <button type="button" class="btn" data-action="close-lib" data-lib="${esc(l.id)}">${l.saved ? 'Remove' : 'Close'}</button></div>`).join('');
  $('#modal-root').innerHTML = `<div class="modal-back"><div class="modal wide-modal" role="dialog" aria-modal="true" aria-labelledby="mTitle">
    <div class="body"><h2 id="mTitle" style="font-size:20px;line-height:28px">Icon libraries</h2>
      <p class="small muted">Removing a library only takes it off this list. The folder, and your favourites and menu icons from it, stay.</p>
      <div class="liblist">${rows || '<p class="muted">No libraries yet.</p>'}</div></div>
    <div class="foot"><button type="button" class="btn" data-action="open-folder-save">${SVG.plus}Add library…</button><span style="flex:1"></span><button type="button" class="btn primary" data-action="modal-close">Done</button></div>
  </div></div>`;
}

function welcomeHTML() {
  const libs = S.libraries.filter((l) => l.saved);
  const first = libs.length && S.libs[libs[0].id];
  const hero = first ? first.icons.slice(0, 5) : [];
  const sizes = [48, 56, 72, 56, 48];
  const o = S.menu.options;
  return `<div class="welcome">
    <div class="hero" aria-hidden="true">${hero.length ? hero.map((i, n) => `<img src="${esc(i.thumb)}" alt="" width="${sizes[n]}" height="${sizes[n]}">`).join('') : '<img src="assets/icon-128.png" alt="" width="72" height="72">'}</div>
    <div style="text-align:center"><h1>Welcome to NiSH Icons</h1>
      <p class="muted" style="margin-top:6px">Give your folders their own icons, straight from the right-click menu. No admin rights needed.</p></div>
    <ol>
      <li><span class="step${libs.length ? ' done' : ''}">${libs.length ? SVG.check : '1'}</span>
        <div style="flex:1;min-width:0"><strong>Add your icon libraries</strong>
          <p class="small muted" style="margin-top:2px;overflow-wrap:anywhere">${libs.length ? esc(libs.map((l) => l.name).join(', ')) : 'Folders with .ico files — subfolders are included.'}<br>Add more libraries any time.</p></div>
        <button type="button" class="btn${libs.length ? '' : ' primary'}" data-action="open-folder-save">${libs.length ? 'Add another…' : 'Browse…'}</button></li>
      <li><span class="step">2</span><div style="flex:1"><strong>Pick favourites and menu icons</strong>
          <p class="small muted" style="margin-top:2px">Star icons from any library to collect them in Favourites.</p></div>
        <span style="color:var(--star)">${SVG.star(true, 22)}</span></li>
      <li><span class="step">3</span><div style="flex:1"><strong id="wMenu">Add NiSH Icons to the right-click menu</strong>
          <p class="small muted" style="margin-top:2px">Choose which icons appear under the right-click menu.</p></div>
        <span class="small">${o.enabled ? 'On' : 'Off'}</span>
        <button type="button" class="switch" role="switch" aria-checked="${!!o.enabled}" aria-labelledby="wMenu" data-action="menu-toggle"></button></li>
    </ol>
    <button type="button" class="btn primary" style="min-width:200px;height:36px" data-action="get-started"${libs.length ? '' : ' disabled'}>Get started</button>
  </div>`;
}

function confirmRemove() {
  const root = $('#modal-root');
  root.innerHTML = `<div class="modal-back"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mTitle">
    <div class="body"><h2 id="mTitle" style="font-size:20px;line-height:28px">Remove NiSH Icons?</h2>
      <p class="muted">The right-click menu entry and the app's settings (libraries, favourites, tags, menu) are removed. Folders that already have an icon keep it, and the icon copies in ${esc(S.store)} stay so they keep working.</p></div>
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
    case 'show-lib': S.askSave = null; await showLibrary(el.dataset.lib); break;
    case 'open-folder': await openFolder(false); break;
    case 'open-folder-save': {
      const lib = await openFolder(true);
      if (lib && $('#modal-root').innerHTML) manageLibraries();
      break;
    }
    case 'ask-save': S.askSave = S.askSave === el.dataset.lib ? null : el.dataset.lib; renderNav(); break;
    case 'save-lib': await saveLibrary(el.dataset.lib); if ($('#modal-root').innerHTML) manageLibraries(); break;
    case 'close-lib': await closeLibrary(el.dataset.lib); if ($('#modal-root').innerHTML) manageLibraries(); break;
    case 'relocate-lib': await relocateLibrary(el.dataset.lib); if ($('#modal-root').innerHTML) manageLibraries(); break;
    case 'manage-libs': manageLibraries(); break;
    case 'rescan-all': await rescanAll(); break;
    case 'select': selectIcon(id); break;
    case 'star': await toggleFav(id); break;
    case 'menu-remove': await saveMenu(without(clone(S.menuItems), id)); break;
    case 'place': if (S.selected) await placeInMenu(S.selected, el.dataset.where); break;
    case 'filter': S.filter = el.dataset.filter; S.tagEdit = null; renderChips(); renderGrid(); break;
    case 'tag-new': S.tagEdit = { mode: 'add', name: '' }; renderChips(); break;
    case 'tag-rename': { const t = S.tags.find((x) => x.id === el.dataset.tag); if (t) { S.tagEdit = { mode: 'rename', id: t.id, name: t.name }; renderChips(); } break; }
    case 'tag-delete': await deleteTag(el.dataset.tag); break;
    case 'tag-save': await saveTagEdit(); break;
    case 'tag-cancel': S.tagEdit = null; renderChips(); break;
    case 'tag-toggle': if (S.selected) await toggleTag(S.selected, el.dataset.tag); break;
    case 'add-group': await addGroup(); break;
    case 'delete-group': await deleteGroup(el.dataset.gid); break;
    case 'use-fav': S.selected = id; renderContent(); break;
    case 'back-to-icons': backToIcons(); break;
    case 'twist': await toggleTwist(el.dataset.path); break;
    case 'tick': tick(el.dataset.path, el.checked, e.shiftKey); break;
    case 'tick-all': visibleRows().forEach((p) => S.checked.add(p)); renderTree(); break;
    case 'tick-clear': S.checked = new Set(); S.anchor = null; renderTree(); break;
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
    case 'modal-close': $('#modal-root').innerHTML = ''; renderAll(); break;
    case 'get-started':
      S.welcomed = true;
      S.api.set_pref('welcomed', true).catch(() => {});
      backToIcons();
      if (S.menu.options.enabled && !S.menu.installed) await setMenu(S.menu.options);
      break;
    default: break;
  }
}

async function onChange(e) {
  const el = e.target;
  const a = el.dataset && el.dataset.action;
  if (a === 'rename-group') await renameGroup(el.dataset.gid, el.value);
  else if (a === 'include-sub') { S.includeSub = el.checked; renderTree(); }
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
  if (el.dataset && el.dataset.grip && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
    e.preventDefault();
    await gripKey(el, e.key === 'ArrowUp' ? -1 : 1);
  } else if (a === 'tagname') {
    if (e.key === 'Enter') { e.preventDefault(); await saveTagEdit(); }
    else if (e.key === 'Escape') { S.tagEdit = null; renderChips(); }
  } else if (a === 'rename-group' && (e.key === 'Enter' || e.key === 'Escape')) {
    e.preventDefault();
    el.blur();
  } else if (e.key === 'Escape' && $('#modal-root').innerHTML) {
    $('#modal-root').innerHTML = '';
    renderAll();
  }
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
  S.libraries = d.libraries || []; S.favourites = d.favourites || []; S.menuItems = d.menuItems || [];
  S.saved = d.savedIcons || {}; S.tags = d.tags; S.tagMap = d.tagMap;
  S.menu = d.menu; S.startFolder = d.startFolder; S.places = d.places; S.pick = d.pick; S.store = d.store;
  S.limits = d.limits || S.limits; S.testLibrary = d.testLibrary || null;
  document.addEventListener('click', (e) => { onClick(e).catch(() => {}); });
  document.addEventListener('change', (e) => { onChange(e).catch(() => {}); });
  document.addEventListener('input', onInput);
  document.addEventListener('keydown', (e) => { onKey(e).catch(() => {}); });
  document.addEventListener('dragstart', onDragStart);
  document.addEventListener('dragover', onDragOver);
  document.addEventListener('drop', (e) => { onDrop(e).catch(() => {}); });
  document.addEventListener('dragend', onDragEnd);
  if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
  const first = S.libraries.find((l) => l.saved && l.exists !== false) || S.libraries[0];
  if ((!S.welcomed || !first) && !S.pick) {
    S.view = 'welcome';
    if (first) { try { await loadLibrary(first.id); } catch (e) { /* toast shown */ } }
    renderAll();
  } else if (first) {
    await showLibrary(first.id);
  } else {
    show('favourites');
  }
  window.NI.ready = true;
}

// ------------------------------------------------------------------ self-test (used by the build's GUI smoke test)

window.NI = {
  ready: false,
  S,
  async selfTest() {
    const steps = [];
    const step = (name, ok) => steps.push({ name, ok: !!ok });
    const click = (el, opts = {}) => el.dispatchEvent(new MouseEvent('click', Object.assign({ bubbles: true, cancelable: true }, opts)));
    try {
      const lib0 = S.libraries[0];
      await showLibrary(lib0.id);
      const lib = currentLib();
      step('library shows the icons', document.querySelectorAll('#grid .tile').length === lib.icons.length && lib.icons.length >= 4);
      const search = $('#search');
      search.value = 'red'; search.dispatchEvent(new Event('input', { bubbles: true }));
      step('search finds one icon', document.querySelectorAll('#grid .tile').length === 1);
      search.value = ''; search.dispatchEvent(new Event('input', { bubbles: true }));
      const first = lib.icons[0].id;
      $(`#grid .pick[data-id="${CSS.escape(first)}"]`).click();
      step('clicking an icon selects it', S.selected === first && $('#aside').textContent.includes(lib.icons[0].label));
      await toggleFav(first);
      step('star makes a favourite (copied and saved)', isFav(first) && S.saved[first] && !whereInMenu(first));
      const gid = await addGroup();
      await renameGroup(gid, 'Smoke folder');
      await placeInMenu(first, gid);
      const g = S.menuItems.find((e) => e.kind === 'group');
      step('menu folder created, renamed and filled', g && g.name === 'Smoke folder' && g.items[0] === first);
      const second = lib.icons[1].id;
      await placeInMenu(second, 'root');
      step('the menu is separate from favourites', !isFav(second) && whereInMenu(second) && whereInMenu(second).g === null);
      await gripKey($(`[data-grip="group"][data-key="${CSS.escape(gid)}"]`), 1);
      step('arrow key moves the menu folder down', S.menuItems[1] && S.menuItems[1].id === gid);
      await saveMenu(nextAfterDrop({ kind: 'group', key: gid }, { kind: 'row', g: null, i: 0, t: 0 }));
      step('dropping the folder at the top puts it first', S.menuItems[0].id === gid && S.menuItems[1].id === second);
      const tid = await addTag('Smoke tag');
      await toggleTag(first, tid);
      S.filter = 'tag:' + tid; renderGrid();
      step('own tag created and used as a filter', document.querySelectorAll('#grid .tile').length === 1);
      S.filter = 'all'; renderChips(); renderGrid();
      if (S.testLibrary) {
        const other = await openPath(S.testLibrary);
        const badge = $(`.unsaved-badge[data-lib="${CSS.escape(other.id)}"]`);
        step('an opened folder shows as “Not saved”', !!badge && !S.libraries.find((l) => l.id === other.id).saved);
        click(badge);
        await new Promise((r) => setTimeout(r, 30));
        const save = $(`.askbox [data-action="save-lib"][data-lib="${CSS.escape(other.id)}"]`);
        step('clicking “Not saved” offers to save it', !!save);
        click(save);
        await new Promise((r) => setTimeout(r, 300));
        step('library location saved', S.libraries.find((l) => l.id === other.id).saved && !$('.unsaved-badge'));
        await toggleFav(currentLib().icons[0].id);
      }
      show('favourites');
      step('favourites gather icons from both libraries', document.querySelectorAll('#grid .tile').length === 2 && favLibraryCount() === 2);
      show('apply');
      await setStart(S.startFolder);
      const kids = S.tree.nodes[S.tree.root].children;
      const byName = (n) => kids.find((p) => baseName(p) === n);
      step('folder tree lists the test folders', byName('A') && byName('B') && byName('C'));
      S.selected = first;
      click($(`input[data-action="tick"][data-path="${CSS.escape(byName('A'))}"]`));
      click($(`input[data-action="tick"][data-path="${CSS.escape(byName('C'))}"]`), { shiftKey: true });
      step('Shift-click ticks a range', S.checked.has(byName('A')) && S.checked.has(byName('B')) && S.checked.has(byName('C')) && S.checked.size === 3);
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
      manageLibraries(); step('manage libraries lists both', document.querySelectorAll('.librow').length === 2);
      $('#modal-root').innerHTML = '';
      show('welcome'); step('welcome page', !!$('[data-action="get-started"]'));
      backToIcons();
    } catch (err) {
      step('unexpected error: ' + errText(err), false);
    }
    window.NI_TEST = { steps };
    return steps;
  },
};

start();
