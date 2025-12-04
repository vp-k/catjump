/**
 * 심리 엔진 설정 - 플레이어 감정 자극 시스템
 */

/**
 * 고양이 감정 상태
 */
export type CatEmotion = 'happy' | 'excited' | 'nervous' | 'sad' | 'scared';

/**
 * 감정 상태 설정
 */
export interface EmotionConfig {
  emotion: CatEmotion;
  trigger: string;
  expression: string;
  soundEffect?: string;
}

/**
 * 감정 트리거 조건
 */
export const EMOTION_TRIGGERS: EmotionConfig[] = [
  {
    emotion: 'happy',
    trigger: 'perfect_land',
    expression: '눈 반짝임 + 미소',
  },
  {
    emotion: 'excited',
    trigger: 'combo_3plus',
    expression: '꼬리 빠르게 흔들기',
  },
  {
    emotion: 'nervous',
    trigger: 'near_miss',
    expression: '눈 크게 뜨기',
  },
  {
    emotion: 'sad',
    trigger: 'miss',
    expression: '귀 내림 + 눈물',
  },
  {
    emotion: 'scared',
    trigger: 'trap_can',
    expression: '털 곤두섬 + 놀란 눈',
  },
];

/**
 * 손실 회피 시스템 설정
 */
export const LOSS_AVERSION_CONFIG = {
  // 간식 탑 시각화
  SNACK_TOWER: {
    ENABLED: true,
    MAX_VISIBLE_HEIGHT: 10, // 최대 표시 층수
    COLLAPSE_ANIMATION_DURATION: 1500, // 붕괴 애니메이션 (ms)
    SHAKE_INTENSITY: 5, // 흔들림 강도
    SHAKE_DURATION: 300, // 흔들림 시간 (ms)
  },

  // 손실 메시지
  LOSS_MESSAGES: [
    '쌓아올린 간식이 무너져요!',
    '열심히 모은 코인이 사라져요!',
    '다시 처음부터...',
    '아깝다! 조금만 더 조심했으면...',
  ],

  // 회복 기회 메시지
  RECOVERY_MESSAGES: [
    '광고를 보고 이어하시겠어요?',
    '30코인으로 이어하기!',
    '포기하지 마세요!',
  ],
};

/**
 * Mercy (자비) 시스템 설정
 */
export const MERCY_CONFIG = {
  // 연속 실패 보호
  CONSECUTIVE_FAIL_PROTECTION: {
    ENABLED: true,
    TRIGGER_COUNT: 3, // 3연속 실패 시 활성화
    PERFECT_ZONE_MULTIPLIER: 1.5, // Perfect 존 50% 확대
    DURATION_GAMES: 2, // 다음 2게임 동안 유지
  },

  // 초보자 보호 (첫 5게임)
  BEGINNER_PROTECTION: {
    ENABLED: true,
    GAMES_COUNT: 5,
    SPEED_MULTIPLIER: 0.8, // 캔 속도 20% 감소
    WIDER_CANS_CHANCE: 0.5, // 넓은캔 50% 확률
  },

  // 동적 난이도 조절
  DYNAMIC_DIFFICULTY: {
    ENABLED: true,
    // 플레이어가 너무 잘하면
    INCREASE_THRESHOLD: {
      PERFECT_RATE: 0.8, // Perfect 비율 80% 이상
      MIN_FLOOR: 10, // 최소 10층 이상
      SPEED_INCREASE: 1.1, // 캔 속도 10% 증가
    },
    // 플레이어가 힘들어하면
    DECREASE_THRESHOLD: {
      PERFECT_RATE: 0.3, // Perfect 비율 30% 이하
      GAMES_COUNT: 3, // 최근 3게임 기준
      SPEED_DECREASE: 0.9, // 캔 속도 10% 감소
    },
  },

  // 컴백 보너스
  COMEBACK_BONUS: {
    ENABLED: true,
    TRIGGER_HOURS: 24, // 24시간 이상 미접속
    COIN_REWARD: 50, // 컴백 코인 보상
    ENERGY_REFILL: true, // 에너지 완충
    MESSAGE: '다시 돌아와주셨군요! 보상을 드려요!',
  },
};

/**
 * 감정이입 강화 요소
 */
export const EMPATHY_CONFIG = {
  // 고양이 이름 (친근감)
  CAT_NAMES: {
    default: '냐옹이',
    russian_blue: '블루',
    orange: '치즈',
    black: '까망이',
    white: '솜이',
    calico: '꽃이',
  },

  // 고양이 대사 (게임 상황별)
  CAT_DIALOGUES: {
    game_start: ['오늘도 파이팅!', '간식 냠냠!', '높이 올라가자!'],
    perfect_land: ['야호!', '냥~', '잘했다옹!'],
    combo_milestone: ['대단해!', '최고다옹!', '멈출 수 없어!'],
    near_miss: ['위험했다옹!', '아슬아슬...', '휴...'],
    game_over: ['아이구...', '다시 해볼까?', '괜찮아, 다음엔 더 잘할 수 있어!'],
    new_record: ['우와! 최고기록!', '내가 해냈다옹!', '대박이다!'],
    comeback: ['보고 싶었어!', '돌아왔구나!', '같이 놀자!'],
  },

  // 말풍선 표시 시간
  DIALOGUE_DURATION: 2000,

  // 고양이 감정 표현 (스프라이트 애니메이션)
  EXPRESSIONS: {
    happy: { frame: 'cat_happy', duration: 500 },
    excited: { frame: 'cat_excited', duration: 300 },
    nervous: { frame: 'cat_nervous', duration: 400 },
    sad: { frame: 'cat_sad', duration: 800 },
    scared: { frame: 'cat_scared', duration: 600 },
  },
};

/**
 * 감정에 따른 UI 색상
 */
export const EMOTION_COLORS: Record<CatEmotion, number> = {
  happy: 0x4ade80, // 초록
  excited: 0xffd700, // 금색
  nervous: 0xff9500, // 주황
  sad: 0x6b7280, // 회색
  scared: 0xff4444, // 빨강
};
