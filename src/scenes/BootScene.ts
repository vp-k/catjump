import Phaser from 'phaser';
import { SCENE_KEYS } from '@config/GameConfig';
import { firebase } from '@utils/Firebase';
import { SaveManager } from '@managers/SaveManager';

/**
 * 부트 씬 - Firebase 초기화 및 사용자 인증 후 PreloadScene으로 전환
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.BOOT });
  }

  preload(): void {
    // 로딩 화면에 필요한 최소 에셋만 로드
  }

  async create(): Promise<void> {
    const { width, height } = this.cameras.main;

    // 초기화 상태 표시
    const statusText = this.add
      .text(width / 2, height / 2, '초기화 중...', {
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    try {
      // 1. Firebase 초기화
      statusText.setText('서버 연결 중...');
      const firebaseInitialized = await firebase.initialize();

      // 2. 익명 인증 (Firebase가 설정된 경우)
      if (firebaseInitialized) {
        statusText.setText('로그인 중...');
        await firebase.signInAnonymous();
      }

      // 3. SaveManager 초기화 (로컬 + 클라우드 동기화)
      statusText.setText('데이터 로드 중...');
      await SaveManager.initialize();

      // 4. 다음 씬으로 전환
      statusText.destroy();
      this.scene.start(SCENE_KEYS.PRELOAD);
    } catch (error) {
      console.error('[BootScene] 초기화 실패:', error);
      statusText.setText('오프라인 모드로 시작합니다...');

      // 오프라인 모드로 진행
      this.time.delayedCall(1000, () => {
        statusText.destroy();
        this.scene.start(SCENE_KEYS.PRELOAD);
      });
    }
  }
}
