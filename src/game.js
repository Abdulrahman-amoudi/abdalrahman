(() => {
'use strict';
const WW = 480, WH = 300, WALL = 64; // world size
let VW = 480, VH = 270, camX = 0, camY = 0, cxF = -1, cyF = 0; // view size is picked in fit()
const cv = document.getElementById('game'), g = cv.getContext('2d');
let lang = 'en', night = false, sound = true, acOn = false, panelOpen = false;
try { lang = localStorage.getItem('ab-lang') || 'en'; night = localStorage.getItem('ab-night') === '1'; sound = localStorage.getItem('ab-sound') !== '0'; } catch (e) {}

// ---------------- content ----------------
const T = {
  en: { sub: 'network · AI · video · web', menu: 'Menu', back: '← Previous', next: 'Next →', close: 'Close',
    hello: 'Hi, I’m Abdalrahman. This is my room: skills on the left, projects on the right, GitHub in the corner.',
    pet: ['The sun purrs.', 'The sun is happy.', '+1 sunshine', 'Warm. Very warm.'], acOn: 'AC on. Brrr.', acOff: 'AC off.',
    tv: ['Rendering… 87%', 'Just one more episode.', 'FIFA later?'], fridge: ['Cold Pepsi. Nice.', 'Nothing new since last time.'], guitar: ['♪ ♫ ♪', 'Still learning that one.'], lamp: 'Lamp toggled.' },
  ar: { sub: 'شبكات · ذكاء اصطناعي · مونتاج · ويب', menu: 'القائمة', back: '→ السابق', next: 'التالي ←', close: 'إغلاق',
    hello: 'هلا، أنا عبد الرحمن. هاي غرفتي: المهارات عاليسار، المشاريع عاليمين، وGitHub بالزاوية.',
    pet: ['الشمس مبسوطة.', 'دفا ☀', '+١ شمس', 'شكراً!'], acOn: 'شغّلت المكيّف. بررر.', acOff: 'طفّيت المكيّف.',
    tv: ['جاري التصدير… ٨٧٪', 'حلقة وحدة كمان.', 'فيفا بعدين؟'], fridge: ['بيبسي باردة. حلو.', 'ما في إشي جديد.'], guitar: ['♪ ♫ ♪', 'لسا بتعلمها.'], lamp: 'الضو.' },
};
const P = {
  story: { c: '#ff8a2a', en: { tag: 'BOOKSHELF · ABOUT', h: 'Hi, I’m Abdalrahman.', p: 'I’m a BTEC student in Amman, Jordan. I do three things seriously: networks, AI and video. I also build websites and apps through my small studio, Wajha.',
      story: [['2022', 'I opened Premiere Pro for the first time and didn’t stop. 75+ videos later, editing is still my favourite thing.'], ['2023', 'I started building with AI: agents, automations and a second brain that links my notes for me.'], ['2024', 'I fell into networking: designing topologies and configuring Cisco gear in Packet Tracer.'], ['2025', 'I started Wajha to build websites, systems and motion videos for real clients.']] },
    ar: { tag: 'المكتبة · عنّي', h: 'هلا، أنا عبد الرحمن.', p: 'طالب BTEC من عمّان، الأردن. بشتغل بجد على ثلاث أشياء: الشبكات، الذكاء الاصطناعي، والمونتاج. وكمان ببني مواقع وتطبيقات من خلال استوديو صغير اسمه واجهة.',
      story: [['٢٠٢٢', 'فتحت بريمير لأول مرة وما وقفت. أكثر من ٧٥ فيديو، والمونتاج لسا أكثر إشي بحبه.'], ['٢٠٢٣', 'بلّشت أبني بالذكاء الاصطناعي: وكلاء، أتمتة، و«عقل ثاني» بربط ملاحظاتي لحاله.'], ['٢٠٢٤', 'دخلت عالم الشبكات: تصميم الطوبولوجيا وإعداد أجهزة سيسكو على Packet Tracer.'], ['٢٠٢٥', 'أسست واجهة عشان أبني مواقع وأنظمة وفيديوهات موشن لعملاء حقيقيين.']] } },
  edit: { c: '#6aa2ff', en: { tag: 'MONITOR · SINCE 2022', h: 'Video editing', p: 'Cinematic edits, reels, motion graphics and colour grading, from raw footage to the final export.', stat: ['75+', 'videos edited'],
      chips: ['Premiere Pro', 'After Effects', 'DaVinci Resolve', 'CapCut', 'Photoshop', 'Lightroom', 'Illustrator', 'Figma'] },
    ar: { tag: 'الشاشة · من ٢٠٢٢', h: 'المونتاج', p: 'مونتاج سينمائي، ريلز، موشن جرافيك وتصحيح ألوان، من اللقطات الخام لحد التصدير النهائي.', stat: ['+٧٥', 'فيديو'],
      chips: ['Premiere Pro', 'After Effects', 'DaVinci Resolve', 'CapCut', 'Photoshop', 'Lightroom', 'Illustrator', 'Figma'] } },
  ai: { c: '#ffc04a', en: { tag: 'WHITEBOARD · SINCE 2023', h: 'AI systems', p: 'I use a big set of AI tools to build systems that actually do work: agents wired into real workflows, notes that link themselves, and quizzes written from your own PDFs.',
      chips: ['Agent integration', 'Workflow automation', 'AI second brain', 'Gemini API', 'Prompt design'] },
    ar: { tag: 'السبورة · من ٢٠٢٣', h: 'أنظمة الذكاء الاصطناعي', p: 'بستخدم أدوات ذكاء اصطناعي كثيرة عشان أبني أنظمة بتشتغل فعلاً: وكلاء داخل سير العمل، ملاحظات بتربط حالها، واختبارات بتنكتب من ملفات الـPDF تبعتك.',
      chips: ['ربط الوكلاء', 'أتمتة سير العمل', 'العقل الثاني', 'Gemini API', 'كتابة البرومبت'] } },
  net: { c: '#4fd1a5', en: { tag: 'ROUTER RACK · SINCE 2024', h: 'Network engineering', p: 'Designing, configuring and deploying network topologies: routers, switches and the paths between them, built and tested in Cisco Packet Tracer.',
      chips: ['Network architecture', 'Cisco IOS configuration', 'Cisco Packet Tracer', 'Topology design'] },
    ar: { tag: 'الراوتر · من ٢٠٢٤', h: 'هندسة الشبكات', p: 'تصميم وإعداد ونشر الشبكات: راوترات وسويتشات والمسارات بينها، ببنيها وبجرّبها على Cisco Packet Tracer.',
      chips: ['تصميم الشبكات', 'إعداد Cisco IOS', 'Cisco Packet Tracer', 'تصميم الطوبولوجيا'] } },
  web: { c: '#ff6a3d', en: { tag: 'PC · WEB & APPS', h: 'Web & apps', p: 'Websites, study apps and client systems, built and shipped through Wajha. This PC does the heavy lifting (and the gaming).',
      chips: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'PostgreSQL', 'Flutter', 'Shopify Liquid', 'Python', 'Git', 'Vercel'] },
    ar: { tag: 'الكمبيوتر · ويب وتطبيقات', h: 'مواقع وتطبيقات', p: 'مواقع وتطبيقات دراسة وأنظمة للعملاء، ببنيها وبطلقها من خلال واجهة. هالجهاز بشيل الشغل الثقيل (واللعب كمان).',
      chips: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'PostgreSQL', 'Flutter', 'Shopify Liquid', 'Python', 'Git', 'Vercel'] } },
  vibe: { c: '#ff8a2a', en: { tag: 'ARCADE · PROJECT 01', h: 'Vibe Todos', p: 'A study app that started as a to-do list. Upload your PDFs, read them in a clean reader, ask AI about any page, and turn your notes into quizzes. Tasks, lists and progress tracking are built in.',
      chips: ['Next.js', 'React', 'Supabase', 'Gemini', 'Tailwind CSS', 'PDF reader'], links: [['Open the app', 'to-do-virid-beta.vercel.app', 'https://to-do-virid-beta.vercel.app']] },
    ar: { tag: 'آركيد · مشروع ٠١', h: 'Vibe Todos', p: 'تطبيق دراسة بلّش كقائمة مهام. ارفع ملفات الـPDF، اقرأها بقارئ مرتب، اسأل الذكاء الاصطناعي عن أي صفحة، وحوّل ملاحظاتك لاختبارات. فيه مهام وقوائم وتتبع للتقدم.',
      chips: ['Next.js', 'React', 'Supabase', 'Gemini', 'Tailwind CSS', 'قارئ PDF'], links: [['افتح التطبيق', 'to-do-virid-beta.vercel.app', 'https://to-do-virid-beta.vercel.app']] } },
  wajha: { c: '#4fc49a', en: { tag: 'ARCADE · PROJECT 02', h: 'Wajha studio', p: 'My small studio in Amman: websites, client systems and motion videos for local businesses. The site, the brand and the client CRM behind it are all built by me.',
      chips: ['Brand', 'Website', 'Client CRM', 'Motion video'], links: [['Wajha site', 'wajha-chi.vercel.app', 'https://wajha-chi.vercel.app'], ['Instagram', '@wajiha.jo', 'https://www.instagram.com/wajiha.jo']] },
    ar: { tag: 'آركيد · مشروع ٠٢', h: 'استوديو واجهة', p: 'استوديو صغير بعمّان: مواقع وأنظمة وفيديوهات موشن للمحلات والشركات. الموقع والهوية ونظام العملاء كلهم من شغلي.',
      chips: ['هوية', 'موقع', 'نظام عملاء', 'موشن'], links: [['موقع واجهة', 'wajha-chi.vercel.app', 'https://wajha-chi.vercel.app'], ['إنستغرام', '@wajiha.jo', 'https://www.instagram.com/wajiha.jo']] } },
  folio: { c: '#9b7cff', en: { tag: 'ARCADE · PROJECT 03', h: 'This room', p: 'My portfolio is a game: a pixel version of my real room, drawn pixel by pixel, in English and Arabic. Before this I built a cinematic Next.js portfolio.',
      chips: ['Canvas', 'Pixel art', 'Web Audio', 'Bilingual'], links: [['Old portfolio code', 'Abdulrahman-amoudi/cinematic-portfolio', 'https://github.com/Abdulrahman-amoudi/cinematic-portfolio']] },
    ar: { tag: 'آركيد · مشروع ٠٣', h: 'هاي الغرفة', p: 'البورتفوليو تبعي لعبة: نسخة بكسل من غرفتي الحقيقية، مرسومة بكسل بكسل، بالعربي والإنجليزي. قبلها عملت بورتفوليو سينمائي بـNext.js.',
      chips: ['Canvas', 'بكسل آرت', 'Web Audio', 'لغتين'], links: [['كود البورتفوليو القديم', 'Abdulrahman-amoudi/cinematic-portfolio', 'https://github.com/Abdulrahman-amoudi/cinematic-portfolio']] } },
  github: { c: '#4caf6a', en: { tag: 'GITHUB CORNER · CODE', h: 'GitHub', p: 'Everything I build ends up here: the study app, client sites and the experiments in between. Pull up a chair and read the code.',
      chips: ['TypeScript', 'JavaScript', 'Python', 'Next.js', 'Supabase'], links: [['GitHub', 'github.com/Abdulrahman-amoudi', 'https://github.com/Abdulrahman-amoudi']] },
    ar: { tag: 'زاوية GITHUB · الكود', h: 'GitHub', p: 'كل إشي ببنيه بوصل هون: تطبيق الدراسة، مواقع العملاء والتجارب اللي بينهم. اسحب كرسي واقرأ الكود.',
      chips: ['TypeScript', 'JavaScript', 'Python', 'Next.js', 'Supabase'], links: [['GitHub', 'github.com/Abdulrahman-amoudi', 'https://github.com/Abdulrahman-amoudi']] } },
  contact: { c: '#4caf6a', en: { tag: 'PHONE · CONTACT', h: 'Let’s work together', p: 'Need something edited, wired up or built? Message me through the studio.',
      links: [['Wajha studio', 'wajha-chi.vercel.app', 'https://wajha-chi.vercel.app'], ['Instagram', '@wajiha.jo', 'https://www.instagram.com/wajiha.jo'], ['GitHub', 'Abdulrahman-amoudi', 'https://github.com/Abdulrahman-amoudi']] },
    ar: { tag: 'الجوال · تواصل', h: 'خلينا نشتغل سوا', p: 'بدك مونتاج، شبكة، أو موقع؟ راسلني من خلال الاستوديو.',
      links: [['استوديو واجهة', 'wajha-chi.vercel.app', 'https://wajha-chi.vercel.app'], ['إنستغرام', '@wajiha.jo', 'https://www.instagram.com/wajiha.jo'], ['GitHub', 'Abdulrahman-amoudi', 'https://github.com/Abdulrahman-amoudi']] } },
};
const ORDER = ['story', 'edit', 'ai', 'net', 'web', 'vibe', 'wajha', 'folio', 'github', 'contact'];
const MENU = [
  ['Skills', 'المهارات', [['story', 'About me', 'عنّي'], ['edit', 'Video editing', 'المونتاج'], ['ai', 'AI systems', 'الذكاء الاصطناعي'], ['net', 'Networking', 'الشبكات'], ['web', 'Web & apps', 'ويب وتطبيقات']]],
  ['Projects', 'المشاريع', [['vibe', 'Vibe Todos', 'Vibe Todos'], ['wajha', 'Wajha studio', 'استوديو واجهة'], ['folio', 'This room', 'هاي الغرفة']]],
  ['More', 'كمان', [['github', 'GitHub', 'GitHub'], ['contact', 'Contact', 'تواصل']]],
];

