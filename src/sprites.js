// Hand-drawn pixel sprites. Every row is exactly the sprite width.
// The player is the detective: fedora, auburn hair, quilted navy jacket, green scarf.
// light moustache, olive skin, light-blue tee, dark joggers, white sneakers.
const PAL = {
  O: '#2a1e26',
  H: '#3a2a24', h: '#271b17', k: '#5a4236',
  q: '#4a3630', Q: '#9a7462',
  B: '#2a1e1a',
  S: '#e8b896', s: '#cf9677', r: '#b07a60', a: '#d09a7a', p: '#ec9c8c',
  E: '#2a1e26', e: '#ffffff', M: '#a0605a', m: '#a8765c',
  T: '#cfe0e6', t: '#9fb8c4', L: '#f2f8fa',
  J: '#3c4058', j: '#2c2f44', i: '#4d5270',
  F: '#ece8e0', f: '#bdb6aa', G: '#9b978d',
};
// ---- player: 18 wide, chibi (big head) ----
const HEAD_DOWN = [
  '....OOOOOOOOOO....',
  '...OkHkHHkHHkHO...',
  '..OHHkHHHkHHkHHO..',
  '.OHHHHkHHHHkHHHHO.',
  '.OHkHHHHHkHHHHkHO.',
  '.OHHHHHHHHHHHHHHO.',
  '.OqHHSSSSSSSSHHqO.',
  '.OqSBBBSSSSBBBSqO.',
  '.OQSSSSSSSSSSSSQO.',
  'OaSSSeESSSSeESSSaO',
  'OaSSSEESSSSEESSSaO',
  '.OSSSSSSSSSSSSSSO.',
  '.OSppSSSssSSSppSO.',
  '..OSSSSSSSSSSSSO..',
  '..OsSSSSMMSSSSsO..',
  '...OssSSSSSSssO...',
  '....OOOsSSsOOO....',
];
const HEAD_UP = [
  '....OOOOOOOOOO....',
  '...OkHkHHkHHkHO...',
  '..OHHkHHHkHHkHHO..',
  '.OHHHHkHHHHkHHHHO.',
  '.OHkHHHHHkHHHHkHO.',
  '.OHHHHHHHHHHHHHHO.',
  '.OHHkHHHHHHkHHHHO.',
  '.OhHHHHHHHHHHHHhO.',
  '.OhhHHHkHHHHHHhhO.',
  'OahhhHHHHHHHHhhhaO',
  'OaqhhhhhhhhhhhhqaO',
  '.OqqqqqqqqqqqqqqO.',
  '.OQqqqqqqqqqqqqQO.',
  '..OQQQqqqqqqQQQO..',
  '..OsSQQQQQQQQSsO..',
  '...OssSSSSSSssO...',
  '....OOOsSSsOOO....',
];
const HEAD_LEFT = [
  '....OOOOOOOOO.....',
  '...OkHkHHkHHkO....',
  '..OHHkHHHkHHkHO...',
  '.OHHHHkHHHHkHHHO..',
  '.OHkHHHHHkHHHHHO..',
  '.OHHHHHHHHHHHHHO..',
  '.OHSSSSSHHHHqqqO..',
  '.OSSSSSSSHHqqqqO..',
  'OSBBBSSSSSQqqqO...',
  'OSSeESSSSSaaQqO...',
  'OSSEESSSSaraQO....',
  'OSSSSSSSSSaaSO....',
  'OSppSSSSSSSSsO....',
  '.OSSSSSSSSSSO.....',
  '.OMSSSSSSSSsO.....',
  '..OsSSSSSssO......',
  '...OOOsSsOO.......',
];
const BODY_DOWN = [
  '...OOTTTTTTTTOO...',
  '..OLTTTTTTTTTTtO..',
  '.OLTTTTTTTTTTTTtO.',
  '.OTTOTTTTTTTTOTtO.',
  '.OSsOTTTTTTTTOsSO.',
  '.OSSOtTTTTTTtOSSO.',
  '..OOOJJJJJJJJOOO..',
  '....OJiJJJJjJO....',
];
const BODY_UP = BODY_DOWN;
const BODY_LEFT = [
  '.....OOTTTTOO.....',
  '....OLTTTTTTtO....',
  '...OLTTTTTTTTtO...',
  '...OTTTOTTTTTtO...',
  '...OTTSsTTTTTtO...',
  '...OOOSSTTTTttO...',
  '....OOOJJJJJjO....',
  '.....OJJJJJjjO....',
];
const LEGS_DOWN = [[
  '....OJJjOJJJjO....',
  '....OJJjOJJJjO....',
  '....OjjjOjjjjO....',
  '...OFFFFOFFFFFO...',
  '...OfFFfOfFFffO...',
  '....OOOO.OOOOO....',
], [
  '....OJJjOJJJjO....',
  '....OjjjOJJJjO....',
  '...OFFFFOJJJjO....',
  '...OfFFfOjjjjO....',
  '....OOOOOFFFFFO...',
  '........OOOOOO....',
], [
  '....OJJjOJJJjO....',
  '....OJJjOjjjjO....',
  '....OJJjOFFFFFO...',
  '....OjjjOfFFffO...',
  '...OFFFFOOOOOO....',
  '...OOOOO..........',
]];
const LEGS_LEFT = [[
  '.....OJJJJjjO.....',
  '.....OJJJjjjO.....',
  '.....OjjjjjjO.....',
  '....OFFFFFFfO.....',
  '....OfFFFFffO.....',
  '.....OOOOOOO......',
], [
  '....OJJJOJJjO.....',
  '...OJJjO.OJjjO....',
  '..OjjjO...OjjO....',
  '.OFFFFO...OFFFO...',
  '.OfFFfO...OfFfO...',
  '..OOOO.....OOO....',
], [
  '.....OJJOJJjO.....',
  '....OJJjOOJjO.....',
  '....OjjjO.OjjO....',
  '...OFFFFO.OFFFO...',
  '...OfFFfO.OfFfO...',
  '....OOOO...OOO....',
]];

