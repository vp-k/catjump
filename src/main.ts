import Phaser from 'phaser';
import { GAME_CONFIG } from '@config/GameConfig';
import { BootScene } from '@scenes/BootScene';
import { PreloadScene } from '@scenes/PreloadScene';
import { MenuScene } from '@scenes/MenuScene';
import { GameScene } from '@scenes/GameScene';
import { GameOverScene } from '@scenes/GameOverScene';
import { ShopScene } from '@scenes/ShopScene';
import { LeaderboardScene } from '@scenes/LeaderboardScene';
import { ShareService } from '@services/ShareService';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_CONFIG.WIDTH,
  height: GAME_CONFIG.HEIGHT,
  backgroundColor: GAME_CONFIG.BACKGROUND_COLOR,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: GAME_CONFIG.GRAVITY },
      debug: import.meta.env.DEV,
    },
  },
  scene: [BootScene, PreloadScene, MenuScene, GameScene, GameOverScene, ShopScene, LeaderboardScene],
};

const game = new Phaser.Game(config);

// ShareService에 게임 인스턴스 설정 (스크린샷 캡처용)
ShareService.setGameInstance(game);
