// Shared config for the melonJS platformer pane. Kept separate from the
// Pac-Man canvas pane on purpose (Week 3 "Separation matters" slide) --
// changing tile size or level layout here should never touch the
// Pac-Man canvas code, and vice versa.

export const TILE_SIZE = 16;

// Level plan string, directly modeled on Eloquent JavaScript ch.16
// ("Reading a level"): each character is either a background tile or an
// actor spawn point.
//   . = empty   # = wall   + = lava   @ = player start   o = coin
export const LEVEL_PLAN = [
  "............................",
  "..#......................#..",
  "..#..........o...........#..",
  "..#......#########.......#..",
  "..#.@.....................#.",
  "..#####...................#.",
  "......#..o...o...o...o...#..",
  "......#...................#.",
  "......############+++++###..",
  "............................",
].join("\n");

export const CANVAS_WIDTH = LEVEL_PLAN.split("\n")[0].length * TILE_SIZE;
export const CANVAS_HEIGHT = LEVEL_PLAN.split("\n").length * TILE_SIZE;

export const PLAYER_X_SPEED = 4.5; // tiles/sec-ish, tuned against gravity below
export const GRAVITY = 0.4;
export const JUMP_SPEED = 8.5;
