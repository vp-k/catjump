type EventCallback = (...args: unknown[]) => void;

/**
 * 이벤트 버스 - 컴포넌트 간 통신
 */
class EventBusClass {
  private events: Map<string, Set<EventCallback>> = new Map();

  /**
   * 이벤트 리스너 등록
   */
  on(event: string, callback: EventCallback): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);
  }

  /**
   * 이벤트 리스너 해제
   */
  off(event: string, callback: EventCallback): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.events.delete(event);
      }
    }
  }

  /**
   * 일회성 이벤트 리스너
   */
  once(event: string, callback: EventCallback): void {
    const onceCallback: EventCallback = (...args) => {
      this.off(event, onceCallback);
      callback(...args);
    };
    this.on(event, onceCallback);
  }

  /**
   * 이벤트 발생
   */
  emit(event: string, ...args: unknown[]): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`[EventBus] Error in event "${event}":`, error);
        }
      });
    }
  }

  /**
   * 특정 이벤트의 모든 리스너 해제
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  /**
   * 이벤트 리스너 수 확인
   */
  listenerCount(event: string): number {
    return this.events.get(event)?.size ?? 0;
  }
}

export const EventBus = new EventBusClass();

/**
 * 게임 이벤트 타입 정의
 */
export const GameEvents = {
  // 게임 상태
  GAME_START: 'game:start',
  GAME_PAUSE: 'game:pause',
  GAME_RESUME: 'game:resume',
  GAME_OVER: 'game:over',

  // 게임플레이
  JUMP: 'gameplay:jump',
  LAND: 'gameplay:land',
  LAND_PERFECT: 'gameplay:land:perfect',
  LAND_GOOD: 'gameplay:land:good',
  LAND_MISS: 'gameplay:land:miss',
  FALL: 'gameplay:fall',

  // 점수
  SCORE_UPDATE: 'score:update',
  FLOOR_UPDATE: 'floor:update',
  COMBO_UPDATE: 'combo:update',
  COMBO_BREAK: 'combo:break',
  NEW_RECORD: 'score:new_record',

  // 재화
  COIN_COLLECT: 'currency:coin',
  DIAMOND_COLLECT: 'currency:diamond',

  // UI
  POPUP_OPEN: 'ui:popup:open',
  POPUP_CLOSE: 'ui:popup:close',
  TOAST_SHOW: 'ui:toast:show',

  // 설정
  SOUND_TOGGLE: 'settings:sound',
  MUSIC_TOGGLE: 'settings:music',
} as const;
