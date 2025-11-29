import Phaser from 'phaser';
import { SCENE_KEYS } from '@config/GameConfig';

interface GameOverData {
  score: number;
  floor: number;
}

/**
 * 게임 오버 씬
 */
export class GameOverScene extends Phaser.Scene {
  private score: number = 0;
  private floor: number = 0;

  constructor() {
    super({ key: SCENE_KEYS.GAME_OVER });
  }

  init(data: GameOverData): void {
    this.score = data.score ?? 0;
    this.floor = data.floor ?? 0;
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // 게임 오버 텍스트
    this.add
      .text(width / 2, height / 3, '게임 오버', {
        fontSize: '48px',
        color: '#ff6b6b',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // 결과 표시
    this.add
      .text(width / 2, height / 2 - 40, `${this.floor}층 도달!`, {
        fontSize: '36px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 20, `점수: ${this.score}`, {
        fontSize: '28px',
        color: '#ffd700',
      })
      .setOrigin(0.5);

    // 다시 시작 버튼
    const retryButton = this.add
      .text(width / 2, height / 2 + 120, '다시 하기', {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: '#4ade80',
        padding: { x: 30, y: 15 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    retryButton.on('pointerdown', () => {
      this.scene.start(SCENE_KEYS.GAME);
    });

    // 메뉴 버튼
    const menuButton = this.add
      .text(width / 2, height / 2 + 190, '메뉴로', {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: '#6b7280',
        padding: { x: 30, y: 15 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    menuButton.on('pointerdown', () => {
      this.scene.start(SCENE_KEYS.MENU);
    });
  }
}
