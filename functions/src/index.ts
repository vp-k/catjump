import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

// ============================================
// Rate Limiting 시스템
// ============================================

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const RATE_LIMIT_CONFIG: Record<string, RateLimitConfig> = {
  validateScore: { maxRequests: 10, windowMs: 60 * 1000 }, // 분당 10회
  grantReward: { maxRequests: 5, windowMs: 60 * 1000 }, // 분당 5회
  updateLeaderboard: { maxRequests: 10, windowMs: 60 * 1000 }, // 분당 10회
};

/**
 * Rate Limiting 체크 (Firestore 기반)
 * @returns true if rate limited, false if allowed
 */
async function isRateLimited(uid: string, functionName: string): Promise<boolean> {
  const config = RATE_LIMIT_CONFIG[functionName];
  if (!config) return false;

  const now = Date.now();
  const windowStart = now - config.windowMs;
  const rateLimitRef = db.collection('rate_limits').doc(`${uid}_${functionName}`);

  try {
    const result = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(rateLimitRef);
      const data = doc.exists ? doc.data() : null;

      if (!data) {
        // 첫 요청
        transaction.set(rateLimitRef, {
          requests: [now],
          updatedAt: now,
        });
        return false;
      }

      // 윈도우 내 요청만 필터링
      const recentRequests = (data.requests || []).filter(
        (timestamp: number) => timestamp > windowStart
      );

      if (recentRequests.length >= config.maxRequests) {
        // Rate limit 초과
        return true;
      }

      // 새 요청 추가
      recentRequests.push(now);
      transaction.update(rateLimitRef, {
        requests: recentRequests,
        updatedAt: now,
      });

      return false;
    });

    return result;
  } catch (error) {
    console.error(`[RateLimit] Error checking rate limit for ${uid}:`, error);
    // 에러 시 요청 허용 (fail-open)
    return false;
  }
}

/**
 * Rate Limit 오래된 데이터 정리 (매일 새벽 4시)
 */
export const cleanupRateLimits = functions
  .region('asia-northeast3')
  .pubsub.schedule('0 4 * * *')
  .timeZone('Asia/Seoul')
  .onRun(async () => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    const oldLimits = await db
      .collection('rate_limits')
      .where('updatedAt', '<', oneDayAgo)
      .limit(500)
      .get();

    const batch = db.batch();
    oldLimits.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    console.log(`[RateLimit] Cleaned up ${oldLimits.size} old rate limit records`);
    return null;
  });

/**
 * 점수 검증 상수
 */
const SCORE_VALIDATION = {
  MAX_SCORE_PER_FLOOR: 500, // 최대 층당 점수 (Perfect + 콤보 + 황금캔)
  MAX_FLOOR_PER_MINUTE: 30, // 분당 최대 층수
  MIN_PLAY_TIME_MS: 5000, // 최소 플레이 시간 (5초)
  MAX_COMBO_MULTIPLIER: 4, // 최대 콤보 배율
};

/**
 * 점수 검증 데이터 인터페이스
 */
interface ScoreValidationInput {
  score: number;
  floor: number;
  perfectCount: number;
  maxCombo: number;
  playTime: number;
}

/**
 * 점수 검증 결과 인터페이스
 */
interface ScoreValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * 점수 검증 헬퍼 함수 (내부 재사용용)
 */
function validateScoreData(data: ScoreValidationInput): ScoreValidationResult {
  const { score, floor, perfectCount, maxCombo, playTime } = data;

  // 기본 유효성 검사
  if (
    typeof score !== 'number' ||
    typeof floor !== 'number' ||
    typeof playTime !== 'number' ||
    score < 0 ||
    floor < 0
  ) {
    return { valid: false, reason: 'INVALID_DATA' };
  }

  // 플레이 시간 검증
  if (playTime < SCORE_VALIDATION.MIN_PLAY_TIME_MS) {
    return { valid: false, reason: 'PLAY_TIME_TOO_SHORT' };
  }

  // 층수 대비 플레이 시간 검증
  const playTimeMinutes = playTime / 60000;
  const maxPossibleFloors = playTimeMinutes * SCORE_VALIDATION.MAX_FLOOR_PER_MINUTE;
  if (floor > maxPossibleFloors * 1.5) {
    return { valid: false, reason: 'FLOOR_RATE_TOO_HIGH' };
  }

  // 점수 대비 층수 검증
  const maxPossibleScore = floor * SCORE_VALIDATION.MAX_SCORE_PER_FLOOR;
  if (score > maxPossibleScore * 1.2) {
    return { valid: false, reason: 'SCORE_TOO_HIGH' };
  }

  // Perfect 카운트 검증
  if (perfectCount > floor) {
    return { valid: false, reason: 'PERFECT_COUNT_INVALID' };
  }

  // 콤보 검증
  if (maxCombo > floor) {
    return { valid: false, reason: 'COMBO_INVALID' };
  }

  return { valid: true };
}

