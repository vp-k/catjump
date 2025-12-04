import Phaser from 'phaser';
import { GAME_CONFIG } from '@config/GameConfig';
import { AudioManager } from '@managers/AudioManager';
import { ShopManager } from '@managers/ShopManager';

export type CatState = 'idle' | 'jumping' | 'falling' | 'landing';

/**
 * 고양이 엔티티 - 플레이어 캐릭터
 */
export class Cat extends Phaser.Physics.Arcade.Sprite {
  private _state: CatState = 'idle';
  private canJump = true;
  private jumpCount = 0;
  private readonly MAX_JUMPS = 1;

  // 그래픽 기반 고양이
  private catGraphics!: Phaser.GameObjects.Graphics;
  private catColor: number;
  private eyeOffset = 0; // 눈 깜빡임
  private tailAngle = 0; // 꼬리 흔들림
  private idleTimer = 0;
  private lastState: CatState = 'idle'; // 상태 변경 추적
  private lastX = 0; // 위치 변경 추적
  private lastY = 0;
  private blinkTimer: Phaser.Time.TimerEvent | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'cat');

    // 현재 장착된 고양이 색상 가져오기
    const catData = ShopManager.getCurrentCatData();
    this.catColor = catData.color;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setupPhysics();
    this.setupGraphics();
  }

  private setupGraphics(): void {
    this.catGraphics = this.scene.add.graphics();
    this.setAlpha(0); // 기본 스프라이트 숨기기
    this.drawCat();
  }

  private setupPhysics(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    body.setCollideWorldBounds(false);
    body.setGravityY(GAME_CONFIG.GRAVITY);
    body.setBounce(0);
    body.setSize(60, 50); // 충돌 박스 조정
    body.setOffset(10, 10);
  }

  /**
   * 점프 실행
   */
  jump(): boolean {
    if (!this.canJump || this.jumpCount >= this.MAX_JUMPS) {
      return false;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return false;
    body.setVelocityY(GAME_CONFIG.JUMP_VELOCITY);

    this._state = 'jumping';
    this.jumpCount++;
    this.canJump = this.jumpCount < this.MAX_JUMPS;

    AudioManager.playJump();

    // 점프 스케일 애니메이션
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.9,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeOut',
    });

    return true;
  }

  /**
   * 착지 처리
   */
  land(): void {
    this._state = 'landing';
    this.jumpCount = 0;
    this.canJump = true;

    // 착지 스쿼시 애니메이션
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 0.8,
      duration: 80,
      yoyo: true,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this._state = 'idle';
      },
    });
  }

  /**
   * 떨어짐 처리
   */
  fall(): void {
    this._state = 'falling';
    AudioManager.playFall();
  }

  /**
   * 고양이 그리기 (상태에 따라 다르게)
   */
  private drawCat(): void {
    const g = this.catGraphics;
    g.clear();

    const x = this.x;
    const y = this.y;

    // 상태에 따른 변형
    let bodyScaleX = 1;
    let bodyScaleY = 1;
    let earAngle = 0;

    switch (this._state) {
      case 'jumping':
        bodyScaleX = 0.9;
        bodyScaleY = 1.2;
        earAngle = -0.2;
        break;
      case 'falling':
        bodyScaleX = 1.1;
        bodyScaleY = 0.9;
        earAngle = 0.1;
        break;
      case 'landing':
        bodyScaleX = 1.2;
        bodyScaleY = 0.8;
        break;
      default: // idle
        bodyScaleY = 1 + Math.sin(this.idleTimer * 0.05) * 0.02;
        break;
    }

    // 꼬리 (뒤에 그리기)
    g.lineStyle(6, this.catColor);
    const tailX = x - 25 * bodyScaleX;
    const tailY = y + 5;
    g.beginPath();
    g.moveTo(tailX, tailY);
    g.lineTo(
      tailX - 15 + Math.sin(this.tailAngle) * 10,
      tailY - 20 + Math.cos(this.tailAngle) * 5
    );
    g.strokePath();

    // 몸통
    g.fillStyle(this.catColor);
    g.fillEllipse(x, y + 10, 40 * bodyScaleX, 30 * bodyScaleY);

    // 머리
    g.fillCircle(x, y - 15 * bodyScaleY, 22);

    // 귀
    const leftEarX = x - 15;
    const rightEarX = x + 15;
    const earBaseY = y - 30;

    g.fillTriangle(
      leftEarX - 8, earBaseY + 10,
      leftEarX + 5, earBaseY + 10,
      leftEarX - 2 + Math.sin(earAngle) * 3, earBaseY - 12
    );
    g.fillTriangle(
      rightEarX - 5, earBaseY + 10,
      rightEarX + 8, earBaseY + 10,
      rightEarX + 2 + Math.sin(earAngle) * 3, earBaseY - 12
    );

    // 귀 안쪽 (분홍색)
    g.fillStyle(0xffb6c1);
    g.fillTriangle(
      leftEarX - 5, earBaseY + 8,
      leftEarX + 2, earBaseY + 8,
      leftEarX - 1, earBaseY - 6
    );
    g.fillTriangle(
      rightEarX - 2, earBaseY + 8,
      rightEarX + 5, earBaseY + 8,
      rightEarX + 1, earBaseY - 6
    );

    // 눈 (상태에 따라 다름)
    g.fillStyle(0x000000);
    const eyeY = y - 15 + this.eyeOffset;

    if (this._state === 'falling') {
      // 놀란 눈
      g.fillCircle(x - 8, eyeY, 5);
      g.fillCircle(x + 8, eyeY, 5);
      g.fillStyle(0xffffff);
      g.fillCircle(x - 9, eyeY - 2, 2);
      g.fillCircle(x + 7, eyeY - 2, 2);
    } else if (this.eyeOffset > 2) {
      // 눈 감음
      g.lineStyle(2, 0x000000);
      g.beginPath();
      g.arc(x - 8, eyeY, 4, 0, Math.PI, false);
      g.strokePath();
      g.beginPath();
      g.arc(x + 8, eyeY, 4, 0, Math.PI, false);
      g.strokePath();
    } else {
      // 일반 눈
      g.fillCircle(x - 8, eyeY, 4);
      g.fillCircle(x + 8, eyeY, 4);
      g.fillStyle(0xffffff);
      g.fillCircle(x - 9, eyeY - 1, 1.5);
      g.fillCircle(x + 7, eyeY - 1, 1.5);
    }

    // 코
    g.fillStyle(0xffb6c1);
    g.fillTriangle(x - 3, y - 8, x + 3, y - 8, x, y - 4);

    // 입 (w 모양)
    g.lineStyle(1.5, 0x000000);
    g.beginPath();
    g.moveTo(x - 5, y - 2);
    g.lineTo(x, y);
    g.lineTo(x + 5, y - 2);
    g.strokePath();

    // 수염
    g.lineStyle(1, 0x666666);
    g.beginPath();
    g.moveTo(x - 12, y - 5);
    g.lineTo(x - 25, y - 8);
    g.moveTo(x - 12, y - 2);
    g.lineTo(x - 25, y - 2);
    g.moveTo(x + 12, y - 5);
    g.lineTo(x + 25, y - 8);
    g.moveTo(x + 12, y - 2);
    g.lineTo(x + 25, y - 2);
    g.strokePath();

    // 발 (idle과 landing 때만 보임)
    if (this._state === 'idle' || this._state === 'landing') {
      g.fillStyle(this.catColor);
      g.fillEllipse(x - 12, y + 25 * bodyScaleY, 10, 6);
      g.fillEllipse(x + 12, y + 25 * bodyScaleY, 10, 6);
    }
  }

  /**
   * 매 프레임 업데이트
   */
  update(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    // 상태 업데이트
    if (body.velocity.y > 0 && this._state === 'jumping') {
      this._state = 'falling';
    }

    // 공중에서 땅에 닿으면 점프 가능하도록
    if (body.blocked.down || body.touching.down) {
      if (this._state === 'falling' || this._state === 'jumping') {
        this.land();
      }
      this.jumpCount = 0;
      this.canJump = true;
    }

    // 애니메이션 타이머
    this.idleTimer++;
    this.tailAngle += 0.1;

    // 눈 깜빡임 (가끔) - 타이머 정리를 위해 추적
    if (this._state === 'idle' && Math.random() < 0.005 && !this.blinkTimer) {
      this.eyeOffset = 3;
      this.blinkTimer = this.scene.time.delayedCall(150, () => {
        this.eyeOffset = 0;
        this.blinkTimer = null;
      });
    }

    // 다시 그리기 필요한 경우만 그리기 (성능 최적화)
    const needsRedraw =
      this._state !== this.lastState ||
      Math.abs(this.x - this.lastX) > 0.1 ||
      Math.abs(this.y - this.lastY) > 0.1 ||
      this._state === 'idle'; // idle 상태는 꼬리 애니메이션을 위해 항상 그림

    if (needsRedraw) {
      this.drawCat();
      this.lastState = this._state;
      this.lastX = this.x;
      this.lastY = this.y;
    }
  }

  /**
   * 리소스 정리
   */
  destroy(fromScene?: boolean): void {
    if (this.blinkTimer) {
      this.blinkTimer.destroy();
      this.blinkTimer = null;
    }
    if (this.catGraphics) {
      this.catGraphics.destroy();
    }
    super.destroy(fromScene);
  }

  /**
   * X 위치 설정 (캔 위에 고정)
   */
  setPositionOnCan(canX: number, canY: number, canHeight: number): void {
    this.setPosition(canX, canY - canHeight / 2 - this.height / 2);
  }

  /**
   * 현재 상태
   */
  get catState(): CatState {
    return this._state;
  }

  /**
   * 점프 중인지 확인
   */
  get isJumping(): boolean {
    return this._state === 'jumping';
  }

  /**
   * 떨어지는 중인지 확인
   */
  get isFalling(): boolean {
    return this._state === 'falling';
  }

  /**
   * 공중에 있는지 확인
   */
  get isInAir(): boolean {
    return this._state === 'jumping' || this._state === 'falling';
  }

  /**
   * 현재 점프 가능 여부
   */
  get canJumpReady(): boolean {
    return this.canJump;
  }
}
