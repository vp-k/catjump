/**
 * 고스트 레이스 서비스 - 리플레이 데이터 관리
 */

import { firebase } from '@utils/Firebase';
import { SaveManager } from '@managers/SaveManager';

/**
 * 리플레이 액션 타입
 */
export interface ReplayAction {
  time: number; // 게임 시작 후 ms
  type: 'jump' | 'land' | 'position';
  x?: number;
  y?: number;
  floor?: number;
  landingType?: 'perfect' | 'good' | 'miss';
}

/**
 * 리플레이 데이터
 */
export interface ReplayData {
  id: string;
  uid: string;
  nickname: string;
  score: number;
  floor: number;
  actions: ReplayAction[];
  recordedAt: number;
  duration: number;
}

/**
 * 고스트 타입
 */
export type GhostType = 'personal_best' | 'friend' | 'top_player';

/**
 * 고스트 서비스 클래스
 */
class GhostServiceClass {
  private currentRecording: ReplayAction[] = [];
  private recordingStartTime: number = 0;
  private isRecording = false;
  private personalBestReplay: ReplayData | null = null;

  /**
   * 녹화 시작
   */
  startRecording(): void {
    this.currentRecording = [];
    this.recordingStartTime = Date.now();
    this.isRecording = true;
    console.log('[GhostService] 녹화 시작');
  }

  /**
   * 액션 기록
   */
  recordAction(action: Omit<ReplayAction, 'time'>): void {
    if (!this.isRecording) return;

    const time = Date.now() - this.recordingStartTime;
    this.currentRecording.push({
      ...action,
      time,
    });
  }

  /**
   * 위치 기록 (주기적 호출용)
   */
  recordPosition(x: number, y: number): void {
    if (!this.isRecording) return;

    // 위치는 100ms마다만 기록
    const time = Date.now() - this.recordingStartTime;
    const lastAction = this.currentRecording[this.currentRecording.length - 1];

    if (!lastAction || lastAction.type !== 'position' || time - lastAction.time >= 100) {
      this.currentRecording.push({
        type: 'position',
        time,
        x,
        y,
      });
    }
  }

  /**
   * 녹화 종료 및 저장
   */
  async stopRecording(score: number, floor: number): Promise<ReplayData | null> {
    if (!this.isRecording) return null;

    this.isRecording = false;
    const duration = Date.now() - this.recordingStartTime;

    const user = firebase.getUser();
    const replayData: ReplayData = {
      id: `replay_${Date.now()}`,
      uid: user?.uid || 'local',
      nickname: `Cat${(user?.uid || 'local').slice(0, 6)}`,
      score,
      floor,
      actions: this.currentRecording,
      recordedAt: Date.now(),
      duration,
    };

    console.log(`[GhostService] 녹화 종료: ${this.currentRecording.length}개 액션, ${duration}ms`);

    // 개인 최고 기록이면 저장
    const highScore = SaveManager.getHighScore();
    if (score >= highScore) {
      await this.savePersonalBest(replayData);
    }

    return replayData;
  }

  // LocalStorage 크기 제한 (100KB)
  private readonly MAX_GHOST_SIZE = 100 * 1024;

  /**
   * 개인 최고 기록 저장
   */
  private async savePersonalBest(replay: ReplayData): Promise<void> {
    this.personalBestReplay = replay;

    // 로컬 저장
    try {
      let compressed = this.compressReplay(replay);
      let jsonData = JSON.stringify(compressed);

      // 크기가 너무 크면 추가 압축
      if (jsonData.length > this.MAX_GHOST_SIZE) {
        compressed = this.aggressiveCompress(compressed);
        jsonData = JSON.stringify(compressed);

        // 여전히 크면 저장 포기
        if (jsonData.length > this.MAX_GHOST_SIZE) {
          console.warn(`[GhostService] 고스트 데이터 너무 큼 (${jsonData.length} bytes), 저장 스킵`);
          return;
        }
      }

      localStorage.setItem('catjump_ghost_pb', jsonData);
      console.log(`[GhostService] 개인 최고 기록 고스트 저장 (${jsonData.length} bytes)`);
    } catch (error) {
      // QuotaExceededError 처리
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('[GhostService] LocalStorage 용량 초과, 오래된 데이터 정리 시도');
        this.cleanupLocalStorage();
      } else {
        console.warn('[GhostService] 고스트 저장 실패:', error);
      }
    }