/**
 * 점수 검증 Cloud Function
 */
export const validateScore = functions
  .region('asia-northeast3')
  .https.onCall(async (data, context) => {
    // 인증 확인
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다');
    }

    // Rate Limiting 체크
    if (await isRateLimited(context.auth.uid, 'validateScore')) {
      throw new functions.https.HttpsError('resource-exhausted', '요청이 너무 많습니다. 잠시 후 다시 시도하세요.');
    }

    const { score, floor, perfectCount, maxCombo, playTime, actions } = data;

    // 기본 유효성 검사
    if (
      typeof score !== 'number' ||
      typeof floor !== 'number' ||
      typeof playTime !== 'number'
    ) {
      return { valid: false, reason: 'INVALID_DATA' };
    }

    // 플레이 시간 검증
    if (playTime < SCORE_VALIDATION.MIN_PLAY_TIME_MS) {
      return { valid: false, reason: 'PLAY_TIME_TOO_SHORT' };
    }

    // 층수 대비 플레이 시간 검증
    const playTimeMinutes = playTime / 60000;
    const maxPossibleFloors = playTimeMinutes * SCORE_VALIDATION.MAX_FLOOR_PER_MINUTE;
    if (floor > maxPossibleFloors * 1.5) {
      // 약간의 여유 허용
      return { valid: false, reason: 'FLOOR_RATE_TOO_HIGH' };
    }

    // 점수 대비 층수 검증
    const maxPossibleScore = floor * SCORE_VALIDATION.MAX_SCORE_PER_FLOOR;
    if (score > maxPossibleScore * 1.2) {
      // 약간의 여유 허용
      return { valid: false, reason: 'SCORE_TOO_HIGH' };
    }

    // Perfect 카운트 검증
    if (perfectCount > floor) {
      return { valid: false, reason: 'PERFECT_COUNT_INVALID' };
    }

    // 콤보 검증
    if (maxCombo > floor) {
      return { valid: false, reason: 'COMBO_INVALID' };
    }

    // 액션 로그 검증 (선택적)
    if (actions && Array.isArray(actions)) {
      // 액션 간격이 너무 일정하면 봇으로 의심
      const intervals: number[] = [];
      for (let i = 1; i < actions.length && i < 20; i++) {
        intervals.push(actions[i].time - actions[i - 1].time);
      }

      if (intervals.length > 5) {
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance =
          intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) /
          intervals.length;

        // 분산이 너무 작으면 봇으로 의심
        if (variance < 100 && avgInterval < 500) {
          return { valid: false, reason: 'BOT_DETECTED' };
        }
      }
    }

    return { valid: true };
  });

/**
 * 보상 지급 Cloud Function
 */
