import Phaser from 'phaser';
import { SaveManager } from './SaveManager';
import {
  TutorialStep,
  TUTORIAL_STEPS,
  TUTORIAL_CONFIG,
  TutorialStepConfig,
} from '@config/TutorialConfig';

/**
 * 튜토리얼 관리자 - FTUE (First Time User Experience)
 */
class TutorialManagerClass {
  private scene: Phaser.Scene | null = null;
  private isActive = false;
  private currentStepIndex = 0;

  // UI 요소
  private dimBackground: Phaser.GameObjects.Rectangle | null = null;
  private speechBubble: Phaser.GameObjects.Container | null = null;
  private arrow: Phaser.GameObjects.Graphics | null = null;
  private highlight: Phaser.GameObjects.Graphics | null = null;

  // 콜백
  private onStepComplete: (() => void) | null = null;

  /**
   * 씬 설정
   */
  setScene(scene: Phaser.Scene): void {
    this.scene = scene;
  }

  /**
   * 튜토리얼 시작
   */
  startTutorial(): boolean {
    if (!this.scene) return false;

    // 이미 완료했으면 스킵
    if (this.isTutorialCompleted()) {
      return false;
    }

    this.isActive = true;
    this.currentStepIndex = 0;
    this.showCurrentStep();
    return true;
  }

  /**
   * 튜토리얼 완료 여부
   */
  isTutorialCompleted(): boolean {
    const saveData = SaveManager.getData();
    // 5층 이상 도달한 적 있으면 완료로 간주
    return saveData.stats.highFloor >= TUTORIAL_CONFIG.AUTO_SKIP_FLOOR;
  }

  /**
   * 현재 단계 표시
   */
  private showCurrentStep(): void {
    if (!this.scene || !this.isActive) return;

    const step = TUTORIAL_STEPS[this.currentStepIndex];
    if (!step) {
      this.completeTutorial();
      return;
    }

    this.createTutorialUI(step);
  }

  /**
   * 튜토리얼 UI 생성
   */
  private createTutorialUI(step: TutorialStepConfig): void {
    if (!this.scene) return;

    const { width, height } = this.scene.cameras.main;

    // 딤 배경 (시각적 효과만 - 터치 이벤트는 통과시킴)
    if (TUTORIAL_CONFIG.DIM_ALPHA > 0) {
      this.dimBackground = this.scene.add
        .rectangle(width / 2, height / 2, width, height, 0x000000, TUTORIAL_CONFIG.DIM_ALPHA)
        .setScrollFactor(0)
        .setDepth(500);
      // 주의: setInteractive 제거 - GameScene의 입력이 통과되도록 함
      // onTap은 GameScene.handleJump에서 호출됨
    }

    // 말풍선
    this.createSpeechBubble(step, width / 2, height / 2 - 100);

    // 화살표
    if (step.showArrow) {
      this.createArrow(step.arrowTarget, width, height);
    }

    // 하이라이트
    if (step.highlightArea) {
      this.createHighlight(step.highlightArea);
    }
  }