// ---------------- world ----------------
// Each piece: art, x, y (top-left in world), foot height (collision strip at the bottom), optional sort offset.
let PIECES = [], OBJ = [], SOLID = [], bg = null;
function layout() {
  const A = ART;
  // floor pieces, y-sorted with the player
  PIECES = [
    { a: A.rack, x: 8, y: 52, foot: 12, fx: 'rack' },
    { a: A.deskset, x: 62, y: 26, foot: 10, fx: 'mon' },
    { a: A.pc, x: 184, y: 54, foot: 10, fx: 'pc' },
    { a: A.chair, x: 104, y: 86, foot: 8 },
    { a: A.bookshelf, x: 296, y: 40, foot: 12 },
    { a: A.cabVibe, x: 344, y: 44, foot: 12, fx: 'arc', k: 0 },
    { a: A.cabWajha, x: 384, y: 44, foot: 12, fx: 'arc', k: 1 },
    { a: A.cabFolio, x: 424, y: 44, foot: 12, fx: 'arc', k: 2 },
    { a: A.ghdesk, x: 28, y: 200, foot: 12, fx: 'gh' },
    { a: A.nas, x: 110, y: 222, foot: 8 },
    { a: A.plantBig, x: 6, y: 236, foot: 8 },
    { a: A.tv, x: 212, y: 160, foot: 12, fx: 'tv' },
    { a: A.beanbag, x: 180, y: 222, foot: 10 },
    { a: A.sofa, x: 204, y: 244, foot: 14 },
    { a: A.lamp, x: 300, y: 196, foot: 6 },
    { a: A.sideTable, x: 396, y: 240, foot: 8 },
    { a: A.phone, x: 412, y: 230, foot: 0, noSolid: true, sortY: 266, fx: 'phone' },
    { a: A.books, x: 400, y: 236, foot: 0, noSolid: true, sortY: 266 },
    { a: A.fridge, x: 446, y: 192, foot: 10 },
    { a: A.plantBig, x: 346, y: 238, foot: 8 },
    { a: A.guitar, x: 456, y: 244, foot: 6 },
    { sun: true, x: 300, y: 248, w: 22, h: 22, foot: 8 },
    { a: A.tableLamp, x: 322, y: 26, foot: 0, noSolid: true, sortY: 101 },
    { a: A.tableLamp, x: 66, y: 46, foot: 0, noSolid: true, sortY: 103 },
  ];
  SOLID = [[0, 0, WW, WALL + 6], [0, 0, 6, WH], [WW - 6, 0, 6, WH], [0, WH - 6, 220, 6], [262, WH - 6, WW - 262, 6], [220, WH - 2, 42, 2]];
  PIECES.forEach(p => { if (p.noSolid) return; const w = p.a ? p.a.width : p.w, h = p.a ? p.a.height : p.h; SOLID.push([p.x + 2, p.y + h - p.foot, w - 4, p.foot]); });
  // interactables: click rect + where to stand
  OBJ = [
    { id: 'net', r: [8, 52, 40, 54], spot: [28, 118], en: 'Router rack', ar: 'الراوتر' },
    { id: 'ai', r: [40, 10, 50, 34], spot: [58, 112], en: 'Whiteboard', ar: 'السبورة' },
    { id: 'ac', r: [100, 2, 56, 20], spot: [92, 112], en: 'AC', ar: 'المكيّف' },
    { id: 'edit', r: [98, 30, 44, 36], spot: [146, 112], extra: [[100, 110], [112, 110], [124, 110], [136, 110]], en: 'Monitor', ar: 'الشاشة' },
    { id: 'web', r: [184, 54, 30, 48], spot: [200, 114], en: 'PC', ar: 'الكمبيوتر' },
    { id: 'window', r: [226, 8, 64, 48], spot: [258, 80], en: 'Window', ar: 'الشباك' },
    { id: 'story', r: [296, 40, 40, 60], spot: [316, 112], en: 'Bookshelf', ar: 'المكتبة' },
    { id: 'vibe', r: [344, 44, 32, 58], spot: [360, 112], en: 'Vibe Todos', ar: 'Vibe Todos' },
    { id: 'wajha', r: [384, 44, 32, 58], spot: [400, 112], en: 'Wajha', ar: 'واجهة' },
    { id: 'folio', r: [424, 44, 32, 58], spot: [440, 112], en: 'This room', ar: 'هاي الغرفة' },
    { id: 'github', r: [28, 200, 76, 56], spot: [66, 268], en: 'GitHub', ar: 'GitHub' },
    { id: 'tv', r: [212, 160, 68, 48], spot: [246, 222], en: 'TV', ar: 'التلفزيون' },
    { id: 'sun', r: [298, 246, 26, 26], spot: [290, 282], en: 'Sun plushie', ar: 'دمية الشمس' },
    { id: 'lamp', r: [300, 196, 18, 56], spot: [312, 262], en: 'Lamp', ar: 'الضو' },
    { id: 'contact', r: [396, 226, 42, 40], spot: [416, 280], en: 'Phone', ar: 'الجوال' },
    { id: 'fridge', r: [446, 192, 28, 40], spot: [458, 242], en: 'Mini fridge', ar: 'الثلاجة' },
    { id: 'guitar', r: [456, 244, 18, 46], spot: [446, 286], en: 'Guitar', ar: 'الجيتار' },
  ];
  bg = paintWorld();
}

