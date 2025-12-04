import { SaveManager } from './SaveManager';
import {
  DAILY_LOGIN_CONFIG,
  STREAK_CONFIG,
  FOMO_CONFIG,
  OFFLINE_REWARD_CONFIG,
} from '@config/RetentionConfig';

/**
 * 일일 로그인 상태
 */
export interface DailyLoginStatus {
  canClaim: boolean;
  dayOfWeek: number; // 1-7
  rewards: { type: 'coins' | 'diamonds'; amount: number }[];
  claimedToday: boolean;
  currentStreak: number;
  streakBonus: number;
}

/**
 * 스트릭 상태
 */
export interface StreakStatus {
  currentStreak: number;
  longestStreak: number;
  nextMilestone: { days: number; reward: { type: string; amount: number }; title: string } | null;
  daysUntilMilestone: number;
  isInDanger: boolean; // 오늘 출석 안 했으면 true
  canRecover: boolean;
  recoveryCost: number;
  protectionsRemaining: number;
}

/**
 * 오프라인 보상
 */
export interface OfflineReward {
  coins: number;
  hoursOffline: number;
  canDouble: boolean; // 광고 시청 가능 여부
  message: string;
}

/**
 * 리텐션 관리자 - 장기 리텐션 시스템
 */
class RetentionManagerClass {
  private initialized = false;

  /**
   * 초기화
   */
  initialize(): void {
    if (this.initialized) return;

    this.updateRetentionData();
    this.initialized = true;
  }

  /**
   * 리텐션 데이터 업데이트
   */
  private updateRetentionData(): void {
    const saveData = SaveManager.getData();
    const now = Date.now();
    const today = this.getTodayKey();

    // 첫 플레이 기록
    if (saveData.retention.firstPlayDate === 0) {
      SaveManager.updateRetention({
        firstPlayDate: now,
        lastPlayDate: now,
        totalDaysPlayed: 1,
      });
    } else {
      // 마지막 플레이 날짜와 오늘이 다르면 플레이 일수 증가
      const lastPlayDay = this.getDayKey(saveData.retention.lastPlayDate);
      if (lastPlayDay !== today) {
        // 스트릭 체크
        const daysSinceLastPlay = this.getDaysDifference(
          saveData.retention.lastPlayDate,
          now
        );

        if (daysSinceLastPlay === 1) {
          // 연속 출석
          SaveManager.updateRetention({
            lastPlayDate: now,
            totalDaysPlayed: saveData.retention.totalDaysPlayed + 1,
            currentStreak: saveData.retention.currentStreak + 1,
            longestStreak: Math.max(
              saveData.retention.longestStreak,
              saveData.retention.currentStreak + 1
            ),
          });
        } else if (daysSinceLastPlay > 1) {
          // 스트릭 끊김
          SaveManager.updateRetention({
            lastPlayDate: now,
            totalDaysPlayed: saveData.retention.totalDaysPlayed + 1,
            currentStreak: 1, // 스트릭 리셋
          });
        }
      } else {
        // 같은 날 재접속
        SaveManager.updateRetention({
          lastPlayDate: now,
        });
      }
    }
  }

  /**
   * 일일 로그인 상태 가져오기
   */
  getDailyLoginStatus(): DailyLoginStatus {
    const saveData = SaveManager.getData();
    const today = this.getTodayKey();
    const lastClaimedDay = saveData.retention.lastClaimedDay;

    // 7일 주기 중 현재 날짜 (1-7)
    const dayOfWeek = ((saveData.retention.currentStreak - 1) % 7) + 1;

    // 오늘 이미 보상 수령했는지 확인
    const claimedToday = lastClaimedDay === today;

    // 스트릭 보너스 계산
    const streakBonus = STREAK_CONFIG.DAILY_STREAK_BONUS.ENABLED
      ? Math.min(
          saveData.retention.currentStreak * STREAK_CONFIG.DAILY_STREAK_BONUS.BONUS_PER_DAY,
          STREAK_CONFIG.DAILY_STREAK_BONUS.MAX_BONUS
        )
      : 0;

    return {
      canClaim: !claimedToday,
      dayOfWeek,
      rewards: DAILY_LOGIN_CONFIG.REWARDS,
      claimedToday,
      currentStreak: saveData.retention.currentStreak,
      streakBonus,
    };
  }

