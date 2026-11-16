/* Meet Abdalrahman: a 3D book you can open and turn, drawn with three.js.
   Each spread is painted onto a canvas (art + words), split into the two halves of a
   sheet, and the sheets bend as they turn. Progress P runs from 0 (closed) to N
   (last spread open); dragging scrubs P, releasing springs it to the nearest page.
   Build: npx esbuild book/src/main.js --bundle --minify --format=esm --outfile=book/book.js */
import {
    WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, PlaneGeometry, BoxGeometry,
    MeshStandardMaterial, CanvasTexture, SRGBColorSpace, DirectionalLight, AmbientLight,
    PCFSoftShadowMap, FrontSide, BackSide, Color, Vector3, ACESFilmicToneMapping, RepeatWrapping,
} from 'three';
import { PAGES, UI } from './content.js';

const root = document.documentElement;
const $ = s => document.querySelector(s);
const lang = () => (root.lang === 'ar' ? 'ar' : 'en');
const t = o => (o && typeof o === 'object' && 'en' in o) ? o[lang()] : o;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const num = n => lang() === 'ar' ? String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]) : String(n);

/* ------------------------------------------------------------------ layout */
const N = PAGES.length;             // spreads; sheets = N + 1 (front cover is sheet 0)
const SW = 2048, SH = Math.round(SW * 9.4 / 16), HW = SW / 2;
const PW = 1, PH = SH / HW;         // one page is 1 unit wide
const D = 0.0055;                   // sheet spacing in the stack
const SEG = 36;

/* ------------------------------------------------------------- the painter */
let textInCanvas = innerWidth > 760;
const images = new Map();
function loadImage(src) {
    if (images.has(src)) return images.get(src);
    const p = new Promise(res => { const i = new Image(); i.decoding = 'async'; i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
    images.set(src, p);
    return p;
}
function shade(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))));
    return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}
