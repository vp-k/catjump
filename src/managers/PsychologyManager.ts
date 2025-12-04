import Phaser from 'phaser';
import { SaveManager } from './SaveManager';
import {
  CatEmotion,
  MERCY_CONFIG,
  EMPATHY_CONFIG,
  LOSS_AVERSION_CONFIG,
  EMOTION_COLORS,
} from '@config/PsychologyConfig';

/**
 * 심리 엔진 관리자 - 플레이어 감정 자극 시스템
 */
class PsychologyManagerClass {
  private scene: Phaser.Scene | null = null;

  // 감정 상태
  private currentEmotion: CatEmotion = 'happy';

  // Mercy 시스템 상태
  private consecutiveFailCount = 0;
  private mercyActive = false;
  private mercyGamesRemaining = 0;

  // 게임 통계 (동적 난이도용)
  private recentGames: { perfectRate: number; floor: number }[] = [];
  private currentGamePerfects = 0;
  private currentGameLandings = 0;

  // UI 요소
  private emotionBubble: Phaser.GameObjects.Container | null = null;

  /**
   * 씬 설정
   */
  setScene(scene: Phaser.Scene): void {
    this.scene = scene;
  }

  /**
   * 게임 시작 시 초기화
   */
  startGame(): void {
    this.currentEmotion = 'happy';
    this.currentGamePerfects = 0;
    this.currentGameLandings = 0;

    // 컴백 보너스 체크
    this.checkComebackBonus();

    // 게임 시작 대사
    this.showCatDialogue('game_start');
  }

  /**
   * 게임 종료 시 처리
   */
  endGame(floor: number, isNewRecord: boolean): void {
    // Perfect 비율 계산
    const perfectRate = this.currentGameLandings > 0
      ? this.currentGamePerfects / this.currentGameLandings
      : 0;

    // 최근 게임 기록
    this.recentGames.push({ perfectRate, floor });
    if (this.recentGames.length > 5) {
      this.recentGames.shift();
    }

    // 연속 실패 체크 (5층 미만)
    if (floor < 5) {
      this.consecutiveFailCount++;
      if (this.consecutiveFailCount >= MERCY_CONFIG.CONSECUTIVE_FAIL_PROTECTION.TRIGGER_COUNT) {
        this.activateMercy();
      }
    } else {
      this.consecutiveFailCount = 0;
    }

    // 감정 및 대사
    if (isNewRecord) {
      this.setEmotion('excited');
      this.showCatDialogue('new_record');
    } else {
      this.setEmotion('sad');
      this.showCatDialogue('game_over');
    }
  }

  /**
   * Perfect 착지 시
   */
  onPerfect(): void {
    this.currentGamePerfects++;
    this.currentGameLandings++;
    this.setEmotion('happy');
    this.showCatDialogue('perfect_land');
  }

  /**
   * Good 착지 시
   */
  onGood(): void {
    this.currentGameLandings++;
  }

  /**
   * 콤보 마일스톤
   */
  onComboMilestone(_combo: number): void {
    this.setEmotion('excited');
    this.showCatDialogue('combo_milestone');
  }

  /**
   * Near Miss 시
   */
  onNearMiss(): void {
    this.setEmotion('nervous');
    this.showCatDialogue('near_miss');
  }

  /**
   * 실패 시
   */
  onFail(): void {
    this.setEmotion('sad');
    this.showLossAversionEffect();
  }

  /**
   * 함정캔 시
   */
  onTrap(): void {
    this.setEmotion('scared');
  }

  /**
   * 감정 설정
   */
  private setEmotion(emotion: CatEmotion): void {
    this.currentEmotion = emotion;
  }

