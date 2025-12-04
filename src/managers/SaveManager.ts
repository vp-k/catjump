import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firebase } from '@utils/Firebase';
import { SaveData, DEFAULT_SAVE_DATA } from '@/types/GameTypes';

const STORAGE_KEY = 'catjump_save';

/**
 * 저장 관리자 - 로컬 + 클라우드 동기화
 */
class SaveManagerClass {
  private data: SaveData = { ...DEFAULT_SAVE_DATA };
  private isDirty = false;
  private autoSaveInterval: number | null = null;

  /**
   * 초기화 - 로컬 데이터 로드 후 클라우드 동기화
   */
  async initialize(): Promise<void> {
    // 1. 로컬 데이터 먼저 로드
    this.loadFromLocal();

    // 2. 클라우드 데이터와 동기화 시도
    await this.syncWithCloud();

    // 3. 자동 저장 시작
    this.startAutoSave();

    console.log('[SaveManager] 초기화 완료');
  }

  /**
   * 로컬 스토리지에서 로드
   */
  private loadFromLocal(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        this.data = { ...DEFAULT_SAVE_DATA };
        return;
      }

      const parsed = JSON.parse(saved);
      if (!this.isValidSaveData(parsed)) {
        console.warn('[SaveManager] 유효하지 않은 저장 데이터, 초기화');
        this.data = { ...DEFAULT_SAVE_DATA };
        return;
      }