function placeholderSvg(p) {
    const b = p.bg, dark = shade(b, -.28), deep = shade(b, -.5), light = shade(b, .35), pale = shade(b, .6);
    const g = `<rect width="1600" height="940" fill="${b}"/><rect y="640" width="1600" height="300" fill="${dark}"/>
      <path d="M120 640V250a170 170 0 0 1 340 0v390z" fill="${pale}"/><path d="M140 640V255a150 150 0 0 1 300 0v385z" fill="${light}"/>
      <rect x="140" y="470" width="300" height="170" fill="${shade(b, .15)}"/><rect x="285" y="105" width="10" height="535" fill="${pale}"/><rect x="140" y="400" width="300" height="10" fill="${pale}"/>
      <circle cx="360" cy="230" r="34" fill="${pale}"/><rect x="420" y="600" width="420" height="22" rx="6" fill="${deep}"/>
      <rect x="455" y="622" width="18" height="230" fill="${deep}"/><rect x="790" y="622" width="18" height="230" fill="${deep}"/>
      <rect x="560" y="470" width="220" height="140" rx="10" fill="${deep}"/><rect x="574" y="484" width="192" height="102" rx="4" fill="${light}"/>
      <circle cx="510" cy="430" r="44" fill="${deep}"/><path d="M460 600c0-90 20-140 50-140s50 50 50 140z" fill="${deep}"/>`;
    const flip = p.side === 'left';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 940" width="1600" height="940">${flip ? `<g transform="translate(1600 0) scale(-1 1)">${g}</g>` : g}</svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
function cover(ctx, img, w, h, focus = '50% 50%') {
    const [fx, fy] = focus.split(' ').map(v => parseFloat(v) / 100);
    const s = Math.max(w / img.width, h / img.height);
    const dw = img.width * s, dh = img.height * s;
    ctx.drawImage(img, (w - dw) * fx, (h - dh) * fy, dw, dh);
}
function wrap(ctx, text, maxW) {
    const words = String(text).split(/\s+/), lines = [];
    let line = '';
    for (const w of words) {
        const test = line ? line + ' ' + w : w;
        if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
    }
    if (line) lines.push(line);
    return lines;
}
const sideFor = p => (lang() === 'ar' ? (p.side === 'left' ? 'right' : 'left') : p.side);

async function paintSpread(p, i) {
    const c = document.createElement('canvas'); c.width = SW; c.height = SH;
    const ctx = c.getContext('2d');
    ctx.fillStyle = p.bg; ctx.fillRect(0, 0, SW, SH);
    const art = (await loadImage(`/book/art/${p.id}.webp`)) || (await loadImage(placeholderSvg(p)));
    if (art) {
        // Arabic mirrors the layout, so mirror the art to keep the empty side under the words
        if (lang() === 'ar') { ctx.save(); ctx.translate(SW, 0); ctx.scale(-1, 1); cover(ctx, art, SW, SH, p.focus); ctx.restore(); }
        else cover(ctx, art, SW, SH, p.focus);
    }
    if (textInCanvas) {
        const ar = lang() === 'ar', side = sideFor(p);
        ctx.direction = ar ? 'rtl' : 'ltr';
        const boxW = SW * .40, x0 = side === 'right' ? SW * .55 : SW * .06;
        const startX = ar ? x0 + boxW : x0;
        ctx.textAlign = ar ? 'right' : 'left';
        ctx.textBaseline = 'alphabetic';
        const titleSize = p.emboss ? (ar ? 150 : 160) : (ar ? 112 : 124);
        ctx.font = `700 ${titleSize}px "Readex Pro"`;
        const titleText = p.emboss && !ar ? t(p.title).toUpperCase() : t(p.title);
        const tl = wrap(ctx, titleText, p.emboss ? SW * .44 : boxW);
        ctx.font = `400 ${ar ? 40 : 38}px "Readex Pro"`;
        const bl = wrap(ctx, t(p.body), boxW * .92);
        const lh = titleSize * (ar ? 1.25 : 1.02), blh = ar ? 66 : 58;
        const total = tl.length * lh + 50 + bl.length * blh;
        let y = SH / 2 - total / 2 + titleSize * .82;
        ctx.font = `700 ${titleSize}px "Readex Pro"`;
        for (const line of tl) {
            if (p.emboss) {
                const layers = ['#a9a092', '#bdb5a7', '#d4ccbe'];
                ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.fillText(line, startX + 4, y + 18);
                layers.forEach((col, k) => { ctx.fillStyle = col; ctx.fillText(line, startX, y + 9 - k * 3); });
                ctx.fillStyle = '#f8f3ea'; ctx.fillText(line, startX, y);
            } else { ctx.fillStyle = p.ink; ctx.fillText(line, startX, y); }
            y += lh;
        }
        y += 20 - lh + titleSize * .2;
        if (!p.emboss) { ctx.fillStyle = p.ink; ctx.globalAlpha = .7; ctx.fillRect(ar ? startX - 70 : startX, y, 70, 6); ctx.globalAlpha = 1; y += 30; }
        y += blh;
        ctx.font = `400 ${ar ? 40 : 38}px "Readex Pro"`;
        ctx.fillStyle = p.emboss ? '#fbf6ee' : p.ink;
        for (const line of bl) { ctx.fillText(line, startX, y); y += blh; }
    }
    // folio
    ctx.globalAlpha = .55; ctx.fillStyle = p.emboss ? '#fbf6ee' : p.ink; ctx.font = `400 30px "Readex Pro"`;
    ctx.textAlign = lang() === 'ar' ? 'right' : 'left'; ctx.direction = lang() === 'ar' ? 'rtl' : 'ltr';
    ctx.fillText(`${num(i + 1)} / ${num(N)}`, lang() === 'ar' ? SW - 60 : 60, SH - 56);
    ctx.globalAlpha = 1;
    // a soft fold shadow down the gutter, so the spread reads as paper
    const g = ctx.createLinearGradient(HW - 90, 0, HW + 90, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.5, 'rgba(0,0,0,.16)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(HW - 90, 0, 180, SH);
    return c;
}
async function paintCover(back) {
    const c = document.createElement('canvas'); c.width = HW; c.height = SH;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(HW * .4, SH * .25, 40, HW * .5, SH * .5, HW * .9);
    g.addColorStop(0, '#3b3b40'); g.addColorStop(1, '#151517');
    ctx.fillStyle = g; ctx.fillRect(0, 0, HW, SH);
    // linen grain
    for (let k = 0; k < 2600; k++) { ctx.fillStyle = `rgba(255,255,255,${Math.random() * .03})`; ctx.fillRect(Math.random() * HW, Math.random() * SH, 1 + Math.random() * 3, 1); }
    if (back) return c;
    const ar = lang() === 'ar';
    ctx.textAlign = 'center'; ctx.direction = ar ? 'rtl' : 'ltr';
    const abud = await loadImage('/assets/img/abud.png');
    ctx.font = '700 40px "Readex Pro"'; ctx.fillStyle = '#e9e5dc';
    const brand = t(UI.brand);
    const bw = ctx.measureText(brand).width;
    if (abud) { ctx.imageSmoothingEnabled = false; ctx.drawImage(abud, HW / 2 - bw / 2 - 42, SH * .27 - 40, 24, 47); }
    ctx.fillText(brand, HW / 2 + 12, SH * .27);
    ctx.fillStyle = '#ff7a2f'; ctx.fillText('.', HW / 2 + 12 + bw / 2 + 12, SH * .27);
    const lines = t(UI.coverLines);
    ctx.font = `700 ${ar ? 120 : 132}px "Readex Pro"`;
    let y = SH * .5 - (lines.length - 1) * 70;
    for (const line of lines) {
        ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillText(line, HW / 2 + 3, y + 8);
        ctx.fillStyle = '#8f8b84'; ctx.fillText(line, HW / 2, y + 3);
        ctx.fillStyle = '#ece8df'; ctx.fillText(line, HW / 2, y);
        y += ar ? 160 : 140;
    }
    ctx.font = '400 40px "Readex Pro"'; ctx.fillStyle = '#b8b4ac';
    ctx.fillText(t(UI.coverSub), HW / 2, y + 20);
    return c;
}
function half(canvas, right) {
    const c = document.createElement('canvas'); c.width = HW; c.height = SH;
    c.getContext('2d').drawImage(canvas, right ? HW : 0, 0, HW, SH, 0, 0, HW, SH);
    return c;
}

/* ------------------------------------------------------------------ scene */
const canvas = $('#scene');
const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
renderer.outputColorSpace = SRGBColorSpace;
renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new Scene();
scene.background = new Color('#0b0b0c');
const camera = new PerspectiveCamera(30, 1, .05, 50);
camera.up.set(0, 1, 0);

scene.add(new AmbientLight('#ffffff', 1.25));
const sun = new DirectionalLight('#fff4e6', 2.2);
sun.position.set(-1.6, -1.2, 4.2);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -2.5, right: 2.5, top: 2.5, bottom: -2.5, near: .5, far: 10 });
sun.shadow.radius = 6; sun.shadow.bias = -0.0008;
scene.add(sun);
scene.add(sun.target);

