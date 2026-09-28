import * as me from "melonjs";
import { TILE_SIZE, PLAYER_X_SPEED, GRAVITY, JUMP_SPEED } from "../constants.js";
import { touches } from "./level-grid.js";

const PLAYER_HEIGHT = TILE_SIZE * 1.4;

// Direct port of EJS ch.16's Player.prototype.update: horizontal and
// vertical motion are resolved on separate axes (so hitting the floor never
// blocks a left/right move, and hitting a wall never blocks a fall/jump),
// using the same "propose a move, cancel it if it touches a wall" collision
// strategy as the reading, now driven by melonJS's input + render loop
// instead of the DOM key handlers / requestAnimationFrame wrapper.
export class PlayerEntity extends me.Renderable {
  constructor(x, y, level) {
    // EJS ch.16 gotcha: the player is 1.4 tiles tall, but the level grid
    // gives us the TOP-LEFT of a 1-tile spawn cell. Spawning at that y as-is
    // would let the player's bottom edge poke 0.4 tiles into the wall row
    // below on frame 0, so `touches(..., "wall")` is already true before a
    // single key is pressed and every subsequent move gets rejected. Shift
    // the spawn up so the player's bottom aligns with the bottom of the
    // spawn tile instead (exactly EJS's `pos.plus(new Vec(0, -0.5))` fix,
    // scaled for our own player height).
    const spawnY = y - (PLAYER_HEIGHT - TILE_SIZE);
    super(x, spawnY, TILE_SIZE, PLAYER_HEIGHT);
    this.name = "player";
    this.level = level;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.image = me.loader.getImage("player");
    this.z = 10;
  }

  update(dt) {
    const dtSec = Math.min(dt, 100) / 1000;

    this.vx = 0;
    if (me.input.isKeyPressed("left")) this.vx = -PLAYER_X_SPEED * TILE_SIZE;
    if (me.input.isKeyPressed("right")) this.vx = PLAYER_X_SPEED * TILE_SIZE;

    // --- horizontal axis ---
    const movedX = this.pos.x + this.vx * dtSec;
    if (!touches(this.level, movedX, this.pos.y, this.width, this.height, "wall")) {
      this.pos.x = movedX;
    }

    // --- vertical axis (gravity, then jump/land resolution) ---
    this.vy += GRAVITY * TILE_SIZE * 10 * dtSec;
    const movedY = this.pos.y + this.vy * dtSec;
    if (!touches(this.level, this.pos.x, movedY, this.width, this.height, "wall")) {
      this.pos.y = movedY;
      this.onGround = false;
    } else if (me.input.isKeyPressed("up") && this.vy > 0) {
      this.vy = -JUMP_SPEED * TILE_SIZE;
    } else {
      this.vy = 0;
      this.onGround = true;
    }

    return true;
  }

  draw(renderer) {
    if (this.image) {
      renderer.drawImage(this.image, this.pos.x, this.pos.y, this.width, this.height);
    }
  }

  resetTo(x, y) {
    this.pos.x = x;
    this.pos.y = y;
    this.vx = 0;
    this.vy = 0;
  }
}
