# Week 3 — Pac-Man Canvas Port + melonJS Platformer

Two things on one page:

1. A canvas port of the Pac-Man logic — no engine, just `<canvas>` and plain JS.
2. A small platformer built with melonJS, based on the Eloquent JavaScript ch.16 walkthrough.

## Running it

```
npm install
npm run dev
```

Open the local URL it prints. Both panes load automatically and respond to arrow keys / WASD.

`npm run build` produces a production build in `dist/`.

## Project structure

```
week-03/
├─ index.html
├─ package.json
├─ vite.config.js
├─ public/assets/       # tile images
└─ src/
   ├─ main.js           # boots melonJS, preloads assets, starts the level
   ├─ resources.js      # asset list for the preloader
   ├─ constants.js      # tile size, level layout, physics numbers
   ├─ pacman/scratch.js # standalone canvas Pac-Man
   ├─ stages/play.js    # melonJS stage, spawns everything
   └─ entities/         # player, coin, wall/lava background, HUD, game rules
```

## How it works

- Pac-Man moves on a grid: about every 140ms it checks whether the next tile is a
  wall before stepping into it. The ghost does a simple "which open neighbor tile
  is closest to Pac-Man" check every 220ms.
- The platformer uses pixel positions instead of tiles, so collision is a small
  rectangle-vs-grid check — floor/ceil the edges of the player's box to see which
  tiles it overlaps. Movement is split into a horizontal pass and a vertical pass
  so landing doesn't block sideways movement.
- Gotcha I ran into: the player sprite is taller than one tile, so spawning it at
  the top of its tile made its feet poke into the tile below and it looked frozen.
  Fixed by shifting the spawn point up so the bottom of the sprite lines up with
  the bottom of the tile.
- Wall/player/coin/lava images are loaded through melonJS's preloader before the
  level starts, so nothing tries to draw before it's ready.

## Editing the level

The layout lives in `constants.js` as a plain string (`.` empty, `#` wall,
`+` lava, `@` player start, `o` coin). Rows need to be the same length.

## Known limitations

- Level is small, could add more rooms or moving lava later.
- No sound yet.
- Ghost AI just grabs the nearest open tile each step — no real pathfinding.

## Screencast notes

Recorded: `npm install`, `npm run dev`, both panes running with no console
errors, then walked around, collected a coin, and touched the lava.