// the desk: dark wood with long diagonal brush strokes
function deskTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 1024;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#121213'; ctx.fillRect(0, 0, 1024, 1024);
    ctx.save(); ctx.translate(512, 512); ctx.rotate(-0.95); ctx.translate(-900, -900);
    for (let k = 0; k < 900; k++) {
        const y = Math.random() * 1800, w = 2 + Math.random() * 26, l = 200 + Math.random() * 1400, x = Math.random() * 1800 - 200;
        ctx.fillStyle = Math.random() < .55 ? `rgba(255,255,255,${.008 + Math.random() * .03})` : `rgba(0,0,0,${.15 + Math.random() * .35})`;
        ctx.fillRect(x, y, l, w);
    }
    ctx.restore();
    const tex = new CanvasTexture(c); tex.colorSpace = SRGBColorSpace; tex.wrapS = tex.wrapT = RepeatWrapping; tex.repeat.set(3, 3);
    return tex;
}
const desk = new Mesh(new PlaneGeometry(24, 24), new MeshStandardMaterial({ map: deskTexture(), roughness: .92, metalness: 0 }));
desk.receiveShadow = true;
scene.add(desk);

const book = new Group();
scene.add(book);

const paperEdge = new MeshStandardMaterial({ color: '#e6decd', roughness: .95 });
const boardMat = new MeshStandardMaterial({ color: '#19191b', roughness: .7 });
const spineMat = new MeshStandardMaterial({ color: '#ff7a2f', roughness: .55 });
// back board under the right stack, front board travels with the cover (sheet 0)
const backBoard = new Mesh(new BoxGeometry(PW + .03, PH + .04, .016), boardMat);
backBoard.position.set(PW / 2 + .005, 0, .008); backBoard.castShadow = backBoard.receiveShadow = true; book.add(backBoard);
const leftBoard = new Mesh(new BoxGeometry(PW + .03, PH + .04, .016), boardMat);
leftBoard.position.set(-PW / 2 - .005, 0, .008); leftBoard.receiveShadow = true; book.add(leftBoard);
const spine = new Mesh(new BoxGeometry(.022, PH + .04, .018), spineMat);
spine.position.set(-.006, 0, .009); spine.castShadow = true; book.add(spine);
const blockR = new Mesh(new BoxGeometry(PW, PH, 1), paperEdge); blockR.castShadow = blockR.receiveShadow = true; book.add(blockR);
const blockL = new Mesh(new BoxGeometry(PW, PH, 1), paperEdge); blockL.castShadow = blockL.receiveShadow = true; book.add(blockL);

