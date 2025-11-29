import { SaveManager } from './SaveManager';
import { AudioManager } from './AudioManager';
import { getCatAbilityValue } from '@config/CatConfig';

/**
 * 보상 관리자 - 게임 보상 계산 및 지급
 */
class RewardManagerClass {
  /**
   * 게임 종료 시 보상 계산
   */
  calculateGameRewards(
    score: number,
    floor: number,
    perfectCount: number,
    coinsCollected: number
  ): GameRewardResult {
    const currentCat = SaveManager.getData().inventory.currentCat;

    // 코인 보너스 계산
    const coinBonus = getCatAbilityValue(currentCat, 'coin_bonus');
    const bonusCoins = Math.floor(coinsCollected * coinBonus);
    const totalCoins = coinsCollected + bonusCoins;

    // 층수 보너스
    const floorBonus = Math.floor(floor / 10) * 10;

    // 퍼펙트 보너스
    const perfectBonus = perfectCount * 2;

    // 최종 코인
    const finalCoins = totalCoins + floorBonus + perfectBonus;

    return {
      baseCoins: coinsCollected,
      bonusCoins,
      floorBonus,
      perfectBonus,
      totalCoins: finalCoins,
      score,
      floor,
    };
  }

  /**
   * 게임 보상 지급
   */
  grantGameRewards(rewards: GameRewardResult): void {
    SaveManager.addCoins(rewards.totalCoins);
    SaveManager.save();
    AudioManager.playCoinCollect();
  }

  /**
   * 광고 시청 보상 (2배)
   */
  grantAdBonus(baseReward: GameRewardResult): GameRewardResult {
    const doubled: GameRewardResult = {
      ...baseReward,
      baseCoins: baseReward.baseCoins * 2,
      bonusCoins: baseReward.bonusCoins * 2,
      floorBonus: baseReward.floorBonus * 2,
      perfectBonus: baseReward.perfectBonus * 2,
      totalCoins: baseReward.totalCoins * 2,
    };

    // 추가 코인 지급 (이미 기본 보상은 지급됨)
    SaveManager.addCoins(baseReward.totalCoins);
    SaveManager.save();

    return doubled;
  }

  /**
   * 부활 가능 여부 (광고 또는 다이아몬드)
   */
  canRevive(): ReviveOption {
    const saveData = SaveManager.getData();
    const currentCat = saveData.inventory.currentCat;

    // 무료 부활 (고양이 능력)
    const freeRevives = getCatAbilityValue(currentCat, 'second_chance');
    if (freeRevives > 0) {
      return { type: 'free', cost: 0 };
    }

    // 다이아몬드 부활
    const reviveCost = 10;
    if (saveData.currency.diamonds >= reviveCost) {
      return { type: 'diamond', cost: reviveCost };
    }

    // 광고 부활
    return { type: 'ad', cost: 0 };
  }

  /**
   * 부활 실행
   */
  executeRevive(option: ReviveOption): boolean {
    if (option.type === 'diamond') {
      const saveData = SaveManager.getData();
      if (saveData.currency.diamonds < option.cost) {
        return false;
      }
      saveData.currency.diamonds -= option.cost;
      SaveManager.save();
    }

    AudioManager.playRevival();
    return true;
  }

  /**
   * 랜덤 보상 상자 열기
   */
  openRewardBox(boxType: 'daily' | 'weekly' | 'special'): RewardBoxResult {
    const rewards: RewardBoxResult = {
      coins: 0,
      diamonds: 0,
      items: [],
    };

    switch (boxType) {
      case 'daily':
        rewards.coins = Phaser.Math.Between(50, 150);
        if (Math.random() < 0.1) {
          rewards.diamonds = Phaser.Math.Between(1, 3);
        }
        break;

      case 'weekly':
        rewards.coins = Phaser.Math.Between(200, 500);
        rewards.diamonds = Phaser.Math.Between(5, 15);
        break;

      case 'special':
        rewards.coins = Phaser.Math.Between(500, 1000);
        rewards.diamonds = Phaser.Math.Between(20, 50);
        break;
    }

    // 보상 지급
    SaveManager.addCoins(rewards.coins);
    const saveData = SaveManager.getData();
    saveData.currency.diamonds += rewards.diamonds;
    SaveManager.save();

    AudioManager.playGiftOpen();

    return rewards;
  }
}

export interface GameRewardResult {
  baseCoins: number;
  bonusCoins: number;
  floorBonus: number;
  perfectBonus: number;
  totalCoins: number;
  score: number;
  floor: number;
}

export interface ReviveOption {
  type: 'free' | 'diamond' | 'ad';
  cost: number;
}

export interface RewardBoxResult {
  coins: number;
  diamonds: number;
  items: string[];
}

export const RewardManager = new RewardManagerClass();
