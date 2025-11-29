/**
 * 미션 설정
 */

export type MissionType =
  | 'play_games'
  | 'reach_floor'
  | 'get_score'
  | 'perfect_count'
  | 'combo_count'
  | 'collect_coins';

export interface MissionTemplate {
  type: MissionType;
  targets: number[];
  rewards: MissionReward[];
  description: string;
}

export interface MissionReward {
  type: 'coins' | 'diamonds';
  amount: number;
}

/**
 * 일일 미션 템플릿
 */
export const DAILY_MISSION_TEMPLATES: MissionTemplate[] = [
  {
    type: 'play_games',
    targets: [3, 5, 10],
    rewards: [
      { type: 'coins', amount: 50 },
      { type: 'coins', amount: 100 },
      { type: 'coins', amount: 200 },
    ],
    description: '게임 {target}회 플레이',
  },
  {
    type: 'reach_floor',
    targets: [10, 20, 30],
    rewards: [
      { type: 'coins', amount: 100 },
      { type: 'coins', amount: 200 },
      { type: 'diamonds', amount: 5 },
    ],
    description: '{target}층 도달',
  },
  {
    type: 'perfect_count',
    targets: [10, 20, 50],
    rewards: [
      { type: 'coins', amount: 80 },
      { type: 'coins', amount: 150 },
      { type: 'diamonds', amount: 3 },
    ],
    description: 'Perfect {target}회 달성',
  },
  {
    type: 'combo_count',
    targets: [5, 10, 20],
    rewards: [
      { type: 'coins', amount: 100 },
      { type: 'coins', amount: 200 },
      { type: 'diamonds', amount: 5 },
    ],
    description: '{target} 콤보 달성',
  },
  {
    type: 'collect_coins',
    targets: [100, 300, 500],
    rewards: [
      { type: 'coins', amount: 50 },
      { type: 'coins', amount: 100 },
      { type: 'diamonds', amount: 2 },
    ],
    description: '코인 {target}개 수집',
  },
];

/**
 * 주간 미션 템플릿
 */
export const WEEKLY_MISSION_TEMPLATES: MissionTemplate[] = [
  {
    type: 'play_games',
    targets: [20, 50, 100],
    rewards: [
      { type: 'coins', amount: 500 },
      { type: 'diamonds', amount: 10 },
      { type: 'diamonds', amount: 30 },
    ],
    description: '게임 {target}회 플레이',
  },
  {
    type: 'get_score',
    targets: [5000, 10000, 20000],
    rewards: [
      { type: 'coins', amount: 300 },
      { type: 'diamonds', amount: 15 },
      { type: 'diamonds', amount: 50 },
    ],
    description: '누적 점수 {target}점 달성',
  },
  {
    type: 'reach_floor',
    targets: [50, 100, 150],
    rewards: [
      { type: 'diamonds', amount: 10 },
      { type: 'diamonds', amount: 25 },
      { type: 'diamonds', amount: 100 },
    ],
    description: '{target}층 도달',
  },
  {
    type: 'perfect_count',
    targets: [100, 300, 500],
    rewards: [
      { type: 'coins', amount: 500 },
      { type: 'diamonds', amount: 20 },
      { type: 'diamonds', amount: 50 },
    ],
    description: 'Perfect {target}회 달성',
  },
];

/**
 * 출석 보상
 */
export const DAILY_LOGIN_REWARDS: MissionReward[] = [
  { type: 'coins', amount: 100 },
  { type: 'coins', amount: 150 },
  { type: 'coins', amount: 200 },
  { type: 'diamonds', amount: 5 },
  { type: 'coins', amount: 300 },
  { type: 'diamonds', amount: 10 },
  { type: 'diamonds', amount: 20 }, // 7일차 특별 보상
];

/**
 * 미션 설명 생성
 */
export function getMissionDescription(
  template: MissionTemplate,
  targetIndex: number
): string {
  return template.description.replace(
    '{target}',
    template.targets[targetIndex].toString()
  );
}