export const grantReward = functions
  .region('asia-northeast3')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다');
    }

    // Rate Limiting 체크
    if (await isRateLimited(context.auth.uid, 'grantReward')) {
      throw new functions.https.HttpsError('resource-exhausted', '요청이 너무 많습니다. 잠시 후 다시 시도하세요.');
    }

    const uid = context.auth.uid;
    const { type, rewardId: _rewardId, idempotencyKey } = data;
    void _rewardId; // 향후 특정 보상 ID 처리 시 사용

    const userRef = db.collection('users').doc(uid).collection('data').doc('save');

      try {
      const result = await db.runTransaction(async (transaction) => {
        // 멱등성 키 문서 확인 (트랜잭션 내에서만 - 경쟁 조건 방지)
        if (idempotencyKey) {
          const idempotencyRef = db.collection('idempotency_keys').doc(`${uid}_${idempotencyKey}`);
          const existingInTransaction = await transaction.get(idempotencyRef);
          if (existingInTransaction.exists) {
            console.log(`[grantReward] 멱등성 키로 중복 요청 감지: ${idempotencyKey}`);
            return existingInTransaction.data()?.result || { success: true, reason: 'ALREADY_PROCESSED' };
          }
        }

        const userDoc = await transaction.get(userRef);
        const userData = userDoc.exists ? userDoc.data() : {};

        let reward: { type: string; amount: number } | null = null;

        switch (type) {
          case 'daily_login': {
            const today = getTodayKST();
            if (userData?.retention?.lastClaimedDay === today) {
              return { success: false, reason: 'ALREADY_CLAIMED' };
            }

            // 7일 주기 보상
            const dayOfWeek = ((userData?.retention?.currentStreak || 0) % 7) + 1;
            const rewards = [
              { type: 'coins', amount: 100 },
              { type: 'coins', amount: 150 },
              { type: 'coins', amount: 200 },
              { type: 'diamonds', amount: 5 },
              { type: 'coins', amount: 300 },
              { type: 'coins', amount: 400 },
              { type: 'diamonds', amount: 20 },
            ];
            reward = rewards[dayOfWeek - 1];

            transaction.set(
              userRef,
              {
                retention: {
                  lastClaimedDay: today,
                },
                currency: {
                  [reward.type]: admin.firestore.FieldValue.increment(reward.amount),
                },
              },
              { merge: true }
            );
            break;
          }

          case 'offline': {
            const lastPlayDate = userData?.retention?.lastPlayDate || Date.now();
            const hoursOffline = Math.floor((Date.now() - lastPlayDate) / (1000 * 60 * 60));

            if (hoursOffline < 1) {
              return { success: false, reason: 'NOT_ENOUGH_OFFLINE_TIME' };
            }

            const coins = Math.min(hoursOffline * 10, 480); // 최대 48시간 * 10
            reward = { type: 'coins', amount: coins };

            transaction.set(
              userRef,
              {
                currency: {
                  coins: admin.firestore.FieldValue.increment(coins),
                },
                retention: {
                  lastPlayDate: Date.now(),
                },
              },
              { merge: true }
            );
            break;
          }

          case 'ad': {
            // 광고 보상 (클라이언트에서 광고 시청 확인 후 호출)
            reward = { type: 'coins', amount: 50 };
            transaction.set(
              userRef,
              {
                currency: {
                  coins: admin.firestore.FieldValue.increment(50),
                },
              },
              { merge: true }
            );
            break;
          }

          default:
            return { success: false, reason: 'UNKNOWN_REWARD_TYPE' };
        }

        // 멱등성 키 저장 (트랜잭션 내에서)
        if (idempotencyKey) {
          const idempotencyRef = db.collection('idempotency_keys').doc(`${uid}_${idempotencyKey}`);
          transaction.set(idempotencyRef, {
            result: { success: true, reward },
            createdAt: Date.now(),
            expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24시간 후 만료
          });
        }

        return { success: true, reward };
      });

      return result;
    } catch (error) {
      console.error('grantReward error:', error);
      throw new functions.https.HttpsError('internal', '보상 지급 실패');
    }
  });

/**
 * 멱등성 키 정리 (매일 새벽 3시)
 */
export const cleanupIdempotencyKeys = functions
  .region('asia-northeast3')
  .pubsub.schedule('0 3 * * *')
  .timeZone('Asia/Seoul')
  .onRun(async () => {
    const now = Date.now();

    const expiredKeys = await db
      .collection('idempotency_keys')
      .where('expiresAt', '<', now)
      .limit(500)
      .get();

    const batch = db.batch();
    expiredKeys.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    console.log(`[Idempotency] Cleaned up ${expiredKeys.size} expired keys`);
    return null;
  });

/**
 * 리더보드 업데이트 Cloud Function (점수 검증 포함)
 */