  /**
   * 고양이 대사 표시
   */
  showCatDialogue(situation: keyof typeof EMPATHY_CONFIG.CAT_DIALOGUES): void {
    if (!this.scene) return;

    const dialogues = EMPATHY_CONFIG.CAT_DIALOGUES[situation];
    const dialogue = dialogues[Phaser.Math.Between(0, dialogues.length - 1)];

    // 기존 말풍선 제거
    this.clearEmotionBubble();

    // 말풍선 생성
    const { width } = this.scene.cameras.main;
    this.emotionBubble = this.scene.add.container(width / 2, 150);
    this.emotionBubble.setScrollFactor(0);
    this.emotionBubble.setDepth(200);

    // 배경
    const bg = this.scene.add.graphics();
    bg.fillStyle(0xffffff, 0.95);
    bg.fillRoundedRect(-80, -25, 160, 50, 15);
    bg.fillStyle(0xffffff, 0.95);
    // 꼬리
    bg.fillTriangle(-10, 25, 10, 25, 0, 40);
    this.emotionBubble.add(bg);

    // 텍스트
    const text = this.scene.add
      .text(0, 0, dialogue, {
        fontSize: '16px',
        color: '#333333',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.emotionBubble.add(text);

    // 등장 애니메이션
    this.emotionBubble.setScale(0);
    this.emotionBubble.setAlpha(0);
    this.scene.tweens.add({
      targets: this.emotionBubble,
      scale: 1,
      alpha: 1,
      duration: 200,
      ease: 'Back.easeOut',
    });

    // 자동 제거
    this.scene.time.delayedCall(EMPATHY_CONFIG.DIALOGUE_DURATION, () => {
      this.clearEmotionBubble();
    });
  }

  /**
   * 말풍선 제거
   */
  private clearEmotionBubble(): void {
    if (this.emotionBubble) {
      this.emotionBubble.destroy();
      this.emotionBubble = null;
    }
  }

  /**
   * 손실 회피 효과 표시
   */
  private showLossAversionEffect(): void {
    if (!this.scene) return;

    const { width, height } = this.scene.cameras.main;
    const config = LOSS_AVERSION_CONFIG.SNACK_TOWER;

    // 화면 흔들림
    this.scene.cameras.main.shake(config.SHAKE_DURATION, config.SHAKE_INTENSITY / 1000);

    // 손실 메시지
    const messages = LOSS_AVERSION_CONFIG.LOSS_MESSAGES;
    const message = messages[Phaser.Math.Between(0, messages.length - 1)];

    const lossText = this.scene.add
      .text(width / 2, height / 2 + 80, message, {
        fontSize: '20px',
        color: '#ff6b6b',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(300)
      .setAlpha(0);

    this.scene.tweens.add({
      targets: lossText,
      alpha: 1,
      y: height / 2 + 60,
      duration: 300,
      onComplete: () => {
        this.scene?.time.delayedCall(1500, () => {
          this.scene?.tweens.add({
            targets: lossText,
            alpha: 0,
            duration: 300,
            onComplete: () => lossText.destroy(),
          });
        });
      },
    });
  }

  /**
   * 컴백 보너스 체크
   */
  private checkComebackBonus(): void {
    if (!MERCY_CONFIG.COMEBACK_BONUS.ENABLED) return;

    const saveData = SaveManager.getData();
    const lastPlay = saveData.retention.lastPlayDate;
    const now = Date.now();
    const hoursSinceLastPlay = (now - lastPlay) / (1000 * 60 * 60);

    if (hoursSinceLastPlay >= MERCY_CONFIG.COMEBACK_BONUS.TRIGGER_HOURS && lastPlay > 0) {
      // 컴백 보너스 지급
      this.showComebackBonus();
    }
  }

  /**
   * 컴백 보너스 표시
   */
  private showComebackBonus(): void {
    if (!this.scene) return;

    const { width, height } = this.scene.cameras.main;
    const config = MERCY_CONFIG.COMEBACK_BONUS;

    // 컴백 메시지
    const container = this.scene.add.container(width / 2, height / 2);
    container.setScrollFactor(0);
    container.setDepth(500);

    // 배경
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.7);
    bg.fillRoundedRect(-150, -80, 300, 160, 20);
    container.add(bg);

    // 메시지
    const text = this.scene.add
      .text(0, -30, config.MESSAGE, {
        fontSize: '18px',
        color: '#ffd700',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: 260 },
      })
      .setOrigin(0.5);
    container.add(text);

    // 보상 텍스트
    const rewardText = this.scene.add
      .text(0, 30, `+${config.COIN_REWARD} 코인!`, {
        fontSize: '24px',
        color: '#4ade80',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    container.add(rewardText);

    // 대사 표시
    this.showCatDialogue('comeback');

    // 등장 애니메이션
    container.setScale(0);
    this.scene.tweens.add({
      targets: container,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.scene?.time.delayedCall(2000, () => {
          this.scene?.tweens.add({
            targets: container,
            alpha: 0,
            scale: 0.8,
            duration: 300,
            onComplete: () => container.destroy(),
          });
        });
      },
    });

    // 실제 코인 지급 (SaveManager에서 처리)
    SaveManager.addCoins(config.COIN_REWARD);
  }

  /**
   * Mercy 시스템 활성화
   */
  private activateMercy(): void {
    this.mercyActive = true;
    this.mercyGamesRemaining = MERCY_CONFIG.CONSECUTIVE_FAIL_PROTECTION.DURATION_GAMES;
    this.consecutiveFailCount = 0;
  }

  /**
   * Mercy 활성화 여부
   */
  isMercyActive(): boolean {
    return this.mercyActive && this.mercyGamesRemaining > 0;
  }

  /**
   * Perfect 존 배율 반환
   */
  getPerfectZoneMultiplier(): number {
    if (this.isMercyActive()) {
      return MERCY_CONFIG.CONSECUTIVE_FAIL_PROTECTION.PERFECT_ZONE_MULTIPLIER;
    }
    return 1;
  }

  /**
   * 캔 속도 배율 반환 (동적 난이도)
   */
  getSpeedMultiplier(): number {
    let multiplier = 1;

    // 초보자 보호
    const gamesPlayed = SaveManager.getData().stats.gamesPlayed;
    if (gamesPlayed < MERCY_CONFIG.BEGINNER_PROTECTION.GAMES_COUNT) {
      multiplier *= MERCY_CONFIG.BEGINNER_PROTECTION.SPEED_MULTIPLIER;
    }

    // 동적 난이도 (최근 게임 기반)
    if (MERCY_CONFIG.DYNAMIC_DIFFICULTY.ENABLED && this.recentGames.length >= 3) {
      const avgPerfectRate = this.recentGames.reduce((sum, g) => sum + g.perfectRate, 0) / this.recentGames.length;
      const lastFloor = this.recentGames[this.recentGames.length - 1].floor;

      const increaseThreshold = MERCY_CONFIG.DYNAMIC_DIFFICULTY.INCREASE_THRESHOLD;
      const decreaseThreshold = MERCY_CONFIG.DYNAMIC_DIFFICULTY.DECREASE_THRESHOLD;

      if (avgPerfectRate >= increaseThreshold.PERFECT_RATE && lastFloor >= increaseThreshold.MIN_FLOOR) {
        multiplier *= increaseThreshold.SPEED_INCREASE;
      } else if (avgPerfectRate <= decreaseThreshold.PERFECT_RATE) {
        multiplier *= decreaseThreshold.SPEED_DECREASE;
      }
    }

    return multiplier;
  }

  /**
   * 넓은캔 확률 반환 (초보자 보호)
   */
  getWideCanChance(): number {
    const gamesPlayed = SaveManager.getData().stats.gamesPlayed;
    if (gamesPlayed < MERCY_CONFIG.BEGINNER_PROTECTION.GAMES_COUNT) {
      return MERCY_CONFIG.BEGINNER_PROTECTION.WIDER_CANS_CHANCE;
    }
    return 0;
  }

  /**
   * 현재 감정 상태
   */
  get emotion(): CatEmotion {
    return this.currentEmotion;
  }

  /**
   * 현재 감정 색상
   */
  get emotionColor(): number {
    return EMOTION_COLORS[this.currentEmotion];
  }

  /**
   * 고양이 이름 가져오기
   */
  getCatName(catId: string): string {
    return (
      EMPATHY_CONFIG.CAT_NAMES[catId as keyof typeof EMPATHY_CONFIG.CAT_NAMES] ||
      EMPATHY_CONFIG.CAT_NAMES.default
    );
  }

  /**
   * Mercy 게임 카운트 감소
   */
  consumeMercyGame(): void {
    if (this.mercyGamesRemaining > 0) {
      this.mercyGamesRemaining--;
      if (this.mercyGamesRemaining <= 0) {
        this.mercyActive = false;
      }
    }
  }
}

export const PsychologyManager = new PsychologyManagerClass();
