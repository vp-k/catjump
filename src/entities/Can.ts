import Phaser from 'phaser';
import { GAME_CONFIG, DIFFICULTY_CONFIG } from '@config/GameConfig';
import { IMAGE_KEYS } from '@config/AssetConfig';

export type CanType = 'normal' | 'wide' | 'narrow' | 'golden' | 'shake' | 'gift' | 'trap';

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
  trap: {
    width: GAME_CONFIG.CAN_WIDTH,
    texture: IMAGE_KEYS.CAN_TRAP,
    coinReward: 0,
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
  private specialTween: Phaser.Tweens.Tween | null = null;

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
    if (!body) return;

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
      this.specialTween = this.scene.tweens.add({
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
    if (!body) return;
    body.setVelocityX(this.moveSpeed * this.moveDirection);
  }

  /**
   * 이동 정지
   */
  stopMoving(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;
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
    if (!body) return;

    // 이동 중일 때만 경계 체크 (성능 최적화)
    if (body.velocity.x !== 0) {
      const { width } = this.scene.cameras.main;
      const halfWidth = this._canWidth / 2;

      // 화면 경계에서 방향 전환
      if (this.x <= halfWidth) {
        this.setX(halfWidth);
        this.moveDirection = 1;
        body.setVelocityX(this.moveSpeed);
      } else if (this.x >= width - halfWidth) {
        this.setX(width - halfWidth);
        this.moveDirection = -1;
        body.setVelocityX(-this.moveSpeed);
      }
    }

    // 흔들리는 캔 효과 - 물리엔진과 충돌하지 않도록 시각적 오프셋만 적용
    if (this._canType === 'shake' && body.velocity.x !== 0) {
      const shakeOffset = Math.sin(this.scene.time.now * 0.01) * 2;
      this.setX(body.x + body.halfWidth + shakeOffset);
    }
  }

  /**
   * 리소스 정리
   */
  destroy(fromScene?: boolean): void {
    if (this.specialTween) {
      this.specialTween.destroy();
      this.specialTween = null;
    }
    super.destroy(fromScene);
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

    // Good 존 - 캔 위에 있으면 최소 Good (70% 이상도 Good)
    return 'good';
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
 * DIFFICULTY_CONFIG.SPECIAL_CAN_FLOORS 기반
 */
export function getRandomCanType(floor: number): CanType {
  const { SPECIAL_CAN_FLOORS } = DIFFICULTY_CONFIG;
  const random = Math.random();

  // 선물 캔은 10층 단위에서만 등장 (25층 이상)
  if (floor >= SPECIAL_CAN_FLOORS.GIFT && floor % 10 === 0) {
    return 'gift';
  }

  // 황금캔 확률 (10층 이상)
  if (floor >= SPECIAL_CAN_FLOORS.GOLDEN && random < 0.05) {
    return 'golden';
  }

  // 함정캔 확률 (20층 이상)
  if (floor >= SPECIAL_CAN_FLOORS.TRAP && random < 0.08) {
    return 'trap';
  }

  // 흔들리는캔 확률 (30층 이상)
  if (floor >= SPECIAL_CAN_FLOORS.WOBBLY && random < 0.12) {
    return 'shake';
  }

  // 넓은캔 확률 (15층 이상, 난이도 완화용)
  if (floor >= SPECIAL_CAN_FLOORS.WIDE && random < 0.15) {
    return 'wide';
  }

  // 좁은캔 확률 (층수에 따라 증가)
  const narrowChance = floor > 20 ? 0.25 : floor > 10 ? 0.15 : 0.05;
  if (random < narrowChance) {
    return 'narrow';
  }

  return 'normal';
}
