import Phaser from 'phaser';
import { SCENE_KEYS } from '@config/GameConfig';

/**
 * 부트 씬 - 최소한의 에셋 로드 후 PreloadScene으로 전환
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.BOOT });
  }

  preload(): void {
    // 로딩 화면에 필요한 최소 에셋만 로드
    // TODO: 로딩 바 배경, 로고 등
  }

  create(): void {
    this.scene.start(SCENE_KEYS.PRELOAD);
  }
}
