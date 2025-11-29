/**
 * 게임 전역 설정
 * game-design.md v1.6.2 기반
 */
export const GAME_CONFIG = {
  // 화면 설정
  WIDTH: 720,
  HEIGHT: 1280,
  BACKGROUND_COLOR: 0x87ceeb,

  // 물리 설정
  GRAVITY: 800,
  JUMP_VELOCITY: -500,

  // 캔 설정
  CAN_WIDTH: 120,
  CAN_HEIGHT: 60,
  CAN_BASE_SPEED: 2000, // ms

  // 착지 판정 (캔 너비 대비 비율)
  PERFECT_ZONE: 0.4, // 중앙 40%
  GOOD_ZONE: 0.7, // 70%까지 Good

  // 점수
  SCORE_PERFECT: 25,
  SCORE_GOOD: 10,

  // 콤보 배율
  COMBO_MULTIPLIERS: {
    2: 1.5,
    3: 2,
    5: 3,
    10: 4,
  } as Record<number, number>,
} as const;

/**
 * 난이도 설정
 */
export const DIFFICULTY_CONFIG = {
  // 층수별 캔 속도 배율
  SPEED_MULTIPLIERS: [
    { floor: 0, multiplier: 1.0 },
    { floor: 10, multiplier: 1.2 },
    { floor: 20, multiplier: 1.4 },
    { floor: 30, multiplier: 1.6 },
    { floor: 50, multiplier: 1.8 },
  ],

  // 특수 캔 등장 층수
  SPECIAL_CAN_FLOORS: {
    GOLDEN: 10,
    WIDE: 15,
    TRAP: 20,
    GIFT: 25,
    WOBBLY: 30,
  },
} as const;

/**
 * 씬 키
 */
export const SCENE_KEYS = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  MENU: 'MenuScene',
  GAME: 'GameScene',
  GAME_OVER: 'GameOverScene',
  HOUSE: 'HouseScene',
} as const;
