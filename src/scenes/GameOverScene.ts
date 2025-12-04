import Phaser from 'phaser';
import { SCENE_KEYS } from '@config/GameConfig';
import { ShareService, ShareData } from '@services/ShareService';
import { AudioManager } from '@managers/AudioManager';
import { LeaderboardService } from '@services/LeaderboardService';

interface GameOverData {
  score: number;
  floor: number;
  isNewRecord?: boolean;
}

/**
 * 게임 오버 씬
 */
export class GameOverScene extends Phaser.Scene {
  private score: number = 0;
  private floor: number = 0;
  private isNewRecord: boolean = false;
  private shareNotice: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: SCENE_KEYS.GAME_OVER });
  }

  init(data: GameOverData): void {
    this.score = data.score ?? 0;
    this.floor = data.floor ?? 0;
    this.isNewRecord = data.isNewRecord ?? false;
  }

  create(): void {
    const { width, height } = this.cameras.main;

    AudioManager.setScene(this);

    // 배경
    this.createBackground();

    // 신기록 표시
    if (this.isNewRecord) {
      this.add
        .text(width / 2, height / 4 - 30, '🎉 신기록!', {
          fontSize: '32px',
          color: '#ffd700',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
    }

    // 게임 오버 텍스트
    this.add
      .text(width / 2, height / 4 + 20, '게임 오버', {
        fontSize: '48px',
        color: '#ff6b6b',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // 결과 표시
    this.add
      .text(width / 2, height / 2 - 80, `${this.floor}층 도달!`, {
        fontSize: '36px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 30, `점수: ${LeaderboardService.formatScore(this.score)}`, {
        fontSize: '28px',
        color: '#ffd700',
      })
      .setOrigin(0.5);

    // 공유 버튼 (보상 가능하면 강조)
    const canGetReward = ShareService.canGetShareReward();
    const shareLabel = canGetReward ? '공유 (+50🪙)' : '공유하기';
    const shareBgColor = canGetReward ? '#f472b6' : '#8b5cf6';

    const shareButton = this.add
      .text(width / 2, height / 2 + 30, shareLabel, {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: shareBgColor,
        padding: { x: 25, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    shareButton.on('pointerdown', () => {
      AudioManager.playButtonClick();
      this.handleShare();
    });

    // 공유 알림 텍스트 (결과 표시용)
    this.shareNotice = this.add
      .text(width / 2, height / 2 + 80, '', {
        fontSize: '14px',
        color: '#4ade80',
      })
      .setOrigin(0.5);

    // 다시 시작 버튼
    const retryButton = this.add
      .text(width / 2, height / 2 + 130, '다시 하기', {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: '#4ade80',
        padding: { x: 30, y: 15 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    retryButton.on('pointerdown', () => {
      AudioManager.playButtonClick();
      // 이전 게임 씬이 남아 있을 가능성에 대비해 완전히 정리 후 재시작
      this.scene.stop(SCENE_KEYS.GAME);
      this.scene.start(SCENE_KEYS.GAME);
    });

    // 메뉴 버튼
    const menuButton = this.add
      .text(width / 2, height / 2 + 200, '메뉴로', {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: '#6b7280',
        padding: { x: 30, y: 15 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    menuButton.on('pointerdown', () => {
      AudioManager.playButtonClick();
      this.scene.start(SCENE_KEYS.MENU);
    });

    // 리더보드 점수 제출
    this.submitScore();
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, width, height);
  }

  private async submitScore(): Promise<void> {
    // 최대 3번 재시도
    const MAX_RETRIES = 3;
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await LeaderboardService.submitScore(this.score, this.floor);
        if (result.success) {
          console.log('[GameOverScene] 점수 제출 완료', { rank: result.rank });
          return;
        }
        lastError = new Error('Score submission returned unsuccessful');
      } catch (error) {
        lastError = error;
        console.warn(`[GameOverScene] 점수 제출 시도 ${attempt}/${MAX_RETRIES} 실패:`, error);

        // 마지막 시도가 아니면 잠시 대기 후 재시도
        if (attempt < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    // 모든 시도 실패 - 로컬에 저장하여 나중에 동기화
    console.error('[GameOverScene] 점수 제출 최종 실패:', lastError);
    this.saveScoreLocally();
  }

  /**
   * 점수를 로컬에 저장 (오프라인 시 나중에 동기화)
   */
  private saveScoreLocally(): void {
    try {
      const pendingScores = JSON.parse(localStorage.getItem('catjump_pending_scores') || '[]');
      pendingScores.push({
        score: this.score,
        floor: this.floor,
        timestamp: Date.now(),
      });
      // 최대 10개만 저장
      if (pendingScores.length > 10) {
        pendingScores.shift();
      }
      localStorage.setItem('catjump_pending_scores', JSON.stringify(pendingScores));
      console.log('[GameOverScene] 점수를 로컬에 저장 (나중에 동기화)');
    } catch (error) {
      console.warn('[GameOverScene] 로컬 점수 저장 실패:', error);
    }
  }

  private async handleShare(): Promise<void> {
    const shareData: ShareData = {
      score: this.score,
      floor: this.floor,
      isNewRecord: this.isNewRecord,
    };

    // 스크린샷 캡처 시도
    const screenshot = await ShareService.captureScreenshot();
    if (screenshot) {
      shareData.screenshot = screenshot;
    }

    // 네이티브 공유 지원 여부에 따라 분기
    let result;
    if (ShareService.isNativeShareSupported()) {
      result = await ShareService.share('native', shareData);
    } else {
      // 클립보드 복사 폴백
      result = await ShareService.share('clipboard', shareData);
    }

    // 결과 표시
    if (result.success) {
      if (result.rewardGiven) {
        this.showShareNotice('공유 완료! +50 코인 획득!', '#ffd700');
      } else {
        this.showShareNotice('공유 완료!', '#4ade80');
      }
    } else {
      this.showShareNotice('공유 실패', '#ff6b6b');
    }
  }

  private showShareNotice(message: string, color: string): void {
    if (!this.shareNotice) return;

    this.shareNotice.setText(message);
    this.shareNotice.setColor(color);

    // 페이드 아웃 애니메이션
    this.tweens.add({
      targets: this.shareNotice,
      alpha: { from: 1, to: 0 },
      duration: 3000,
      delay: 1000,
    });
  }
}
