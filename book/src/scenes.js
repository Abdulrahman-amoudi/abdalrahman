/* Flat vector scenes, one per page, all in the page's own colour.
   Drawn on a 1600×940 canvas with the scene in the left ~55%; pages whose words sit on the
   left get the scene mirrored. Shapes only: no outlines, no gradients, no text. */

export function shade(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))));
    return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}
const tones = b => ({ b, pale: shade(b, .62), light: shade(b, .36), soft: shade(b, .16), mid: shade(b, -.14), dark: shade(b, -.3), deep: shade(b, -.5), ink: shade(b, -.66) });

// the person: a round head and a soft body, sitting or standing, optional raised arm
function person(x, y, s, c, { pose = 'sit', arm = false, headphones = null } = {}) {
    const h = `<circle cx="${x}" cy="${y - 150 * s}" r="${40 * s}" fill="${c}"/>`;
    const body = pose === 'sit'
        ? `<path d="M${x - 50 * s} ${y}c0-${80 * s} ${18 * s}-${118 * s} ${50 * s}-${118 * s}s${50 * s} ${38 * s} ${50 * s} ${118 * s}z" fill="${c}"/>`
        : `<path d="M${x - 46 * s} ${y - 150 * s}c0-0 ${10 * s}-${30 * s} ${46 * s}-${30 * s}s${46 * s} ${30 * s} ${46 * s} ${30 * s}l${8 * s} ${150 * s}h-${108 * s}z" fill="${c}"/>
           <rect x="${x - 34 * s}" y="${y}" width="${26 * s}" height="${150 * s}" rx="${10 * s}" fill="${c}"/><rect x="${x + 8 * s}" y="${y}" width="${26 * s}" height="${150 * s}" rx="${10 * s}" fill="${c}"/>`;
    const a = arm ? `<path d="M${x + 30 * s} ${y - (pose === 'sit' ? 90 : 120) * s}l${70 * s}-${90 * s}" stroke="${c}" stroke-width="${24 * s}" stroke-linecap="round"/>` : '';
    const hp = headphones ? `<path d="M${x - 44 * s} ${y - 150 * s}a${44 * s} ${44 * s} 0 0 1 ${88 * s} 0" fill="none" stroke="${headphones}" stroke-width="${10 * s}"/><rect x="${x - 54 * s}" y="${y - 162 * s}" width="${18 * s}" height="${34 * s}" rx="${7 * s}" fill="${headphones}"/><rect x="${x + 36 * s}" y="${y - 162 * s}" width="${18 * s}" height="${34 * s}" rx="${7 * s}" fill="${headphones}"/>` : '';
    return h + body + a + hp;
}
function plant(x, y, s, pot, leaf) {
    return `<path d="M${x - 24 * s} ${y}h${48 * s}l-${7 * s}-${62 * s}h-${34 * s}z" fill="${pot}"/>
      <path d="M${x} ${y - 66 * s}c-${44 * s}-${50 * s}-${22 * s}-${116 * s} ${10 * s}-${126 * s} ${10 * s} ${42 * s} ${30 * s} ${84 * s}-${10 * s} ${126 * s}z" fill="${leaf}"/>
      <path d="M${x + 4 * s} ${y - 60 * s}c${30 * s}-${62 * s} ${82 * s}-${72 * s} ${102 * s}-${60 * s}-${22 * s} ${42 * s}-${52 * s} ${72 * s}-${102 * s} ${60 * s}z" fill="${leaf}"/>
      <path d="M${x - 4 * s} ${y - 58 * s}c-${32 * s}-${36 * s}-${76 * s}-${36 * s}-${92 * s}-${20 * s} ${22 * s} ${30 * s} ${56 * s} ${40 * s} ${92 * s} ${20 * s}z" fill="${leaf}"/>`;
}
function desk(x, w, y, c) {
    return `<rect x="${x}" y="${y}" width="${w}" height="22" rx="6" fill="${c}"/><rect x="${x + 30}" y="${y + 22}" width="18" height="${930 - y}" fill="${c}"/><rect x="${x + w - 48}" y="${y + 22}" width="18" height="${930 - y}" fill="${c}"/>`;
}
function laptop(x, y, c, screen) {
    return `<rect x="${x}" y="${y - 130}" width="200" height="126" rx="10" fill="${c}"/><rect x="${x + 12}" y="${y - 118}" width="176" height="100" rx="4" fill="${screen}"/><rect x="${x - 20}" y="${y - 6}" width="240" height="8" rx="4" fill="${c}"/>`;
}
// Amman: stacked white houses with small windows
function houses(x, y, w, c, win, seed = 3) {
    let out = '', cx = x, r = seed;
    const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
    while (cx < x + w) {
        const bw = 50 + rnd() * 70, bh = 50 + rnd() * 110;
        out += `<rect x="${cx}" y="${y - bh}" width="${bw}" height="${bh + 2}" fill="${c}"/>`;
        for (let wy = y - bh + 16; wy < y - 18; wy += 30) for (let wx = cx + 12; wx < cx + bw - 18; wx += 26) if (rnd() < .55) out += `<rect x="${wx}" y="${wy}" width="10" height="14" fill="${win}"/>`;
        if (rnd() < .3) out += `<rect x="${cx + bw * .3}" y="${y - bh - 22}" width="${bw * .4}" height="22" rx="4" fill="${c}"/>`;
        cx += bw + 4;
    }
    return out;
}
function archWindow(x, y, w, h, t, view = '') {
    const r = w / 2;
    return `<path d="M${x - 20} ${y + h}V${y + r}a${r + 20} ${r + 20} 0 0 1 ${w + 40} 0v${h - r}z" fill="${t.pale}"/>
      <clipPath id="win${x}"><path d="M${x} ${y + h}V${y + r}a${r} ${r} 0 0 1 ${w} 0v${h - r}z"/></clipPath>
      <g clip-path="url(#win${x})"><rect x="${x}" y="${y - 10}" width="${w}" height="${h + 20}" fill="${t.light}"/>${view}</g>
      <rect x="${x + w / 2 - 5}" y="${y}" width="10" height="${h}" fill="${t.pale}"/><rect x="${x}" y="${y + h * .55}" width="${w}" height="10" fill="${t.pale}"/>`;
}

