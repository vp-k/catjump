import { SaveManager } from './SaveManager';
import { EnergyData } from '@/types/GameTypes';
import { ENERGY_CONFIG } from '@config/EnergyConfig';

/**
 * 에너지(생명) 관리자
 */
class EnergyManagerClass {
  private energyState: EnergyData = {
    current: ENERGY_CONFIG.INITIAL_ENERGY,
    max: ENERGY_CONFIG.MAX_ENERGY,
    lastRecoveryTime: Date.now(),
  };
  private recoveryTimer: number | null = null;

  // 이벤트 콜백
  private onEnergyChange: ((current: number, max: number) => void) | null = null;
  private onRecoveryTick: ((remainingMs: number) => void) | null = null;

  /**
   * 초기화 - 저장된 에너지 로드 및 오프라인 회복 계산
   */
  initialize(): void {
    this.loadEnergyState();
    this.calculateOfflineRecovery();
    this.startRecoveryTimer();
  }

  /**
   * 저장된 에너지 상태 로드
   */
  private loadEnergyState(): void {
    const saveData = SaveManager.getData();
    if (saveData.energy && saveData.energy.lastRecoveryTime > 0) {
      this.energyState = { ...saveData.energy };
    } else {
      this.energyState = {
        current: ENERGY_CONFIG.INITIAL_ENERGY,
        max: ENERGY_CONFIG.MAX_ENERGY,
        lastRecoveryTime: Date.now(),
      };
    }
  }

  /**
   * 오프라인 회복 계산 (시간 조작 방지 포함)
   */
  private calculateOfflineRecovery(): void {
    const now = Date.now();
    let timeSinceLastRecovery = now - this.energyState.lastRecoveryTime;

    // 시간 조작 방지: 미래 시간이면 현재 시간으로 리셋
    if (timeSinceLastRecovery < 0) {
      console.warn('[EnergyManager] 시간 조작 감지 - 리셋');
      this.energyState.lastRecoveryTime = now;
      this.saveEnergyState();
      return;
    }

    // 최대 24시간만 오프라인 회복 허용 (시간 조작 방지)
    const MAX_OFFLINE_RECOVERY_MS = 24 * 60 * 60 * 1000;
    timeSinceLastRecovery = Math.min(timeSinceLastRecovery, MAX_OFFLINE_RECOVERY_MS);

    const recoveryPeriods = Math.floor(timeSinceLastRecovery / ENERGY_CONFIG.RECOVERY_TIME_MS);

    if (recoveryPeriods > 0 && this.energyState.current < ENERGY_CONFIG.MAX_ENERGY) {
      const newEnergy = Math.min(
        this.energyState.current + recoveryPeriods,
        ENERGY_CONFIG.MAX_ENERGY
      );

      // 회복된 양만큼 시간 업데이트
      const actualRecovered = newEnergy - this.energyState.current;
      this.energyState.current = newEnergy;
      this.energyState.lastRecoveryTime += actualRecovered * ENERGY_CONFIG.RECOVERY_TIME_MS;

      // 최대치면 현재 시간으로
      if (this.energyState.current >= ENERGY_CONFIG.MAX_ENERGY) {
        this.energyState.lastRecoveryTime = now;
      }

      this.saveEnergyState();
      this.notifyEnergyChange();
    }
  }

  /**
   * 회복 타이머 시작
   */
  private startRecoveryTimer(): void {
    if (this.recoveryTimer) {
      window.clearInterval(this.recoveryTimer);
    }

    // 1초마다 체크
    this.recoveryTimer = window.setInterval(() => {
      this.updateRecovery();
    }, 1000);
  }

  /**
   * 회복 업데이트
   */
  private updateRecovery(): void {
    if (this.energyState.current >= ENERGY_CONFIG.MAX_ENERGY) {
      // 이미 최대
      this.onRecoveryTick?.(0);
      return;
    }

    const now = Date.now();
    const timeSinceLastRecovery = now - this.energyState.lastRecoveryTime;

    // 다음 회복까지 남은 시간
    const remainingMs = ENERGY_CONFIG.RECOVERY_TIME_MS - timeSinceLastRecovery;
    this.onRecoveryTick?.(Math.max(0, remainingMs));

    // 회복 시간 도달
    if (timeSinceLastRecovery >= ENERGY_CONFIG.RECOVERY_TIME_MS) {
      this.energyState.current = Math.min(
        this.energyState.current + 1,
        ENERGY_CONFIG.MAX_ENERGY
      );
      this.energyState.lastRecoveryTime = now;
      this.saveEnergyState();
      this.notifyEnergyChange();
    }
  }

  /**
   * 에너지 상태 저장
   */
  private saveEnergyState(): void {
    const saveData = SaveManager.getData();
    saveData.energy = { ...this.energyState };
    SaveManager.save();
  }