      this.data = this.migrateData(parsed);
      console.log('[SaveManager] 로컬 데이터 로드 완료');
    } catch (error) {
      console.warn('[SaveManager] 로컬 로드 실패:', error);
      this.data = { ...DEFAULT_SAVE_DATA };
    }
  }

  /**
   * 저장 데이터 유효성 검사
   */
  private isValidSaveData(data: unknown): data is SaveData {
    if (!data || typeof data !== 'object') return false;
    const obj = data as Record<string, unknown>;
    return (
      'version' in obj &&
      'currency' in obj &&
      'stats' in obj &&
      'settings' in obj
    );
  }

  /**
   * 로컬 스토리지에 저장
   */
  private saveToLocal(): void {
    try {
      this.data.lastSaved = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      this.isDirty = false;
    } catch (error) {
      console.warn('[SaveManager] 로컬 저장 실패:', error);
    }
  }

  /**
   * 클라우드와 동기화 (충돌 해결 포함)
   */
  private async syncWithCloud(): Promise<void> {
    const db = firebase.getFirestore();
    const user = firebase.getUser();

    if (!db || !user) {
      console.log('[SaveManager] 클라우드 동기화 스킵 (오프라인)');
      return;
    }

    try {
      const docRef = doc(db, 'users', user.uid, 'data', 'save');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const cloudData = docSnap.data() as SaveData;

        // 동시 수정 가능성 체크 (1분 이내 수정)
        const timeDiff = Math.abs(cloudData.lastSaved - this.data.lastSaved);
        const isConflict = timeDiff < 60000 && cloudData.lastSaved !== this.data.lastSaved;

        if (isConflict) {
          // 충돌 시: 더 높은 점수/재화 유지 (유저에게 유리하게)
          this.data = this.mergeConflictingData(this.data, cloudData);
          this.saveToLocal();
          await this.saveToCloud();
          console.log('[SaveManager] 데이터 충돌 해결 - 병합 완료');
        } else if (cloudData.lastSaved > this.data.lastSaved) {
          this.data = this.migrateData(cloudData);
          this.saveToLocal();
          console.log('[SaveManager] 클라우드 데이터가 더 최신 - 동기화 완료');
        } else if (this.data.lastSaved > cloudData.lastSaved) {
          await this.saveToCloud();
          console.log('[SaveManager] 로컬 데이터가 더 최신 - 업로드 완료');
        }
      } else {
        // 클라우드에 데이터 없음 - 업로드
        await this.saveToCloud();
        console.log('[SaveManager] 클라우드 초기 업로드 완료');
      }
    } catch (error) {
      console.warn('[SaveManager] 클라우드 동기화 실패:', error);
    }
  }

  /**
   * 충돌 데이터 병합 (유저에게 유리한 값 선택)
   */
  private mergeConflictingData(local: SaveData, cloud: SaveData): SaveData {
    return {
      version: Math.max(local.version, cloud.version),
      settings: { ...cloud.settings, ...local.settings }, // 로컬 설정 우선
      stats: {
        highScore: Math.max(local.stats.highScore, cloud.stats.highScore),
        highFloor: Math.max(local.stats.highFloor, cloud.stats.highFloor),
        gamesPlayed: Math.max(local.stats.gamesPlayed, cloud.stats.gamesPlayed),
        totalScore: Math.max(local.stats.totalScore, cloud.stats.totalScore),
        perfectCount: Math.max(local.stats.perfectCount, cloud.stats.perfectCount),
        maxCombo: Math.max(local.stats.maxCombo, cloud.stats.maxCombo),
        medals: [...new Set([...(local.stats.medals || []), ...(cloud.stats.medals || [])])],
        totalShares: Math.max(local.stats.totalShares || 0, cloud.stats.totalShares || 0),
      },
      currency: {
        coins: Math.max(local.currency.coins, cloud.currency.coins),
        diamonds: Math.max(local.currency.diamonds, cloud.currency.diamonds),
      },
      inventory: { ...cloud.inventory, ...local.inventory },
      missions: { ...cloud.missions, ...local.missions },
      retention: {
        ...cloud.retention,
        ...local.retention,
        currentStreak: Math.max(local.retention.currentStreak || 0, cloud.retention.currentStreak || 0),
      },
      energy: local.energy.lastRecoveryTime > cloud.energy.lastRecoveryTime ? local.energy : cloud.energy,
      lastSaved: Date.now(),
    };
  }

  /**
   * 클라우드에 저장
   */
  private async saveToCloud(): Promise<void> {
    const db = firebase.getFirestore();
    const user = firebase.getUser();

    if (!db || !user) return;

    try {
      const docRef = doc(db, 'users', user.uid, 'data', 'save');
      await setDoc(docRef, this.data);
    } catch (error) {
      console.warn('[SaveManager] 클라우드 저장 실패:', error);
    }
  }

  /**
   * 데이터 마이그레이션 (버전 업그레이드 대응) - Deep merge
   */
  private migrateData(data: SaveData): SaveData {
    // 다운그레이드 방지 경고
    if (data.version > DEFAULT_SAVE_DATA.version) {
      console.warn(
        `[SaveManager] 앱 버전(${DEFAULT_SAVE_DATA.version})보다 ` +
          `높은 데이터 버전(${data.version}) 감지 - 버전 유지`
      );
    }

    return {
      version: Math.max(data.version ?? 0, DEFAULT_SAVE_DATA.version),
      settings: { ...DEFAULT_SAVE_DATA.settings, ...data.settings },
      stats: { ...DEFAULT_SAVE_DATA.stats, ...data.stats },
      currency: { ...DEFAULT_SAVE_DATA.currency, ...data.currency },
      inventory: { ...DEFAULT_SAVE_DATA.inventory, ...data.inventory },
      missions: { ...DEFAULT_SAVE_DATA.missions, ...data.missions },
      retention: { ...DEFAULT_SAVE_DATA.retention, ...data.retention },
      energy: { ...DEFAULT_SAVE_DATA.energy, ...data.energy },
      lastSaved: data.lastSaved || DEFAULT_SAVE_DATA.lastSaved,
    };
  }

  /**
   * 자동 저장 시작 (30초마다)
   */
  private startAutoSave(): void {
    if (this.autoSaveInterval) return;

    this.autoSaveInterval = window.setInterval(() => {
      if (this.isDirty) {
        this.save();
      }
    }, 30000);
  }

  /**
   * 자동 저장 정지 및 정리
   */
  stopAutoSave(): void {
    if (this.autoSaveInterval) {
      window.clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  /**
   * 리소스 정리
   */
  cleanup(): void {
    this.stopAutoSave();
    // 마지막으로 저장되지 않은 데이터 저장
    if (this.isDirty) {
      this.saveToLocal();
    }
  }

  /**
   * 저장 (로컬 + 클라우드)
   */
  async save(): Promise<void> {
    this.saveToLocal();
    await this.saveToCloud();
  }

  /**
   * 데이터 가져오기
   */
  getData(): SaveData {
    return this.data;
  }

  /**
   * 설정 업데이트
   */
  updateSettings(settings: Partial<SaveData['settings']>): void {
    this.data.settings = { ...this.data.settings, ...settings };
    this.isDirty = true;
  }

  /**
   * 통계 업데이트
   */
  updateStats(stats: Partial<SaveData['stats']>): void {
    this.data.stats = { ...this.data.stats, ...stats };
    this.isDirty = true;
  }

  /**
   * 게임 결과 기록
   */
  recordGameResult(score: number, floor: number, perfectCount: number, maxCombo: number): void {
    this.data.stats.gamesPlayed++;
    this.data.stats.totalScore += score;

    if (score > this.data.stats.highScore) {
      this.data.stats.highScore = score;
    }
    if (floor > this.data.stats.highFloor) {
      this.data.stats.highFloor = floor;
    }
    if (maxCombo > this.data.stats.maxCombo) {
      this.data.stats.maxCombo = maxCombo;
    }

    this.data.stats.perfectCount += perfectCount;
    this.isDirty = true;
  }

  /**
   * 코인 추가
   */
  addCoins(amount: number): void {
    this.data.currency.coins += amount;
    this.isDirty = true;
  }

  /**
   * 코인 사용
   */
  spendCoins(amount: number): boolean {
    if (this.data.currency.coins < amount) return false;
    this.data.currency.coins -= amount;
    this.isDirty = true;
    return true;
  }

  /**
   * 다이아몬드 추가
   */
  addDiamonds(amount: number): void {
    this.data.currency.diamonds += amount;
    this.isDirty = true;
  }

  /**
   * 다이아몬드 사용
   */
  spendDiamonds(amount: number): boolean {
    if (this.data.currency.diamonds < amount) return false;
    this.data.currency.diamonds -= amount;
    this.isDirty = true;
    return true;
  }

  /**
   * 리텐션 데이터 업데이트
   */
  updateRetention(retention: Partial<SaveData['retention']>): void {
    this.data.retention = { ...this.data.retention, ...retention };
    this.isDirty = true;
  }

  /**
   * 에너지 데이터 업데이트
   */
  updateEnergy(energy: Partial<SaveData['energy']>): void {
    this.data.energy = { ...this.data.energy, ...energy };
    this.isDirty = true;
  }

  /**
   * 최고 기록
   */
  getHighScore(): number {
    return this.data.stats.highScore;
  }

  /**
   * 최고 층수
   */
  getHighFloor(): number {
    return this.data.stats.highFloor;
  }
}

export const SaveManager = new SaveManagerClass();
