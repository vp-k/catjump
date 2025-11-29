import Phaser from 'phaser';
import { SCENE_KEYS, GAME_CONFIG } from '@config/GameConfig';
import { Cat } from '@entities/Cat';
import { Can, getRandomCanType } from '@entities/Can';
import { GameManager } from '@managers/GameManager';
import { AudioManager } from '@managers/AudioManager';
import { UIManager } from '@managers/UIManager';
import { DebugPanel } from '@utils/DebugPanel';

/**
 * 게임 씬 - 메인 게임플레이
 */
export class GameScene extends Phaser.Scene {
  private cat!: Cat;
  private stackedCans: Can[] = [];
  private currentCan: Can | null = null;
  private canGroup!: Phaser.Physics.Arcade.Group;

  // UI
  private scoreText!: Phaser.GameObjects.Text;
  private floorText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private debugPanel!: DebugPanel;

  // 카메라
  private cameraTargetY = 0;
  private readonly CAMERA_LERP = 0.1;

  constructor() {
    super({ key: SCENE_KEYS.GAME });
  }

  create(): void {
    // 매니저 초기화
    AudioManager.setScene(this);
    UIManager.setScene(this);
    GameManager.startGame();

    this.createBackground();
    this.createCanGroup();
    this.createInitialStack();
    this.createCat();
    this.createUI();
    this.setupInput();
    this.setupCollisions();

    // 디버그 패널
    this.debugPanel = new DebugPanel(this);

    // 첫 번째 캔 스폰
    this.spawnNextCan();
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;

    // 그라데이션 배경
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, width, height * 3);
    bg.setScrollFactor(0.5); // 패럴럭스 효과
  }

  private createCanGroup(): void {
    this.canGroup = this.physics.add.group({
      classType: Can,
      runChildUpdate: true,
    });
    this.stackedCans = [];
  }

  private createInitialStack(): void {
    const { width, height } = this.cameras.main;

    // 초기 캔 (바닥)
    const initialCan = new Can(
      this,
      width / 2,
      height - 100,
      'wide' // 첫 캔은 넓은 캔
    );
    initialCan.stack(0);
    this.stackedCans.push(initialCan);
    this.canGroup.add(initialCan);
  }

  private createCat(): void {
    const { width, height } = this.cameras.main;

    this.cat = new Cat(
      this,
      width / 2,
      height - 100 - GAME_CONFIG.CAN_HEIGHT / 2 - 35
    );
  }

  private createUI(): void {
    const { width } = this.cameras.main;

    // 점수 (좌상단)
    this.scoreText = this.add
      .text(20, 20, '0', {
        fontSize: '28px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setScrollFactor(0)
      .setDepth(100);

    // 층수 (우상단)
    this.floorText = this.add
      .text(width - 20, 20, '0층', {
        fontSize: '28px',
        color: '#4ade80',
        fontStyle: 'bold',
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(100);

    // 콤보 (중앙 상단)
    this.comboText = this.add
      .text(width / 2, 70, '', {
        fontSize: '36px',
        color: '#ffd700',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100);
  }

  private setupInput(): void {
    // 터치/클릭으로 점프
    this.input.on('pointerdown', this.handleJump, this);

    // 스페이스바로 점프
    this.input.keyboard?.on('keydown-SPACE', this.handleJump, this);
  }

  private setupCollisions(): void {
    // 고양이와 캔 충돌
    this.physics.add.collider(
      this.cat,
      this.canGroup,
      this.onCatLandOnCan as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );
  }

  private handleJump(): void {
    if (!GameManager.isPlaying) return;

    if (this.cat.jump()) {
      // 점프 성공 시 현재 캔 이동 시작
      if (this.currentCan && !this.currentCan.isStacked) {
        // 이미 움직이고 있음
      }
    }
  }

  private spawnNextCan(): void {
    const { width } = this.cameras.main;

    // 이전 캔 위치 기준
    const topCan = this.stackedCans[this.stackedCans.length - 1];
    const newY = topCan.y - GAME_CONFIG.CAN_HEIGHT;

    // 층수에 따른 캔 타입 결정
    const canType = getRandomCanType(GameManager.currentFloor);

    // 시작 위치 (화면 밖)
    const direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
    const startX = direction === -1 ? -GAME_CONFIG.CAN_WIDTH : width + GAME_CONFIG.CAN_WIDTH;

    // 속도 계산 (층수에 따라 증가)
    const speed = this.calculateCanSpeed();

    // 새 캔 생성
    this.currentCan = new Can(this, startX, newY, canType, speed);
    this.canGroup.add(this.currentCan);

    // 이동 시작
    this.currentCan.startMoving(-direction as 1 | -1);
  }

  private calculateCanSpeed(): number {
    const floor = GameManager.currentFloor;
    const baseSpeed = 150; // 기본 속도
    const maxSpeed = 400; // 최대 속도

    // 층수에 따라 점진적 증가
    const speed = baseSpeed + Math.min(floor * 8, maxSpeed - baseSpeed);

    return speed;
  }

  private onCatLandOnCan(
    catObj: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    canObj: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ): void {
    const cat = catObj as Cat;
    const can = canObj as Can;

    // 위에서 떨어질 때만 처리
    if (!cat.isFalling && !cat.isJumping) return;
    if (can.isStacked && can !== this.currentCan) return;

    const catBody = cat.body as Phaser.Physics.Arcade.Body;
    if (catBody.velocity.y <= 0) return; // 올라가는 중이면 무시

    // 현재 움직이는 캔에 착지
    if (can === this.currentCan && !can.isStacked) {
      this.processLanding(can);
    }
  }

  private processLanding(can: Can): void {
    // 착지 판정
    const judgment = can.getLandingJudgment(this.cat.x);

    if (judgment === 'miss') {
      // 미스 - 게임 오버
      this.handleMiss();
      return;
    }

    // 캔 스택에 추가
    can.stack(this.stackedCans.length);
    this.stackedCans.push(can);

    // 고양이 착지 처리
    this.cat.land();

    // 층수 증가
    GameManager.incrementFloor();

    // 판정별 처리
    if (judgment === 'perfect') {
      this.handlePerfect(can);
    } else {
      this.handleGood(can);
    }

    // UI 업데이트
    this.updateUI();

    // 카메라 이동
    this.updateCameraTarget();

    // 다음 캔 스폰
    this.currentCan = null;
    this.time.delayedCall(300, () => {
      if (GameManager.isPlaying) {
        this.spawnNextCan();
      }
    });
  }

  private handlePerfect(can: Can): void {
    GameManager.incrementCombo();
    GameManager.incrementPerfect();

    // 점수 계산 (콤보 배율 적용)
    const multiplier = this.getComboMultiplier();
    const points = Math.floor(GAME_CONFIG.SCORE_PERFECT * multiplier);
    GameManager.addScore(points);

    // 코인 보상
    GameManager.collectCoin(can.coinReward);

    // 사운드 & 이펙트
    AudioManager.playLand('perfect');
    UIManager.showJudgment(can.x, can.y - 50, 'perfect');
    UIManager.showFloatingText(can.x, can.y - 80, `+${points}`, '#ffd700');

    // 퍼펙트 이펙트
    this.showPerfectEffect(can.x, can.y);
  }

  private handleGood(can: Can): void {
    // 콤보 유지 (Good도 콤보 유지)
    GameManager.incrementCombo();

    // 점수
    const points = GAME_CONFIG.SCORE_GOOD;
    GameManager.addScore(points);

    // 코인 보상 (Good은 50% 확률)
    if (Math.random() < 0.5) {
      GameManager.collectCoin(can.coinReward);
    }

    // 사운드 & 이펙트
    AudioManager.playLand('good');
    UIManager.showJudgment(can.x, can.y - 50, 'good');
    UIManager.showFloatingText(can.x, can.y - 80, `+${points}`, '#4ade80');
  }

  private handleMiss(): void {
    GameManager.resetCombo();
    AudioManager.playLand('miss');

    // 고양이 떨어짐
    this.cat.fall();

    // 잠시 후 게임 오버
    this.time.delayedCall(1000, () => {
      this.gameOver();
    });
  }

  private getComboMultiplier(): number {
    const combo = GameManager.currentCombo;
    const multipliers = GAME_CONFIG.COMBO_MULTIPLIERS;

    let result = 1;
    for (const [threshold, mult] of Object.entries(multipliers)) {
      if (combo >= parseInt(threshold)) {
        result = mult;
      }
    }
    return result;
  }

  private showPerfectEffect(x: number, y: number): void {
    // 파티클 효과
    const particles = this.add.particles(x, y, 'can', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.3, end: 0 },
      lifespan: 500,
      quantity: 8,
      tint: [0xffd700, 0xffff00],
    });

    this.time.delayedCall(500, () => {
      particles.destroy();
    });
  }

  private updateUI(): void {
    this.scoreText.setText(`${GameManager.currentScore}`);
    this.floorText.setText(`${GameManager.currentFloor}층`);

    // 콤보 표시
    const combo = GameManager.currentCombo;
    if (combo >= 2) {
      this.comboText.setText(`${combo} COMBO!`);
      this.tweens.add({
        targets: this.comboText,
        scale: 1.3,
        duration: 100,
        yoyo: true,
      });
    } else {
      this.comboText.setText('');
    }
  }

  private updateCameraTarget(): void {
    const topCan = this.stackedCans[this.stackedCans.length - 1];
    const { height } = this.cameras.main;

    // 타워가 화면 중앙보다 위로 올라가면 카메라 이동
    const threshold = height * 0.4;
    if (topCan.y < threshold) {
      this.cameraTargetY = threshold - topCan.y;
    }
  }

  private gameOver(): void {
    GameManager.endGame();

    this.scene.start(SCENE_KEYS.GAME_OVER, {
      score: GameManager.currentScore,
      floor: GameManager.currentFloor,
      isNewRecord: GameManager.isNewRecord,
    });
  }

  update(time: number, delta: number): void {
    if (!GameManager.isPlaying) return;

    // 고양이 업데이트
    this.cat.update();

    // 현재 캔 업데이트
    this.currentCan?.update();

    // 카메라 부드럽게 이동
    if (this.cameraTargetY > 0) {
      const currentScroll = this.cameras.main.scrollY;
      const targetScroll = -this.cameraTargetY;
      const newScroll = Phaser.Math.Linear(currentScroll, targetScroll, this.CAMERA_LERP);
      this.cameras.main.setScroll(0, newScroll);
    }

    // 고양이가 화면 밖으로 떨어지면 게임 오버
    const catWorldY = this.cat.y - this.cameras.main.scrollY;
    if (catWorldY > this.cameras.main.height + 200) {
      this.gameOver();
    }

    // 디버그 패널 업데이트
    this.debugPanel.update(time, delta);
  }
}