  /**
   * 에너지 변경 알림
   */
  private notifyEnergyChange(): void {
    this.onEnergyChange?.(this.energyState.current, ENERGY_CONFIG.MAX_ENERGY);
  }

  /**
   * 에너지 사용 (게임 시작)
   */
  useEnergy(): boolean {
    if (this.energyState.current <= 0) {
      return false;
    }

    // 최대에서 처음 사용할 때 회복 시작
    if (this.energyState.current === ENERGY_CONFIG.MAX_ENERGY) {
      this.energyState.lastRecoveryTime = Date.now();
    }

    this.energyState.current--;
    this.saveEnergyState();
    this.notifyEnergyChange();
    return true;
  }

  /**
   * 에너지 추가
   */
  addEnergy(amount: number): void {
    this.energyState.current = Math.min(
      this.energyState.current + amount,
      ENERGY_CONFIG.MAX_ENERGY
    );

    // 최대치면 회복 타이머 리셋
    if (this.energyState.current >= ENERGY_CONFIG.MAX_ENERGY) {
      this.energyState.lastRecoveryTime = Date.now();
    }

    this.saveEnergyState();
    this.notifyEnergyChange();
  }

  /**
   * 광고 시청으로 에너지 획득
   */
  watchAdForEnergy(): boolean {
    // 이미 최대면 불필요
    if (this.energyState.current >= ENERGY_CONFIG.MAX_ENERGY) {
      return false;
    }

    this.addEnergy(ENERGY_CONFIG.AD_REWARD_ENERGY);
    return true;
  }

  /**
   * 코인으로 에너지 구매
   */
  purchaseWithCoins(): boolean {
    if (this.energyState.current >= ENERGY_CONFIG.MAX_ENERGY) {
      return false;
    }

    const saveData = SaveManager.getData();
    if (saveData.currency.coins < ENERGY_CONFIG.COIN_PURCHASE_COST) {
      return false;
    }

    SaveManager.spendCoins(ENERGY_CONFIG.COIN_PURCHASE_COST);
    this.addEnergy(ENERGY_CONFIG.COIN_PURCHASE_AMOUNT);
    return true;
  }

  /**
   * 다이아몬드로 풀 충전
   */
  purchaseFullRefill(): boolean {
    if (!SaveManager.spendDiamonds(ENERGY_CONFIG.FULL_REFILL_DIAMOND_COST)) {
      return false;
    }

    this.energyState.current = ENERGY_CONFIG.MAX_ENERGY;
    this.energyState.lastRecoveryTime = Date.now();
    this.saveEnergyState();
    this.notifyEnergyChange();
    return true;
  }

  /**
   * 현재 에너지
   */
  get currentEnergy(): number {
    return this.energyState.current;
  }

  /**
   * 최대 에너지
   */
  get maxEnergy(): number {
    return ENERGY_CONFIG.MAX_ENERGY;
  }

  /**
   * 에너지가 있는지 확인
   */
  hasEnergy(): boolean {
    return this.energyState.current > 0;
  }

  /**
   * 에너지가 가득 찼는지 확인
   */
  isFull(): boolean {
    return this.energyState.current >= ENERGY_CONFIG.MAX_ENERGY;
  }

  /**
   * 다음 회복까지 남은 시간 (밀리초)
   */
  getTimeToNextRecovery(): number {
    if (this.isFull()) return 0;

    const now = Date.now();
    const elapsed = now - this.energyState.lastRecoveryTime;
    return Math.max(0, ENERGY_CONFIG.RECOVERY_TIME_MS - elapsed);
  }

  /**
   * 완전 회복까지 남은 시간 (밀리초)
   */
  getTimeToFullRecovery(): number {
    if (this.isFull()) return 0;

    const energyNeeded = ENERGY_CONFIG.MAX_ENERGY - this.energyState.current;
    const timeToNext = this.getTimeToNextRecovery();
    const additionalTime = (energyNeeded - 1) * ENERGY_CONFIG.RECOVERY_TIME_MS;

    return timeToNext + additionalTime;
  }

  /**
   * 시간 포맷팅 (mm:ss)
   */
  formatTime(ms: number): string {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * 에너지 변경 콜백 설정
   */
  setOnEnergyChange(callback: (current: number, max: number) => void): void {
    this.onEnergyChange = callback;
  }

  /**
   * 회복 틱 콜백 설정
   */
  setOnRecoveryTick(callback: (remainingMs: number) => void): void {
    this.onRecoveryTick = callback;
  }

  /**
   * 정리
   */
  cleanup(): void {
    if (this.recoveryTimer) {
      window.clearInterval(this.recoveryTimer);
      this.recoveryTimer = null;
    }
  }
}

export const EnergyManager = new EnergyManagerClass();
