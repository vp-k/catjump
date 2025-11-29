import { SaveManager } from './SaveManager';
import { CAT_DATA, getCatData, type CatData } from '@config/CatConfig';
import { AudioManager } from './AudioManager';

export type PurchaseResult = 'success' | 'not_enough_coins' | 'not_enough_diamonds' | 'already_owned' | 'not_found';

/**
 * 상점 관리자 - 구매 및 인벤토리 관리
 */
class ShopManagerClass {
  /**
   * 고양이 구매
   */
  purchaseCat(catId: string): PurchaseResult {
    const catData = getCatData(catId);
    if (!catData) return 'not_found';

    // 이미 소유 중인지 확인
    if (this.isCatOwned(catId)) {
      return 'already_owned';
    }

    const saveData = SaveManager.getData();

    // 재화 확인 및 차감
    if (catData.currency === 'coins') {
      if (saveData.currency.coins < catData.price) {
        return 'not_enough_coins';
      }
      SaveManager.spendCoins(catData.price);
    } else {
      if (saveData.currency.diamonds < catData.price) {
        return 'not_enough_diamonds';
      }
      // 다이아몬드 차감
      saveData.currency.diamonds -= catData.price;
    }

    // 인벤토리에 추가
    saveData.inventory.unlockedCats.push(catId);

    // 저장
    SaveManager.save();

    AudioManager.playGiftOpen();

    return 'success';
  }

  /**
   * 고양이 장착
   */
  equipCat(catId: string): boolean {
    if (!this.isCatOwned(catId)) return false;

    const saveData = SaveManager.getData();
    saveData.inventory.currentCat = catId;
    SaveManager.save();

    return true;
  }

  /**
   * 현재 장착된 고양이
   */
  getCurrentCat(): string {
    return SaveManager.getData().inventory.currentCat;
  }

  /**
   * 현재 장착된 고양이 데이터
   */
  getCurrentCatData(): CatData {
    const currentId = this.getCurrentCat();
    return getCatData(currentId) ?? CAT_DATA.default;
  }

  /**
   * 고양이 소유 여부
   */
  isCatOwned(catId: string): boolean {
    return SaveManager.getData().inventory.unlockedCats.includes(catId);
  }

  /**
   * 보유 고양이 목록
   */
  getOwnedCats(): string[] {
    return SaveManager.getData().inventory.unlockedCats;
  }

  /**
   * 구매 가능한 고양이 목록
   */
  getAvailableCats(): CatData[] {
    const owned = this.getOwnedCats();
    return Object.values(CAT_DATA).filter((cat) => !owned.includes(cat.id));
  }

  /**
   * 모든 고양이 목록 (상점 표시용)
   */
  getAllCats(): CatData[] {
    return Object.values(CAT_DATA);
  }

  /**
   * 구매 가능 여부 확인
   */
  canPurchase(catId: string): boolean {
    const catData = getCatData(catId);
    if (!catData) return false;
    if (this.isCatOwned(catId)) return false;

    const saveData = SaveManager.getData();

    if (catData.currency === 'coins') {
      return saveData.currency.coins >= catData.price;
    } else {
      return saveData.currency.diamonds >= catData.price;
    }
  }

  /**
   * 코인 잔액
   */
  getCoins(): number {
    return SaveManager.getData().currency.coins;
  }

  /**
   * 다이아몬드 잔액
   */
  getDiamonds(): number {
    return SaveManager.getData().currency.diamonds;
  }

  /**
   * 다이아몬드 추가
   */
  addDiamonds(amount: number): void {
    const saveData = SaveManager.getData();
    saveData.currency.diamonds += amount;
    SaveManager.save();
  }
}

export const ShopManager = new ShopManagerClass();
