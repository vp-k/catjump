import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { firebase } from '@utils/Firebase';
import { isFirebaseConfigured } from '@config/FirebaseConfig';

/**
 * 푸시 알림 설정
 */
const PUSH_CONFIG = {
  // FCM 토큰 저장 키
  TOKEN_STORAGE_KEY: 'catjump_fcm_token',
  // VAPID 키 (Firebase Console에서 생성)
  VAPID_KEY: import.meta.env.VITE_FIREBASE_VAPID_KEY || '',
};

/**
 * 알림 유형
 */
export type NotificationType =
  | 'energy_full'
  | 'daily_reward'
  | 'streak_danger'
  | 'friend_beat_score'
  | 'event_start'
  | 'retention_d1'
  | 'retention_d3'
  | 'retention_d7';

/**
 * 푸시 알림 서비스
 */
class PushNotificationServiceClass {
  private messaging: Messaging | null = null;
  private token: string | null = null;
  private initialized = false;

  /**
   * 초기화
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) return true;

    if (!isFirebaseConfigured()) {
      console.warn('[Push] Firebase 미설정 - 푸시 알림 비활성화');
      return false;
    }

    // 브라우저 지원 확인
    if (!('Notification' in window)) {
      console.warn('[Push] 브라우저가 알림을 지원하지 않음');
      return false;
    }

    // Service Worker 지원 확인
    if (!('serviceWorker' in navigator)) {
      console.warn('[Push] Service Worker 미지원');
      return false;
    }

    try {
      // Firebase 앱이 초기화되어 있어야 함
      if (!firebase.isInitialized()) {
        await firebase.initialize();
      }

      // Messaging 인스턴스 가져오기 (웹에서만 가능)
      if (typeof window !== 'undefined') {
        const app = (firebase as unknown as { app: unknown }).app;
        if (app) {
          this.messaging = getMessaging(app as Parameters<typeof getMessaging>[0]);
        }
      }

      this.initialized = true;
      console.log('[Push] 푸시 알림 서비스 초기화 완료');
      return true;
    } catch (error) {
      console.error('[Push] 초기화 실패:', error);
      return false;
    }
  }

  /**
   * 알림 권한 요청
   */
  async requestPermission(): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        console.log('[Push] 알림 권한 허용됨');
        await this.registerToken();
        return true;
      } else {
        console.log('[Push] 알림 권한 거부됨');
        return false;
      }
    } catch (error) {
      console.error('[Push] 권한 요청 실패:', error);
      return false;
    }
  }

  /**
   * FCM 토큰 등록
   */
  private async registerToken(): Promise<void> {
    if (!this.messaging || !PUSH_CONFIG.VAPID_KEY) {
      return;
    }

    try {
      // Service Worker 등록
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

      // FCM 토큰 가져오기
      this.token = await getToken(this.messaging, {
        vapidKey: PUSH_CONFIG.VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (this.token) {
        // 토큰을 로컬에 저장
        localStorage.setItem(PUSH_CONFIG.TOKEN_STORAGE_KEY, this.token);

        // 서버에 토큰 등록
        await this.saveTokenToServer(this.token);

        console.log('[Push] FCM 토큰 등록 완료');
      }
    } catch (error) {
      console.error('[Push] 토큰 등록 실패:', error);
    }
  }

  /**
   * 서버에 토큰 저장
   */
  private async saveTokenToServer(token: string): Promise<void> {
    const db = firebase.getFirestore();
    const user = firebase.getUser();

    if (!db || !user) return;

    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const tokenRef = doc(db, 'users', user.uid, 'tokens', 'fcm');
      await setDoc(
        tokenRef,
        {
          token,
          platform: 'web',
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('[Push] 토큰 서버 저장 실패:', error);
    }
  }

  /**
   * 포그라운드 메시지 리스너 설정
   */
  setupForegroundListener(callback: (payload: { title: string; body: string; data?: Record<string, string> }) => void): void {
    if (!this.messaging) return;

    onMessage(this.messaging, (payload) => {
      console.log('[Push] 포그라운드 메시지 수신:', payload);

      const notification = payload.notification;
      if (notification) {
        callback({
          title: notification.title || '알림',
          body: notification.body || '',
          data: payload.data,
        });
      }
    });
  }

  /**
   * 알림 권한 상태 확인
   */
  getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * 토큰 가져오기
   */
  getToken(): string | null {
    return this.token || localStorage.getItem(PUSH_CONFIG.TOKEN_STORAGE_KEY);
  }

  /**
   * 알림 설정 업데이트
   */
  async updateNotificationSettings(settings: {
    energyFull?: boolean;
    dailyReward?: boolean;
    streakDanger?: boolean;
    friendActivity?: boolean;
  }): Promise<void> {
    const db = firebase.getFirestore();
    const user = firebase.getUser();

    if (!db || !user) return;

    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'notifications');
      await setDoc(
        settingsRef,
        {
          ...settings,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('[Push] 알림 설정 저장 실패:', error);
    }
  }
}

export const PushNotificationService = new PushNotificationServiceClass();
