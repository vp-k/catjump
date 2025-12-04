import { SaveManager } from './SaveManager';
import {
  MedalType,
  getMedalByScore,
  getMedalByFloor,
  getNextMedalProgress,
  isNearMedalMiss,
  getMedalInfo,
  NEAR_MISS_CONFIG,
} from '@config/MedalConfig';

/**
 * 메달 관리자 - 메달 획득 및 Near-Miss 감지
 */
class MedalManagerClass {
  private currentSessionMedals: Set<MedalType> = new Set();
  private nearMissTriggered = false;

  /**
   * 게임 시작 시 초기화
   */
  startGame(): void {
    this.currentSessionMedals.clear();
    this.nearMissTriggered = false;
  }

  /**
   * 점수/층수 업데이트 시 메달 체크
   */
  checkMedals(score: number, floor: number): MedalCheckResult {
    const result: MedalCheckResult = {
      newMedals: [],
      nearMiss: null,
      nextMedalProgress: getNextMedalProgress(score, floor),
    };

    // 점수 기반 메달 체크
    const scoreMedal = getMedalByScore(score);
    if (scoreMedal && !this.currentSessionMedals.has(scoreMedal)) {
      this.currentSessionMedals.add(scoreMedal);
      result.newMedals.push({ type: scoreMedal, source: 'score' });
      this.saveMedal(scoreMedal);
    }

    // 층수 기반 메달 체크
    const floorMedal = getMedalByFloor(floor);
    if (floorMedal && !this.currentSessionMedals.has(floorMedal)) {
      this.currentSessionMedals.add(floorMedal);
      result.newMedals.push({ type: floorMedal, source: 'floor' });
      this.saveMedal(floorMedal);
    }

    // Near-Miss 체크 (아직 트리거되지 않은 경우만)
    if (!this.nearMissTriggered) {
      const nearMiss = isNearMedalMiss(score, floor);
      if (nearMiss) {
        result.nearMiss = nearMiss;
        this.nearMissTriggered = true;
      }
    }

    return result;
  }

  /**
   * 착지 Near-Miss 체크 (캔 가장자리 착지)
   */
  checkLandingNearMiss(catX: number, canX: number, canWidth: number): boolean {
    const distance = Math.abs(catX - canX);
    const edgeDistance = canWidth / 2 - distance;

    return edgeDistance > 0 && edgeDistance <= NEAR_MISS_CONFIG.LANDING_PIXEL_THRESHOLD;
  }

  /**
   * 메달 저장
   */
  private saveMedal(medal: MedalType): void {
    const saveData = SaveManager.getData();
    if (!saveData.stats.medals) {
      saveData.stats.medals = [];
    }
    if (!saveData.stats.medals.includes(medal)) {
      saveData.stats.medals.push(medal);
      SaveManager.save();
    }
  }

  /**
   * 획득한 메달 목록
   */
  getEarnedMedals(): MedalType[] {
    const saveData = SaveManager.getData();
    return (saveData.stats.medals || []) as MedalType[];
  }

  /**
   * 특정 메달 획득 여부
   */
  hasMedal(medal: MedalType): boolean {
    return this.getEarnedMedals().includes(medal);
  }

  /**
   * 최고 메달
   */
  getHighestMedal(): MedalType | null {
    const medals = this.getEarnedMedals();
    if (medals.length === 0) return null;

    const order: MedalType[] = ['bronze', 'silver', 'gold', 'platinum'];
    for (let i = order.length - 1; i >= 0; i--) {
      if (medals.includes(order[i])) {
        return order[i];
      }
    }
    return null;
  }

  /**
   * 메달 정보 가져오기
   */
  getMedalInfo(type: MedalType) {
    return getMedalInfo(type);
  }

  /**
   * Near-Miss 슬로우 모션 설정
   */
  getSlowMotionConfig() {
    return {
      duration: NEAR_MISS_CONFIG.SLOW_MOTION_DURATION,
      scale: NEAR_MISS_CONFIG.SLOW_MOTION_SCALE,
    };
  }
}

export interface MedalCheckResult {
  newMedals: Array<{ type: MedalType; source: 'score' | 'floor' }>;
  nearMiss: MedalType | null;
  nextMedalProgress: ReturnType<typeof getNextMedalProgress>;
}

export const MedalManager = new MedalManagerClass();
