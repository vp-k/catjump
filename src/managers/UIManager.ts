import Phaser from 'phaser';
import { AudioManager } from './AudioManager';

/**
 * UI 관리자 - 공통 UI 컴포넌트 관리
 */
class UIManagerClass {
  private scene: Phaser.Scene | null = null;

  /**
   * 씬 설정
   */
  setScene(scene: Phaser.Scene): void {
    this.scene = scene;
  }

  /**
   * 버튼 생성
   */
  createButton(
    x: number,
    y: number,
    text: string,
    callback: () => void,
    options?: {
      fontSize?: string;
      backgroundColor?: string;
      padding?: { x: number; y: number };
    }
  ): Phaser.GameObjects.Text | null {
    if (!this.scene) return null;

    const button = this.scene.add
      .text(x, y, text, {
        fontSize: options?.fontSize ?? '24px',
        color: '#ffffff',
        backgroundColor: options?.backgroundColor ?? '#4ade80',
        padding: options?.padding ?? { x: 30, y: 15 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    button.on('pointerdown', () => {
      AudioManager.playButtonClick();
      callback();
    });

    button.on('pointerover', () => {
      button.setScale(1.05);
    });

    button.on('pointerout', () => {
      button.setScale(1);
    });

    return button;
  }

  /**
   * 팝업 표시
   */
  showPopup(
    title: string,
    message: string,
    buttons?: Array<{ text: string; callback: () => void }>
  ): Phaser.GameObjects.Container | null {
    if (!this.scene) return null;

    const { width, height } = this.scene.cameras.main;

    // 딤 배경
    const dim = this.scene.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
      .setInteractive();

    // 팝업 패널
    const panel = this.scene.add
      .rectangle(width / 2, height / 2, 500, 300, 0x2d2d2d)
      .setStrokeStyle(2, 0x4ade80);

    // 타이틀
    const titleText = this.scene.add
      .text(width / 2, height / 2 - 80, title, {
        fontSize: '32px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // 메시지
    const messageText = this.scene.add
      .text(width / 2, height / 2, message, {
        fontSize: '20px',
        color: '#cccccc',
        align: 'center',
        wordWrap: { width: 450 },
      })
      .setOrigin(0.5);

    // 컨테이너
    const container = this.scene.add.container(0, 0, [
      dim,
      panel,
      titleText,
      messageText,
    ]);

    // 버튼 추가
    if (buttons && buttons.length > 0) {
      const buttonStartX = width / 2 - ((buttons.length - 1) * 120) / 2;
      buttons.forEach((btn, index) => {
        const button = this.createButton(
          buttonStartX + index * 120,
          height / 2 + 100,
          btn.text,
          () => {
            container.destroy();
            btn.callback();
          }
        );
        if (button) {
          container.add(button);
        }
      });
    }

    AudioManager.playPopupOpen();
    return container;
  }

  /**
   * 토스트 메시지 표시
   */
  showToast(message: string, duration = 2000): void {
    if (!this.scene) return;

    const { width, height } = this.scene.cameras.main;

    const toast = this.scene.add
      .text(width / 2, height - 150, message, {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#333333',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.scene.tweens.add({
      targets: toast,
      alpha: 1,
      y: height - 180,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        this.scene?.tweens.add({
          targets: toast,
          alpha: 0,
          y: height - 200,
          delay: duration,
          duration: 200,
          ease: 'Power2',
          onComplete: () => {
            toast.destroy();
          },
        });
      },
    });
  }

  /**
   * 플로팅 텍스트 (점수 획득 등)
   */
  showFloatingText(
    x: number,
    y: number,
    text: string,
    color = '#ffffff'
  ): void {
    if (!this.scene) return;

    const floatText = this.scene.add
      .text(x, y, text, {
        fontSize: '28px',
        color: color,
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.scene.tweens.add({
      targets: floatText,
      y: y - 80,
      alpha: 0,
      scale: 1.5,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        floatText.destroy();
      },
    });
  }

  /**
   * 판정 텍스트 표시
   */
  showJudgment(
    x: number,
    y: number,
    judgment: 'perfect' | 'good' | 'miss'
  ): void {
    const colors: Record<string, string> = {
      perfect: '#ffd700',
      good: '#4ade80',
      miss: '#ff6b6b',
    };

    const texts: Record<string, string> = {
      perfect: 'PERFECT!',
      good: 'GOOD',
      miss: 'MISS',
    };

    this.showFloatingText(x, y, texts[judgment], colors[judgment]);
  }

  /**
   * 리소스 정리
   */
  cleanup(): void {
    this.scene = null;
  }
}

export const UIManager = new UIManagerClass();
