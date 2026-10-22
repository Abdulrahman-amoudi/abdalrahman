// Room art: every object is drawn into its own small canvas with light from the top-left,
// then given a 1px dark outline, so it reads as pixel art rather than flat boxes.
const OUT = '#211a24';
function mk(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w + 2; c.height = h + 2;
  const x = c.getContext('2d'); x.translate(1, 1); draw((a, b, ww, hh, col) => { x.fillStyle = col; x.fillRect(a, b, ww, hh); }, x); x.setTransform(1, 0, 0, 1, 0, 0);
  const im = x.getImageData(0, 0, c.width, c.height), d = im.data, W2 = c.width, H2 = c.height, solid = new Uint8Array(W2 * H2);
  for (let i = 0; i < W2 * H2; i++) solid[i] = d[i * 4 + 3] > 40 ? 1 : 0;
  finish(d, solid, W2, H2); grade(d);
  // selective outline: dark tint of the neighbouring colour, pure dark only along the bottom (ground contact)
  const o = parseInt(OUT.slice(1), 16), src = new Uint8ClampedArray(d);
  for (let y = 0; y < H2; y++) for (let xx = 0; xx < W2; xx++) {
    const i = y * W2 + xx; if (solid[i]) continue;
    const nb = [xx > 0 && solid[i - 1] ? i - 1 : -1, xx < W2 - 1 && solid[i + 1] ? i + 1 : -1, y > 0 && solid[i - W2] ? i - W2 : -1, y < H2 - 1 && solid[i + W2] ? i + W2 : -1].filter(k => k >= 0);
    if (!nb.length) continue;
    const below = y > 0 && solid[i - W2] && !(y < H2 - 1 && solid[i + W2]);
    if (below || y > H2 * .7) { d[i * 4] = o >> 16; d[i * 4 + 1] = (o >> 8) & 255; d[i * 4 + 2] = o & 255; }
    else { const k = nb[0] * 4; d[i * 4] = (src[k] * .28 + 33 * .72) | 0; d[i * 4 + 1] = (src[k + 1] * .28 + 26 * .72) | 0; d[i * 4 + 2] = (src[k + 2] * .28 + 36 * .72) | 0; }
    d[i * 4 + 3] = 255;
  }
  x.putImageData(im, 0, 0);
  return c;
}
// Shading pass that turns flat blocks into drawn pixel art:
// lit top/left edges, shaded bottom/right edges per colour region, rounded silhouette corners, dithered falloff toward the floor.
function finish(d, solid, W, H) {
  const src = new Uint8ClampedArray(d), s0 = new Uint8Array(solid);
  const same = (a, b) => Math.abs(src[a] - src[b]) + Math.abs(src[a + 1] - src[b + 1]) + Math.abs(src[a + 2] - src[b + 2]) < 24;
  const lum = k => src[k] * .3 + src[k + 1] * .59 + src[k + 2] * .11;
  const mul = (k, f) => { d[k] = Math.min(255, d[k] * f); d[k + 1] = Math.min(255, d[k + 1] * f); d[k + 2] = Math.min(255, d[k + 2] * f); };
  const add = (k, v) => { d[k] = Math.min(255, d[k] + v); d[k + 1] = Math.min(255, d[k + 1] + v); d[k + 2] = Math.min(255, d[k + 2] + v * .8); };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; if (!s0[i]) continue; const k = i * 4;
    const up = y > 0 && s0[i - W] ? (i - W) * 4 : -1, dn = y < H - 1 && s0[i + W] ? (i + W) * 4 : -1;
    const lf = x > 0 && s0[i - 1] ? (i - 1) * 4 : -1, rt = x < W - 1 && s0[i + 1] ? (i + 1) * 4 : -1;
    // rounded corners on the silhouette
    if ((up < 0 && lf < 0) || (up < 0 && rt < 0)) { d[k + 3] = 0; solid[i] = 0; continue; }
    const big = lum(k) > 60;
    if (up < 0 || !same(k, up)) add(k, big ? 22 : 16);            // light from above
    else if (lf < 0 || !same(k, lf)) add(k, 9);
    if (dn < 0 || !same(k, dn)) mul(k, .8);                        // shade on the underside
    else if (rt < 0 || !same(k, rt)) mul(k, .9);
    // dithered falloff on large flat areas toward the bottom
    const f = y / H;
    if (f > .55 && (f > .78 || (x + y) % 2 === 0)) mul(k, .93);
    // tiny texture so big panels aren't dead flat
    if (((x * 7 + y * 13) % 17) === 0 && up >= 0 && dn >= 0 && same(k, up) && same(k, dn)) mul(k, big ? .95 : 1.12);
  }
}
// tiny pixel-text helper: draws text then snaps it to hard pixels
function pixelGlyph(txt, size, color, font) {
  const c = document.createElement('canvas'); c.width = size * 2; c.height = size * 2;
  const x = c.getContext('2d'); x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = color; x.fillText(txt, size, size);
  const im = x.getImageData(0, 0, c.width, c.height); for (let i = 3; i < im.data.length; i += 4) im.data[i] = im.data[i] > 110 ? 255 : 0; x.putImageData(im, 0, 0);
  return c;
}

