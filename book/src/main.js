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
    if (textInCanvas) {
        const ar = lang() === 'ar', side = sideFor(p);
        ctx.direction = ar ? 'rtl' : 'ltr';
        ctx.textAlign = ar ? 'right' : 'left';
        ctx.textBaseline = 'alphabetic';
        // a column in the empty half, kept well away from the fold and the edge
        const colW = SW * .34, colX = side === 'right' ? SW * .585 : SW * .075;
        const x = ar ? colX + colW : colX;
        const titleText = p.emboss && !ar ? t(p.title).toUpperCase() : t(p.title);
        let size = p.emboss ? (ar ? 132 : 138) : (ar ? 104 : 112);
        let tl;
        for (; size > 60; size -= 4) {
            ctx.font = `700 ${size}px "Readex Pro"`;
            tl = wrap(ctx, titleText, colW);
            if (tl.length <= 3 && tl.every(l => ctx.measureText(l).width <= colW * 1.02)) break;
        }
        const lh = size * (ar ? 1.28 : 1.0);
        const bodySize = ar ? 40 : 38, blh = ar ? 66 : 58;
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
    // cloth grain over everything, so art and board read as one cover
    for (let k = 0; k < 3200; k++) { ctx.fillStyle = `rgba(255,255,255,${Math.random() * .025})`; ctx.fillRect(Math.random() * HW, Math.random() * SH, 1 + Math.random() * 3, 1); }
    if (back) return c;
    const ar = lang() === 'ar';
    ctx.textAlign = 'center'; ctx.direction = ar ? 'rtl' : 'ltr';
    const top = SH * .085;
    const abud = await loadImage('/assets/img/abud.png');
    ctx.font = '700 34px "Readex Pro"'; ctx.fillStyle = '#e9e1cf';
    const brand = t(UI.brand), bw = ctx.measureText(brand).width;
    if (abud) { ctx.imageSmoothingEnabled = false; ctx.drawImage(abud, HW / 2 - bw / 2 - 34, top - 32, 20, 39); }
    ctx.fillText(brand, HW / 2 + 10, top);
    ctx.fillStyle = '#ff7a2f'; ctx.fillText('.', HW / 2 + 10 + bw / 2 + 10, top);
    const lines = t(UI.coverLines);
    const size = ar ? 104 : 112;
    ctx.font = `700 ${size}px "Readex Pro"`;
    let y = SH * .2;
    for (const line of lines) {
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8;
        ctx.fillStyle = '#c9bfa8'; ctx.fillText(line, HW / 2, y + 4); ctx.restore();
        ctx.fillStyle = '#f4ecdc'; ctx.fillText(line, HW / 2, y);
        y += size * (ar ? 1.3 : 1.04);
    }
    ctx.font = '400 34px "Readex Pro"'; ctx.fillStyle = 'rgba(244,236,220,.75)';
    ctx.fillText(t(UI.coverSub), HW / 2, y + 6);
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
renderer.toneMappingExposure = 1.05;

const scene = new Scene();
renderer.setClearColor(0x000000, 0);
const camera = new PerspectiveCamera(30, 1, .05, 50);
camera.up.set(0, 1, 0);

scene.add(new AmbientLight('#c9d4ff', .95));                 // cool night fill
const moon = new DirectionalLight('#9fb4ff', .45); moon.position.set(-2, 3, 3); scene.add(moon);
const sun = new DirectionalLight('#ffd9a8', 2.6);               // warm lantern light from the right
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

const paperEdge = new MeshStandardMaterial({ color: '#e6decd', roughness: .95 });
const boardMat = new MeshStandardMaterial({ color: '#19191b', roughness: .7 });
const spineMat = new MeshStandardMaterial({ color: '#ff7a2f', roughness: .55 });
// back board under the right stack, front board travels with the cover (sheet 0)
const backBoard = new Mesh(new BoxGeometry(PW + .03, PH + .04, .016), boardMat);
backBoard.position.set(PW / 2 + .005, 0, .008); backBoard.castShadow = backBoard.receiveShadow = true; book.add(backBoard);
const leftBoard = new Mesh(new BoxGeometry(PW + .03, PH + .04, .016), boardMat);
leftBoard.position.set(-PW / 2 - .005, 0, .008); leftBoard.receiveShadow = true; book.add(leftBoard);
const spine = new Mesh(new BoxGeometry(.02, PH - .02, .016), spineMat);
spine.position.set(-.012, 0, .008); spine.castShadow = true; book.add(spine);
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
    // the book slides so whatever is open sits in the middle
    book.position.x = -PW / 2 * (1 - o);
    book.rotation.z = -0.28 * (1 - o);
    // camera: tilted over the closed book, straight down over the open one
    const aspect = camera.aspect, vfov = camera.fov * Math.PI / 180;
    const fitW = (PW * (1 + o)) * 1.12 / view.wFrac, fitH = PH * 1.16 / view.hFrac;
    const dist = Math.max(fitH / 2 / Math.tan(vfov / 2), fitW / 2 / (Math.tan(vfov / 2) * aspect));
    const closedDist = dist * 1.55;
    const d = closedDist + (dist - closedDist) * o;
    const tilt = (1 - o) * 0.95;                    // radians off vertical
    const aim = -0.42 * (1 - o);                   // look a little past the closed book so it sits higher
    camera.position.set(0, aim - Math.sin(tilt) * d, Math.cos(tilt) * d);
    camera.lookAt(new Vector3(0, aim, 0));
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
        book.position.z = opened || reduced ? 0 : Math.sin(now / 1100) * .012 + .012;
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
        $('#actions').innerHTML = (p.links || []).map(l => `<a class="${l.ghost ? 'ghost' : ''}" href="${l.href}" ${l.href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>${esc(l[lang()])}</a>`).join('');
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

