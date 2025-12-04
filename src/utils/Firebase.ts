import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, Auth, User, browserLocalPersistence, setPersistence, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  enableIndexedDbPersistence,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
} from 'firebase/firestore';
import { getAnalytics, Analytics, logEvent } from 'firebase/analytics';
import { getFunctions, httpsCallable, Functions } from 'firebase/functions';
import { FIREBASE_CONFIG, isFirebaseConfigured } from '@config/FirebaseConfig';

/**
 * Firebase 에러 타입
 */
type FirebaseErrorCode =
  | 'unavailable' // 서버 연결 불가
  | 'network-request-failed' // 네트워크 요청 실패
  | 'permission-denied' // 권한 없음
  | 'unauthenticated' // 인증 필요
  | 'resource-exhausted' // Rate limit
  | 'unknown'; // 기타

/**
 * Firebase 서비스 싱글톤
 */
class FirebaseService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private db: Firestore | null = null;
  private analytics: Analytics | null = null;
  private functions: Functions | null = null;
  private currentUser: User | null = null;
  private initialized = false;
  private offlineEnabled = false;
  private isOnline = true;
  private onlineListeners: Array<(online: boolean) => void> = [];

  /**
   * Firebase 초기화
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) return true;

    if (!isFirebaseConfigured()) {
      console.warn('[Firebase] 설정되지 않음 - 오프라인 모드로 동작');
      return false;
    }

    try {
      this.app = initializeApp(FIREBASE_CONFIG);
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);
      this.functions = getFunctions(this.app, 'asia-northeast3');

      // 오프라인 지원 활성화
      await this.enableOfflineSupport();

      // 네트워크 상태 감지 설정
      this.setupNetworkDetection();

      // Analytics는 브라우저 환경에서만
      if (typeof window !== 'undefined') {
        this.analytics = getAnalytics(this.app);
      }

      this.initialized = true;
      console.log('[Firebase] 초기화 완료');
      return true;
    } catch (error) {
      console.error('[Firebase] 초기화 실패:', error);
      return false;
    }
  }

  /**
   * 익명 로그인 (세션 영구성 보장)
   */
  async signInAnonymous(): Promise<User | null> {
    if (!this.auth) {
      console.warn('[Firebase] Auth 미초기화');
      return null;
    }

    try {
      // 브라우저 로컬 스토리지에 세션 영구 저장
      await setPersistence(this.auth, browserLocalPersistence);

      // 기존 사용자가 있는지 확인
      const existingUser = await this.waitForAuthState();
      if (existingUser) {
        this.currentUser = existingUser;
        console.log('[Firebase] 기존 익명 세션 복원:', this.currentUser.uid);
        return this.currentUser;
      }

      // 새로운 익명 로그인
      const result = await signInAnonymously(this.auth);
      this.currentUser = result.user;
      console.log('[Firebase] 익명 로그인 성공:', this.currentUser.uid);
      return this.currentUser;
    } catch (error) {
      console.error('[Firebase] 익명 로그인 실패:', error);
      return null;
    }
  }

  /**
   * Auth 상태 대기 (기존 세션 확인)
   */
  private waitForAuthState(): Promise<User | null> {
    return new Promise((resolve) => {
      if (!this.auth) {
        resolve(null);
        return;
      }

      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        unsubscribe();
        resolve(user);
      });

      // 타임아웃 (2초 후에도 응답 없으면 null)
      setTimeout(() => {
        unsubscribe();
        resolve(null);
      }, 2000);
    });
  }

  /**
   * 현재 사용자 가져오기
   */
  getUser(): User | null {
    return this.currentUser;
  }

  /**
   * Firestore 인스턴스 가져오기
   */
  getFirestore(): Firestore | null {
    return this.db;
  }

  /**
   * Analytics 이벤트 로깅
   */
  logAnalyticsEvent(eventName: string, params?: Record<string, unknown>): void {
    if (!this.analytics) return;

    try {
      logEvent(this.analytics, eventName, params);
    } catch (error) {
      console.warn('[Firebase] Analytics 이벤트 로깅 실패:', error);
    }
  }

  /**
   * 초기화 여부 확인
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * 오프라인 지원 활성화
   */
  private async enableOfflineSupport(): Promise<void> {
    if (!this.db || this.offlineEnabled) return;

    try {
      await enableIndexedDbPersistence(this.db);
      this.offlineEnabled = true;
      console.log('[Firebase] 오프라인 지원 활성화');
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (err.code === 'failed-precondition') {
        // 여러 탭에서 사용 중
        console.warn('[Firebase] 오프라인 지원 불가 - 다른 탭에서 사용 중');
      } else if (err.code === 'unimplemented') {
        // 브라우저가 IndexedDB를 지원하지 않음
        console.warn('[Firebase] 오프라인 지원 불가 - 브라우저 미지원');
      } else {
        console.warn('[Firebase] 오프라인 지원 활성화 실패:', error);
      }
    }
  }

  /**
   * 네트워크 상태 감지 설정
   */
  private setupNetworkDetection(): void {
    if (typeof window === 'undefined') return;

    // 초기 상태
    this.isOnline = navigator.onLine;

    // 네트워크 상태 변경 감지
    window.addEventListener('online', () => {
      console.log('[Firebase] 네트워크 연결됨');
      this.isOnline = true;
      this.notifyOnlineChange(true);
    });

    window.addEventListener('offline', () => {
      console.log('[Firebase] 네트워크 연결 끊김');
      this.isOnline = false;
      this.notifyOnlineChange(false);
    });
  }

  /**
   * 온라인 상태 변경 알림
   */
  private notifyOnlineChange(online: boolean): void {
    this.onlineListeners.forEach((listener) => listener(online));
  }

  /**
   * 온라인 상태 변경 리스너 등록
   */
  onOnlineChange(callback: (online: boolean) => void): () => void {
    this.onlineListeners.push(callback);
    return () => {
      this.onlineListeners = this.onlineListeners.filter((l) => l !== callback);
    };
  }

  /**
   * 현재 온라인 상태
   */
  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Firebase 에러 코드 분류
   */
  private classifyError(error: unknown): FirebaseErrorCode {
    const err = error as { code?: string; message?: string };
    const code = err.code || '';
    const message = err.message || '';

    if (code.includes('unavailable') || message.includes('unavailable')) {
      return 'unavailable';
    }
    if (code.includes('network') || message.includes('network') || message.includes('Failed to fetch')) {
      return 'network-request-failed';
    }
    if (code.includes('permission-denied')) {
      return 'permission-denied';
    }
    if (code.includes('unauthenticated')) {
      return 'unauthenticated';
    }
    if (code.includes('resource-exhausted')) {
      return 'resource-exhausted';
    }
    return 'unknown';
  }

  /**
   * 오프라인 친화적 에러 처리
   */
  private handleOfflineError(error: unknown, operation: string): void {
    const errorCode = this.classifyError(error);

    switch (errorCode) {
      case 'unavailable':
      case 'network-request-failed':
        console.log(`[Firebase] ${operation} - 오프라인 모드로 동작`);
        break;
      case 'permission-denied':
        console.warn(`[Firebase] ${operation} - 권한 없음`);
        break;
      case 'unauthenticated':
        console.warn(`[Firebase] ${operation} - 재인증 필요`);
        // 재인증 시도
        this.signInAnonymous().catch(() => {});
        break;
      case 'resource-exhausted':
        console.warn(`[Firebase] ${operation} - Rate limit 도달, 잠시 후 재시도`);
        break;
      default:
        console.warn(`[Firebase] ${operation} 실패:`, error);
    }
  }

  /**
   * 재시도 가능한 작업 실행
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries = 2,
    delayMs = 1000
  ): Promise<T | null> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        const errorCode = this.classifyError(error);

        // 재시도 불가능한 에러
        if (errorCode === 'permission-denied' || errorCode === 'unauthenticated') {
          this.handleOfflineError(error, operationName);
          return null;
        }

        // 마지막 시도였으면 실패 처리
        if (attempt === maxRetries) {
          this.handleOfflineError(error, operationName);
          return null;
        }

        // 재시도 가능한 에러 - 대기 후 재시도
        if (errorCode === 'unavailable' || errorCode === 'network-request-failed' || errorCode === 'resource-exhausted') {
          const waitTime = delayMs * Math.pow(2, attempt); // 지수 백오프
          console.log(`[Firebase] ${operationName} - ${waitTime}ms 후 재시도 (${attempt + 1}/${maxRetries})`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
    }
    return null;
  }

  /**
   * Cloud Function 호출: 점수 검증
   */
  async validateScore(data: {
    score: number;
    floor: number;
    perfectCount: number;
    maxCombo: number;
    playTime: number;
    actions: { time: number; type: string }[];
  }): Promise<{ valid: boolean; reason?: string }> {
    if (!this.functions || !this.isOnline) {
      return { valid: true }; // 오프라인 모드에서는 검증 스킵
    }

    const result = await this.executeWithRetry(
      async () => {
        const validateScoreFn = httpsCallable<typeof data, { valid: boolean; reason?: string }>(
          this.functions!,
          'validateScore'
        );
        const res = await validateScoreFn(data);
        return res.data;
      },
      '점수 검증',
      1 // 점수 검증은 1번만 재시도
    );

    return result ?? { valid: true }; // 실패 시 게임 진행 허용
  }

  /**
   * Cloud Function 호출: 보상 지급
   */
  async grantReward(data: {
    type: 'daily_login' | 'mission' | 'streak' | 'offline' | 'ad';
    rewardId?: string;
  }): Promise<{ success: boolean; reward?: { type: string; amount: number } }> {
    if (!this.functions || !this.isOnline) {
      return { success: false };
    }

    const result = await this.executeWithRetry(
      async () => {
        const grantRewardFn = httpsCallable<typeof data, { success: boolean; reward?: { type: string; amount: number } }>(
          this.functions!,
          'grantReward'
        );
        const res = await grantRewardFn(data);
        return res.data;
      },
      '보상 지급',
      2 // 보상은 중요하므로 2번 재시도
    );

    return result ?? { success: false };
  }

  /**
   * Cloud Function 호출: 리더보드 업데이트
   */
  async updateLeaderboard(data: {
    score: number;
    floor: number;
    nickname?: string;
  }): Promise<{ success: boolean; rank?: number }> {
    if (!this.functions || !this.isOnline) {
      return { success: false };
    }

    const result = await this.executeWithRetry(
      async () => {
        const updateLeaderboardFn = httpsCallable<typeof data, { success: boolean; rank?: number }>(
          this.functions!,
          'updateLeaderboard'
        );
        const res = await updateLeaderboardFn(data);
        return res.data;
      },
      '리더보드 업데이트',
      2 // 리더보드는 중요하므로 2번 재시도
    );

    return result ?? { success: false };
  }

  /**
   * 리더보드 조회 (전체)
   */
  async getGlobalLeaderboard(limitCount: number = 100): Promise<{
    uid: string;
    nickname: string;
    score: number;
    floor: number;
    updatedAt: number;
  }[]> {
    if (!this.db) return [];

    try {
      const leaderboardRef = collection(this.db, 'leaderboard');
      const q = query(leaderboardRef, orderBy('score', 'desc'), limit(limitCount));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((docSnap) => ({
        uid: docSnap.id,
        ...(docSnap.data() as {
          nickname: string;
          score: number;
          floor: number;
          updatedAt: number;
        }),
      }));
    } catch (error) {
      console.warn('[Firebase] 리더보드 조회 실패:', error);
      return [];
    }
  }

  /**
   * 주간 리더보드 조회
   */
  async getWeeklyLeaderboard(limitCount: number = 100): Promise<{
    uid: string;
    nickname: string;
    score: number;
    floor: number;
    updatedAt: number;
  }[]> {
    if (!this.db) return [];

    try {
      const currentWeekId = this.getISOWeekId();
      const weeklyRef = collection(this.db, 'leaderboard_weekly');

      // weekId equality + orderBy score desc (Firestore에서 직접 정렬)
      const q = query(
        weeklyRef,
        where('weekId', '==', currentWeekId),
        orderBy('score', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((docSnap) => ({
        uid: docSnap.id,
        ...(docSnap.data() as {
          nickname: string;
          score: number;
          floor: number;
          updatedAt: number;
        }),
      }));
    } catch (error) {
      console.warn('[Firebase] 주간 리더보드 조회 실패:', error);
      return [];
    }
  }

  /**
   * KST 기준 ISO 주차 ID 반환 (YYYY-WXX)
   */
  private getISOWeekId(): string {
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstTime = new Date(now.getTime() + kstOffset);

    // ISO 주차 계산 (목요일이 속한 주)
    const dayOfWeek = kstTime.getUTCDay();
    const thursday = new Date(kstTime);
    thursday.setUTCDate(kstTime.getUTCDate() - ((dayOfWeek + 6) % 7) + 3);

    const firstThursday = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 4));
    const weekNumber = Math.ceil(
      ((thursday.getTime() - firstThursday.getTime()) / 86400000 + 1) / 7
    );

    return `${thursday.getUTCFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
  }

  /**
   * 내 순위 조회
   */
  async getMyRank(): Promise<{ globalRank: number; weeklyRank: number } | null> {
    if (!this.db || !this.currentUser) return null;

    try {
      const myDocRef = doc(this.db, 'leaderboard', this.currentUser.uid);
      const myDoc = await getDoc(myDocRef);

      if (!myDoc.exists()) {
        return null;
      }

      const myScore = myDoc.data().score;

      // 내 점수보다 높은 점수 개수 카운트
      const leaderboardRef = collection(this.db, 'leaderboard');
      const higherScoreQuery = query(
        leaderboardRef,
        orderBy('score', 'desc'),
        limit(1000)
      );
      const snapshot = await getDocs(higherScoreQuery);

      let globalRank = 1;
      for (const docSnap of snapshot.docs) {
        if (docSnap.data().score > myScore) {
          globalRank++;
        } else {
          break;
        }
      }

      return { globalRank, weeklyRank: globalRank }; // 주간은 별도 구현 필요
    } catch (error) {
      console.warn('[Firebase] 순위 조회 실패:', error);
      return null;
    }
  }

  /**
   * 사용자 프로필 업데이트
   */
  async updateUserProfile(data: {
    nickname?: string;
    avatarId?: string;
  }): Promise<boolean> {
    if (!this.db || !this.currentUser) return false;

    try {
      const userRef = doc(this.db, 'users', this.currentUser.uid, 'profile', 'main');
      await setDoc(userRef, { ...data, updatedAt: Date.now() }, { merge: true });
      return true;
    } catch (error) {
      console.warn('[Firebase] 프로필 업데이트 실패:', error);
      return false;
    }
  }

  /**
   * 사용자 프로필 조회
   */
  async getUserProfile(): Promise<{
    nickname: string;
    avatarId: string;
    createdAt: number;
  } | null> {
    if (!this.db || !this.currentUser) return null;

    try {
      const userRef = doc(this.db, 'users', this.currentUser.uid, 'profile', 'main');
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // 기본 프로필 생성
        const defaultProfile = {
          nickname: `Cat${this.currentUser.uid.slice(0, 6)}`,
          avatarId: 'default',
          createdAt: Date.now(),
        };
        await setDoc(userRef, defaultProfile);
        return defaultProfile;
      }

      return userDoc.data() as {
        nickname: string;
        avatarId: string;
        createdAt: number;
      };
    } catch (error) {
      console.warn('[Firebase] 프로필 조회 실패:', error);
      return null;
    }
  }
}

// 싱글톤 인스턴스
export const firebase = new FirebaseService();
