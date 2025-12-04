import Phaser from 'phaser';
import { SCENE_KEYS, GAME_CONFIG } from '@config/GameConfig';
import { Cat } from '@entities/Cat';
import { Can, getRandomCanType } from '@entities/Can';
import { GameManager } from '@managers/GameManager';
import { AudioManager } from '@managers/AudioManager';
import { UIManager } from '@managers/UIManager';
import { MedalManager } from '@managers/MedalManager';
import { TutorialManager } from '@managers/TutorialManager';
import { PsychologyManager } from '@managers/PsychologyManager';
import { getMedalInfo } from '@config/MedalConfig';
import { DebugPanel } from '@utils/DebugPanel';
import { GhostService, ReplayData } from '@services/GhostService';

/**
 * 게임 씬 - 메인 게임플레이
 */
// 디버그 모드 (테스트 후 false로 변경)
const DEBUG_GAME = true;

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

  // 튜토리얼
  private isTutorialActive = false;

  // 타이머 추적 (메모리 누수 방지)
  private pendingTimers: Phaser.Time.TimerEvent[] = [];
  private isShuttingDown = false;

  // 고스트 레이스
  private ghostReplay: ReplayData | null = null;
  private ghostCat: Phaser.GameObjects.Container | null = null;
  private ghostStartTime: number = 0;
  private ghostFloorText: Phaser.GameObjects.Text | null = null;
  private ghostUpdateTimer: Phaser.Time.TimerEvent | null = null;
  private readonly GHOST_UPDATE_INTERVAL = 500; // 0.5초마다 고스트 업데이트

  constructor() {
    super({ key: SCENE_KEYS.GAME });
  }

  create(): void {
    // 상태 초기화
    this.isShuttingDown = false;
    this.pendingTimers = [];

    // 매니저 초기화
    AudioManager.setScene(this);
    UIManager.setScene(this);
    PsychologyManager.setScene(this);
    GameManager.startGame();
    MedalManager.startGame();
    PsychologyManager.startGame();

    this.createBackground();
    this.createCanGroup();
    this.createInitialStack();
    this.createCat();
    this.createUI();
    this.setupInput();
    this.setupCollisions();

    if (DEBUG_GAME) {
      console.log('[GameScene] 초기화 완료');
      console.log('[GameScene] 첫 캔:', this.stackedCans[0]?.x, this.stackedCans[0]?.y);
      console.log('[GameScene] 고양이:', this.cat.x, this.cat.y);
    }

    // 디버그 패널
    this.debugPanel = new DebugPanel(this);

    // 튜토리얼 시작
    this.startTutorial();

    // 고스트 레이스 초기화
    this.initGhostRace();

    // 첫 번째 캔 스폰
    this.spawnNextCan();
  }

  /**
   * 고스트 레이스 초기화
   */
  private async initGhostRace(): Promise<void> {
    try {
      // 녹화 시작
      GhostService.startRecording();
      this.ghostStartTime = Date.now();

      // 개인 최고 기록 고스트 로드
      const personalBest = await GhostService.loadPersonalBest();
      if (personalBest) {
        this.ghostReplay = personalBest;
        this.createGhostCat();
        this.startGhostUpdateTimer();
        console.log(`[GameScene] 고스트 로드: ${personalBest.score}점, ${personalBest.floor}층`);
      }
    } catch (error) {
      console.warn('[GameScene] 고스트 초기화 실패:', error);
      // 고스트 실패해도 게임은 계속
    }
  }

  /**
   * 고스트 업데이트 타이머 시작 (성능 최적화)
   */
  private startGhostUpdateTimer(): void {
    // 기존 타이머 정리
    if (this.ghostUpdateTimer) {
      this.ghostUpdateTimer.destroy();
    }

    // 0.5초마다 고스트 업데이트 (매 프레임 대신)
    this.ghostUpdateTimer = this.time.addEvent({
      delay: this.GHOST_UPDATE_INTERVAL,
      callback: this.updateGhost,
      callbackScope: this,
      loop: true,
    });
  }

  /**
   * 고스트 고양이 생성
   */
  private createGhostCat(): void {
    if (!this.ghostReplay) return;

    const { width, height } = this.cameras.main;

    // 고스트 컨테이너
    this.ghostCat = this.add.container(width / 2, height - 100 - GAME_CONFIG.CAN_HEIGHT / 2 - 35);
    this.ghostCat.setAlpha(0.4);
    this.ghostCat.setDepth(5);

    // 고스트 몸체 (반투명 고양이)
    const ghostBody = this.add.rectangle(0, 0, 50, 50, 0x4ade80, 0.5);
    ghostBody.setStrokeStyle(2, 0x4ade80, 0.7);

    // 고스트 라벨
    const ghostLabel = this.add.text(0, -40, 'BEST', {
      fontSize: '12px',
      color: '#4ade80',
    }).setOrigin(0.5);

    this.ghostCat.add([ghostBody, ghostLabel]);

    // 고스트 층수 표시
    this.ghostFloorText = this.add.text(width - 20, 55, '', {
      fontSize: '14px',
      color: '#4ade80',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);
  }

  /**
   * 튜토리얼 시작
   */
  private startTutorial(): void {
    TutorialManager.setScene(this);
    TutorialManager.setOnComplete(() => {
      this.isTutorialActive = false;
    });

    this.isTutorialActive = TutorialManager.startTutorial();
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
      allowGravity: false,  // 캔은 중력 영향 받지 않음
      immovable: true,      // 충돌 시 밀리지 않음
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

  /**
   * 안전한 타이머 생성 (자동 정리)
   */
  private safeDelayedCall(delay: number, callback: () => void): Phaser.Time.TimerEvent | null {
    if (this.isShuttingDown) return null;

    const timer = this.time.delayedCall(delay, () => {
      // 타이머 목록에서 제거
      const index = this.pendingTimers.indexOf(timer);
      if (index > -1) {
        this.pendingTimers.splice(index, 1);
      }
      // 씬이 아직 활성 상태일 때만 콜백 실행
      if (!this.isShuttingDown) {
        callback();
      }
    });

    this.pendingTimers.push(timer);
    return timer;
  }

  /**
   * 씬 종료 시 정리 (메모리 누수 방지)
   */
  shutdown(): void {
    this.isShuttingDown = true;

    // 대기 중인 타이머 모두 제거
    for (const timer of this.pendingTimers) {
      timer.destroy();
    }
    this.pendingTimers = [];

    // 입력 이벤트 리스너 제거
    this.input.off('pointerdown', this.handleJump, this);
    this.input.keyboard?.off('keydown-SPACE', this.handleJump, this);

    // 고스트 레이스 정리
    if (GhostService.isCurrentlyRecording()) {
      GhostService.cancelRecording();
    }
    if (this.ghostUpdateTimer) {
      this.ghostUpdateTimer.destroy();
      this.ghostUpdateTimer = null;
    }
    this.ghostReplay = null;
    this.ghostCat = null;
    this.ghostFloorText = null;

    // 디버그 패널 정리
    if (this.debugPanel) {
      this.debugPanel.destroy();
    }

    // 캔 그룹 정리
    this.stackedCans = [];
    this.currentCan = null;
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

    // 튜토리얼 탭 이벤트
    if (this.isTutorialActive) {
      TutorialManager.onTap();
    }

    if (DEBUG_GAME) {
      console.log('[GameScene] 점프 시도:', {
        catY: this.cat.y,
        currentCan: this.currentCan?.x,
        canY: this.currentCan?.y,
      });
    }

    if (this.cat.jump()) {
      // 고스트 녹화 - 점프 액션
      GhostService.recordAction({
        type: 'jump',
        x: this.cat.x,
        y: this.cat.y,
      });

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
    const moveDir = -direction as 1 | -1;
    this.currentCan.startMoving(moveDir);

    if (DEBUG_GAME) {
      const canBody = this.currentCan.body as Phaser.Physics.Arcade.Body;
      console.log('[GameScene] 캔 스폰:', {
        floor: GameManager.currentFloor,
        type: canType,
        startX,
        y: newY,
        speed,
        direction: moveDir,
        velocityX: canBody?.velocity.x,
        hasBody: !!canBody,
      });
    }
  }

  private calculateCanSpeed(): number {
    const floor = GameManager.currentFloor;
    const baseSpeed = 150; // 기본 속도
    const maxSpeed = 400; // 최대 속도

    // 층수에 따라 점진적 증가
    let speed = baseSpeed + Math.min(floor * 8, maxSpeed - baseSpeed);

    // Mercy 시스템 - 동적 난이도 적용
    speed *= PsychologyManager.getSpeedMultiplier();

    return speed;
  }

  private onCatLandOnCan(
    catObj: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    canObj: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ): void {
    const cat = catObj as Cat;
    const can = canObj as Can;
    const catBody = cat.body as Phaser.Physics.Arcade.Body;

    // 항상 충돌 로그 남기기
    console.log('[충돌]', {
      catX: Math.round(cat.x),
      catY: Math.round(cat.y),
      canX: Math.round(can.x),
      canY: Math.round(can.y),
      catState: cat.catState,
      isInAir: cat.isInAir,
      velocityY: catBody ? Math.round(catBody.velocity.y) : 'no body',
      isCurrentCan: can === this.currentCan,
      isStacked: can.isStacked,
    });

    // 씬 종료 중이면 무시
    if (this.isShuttingDown) {
      console.log('[충돌] 무시: 씬 종료 중');
      return;
    }

    // 현재 캔이 아니면 무시 (이미 스택된 캔과의 충돌)
    if (can !== this.currentCan) {
      console.log('[충돌] 무시: 현재 캔이 아님');
      return;
    }

    // 이미 스택된 캔이면 무시 (이미 처리됨)
    if (can.isStacked) {
      console.log('[충돌] 무시: 이미 스택됨');
      return;
    }

    // 고양이가 올라가는 중일 때만 무시 (아래로 떨어지거나 이미 멈춘 경우는 착지로 인정)
    if (!catBody || catBody.velocity.y < 0) {
      console.log('[충돌] 무시: 상승 중 (velocity.y:', catBody?.velocity.y, ')');
      return;
    }

    console.log('[충돌] ✅ 착지 처리 시작!');

    // 중요: 충돌 시점의 위치를 먼저 캡처
    // (캔이 계속 움직이므로 충돌 시점의 위치로 판정해야 함)
    const catXAtCollision = this.cat.x;
    const canXAtCollision = can.x;

    // 캔 즉시 정지 (착지 판정 전에)
    can.stopMoving();

    // 착지 처리 (충돌 시점의 위치 전달)
    this.processLanding(can, catXAtCollision, canXAtCollision);
  }

  private processLanding(can: Can, catX: number, canX: number): void {
    // 착지 판정 (충돌 시점의 위치 사용)
    const distance = Math.abs(catX - canX);
    const halfWidth = can.canWidth / 2;

    // 중요: 물리 충돌이 발생했다는 것은 고양이가 캔의 충돌 박스 안에 있다는 것
    // 따라서 충돌이 발생했으면 최소 good 판정 (miss는 충돌 자체가 안됨)
    let judgment: 'perfect' | 'good';
    if (distance <= halfWidth * GAME_CONFIG.PERFECT_ZONE) {
      judgment = 'perfect';
    } else {
      judgment = 'good';
    }

    console.log('[착지판정]', {
      judgment,
      catX: Math.round(catX),
      canX: Math.round(canX),
      distance: Math.round(distance),
      halfWidth: Math.round(halfWidth),
      perfectZone: Math.round(halfWidth * GAME_CONFIG.PERFECT_ZONE),
    });

    // Near-Miss 체크 (착지 직전 가장자리)
    const isLandingNearMiss = distance > halfWidth * 0.7;

    // Near-Miss 성공 시 보너스
    if (isLandingNearMiss && judgment === 'good') {
      this.showNearMissSuccess(can);
    }

    // 함정캔 - 즉시 게임오버
    if (can.canType === 'trap') {
      this.handleTrapCan(can);
      return;
    }

    // 캔 스택에 추가
    can.stack(this.stackedCans.length);
    this.stackedCans.push(can);

    // 고양이 착지 처리
    this.cat.land();

    // 층수 증가
    GameManager.incrementFloor();

    // 특수 캔 효과 처리
    if (can.canType === 'gift') {
      this.handleGiftCan(can);
    } else if (can.canType === 'golden') {
      this.handleGoldenCan(can);
    }

    // 고스트 녹화 - 착지 액션
    GhostService.recordAction({
      type: 'land',
      x: this.cat.x,
      y: this.cat.y,
      floor: GameManager.currentFloor,
      landingType: judgment,
    });

    // 판정별 처리
    if (judgment === 'perfect') {
      this.handlePerfect(can);
    } else {
      this.handleGood(can);
    }

    // 튜토리얼 착지 이벤트
    if (this.isTutorialActive) {
      TutorialManager.onLand();
    }

    // UI 업데이트
    this.updateUI();

    // 카메라 이동
    this.updateCameraTarget();

    // 다음 캔 스폰
    this.currentCan = null;
    this.safeDelayedCall(300, () => {
      if (GameManager.isPlaying) {
        this.spawnNextCan();
      }
    });
  }

  /*
  // 나중에 miss 판정 시 사용 (현재 충돌 기반으로 miss 없음)
  private showLandingNearMiss(can: Can): void {
    // 슬로우 모션 효과
    const config = MedalManager.getSlowMotionConfig();
    this.time.timeScale = config.scale;

    // Near-Miss 텍스트
    UIManager.showFloatingText(can.x, can.y - 100, 'Near Miss!', '#ff6b6b');

    // 심리 엔진 - Near-Miss 반응
    PsychologyManager.onNearMiss();

    // 슬로우 모션 해제
    this.safeDelayedCall(config.duration * config.scale, () => {
      this.time.timeScale = 1;
    });
  }
  */

  private showNearMissSuccess(can: Can): void {
    // 아슬아슬하게 성공
    UIManager.showFloatingText(can.x, can.y - 120, '아슬아슬!', '#ffd700');

    // 보너스 점수
    const bonusPoints = 5;
    GameManager.addScore(bonusPoints);
    UIManager.showFloatingText(can.x + 50, can.y - 100, `+${bonusPoints}`, '#4ade80');
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

    // 콤보 파티클 (마일스톤에서 강화)
    this.showComboEffect(can.x, can.y);

    // 튜토리얼 이벤트
    if (this.isTutorialActive) {
      TutorialManager.onPerfect();
      if (GameManager.currentCombo >= 2) {
        TutorialManager.onCombo();
      }
    }

    // 심리 엔진 이벤트
    PsychologyManager.onPerfect();

    // 콤보 마일스톤 체크
    const combo = GameManager.currentCombo;
    if (combo === 3 || combo === 5 || combo === 10 || combo % 10 === 0) {
      PsychologyManager.onComboMilestone(combo);
    }
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

    // 심리 엔진 이벤트
    PsychologyManager.onGood();
  }

  /*
  // 나중에 miss 판정 시 사용 (현재 충돌 기반으로 miss 없음 - 화면 밖 낙하는 update에서 처리)
  private handleMiss(): void {
    GameManager.resetCombo();
    AudioManager.playLand('miss');

    // 심리 엔진 - 손실 회피 효과
    PsychologyManager.onFail();

    // 고양이 떨어짐
    this.cat.fall();

    // 잠시 후 게임 오버
    this.safeDelayedCall(1000, () => {
      this.gameOver();
    });
  }
  */

  private handleTrapCan(can: Can): void {
    // 함정캔 - 즉시 게임오버
    GameManager.resetCombo();
    AudioManager.playLand('miss');

    // 심리 엔진 - 함정캔 반응
    PsychologyManager.onTrap();
    PsychologyManager.onFail();

    // 함정 이펙트
    this.showTrapEffect(can.x, can.y);
    UIManager.showJudgment(can.x, can.y - 50, 'miss');
    UIManager.showFloatingText(can.x, can.y - 80, '함정!', '#ff4444');

    // 고양이 떨어짐
    this.cat.fall();

    this.safeDelayedCall(1000, () => {
      this.gameOver();
    });
  }

  private handleGiftCan(can: Can): void {
    // 선물캔 - 랜덤 보상
    const bonusCoins = Phaser.Math.Between(5, 20);
    const bonusDiamonds = Math.random() < 0.3 ? Phaser.Math.Between(1, 3) : 0;

    GameManager.collectCoin(bonusCoins);
    if (bonusDiamonds > 0) {
      // 다이아몬드 보상
      UIManager.showFloatingText(can.x + 30, can.y - 100, `+${bonusDiamonds}💎`, '#00bfff');
    }

    // 선물 이펙트
    this.showGiftEffect(can.x, can.y);
    UIManager.showFloatingText(can.x, can.y - 120, '선물!', '#ff69b4');
    AudioManager.playGiftOpen();
  }

  private handleGoldenCan(can: Can): void {
    // 황금캔 - 3배 점수 보너스 (코인은 Can에서 이미 5배)
    const bonusPoints = GAME_CONFIG.SCORE_PERFECT * 2; // 추가 점수
    GameManager.addScore(bonusPoints);

    // 황금 이펙트
    this.showGoldenEffect(can.x, can.y);
    UIManager.showFloatingText(can.x, can.y - 100, '황금캔!', '#ffd700');
  }

  private showTrapEffect(x: number, y: number): void {
    // 빨간색 경고 이펙트
    const flash = this.add.rectangle(x, y, 200, 100, 0xff0000, 0.5);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2,
      duration: 500,
      onComplete: () => flash.destroy(),
    });
  }

  private showGiftEffect(x: number, y: number): void {
    // 화려한 파티클
    const colors = [0xff69b4, 0x00ffff, 0xffff00, 0x00ff00];
    colors.forEach((color, i) => {
      const angle = (i / colors.length) * Math.PI * 2;
      const particle = this.add.circle(x, y, 8, color);
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 80,
        y: y + Math.sin(angle) * 80,
        alpha: 0,
        duration: 600,
        onComplete: () => particle.destroy(),
      });
    });
  }

  private showGoldenEffect(x: number, y: number): void {
    // 황금빛 파티클
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const particle = this.add.circle(x, y, 6, 0xffd700);
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 60,
        y: y + Math.sin(angle) * 60,
        alpha: 0,
        scale: 0.5,
        duration: 500,
        onComplete: () => particle.destroy(),
      });
    }
  }

  private showComboEffect(x: number, y: number): void {
    const combo = GameManager.currentCombo;

    // 콤보 마일스톤 (3, 5, 10, 20...)
    const isMilestone = combo === 3 || combo === 5 || combo === 10 || combo % 10 === 0;

    if (combo < 2) return;

    // 기본 콤보 파티클
    const particleCount = Math.min(combo, 8);
    const baseColor = combo >= 10 ? 0xff6b6b : combo >= 5 ? 0xffd700 : 0x4ade80;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 40 + combo * 3;
      const size = 4 + Math.min(combo, 10);

      const particle = this.add.circle(x, y, size, baseColor);
      particle.setAlpha(0.8);

      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance - 30,
        alpha: 0,
        scale: 0.3,
        duration: 400 + combo * 20,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy(),
      });
    }

    // 마일스톤 특별 이펙트
    if (isMilestone) {
      AudioManager.playComboMilestone();

      // 화면 플래시
      const flash = this.add.rectangle(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        this.cameras.main.width,
        this.cameras.main.height,
        baseColor,
        0.3
      );
      flash.setScrollFactor(0);
      flash.setDepth(1000);

      this.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 300,
        onComplete: () => flash.destroy(),
      });

      // 콤보 텍스트 강조
      const comboText = this.add
        .text(x, y - 120, `${combo} COMBO!`, {
          fontSize: `${32 + combo}px`,
          color: combo >= 10 ? '#ff6b6b' : '#ffd700',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 4,
        })
        .setOrigin(0.5)
        .setDepth(100);

      this.tweens.add({
        targets: comboText,
        y: y - 180,
        scale: 1.5,
        alpha: 0,
        duration: 800,
        ease: 'Back.easeOut',
        onComplete: () => comboText.destroy(),
      });

      // 원형 충격파 이펙트
      const shockwave = this.add.circle(x, y, 20, baseColor, 0);
      shockwave.setStrokeStyle(4, baseColor);

      this.tweens.add({
        targets: shockwave,
        scale: 3,
        alpha: 0,
        duration: 500,
        onComplete: () => shockwave.destroy(),
      });
    }
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

    this.safeDelayedCall(500, () => {
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

    // 메달 체크
    this.checkMedals();
  }

  private checkMedals(): void {
    const result = MedalManager.checkMedals(GameManager.currentScore, GameManager.currentFloor);

    // 새 메달 획득
    for (const newMedal of result.newMedals) {
      this.showMedalEarned(newMedal.type);
    }

    // Near-Miss 감지
    if (result.nearMiss) {
      this.showNearMissWarning(result.nearMiss);
    }
  }

  private showMedalEarned(medalType: string): void {
    const { width, height } = this.cameras.main;
    const medalInfo = getMedalInfo(medalType as 'bronze' | 'silver' | 'gold' | 'platinum');

    // 화면 플래시
    const flash = this.add.rectangle(width / 2, height / 2, width, height, medalInfo.color, 0.4);
    flash.setScrollFactor(0);
    flash.setDepth(1000);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy(),
    });

    // 메달 아이콘 (원형)
    const medalIcon = this.add.circle(width / 2, height / 2, 60, medalInfo.color);
    medalIcon.setScrollFactor(0);
    medalIcon.setDepth(1001);
    medalIcon.setStrokeStyle(4, 0xffffff);

    // 메달 텍스트
    const medalText = this.add
      .text(width / 2, height / 2 + 100, `${medalInfo.nameKo} 메달 획득!`, {
        fontSize: '32px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1001);

    // 애니메이션
    this.tweens.add({
      targets: [medalIcon, medalText],
      scale: { from: 0.5, to: 1.2 },
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.safeDelayedCall(1000, () => {
          this.tweens.add({
            targets: [medalIcon, medalText],
            alpha: 0,
            y: '-=50',
            duration: 500,
            onComplete: () => {
              medalIcon.destroy();
              medalText.destroy();
            },
          });
        });
      },
    });

    AudioManager.playNewRecord();
  }

  private showNearMissWarning(targetMedal: string): void {
    const { width } = this.cameras.main;
    const medalInfo = getMedalInfo(targetMedal as 'bronze' | 'silver' | 'gold' | 'platinum');

    // Near-Miss 경고
    const warningText = this.add
      .text(width / 2, 150, `${medalInfo.nameKo} 메달까지 조금만 더!`, {
        fontSize: '24px',
        color: `#${medalInfo.color.toString(16)}`,
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100)
      .setAlpha(0);

    this.tweens.add({
      targets: warningText,
      alpha: 1,
      duration: 300,
      yoyo: true,
      repeat: 2,
      onComplete: () => warningText.destroy(),
    });
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

  private async gameOver(): Promise<void> {
    // 이미 종료 중이면 무시
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    GameManager.endGame();

    // 고스트 녹화 종료 및 저장 (에러 발생해도 게임은 계속)
    try {
      await GhostService.stopRecording(GameManager.currentScore, GameManager.currentFloor);
    } catch (error) {
      console.warn('[GameScene] 고스트 저장 실패:', error);
    }

    // 씬이 아직 활성 상태인지 확인
    if (!this.scene.isActive(SCENE_KEYS.GAME)) return;

    // 심리 엔진 - 게임 종료 처리
    PsychologyManager.endGame(GameManager.currentFloor, GameManager.isNewRecord);

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

    // 고스트 녹화 - 위치 기록
    GhostService.recordPosition(this.cat.x, this.cat.y);

    // 고스트 업데이트는 타이머 기반으로 처리 (성능 최적화)

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

  /**
   * 고스트 업데이트
   */
  private updateGhost(): void {
    if (!this.ghostReplay || !this.ghostCat) return;

    const currentTime = Date.now() - this.ghostStartTime;

    // 고스트 위치 업데이트
    const ghostPos = GhostService.getGhostPosition(this.ghostReplay, currentTime);
    if (ghostPos) {
      this.ghostCat.setPosition(ghostPos.x, ghostPos.y);
    }

    // 고스트 층수 업데이트
    const ghostFloor = GhostService.getGhostFloor(this.ghostReplay, currentTime);
    if (this.ghostFloorText) {
      this.ghostFloorText.setText(`BEST: ${ghostFloor}층`);
    }

    // 고스트가 리플레이 종료 시간을 넘으면 숨김
    if (currentTime > this.ghostReplay.duration) {
      this.ghostCat.setVisible(false);
      if (this.ghostFloorText) {
        this.ghostFloorText.setText(`BEST: ${this.ghostReplay.floor}층 (완료)`);
      }
    }
  }
}
