#!/usr/bin/env node
// Builds the static documentation site from docs/*.md into docs/site/.
//
// Mobile-first, responsive, theme-aware, with a client-side search over every
// page. No framework and no dependency: see the note at the top of docs-lib.
//
//   node scripts/gen-docs.mjs        build
//   node scripts/gen-docs.mjs --serve  build, then serve on :4180

import { createServer } from 'node:http';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { listPages, plainText, readPage, render, resolveHref } from './docs-lib.mjs';
import {
  DOC_SECTIONS, sectionEmoji, sectionLabel, sectionRank,
} from '../src/data/docSections.js';

const OUT = join('docs', 'site');
const DOC_VERSION = '1.0.0';

// Chapters, their order and their labels come from `src/data/docSections.js`,
// shared with the app so the two cannot disagree about them.
const sectionIcon = sectionEmoji;

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Depth-aware path back to the site root, so every page is self-contained. */
const rootOf = (url) => '../'.repeat(url.split('/').length - 1) || './';

const CSS = `
:root{color-scheme:light dark;
--bg:#ffffff;--surface:#f6f7f9;--surface-2:#eceef2;--text:#16181d;--muted:#5b616e;
--border:#d8dbe2;--accent:#2f5bd8;--accent-soft:#e7edfd;--warn:#8a5300;--code:#f0f2f6;}
@media (prefers-color-scheme:dark){:root{
--bg:#12141a;--surface:#181b22;--surface-2:#20242d;--text:#e7e9ee;--muted:#9aa2b1;
--border:#2b303b;--accent:#89a8ff;--accent-soft:#1c2740;--warn:#e0a33a;--code:#1b1f27;}}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--text);
font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
overflow-wrap:break-word}
a{color:var(--accent)}
a:focus-visible,button:focus-visible,input:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.skip{position:absolute;left:-9999px}
.skip:focus{left:8px;top:8px;z-index:10;background:var(--surface);padding:8px 12px;border-radius:8px}
header.top{position:sticky;top:0;z-index:5;background:var(--surface);
border-bottom:1px solid var(--border);padding:10px 16px;display:flex;gap:12px;align-items:center}
header.top .brand{font-weight:700;text-decoration:none;color:var(--text);white-space:nowrap}
header.top .brand small{display:block;font-weight:400;font-size:11px;color:var(--muted)}
#q{flex:1;min-width:0;padding:9px 12px;border-radius:10px;border:1px solid var(--border);
background:var(--bg);color:var(--text);font-size:16px}
#menu-btn{display:none;background:var(--bg);color:var(--text);border:1px solid var(--border);
border-radius:10px;padding:9px 12px;font-size:16px;cursor:pointer}
.layout{display:grid;grid-template-columns:264px minmax(0,1fr);gap:28px;
max-width:1180px;margin:0 auto;padding:0 16px}
nav.side{position:sticky;top:61px;align-self:start;max-height:calc(100vh - 61px);
overflow-y:auto;padding:20px 0 40px;font-size:14px}
nav.side details{margin:0 0 2px}
nav.side summary{display:flex;align-items:center;gap:7px;cursor:pointer;list-style:none;
padding:8px 10px;border-radius:8px;font-weight:600;font-size:12px;text-transform:uppercase;
letter-spacing:.06em;color:var(--muted);user-select:none}
nav.side summary::-webkit-details-marker{display:none}
nav.side summary::after{content:'\u25B8';margin-left:auto;font-size:11px;opacity:.7;
transition:transform .15s ease}
nav.side details[open] summary::after{transform:rotate(90deg)}
nav.side summary:hover{background:var(--surface);color:var(--text)}
nav.side details.here summary{color:var(--text)}
nav.side .items{margin:2px 0 8px 15px;padding-left:11px;border-left:1px solid var(--border)}
nav.side details.here .items{border-left-color:var(--accent)}
nav.side a{display:block;padding:6px 10px;border-radius:8px;text-decoration:none;color:var(--text)}
nav.side a:hover{background:var(--surface)}
nav.side a[aria-current=page]{background:var(--accent-soft);color:var(--accent);font-weight:600}
main{min-width:0;padding:20px 0 64px}
.crumbs{font-size:13px;color:var(--muted);margin-bottom:14px}
.crumbs a{color:var(--muted)}
h1{font-size:1.9rem;line-height:1.25;margin:.2em 0 .5em}
h2{font-size:1.35rem;margin:1.9em 0 .5em;padding-top:.3em;border-top:1px solid var(--border)}
h3{font-size:1.1rem;margin:1.5em 0 .4em}
h4,h5,h6{font-size:1rem;margin:1.2em 0 .3em}
.anchor{margin-left:.4em;opacity:0;text-decoration:none;font-weight:400}
h2:hover .anchor,h3:hover .anchor,h4:hover .anchor{opacity:.45}
code{background:var(--code);padding:.12em .38em;border-radius:5px;font-size:.88em}
pre{background:var(--code);padding:14px;border-radius:10px;overflow-x:auto;
border:1px solid var(--border)}
pre code{background:none;padding:0;font-size:.85em;line-height:1.5}
blockquote{margin:1.2em 0;padding:2px 16px;border-left:3px solid var(--accent);
background:var(--surface);border-radius:0 8px 8px 0}
.table-wrap{overflow-x:auto;margin:1.2em 0;border:1px solid var(--border);border-radius:10px}
table{border-collapse:collapse;width:100%;font-size:.92rem}
th,td{padding:9px 12px;border-bottom:1px solid var(--border);vertical-align:top}
th{background:var(--surface);font-weight:600;white-space:nowrap}
tbody tr:last-child td{border-bottom:none}
hr{border:0;border-top:1px solid var(--border);margin:2em 0}
img{max-width:100%;height:auto;border-radius:10px}
ul,ol{padding-left:1.35em}
li{margin:.3em 0}
.toc{background:var(--surface);border:1px solid var(--border);border-radius:10px;
padding:12px 16px;margin:0 0 24px;font-size:.92rem}
.toc b{display:block;font-size:12px;text-transform:uppercase;letter-spacing:.06em;
color:var(--muted);margin-bottom:6px}
.toc ul{list-style:none;padding:0;margin:0}
.toc li{margin:.2em 0}
.toc li.l3{padding-left:14px;font-size:.9em}
.pager{display:flex;gap:12px;margin-top:44px;padding-top:20px;border-top:1px solid var(--border)}
.pager a{flex:1;padding:12px 14px;border:1px solid var(--border);border-radius:10px;
text-decoration:none;font-size:.9rem;background:var(--surface)}
.pager a.next{text-align:right}
.pager span{display:block;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}
footer{max-width:1180px;margin:0 auto;padding:24px 16px 48px;font-size:12px;
color:var(--muted);border-top:1px solid var(--border)}
#results{position:absolute;left:0;right:0;top:100%;background:var(--bg);
border:1px solid var(--border);border-radius:0 0 12px 12px;max-height:70vh;overflow-y:auto;
box-shadow:0 12px 30px rgba(0,0,0,.18);display:none}
#results.on{display:block}
#results a{display:block;padding:11px 16px;text-decoration:none;color:var(--text);
border-bottom:1px solid var(--border)}
#results a:hover,#results a:focus{background:var(--surface)}
#results .t{font-weight:600;font-size:.95rem}
#results .c{font-size:11px;color:var(--accent);text-transform:uppercase;letter-spacing:.05em}
#results .x{font-size:.85rem;color:var(--muted);margin-top:2px}
#results .none{padding:16px;color:var(--muted);font-size:.9rem}
@media(max-width:860px){
 .layout{grid-template-columns:minmax(0,1fr);gap:0}
 #menu-btn{display:block}
 nav.side{display:none;position:static;max-height:none;border-bottom:1px solid var(--border)}
 nav.side.on{display:block}
 h1{font-size:1.55rem}
 header.top{position:sticky}
}
@media print{header.top,nav.side,.pager,#results{display:none}.layout{display:block}}
`;

