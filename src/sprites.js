// Hand-drawn pixel sprites. Every row is exactly the sprite width.
// The player is drawn from Abdalrahman's photo: curly dark-brown top, faded sides, thick brows,
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
  '.OqSSSSSSSSSSSSqO.',
  '.OQSBBBSSSSBBBSQO.',
  'OaSSSEeSSSSEeSSSaO',
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
  'OSSEeSSSSSaaQqO...',
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