export const updateLeaderboard = functions
  .region('asia-northeast3')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다');
    }

    // Rate Limiting 체크
    if (await isRateLimited(context.auth.uid, 'updateLeaderboard')) {
      throw new functions.https.HttpsError('resource-exhausted', '요청이 너무 많습니다. 잠시 후 다시 시도하세요.');
    }

    const uid = context.auth.uid;
    const { score, floor, nickname, perfectCount, maxCombo, playTime } = data;

    if (typeof score !== 'number' || typeof floor !== 'number') {
      throw new functions.https.HttpsError('invalid-argument', '잘못된 데이터');
    }

    // 서버 측 점수 검증
    const validationResult = validateScoreData({
      score,
      floor,
      perfectCount: perfectCount || 0,
      maxCombo: maxCombo || 0,
      playTime: playTime || 0,
    });

    if (!validationResult.valid) {
      console.warn(`[updateLeaderboard] 점수 검증 실패: ${uid}, reason: ${validationResult.reason}`);
      throw new functions.https.HttpsError('invalid-argument', `점수 검증 실패: ${validationResult.reason}`);
    }

    const leaderboardRef = db.collection('leaderboard').doc(uid);
    const weeklyRef = db.collection('leaderboard_weekly').doc(uid);

    try {
      const result = await db.runTransaction(async (transaction) => {
        const currentDoc = await transaction.get(leaderboardRef);
        const currentScore = currentDoc.exists ? currentDoc.data()?.score || 0 : 0;

        // 기존 점수보다 높을 때만 업데이트
        if (score > currentScore) {
          const displayNickname = nickname || `Cat${uid.slice(0, 6)}`;
          const now = Date.now();

          // 전체 리더보드 업데이트
          transaction.set(leaderboardRef, {
            nickname: displayNickname,
            score,
            floor,
            updatedAt: now,
          });

          // 주간 리더보드 업데이트
          transaction.set(weeklyRef, {
            nickname: displayNickname,
            score,
            floor,
            updatedAt: now,
            weekId: getISOWeekId(),
          });

          return { success: true, newRecord: true };
        }

        return { success: true, newRecord: false };
      });

      // 순위 계산 (트랜잭션 외부에서)
      const snapshot = await db
        .collection('leaderboard')
        .orderBy('score', 'desc')
        .limit(1000)
        .get();

      let rank = 1;
      for (const doc of snapshot.docs) {
        if (doc.id === uid) break;
        if (doc.data().score > score) rank++;
      }

      return { ...result, rank };
    } catch (error) {
      console.error('updateLeaderboard error:', error);
      throw new functions.https.HttpsError('internal', '리더보드 업데이트 실패');
    }
  });

/**
 * 주간 리더보드 초기화 (매주 월요일 0시 KST)
 * 500개 배치 제한을 고려한 반복 삭제
 */
export const resetWeeklyLeaderboard = functions
  .region('asia-northeast3')
  .pubsub.schedule('0 15 * * 0') // UTC 15:00 일요일 = KST 0:00 월요일
  .timeZone('UTC')
  .onRun(async () => {
    const weeklyRef = db.collection('leaderboard_weekly');
    const BATCH_SIZE = 500;
    let totalDeleted = 0;

    // 500개씩 반복 삭제
    let hasMore = true;
    while (hasMore) {
      const snapshot = await weeklyRef.limit(BATCH_SIZE).get();

      if (snapshot.empty) {
        hasMore = false;
        break;
      }

      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      totalDeleted += snapshot.size;

      // 500개 미만이면 더 이상 없음
      if (snapshot.size < BATCH_SIZE) {
        hasMore = false;
      }
    }

    console.log(`Weekly leaderboard reset: ${totalDeleted} entries deleted`);
    return null;
  });

/**
 * KST 기준 오늘 날짜 키 (YYYYMMDD)
 */
function getTodayKST(): number {
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstTime = new Date(now.getTime() + kstOffset);
  return (
    kstTime.getUTCFullYear() * 10000 +
    (kstTime.getUTCMonth() + 1) * 100 +
    kstTime.getUTCDate()
  );
}

/**
 * KST 기준 ISO 주차 ID 반환 (YYYY-WXX)
 */
