/* Meet Abdalrahman: a 3D book you can open and turn, drawn with three.js.
   Each spread is painted onto a canvas (art + words), split into the two halves of a
   sheet, and the sheets bend as they turn. Progress P runs from 0 (closed) to N
   (last spread open); dragging scrubs P, releasing springs it to the nearest page.
   Build: npx esbuild book/src/main.js --bundle --minify --format=esm --outfile=book/book.js */
import {
    WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, PlaneGeometry, BoxGeometry,
    MeshStandardMaterial, MeshBasicMaterial, AdditiveBlending, ShadowMaterial, CanvasTexture, SRGBColorSpace, DirectionalLight, AmbientLight,
    PCFSoftShadowMap, FrontSide, BackSide, Color, Vector3, ACESFilmicToneMapping, RepeatWrapping,
} from 'three';
import { RoundedBoxGeometry } from '/home/claude/threedl/package/examples/jsm/geometries/RoundedBoxGeometry.js';
import { PAGES, UI } from './content.js';
import { sceneSvg } from './scenes.js';

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
const SEG = 72;

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
const placeholderSvg = p => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sceneSvg(p));
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
    {
        // phones get the words in the page too, lettered larger and in a wider column
        const k = textInCanvas ? 1 : 1.35;
        const ar = lang() === 'ar', side = sideFor(p);
        ctx.direction = ar ? 'rtl' : 'ltr';
        ctx.textAlign = ar ? 'right' : 'left';
        ctx.textBaseline = 'alphabetic';
        // a column in the empty half, kept well away from the fold and the edge
        const colW = SW * (k > 1 ? .41 : .34), colX = side === 'right' ? SW * (k > 1 ? .55 : .585) : SW * (k > 1 ? .045 : .075);
        const x = ar ? colX + colW : colX;
        const titleText = p.emboss && !ar ? t(p.title).toUpperCase() : t(p.title);
        let size = Math.round((p.emboss ? (ar ? 132 : 138) : (ar ? 104 : 112)) * k);
        let tl;
        for (; size > 60; size -= 4) {
            ctx.font = `700 ${size}px "Readex Pro"`;
            tl = wrap(ctx, titleText, colW);
            if (tl.length <= (k > 1 ? 4 : 3) && tl.every(l => ctx.measureText(l).width <= colW * 1.02)) break;
        }
        const lh = size * (ar ? 1.28 : 1.0);
        const bodySize = Math.round((ar ? 40 : 38) * k), blh = Math.round((ar ? 66 : 58) * k);
        ctx.font = `400 ${bodySize}px "Readex Pro"`;
        const bl = wrap(ctx, t(p.body), colW * .94);
        const gap = p.emboss ? 54 : 96;
        const total = tl.length * lh + gap + bl.length * blh;
        let y = SH * .5 - total / 2 + size * .8;
        ctx.font = `700 ${size}px "Readex Pro"`;
        for (const line of tl) {
            if (p.emboss) {
                // letters standing off the page: two soft steps of the page colour, then a gentle shadow
                ctx.save();
                ctx.shadowColor = 'rgba(0,0,0,.28)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 12;
                ctx.fillStyle = shade(p.bg, -.35); ctx.fillText(line, x, y + 7);
                ctx.restore();
                ctx.fillStyle = shade('#efe8dc', -.12); ctx.fillText(line, x, y + 3.5);
                ctx.fillStyle = '#f6f1e8'; ctx.fillText(line, x, y);
            } else { ctx.fillStyle = p.ink; ctx.fillText(line, x, y); }
            y += lh;
        }
        y += gap - lh + size * .2;
        if (!p.emboss) { ctx.fillStyle = p.ink; ctx.globalAlpha = .6; ctx.fillRect(ar ? x - 64 : x, y - 30, 64, 5); ctx.globalAlpha = 1; y += 16; }
        y += bodySize * .4;
        ctx.font = `400 ${bodySize}px "Readex Pro"`;
        ctx.fillStyle = p.emboss ? 'rgba(250,246,238,.92)' : p.ink;
        for (const line of bl) { ctx.fillText(line, x, y); y += blh; }
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
    const art = back ? null : await loadImage('/book/art/cover.webp');
    ctx.fillStyle = '#1e3a2f'; ctx.fillRect(0, 0, HW, SH);
    if (art) cover(ctx, art, HW, SH, '50% 100%');
    else {
        const g = ctx.createRadialGradient(HW * .5, SH * .3, 40, HW * .5, SH * .5, HW * .95);
        g.addColorStop(0, '#2b4a3d'); g.addColorStop(1, '#152a22');
        ctx.fillStyle = g; ctx.fillRect(0, 0, HW, SH);
    }
    // worn, hand-painted edges: darker brushed rim so the cover reads as painted cloth, not a flat print
    for (let k = 0; k < 900; k++) {
        const side = k % 4, t = Math.random(), w = 6 + Math.random() * 40;
        const x = side === 0 ? Math.random() * w : side === 1 ? HW - Math.random() * w : t * HW;
        const y = side === 2 ? Math.random() * w : side === 3 ? SH - Math.random() * w : t * SH;
        ctx.fillStyle = `rgba(8,20,14,${.04 + Math.random() * .08})`;
        ctx.beginPath(); ctx.ellipse(x, y, 8 + Math.random() * 30, 3 + Math.random() * 8, Math.random() * 3, 0, 7); ctx.fill();
    }
    ctx.strokeStyle = 'rgba(232,190,110,.55)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(HW * .045, SH * .035, HW * .91, SH * .93, 18); ctx.stroke();
    // cloth grain over everything, so art and board read as one cover
    for (let k = 0; k < 3200; k++) { ctx.fillStyle = `rgba(255,255,255,${Math.random() * .025})`; ctx.fillRect(Math.random() * HW, Math.random() * SH, 1 + Math.random() * 3, 1); }
    if (back) return c;
    // warm lamp wash so the cover reads lit, like the pages inside
    { const g = ctx.createRadialGradient(HW * .55, SH * .55, 40, HW * .55, SH * .55, HW * .85);
      g.addColorStop(0, 'rgba(255,214,150,.22)'); g.addColorStop(1, 'rgba(255,214,150,0)');
      ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(0, 0, HW, SH); ctx.globalCompositeOperation = 'source-over'; }
    const ar = lang() === 'ar';
    // a hand-painted paper ribbon above the arch carries the title
    const rx = HW * .08, rw = HW * .84, ry = SH * .075, rh = SH * .205, notch = 34;
    const wob = (v, a) => v + (Math.random() - .5) * a;
    const ribbon = () => {
        ctx.beginPath();
        ctx.moveTo(wob(rx, 3), wob(ry, 3));
        for (let k = 1; k <= 12; k++) ctx.lineTo(rx + rw * k / 12, wob(ry + Math.sin(k / 12 * Math.PI) * -6, 3));
        ctx.lineTo(rx + rw - notch, ry + rh / 2);
        ctx.lineTo(wob(rx + rw, 3), wob(ry + rh, 3));
        for (let k = 11; k >= 0; k--) ctx.lineTo(rx + rw * k / 12, wob(ry + rh + Math.sin(k / 12 * Math.PI) * -6, 3));
        ctx.lineTo(rx + notch, ry + rh / 2);
        ctx.closePath();
    };
    ctx.save(); ctx.translate(6, 10); ribbon(); ctx.fillStyle = 'rgba(10,20,14,.45)'; ctx.fill(); ctx.restore();
    ribbon();
    const rg = ctx.createLinearGradient(0, ry, 0, ry + rh);
    rg.addColorStop(0, '#f8ecd0'); rg.addColorStop(1, '#e6d3a8');
    ctx.fillStyle = rg; ctx.fill();
    ctx.save(); ctx.clip();
    for (let k = 0; k < 260; k++) { ctx.fillStyle = `rgba(150,110,60,${Math.random() * .07})`; ctx.beginPath(); ctx.ellipse(rx + Math.random() * rw, ry + Math.random() * rh, 10 + Math.random() * 30, 2 + Math.random() * 6, Math.random() * 3, 0, 7); ctx.fill(); }
    ctx.restore();
    ctx.lineWidth = 5; ctx.strokeStyle = '#3a2a1c'; ctx.lineJoin = 'round'; ribbon(); ctx.stroke();
    // title, lettered in the storybook face, shrunk to sit inside the ribbon
    ctx.textAlign = 'center'; ctx.direction = ar ? 'rtl' : 'ltr'; ctx.textBaseline = 'middle';
    const lines = t(UI.coverLines), maxW = rw - notch * 2 - 50;
    let size = ar ? 88 : 92;
    const fit = () => { ctx.font = `800 ${size}px "Baloo Bhaijaan 2", "Readex Pro"`; return Math.max(...lines.map(l => ctx.measureText(l).width)); };
    while (fit() > maxW && size > 40) size -= 2;
    const lh = size * (ar ? 1.05 : .98);
    let y = ry + rh / 2 - lh * (lines.length - 1) / 2 + size * .06;
    for (const line of lines) {
        ctx.fillStyle = '#c0472a'; ctx.fillText(line, HW / 2 + 3, y + 4);
        ctx.fillStyle = '#2b241b'; ctx.fillText(line, HW / 2, y);
        y += lh;
    }
    ctx.textBaseline = 'alphabetic';
    // a small painted star seal under the ribbon
    ctx.fillStyle = '#e8b65a'; ctx.beginPath();
    for (let k = 0; k < 10; k++) { const r = k % 2 ? 9 : 22, a = k / 10 * Math.PI * 2 - Math.PI / 2; ctx.lineTo(HW / 2 + Math.cos(a) * r, ry + rh + 34 + Math.sin(a) * r); }
    ctx.fill(); ctx.lineWidth = 3; ctx.stroke();
    return c;
}
function half(canvas, right) {
    const c = document.createElement('canvas'); c.width = HW; c.height = SH;
    c.getContext('2d').drawImage(canvas, right ? HW : 0, 0, HW, SH, 0, 0, HW, SH);
    return c;
}