class Sheet {
    constructor(i) {
        this.i = i;
        const geo = new PlaneGeometry(PW, PH, SEG, 1);
        geo.translate(PW / 2, 0, 0);
        this.base = geo.attributes.position.array.slice();
        this.geo = geo;
        this.front = new Mesh(geo, new MeshStandardMaterial({ side: FrontSide, roughness: .86, metalness: 0 }));
        this.back = new Mesh(geo, new MeshStandardMaterial({ side: BackSide, roughness: .86, metalness: 0 }));
        for (const m of [this.front, this.back]) { m.castShadow = true; m.receiveShadow = true; book.add(m); }
        this.turn = -1;
    }
    setTextures(frontCanvas, backCanvas) {
        const mk = c => { const tx = new CanvasTexture(c); tx.colorSpace = SRGBColorSpace; tx.anisotropy = 8; return tx; };
        this.front.material.map?.dispose(); this.back.material.map?.dispose();
        this.front.material.map = mk(frontCanvas);
        // the back is seen mirrored, so flip its texture
        const bt = mk(backCanvas); bt.wrapS = RepeatWrapping; bt.repeat.x = -1; this.back.material.map = bt;
        this.front.material.needsUpdate = this.back.material.needsUpdate = true;
    }
    pose(turn, zRight, zLeft) {
        if (Math.abs(turn - this.turn) < 1e-5 && this.zr === zRight && this.zl === zLeft) return;
        this.turn = turn; this.zr = zRight; this.zl = zLeft;
        const pos = this.geo.attributes.position.array;
        const theta = turn * Math.PI;
        const lift = Math.sin(turn * Math.PI);
        const curl = lift * 0.95;                       // how much the free edge trails behind
        const z0 = zRight + (zLeft - zRight) * turn + lift * .02;
        // walk along the page from the spine, bending as we go
        const xs = new Float32Array(SEG + 1), zs = new Float32Array(SEG + 1);
        let x = 0, z = 0;
        for (let k = 0; k <= SEG; k++) {
            xs[k] = x; zs[k] = z;
            const s = k / SEG;
            let a = theta - curl * Math.pow(s, 1.7) * (theta < Math.PI / 2 ? -0.35 : 1) * (1 - Math.abs(.5 - turn) * .6);
            a = Math.max(0, Math.min(Math.PI, a));
            const step = PW / SEG;
            x += Math.cos(a) * step; z += Math.sin(a) * step;
        }
        for (let v = 0; v < pos.length / 3; v++) {
            const bx = this.base[v * 3], by = this.base[v * 3 + 1];
            const k = Math.round(bx / PW * SEG);
            pos[v * 3] = xs[k]; pos[v * 3 + 1] = by; pos[v * 3 + 2] = z0 + zs[k];
        }
        this.geo.attributes.position.needsUpdate = true;
        this.geo.computeVertexNormals();
    }
}
const sheets = Array.from({ length: N + 1 }, (_, i) => new Sheet(i));

/* ------------------------------------------------------------- textures */
let painting = null;
async function paintAll() {
    textInCanvas = innerWidth > 760;
    await Promise.all([
        document.fonts.load('700 100px "Readex Pro"', 'Aa'), document.fonts.load('400 40px "Readex Pro"', 'Aa'),
        document.fonts.load('700 100px "Readex Pro"', 'عربي'), document.fonts.load('400 40px "Readex Pro"', 'عربي'),
    ]).catch(() => {});
    const spreads = await Promise.all(PAGES.map((p, i) => paintSpread(p, i)));
    const front = await paintCover(false), backC = await paintCover(true);
    sheets.forEach((s, i) => {
        const f = i === 0 ? front : half(spreads[i - 1], true);
        const b = i === N ? backC : half(spreads[i], false);
        s.setTextures(f, b);
    });
    needsRender = true;
}

