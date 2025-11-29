import { SaveManager } from './SaveManager';
import { AudioManager } from './AudioManager';
import {
  DAILY_MISSION_TEMPLATES,
  WEEKLY_MISSION_TEMPLATES,
  DAILY_LOGIN_REWARDS,
  getMissionDescription,
  type MissionType,
  type MissionReward,
} from '@config/MissionConfig';
import type { DailyMission } from '@/types/GameTypes';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

/**
 * 미션 관리자
 */
class MissionManagerClass {
  /**
   * 초기화 - 미션 리셋 체크
   */
  initialize(): void {
    this.checkDailyReset();
    this.checkWeeklyReset();
  }

  /**
   * 일일 미션 리셋 체크
   */
  private checkDailyReset(): void {
    const saveData = SaveManager.getData();
    const now = Date.now();
    const lastReset = saveData.missions.lastDailyReset;

    // 하루가 지났으면 리셋
    if (now - lastReset > DAY_MS || !lastReset) {
      this.generateDailyMissions();
      saveData.missions.lastDailyReset = now;
      SaveManager.save();
    }
  }

  /**
   * 주간 미션 리셋 체크
   */
  private checkWeeklyReset(): void {
    const saveData = SaveManager.getData();
    const now = Date.now();
    const lastReset = saveData.missions.lastWeeklyReset;

    // 일주일이 지났으면 리셋
    if (now - lastReset > WEEK_MS || !lastReset) {
      this.generateWeeklyMissions();
      saveData.missions.lastWeeklyReset = now;
      SaveManager.save();
    }
  }

  /**
   * 일일 미션 생성
   */
  private generateDailyMissions(): void {
    const saveData = SaveManager.getData();

    // 랜덤으로 3개 선택
    const shuffled = [...DAILY_MISSION_TEMPLATES].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);