function getISOWeekId(): string {
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

// ============================================
// 푸시 알림 시스템
// ============================================

const messaging = admin.messaging();

/**
 * 리텐션 알림 메시지 템플릿
 */
const RETENTION_MESSAGES = {
  d1_2h: {
    title: '냥이가 기다려요!',
    body: '점프 실력이 벌써 그리워요... 한 판만 더요?',
  },
  d1_4h: {
    title: '🐱 간식 타워가 무너지고 있어요!',
    body: '빨리 와서 쌓아주세요! 코인 보너스도 준비되어 있어요.',
  },
  d1_bedtime: {
    title: '잠들기 전에 한 판?',
    body: '오늘의 마지막 점프! 내일 보상도 기다려요.',
  },
  d3: {
    title: '3일째 안 오셨네요...',
    body: '냥이가 혼자 점프 연습 중이에요. 같이 해요!',
  },
  d5: {
    title: '스트릭이 사라졌어요 😿',
    body: '다시 시작해볼까요? 복귀 보상이 기다려요!',
  },
  d7: {
    title: '일주일이나 지났어요!',
    body: '냥이가 많이 보고 싶어했어요. 특별 보상 지급 중!',
  },
  d14: {
    title: '돌아오세요!',
    body: '2주 만에 복귀하면 다이아몬드 50개 드려요!',
  },
  energy_full: {
    title: '에너지가 가득 찼어요!',
    body: '지금 플레이하면 최고 점수를 노려볼 수 있어요!',
  },
  daily_reward: {
    title: '오늘의 보상이 기다려요!',
    body: '출석 체크하고 보상 받아가세요. 스트릭도 유지해요!',
  },
  streak_danger: {
    title: '⚠️ 스트릭이 위험해요!',
    body: '오늘 자정 전에 출석하지 않으면 스트릭이 초기화돼요!',
  },
};

/**
 * 개별 사용자에게 푸시 알림 전송
 */
async function sendPushToUser(
  uid: string,
  messageType: keyof typeof RETENTION_MESSAGES
): Promise<boolean> {
  try {
    const tokenDoc = await db.collection('users').doc(uid).collection('tokens').doc('fcm').get();

    if (!tokenDoc.exists) {
      return false;
    }

    const token = tokenDoc.data()?.token;
    if (!token) {
      return false;
    }

    const messageTemplate = RETENTION_MESSAGES[messageType];

    await messaging.send({
      token,
      notification: {
        title: messageTemplate.title,
        body: messageTemplate.body,
      },
      data: {
        type: messageType,
        timestamp: Date.now().toString(),
      },
      android: {
        priority: 'high',
        notification: {
          icon: 'ic_notification',
          color: '#FF6B6B',
          channelId: 'retention',
        },
      },
      webpush: {
        notification: {
          icon: '/icon-192.png',
          badge: '/badge-72.png',
        },
        fcmOptions: {
          link: '/',
        },
      },
    });

    console.log(`[Push] 알림 전송 성공: ${uid} - ${messageType}`);
    return true;
  } catch (error) {
    console.error(`[Push] 알림 전송 실패: ${uid}`, error);
    return false;
  }
}

/**
 * D1 리텐션 훅 - 첫날 이탈 방지 (매시간 실행)
 */
export const sendD1RetentionPush = functions
  .region('asia-northeast3')
  .pubsub.schedule('0 * * * *') // 매시간 정각
  .timeZone('Asia/Seoul')
  .onRun(async () => {
    const now = Date.now();
    const twoHoursAgo = now - 2 * 60 * 60 * 1000;
    const fourHoursAgo = now - 4 * 60 * 60 * 1000;
    const currentHourKST = new Date(now + 9 * 60 * 60 * 1000).getUTCHours();

    // 2시간 이탈 유저
    const twoHourUsers = await db
      .collection('users')
      .where('retention.firstPlayDate', '>', twoHoursAgo - 30 * 60 * 1000)
      .where('retention.firstPlayDate', '<', twoHoursAgo)
      .where('retention.lastPlayDate', '<', twoHoursAgo)
      .limit(100)
      .get();

    for (const doc of twoHourUsers.docs) {
      await sendPushToUser(doc.id, 'd1_2h');
    }

    // 4시간 이탈 유저
    const fourHourUsers = await db
      .collection('users')
      .where('retention.firstPlayDate', '>', fourHoursAgo - 30 * 60 * 1000)
      .where('retention.firstPlayDate', '<', fourHoursAgo)
      .where('retention.lastPlayDate', '<', fourHoursAgo)
      .limit(100)
      .get();

    for (const doc of fourHourUsers.docs) {
      await sendPushToUser(doc.id, 'd1_4h');
    }

    // 취침 전 알림 (21시 ~ 23시)
    if (currentHourKST >= 21 && currentHourKST <= 23) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const bedtimeUsers = await db
        .collection('users')
        .where('retention.firstPlayDate', '>', todayStart.getTime() - 9 * 60 * 60 * 1000)
        .where('retention.lastPlayDate', '<', now - 2 * 60 * 60 * 1000)
        .limit(100)
        .get();

      for (const doc of bedtimeUsers.docs) {
        await sendPushToUser(doc.id, 'd1_bedtime');
      }
    }

    console.log(
      `[D1 Push] 2h: ${twoHourUsers.size}, 4h: ${fourHourUsers.size}`
    );
    return null;
  });