/* -------------------------------------------------------------- motion */
let P = 0, V = 0, target = 0, dragging = false, needsRender = true, opened = false;
const smooth = x => x * x * (3 - 2 * x);

function layout() {
    const o = smooth(Math.min(1, Math.max(0, P)));   // 0 closed .. 1 open
    // stacks: sheets not yet turned lie on the right, turned ones on the left
    const leftCount = Math.max(0, Math.min(N + 1, Math.floor(P)));
    const rightCount = N + 1 - leftCount;
    sheets.forEach((s, i) => {
        const turn = Math.max(0, Math.min(1, P - i));
        const zR = .016 + (N - i) * D + .001, zL = .016 + i * D + .001;
        s.pose(turn, zR, zL);
    });
    // paper blocks fill the space under the top resting sheet on each side, so the stacks read as thick
    const topR = Number.isInteger(P) ? P : Math.floor(P) + 1;            // first sheet lying flat on the right
    const topL = Number.isInteger(P) ? P - 1 : Math.floor(P) - 1;      // last sheet lying flat on the left
    const hR = topR <= N ? (N - topR) * D + .0002 : 0;
    const hL = topL >= 0 ? topL * D + .0002 : 0;
    blockR.visible = hR > .0003; blockR.scale.z = Math.max(.0001, hR); blockR.position.set(PW / 2, 0, .016 + hR / 2);
    blockL.visible = hL > .0003; blockL.scale.z = Math.max(.0001, hL); blockL.position.set(-PW / 2, 0, .016 + hL / 2);
    leftBoard.visible = P > .02;
    // the book slides so whatever is open sits in the middle
    book.position.x = -PW / 2 * (1 - o);
    book.rotation.z = -0.28 * (1 - o);
    // camera: tilted over the closed book, straight down over the open one
    const aspect = camera.aspect, vfov = camera.fov * Math.PI / 180;
    const fitW = (PW * (1 + o)) * 1.12, fitH = PH * 1.16;
    const dist = Math.max(fitH / 2 / Math.tan(vfov / 2), fitW / 2 / (Math.tan(vfov / 2) * aspect));
    const closedDist = dist * 1.55;
    const d = closedDist + (dist - closedDist) * o;
    const tilt = (1 - o) * 0.95;                    // radians off vertical
    camera.position.set(0, -Math.sin(tilt) * d, Math.cos(tilt) * d);
    camera.lookAt(new Vector3(0, 0, 0));
}

let last = performance.now(), idle = 0;
function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!dragging) {
        if (reduced) { P = target; V = 0; }
        else {
            // critically damped spring toward the target page
            const k = opened && P >= .999 ? 13 : 7, c = 2 * Math.sqrt(k) * 1.02;   // slow, heavy paper; the cover is slower still
            V += ((target - P) * k - V * c) * dt;
            P += V * dt;
            if (Math.abs(target - P) < .0004 && Math.abs(V) < .0004) { P = target; V = 0; }
        }
    }
    const moving = P !== layout.lastP;
    if (moving || needsRender || !opened) {
        // the closed book breathes on the desk
        book.position.z = opened ? 0 : Math.sin(now / 1100) * .012 + .012;
        layout(); renderer.render(scene, camera);
        layout.lastP = P; needsRender = false; idle = 0;
        onProgress();
    } else if (++idle > 400) { idle = 0; }
    requestAnimationFrame(frame);

}

function resize() {
    const r = canvas.parentElement.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
    const nowText = innerWidth > 760;
    if (nowText !== textInCanvas) paintAll();
    needsRender = true;
}
addEventListener('resize', resize);