    saveData.missions.dailyMissions = selected.map((template, index) => {
      const targetIndex = Math.min(index, template.targets.length - 1);
      return {
        id: `daily_${template.type}_${index}`,
        type: template.type,
        target: template.targets[targetIndex],
        current: 0,
        completed: false,
        claimed: false,
      };
    });
  }

  /**
   * 주간 미션 생성
   */
  private generateWeeklyMissions(): void {
    const saveData = SaveManager.getData();

    // 랜덤으로 2개 선택
    const shuffled = [...WEEKLY_MISSION_TEMPLATES].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 2);

    saveData.missions.weeklyMissions = selected.map((template, index) => {
      const targetIndex = Math.min(index, template.targets.length - 1);
      return {
        id: `weekly_${template.type}_${index}`,
        type: template.type,
        target: template.targets[targetIndex],
        current: 0,
        completed: false,
        claimed: false,
      };
    });
  }

  /**
   * 미션 진행도 업데이트
   */
  updateProgress(type: MissionType, value: number, isIncrement = true): void {
    const saveData = SaveManager.getData();

    // 일일 미션 업데이트
    for (const mission of saveData.missions.dailyMissions) {
      if (mission.type === type && !mission.completed) {
        mission.current = isIncrement ? mission.current + value : value;
        if (mission.current >= mission.target) {
          mission.current = mission.target;
          mission.completed = true;
        }
      }
    }

    // 주간 미션 업데이트
    for (const mission of saveData.missions.weeklyMissions) {
      if (mission.type === type && !mission.completed) {
        mission.current = isIncrement ? mission.current + value : value;
        if (mission.current >= mission.target) {
          mission.current = mission.target;
          mission.completed = true;
        }
      }
    }

    SaveManager.save();
  }

  /**
   * 게임 결과로 미션 업데이트
   */
  updateFromGameResult(
    score: number,
    floor: number,
    perfectCount: number,
    maxCombo: number,
    coinsCollected: number
  ): void {
    this.updateProgress('play_games', 1);
    this.updateProgress('get_score', score);
    this.updateProgress('reach_floor', floor, false); // 최고 기록으로 업데이트
    this.updateProgress('perfect_count', perfectCount);
    this.updateProgress('combo_count', maxCombo, false); // 최고 기록으로 업데이트
    this.updateProgress('collect_coins', coinsCollected);
  }

  /**
   * 미션 보상 수령
   */
  claimReward(missionId: string): MissionReward | null {
    const saveData = SaveManager.getData();

    // 일일 미션에서 찾기
    let mission = saveData.missions.dailyMissions.find((m) => m.id === missionId);
    let templateList = DAILY_MISSION_TEMPLATES;
    let isDaily = true;

    // 주간 미션에서 찾기
    if (!mission) {
      mission = saveData.missions.weeklyMissions.find((m) => m.id === missionId);
      templateList = WEEKLY_MISSION_TEMPLATES;
      isDaily = false;
    }

    if (!mission || !mission.completed || mission.claimed) {
      return null;
    }

    // 보상 찾기
    const template = templateList.find((t) => t.type === mission!.type);
    if (!template) return null;

    const rewardIndex = isDaily
      ? saveData.missions.dailyMissions.indexOf(mission)
      : saveData.missions.weeklyMissions.indexOf(mission);

    const reward = template.rewards[Math.min(rewardIndex, template.rewards.length - 1)];

    // 보상 지급
    if (reward.type === 'coins') {
      SaveManager.addCoins(reward.amount);
    } else {
      saveData.currency.diamonds += reward.amount;
    }

    mission.claimed = true;
    SaveManager.save();

    AudioManager.playCoinCollect();

    return reward;
  }

  /**
   * 출석 보상 수령
   */
  claimDailyLoginReward(): MissionReward | null {
    const saveData = SaveManager.getData();
    const now = Date.now();
    const today = Math.floor(now / DAY_MS);
    const lastClaimed = saveData.retention.lastClaimedDay;

    // 이미 오늘 수령했으면
    if (lastClaimed === today) {
      return null;
    }

    // 연속 출석 체크
    const yesterday = today - 1;
    if (lastClaimed === yesterday) {
      saveData.retention.currentStreak++;
    } else {
      saveData.retention.currentStreak = 1;
    }

    // 최장 연속 기록 업데이트
    if (saveData.retention.currentStreak > saveData.retention.longestStreak) {
      saveData.retention.longestStreak = saveData.retention.currentStreak;
    }

    // 보상 인덱스 (0-6)
    const rewardIndex = (saveData.retention.currentStreak - 1) % 7;
    const reward = DAILY_LOGIN_REWARDS[rewardIndex];

    // 보상 지급
    if (reward.type === 'coins') {
      SaveManager.addCoins(reward.amount);
    } else {
      saveData.currency.diamonds += reward.amount;
    }

    saveData.retention.lastClaimedDay = today;
    saveData.retention.lastPlayDate = now;
    saveData.retention.totalDaysPlayed++;

    SaveManager.save();

    AudioManager.playGiftOpen();

    return reward;
  }

  /**
   * 일일 미션 목록
   */
  getDailyMissions(): DailyMission[] {
    return SaveManager.getData().missions.dailyMissions;
  }

  /**
   * 주간 미션 목록
   */
  getWeeklyMissions(): DailyMission[] {
    return SaveManager.getData().missions.weeklyMissions;
  }

  /**
   * 미션 설명 가져오기
   */
  getMissionDescription(mission: DailyMission): string {
    const templates = [...DAILY_MISSION_TEMPLATES, ...WEEKLY_MISSION_TEMPLATES];
    const template = templates.find((t) => t.type === mission.type);
    if (!template) return '';

    const targetIndex = template.targets.indexOf(mission.target);
    return getMissionDescription(template, Math.max(0, targetIndex));
  }

  /**
   * 수령 가능한 보상 개수
   */
  getClaimableCount(): number {
    const saveData = SaveManager.getData();
    let count = 0;

    for (const mission of saveData.missions.dailyMissions) {
      if (mission.completed && !mission.claimed) count++;
    }
    for (const mission of saveData.missions.weeklyMissions) {
      if (mission.completed && !mission.claimed) count++;
    }

    return count;
  }

  /**
   * 출석 보상 수령 가능 여부
   */
  canClaimDailyLogin(): boolean {
    const saveData = SaveManager.getData();
    const today = Math.floor(Date.now() / DAY_MS);
    return saveData.retention.lastClaimedDay !== today;
  }

  /**
   * 현재 연속 출석 일수
   */
  getCurrentStreak(): number {
    return SaveManager.getData().retention.currentStreak;
  }
}

export const MissionManager = new MissionManagerClass();
