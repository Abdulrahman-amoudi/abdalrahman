# Abdalrahman's Room

My portfolio, as a game. It's a pixel-art version of my room in Amman: walk around, use things, and each object tells you about something I do. The rack is networking, the monitor is video editing, the whiteboard is AI, the PC is web, the arcade machines are projects, and the corner terminal is this GitHub.

Live: https://abdalrahman.vercel.app

- Everything is drawn in code on a 480×300 canvas (no image files). The character and the furniture are hand-placed pixels with a shading pass on top.
- Lighting is a low-res light map multiplied over the room, so lamps, screens and the window actually light things.
- Sound is synthesised with the Web Audio API: wooden footsteps, birds and street noise by day, crickets at night.
- English and Arabic.

Controls: WASD or arrows to walk, Shift to run, E to use, or just click. On a phone, hold and drag to walk.

`src/` has the readable source; `index.html` is the built, single-file site.