/* ------------------------------------------------------------------ UI */
const ctrls = $('#controls'), dots = $('#dots'), cap = $('#caption'), reading = $('#reading'), invite = $('#invite');
function current() { return Math.max(0, Math.min(N, Math.round(P))); }
let shown = -1;
function onProgress() {
    const c = current();
    if (c === shown) return;
    shown = c;
    dots.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-current', String(i === c - 1)));
    $('#prev').disabled = c <= 1; $('#next').disabled = c >= N;
    const p = PAGES[c - 1];
    if (p) {
        cap.innerHTML = `<h2>${esc(t(p.title))}</h2><p>${esc(t(p.body))}</p>`;
        reading.textContent = `${t(p.title)}. ${t(p.body)}`;
        $('#actions').innerHTML = (p.links || []).map(l => `<a class="${l.ghost ? 'ghost' : ''}" href="${l.href}" ${l.href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>${esc(l[lang()])}</a>`).join('');
    }
}
function go(i) { target = Math.max(1, Math.min(N, i)); }
function renderUI() {
    document.querySelectorAll('[data-t]').forEach(el => { const s = UI[el.dataset.t]; if (s) el.textContent = s[lang()]; });
    $('#lang').textContent = lang() === 'ar' ? 'English' : 'العربية';
    $('#lang').lang = lang() === 'ar' ? 'en' : 'ar';
    document.title = t(UI.docTitle);
    dots.innerHTML = PAGES.map((p, i) => `<button type="button" style="--c:${p.bg}" aria-label="${esc(t(UI.page))} ${num(i + 1)}: ${esc(t(p.title))}"></button>`).join('');
    dots.querySelectorAll('button').forEach((b, i) => b.addEventListener('click', () => go(i + 1)));
    $('#prev').setAttribute('aria-label', t(UI.prev)); $('#next').setAttribute('aria-label', t(UI.next));
    shown = -1; onProgress();
}

function open() {
    if (opened) return;
    opened = true;
    invite.classList.add('gone');
    document.body.classList.add('is-open');
    ctrls.hidden = false;
    target = 1;
    history.replaceState(null, '', '#read');
}
$('#openBtn').addEventListener('click', open);
$('#prev').addEventListener('click', () => go(Math.round(target) - 1));
$('#next').addEventListener('click', () => go(Math.round(target) + 1));

addEventListener('keydown', e => {
    if (!opened) { if ((e.key === 'Enter' || e.key === ' ') && e.target === document.body) { e.preventDefault(); open(); } return; }
    const fwd = 'ArrowRight', bwd = 'ArrowLeft';
    if (e.key === fwd || e.key === 'PageDown') { e.preventDefault(); go(Math.round(target) + 1); }
    if (e.key === bwd || e.key === 'PageUp') { e.preventDefault(); go(Math.round(target) - 1); }
    if (e.key === 'Home') go(1);
    if (e.key === 'End') go(N);
});

// drag the page: progress follows the finger, release springs to the nearest page
let sx = 0, sP = 0, lastX = 0, lastT = 0, vel = 0, moved = false;
canvas.addEventListener('pointerdown', e => {
    if (!opened) { open(); return; }
    dragging = true; moved = false; sx = lastX = e.clientX; sP = P; lastT = performance.now(); vel = 0;
    canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', e => {
    if (!dragging) return;
    const w = canvas.clientWidth * .45, dir = -1;
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 4) moved = true;
    P = Math.max(1, Math.min(N, sP + dir * dx / w));
    const now = performance.now();
    vel = (dir * (e.clientX - lastX) / w) / Math.max(.008, (now - lastT) / 1000);
    lastX = e.clientX; lastT = now;
});
function release(e) {
    if (!dragging) return;
    dragging = false;
    if (!moved) {
        // a click: the right half turns forward, the left half turns back
        const r = canvas.getBoundingClientRect();
        const right = e.clientX > r.left + r.width / 2;
        go(Math.round(P) + (right ? 1 : -1));
        return;
    }
    V = vel * .6;
    target = Math.max(1, Math.min(N, Math.round(P + vel * .12)));
}
canvas.addEventListener('pointerup', release);
canvas.addEventListener('pointercancel', release);

$('#lang').addEventListener('click', () => {
    const next = lang() === 'ar' ? 'en' : 'ar';
    root.lang = next; root.dir = next === 'ar' ? 'rtl' : 'ltr';
    try { localStorage.setItem('ab-lang', next); } catch (e) {}
    renderUI(); paintAll();
});

/* --------------------------------------------------------------- start */
renderUI();
resize();
paintAll().then(() => {
    $('#stage').classList.add('ready');
    if (location.hash === '#read') { opened = true; invite.classList.add('gone'); document.body.classList.add('is-open'); ctrls.hidden = false; P = target = 1; }
});
requestAnimationFrame(frame);

