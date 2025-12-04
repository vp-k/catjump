/**
 * 광고 서비스 - AdMob 통합
 *
 * Capacitor 앱에서는 @capacitor-community/admob 플러그인 사용
 * 웹에서는 더미 구현 (광고 불가)
 */

import { SaveManager } from '@managers/SaveManager';

/**
 * 광고 설정
 */
const AD_CONFIG = {
  // 광고 단위 ID (테스트 ID)
  REWARDED_AD_ID_ANDROID:
    import.meta.env.VITE_ADMOB_REWARDED_ANDROID || 'ca-app-pub-3940256099942544/5224354917',
  REWARDED_AD_ID_IOS:
    import.meta.env.VITE_ADMOB_REWARDED_IOS || 'ca-app-pub-3940256099942544/1712485313',
  INTERSTITIAL_AD_ID_ANDROID:
    import.meta.env.VITE_ADMOB_INTERSTITIAL_ANDROID || 'ca-app-pub-3940256099942544/1033173712',
  INTERSTITIAL_AD_ID_IOS:
    import.meta.env.VITE_ADMOB_INTERSTITIAL_IOS || 'ca-app-pub-3940256099942544/4411468910',

  // 전면 광고 노출 제어
  INTERSTITIAL_MIN_INTERVAL_MS: 3 * 60 * 1000, // 최소 3분 간격
  INTERSTITIAL_AFTER_GAMES: 3, // 3게임마다 1회
  MAX_INTERSTITIAL_PER_SESSION: 5, // 세션당 최대 5회

  // 보상 설정
  REWARDED_COINS: 50,
  REWARDED_ENERGY: 1,

  // COPPA/GDPR
  TAG_FOR_CHILD_DIRECTED_TREATMENT: true, // COPPA 대상 (어린이용 앱)
  TAG_FOR_UNDER_AGE_OF_CONSENT: true, // GDPR 미성년자 동의 태그

  // 광고 타임아웃
  AD_TIMEOUT_MS: 30000, // 30초 타임아웃
};

/**
 * 광고 결과
 */
export interface AdResult {
  success: boolean;
  rewarded: boolean;
  type: 'coins' | 'energy' | 'double' | 'none';
  amount: number;
}

/**
 * 광고 상태
 */
interface AdState {
  lastInterstitialTime: number;
  gamesPlayedSinceLastAd: number;
  interstitialsShownThisSession: number;
  rewardedAdsWatchedToday: number;
  lastRewardedAdDay: number;
  consentStatus: 'unknown' | 'required' | 'obtained' | 'not_required';
  ageVerified: boolean;
}

/**
 * 광고 서비스 클래스
 */
class AdServiceClass {
  private initialized = false;
  private isCapacitor = false;
  private state: AdState = {
    lastInterstitialTime: 0,
    gamesPlayedSinceLastAd: 0,
    interstitialsShownThisSession: 0,
    rewardedAdsWatchedToday: 0,
    lastRewardedAdDay: 0,
    consentStatus: 'unknown',
    ageVerified: false,
  };

