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
// ---- detective player (the user's design: fedora, auburn hair, quilted navy jacket, green scarf, dark boots): 22x36 chibi ----
const DPAL = {"O": "#14101c", "N": "#1d3346", "n": "#12202e", "l": "#30506c", "b": "#0a121c", "H": "#8f3f22", "h": "#5e2617", "k": "#b85d34", "S": "#f6c39f", "s": "#d99a78", "p": "#f0907c", "E": "#14101c", "e": "#ffffff", "M": "#8a3b3b", "J": "#1f3a55", "j": "#132538", "i": "#2f5677", "q": "#162a3e", "T": "#1a1a22", "G": "#2a7a52", "g": "#1a5438", "z": "#3a9a6a", "P": "#3e4048", "d": "#2a2b31", "F": "#3a2f27", "f": "#1a1410"};
const DFR = {"down0": ["......OOOO..OOOO......", ".....OlNNNOONNNNO.....", "....OllNNNnnNNNNnO....", "....OlNNNNNNNNNNnO....", "....OlNNNNNNNNNNnO....", "..OOObbbbbbbbbbbbOOO..", ".ONNNNNNNNNNNNNNNNNNO.", "ONnnnnnnnnnnnnnnnnnnNO", ".OOHHHkHHHkHHHkHHHHOO.", ".OHHHHhHHHhHHhHHHhHHO.", "..OHhHShHhSHhSHhhsHO..", ".OHHShSShSShSShSSsHHO.", "..OHSSSeESSSSeESSsHO..", "..OHSSSEESSSSEESSsHO..", "..OHSSSEESSSSEESSsHO..", "..OhSppSSSSSSSSppshO..", "..OHOSSSSSMMSSSSSOHO..", "...O.OSSSSSSSSSSO.O...", "....OzzzzssssGGGGO....", "...OOGGGGGGGGGGGGOO...", "..OjJiJJiTTTTGgjjJjO..", "..OJJqJqJTTTTGGqjJJO..", "..OJJiJJJTTTTGgjjJJO..", "..OJJiJJJTTTTGGjjJJO..", "..OJJqJqJTTTTgGqjJJO..", "..OJJJiiiTTTTiiijJJO..", "..OSsJJJJTTTTJJJjSsO..", "...OiJJJJTTTTJJJjjO...", "....OOOPPdOOPPdOOO....", "......OPPdOOPPdO......", "......OPPdOOPPdO......", "......OPPdOOPPdO......", "......OPPdOOPPdO......", ".....OFFFFOFFFFO......", ".....OffffOffffO......", "......OOOO.OOOO......."], "down1": ["......OOOO..OOOO......", ".....OlNNNOONNNNO.....", "....OllNNNnnNNNNnO....", "....OlNNNNNNNNNNnO....", "....OlNNNNNNNNNNnO....", "..OOObbbbbbbbbbbbOOO..", ".ONNNNNNNNNNNNNNNNNNO.", "ONnnnnnnnnnnnnnnnnnnNO", ".OOHHHkHHHkHHHkHHHHOO.", ".OHHHHhHHHhHHhHHHhHHO.", "..OHhHShHhSHhSHhhsHO..", ".OHHShSShSShSShSSsHHO.", "..OHSSSeESSSSeESSsHO..", "..OHSSSEESSSSEESSsHO..", "..OHSSSEESSSSEESSsHO..", "..OhSppSSSSSSSSppshO..", "..OHOSSSSSMMSSSSSOHO..", "...O.OSSSSSSSSSSO.O...", "....OzzzzssssGGGGO....", "...OOGGGGGGGGGGGGOO...", "..OjJiJJiTTTTGgjjJjO..", "..OJJqJqJTTTTGGqjJJO..", "..OJJiJJJTTTTGgjjJJO..", "..OJJiJJJTTTTGGjjJJO..", "..OJJqJqJTTTTgGqjJJO..", "..OJJJiiiTTTTiiijSsO..", "..OJJJJJJTTTTJJJjjO...", "..OSsJJJJTTTTJJJjjO...", "...OOOOPPdOOPPdOOO....", "......OPPdOOPPdO......", "......OPPdOOPPdO......", ".....OFFFFOOPPdO......", ".....OffffOOPPdO......", "......OOOOOFFFFO......", "..........OffffO......", "...........OOOO......."], "down2": ["......OOOO..OOOO......", ".....OlNNNOONNNNO.....", "....OllNNNnnNNNNnO....", "....OlNNNNNNNNNNnO....", "....OlNNNNNNNNNNnO....", "..OOObbbbbbbbbbbbOOO..", ".ONNNNNNNNNNNNNNNNNNO.", "ONnnnnnnnnnnnnnnnnnnNO", ".OOHHHkHHHkHHHkHHHHOO.", ".OHHHHhHHHhHHhHHHhHHO.", "..OHhHShHhSHhSHhhsHO..", ".OHHShSShSShSShSSsHHO.", "..OHSSSeESSSSeESSsHO..", "..OHSSSEESSSSEESSsHO..", "..OHSSSEESSSSEESSsHO..", "..OhSppSSSSSSSSppshO..", "..OHOSSSSSMMSSSSSOHO..", "...O.OSSSSSSSSSSO.O...", "....OzzzzssssGGGGO....", "...OOGGGGGGGGGGGGOO...", "..OjJiJJiTTTTGgjjJjO..", "..OJJqJqJTTTTGGqjJJO..", "..OJJiJJJTTTTGgjjJJO..", "..OJJiJJJTTTTGGjjJJO..", "..OJJqJqJTTTTgGqjJJO..", "..OSsJiiiTTTTiiijJJO..", "...OiJJJJTTTTJJJjJJO..", "...OiJJJJTTTTJJJjSsO..", "....OOOPPdOOPPdOOOO...", "......OPPdOOPPdO......", "......OPPdOOPPdO......", "......OPPdOFFFFO......", "......OPPdOffffO......", ".....OFFFFOOOOO.......", ".....OffffO...........", "......OOOO............"], "up0": ["......OOOO..OOOO......", ".....OlNNNOONNNNO.....", "....OllNNNnnNNNNnO....", "....OlNNNNNNNNNNnO....", "....OlNNNNNNNNNNnO....", "..OOObbbbbbbbbbbbOOO..", ".ONNNNNNNNNNNNNNNNNNO.", "ONnnnnnnnnnnnnnnnnnnNO", ".OOhHHhHHhHHhHHhHHhOO.", ".OHhHkhHHkHHhkHhHkhHO.", "..OhHHhHHhHHhHHhHHhO..", ".OHhHHhHHhHHhHHhHHhHO.", "..OhHHhHHhHHhHHhHHhO..", "..OhHHhHHhHHhHHhHHhO..", "..OhHHhHHhHHhHHhHHhO..", "..OHHHhHHhHHhHHhHHHO..", "...OOHOssHHssHsOHOO...", ".....OOssssssssOO.....", "....OzzzssssssGGGO....", "...OOggggggggggggOO...", "..OjJiJJJGGqJJJjjJjO..", "..OJJqJqJGGqJqJqjJJO..", "..OJJiJJJGGqJJJjjJJO..", "..OJJiJJJJqqJJJjjJJO..", "..OJJqJqJqqqJqJqjJJO..", "..OJJJJJJJqqJJJJjJJO..", "..OSsJJJJJqqJJJJjSsO..", "...OiJJJJJqqJJJJjjO...", "....OOOPPdOOPPdOOO....", "......OPPdOOPPdO......", "......OPPdOOPPdO......", "......OPPdOOPPdO......", "......OPPdOOPPdO......", ".....OFFFFOFFFFO......", ".....OffffOffffO......", "......OOOO.OOOO......."], "up1": ["......OOOO..OOOO......", ".....OlNNNOONNNNO.....", "....OllNNNnnNNNNnO....", "....OlNNNNNNNNNNnO....", "....OlNNNNNNNNNNnO....", "..OOObbbbbbbbbbbbOOO..", ".ONNNNNNNNNNNNNNNNNNO.", "ONnnnnnnnnnnnnnnnnnnNO", ".OOhHHhHHhHHhHHhHHhOO.", ".OHhHkhHHkHHhkHhHkhHO.", "..OhHHhHHhHHhHHhHHhO..", ".OHhHHhHHhHHhHHhHHhHO.", "..OhHHhHHhHHhHHhHHhO..", "..OhHHhHHhHHhHHhHHhO..", "..OhHHhHHhHHhHHhHHhO..", "..OHHHhHHhHHhHHhHHHO..", "...OOHOssHHssHsOHOO...", ".....OOssssssssOO.....", "....OzzzssssssGGGO....", "...OOggggggggggggOO...", "..OjJiJJJGGqJJJjjJjO..", "..OJJqJqJGGqJqJqjJJO..", "..OJJiJJJGGqJJJjjJJO..", "..OJJiJJJJqqJJJjjJJO..", "..OJJqJqJqqqJqJqjJJO..", "..OJJJJJJJqqJJJJjSsO..", "..OJJJJJJJqqJJJJjjO...", "..OSsJJJJJqqJJJJjjO...", "...OOOOPPdOOPPdOOO....", "......OPPdOOPPdO......", "......OPPdOOPPdO......", ".....OFFFFOOPPdO......", ".....OffffOOPPdO......", "......OOOOOFFFFO......", "..........OffffO......", "...........OOOO......."], "up2": ["......OOOO..OOOO......", ".....OlNNNOONNNNO.....", "....OllNNNnnNNNNnO....", "....OlNNNNNNNNNNnO....", "....OlNNNNNNNNNNnO....", "..OOObbbbbbbbbbbbOOO..", ".ONNNNNNNNNNNNNNNNNNO.", "ONnnnnnnnnnnnnnnnnnnNO", ".OOhHHhHHhHHhHHhHHhOO.", ".OHhHkhHHkHHhkHhHkhHO.", "..OhHHhHHhHHhHHhHHhO..", ".OHhHHhHHhHHhHHhHHhHO.", "..OhHHhHHhHHhHHhHHhO..", "..OhHHhHHhHHhHHhHHhO..", "..OhHHhHHhHHhHHhHHhO..", "..OHHHhHHhHHhHHhHHHO..", "...OOHOssHHssHsOHOO...", ".....OOssssssssOO.....", "....OzzzssssssGGGO....", "...OOggggggggggggOO...", "..OjJiJJJGGqJJJjjJjO..", "..OJJqJqJGGqJqJqjJJO..", "..OJJiJJJGGqJJJjjJJO..", "..OJJiJJJJqqJJJjjJJO..", "..OJJqJqJqqqJqJqjJJO..", "..OSsJJJJJqqJJJJjJJO..", "...OiJJJJJqqJJJJjJJO..", "...OiJJJJJqqJJJJjSsO..", "....OOOPPdOOPPdOOOO...", "......OPPdOOPPdO......", "......OPPdOOPPdO......", "......OPPdOFFFFO......", "......OPPdOffffO......", ".....OFFFFOOOOO.......", ".....OffffO...........", "......OOOO............"], "side0": [".......OOOO..OOOO.....", "......OlNNNOONNNNO....", ".....OllNNNnnNNNNnO...", ".....OlNNNNNNNNNNnO...", ".....OlNNNNNNNNNNnO...", ".OOOOObbbbbbbbbbbbOOO.", "ONNNNNNNNNNNNNNNNNNNNO", "NnnnnnnnnnnnnnnnnnnnnN", "OOHHHHHHkHHHkHHHkHHOOO", ".OhHHHHHHHhHHHhHHHHO..", "OHhHHHhHhHShHhShHhhO..", ".OhHHHshShSShSSShSSO..", ".OhHHHsSSSSeESSeESSO..", "OHhHHHsSSSSEESSEESSO..", ".OhHHHsSSSSEESSEESpO..", ".OhHHHsSSppSSSSSSSO...", ".OhHHHSSSSSSSSMMSSO...", ".OHHHHSSSSSSSSSSSO....", "..OOOOzzzzssssGGGO....", ".....OGGGGGGGGGGGO....", "....OGiJJJjjJJTTO.....", "...OGOqJqJjjqJTTO.....", "....OGiJJjjjJJTTO.....", "...OgOiJJjjjJJTTO.....", "....OOqJqijjqJTTO.....", "....OiJiijjjJJTTjO....", "....OiJJJSSsJJTTjO....", "....OiJJJJJJJJJJjO....", ".....OOOPPdPPdOOO.....", ".......OPPdPPdO.......", ".......OPPdPPdO.......", ".......OPPdPPdO.......", ".......OPPdPPdO.......", ".......OFFFFFFFO......", ".......OfffffffO......", "........OOOOOOO......."], "side1": [".......OOOO..OOOO.....", "......OlNNNOONNNNO....", ".....OllNNNnnNNNNnO...", ".....OlNNNNNNNNNNnO...", ".....OlNNNNNNNNNNnO...", ".OOOOObbbbbbbbbbbbOOO.", "ONNNNNNNNNNNNNNNNNNNNO", "NnnnnnnnnnnnnnnnnnnnnN", "OOHHHHHHkHHHkHHHkHHOOO", ".OhHHHHHHHhHHHhHHHHO..", "OHhHHHhHhHShHhShHhhO..", ".OhHHHshShSShSSShSSO..", ".OhHHHsSSSSeESSeESSO..", "OHhHHHsSSSSEESSEESSO..", ".OhHHHsSSSSEESSEESpO..", ".OhHHHsSSppSSSSSSSO...", ".OhHHHSSSSSSSSMMSSO...", ".OHHHHSSSSSSSSSSSO....", "..OOOOzzzzssssGGGO....", "...OOGGGGGGGGGGGGO....", "..OGGOiJJJJjjJTTO.....", "...OGOqJqJJjjJTTO.....", "..OgOOiJJJjjjJTTO.....", "...O.OiJJJjjjJTTO.....", ".....OqJqJijjJTTO.....", "....OiJiiijjjJTTjO....", "....OiJJJJSSsJTTjO....", "....OiJJJJJJJJJJjO....", ".....OPPdOOOOPPdO.....", ".....OPPdO..OPPdO.....", ".....OPPdO..OPPdO.....", ".....OPPdO..OPPdO.....", ".....OFFFFO.OPPdO.....", ".....OffffO.OFFFFO....", "......OOOO..OffffO....", ".............OOOO....."], "side2": [".......OOOO..OOOO.....", "......OlNNNOONNNNO....", ".....OllNNNnnNNNNnO...", ".....OlNNNNNNNNNNnO...", ".....OlNNNNNNNNNNnO...", ".OOOOObbbbbbbbbbbbOOO.", "ONNNNNNNNNNNNNNNNNNNNO", "NnnnnnnnnnnnnnnnnnnnnN", "OOHHHHHHkHHHkHHHkHHOOO", ".OhHHHHHHHhHHHhHHHHO..", "OHhHHHhHhHShHhShHhhO..", ".OhHHHshShSShSSShSSO..", ".OhHHHsSSSSeESSeESSO..", "OHhHHHsSSSSEESSEESSO..", ".OhHHHsSSSSEESSEESpO..", ".OhHHHsSSppSSSSSSSO...", ".OhHHHSSSSSSSSMMSSO...", ".OHHHHSSSSSSSSSSSO....", "..OOOOzzzzssssGGGO....", "...OOGGGGGGGGGGGGO....", "..OGGOiJJjjJJJTTO.....", "...OGOqJJjjJqJTTO.....", "..OgOOiJjjjJJJTTO.....", "...O.OiJjjjJJJTTO.....", ".....OqJijjJqJTTO.....", "....OiJijjjJJJTTjO....", "....OiJJSSsJJJTTjO....", "....OiJJJJJJJJJJjO....", ".....OOPPdOOPPdOO.....", "......OPPdOOPPdO......", "......OPPdOOPPdO......", "......OPPdOOPPdO......", "......OPPdOOFFFFO.....", "......OFFFFOffffO.....", "......OffffOOOOO......", ".......OOOO..........."]};
function buildDetective() {
  const f = {};
  for (let i = 0; i < 3; i++) {
    f['down' + i] = spriteCanvas(DFR['down' + i], DPAL);
    f['up' + i] = spriteCanvas(DFR['up' + i], DPAL);
    f['right' + i] = spriteCanvas(DFR['side' + i], DPAL);
    f['left' + i] = spriteCanvas(mirror(DFR['side' + i]), DPAL);
  }
  // portrait: head + hat only, trimmed to fit the 22px badge
  f.portrait = spriteCanvas(DFR.down0.slice(0, 20), DPAL);
  return f;
}