function paintWorld() {
  const c = document.createElement('canvas'); c.width = WW; c.height = WH; const x = c.getContext('2d');
  const R = (a, b, w, h, col) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
  // wall
  R(0, 0, WW, WALL, '#d6c6b2'); R(0, 0, WW, 3, '#e2d4c0'); R(0, 3, WW, 1, '#c4b29c');
  for (let i = 8; i < WW; i += 24) R(i, 4, 1, WALL - 20, '#cdbca6');
  R(330, 0, WW - 330, WALL - 16, '#2a2438'); R(330, 0, WW - 330, 2, '#3a3350'); for (let i = 338; i < WW; i += 12) R(i, 2, 1, WALL - 18, '#322b44'); // dark accent wall behind the arcade
  const SY = WALL - 18, stones = ['#c4b296', '#b9a587', '#cbbba0', '#b29d7f', '#c0ad90'];
  R(0, SY - 1, WW, 1, '#b39d79');
  for (let row = 0; row < 3; row++) { let i = row % 2 ? -7 : 0, k = row * 3; while (i < WW) { const w = 10 + ((k * 5) % 6); R(i, SY + row * 5, w - 1, 4, stones[k % stones.length]); R(i, SY + row * 5, w - 1, 1, '#d6c8ae'); i += w; k++; } }
  R(0, WALL - 3, WW, 5, '#5b4032'); R(0, WALL - 3, WW, 1, '#7a5642'); R(0, WALL + 1, WW, 1, '#3e2b22');
  // wooden plank floor: 7px boards, staggered joints, grain, knots and a little dither between tones
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const tones = [['#a07e5e', '#ae8c6b', '#86684c'], ['#9a785a', '#a78565', '#80634a'], ['#a58262', '#b2906f', '#8a6b4f'], ['#967456', '#a38160', '#7c5f46']];
  for (let y = WALL + 2, r = 0; y < WH; y += 7, r++) {
    let i = -Math.floor(rnd() * 40);
    while (i < WW) {
      const len = 34 + Math.floor(rnd() * 34), [b, hi, lo] = tones[Math.floor(rnd() * tones.length)];
      R(i, y, len, 7, b); R(i, y, len, 1, hi); R(i, y + 6, len, 1, lo); R(i, y, 1, 7, '#6a4e3a');
      for (let k = 0; k < 4; k++) { const gx = i + 2 + Math.floor(rnd() * (len - 8)), gy = y + 2 + Math.floor(rnd() * 3); R(gx, gy, 3 + Math.floor(rnd() * 6), 1, lo); }
      if (rnd() < .12) { const kx = i + 6 + Math.floor(rnd() * (len - 12)); R(kx, y + 2, 3, 2, lo); R(kx + 1, y + 3, 1, 1, '#6e533f'); }
      for (let d = 0; d < len; d += 2) if (rnd() < .18) R(i + d, y + 1 + ((d >> 1) % 5), 1, 1, hi);
      i += len;
    }
  }
  // arcade corner: dark checker tiles
  for (let y = WALL + 2, r = 0; y < 196; y += 10, r++) for (let i = 330; i < WW - 6; i += 10) {
    const a = ((i - 330) / 10 + r) % 2; R(i, y, 10, 10, a ? '#2c2640' : '#352e4c'); R(i, y, 10, 1, a ? '#3a3352' : '#41395c'); R(i, y + 9, 10, 1, '#221d33');
  }
  R(330, 196, WW - 336, 2, '#1b1729');
  // contact shadow under the wall (ambient occlusion)
  for (let k = 0; k < 6; k++) { x.fillStyle = `rgba(40,24,16,${.22 - k * .035})`; x.fillRect(0, WALL + 2 + k, WW, 1); }
  // rugs
  // patterned rugs: border band with dots, corner diamonds, a centre medallion and fringe
  const rug = (rx, ry, rw, rh, base, border, field, motif) => {
    R(rx, ry, rw, rh, border); R(rx + 2, ry + 2, rw - 4, rh - 4, base); R(rx + 4, ry + 4, rw - 8, rh - 8, border); R(rx + 5, ry + 5, rw - 10, rh - 10, field);
    for (let i = rx + 5; i < rx + rw - 5; i += 6) { R(i, ry + 2, 2, 1, motif); R(i, ry + rh - 3, 2, 1, motif); }
    for (let j = ry + 6; j < ry + rh - 6; j += 6) { R(rx + 2, j, 1, 2, motif); R(rx + rw - 3, j, 1, 2, motif); }
    const dia = (cx, cy) => { R(cx - 1, cy - 2, 3, 1, motif); R(cx - 2, cy - 1, 5, 3, motif); R(cx - 1, cy + 2, 3, 1, motif); R(cx, cy, 1, 1, field); };
    dia(rx + 11, ry + 11); dia(rx + rw - 12, ry + 11); dia(rx + 11, ry + rh - 12); dia(rx + rw - 12, ry + rh - 12);
    const cx = (rx + rw / 2) | 0, cy = (ry + rh / 2) | 0;
    R(cx - 8, cy, 17, 1, motif); R(cx, cy - 6, 1, 13, motif); R(cx - 4, cy - 3, 9, 7, motif); R(cx - 3, cy - 4, 7, 9, motif); R(cx - 2, cy - 2, 5, 5, border); R(cx - 1, cy - 1, 3, 3, motif); R(cx, cy, 1, 1, base);
    for (let i = rx + 1; i < rx + rw - 1; i += 2) { R(i, ry - 2, 1, 2, '#d8ccb4'); R(i, ry + rh, 1, 2, '#d8ccb4'); }
  };
  rug(56, 104, 150, 52, '#24305a', '#3d5590', '#2b3a6c', '#d39a5a');
  rug(20, 254, 96, 34, '#163626', '#2e6a4a', '#1d4430', '#9fd29a');
  rug(176, 206, 150, 74, '#4e1f22', '#8a3c34', '#6a2a2a', '#d8a868');
  rug(350, 128, 110, 50, '#231c3c', '#5a4a8a', '#2e2650', '#ff9a4a');
  // contact corner mat
  R(386, 270, 62, 18, '#c9b38a'); R(388, 272, 58, 14, '#d8c29a'); ptext(x, 'HELLO', 417 - Math.round(textW('HELLO') / 2), 277, '#8a6a44');
  // door at the bottom wall
  R(0, WH - 6, WW, 6, '#bfae90'); R(0, WH - 6, WW, 1, '#d9cdb3'); R(220, WH - 6, 42, 6, '#8a5a3a'); R(220, WH - 6, 42, 1, '#b67b52');
  // wall pieces (not y-sorted)
  x.drawImage(ART.poster, 8, 10); x.drawImage(ART.ain, 6, 10);
  x.drawImage(ART.board, 40, 10);
  x.drawImage(ART.ac, 100, 2);
  x.drawImage(ART.shelf, 160, 12);
  x.drawImage(ART.clock, 304, 12);
  x.drawImage(ART.neon, 368, 14);
  const gi = x.getImageData(0, 0, WW, WH); grade(gi.data); x.putImageData(gi, 0, 0);
  return c;
}

// ---------------- player ----------------
const pl = { x: 241, y: 292, dir: 'up', step: 0, moving: false, target: null };
const keys = {};
const FOOT = { w: 12, h: 5 };
function hits(x, y) {
  const fx = x - FOOT.w / 2, fy = y - FOOT.h;
  return SOLID.some(([sx, sy, sw, sh]) => fx < sx + sw && fx + FOOT.w > sx && fy < sy + sh && fy + FOOT.h > sy);
}