  /**
   * 초기화
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) return true;

    // Capacitor 환경 감지
    this.isCapacitor = typeof window !== 'undefined' && 'Capacitor' in window;

    if (!this.isCapacitor) {
      console.log('[AdService] 웹 환경 - 광고 비활성화');
      this.initialized = true;
      return true;
    }

    try {
      // Capacitor AdMob 플러그인 동적 로드
      const { AdMob, AdmobConsentStatus } = await import('@capacitor-community/admob');

      // AdMob 초기화 (COPPA/GDPR 설정 포함)
      await AdMob.initialize({
        initializeForTesting: import.meta.env.DEV,
        tagForChildDirectedTreatment: AD_CONFIG.TAG_FOR_CHILD_DIRECTED_TREATMENT,
        tagForUnderAgeOfConsent: AD_CONFIG.TAG_FOR_UNDER_AGE_OF_CONSENT,
      });

      // 동의 상태 확인
      const consentInfo = await AdMob.requestConsentInfo();
      this.state.consentStatus =
        consentInfo.status === AdmobConsentStatus.OBTAINED
          ? 'obtained'
          : consentInfo.isConsentFormAvailable
            ? 'required'
            : 'not_required';

      // 동의가 필요하고 폼이 가능한 경우 동의 요청
      if (this.state.consentStatus === 'required') {
        await AdMob.showConsentForm();
        const newInfo = await AdMob.requestConsentInfo();
        this.state.consentStatus =
          newInfo.status === AdmobConsentStatus.OBTAINED ? 'obtained' : 'required';
      }

      // 광고 미리 로드
      await this.preloadAds();

      this.initialized = true;
      console.log('[AdService] 초기화 완료');
      return true;
    } catch (error) {
      console.error('[AdService] 초기화 실패:', error);
      this.initialized = true; // 에러 시에도 앱 동작은 유지
      return false;
    }
  }

  /**
   * 광고 미리 로드
   */
  private async preloadAds(): Promise<void> {
    try {
      const { AdMob } = await import('@capacitor-community/admob');

      // 보상형 광고 로드
      const platform = this.getPlatform();
      const rewardedId =
        platform === 'ios' ? AD_CONFIG.REWARDED_AD_ID_IOS : AD_CONFIG.REWARDED_AD_ID_ANDROID;

      await AdMob.prepareRewardVideoAd({
        adId: rewardedId,
        isTesting: import.meta.env.DEV,
      });

      // 전면 광고 로드
      const interstitialId =
        platform === 'ios'
          ? AD_CONFIG.INTERSTITIAL_AD_ID_IOS
          : AD_CONFIG.INTERSTITIAL_AD_ID_ANDROID;

      await AdMob.prepareInterstitial({
        adId: interstitialId,
        isTesting: import.meta.env.DEV,
      });

      console.log('[AdService] 광고 프리로드 완료');
    } catch (error) {
      console.warn('[AdService] 광고 프리로드 실패:', error);
    }
  }

  /**
   * 플랫폼 확인
   */
  private getPlatform(): 'android' | 'ios' | 'web' {
    if (!this.isCapacitor) return 'web';

    const Capacitor = (window as unknown as { Capacitor?: { getPlatform: () => string } })
      .Capacitor;
    if (Capacitor) {
      const platform = Capacitor.getPlatform();
      if (platform === 'ios') return 'ios';
      if (platform === 'android') return 'android';
    }
    return 'web';
  }

  /**
   * 보상형 광고 시청 가능 여부
   */
  canShowRewardedAd(): boolean {
    // 웹에서는 광고 불가
    if (!this.isCapacitor) return false;

    // 동의가 필요하지만 얻지 못한 경우
    if (this.state.consentStatus === 'required') return false;

    return true;
  }

  /**
   * 리스너 정리 헬퍼
   */
  private cleanupListeners(listeners: Array<{ remove: () => void }>): void {
    listeners.forEach((listener) => {
      try {
        listener.remove();
      } catch (e) {
        console.warn('[AdService] 리스너 정리 실패:', e);
      }
    });
  }

