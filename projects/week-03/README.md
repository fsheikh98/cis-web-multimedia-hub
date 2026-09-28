# Week 3 — Pac-Man Scratch Port + melonJS Platformer

CIS 3830 · Multimedia & Game Application Programming
Assignment: **Pac-Man Scratch, melonJS and Platformer (100 pts)**

## What this is

One page, two panes, both driven by the same input state:

1. **Pac-Man — Canvas Renderer** (`src/pacman/scratch.js`) — the Scratch-style
   Pac-Man logic ported to plain HTML5 Canvas 2D. No engine: its own
   `requestAnimationFrame` loop, its own grid, its own wall-sensing.
2. **Platformer — melonJS Engine** (`src/main.js` + `src/stages`, `src/entities`) —
   the level/actor/update/display architecture from *Eloquent JavaScript* ch.16
   ("Project: A Platform Game"), re-expressed with melonJS's renderer, input,
   and asset loader.

That side-by-side layout **is** the "Dual Rendering" requirement: the same
kind of actor/level/update/display split, shown twice, once with browser
primitives and once with the engine expressing the same ideas.

## Project layout

```
week-3/
├─ index.html            # hosts both panes, mounts #screen for melonJS
├─ package.json          # npm scripts + the melonjs/vite dependencies
├─ vite.config.js
├─ public/assets/        # wall/player/coin/lava PNGs (served as static files)
└─ src/
   ├─ main.js            # melonJS bootstrap: init → preload → state.change
   ├─ resources.js       # preloader registry (the asset manifest)
   ├─ constants.js       # tile size, level plan string, physics constants
   ├─ pacman/
   │  └─ scratch.js      # vanilla canvas Pac-Man (independent of melonJS)
   ├─ stages/
   │  └─ play.js         # me.Stage: spawns the level's actors
   └─ entities/
      ├─ level-grid.js   # parses the level plan; port of EJS's Level.touches
      ├─ background.js   # static wall/lava tile layer
      ├─ player.js       # gravity, jump, per-axis wall collision
      ├─ coin.js         # wobble + pickup
      ├─ game-manager.js # lava/coin rules, win/lose, respawn
      └─ hud.js           # live x/y/score/status readout on the canvas
```

## Run it locally

```bash
npm install
npm run dev
```

Open the printed local URL (`http://localhost:5173` by default). Both panes
boot automatically; arrow keys (or WASD for the melonJS pane) move both at
once — that's intentional, not a bug, see below.

`npm run build` produces a static `dist/` you can also open directly or
deploy (e.g. GitHub Pages) — it was used to verify this project builds
clean with zero errors before submission.

## Why the two panes share input

Both panes attach their key handlers to `window`, exactly like the
`trackKeys` pattern in *Eloquent JavaScript* ch.16 and the course's Week 3
"KEYBOARD INPUT" slide (persistent `keydown`/`keyup` state, not one-shot
events). Neither pane requires a click to "focus" it first. Pressing an
arrow key updates one shared key-state object that both loops read from —
a deliberate way to show the same input feeding two independent
update/render pipelines side by side.

## Architecture notes (why the melonJS side is built this way)

- **Physics is manual, not melonJS's built-in solver.** `entities/level-grid.js`
  is a near-literal port of EJS's `Level.prototype.touches`: given a
  rectangle in pixels, does it overlap a `"wall"` or `"lava"` grid cell?
  `entities/player.js` resolves horizontal and vertical motion **on separate
  axes** (so landing never blocks a left/right move, and hitting a wall
  never blocks a fall), exactly like `Player.prototype.update` in the
  reading. This was a deliberate scope choice: melonJS's Tiled/physics
  pipeline is powerful but heavier to configure correctly than the course's
  actual learning goal for Week 3, which is *understanding* the
  position → velocity → collision → render loop, not outsourcing it to the
  engine on day one (see the "MELONJS BRIDGE" slide: "learn the browser
  primitives first, then understand what the engine is abstracting for
  you"). melonJS is still doing real work here — rendering, input polling,
  the scene graph/HUD, and asynchronous asset loading.
- **A real spawn-position gotcha, kept in the code on purpose.** The player
  sprite is 1.4 tiles tall. Spawning it at the top-left pixel of its `@`
  tile makes its *bottom* edge already overlap the wall tile directly below
  it before a single frame runs — collision checks then reject every move,
  and the character looks "frozen." This is the exact issue *Eloquent
  JavaScript* solves with `Player.create`'s `pos.plus(new Vec(0, -0.5))`
  offset; `entities/player.js` applies the equivalent fix and explains it
  in a comment. It's a good one to be able to explain out loud for the
  "Studio Challenge" exit check.
- **Async assets.** `src/resources.js` is the preloader registry
  (wall/player/coin/lava PNGs). `src/main.js` calls `me.loader.preload(...)`
  and only calls `me.state.change(me.state.PLAY)` in the completion
  callback — the game literally cannot try to draw an image that hasn't
  arrived yet, which is the point of the "ASYNC ASSETS" slide.

## Editing the level

`src/constants.js` exports `LEVEL_PLAN`, a plain string just like the one in
*Eloquent JavaScript* ch.16 (`.` empty, `#` wall, `+` lava, `@` player start,
`o` coin). Every row must be the same length. Change the layout, re-run
`npm run dev`, and `level-grid.js` reparses it automatically — no other file
needs to change.

## Submitting

1. Copy this whole `week-3/` folder into your GitHub repository at the path
   `/week-3` (so the assignment's required path shows up in your repo).
2. `git add week-3 && git commit -m "Week 3: Pac-Man canvas port + melonJS platformer" && git push`
3. Submit the commit/repo link on Canvas.

### Recording the required screencast

The assignment asks for an MP4 showing the terminal packaging and the app
running — that has to be recorded on your own machine (screen recording
isn't something that can be produced from here). A tight script that covers
every rubric line:

1. **Clean start** — in a terminal, `cd` into `week-3/` and run
   `rm -rf node_modules dist` on camera so it's visibly a from-scratch run.
2. **Install** — run `npm install`, let it finish on screen (covers "Server
   Setup: clean node dependencies").
3. **Dev server** — run `npm run dev`, show the "Local: http://localhost:5173"
   line in the terminal.
4. **Browser** — open that URL. Show both panes rendering, then:
   - point out the console has no red errors (DevTools → Console),
   - move the Pac-Man pane and read its live score/coordinates out loud,
   - move/jump the platformer player, collect a coin, and touch the lava so
     the status readout flips to `lost` and the player respawns.
5. **Narrate one frame** (the Week 3 "Studio Challenge"): pause and say, out
   loud, which key is held, what the coordinates/velocity are, which
   collision rule applies, and what just changed on screen. This is the
   fastest way to demonstrate the "explain the input → update → render
   path" line in the submission-readiness checklist.
6. Stop recording, export as MP4, and submit it alongside the repo link.

## Known limits / good next steps

- The level is intentionally small; edit `LEVEL_PLAN` to add more rooms,
  or additional actor types (EJS ch.16's moving lava — `=`, `|`, `v` — is a
  natural next step and would reuse the same `touches()` helper).
- No sound yet; `resources.js` supports `{ name, type: "audio", src }`
  entries the same way it does images if you want to add SFX.
- The exercises at the end of EJS ch.16 (lives, pause/resume, a monster you
  defeat by jumping on it) all map cleanly onto `game-manager.js` and a new
  `entities/monster.js` if you want to extend this further.
