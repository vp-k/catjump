import Phaser from 'phaser';
import { SCENE_KEYS, GAME_CONFIG } from '@config/GameConfig';

/**
 * 게임 씬 - 메인 게임플레이
 */
export class GameScene extends Phaser.Scene {
  private cat!: Phaser.Physics.Arcade.Sprite;
  private cans!: Phaser.Physics.Arcade.StaticGroup;
  private currentCan!: Phaser.Physics.Arcade.Sprite;
  private floor: number = 0;
  private score: number = 0;
  private combo: number = 0;
  private isJumping: boolean = false;

  private scoreText!: Phaser.GameObjects.Text;
  private floorText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SCENE_KEYS.GAME });
  }

  create(): void {
    this.resetGameState();
    this.createUI();
    this.createInitialCan();
    this.createCat();
    this.setupInput();
    this.spawnNextCan();
  }

  private resetGameState(): void {
    this.floor = 0;
    this.score = 0;
    this.combo = 0;
    this.isJumping = false;
  }

  private createUI(): void {
    const { width } = this.cameras.main;

    this.scoreText = this.add.text(20, 20, '점수: 0', {
      fontSize: '24px',
      color: '#ffffff',
    });

    this.floorText = this.add.text(width - 20, 20, '0층', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(1, 0);

    this.comboText = this.add.text(width / 2, 80, '', {
      fontSize: '32px',
      color: '#ffd700',
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  private createInitialCan(): void {
    this.cans = this.physics.add.staticGroup();

    const { width, height } = this.cameras.main;
    const initialCan = this.cans.create(
      width / 2,
      height - 100,
      'can'
    ) as Phaser.Physics.Arcade.Sprite;
    initialCan.refreshBody();
  }

  private createCat(): void {
    const { width, height } = this.cameras.main;

    this.cat = this.physics.add.sprite(
      width / 2,
      height - 100 - GAME_CONFIG.CAN_HEIGHT / 2 - 30,
      'cat'
    );
    this.cat.setCollideWorldBounds(false);
    this.cat.setBounce(0);

    // 캔과 충돌 설정
    this.physics.add.collider(this.cat, this.cans, this.onLanding, undefined, this);
  }

  private setupInput(): void {
    this.input.on('pointerdown', this.jump, this);
  }

  private jump(): void {
    if (this.isJumping) return;

    this.isJumping = true;
    this.cat.setVelocityY(GAME_CONFIG.JUMP_VELOCITY);
  }

  private spawnNextCan(): void {
    const { width, height } = this.cameras.main;
    const direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
    const startX = direction === -1 ? width + GAME_CONFIG.CAN_WIDTH : -GAME_CONFIG.CAN_WIDTH;
    const targetY = height - 100 - (this.floor + 1) * GAME_CONFIG.CAN_HEIGHT;

    this.currentCan = this.physics.add.sprite(startX, targetY, 'can');
    this.currentCan.setImmovable(true);
    (this.currentCan.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

    // 캔 이동
    const speed = this.getCanSpeed();
    this.tweens.add({
      targets: this.currentCan,
      x: width / 2,
      duration: speed,
      ease: 'Linear',
      onComplete: () => {
        // 캔이 중앙에 도달하면 고정
        this.cans.add(this.currentCan);
        this.currentCan.refreshBody();
      },
    });
  }

  private getCanSpeed(): number {
    const baseSpeed = GAME_CONFIG.CAN_BASE_SPEED;
    // TODO: 난이도에 따른 속도 조절
    return Math.max(800, baseSpeed - this.floor * 30);
  }

  private onLanding(): void {
    if (!this.isJumping) return;
    this.isJumping = false;

    // 착지 판정
    const catX = this.cat.x;
    const canX = this.currentCan?.x ?? this.cat.x;
    const canWidth = GAME_CONFIG.CAN_WIDTH;
    const offset = Math.abs(catX - canX);

    const perfectZone = canWidth * GAME_CONFIG.PERFECT_ZONE / 2;
    const goodZone = canWidth * GAME_CONFIG.GOOD_ZONE / 2;

    if (offset > goodZone) {
      // Miss - 게임 오버
      this.gameOver();
      return;
    }

    this.floor++;
    this.floorText.setText(`${this.floor}층`);

    if (offset <= perfectZone) {
      // Perfect
      this.combo++;
      const multiplier = this.getComboMultiplier();
      this.score += Math.floor(GAME_CONFIG.SCORE_PERFECT * multiplier);
      this.showFeedback('Perfect!', '#4ade80');
    } else {
      // Good
      this.combo = 0;
      this.score += GAME_CONFIG.SCORE_GOOD;
      this.showFeedback('Good', '#fbbf24');
    }

    this.scoreText.setText(`점수: ${this.score}`);
    this.updateComboDisplay();
    this.spawnNextCan();
  }

  private getComboMultiplier(): number {
    const multipliers = GAME_CONFIG.COMBO_MULTIPLIERS;
    let result = 1;

    for (const [threshold, mult] of Object.entries(multipliers)) {
      if (this.combo >= parseInt(threshold)) {
        result = mult;
      }
    }
    return result;
  }

  private showFeedback(text: string, color: string): void {
    const { width, height } = this.cameras.main;
    const feedback = this.add.text(width / 2, height / 2, text, {
      fontSize: '48px',
      color: color,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: feedback,
      y: height / 2 - 50,
      alpha: 0,
      duration: 500,
      onComplete: () => feedback.destroy(),
    });
  }

  private updateComboDisplay(): void {
    if (this.combo >= 2) {
      this.comboText.setText(`${this.combo} COMBO!`);
      this.tweens.add({
        targets: this.comboText,
        scale: 1.2,
        duration: 100,
        yoyo: true,
      });
    } else {
      this.comboText.setText('');
    }
  }

  private gameOver(): void {
    this.scene.start(SCENE_KEYS.GAME_OVER, {
      score: this.score,
      floor: this.floor,
    });
  }

  update(): void {
    // 고양이가 화면 밖으로 떨어지면 게임 오버
    if (this.cat.y > this.cameras.main.height + 100) {
      this.gameOver();
    }
  }
}