  /**
   * 보상형 광고 표시 (코인 보상)
   */
  async showRewardedAdForCoins(): Promise<AdResult> {
    if (!this.canShowRewardedAd()) {
      return { success: false, rewarded: false, type: 'none', amount: 0 };
    }

    try {
      const { AdMob, RewardAdPluginEvents } = await import('@capacitor-community/admob');

      return new Promise<AdResult>(async (resolve) => {
        let resolved = false;
        const listeners: Array<{ remove: () => void }> = [];

        // 타임아웃 설정
        const timeoutId = setTimeout(() => {
          if (resolved) return;
          resolved = true;
          console.warn('[AdService] 보상형 광고 타임아웃');
          this.cleanupListeners(listeners);
          resolve({ success: false, rewarded: false, type: 'none', amount: 0 });
        }, AD_CONFIG.AD_TIMEOUT_MS);

        // 보상 콜백 설정
        const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeoutId);
          SaveManager.addCoins(AD_CONFIG.REWARDED_COINS);
          this.state.rewardedAdsWatchedToday++;
          this.cleanupListeners(listeners);
          resolve({
            success: true,
            rewarded: true,
            type: 'coins',
            amount: AD_CONFIG.REWARDED_COINS,
          });
        });
        listeners.push(rewardListener);

        // 실패 콜백
        const failListener = await AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeoutId);
          this.cleanupListeners(listeners);
          resolve({ success: false, rewarded: false, type: 'none', amount: 0 });
        });
        listeners.push(failListener);

        // 광고 표시
        AdMob.showRewardVideoAd();
      });
    } catch (error) {
      console.error('[AdService] 보상형 광고 표시 실패:', error);
      return { success: false, rewarded: false, type: 'none', amount: 0 };
    }
  }

  /**
   * 보상형 광고 표시 (에너지 보상)
   */
  async showRewardedAdForEnergy(): Promise<AdResult> {
    if (!this.canShowRewardedAd()) {
      return { success: false, rewarded: false, type: 'none', amount: 0 };
    }

    try {
      const { AdMob, RewardAdPluginEvents } = await import('@capacitor-community/admob');

      return new Promise<AdResult>(async (resolve) => {
        let resolved = false;
        const listeners: Array<{ remove: () => void }> = [];

        // 타임아웃 설정
        const timeoutId = setTimeout(() => {
          if (resolved) return;
          resolved = true;
          console.warn('[AdService] 보상형 광고 타임아웃');
          this.cleanupListeners(listeners);
          resolve({ success: false, rewarded: false, type: 'none', amount: 0 });
        }, AD_CONFIG.AD_TIMEOUT_MS);

        const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeoutId);
          // 에너지 추가
          const data = SaveManager.getData();
          const newEnergy = Math.min(data.energy.current + AD_CONFIG.REWARDED_ENERGY, data.energy.max);
          SaveManager.updateEnergy({ current: newEnergy });
          this.state.rewardedAdsWatchedToday++;
          this.cleanupListeners(listeners);
          resolve({
            success: true,
            rewarded: true,
            type: 'energy',
            amount: AD_CONFIG.REWARDED_ENERGY,
          });
        });
        listeners.push(rewardListener);

        const failListener = await AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeoutId);
          this.cleanupListeners(listeners);
          resolve({ success: false, rewarded: false, type: 'none', amount: 0 });
        });
        listeners.push(failListener);

        AdMob.showRewardVideoAd();
      });
    } catch (error) {
      console.error('[AdService] 보상형 광고 표시 실패:', error);
      return { success: false, rewarded: false, type: 'none', amount: 0 };
    }
  }

  /**
   * 보상형 광고 표시 (코인 2배)
   */
  async showRewardedAdForDouble(baseCoins: number): Promise<AdResult> {
    if (!this.canShowRewardedAd()) {
      return { success: false, rewarded: false, type: 'none', amount: 0 };
    }

    try {
      const { AdMob, RewardAdPluginEvents } = await import('@capacitor-community/admob');

      return new Promise<AdResult>(async (resolve) => {
        let resolved = false;
        const listeners: Array<{ remove: () => void }> = [];

        // 타임아웃 설정
        const timeoutId = setTimeout(() => {
          if (resolved) return;
          resolved = true;
          console.warn('[AdService] 보상형 광고 타임아웃');
          this.cleanupListeners(listeners);
          resolve({ success: false, rewarded: false, type: 'none', amount: 0 });
        }, AD_CONFIG.AD_TIMEOUT_MS);

        const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeoutId);
          SaveManager.addCoins(baseCoins); // 추가 코인 (2배가 되도록)
          this.state.rewardedAdsWatchedToday++;
          this.cleanupListeners(listeners);
          resolve({
            success: true,
            rewarded: true,
            type: 'double',
            amount: baseCoins,
          });
        });
        listeners.push(rewardListener);

        const failListener = await AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeoutId);
          this.cleanupListeners(listeners);
          resolve({ success: false, rewarded: false, type: 'none', amount: 0 });
        });
        listeners.push(failListener);

        AdMob.showRewardVideoAd();
      });
    } catch (error) {
      console.error('[AdService] 보상형 광고 표시 실패:', error);
      return { success: false, rewarded: false, type: 'none', amount: 0 };
    }
  }

  /**
   * 전면 광고 표시 가능 여부
   */
  canShowInterstitial(): boolean {
    if (!this.isCapacitor) return false;
    if (this.state.consentStatus === 'required') return false;

    const now = Date.now();

    // 최소 간격 체크
    if (now - this.state.lastInterstitialTime < AD_CONFIG.INTERSTITIAL_MIN_INTERVAL_MS) {
      return false;
    }

    // 세션 최대 횟수 체크
    if (this.state.interstitialsShownThisSession >= AD_CONFIG.MAX_INTERSTITIAL_PER_SESSION) {
      return false;
    }

    // 게임 횟수 체크
    if (this.state.gamesPlayedSinceLastAd < AD_CONFIG.INTERSTITIAL_AFTER_GAMES) {
      return false;
    }

    return true;
  }

  /**
   * 게임 완료 시 호출 (전면 광고 카운터 증가)
   */
  onGameComplete(): void {
    this.state.gamesPlayedSinceLastAd++;
  }

  /**
   * 전면 광고 표시
   */
  async showInterstitial(): Promise<boolean> {
    if (!this.canShowInterstitial()) {
      return false;
    }

    try {
      const { AdMob, InterstitialAdPluginEvents } = await import('@capacitor-community/admob');

      return new Promise<boolean>(async (resolve) => {
        let resolved = false;
        const listeners: Array<{ remove: () => void }> = [];

        // 타임아웃 설정
        const timeoutId = setTimeout(() => {
          if (resolved) return;
          resolved = true;
          console.warn('[AdService] 전면 광고 타임아웃');
          this.cleanupListeners(listeners);
          resolve(false);
        }, AD_CONFIG.AD_TIMEOUT_MS);

        const shownListener = await AdMob.addListener(InterstitialAdPluginEvents.Showed, () => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeoutId);
          this.state.lastInterstitialTime = Date.now();
          this.state.gamesPlayedSinceLastAd = 0;
          this.state.interstitialsShownThisSession++;
          this.cleanupListeners(listeners);

          // 광고 다시 로드
          this.preloadAds();
          resolve(true);
        });
        listeners.push(shownListener);

        const failListener = await AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, () => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeoutId);
          this.cleanupListeners(listeners);
          resolve(false);
        });
        listeners.push(failListener);

        AdMob.showInterstitial();
      });
    } catch (error) {
      console.error('[AdService] 전면 광고 표시 실패:', error);
      return false;
    }
  }

  /**
   * 보호자 게이트 확인 (IAP용)
   */
  async verifyParentalGate(): Promise<boolean> {
    // 간단한 수학 문제로 보호자 확인
    return new Promise((resolve) => {
      const num1 = Math.floor(Math.random() * 10) + 10; // 10-19
      const num2 = Math.floor(Math.random() * 10) + 1; // 1-10
      const answer = num1 + num2;

      const userAnswer = prompt(`보호자 확인: ${num1} + ${num2} = ?`);

      if (userAnswer && parseInt(userAnswer, 10) === answer) {
        this.state.ageVerified = true;
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  /**
   * 동의 상태 가져오기
   */
  getConsentStatus(): string {
    return this.state.consentStatus;
  }

  /**
   * 오늘 시청한 보상형 광고 횟수
   */
  getRewardedAdsWatchedToday(): number {
    const today = new Date().toDateString();
    const lastDay = new Date(this.state.lastRewardedAdDay).toDateString();

    if (today !== lastDay) {
      this.state.rewardedAdsWatchedToday = 0;
      this.state.lastRewardedAdDay = Date.now();
    }

    return this.state.rewardedAdsWatchedToday;
  }
}

export const AdService = new AdServiceClass();