const JS = `
(function(){
 var root=document.documentElement.getAttribute('data-root')||'./';
 var q=document.getElementById('q'),box=document.getElementById('results'),idx=null;
 var mb=document.getElementById('menu-btn'),side=document.querySelector('nav.side');
 if(mb)mb.addEventListener('click',function(){side.classList.toggle('on');
  mb.setAttribute('aria-expanded',side.classList.contains('on'));});
 function norm(s){return s.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase();}
 function load(){if(idx)return Promise.resolve(idx);
  return fetch(root+'search-index.json').then(function(r){return r.json();})
   .then(function(d){idx=d;return d;}).catch(function(){return [];});}
 function run(){
  var raw=q.value.trim();
  if(raw.length<2){box.classList.remove('on');box.innerHTML='';return;}
  load().then(function(data){
   var terms=norm(raw).split(/\\s+/).filter(Boolean);
   var hits=[];
   for(var i=0;i<data.length;i++){var p=data[i],s=0,ok=true;
    for(var t=0;t<terms.length;t++){var k=terms[t];
     if(p.nt.indexOf(k)>=0)s+=12;else if(p.nd.indexOf(k)>=0)s+=6;
     else if(p.nh.indexOf(k)>=0)s+=4;else if(p.nb.indexOf(k)>=0)s+=1;else{ok=false;break;}}
    if(ok)hits.push({p:p,s:s});}
   hits.sort(function(a,b){return b.s-a.s;});
   if(!hits.length){box.innerHTML='<div class="none">Aucun résultat pour « '+
    raw.replace(/[<>&]/g,'')+' ».</div>';box.classList.add('on');return;}
   box.innerHTML=hits.slice(0,14).map(function(h){
    return '<a href="'+root+h.p.u+'"><span class="c">'+h.p.s+'</span>'+
     '<div class="t">'+h.p.t+'</div><div class="x">'+h.p.d+'</div></a>';}).join('');
   box.classList.add('on');});
 }
 if(q){q.addEventListener('input',run);q.addEventListener('focus',load);
  document.addEventListener('click',function(e){
   if(!box.contains(e.target)&&e.target!==q)box.classList.remove('on');});
  document.addEventListener('keydown',function(e){
   if(e.key==='Escape'){box.classList.remove('on');q.blur();}
   if(e.key==='/'&&document.activeElement!==q){e.preventDefault();q.focus();}});}
})();
`;

