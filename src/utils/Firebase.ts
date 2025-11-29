import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, Auth, User } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics, logEvent } from 'firebase/analytics';
import { FIREBASE_CONFIG, isFirebaseConfigured } from '@config/FirebaseConfig';

/**
 * Firebase 서비스 싱글톤
 */
class FirebaseService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private db: Firestore | null = null;
  private analytics: Analytics | null = null;
  private currentUser: User | null = null;
  private initialized = false;

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
   * 익명 로그인
   */
  async signInAnonymous(): Promise<User | null> {
    if (!this.auth) {
      console.warn('[Firebase] Auth 미초기화');
      return null;
    }

    try {
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
}

// 싱글톤 인스턴스
export const firebase = new FirebaseService();