const SCENES = {
    // 1. hello: my room in Amman, desk by the arched window
    '01-hello': t => `
      <rect width="1600" height="940" fill="${t.b}"/><rect y="660" width="1600" height="280" fill="${t.mid}"/>
      ${archWindow(110, 120, 320, 540, t, `<circle cx="340" cy="230" r="34" fill="${t.pale}"/>${houses(110, 560, 320, t.pale, t.light, 5)}${houses(110, 640, 320, t.soft, t.light, 11)}`)}
      <rect x="0" y="660" width="1600" height="10" fill="${t.dark}"/>
      ${desk(470, 520, 590, t.deep)}
      ${laptop(640, 590, t.deep, t.light)}
      ${person(560, 590, 1, t.deep)}
      <rect x="900" y="540" width="36" height="50" rx="6" fill="${t.dark}"/><path d="M906 540l-6-40M918 540l4-46M930 540l10-36" stroke="${t.deep}" stroke-width="6" stroke-linecap="round"/>
      ${plant(1020, 660, 1.1, t.dark, t.deep)}`,

    // 2. video: editing at night, timeline on a wide screen, lamp and camera
    '02-video': t => `
      <rect width="1600" height="940" fill="${t.b}"/><rect y="650" width="1600" height="290" fill="${t.dark}"/>
      ${archWindow(90, 110, 260, 440, t, `<circle cx="270" cy="200" r="30" fill="${t.pale}"/><circle cx="150" cy="170" r="4" fill="${t.pale}"/><circle cx="200" cy="260" r="3" fill="${t.pale}"/>${houses(90, 550, 260, t.soft, t.pale, 7)}`)}
      ${desk(420, 600, 580, t.deep)}
      <rect x="560" y="330" width="380" height="230" rx="12" fill="${t.deep}"/><rect x="576" y="346" width="348" height="198" rx="4" fill="${t.mid}"/>
      <rect x="592" y="362" width="150" height="90" rx="4" fill="${t.light}"/><rect x="752" y="362" width="156" height="90" rx="4" fill="${t.soft}"/>
      <rect x="592" y="468" width="200" height="14" rx="3" fill="${t.pale}"/><rect x="800" y="468" width="108" height="14" rx="3" fill="${t.light}"/>
      <rect x="592" y="490" width="120" height="14" rx="3" fill="${t.light}"/><rect x="720" y="490" width="188" height="14" rx="3" fill="${t.pale}"/>
      <rect x="592" y="512" width="316" height="12" rx="3" fill="${t.soft}"/><rect x="700" y="458" width="4" height="76" fill="${t.pale}"/>
      <rect x="735" y="560" width="30" height="20" fill="${t.deep}"/>
      ${person(500, 580, 1, t.ink)}
      <path d="M1000 580l-40-170 60-30" stroke="${t.deep}" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M990 372h70l20 40h-110z" fill="${t.deep}"/>
      <path d="M970 412h100l90 170H880z" fill="${t.pale}" opacity=".16"/>
      <path d="M1180 650l40-160M1220 490l40 160M1220 490v160" stroke="${t.deep}" stroke-width="10" stroke-linecap="round"/>
      <rect x="1170" y="430" width="100" height="64" rx="10" fill="${t.deep}"/><circle cx="1220" cy="462" r="20" fill="${t.mid}"/><circle cx="1220" cy="462" r="9" fill="${t.light}"/>
      <circle cx="1188" cy="422" r="16" fill="${t.deep}"/><circle cx="1230" cy="418" r="20" fill="${t.deep}"/>`,

    // 3. AI: a board of connected ideas, a small robot sorting notes
    '03-ai': t => {
        const nodes = [[260, 210], [430, 150], [560, 260], [380, 330], [220, 410], [520, 430], [660, 170]];
        const links = [[0, 1], [1, 2], [0, 3], [3, 2], [3, 4], [2, 5], [1, 6], [4, 5]];
        return `
      <rect width="1600" height="940" fill="${t.b}"/><rect y="680" width="1600" height="260" fill="${t.mid}"/>
      <rect x="140" y="90" width="620" height="440" rx="18" fill="${t.light}"/>
      ${links.map(([a, b]) => `<path d="M${nodes[a][0]} ${nodes[a][1]}L${nodes[b][0]} ${nodes[b][1]}" stroke="${t.dark}" stroke-width="5" stroke-dasharray="2 12" stroke-linecap="round"/>`).join('')}
      ${nodes.map(([x, y], i) => `<rect x="${x - 46}" y="${y - 30}" width="92" height="60" rx="10" fill="${i % 3 === 0 ? t.pale : t.soft}"/><rect x="${x - 30}" y="${y - 12}" width="${40 + (i * 13) % 20}" height="8" rx="4" fill="${t.mid}"/><rect x="${x - 30}" y="${y + 4}" width="34" height="8" rx="4" fill="${t.mid}"/>`).join('')}
      <rect x="430" y="530" width="20" height="150" fill="${t.dark}"/>
      ${person(830, 680, 1.05, t.deep, { pose: 'stand', arm: true })}
      ${desk(950, 380, 600, t.deep)}
      ${laptop(1050, 600, t.deep, t.light)}
      <rect x="1000" y="520" width="70" height="66" rx="16" fill="${t.dark}"/><circle cx="1022" cy="550" r="7" fill="${t.pale}"/><circle cx="1048" cy="550" r="7" fill="${t.pale}"/><rect x="1032" y="498" width="6" height="22" fill="${t.dark}"/><circle cx="1035" cy="494" r="9" fill="${t.pale}"/>
      <rect x="1006" y="586" width="58" height="14" rx="4" fill="${t.dark}"/>
      <path d="M1120 360l60-14 10 44-60 14z" fill="${t.pale}"/><path d="M1220 300l54 12-10 44-54-12z" fill="${t.soft}"/><path d="M1160 250l48-24 18 40-48 24z" fill="${t.pale}"/>`;
    },

    // 4. networks: a rack of blinking lights, cables down to the switches on the floor
    '04-networks': t => {
        let lights = '';
        for (let u = 0; u < 9; u++) for (let k = 0; k < 6; k++) lights += `<circle cx="${280 + k * 22}" cy="${190 + u * 46}" r="5" fill="${(u + k) % 3 === 0 ? t.pale : t.light}"/>`;
        return `
      <rect width="1600" height="940" fill="${t.b}"/><rect y="700" width="1600" height="240" fill="${t.dark}"/>
      <rect x="230" y="120" width="300" height="580" rx="12" fill="${t.deep}"/>
      ${Array.from({ length: 9 }, (_, u) => `<rect x="250" y="${170 + u * 46}" width="260" height="38" rx="4" fill="${t.ink}"/>`).join('')}
      ${lights}
      <path d="M520 320c120 40 140 220 260 300M520 412c80 30 60 200 200 250M520 504c60 20 40 140 120 170" stroke="${t.light}" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path d="M520 366c140 50 260 140 360 300" stroke="${t.pale}" stroke-width="12" fill="none" stroke-linecap="round"/>
      <rect x="610" y="650" width="220" height="56" rx="10" fill="${t.deep}"/>${Array.from({ length: 6 }, (_, k) => `<rect x="${630 + k * 32}" y="668" width="18" height="16" rx="3" fill="${t.ink}"/>`).join('')}
      <rect x="850" y="660" width="120" height="46" rx="10" fill="${t.deep}"/><path d="M880 660l-12-50M940 660l12-50" stroke="${t.deep}" stroke-width="8" stroke-linecap="round"/>
      ${person(1060, 706, 1, t.ink, { arm: true })}
      <rect x="1120" y="630" width="200" height="76" rx="10" fill="${t.mid}"/><rect x="1134" y="642" width="172" height="52" rx="4" fill="${t.light}"/>
      <circle cx="1170" cy="668" r="8" fill="${t.deep}"/><circle cx="1220" cy="656" r="8" fill="${t.deep}"/><circle cx="1270" cy="676" r="8" fill="${t.deep}"/><path d="M1170 668l50-12 50 20" stroke="${t.deep}" stroke-width="4" fill="none"/>`;
    },

    // 5. websites: a shopfront with an awning; the window shows a web page
    '05-web': t => `
      <rect width="1600" height="940" fill="${t.b}"/><rect y="720" width="1600" height="220" fill="${t.mid}"/>
      <rect x="120" y="120" width="760" height="600" fill="${t.light}"/>
      <rect x="120" y="120" width="760" height="70" fill="${t.dark}"/><rect x="330" y="140" width="340" height="30" rx="6" fill="${t.pale}"/>
      ${Array.from({ length: 10 }, (_, k) => `<path d="M${120 + k * 76} 190h76v60a38 38 0 0 1-76 0z" fill="${k % 2 ? t.pale : t.dark}"/>`).join('')}
      <rect x="170" y="300" width="420" height="380" rx="8" fill="${t.deep}"/><rect x="186" y="316" width="388" height="348" rx="4" fill="${t.pale}"/>
      <rect x="206" y="336" width="140" height="18" rx="4" fill="${t.dark}"/><rect x="206" y="372" width="348" height="120" rx="6" fill="${t.soft}"/>
      <rect x="206" y="510" width="106" height="80" rx="6" fill="${t.light}"/><rect x="327" y="510" width="106" height="80" rx="6" fill="${t.light}"/><rect x="448" y="510" width="106" height="80" rx="6" fill="${t.light}"/>
      <rect x="206" y="608" width="120" height="34" rx="17" fill="${t.dark}"/>
      <rect x="640" y="330" width="190" height="390" rx="6" fill="${t.dark}"/><circle cx="805" cy="530" r="8" fill="${t.pale}"/>
      ${person(980, 720, 1.05, t.deep, { pose: 'stand' })}
      <rect x="1020" y="470" width="120" height="160" rx="12" fill="${t.ink}" transform="rotate(-12 1080 550)"/><rect x="1030" y="482" width="100" height="134" rx="6" fill="${t.light}" transform="rotate(-12 1080 550)"/>
      <path d="M1000 600l40-60" stroke="${t.deep}" stroke-width="24" stroke-linecap="round"/>
      ${plant(1250, 720, 1.2, t.dark, t.deep)}`,

    // 6. motion: headphones on, a pixel character walking across the screen, film and sound around
    '06-motion': t => {
        const px = [[2, 0, 4], [1, 1, 6], [2, 2, 1], [5, 2, 1], [1, 3, 6], [2, 4, 4], [1, 5, 2], [5, 5, 2], [1, 6, 1], [6, 6, 1]];
        const pix = px.map(([x, y, w]) => `<rect x="${700 + x * 16}" y="${390 + y * 16}" width="${w * 16}" height="16" fill="${t.ink}"/>`).join('');
        return `
      <rect width="1600" height="940" fill="${t.b}"/><rect y="660" width="1600" height="280" fill="${t.dark}"/>
      ${desk(380, 640, 590, t.deep)}
      <rect x="560" y="320" width="400" height="250" rx="12" fill="${t.deep}"/><rect x="576" y="336" width="368" height="200" rx="4" fill="${t.pale}"/>
      <rect x="576" y="500" width="368" height="36" fill="${t.light}"/>${pix}
      <rect x="745" y="570" width="30" height="20" fill="${t.deep}"/>
      ${person(470, 590, 1, t.ink, { headphones: t.light })}
      <g transform="rotate(-14 260 250)"><rect x="140" y="200" width="300" height="90" rx="6" fill="${t.deep}"/>${Array.from({ length: 7 }, (_, k) => `<rect x="${152 + k * 42}" y="208" width="24" height="12" rx="2" fill="${t.b}"/><rect x="${152 + k * 42}" y="270" width="24" height="12" rx="2" fill="${t.b}"/>`).join('')}<rect x="160" y="226" width="80" height="38" rx="3" fill="${t.light}"/><rect x="250" y="226" width="80" height="38" rx="3" fill="${t.soft}"/><rect x="340" y="226" width="80" height="38" rx="3" fill="${t.light}"/></g>
      ${[40, 80, 120, 70, 140, 90, 50, 110, 60].map((h, k) => `<rect x="${1060 + k * 26}" y="${380 - h / 2}" width="14" height="${h}" rx="7" fill="${k % 2 ? t.light : t.pale}"/>`).join('')}
      ${plant(1120, 660, .9, t.mid, t.deep)}`;
    },

    // 7. work: a pinboard of things I've built, one more going up
    '07-work': t => {
        const cards = [[170, 130, 170, 130], [370, 110, 150, 170], [550, 140, 190, 120], [190, 300, 150, 150], [370, 320, 190, 130], [590, 300, 150, 160]];
        return `
      <rect width="1600" height="940" fill="${t.b}"/><rect y="700" width="1600" height="240" fill="${t.mid}"/>
      <rect x="130" y="80" width="660" height="460" rx="16" fill="${t.light}"/>
      <path d="M260 200L450 190 640 200M450 190L270 370 460 380 660 380" stroke="${t.dark}" stroke-width="4" fill="none"/>
      ${cards.map(([x, y, w, h], i) => `<g transform="rotate(${[-3, 2, -2, 3, -1, 2][i]} ${x + w / 2} ${y + h / 2})"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${i % 2 ? t.pale : t.soft}"/>
        <rect x="${x + 12}" y="${y + 14}" width="${w - 24}" height="${h * .45}" rx="4" fill="${i % 3 ? t.light : t.mid}"/><rect x="${x + 12}" y="${y + h * .62}" width="${w * .5}" height="10" rx="5" fill="${t.dark}"/><rect x="${x + 12}" y="${y + h * .62 + 18}" width="${w * .3}" height="10" rx="5" fill="${t.mid}"/></g>
        <circle cx="${x + w / 2}" cy="${y + 4}" r="9" fill="${t.deep}"/>`).join('')}
      ${person(900, 700, 1.05, t.deep, { pose: 'stand', arm: true })}
      <g transform="rotate(8 1000 420)"><rect x="950" y="380" width="120" height="96" rx="6" fill="${t.pale}"/><rect x="962" y="392" width="96" height="44" rx="4" fill="${t.light}"/></g>
      <rect x="1120" y="560" width="120" height="16" rx="6" fill="${t.deep}"/><rect x="1130" y="576" width="14" height="124" fill="${t.deep}"/><rect x="1216" y="576" width="14" height="124" fill="${t.deep}"/>
      <rect x="1140" y="520" width="80" height="40" rx="6" fill="${t.dark}"/>`;
    },

    // 8. contact: an Amman rooftop at golden hour, water tanks, tea, laptop open
    '08-hello-again': t => `
      <rect width="1600" height="940" fill="${t.b}"/>
      <circle cx="380" cy="270" r="84" fill="${t.pale}"/>
      ${houses(0, 560, 900, t.soft, t.light, 17)}
      ${houses(0, 620, 940, t.light, t.soft, 29)}
      <rect y="620" width="1600" height="320" fill="${t.mid}"/><rect y="620" width="1600" height="24" fill="${t.dark}"/>
      <ellipse cx="170" cy="520" rx="62" ry="20" fill="${t.dark}"/><rect x="108" y="520" width="124" height="74" fill="${t.dark}"/><ellipse cx="170" cy="594" rx="62" ry="20" fill="${t.deep}"/><rect x="124" y="596" width="12" height="28" fill="${t.deep}"/><rect x="204" y="596" width="12" height="28" fill="${t.deep}"/>
      <ellipse cx="310" cy="540" rx="50" ry="16" fill="${t.dark}"/><rect x="260" y="540" width="100" height="58" fill="${t.dark}"/><ellipse cx="310" cy="598" rx="50" ry="16" fill="${t.deep}"/>
      <path d="M800 470a56 56 0 0 1 84 66z" fill="${t.light}"/><path d="M838 528l-8 92" stroke="${t.dark}" stroke-width="8"/>
      <rect x="430" y="720" width="460" height="24" rx="8" fill="${t.deep}"/><rect x="450" y="744" width="18" height="130" fill="${t.deep}"/><rect x="852" y="744" width="18" height="130" fill="${t.deep}"/>
      ${person(530, 720, 1, t.ink, { arm: true })}
      ${laptop(610, 720, t.ink, t.light)}
      <path d="M842 720l6-40h30l6 40z" fill="${t.pale}"/><path d="M856 672c-4-14 6-20 2-34M870 674c-4-14 6-20 2-34" stroke="${t.pale}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
};

// where each scene's floor starts and which tone it is, so the wall and floor can run full width
const FLOORS = { '01-hello': [660, 'mid'], '02-video': [650, 'dark'], '03-ai': [680, 'mid'], '04-networks': [700, 'dark'], '05-web': [720, 'mid'], '06-motion': [660, 'dark'], '07-work': [700, 'mid'], '08-hello-again': [620, 'mid'] };
const S = .64, OX = 24; // the scene is scaled into the art half, standing on the same floor

export function sceneSvg(p) {
    const t = tones(p.bg);
    const draw = SCENES[p.id] || SCENES['01-hello'];
    const [fy, fk] = FLOORS[p.id] || [660, 'mid'];
    const floorY = 940 - (940 - fy) * S;
    const g = `<rect width="1600" height="940" fill="${t.b}"/><rect y="${floorY}" width="1600" height="${940 - floorY}" fill="${t[fk]}"/>
      <g transform="translate(${OX} ${940 * (1 - S)}) scale(${S})">${draw(t)}</g>`;
    const flip = p.side === 'left';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 940" width="1600" height="940">${flip ? `<g transform="translate(1600 0) scale(-1 1)">${g}</g>` : g}</svg>`;
}
