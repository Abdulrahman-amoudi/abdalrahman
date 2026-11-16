/* Meet Abdalrahman: the book. Pages are data; art lives in /book/art/<id>.webp.
   Until a page's art exists, a flat placeholder scene in the page's colours is drawn. */
(function () {
    'use strict';
    const root = document.documentElement;
    const $ = s => document.querySelector(s);
    const lang = () => (root.lang === 'ar' ? 'ar' : 'en');
    const t = o => (o && typeof o === 'object' && 'en' in o) ? o[lang()] : o;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const UI = {
        brand: { en: 'Abdalrahman', ar: 'عبد الرحمن' },
        name: { en: 'Abdalrahman Amoudi', ar: 'عبد الرحمن العمودي' },
        'cover.title': { en: 'Meet<br>Abdalrahman.', ar: 'تعرّف على<br>عبد الرحمن.' },
        'cover.sub': { en: 'About me & what I do', ar: 'عنّي وعن شغلي' },
        open: { en: 'Open the book', ar: 'افتح الكتاب' },
        hint: { en: 'Use the arrows, swipe, or click the edge of the page.', ar: 'استخدم الأسهم أو اسحب أو اكبس على طرف الصفحة.' },
        'foot.by': { en: 'Meet Abdalrahman, a book by Abdalrahman Amoudi', ar: 'تعرّف على عبد الرحمن، كتاب من عبد الرحمن العمودي' },
        'foot.where': { en: 'Amman, Jordan', ar: 'عمّان، الأردن' },
        'foot.work': { en: 'The full portfolio', ar: 'البورتفوليو الكامل' },
        'foot.room': { en: 'My pixel room', ar: 'غرفتي البكسل' },
        prev: { en: 'Previous page', ar: 'الصفحة السابقة' },
        next: { en: 'Next page', ar: 'الصفحة التالية' },
        page: { en: 'Page', ar: 'صفحة' },
    };

    // bg = page colour, ink = text colour, side = where the text sits (the art leaves that side empty)
    const PAGES = [
        {
            id: '01-hello', bg: '#e9b7a3', ink: '#3a211a', side: 'right', focus: '25% 50%',
            title: { en: 'I’m Abdalrahman.', ar: 'أنا عبد الرحمن.' },
            body: { en: 'A BTEC IT student and maker from Amman. I build websites, AI systems and videos, and I started Wajha to make them for real businesses.', ar: 'طالب BTEC تكنولوجيا معلومات وصانع من عمّان. ببني مواقع وأنظمة ذكاء اصطناعي وفيديوهات، وأسست واجهة عشان أعملها لمحلات وشركات حقيقية.' },
        },
        {
            id: '02-video', bg: '#2f3f6b', ink: '#f4efe4', side: 'right', emboss: true, focus: '20% 50%',
            title: { en: 'Video editing', ar: 'المونتاج' },
            body: { en: 'Where it started, in 2022. Seventy-five videos later it’s still my favourite thing: cinematic edits, reels, colour and motion.', ar: 'من هون بلّشت، سنة ٢٠٢٢. أكثر من ٧٥ فيديو ولسا أكثر إشي بحبه: مونتاج سينمائي، ريلز، ألوان وحركة.' },
        },
        {
            id: '03-ai', bg: '#9fc79a', ink: '#1f3320', side: 'left', focus: '75% 50%',
            title: { en: 'AI that does real work.', ar: 'ذكاء اصطناعي بشتغل فعلاً.' },
            body: { en: 'Agents wired into real workflows, notes that link themselves, and quizzes written from your own PDFs.', ar: 'وكلاء داخل سير عمل حقيقي، ملاحظات بتربط حالها، واختبارات بتنكتب من ملفاتك.' },
        },
        {
            id: '04-networks', bg: '#2e6b6a', ink: '#eef6f2', side: 'right', emboss: true, focus: '20% 50%',
            title: { en: 'Networks', ar: 'الشبكات' },
            body: { en: 'Routers, switches and the paths between them. I design and configure network topologies and test them in Cisco Packet Tracer.', ar: 'راوترات وسويتشات والمسارات بينها. بصمم وبجهّز الشبكات وبجربها على Cisco Packet Tracer.' },
        },
        {
            id: '05-web', bg: '#ee6a3c', ink: '#2a130a', side: 'right', emboss: true, focus: '22% 50%',
            title: { en: 'Websites & apps', ar: 'مواقع وتطبيقات' },
            body: { en: 'Through Wajha I build websites and systems for shops in Amman: online orders, members and bookings, in Arabic and English.', ar: 'من خلال واجهة ببني مواقع وأنظمة لمحلات عمّان: طلبات أونلاين، مشتركين وحجوزات، بالعربي والإنجليزي.' },
            links: [{ en: 'Visit Wajha', ar: 'زور واجهة', href: 'https://wajha-chi.vercel.app' }],
        },
        {
            id: '06-motion', bg: '#5b3f74', ink: '#f6effa', side: 'left', focus: '78% 50%',
            title: { en: 'Stories that move.', ar: 'قصص بتتحرك.' },
            body: { en: 'Short reels written, animated and sound-designed by hand. A pixel detective for Vibe Todos, a loyalty reel for Dumbbell Gym.', ar: 'ريلز قصيرة بكتبها وبحرّكها وبعمل صوتها بإيدي. محقق بكسل لـ Vibe Todos، وريل الالتزام لدمبل جيم.' },
            links: [{ en: 'Watch the reels', ar: 'شوف الريلز', href: '/#motion' }],
        },
        {
            id: '07-work', bg: '#f0d58c', ink: '#3a2d0c', side: 'right', focus: '22% 50%',
            title: { en: 'Things I’ve built.', ar: 'أشياء بنيتها.' },
            body: { en: 'A study app people use every day, my studio’s site and CRM, an ordering site for a café, a gym’s members system, and a pixel new tab for Chrome.', ar: 'تطبيق دراسة الناس بتستخدمه كل يوم، موقع ونظام الاستوديو تبعي، موقع طلبات لكافيه، نظام مشتركين لجيم، وصفحة تاب جديد بكسل لكروم.' },
            links: [{ en: 'See the work', ar: 'شوف الشغل', href: '/#work' }, { en: 'Vibe Todos', ar: 'Vibe Todos', href: 'https://to-do-virid-beta.vercel.app', ghost: true }],
        },
        {
            id: '08-hello-again', bg: '#efe6d4', ink: '#2b241b', side: 'left', focus: '78% 50%',
            title: { en: 'Got something to build?', ar: 'عندك إشي بدك تبنيه؟' },
            body: { en: 'A website, a system for your shop, a reel, or a network that needs sorting out. Tell me what it’s for.', ar: 'موقع، نظام لمحلّك، ريل، أو شبكة بدها ترتيب. احكيلي شو بدك.' },
            links: [{ en: 'WhatsApp me', ar: 'راسلني واتساب', href: 'https://wa.me/962781912998' }, { en: 'Instagram', ar: 'إنستغرام', href: 'https://www.instagram.com/abdalrahman__amoudi/', ghost: true }],
        },
    ];

    /* placeholder art: a flat scene in the page's colours, leaving the text side empty */
    function shade(hex, k) {
        const n = parseInt(hex.slice(1), 16);
        const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))));
        return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
    }
    function placeholder(p) {
        const b = p.bg, dark = shade(b, -.28), deep = shade(b, -.5), light = shade(b, .35), pale = shade(b, .6);
        const flip = p.side === 'left'; // art on the right
        const g = `
          <rect width="1600" height="940" fill="${b}"/>
          <rect y="640" width="1600" height="300" fill="${dark}"/>
          <path d="M120 640V250a170 170 0 0 1 340 0v390z" fill="${pale}"/>
          <path d="M140 640V255a150 150 0 0 1 300 0v385z" fill="${light}"/>
          <rect x="140" y="470" width="300" height="170" fill="${shade(b, .15)}"/>
          <rect x="285" y="105" width="10" height="535" fill="${pale}"/><rect x="140" y="400" width="300" height="10" fill="${pale}"/>
          <circle cx="360" cy="230" r="34" fill="${pale}"/>
          <rect x="420" y="600" width="520" height="22" rx="6" fill="${deep}"/>
          <rect x="455" y="622" width="18" height="230" fill="${deep}"/><rect x="890" y="622" width="18" height="230" fill="${deep}"/>
          <rect x="560" y="470" width="250" height="150" rx="10" fill="${deep}"/><rect x="574" y="484" width="222" height="112" rx="4" fill="${light}"/>
          <rect x="660" y="620" width="50" height="10" fill="${deep}"/>
          <circle cx="520" cy="430" r="44" fill="${deep}"/><path d="M470 600c0-90 20-140 50-140s50 50 50 140z" fill="${deep}"/>
          <path d="M860 600h46l-8-70h-30z" fill="${pale}"/><path d="M882 535c-40-50-20-110 10-120 10 40 30 80-10 120zM885 540c30-60 80-70 100-60-20 40-50 70-100 60z" fill="${shade(b, -.4)}"/>
          <circle cx="1000" cy="160" r="6" fill="${pale}"/><circle cx="1040" cy="210" r="4" fill="${pale}"/>`;
        return `<svg viewBox="0 0 1600 940" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${flip ? `<g transform="translate(1600 0) scale(-1 1)">${g}</g>` : g}</svg>`;
    }

    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const num = n => lang() === 'ar' ? String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]) : String(n);
    const side = p => lang() === 'ar' ? (p.side === 'left' ? 'right' : p.side === 'right' ? 'left' : p.side) : p.side;

    const pagesEl = $('#pages'), dotsEl = $('#dots');
    let cur = 0, busy = false;

    function render() {
        document.querySelectorAll('[data-t]').forEach(el => { const s = UI[el.dataset.t]; if (s) el.innerHTML = esc(s[lang()]).replace(/&lt;br&gt;/g, '<br>'); });
        $('#lang').textContent = lang() === 'ar' ? 'English' : 'العربية';
        $('#lang').lang = lang() === 'ar' ? 'en' : 'ar';
        document.title = lang() === 'ar' ? 'تعرّف على عبد الرحمن: مواقع وذكاء اصطناعي وفيديو من عمّان' : 'Meet Abdalrahman: websites, AI and video from Amman';
        pagesEl.innerHTML = PAGES.map((p, i) => `
            <article class="page" data-side="${side(p)}" ${p.emboss ? 'data-emboss' : ''} style="--bg:${p.bg};--ink-p:${p.ink};--focus:${p.focus || '50% 50%'}" aria-roledescription="page" aria-label="${esc(t(UI.page))} ${num(i + 1)}">
                <div class="art">${placeholder(p)}</div>
                <div class="copy">
                    <h2>${esc(t(p.title))}</h2>
                    ${p.emboss ? '' : '<span class="rule" aria-hidden="true"></span>'}
                    <p>${esc(t(p.body))}</p>
                    ${p.links ? `<div class="links">${p.links.map(l => `<a class="${l.ghost ? 'ghost' : ''}" href="${l.href}" ${l.href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>${esc(l[lang()])}</a>`).join('')}</div>` : ''}
                </div>
                <span class="folio" aria-hidden="true">${num(i + 1)} / ${num(PAGES.length)}</span>
            </article>`).join('') + `
            <button class="edge prev" type="button" aria-label="${esc(t(UI.prev))}"></button>
            <button class="edge next" type="button" aria-label="${esc(t(UI.next))}"></button>`;
        // swap in real art where it exists
        pagesEl.querySelectorAll('.page').forEach((el, i) => {
            const img = new Image();
            img.alt = ''; img.decoding = 'async';
            img.onload = () => { const a = el.querySelector('.art'); a.innerHTML = ''; a.appendChild(img); };
            img.src = `/book/art/${PAGES[i].id}.webp`;
        });
        dotsEl.innerHTML = PAGES.map((p, i) => `<button class="dot" type="button" style="--c:${p.bg}" aria-label="${esc(t(UI.page))} ${num(i + 1)}"></button>`).join('');
        pagesEl.querySelector('.prev').addEventListener('click', () => go(cur - 1));
        pagesEl.querySelector('.next').addEventListener('click', () => go(cur + 1));
        dotsEl.querySelectorAll('.dot').forEach((d, i) => d.addEventListener('click', () => go(i)));
        show(cur);
    }

    function show(i) {
        const pages = pagesEl.querySelectorAll('.page');
        pages.forEach((p, j) => { p.className = 'page' + (j === i ? ' is-current' : ''); p.setAttribute('aria-hidden', String(j !== i)); p.inert = j !== i; });
        dotsEl.querySelectorAll('.dot').forEach((d, j) => d.setAttribute('aria-current', String(j === i)));
        pagesEl.querySelector('.prev').disabled = i === 0;
        pagesEl.querySelector('.next').disabled = i === PAGES.length - 1;
    }

    function go(i) {
        if (busy || i < 0 || i >= PAGES.length || i === cur) return;
        const pages = pagesEl.querySelectorAll('.page');
        const from = pages[cur], to = pages[i], forward = i > cur;
        if (reduced) { cur = i; show(cur); return; }
        busy = true;
        if (forward) {
            to.classList.add('is-under'); to.style.visibility = 'visible';
            from.classList.add('turn-out');
        } else {
            from.classList.add('is-under');
            to.classList.add('turn-in'); to.style.visibility = 'visible';
        }
        setTimeout(() => { to.style.visibility = ''; cur = i; show(cur); busy = false; }, 820);
    }

    /* opening the book */
    const closed = $('#closed'), reader = $('#reader');
    function openBook(instant) {
        const finish = () => {
            closed.classList.add('gone'); reader.hidden = false;
            if (!instant && !reduced) reader.classList.add('enter');
            setTimeout(() => reader.classList.remove('enter'), 1000);
            pagesEl.querySelector('.page.is-current')?.focus?.();
        };
        if (instant || reduced) return finish();
        closed.classList.add('opening');
        setTimeout(finish, 1050);
    }
    $('#openBtn').addEventListener('click', () => { openBook(false); history.replaceState(null, '', '#read'); });
    $('#book3d').addEventListener('click', () => $('#openBtn').click());

    /* keys + swipe */
    addEventListener('keydown', e => {
        if (reader.hidden) { if (e.key === 'Enter' && document.activeElement === document.body) $('#openBtn').click(); return; }
        const ahead = lang() === 'ar' ? 'ArrowLeft' : 'ArrowRight';
        const back = lang() === 'ar' ? 'ArrowRight' : 'ArrowLeft';
        if (e.key === ahead || e.key === 'PageDown') { e.preventDefault(); go(cur + 1); }
        if (e.key === back || e.key === 'PageUp') { e.preventDefault(); go(cur - 1); }
        if (e.key === 'Home') go(0);
        if (e.key === 'End') go(PAGES.length - 1);
    });
    let sx = null, sy = null;
    pagesEl.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; });
    pagesEl.addEventListener('pointerup', e => {
        if (sx === null) return;
        const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
        if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
        const fwd = (dx < 0) !== (lang() === 'ar');
        go(cur + (fwd ? 1 : -1));
    });

    $('#lang').addEventListener('click', () => {
        const next = lang() === 'ar' ? 'en' : 'ar';
        root.lang = next; root.dir = next === 'ar' ? 'rtl' : 'ltr';
        try { localStorage.setItem('ab-lang', next); } catch (e) {}
        render();
    });

    render();
    if (location.hash === '#read') openBook(true);
})();
