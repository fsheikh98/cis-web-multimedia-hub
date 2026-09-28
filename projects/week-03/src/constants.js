// Shared config for the melonJS platformer pane. Kept separate from the
// Pac-Man canvas code on purpose -- changing the tile size or the level
// layout here should never touch the Pac-Man side, and vice versa.

export const TILE_SIZE = 16;

// The level plan, same idea as Eloquent JavaScript ch.16: each character is
// either a background tile or an actor spawn point.
//   . = empty   # = wall   + = lava   @ = player start   o = coin
//
// Floor is one solid row (row 8) with a 4-tile lava gap in the middle -- you
// can jump it, or walk straight in on purpose to see the death/respawn.
// Coins sit right on the floor at head height so you just walk into them;
// two are before the gap, two are after it. Row 9 is a full-width floor
// underneath everything so nothing ever falls forever.
export const LEVEL_PLAN = [
  "............................",
  "............................",
  "............................",
  "............................",
  "............................",
  "............................",
  "............................",
  "..@..o...o........o...o.....",
  "############++++############",
  "############################",
].join("\n");

export const CANVAS_WIDTH = LEVEL_PLAN.split("\n")[0].length * TILE_SIZE;
export const CANVAS_HEIGHT = LEVEL_PLAN.split("\n").length * TILE_SIZE;

export const PLAYER_X_SPEED = 4.5; // tiles/sec-ish, tuned against gravity below
export const GRAVITY = 0.4;
export const JUMP_SPEED = 8.5;
