/**
 * IAP 서비스 - 인앱 구매 관리
 *
 * Capacitor 앱에서는 @capgo/capacitor-purchases 또는 RevenueCat 사용
 * 웹에서는 더미 구현
 */

import { SaveManager } from '@managers/SaveManager';
import { AdService } from './AdService';
import { firebase } from '@utils/Firebase';

/**
 * IAP 상품 정의
 */
export interface IAPProduct {
  id: string;
  type: 'consumable' | 'non_consumable' | 'subscription';
  name: string;
  description: string;
  price: string;
  priceValue: number;
  currency: string;
  reward: {
    coins?: number;
    diamonds?: number;
    energy?: number;
    removeAds?: boolean;
  };
}

/**
 * 상품 카탈로그
 */
const PRODUCT_CATALOG: IAPProduct[] = [
  // 코인 팩
  {
    id: 'coins_small',
    type: 'consumable',
    name: '코인 주머니',
    description: '코인 500개',
    price: '₩1,100',
    priceValue: 1100,
    currency: 'KRW',
    reward: { coins: 500 },
  },
  {
    id: 'coins_medium',
    type: 'consumable',
    name: '코인 가방',
    description: '코인 1,500개 (+20% 보너스)',
    price: '₩3,300',
    priceValue: 3300,
    currency: 'KRW',
    reward: { coins: 1800 },
  },
  {
    id: 'coins_large',
    type: 'consumable',
    name: '코인 상자',
    description: '코인 5,000개 (+40% 보너스)',
    price: '₩11,000',
    priceValue: 11000,
    currency: 'KRW',
    reward: { coins: 7000 },
  },

  // 다이아몬드 팩
  {
    id: 'diamonds_small',
    type: 'consumable',
    name: '다이아몬드 조각',
    description: '다이아몬드 50개',
    price: '₩1,100',
    priceValue: 1100,
    currency: 'KRW',
    reward: { diamonds: 50 },
  },
  {
    id: 'diamonds_medium',
    type: 'consumable',
    name: '다이아몬드 주머니',
    description: '다이아몬드 150개 (+20% 보너스)',
    price: '₩3,300',
    priceValue: 3300,
    currency: 'KRW',
    reward: { diamonds: 180 },
  },
  {
    id: 'diamonds_large',
    type: 'consumable',
    name: '다이아몬드 상자',
    description: '다이아몬드 500개 (+40% 보너스)',
    price: '₩11,000',
    priceValue: 11000,
    currency: 'KRW',
    reward: { diamonds: 700 },
  },

  // 스타터 팩 (일회성)
  {
    id: 'starter_pack',
    type: 'non_consumable',
    name: '스타터 팩',
    description: '코인 1,000 + 다이아 100 + 광고 제거',
    price: '₩5,500',
    priceValue: 5500,
    currency: 'KRW',
    reward: { coins: 1000, diamonds: 100, removeAds: true },
  },

  // 광고 제거
  {
    id: 'remove_ads',
    type: 'non_consumable',
    name: '광고 제거',
    description: '모든 광고를 영구적으로 제거',
    price: '₩3,300',
    priceValue: 3300,
    currency: 'KRW',
    reward: { removeAds: true },
  },
];

/**
 * 구매 상태
 */
interface PurchaseState {
  initialized: boolean;
  isCapacitor: boolean;
  purchasedProducts: string[];
  adsRemoved: boolean;
  parentalGateVerified: boolean;
}

/**
 * 퍼널 이벤트 타입
 */
type FunnelEvent =
  | 'shop_opened'
  | 'product_viewed'
  | 'purchase_started'
  | 'parental_gate_shown'
  | 'parental_gate_passed'
  | 'parental_gate_failed'
  | 'purchase_completed'
  | 'purchase_failed'
  | 'purchase_cancelled';

/**
 * IAP 서비스 클래스
 */
class IAPServiceClass {
  private state: PurchaseState = {
    initialized: false,
    isCapacitor: false,
    purchasedProducts: [],
    adsRemoved: false,
    parentalGateVerified: false,
  };

  /**
   * 초기화
   */
  async initialize(): Promise<boolean> {
    if (this.state.initialized) return true;

    // Capacitor 환경 감지
    this.state.isCapacitor = typeof window !== 'undefined' && 'Capacitor' in window;

    // 저장된 구매 정보 로드
    this.loadPurchaseState();

    if (!this.state.isCapacitor) {
      console.log('[IAPService] 웹 환경 - IAP 비활성화');
      this.state.initialized = true;
      return true;
    }

    // 실제 앱에서는 여기서 스토어 연결
    // 예: RevenueCat, Capacitor Purchases 등

    this.state.initialized = true;
    console.log('[IAPService] 초기화 완료');
    return true;
  }