    // Firebase에도 저장 (선택적)
    const db = firebase.getFirestore();
    const user = firebase.getUser();
    if (db && user) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const ghostRef = doc(db, 'users', user.uid, 'ghosts', 'personal_best');
        await setDoc(ghostRef, this.compressReplay(replay));
      } catch (error) {
        console.warn('[GhostService] Firebase 고스트 저장 실패:', error);
      }
    }
  }

  /**
   * 리플레이 데이터 압축 (position 액션 간소화)
   */
  private compressReplay(replay: ReplayData): ReplayData {
    // position 액션은 500ms마다만 유지
    let lastPositionTime = -Infinity;
    const compressedActions = replay.actions.filter((action) => {
      if (action.type !== 'position') return true;

      if (action.time - lastPositionTime >= 500) {
        lastPositionTime = action.time;
        return true;
      }
      return false;
    });

    return {
      ...replay,
      actions: compressedActions,
    };
  }

  /**
   * 추가 압축 (position 간격 1초로 확대)
   */
  private aggressiveCompress(replay: ReplayData): ReplayData {
    let lastPositionTime = -Infinity;
    const compressedActions = replay.actions.filter((action) => {
      if (action.type !== 'position') return true;

      if (action.time - lastPositionTime >= 1000) {
        lastPositionTime = action.time;
        return true;
      }
      return false;
    });

    return {
      ...replay,
      actions: compressedActions,
    };
  }

  /**
   * LocalStorage 정리
   */
  private cleanupLocalStorage(): void {
    // 불필요한 오래된 데이터 정리
    const keysToRemove = ['catjump_pending_scores'];
    keysToRemove.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // 무시
      }
    });
  }

  /**
   * 리플레이 데이터 유효성 검증
   */
  private isValidReplayData(data: unknown): data is ReplayData {
    if (!data || typeof data !== 'object') return false;
    const obj = data as Record<string, unknown>;
    return (
      typeof obj.id === 'string' &&
      typeof obj.uid === 'string' &&
      typeof obj.score === 'number' &&
      typeof obj.floor === 'number' &&
      Array.isArray(obj.actions) &&
      typeof obj.recordedAt === 'number' &&
      typeof obj.duration === 'number'
    );
  }

  /**
   * 개인 최고 기록 고스트 로드
   */
  async loadPersonalBest(): Promise<ReplayData | null> {
    if (this.personalBestReplay) {
      return this.personalBestReplay;
    }

    // 로컬에서 로드 시도
    try {
      const saved = localStorage.getItem('catjump_ghost_pb');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (this.isValidReplayData(parsed)) {
          this.personalBestReplay = parsed;
          return this.personalBestReplay;
        }
        console.warn('[GhostService] 유효하지 않은 고스트 데이터');
      }
    } catch (error) {
      console.warn('[GhostService] 로컬 고스트 로드 실패:', error);
    }

    // Firebase에서 로드 시도
    const db = firebase.getFirestore();
    const user = firebase.getUser();
    if (db && user) {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const ghostRef = doc(db, 'users', user.uid, 'ghosts', 'personal_best');
        const ghostDoc = await getDoc(ghostRef);

        if (ghostDoc.exists()) {
          this.personalBestReplay = ghostDoc.data() as ReplayData;
          return this.personalBestReplay;
        }
      } catch (error) {
        console.warn('[GhostService] Firebase 고스트 로드 실패:', error);
      }
    }

    return null;
  }

  /**
   * 특정 시간의 고스트 위치 계산
   */
  getGhostPosition(replay: ReplayData, time: number): { x: number; y: number } | null {
    if (!replay.actions.length) return null;

    // 해당 시간 이전의 마지막 position 액션 찾기
    let lastPosition: ReplayAction | null = null;
    let nextPosition: ReplayAction | null = null;

    for (let i = 0; i < replay.actions.length; i++) {
      const action = replay.actions[i];
      if (action.type === 'position') {
        if (action.time <= time) {
          lastPosition = action;
        } else if (!nextPosition) {
          nextPosition = action;
          break;
        }
      }
    }

    if (!lastPosition) return null;

    // 보간 없이 마지막 위치 반환
    if (!nextPosition || lastPosition.x === undefined || lastPosition.y === undefined) {
      return {
        x: lastPosition.x || 0,
        y: lastPosition.y || 0,
      };
    }

    // 선형 보간
    const t =
      (time - lastPosition.time) / (nextPosition.time - lastPosition.time);
    return {
      x: lastPosition.x + ((nextPosition.x || 0) - lastPosition.x) * t,
      y: lastPosition.y + ((nextPosition.y || 0) - lastPosition.y) * t,
    };
  }

  /**
   * 특정 시간까지의 고스트 층수
   */
  getGhostFloor(replay: ReplayData, time: number): number {
    let floor = 0;

    for (const action of replay.actions) {
      if (action.time > time) break;
      if (action.type === 'land' && action.floor !== undefined) {
        floor = action.floor;
      }
    }

    return floor;
  }

  /**
   * 고스트 데이터 존재 여부
   */
  hasPersonalBest(): boolean {
    return this.personalBestReplay !== null;
  }

  /**
   * 현재 녹화 중인지 확인
   */
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /**
   * 녹화 취소
   */
  cancelRecording(): void {
    this.isRecording = false;
    this.currentRecording = [];
  }
}

export const GhostService = new GhostServiceClass();
