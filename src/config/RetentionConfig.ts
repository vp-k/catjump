/**
 * 리텐션 시스템 설정
 */

/**
 * 일일 로그인 보상
 */
export const DAILY_LOGIN_CONFIG = {
  // 7일 주기 보상
  REWARDS: [
    { day: 1, type: 'coins' as const, amount: 100 },
    { day: 2, type: 'coins' as const, amount: 150 },
    { day: 3, type: 'coins' as const, amount: 200 },
    { day: 4, type: 'diamonds' as const, amount: 5 },
    { day: 5, type: 'coins' as const, amount: 300 },
    { day: 6, type: 'diamonds' as const, amount: 10 },
    { day: 7, type: 'diamonds' as const, amount: 25 },
  ],
  // 보상 수령 시간 제한 (한국 시간 00:00 기준 리셋)
  RESET_HOUR_KST: 0,
};

/**
 * 스트릭 시스템
 */
export const STREAK_CONFIG = {
  // 마일스톤 보상
  MILESTONES: [
    { days: 7, type: 'diamonds' as const, amount: 30, title: '1주 연속 출석!' },
    { days: 14, type: 'diamonds' as const, amount: 70, title: '2주 연속 출석!' },
    { days: 30, type: 'diamonds' as const, amount: 200, title: '1달 연속 출석!' },
    { days: 60, type: 'diamonds' as const, amount: 500, title: '2달 연속 출석!' },
    { days: 100, type: 'diamonds' as const, amount: 1000, title: '100일 연속!' },
  ],
  // 스트릭 보호
  PROTECTION: {
    ENABLED: true,
    FREE_PROTECTIONS: 1, // 무료 보호 횟수 (월 1회)
    RECOVERY_COST_DIAMONDS: 50, // 스트릭 복구 비용
    RECOVERY_WINDOW_HOURS: 24, // 복구 가능 시간 (24시간)
  },
  // 연속 출석 보너스 (매일 추가 지급)
  DAILY_STREAK_BONUS: {
    ENABLED: true,
    BONUS_PER_DAY: 5, // 스트릭 일수 * 5 코인 추가
    MAX_BONUS: 100, // 최대 100 코인
  },
};

/**
 * FOMO 시스템 (한정 이벤트)
 */
export const FOMO_CONFIG = {
  // 한정 상품 타이머
  LIMITED_OFFER: {
    DURATION_HOURS: 24,
    DISCOUNT_PERCENT: 50,
    SHOW_COUNTDOWN: true,
  },
  // 일일 무료 보상 타이머
  DAILY_FREE_REWARD: {
    ENABLED: true,
    RESET_HOUR_KST: 0,
    REWARD: { type: 'coins' as const, amount: 50 },
  },
  // 에너지 만충 알림
  ENERGY_FULL_ALERT: {
    ENABLED: true,
    MESSAGE: '에너지가 가득 찼어요! 지금 플레이하세요!',
  },
  // 스트릭 위험 알림
  STREAK_DANGER_ALERT: {
    ENABLED: true,
    HOURS_BEFORE: 2, // 리셋 2시간 전 알림
    MESSAGE: '오늘 출석 체크를 잊지 마세요! 스트릭을 유지하세요!',
  },
};

/**
 * 오프라인 보상 시스템
 */
export const OFFLINE_REWARD_CONFIG = {
  ENABLED: true,
  // 최소 오프라인 시간 (시간)
  MIN_OFFLINE_HOURS: 1,
  // 최대 누적 시간 (시간)
  MAX_OFFLINE_HOURS: 24,
  // 시간당 보상
  COINS_PER_HOUR: 10,
  // 최대 보상
  MAX_COINS: 200,
  // 광고 시청 시 2배
  AD_MULTIPLIER: 2,
  // 환영 메시지
  WELCOME_MESSAGES: [
    '다시 오셨군요! 기다리고 있었어요!',
    '어서오세요! 오프라인 동안 코인을 모았어요!',
    '반가워요! 선물이 준비되어 있어요!',
  ],
};

/**
 * 리텐션 훅 (푸시 알림용)
 */
export const RETENTION_HOOKS = {
  // D1 리텐션 (첫날)
  D1: {
    HOUR_2: {
      TITLE: '고양이가 기다리고 있어요!',
      BODY: '탑을 더 높이 쌓아볼까요?',
    },
    HOUR_4: {
      TITLE: '에너지가 가득 찼어요!',
      BODY: '지금 플레이하면 보너스 코인을 받을 수 있어요!',
    },
    BEFORE_SLEEP: {
      TITLE: '오늘의 미션을 완료하세요!',
      BODY: '자기 전에 마지막 도전!',
    },
  },
  // D3-D5 리텐션
  D3_D5: {
    TITLE: '새로운 미션이 기다리고 있어요!',
    BODY: '이번 주 미션을 완료하고 다이아몬드를 받으세요!',
  },
  // D7+ 리텐션
  D7_PLUS: {
    TITLE: '{days}일 연속 출석 중!',
    BODY: '스트릭을 유지하고 특별 보상을 받으세요!',
  },
  // 이탈 방지 (D14+)
  CHURN_PREVENTION: {
    TITLE: '보고 싶었어요!',
    BODY: '다시 돌아오시면 특별 보상이 기다리고 있어요!',
  },
};
