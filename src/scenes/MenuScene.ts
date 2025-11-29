import Phaser from 'phaser';
import { SCENE_KEYS } from '@config/GameConfig';

/**
 * 메뉴 씬 - 게임 시작 화면
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.MENU });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // 타이틀
    this.add
      .text(width / 2, height / 3, 'Cat Jump', {
        fontSize: '64px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 3 + 60, 'Tower Stack', {
        fontSize: '32px',
        color: '#ffd700',
      })
      .setOrigin(0.5);

    // 고양이 미리보기
    this.add.image(width / 2, height / 2, 'cat').setScale(2);

    // 시작 버튼
    const startButton = this.add
      .text(width / 2, height / 2 + 150, '탭하여 시작', {
        fontSize: '28px',
        color: '#ffffff',
        backgroundColor: '#4ade80',
        padding: { x: 40, y: 20 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // 버튼 깜빡임 효과
    this.tweens.add({
      targets: startButton,
      alpha: 0.7,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // 클릭/터치로 게임 시작
    this.input.once('pointerdown', () => {
      this.scene.start(SCENE_KEYS.GAME);
    });
  }
}
