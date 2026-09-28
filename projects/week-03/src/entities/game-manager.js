import * as me from "melonjs";
import { touches } from "./level-grid.js";

// Centralizes the rules that, in EJS ch.16, live on State.prototype.update:
// check the player against lava, check the player against every coin, and
// decide whether the run has been lost or won. Kept as one invisible
// renderable so the win/lose rule lives in exactly one place instead of
// being duplicated inside each actor.
export class GameManager extends me.Renderable {
  constructor(level, player) {
    super(0, 0, 0, 0);
    this.level = level;
    this.player = player;
    this.status = "playing";
    this.score = 0;
    this.startPos = { x: player.pos.x, y: player.pos.y };
    this.totalCoins = level.coins.length;
  }

  update() {
    if (this.status === "playing") {
      if (touches(this.level, this.player.pos.x, this.player.pos.y, this.player.width, this.player.height, "lava")) {
        this.status = "lost";
        this.respawn();
      } else {
        const coins = me.game.world.getChildByName("coin");
        for (const coin of coins) {
          if (this.overlaps(this.player, coin)) {
            me.game.world.removeChild(coin);
            this.score += 10;
          }
        }
        if (this.totalCoins > 0 && me.game.world.getChildByName("coin").length === 0) {
          this.status = "won";
        }
      }
    }
    return false;
  }

  overlaps(a, b) {
    return (
      a.pos.x < b.pos.x + b.width &&
      a.pos.x + a.width > b.pos.x &&
      a.pos.y < b.pos.y + b.height &&
      a.pos.y + a.height > b.pos.y
    );
  }

  respawn() {
    this.player.resetTo(this.startPos.x, this.startPos.y);
    // brief pause, then let play continue (mirrors EJS's runLevel "ending" delay)
    setTimeout(() => {
      this.status = "playing";
    }, 600);
  }

  draw() {
    // nothing to draw: this actor only tracks rules/state
  }
}
