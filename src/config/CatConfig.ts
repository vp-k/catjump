/**
 * 고양이 캐릭터 설정
 */

export interface CatData {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price: number;
  currency: 'coins' | 'diamonds';
  color: number; // 플레이스홀더 색상
  abilities?: CatAbility[];
}

export interface CatAbility {
  type: 'combo_bonus' | 'coin_bonus' | 'second_chance' | 'perfect_zone';
  value: number;
  description: string;
}

export const CAT_DATA: Record<string, CatData> = {
  default: {
    id: 'default',
    name: 'Russian Blue',
    nameKo: '러시안 블루',
    description: '차분하고 영리한 기본 고양이',
    rarity: 'common',
    price: 0,
    currency: 'coins',
    color: 0x6b7b8c,
  },
  orange: {
    id: 'orange',
    name: 'Orange Tabby',
    nameKo: '치즈냥',
    description: '활발하고 친근한 주황색 고양이',
    rarity: 'common',
    price: 500,
    currency: 'coins',
    color: 0xffa500,
    abilities: [
      {
        type: 'coin_bonus',
        value: 0.1,
        description: '코인 획득 +10%',
      },
    ],
  },
  black: {
    id: 'black',
    name: 'Black Cat',
    nameKo: '까망이',
    description: '행운을 가져다주는 검은 고양이',
    rarity: 'rare',
    price: 1500,
    currency: 'coins',
    color: 0x2d2d2d,
    abilities: [
      {
        type: 'combo_bonus',
        value: 0.15,
        description: '콤보 점수 +15%',
      },
    ],
  },
  white: {
    id: 'white',
    name: 'Persian',
    nameKo: '페르시안',
    description: '우아하고 고귀한 흰색 고양이',
    rarity: 'rare',
    price: 2000,
    currency: 'coins',
    color: 0xf5f5f5,
    abilities: [
      {
        type: 'perfect_zone',
        value: 0.1,
        description: 'Perfect 존 +10%',
      },
    ],
  },
  calico: {
    id: 'calico',
    name: 'Calico',
    nameKo: '삼색이',
    description: '세 가지 행운을 가진 삼색 고양이',
    rarity: 'epic',
    price: 100,
    currency: 'diamonds',
    color: 0xf4a460,
    abilities: [
      {
        type: 'coin_bonus',
        value: 0.2,
        description: '코인 획득 +20%',
      },
      {
        type: 'combo_bonus',
        value: 0.1,
        description: '콤보 점수 +10%',
      },
    ],
  },
  golden: {
    id: 'golden',
    name: 'Golden Cat',
    nameKo: '황금냥',
    description: '전설의 황금 고양이',
    rarity: 'legendary',
    price: 500,
    currency: 'diamonds',
    color: 0xffd700,
    abilities: [
      {
        type: 'coin_bonus',
        value: 0.5,
        description: '코인 획득 +50%',
      },
      {
        type: 'second_chance',
        value: 1,
        description: '부활 1회 무료',
      },
    ],
  },
  nyan: {
    id: 'nyan',
    name: 'Nyan Cat',
    nameKo: '냥캣',
    description: '무지개를 타고 달리는 전설의 고양이',
    rarity: 'legendary',
    price: 1000,
    currency: 'diamonds',
    color: 0xff69b4,
    abilities: [
      {
        type: 'perfect_zone',
        value: 0.2,
        description: 'Perfect 존 +20%',
      },
      {
        type: 'combo_bonus',
        value: 0.25,
        description: '콤보 점수 +25%',
      },
    ],
  },
};

/**
 * 희귀도별 색상
 */
export const RARITY_COLORS: Record<string, number> = {
  common: 0x9ca3af,
  rare: 0x3b82f6,
  epic: 0xa855f7,
  legendary: 0xfbbf24,
};

/**
 * 희귀도별 이름
 */
export const RARITY_NAMES: Record<string, string> = {
  common: '일반',
  rare: '레어',
  epic: '에픽',
  legendary: '전설',
};

/**
 * 모든 고양이 ID 목록
 */
export const ALL_CAT_IDS = Object.keys(CAT_DATA);

/**
 * 고양이 데이터 가져오기
 */
export function getCatData(catId: string): CatData | undefined {
  return CAT_DATA[catId];
}

/**
 * 고양이 능력치 계산
 */
export function getCatAbilityValue(
  catId: string,
  abilityType: CatAbility['type']
): number {
  const cat = CAT_DATA[catId];
  if (!cat?.abilities) return 0;

  const ability = cat.abilities.find((a) => a.type === abilityType);
  return ability?.value ?? 0;
}