/* ------------------------------------------------------------------ scene */
const canvas = $('#scene');
const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
renderer.outputColorSpace = SRGBColorSpace;
renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = .95;   // night: match the painted backdrop

const scene = new Scene();
renderer.setClearColor(0x000000, 0);
const camera = new PerspectiveCamera(30, 1, .05, 50);
camera.up.set(0, 1, 0);

scene.add(new AmbientLight('#c4c6dc', .85));                 // cool night fill
const moon = new DirectionalLight('#9fb4ff', .45); moon.position.set(-2, 3, 3); scene.add(moon);
const sun = new DirectionalLight('#ffcf94', 2.5);               // warm lantern light from the right
sun.position.set(2.2, 1.4, 3.6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -2.5, right: 2.5, top: 2.5, bottom: -2.5, near: .5, far: 10 });
sun.shadow.radius = 10; sun.shadow.blurSamples = 16; sun.shadow.bias = -0.0008;
scene.add(sun);
scene.add(sun.target);

// the floor only catches the book's shadow; the painted scene behind is a flat CSS backdrop, so it stays sharp
const desk = new Mesh(new PlaneGeometry(24, 24), new ShadowMaterial({ opacity: .6 }));
const contact = (() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256;
    const g = c.getContext('2d'), r = g.createRadialGradient(128, 128, 10, 128, 128, 128);
    r.addColorStop(0, 'rgba(6,5,4,.9)'); r.addColorStop(.5, 'rgba(6,5,4,.5)'); r.addColorStop(1, 'rgba(10,8,6,0)');
    g.fillStyle = r; g.fillRect(0, 0, 256, 256);
    const tex = new CanvasTexture(c);
    const m = new Mesh(new PlaneGeometry(PW * 1.5, PH * 1.35), new MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    m.position.z = .0008; scene.add(m); return m;
})();
// warm light pool on the stone around the book
const glow = (() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256;
    const g = c.getContext('2d'), r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    r.addColorStop(0, 'rgba(255,190,120,.32)'); r.addColorStop(1, 'rgba(255,190,120,0)');
    g.fillStyle = r; g.fillRect(0, 0, 256, 256);
    const m = new Mesh(new PlaneGeometry(PW * 4.5, PH * 3), new MeshBasicMaterial({ map: new CanvasTexture(c), transparent: true, depthWrite: false, blending: AdditiveBlending }));
    m.position.set(PW * .3, .1, .0004); scene.add(m); return m;
})();
desk.receiveShadow = true;
scene.add(desk);