function compose(head, body, legs) { return head.concat(body, legs); }
function mirror(rows) { return rows.map(r => r.split('').reverse().join('')); }

function spriteCanvas(rows, pal = PAL) {
  const h = rows.length, w = rows[0].length;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  rows.forEach((row, y) => { if (row.length !== w) console.warn('sprite row width', y, row.length, w); for (let i = 0; i < row.length; i++) { const k = row[i]; if (k !== '.' && pal[k]) { x.fillStyle = pal[k]; x.fillRect(i, y, 1, 1); } } });
  return c;
}

function buildPlayer() {
  const f = {};
  for (let i = 0; i < 3; i++) {
    f['down' + i] = spriteCanvas(compose(HEAD_DOWN, BODY_DOWN, LEGS_DOWN[i]));
    f['up' + i] = spriteCanvas(compose(HEAD_UP, BODY_UP, LEGS_DOWN[i]));
    f['left' + i] = spriteCanvas(compose(HEAD_LEFT, BODY_LEFT, LEGS_LEFT[i]));
    f['right' + i] = spriteCanvas(mirror(compose(HEAD_LEFT, BODY_LEFT, LEGS_LEFT[i])));
  }
  f.portrait = spriteCanvas(HEAD_DOWN);
  return f;
}
// ---- detective player (fedora, auburn hair, quilted navy jacket, green scarf, dark boots): 18 wide ----
const DPAL = {
  O: '#14101c', N: '#1a3043', n: '#0f1d2c', l: '#2b4a64', b: '#0a121c',
  H: '#8a3c22', h: '#5e2617', k: '#b25a34',
  S: '#f6c39f', s: '#d99a78', a: '#c98a6a', p: '#f2907c', e: '#ffffff', E: '#14101c', M: '#8a3b3b',
  J: '#1d3654', j: '#12233a', i: '#2e5175', G: '#1f6b4e', g: '#164d38',
  P: '#3d3d45', d: '#2b2b31', F: '#3a2f26', f: '#1c1611',
};
const D_HAT = [
  '.....OOOOOOOO.....',
  '....OlNNNNNNnO....',
  '....ONNNnnNNnO....',
  '....ONNNNNNNnO....',
  '...ObbbbbbbbbbO...',
  '.OOlNNNNNNNNNNnOO.',
  'OnnnnnnnnnnnnnnnnO',
];
const D_HEAD_DOWN = D_HAT.concat([
  '.OHkHHHkHHHkHHkHO.',
  '.OHHHSSHSSSHSSHHO.',
  '.OHSSSSSSSSSSSSHO.',
  'OhSSSeESSSSeESSShO',
  'OhSSSEESSSSEESSShO',
  '.OSppSSSSSSSSppSO.',
  '..OSSSSSMMSSSSSO..',
  '...OssSSSSSSssO...',
  '....OOOsSSsOOO....',
]);
const D_HEAD_UP = D_HAT.concat([
  '.OHkHHHkHHHkHHkHO.',
  '.OHHHHHHHHHHHHHHO.',
  '.OhHHkHHHHHkHHHhO.',
  'OhhHHHHHHHHHHHHhhO',
  'OhhhHHHHHHHHHHhhhO',
  '.OhhhhhhhhhhhhhhO.',
  '..OsSSSSSSSSSSsO..',
  '...OssSSSSSSssO...',
  '....OOOsSSsOOO....',
]);
const D_HEAD_LEFT = [
  '....OOOOOOOO......',
  '...OlNNNNNNnO.....',
  '...ONNNnnNNnO.....',
  '...ONNNNNNNnO.....',
  '..ObbbbbbbbbbO....',
  'OOlNNNNNNNNNNnOO..',
  'OnnnnnnnnnnnnnnnO.',
  '.OHkHHHHkHHHkHO...',
  '.OSSHSSHHHHHHHO...',
  'OSSSSSSSHHHhhO....',
  'OSeESSSSSShhhO....',
  'OSEESSSSSasShO....',
  'OSSSSSSSSaaSO.....',
  'OSppSSSSSSSsO.....',
  '.OMSSSSSSSsO......',
  '..OOOsSsOOO.......',
];
const D_BODY_DOWN = [
  '...OOGGGGGGGGOO...',
  '..OJgGGGGGGGGgJO..',
  '.OiJJJJJjJJJJJJjO.',
  '.OJJOiJJjJJJiOJjO.',
  '.OSsOjJJjJJJjOsSO.',
  '.OSSOJJJjJJJJOSSO.',
  '..OOOjjjjjjjjOOO..',
  '....OdPPPPPPdO....',
];
const D_BODY_LEFT = [
  '.....OOGGGGOO.....',
  '....OJGGGGGGgO....',
  '...OiJJJJJJJJjO...',
  '...OJJJOJJJJJjO...',
  '...OJJSsJJJJJjO...',
  '...OOOSSJJJJjjO...',
  '....OOOjjjjjjO....',
  '.....OdPPPPPdO....',
];
const dLegs = L => L.map(f => f.map(r => r.replace(/J/g, 'P').replace(/j/g, 'd').replace(/F/g, 'F').replace(/f/g, 'f')));
function buildDetective() {
  const pad = r => (r + '..................').slice(0, 18);
  const f = {}, LD = dLegs(LEGS_DOWN), LL = dLegs(LEGS_LEFT);
  for (let i = 0; i < 3; i++) {
    f['down' + i] = spriteCanvas(D_HEAD_DOWN.concat(D_BODY_DOWN, LD[i]).map(pad), DPAL);
    f['up' + i] = spriteCanvas(D_HEAD_UP.concat(D_BODY_DOWN, LD[i]).map(pad), DPAL);
    f['left' + i] = spriteCanvas(D_HEAD_LEFT.concat(D_BODY_LEFT, LL[i]).map(pad), DPAL);
    f['right' + i] = spriteCanvas(mirror(D_HEAD_LEFT.concat(D_BODY_LEFT, LL[i]).map(pad)), DPAL);
  }
  f.portrait = spriteCanvas(D_HEAD_DOWN.map(pad), DPAL);
  return f;
}
