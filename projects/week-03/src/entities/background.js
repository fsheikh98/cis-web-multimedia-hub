import * as me from "melonjs";
import { TILE_SIZE } from "../constants.js";

// The static grid: drawn from the loaded wall/lava images. Unlike the
// player and coins, this never changes after the level is parsed, mirroring
// EJS's "we draw the background once, actors get redrawn every frame".
export class LevelBackground extends me.Renderable {
  constructor(level) {
    super(0, 0, level.width * TILE_SIZE, level.height * TILE_SIZE);
    this.level = level;
    this.z = 0;
    this.wallImage = me.loader.getImage("wall");
    this.lavaImage = me.loader.getImage("lava");
  }

  update() {
    return true;
  }

  draw(renderer) {
    const { grid, width, height } = this.level;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = grid[y][x];
        if (cell === "wall" && this.wallImage) {
          renderer.drawImage(this.wallImage, x * TILE_SIZE, y * TILE_SIZE);
        } else if (cell === "lava" && this.lavaImage) {
          renderer.drawImage(this.lavaImage, x * TILE_SIZE, y * TILE_SIZE);
        }
      }
    }
  }
}
