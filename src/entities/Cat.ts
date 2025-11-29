import Phaser from 'phaser';
import { GAME_CONFIG } from '@config/GameConfig';
import { AudioManager } from '@managers/AudioManager';

export type CatState = 'idle' | 'jumping' | 'falling' | 'landing';

/**
 * 고양이 엔티티 - 플레이어 캐릭터
 */
export class Cat extends Phaser.Physics.Arcade.Sprite {
  private _state: CatState = 'idle';
  private canJump = true;
  private jumpCount = 0;
  private readonly MAX_JUMPS = 1; // 1단 점프 (나중에 2단 점프 업그레이드 가능)

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'cat');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setupPhysics();
  }

  private setupPhysics(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    body.setCollideWorldBounds(true);
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
   * 매 프레임 업데이트
   */
  update(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

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
}