/**
 * The sidebar: one collapsible section per chapter, so 69 pages stay scannable.
 *
 * `<details>` rather than a scripted accordion — it is keyboard-navigable and
 * focus-searchable for free, and the sidebar must keep working in the printed
 * and no-JavaScript cases. The chapter holding the current page is the one
 * left open, which needs no persistence: clicking a link inside a chapter
 * makes that chapter current, so it stays open on the page it led to.
 */
function nav(pages, current) {
  const bySection = new Map();
  for (const p of pages) {
    if (!bySection.has(p.section)) bySection.set(p.section, []);
    bySection.get(p.section).push(p);
  }
  const root = rootOf(current.url);
  const out = [];
  for (const { key } of DOC_SECTIONS) {
    const group = bySection.get(key);
    if (!group) continue;
    group.sort((a, b) => a.ordre - b.ordre || a.rel.localeCompare(b.rel));
    const links = group.map((p) => {
      const cur = p.url === current.url ? ' aria-current="page"' : '';
      return `<a href="${root}${p.url}"${cur}>${esc(p.titre)}</a>`;
    }).join('\n');
    // The root page has no chapter of its own; it stays a plain top-level link.
    if (key === '') { out.push(links); continue; }
    const here = group.some((p) => p.url === current.url);
    out.push(`<details${here ? ' open' : ''}${here ? ' class="here"' : ''}>`
      + `<summary>${sectionIcon(key)} ${esc(sectionLabel(key))}</summary>`
      + `<div class="items">${links}</div></details>`);
  }
  return out.join('\n');
}

function crumbs(page) {
  const root = rootOf(page.url);
  const parts = [`<a href="${root}index.html">Documentation</a>`];
  if (page.section) {
    const isIndex = page.rel.endsWith('/index.md');
    parts.push(isIndex
      ? esc(sectionLabel(page.section))
      : `<a href="${root}${page.section}/index.html">${esc(sectionLabel(page.section))}</a>`);
    if (!isIndex) parts.push(esc(page.titre));
  }
  return `<nav class="crumbs" aria-label="Fil d'Ariane">${parts.join(' › ')}</nav>`;
}

