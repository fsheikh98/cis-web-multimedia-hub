// ============================================================================
// Entry point for the melonJS pane (Project Anatomy slide: "main.js -
// initialize game, input + loop + state").
//
// Boot sequence:
//   1. wait for the DOM / device to be ready
//   2. initialize the canvas (me.video.init)
//   3. register the PLAY stage
//   4. preload every asset declared in resources.js, THEN switch to PLAY
//      (this is the async-asset pattern from the "ASYNC ASSETS" slide --
//      the game never tries to draw an image that hasn't finished loading)
// ============================================================================

import * as me from "melonjs";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants.js";
import { resources } from "./resources.js";
import { PlayScreen } from "./stages/play.js";

me.device.onReady(() => {
  const initialized = me.video.init(CANVAS_WIDTH, CANVAS_HEIGHT, {
    parent: "screen",
    scale: "auto",
    scaleMethod: "fit",
    antiAlias: false,
  });

  if (!initialized) {
    alert("Your browser does not support HTML5 canvas.");
    return;
  }

  me.state.set(me.state.PLAY, new PlayScreen());

  me.loader.preload(resources, () => {
    me.state.change(me.state.PLAY);
  });
});