  /**
   * 저장된 구매 상태 로드
   */
  private loadPurchaseState(): void {
    try {
      const saved = localStorage.getItem('catjump_purchases');
      if (saved) {
        const data = JSON.parse(saved);
        this.state.purchasedProducts = data.purchasedProducts || [];
        this.state.adsRemoved = data.adsRemoved || false;
      }
    } catch (error) {
      console.warn('[IAPService] 구매 상태 로드 실패:', error);
    }
  }

  /**
   * 구매 상태 저장
   */
  private savePurchaseState(): void {
    try {
      localStorage.setItem(
        'catjump_purchases',
        JSON.stringify({
          purchasedProducts: this.state.purchasedProducts,
          adsRemoved: this.state.adsRemoved,
        })
      );
    } catch (error) {
      console.warn('[IAPService] 구매 상태 저장 실패:', error);
    }
  }

  /**
   * 상품 목록 가져오기
   */
  getProducts(): IAPProduct[] {
    return PRODUCT_CATALOG.filter((product) => {
      // 이미 구매한 비소모성 상품 제외
      if (product.type === 'non_consumable' && this.state.purchasedProducts.includes(product.id)) {
        return false;
      }
      return true;
    });
  }

  /**
   * 특정 상품 가져오기
   */
  getProduct(productId: string): IAPProduct | undefined {
    return PRODUCT_CATALOG.find((p) => p.id === productId);
  }

  /**
   * 상품 구매
   */
  async purchaseProduct(productId: string): Promise<{
    success: boolean;
    error?: string;
    reward?: IAPProduct['reward'];
  }> {
    const product = this.getProduct(productId);
    if (!product) {
      return { success: false, error: 'PRODUCT_NOT_FOUND' };
    }

    // 퍼널 추적: 구매 시작
    this.trackFunnelEvent('purchase_started', { productId, price: product.priceValue });

    // 보호자 게이트 확인 (COPPA 대응)
    if (!this.state.parentalGateVerified) {
      this.trackFunnelEvent('parental_gate_shown', { productId });

      const passed = await AdService.verifyParentalGate();
      if (!passed) {
        this.trackFunnelEvent('parental_gate_failed', { productId });
        return { success: false, error: 'PARENTAL_GATE_FAILED' };
      }

      this.state.parentalGateVerified = true;
      this.trackFunnelEvent('parental_gate_passed', { productId });
    }

    // 웹 환경에서는 시뮬레이션
    if (!this.state.isCapacitor) {
      return this.simulatePurchase(product);
    }

    // 실제 앱에서의 구매 로직
    try {
      // TODO: 실제 스토어 API 호출
      // const result = await StorePlugin.purchase(productId);
      // const { receipt, transactionId } = result;

      // 서버 측 영수증 검증 (실제 구현 시 활성화)
      // const verifyResult = await this.verifyPurchaseOnServer(
      //   productId,
      //   receipt,
      //   this.getPlatform(),
      //   transactionId
      // );
      // if (!verifyResult.success) {
      //   throw new Error(verifyResult.error || 'VERIFICATION_FAILED');
      // }

      // 시뮬레이션 (실제 구현 시 교체)
      return this.simulatePurchase(product);
    } catch (error) {
      console.error('[IAPService] 구매 실패:', error);
      this.trackFunnelEvent('purchase_failed', { productId, error: String(error) });
      return { success: false, error: 'PURCHASE_FAILED' };
    }
  }

  /*
   * TODO: 실제 스토어 연동 시 아래 코드 활성화
   *
   * 서버 측 구매 검증:
   * private async verifyPurchaseOnServer(
   *   productId: string, receipt: string, platform: 'android' | 'ios' | 'web', transactionId: string
   * ): Promise<{ success: boolean; error?: string; reward?: IAPProduct['reward'] }> {
   *   const { getFunctions, httpsCallable } = await import('firebase/functions');
   *   const functions = getFunctions(undefined, 'asia-northeast3');
   *   const verifyIAPPurchase = httpsCallable(functions, 'verifyIAPPurchase');
   *   const result = await verifyIAPPurchase({ productId, receipt, platform, transactionId });
   *   // ... 결과 처리
   * }
   *
   * 플랫폼 확인:
   * private getPlatform(): 'android' | 'ios' | 'web' {
   *   if (!this.state.isCapacitor) return 'web';
   *   const ua = navigator.userAgent.toLowerCase();
   *   if (ua.includes('android')) return 'android';
   *   if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
   *   return 'web';
   * }
   */