/**
 * D3-D5 리텐션 훅 (하루 한번 오전 10시)
 */
export const sendD3D5RetentionPush = functions
  .region('asia-northeast3')
  .pubsub.schedule('0 10 * * *')
  .timeZone('Asia/Seoul')
  .onRun(async () => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    // D3 유저 (3일 전에 마지막 플레이)
    const d3Start = now - 3 * day - 12 * 60 * 60 * 1000;
    const d3End = now - 3 * day + 12 * 60 * 60 * 1000;

    const d3Users = await db
      .collection('users')
      .where('retention.lastPlayDate', '>', d3Start)
      .where('retention.lastPlayDate', '<', d3End)
      .limit(100)
      .get();

    for (const doc of d3Users.docs) {
      await sendPushToUser(doc.id, 'd3');
    }

    // D5 유저
    const d5Start = now - 5 * day - 12 * 60 * 60 * 1000;
    const d5End = now - 5 * day + 12 * 60 * 60 * 1000;

    const d5Users = await db
      .collection('users')
      .where('retention.lastPlayDate', '>', d5Start)
      .where('retention.lastPlayDate', '<', d5End)
      .limit(100)
      .get();

    for (const doc of d5Users.docs) {
      await sendPushToUser(doc.id, 'd5');
    }

    console.log(`[D3-D5 Push] D3: ${d3Users.size}, D5: ${d5Users.size}`);
    return null;
  });

/**
 * D7-D14 리텐션 훅 (하루 한번 오후 2시)
 */
export const sendD7D14RetentionPush = functions
  .region('asia-northeast3')
  .pubsub.schedule('0 14 * * *')
  .timeZone('Asia/Seoul')
  .onRun(async () => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    // D7 유저
    const d7Start = now - 7 * day - 12 * 60 * 60 * 1000;
    const d7End = now - 7 * day + 12 * 60 * 60 * 1000;

    const d7Users = await db
      .collection('users')
      .where('retention.lastPlayDate', '>', d7Start)
      .where('retention.lastPlayDate', '<', d7End)
      .limit(100)
      .get();

    for (const doc of d7Users.docs) {
      await sendPushToUser(doc.id, 'd7');
    }

    // D14 유저
    const d14Start = now - 14 * day - 12 * 60 * 60 * 1000;
    const d14End = now - 14 * day + 12 * 60 * 60 * 1000;

    const d14Users = await db
      .collection('users')
      .where('retention.lastPlayDate', '>', d14Start)
      .where('retention.lastPlayDate', '<', d14End)
      .limit(100)
      .get();

    for (const doc of d14Users.docs) {
      await sendPushToUser(doc.id, 'd14');
    }

    console.log(`[D7-D14 Push] D7: ${d7Users.size}, D14: ${d14Users.size}`);
    return null;
  });

/**
 * 에너지 회복 완료 알림 (개별 트리거)
 */
export const scheduleEnergyFullPush = functions
  .region('asia-northeast3')
  .firestore.document('users/{userId}/data/save')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // 에너지가 0에서 회복되기 시작한 경우
    if (before?.energy?.current === 0 && after?.energy?.current === 1) {
      const userId = context.params.userId;
      const maxEnergy = after?.energy?.max || 5;
      const recoveryTimeMs = (after?.energy?.recoveryMinutes || 20) * 60 * 1000;
      const fullRecoveryTime = Date.now() + (maxEnergy - 1) * recoveryTimeMs;

      // 에너지 회복 완료 예약 저장
      await db.collection('scheduled_pushes').add({
        userId,
        type: 'energy_full',
        scheduledAt: fullRecoveryTime,
        createdAt: Date.now(),
      });
    }

    return null;
  });