const ART = {};
function buildRoom() {
  ART.desk = mk(116, 38, R => {
    R(0, 0, 116, 8, '#b8763f'); R(0, 0, 116, 1, '#d08c50'); R(0, 7, 116, 1, '#8e5530');
    R(0, 8, 116, 4, '#9a5d33'); R(0, 11, 116, 1, '#7a4526'); R(28, 12, 60, 3, '#4a3022');
    for (const px of [2, 88]) {
      R(px, 12, 26, 26, '#a5683a'); R(px, 12, 1, 26, '#bf7d47'); R(px + 25, 12, 1, 26, '#7f4a28');
      for (let i = 0; i < 3; i++) { R(px + 2, 14 + i * 8, 22, 7, '#94592f'); R(px + 2, 14 + i * 8, 22, 1, '#b0703c'); R(px + 11, 17 + i * 8, 4, 1, '#e0b060'); }
    }
  });
  ART.monitor = mk(42, 34, R => {
    R(0, 0, 42, 27, '#24252d'); R(1, 1, 40, 1, '#3a3b45'); R(2, 2, 38, 22, '#1d2a48');
    R(18, 27, 6, 4, '#2c2d36'); R(19, 27, 1, 4, '#454654'); R(11, 31, 20, 3, '#2c2d36'); R(11, 31, 20, 1, '#454654');
  });
  ART.keyboard = mk(28, 4, R => { R(0, 0, 28, 4, '#2f3039'); for (let i = 0; i < 6; i++) R(2 + i * 4, 1, 3, 1, '#4a4b57'); for (let i = 0; i < 5; i++) R(3 + i * 4, 2, 3, 1, '#40414c'); });
  ART.mouse = mk(4, 5, R => { R(0, 0, 4, 5, '#2f3039'); R(1, 1, 1, 1, '#4a4b57'); });
  ART.pc = mk(28, 46, R => {
    R(0, 0, 28, 4, '#f4f3f7'); R(0, 0, 28, 1, '#ffffff');
    R(0, 4, 8, 42, '#e6e5ec'); R(1, 5, 1, 40, '#f7f6fa'); R(3, 8, 3, 3, '#c9c8d0'); R(4, 9, 1, 1, '#76b900');
    R(8, 4, 20, 42, '#262936'); R(8, 4, 1, 42, '#3a3e50'); R(9, 5, 18, 1, '#3a3e50');
    for (let i = 0; i < 3; i++) { const y = 8 + i * 12; R(11, y, 12, 11, '#1b1d27'); }
    R(24, 7, 2, 34, '#3c4052'); R(24, 30, 2, 8, '#76b900');
  });
  ART.chair = mk(26, 40, R => {
    R(4, 0, 18, 2, '#e9e9ee'); R(2, 2, 22, 18, '#e9e9ee'); R(4, 2, 18, 16, '#cfcfd6'); for (let y = 3; y < 18; y += 2) R(4, y, 18, 1, '#bdbdc6');
    R(2, 2, 1, 18, '#ffffff'); R(23, 2, 1, 18, '#c2c2ca'); R(4, 20, 18, 2, '#e9e9ee');
    R(0, 22, 26, 5, '#d6d6dd'); R(0, 22, 26, 1, '#f3f3f6'); R(0, 26, 26, 1, '#b3b3bc');
    R(11, 27, 4, 6, '#6b6d78'); R(11, 27, 1, 6, '#8a8c98');
    R(2, 33, 22, 3, '#4b4d58'); R(2, 33, 22, 1, '#6b6d78'); R(1, 36, 4, 3, '#2c2d35'); R(11, 36, 4, 3, '#2c2d35'); R(21, 36, 4, 3, '#2c2d35');
  });
  ART.rack = mk(36, 50, R => {
    R(0, 0, 36, 7, '#5a5e6e'); R(0, 0, 36, 1, '#757a8c'); R(0, 7, 36, 43, '#2e3039'); R(0, 7, 1, 43, '#3f4250'); R(35, 7, 1, 43, '#22232b');
    for (let i = 0; i < 4; i++) { const y = 10 + i * 9; R(3, y, 30, 7, '#1d1e25'); R(3, y, 30, 1, '#34363f'); R(28, y + 2, 3, 3, '#3b3d48'); }
    R(2, 47, 4, 3, '#1a1b21'); R(30, 47, 4, 3, '#1a1b21');
  });
  ART.bookshelf = mk(38, 58, R => {
    R(0, 0, 38, 5, '#b67b52'); R(0, 0, 38, 1, '#cf9466'); R(0, 5, 38, 53, '#8a5a3a'); R(3, 7, 32, 49, '#5b3a25');
    const books = [['#e05a4a', '#b9443a'], ['#5b8fe0', '#4170c0'], ['#f0b84a', '#c99536'], ['#4fc49a', '#38a17c'], ['#9b7cff', '#7c5fdc'], ['#f2efe6', '#cfcabd'], ['#58a85f', '#42874a']];
    for (let s = 0; s < 3; s++) {
      const base = 22 + s * 17; R(3, base, 32, 3, '#8a5a3a'); R(3, base, 32, 1, '#a46e48');
      let x = 4; let k = s * 2;
      while (x < 33) { const bw = 3 + ((k * 7) % 3), bh = 11 + ((k * 5) % 4); const [c1, c2] = books[k % books.length]; if (x + bw > 34) break;
        R(x, base - bh, bw, bh, c1); R(x + bw - 1, base - bh, 1, bh, c2); R(x, base - bh + 3, bw, 1, c2); x += bw + (k % 4 === 3 ? 2 : 0); k++; }
    }
  });
  ART.table = mk(38, 26, R => { R(0, 0, 38, 6, '#b67b52'); R(0, 0, 38, 1, '#cf9466'); R(0, 6, 38, 4, '#8a5a3a'); R(3, 10, 4, 16, '#7a4e32'); R(31, 10, 4, 16, '#7a4e32'); R(6, 10, 1, 16, '#5e3b24'); });
  ART.phone = mk(9, 13, R => { R(0, 0, 9, 13, '#25262e'); R(1, 1, 7, 10, '#2c6a44'); R(1, 1, 7, 1, '#4caf6a'); R(3, 11, 3, 1, '#4a4b57'); });
  ART.windowDay = mk(62, 46, R => {
    R(0, 0, 62, 44, '#f5f3ee'); R(0, 0, 62, 1, '#ffffff'); R(3, 3, 56, 37, '#3f8a4d');
    for (let y = 4; y < 40; y += 3) { R(3, y, 56, 1, '#4f9c5d'); R(3, y + 2, 56, 1, '#33733f'); }
    R(30, 3, 2, 37, '#f5f3ee'); R(31, 3, 1, 37, '#d9d6cf'); R(27, 18, 2, 5, '#c9c5bc'); R(33, 18, 2, 5, '#c9c5bc');
    R(-2, 40, 66, 4, '#f5f3ee'); R(-2, 40, 66, 1, '#ffffff'); R(-2, 43, 66, 1, '#cfcbc1');
  });
  ART.windowNight = mk(62, 46, R => {
    R(0, 0, 62, 44, '#c8c5cf'); R(3, 3, 56, 37, '#162241'); for (let i = 0; i < 9; i++) R(5 + (i * 23) % 52, 5 + (i * 13) % 30, 1, 1, '#c9d4ff');
    R(44, 8, 6, 6, '#f4f0d6'); R(46, 7, 2, 1, '#f4f0d6'); R(43, 10, 1, 2, '#f4f0d6'); R(47, 9, 2, 2, '#d8d3b4');
    R(30, 3, 2, 37, '#c8c5cf'); R(-2, 40, 66, 4, '#c8c5cf'); R(-2, 43, 66, 1, '#9f9ca8');
  });
  ART.ac = mk(54, 18, R => {
    R(0, 0, 54, 14, '#f7f7f9'); R(0, 0, 54, 1, '#ffffff'); R(0, 13, 54, 1, '#d9d9e0');
    R(2, 14, 50, 4, '#e3e3ea'); for (let i = 0; i < 5; i++) R(4 + i * 10, 15, 8, 1, '#b9b9c4');
    R(38, 3, 13, 7, '#2d5aa8'); R(39, 4, 11, 1, '#4a7cd0'); R(40, 6, 3, 2, '#9bd1ff');
  });
  ART.board = mk(48, 32, R => {
    R(0, 0, 48, 30, '#9aa0ab'); R(0, 0, 48, 1, '#c0c5ce'); R(2, 2, 44, 25, '#fbfbf8');
    // agent diagram: notes -> AGENT -> quiz
    R(5, 6, 9, 6, '#f0b84a'); R(5, 16, 9, 6, '#f0b84a'); R(19, 10, 11, 8, '#e46a4a'); R(35, 6, 8, 6, '#6aa2ff'); R(35, 16, 8, 6, '#4fc49a');
    R(14, 9, 5, 1, '#55575f'); R(14, 19, 5, 1, '#55575f'); R(18, 9, 1, 11, '#55575f'); R(30, 13, 3, 1, '#55575f'); R(32, 9, 1, 11, '#55575f'); R(32, 9, 3, 1, '#55575f'); R(32, 19, 3, 1, '#55575f');
    R(21, 12, 7, 1, '#ffd9cf'); R(21, 14, 5, 1, '#ffd9cf');
    R(-1, 28, 50, 3, '#8a909b'); R(6, 26, 6, 2, '#e46a4a'); R(14, 26, 6, 2, '#3f6fd0');
  });
  ART.poster = mk(24, 30, R => { R(0, 0, 24, 30, '#2a2233'); R(2, 2, 20, 26, '#1b1726'); });
  ART.ain = pixelGlyph('ع', 14, '#ff8a2a', 'bold 20px "IBM Plex Sans Arabic", "Noto Sans Arabic", sans-serif');
  ART.shelf = mk(56, 26, R => {
    R(0, 20, 56, 4, '#f6f5f1'); R(0, 20, 56, 1, '#ffffff'); R(0, 23, 56, 1, '#cfcbc1');
    R(6, 12, 12, 8, '#e9e4d8'); R(6, 12, 12, 1, '#f7f4ec'); R(15, 13, 2, 7, '#d6d0c2');
    R(9, 3, 3, 9, '#4f9a52'); R(5, 5, 4, 3, '#5fb062'); R(13, 1, 4, 5, '#4f9a52'); R(14, 6, 3, 6, '#3f8243'); R(6, 8, 3, 4, '#3f8243'); R(15, 4, 4, 2, '#5fb062');
    R(30, 15, 20, 5, '#2a2c35'); R(31, 16, 6, 3, '#3b3d48');
  });
  ART.sun = mk(20, 20, R => {
    const c = '#4e8df0', d = '#3570d0', l = '#7fb0ff';
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; R(Math.round(9 + Math.cos(a) * 8), Math.round(9 + Math.sin(a) * 8), 3, 3, d); }
    R(4, 3, 12, 14, c); R(3, 4, 14, 12, c); R(5, 4, 4, 2, l); R(4, 6, 2, 3, l); R(13, 13, 3, 3, d);
    R(7, 8, 2, 2, OUT); R(11, 8, 2, 2, OUT); R(8, 12, 4, 1, OUT); R(7, 11, 1, 1, OUT); R(12, 11, 1, 1, OUT);
  });
  ART.sunHappy = mk(20, 20, R => {
    const c = '#4e8df0', d = '#3570d0', l = '#7fb0ff';
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + .2; R(Math.round(9 + Math.cos(a) * 8), Math.round(9 + Math.sin(a) * 8), 3, 3, d); }
    R(4, 3, 12, 14, c); R(3, 4, 14, 12, c); R(5, 4, 4, 2, l); R(4, 6, 2, 3, l);
    R(7, 9, 2, 1, OUT); R(11, 9, 2, 1, OUT); R(6, 8, 1, 1, OUT); R(9, 8, 1, 1, OUT); R(10, 8, 1, 1, OUT); R(13, 8, 1, 1, OUT);
    R(8, 12, 4, 2, OUT); R(9, 13, 2, 1, '#ff7f95'); R(5, 11, 2, 1, '#ff9db0'); R(13, 11, 2, 1, '#ff9db0');
  });
  ART.player = buildPlayer();
}

