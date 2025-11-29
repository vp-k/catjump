import Phaser from 'phaser';
import { SCENE_KEYS, GAME_CONFIG } from '@config/GameConfig';

/**
 * 프리로드 씬 - 모든 게임 에셋 로드
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.PRELOAD });
  }

  preload(): void {
    this.createLoadingBar();
    this.loadAssets();
  }

  private createLoadingBar(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 로딩 텍스트
    const loadingText = this.add.text(width / 2, height / 2 - 50, '로딩 중...', {
      fontSize: '32px',
      color: '#ffffff',
    });
    loadingText.setOrigin(0.5);

    // 프로그레스 바 배경
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2, 320, 30);

    // 프로그레스 바
    const progressBar = this.add.graphics();

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x4ade80, 1);
      progressBar.fillRect(width / 2 - 155, height / 2 + 5, 310 * value, 20);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
  }

  private loadAssets(): void {
    // TODO: 실제 에셋 로드
    // 임시 플레이스홀더 생성
    this.createPlaceholderAssets();
  }

  private createPlaceholderAssets(): void {
    // 고양이 플레이스홀더
    const catGraphics = this.make.graphics({ x: 0, y: 0 });
    catGraphics.fillStyle(0x6b7b8c); // 러시안블루 색상
    catGraphics.fillCircle(40, 30, 25); // 몸통
    catGraphics.fillCircle(40, 10, 15); // 머리
    catGraphics.fillTriangle(30, 0, 35, 10, 28, 10); // 왼쪽 귀
    catGraphics.fillTriangle(50, 0, 45, 10, 52, 10); // 오른쪽 귀
    catGraphics.generateTexture('cat', 80, 60);
    catGraphics.destroy();

    // 캔 플레이스홀더
    const canGraphics = this.make.graphics({ x: 0, y: 0 });
    canGraphics.fillStyle(0xff6b6b);
    canGraphics.fillRoundedRect(0, 0, GAME_CONFIG.CAN_WIDTH, GAME_CONFIG.CAN_HEIGHT, 8);
    canGraphics.fillStyle(0xffffff);
    canGraphics.fillRect(10, 15, GAME_CONFIG.CAN_WIDTH - 20, 10);
    canGraphics.generateTexture('can', GAME_CONFIG.CAN_WIDTH, GAME_CONFIG.CAN_HEIGHT);
    canGraphics.destroy();
  }

  create(): void {
    this.scene.start(SCENE_KEYS.MENU);
  }
}
