import Phaser from 'phaser';
import { SCENE_KEYS } from '@config/GameConfig';
import { AudioManager } from '@managers/AudioManager';
import { SaveManager } from '@managers/SaveManager';
import { ShopManager } from '@managers/ShopManager';

/**
 * 메뉴 씬 - 게임 시작 화면
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.MENU });
  }

  create(): void {
    AudioManager.setScene(this);

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
      () => this.scene.start(SCENE_KEYS.GAME)
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
      width / 2 - 100,
      height / 2 + 250,
      '상점',
      '#3b82f6',
      () => this.scene.start(SCENE_KEYS.SHOP)
    );

    // 설정 버튼
    this.createButton(
      width / 2 + 100,
      height / 2 + 250,
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
    this.add
      .text(width - 150, 30, `${SaveManager.getData().currency.coins}`, {
        fontSize: '20px',
        color: '#ffd700',
      })
      .setOrigin(1, 0.5);

    // 다이아몬드
    this.add
      .text(width - 50, 30, `${SaveManager.getData().currency.diamonds}`, {
        fontSize: '20px',
        color: '#00bfff',
      })
      .setOrigin(1, 0.5);
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
}
