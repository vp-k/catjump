/**
 * 게임 데이터 타입 정의
 */

/**
 * 사용자 설정
 */
export interface UserSettings {
  sound: boolean;
  music: boolean;
  haptics: boolean;
  language: 'ko' | 'en' | 'ja' | 'zh';
}

/**
 * 게임 통계
 */
export interface GameStats {
  gamesPlayed: number;
  totalScore: number;
  highScore: number;
  highFloor: number;
  perfectCount: number;
  maxCombo: number;
}

/**
 * 재화
 */
export interface Currency {
  coins: number;
  diamonds: number;
}

/**
 * 인벤토리
 */
export interface Inventory {
  unlockedCats: string[];
  unlockedCostumes: string[];
  currentCat: string;
  currentCostume: string | null;
}

/**
 * 미션 진행도
 */
export interface MissionProgress {
  dailyMissions: DailyMission[];
  weeklyMissions: WeeklyMission[];
  lastDailyReset: number;
  lastWeeklyReset: number;
}

export interface DailyMission {
  id: string;
  type: string;
  target: number;
  current: number;
  completed: boolean;
  claimed: boolean;
}

export interface WeeklyMission extends DailyMission {}

/**
 * 리텐션 데이터
 */
export interface RetentionData {
  firstPlayDate: number;
  lastPlayDate: number;
  totalDaysPlayed: number;
  currentStreak: number;
  longestStreak: number;
  lastClaimedDay: number;
}

/**
 * 전체 저장 데이터
 */
export interface SaveData {
  version: number;
  settings: UserSettings;
  stats: GameStats;
  currency: Currency;
  inventory: Inventory;
  missions: MissionProgress;
  retention: RetentionData;
  lastSaved: number;
}

/**
 * 기본 저장 데이터
 */
export const DEFAULT_SAVE_DATA: SaveData = {
  version: 1,
  settings: {
    sound: true,
    music: true,
    haptics: true,
    language: 'ko',
  },
  stats: {
    gamesPlayed: 0,
    totalScore: 0,
    highScore: 0,
    highFloor: 0,
    perfectCount: 0,
    maxCombo: 0,
  },
  currency: {
    coins: 0,
    diamonds: 0,
  },
  inventory: {
    unlockedCats: ['default'],
    unlockedCostumes: [],
    currentCat: 'default',
    currentCostume: null,
  },
  missions: {
    dailyMissions: [],
    weeklyMissions: [],
    lastDailyReset: 0,
    lastWeeklyReset: 0,
  },
  retention: {
    firstPlayDate: 0,
    lastPlayDate: 0,
    totalDaysPlayed: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastClaimedDay: 0,
  },
  lastSaved: 0,
};
