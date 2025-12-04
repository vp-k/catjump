/**
 * 에너지(생명) 시스템 설정
 */

export const ENERGY_CONFIG = {
  // 기본 설정
  MAX_ENERGY: 5, // 최대 에너지
  INITIAL_ENERGY: 5, // 시작 에너지

  // 회복
  RECOVERY_TIME_MINUTES: 20, // 1개 회복 시간 (분)
  RECOVERY_TIME_MS: 20 * 60 * 1000, // 밀리초

  // 획득 방법
  AD_REWARD_ENERGY: 1, // 광고 시청 보상
  COIN_PURCHASE_COST: 50, // 에너지 1개 구매 비용 (코인)
  COIN_PURCHASE_AMOUNT: 1, // 코인으로 구매 시 획득량

  // 풀 에너지 구매 (다이아몬드)
  FULL_REFILL_DIAMOND_COST: 10, // 풀 충전 비용 (다이아몬드)

  // 알림
  FULL_ENERGY_NOTIFICATION: true, // 에너지 가득 참 알림
  LOW_ENERGY_THRESHOLD: 1, // 에너지 부족 경고 임계값
};