/**
 * 예약된 푸시 알림 처리 (매분 실행)
 */
export const processScheduledPushes = functions
  .region('asia-northeast3')
  .pubsub.schedule('* * * * *')
  .timeZone('Asia/Seoul')
  .onRun(async () => {
    const now = Date.now();

    const scheduledPushes = await db
      .collection('scheduled_pushes')
      .where('scheduledAt', '<', now)
      .limit(50)
      .get();

    for (const doc of scheduledPushes.docs) {
      const data = doc.data();
      await sendPushToUser(data.userId, data.type);
      await doc.ref.delete();
    }

    if (scheduledPushes.size > 0) {
      console.log(`[Scheduled Push] 처리: ${scheduledPushes.size}`);
    }

    return null;
  });

/**
 * 스트릭 위험 알림 (매일 저녁 8시)
 */
export const sendStreakDangerPush = functions
  .region('asia-northeast3')
  .pubsub.schedule('0 20 * * *')
  .timeZone('Asia/Seoul')
  .onRun(async () => {
    const today = getTodayKST();

    // 오늘 출석 체크 안 한 유저 중 스트릭이 있는 유저
    const streakUsers = await db
      .collection('users')
      .where('retention.currentStreak', '>', 0)
      .where('retention.lastClaimedDay', '<', today)
      .limit(100)
      .get();

    for (const doc of streakUsers.docs) {
      await sendPushToUser(doc.id, 'streak_danger');
    }

    console.log(`[Streak Danger Push] 발송: ${streakUsers.size}`);
    return null;
  });

/**
 * 일일 보상 알림 (오전 9시)
 */
export const sendDailyRewardPush = functions
  .region('asia-northeast3')
  .pubsub.schedule('0 9 * * *')
  .timeZone('Asia/Seoul')
  .onRun(async () => {
    const yesterday = getTodayKST() - 1;

    // 어제 플레이했지만 오늘 아직 출석 안 한 유저
    const activeUsers = await db
      .collection('users')
      .where('retention.lastClaimedDay', '==', yesterday)
      .limit(200)
      .get();

    for (const doc of activeUsers.docs) {
      await sendPushToUser(doc.id, 'daily_reward');
    }

    console.log(`[Daily Reward Push] 발송: ${activeUsers.size}`);
    return null;
  });

// ============================================
// IAP 검증 시스템
// ============================================

/**
 * IAP 상품 정의 (클라이언트와 동일)
 */
const IAP_PRODUCTS: Record<string, {
  type: 'consumable' | 'non_consumable';
  coins?: number;
  diamonds?: number;
  removeAds?: boolean;
}> = {
  coins_small: { type: 'consumable', coins: 500 },
  coins_medium: { type: 'consumable', coins: 1800 },
  coins_large: { type: 'consumable', coins: 7000 },
  diamonds_small: { type: 'consumable', diamonds: 50 },
  diamonds_medium: { type: 'consumable', diamonds: 180 },
  diamonds_large: { type: 'consumable', diamonds: 700 },
  starter_pack: { type: 'non_consumable', coins: 1000, diamonds: 100, removeAds: true },
  remove_ads: { type: 'non_consumable', removeAds: true },
};

/**
 * IAP 구매 검증 Cloud Function
 * 클라이언트에서 영수증을 받아 검증 후 보상 지급
 */
