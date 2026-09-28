import * as me from "melonjs";

// Renders the "which coordinates / which state" readout mentioned in the
// Week 3 "STUDIO CHALLENGE" slide, directly on the melonJS canvas so it can
// be compared frame-for-frame against the Pac-Man canvas pane next to it.
// Subclassing me.Text (instead of hand-rolling renderer calls in a custom
// Renderable) keeps this on melonJS's own supported text-rendering path,
// which works the same under both the Canvas2D and WebGL renderers.
export class Hud extends me.Text {
  constructor(player, gameManager) {
    super(6, 6, {
      font: "monospace",
      size: 11,
      fillStyle: "#7CFC9A",
      textAlign: "left",
      textBaseline: "top",
    });
    this.player = player;
    this.gameManager = gameManager;
    this.floating = true; // pinned to the screen, not the level/camera
    this.z = 100;
  }

  update(dt) {
    const { x, y } = this.player.pos;
    this.setText(
      `x:${x.toFixed(1)} y:${y.toFixed(1)}\n` +
      `score:${this.gameManager.score} status:${this.gameManager.status}`
    );
    return super.update(dt) || true;
  }
}