const book = new Group();
scene.add(book);

// painted materials: cloth-green boards, warm gilt spine, page edges with soft hand-ruled lines
const edgeTex = (() => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 256;
    const g = c.getContext('2d'); g.fillStyle = '#efe2c4'; g.fillRect(0, 0, 64, 256);
    for (let y = 0; y < 256; y += 3) { g.fillStyle = `rgba(120,95,60,${.06 + Math.random() * .1})`; g.fillRect(0, y, 64, 1); }
    const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; t.wrapS = t.wrapT = RepeatWrapping; return t;
})();
const paperEdge = new MeshStandardMaterial({ color: '#ffffff', map: edgeTex, roughness: 1 });
const boardMat = new MeshStandardMaterial({ color: '#2c5442', roughness: 1 });
const spineMat = new MeshStandardMaterial({ color: '#b98a45', roughness: .9 });
// back board under the right stack, front board travels with the cover (sheet 0)
const backBoard = new Mesh(new RoundedBoxGeometry(PW + .03, PH + .04, .016, 3, .007), boardMat);
backBoard.position.set(PW / 2 + .005, 0, .008); backBoard.castShadow = backBoard.receiveShadow = true; book.add(backBoard);
const leftBoard = new Mesh(new RoundedBoxGeometry(PW + .03, PH + .04, .016, 3, .007), boardMat);
leftBoard.position.set(-PW / 2 - .005, 0, .008); leftBoard.receiveShadow = true; book.add(leftBoard);
const spine = new Mesh(new BoxGeometry(.02, PH - .02, .016), spineMat);
spine.position.set(-.012, 0, .008); spine.castShadow = true; book.add(spine);
// a ribbon bookmark hanging out of the closed book
const bookmark = new Mesh(new PlaneGeometry(.045, .2), new MeshStandardMaterial({ color: '#b8461f', roughness: 1, side: 2 }));
bookmark.position.set(PW * .72, -PH / 2 - .07, .02); bookmark.rotation.z = .12; bookmark.castShadow = true; book.add(bookmark);
const blockR = new Mesh(new BoxGeometry(PW, PH, 1), paperEdge); blockR.castShadow = blockR.receiveShadow = true; book.add(blockR);
const blockL = new Mesh(new BoxGeometry(PW, PH, 1), paperEdge); blockL.castShadow = blockL.receiveShadow = true; book.add(blockL);

