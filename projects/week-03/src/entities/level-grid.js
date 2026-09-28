// Direct port of Eloquent JavaScript ch.16's Level class + Level.prototype.touches.
// Kept independent of melonJS on purpose: this module only knows about plain
// characters, grids, and rectangles, so it could be reused by any renderer
// (this is the same "level data should remain stable" idea from the Week 3
// slide "READING MODEL").

import { TILE_SIZE } from "../constants.js";

const BACKGROUND_CHARS = { ".": "empty", "#": "wall", "+": "lava" };

export function parseLevel(plan) {
  const rows = plan.split("\n").map((line) => [...line]);
  const width = rows[0].length;
  const height = rows.length;
  const grid = [];
  const coins = [];
  let playerStart = { x: TILE_SIZE, y: TILE_SIZE };

  rows.forEach((row, y) => {
    const gridRow = [];
    row.forEach((ch, x) => {
      if (ch === "@") {
        playerStart = { x: x * TILE_SIZE, y: y * TILE_SIZE };
        gridRow.push("empty");
      } else if (ch === "o") {
        coins.push({ x: x * TILE_SIZE, y: y * TILE_SIZE });
        gridRow.push("empty");
      } else {
        gridRow.push(BACKGROUND_CHARS[ch] || "empty");
      }
    });
    grid.push(gridRow);
  });

  return { grid, coins, playerStart, width, height };
}

// Does the rectangle (x, y, w, h), in pixels, overlap a grid cell of the
// given background type ("wall" or "lava")? Cells outside the level count
// as walls, exactly like the EJS version, so actors can never leave the
// level or index outside the grid array.
export function touches(level, x, y, w, h, type) {
  const xStart = Math.floor(x / TILE_SIZE);
  const xEnd = Math.ceil((x + w) / TILE_SIZE);
  const yStart = Math.floor(y / TILE_SIZE);
  const yEnd = Math.ceil((y + h) / TILE_SIZE);

  for (let ty = yStart; ty < yEnd; ty++) {
    for (let tx = xStart; tx < xEnd; tx++) {
      const outside = tx < 0 || tx >= level.width || ty < 0 || ty >= level.height;
      const here = outside ? "wall" : level.grid[ty][tx];
      if (here === type) return true;
    }
  }
  return false;
}
