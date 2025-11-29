/**
 * Firebase 설정
 * 실제 프로젝트 생성 후 값을 채워야 함
 */
export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

/**
 * Firebase 설정이 유효한지 확인
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId);
}
