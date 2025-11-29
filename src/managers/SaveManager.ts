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
      if (saved) {
        const parsed = JSON.parse(saved) as SaveData;
        this.data = this.migrateData(parsed);
        console.log('[SaveManager] 로컬 데이터 로드 완료');
      }
    } catch (error) {
      console.warn('[SaveManager] 로컬 로드 실패:', error);
    }
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
   * 클라우드와 동기화
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

        // 더 최신 데이터 사용
        if (cloudData.lastSaved > this.data.lastSaved) {
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
   * 데이터 마이그레이션 (버전 업그레이드 대응)
   */
  private migrateData(data: SaveData): SaveData {
    // 버전별 마이그레이션 로직
    const migrated = { ...DEFAULT_SAVE_DATA, ...data };
    migrated.version = DEFAULT_SAVE_DATA.version;
    return migrated;
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