  /**
   * 일일 로그인 보상 수령
   */
  claimDailyReward(): { success: boolean; reward: { type: 'coins' | 'diamonds'; amount: number }; bonus: number } | null {
    const status = this.getDailyLoginStatus();
    if (!status.canClaim) return null;

    const today = this.getTodayKey();
    const rewardIndex = status.dayOfWeek - 1;
    const reward = DAILY_LOGIN_CONFIG.REWARDS[rewardIndex];

    // 보상 지급
    if (reward.type === 'coins') {
      SaveManager.addCoins(reward.amount + status.streakBonus);
    } else {
      SaveManager.addDiamonds(reward.amount);
      if (status.streakBonus > 0) {
        SaveManager.addCoins(status.streakBonus);
      }
    }

    // 수령 기록
    SaveManager.updateRetention({
      lastClaimedDay: today,
    });

    // 스트릭 마일스톤 체크
    this.checkStreakMilestone();

    return {
      success: true,
      reward,
      bonus: status.streakBonus,
    };
  }

  /**
   * 스트릭 마일스톤 체크
   */
  private checkStreakMilestone(): { title: string; reward: { type: string; amount: number } } | null {
    const saveData = SaveManager.getData();
    const currentStreak = saveData.retention.currentStreak;

    for (const milestone of STREAK_CONFIG.MILESTONES) {
      if (currentStreak === milestone.days) {
        // 마일스톤 보상 지급
        if (milestone.type === 'diamonds') {
          SaveManager.addDiamonds(milestone.amount);
        } else {
          SaveManager.addCoins(milestone.amount);
        }
        return { title: milestone.title, reward: { type: milestone.type, amount: milestone.amount } };
      }
    }
    return null;
  }

  /**
   * 스트릭 상태 가져오기
   */
  getStreakStatus(): StreakStatus {
    const saveData = SaveManager.getData();
    const currentStreak = saveData.retention.currentStreak;
    const longestStreak = saveData.retention.longestStreak;

    // 다음 마일스톤 찾기
    let nextMilestone = null;
    let daysUntilMilestone = 0;
    for (const milestone of STREAK_CONFIG.MILESTONES) {
      if (milestone.days > currentStreak) {
        nextMilestone = {
          days: milestone.days,
          reward: { type: milestone.type, amount: milestone.amount },
          title: milestone.title,
        };
        daysUntilMilestone = milestone.days - currentStreak;
        break;
      }
    }

    // 오늘 출석 여부 확인
    const today = this.getTodayKey();
    const lastClaimedDay = saveData.retention.lastClaimedDay;
    const isInDanger = lastClaimedDay !== today;

    // 스트릭 복구 가능 여부
    const lastPlayDate = saveData.retention.lastPlayDate;
    const hoursSinceLastPlay = (Date.now() - lastPlayDate) / (1000 * 60 * 60);
    const canRecover =
      STREAK_CONFIG.PROTECTION.ENABLED &&
      hoursSinceLastPlay <= STREAK_CONFIG.PROTECTION.RECOVERY_WINDOW_HOURS &&
      currentStreak === 0;

    return {
      currentStreak,
      longestStreak,
      nextMilestone,
      daysUntilMilestone,
      isInDanger,
      canRecover,
      recoveryCost: STREAK_CONFIG.PROTECTION.RECOVERY_COST_DIAMONDS,
      protectionsRemaining: STREAK_CONFIG.PROTECTION.FREE_PROTECTIONS,
    };
  }

  /**
   * 오프라인 보상 계산
   */
  calculateOfflineReward(): OfflineReward | null {
    if (!OFFLINE_REWARD_CONFIG.ENABLED) return null;

    const saveData = SaveManager.getData();
    const lastPlayDate = saveData.retention.lastPlayDate;
    const now = Date.now();

    const hoursOffline = Math.floor((now - lastPlayDate) / (1000 * 60 * 60));

    if (hoursOffline < OFFLINE_REWARD_CONFIG.MIN_OFFLINE_HOURS) {
      return null;
    }

    const effectiveHours = Math.min(hoursOffline, OFFLINE_REWARD_CONFIG.MAX_OFFLINE_HOURS);
    const coins = Math.min(
      effectiveHours * OFFLINE_REWARD_CONFIG.COINS_PER_HOUR,
      OFFLINE_REWARD_CONFIG.MAX_COINS
    );

    const messages = OFFLINE_REWARD_CONFIG.WELCOME_MESSAGES;
    const message = messages[Math.floor(Math.random() * messages.length)];

    return {
      coins,
      hoursOffline: effectiveHours,
      canDouble: true,
      message,
    };
  }

  /**
   * 오프라인 보상 수령
   */
  claimOfflineReward(watchAd: boolean = false): number {
    const reward = this.calculateOfflineReward();
    if (!reward) return 0;

    const multiplier = watchAd ? OFFLINE_REWARD_CONFIG.AD_MULTIPLIER : 1;
    const coins = reward.coins * multiplier;

    SaveManager.addCoins(coins);
    return coins;
  }