// ---------------- drawing ----------------
const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, w | 0, h | 0); };
let petT = 0, lampOn = true;
const FX = {
 wall(t) {
  drawOutside(t, 230, 12, 56, 37);
  g.drawImage(ART.winFrame, 226, 8);
  if (acOn) R(141, 8, 2, 2, '#7cf0ff');
  if (Math.floor(t / 90) % 41 === 0) { g.globalAlpha = .5; R(369, 15, 64, 12, '#1b1726'); g.globalAlpha = 1; }
 },
 rack(t) {
  for (let i = 0; i < 4; i++) for (let p = 0; p < 5; p++) R(14 + p * 4, 64 + i * 9, 2, 2, ((Math.floor(t / 200) + p * 3 + i * 2) % 7) ? '#2e8f6a' : '#7dffc8');
 },
 mon(t) {
  const mx = 62 + 36 + 3, my = 26 + 4 + 3;
  R(mx, my, 38, 6, '#2c3a60'); R(mx + 2, my + 1, 9, 4, '#6aa2ff'); R(mx + 13, my + 1, 9, 4, '#3b4a72');
  [[0, 9, 14, '#6aa2ff'], [15, 9, 12, '#9b7cff'], [1, 12, 20, '#4fd1a5'], [23, 12, 9, '#ffc04a'], [0, 15, 30, '#4caf6a'], [4, 18, 18, '#e46a4a']].forEach(([a, b, w, c]) => R(mx + a, my + b, w, 2, c));
  R(mx + ((t / 60) % 34), my + 8, 1, 13, '#ff4d4d');
 },
 pc(t) {
  for (let i = 0; i < 3; i++) { const fy = 54 + 9 + i * 12; const a = .55 + .45 * Math.sin(t / 280 + i * 1.3); g.globalAlpha = a; R(184 + 12, fy, 12, 11, '#ff8a2a'); g.globalAlpha = 1; R(184 + 14, fy + 2, 8, 7, '#2a1a12'); const s = Math.floor(t / 70 + i) % 4; R(184 + 17, fy + 2 + (s === 0 ? 0 : s === 2 ? 4 : 2), 2, 3, '#ffb070'); R(184 + 14 + (s === 1 ? 5 : s === 3 ? 0 : 2), fy + 4, 3, 2, '#ffb070'); }
 },
 arc(t, k) {
  const [cx, col] = [[344, '#ff8a2a'], [384, '#4fc49a'], [424, '#9b7cff']][k];
  {
    const sx = cx + 6, sy = 44 + 16; R(sx, sy, 20, 14, '#0f1a2e');
    if (k === 0) { for (let i = 0; i < 4; i++) { R(sx + 2, sy + 2 + i * 3, 2, 2, i < (Math.floor(t / 500) % 5) ? col : '#2a3550'); R(sx + 6, sy + 2 + i * 3, 10 - i * 2, 1, '#9fb0d0'); } }
    if (k === 1) { const p = Math.floor(t / 120) % 20; R(sx + 3, sy + 3, 14, 8, '#163a2c'); R(sx + 5, sy + 5, 6, 1, col); R(sx + 5, sy + 7, 9, 1, '#9fd8c0'); R(sx + p % 18, sy + 12, 2, 1, col); }
    if (k === 2) { const px = Math.floor(t / 150) % 14; R(sx + 2, sy + 10, 16, 2, '#3b3360'); R(sx + 3 + px, sy + 6, 3, 4, '#f0b84a'); R(sx + 4 + px, sy + 5, 1, 1, '#f0b84a'); R(sx + 14 - (px % 10), sy + 8, 2, 2, col); }
  }
 },
 gh(t) {
  // github terminal: contribution grid (ghdesk 28,200; screen +20,+4)
  const gx = 28 + 20, gy = 200 + 4;
  for (let c = 0; c < 10; c++) for (let r = 0; r < 5; r++) { const v = (c * 7 + r * 13 + c * r) % 5; const on = c < Math.floor(t / 300) % 14; R(gx + 1 + c * 3, gy + 2 + r * 3, 2, 2, !on ? '#12291b' : ['#1a3d26', '#1f6a3a', '#2e9c52', '#4fd46e', '#9cf5ad'][v]); }
  if (Math.floor(t / 500) % 2) R(gx + 1, gy + 18, 3, 2, '#4fd46e');
 },
 tv(t) {
  const tx = 212 + 9, ty = 160 + 4;
  const scene = Math.floor(t / 2600) % 3;
  if (scene === 0) { R(tx, ty, 50, 26, '#2a5a9a'); R(tx, ty + 17, 50, 9, '#3f8a4d'); R(tx + 4, ty + 21, 42, 1, '#f6f5f1'); R(tx + 24, ty + 17, 1, 9, '#f6f5f1'); R(tx + ((t / 40) % 46), ty + 19, 2, 2, '#ffffff'); }
  if (scene === 1) { R(tx, ty, 50, 26, '#111522'); for (let i = 0; i < 5; i++) R(tx + 3, ty + 3 + i * 4, 6 + ((i * 17 + Math.floor(t / 200)) % 34), 2, ['#6aa2ff', '#9b7cff', '#4fd1a5', '#ffc04a', '#4caf6a'][i]); R(tx + ((t / 50) % 46) + 2, ty + 2, 1, 22, '#ff4d4d'); }
  if (scene === 2) { R(tx, ty, 50, 26, '#3b2a55'); R(tx + 18, ty + 6, 14, 14, '#ff8a2a'); R(tx + 20, ty + 8, 10, 10, '#ffb070'); ptext(g, 'PLAY', tx + 18, ty + 21, '#ffffff'); }
 },
 phone(t) { R(413, 232, 7, 1, Math.floor(t / 600) % 2 ? '#4caf6a' : '#2a6a40'); },
};
function drawSun(t, p) {
  const b = petT > t ? Math.abs(Math.sin((petT - t) / 40)) * 3 : Math.abs(Math.sin(t / 600)) * 1;
  R(p.x + 3, p.y + 20, 16, 2, 'rgba(0,0,0,.15)');
  g.drawImage(petT > t ? ART.sunHappy : ART.sun, p.x, Math.round(p.y - b));
}
function drawPlayer() {
  const x = Math.round(pl.x), y = Math.round(pl.y);
  const f = pl.moving ? (Math.floor(pl.step / 7) % 4) : 0;
  const frame = [0, 1, 0, 2][f];
  R(x - 8, y - 2, 16, 3, 'rgba(0,0,0,.18)');
  const im = ART.player[pl.dir + frame]; g.drawImage(im, x - (im.width >> 1), y - im.height + 1);
}
const parts = [];
function particles(t, dt) {
  if (acOn && Math.random() < 0.35) parts.push({ x: 104 + Math.random() * 46, y: 22, vx: (Math.random() - .5) * .2, vy: .35 + Math.random() * .3, life: 110, c: '#bff4ff', s: 1 });
  for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.x += p.vx * dt / 16; p.y += p.vy * dt / 16; p.life -= dt / 16; if (p.life <= 0) { parts.splice(i, 1); continue; }
    g.globalAlpha = Math.min(1, p.life / 40); if (p.heart) { R(p.x, p.y, 2, 2, p.c); R(p.x + 3, p.y, 2, 2, p.c); R(p.x, p.y + 1, 5, 2, p.c); R(p.x + 1, p.y + 3, 3, 1, p.c); R(p.x + 2, p.y + 4, 1, 1, p.c); }
    else if (p.note) { R(p.x, p.y, 1, 4, p.c); R(p.x - 2, p.y + 3, 2, 2, p.c); R(p.x + 1, p.y, 2, 1, p.c); } else R(p.x, p.y, p.s, p.s * 2, p.c); g.globalAlpha = 1; }
}
function lighting(t) {
  if (!night) return;
  g.fillStyle = 'rgba(12,16,42,.64)'; g.fillRect(0, 0, WW, WH);
  g.globalCompositeOperation = 'lighter';
  const glow = (x, y, r, c, a) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, c.replace('A', a)); gr.addColorStop(1, c.replace('A', 0)); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };
  glow(204, 80, 46, 'rgba(255,120,30,A)', .4 + .08 * Math.sin(t / 300));
  glow(120, 52, 44, 'rgba(110,150,255,A)', .3);
  glow(28, 80, 30, 'rgba(80,255,180,A)', .18);
  glow(400, 80, 70, 'rgba(160,110,255,A)', .26);
  glow(400, 20, 40, 'rgba(255,140,50,A)', .28);
  glow(66, 220, 36, 'rgba(80,230,120,A)', .26);
  glow(246, 182, 46, 'rgba(120,160,255,A)', .3);
  if (lampOn) glow(308, 204, 60, 'rgba(255,214,150,A)', .42);
  glow(310, 258, 22, 'rgba(90,150,255,A)', .16);
  glow(pl.x, pl.y - 18, 30, 'rgba(255,240,210,A)', .1);
  glow(258, 30, 26, 'rgba(230,235,255,A)', .2);
  g.globalCompositeOperation = 'source-over';
}

