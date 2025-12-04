/**
 * 리더보드 서비스 - 순위표 관리
 */

import { firebase } from '@utils/Firebase';
import { SaveManager } from '@managers/SaveManager';

/**
 * 리더보드 항목
 */
export interface LeaderboardEntry {
  rank: number;
  uid: string;
  nickname: string;
  score: number;
  floor: number;
  updatedAt: number;
  isCurrentUser: boolean;
}

/**
 * 리더보드 타입
 */
export type LeaderboardType = 'global' | 'weekly' | 'friends';

/**
 * 리더보드 캐시
 */
interface LeaderboardCache {
  data: LeaderboardEntry[];
  timestamp: number;
  type: LeaderboardType;
}

/**
 * 리더보드 서비스 클래스
 */
class LeaderboardServiceClass {
  private cache: Map<LeaderboardType, LeaderboardCache> = new Map();
  private readonly CACHE_DURATION_MS = 60 * 1000; // 1분 캐시
  private readonly PAGE_SIZE = 20;

  /**
   * 리더보드 조회
   */
  async getLeaderboard(
    type: LeaderboardType,
    page: number = 1,
    forceRefresh: boolean = false
  ): Promise<{
    entries: LeaderboardEntry[];
    hasMore: boolean;
    totalCount: number;
    myRank: number | null;
  }> {
    const currentUser = firebase.getUser();
    const currentUid = currentUser?.uid || '';

    // 캐시 확인
    if (!forceRefresh) {
      const cached = this.cache.get(type);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION_MS) {
        const start = (page - 1) * this.PAGE_SIZE;
        const end = start + this.PAGE_SIZE;
        const entries = cached.data.slice(start, end);
        const myRank = cached.data.find((e) => e.isCurrentUser)?.rank || null;

        return {
          entries,
          hasMore: end < cached.data.length,
          totalCount: cached.data.length,
          myRank,
        };
      }
    }

    // Firebase에서 조회
    let rawData: {
      uid: string;
      nickname: string;
      score: number;
      floor: number;
      updatedAt: number;
    }[] = [];

    try {
      switch (type) {
        case 'global':
          rawData = await firebase.getGlobalLeaderboard(100);
          break;
        case 'weekly':
          rawData = await firebase.getWeeklyLeaderboard(100);
          break;
        case 'friends':
          // 친구 기능은 추후 구현
          rawData = [];
          break;
      }
    } catch (error) {
      console.warn('[LeaderboardService] 조회 실패:', error);
      rawData = [];
    }

    // 순위 부여 및 현재 사용자 표시
    const entries: LeaderboardEntry[] = rawData.map((item, index) => ({
      ...item,
      rank: index + 1,
      isCurrentUser: item.uid === currentUid,
    }));

    // 캐시 저장
    this.cache.set(type, {
      data: entries,
      timestamp: Date.now(),
      type,
    });

    // 페이지네이션
    const start = (page - 1) * this.PAGE_SIZE;
    const end = start + this.PAGE_SIZE;
    const pagedEntries = entries.slice(start, end);
    const myRank = entries.find((e) => e.isCurrentUser)?.rank || null;

    return {
      entries: pagedEntries,
      hasMore: end < entries.length,
      totalCount: entries.length,
      myRank,
    };
  }

  /**
   * 내 순위 조회
   */
  async getMyRank(): Promise<{
    globalRank: number | null;
    weeklyRank: number | null;
  }> {
    try {
      const result = await firebase.getMyRank();
      return result || { globalRank: null, weeklyRank: null };
    } catch (error) {
      console.warn('[LeaderboardService] 내 순위 조회 실패:', error);
      return { globalRank: null, weeklyRank: null };
    }
  }

  /**
   * 점수 제출
   */
  async submitScore(score: number, floor: number): Promise<{
    success: boolean;
    newRecord: boolean;
    rank: number | null;
  }> {
    const saveData = SaveManager.getData();
    const user = firebase.getUser();
    const nickname = user ? `Cat${user.uid.slice(0, 6)}` : 'Anonymous';

    try {
      const result = await firebase.updateLeaderboard({
        score,
        floor,
        nickname,
      });

      if (result.success) {
        // 캐시 무효화
        this.invalidateCache();

        return {
          success: true,
          newRecord: score > saveData.stats.highScore,
          rank: result.rank || null,
        };
      }

      return { success: false, newRecord: false, rank: null };
    } catch (error) {
      console.warn('[LeaderboardService] 점수 제출 실패:', error);
      return { success: false, newRecord: false, rank: null };
    }
  }

  /**
   * 캐시 무효화
   */
  invalidateCache(): void {
    this.cache.clear();
  }

  /**
   * 순위에 따른 티어 반환
   */
  getTier(rank: number): {
    name: string;
    color: number;
    icon: string;
  } {
    if (rank === 1) {
      return { name: '챔피언', color: 0xffd700, icon: 'crown' };
    } else if (rank <= 3) {
      return { name: '마스터', color: 0xe5e4e2, icon: 'medal_platinum' };
    } else if (rank <= 10) {
      return { name: '다이아', color: 0x00bfff, icon: 'medal_gold' };
    } else if (rank <= 50) {
      return { name: '플래티넘', color: 0x9400d3, icon: 'medal_silver' };
    } else if (rank <= 100) {
      return { name: '골드', color: 0xffd700, icon: 'medal_bronze' };
    } else if (rank <= 500) {
      return { name: '실버', color: 0xc0c0c0, icon: 'icon_star' };
    } else {
      return { name: '브론즈', color: 0xcd7f32, icon: 'icon_star' };
    }
  }

  /**
   * 점수 포맷팅
   */
  formatScore(score: number): string {
    if (score >= 1000000) {
      return (score / 1000000).toFixed(1) + 'M';
    } else if (score >= 1000) {
      return (score / 1000).toFixed(1) + 'K';
    }
    return score.toString();
  }

  /**
   * 상대 시간 포맷팅
   */
  formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) {
      return `${days}일 전`;
    } else if (hours > 0) {
      return `${hours}시간 전`;
    } else if (minutes > 0) {
      return `${minutes}분 전`;
    } else {
      return '방금 전';
    }
  }
}

export const LeaderboardService = new LeaderboardServiceClass();
