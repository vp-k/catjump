/**
 * 메달 시스템 설정
 */

export type MedalType = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface MedalThreshold {
  type: MedalType;
  score: number;
  floor: number;
  color: number;
  nameKo: string;
}

export const MEDAL_THRESHOLDS: MedalThreshold[] = [
  { type: 'bronze', score: 500, floor: 10, color: 0xcd7f32, nameKo: '브론즈' },
  { type: 'silver', score: 1500, floor: 25, color: 0xc0c0c0, nameKo: '실버' },
  { type: 'gold', score: 3000, floor: 50, color: 0xffd700, nameKo: '골드' },
  { type: 'platinum', score: 5000, floor: 100, color: 0xe5e4e2, nameKo: '플래티넘' },
];

/**
 * Near-Miss 설정
 */
export const NEAR_MISS_CONFIG = {
  // 메달 근접 임계값 (목표의 90%)
  MEDAL_THRESHOLD_PERCENT: 0.9,

  // 착지 Near-Miss (캔 가장자리에서 몇 픽셀 이내)
  LANDING_PIXEL_THRESHOLD: 5,

  // 슬로우 모션 지속 시간 (ms)
  SLOW_MOTION_DURATION: 500,

  // 슬로우 모션 배율
  SLOW_MOTION_SCALE: 0.3,
} as const;

/**
 * 점수로 메달 타입 결정
 */
export function getMedalByScore(score: number): MedalType | null {
  for (let i = MEDAL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (score >= MEDAL_THRESHOLDS[i].score) {
      return MEDAL_THRESHOLDS[i].type;
    }
  }
  return null;
}

/**
 * 층수로 메달 타입 결정
 */
export function getMedalByFloor(floor: number): MedalType | null {
  for (let i = MEDAL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (floor >= MEDAL_THRESHOLDS[i].floor) {
      return MEDAL_THRESHOLDS[i].type;
    }
  }
  return null;
}

/**
 * 다음 메달까지 남은 점수/층수
 */
export function getNextMedalProgress(
  score: number,
  floor: number
): { nextMedal: MedalThreshold | null; scoreProgress: number; floorProgress: number } {
  const currentMedal = getMedalByScore(score);
  const currentIndex = currentMedal
    ? MEDAL_THRESHOLDS.findIndex((m) => m.type === currentMedal)
    : -1;

  const nextIndex = currentIndex + 1;
  if (nextIndex >= MEDAL_THRESHOLDS.length) {
    return { nextMedal: null, scoreProgress: 1, floorProgress: 1 };
  }

  const nextMedal = MEDAL_THRESHOLDS[nextIndex];
  const prevScore = currentIndex >= 0 ? MEDAL_THRESHOLDS[currentIndex].score : 0;
  const prevFloor = currentIndex >= 0 ? MEDAL_THRESHOLDS[currentIndex].floor : 0;

  const scoreProgress = (score - prevScore) / (nextMedal.score - prevScore);
  const floorProgress = (floor - prevFloor) / (nextMedal.floor - prevFloor);

  return {
    nextMedal,
    scoreProgress: Math.min(scoreProgress, 1),
    floorProgress: Math.min(floorProgress, 1),
  };
}

/**
 * Near-Miss 감지 (메달 근접)
 */
export function isNearMedalMiss(score: number, floor: number): MedalType | null {
  const { MEDAL_THRESHOLD_PERCENT } = NEAR_MISS_CONFIG;

  for (const medal of MEDAL_THRESHOLDS) {
    const scoreNear = score >= medal.score * MEDAL_THRESHOLD_PERCENT && score < medal.score;
    const floorNear = floor >= medal.floor * MEDAL_THRESHOLD_PERCENT && floor < medal.floor;

    if (scoreNear || floorNear) {
      return medal.type;
    }
  }
  return null;
}

/**
 * 메달 정보 가져오기
 */
export function getMedalInfo(type: MedalType): MedalThreshold {
  return MEDAL_THRESHOLDS.find((m) => m.type === type)!;
}
