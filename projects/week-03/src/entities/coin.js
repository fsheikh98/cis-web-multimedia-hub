import * as me from "melonjs";
import { TILE_SIZE } from "../constants.js";

const WOBBLE_SPEED = 8; // radians/sec, same constant EJS ch.16 uses
const WOBBLE_DIST = 3;  // pixels

// Direct port of EJS's Coin actor: sits at a base position and wobbles
// vertically using Math.sin, with a randomized starting phase so coins
// don't all bob in sync.
export class CoinEntity extends me.Renderable {
  constructor(x, y) {
    super(x, y, TILE_SIZE, TILE_SIZE);
    this.name = "coin";
    // top-left anchor to match the raw pixel coordinates used in draw()
    // (melonJS renderables default to a center anchor)
    this.anchorPoint.set(0, 0);
    this.basePos = { x, y };
    this.wobble = Math.random() * Math.PI * 2;
    this.image = me.loader.getImage("coin");
    this.z = 5;
  }

  update(dt) {
    this.wobble += (dt / 1000) * WOBBLE_SPEED;
    this.pos.y = this.basePos.y + Math.sin(this.wobble) * WOBBLE_DIST;
    return true;
  }

  draw(renderer) {
    if (this.image) {
      renderer.drawImage(this.image, this.pos.x, this.pos.y);
    }
  }
}
