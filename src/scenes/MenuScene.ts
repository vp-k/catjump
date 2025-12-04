import Phaser from 'phaser';
import { SCENE_KEYS } from '@config/GameConfig';
import { AudioManager } from '@managers/AudioManager';
import { SaveManager } from '@managers/SaveManager';
import { ShopManager } from '@managers/ShopManager';
import { EnergyManager } from '@managers/EnergyManager';
import { MissionManager } from '@managers/MissionManager';
import { RetentionManager } from '@managers/RetentionManager';

/**
 * 메뉴 씬 - 게임 시작 화면
 */
export class MenuScene extends Phaser.Scene {
  private energyText!: Phaser.GameObjects.Text;
  private energyTimerText!: Phaser.GameObjects.Text;
  private coinsText!: Phaser.GameObjects.Text;
  private diamondsText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SCENE_KEYS.MENU });
  }

  create(): void {
    AudioManager.setScene(this);

    // 시스템 초기화
    EnergyManager.initialize();
    MissionManager.initialize();
    RetentionManager.initialize();

    const { width, height } = this.cameras.main;

    this.createBackground();

    // 타이틀
    this.add
      .text(width / 2, height / 4, 'Cat Jump', {
        fontSize: '64px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 4 + 60, 'Tower Stack', {
        fontSize: '32px',
        color: '#ffd700',
      })
      .setOrigin(0.5);

    // 고양이 미리보기 (현재 장착된 고양이 색상)
    const catData = ShopManager.getCurrentCatData();
    const catPreview = this.add.graphics();
    catPreview.fillStyle(catData.color);
    catPreview.fillCircle(width / 2, height / 2 - 30, 50);
    catPreview.fillCircle(width / 2, height / 2 - 70, 30);
    // 귀
    catPreview.fillTriangle(
      width / 2 - 25, height / 2 - 100,
      width / 2 - 15, height / 2 - 75,
      width / 2 - 35, height / 2 - 80
    );
    catPreview.fillTriangle(
      width / 2 + 25, height / 2 - 100,
      width / 2 + 15, height / 2 - 75,
      width / 2 + 35, height / 2 - 80
    );

    // 고양이 이름
    this.add
      .text(width / 2, height / 2 + 40, catData.nameKo, {
        fontSize: '20px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5);

    // 최고 기록
    const highScore = SaveManager.getHighScore();
    const highFloor = SaveManager.getHighFloor();
    this.add
      .text(width / 2, height / 2 + 80, `최고 기록: ${highScore}점 / ${highFloor}층`, {
        fontSize: '18px',
        color: '#888888',
      })
      .setOrigin(0.5);

    // 버튼들
    this.createButtons();

    // 재화 표시
    this.createCurrencyDisplay();

    // 에너지 표시
    this.createEnergyDisplay();

    // 리텐션 팝업 체크 (오프라인 보상 → 일일 로그인)
    this.checkRetentionPopups();
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, width, height);
  }

  private createButtons(): void {
    const { width, height } = this.cameras.main;

    // 시작 버튼
    const startButton = this.createButton(
      width / 2,
      height / 2 + 160,
      '게임 시작',
      '#4ade80',
      () => this.startGame()
    );

    // 깜빡임 효과
    this.tweens.add({
      targets: startButton,
      alpha: 0.8,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // 상점 버튼
    this.createButton(
      width / 2 - 120,
      height / 2 + 250,
      '상점',
      '#3b82f6',
      () => this.scene.start(SCENE_KEYS.SHOP)
    );

    // 리더보드 버튼
    this.createButton(
      width / 2,
      height / 2 + 250,
      '순위',
      '#8b5cf6',
      () => this.scene.start(SCENE_KEYS.LEADERBOARD)
    );

    // 미션 버튼
    const missionBtn = this.createButton(
      width / 2 + 120,
      height / 2 + 250,
      '미션',
      '#f59e0b',
      () => this.showMissionPanel()
    );

    // 미션 알림 뱃지
    const claimableCount = MissionManager.getClaimableCount();
    if (claimableCount > 0) {
      const badge = this.add
        .text(missionBtn.x + 35, missionBtn.y - 15, `${claimableCount}`, {
          fontSize: '14px',
          color: '#ffffff',
          backgroundColor: '#ff4444',
          padding: { x: 6, y: 3 },
        })
        .setOrigin(0.5);
      badge.setData('badge', true);
    }

    // 설정 버튼 (더 아래로)
    this.createButton(
      width / 2,
      height / 2 + 330,
      '설정',
      '#6b7280',
      () => this.showSettings()
    );
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    bgColor: string,
    callback: () => void
  ): Phaser.GameObjects.Text {
    const btn = this.add
      .text(x, y, text, {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: bgColor,
        padding: { x: 30, y: 15 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on('pointerdown', () => {
      AudioManager.playButtonClick();
      callback();
    });

    btn.on('pointerover', () => btn.setScale(1.05));
    btn.on('pointerout', () => btn.setScale(1));

    return btn;
  }

  private createCurrencyDisplay(): void {
    const { width } = this.cameras.main;

    // 코인
    this.coinsText = this.add
      .text(width - 150, 30, `${SaveManager.getData().currency.coins}`, {
        fontSize: '20px',
        color: '#ffd700',
      })
      .setOrigin(1, 0.5);

    // 다이아몬드
    this.diamondsText = this.add
      .text(width - 50, 30, `${SaveManager.getData().currency.diamonds}`, {
        fontSize: '20px',
        color: '#00bfff',
      })
      .setOrigin(1, 0.5);
  }

  private createEnergyDisplay(): void {
    const { width } = this.cameras.main;

    // 에너지 아이콘 (하트)
    const heartIcon = this.add.graphics();
    heartIcon.fillStyle(0xff6b6b);
    heartIcon.fillCircle(30, 80, 8);
    heartIcon.fillCircle(42, 80, 8);
    heartIcon.fillTriangle(22, 84, 50, 84, 36, 100);

    // 에너지 텍스트
    this.energyText = this.add
      .text(60, 85, `${EnergyManager.currentEnergy}/${EnergyManager.maxEnergy}`, {
        fontSize: '20px',
        color: '#ff6b6b',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5);

    // 회복 타이머 텍스트
    this.energyTimerText = this.add
      .text(130, 85, '', {
        fontSize: '16px',
        color: '#888888',
      })
      .setOrigin(0, 0.5);

    // 에너지 변경 콜백
    EnergyManager.setOnEnergyChange((current, max) => {
      this.energyText.setText(`${current}/${max}`);
      if (current >= max) {
        this.energyTimerText.setText('');
      }
    });

    // 회복 타이머 콜백
    EnergyManager.setOnRecoveryTick((remainingMs) => {
      if (remainingMs > 0) {
        this.energyTimerText.setText(EnergyManager.formatTime(remainingMs));
      } else {
        this.energyTimerText.setText('');
      }
    });

    // 에너지 추가 버튼 (가득 차지 않았을 때만)
    if (!EnergyManager.isFull()) {
      const addButton = this.add
        .text(width - 30, 85, '+', {
          fontSize: '24px',
          color: '#4ade80',
          backgroundColor: '#333333',
          padding: { x: 10, y: 5 },
        })
        .setOrigin(1, 0.5)
        .setInteractive({ useHandCursor: true });

      addButton.on('pointerdown', () => {
        this.showEnergyPurchaseModal();
      });
    }
  }

  private startGame(): void {
    if (!EnergyManager.hasEnergy()) {
      this.showNoEnergyModal();
      return;
    }

    // 에너지 소모
    EnergyManager.useEnergy();
    this.scene.start(SCENE_KEYS.GAME);
  }

  private showNoEnergyModal(): void {
    const { width, height } = this.cameras.main;

    // 딤 배경
    const dim = this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
      .setInteractive();

    const panel = this.add.container(width / 2, height / 2);

    // 배경
    const bg = this.add.graphics();
    bg.fillStyle(0x2d2d2d);
    bg.fillRoundedRect(-180, -130, 360, 260, 20);
    panel.add(bg);

    // 타이틀
    panel.add(
      this.add
        .text(0, -90, '에너지 부족!', {
          fontSize: '28px',
          color: '#ff6b6b',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
    );

    // 설명
    panel.add(
      this.add
        .text(0, -40, '게임을 플레이하려면\n에너지가 필요합니다.', {
          fontSize: '18px',
          color: '#cccccc',
          align: 'center',
        })
        .setOrigin(0.5)
    );

    // 회복 시간
    const timeText = this.add
      .text(0, 10, `다음 회복: ${EnergyManager.formatTime(EnergyManager.getTimeToNextRecovery())}`, {
        fontSize: '16px',
        color: '#888888',
      })
      .setOrigin(0.5);
    panel.add(timeText);

    // 광고 시청 버튼
    const adButton = this.add
      .text(-80, 60, '광고 보기 +1', {
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#4ade80',
        padding: { x: 15, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    adButton.on('pointerdown', () => {
      // TODO: 실제 광고 구현
      EnergyManager.watchAdForEnergy();
      dim.destroy();
      panel.destroy();
      this.updateEnergyDisplay();
    });
    panel.add(adButton);

    // 코인 구매 버튼
    const coinButton = this.add
      .text(80, 60, `50코인 +1`, {
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#ffd700',
        padding: { x: 15, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    coinButton.on('pointerdown', () => {
      if (EnergyManager.purchaseWithCoins()) {
        dim.destroy();
        panel.destroy();
        this.updateEnergyDisplay();
      } else {
        // 코인 부족 알림
        this.showCoinShortageToast();
      }
    });
    panel.add(coinButton);

    // 닫기 버튼
    const closeBtn = this.add
      .text(0, 110, '닫기', {
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#6b7280',
        padding: { x: 30, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => {
      AudioManager.playButtonClick();
      dim.destroy();
      panel.destroy();
    });
    panel.add(closeBtn);
  }

  private showEnergyPurchaseModal(): void {
    const { width, height } = this.cameras.main;

    const dim = this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
      .setInteractive();

    const panel = this.add.container(width / 2, height / 2);

    const bg = this.add.graphics();
    bg.fillStyle(0x2d2d2d);
    bg.fillRoundedRect(-180, -100, 360, 200, 20);
    panel.add(bg);

    panel.add(
      this.add
        .text(0, -60, '에너지 충전', {
          fontSize: '24px',
          color: '#ffffff',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
    );

    // 광고 버튼
    const adBtn = this.add
      .text(-80, 10, '광고 +1', {
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#4ade80',
        padding: { x: 20, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    adBtn.on('pointerdown', () => {
      EnergyManager.watchAdForEnergy();
      dim.destroy();
      panel.destroy();
      this.updateEnergyDisplay();
    });
    panel.add(adBtn);

    // 코인 버튼
    const coinBtn = this.add
      .text(80, 10, '50코인 +1', {
        fontSize: '18px',
        color: '#000000',
        backgroundColor: '#ffd700',
        padding: { x: 15, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    coinBtn.on('pointerdown', () => {
      if (EnergyManager.purchaseWithCoins()) {
        dim.destroy();
        panel.destroy();
        this.updateEnergyDisplay();
      } else {
        this.showCoinShortageToast();
      }
    });
    panel.add(coinBtn);

    // 닫기
    const closeBtn = this.add
      .text(0, 70, '닫기', {
        fontSize: '16px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => {
      dim.destroy();
      panel.destroy();
    });
    panel.add(closeBtn);
  }

  private showCoinShortageToast(): void {
    const { width, height } = this.cameras.main;

    const toast = this.add
      .text(width / 2, height - 100, '코인이 부족합니다!', {
        fontSize: '18px',
        color: '#ff6b6b',
        backgroundColor: '#333333',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: toast,
      alpha: 1,
      y: height - 120,
      duration: 300,
      onComplete: () => {
        this.time.delayedCall(1500, () => {
          this.tweens.add({
            targets: toast,
            alpha: 0,
            duration: 300,
            onComplete: () => toast.destroy(),
          });
        });
      },
    });
  }

  private updateEnergyDisplay(): void {
    this.energyText.setText(`${EnergyManager.currentEnergy}/${EnergyManager.maxEnergy}`);
  }

  private showSettings(): void {
    const { width, height } = this.cameras.main;
    const saveData = SaveManager.getData();

    // 딤 배경
    const dim = this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
      .setInteractive();

    // 패널
    const panel = this.add.container(width / 2, height / 2);

    const bg = this.add.graphics();
    bg.fillStyle(0x2d2d2d);
    bg.fillRoundedRect(-200, -150, 400, 300, 20);
    panel.add(bg);

    // 타이틀
    const title = this.add
      .text(0, -110, '설정', {
        fontSize: '28px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    panel.add(title);

    // 사운드 토글
    const soundText = this.add
      .text(-80, -40, '효과음', { fontSize: '20px', color: '#ffffff' })
      .setOrigin(0, 0.5);
    panel.add(soundText);

    const soundToggle = this.add
      .text(80, -40, saveData.settings.sound ? 'ON' : 'OFF', {
        fontSize: '20px',
        color: saveData.settings.sound ? '#4ade80' : '#ff6b6b',
        backgroundColor: '#444444',
        padding: { x: 15, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    soundToggle.on('pointerdown', () => {
      const newValue = !saveData.settings.sound;
      SaveManager.updateSettings({ sound: newValue });
      AudioManager.setSoundEnabled(newValue);
      soundToggle.setText(newValue ? 'ON' : 'OFF');
      soundToggle.setColor(newValue ? '#4ade80' : '#ff6b6b');
    });
    panel.add(soundToggle);

    // 음악 토글
    const musicText = this.add
      .text(-80, 20, '음악', { fontSize: '20px', color: '#ffffff' })
      .setOrigin(0, 0.5);
    panel.add(musicText);

    const musicToggle = this.add
      .text(80, 20, saveData.settings.music ? 'ON' : 'OFF', {
        fontSize: '20px',
        color: saveData.settings.music ? '#4ade80' : '#ff6b6b',
        backgroundColor: '#444444',
        padding: { x: 15, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    musicToggle.on('pointerdown', () => {
      const newValue = !saveData.settings.music;
      SaveManager.updateSettings({ music: newValue });
      AudioManager.setMusicEnabled(newValue);
      musicToggle.setText(newValue ? 'ON' : 'OFF');
      musicToggle.setColor(newValue ? '#4ade80' : '#ff6b6b');
    });
    panel.add(musicToggle);

    // 닫기 버튼
    const closeBtn = this.add
      .text(0, 100, '닫기', {
        fontSize: '22px',
        color: '#ffffff',
        backgroundColor: '#6b7280',
        padding: { x: 40, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => {
      AudioManager.playButtonClick();
      dim.destroy();
      panel.destroy();
    });
    panel.add(closeBtn);
  }

  private showMissionPanel(): void {
    const { width, height } = this.cameras.main;

    // 딤 배경
    const dim = this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.8)
      .setInteractive();

    const panel = this.add.container(width / 2, height / 2);

    // 배경
    const bg = this.add.graphics();
    bg.fillStyle(0x2d2d2d);
    bg.fillRoundedRect(-180, -280, 360, 560, 20);
    panel.add(bg);

    // 타이틀
    panel.add(
      this.add
        .text(0, -250, '일일 미션', {
          fontSize: '24px',
          color: '#f59e0b',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
    );

    // 일일 미션 목록
    const dailyMissions = MissionManager.getDailyMissions();
    let yOffset = -200;

    dailyMissions.forEach((mission) => {
      // 미션 배경
      const missionBg = this.add.graphics();
      missionBg.fillStyle(mission.completed ? 0x4ade80 : 0x444444, 0.3);
      missionBg.fillRoundedRect(-160, yOffset - 25, 320, 60, 10);
      panel.add(missionBg);

      // 미션 설명
      const desc = MissionManager.getMissionDescription(mission);
      panel.add(
        this.add
          .text(-150, yOffset - 10, desc, {
            fontSize: '14px',
            color: '#ffffff',
          })
          .setOrigin(0, 0.5)
      );

      // 진행도
      panel.add(
        this.add
          .text(-150, yOffset + 15, `${mission.current}/${mission.target}`, {
            fontSize: '12px',
            color: '#888888',
          })
          .setOrigin(0, 0.5)
      );

      // 진행 바
      const progressBg = this.add.graphics();
      progressBg.fillStyle(0x333333);
      progressBg.fillRoundedRect(-50, yOffset + 10, 120, 10, 5);
      panel.add(progressBg);

      const progressFill = this.add.graphics();
      const fillWidth = Math.min((mission.current / mission.target) * 120, 120);
      progressFill.fillStyle(mission.completed ? 0x4ade80 : 0xf59e0b);
      progressFill.fillRoundedRect(-50, yOffset + 10, fillWidth, 10, 5);
      panel.add(progressFill);

      // 보상 수령 버튼
      if (mission.completed && !mission.claimed) {
        const claimBtn = this.add
          .text(130, yOffset, '수령', {
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#4ade80',
            padding: { x: 10, y: 5 },
          })
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true });

        claimBtn.on('pointerdown', () => {
          const reward = MissionManager.claimReward(mission.id);
          if (reward) {
            this.showRewardToast(reward);
            // 버튼 비활성화
            claimBtn.setText('완료');
            claimBtn.setBackgroundColor('#666666');
            claimBtn.disableInteractive();
          }
        });
        panel.add(claimBtn);
      } else if (mission.claimed) {
        panel.add(
          this.add
            .text(130, yOffset, '완료', {
              fontSize: '14px',
              color: '#666666',
            })
            .setOrigin(0.5)
        );
      }

      yOffset += 70;
    });

    // 주간 미션 타이틀
    panel.add(
      this.add
        .text(0, yOffset + 10, '주간 미션', {
          fontSize: '24px',
          color: '#3b82f6',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
    );

    yOffset += 50;

    // 주간 미션 목록
    const weeklyMissions = MissionManager.getWeeklyMissions();
    weeklyMissions.forEach((mission) => {
      const missionBg = this.add.graphics();
      missionBg.fillStyle(mission.completed ? 0x3b82f6 : 0x444444, 0.3);
      missionBg.fillRoundedRect(-160, yOffset - 25, 320, 60, 10);
      panel.add(missionBg);

      const desc = MissionManager.getMissionDescription(mission);
      panel.add(
        this.add
          .text(-150, yOffset - 10, desc, {
            fontSize: '14px',
            color: '#ffffff',
          })
          .setOrigin(0, 0.5)
      );

      panel.add(
        this.add
          .text(-150, yOffset + 15, `${mission.current}/${mission.target}`, {
            fontSize: '12px',
            color: '#888888',
          })
          .setOrigin(0, 0.5)
      );

      const progressBg = this.add.graphics();
      progressBg.fillStyle(0x333333);
      progressBg.fillRoundedRect(-50, yOffset + 10, 120, 10, 5);
      panel.add(progressBg);

      const progressFill = this.add.graphics();
      const fillWidth = Math.min((mission.current / mission.target) * 120, 120);
      progressFill.fillStyle(mission.completed ? 0x3b82f6 : 0xf59e0b);
      progressFill.fillRoundedRect(-50, yOffset + 10, fillWidth, 10, 5);
      panel.add(progressFill);

      if (mission.completed && !mission.claimed) {
        const claimBtn = this.add
          .text(130, yOffset, '수령', {
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#3b82f6',
            padding: { x: 10, y: 5 },
          })
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true });

        claimBtn.on('pointerdown', () => {
          const reward = MissionManager.claimReward(mission.id);
          if (reward) {
            this.showRewardToast(reward);
            claimBtn.setText('완료');
            claimBtn.setBackgroundColor('#666666');
            claimBtn.disableInteractive();
          }
        });
        panel.add(claimBtn);
      } else if (mission.claimed) {
        panel.add(
          this.add
            .text(130, yOffset, '완료', {
              fontSize: '14px',
              color: '#666666',
            })
            .setOrigin(0.5)
        );
      }

      yOffset += 70;
    });

    // 닫기 버튼
    const closeBtn = this.add
      .text(0, 250, '닫기', {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#6b7280',
        padding: { x: 40, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => {
      AudioManager.playButtonClick();
      dim.destroy();
      panel.destroy();
    });
    panel.add(closeBtn);
  }

  private showRewardToast(reward: { type: string; amount: number }): void {
    const { width, height } = this.cameras.main;
    const rewardText = reward.type === 'coins' ? `+${reward.amount} 코인` : `+${reward.amount} 다이아`;
    const color = reward.type === 'coins' ? '#ffd700' : '#00bfff';

    const toast = this.add
      .text(width / 2, height / 2, rewardText, {
        fontSize: '28px',
        color: color,
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(1000);

    this.tweens.add({
      targets: toast,
      y: height / 2 - 50,
      alpha: 0,
      scale: 1.5,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => toast.destroy(),
    });
  }

  private checkRetentionPopups(): void {
    // 오프라인 보상 먼저 체크
    const offlineReward = RetentionManager.calculateOfflineReward();
    if (offlineReward) {
      this.showOfflineRewardPopup(offlineReward);
      return;
    }

    // 일일 로그인 보상 체크
    const loginStatus = RetentionManager.getDailyLoginStatus();
    if (loginStatus.canClaim) {
      this.showDailyLoginPopup(loginStatus);
    }
  }

  private showOfflineRewardPopup(reward: { coins: number; hoursOffline: number; message: string }): void {
    const { width, height } = this.cameras.main;

    const dim = this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.8)
      .setInteractive();

    const panel = this.add.container(width / 2, height / 2);

    // 배경
    const bg = this.add.graphics();
    bg.fillStyle(0x2d2d2d);
    bg.fillRoundedRect(-180, -180, 360, 360, 20);
    panel.add(bg);

    // 환영 메시지
    panel.add(
      this.add
        .text(0, -140, '돌아오셨군요!', {
          fontSize: '28px',
          color: '#ffd700',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
    );

    // 고양이 이모지/아이콘
    panel.add(
      this.add
        .text(0, -80, '🐱', {
          fontSize: '48px',
        })
        .setOrigin(0.5)
    );

    // 메시지
    panel.add(
      this.add
        .text(0, -20, reward.message, {
          fontSize: '16px',
          color: '#cccccc',
          align: 'center',
          wordWrap: { width: 300 },
        })
        .setOrigin(0.5)
    );

    // 오프라인 시간
    panel.add(
      this.add
        .text(0, 20, `${reward.hoursOffline}시간 동안 모은 보상`, {
          fontSize: '14px',
          color: '#888888',
        })
        .setOrigin(0.5)
    );

    // 보상 표시
    panel.add(
      this.add
        .text(0, 60, `+${reward.coins} 코인`, {
          fontSize: '32px',
          color: '#ffd700',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
    );

    // 일반 수령 버튼
    const claimBtn = this.add
      .text(-80, 120, '받기', {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#4ade80',
        padding: { x: 25, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    claimBtn.on('pointerdown', () => {
      AudioManager.playButtonClick();
      RetentionManager.claimOfflineReward(false);
      dim.destroy();
      panel.destroy();
      this.refreshCurrencyDisplay();
      // 일일 로그인 체크
      const loginStatus = RetentionManager.getDailyLoginStatus();
      if (loginStatus.canClaim) {
        this.time.delayedCall(300, () => this.showDailyLoginPopup(loginStatus));
      }
    });
    panel.add(claimBtn);

    // 광고로 2배 버튼
    const doubleBtn = this.add
      .text(80, 120, '광고 x2', {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#f59e0b',
        padding: { x: 20, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    doubleBtn.on('pointerdown', () => {
      AudioManager.playButtonClick();
      // TODO: 실제 광고 구현
      const earnedCoins = RetentionManager.claimOfflineReward(true);
      dim.destroy();
      panel.destroy();
      this.showRewardToast({ type: 'coins', amount: earnedCoins });
      this.refreshCurrencyDisplay();
      // 일일 로그인 체크
      const loginStatus = RetentionManager.getDailyLoginStatus();
      if (loginStatus.canClaim) {
        this.time.delayedCall(500, () => this.showDailyLoginPopup(loginStatus));
      }
    });
    panel.add(doubleBtn);
  }

  private showDailyLoginPopup(status: ReturnType<typeof RetentionManager.getDailyLoginStatus>): void {
    const { width, height } = this.cameras.main;

    const dim = this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.8)
      .setDepth(900)
      .setInteractive();

    const panel = this.add.container(width / 2, height / 2).setDepth(901);

    // 배경
    const bg = this.add.graphics();
    bg.fillStyle(0x2d2d2d);
    bg.fillRoundedRect(-180, -220, 360, 440, 20);
    panel.add(bg);

    // 타이틀
    panel.add(
      this.add
        .text(0, -185, '일일 출석 보상', {
          fontSize: '24px',
          color: '#ffd700',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
    );

    // 스트릭 표시
    panel.add(
      this.add
        .text(0, -150, `🔥 ${status.currentStreak}일 연속 출석!`, {
          fontSize: '18px',
          color: '#ff6b6b',
        })
        .setOrigin(0.5)
    );

    // 7일 보상 그리드 (4열 + 3열 배치)
    const boxWidth = 70;
    const boxHeight = 70;
    const gap = 8;

    status.rewards.forEach((reward, index) => {
      const dayNum = index + 1;
      const col = index % 4;
      const row = Math.floor(index / 4);

      // 첫 줄(4개)과 둘째 줄(3개) 중앙 정렬
      const itemsInRow = row === 0 ? 4 : 3;
      const rowWidth = itemsInRow * boxWidth + (itemsInRow - 1) * gap;
      const rowStartX = -rowWidth / 2 + boxWidth / 2;
      const colInRow = row === 0 ? col : col; // 둘째 줄은 0,1,2

      const x = rowStartX + colInRow * (boxWidth + gap);
      const y = -90 + row * (boxHeight + gap);

      const isToday = dayNum === status.dayOfWeek;
      const isClaimed = dayNum < status.dayOfWeek || (dayNum === status.dayOfWeek && status.claimedToday);
      const isLocked = dayNum > status.dayOfWeek;

      // 박스 배경
      const boxBg = this.add.graphics();
      if (isToday && !status.claimedToday) {
        boxBg.fillStyle(0xffd700, 0.3);
        boxBg.lineStyle(2, 0xffd700);
      } else if (isClaimed) {
        boxBg.fillStyle(0x4ade80, 0.3);
      } else {
        boxBg.fillStyle(0x444444, 0.5);
      }
      boxBg.fillRoundedRect(x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight, 8);
      if (isToday && !status.claimedToday) {
        boxBg.strokeRoundedRect(x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight, 8);
      }
      panel.add(boxBg);

      // 날짜
      panel.add(
        this.add
          .text(x, y - 25, `${dayNum}일차`, {
            fontSize: '12px',
            color: isLocked ? '#666666' : '#ffffff',
          })
          .setOrigin(0.5)
      );

      // 보상 아이콘
      const icon = reward.type === 'coins' ? '🪙' : '💎';
      panel.add(
        this.add
          .text(x, y + 5, icon, {
            fontSize: '20px',
          })
          .setOrigin(0.5)
          .setAlpha(isLocked ? 0.5 : 1)
      );

      // 보상 수량
      panel.add(
        this.add
          .text(x, y + 28, `${reward.amount}`, {
            fontSize: '12px',
            color: isLocked ? '#666666' : reward.type === 'coins' ? '#ffd700' : '#00bfff',
          })
          .setOrigin(0.5)
      );

      // 체크 표시 (수령 완료)
      if (isClaimed) {
        panel.add(
          this.add
            .text(x + 25, y - 25, '✓', {
              fontSize: '16px',
              color: '#4ade80',
            })
            .setOrigin(0.5)
        );
      }
    });

    // 스트릭 보너스
    if (status.streakBonus > 0) {
      panel.add(
        this.add
          .text(0, 80, `스트릭 보너스: +${status.streakBonus} 코인`, {
            fontSize: '16px',
            color: '#ff6b6b',
          })
          .setOrigin(0.5)
      );
    }

    // 수령 버튼 (패널 안에 추가 - 상대 좌표 사용)
    const claimBtn = this.add
      .text(0, 130, status.canClaim ? '오늘 보상 받기' : '수령 완료', {
        fontSize: '22px',
        color: '#ffffff',
        backgroundColor: status.canClaim ? '#4ade80' : '#666666',
        padding: { x: 30, y: 12 },
      })
      .setOrigin(0.5);
    panel.add(claimBtn);

    // 닫기 버튼 (패널 안에 추가 - 상대 좌표 사용)
    const closeBtn = this.add
      .text(0, 185, '닫기', {
        fontSize: '16px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5);
    panel.add(closeBtn);

    // 수령 버튼 이벤트 (패널 안이므로 좌표 계산 필요)
    if (status.canClaim) {
      claimBtn.setInteractive({ useHandCursor: true });
      claimBtn.on('pointerdown', () => {
        AudioManager.playButtonClick();
        const result = RetentionManager.claimDailyReward();
        if (result) {
          // 보상 표시
          this.showRewardToast(result.reward);
          if (result.bonus > 0) {
            this.time.delayedCall(300, () => {
              this.showRewardToast({ type: 'coins', amount: result.bonus });
            });
          }
          dim.destroy();
          panel.destroy();
          this.refreshCurrencyDisplay();
        }
      });
    }

    // 닫기 버튼 이벤트
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      AudioManager.playButtonClick();
      dim.destroy();
      panel.destroy();
    });
  }

  private refreshCurrencyDisplay(): void {
    const data = SaveManager.getData();
    this.coinsText.setText(`${data.currency.coins}`);
    this.diamondsText.setText(`${data.currency.diamonds}`);
  }
}
