import Phaser from 'phaser';
import { GAME_CONFIG } from '@config/GameConfig';
import { IMAGE_KEYS } from '@config/AssetConfig';

export type CanType = 'normal' | 'wide' | 'narrow' | 'golden' | 'shake' | 'gift';

interface CanConfig {
  width: number;
  texture: string;
  coinReward: number;
  special?: boolean;
}

const CAN_CONFIGS: Record<CanType, CanConfig> = {
  normal: {
    width: GAME_CONFIG.CAN_WIDTH,
    texture: IMAGE_KEYS.CAN_TUNA,
    coinReward: 1,
  },
  wide: {
    width: GAME_CONFIG.CAN_WIDTH * 1.3,
    texture: IMAGE_KEYS.CAN_WIDE,
    coinReward: 1,
  },
  narrow: {
    width: GAME_CONFIG.CAN_WIDTH * 0.7,
    texture: IMAGE_KEYS.CAN_NARROW,
    coinReward: 2,
  },
  golden: {
    width: GAME_CONFIG.CAN_WIDTH,
    texture: IMAGE_KEYS.CAN_GOLDEN,
    coinReward: 5,
    special: true,
  },
  shake: {
    width: GAME_CONFIG.CAN_WIDTH,
    texture: IMAGE_KEYS.CAN_SHAKE,
    coinReward: 1,
    special: true,
  },
  gift: {
    width: GAME_CONFIG.CAN_WIDTH,
    texture: IMAGE_KEYS.CAN_GIFT,
    coinReward: 10,
    special: true,
  },
};

/**
 * 캔 엔티티 - 스태킹 블록
 */
export class Can extends Phaser.Physics.Arcade.Sprite {
  private _canType: CanType;
  private _isStacked = false;
  private _stackOrder = 0;
  private moveDirection: 1 | -1 = 1;
  private moveSpeed: number;
  private _canWidth: number;
  private _coinReward: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: CanType = 'normal',
    speed?: number
  ) {
    const config = CAN_CONFIGS[type];
    // 텍스처가 로드되지 않았으면 플레이스홀더 사용
    const texture = scene.textures.exists(config.texture) ? config.texture : 'can';

    super(scene, x, y, texture);

    this._canType = type;
    this._canWidth = config.width;
    this._coinReward = config.coinReward;
    this.moveSpeed = speed ?? GAME_CONFIG.CAN_BASE_SPEED;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setupPhysics();
    this.setupVisual();
  }

  private setupPhysics(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    body.setImmovable(true);
    body.setAllowGravity(false);
    body.setSize(this._canWidth, GAME_CONFIG.CAN_HEIGHT);
  }

  private setupVisual(): void {
    // 캔 너비에 맞게 스케일 조정
    const scaleX = this._canWidth / GAME_CONFIG.CAN_WIDTH;
    this.setScale(scaleX, 1);

    // 특수 캔 효과
    if (CAN_CONFIGS[this._canType].special) {
      this.scene.tweens.add({
        targets: this,
        alpha: 0.8,
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  /**
   * 좌우 이동 시작
   */
  startMoving(direction: 1 | -1 = 1): void {
    this.moveDirection = direction;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(this.moveSpeed * this.moveDirection);
  }

  /**
   * 이동 정지
   */
  stopMoving(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(0);
  }

  /**
   * 스택에 고정
   */
  stack(order: number): void {
    this._isStacked = true;
    this._stackOrder = order;
    this.stopMoving();

    // 스택 애니메이션
    this.scene.tweens.add({
      targets: this,
      scaleY: 0.9,
      duration: 50,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }

  /**
   * 매 프레임 업데이트
   */
  update(): void {
    if (this._isStacked) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    const { width } = this.scene.cameras.main;

    // 화면 경계에서 방향 전환
    const halfWidth = this._canWidth / 2;
    if (this.x <= halfWidth) {
      this.x = halfWidth;
      this.moveDirection = 1;
      body.setVelocityX(this.moveSpeed);
    } else if (this.x >= width - halfWidth) {
      this.x = width - halfWidth;
      this.moveDirection = -1;
      body.setVelocityX(-this.moveSpeed);
    }

    // 흔들리는 캔 효과
    if (this._canType === 'shake' && !this._isStacked) {
      this.x += Math.sin(this.scene.time.now * 0.01) * 2;
    }
  }

  /**
   * 착지 위치 판정
   */
  getLandingJudgment(catX: number): 'perfect' | 'good' | 'miss' {
    const distance = Math.abs(catX - this.x);
    const halfWidth = this._canWidth / 2;

    // 완전히 벗어남
    if (distance > halfWidth) {
      return 'miss';
    }

    // Perfect 존 (중앙 40%)
    const perfectZone = halfWidth * GAME_CONFIG.PERFECT_ZONE;
    if (distance <= perfectZone) {
      return 'perfect';
    }

    // Good 존 (중앙 70%)
    const goodZone = halfWidth * GAME_CONFIG.GOOD_ZONE;
    if (distance <= goodZone) {
      return 'good';
    }

    return 'miss';
  }

  // Getters
  get canType(): CanType {
    return this._canType;
  }

  get isStacked(): boolean {
    return this._isStacked;
  }

  get stackOrder(): number {
    return this._stackOrder;
  }

  get canWidth(): number {
    return this._canWidth;
  }

  get coinReward(): number {
    return this._coinReward;
  }

  get canHeight(): number {
    return GAME_CONFIG.CAN_HEIGHT;
  }
}

/**
 * 캔 타입 랜덤 생성 (층수에 따른 확률)
 */
export function getRandomCanType(floor: number): CanType {
  const random = Math.random();

  // 층수에 따른 확률 조정
  let wideChance = 0.15;
  let narrowChance = floor > 10 ? 0.25 : 0.1;
  const goldenChance = 0.03;
  let shakeChance = floor > 10 ? 0.1 : 0.02;

  if (floor > 20) {
    narrowChance = 0.3;
    shakeChance = 0.15;
  }

  // 선물 캔은 특정 층에서만
  if (floor % 10 === 0 && floor > 0) {
    return 'gift';
  }

  if (random < goldenChance) return 'golden';
  if (random < goldenChance + shakeChance) return 'shake';
  if (random < goldenChance + shakeChance + narrowChance) return 'narrow';
  if (random < goldenChance + shakeChance + narrowChance + wideChance) return 'wide';

  return 'normal';
}