  /**
   * 구매 시뮬레이션 (개발용)
   */
  private async simulatePurchase(
    product: IAPProduct
  ): Promise<{ success: boolean; reward?: IAPProduct['reward'] }> {
    // 개발 환경에서만 시뮬레이션
    if (!import.meta.env.DEV) {
      return { success: false };
    }

    // 구매 확인 다이얼로그
    const confirmed = confirm(
      `[개발 모드] ${product.name}을(를) 구매하시겠습니까?\n가격: ${product.price}`
    );

    if (!confirmed) {
      this.trackFunnelEvent('purchase_cancelled', { productId: product.id });
      return { success: false };
    }

    // 보상 지급
    await this.grantReward(product);

    // 비소모성 상품 기록
    if (product.type === 'non_consumable') {
      this.state.purchasedProducts.push(product.id);
      this.savePurchaseState();
    }

    // 퍼널 추적: 구매 완료
    this.trackFunnelEvent('purchase_completed', {
      productId: product.id,
      revenue: product.priceValue,
    });

    return { success: true, reward: product.reward };
  }

  /**
   * 보상 지급
   */
  private async grantReward(product: IAPProduct): Promise<void> {
    const reward = product.reward;

    if (reward.coins) {
      SaveManager.addCoins(reward.coins);
    }

    if (reward.diamonds) {
      SaveManager.addDiamonds(reward.diamonds);
    }

    if (reward.removeAds) {
      this.state.adsRemoved = true;
      this.savePurchaseState();
    }

    // 저장
    await SaveManager.save();

    // 서버에 기록 (선택적)
    this.recordPurchaseToServer(product);
  }

  /**
   * 서버에 구매 기록
   */
  private async recordPurchaseToServer(product: IAPProduct): Promise<void> {
    const user = firebase.getUser();
    if (!user) return;

    try {
      const db = firebase.getFirestore();
      if (!db) return;

      const { doc, setDoc, Timestamp } = await import('firebase/firestore');
      const purchaseRef = doc(
        db,
        'users',
        user.uid,
        'purchases',
        `${product.id}_${Date.now()}`
      );

      await setDoc(purchaseRef, {
        productId: product.id,
        productName: product.name,
        price: product.priceValue,
        currency: product.currency,
        reward: product.reward,
        purchasedAt: Timestamp.now(),
      });
    } catch (error) {
      console.warn('[IAPService] 구매 기록 실패:', error);
    }
  }

  /**
   * 구매 복원
   */
  async restorePurchases(): Promise<{ restored: string[] }> {
    // 실제 앱에서는 스토어 API로 복원
    // 여기서는 저장된 상태만 확인

    const restored: string[] = [];

    // 비소모성 상품 확인
    for (const productId of this.state.purchasedProducts) {
      const product = this.getProduct(productId);
      if (product && product.type === 'non_consumable') {
        // 보상 재적용
        if (product.reward.removeAds) {
          this.state.adsRemoved = true;
        }
        restored.push(productId);
      }
    }

    this.savePurchaseState();
    return { restored };
  }

  /**
   * 광고 제거 여부
   */
  isAdsRemoved(): boolean {
    return this.state.adsRemoved;
  }

  /**
   * 상품 구매 여부 확인
   */
  hasPurchased(productId: string): boolean {
    return this.state.purchasedProducts.includes(productId);
  }

  /**
   * 퍼널 이벤트 추적
   */
  private trackFunnelEvent(event: FunnelEvent, params?: Record<string, unknown>): void {
    // Firebase Analytics로 전송
    firebase.logAnalyticsEvent(`iap_${event}`, params);

    console.log(`[IAP Funnel] ${event}`, params);
  }

  /**
   * 상점 열림 추적
   */
  trackShopOpened(): void {
    this.trackFunnelEvent('shop_opened');
  }

  /**
   * 상품 조회 추적
   */
  trackProductViewed(productId: string): void {
    this.trackFunnelEvent('product_viewed', { productId });
  }
}

export const IAPService = new IAPServiceClass();
