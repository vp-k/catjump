/**
 * 튜토리얼 설정
 */

export type TutorialStep = 'tap_to_jump' | 'land_on_can' | 'perfect_zone' | 'combo_explain';

export interface TutorialStepConfig {
  id: TutorialStep;
  titleKo: string;
  descriptionKo: string;
  showArrow: boolean;
  arrowTarget?: 'cat' | 'can' | 'center';
  highlightArea?: { x: number; y: number; width: number; height: number };
  autoAdvanceCondition?: 'tap' | 'land' | 'perfect' | 'combo';
  forceWait?: number; // ms
}

export const TUTORIAL_STEPS: TutorialStepConfig[] = [
  {
    id: 'tap_to_jump',
    titleKo: '점프하기',
    descriptionKo: '화면을 터치하면\n고양이가 점프해요!',
    showArrow: true,
    arrowTarget: 'cat',
    autoAdvanceCondition: 'tap',
  },
  {
    id: 'land_on_can',
    titleKo: '캔 위에 착지',
    descriptionKo: '움직이는 캔 위에\n착지하세요!',
    showArrow: true,
    arrowTarget: 'can',
    autoAdvanceCondition: 'land',
  },
  {
    id: 'perfect_zone',
    titleKo: 'Perfect 존',
    descriptionKo: '캔 중앙에 착지하면\nPerfect!\n더 많은 점수를 얻어요',
    showArrow: false,
    autoAdvanceCondition: 'perfect',
  },
  {
    id: 'combo_explain',
    titleKo: '콤보 시스템',
    descriptionKo: '연속으로 착지하면\n콤보 보너스!\n높은 점수를 노려보세요',
    showArrow: false,
    autoAdvanceCondition: 'combo',
    forceWait: 2000,
  },
];

export const TUTORIAL_CONFIG = {
  // 튜토리얼 자동 스킵 조건
  AUTO_SKIP_FLOOR: 5,

  // 딤 배경 투명도
  DIM_ALPHA: 0.35,

  // 애니메이션 속도
  FADE_DURATION: 300,

  // 화살표 흔들림 속도
  ARROW_BOUNCE_SPEED: 500,
} as const;
