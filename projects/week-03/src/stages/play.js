import * as me from "melonjs";
import { LEVEL_PLAN } from "../constants.js";
import { parseLevel } from "../entities/level-grid.js";
import { LevelBackground } from "../entities/background.js";
import { PlayerEntity } from "../entities/player.js";
import { CoinEntity } from "../entities/coin.js";
import { GameManager } from "../entities/game-manager.js";
import { Hud } from "../entities/hud.js";

const KEY_BINDINGS = [
  [me.input.KEY.LEFT, "left"],
  [me.input.KEY.RIGHT, "right"],
  [me.input.KEY.UP, "up"],
  [me.input.KEY.A, "left"],
  [me.input.KEY.D, "right"],
  [me.input.KEY.W, "up"],
];

export class PlayScreen extends me.Stage {
  onResetEvent() {
    KEY_BINDINGS.forEach(([code, action]) => me.input.bindKey(code, action));

    const level = parseLevel(LEVEL_PLAN);
    const player = new PlayerEntity(level.playerStart.x, level.playerStart.y, level);
    const gameManager = new GameManager(level, player);

    me.game.world.addChild(new LevelBackground(level), 0);
    level.coins.forEach((c) => me.game.world.addChild(new CoinEntity(c.x, c.y), 5));
    me.game.world.addChild(player, 10);
    me.game.world.addChild(gameManager, 20);
    me.game.world.addChild(new Hud(player, gameManager), 30);
  }

  onDestroyEvent() {
    KEY_BINDINGS.forEach(([, action]) => me.input.unbindKey(action));
  }
}
