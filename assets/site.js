/* Abdalrahman Amoudi, portfolio. No framework: content lives in the objects below,
   in English and Arabic, and is rendered into the page. */
(function () {
    'use strict';
    const root = document.documentElement;
    const $ = (s, el = document) => el.querySelector(s);
    const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lang = () => (root.lang === 'ar' ? 'ar' : 'en');
    const t = obj => (obj && typeof obj === 'object' && 'en' in obj) ? obj[lang()] : obj;
    const store = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };

    /* ------------------------------------------------------------------ text */
    const STR = {
        skip: { en: 'Skip to the work', ar: 'انتقل للشغل' },
        loading: { en: 'Opening the room', ar: 'عم بفتح الغرفة' },
        name: { en: 'Abdalrahman', ar: 'عبد الرحمن' },
        'nav.work': { en: 'Work', ar: 'الشغل' },
        'nav.crafts': { en: 'What I do', ar: 'شو بعمل' },
        'nav.motion': { en: 'Motion', ar: 'موشن' },
        'nav.about': { en: 'About', ar: 'عنّي' },
        'nav.contact': { en: 'Get in touch', ar: 'تواصل معي' },
        'hero.l1': { en: 'I build websites, AI systems', ar: 'ببني مواقع وأنظمة' },
        'hero.l2': { en: 'and videos, from a small', ar: 'ذكاء اصطناعي وفيديوهات،' },
        'hero.l3': { en: 'room in Amman.', ar: 'من غرفة صغيرة بعمّان.' },
        'hero.sub': { en: 'I’m Abdalrahman, a BTEC IT student and the founder of Wajha. This is my actual room, drawn in pixels. Click anything in it.', ar: 'أنا عبد الرحمن، طالب BTEC تكنولوجيا معلومات ومؤسس واجهة. هاي غرفتي الحقيقية مرسومة بكسل، اكبس على أي إشي فيها.' },
        'hero.cta': { en: 'See the work', ar: 'شوف الشغل' },
        'hero.room': { en: 'Open the room full screen', ar: 'افتح الغرفة بشاشة كاملة' },
        'hero.play': { en: 'Click to walk around', ar: 'اكبس عشان تتمشى' },
        'hero.caption': { en: 'My room, live. WASD or arrows to walk, E or click to use things.', ar: 'غرفتي، مباشر. امشِ بالأسهم أو WASD، واكبس E أو اضغط عالأشياء.' },
        'work.title': { en: 'Selected work', ar: 'شغل مختار' },
        'work.intro': { en: 'Client sites, a study app people actually use, and a few things I built because I needed them.', ar: 'مواقع لعملاء، تطبيق دراسة الناس بتستخدمه فعلاً، وكم إشي عملته لأني كنت محتاجه.' },
        'crafts.title': { en: 'What I do, in the order I fell into it', ar: 'شو بعمل، بالترتيب اللي حبيته فيه' },
        'motion.title': { en: 'Motion', ar: 'موشن' },
        'motion.intro': { en: 'I write, animate and sound-design short reels. Every frame of these is drawn in code, no stock footage.', ar: 'بكتب وبحرّك وبعمل الصوت لريلز قصيرة. كل فريم فيهم مرسوم بالكود، بدون لقطات جاهزة.' },
        'motion.sound': { en: 'Play with sound', ar: 'شغّل مع الصوت' },
        'motion.r1.t': { en: 'The Case of the Missing Focus', ar: 'قضية التركيز المفقود' },
        'motion.r1.d': { en: 'Launch reel for Vibe Todos. A pixel detective, 35 seconds, English voice.', ar: 'فيديو إطلاق Vibe Todos. محقق بكسل، ٣٥ ثانية، صوت إنجليزي.' },
        'motion.r2.t': { en: 'Three months, no gaps', ar: 'تلات شهور بدون انقطاع' },
        'motion.r2.d': { en: 'Loyalty offer for Dumbbell Gym. Motion graphics and sound design, Jordanian Arabic voice.', ar: 'عرض الالتزام لدمبل جيم. موشن جرافيك وتصميم صوت، بصوت أردني.' },
        'motion.more': { en: 'More reels go up on Wajha’s Instagram first.', ar: 'باقي الريلز بتنزل أول على إنستغرام واجهة.' },
        'process.title': { en: 'How a project goes', ar: 'كيف بمشي المشروع' },
        'about.title': { en: 'About', ar: 'عنّي' },
        'about.p1': { en: 'I’m a BTEC International Level 3 IT student in Amman. I take three things seriously: video, AI and networks. I also build websites and apps, mostly through Wajha, the small studio I started in 2025 for shops and businesses here.', ar: 'أنا طالب BTEC International Level 3 تكنولوجيا معلومات بعمّان. بشتغل بجد على تلات أشياء: المونتاج، الذكاء الاصطناعي، والشبكات. وكمان ببني مواقع وتطبيقات، أغلبها من خلال واجهة، الاستوديو الصغير اللي بلّشته سنة ٢٠٢٥ للمحلات والشركات هون.' },
        'about.p2': { en: 'I like making things that feel made by a person: pixel art drawn cell by cell, sound effects instead of stock music, and interfaces that work properly in Arabic and English.', ar: 'بحب أعمل أشياء بتحس إن إنسان عملها: بكسل آرت مرسوم مربع مربع، مؤثرات صوتية بدل الموسيقى الجاهزة، وواجهات بتشتغل صح بالعربي والإنجليزي.' },
        'about.f1k': { en: 'Based in', ar: 'ساكن' }, 'about.f1v': { en: 'Amman, Jordan', ar: 'عمّان، الأردن' },
        'about.f2k': { en: 'Studying', ar: 'بدرس' }, 'about.f2v': { en: 'BTEC International Level 3 IT', ar: 'BTEC International Level 3 IT' },
        'about.f3k': { en: 'English', ar: 'الإنجليزي' }, 'about.f3v': { en: 'C1, about IELTS 7.5', ar: 'مستوى C1، تقريباً IELTS 7.5' },
        'about.f4k': { en: 'Works in', ar: 'بشتغل' }, 'about.f4v': { en: 'Arabic and English', ar: 'بالعربي والإنجليزي' },
        'contact.title': { en: 'Got something to build?', ar: 'عندك إشي بدك تبنيه؟' },
        'contact.p': { en: 'A website, a system for your shop, a reel, or a network that needs sorting out. Send me a message and tell me what it’s for.', ar: 'موقع، نظام لمحلّك، ريل، أو شبكة بدها ترتيب. ابعتلي رسالة واحكيلي شو بدك.' },
        'contact.wa': { en: 'Message me on WhatsApp', ar: 'راسلني على واتساب' },
        'contact.ig': { en: 'Instagram', ar: 'إنستغرام' },
        'foot.made': { en: 'Built by hand in Amman. Every pixel on this page was placed on purpose.', ar: 'معمول باليد بعمّان. كل بكسل بهالصفحة محطوط عن قصد.' },
        'foot.wajha': { en: 'Wajha studio', ar: 'استوديو واجهة' },
        'foot.room': { en: 'The room, full screen', ar: 'الغرفة بشاشة كاملة' },
        'foot.book': { en: 'The book', ar: 'الكتاب' },
        'case.close': { en: 'Close', ar: 'إغلاق' },
        day: { en: 'Day', ar: 'نهار' }, night: { en: 'Night', ar: 'ليل' },
        toDay: { en: 'Switch to day', ar: 'حوّل للنهار' }, toNight: { en: 'Switch to night', ar: 'حوّل لليل' },
        open: { en: 'Read the case', ar: 'اقرأ القصة' },
        prev: { en: 'Previous project', ar: 'المشروع السابق' }, next: { en: 'Next project', ar: 'المشروع التالي' },
        role: { en: 'My part', ar: 'دوري' }, kind: { en: 'What it is', ar: 'شو هو' }, stack: { en: 'Built with', ar: 'مبني بـ' },
        did: { en: 'What I made', ar: 'شو عملت' },
    };

    /* -------------------------------------------------------------- projects */
    const STATUS = {
        live: { en: 'Live', ar: 'شغّال' },
        client: { en: 'Client', ar: 'لعميل' },
        proto: { en: 'Prototype', ar: 'نموذج' },
        open: { en: 'Open source', ar: 'مفتوح المصدر' },
    };
    const WORK = [
        {
            id: 'vibe', status: 'live', card: 'card-vibe.webp', title: 'Vibe Todos',
            kind: { en: 'Study app', ar: 'تطبيق دراسة' },
            short: { en: 'A to-do list that grew into a study app: PDFs, AI and quizzes in one place.', ar: 'قائمة مهام كبرت وصارت تطبيق دراسة: ملفات PDF وذكاء اصطناعي واختبارات بمكان واحد.' },
            lead: { en: 'Students juggle a task app, a PDF reader and a chatbot in three tabs. Vibe Todos puts them in one place: upload your PDFs, read them in a clean reader, ask AI about any page, and turn your notes into quizzes.', ar: 'الطالب بفتح تطبيق مهام وقارئ PDF وشات بوت بتلات تابات. Vibe Todos بجمعهم بمكان واحد: ارفع ملفاتك، اقرأها بقارئ مرتب، اسأل الذكاء الاصطناعي عن أي صفحة، وحوّل ملاحظاتك لاختبارات.' },
            role: { en: 'Design, code, launch reel', ar: 'التصميم والبرمجة وفيديو الإطلاق' },
            stack: 'Next.js, React, Supabase, Gemini, Tailwind',
            did: { en: ['A PDF reader with highlights and notes', 'AI chat that answers from the page you’re reading', 'Quizzes written from your own notes', 'Tasks, lists and progress, with 17 themes', 'A launch reel starring a pixel detective'], ar: ['قارئ PDF فيه تظليل وملاحظات', 'شات ذكاء اصطناعي بجاوب من الصفحة اللي بتقرأها', 'اختبارات بتنكتب من ملاحظاتك', 'مهام وقوائم وتتبع تقدّم، مع ١٧ ثيم', 'فيديو إطلاق بطله محقق بكسل'] },
            media: [{ video: 'vibe-todos-reel.mp4', poster: 'poster-vibe.webp' }, { pair: ['vibe-3.webp', 'vibe-22.webp'] }],
            links: [{ en: 'Open the app', ar: 'افتح التطبيق', href: 'https://to-do-virid-beta.vercel.app', primary: true }, { en: 'Code on GitHub', ar: 'الكود على GitHub', href: 'https://github.com/Abdulrahman-amoudi/ToDo' }],
        },
        {
            id: 'wajha', status: 'live', card: 'card-wajha.webp', title: { en: 'Wajha', ar: 'واجهة' },
            kind: { en: 'My studio', ar: 'الاستوديو تبعي' },
            short: { en: 'My studio’s brand, website and the client system behind it.', ar: 'هوية الاستوديو تبعي وموقعه ونظام العملاء اللي وراه.' },
            lead: { en: 'Wajha means storefront. Most shops in Amman have the same Instagram page and nothing else, so Wajha builds them a real one: a website, a system to run the shop, and video to bring people in. I made the brand, the bilingual site and the CRM I run it with.', ar: 'واجهة يعني واجهة المحل. أغلب محلات عمّان عندها نفس صفحة الإنستغرام وبس، فواجهة بتبنيلهم واجهة حقيقية: موقع، نظام يمشّي المحل، وفيديو يجيب الناس. أنا عملت الهوية والموقع باللغتين ونظام العملاء اللي بشتغل عليه.' },
            role: { en: 'Brand, website, CRM, reels', ar: 'الهوية والموقع ونظام العملاء والريلز' },
            stack: 'HTML, CSS, JavaScript, Supabase, Vercel',
            did: { en: ['An Arabic-first site with an English version', 'A project brief form that lands straight in the CRM', 'Leads, clients, projects and money in one dashboard', 'Pixel-art reels for Instagram'], ar: ['موقع عربي أولاً مع نسخة إنجليزية', 'نموذج طلب مشروع بوصل مباشرة لنظام العملاء', 'العملاء المحتملين والعملاء والمشاريع والمصاري بلوحة وحدة', 'ريلز بكسل آرت للإنستغرام'] },
            media: [{ img: 'wide-wajha.webp' }],
            links: [{ en: 'Visit Wajha', ar: 'زور واجهة', href: 'https://wajha-chi.vercel.app', primary: true }, { en: '@wajiha.jo on Instagram', ar: '@wajiha.jo على إنستغرام', href: 'https://www.instagram.com/wajiha.jo/' }],
        },
        {
            id: 'peak', status: 'proto', card: 'card-peak.webp', title: 'peak',
            kind: { en: 'Ordering site for a café', ar: 'موقع طلبات لكافيه' },
            short: { en: 'An ordering site prototype for a crumble and matcha shop on 7th Circle.', ar: 'نموذج موقع طلبات لمحل كرمبل وماتشا عالدوار السابع.' },
            lead: { en: 'peak opened on 7th Circle with its menu on Instagram and orders in DMs. I built them a prototype ordering site with the real menu and prices, a cart, and checkout for pickup or delivery, with a time and notes.', ar: 'peak فتح عالدوار السابع والمنيو على إنستغرام والطلبات بالرسائل. بنيتلهم نموذج موقع طلبات فيه المنيو الحقيقي والأسعار، سلة، وطلب استلام أو توصيل مع الوقت والملاحظات.' },
            role: { en: 'Design and build', ar: 'التصميم والبرمجة' },
            stack: 'HTML, CSS, JavaScript',
            did: { en: ['The menu and prices from their own page', 'Cart and checkout for pickup or delivery', 'An order confirmation screen', 'Arabic first, with English'], ar: ['المنيو والأسعار من صفحتهم', 'سلة وطلب استلام أو توصيل', 'شاشة تأكيد الطلب', 'عربي أولاً، مع إنجليزي'] },
            note: { en: 'Payment isn’t connected yet; orders are cash for now.', ar: 'الدفع لسا مش موصول؛ الطلبات كاش هلأ.' },
            media: [{ img: 'wide-peak.webp' }],
            links: [{ en: 'Code on GitHub', ar: 'الكود على GitHub', href: 'https://github.com/Abdulrahman-amoudi/Peak-Cafe' }],
        },
        {
            id: 'gym', status: 'client', card: 'card-gym.webp', title: { en: 'Dumbbell Gym', ar: 'دمبل جيم' },
            kind: { en: 'Members system and reel', ar: 'نظام مشتركين وريل' },
            short: { en: 'The members dashboard the front desk runs on, and a reel for its loyalty offer.', ar: 'لوحة المشتركين اللي بشتغل عليها الاستقبال، وريل لعرض الالتزام.' },
            lead: { en: 'Dumbbell Gym is my father’s gym. I built the dashboard the front desk uses for members and subscriptions, then a reel for its new offer: train three months without a gap and get two weeks free.', ar: 'دمبل جيم جيم أبوي. بنيت اللوحة اللي بستخدمها الاستقبال للمشتركين والاشتراكات، وبعدها ريل للعرض الجديد: التزم تلات شهور ورا بعض وخذ أسبوعين مجاناً.' },
            role: { en: 'Dashboard, motion, sound', ar: 'اللوحة والموشن والصوت' },
            stack: 'JavaScript, Supabase, Vercel, Python',
            did: { en: ['Members, subscriptions and renewals in one place', 'Loyalty streaks and gift days', 'Reminders that remember who was already contacted', 'A 16-second motion reel with hand-built sound effects'], ar: ['المشتركين والاشتراكات والتجديد بمكان واحد', 'سلسلة الالتزام وأيام الهدية', 'تذكيرات بتتذكر مين انحكى معه', 'ريل موشن ١٦ ثانية بمؤثرات صوتية معمولة باليد'] },
            note: { en: 'The dashboard holds real members’ data, so it isn’t shown here.', ar: 'اللوحة فيها بيانات مشتركين حقيقيين، عشان هيك مش معروضة هون.' },
            media: [{ video: 'dumbbell-loyalty-reel.mp4', poster: 'poster-gym.webp' }],
            links: [],
        },
        {
            id: 'newtab', status: 'open', card: 'card-newtab.webp', title: 'Catppuccin New Tab',
            kind: { en: 'Chrome extension', ar: 'إضافة كروم' },
            short: { en: 'A pixel-art new tab for Chrome, with pets you can drag around.', ar: 'صفحة تاب جديد بكسل آرت لكروم، مع حيوانات بتقدر تسحبها.' },
            lead: { en: 'I open a new tab a hundred times a day, so it had to be good. It has an LCD clock, a pixel village on the horizon, shortcuts in an inventory hotbar, and a hand-drawn cat that naps when you leave it alone. Six interface styles work with sixteen colour themes.', ar: 'بفتح تاب جديد مية مرة باليوم، فلازم يكون حلو. فيه ساعة LCD، قرية بكسل عالأفق، اختصارات بشريط زي الألعاب، وقطة مرسومة باليد بتنام لما تتركها. ستة ستايلات بتشتغل مع ستعش ثيم ألوان.' },
            role: { en: 'Design, pixel art, code', ar: 'التصميم والبكسل آرت والبرمجة' },
            stack: 'JavaScript, CSS, Canvas, Chrome MV3',
            did: { en: ['Four pets drawn pixel by pixel, with idle, sleep and hop animations', 'A 16px icon set for every button and shortcut', 'Six interface styles across sixteen themes', 'A layout that works on portrait monitors'], ar: ['أربع حيوانات مرسومة بكسل بكسل، بتتنفس وبتنام وبتنط', 'مجموعة أيقونات ١٦ بكسل لكل زر واختصار', 'ستة ستايلات على ستعش ثيم', 'تصميم بشتغل على الشاشات العمودية'] },
            media: [{ img: 'wide-newtab.webp' }, { pair: ['newtab-pets.gif', 'wide-newtab-glass.webp'] }],
            links: [{ en: 'Code on GitHub', ar: 'الكود على GitHub', href: 'https://github.com/Abdulrahman-amoudi/Catppuccin-New-Tab', primary: true }],
        },
    ];

    const CRAFTS = [
        { year: '2022', h: { en: 'Video editing', ar: 'المونتاج' }, p: { en: 'I opened Premiere Pro for the first time and didn’t stop. 75+ videos later, editing is still my favourite thing: cinematic edits, reels, motion graphics and colour.', ar: 'فتحت بريمير لأول مرة وما وقفت. أكثر من ٧٥ فيديو، والمونتاج لسا أكثر إشي بحبه: مونتاج سينمائي، ريلز، موشن جرافيك وألوان.' }, chips: ['Premiere Pro', 'After Effects', 'DaVinci Resolve', 'CapCut', 'Photoshop', 'Figma'] },
        { year: '2023', h: { en: 'AI systems', ar: 'أنظمة الذكاء الاصطناعي' }, p: { en: 'I started building with AI: agents wired into real workflows, notes that link themselves, and quizzes written from your own PDFs.', ar: 'بلّشت أبني بالذكاء الاصطناعي: وكلاء داخل سير عمل حقيقي، ملاحظات بتربط حالها، واختبارات بتنكتب من ملفاتك.' }, chips: { en: ['Agent integration', 'Workflow automation', 'Second brain', 'Gemini API', 'Prompt design'], ar: ['ربط الوكلاء', 'أتمتة سير العمل', 'العقل الثاني', 'Gemini API', 'كتابة البرومبت'] } },
        { year: '2024', h: { en: 'Network engineering', ar: 'هندسة الشبكات' }, p: { en: 'Designing and configuring network topologies: routers, switches and the paths between them, built and tested in Cisco Packet Tracer.', ar: 'تصميم وإعداد الشبكات: راوترات وسويتشات والمسارات بينها، ببنيها وبجربها على Cisco Packet Tracer.' }, chips: ['Cisco IOS', 'Packet Tracer', { en: 'Topology design', ar: 'تصميم الطوبولوجيا' }] },
        { year: '2025', h: { en: 'Web and apps', ar: 'مواقع وتطبيقات' }, p: { en: 'I started Wajha to build websites, systems and motion videos for real clients, in Arabic and English.', ar: 'أسست واجهة عشان أبني مواقع وأنظمة وفيديوهات موشن لعملاء حقيقيين، بالعربي والإنجليزي.' }, chips: ['Next.js', 'React', 'TypeScript', 'Supabase', 'Tailwind', 'Flutter', 'Python', 'Vercel'] },
    ];

    const STEPS = [
        { h: { en: 'Listen', ar: 'بسمع' }, p: { en: 'We talk about the business, who it’s for and what it has to do. I ask a lot of questions.', ar: 'بنحكي عن الشغل، لمين، وشو لازم يعمل. بسأل أسئلة كثير.' } },
        { h: { en: 'Sketch', ar: 'برسم' }, p: { en: 'I show one clear direction early, with real content, so we fix the big things first.', ar: 'بفرجيك اتجاه واحد واضح من بدري، بمحتوى حقيقي، عشان نصلّح الأشياء الكبيرة أول.' } },
        { h: { en: 'Build', ar: 'ببني' }, p: { en: 'Real code in both languages, tested on the phones your customers actually use.', ar: 'كود حقيقي باللغتين، مجرّب على الموبايلات اللي زبائنك بستخدموها فعلاً.' } },
        { h: { en: 'Launch and look after', ar: 'بطلق وبتابع' }, p: { en: 'It goes live, I watch how people use it, and I keep fixing and improving it.', ar: 'بنزل، بشوف كيف الناس بتستخدمه، وبضل أصلّح وأحسّن.' } },
    ];

    // 16x16 pixel icons for the band
    const ICONS = {
        play: 'M3 2h2v1h2v1h2v1h2v1h2v4h-2v1H9v1H7v1H5v1H3z',
        spark: 'M7 1h2v4h1v1h1v1h4v2h-4v1h-1v1H9v4H7v-4H6v-1H5V9H1V7h4V6h1V5h1z',
        net: 'M6 1h4v4H9v2h4v3h2v4h-4v-4h1V8H4v2h1v4H1v-4h2V7h4V5H6z',
        code: 'M5 3h2v2H5v2H3v2h2v2h2v2H5v-2H3V9H1V7h2V5h2zM9 3h2v2h2v2h2v2h-2v2h-2v2H9v-2h2V9h2V7h-2V5H9z',
        wave: 'M1 7h2v2H1zM3 5h2v6H3zM5 3h2v10H5zM7 6h2v4H7zM9 4h2v8H9zM11 6h2v4h-2zM13 7h2v2h-2z',
        grid: 'M1 1h6v6H1zM9 1h6v6H9zM1 9h6v6H1zM9 9h6v6H9z',
    };
    const BAND = [
        ['play', { en: 'Video editing', ar: 'مونتاج' }], ['spark', { en: 'AI systems', ar: 'ذكاء اصطناعي' }],
        ['net', { en: 'Network engineering', ar: 'هندسة شبكات' }], ['code', { en: 'Web and apps', ar: 'مواقع وتطبيقات' }],
        ['wave', { en: 'Motion and sound', ar: 'موشن وصوت' }], ['grid', { en: 'Pixel art', ar: 'بكسل آرت' }],
    ];
    const ico = k => `<svg class="px-ico" viewBox="0 0 16 16" aria-hidden="true"><path d="${ICONS[k]}"/></svg>`;
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const num = n => lang() === 'ar' ? String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]) : String(n);

    /* ------------------------------------------------------------- rendering */
    function renderStatic() {
        $$('[data-i18n]').forEach(el => { const s = STR[el.dataset.i18n]; if (s) el.textContent = s[lang()]; });
        $$('[data-i18n-aria]').forEach(el => { const s = STR[el.dataset.i18nAria]; if (s) el.setAttribute('aria-label', s[lang()]); });
        $('#langBtn').textContent = lang() === 'ar' ? 'English' : 'عربي';
        $('#langBtn').lang = lang() === 'ar' ? 'en' : 'ar';
        $('#workPrev').setAttribute('aria-label', t(STR.prev));
        $('#workNext').setAttribute('aria-label', t(STR.next));
        syncTimeButton();
    }
    function renderBand() {
        const items = BAND.map(([k, label]) => `<span class="band-item">${esc(t(label))}${ico(k)}</span>`).join('');
        $('#bandTrack').innerHTML = items + items; // doubled so the loop is seamless
    }
    function renderWork() {
        $('#workTrack').innerHTML = WORK.map((w, i) => `
            <li class="work-card">
                <button class="work-open" type="button" data-case="${i}" aria-label="${esc(t(w.title))}: ${esc(t(STR.open))}">
                    <div class="work-media">
                        <img src="/assets/img/${w.card}" alt="" loading="lazy" width="720" height="900">
                        <span class="status" data-kind="${w.status}">${esc(t(STATUS[w.status]))}</span>
                    </div>
                    <div class="work-meta">
                        <h3>${esc(t(w.title))}</h3>
                        <p>${esc(t(w.short))}</p>
                        <span class="work-more">${esc(t(STR.open))}</span>
                    </div>
                </button>
            </li>`).join('');
        updateCounter();
    }
    function renderCrafts() {
        $('#craftList').innerHTML = CRAFTS.map(c => `
            <li class="craft">
                <span class="craft-year">${num(c.year)}</span>
                <div><h3>${esc(t(c.h))}</h3><p>${esc(t(c.p))}</p></div>
                <div class="chips">${(t(c.chips) || c.chips).map(x => `<span class="chip">${esc(t(x))}</span>`).join('')}</div>
            </li>`).join('');
    }
    function renderSteps() {
        $('#steps').innerHTML = STEPS.map((s, i) => `
            <li class="step"><span class="step-n">${num(String(i + 1).padStart(2, '0'))}</span><h3>${esc(t(s.h))}</h3><p>${esc(t(s.p))}</p></li>`).join('');
    }
    function renderAll() { renderStatic(); renderBand(); renderWork(); renderCrafts(); renderSteps(); }

    /* ------------------------------------------------------------ case study */
    const dialog = $('#case');
    function openCase(i) {
        const w = WORK[i];
        const media = w.media.map(m => {
            if (m.video) return `<video src="/assets/video/${m.video}" poster="/assets/img/${m.poster}" controls playsinline preload="none"></video>`;
            if (m.pair) return `<div class="pair">${m.pair.map(s => `<img src="/assets/img/${s}" alt="" loading="lazy">`).join('')}</div>`;
            return `<img src="/assets/img/${m.img}" alt="" loading="lazy">`;
        }).join('');
        const links = w.links.map(l => `<a class="btn ${l.primary ? 'btn-primary' : 'btn-ghost'}" href="${l.href}" target="_blank" rel="noopener">${esc(l[lang()])}</a>`).join('');
        $('#caseBody').innerHTML = `
            <p class="case-kicker">${esc(t(STATUS[w.status]))}</p>
            <h2 id="caseTitle">${esc(t(w.title))}</h2>
            <p class="case-lead">${esc(t(w.lead))}</p>
            <dl class="case-grid">
                <div><dt>${esc(t(STR.kind))}</dt><dd>${esc(t(w.kind))}</dd></div>
                <div><dt>${esc(t(STR.role))}</dt><dd>${esc(t(w.role))}</dd></div>
                <div><dt>${esc(t(STR.stack))}</dt><dd dir="ltr">${esc(w.stack)}</dd></div>
            </dl>
            <div class="case-media">${media}</div>
            <div class="case-body"><h3>${esc(t(STR.did))}</h3><ul>${t(w.did).map(d => `<li>${esc(d)}</li>`).join('')}</ul></div>
            ${w.note ? `<p class="case-note">${esc(t(w.note))}</p>` : ''}
            ${links ? `<div class="case-links">${links}</div>` : ''}`;
        dialog.dataset.index = i;
        if (!dialog.open) dialog.showModal();
        dialog.scrollTop = 0;
        history.replaceState(null, '', '#' + w.id);
    }
    function closeCase() {
        $$('video', dialog).forEach(v => v.pause());
        dialog.close();
    }
    dialog.addEventListener('close', () => { if (location.hash.length > 1 && WORK.some(w => '#' + w.id === location.hash)) history.replaceState(null, '', '#work'); });
    dialog.addEventListener('click', e => { if (e.target === dialog) closeCase(); });
    $('#caseClose').addEventListener('click', closeCase);
    document.addEventListener('click', e => {
        const b = e.target.closest('[data-case]');
        if (b) openCase(+b.dataset.case);
    });

    /* -------------------------------------------------------------- carousel */
    const track = $('#workTrack');
    function cardStep() { const c = track.querySelector('.work-card'); return c ? c.getBoundingClientRect().width + 22 : 300; }
    function currentIndex() { return Math.round(Math.abs(track.scrollLeft) / cardStep()); }
    function updateCounter() {
        const i = Math.min(WORK.length - 1, currentIndex());
        $('#workCounter').textContent = `${num(i + 1)} / ${num(WORK.length)}`;
        const max = track.scrollWidth - track.clientWidth - 2;
        $('#workPrev').disabled = Math.abs(track.scrollLeft) < 2;
        $('#workNext').disabled = Math.abs(track.scrollLeft) >= max;
    }
    const dir = () => (root.dir === 'rtl' ? -1 : 1);
    $('#workPrev').addEventListener('click', () => track.scrollBy({ left: -cardStep() * dir(), behavior: reduced ? 'auto' : 'smooth' }));
    $('#workNext').addEventListener('click', () => track.scrollBy({ left: cardStep() * dir(), behavior: reduced ? 'auto' : 'smooth' }));
    track.addEventListener('scroll', () => requestAnimationFrame(updateCounter), { passive: true });

    /* ----------------------------------------------------------- room + time */
    const room = $('#room');
    const roomWin = $('.room-window');
    function roomSrc() { return `/room/?embed=1&night=${root.dataset.time === 'night' ? 1 : 0}&lang=${lang()}`; }
    function tellRoom() {
        try { room.contentWindow.postMessage({ room: { night: root.dataset.time === 'night', lang: lang() } }, location.origin); } catch (e) {}
    }
    function syncTimeButton() {
        const night = root.dataset.time === 'night';
        const b = $('#timeBtn');
        b.setAttribute('aria-pressed', String(night));
        b.setAttribute('aria-label', t(night ? STR.toDay : STR.toNight));
        $('#timeLabel').textContent = t(night ? STR.night : STR.day);
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = night ? '#0d0f1c' : '#e6e4de';
    }
    $('#timeBtn').addEventListener('click', () => {
        root.dataset.time = root.dataset.time === 'night' ? 'day' : 'night';
        store('ab-time', root.dataset.time);
        syncTimeButton(); tellRoom();
    });
    $('#langBtn').addEventListener('click', () => {
        const next = lang() === 'ar' ? 'en' : 'ar';
        root.lang = next; root.dir = next === 'ar' ? 'rtl' : 'ltr';
        store('ab-lang', next);
        const keep = currentIndex();
        renderAll(); tellRoom();
        track.scrollLeft = 0; if (keep) track.scrollLeft = keep * cardStep() * dir();
        if (dialog.open) openCase(+dialog.dataset.index);
        document.title = lang() === 'ar' ? 'عبد الرحمن العمودي: مواقع وأنظمة ذكاء اصطناعي وفيديوهات من عمّان' : 'Abdalrahman Amoudi: websites, AI systems and videos from Amman';
    });

    // focusing the room: the iframe takes the keyboard while it has focus
    $('#roomFocus').addEventListener('click', () => { room.focus(); try { room.contentWindow.focus(); } catch (e) {} roomWin.classList.add('focused'); });
    window.addEventListener('blur', () => { if (document.activeElement === room) roomWin.classList.add('focused'); });
    window.addEventListener('focus', () => roomWin.classList.remove('focused'));
    window.addEventListener('message', e => { if (e.origin === location.origin && e.data && e.data.roomReady) { tellRoom(); finishLoading(); } });

    /* ---------------------------------------------------------------- loader */
    const loader = $('#loader');
    let loaded = false;
    function finishLoading() {
        if (loaded) return; loaded = true;
        $('#loaderFill').style.width = '100%';
        setTimeout(() => {
            loader.classList.add('done');
            root.classList.add('ready');
            setTimeout(() => root.classList.remove('intro'), 1800);
        }, reduced ? 0 : 280);
    }
    (function walker() {
        const c = $('#walker'), ctx = c.getContext('2d'), img = new Image();
        c.width = 36; c.height = 53;
        let f = 0, p = 0;
        img.onload = () => {
            const tick = () => {
                if (loaded) return;
                ctx.clearRect(0, 0, 36, 53); ctx.drawImage(img, (f % 4) * 36, 0, 36, 53, 0, 0, 36, 53);
                f++; p = Math.min(90, p + 7 + Math.random() * 9); $('#loaderFill').style.width = p + '%';
                setTimeout(tick, 140);
            };
            tick();
        };
        img.src = '/assets/img/abud-walk.png';
    })();
    root.classList.add('intro');
    room.addEventListener('load', () => setTimeout(finishLoading, 150));
    setTimeout(finishLoading, 3500); // never hold the page hostage
    room.src = roomSrc();

    /* ----------------------------------------------------------------- reels */
    const videos = $$('.reel video');
    if ('IntersectionObserver' in window && !reduced) {
        const io = new IntersectionObserver(entries => entries.forEach(en => {
            const v = en.target;
            if (en.isIntersecting) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause();
        }), { threshold: .45 });
        videos.forEach(v => io.observe(v));
    }
    $$('.reel-sound').forEach(b => b.addEventListener('click', () => {
        const v = b.parentElement.querySelector('video');
        const on = b.getAttribute('aria-pressed') !== 'true';
        videos.forEach(o => { if (o !== v) { o.muted = true; o.parentElement.querySelector('.reel-sound').setAttribute('aria-pressed', 'false'); } });
        v.muted = !on;
        if (on) { v.currentTime = 0; v.play().catch(() => {}); }
        b.setAttribute('aria-pressed', String(on));
    }));

    /* ------------------------------------------------------------------ misc */
    const nav = $('#nav');
    const onScroll = () => nav.classList.toggle('scrolled', scrollY > 8);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();

    renderAll();
    const deep = WORK.findIndex(w => '#' + w.id === location.hash);
    if (deep >= 0) setTimeout(() => openCase(deep), 600);
})();
