import Phaser from 'phaser';
import { SCENE_KEYS } from '@config/GameConfig';
import { ShopManager } from '@managers/ShopManager';
import { AudioManager } from '@managers/AudioManager';
import { UIManager } from '@managers/UIManager';
import { RARITY_COLORS, RARITY_NAMES, type CatData } from '@config/CatConfig';

/**
 * 상점 씬 - 고양이 구매 및 장착
 */
export class ShopScene extends Phaser.Scene {
  private catItems: Phaser.GameObjects.Container[] = [];
  private coinsText!: Phaser.GameObjects.Text;
  private diamondsText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SCENE_KEYS.SHOP });
  }

  create(): void {
    AudioManager.setScene(this);
    UIManager.setScene(this);

    this.createBackground();
    this.createHeader();
    this.createCatList();
    this.createBackButton();
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f0f23, 0x0f0f23, 1);
    bg.fillRect(0, 0, width, height);
  }

  private createHeader(): void {
    const { width } = this.cameras.main;

    // 타이틀
    this.add
      .text(width / 2, 50, '고양이 상점', {
        fontSize: '36px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // 코인
    this.add
      .image(width - 180, 50, 'icon_coin')
      .setScale(0.5)
      .setOrigin(0.5);

    this.coinsText = this.add
      .text(width - 150, 50, ShopManager.getCoins().toString(), {
        fontSize: '24px',
        color: '#ffd700',
      })
      .setOrigin(0, 0.5);

    // 다이아몬드
    this.add
      .image(width - 80, 50, 'icon_diamond')
      .setScale(0.5)
      .setOrigin(0.5);

    this.diamondsText = this.add
      .text(width - 50, 50, ShopManager.getDiamonds().toString(), {
        fontSize: '24px',
        color: '#00bfff',
      })
      .setOrigin(0, 0.5);
  }

  private createCatList(): void {
    const { width, height } = this.cameras.main;
    const cats = ShopManager.getAllCats();

    const startY = 130;
    const itemHeight = 140;
    const padding = 20;

    // 스크롤 가능한 영역
    const scrollHeight = Math.max(cats.length * (itemHeight + padding), height - startY - 100);

    cats.forEach((cat, index) => {
      const y = startY + index * (itemHeight + padding);
      const item = this.createCatItem(cat, width / 2, y);
      this.catItems.push(item);
    });

    // 간단한 드래그 스크롤 (나중에 개선 가능)
    let startDragY = 0;
    let scrollY = 0;

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      startDragY = pointer.y;
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) {
        const deltaY = pointer.y - startDragY;
        scrollY = Phaser.Math.Clamp(scrollY + deltaY, -(scrollHeight - height + 200), 0);

        this.catItems.forEach((item, i) => {
          item.y = startY + i * (itemHeight + padding) + scrollY;
        });

        startDragY = pointer.y;
      }
    });
  }

  private createCatItem(cat: CatData, x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const itemWidth = 660;
    const itemHeight = 130;

    const isOwned = ShopManager.isCatOwned(cat.id);
    const isEquipped = ShopManager.getCurrentCat() === cat.id;
    const canPurchase = ShopManager.canPurchase(cat.id);

    // 배경
    const bg = this.add.graphics();
    bg.fillStyle(isEquipped ? 0x4ade80 : 0x2d2d2d, isEquipped ? 0.3 : 0.9);
    bg.fillRoundedRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight, 15);

    // 희귀도 테두리
    bg.lineStyle(3, RARITY_COLORS[cat.rarity]);
    bg.strokeRoundedRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight, 15);

    container.add(bg);

    // 고양이 미리보기 (색상 원)
    const catPreview = this.add.graphics();
    catPreview.fillStyle(cat.color);
    catPreview.fillCircle(-itemWidth / 2 + 70, 0, 40);
    container.add(catPreview);

    // 이름
    const nameText = this.add
      .text(-itemWidth / 2 + 130, -30, cat.nameKo, {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5);
    container.add(nameText);

    // 희귀도
    const rarityText = this.add
      .text(-itemWidth / 2 + 130, 0, RARITY_NAMES[cat.rarity], {
        fontSize: '16px',
        color: `#${RARITY_COLORS[cat.rarity].toString(16)}`,
      })
      .setOrigin(0, 0.5);
    container.add(rarityText);

    // 설명/능력
    const descText = this.add
      .text(-itemWidth / 2 + 130, 25, cat.description, {
        fontSize: '14px',
        color: '#aaaaaa',
      })
      .setOrigin(0, 0.5);
    container.add(descText);

    // 버튼 영역
    if (isEquipped) {
      const equippedText = this.add
        .text(itemWidth / 2 - 80, 0, '장착 중', {
          fontSize: '20px',
          color: '#4ade80',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
      container.add(equippedText);
    } else if (isOwned) {
      const equipBtn = this.createButton(itemWidth / 2 - 80, 0, '장착', () => {
        this.equipCat(cat.id);
      });
      container.add(equipBtn);
    } else {
      // 가격 표시
      const priceIcon = cat.currency === 'coins' ? 'icon_coin' : 'icon_diamond';
      const priceColor = cat.currency === 'coins' ? '#ffd700' : '#00bfff';

      const priceContainer = this.add.container(itemWidth / 2 - 80, -15);

      if (this.textures.exists(priceIcon)) {
        const icon = this.add.image(-30, 0, priceIcon).setScale(0.4);
        priceContainer.add(icon);
      }

      const priceText = this.add
        .text(0, 0, cat.price.toString(), {
          fontSize: '18px',
          color: priceColor,
        })
        .setOrigin(0, 0.5);
      priceContainer.add(priceText);

      container.add(priceContainer);

      // 구매 버튼
      const buyBtn = this.createButton(
        itemWidth / 2 - 80,
        25,
        '구매',
        () => {
          this.purchaseCat(cat.id);
        },
        canPurchase ? '#4ade80' : '#666666'
      );
      container.add(buyBtn);
    }

    return container;
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    callback: () => void,
    bgColor = '#4ade80'
  ): Phaser.GameObjects.Text {
    const btn = this.add
      .text(x, y, text, {
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: bgColor,
        padding: { x: 20, y: 8 },
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

  private purchaseCat(catId: string): void {
    const result = ShopManager.purchaseCat(catId);

    switch (result) {
      case 'success':
        UIManager.showToast('구매 완료!');
        this.refreshUI();
        break;
      case 'not_enough_coins':
        UIManager.showToast('코인이 부족합니다');
        break;
      case 'not_enough_diamonds':
        UIManager.showToast('다이아몬드가 부족합니다');
        break;
      case 'already_owned':
        UIManager.showToast('이미 보유 중입니다');
        break;
    }
  }

  private equipCat(catId: string): void {
    if (ShopManager.equipCat(catId)) {
      UIManager.showToast('장착 완료!');
      this.refreshUI();
    }
  }

  private refreshUI(): void {
    // 재화 업데이트
    this.coinsText.setText(ShopManager.getCoins().toString());
    this.diamondsText.setText(ShopManager.getDiamonds().toString());

    // 리스트 다시 그리기
    this.catItems.forEach((item) => item.destroy());
    this.catItems = [];
    this.createCatList();
  }

  private createBackButton(): void {
    const backBtn = this.add
      .text(60, 50, '← 뒤로', {
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true });

    backBtn.on('pointerdown', () => {
      AudioManager.playButtonClick();
      this.scene.start(SCENE_KEYS.MENU);
    });
  }
}
