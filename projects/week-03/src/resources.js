// ============================================================================
// Preloader Registry
//
// Every image melonJS needs to draw a frame must be declared here and handed
// to me.loader.preload() before the game state starts. This is the "ASYNC
// ASSETS" slide made concrete: main.js awaits this list resolving before it
// ever calls me.state.change().
// ============================================================================

export const resources = [
  { name: "wall", type: "image", src: "assets/wall.png" },
  { name: "player", type: "image", src: "assets/player.png" },
  { name: "coin", type: "image", src: "assets/coin.png" },
  { name: "lava", type: "image", src: "assets/lava.png" },
];