class Sheet {
    constructor(i) {
        this.i = i;
        const geo = new PlaneGeometry(PW, PH, SEG, 1);
        geo.translate(PW / 2, 0, 0);
        this.base = geo.attributes.position.array.slice();
        this.geo = geo;
        this.front = new Mesh(geo, new MeshStandardMaterial({ side: FrontSide, roughness: 1, metalness: 0 }));
        this.back = new Mesh(geo, new MeshStandardMaterial({ side: BackSide, roughness: 1, metalness: 0 }));
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
        // the page bows up as it lifts, then its edge trails as it falls; blend the two so nothing snaps at the top
        const m = Math.min(1, Math.max(0, (turn - .2) / .6)), bow = -0.35 + 1.35 * m * m * (3 - 2 * m);
        const z0 = zRight + (zLeft - zRight) * turn + lift * .02;
        // walk along the page from the spine, bending as we go
        const xs = new Float32Array(SEG + 1), zs = new Float32Array(SEG + 1);
        let x = 0, z = 0;
        for (let k = 0; k <= SEG; k++) {
            xs[k] = x; zs[k] = z;
            const s = k / SEG;
            let a = theta - curl * Math.pow(s, 1.7) * bow * (1 - Math.abs(.5 - turn) * .6);
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
        document.fonts.load('800 90px "Baloo Bhaijaan 2"', 'Aa'), document.fonts.load('800 90px "Baloo Bhaijaan 2"', 'عربي'), document.fonts.load('700 100px "Readex Pro"', 'Aa'), document.fonts.load('400 40px "Readex Pro"', 'Aa'),
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
let turn = null; let P = 0, V = 0, target = 0, dragging = false, needsRender = true, opened = false, opening = null;
const easeInOutSine = x => -(Math.cos(Math.PI * x) - 1) / 2;
const easeInOut = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
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
    bookmark.visible = P < .04;
    // the book slides so whatever is open sits in the middle
    book.position.x = -PW / 2 * (1 - o);
    book.rotation.z = 0;
    // camera: tilted over the closed book, straight down over the open one
    const aspect = camera.aspect, vfov = camera.fov * Math.PI / 180;
    const fitW = (PW * (1 + o)) * 1.12 / view.wFrac, fitH = PH * 1.16 / view.hFrac;
    const dist = Math.max(fitH / 2 / Math.tan(vfov / 2), fitW / 2 / (Math.tan(vfov / 2) * aspect));
    const closedDist = dist * 1.3;
    const d = closedDist + (dist - closedDist) * o;
    const tilt = 0;                                  // straight on, like a painted book standing against the wall
    camera.position.set(0, -Math.sin(tilt) * d, Math.cos(tilt) * d);
    camera.lookAt(new Vector3(0, 0, 0));
    // the closed book rests low, on the rooftop floor of the painting; it rises to centre as it opens
    if (view.W) { camera.setViewOffset(view.W, view.H, 0, -view.dy - (1 - o) * .08 * view.H, view.W, view.H); }
}

let last = performance.now(), idle = 0;
function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (opening) {
        // the first open is a planned move, not a spring: the cover swings while the camera glides over
        const k = Math.min(1, (now - opening) / 2400);
        P = easeInOut(k); V = 0;
        if (k >= 1) { opening = null; P = target = 1; }
    } else if (turn && !dragging) {
        const k = Math.min(1, (now - turn.t0) / turn.dur);
        P = turn.from + (turn.to - turn.from) * easeInOutSine(k); V = 0;
        if (k >= 1) { P = target = turn.to; turn = null; }
    } else if (!dragging) {
        {
            // critically damped spring toward the target page
            const k = 13, c = 2 * Math.sqrt(k) * 1.02;   // slow, heavy paper
            V += ((target - P) * k - V * c) * dt;
            P += V * dt;
            if (Math.abs(target - P) < .0004 && Math.abs(V) < .0004) { P = target; V = 0; }
        }
    }
    const moving = P !== layout.lastP;
    if (moving || needsRender || !opened) {
        // the closed book breathes on the desk
        book.position.z = opened ? 0 : Math.sin(now / 1100) * .012 + .012;
        const op = Math.min(1, P);
        contact.position.x = PW / 2 * (1 - op) + .03; contact.scale.set(1 + op * 1.05, 1, 1);
        layout(); renderer.render(scene, camera);
        layout.lastP = P; needsRender = false; idle = 0;
        onProgress();
    } else if (++idle > 400) { idle = 0; }
    requestAnimationFrame(frame);

}

// the canvas fills the window; the book is framed inside the stage area between header and controls
const view = { wFrac: 1, hFrac: 1 };
function resize() {
    const W = innerWidth, H = innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    const r = $('#stage').getBoundingClientRect();
    view.hFrac = Math.max(.4, r.height / H); view.wFrac = 1;
    const dy = (r.top + r.height / 2) - H / 2;          // stage centre below the window centre
    view.W = W; view.H = H; view.dy = dy;
    camera.setViewOffset(W, H, 0, -dy, W, H);
    camera.updateProjectionMatrix();
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
        $('#actions').innerHTML = (p.links || []).map(l => `<a class="painted ${l.ghost ? 'ghost' : ''}" style="${l.ghost ? '' : `--c:${p.bg};--t:${p.ink}`}" href="${l.href}" ${l.href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>${esc(l[lang()])}</a>`).join('');
    }
}
function go(i) {
    target = Math.max(1, Math.min(N, i));
    if (opening || dragging || target === P) return;
    const span = Math.abs(target - P);
    turn = { from: P, to: target, t0: performance.now(), dur: Math.min(2200, 1150 + 260 * (span - 1)) };
}
function renderUI() {
    document.querySelectorAll('[data-t]').forEach(el => { const s = UI[el.dataset.t]; if (s) el.textContent = s[lang()]; });
    const ar = lang() === 'ar';
    $('#langBadge').src = ar ? '/book/ui/lang-en.webp' : '/book/ui/lang-ar.webp';
    $('#lang').setAttribute('aria-label', ar ? 'English' : 'العربية');
    $('#nameBadge').src = ar ? '/book/ui/name-ar.webp' : '/book/ui/name-en.webp';
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
    opening = performance.now();
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
    turn = null; dragging = true; moved = false; sx = lastX = e.clientX; sP = P; lastT = performance.now(); vel = 0;
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
    $('#stage').classList.add('ready'); document.body.classList.add('ready');
});
requestAnimationFrame(frame);


