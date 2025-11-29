import Phaser from 'phaser';
import { GameManager } from '@managers/GameManager';

/**
 * 디버그 패널 - 개발용 정보 표시
 */
export class DebugPanel {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private texts: Map<string, Phaser.GameObjects.Text> = new Map();
  private isVisible = false;
  private updateTimer = 0;
  private readonly UPDATE_INTERVAL = 100; // ms

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = this.createPanel();

    // 개발 모드에서만 표시
    if (import.meta.env.DEV) {
      this.setupKeyboardToggle();
    }
  }

  private createPanel(): Phaser.GameObjects.Container {
    const container = this.scene.add.container(10, 10);
    container.setDepth(1000);
    container.setVisible(false);

    // 배경
    const bg = this.scene.add.rectangle(0, 0, 250, 200, 0x000000, 0.8);
    bg.setOrigin(0, 0);
    container.add(bg);

    // 타이틀
    const title = this.scene.add.text(10, 5, '🔧 DEBUG', {
      fontSize: '14px',
      color: '#4ade80',
      fontStyle: 'bold',
    });
    container.add(title);

    // 정보 텍스트들
    const labels = ['FPS', 'State', 'Score', 'Floor', 'Combo', 'Objects'];
    labels.forEach((label, index) => {
      const text = this.scene.add.text(10, 25 + index * 25, `${label}: -`, {
        fontSize: '12px',
        color: '#ffffff',
      });
      container.add(text);
      this.texts.set(label, text);
    });

    return container;
  }

  private setupKeyboardToggle(): void {
    this.scene.input.keyboard?.on('keydown-F1', () => {
      this.toggle();
    });
  }

  toggle(): void {
    this.isVisible = !this.isVisible;
    this.container.setVisible(this.isVisible);
  }

  show(): void {
    this.isVisible = true;
    this.container.setVisible(true);
  }

  hide(): void {
    this.isVisible = false;
    this.container.setVisible(false);
  }

  update(_time: number, delta: number): void {
    if (!this.isVisible) return;

    this.updateTimer += delta;
    if (this.updateTimer < this.UPDATE_INTERVAL) return;
    this.updateTimer = 0;

    // FPS
    const fps = Math.round(this.scene.game.loop.actualFps);
    this.setText('FPS', `FPS: ${fps}`);

    // 게임 상태
    this.setText('State', `State: ${GameManager.state}`);

    // 점수
    this.setText('Score', `Score: ${GameManager.currentScore}`);

    // 층수
    this.setText('Floor', `Floor: ${GameManager.currentFloor}`);

    // 콤보
    this.setText('Combo', `Combo: ${GameManager.currentCombo}`);

    // 오브젝트 수
    const objectCount = this.scene.children.length;
    this.setText('Objects', `Objects: ${objectCount}`);
  }

  private setText(key: string, value: string): void {
    const text = this.texts.get(key);
    if (text) {
      text.setText(value);
    }
  }

  /**
   * 커스텀 값 추가
   */
  addValue(key: string, value: string | number): void {
    if (!this.texts.has(key)) {
      const yPos = 25 + this.texts.size * 25;
      const text = this.scene.add.text(10, yPos, `${key}: ${value}`, {
        fontSize: '12px',
        color: '#ffffff',
      });
      this.container.add(text);
      this.texts.set(key, text);

      // 배경 크기 조정
      const bg = this.container.getAt(0) as Phaser.GameObjects.Rectangle;
      bg.setSize(250, yPos + 30);
    } else {
      this.setText(key, `${key}: ${value}`);
    }
  }

  destroy(): void {
    this.container.destroy();
    this.texts.clear();
  }
}
