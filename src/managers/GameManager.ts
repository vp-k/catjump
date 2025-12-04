import { SaveManager } from './SaveManager';
import { AudioManager } from './AudioManager';
import { MissionManager } from './MissionManager';

/**
 * 게임 상태
 */
export type GameState = 'idle' | 'playing' | 'paused' | 'gameover';

/**
 * 게임 관리자 - 전역 게임 상태 및 흐름 관리
 */
class GameManagerClass {
  private _state: GameState = 'idle';
  private _currentScore = 0;
  private _currentFloor = 0;
  private _currentCombo = 0;
  private _maxCombo = 0;
  private _perfectCount = 0;
  private _isNewRecord = false;
  private _coinsCollectedThisGame = 0;

  /**
   * 게임 시작
   */
  startGame(): void {
    this._state = 'playing';
    this._currentScore = 0;
    this._currentFloor = 0;
    this._currentCombo = 0;
    this._maxCombo = 0;
    this._perfectCount = 0;
    this._isNewRecord = false;
    this._coinsCollectedThisGame = 0;

    console.log('[GameManager] 게임 시작');
  }

  /**
   * 게임 일시정지
   */
  pauseGame(): void {
    if (this._state === 'playing') {
      this._state = 'paused';
      console.log('[GameManager] 게임 일시정지');
    }
  }

  /**
   * 게임 재개
   */
  resumeGame(): void {
    if (this._state === 'paused') {
      this._state = 'playing';
      console.log('[GameManager] 게임 재개');
    }
  }

  /**
   * 게임 오버
   */
  endGame(): void {
    this._state = 'gameover';

    // 신기록 체크
    const highScore = SaveManager.getHighScore();
    if (this._currentScore > highScore) {
      this._isNewRecord = true;
      AudioManager.playNewRecord();
    }

    // 결과 저장
    SaveManager.recordGameResult(
      this._currentScore,
      this._currentFloor,
      this._perfectCount,
      this._maxCombo
    );

    // 미션 진행도 업데이트 (상태 초기화 전에 호출!)
    // coinsCollected는 게임 내 수집만 포함 (메타 보상 제외)
    MissionManager.updateFromGameResult(
      this._currentScore,
      this._currentFloor,
      this._perfectCount,
      this._maxCombo,
      this._coinsCollectedThisGame
    );

    AudioManager.playGameOver();
    console.log('[GameManager] 게임 오버', {
      score: this._currentScore,
      floor: this._currentFloor,
      maxCombo: this._maxCombo,
      coinsCollected: this._coinsCollectedThisGame,
      isNewRecord: this._isNewRecord,
    });
  }

  /**
   * 점수 추가
   */
  addScore(points: number): void {
    this._currentScore += points;
  }

  /**
   * 층수 증가
   */
  incrementFloor(): void {
    this._currentFloor++;
  }

  /**
   * 콤보 증가
   */
  incrementCombo(): void {
    this._currentCombo++;
    if (this._currentCombo > this._maxCombo) {
      this._maxCombo = this._currentCombo;
    }

    // 콤보 마일스톤 체크
    if ([5, 10, 20, 30, 50].includes(this._currentCombo)) {
      AudioManager.playComboMilestone();
    } else {
      AudioManager.playComboUp();
    }
  }

  /**
   * 콤보 리셋
   */
  resetCombo(): void {
    if (this._currentCombo > 0) {
      AudioManager.playComboBreak();
    }
    this._currentCombo = 0;
  }

  /**
   * 퍼펙트 카운트 증가
   */
  incrementPerfect(): void {
    this._perfectCount++;
  }

  /**
   * 코인 획득
   */
  collectCoin(amount: number): void {
    this._coinsCollectedThisGame += amount;
    SaveManager.addCoins(amount);
    AudioManager.playCoinCollect();
  }

  // Getters
  get state(): GameState {
    return this._state;
  }

  get currentScore(): number {
    return this._currentScore;
  }

  get currentFloor(): number {
    return this._currentFloor;
  }

  get currentCombo(): number {
    return this._currentCombo;
  }

  get maxCombo(): number {
    return this._maxCombo;
  }

  get perfectCount(): number {
    return this._perfectCount;
  }

  get isNewRecord(): boolean {
    return this._isNewRecord;
  }

  get coinsCollectedThisGame(): number {
    return this._coinsCollectedThisGame;
  }

  get isPlaying(): boolean {
    return this._state === 'playing';
  }

  get isPaused(): boolean {
    return this._state === 'paused';
  }

  get isGameOver(): boolean {
    return this._state === 'gameover';
  }
}

export const GameManager = new GameManagerClass();