/* ------------------------------------------------------------- the night is alive */
{
    const alive = $('#alive');
    const add = (cls, css) => { const d = document.createElement('i'); d.className = cls; Object.assign(d.style, css); alive.appendChild(d); };
    for (let k = 0; k < 46; k++) add('star', { left: Math.random() * 100 + '%', top: Math.random() * 34 + '%', '--d': (2.5 + Math.random() * 4).toFixed(2) + 's', animationDelay: (-Math.random() * 6).toFixed(2) + 's', '--s': (1 + Math.random() * 1.8).toFixed(1) + 'px' });
    for (let k = 0; k < 12; k++) add('fly', { left: 8 + Math.random() * 84 + '%', top: 40 + Math.random() * 50 + '%', '--d': (9 + Math.random() * 10).toFixed(1) + 's', animationDelay: (-Math.random() * 18).toFixed(1) + 's', '--x': (Math.random() * 120 - 60).toFixed(0) + 'px', '--y': (-40 - Math.random() * 90).toFixed(0) + 'px' });
    // the backdrop leans a little with the pointer
    let tx = 0, ty = 0, cx = 0, cy = 0;
    addEventListener('pointermove', e => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; }, { passive: true });
    const root = document.documentElement;
    (function drift() {
        cx += (tx - cx) * .05; cy += (ty - cy) * .05;
        root.style.setProperty('--mx', cx.toFixed(4)); root.style.setProperty('--my', cy.toFixed(4));
        requestAnimationFrame(drift);
    })();
}
