/* eslint-disable no-undef */
// Firebase Messaging Service Worker

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// 빌드 시 생성되는 Firebase 설정 파일 로드
try {
  importScripts('./firebase-config.js');
} catch (e) {
  console.warn('[SW] firebase-config.js 로드 실패 - 개발 환경에서는 정상');
}

// Firebase 설정 (빌드 시 firebase-config.js에서 주입됨)
const firebaseConfig = self.__FIREBASE_CONFIG__ || {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

// 알림 타입별 액션 버튼
function getNotificationActions(type) {
  switch (type) {
    case 'energy_full':
      return [{ action: 'play', title: '지금 플레이!' }];
    case 'daily_reward':
      return [{ action: 'claim', title: '보상 받기' }];
    case 'streak_danger':
      return [{ action: 'claim', title: '스트릭 지키기' }];
    default:
      return [];
  }
}

// 설정이 비어있으면 초기화하지 않음
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  firebase.initializeApp(firebaseConfig);

  const messaging = firebase.messaging();

  // 백그라운드 메시지 핸들러
  messaging.onBackgroundMessage((payload) => {
    console.log('[SW] 백그라운드 메시지 수신:', payload);

    const notificationTitle = payload.notification?.title || '냥점프';
    const notificationOptions = {
      body: payload.notification?.body || '',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      tag: payload.data?.type || 'default',
      data: payload.data,
      actions: getNotificationActions(payload.data?.type),
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} else {
  console.warn('[SW] Firebase 설정이 없어 초기화 건너뜀');
}

// 알림 클릭 핸들러
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 알림 클릭:', event);

  event.notification.close();

  // 클릭 액션에 따른 처리
  const data = event.notification.data || {};
  let url = '/';

  switch (data.type) {
    case 'energy_full':
      url = '/?action=play';
      break;
    case 'daily_reward':
      url = '/?action=claim_daily';
      break;
    case 'streak_danger':
      url = '/?action=claim_daily';
      break;
    case 'friend_beat_score':
      url = '/?action=leaderboard';
      break;
    default:
      url = '/';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 이미 열린 창이 있으면 포커스
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // 없으면 새 창 열기
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