// Static background: wall, stone strip, floor, rug (no outlines; it's the ground).
function paintBackground(ctx, W, H, WALL) {
  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  R(0, 0, W, WALL, '#ede3cd'); R(0, 0, W, 3, '#f7f0e0'); R(0, 3, W, 1, '#d9cdb3');
  for (let x = 8; x < W; x += 24) R(x, 4, 1, WALL - 20, '#e4d8bf');
  // stone strip like the real room
  const SY = WALL - 16, stones = ['#d4bf9b', '#c8b08a', '#dccaa8', '#c0a57e', '#d0b993'];
  R(0, SY - 1, W, 1, '#b39d79');
  for (let row = 0; row < 3; row++) { let x = row % 2 ? -7 : 0, k = row * 3; while (x < W) { const w = 10 + ((k * 5) % 6); R(x, SY + row * 5, w - 1, 4, stones[k % stones.length]); R(x, SY + row * 5, w - 1, 1, '#e6d6b6'); x += w; k++; } }
  R(0, WALL - 1, W, 1, '#9c876a'); R(0, WALL, W, 2, '#bfae90');
  // floor tiles
  for (let y = WALL + 2, r = 0; y < H; y += 15, r++) for (let x = (r % 2) * -11; x < W; x += 22) {
    R(x, y, 22, 15, (Math.floor(x / 22) + r) % 2 ? '#d9d1c1' : '#d2c9b7'); R(x, y, 22, 1, '#c3b9a5'); R(x, y, 1, 15, '#c3b9a5'); R(x + 1, y + 1, 20, 1, '#e3dccd');
  }
  // rug with border and fringe
  const rx = 104, ry = 112, rw = 116, rh = 50;
  R(rx, ry, rw, rh, '#2f3d66'); R(rx + 3, ry + 3, rw - 6, rh - 6, '#41548c'); R(rx + 6, ry + 6, rw - 12, rh - 12, '#4b60a0');
  for (let x = rx + 10; x < rx + rw - 10; x += 8) { R(x, ry + rh / 2 - 1, 4, 2, '#f0b84a'); R(x + 4, ry + rh / 2 - 3, 2, 2, '#2f3d66'); R(x + 4, ry + rh / 2 + 1, 2, 2, '#2f3d66'); }
  for (let x = rx + 2; x < rx + rw - 2; x += 3) { R(x, ry - 2, 1, 2, '#e9e1cf'); R(x, ry + rh, 1, 2, '#e9e1cf'); }
  // door at the bottom
  R(140, H - 5, 44, 5, '#b49f7c'); R(140, H - 5, 44, 1, '#cbb894');
}

// Colour grade shared by sprites and the room: pull saturation down and push shadows toward plum, like a lit scene.
function grade(d) {
  for (let i = 0; i < d.length; i += 4) {
    if (!d[i + 3]) continue;
    const l = d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11;
    d[i] += (l - d[i]) * .2; d[i + 1] += (l - d[i + 1]) * .2; d[i + 2] += (l - d[i + 2]) * .2;
    if (l < 100) { const k = (100 - l) / 100; d[i] += 6 * k; d[i + 2] += 14 * k; d[i + 1] -= 3 * k; }
  }
}