  /**
   * FOMO 상태 가져오기 (한정 이벤트)
   */
  getFOMOStatus(): {
    dailyFreeReward: { available: boolean; reward: { type: string; amount: number }; resetTime: number } | null;
    streakDanger: { inDanger: boolean; hoursRemaining: number } | null;
  } {
    const now = Date.now();
    const today = this.getTodayKey();
    const saveData = SaveManager.getData();

    // 일일 무료 보상
    let dailyFreeReward = null;
    if (FOMO_CONFIG.DAILY_FREE_REWARD.ENABLED) {
      const lastClaimedDay = saveData.retention.lastClaimedDay;
      const available = lastClaimedDay !== today;
      const resetTime = this.getNextResetTime();

      dailyFreeReward = {
        available,
        reward: FOMO_CONFIG.DAILY_FREE_REWARD.REWARD,
        resetTime,
      };
    }

    // 스트릭 위험 상태
    let streakDanger = null;
    if (FOMO_CONFIG.STREAK_DANGER_ALERT.ENABLED) {
      const lastClaimedDay = saveData.retention.lastClaimedDay;
      if (lastClaimedDay !== today) {
        const hoursRemaining = (this.getNextResetTime() - now) / (1000 * 60 * 60);
        if (hoursRemaining <= FOMO_CONFIG.STREAK_DANGER_ALERT.HOURS_BEFORE) {
          streakDanger = {
            inDanger: true,
            hoursRemaining: Math.ceil(hoursRemaining),
          };
        }
      }
    }

    return { dailyFreeReward, streakDanger };
  }

  /**
   * 다음 리셋 시간 (KST 00:00)
   */
  private getNextResetTime(): number {
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000; // KST = UTC + 9
    const kstNow = new Date(now.getTime() + kstOffset);

    // 오늘 KST 자정
    const todayMidnight = new Date(kstNow);
    todayMidnight.setHours(DAILY_LOGIN_CONFIG.RESET_HOUR_KST, 0, 0, 0);

    // 이미 지났으면 내일
    if (kstNow >= todayMidnight) {
      todayMidnight.setDate(todayMidnight.getDate() + 1);
    }

    return todayMidnight.getTime() - kstOffset;
  }

  /**
   * 오늘 날짜 키 (YYYYMMDD)
   */
  private getTodayKey(): number {
    return this.getDayKey(Date.now());
  }

  /**
   * 날짜 키 생성 (KST 기준)
   */
  private getDayKey(timestamp: number): number {
    // KST = UTC + 9시간
    const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
    const kstTime = new Date(timestamp + KST_OFFSET_MS);
    return kstTime.getUTCFullYear() * 10000 +
           (kstTime.getUTCMonth() + 1) * 100 +
           kstTime.getUTCDate();
  }

  /**
   * 두 날짜 간 일수 차이 (KST 기준)
   */
  private getDaysDifference(from: number, to: number): number {
    const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    // KST 기준 날짜 시작 시점 계산
    const fromKst = new Date(from + KST_OFFSET_MS);
    const toKst = new Date(to + KST_OFFSET_MS);

    fromKst.setUTCHours(0, 0, 0, 0);
    toKst.setUTCHours(0, 0, 0, 0);

    return Math.floor((toKst.getTime() - fromKst.getTime()) / MS_PER_DAY);
  }

  /**
   * 리텐션 일수 (D+N)
   */
  getRetentionDay(): number {
    const saveData = SaveManager.getData();
    if (saveData.retention.firstPlayDate === 0) return 1;

    return this.getDaysDifference(saveData.retention.firstPlayDate, Date.now()) + 1;
  }

  /**
   * 남은 스트릭 보호 횟수 설정
   */
  useStreakProtection(): boolean {
    const status = this.getStreakStatus();
    if (!status.canRecover || status.protectionsRemaining <= 0) {
      return false;
    }

    // 스트릭 복구 (이전 스트릭 + 1)
    const saveData = SaveManager.getData();
    SaveManager.updateRetention({
      currentStreak: saveData.retention.longestStreak, // 이전 최고 스트릭으로 복구
    });

    return true;
  }

  /**
   * 다이아몬드로 스트릭 복구
   */
  recoverStreakWithDiamonds(): boolean {
    const status = this.getStreakStatus();
    if (!status.canRecover) return false;

    const saveData = SaveManager.getData();
    if (saveData.currency.diamonds < status.recoveryCost) {
      return false;
    }

    SaveManager.addDiamonds(-status.recoveryCost);
    SaveManager.updateRetention({
      currentStreak: saveData.retention.longestStreak,
    });

    return true;
  }
}

export const RetentionManager = new RetentionManagerClass();