export const verifyIAPPurchase = functions
  .region('asia-northeast3')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다');
    }

    const uid = context.auth.uid;
    const { productId, receipt, platform, transactionId } = data;

    // 상품 확인
    const product = IAP_PRODUCTS[productId];
    if (!product) {
      throw new functions.https.HttpsError('invalid-argument', '유효하지 않은 상품입니다');
    }

    // 트랜잭션 중복 체크
    const transactionRef = db.collection('iap_transactions').doc(transactionId);
    const existingTransaction = await transactionRef.get();
    if (existingTransaction.exists) {
      console.log(`[IAP] 중복 트랜잭션: ${transactionId}`);
      return { success: true, reason: 'ALREADY_PROCESSED' };
    }

    try {
      // 플랫폼별 영수증 검증
      let verificationResult: { valid: boolean; reason?: string };

      if (platform === 'android') {
        verificationResult = await verifyGooglePlayReceipt(receipt, productId);
      } else if (platform === 'ios') {
        verificationResult = await verifyAppStoreReceipt(receipt, productId);
      } else {
        // 웹 환경 (개발 모드만 허용)
        verificationResult = { valid: false, reason: 'WEB_NOT_SUPPORTED' };
      }

      if (!verificationResult.valid) {
        console.warn(`[IAP] 영수증 검증 실패: ${uid}, ${productId}, ${verificationResult.reason}`);
        throw new functions.https.HttpsError('invalid-argument', `영수증 검증 실패: ${verificationResult.reason}`);
      }

      // 트랜잭션 내에서 보상 지급
      const result = await db.runTransaction(async (transaction) => {
        // 트랜잭션 기록 (중복 방지)
        transaction.set(transactionRef, {
          uid,
          productId,
          platform,
          createdAt: Date.now(),
          verified: true,
        });

        // 사용자 데이터 업데이트
        const userRef = db.collection('users').doc(uid).collection('data').doc('save');
        const updateData: Record<string, admin.firestore.FieldValue | boolean> = {};

        if (product.coins) {
          updateData['currency.coins'] = admin.firestore.FieldValue.increment(product.coins);
        }
        if (product.diamonds) {
          updateData['currency.diamonds'] = admin.firestore.FieldValue.increment(product.diamonds);
        }
        if (product.removeAds) {
          updateData['settings.adsRemoved'] = true;
        }

        transaction.set(userRef, updateData, { merge: true });

        // 구매 기록 저장
        const purchaseRef = db.collection('users').doc(uid).collection('purchases').doc(transactionId);
        transaction.set(purchaseRef, {
          productId,
          platform,
          reward: {
            coins: product.coins || 0,
            diamonds: product.diamonds || 0,
            removeAds: product.removeAds || false,
          },
          purchasedAt: Date.now(),
          verified: true,
        });

        return { success: true, reward: product };
      });

      console.log(`[IAP] 구매 완료: ${uid}, ${productId}`);
      return result;
    } catch (error) {
      console.error(`[IAP] 구매 처리 실패: ${uid}, ${productId}`, error);
      throw new functions.https.HttpsError('internal', '구매 처리 실패');
    }
  });

/**
 * Google Play 영수증 검증 (실제 구현 시 Google Play Developer API 사용)
 */
async function verifyGooglePlayReceipt(
  receipt: string,
  productId: string
): Promise<{ valid: boolean; reason?: string }> {
  // TODO: 실제 구현 시 Google Play Developer API로 검증
  // https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.products
  //
  // const androidpublisher = google.androidpublisher('v3');
  // const result = await androidpublisher.purchases.products.get({
  //   packageName: 'com.yourapp.catjump',
  //   productId,
  //   token: receipt,
  // });

  // 개발 환경에서는 기본 검증만
  if (!receipt || receipt.length < 10) {
    return { valid: false, reason: 'INVALID_RECEIPT' };
  }

  // 실제 구현 전까지는 receipt가 있으면 통과 (주의: 프로덕션에서는 반드시 실제 검증 필요)
  console.warn('[IAP] Google Play 영수증 검증 스텁 - 실제 구현 필요');
  return { valid: true };
}

/**
 * App Store 영수증 검증 (실제 구현 시 Apple Server API 사용)
 */
async function verifyAppStoreReceipt(
  receipt: string,
  productId: string
): Promise<{ valid: boolean; reason?: string }> {
  // TODO: 실제 구현 시 Apple Server-to-Server Notifications 또는 StoreKit 2 검증
  // https://developer.apple.com/documentation/appstoreserverapi

  // 개발 환경에서는 기본 검증만
  if (!receipt || receipt.length < 10) {
    return { valid: false, reason: 'INVALID_RECEIPT' };
  }

  // 실제 구현 전까지는 receipt가 있으면 통과 (주의: 프로덕션에서는 반드시 실제 검증 필요)
  console.warn('[IAP] App Store 영수증 검증 스텁 - 실제 구현 필요');
  return { valid: true };
}