  /**
   * 말풍선 생성
   */
  private createSpeechBubble(step: TutorialStepConfig, x: number, y: number): void {
    if (!this.scene) return;

    this.speechBubble = this.scene.add.container(x, y);
    this.speechBubble.setScrollFactor(0);
    this.speechBubble.setDepth(510);

    // 배경
    const bg = this.scene.add.graphics();
    bg.fillStyle(0xffffff, 0.95);
    bg.fillRoundedRect(-180, -80, 360, 160, 20);
    bg.lineStyle(3, 0x4ade80);
    bg.strokeRoundedRect(-180, -80, 360, 160, 20);
    this.speechBubble.add(bg);

    // 제목
    const title = this.scene.add
      .text(0, -50, step.titleKo, {
        fontSize: '24px',
        color: '#333333',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.speechBubble.add(title);

    // 설명
    const desc = this.scene.add
      .text(0, 10, step.descriptionKo, {
        fontSize: '18px',
        color: '#666666',
        align: 'center',
        lineSpacing: 8,
      })
      .setOrigin(0.5);
    this.speechBubble.add(desc);

    // 탭 안내
    const tapHint = this.scene.add
      .text(0, 60, '화면을 터치하세요', {
        fontSize: '14px',
        color: '#999999',
      })
      .setOrigin(0.5);
    this.speechBubble.add(tapHint);

    // 깜빡임 효과
    this.scene.tweens.add({
      targets: tapHint,
      alpha: 0.5,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    // 등장 애니메이션
    this.speechBubble.setScale(0.5);
    this.speechBubble.setAlpha(0);
    this.scene.tweens.add({
      targets: this.speechBubble,
      scale: 1,
      alpha: 1,
      duration: TUTORIAL_CONFIG.FADE_DURATION,
      ease: 'Back.easeOut',
    });
  }

  /**
   * 화살표 생성
   */
  private createArrow(target: string | undefined, width: number, height: number): void {
    if (!this.scene || !target) return;

    let targetX = width / 2;
    let targetY = height - 150;

    if (target === 'can') {
      targetY = height / 2;
    }

    this.arrow = this.scene.add.graphics();
    this.arrow.setScrollFactor(0);
    this.arrow.setDepth(505);

    // 화살표 그리기
    this.arrow.fillStyle(0xffd700);
    this.arrow.fillTriangle(targetX - 20, targetY - 60, targetX + 20, targetY - 60, targetX, targetY - 30);
    this.arrow.fillRect(targetX - 10, targetY - 100, 20, 40);

    // 바운스 애니메이션
    this.scene.tweens.add({
      targets: this.arrow,
      y: 10,
      duration: TUTORIAL_CONFIG.ARROW_BOUNCE_SPEED,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * 하이라이트 생성
   */
  private createHighlight(area: { x: number; y: number; width: number; height: number }): void {
    if (!this.scene) return;

    this.highlight = this.scene.add.graphics();
    this.highlight.setScrollFactor(0);
    this.highlight.setDepth(502);

    this.highlight.lineStyle(4, 0xffd700);
    this.highlight.strokeRoundedRect(area.x, area.y, area.width, area.height, 10);

    // 펄스 효과
    this.scene.tweens.add({
      targets: this.highlight,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
  }

  /**
   * UI 정리
   */
  private clearUI(): void {
    if (this.dimBackground) {
      this.dimBackground.destroy();
      this.dimBackground = null;
    }
    if (this.speechBubble) {
      this.speechBubble.destroy();
      this.speechBubble = null;
    }
    if (this.arrow) {
      this.arrow.destroy();
      this.arrow = null;
    }
    if (this.highlight) {
      this.highlight.destroy();
      this.highlight = null;
    }
  }

  /**
   * 다음 단계로
   */
  nextStep(): void {
    this.clearUI();
    this.currentStepIndex++;

    if (this.currentStepIndex >= TUTORIAL_STEPS.length) {
      this.completeTutorial();
    } else {
      this.showCurrentStep();
    }
  }

  /**
   * 튜토리얼 완료
   */
  private completeTutorial(): void {
    this.isActive = false;
    this.clearUI();

    if (this.onStepComplete) {
      this.onStepComplete();
    }
  }

  /**
   * 이벤트 처리 - 탭
   */
  onTap(): void {
    if (!this.isActive) return;

    const step = TUTORIAL_STEPS[this.currentStepIndex];
    if (step?.autoAdvanceCondition === 'tap') {
      this.nextStep();
    }
  }

  /**
   * 이벤트 처리 - 착지
   */
  onLand(): void {
    if (!this.isActive) return;

    const step = TUTORIAL_STEPS[this.currentStepIndex];
    if (step?.autoAdvanceCondition === 'land') {
      this.nextStep();
    }
  }

  /**
   * 이벤트 처리 - 퍼펙트
   */
  onPerfect(): void {
    if (!this.isActive) return;

    const step = TUTORIAL_STEPS[this.currentStepIndex];
    if (step?.autoAdvanceCondition === 'perfect') {
      this.nextStep();
    }
  }

  /**
   * 이벤트 처리 - 콤보
   */
  onCombo(): void {
    if (!this.isActive) return;

    const step = TUTORIAL_STEPS[this.currentStepIndex];
    if (step?.autoAdvanceCondition === 'combo') {
      if (step.forceWait) {
        this.scene?.time.delayedCall(step.forceWait, () => {
          this.nextStep();
        });
      } else {
        this.nextStep();
      }
    }
  }

  /**
   * 강제 스킵
   */
  skip(): void {
    this.completeTutorial();
  }

  /**
   * 튜토리얼 활성화 여부
   */
  get isRunning(): boolean {
    return this.isActive;
  }

  /**
   * 현재 단계
   */
  get currentStep(): TutorialStep | null {
    if (!this.isActive) return null;
    return TUTORIAL_STEPS[this.currentStepIndex]?.id || null;
  }

  /**
   * 완료 콜백 설정
   */
  setOnComplete(callback: () => void): void {
    this.onStepComplete = callback;
  }
}

export const TutorialManager = new TutorialManagerClass();
