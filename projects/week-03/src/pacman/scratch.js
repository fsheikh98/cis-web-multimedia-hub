// ============================================================================
// Pac-Man "Scratch Port" — plain Canvas 2D renderer, no game engine.
//
// This file is the direct browser-native translation of the block-based
// Scratch prototype: a "forever loop" becomes requestAnimationFrame, a
// "when key pressed" block becomes persistent keydown/keyup state, and
// "touching wall?" becomes a grid lookup against the maze array. See the
// Week 3 slide "PORTING STRATEGY" for the full Scratch -> browser mapping.
//
// Loop shape (matches the course's input -> update -> render pipeline):
//   1. INPUT   - read which arrow keys are currently held
//   2. UPDATE  - advance Pac-Man / ghost on a fixed step timer, resolve
//                wall collisions, collect dots, check win/lose
//   3. RENDER  - redraw the maze + actors from the current state only
// ============================================================================

const TILE = 16; // every grid cell is 16x16 px, same unit used by melonJS pane

// 1 = wall, 0 = dot (uncollected), 2 = empty space (collected / walkway)
const MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,2,1,2,1,1,1,0,1,1,1,1],
  [1,1,1,1,0,1,2,2,2,2,2,2,2,1,0,1,1,1,1],
  [1,1,1,1,0,1,2,1,1,2,1,1,2,1,0,1,1,1,1],
  [2,2,2,2,0,2,2,1,2,2,2,1,2,2,0,2,2,2,2],
  [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
  [1,1,1,1,0,1,2,2,2,2,2,2,2,1,0,1,1,1,1],
  [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,1,0,0,0,0,0,2,0,0,0,0,0,1,0,0,1],
  [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const COLS = MAZE[0].length;
const ROWS = MAZE.length;
const HUD_HEIGHT = 30;

// --- persistent game state (mutated in UPDATE, read in RENDER) -----------
let score = 0;
let gameOver = false;
let gameWon = false;

const pacman = { tileX: 9, tileY: 16, dirX: 0, dirY: 0, moveTimer: 0 };
const ghost = { tileX: 9, tileY: 8, moveTimer: 0 };

const MOVE_INTERVAL_PACMAN = 140; // ms per tile step
const MOVE_INTERVAL_GHOST = 220;  // slower than the player on purpose

// --- INPUT: keydown/keyup persist into a lookup object, not one-shot ------
const keys = Object.create(null);
window.addEventListener("keydown", (e) => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
    keys[e.key] = true;
    e.preventDefault();
  }
});
window.addEventListener("keyup", (e) => {
  if (e.key in keys) keys[e.key] = false;
});

// --- wall sensing: is a given grid cell solid? ----------------------------
// Out-of-range cells count as walls so the player/ghost can never index
// outside the MAZE array or walk off the edge of the level.
function isWall(tileX, tileY) {
  if (tileX < 0 || tileX >= COLS || tileY < 0 || tileY >= ROWS) return true;
  return MAZE[tileY][tileX] === 1;
}

function checkWinCondition() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (MAZE[r][c] === 0) return; // a dot is still uncollected
    }
  }
  gameWon = true;
}

// Greedy chase: from the ghost's four neighboring tiles, pick whichever
// non-wall tile is Euclidean-closest to Pac-Man's current tile.
function moveGhostTowardPacman() {
  const directions = [
    { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }
  ];
  let bestDir = null;
  let shortestDistance = Infinity;

  for (const dir of directions) {
    const checkX = ghost.tileX + dir.x;
    const checkY = ghost.tileY + dir.y;
    if (isWall(checkX, checkY)) continue;
    const dist = Math.hypot(checkX - pacman.tileX, checkY - pacman.tileY);
    if (dist < shortestDistance) {
      shortestDistance = dist;
      bestDir = dir;
    }
  }
  if (bestDir) {
    ghost.tileX += bestDir.x;
    ghost.tileY += bestDir.y;
  }
}

// --- UPDATE: called every animation frame with the elapsed ms (dt) -------
function update(dt) {
  if (gameOver || gameWon) return;

  if (keys.ArrowLeft) { pacman.dirX = -1; pacman.dirY = 0; }
  if (keys.ArrowRight) { pacman.dirX = 1; pacman.dirY = 0; }
  if (keys.ArrowUp) { pacman.dirX = 0; pacman.dirY = -1; }
  if (keys.ArrowDown) { pacman.dirX = 0; pacman.dirY = 1; }

  pacman.moveTimer += dt;
  if (pacman.moveTimer > MOVE_INTERVAL_PACMAN) {
    pacman.moveTimer = 0;
    const nextX = pacman.tileX + pacman.dirX;
    const nextY = pacman.tileY + pacman.dirY;

    if (!isWall(nextX, nextY)) {
      pacman.tileX = nextX;
      pacman.tileY = nextY;
      if (MAZE[pacman.tileY][pacman.tileX] === 0) {
        MAZE[pacman.tileY][pacman.tileX] = 2;
        score += 10;
        checkWinCondition();
      }
    }
  }

  ghost.moveTimer += dt;
  if (ghost.moveTimer > MOVE_INTERVAL_GHOST) {
    ghost.moveTimer = 0;
    moveGhostTowardPacman();
  }

  if (ghost.tileX === pacman.tileX && ghost.tileY === pacman.tileY) {
    gameOver = true;
  }
}

// --- RENDER: pure function of current state, never mutates it ------------
function render(ctx) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = MAZE[r][c];
      if (cell === 1) {
        ctx.fillStyle = "#1919A6";
        ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
      } else if (cell === 0) {
        ctx.fillStyle = "#FFB897";
        ctx.fillRect(c * TILE + 6, r * TILE + 6, 4, 4);
      }
    }
  }

  ctx.fillStyle = "#FFFF00";
  ctx.beginPath();
  ctx.arc(pacman.tileX * TILE + TILE / 2, pacman.tileY * TILE + TILE / 2, TILE / 2 - 1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#FF3B3B";
  ctx.fillRect(ghost.tileX * TILE + 1, ghost.tileY * TILE + 1, TILE - 2, TILE - 2);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "14px monospace";
  ctx.fillText(`SCORE: ${score}`, 8, ROWS * TILE + 20);

  if (gameOver) {
    ctx.fillStyle = "#FF5555";
    ctx.font = "22px monospace";
    ctx.fillText("GAME OVER", 70, (ROWS * TILE) / 2);
  } else if (gameWon) {
    ctx.fillStyle = "#55FF88";
    ctx.font = "22px monospace";
    ctx.fillText("YOU WIN!", 85, (ROWS * TILE) / 2);
  }
}

function boot() {
  const canvas = document.getElementById("pacman-canvas");
  const coordsEl = document.getElementById("pacman-coords");
  canvas.width = COLS * TILE;
  canvas.height = ROWS * TILE + HUD_HEIGHT;
  canvas.tabIndex = 0; // let the canvas receive focus/keyboard events
  const ctx = canvas.getContext("2d");

  let lastTime = null;
  function frame(time) {
    if (lastTime != null) {
      const dt = Math.min(time - lastTime, 100); // clamp huge tab-hidden gaps
      update(dt);
    }
    lastTime = time;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    render(ctx);

    if (coordsEl) {
      coordsEl.textContent =
        `pacman  x:${pacman.tileX}  y:${pacman.tileY}  dir:(${pacman.dirX},${pacman.dirY})\n` +
        `ghost   x:${ghost.tileX}  y:${ghost.tileY}\n` +
        `score:${score}  status:${gameOver ? "lost" : gameWon ? "won" : "playing"}`;
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

boot();
