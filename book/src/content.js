/* The words and colours of the book, in English and Arabic. Art for each page: /book/art/<id>.webp */
export const UI = {
    brand: { en: 'Abdulrahman', ar: 'عبد الرحمن' },
    name: { en: 'Abdulrahman Amoudi', ar: 'عبد الرحمن العمودي' },
    coverLines: { en: ['Meet', 'Abdulrahman.'], ar: ['تعرّف على', 'عبد الرحمن.'] },
    coverSub: { en: 'About me & what I do', ar: 'عنّي وعن شغلي' },
    'cover.sub': { en: 'About me & what I do', ar: 'عنّي وعن شغلي' },
    open: { en: 'Open the book', ar: 'افتح الكتاب' },
    loading: { en: 'Preparing the book…', ar: 'عم بجهّز الكتاب…' },
    hint: { en: 'Drag a page, use the arrow keys, or click either side.', ar: 'اسحب الصفحة، أو استخدم الأسهم، أو اكبس على أي جهة.' },
    'foot.by': { en: 'Meet Abdulrahman, a book by Abdulrahman Amoudi', ar: 'تعرّف على عبد الرحمن، كتاب من عبد الرحمن العمودي' },
    'foot.where': { en: 'Amman, Jordan', ar: 'عمّان، الأردن' },
    prev: { en: 'Previous page', ar: 'الصفحة السابقة' },
    next: { en: 'Next page', ar: 'الصفحة التالية' },
    page: { en: 'Page', ar: 'صفحة' },
    docTitle: { en: 'Meet Abdulrahman: websites, AI and video from Amman', ar: 'تعرّف على عبد الرحمن: مواقع وذكاء اصطناعي وفيديو من عمّان' },
};

export const PAGES = [
        {
            id: '01-hello', bg: '#e9b7a3', ink: '#3a211a', side: 'right', focus: '25% 50%',
            title: { en: 'I’m Abdulrahman.', ar: 'أنا عبد الرحمن.' },
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
            links: [{ en: 'Visit Wajha', ar: 'زور واجهة', href: 'https://wajha-chi.vercel.app', tone: 'terracotta', icon: 'web' }],
        },
        {
            id: '06-motion', bg: '#5b3f74', ink: '#f6effa', side: 'left', focus: '78% 50%',
            title: { en: 'Stories that move.', ar: 'قصص بتتحرك.' },
            body: { en: 'Short reels written, animated and sound-designed by hand. A pixel detective for Vibe Todos, a loyalty reel for Dumbbell Gym.', ar: 'ريلز قصيرة بكتبها وبحرّكها وبعمل صوتها بإيدي. محقق بكسل لـ Vibe Todos، وريل الالتزام لدمبل جيم.' },
            links: [{ en: 'Watch the reels', ar: 'شوف الريلز', href: 'https://www.instagram.com/wajiha.jo/', tone: 'teal', icon: 'reel' }],
        },
        {
            id: '07-work', bg: '#f0d58c', ink: '#3a2d0c', side: 'right', focus: '22% 50%',
            title: { en: 'Things I’ve built.', ar: 'أشياء بنيتها.' },
            body: { en: 'A study app people use every day, my studio’s site and CRM, an ordering site for a café, a gym’s members system, and a pixel new tab for Chrome.', ar: 'تطبيق دراسة الناس بتستخدمه كل يوم، موقع ونظام الاستوديو تبعي، موقع طلبات لكافيه، نظام مشتركين لجيم، وصفحة تاب جديد بكسل لكروم.' },
            links: [{ en: 'See Wajha', ar: 'شوف واجهة', href: 'https://wajha-chi.vercel.app', tone: 'terracotta', icon: 'web' }, { en: 'Vibe Todos', ar: 'Vibe Todos', href: 'https://to-do-virid-beta.vercel.app', tone: 'sage' }],
        },
        {
            id: '08-hello-again', bg: '#efe6d4', ink: '#2b241b', side: 'left', focus: '78% 50%',
            title: { en: 'Got something to build?', ar: 'عندك إشي بدك تبنيه؟' },
            body: { en: 'A website, a system for your shop, a reel, or a network that needs sorting out. Tell me what it’s for.', ar: 'موقع، نظام لمحلّك، ريل، أو شبكة بدها ترتيب. احكيلي شو بدك.' },
            links: [{ en: 'WhatsApp me', ar: 'راسلني واتساب', href: 'https://wa.me/962781912998', tone: 'forest', icon: 'chat' }, { en: 'Instagram', ar: 'إنستغرام', href: 'https://www.instagram.com/abdalrahman__amoudi/', tone: 'sage' }],
        },
    ];