// ---------------- light, shadows, hover ----------------
function glow(x, y, r, c, a) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, c.replace('A', a)); gr.addColorStop(1, c.replace('A', 0)); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
const marks = [], dust = [];
for (let i = 0; i < 26; i++) dust.push({ x: 230 + Math.random() * 90, y: 60 + Math.random() * 110, v: .02 + Math.random() * .05, ph: Math.random() * 6 });
function shadowsAndMarks(t) {
  PIECES.forEach(p => { const w = p.a ? p.a.width : p.w, h = p.a ? p.a.height : p.h; if (p.noSolid) return;
    R(p.x + 4, p.y + h - 3, w - 4, 4, 'rgba(70,45,30,.16)'); R(p.x + 6, p.y + h + 1, w - 6, 2, 'rgba(70,45,30,.08)'); });
  for (let i = marks.length - 1; i >= 0; i--) { const m = marks[i], k = (t - m.t) / 450; if (k > 1) { marks.splice(i, 1); continue; }
    const s = Math.round(2 + k * 7), a = 1 - k; g.globalAlpha = a;
    R(m.x - s, m.y, s * 2 + 1, 1, '#ffffff'); R(m.x, m.y - Math.round(s / 2), 1, s + 1, '#ffffff'); R(m.x - 1, m.y - 1, 3, 3, '#ff8a2a'); g.globalAlpha = 1; }
}
function light(t, dt) {
  g.save(); g.globalCompositeOperation = 'lighter';
  // sunbeam (moonbeam at night) from the window onto the floor
  const shaft = (a, inset) => { const gr = g.createLinearGradient(0, 56, 0, 170); const c = night ? '150,175,255' : '255,232,180';
    gr.addColorStop(0, `rgba(${c},${a})`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr;
    g.beginPath(); g.moveTo(229 + inset, 56); g.lineTo(287 - inset, 56); g.lineTo(336 - inset, 172); g.lineTo(262 + inset, 172); g.closePath(); g.fill(); };
  if (!night) { shaft(.16, 0); shaft(.1, 12); }
  // dust motes drifting in the beam
  dust.forEach(d => { d.y -= d.v * dt / 16; d.x += Math.sin(t / 900 + d.ph) * .05; if (d.y < 58) { d.y = 170; d.x = 240 + Math.random() * 80; }
    const tw = .25 + .25 * Math.sin(t / 400 + d.ph * 3); g.fillStyle = `rgba(255,245,215,${night ? 0 : tw})`; g.fillRect(Math.round(d.x + (d.y - 56) * .42), Math.round(d.y), 1, 1); });
  // things that emit light glow a little even in the day (bloom)
  {
    glow(121, 48, 30, 'rgba(110,150,255,A)', .14);
    glow(204, 80, 26, 'rgba(255,130,40,A)', .16 + .06 * Math.sin(t / 280));
    glow(360, 66, 24, 'rgba(255,140,50,A)', .16); glow(400, 66, 24, 'rgba(80,220,160,A)', .16); glow(440, 66, 24, 'rgba(160,120,255,A)', .16);
    glow(400, 20, 34, 'rgba(255,140,50,A)', .2 + (Math.floor(t / 90) % 41 === 0 ? -.15 : 0));
    glow(64, 216, 26, 'rgba(80,230,120,A)', .14); glow(246, 178, 34, 'rgba(120,170,255,A)', .14);
    glow(28, 80, 18, 'rgba(80,255,180,A)', .08);
    if (lampOn) glow(308, 202, 26, 'rgba(255,214,150,A)', .14);
  }
  g.restore();
}
function post() {
  // vignette in screen space
  const gr = g.createRadialGradient(VW / 2, VH / 2, Math.min(VW, VH) * .35, VW / 2, VH / 2, Math.max(VW, VH) * .75);
  gr.addColorStop(0, 'rgba(14,10,26,0)'); gr.addColorStop(1, night ? 'rgba(6,6,20,.55)' : 'rgba(30,18,24,.32)');
  g.fillStyle = gr; g.fillRect(0, 0, VW, VH);
}
// ---- lighting shader: a low-res light map, posterised into bands, multiplied over the room ----
const LS = 2, lmC = document.createElement('canvas'); lmC.width = WW / LS; lmC.height = WH / LS;
const lm = lmC.getContext('2d', { willReadFrequently: true });
function lights(t) {
  const day = !night, L = [], add = (x, y, r, c, i) => L.push([x, y, r, c, i]);
  add(258, 96, day ? 130 : 70, day ? '255,236,200' : '110,130,200', day ? 1 : .3);
  add(121, 50, 42, '120,160,255', .55);
  add(204, 82, 40, '255,140,60', .6 + .1 * Math.sin(t / 280));
  add(28, 80, 28, '90,255,190', .35);
  add(360, 72, 36, '255,150,60', .6); add(400, 72, 36, '90,230,170', .6); add(440, 72, 36, '170,130,255', .6);
  add(400, 24, 50, '255,140,60', Math.floor(t / 90) % 41 === 0 ? .2 : .65);
  add(66, 216, 42, '90,240,130', .5);
  add(246, 180, 56, '130,170,255', .5 + .08 * Math.sin(t / 170));
  if (lampOn) add(308, 206, 80, '255,200,130', 1);
  add(328, 34, 56, '255,200,130', .9);
  add(72, 54, 52, '255,200,130', .85);
  add(pl.x, pl.y - 16, 36, '255,240,220', night ? .28 : .12);
  return L;
}
function shade(t) {
  lm.globalCompositeOperation = 'source-over';
  lm.fillStyle = night ? 'rgb(34,36,62)' : 'rgb(170,158,180)';
  lm.fillRect(0, 0, lmC.width, lmC.height);
  lm.globalCompositeOperation = 'lighter';
  lights(t).forEach(([x, y, r, c, i]) => { x /= LS; y /= LS; r /= LS; const gr = lm.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(${c},${i})`); gr.addColorStop(.45, `rgba(${c},${i * .5})`); gr.addColorStop(1, `rgba(${c},0)`); lm.fillStyle = gr; lm.fillRect(x - r, y - r, r * 2, r * 2); });
  g.save(); g.globalCompositeOperation = 'multiply'; g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(lmC, 0, 0, WW, WH); g.restore();
}

// ---- what you see through the window: Amman rooftops, sky, clouds, birds; stars and lit windows at night ----
const HOUSES = []; { let x = 0, s = 3; const r = () => (s = (s * 48271) % 2147483647) / 2147483647; while (x < 60) { const w = 6 + Math.floor(r() * 8), h = 5 + Math.floor(r() * 9); HOUSES.push([x, w, h, r()]); x += w + (r() < .3 ? 1 : 0); } }
function drawOutside(t, x0, y0, w, h) {
  g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
  const sky = night ? ['#0b1230', '#101a3e', '#16224d', '#1d2b5a', '#24346a'] : ['#5fa9e3', '#74b7ea', '#8cc5ef', '#a6d3f2', '#c3e2f4'];
  sky.forEach((c, i) => R(x0, y0 + i * 6, w, 6 + (i === 4 ? 12 : 0), c));
  if (!night) {
    R(x0 + 42, y0 + 9, 6, 6, '#fff3c4'); R(x0 + 43, y0 + 8, 4, 8, '#fff3c4'); R(x0 + 41, y0 + 10, 8, 4, '#fff3c4');
    for (let i = 0; i < 3; i++) { const cx = Math.round(x0 - 20 + ((t / (90 + i * 40) + i * 37) % (w + 40))), cy = y0 + 10 + i * 5;
      R(cx, cy, 14, 3, '#ffffff'); R(cx + 3, cy - 2, 7, 2, '#ffffff'); R(cx + 1, cy + 3, 12, 1, '#dcecf6'); }
    const bx = Math.round(x0 - 10 + (t / 30) % (w + 50)), by = Math.round(y0 + 13 + Math.sin(t / 400) * 3), up = Math.floor(t / 140) % 2;
    R(bx, by, 1, 1, '#2a2d3a'); R(bx - 1, by - (up ? 1 : 0), 1, 1, '#2a2d3a'); R(bx + 1, by - (up ? 1 : 0), 1, 1, '#2a2d3a');
    R(bx - 7, by + 3, 1, 1, '#2a2d3a'); R(bx - 8, by + 3 - (up ? 0 : 1), 1, 1, '#2a2d3a'); R(bx - 6, by + 3 - (up ? 0 : 1), 1, 1, '#2a2d3a');
  } else {
    for (let i = 0; i < 14; i++) { const sx = x0 + (i * 23) % w, sy = y0 + 2 + (i * 11) % 18; if ((Math.floor(t / 300) + i) % 5) R(sx, sy, 1, 1, '#d6deff'); }
    R(x0 + 40, y0 + 5, 6, 6, '#f4f0d6'); R(x0 + 41, y0 + 4, 4, 8, '#f4f0d6'); R(x0 + 43, y0 + 6, 2, 2, '#d8d3b4');
  }
  // far hills, then stone houses
  R(x0, y0 + h - 15, w, 15, night ? '#1a1f38' : '#c7b48f'); for (let i = 0; i < w; i += 9) R(x0 + i, y0 + h - 17 - ((i * 7) % 3), 7, 3, night ? '#1a1f38' : '#c7b48f');
  HOUSES.forEach(([hx, hw, hh, k], n) => {
    const x = x0 + hx - 2, y = y0 + h - hh;
    R(x, y, hw, hh, night ? '#2a304f' : '#efe6d3'); R(x + hw - 2, y, 2, hh, night ? '#232842' : '#d4c8b0'); R(x, y, hw, 1, night ? '#373e62' : '#fbf6ea');
    if (k > .55) R(x + 1, y - 2, 2, 2, night ? '#2a304f' : '#9aa4b4'); // water tank on the roof
    for (let wy = y + 2; wy < y0 + h - 2; wy += 4) for (let wx = x + 1; wx < x + hw - 3; wx += 3) {
      const lit = night && ((n * 7 + wx * 3 + wy) % 5 < 2) && !((Math.floor(t / 2000) + n + wx) % 23 === 0);
      R(wx, wy, 1, 2, night ? (lit ? '#ffd36a' : '#1c2038') : '#8a9cb2');
    }
  });
  g.restore();
}

let hoverObj = null;
function brackets(r, t, col) {
  const o = 2 + (Math.floor(t / 280) % 2), [x0, y0, w, h] = r, x = x0 - o, y = y0 - o, X = x0 + w + o, Y = y0 + h + o, L = 5;
  const C = (a, b, dx, dy) => { R(a + 1, b + 1, dx ? L : 1, dx ? 1 : L, 'rgba(20,14,30,.5)'); R(a, b, dx ? L : 1, dx ? 1 : L, col); };
  C(x, y, 1, 0); C(x, y, 0, 1); C(X - L + 1, y, 1, 0); C(X, y, 0, 1); C(x, Y, 1, 0); C(x, Y - L + 1, 0, 1); C(X - L + 1, Y, 1, 0); C(X, Y - L + 1, 0, 1);
}
// pixel cursors
function cursorURL(rows, fill) {
  const c = document.createElement('canvas'), s = 2; c.width = rows[0].length * s; c.height = rows.length * s; const x = c.getContext('2d');
  rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch === '.') return; x.fillStyle = ch === 'O' ? '#211a24' : fill; x.fillRect(i * s, j * s, s, s); }));
  return `url(${c.toDataURL()}) 0 0, auto`;
}
const ARROW = ['O..........', 'OO.........', 'OWO........', 'OWWO.......', 'OWWWO......', 'OWWWWO.....', 'OWWWWWO....', 'OWWWWWWO...', 'OWWWWWWWO..', 'OWWWWWOOOO.', 'OWWOWWO....', 'OWO.OWWO...', 'OO..OWWO...', 'O....OWWO..', '.....OWWO..', '......OO...'];
const CUR = { def: cursorURL(ARROW, '#ffffff'), hot: cursorURL(ARROW, '#ff8a2a') };

// ---------------- loop ----------------
let last = performance.now(), near = null;
function rectDist(r, x, y) { const cx = Math.max(r[0], Math.min(x, r[0] + r[2])), cy = Math.max(r[1], Math.min(y, r[1] + r[3])); return Math.hypot(cx - x, cy - y); }
function update(dt) {
  if (panelOpen) { pl.moving = false; return; }
  let dx = 0, dy = 0;
  if (keys.left) dx -= 1; if (keys.right) dx += 1; if (keys.up) dy -= 1; if (keys.down) dy += 1;
  if (dx || dy) pl.target = null;
  if (!dx && !dy && pl.target) {
    const tx = pl.target[0] - pl.x, ty = pl.target[1] - pl.y, dist = Math.hypot(tx, ty);
    if (dist < 2) { pl.target = null; if (pl.face) { pl.dir = pl.face; pl.face = null; } } else { dx = tx / dist; dy = ty / dist; }
  }
  const sp = (keys.run ? 2 : 1.15) * dt / 16;
  if (dx || dy) {
    const len = Math.hypot(dx, dy); dx /= len; dy /= len;
    const nx = pl.x + dx * sp, ny = pl.y + dy * sp;
    let moved = false;
    if (!hits(nx, pl.y)) { pl.x = nx; moved = true; }
    if (!hits(pl.x, ny)) { pl.y = ny; moved = true; }
    if (!moved && pl.target) { pl.target = null; if (pl.face) { pl.dir = pl.face; pl.face = null; } }
    pl.moving = moved; pl.step += dt / 16 * (keys.run ? 1.8 : 1);
    const st = Math.floor(pl.step / 7); if (moved && st !== pl.lastSt) { pl.lastSt = st; if (st % 2 === 0) footstep(onRug(pl.x, pl.y)); }
    pl.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
  } else pl.moving = false;
  near = null; let best = 18;
  OBJ.forEach(o => { const d = Math.min(rectDist(o.r, pl.x, pl.y - 6), Math.min(...(o.extra || []).concat([o.spot]).map(s => Math.hypot(s[0] - pl.x, s[1] - pl.y))) - 2); if (d < best) { best = d; near = o; } });
}
const tip = document.getElementById('tip');
function placeTip() {
  if (!near || panelOpen) { tip.hidden = true; return; }
  const rect = cv.getBoundingClientRect(), stage = document.getElementById('stage').getBoundingClientRect();
  const s = rect.width / VW;
  tip.hidden = false;
  tip.innerHTML = `<kbd>E</kbd>${near[lang]}`;
  tip.style.left = (rect.left - stage.left + (near.r[0] + near.r[2] / 2 - camX) * s) + 'px';
  tip.style.top = (rect.top - stage.top + Math.max(10, near.r[1] - 4 - camY) * s) + 'px';
}
function frame(now) {
  const dt = Math.min(48, now - last); last = now;
  update(dt);
  const tx = Math.max(0, Math.min(WW - VW, pl.x - VW / 2)), ty = Math.max(0, Math.min(WH - VH, pl.y - 20 - VH / 2));
  if (cxF < 0) { cxF = tx; cyF = ty; }
  const kf = Math.min(1, dt / 140); cxF += (tx - cxF) * kf; cyF += (ty - cyF) * kf;
  camX = Math.round(cxF); camY = Math.round(cyF);
  g.setTransform(1, 0, 0, 1, -camX, -camY);
  g.imageSmoothingEnabled = false;
  g.drawImage(bg, 0, 0);
  shadowsAndMarks(now);
  // y-sorted floor pieces + player
  const list = PIECES.map(p => ({ y: p.sortY || p.y + (p.a ? p.a.height : p.h), p })).concat([{ y: pl.y, me: true }]);
  list.sort((a, b) => a.y - b.y);
  FX.wall(now);
  list.forEach(it => {
    if (it.me) drawPlayer(); else if (it.p.sun) drawSun(now, it.p); else { g.drawImage(it.p.a, it.p.x, it.p.y); if (it.p.fx) FX[it.p.fx](now, it.p.k); }
  });
  particles(now, dt);
  shade(now);
  light(now, dt);
  ambience(now);
  if (!panelOpen) {
    if (hoverObj) brackets(hoverObj.r, now, '#ffffff');
    if (near && near !== hoverObj) brackets(near.r, now, '#ffd36a');
    if (near) { const [x, y, w] = near.r; const by = Math.floor(now / 250) % 2; R(x + w / 2 - 2, y - 10 - by, 5, 2, '#ffd36a'); R(x + w / 2 - 1, y - 8 - by, 3, 1, '#ffd36a'); R(x + w / 2, y - 7 - by, 1, 1, '#ffd36a'); }
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  post();
  placeTip();
  requestAnimationFrame(frame);
}

// ---------------- sound ----------------
// Everything is synthesised: wood-floor footsteps (softer on rugs), outside ambience through the window
// (distant street, birds by day, crickets at night, the odd passing car) and the PC fan hum.
let actx = null; const AU = {};
function audioInit() {
  if (actx) return;
  try {
    const c = actx = new (window.AudioContext || window.webkitAudioContext)();
    AU.master = c.createGain(); AU.master.gain.value = sound ? .7 : 0; AU.master.connect(c.destination);
    const nb = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1; AU.noise = nb;
    const bb = c.createBuffer(1, c.sampleRate * 6, c.sampleRate), bd = bb.getChannelData(0); let l = 0; for (let i = 0; i < bd.length; i++) { l = (l + .02 * (Math.random() * 2 - 1)) / 1.02; bd[i] = l * 3.5; }
    const src = c.createBufferSource(); src.buffer = bb; src.loop = true; AU.ambLP = c.createBiquadFilter(); AU.ambLP.type = 'lowpass'; AU.ambLP.frequency.value = 520;
    AU.amb = c.createGain(); AU.amb.gain.value = 0; src.connect(AU.ambLP).connect(AU.amb).connect(AU.master); src.start();
    const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 57; const hf = c.createBiquadFilter(); hf.type = 'lowpass'; hf.frequency.value = 160;
    AU.hum = c.createGain(); AU.hum.gain.value = 0; o.connect(hf).connect(AU.hum).connect(AU.master); o.start();
    const fs = c.createBufferSource(); fs.buffer = nb; fs.loop = true; const fbp = c.createBiquadFilter(); fbp.type = 'bandpass'; fbp.frequency.value = 900; fbp.Q.value = .7;
    fs.connect(fbp).connect(AU.hum); AU.next = { bird: 0, car: 0, cricket: 0 };
  } catch (e) { actx = null; }
}
function env(gn, t, a, peak, dec) { gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(peak, t + a); gn.gain.exponentialRampToValueAtTime(.0008, t + a + dec); }
function blip(f = 660, d = .06, type = 'square', vol = .05) {
  if (!sound || !actx) return;
  const t = actx.currentTime, o = actx.createOscillator(), v = actx.createGain(), lp = actx.createBiquadFilter(); o.type = 'sine'; o.frequency.value = Math.min(f, 900); lp.type = 'lowpass'; lp.frequency.value = 1400; env(v, t, .012, Math.min(vol, .05) * .35, d + .04);
  o.connect(lp).connect(v).connect(AU.master); o.start(t); o.stop(t + d + .05);
}
// Footsteps: a short hollow knock on wood (two resonant bands + a tiny thud), random pitch each step; muffled on rugs.
function footstep(soft) {
  if (!sound || !actx) return;
  const c = actx, t = c.currentTime, pitch = .9 + Math.random() * .2;
  const s = c.createBufferSource(); s.buffer = AU.noise;
  const out = c.createGain(); env(out, t, .002, soft ? .05 : .085, soft ? .06 : .08);
  if (soft) { const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 340 * pitch; s.connect(lp).connect(out); }
  else for (const [f, q, v] of [[430, 7, .9], [980, 5, .45], [2100, 3, .12]]) { const bp = c.createBiquadFilter(), gv = c.createGain(); bp.type = 'bandpass'; bp.frequency.value = f * pitch; bp.Q.value = q; gv.gain.value = v; s.connect(bp).connect(gv).connect(out); }
  out.connect(AU.master); s.start(t, Math.random() * 1.5, .14);
  if (!soft) { const o = c.createOscillator(), og = c.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(240 * pitch, t); o.frequency.exponentialRampToValueAtTime(150 * pitch, t + .05); env(og, t, .001, .035, .05); o.connect(og).connect(AU.master); o.start(t); o.stop(t + .08); }
}
function bird(pan) {
  const c = actx, t = c.currentTime, p = c.createStereoPanner ? c.createStereoPanner() : null; if (p) { p.pan.value = pan; p.connect(AU.master); }
  const n = 2 + Math.floor(Math.random() * 4), base = 2600 + Math.random() * 1400;
  for (let i = 0; i < n; i++) { const o = c.createOscillator(), gn = c.createGain(), st = t + i * (.09 + Math.random() * .05);
    o.type = 'sine'; o.frequency.setValueAtTime(base, st); o.frequency.exponentialRampToValueAtTime(base * (1.3 + Math.random() * .4), st + .04); o.frequency.exponentialRampToValueAtTime(base * .9, st + .08);
    env(gn, st, .01, .018, .07); o.connect(gn).connect(p || AU.master); o.start(st); o.stop(st + .12); }
}
function cricket() {
  const c = actx, t = c.currentTime;
  for (let i = 0; i < 3; i++) { const o = c.createOscillator(), gn = c.createGain(), st = t + i * .07; o.frequency.value = 4300 + Math.random() * 300; env(gn, st, .005, .008, .04); o.connect(gn).connect(AU.master); o.start(st); o.stop(st + .07); }
}
function car() {
  const c = actx, t = c.currentTime, s = c.createBufferSource(); s.buffer = AU.noise; s.loop = true;
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(180, t); lp.frequency.linearRampToValueAtTime(700, t + 1.6); lp.frequency.linearRampToValueAtTime(160, t + 3.4);
  const gn = c.createGain(); gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(.09, t + 1.6); gn.gain.linearRampToValueAtTime(0, t + 3.4);
  s.connect(lp).connect(gn).connect(AU.master); s.start(t); s.stop(t + 3.5);
}
function ambience(now) {
  if (!actx || !sound) return;
  const t = actx.currentTime, dWin = Math.hypot(pl.x - 258, pl.y - 70), near = Math.max(0, 1 - dWin / 260);
  AU.amb.gain.setTargetAtTime((night ? .05 : .09) + near * .1, t, .5);
  AU.ambLP.frequency.setTargetAtTime(night ? 320 : 560, t, .5);
  AU.hum.gain.setTargetAtTime(Math.max(0, 1 - Math.hypot(pl.x - 200, pl.y - 100) / 120) * .05, t, .3);
  const N = AU.next, pan = Math.max(-1, Math.min(1, (258 - pl.x) / 200)) * -1;
  if (!night && now > N.bird) { bird(pan); N.bird = now + 1800 + Math.random() * 5000; }
  if (night && now > N.cricket) { cricket(); N.cricket = now + 500 + Math.random() * 1400; }
  if (now > N.car) { if (N.car) car(); N.car = now + 9000 + Math.random() * 14000; }
}
const RUGS = [[56, 104, 150, 52], [20, 256, 96, 30], [176, 206, 150, 74], [350, 128, 110, 50]];
const onRug = (x, y) => RUGS.some(([a, b, w, h]) => x > a && x < a + w && y > b && y < b + h);

// explored counter + avatar in the profile card
const seen = new Set(); try { JSON.parse(localStorage.getItem('ab-seen') || '[]').forEach(i => seen.add(i)); } catch (e) {}
function paintBar() {
  const n = seen.size, N = OBJ.length || 17;
  document.getElementById('barFill').style.width = (n / N * 100) + '%';
  document.getElementById('barTxt').textContent = lang === 'ar' ? `${n}/${N} مكتشف` : `${n}/${N} explored`;
}
function markSeen(id) {
  if (seen.has(id) || !OBJ.some(o => o.id === id)) return; seen.add(id);
  try { localStorage.setItem('ab-seen', JSON.stringify([...seen])); } catch (e) {}
  paintBar(); blip(660, .12); setTimeout(() => blip(880, .14), 90);
  if (seen.size === OBJ.length) setTimeout(() => toast(lang === 'ar' ? 'استكشفت الغرفة كلها!' : 'You explored the whole room!'), 900);
}

// ---------------- panels ----------------
const layer = document.getElementById('layer');
function toast(msg) { const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg; document.body.appendChild(el); setTimeout(() => el.remove(), 1700); }
function close() { layer.innerHTML = ''; panelOpen = false; cv.focus({ preventScroll: true }); }
function openPanel(id) {
  const P0 = P[id]; if (!P0) return;
  const d = P0[lang], i = ORDER.indexOf(id);
  panelOpen = true; blip(880, .08); markSeen(id);
  const body = [
    `<div class="top"><div><div class="tag">${d.tag}</div><h2 id="ph">${d.h}</h2></div><button class="x" data-close aria-label="${T[lang].close}">✕</button></div>`,
    `<p>${d.p}</p>`,
    d.stat ? `<div class="stat">${d.stat[0]}<small>${d.stat[1]}</small></div>` : '',
    d.chips ? `<div class="chips">${d.chips.map(c => `<span>${c}</span>`).join('')}</div>` : '',
    d.story ? `<ul class="story">${d.story.map(([y, s]) => `<li><b>${y}</b><span>${s}</span></li>`).join('')}</ul>` : '',
    d.links ? `<div class="links">${d.links.map(([a, b, u]) => `<a href="${u}" target="_blank" rel="noopener"><span>${a}</span><small>${b} ↗</small></a>`).join('')}</div>` : '',
    `<div class="nav"><button data-go="${ORDER[(i + ORDER.length - 1) % ORDER.length]}">${T[lang].back}</button><button data-go="${ORDER[(i + 1) % ORDER.length]}">${T[lang].next}</button></div>`,
  ].join('');
  layer.innerHTML = `<div class="scrim" data-close><div class="card" role="dialog" aria-modal="true" aria-labelledby="ph" dir="${lang === 'ar' ? 'rtl' : 'ltr'}" style="--c:${P0.c}" tabindex="-1">${body}</div></div>`;
  layer.querySelector('.card').focus();
}
function openMenu() {
  panelOpen = true; blip(520, .06);
  const ar = lang === 'ar';
  const groups = MENU.map(([en, a, items]) => `<div class="tag" style="margin-top:12px">${ar ? a : en.toUpperCase()}</div><div class="menu-list">${items.map(([id, e, aa]) => `<button data-go="${id}" class="${seen.has(id) ? 'seen' : ''}"><b>${ar ? aa : e}</b><span>${P[id][lang].tag.split(' · ')[0]}</span></button>`).join('')}</div>`).join('');
  layer.innerHTML = `<div class="scrim" data-close><div class="card" role="dialog" aria-modal="true" aria-labelledby="mh" dir="${ar ? 'rtl' : 'ltr'}" tabindex="-1">
    <div class="top"><div><div class="tag">${ar ? 'بدون لعب' : 'SKIP THE GAME'}</div><h2 id="mh">${T[lang].menu}</h2></div><button class="x" data-close aria-label="${T[lang].close}">✕</button></div>
    <p>${T[lang].hello}</p>${groups}</div></div>`;
  layer.querySelector('.card').focus();
}
layer.addEventListener('click', e => {
  const go = e.target.closest('[data-go]'); if (go) { openPanel(go.dataset.go); return; }
  if (e.target.matches('[data-close]') || e.target.closest('button[data-close]')) close();
});
const pick = a => a[Math.floor(Math.random() * a.length)];
function use(o) {
  if (!o) return;
  markSeen(o.id);
  const L = T[lang];
  if (o.id === 'sun') { petT = performance.now() + 900; blip(990, .07, 'triangle'); blip(1320, .09, 'triangle'); for (let i = 0; i < 5; i++) parts.push({ x: 304 + Math.random() * 12, y: 244, vx: (Math.random() - .5) * .4, vy: -.5 - Math.random() * .3, life: 60, c: '#ff5d7a', heart: true }); toast(pick(L.pet)); return; }
  if (o.id === 'window') { setNight(!night); return; }
  if (o.id === 'ac') { acOn = !acOn; blip(acOn ? 440 : 330, .1); toast(acOn ? L.acOn : L.acOff); return; }
  if (o.id === 'tv') { blip(520, .05); toast(pick(L.tv)); return; }
  if (o.id === 'fridge') { blip(260, .12, 'triangle'); toast(pick(L.fridge)); return; }
  if (o.id === 'lamp') { lampOn = !lampOn; blip(lampOn ? 700 : 400, .05); if (!night) toast(L.lamp); return; }
  if (o.id === 'guitar') { [523, 659, 784].forEach((f, i) => setTimeout(() => blip(f, .18, 'triangle', .06), i * 140)); for (let i = 0; i < 3; i++) parts.push({ x: 462 + i * 3, y: 246, vx: (Math.random() - .5) * .3, vy: -.4, life: 70, c: '#ffd36a', note: true }); toast(pick(L.guitar)); return; }
  openPanel(o.id);
}

// ---------------- input ----------------
const KEYMAP = { arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right', arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down', shift: 'run' };
addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (panelOpen) { if (k === 'escape') close(); return; }
  if (KEYMAP[k]) { keys[KEYMAP[k]] = true; e.preventDefault(); }
  if (k === 'e' || k === 'enter' || k === ' ') { e.preventDefault(); use(near); }
  if (k === 'm') openMenu();
});
addEventListener('keyup', e => { const k = KEYMAP[e.key.toLowerCase()]; if (k) keys[k] = false; });
addEventListener('blur', () => Object.keys(keys).forEach(k => keys[k] = false));
const toWorld = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * VW / r.width + camX, (e.clientY - r.top) * VH / r.height + camY]; };
const objAt = (x, y) => OBJ.slice().reverse().find(o => x >= o.r[0] && x <= o.r[0] + o.r[2] && y >= o.r[1] && y <= o.r[1] + o.r[3]);
cv.addEventListener('click', e => {
  const [x, y] = toWorld(e), o = objAt(x, y);
  if (o) {
    if (near === o) { use(o); return; }
    pl.target = o.spot.slice(); pl.face = 'up'; pl.pending = o;
  } else if (y > WALL) { pl.target = [x, y]; pl.pending = null; marks.push({ x: Math.round(x), y: Math.round(y), t: performance.now() }); }
});
// touch: hold and drag to walk toward your finger
let hold = null;
cv.style.touchAction = 'none';
cv.addEventListener('pointerdown', e => { unlock(); if (e.pointerType === 'mouse') return; hold = e.pointerId; try { cv.setPointerCapture(e.pointerId); } catch (er) {} });
cv.addEventListener('pointermove', e => { if (hold !== e.pointerId) return; const [x, y] = toWorld(e); pl.target = [x, Math.max(WALL + 8, y)]; pl.pending = null; });
const drop = e => { if (hold === e.pointerId) hold = null; };
cv.addEventListener('pointerup', drop); cv.addEventListener('pointercancel', drop);
function unlock() { audioInit(); try { if (actx && actx.state === 'suspended') actx.resume(); } catch (e) {} }
addEventListener('pointerdown', unlock);
addEventListener('keydown', unlock);
setInterval(() => { if (pl.pending && !pl.target) { const o = pl.pending; pl.pending = null; if (rectDist(o.r, pl.x, pl.y - 6) < 30 || Math.hypot(o.spot[0] - pl.x, o.spot[1] - pl.y) < 24) use(o); } }, 80);
cv.style.cursor = CUR.def;
cv.addEventListener('mousemove', e => { const [x, y] = toWorld(e), o = objAt(x, y) || null;
  if (o !== hoverObj) { hoverObj = o; cv.style.cursor = o ? CUR.hot : CUR.def; } });
cv.addEventListener('mouseleave', () => { hoverObj = null; });
document.querySelectorAll('.dpad button,.abtn.run').forEach(b => {
  const k = b.dataset.k;
  const on = e => { e.preventDefault(); keys[k] = true; }, off = e => { e.preventDefault(); keys[k] = false; };
  b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off);
});
document.getElementById('bUse').addEventListener('click', () => use(near));
document.getElementById('bMenu').addEventListener('click', openMenu);
function setNight(v) { night = v; document.getElementById('bNight').setAttribute('aria-pressed', v); try { localStorage.setItem('ab-night', v ? '1' : '0'); } catch (e) {} blip(v ? 300 : 600, .1); }
document.getElementById('bNight').addEventListener('click', () => setNight(!night));
const paintSound = () => { const b = document.getElementById('bSound'); b.setAttribute('aria-pressed', sound); b.textContent = sound ? '♪' : '♪̸'; };
document.getElementById('bSound').addEventListener('click', () => { sound = !sound; try { localStorage.setItem('ab-sound', sound ? '1' : '0'); } catch (e) {} paintSound(); unlock(); if (AU.master) AU.master.gain.setTargetAtTime(sound ? .7 : 0, actx.currentTime, .05); blip(780, .08); });
function setLang(l) {
  lang = l; try { localStorage.setItem('ab-lang', l); } catch (e) {}
  document.getElementById('bLang').textContent = l === 'ar' ? 'EN' : 'ع';
  document.getElementById('sub').textContent = T[l].sub;
  document.getElementById('nm').textContent = l === 'ar' ? 'عبد الرحمن' : 'ABDALRAHMAN';
  document.getElementById('who').dir = l === 'ar' ? 'rtl' : 'ltr';
  document.getElementById('bMenu').querySelector('.lbl').textContent = l === 'ar' ? 'القائمة' : 'MENU';
  paintBar();
}
document.getElementById('bLang').addEventListener('click', () => { setLang(lang === 'ar' ? 'en' : 'ar'); blip(700, .05); });

// ---------------- sizing: integer pixel scale ----------------
function fit() {
  const aw = innerWidth, ah = innerHeight;
  // whole-number pixel scale, picked so the whole room fits on a computer screen; phones follow the player
  const si = Math.max(2, Math.floor(Math.min(aw / WW, ah / WH)));
  VW = Math.min(WW, Math.ceil(aw / si)); VH = Math.min(WH, Math.ceil(ah / si));
  cv.width = VW; cv.height = VH; g.imageSmoothingEnabled = false;
  cv.style.width = VW * si + 'px'; cv.style.height = VH * si + 'px';
}
addEventListener('resize', fit);
buildRoom(); buildMore(); layout();
{ const a = document.getElementById('ava').getContext('2d'); a.imageSmoothingEnabled = false; a.drawImage(ART.player.portrait, 0, 1); }
setLang(lang); setNight(night); fit();
paintSound();
cv.tabIndex = 0;
requestAnimationFrame(frame);
const touchUI = matchMedia('(hover:none),(max-width:760px)').matches;
setTimeout(() => { if (!panelOpen) toast(T[lang].hello + (touchUI ? (lang === 'ar' ? ' اضغط على الأرض لتمشي، واضغط على أي إشي لتستخدمه.' : ' Tap the floor to walk, tap anything to use it.') : '')); }, 700);
window.__room = { pl, get near() { return near; }, use, OBJ };
})();