// Heading text as plain words: a table of contents shows titles, not the
// Markdown they were written in.
const tocText = (s) => s.replace(/`([^`]+)`/g, '$1').replace(/\*\*?/g, '');

function toc(headings) {
  const items = headings.filter((h) => h.level === 2 || h.level === 3);
  if (items.length < 3) return '';
  return `<nav class="toc" aria-label="Sur cette page"><b>Sur cette page</b><ul>${
    items.map((h) => (
      `<li class="l${h.level}"><a href="#${h.id}">${esc(tocText(h.text))}</a></li>`)).join('')
  }</ul></nav>`;
}

function pager(pages, i) {
  const cur = pages[i];
  const root = rootOf(cur.url);
  const prev = pages[i - 1];
  const next = pages[i + 1];
  if (!prev && !next) return '';
  const a = prev
    ? `<a class="prev" href="${root}${prev.url}"><span>Précédent</span>${esc(prev.titre)}</a>`
    : '<span style="flex:1"></span>';
  const b = next
    ? `<a class="next" href="${root}${next.url}"><span>Suivant</span>${esc(next.titre)}</a>`
    : '<span style="flex:1"></span>';
  return `<nav class="pager" aria-label="Pages">${a}${b}</nav>`;
}

// The table of contents belongs under the H1, not between the breadcrumb and
// the title — so it is spliced in rather than prepended.
function withToc(body, headings) {
  const nav = toc(headings);
  if (!nav) return body;
  const end = body.indexOf('</h1>');
  return end === -1 ? nav + body : body.slice(0, end + 5) + nav + body.slice(end + 5);
}

function page(p, body, headings, pages, i, buildDate) {
  const root = rootOf(p.url);
  const title = p.url === 'index.html' ? p.titre : `${p.titre} — Documentation Musculator`;
  return `<!doctype html>
<html lang="fr" data-root="${root}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(p.description)}">
<meta property="og:title" content="${esc(p.titre)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:type" content="article">
<link rel="canonical" href="${p.url}">
<style>${CSS}</style>
</head>
<body>
<a class="skip" href="#contenu">Aller au contenu</a>
<header class="top">
  <a class="brand" href="${root}index.html">Musculator<small>Documentation</small></a>
  <div style="position:relative;flex:1;min-width:0">
    <input id="q" type="search" placeholder="Rechercher…  (touche /)"
      aria-label="Rechercher dans la documentation" autocomplete="off">
    <div id="results" role="listbox" aria-label="Résultats"></div>
  </div>
  <button id="menu-btn" type="button" aria-expanded="false" aria-label="Sommaire">☰</button>
</header>
<div class="layout">
  <nav class="side" aria-label="Sommaire">${nav(pages, p)}</nav>
  <main id="contenu">
    ${crumbs(p)}
    ${withToc(body, headings)}
    ${pager(pages, i)}
  </main>
</div>
<footer>
  Documentation Musculator ${DOC_VERSION} · générée le ${buildDate} ·
  <a href="${root}legal/index.html">Informations légales</a> ·
  <a href="${root}support/index.html">Support</a><br>
  Générée depuis <code>docs/</code> par <code>npm run docs:build</code> — ne pas modifier
  les fichiers de <code>docs/site/</code> à la main.
</footer>
<script>${JS}</script>
</body>
</html>
`;
}

function build() {
  const files = listPages();
  const pages = files.map(readPage)
    .sort((a, b) => sectionRank(a.section) - sectionRank(b.section)
      || a.ordre - b.ordre
      || a.rel.localeCompare(b.rel));

  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });

  const buildDate = new Date().toLocaleDateString('fr-FR', { dateStyle: 'long' });
  const index = [];
  const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  pages.forEach((p, i) => {
    const { html, headings } = render(p.body, { href: resolveHref });
    const out = join(OUT, p.url);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, page(p, html, headings, pages, i, buildDate));
    const text = plainText(p.body);
    index.push({
      u: p.url,
      t: p.titre,
      d: p.description,
      s: sectionLabel(p.section),
      nt: norm(p.titre),
      nd: norm(p.description),
      nh: norm(headings.map((h) => h.text).join(' ')),
      nb: norm(text).slice(0, 6000),
    });
  });

  writeFileSync(join(OUT, 'search-index.json'), JSON.stringify(index));

  // Screenshots already live in docs/screenshots and are referenced by the
  // README; they are copied rather than moved so nothing there breaks.
  if (existsSync(join('docs', 'screenshots'))) {
    cpSync(join('docs', 'screenshots'), join(OUT, 'assets', 'screenshots'), { recursive: true });
  }

  console.log(`docs: ${pages.length} pages -> ${OUT}/`);
  return pages;
}

function serve(port = 4180) {
  const types = {
    '.html': 'text/html; charset=utf-8', '.json': 'application/json; charset=utf-8',
    '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png',
    '.webp': 'image/webp', '.svg': 'image/svg+xml',
  };
  createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const file = resolve(OUT, `.${p}`);
    if (!file.startsWith(resolve(OUT)) || !existsSync(file)) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('404');
      return;
    }
    res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
    res.end(readFileSync(file));
  }).listen(port, () => console.log(`docs: http://localhost:${port}/`));
}

build();
if (process.argv.includes('--serve')) serve();
