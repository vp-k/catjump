# Cat Jump: Tower Stack - 시스템 아키텍처 분석

**문서 버전**: 1.1
**작성일**: 2025-11-27
**최종 수정**: 2025-11-27
**기반 기획서**: game-design.md v1.6.2

---

## 목차

1. [시스템 아키텍처 개요](#시스템-아키텍처-개요)
2. [코어 게임 시스템](#1-코어-게임-시스템)
   - 1.1 점프/착지 메카닉
   - 1.2 스코어링/콤보 시스템
   - 1.3 캐릭터 시스템
   - 1.4 캔 스포너 시스템
   - 1.5 오디오 시스템
   - 1.6 튜토리얼/FTUE 시스템
   - 1.7 접근성 시스템
   - 1.8 현지화 시스템
   - 1.9 법적 준수 시스템
   - 1.10 동적 이벤트 시스템
   - 1.11 마스터 모드 시스템
   - 1.12 바이럴/공유 시스템
   - 1.13 커뮤니티 목표 시스템
3. [경제 시스템](#2-경제-시스템)
4. [진행 시스템](#3-진행-시스템)
5. [소셜 시스템](#4-소셜-시스템)
6. [리텐션 시스템](#5-리텐션-시스템)
7. [수익화 시스템](#6-수익화-시스템)
8. [가챠/랜덤 시스템](#7-가챠랜덤-시스템)
9. [데이터/분석 시스템](#8-데이터분석-시스템)
10. [백엔드 아키텍처](#9-백엔드-아키텍처)
11. [상태 관리 시스템](#10-상태-관리-시스템)
12. [심리 엔진 시스템](#11-심리-엔진-시스템)
13. [시스템 의존성 다이어그램](#시스템-의존성-다이어그램)
14. [데이터 모델 개요](#데이터-모델-개요)
15. [구현 로드맵](#구현-로드맵)

---

## 시스템 아키텍처 개요

### 전체 시스템 구조

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Phaser 3 │  │ UI/UX    │  │ Local    │              │
│  │ Engine   │  │ System   │  │ Storage  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
├─────────────────────────────────────────────────────────┤
│                   Service Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Firebase │  │ AdMob    │  │ IAP      │              │
│  │ Services │  │ Ads      │  │ Billing  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
├─────────────────────────────────────────────────────────┤
│                   Backend Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │Firestore │  │ Cloud    │  │Analytics │              │
│  │ Database │  │Functions │  │ Engine   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

### 시스템 분류 요약

| 카테고리 | 시스템 개수 | 복잡도 | 우선순위 |
|---------|------------|--------|---------|
| 코어 게임플레이 | 8 | High | P0 |
| 음향 시스템 | 3 | Medium | P0 |
| 튜토리얼/FTUE | 2 | Medium | P0 |
| 경제 시스템 | 4 | Medium | P0 |
| 진행 시스템 | 6 | High | P1 |
| 소셜 시스템 | 6 | High | P1 |
| 리텐션 시스템 | 7 | Medium | P0 |
| 수익화 시스템 | 6 | High | P0 |
| 가챠/랜덤 시스템 | 4 | Medium | P1 |
| 데이터/분석 시스템 | 5 | Medium | P1 |
| 백엔드 시스템 | 4 | High | P0 |
| 심리 엔진 | 8 | High | P1 |
| 접근성/현지화 | 4 | Medium | P0 |
| 동적 이벤트 | 3 | Medium | P1 |
| 법적 준수 | 2 | Low | P0 |

---

## 1. 코어 게임 시스템

### 1.1 점프/착지 메카닉

#### Jump Mechanics System
- **복잡도**: Medium
- **위치**: Client
- **의존성**: Physics Engine, Input Manager
- **우선순위**: P0

**주요 데이터**:
```typescript
interface JumpConfig {
  jumpVelocity: number;        // -500 px/s
  gravity: number;             // 800 px/s²
  maxHeight: number;           // ~156 px
  timeToApex: number;          // ~625 ms
  jumpType: 'fixed';           // 고정 점프
}
```

**구현 노트**:
- Phaser 3 Arcade Physics 사용
- 터치/클릭 입력 → 즉시 점프 (고정 높이)
- 중력과 점프력 밸런싱 중요

---

#### Landing Detection System
- **복잡도**: High
- **위치**: Client
- **의존성**: Physics Engine, Scoring System
- **우선순위**: P0

**주요 데이터**:
```typescript
interface LandingJudgment {
  type: 'Perfect' | 'Good' | 'Miss';
  position: number;           // 착지 위치 (0-1)
  canCenter: number;          // 캔 중심 좌표
  score: number;              // 획득 점수
  combo: boolean;             // 콤보 유지 여부
}

interface ZoneConfig {
  perfectZone: 0.5;           // 캔 중심 50%
  goodZoneLeft: 0.25;         // 좌측 25%
  goodZoneRight: 0.25;        // 우측 25%
}
```

**구현 노트**:
- 픽셀 단위 충돌 검사
- Perfect 존 50% (기획서 v1.3 완화)
- Near-Miss 감지 (1px 차이)
- 슬로우 모션 효과 연출

---

### 1.2 점수 시스템

#### Scoring Engine
- **복잡도**: High
- **위치**: Client + Server (검증)
- **의존성**: Landing Detection, Combo System, Floor Multiplier
- **우선순위**: P0

**주요 데이터**:
```typescript
interface ScoreCalculation {
  baseScore: number;          // Perfect: 25, Good: 10
  canMultiplier: number;      // 특수 캔 배율 (황금캔: 3x)
  comboMultiplier: number;    // 콤보 배율 (최대 4x)
  floorMultiplier: number;    // 층수 배율 (0-10층: 1x, 51+층: 3x)
  finalScore: number;         // 최종 점수
}

// 최종 점수 = 기본 점수 × 캔 배율 × 콤보 배율 × 층수 배율
```

**구현 노트**:
- 클라이언트에서 즉시 계산 (UI 반응성)
- 서버에서 검증 (치트 방지)
- 점수 팝업 애니메이션

---

### 1.3 난이도 시스템

#### Difficulty Curve System
- **복잡도**: High
- **위치**: Client
- **의존성**: Floor Counter, Can Spawner
- **우선순위**: P0

**주요 데이터**:
```typescript
interface DifficultyTier {
  floorRange: [number, number];
  speedMultiplier: number;    // 1.0x (쉬움) → 0.6x (어려움)
  canComposition: {
    normal: number;
    golden: number;
    wide: number;
    gift: number;
    narrow: number;
    shake: number;
  };
  directionChangeRate: number; // 0% → 70%
}

// 9개 티어 (0-4층, 5-9층, ..., 50+층)
```

**구현 노트**:
- 속도 배율 낮을수록 빠름 (주의!)
- 캔 구성 확률 동적 변경
- 부드러운 난이도 전환

---

### 1.4 특수 캔 시스템

#### Can Type System
- **복잡도**: Medium
- **위치**: Client
- **의존성**: Difficulty System, Reward System
- **우선순위**: P0

**주요 데이터**:
```typescript
enum CanType {
  NORMAL = 'normal',
  GOLDEN = 'golden',        // 코인 3배
  WIDE = 'wide',            // 착지 쉬움, 점수 절반
  GIFT = 'gift',            // 랜덤 보상
  NARROW = 'narrow',        // 착지 어려움, 점수 2배
  SHAKE = 'shake',          // 좌우 흔들림
  FAKE = 'fake',            // 60층+, 사라짐
  INVISIBLE = 'invisible',  // 70층+, 투명
  REVERSE = 'reverse',      // 80층+, 반전 이동
}

interface CanConfig {
  type: CanType;
  scaleX: number;           // 너비 배율
  scaleY: number;           // 높이 배율
  scoreMultiplier: number;  // 점수 배율
  coinMultiplier: number;   // 코인 배율
  tint?: number;            // 색상 (황금캔: 0xFFD700)
  animation?: string;       // 애니메이션 (흔들림 등)
}
```

**구현 노트**:
- Object Pooling으로 성능 최적화
- Tween 애니메이션 (흔들캔)
- 특수 효과 (파티클, 발광)

---

### 1.5 콤보 시스템

#### Combo Engine
- **복잡도**: High
- **위치**: Client
- **의존성**: Landing Detection, Visual Feedback
- **우선순위**: P0

**주요 데이터**:
```typescript
interface ComboState {
  currentCombo: number;      // 현재 콤보
  maxCombo: number;          // 최대 콤보 (세션)
  multiplier: number;        // 점수 배율
  isBroken: boolean;         // 콤보 끊김 여부
}

interface ComboTier {
  count: number;
  multiplier: number;
  message: string;
  effect: string;
}

// v1.3 규칙:
// - Perfect 착지: 콤보 증가
// - Good 착지: 콤보 유지 (증가 X)
// - Miss 착지: 콤보 리셋
```

**구현 노트**:
- 간식 탑 시각화 (콤보 쌓일 때)
- 콤보 끊김 시 탑 붕괴 애니메이션
- 콤보 메시지 UI ("Nice!", "Amazing!" 등)

---

### 1.6 보스 캔 시스템

#### Boss Can System
- **복잡도**: Medium
- **위치**: Client
- **의존성**: Floor Counter, Reward System
- **우선순위**: P1

**주요 데이터**:
```typescript
interface BossCan {
  floor: number;             // 25, 50, 75, 100
  name: string;              // "참치 킹", "황금 킹" 등
  scaleMultiplier: number;   // 크기 배율
  difficulty: number;        // 난이도 (좁기, 흔들림)
  reward: {
    coins: number;
    diamonds?: number;
    items?: string[];
  };
}
```

**구현 노트**:
- 보스 캔 등장 전 경고 UI
- 특별 BGM 전환
- 클리어 시 화려한 연출

---

### 1.7 물리 엔진

#### Physics System
- **복잡도**: Medium
- **위치**: Client (Phaser 3 Arcade Physics)
- **의존성**: 없음 (독립 시스템)
- **우선순위**: P0

**구현 노트**:
- Arcade Physics (경량, 2D 게임에 적합)
- 충돌 감지 (고양이 ↔ 캔)
- 중력 시뮬레이션
- 성능 예산: 60 FPS 유지

---

### 1.8 캔 스포너 시스템

#### Can Spawner
- **복잡도**: High
- **위치**: Client
- **의존성**: Difficulty System, Object Pool
- **우선순위**: P0

**주요 데이터**:
```typescript
interface SpawnConfig {
  spawnInterval: number;     // 캔 생성 간격
  moveSpeed: number;         // 이동 속도
  direction: -1 | 1;         // 이동 방향
  canType: CanType;          // 캔 타입
}
```

**구현 노트**:
- Object Pooling (캔 재사용)
- 난이도 기반 확률 선택
- 화면 밖 캔 자동 제거

---

## 1.5 음향 시스템 (Audio System) - v1.1 추가

### 1.5.1 SFX 관리 시스템

#### Sound Effects Manager
- **복잡도**: Medium
- **위치**: Client
- **의존성**: Game Events, Landing System, Combo System
- **우선순위**: P0

**주요 데이터**:
```typescript
interface SFXManager {
  // 게임플레이 SFX
  gameplay: {
    jump: AudioSprite;           // "뿅" 경쾌한 효과음
    perfectLand: AudioSprite;    // "띵!" 밝은 효과음
    goodLand: AudioSprite;       // "톡" 부드러운 착지음
    missLand: AudioSprite;       // "툭" 낮은 착지음
    fall: AudioSprite;           // "슉~" 낙하음
  };

  // 콤보 SFX
  combo: {
    comboUp: AudioSprite;        // 상승 음계 (피치 +50 cents/콤보)
    comboBroken: AudioSprite;    // "뚝" 낮은 효과음
    comboMilestone: AudioSprite; // "빠밤!" (5, 10, 20 콤보)
  };

  // 보상 SFX
  reward: {
    coinCollect: AudioSprite;    // "찰랑" 코인 소리
    diamondCollect: AudioSprite; // "띠링~" 다이아 소리
    goldenCan: AudioSprite;      // "반짝" 황금캔 획득
    giftCan: AudioSprite;        // "딩동" 선물캔 획득
  };

  // 기록 SFX
  record: {
    nearRecord: AudioSprite;     // 심장박동 (BPM 증가: 80→120)
    newRecord: AudioSprite;      // "빠밤!" 팡파레 (3초)
    gameOver: AudioSprite;       // "미야옹~" 고양이 소리
  };

  // UI SFX
  ui: {
    buttonClick: AudioSprite;    // "톡" 버튼 클릭
    menuOpen: AudioSprite;       // "스르륵" 메뉴 열림
    purchase: AudioSprite;       // "챠링" 구매 완료
    levelUp: AudioSprite;        // "레벨업!" 상승음
  };
}

interface AudioSprite {
  key: string;
  start: number;     // ms
  duration: number;  // ms
  volume: number;    // 0-1
  pitch?: number;    // 1.0 = 기본
}
```

**구현 노트**:
- 모든 SFX는 1개 AudioSprite 파일로 번들링 (로딩 최적화)
- WebM/AAC 포맷, 96kbps mono
- 총 메모리: <3MB

---

### 1.5.2 BGM 관리 시스템

#### Background Music Manager
- **복잡도**: Medium
- **위치**: Client
- **의존성**: Game State, Floor System
- **우선순위**: P0

**주요 데이터**:
```typescript
interface BGMManager {
  tracks: {
    mainMenu: BGMTrack;          // 80-90 BPM, 로파이 재즈, 루프
    gameplay_0_20: BGMTrack;     // 110-120 BPM, 밝은 일렉트로닉
    gameplay_20_40: BGMTrack;    // 130-140 BPM, 텐션 상승
    gameplay_40plus: BGMTrack;   // 150+ BPM, 고조된 느낌
    catHouse: BGMTrack;          // 70-80 BPM, 어쿠스틱/로파이
    shop: BGMTrack;              // 90 BPM, 펑키
    victory: BGMTrack;           // 팡파레 (3초, 비루프)
  };

  // 동적 전환
  transition: {
    crossfadeDuration: 1000;     // ms
    floorThresholds: [20, 40];   // 층수별 BGM 전환
  };

  // 보스 캔 BGM
  bossBGM: {
    warning: BGMTrack;           // "두근두근" 2초 경고음
    battle: BGMTrack;            // 보스 전용 BGM
    victory: BGMTrack;           // 보스 클리어 팡파레
  };
}

interface BGMTrack {
  key: string;
  bpm: number;
  loop: boolean;
  volume: number;
  fadeIn: number;      // ms
  fadeOut: number;     // ms
}
```

**층수별 BGM 전환 로직**:
```typescript
function updateBGM(floor: number): void {
  if (floor < 20) {
    crossfadeTo('gameplay_0_20');
  } else if (floor < 40) {
    crossfadeTo('gameplay_20_40');
  } else {
    crossfadeTo('gameplay_40plus');
  }
}
```

**구현 노트**:
- 128kbps stereo, WebM/AAC
- 크로스페이드 전환 (1초)
- 층수 기반 자동 전환
- 총 메모리: <7MB

---

### 1.5.3 음향 설정 시스템

#### Audio Settings System
- **복잡도**: Low
- **위치**: Client (LocalStorage)
- **의존성**: Settings UI, Audio Manager
- **우선순위**: P0

**주요 데이터**:
```typescript
interface AudioSettings {
  bgmVolume: number;       // 0-1, 기본 0.7
  sfxVolume: number;       // 0-1, 기본 1.0
  bgmEnabled: boolean;     // 기본 true
  sfxEnabled: boolean;     // 기본 true
  hapticEnabled: boolean;  // 기본 true (진동 연동)
}

// 저장 위치
localStorage.setItem('audioSettings', JSON.stringify(settings));
```

**플랫폼별 처리**:
```typescript
interface PlatformAudio {
  web: {
    autoplayPolicy: 'user-gesture-required';  // Chrome 정책
    firstTouchInit: true;                     // 첫 터치 후 음향 시작
  };
  ios: {
    silentMode: 'respect';                    // 무음 모드 존중
    audioSession: 'ambient';                  // 다른 앱 음악과 공존
  };
  android: {
    focusHandling: 'duck';                    // 알림 시 볼륨 낮춤
  };
}
```

**성능 예산**:
```typescript
interface AudioBudget {
  totalMemory: '<10MB';
  sfxSprite: '<3MB';
  bgmTracks: '<7MB';
  format: 'WebM (primary), AAC (fallback)';
  compression: {
    sfx: '96kbps mono';
    bgm: '128kbps stereo';
  };
  maxConcurrent: {
    sfx: 8;      // 동시 SFX 최대 8개
    bgm: 1;      // BGM은 항상 1개
  };
}
```

---

## 1.6 튜토리얼/FTUE 시스템 (Tutorial System) - v1.1 추가

### 1.6.1 튜토리얼 웨이브 시스템

#### Tutorial Wave Manager
- **복잡도**: Medium
- **위치**: Client
- **의존성**: Game State, Energy System, UI System
- **우선순위**: P0

**주요 데이터**:
```typescript
interface TutorialSystem {
  waves: TutorialWave[];
  currentWave: number;
  isActive: boolean;
  skipEnabled: boolean;
}

interface TutorialWave {
  id: number;
  name: string;
  jumpRange: [number, number];  // 점프 범위
  goal: string;                 // 학습 목표
  autoRescue: number;           // 자동 구조 횟수 (Infinity = 무제한)
  energyCost: number;           // 에너지 소모
  visualGuide: VisualGuide;     // 시각적 가이드
  completionCondition: () => boolean;
}

// 4단계 웨이브 정의
const TUTORIAL_WAVES: TutorialWave[] = [
  {
    id: 0,
    name: 'Wave 0: 점프 배우기',
    jumpRange: [1, 3],
    goal: '탭 = 점프',
    autoRescue: Infinity,
    energyCost: 0,
    visualGuide: {
      fingerAnimation: true,    // 👆 손가락 위아래
      highlightTapArea: true,
      message: '화면을 탭하면 점프해요!'
    },
    completionCondition: () => jumpCount >= 3
  },
  {
    id: 1,
    name: 'Wave 1: Perfect 착지',
    jumpRange: [4, 10],
    goal: 'Perfect 착지 체험',
    autoRescue: 3,
    energyCost: 0,
    visualGuide: {
      perfectZoneHighlight: true,  // 🎯 초록색 영역
      message: '초록색 구역에 착지하면 Perfect!'
    },
    completionCondition: () => perfectCount >= 1
  },
  {
    id: 2,
    name: 'Wave 2: 콤보 시스템',
    jumpRange: [11, 20],
    goal: '콤보 연결',
    autoRescue: 1,
    energyCost: 0,
    visualGuide: {
      comboCounterHighlight: true,  // 🔥 콤보 카운터
      message: '연속 성공하면 콤보! 점수 UP!'
    },
    completionCondition: () => maxCombo >= 3
  },
  {
    id: 3,
    name: 'Wave 3: 특수 캔',
    jumpRange: [21, 30],
    goal: '특수 캔 이해',
    autoRescue: 0,
    energyCost: 1,  // 실제 에너지 소모 시작
    visualGuide: {
      goldenCanIndicator: true,  // ⭐ "3x Coins!" 표시
      message: '황금캔은 코인 3배!'
    },
    completionCondition: () => goldenCanCollected >= 1
  }
];
```

**시각적 가이드**:
```typescript
interface VisualGuide {
  fingerAnimation?: boolean;       // 손가락 탭 애니메이션
  highlightTapArea?: boolean;      // 탭 영역 하이라이트
  perfectZoneHighlight?: boolean;  // Perfect 존 초록색 강조
  comboCounterHighlight?: boolean; // 콤보 카운터 강조
  goldenCanIndicator?: boolean;    // 황금캔 "3x!" 표시
  arrowPointer?: { x: number, y: number };  // 화살표 포인터
  message: string;                 // 튜토리얼 메시지
}
```

**구현 노트**:
- Wave 0-2: 에너지 소모 없음 (온보딩 장벽 제거)
- Wave 3: 첫 에너지 소모 + 실제 게임 시작
- 5초 무입력 시 "Skip Tutorial?" 버튼 표시
- 튜토리얼 완료 시 +2 생명 보너스 (총 7/5)

---

### 1.6.2 FTUE 상태 관리

#### First-Time User Experience State
- **복잡도**: Low
- **위치**: Client (LocalStorage) + Server (선택적)
- **의존성**: Tutorial System, Analytics
- **우선순위**: P0

**주요 데이터**:
```typescript
interface FTUEState {
  tutorialComplete: boolean;       // 튜토리얼 완료 여부
  currentWave: number;             // 현재 웨이브 (0-3)
  waveProgress: WaveProgress[];    // 웨이브별 진행도
  skipUsed: boolean;               // 스킵 사용 여부
  completionTime: number;          // 완료 소요 시간 (분석용)
  bonusRewarded: boolean;          // +2 생명 보너스 지급 여부
}

interface WaveProgress {
  waveId: number;
  started: boolean;
  completed: boolean;
  attempts: number;
  timeSpent: number;  // ms
}

// 저장 위치
localStorage.setItem('ftueState', JSON.stringify(state));
```

**퍼널 추적 이벤트**:
```typescript
// 튜토리얼 퍼널 분석용 이벤트
const FTUE_EVENTS = {
  TUTORIAL_START: 'tutorial_start',
  WAVE_START: 'wave_start',
  WAVE_COMPLETE: 'wave_complete',
  TUTORIAL_SKIP: 'tutorial_skip',
  TUTORIAL_COMPLETE: 'tutorial_complete',
  TUTORIAL_DROP: 'tutorial_drop'  // 튜토리얼 중 이탈
};

// 목표 퍼널 전환율
const TARGET_FUNNEL = {
  wave0_to_wave1: 0.95,  // 95%
  wave1_to_wave2: 0.90,  // 90%
  wave2_to_wave3: 0.85,  // 85%
  wave3_to_complete: 0.80 // 80%
};
```

**구현 노트**:
- 튜토리얼 중 앱 종료 시 → 재진입 시 현재 웨이브부터 재개
- Skip 사용 시에도 기본 보상 지급 (이탈 방지)
- 튜토리얼 완료 후 `tutorialComplete = true` → 재표시 안 함

---

## 1.7 접근성 시스템 (Accessibility System) - v1.1 추가

### 1.7.1 시각 접근성

#### Visual Accessibility Manager
- **복잡도**: Medium
- **위치**: Client
- **의존성**: UI System, Settings
- **우선순위**: P0

**주요 데이터**:
```typescript
interface VisualAccessibility {
  colorblindMode: ColorblindMode;
  highContrastMode: boolean;
  largeFontMode: boolean;
  reducedMotion: boolean;
}

type ColorblindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

// 색맹 모드별 색상 매핑
const COLORBLIND_PALETTES: Record<ColorblindMode, ColorPalette> = {
  none: {
    perfect: '#00FF00',    // 녹색
    good: '#FFFF00',       // 노란색
    miss: '#FF0000',       // 빨간색
    golden: '#FFD700',     // 금색
    danger: '#FF4444'      // 위험
  },
  protanopia: {  // 적색맹
    perfect: '#00BFFF',    // 하늘색
    good: '#FFFF00',       // 노란색
    miss: '#0000FF',       // 파란색
    golden: '#FFD700',
    danger: '#0000FF'
  },
  deuteranopia: {  // 녹색맹
    perfect: '#00BFFF',
    good: '#FFFF00',
    miss: '#FF00FF',       // 마젠타
    golden: '#FFD700',
    danger: '#FF00FF'
  },
  tritanopia: {  // 청색맹
    perfect: '#00FF00',
    good: '#FF6600',       // 주황색
    miss: '#FF0000',
    golden: '#FFD700',
    danger: '#FF0000'
  }
};
```

**고대비 모드**:
```typescript
interface HighContrastConfig {
  backgroundColor: '#000000';  // 순수 검정
  foregroundColor: '#FFFFFF';  // 순수 흰색
  accentColor: '#FFFF00';      // 노란색 강조
  borderWidth: 2;              // 테두리 두께 2배
  shadowEnabled: false;        // 그림자 제거
}
```

**큰 글꼴 모드**:
```typescript
interface LargeFontConfig {
  scaleFactor: 1.5;            // 150% 확대
  minFontSize: 18;             // 최소 18px
  lineHeightMultiplier: 1.4;   // 줄간격 140%
}
```

---

### 1.7.2 입력 접근성

#### Input Accessibility Manager
- **복잡도**: Low
- **위치**: Client
- **의존성**: Input System
- **우선순위**: P0

**주요 데이터**:
```typescript
interface InputAccessibility {
  // 햅틱 피드백
  haptic: {
    enabled: boolean;
    perfectVibration: 50;    // ms
    goodVibration: 30;       // ms
    missVibration: 100;      // ms (길고 약하게)
    comboVibration: 20;      // ms (짧고 강하게)
  };

  // 원핸드 모드
  oneHandMode: {
    enabled: boolean;
    preferredHand: 'left' | 'right';
    uiPosition: 'bottom-left' | 'bottom-right';
  };

  // 터치 영역 확대
  touchTarget: {
    minSize: 44;             // 최소 44x44px (Apple HIG)
    expandedHitArea: 8;      // 히트박스 8px 확장
  };
}
```

**플랫폼별 햅틱 구현**:
```typescript
function triggerHaptic(type: 'perfect' | 'good' | 'miss' | 'combo'): void {
  if (!settings.haptic.enabled) return;

  const duration = settings.haptic[`${type}Vibration`];

  if (isIOS()) {
    // iOS: UIImpactFeedbackGenerator
    window.webkit?.messageHandlers?.haptic?.postMessage({ type, duration });
  } else if (isAndroid()) {
    // Android: Vibrator API
    navigator.vibrate?.(duration);
  }
  // Web: Vibration API (지원 시)
}
```

---

## 1.8 현지화 시스템 (Localization System) - v1.1 추가

### 1.8.1 다국어 지원

#### i18n Manager
- **복잡도**: Medium
- **위치**: Client
- **의존성**: UI System
- **우선순위**: P0

**주요 데이터**:
```typescript
interface LocalizationSystem {
  currentLocale: SupportedLocale;
  fallbackLocale: 'en';
  translations: Record<SupportedLocale, TranslationMap>;
}

type SupportedLocale = 'ko' | 'en' | 'ja' | 'zh-CN';

interface TranslationMap {
  [key: string]: string;
}

// 번역 키 예시
const TRANSLATION_KEYS = {
  // 게임플레이
  'game.perfect': { ko: 'Perfect!', en: 'Perfect!', ja: 'パーフェクト!', 'zh-CN': '完美!' },
  'game.combo': { ko: '콤보', en: 'Combo', ja: 'コンボ', 'zh-CN': '连击' },
  'game.newRecord': { ko: '신기록!', en: 'New Record!', ja: '新記録!', 'zh-CN': '新纪录!' },

  // UI
  'ui.play': { ko: '플레이', en: 'Play', ja: 'プレイ', 'zh-CN': '开始' },
  'ui.shop': { ko: '상점', en: 'Shop', ja: 'ショップ', 'zh-CN': '商店' },
  'ui.settings': { ko: '설정', en: 'Settings', ja: '設定', 'zh-CN': '设置' },

  // 시스템
  'system.energy': { ko: '에너지', en: 'Energy', ja: 'エネルギー', 'zh-CN': '能量' },
  'system.coin': { ko: '코인', en: 'Coins', ja: 'コイン', 'zh-CN': '金币' }
};
```

**문화권별 적응**:
```typescript
interface CulturalAdaptation {
  japan: {
    emphasis: 'かわいい (귀여움)';
    features: ['수집 요소 확대', '캐릭터 스토리'];
    colorPreference: '파스텔톤';
  };
  china: {
    emphasis: '행운/재물';
    features: ['럭키 넘버 강조', '빨간색 UI'];
    luckyNumbers: [8, 6, 9];
    avoidNumbers: [4];  // 죽음 연상
  };
  western: {
    emphasis: '경쟁/성취';
    features: ['리더보드 강조', '업적 시스템'];
    colorPreference: '비비드';
  };
}
```

**날짜/시간/통화 포맷**:
```typescript
interface LocaleFormat {
  dateFormat: {
    ko: 'YYYY년 MM월 DD일',
    en: 'MMM DD, YYYY',
    ja: 'YYYY年MM月DD日',
    'zh-CN': 'YYYY年MM月DD日'
  };
  currency: {
    ko: '₩{amount}',
    en: '${amount}',
    ja: '¥{amount}',
    'zh-CN': '¥{amount}'
  };
  numberFormat: {
    ko: { thousand: ',', decimal: '.' },
    en: { thousand: ',', decimal: '.' },
    ja: { thousand: ',', decimal: '.' },
    'zh-CN': { thousand: ',', decimal: '.' }
  };
}
```

---

## 1.9 법적 준수 시스템 (Compliance System) - v1.1 추가

### 1.9.1 COPPA/GDPR 컴플라이언스

#### Privacy Compliance Manager
- **복잡도**: Low
- **위치**: Client + Server
- **의존성**: Analytics, Ads, IAP
- **우선순위**: P0

**주요 데이터**:
```typescript
interface ComplianceSystem {
  // 데이터 수집 정책
  dataCollection: {
    collected: [
      'deviceId (익명화)',
      'gameProgress',
      'analyticsData (익명)'
    ];
    notCollected: [
      '이름', '이메일', '위치', '연락처', '사진', '생년월일'
    ];
  };

  // 광고 설정
  adsCompliance: {
    tagForChildDirectedTreatment: true;  // COPPA 준수
    personalizedAds: false;               // 맞춤형 광고 비활성화
    contentFilter: 'family-friendly';     // 가족 친화 콘텐츠만
    maxAdFrequency: 'limited';            // 광고 빈도 제한
  };

  // 동의 관리
  consent: {
    basicPlay: 'no-consent-required';     // 기본 플레이는 동의 불필요
    analytics: 'opt-out';                 // 분석은 옵트아웃 방식
    iap: 'parental-gate';                 // IAP는 보호자 게이트
  };

  // 스토어 등급
  storeRating: {
    ios: '4+';
    android: 'EVERYONE';
    pegi: '3';
  };
}

// 보호자 게이트 (IAP용)
interface ParentalGate {
  type: 'math-problem' | 'pin';
  mathProblem: {
    difficulty: 'adult-level';  // 예: "23 + 47 = ?"
    timeLimit: 30;              // 30초
  };
}
```

**구현 노트**:
- 앱 시작 시 개인정보 처리방침 링크 표시
- IAP 진입 전 보호자 게이트 필수
- 모든 분석 데이터는 익명화
- EU 지역: GDPR 배너 표시

---

## 1.10 동적 이벤트 시스템 (Dynamic Event System) - v1.1 추가

### 1.10.1 날씨/환경 시스템

#### Weather System
- **복잡도**: Medium
- **위치**: Client
- **의존성**: Rendering System, Particle System
- **우선순위**: P1

**주요 데이터**:
```typescript
interface WeatherSystem {
  currentWeather: WeatherType;
  transitionDuration: 3000;  // ms
}

type WeatherType = 'sunny' | 'rainy' | 'snowy' | 'night';

const WEATHER_CONFIG: Record<WeatherType, WeatherConfig> = {
  sunny: {
    probability: 0.70,
    particles: null,
    visualEffect: 'none',
    gameplayEffect: 'none'
  },
  rainy: {
    probability: 0.15,
    particles: {
      type: 'rain',
      count: 50,
      speed: 500,
      angle: 15  // 약간 기울어진 비
    },
    visualEffect: 'wet-can-texture',
    gameplayEffect: 'slippery-indicator'  // 캔에 물방울 표시
  },
  snowy: {
    probability: 0.10,
    particles: {
      type: 'snowflake',
      count: 30,
      speed: 100,
      sway: true  // 좌우 흔들림
    },
    visualEffect: 'snow-on-can',
    gameplayEffect: 'none'
  },
  night: {
    probability: 0.05,
    particles: {
      type: 'star',
      count: 20,
      twinkle: true
    },
    visualEffect: 'dark-background',
    gameplayEffect: 'glowing-can'  // 캔 테두리 발광
  }
};
```

---

### 1.10.2 테마 스테이지 시스템

#### Theme Stage Manager
- **복잡도**: Medium
- **위치**: Client
- **의존성**: Floor System, Background System
- **우선순위**: P1

**주요 데이터**:
```typescript
interface ThemeStageSystem {
  stages: ThemeStage[];
  currentStage: number;
  transitionEffect: 'fade' | 'slide';
}

interface ThemeStage {
  floorRange: [number, number];
  name: string;
  theme: string;
  background: BackgroundConfig;
  particles?: ParticleConfig;
  specialEffect?: string;
}

const THEME_STAGES: ThemeStage[] = [
  {
    floorRange: [1, 10],
    name: '거실',
    theme: '🏠',
    background: { type: 'indoor', parallax: true },
    particles: null
  },
  {
    floorRange: [11, 20],
    name: '정원',
    theme: '🌳',
    background: { type: 'garden', parallax: true },
    particles: { type: 'butterfly', count: 5 }
  },
  {
    floorRange: [21, 30],
    name: '옥상',
    theme: '🌅',
    background: { type: 'rooftop', parallax: true },
    specialEffect: 'wind-sway'  // 캔 미세하게 흔들림
  },
  {
    floorRange: [31, 40],
    name: '밤하늘',
    theme: '🌙',
    background: { type: 'night-sky', parallax: true },
    particles: { type: 'star', count: 30, twinkle: true }
  },
  {
    floorRange: [41, 50],
    name: '우주',
    theme: '🚀',
    background: { type: 'space', parallax: true },
    particles: { type: 'asteroid', count: 10 },
    specialEffect: 'low-gravity-visual'  // 시각적 효과만
  },
  {
    floorRange: [51, Infinity],
    name: '무지개',
    theme: '🌈',
    background: { type: 'fantasy', parallax: true },
    particles: { type: 'sparkle', count: 20 },
    specialEffect: 'random-theme-mix'  // 랜덤 테마 요소 혼합
  }
];
```

---

### 1.10.3 미니 이벤트 시스템

#### Mini Event Manager
- **복잡도**: Medium
- **위치**: Client
- **의존성**: Game Events, Reward System
- **우선순위**: P1

**주요 데이터**:
```typescript
interface MiniEventSystem {
  activeEvent: MiniEvent | null;
  eventQueue: MiniEvent[];
  cooldown: number;  // ms
}

interface MiniEvent {
  type: MiniEventType;
  trigger: EventTrigger;
  duration: number;      // ms
  effect: () => void;
  endEffect: () => void;
  visualIndicator: string;
}

type MiniEventType = 'coinRush' | 'slowMotion' | 'doubleJump' | 'magnetMode';

const MINI_EVENTS: Record<MiniEventType, MiniEventConfig> = {
  coinRush: {
    trigger: { type: 'random', probability: 0.05 },
    duration: 10000,
    effect: 'coin-particle-explosion',
    reward: 'coins-rain-from-sky',
    visualIndicator: '💰 Coin Rush!'
  },
  slowMotion: {
    trigger: { type: 'combo', condition: 'perfect-3-consecutive' },
    duration: 3000,
    effect: 'time-scale-0.5',
    visualIndicator: '🐌 Slow Mo!'
  },
  doubleJump: {
    trigger: { type: 'random', probability: 0.03 },
    duration: 5000,
    effect: 'enable-air-jump',
    visualIndicator: '🦘 Double Jump!'
  },
  magnetMode: {
    trigger: { type: 'lucky-event', linkedTo: 'Lucky Time' },
    duration: 15000,
    effect: 'auto-collect-nearby-coins',
    radius: 100,  // px
    visualIndicator: '🧲 Magnet!'
  }
};
```

---

## 1.11 마스터 모드 시스템 (Master Mode) - v1.1 추가

### 1.11.1 고급 캔 패턴

#### Advanced Can Pattern System
- **복잡도**: High
- **위치**: Client
- **의존성**: Can Spawner, Difficulty System
- **우선순위**: P1

**주요 데이터**:
```typescript
interface MasterModeSystem {
  unlockCondition: 'floor >= 50';
  advancedPatterns: AdvancedCanPattern[];
  rhythmMode: RhythmModeConfig;
}

interface AdvancedCanPattern {
  type: AdvancedCanType;
  unlockFloor: number;
  probability: number;
  difficulty: number;
  mechanic: string;
}

type AdvancedCanType =
  | 'DOUBLE'       // 이중 캔 (선택)
  | 'FAKE'         // 페이크 캔 (착지 직전 사라짐)
  | 'INVISIBLE'    // 투명 캔 (가장자리만 보임)
  | 'REVERSE'      // 역방향 캔 (좌우 반대 이동)
  | 'ACCELERATING' // 가속 캔 (점점 빨라짐)
  | 'SHRINKING';   // 수축 캔 (시간 지나면 작아짐)

const ADVANCED_PATTERNS: AdvancedCanPattern[] = [
  {
    type: 'DOUBLE',
    unlockFloor: 50,
    probability: 0.15,
    difficulty: 6,
    mechanic: '2개 캔 중 정확한 선택 필요'
  },
  {
    type: 'FAKE',
    unlockFloor: 60,
    probability: 0.10,
    difficulty: 7,
    mechanic: '착지 0.5초 전 사라짐 - 패턴 암기'
  },
  {
    type: 'INVISIBLE',
    unlockFloor: 70,
    probability: 0.08,
    difficulty: 8,
    mechanic: '가장자리만 희미하게 보임'
  },
  {
    type: 'REVERSE',
    unlockFloor: 80,
    probability: 0.06,
    difficulty: 8,
    mechanic: '이동 방향 반대 (화살표 힌트)'
  },
  {
    type: 'ACCELERATING',
    unlockFloor: 90,
    probability: 0.05,
    difficulty: 9,
    mechanic: '매초 10%씩 속도 증가'
  },
  {
    type: 'SHRINKING',
    unlockFloor: 100,
    probability: 0.04,
    difficulty: 10,
    mechanic: '5초 후 크기 50%로 축소'
  }
];
```

---

### 1.11.2 리듬 모드

#### Rhythm Mode System
- **복잡도**: High
- **위치**: Client
- **의존성**: BGM Manager, Can Spawner
- **우선순위**: P2

**주요 데이터**:
```typescript
interface RhythmModeConfig {
  enabled: boolean;
  bpmSync: boolean;
  beatWindow: number;  // ms (비트 허용 오차)
  bonusMultiplier: number;
}

const RHYTHM_CONFIG: RhythmModeConfig = {
  enabled: true,
  bpmSync: true,       // BGM 비트에 캔 이동 동기화
  beatWindow: 100,     // ±100ms 허용
  bonusMultiplier: 1.5 // 비트 매칭 시 점수 1.5배
};

interface RhythmFeedback {
  onBeat: {
    visual: 'screen-pulse';
    audio: 'beat-sfx';
    bonus: '+50% score';
  };
  comboRhythm: {
    threshold: 5;  // 5연속 비트 매칭
    reward: 'special-visual-effect';
  };
}
```

---

## 1.12 바이럴/공유 시스템 (Viral System) - v1.1 추가

### 1.12.1 공유 인센티브

#### Share Incentive Manager
- **복잡도**: Medium
- **위치**: Client + Server
- **의존성**: Social API, Reward System
- **우선순위**: P1

**주요 데이터**:
```typescript
interface ViralSystem {
  shareIncentives: ShareIncentive[];
  referralSystem: ReferralConfig;
  autoContentGeneration: AutoContentConfig;
}

interface ShareIncentive {
  action: ShareAction;
  reward: Reward;
  badge?: string;
  cooldown?: number;
}

type ShareAction =
  | 'first_share'
  | 'friend_invite'
  | 'install_via_link'
  | 'weekly_top10'
  | 'cumulative_10';

const SHARE_INCENTIVES: ShareIncentive[] = [
  {
    action: 'first_share',
    reward: { coins: 500 },
    badge: '소셜 버터플라이'
  },
  {
    action: 'friend_invite',
    reward: { coins: 1000, extraLives: 1 },  // 최대 3
    cooldown: 0  // 무제한
  },
  {
    action: 'install_via_link',
    reward: { luckyBox: 1 },  // 양쪽 모두
  },
  {
    action: 'weekly_top10',
    reward: { rareOutfit: 1 },
    badge: '공유왕'
  },
  {
    action: 'cumulative_10',
    reward: { legendaryOutfit: 1 },
    badge: '인플루언서'
  }
];
```

---

### 1.12.2 자동 콘텐츠 생성

#### Auto Content Generator
- **복잡도**: Medium
- **위치**: Client
- **의존성**: Recording System, UI System
- **우선순위**: P1

**주요 데이터**:
```typescript
interface AutoContentConfig {
  highlightVideo: {
    duration: 5;          // 초
    captureLastSeconds: 10; // 마지막 10초 중 하이라이트 추출
    platforms: ['Instagram', 'TikTok', 'YouTube Shorts'];
    resolution: '720p';
    fps: 30;
  };

  shareCard: {
    template: 'cat-with-score';
    elements: ['catSprite', 'score', 'floor', 'customMessage'];
    platforms: ['Twitter', 'Facebook', 'KakaoTalk', 'Line'];
    size: { width: 1200, height: 630 };  // OG Image 표준
  };

  challengeLink: {
    message: '내 기록 {score}점 깨볼래? 🔥';
    deepLink: true;
    expiresIn: '7d';
  };

  gifSticker: {
    catReaction: ['celebrate', 'sad', 'surprised'];
    format: 'GIF';
    size: { width: 200, height: 200 };
  };
}
```

---

## 1.13 커뮤니티 목표 시스템 (Community Goal) - v1.1 추가

### 1.13.1 글로벌 목표

#### Global Goal Manager
- **복잡도**: Medium
- **위치**: Server + Client
- **의존성**: Analytics, Reward System, Push System
- **우선순위**: P1

**주요 데이터**:
```typescript
interface CommunityGoalSystem {
  activeGoals: CommunityGoal[];
  completedGoals: CompletedGoal[];
  lastUpdate: timestamp;
}

interface CommunityGoal {
  id: string;
  type: 'global_tower' | 'weekly_challenge' | 'seasonal_event';
  target: number;
  currentProgress: number;
  reward: GlobalReward;
  startDate: timestamp;
  endDate: timestamp;
  milestones: Milestone[];
}

const COMMUNITY_GOALS: CommunityGoal[] = [
  {
    id: 'global_tower_1',
    type: 'global_tower',
    target: 100000000,  // 1억 층
    currentProgress: 0,
    reward: { diamonds: 100, toAll: true },
    milestones: [
      { at: 0.25, reward: { coins: 500 } },
      { at: 0.50, reward: { luckyBox: 1 } },
      { at: 0.75, reward: { diamonds: 50 } },
      { at: 1.00, reward: { diamonds: 100 } }
    ]
  },
  {
    id: 'weekly_avg_30',
    type: 'weekly_challenge',
    target: 30,  // 전체 유저 평균 30층
    currentProgress: 0,
    reward: { luckyBox: 1, toAll: true },
    startDate: 'every_monday_00:00',
    endDate: 'every_sunday_23:59'
  }
];

interface GlobalReward {
  coins?: number;
  diamonds?: number;
  luckyBox?: number;
  toAll: boolean;  // 모든 유저에게 지급
}
```

**UI 표시**:
```typescript
interface CommunityGoalUI {
  progressBar: {
    type: 'horizontal';
    showPercentage: true;
    showMilestones: true;
    realtime: true;  // 실시간 업데이트
  };
  notification: {
    onMilestone: 'toast + animation';
    onComplete: 'full-screen celebration + push';
  };
  offlineReward: {
    claimOnLogin: true;
    message: '커뮤니티 목표 달성! 보상을 받으세요!';
  };
}
```

---

## 2. 경제 시스템

### 2.1 코인 시스템

#### Coin Economy
- **복잡도**: Medium
- **위치**: Client + Server
- **의존성**: Scoring System, Shop System
- **우선순위**: P0

**주요 데이터**:
```typescript
interface CoinEarning {
  perfect: 5;                // Perfect 착지
  good: 2;                   // Good 착지
  floorBonus: {              // 층수 보너스
    10: 50,
    20: 100,
    30: 200,
    50: 500,
  };
  goldenCan: 15;             // 황금캔 (3배)
  dailyLogin: 100-500;       // 일일 로그인
  dailyMission: 50-200;      // 미션 완료
  offlineReward: 50-1000;    // 오프라인 보상
}

interface CoinSpending {
  basicCostume: 500;
  rareCostume: 2000;
  epicCostume: 5000;
  basicCat: 3000;
  rareCat: 8000;
  furniture: 1000-5000;
  life: 500;
  luckyBox: 1000;
}
```

**인플레이션 관리**:
- 일일 획득: 950-1,800 코인
- 일일 소비 권장: 800-1,500 코인
- 목표: 획득 > 소비 (약간)
- 월간 인플레이션 목표: <10%

**구현 노트**:
- 클라이언트: 즉시 표시
- 서버: 최종 검증 및 저장
- 인플레이션 모니터링 시스템

---

### 2.2 다이아 시스템

#### Diamond (Hard Currency)
- **복잡도**: Medium
- **위치**: Server (중요)
- **의존성**: Achievement System, IAP System
- **우선순위**: P0

**주요 데이터**:
```typescript
interface DiamondEarning {
  achievement: 10-100;       // 업적 달성
  weeklyLogin: 50;           // 7일 연속 로그인
  giftCan: 5-20;             // 선물캔 (15층+)
  newRecord: 10;             // 최고기록 갱신
  seasonRanking: 50-500;     // 시즌 랭킹 보상
}

interface DiamondSpending {
  legendaryCostume: 500;
  legendaryCat: 1000;
  coinExchange: 100;         // 코인 10,000개
  lifeRefill: 50;            // 즉시 생명 충전
  premiumLuckyBox: 200;
  streakProtection: 50;      // 스트릭 보호권
  streakRecovery: 100;       // 스트릭 복구권
}
```

**구현 노트**:
- 서버 사이드 검증 필수 (치트 방지)
- IAP 결제 시 서버에서 지급
- 다이아 사용 로그 저장

---

### 2.3 에너지/생명 시스템

#### Energy System
- **복잡도**: Medium
- **위치**: Client + Server (동기화)
- **의존성**: Timer System, Ad System
- **우선순위**: P0

**주요 데이터**:
```typescript
interface EnergyConfig {
  maxLives: 5;               // 최대 생명
  costPerGame: 1;            // 게임당 소모
  refillTime: 1200000;       // 20분 (ms)
  fullRefillTime: 6000000;   // 100분 (ms)
}

interface EnergyRefill {
  timeRecovery: 1;           // 20분마다
  adWatch: 1;                // 광고 시청
  dailyLogin: 2;             // 일일 로그인
  achievement: 1-3;          // 업적 달성
  coinPurchase: 1;           // 500 코인
  iapFullRefill: 5;          // IAP 풀충전
}
```

**구현 노트**:
- 타이머는 서버 시간 기준 (치트 방지)
- 생명 0이어도 광고 보면 플레이 가능
- 푸시 알림: "생명 충전 완료! 🔋"

---

### 2.4 코인 싱크 시스템

#### Coin Sink System
- **복잡도**: Low
- **위치**: Client + Server
- **의존성**: Coin System, Progression System
- **우선순위**: P1

**주요 싱크**:
```typescript
interface CatLevelUp {
  lv1to2: 1000;              // Perfect 존 +1%
  lv2to3: 2000;              // Perfect 존 +1%
  lv3to4: 5000;              // Perfect 존 +2%
  lv4to5: 10000;             // Perfect 존 +2%
  lv5toMax: 20000;           // Perfect 존 +3% + 특수 스킬
  totalCost: 38000;          // 총 비용
}

interface HouseUpgrade {
  room4: 10000;              // 오프라인 보상 +15%
  room5: 25000;              // 오프라인 보상 +20%
  premiumFurniture: 5000-20000;
  garden: 50000;             // 미니게임 해금
}
```

**구현 노트**:
- 후반부 코인 소비처 확보
- 장기 목표 제공

---

## 3. 진행 시스템

### 3.1 플레이어 레벨 시스템

#### Player Level System
- **복잡도**: Medium
- **위치**: Client + Server
- **의존성**: Experience System, Reward System
- **우선순위**: P1

**주요 데이터**:
```typescript
interface PlayerLevel {
  currentLevel: number;
  currentExp: number;
  expToNextLevel: number;    // 레벨^1.5 * 100
  totalExp: number;
}

interface ExpSource {
  floorReached: number;      // 층수 × 5
  perfectLanding: 2;
  goodLanding: 1;
  medalBonus: {              // 메달별 경험치 보너스
    bronze: 5,
    silver: 15,
    gold: 30,
    platinum: 50,
  };
}
```

**구현 노트**:
- 레벨업 시 보상 (코인, 아이템)
- 레벨업 애니메이션
- 프로필에 레벨 표시

---

### 3.2 고양이 레벨 시스템

#### Cat Level System
- **복잡도**: Medium
- **위치**: Client + Server
- **의존성**: Coin System
- **우선순위**: P1

**주요 데이터**:
```typescript
interface CatLevelConfig {
  level: number;
  coinCost: number;
  perfectZoneBonus: number;  // % 증가
  specialSkill?: string;
}

// 레벨 5 (MAX) 특수 스킬 예:
// - 자동 Perfect 존 하이라이트
// - 첫 Miss 1회 자동 구조
// - 코인 획득 +10%
```

**구현 노트**:
- 고양이마다 독립적인 레벨
- 레벨업 비용 지수 증가
- 스킬 활성화 이펙트

---

### 3.3 환생 시스템 (Prestige)

#### Prestige System
- **복잡도**: High
- **위치**: Server (중요)
- **의존성**: Achievement System, Floor Counter
- **우선순위**: P1

**주요 데이터**:
```typescript
interface PrestigeConfig {
  minFloor: 50;              // 최소 50층 달성
  resetData: {
    floorRecord: true,       // 0층으로 리셋
    currentMissions: true,   // 진행 중 미션 리셋
  };
  keepData: {
    coins: true,
    diamonds: true,
    cats: true,
    costumes: true,
    achievements: true,
    titles: true,
  };
  reward: {
    coinBonus: '+5%',        // 영구 코인 획득 +5%
    prestigeCostume: 1,      // 환생 전용 의상
    title: '환생자',
  };
}

interface PrestigeCount {
  count: number;
  bonuses: {
    coinEarning: number;     // 누적 보너스
    expEarning: number;
    perfectZone: number;
    startingCoins: number;
  };
}
```

**v1.6.1 환생 되돌리기**:
```typescript
interface PrestigeUndo {
  timeLimit: 3600000;        // 1시간 (ms)
  freeUndoCount: 1;          // 계정당 평생 1회
  diamondCost: 500;          // 2회 이후 비용
}
```

**구현 노트**:
- 환생 계산기 (현재 보너스 vs 추가 도전)
- 3단계 확인 (계산기 → 경고 → 최종 확인)
- 서버에서 환생 이력 관리

---

### 3.4 초월 시스템 (Transcendence)

#### Transcendence System
- **복잡도**: High
- **위치**: Server
- **의존성**: Prestige System
- **우선순위**: P2

**주요 데이터**:
```typescript
interface TranscendenceLevel {
  level: number;
  requirement: string;       // 환생 10회 + 100층 3회 등
  bonuses: {
    perfectZone: number;
    coinEarning: number;
    startingFloor: number;
    luckyEventRate: number;
  };
}

// 초월 10 달성 시: "초월자" 금색 칭호 + 전용 이펙트
```

**구현 노트**:
- 환생 10회 이후 해금
- 엔드게임 콘텐츠
- 무한 성장 동기

---

### 3.5 미니 환생 시스템

#### Mini Prestige System
- **복잡도**: Low
- **위치**: Client + Server
- **의존성**: Floor Counter
- **우선순위**: P2

**주요 데이터**:
```typescript
interface MiniPrestige {
  minFloor: 30;              // 30층 달성
  reward: {
    coinBonus: '+2%',        // 코인 +2% (영구)
  };
  limit: 1;                  // 계정당 1회만
  purpose: '환생 시스템 맛보기';
}
```

**구현 노트**:
- 초보자용 시스템
- 50층 정식 환생으로 유도

---

### 3.6 메달 시스템

#### Medal System
- **복잡도**: Low
- **위치**: Client
- **의존성**: Floor Counter, Scoring System
- **우선순위**: P1

**주요 데이터**:
```typescript
enum MedalType {
  BRONZE = 'bronze',         // 10-19층
  SILVER = 'silver',         // 20-34층
  GOLD = 'gold',             // 35-49층
  PLATINUM = 'platinum',     // 50층+
}

interface MedalBonus {
  bronze: { coin: 1.1, exp: 1.05 },
  silver: { coin: 1.25, exp: 1.15 },
  gold: { coin: 1.5, exp: 1.3 },
  platinum: { coin: 2.0, exp: 1.5 },
}
```

**구현 노트**:
- 게임오버 화면에 메달 표시
- 메달별 보너스 계산
- 프로필에 메달 컬렉션

---

## 4. 소셜 시스템

### 4.1 리더보드 시스템

#### Leaderboard System
- **복잡도**: High
- **위치**: Server (Firebase Firestore)
- **의존성**: Authentication, Floor Counter
- **우선순위**: P1

**주요 데이터**:
```typescript
interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;             // 최고 층수
  timestamp: number;         // 달성 시간
  catId: string;             // 사용 고양이
  costumeId: string;         // 착용 의상
}

interface LeaderboardType {
  global: LeaderboardEntry[];
  friends: LeaderboardEntry[];
  weekly: LeaderboardEntry[];
  monthly: LeaderboardEntry[];
}
```

**구현 노트**:
- Firestore 쿼리 최적화 (인덱싱)
- 캐싱 (10분 갱신)
- 페이지네이션 (100명씩)

---

### 4.2 고스트 레이스 시스템

#### Ghost Race System
- **복잡도**: High
- **위치**: Client + Server
- **의존성**: Replay System, Friend System
- **우선순위**: P1

**주요 데이터**:
```typescript
interface GhostReplay {
  userId: string;
  floorData: {
    floor: number;
    timestamp: number;       // 도달 시간
    canType: CanType;
    landingType: 'Perfect' | 'Good';
  }[];
  maxFloor: number;
}

interface GhostRaceState {
  playerFloor: number;
  ghostFloor: number;
  leadBy: number;            // 몇 층 앞서는지
  isAhead: boolean;
}
```

**구현 노트**:
- 플레이 데이터 기록 (리플레이)
- 고스트 렌더링 (30% 투명도)
- 실시간 비교 UI ("OO보다 3층 앞서고 있어요!")

---

### 4.3 토너먼트 시스템

#### Tournament System
- **복잡도**: High
- **위치**: Server
- **의존성**: Leaderboard, Tier System
- **우선순위**: P2

**주요 데이터**:
```typescript
enum TournamentTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
}

interface TournamentConfig {
  period: 'weekly';          // 월-일
  groupSize: 100;            // 같은 티어 100명 매칭
  promotionRate: 0.1;        // 상위 10%
  relegationRate: 0.1;       // 하위 10%
  minGames: 3;               // 주 3판 이상
}

interface TournamentReward {
  rank1: { diamonds: 500, costume: 'seasonal', title: '챔피언' },
  rank2_3: { diamonds: 300, luckyBoxes: 3 },
  rank4_10: { diamonds: 150, luckyBoxes: 1 },
  top10Percent: { diamonds: 100, promotion: true },
  participation: { coins: 50 },
}
```

**v1.6.2 과열 방지**:
```typescript
interface TournamentSafeguard {
  relegationWarning: 24;     // 24시간 전 경고
  softRelegation: true;      // 예비 티어 1주 유지
  relegationRate: 0.05;      // 하위 10% → 5%
  comebackBonus: 50;         // 복귀 시 다이아 50개
}
```

**구현 노트**:
- Firestore에서 티어별 그룹 생성
- Cloud Functions로 주간 보상 지급
- 강등 완충 시스템

---

### 4.4 친구 시스템

#### Friend System
- **복잡도**: Medium
- **위치**: Server
- **의존성**: Authentication
- **우선순위**: P2

**주요 데이터**:
```typescript
interface Friend {
  userId: string;
  username: string;
  avatarCat: string;
  maxFloor: number;
  lastActive: number;
  status: 'online' | 'offline';
}

interface FriendRequest {
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: number;
}
```

**구현 노트**:
- Firestore 친구 목록 관리
- 실시간 상태 업데이트
- 친구 초대 보상 (1000 코인)

---

### 4.5 도발/메시징 시스템

#### Taunt System
- **복잡도**: Medium
- **위치**: Server
- **의존성**: Friend System
- **우선순위**: P2

**주요 데이터**:
```typescript
interface TauntMessage {
  fromUserId: string;
  toUserId: string;
  type: 'record' | 'victory' | 'collection';
  message: string;
  timestamp: number;
}

interface TauntLimit {
  dailyMax: 5;               // 일일 최대 5회
  sameFriendMax: 2;          // 동일 친구 2회
  cooldown: 1800000;         // 30분 (ms)
}
```

**v1.6.1 독성 방지**:
```typescript
interface ToxicityPrevention {
  profanityFilter: true;     // 욕설 자동 차단
  spamDetection: true;       // 스팸 패턴 감지
  reportThreshold: {
    warning: 1,
    ban7days: 3,
    ban30days: 5,
    permanent: 10,
  };
  positiveIncentive: {
    praiseBonus: 10,         // 칭찬 시 +10 코인
    mannerTitle: '매너 집사',
  };
}
```

**구현 노트**:
- Cloud Functions로 필터링
- 신고 시스템 (Firestore)
- 칭찬 우선 배치 UI

---

## 5. 리텐션 시스템

### 5.1 일일 로그인 보상

#### Daily Login System
- **복잡도**: Low
- **위치**: Client + Server
- **의존성**: Calendar System
- **우선순위**: P0

**주요 데이터**:
```typescript
interface DailyLoginReward {
  day: number;
  coins: number;
  diamonds?: number;
  lives?: number;
  luckyBox?: number;
  item?: string;
}

// 7일 사이클
const rewards: DailyLoginReward[] = [
  { day: 1, coins: 100 },
  { day: 2, coins: 150 },
  { day: 3, coins: 200, luckyBox: 1 },
  { day: 4, coins: 250 },
  { day: 5, coins: 300, lives: 2 },
  { day: 6, coins: 400, diamonds: 20 },
  { day: 7, coins: 500, diamonds: 50, luckyBox: 1 },
];
```

**구현 노트**:
- 서버 시간 기준 (시간대 무관)
- 연속 접속 추적
- 7일 후 다시 반복

---

### 5.2 스트릭 시스템

#### Streak System
- **복잡도**: Medium
- **위치**: Server
- **의존성**: Daily Login System
- **우선순위**: P0

**주요 데이터**:
```typescript
interface StreakProgress {
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string;     // YYYY-MM-DD
  streakRewards: {
    3: { coins: 100, title: '3일차 집사' },
    7: { diamonds: 50, title: '1주일 집사', luckyBox: 1 },
    14: { diamonds: 100, title: '2주 집사', costume: 'rare' },
    30: { diamonds: 200, title: '한달 집사', cat: 'rare' },
    100: { diamonds: 500, title: '백일 집사', costume: 'legendary' },
  };
}

interface StreakProtection {
  protectionShield: {
    cost: 50,                // 다이아
    effect: '1일 미접속 허용',
  };
  recoveryTicket: {
    cost: 100,               // 다이아
    timeLimit: 86400000,     // 24시간 (ms)
  };
}
```

**구현 노트**:
- 스트릭 위험 알림 (2시간 전)
- 스트릭 복구 시스템
- 손실 회피 심리 활용

---

### 5.3 미션 시스템

#### Mission System
- **복잡도**: High
- **위치**: Client + Server
- **의존성**: Task Tracking System
- **우선순위**: P0

**주요 데이터**:
```typescript
interface Mission {
  id: string;
  type: 'daily' | 'weekly';
  category: 'easy' | 'medium' | 'hard';
  description: string;
  target: number;
  progress: number;
  reward: {
    coins?: number;
    diamonds?: number;
    items?: string[];
  };
  expiresAt: number;
}

interface DailyMissionPool {
  easy: Mission[];           // 1개 선택
  medium: Mission[];         // 1개 선택
  hard: Mission[];           // 1개 선택
}

// 일일 미션 예:
// - 3판 플레이하기 (100 코인)
// - Perfect 착지 10회 (150 코인)
// - 20층 도달하기 (200 코인)

// 주간 미션 예:
// - 총 100층 누적 (500 코인)
// - Perfect 50회 누적 (600 코인)
// - 최고기록 갱신 1회 (20 다이아)
// - 7일 연속 로그인 (50 다이아)
```

**미션 완료율 목표**:
| 시점 | 1/3 완료 | 2/3 완료 | 3/3 완료 |
|------|----------|----------|----------|
| D1 | 80% | 50% | 30% |
| D7 | 70% | 60% | 40% |
| D30 | 60% | 50% | 35% |

**구현 노트**:
- 진행도 실시간 추적
- 만료 3시간 전 알림
- 모든 미션 완료 보너스

---

### 5.4 업적 시스템

#### Achievement System
- **복잡도**: Medium
- **위치**: Server
- **의존성**: Event Tracking
- **우선순위**: P1

**주요 데이터**:
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'floor' | 'landing' | 'collection' | 'social' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  requirement: {
    type: string;
    target: number;
  };
  reward: {
    coins?: number;
    diamonds?: number;
    lives?: number;
    title?: string;
  };
  unlocked: boolean;
  progress: number;
}

// 업적 예:
// - "첫 번째 10층" (100 코인)
// - "100번 점프" (50 코인)
// - "Perfect 마스터 (100회)" (200 코인 + 칭호)
// - "모든 고양이 수집" (1000 코인 + 레전더리 고양이)
```

**구현 노트**:
- 50+ 업적
- 프로그레스 바
- 업적 해금 애니메이션

---

### 5.5 D1/D3-D5/D7-D14/D30+ 리텐션 훅

#### Retention Hooks
- **복잡도**: High
- **위치**: Server (Cloud Functions)
- **의존성**: Analytics, Push Notification
- **우선순위**: P0

**D1 타임라인**:
| 시간대 | 행동 | 시스템 반응 | 목표 |
|--------|------|-------------|------|
| 0-5분 | 튜토리얼 | 첫 성공 경험 + "잘했어!" | 도파민 첫 분출 |
| 5-15분 | 자유 플레이 3판 | 첫 코인 획득 + 럭키 이벤트 확률 UP | 재미 확인 |
| 15-30분 | 상점 방문 유도 | 첫 구매 경험 (기본 의상 500코인) | 목표 설정 |
| 30-60분 | 첫 에너지 소진 | "무료 충전" 팝업 + 광고 시청 안내 | 에너지 시스템 학습 |
| 2시간 후 | 이탈 | "에너지 충전 완료! 🔋" 푸시 | 리콜 |
| 4시간 후 | 이탈 중 | "오늘의 미션 곧 만료! ⏰" 푸시 | FOMO |
| 취침 전 | 이탈 중 | "내일 로그인하면 보너스! 🎁" 푸시 | D2 유도 |

**D3-D5 전략**:
```typescript
interface D3to5Strategy {
  D3: {
    trigger: '로그인 시',
    content: '3일 연속 접속! 🎉',
    reward: '특별 럭키박스 + 새 캐릭터 티저',
  },
  D4: {
    trigger: '로그인 시',
    content: '새 챌린지 해금!',
    reward: '중간 난이도 미션 등장',
  },
  D5: {
    trigger: '로그인 시',
    content: '곧 새 콘텐츠!',
    reward: '5일차 전용 업적 해금',
  },
  ifChurn: {
    trigger: '24시간 미접속',
    push: '보고 싶었어! 🐱',
    reward: '복귀 보상 강조',
  },
}
```

**D7-D14 전략** (v1.6.2):
| 일차 | 트리거 | 콘텐츠 | 보상 | 심리 원리 |
|------|--------|--------|------|----------|
| D7 | 7일 보상 수령 직후 | "14일 목표 시작!" 팝업 | 14일 예고 보상 미리보기 | 목표 연속성 |
| D8 | 로그인 시 | "새 챌린지 모드 해금!" | 특별 챌린지 3개 등장 | 신선함 |
| D10 | 로그인 시 | "10일차 집사 전용 이벤트!" | 전용 한정 미션 3일간 | 특별함 |
| D12 | 로그인 시 | "14일까지 2일!" 카운트다운 | 럭키박스 2개 | FOMO |
| D14 | 로그인 시 | "2주 집사 달성! 🎉" | 레어 고양이 + 100 다이아 | 성취감 |

**D30+ 엔드게임**:
- 환생 시스템 (50층+)
- 초월 시스템 (환생 10회+)
- 마스터 챌린지 (100층+)
- 컬렉션 완성 목표

**구현 노트**:
- Cloud Functions로 자동화
- Analytics 기반 이탈 예측
- A/B 테스트 가능 구조

---

### 5.6 푸시 알림 시스템

#### Push Notification System
- **복잡도**: Medium
- **위치**: Server (Firebase Cloud Messaging)
- **의존성**: Analytics, Retention Hooks
- **우선순위**: P0

**주요 데이터**:
```typescript
interface PushNotification {
  type: 'energy' | 'login' | 'streak' | 'friend' | 'event' | 'comeback';
  priority: 'high' | 'medium' | 'low';
  title: string;
  body: string;
  data: Record<string, any>;
  schedule?: number;         // 예약 시간
}

interface PushRules {
  dailyMax: 3;               // 일일 최대 3회
  nightBan: {                // 야간 금지
    start: 22,               // 22시
    end: 8,                  // 8시
  };
  duplicatePrevention: 21600000; // 6시간 (ms)
  personalized: true;        // 유저 활동 시간대 기반
}
```

**푸시 매트릭스**:
| 트리거 | 메시지 | 타이밍 | 우선순위 |
|--------|--------|--------|----------|
| 에너지 충전 | "에너지 가득! 🔋 지금 플레이!" | 충전 완료 시 | 높음 |
| 로그인 리마인더 | "오늘의 미션이 기다려요! 📋" | 24시간 미접속 | 높음 |
| 연속 로그인 위험 | "6일차! 내일이면 특별 보상! 🎁" | 저녁 8시 | 매우 높음 |
| 친구 기록 갱신 | "{친구}가 당신을 넘었어요! 🏆" | 즉시 | 높음 |
| 한정 이벤트 | "황금 타임 시작! ⭐ 1시간 한정" | 이벤트 시작 | 중간 |
| 복귀 유도 | "보고 싶었어! 🐱 돌아오면 선물!" | 3일 미접속 | 높음 |

**스마트 푸시 (AI 기반)**:
- 이탈 예측 (3일 이내)
- 타겟 푸시 (특별 보상)
- 최적 시간 (과거 접속 패턴)
- A/B 테스트 (메시지 효과 측정)

**구현 노트**:
- FCM (Firebase Cloud Messaging)
- Cloud Functions로 자동화
- Analytics 기반 개인화

---

### 5.7 오프라인 보상 시스템

#### Offline Reward System
- **복잡도**: Low
- **위치**: Server
- **의존성**: Timer System, House System
- **우선순위**: P1

**주요 데이터**:
```typescript
interface OfflineReward {
  1: 50,                     // 1시간
  4: 200,                    // 4시간
  8: 500,                    // 8시간
  24: 1000,                  // 24시간 (최대)
}

interface HouseBonus {
  baseBonus: 1.0;            // 기본
  roomExpansion: 0.1;        // +10% / 방
  autoFeeder: 0.25;          // +25%
  premiumCushion: 0.15;      // +15%
}

interface ComebackReward {
  3: { coins: 500, lives: 5 },
  7: { coins: 1000, luckyBox: 1 },
  14: { coins: 2000, luckyBox: 3 },
  30: { coins: 5000, costume: 'rare' },
}
```

**구현 노트**:
- 서버 시간 기준 계산
- 광고 보고 2배 옵션
- 복귀 유도 시스템

---

## 6. 수익화 시스템

### 6.1 IAP 스토어

#### In-App Purchase Store
- **복잡도**: High
- **위치**: Client + Server
- **의존성**: Google Play Billing, Apple IAP
- **우선순위**: P0

**주요 데이터**:
```typescript
interface IAPProduct {
  id: string;
  type: 'consumable' | 'non-consumable' | 'subscription';
  price: number;
  currency: string;
  contents: {
    coins?: number;
    diamonds?: number;
    items?: string[];
  };
  discountRate?: number;
  timeLimit?: number;        // 한정 판매
}

// 제품 예:
const products = [
  {
    id: 'noob_pack',
    type: 'consumable',
    price: 0.99,
    contents: { coins: 1000, luckyBox: 3 },
    discountRate: 0.8,
    timeLimit: 86400000,     // 24시간
  },
  {
    id: 'remove_ads',
    type: 'non-consumable',
    price: 2.99,
  },
  {
    id: 'premium_pass',
    type: 'subscription',
    price: 4.99,
    period: 'monthly',
  },
];
```

**IAP 퍼널 추적** (v1.6.2):
| 단계 | 지표 | D1 목표 | D7 목표 | D30 목표 | 측정 방법 |
|------|------|---------|---------|----------|----------|
| Stage 1 | 상점 방문율 | 80% | 90% | 95% | 상점 버튼 클릭 |
| Stage 2 | 아이템 조회율 | 50% | 60% | 70% | 상품 상세 팝업 |
| Stage 3 | 구매 버튼 클릭 | 20% | 30% | 40% | 결제 플로우 시작 |
| Stage 4 | 결제 완료율 | 60% | 70% | 75% | 플랫폼 결제 성공 |

**전환율 계산**:
- D1: 80% × 50% × 20% × 60% = 4.8%
- D7: 90% × 60% × 30% × 70% = 11.3%
- D30: 95% × 70% × 40% × 75% = 19.95%

**구현 노트**:
- 플랫폼별 결제 처리 (Google, Apple)
- 영수증 검증 (서버)
- 복원 기능
- A/B 테스트 (가격, 타이밍)

---

### 6.2 VIP 시스템

#### VIP Tier System
- **복잡도**: Medium
- **위치**: Server
- **의존성**: IAP System
- **우선순위**: P1

**주요 데이터**:
```typescript
enum VIPTier {
  BRONZE = 'bronze',         // 첫 구매
  SILVER = 'silver',         // $10
  GOLD = 'gold',             // $50
  PLATINUM = 'platinum',     // $100
  DIAMOND = 'diamond',       // $500
}

interface VIPBenefit {
  coinBonus: number;         // %
  adReduction: number;       // %
  exclusiveCostumes: number;
  exclusiveCats: number;
  betaAccess: boolean;
  developerChannel: boolean;
}

const benefits: Record<VIPTier, VIPBenefit> = {
  bronze: { coinBonus: 5, adReduction: 0, exclusiveCostumes: 0, exclusiveCats: 0, betaAccess: false, developerChannel: false },
  silver: { coinBonus: 10, adReduction: 20, exclusiveCostumes: 1, exclusiveCats: 0, betaAccess: false, developerChannel: false },
  gold: { coinBonus: 20, adReduction: 50, exclusiveCostumes: 3, exclusiveCats: 1, betaAccess: false, developerChannel: false },
  platinum: { coinBonus: 30, adReduction: 100, exclusiveCostumes: 5, exclusiveCats: 2, betaAccess: true, developerChannel: false },
  diamond: { coinBonus: 50, adReduction: 100, exclusiveCostumes: 10, exclusiveCats: 5, betaAccess: true, developerChannel: true },
};
```

**2차 구매 유도** (v1.6.1):
| 트리거 | 타이밍 | 제안 내용 | 할인 |
|--------|--------|----------|------|
| 첫 구매 직후 | 결제 완료 10초 | "감사 선물!" + 20% 할인 쿠폰 | 20% |
| 첫 구매 1시간 내 | 게임 재접속 시 | "집사 환영 번들" 특가 | 30% |
| 첫 구매 24시간 내 | 미션 완료 시 | "연속 구매 보너스" (+50% 보상) | 15% |
| 첫 구매 3일 내 | 로그인 시 | "VIP 승급 가속" 제안 | 10% |

**구현 노트**:
- 누적 결제액 추적
- 티어별 혜택 자동 적용
- VIP 배지 표시

---

### 6.3 배틀 패스 시스템

#### Battle Pass System
- **복잡도**: High
- **위치**: Server
- **의존성**: Season System, Mission System
- **우선순위**: P1

**주요 데이터**:
```typescript
interface BattlePass {
  season: number;
  startDate: number;
  endDate: number;
  currentLevel: number;
  maxLevel: 50;
  price: 4.99;
}

interface BattlePassTrack {
  free: BattlePassReward[];
  premium: BattlePassReward[];
}

interface BattlePassReward {
  level: number;
  type: 'coin' | 'diamond' | 'costume' | 'cat' | 'luckyBox';
  amount: number;
  itemId?: string;
}

// 레벨 예:
// 1: 무료(100 코인) / 프리미엄(+100 코인)
// 5: 무료(럭키박스) / 프리미엄(+일반 의상)
// 10: 무료(200 코인) / 프리미엄(+레어 의상)
// 50: 무료(없음) / 프리미엄(시즌 한정 고양이)
```

**구현 노트**:
- 시즌 3개월 주기
- 경험치로 레벨업
- 구매 시 이전 레벨 보상 즉시 지급

---

### 6.4 광고 시스템

#### Ad System
- **복잡도**: High
- **위치**: Client (AdMob SDK)
- **의존성**: AdMob, VIP System
- **우선순위**: P0

**주요 데이터**:
```typescript
enum AdType {
  REWARDED = 'rewarded',     // 보상형 (주력)
  INTERSTITIAL = 'interstitial', // 전면 광고 (최소화)
  BANNER = 'banner',         // 배너 (사용 안 함)
}

interface AdConfig {
  rewarded: {
    revive: true,            // 부활
    doubleReward: true,      // 2배 보상
    luckyBox: true,          // 럭키박스
    energyRefill: true,      // 생명 충전
  };
  interstitial: {
    frequency: 5-7,          // 5-7판마다 1회
    timing: 'gameOver',      // 게임오버 후만
    skippable: true,         // 5초 후 닫기
  };
}
```

**광고 노출 제어** (v1.6.2):
| VIP 등급 | 일일 최대 | 광고 감소율 |
|----------|----------|------------|
| 일반 | 30회 | 0% |
| Bronze | 24회 | 20% |
| Silver | 15회 | 50% |
| Gold | 8회 | 73% |
| Platinum+ | 0회 | 100% |

**광고 유형별 쿨다운**:
| 광고 유형 | 최소 간격 | 게임당 최대 |
|----------|----------|------------|
| 부활 광고 | 없음 | 1회 |
| 보상 광고 | 10분 | 5회 |
| 2배 코인 | 15분 | 3회 |
| 럭키박스 광고 | 30분 | 2회 |
| 에너지 충전 | 60분 | 2회 |

**광고 피로도 관리**:
```typescript
interface AdFatigueDetection {
  adSkipRate: number;        // 중도 이탈률
  adIgnoreCount: number;     // 버튼 무시 횟수
  adQuitRate: number;        // 광고 후 즉시 종료율
}

// 임계값 초과 시:
// - 쿨다운 +50%
// - 광고 버튼 크기 축소
// - 광고 빈도 자동 감소 (24시간)
```

**구현 노트**:
- AdMob SDK 통합
- 아동 보호 설정 (tagForChildDirectedTreatment: true)
- 광고 로딩 실패 처리
- 광고 보상 서버 검증

---

### 6.5 IAP 퍼널 추적 시스템

#### IAP Funnel Analytics
- **복잡도**: Medium
- **위치**: Server (Firebase Analytics)
- **의존성**: Analytics System
- **우선순위**: P1

**구현 노트**:
- 각 단계별 이벤트 로깅
- Funnel 시각화 대시보드
- 이탈 지점 분석
- A/B 테스트 연동

---

### 6.6 가격 앵커링 시스템

#### Price Anchoring System
- **복잡도**: Low
- **위치**: Client (UI)
- **의존성**: IAP Store
- **우선순위**: P1

**구현 노트**:
- 비싼 상품 먼저 배치
- 할인율 강조 (원가 표시)
- 첫 구매 특가 하이라이트
- 시간 제한 강조

---

## 7. 가챠/랜덤 시스템

### 7.1 럭키박스 시스템

#### Lucky Box System
- **복잡도**: High
- **위치**: Server (확률 검증)
- **의존성**: Random Engine, Pity System
- **우선순위**: P1

**주요 데이터**:
```typescript
enum Rarity {
  COMMON = 'common',         // 70%
  RARE = 'rare',             // 25%
  EPIC = 'epic',             // 4.5%
  LEGENDARY = 'legendary',   // 0.5%
}

interface LuckyBoxDrop {
  rarity: Rarity;
  type: 'coin' | 'diamond' | 'costume' | 'cat' | 'item';
  itemId: string;
  amount?: number;
}

interface LuckyBoxConfig {
  dropRates: Record<Rarity, number>;
  pitySystem: {
    rare: 10,                // 10회 내 레어 확정
    epic: 30,                // 30회 내 에픽 확정
    legendary: 100,          // 100회 내 레전더리 확정
  };
}
```

**확률 투명성** (v1.6.2):
```typescript
interface ProbabilityDisclosure {
  legalCompliance: '게임산업법 제32조';
  displayLocation: [
    '메뉴 → 확률 정보',
    '상점 → ⓘ 버튼',
    '럭키박스 → "확률 보기" 버튼',
  ];
  serverSync: true;          // 서버 로그와 동기화 검증
}
```

**구현 노트**:
- 서버 사이드 랜덤 생성
- Pity 카운터 추적
- 확률 공개 UI
- 10연차 보너스 (레어 1개 확정)

---

### 7.2 선물캔 시스템

#### Gift Can System
- **복잡도**: Medium
- **위치**: Client + Server
- **의존성**: Random Engine, Can System
- **우선순위**: P1

**주요 데이터**:
```typescript
interface GiftCanDrop {
  coins: { rate: 0.7, range: [50, 200] },
  diamonds: { rate: 0.2, range: [5, 20] },
  costumePiece: { rate: 0.08, range: [1, 3] },
  luckyBox: { rate: 0.02, amount: 1 },
}

interface GiftCanConfig {
  spawnFloor: 15;            // 15층부터 등장
  spawnRate: 0.05;           // 5% 확률
}
```

**확률 공개**:
| 아이템 | 확률 | 수량 범위 |
|--------|------|----------|
| 💰 코인 | 70% | 50-200 |
| 💎 다이아 | 20% | 5-20 |
| 🧩 의상 조각 | 8% | 1-3 |
| 🎁 럭키박스 | 2% | 1 |

**구현 노트**:
- 서버에서 보상 결정
- 리본 오버레이 스프라이트
- 착지 시 보상 연출

---

### 7.3 럭키 이벤트 시스템

#### Lucky Event System
- **복잡도**: High
- **위치**: Client + Server
- **의존성**: Random Engine, Mercy System
- **우선순위**: P1

**주요 데이터**:
```typescript
interface LuckyEvent {
  type: 'luckyTime' | 'goldenRain' | 'jackpotCan' | 'mysteryCat' | 'diamondShower';
  baseRate: number;
  duration: number;          // ms
  effect: string;
  visualFeedback: string;
}

const events: LuckyEvent[] = [
  {
    type: 'luckyTime',
    baseRate: 0.05,          // 5%
    duration: 30000,         // 30초
    effect: '모든 코인 2배',
    visualFeedback: '화면 테두리 금색 + "LUCKY TIME!"',
  },
  {
    type: 'goldenRain',
    baseRate: 0.03,          // 3%
    duration: 15000,         // 15초
    effect: '코인이 하늘에서 떨어짐',
    visualFeedback: '코인 파티클 비',
  },
  {
    type: 'jackpotCan',
    baseRate: 0.01,          // 1%
    duration: 0,             // 즉시
    effect: '일반 캔이 황금으로 변신 (10배 보상)',
    visualFeedback: '금색 폭발 이펙트',
  },
  // ...
];
```

**확률 보정**:
| 조건 | 확률 조정 | 이유 |
|------|-----------|------|
| 연속 5회 실패 | +50% | 리텐션 보호 |
| 24시간 미접속 후 | +100% | 복귀 유도 |
| 첫 플레이 (D1) | +200% | 초반 후킹 |
| 최고기록 근접 시 | +30% | 긴장 완화 |

**v1.6.1 중첩 규칙**:
```typescript
interface EventStack {
  maxConcurrent: 1;          // 동시 최대 1개
  priority: [
    'luckyTime',
    'diamondShower',
    'jackpotCan',
    'goldenRain',
    'mysteryCat',
  ];
  queueLimit: 1;             // 대기열 최대 1개
}
```

**구현 노트**:
- 점프 시마다 확률 체크
- 이벤트 중첩 방지
- 우선순위 기반 대기열
- 확률 보정 피드백 UI

---

### 7.4 Pity System (천장 시스템)

#### Pity System
- **복잡도**: Medium
- **위치**: Server
- **의존성**: Lucky Box System
- **우선순위**: P1

**주요 데이터**:
```typescript
interface PityCounter {
  rareCounter: number;       // 레어 카운터
  epicCounter: number;       // 에픽 카운터
  legendaryCounter: number;  // 레전더리 카운터
}

interface PityThreshold {
  rare: 10;                  // 10회 내 레어 확정
  epic: 30;                  // 30회 내 에픽 확정
  legendary: 100;            // 100회 내 레전더리 확정
}
```

**구현 노트**:
- 서버에서 카운터 관리
- 천장 도달 시 확정 드랍
- UI에 천장 현황 표시

---

## 8. 데이터/분석 시스템

### 8.1 이벤트 추적 시스템

#### Event Tracking System
- **복잡도**: High
- **위치**: Client + Server
- **의존성**: Firebase Analytics
- **우선순위**: P0

**주요 이벤트**:
```typescript
interface GameEvent {
  // 게임플레이
  game_start: { floor: number, catId: string };
  game_over: { floor: number, score: number, medal: string };
  landing: { type: 'Perfect' | 'Good' | 'Miss', combo: number };
  combo_break: { maxCombo: number };

  // 경제
  coin_earn: { amount: number, source: string };
  coin_spend: { amount: number, category: string };
  diamond_earn: { amount: number, source: string };
  diamond_spend: { amount: number, category: string };

  // 수익화
  ad_watch: { type: string, completed: boolean };
  iap_attempt: { productId: string, stage: string };
  iap_complete: { productId: string, revenue: number };

  // 소셜
  friend_add: { friendId: string };
  ghost_race: { result: 'win' | 'lose', friendId: string };
  taunt_send: { type: string, toUserId: string };

  // 진행
  level_up: { newLevel: number };
  achievement_unlock: { achievementId: string };
  mission_complete: { missionId: string };
  prestige: { count: number };

  // 리텐션
  daily_login: { streak: number };
  session_start: { sessionCount: number };
  session_end: { duration: number };
}
```

**구현 노트**:
- Firebase Analytics 통합
- 커스텀 이벤트 정의
- 이벤트 파라미터 표준화
- 실시간 대시보드

---

### 8.2 퍼널 분석 시스템

#### Funnel Analytics System
- **복잡도**: Medium
- **위치**: Server (Firebase Analytics)
- **의존성**: Event Tracking
- **우선순위**: P1

**주요 퍼널**:
```typescript
interface Funnel {
  // 튜토리얼 퍼널
  tutorial: [
    'wave0_start',
    'wave1_complete',
    'wave2_complete',
    'wave3_complete',
    'first_natural_play',
  ];

  // IAP 퍼널
  iap: [
    'shop_visit',
    'item_view',
    'purchase_click',
    'payment_complete',
  ];

  // 리텐션 퍼널
  retention: [
    'D1_login',
    'D3_login',
    'D7_login',
    'D14_login',
    'D30_login',
  ];
}
```

**목표 전환율**:
- 튜토리얼 완료: 70%
- IAP D1: 2-5%
- IAP D7: 8-12%
- D7 리텐션: >20%

**구현 노트**:
- BigQuery 연동
- 퍼널 시각화
- 이탈 지점 분석

---

### 8.3 A/B 테스트 시스템

#### A/B Testing System
- **복잡도**: High
- **위치**: Server (Firebase Remote Config)
- **의존성**: Analytics, Random Assignment
- **우선순위**: P1

**주요 테스트**:
```typescript
interface ABTest {
  name: string;
  variants: {
    control: any;
    variantA: any;
    variantB?: any;
  };
  targetMetric: string;
  duration: number;          // days
  trafficSplit: number[];    // [50, 50] or [33, 33, 34]
}

// 테스트 예:
// - 스타터 팩 가격 ($0.99 vs $1.99)
// - 첫 구매 팝업 타이밍 (D1 vs D2)
// - 배틀 패스 위치 (메인 상단 vs 사이드)
// - 가격 앵커링 (비싼 것 먼저 vs 싼 것 먼저)
```

**구현 노트**:
- Firebase Remote Config
- 무작위 배정 (서버)
- 통계적 유의성 검증
- 자동 승자 선정

---

### 8.4 플레이어 세그멘테이션

#### Player Segmentation System
- **복잡도**: Medium
- **위치**: Server
- **의존성**: Analytics
- **우선순위**: P1

**주요 세그먼트**:
```typescript
enum PlayerSegment {
  SHRIMP = 'shrimp',         // 무과금 (길냥이)
  MINNOW = 'minnow',         // 소액 (집사냥)
  DOLPHIN = 'dolphin',       // 중과금 (호랑냥)
  WHALE = 'whale',           // 고래 (사자냥)
}

interface Segment {
  name: PlayerSegment;
  criteria: {
    totalSpent: [number, number];
  };
  size: number;              // % of total users
  revenue: number;           // % of total revenue
}

// 세그먼트별 맞춤 제안:
// - 길냥이: 광고 시청 보상 강조, ₩100 입문팩
// - 집사냥: 광고 제거, 스타터 팩
// - 호랑냥: 배틀패스, 시즌 의상
// - 사자냥: 레전더리 컬렉션, VIP 전용
```

**구현 노트**:
- BigQuery로 세그먼트 분석
- 자동 세그먼트 할당
- 맞춤 제안 시스템

---

### 8.5 리텐션 분석 시스템

#### Retention Analytics
- **복잡도**: Medium
- **위치**: Server (Firebase Analytics)
- **의존성**: Event Tracking
- **우선순위**: P0

**주요 지표**:
```typescript
interface RetentionMetrics {
  D1: number;                // Day 1 retention
  D3: number;
  D7: number;
  D14: number;
  D30: number;
  classicRetention: number[][]; // Cohort analysis
}

// 목표:
// D1: >45%
// D7: >20%
// D30: >7%
```

**코호트 분석**:
```typescript
interface Cohort {
  installDate: string;
  size: number;
  retention: {
    D1: number,
    D3: number,
    D7: number,
    D14: number,
    D30: number,
  };
}
```

**구현 노트**:
- 일일 코호트 추적
- 리텐션 커브 시각화
- 이탈 예측 모델

---

## 9. 백엔드 아키텍처

### 9.1 인증 시스템

#### Authentication System
- **복잡도**: Medium
- **위치**: Server (Firebase Authentication)
- **의존성**: 없음
- **우선순위**: P0

**주요 데이터**:
```typescript
interface UserAuth {
  uid: string;               // Firebase UID
  provider: 'anonymous' | 'google' | 'apple';
  createdAt: number;
  lastLoginAt: number;
}

// Phase 1: 익명 로그인만
// Phase 2: Google, Apple 로그인 추가
```

**구현 노트**:
- Anonymous Auth (Phase 1)
- 기기 ID 기반 저장
- 계정 복원 불가 (Phase 1)
- COPPA/GDPR 준수

---

### 9.2 데이터베이스 시스템

#### Database System (Firestore)
- **복잡도**: High
- **위치**: Server (Cloud Firestore)
- **의존성**: Authentication
- **우선순위**: P0

**컬렉션 구조**:
```typescript
// /users/{userId}
interface UserDocument {
  profile: {
    username: string;
    avatarCat: string;
    level: number;
    totalExp: number;
  };
  progress: {
    maxFloor: number;
    totalGames: number;
    totalJumps: number;
    prestigeCount: number;
  };
  currency: {
    coins: number;
    diamonds: number;
    lives: number;
    lastEnergyRefill: number;
  };
  inventory: {
    cats: string[];
    costumes: string[];
    luckyBoxes: number;
  };
  social: {
    friends: string[];
    blockedUsers: string[];
  };
  retention: {
    loginStreak: number;
    lastLoginDate: string;
    dailyMissionProgress: Mission[];
  };
  monetization: {
    totalSpent: number;
    vipTier: VIPTier;
    purchases: Purchase[];
  };
}

// /leaderboard/{leaderboardType}/{userId}
interface LeaderboardEntry {
  userId: string;
  score: number;
  timestamp: number;
  // ...
}

// /tournaments/{tournamentId}/participants/{userId}
interface TournamentParticipant {
  userId: string;
  tier: TournamentTier;
  score: number;
  rank: number;
}
```

**인덱싱**:
```typescript
// Firestore 인덱스:
// - leaderboard: score (desc)
// - tournaments: tier + score (desc)
// - friends: lastActive (desc)
```

**구현 노트**:
- 문서 크기 최적화 (< 1MB)
- 인덱싱 전략
- 오프라인 지원
- 보안 규칙

---

### 9.3 클라우드 함수 시스템

#### Cloud Functions System
- **복잡도**: High
- **위치**: Server (Firebase Cloud Functions)
- **의존성**: Firestore, Analytics
- **우선순위**: P1

**주요 함수**:
```typescript
// 게임 종료 시 점수 검증
export const validateGameResult = functions.https.onCall(async (data, context) => {
  const { userId, floor, score } = data;

  // 치트 검사
  if (score > floor * 100) {
    return { valid: false, reason: 'impossible_score' };
  }

  // 최고 기록 업데이트
  const userRef = db.collection('users').doc(userId);
  await userRef.update({
    'progress.maxFloor': FieldValue.max(floor),
  });

  // 리더보드 업데이트
  await updateLeaderboard(userId, floor);

  return { valid: true };
});

// 주간 토너먼트 보상 지급
export const weeklyTournamentReward = functions.pubsub
  .schedule('0 0 * * 1')  // 매주 월요일 00:00
  .onRun(async (context) => {
    const tournaments = await db.collection('tournaments').get();

    for (const doc of tournaments.docs) {
      const participants = await doc.ref.collection('participants').get();
      // 보상 지급 로직
    }
  });

// IAP 영수증 검증
export const verifyPurchase = functions.https.onCall(async (data, context) => {
  const { platform, receipt } = data;

  if (platform === 'android') {
    // Google Play Billing 검증
  } else if (platform === 'ios') {
    // Apple IAP 검증
  }

  // 검증 후 보상 지급
});

// 푸시 알림 스케줄
export const schedulePushNotifications = functions.pubsub
  .schedule('0 * * * *')  // 매시간
  .onRun(async (context) => {
    // 에너지 충전 완료 알림
    // 스트릭 위험 알림
    // 이벤트 시작 알림
  });
```

**구현 노트**:
- TypeScript로 작성
- 에러 핸들링
- 로깅 (Cloud Logging)
- 비용 최적화

---

### 9.4 Anti-Cheat 시스템

#### Anti-Cheat System
- **복잡도**: High
- **위치**: Server
- **의존성**: Cloud Functions, Analytics
- **우선순위**: P1

**주요 검증**:
```typescript
interface AntiCheat {
  // 클라이언트 검증
  clientChecks: {
    scoreValidation: true,   // 점수 범위 검증
    timeValidation: true,    // 플레이 시간 검증
    physicsValidation: true, // 물리 법칙 검증
  };

  // 서버 검증
  serverChecks: {
    maxScorePerFloor: 100,   // 층당 최대 점수
    minTimePerFloor: 500,    // 층당 최소 시간 (ms)
    maxCombo: 100,           // 최대 콤보
  };

  // 패턴 분석
  patternAnalysis: {
    perfectRateThreshold: 0.9, // Perfect 비율 임계값
    suddenScoreSpike: true,  // 급격한 점수 증가 감지
    impossibleProgress: true, // 불가능한 진행 감지
  };
}
```

**치트 감지 시 조치**:
```typescript
enum CheatPenalty {
  WARNING = 'warning',       // 경고
  SCORE_RESET = 'score_reset', // 점수 리셋
  TEMP_BAN = 'temp_ban',     // 일시 정지
  PERMANENT_BAN = 'permanent_ban', // 영구 정지
}
```

**구현 노트**:
- 서버 사이드 검증 (클라이언트 신뢰 X)
- 통계적 이상 감지
- 로그 저장 (분석용)

---

## 10. 상태 관리 시스템

### 10.1 세션 데이터

#### Session State
- **복잡도**: Low
- **위치**: Client (메모리)
- **의존성**: 없음
- **우선순위**: P0

**주요 데이터**:
```typescript
interface SessionState {
  currentFloor: number;
  currentScore: number;
  currentCombo: number;
  livesUsed: number;
  coinsEarned: number;
  diamondsEarned: number;
  luckyEventsTriggered: LuckyEvent[];
}
```

**구현 노트**:
- 게임 시작 시 초기화
- 게임오버 시 서버 전송
- 메모리 내 관리

---

### 10.2 영구 데이터

#### Persistent State
- **복잡도**: Medium
- **위치**: Client (LocalStorage) + Server (Firestore)
- **의존성**: Database System
- **우선순위**: P0

**주요 데이터**:
```typescript
interface PersistentState {
  // 로컬 저장 (오프라인 플레이)
  local: {
    settings: GameSettings;
    tutorialComplete: boolean;
    cachedUserData: UserDocument;
    lastSync: number;
  };

  // 서버 저장 (영구)
  server: UserDocument;      // 위 Database System 참조
}
```

**동기화 전략**:
```typescript
interface SyncStrategy {
  // 게임 종료 시
  onGameEnd: 'immediate',    // 즉시 동기화

  // 정기 동기화
  interval: 300000,          // 5분마다

  // 충돌 해결
  conflictResolution: 'server-wins', // 서버 우선
}
```

**구현 노트**:
- LocalStorage (클라이언트)
- Firestore (서버)
- 양방향 동기화
- 충돌 해결 로직

---

### 10.3 설정 데이터

#### Settings State
- **복잡도**: Low
- **위치**: Client (LocalStorage)
- **의존성**: 없음
- **우선순위**: P0

**주요 데이터**:
```typescript
interface GameSettings {
  audio: {
    bgmVolume: number;       // 0-1
    sfxVolume: number;       // 0-1
    bgmEnabled: boolean;
    sfxEnabled: boolean;
  };

  accessibility: {
    colorBlindMode: 'normal' | 'protanopia' | 'deuteranopia';
    highContrastMode: boolean;
    largeFont: boolean;
    reducedAnimations: boolean;
  };

  gameplay: {
    hapticFeedback: boolean;
    oneHandMode: boolean;
    autoHold: boolean;
  };

  notifications: {
    pushEnabled: boolean;
    energyRefill: boolean;
    dailyLogin: boolean;
    friendActivity: boolean;
    events: boolean;
  };

  privacy: {
    adPersonalization: boolean;
    analytics: boolean;
  };
}
```

**구현 노트**:
- LocalStorage에 저장
- 설정 변경 즉시 적용
- 기본값 제공

---

## 11. 심리 엔진 시스템

### 11.1 감정이입 시스템

#### Emotional Engagement System
- **복잡도**: Medium
- **위치**: Client
- **의존성**: Animation System, Audio System
- **우선순위**: P1

**주요 데이터**:
```typescript
enum CatEmotion {
  HUNGRY = 'hungry',         // 게임 시작
  EXCITED = 'excited',       // 콤보 중
  HAPPY = 'happy',           // 고층 도달
  DISAPPOINTED = 'disappointed', // Good 착지 (콤보 끊김)
  SAD = 'sad',               // 게임오버
  SATISFIED = 'satisfied',   // 최고기록
}

interface EmotionalFeedback {
  expression: CatEmotion;
  animation: string;
  speechBubble?: string;
  soundEffect?: string;
}

// 연출 예:
// - 게임 시작: 배고픈 표정 + 빈 밥그릇
// - 콤보 중: 눈 반짝반짝 + 기대하는 표정
// - 게임오버: 실망 + "다시... 먹고 싶어..." 말풍선
```

**구현 노트**:
- 고양이 감정 상태 머신
- 애니메이션 전환
- 말풍선 시스템
- 효과음 연동

---

### 11.2 손실 회피 시스템

#### Loss Aversion System
- **복잡도**: Medium
- **위치**: Client
- **의존성**: Combo System, Visual Feedback
- **우선순위**: P1

**주요 요소**:
```typescript
interface LossAversion {
  // 콤보 시각화
  comboStack: {
    visible: true,           // 콤보 쌓일 때 간식 탑 표시
    shake: true,             // Good 착지 시 탑 흔들림
    collapse: true,          // 콤보 끊기면 탑 붕괴
  };

  // 황금캔 놓침
  missedReward: {
    coinDrop: true,          // 착지 실패 시 코인 떨어지는 이펙트
    message: '아깝다!',
  };

  // 스트릭 위험
  streakWarning: {
    2h: '스트릭이 곧 끊겨요!',
    1h: '긴급! 스트릭 위험!',
  };
}
```

**구현 노트**:
- 손실 시각화 (탑 붕괴 등)
- 손실 감정 자극 (아쉬움, 위기감)
- 재시도 유도

---

### 11.3 Near-Miss 시스템

#### Near-Miss System
- **복잡도**: High
- **위치**: Client
- **의존성**: Landing Detection, Floor Counter
- **우선순위**: P1

**주요 연출**:
```typescript
interface NearMissEffect {
  // 캔 가장자리 1px 실패
  edgeMiss: {
    slowMotion: 0.3,         // 슬로우 모션 (초)
    screenShake: true,       // 화면 흔들림
    soundEffect: '휙... 탁!',
  };

  // 최고기록 -1층 실패
  recordMinus1: {
    goldFlash: true,         // 금색 플래시
    message: '아깝다! 최고기록까지 1층!',
    soundEffect: '짧은 팡파레 후 끊김',
  };

  // 최고기록 -2층 실패
  recordMinus2: {
    message: '거의 다 왔어!',
    recordHighlight: true,   // 기록 하이라이트
    soundEffect: '"오~" 긴장음',
  };

  // 최고기록 -3층 실패
  recordMinus3: {
    message: '다음 판 갱신 가능성 85%',
    statistics: true,        // 통계 표시
    soundEffect: '드럼롤',
  };
}
```

**v1.3 강화**:
```typescript
interface NearRecordSystem {
  // 최고기록 -3층 이내
  nearRecord: {
    visualEffect: '금색 테두리 펄스 (0xFFD700, 50% 투명도)',
    message: '🔥 최고기록 근접! 🔥',
    psychology: 'FOMO + 성취 욕구',
  };

  // 최고기록 달성
  newRecord: {
    visualEffect: '🎉 NEW RECORD! 🎉 + 금색 플래시',
    psychology: '강렬한 성취감',
  };
}
```

**구현 노트**:
- 슬로우 모션 효과
- 화면 효과 (플래시, 펄스)
- 메시지 시스템
- 효과음 타이밍

---

### 11.4 변동 보상 시스템

#### Variable Reward System
- **복잡도**: Medium
- **위치**: Client + Server
- **의존성**: Random Engine, Lucky Event System
- **우선순위**: P1

**주요 요소**:
```typescript
interface VariableReward {
  // 선물캔
  giftCan: {
    contentUnknown: true,    // 뭐가 나올지 모름
    possibleRewards: ['coin', 'diamond', 'costume'],
  };

  // 럭키 존
  luckyZone: {
    floors: [7, 17, 27, 37, 47],
    goldenCanRate: 0.15,     // 황금캔 확률 3배 (5% → 15%)
  };

  // 숨겨진 보너스
  hiddenBonus: {
    perfect5Combo: '코인 비',
    randomGift: '완전 랜덤',
  };
}
```

**구현 노트**:
- 예측 불가능성 (랜덤)
- 서프라이즈 연출
- 도파민 자극

---

### 11.5 사회적 비교 시스템

#### Social Comparison System
- **복잡도**: Medium
- **위치**: Client + Server
- **의존성**: Friend System, Leaderboard
- **우선순위**: P1

**주요 요소**:
```typescript
interface SocialComparison {
  // 유령 고양이
  ghostCat: {
    friendRecord: true,      // 친구 최고기록 층에 표시
    globalRecord: true,      // 전체 최고기록 층에 표시
    transparency: 0.3,       // 30% 투명도
  };

  // 게임오버 비교
  gameOverComparison: {
    percentile: '상위 15%입니다',
    friendCompare: '친구 OO보다 3층 높음!',
  };

  // 주간 랭킹 알림
  rankingAlert: {
    rankDown: '순위가 밀렸어요!',
  };

  // 기록 갱신 공유
  shareButton: {
    text: '최고기록 갱신! 자랑하기',
    platforms: ['kakao', 'line', 'twitter', 'facebook'],
  };
}
```

**구현 노트**:
- 고스트 렌더링
- 비교 UI
- 공유 기능

---

### 11.6 FOMO 시스템

#### FOMO System
- **복잡도**: Medium
- **위치**: Client + Server
- **의존성**: Timer System, Event System
- **우선순위**: P1

**주요 요소**:
```typescript
interface FOMO {
  // 일일 미션 타이머
  dailyMission: {
    countdown: '오늘 미션 완료까지 3시간 남음',
    urgency: 'high',
  };

  // 연속 접속 보너스
  loginStreak: {
    preview: '7일차 보상 미리 보여주기',
    psychology: '중간에 끊으면 아까움',
  };

  // 한정 이벤트
  limitedEvent: {
    message: '이번 주말만! 황금캔 2배',
    timer: true,
  };
}
```

**한정 이벤트 시스템**:
| 이벤트 | 빈도 | 지속 시간 | 내용 |
|--------|------|-----------|------|
| 플래시 세일 | 1일 1-2회 | 30분 | 다이아 50% 할인 |
| 한정판 의상 | 주 1회 | 주말 | 시즌 의상 |
| 럭키 타임 | 1일 3회 | 1시간 | 황금캔 3배 |
| 더블 미션 | 격주 1회 | 24시간 | 미션 보상 2배 |

**구현 노트**:
- 실시간 카운트다운
- 희소성 표시 ("전체 2.3%만 보유")
- 긴급성 강조

---

### 11.7 Mercy 시스템

#### Mercy System
- **복잡도**: Medium
- **위치**: Client + Server
- **의존성**: Failure Tracking
- **우선순위**: P1

**주요 데이터**:
```typescript
interface MercySystem {
  consecutiveFailures: number;

  triggers: {
    3: {
      effect: 'Perfect 존 10% 확대',
      energy: '생명 1개 환불',
      message: '힘내! 💪',
    },
    5: {
      effect: '무료 부활 1회',
      energy: '다음 판 생명 소모 없음',
      message: '선물이야! 🎁',
    },
    7: {
      effect: '연습 모드 제안',
      energy: '연습 중 생명 회복 (20분당 1개)',
      message: '연습 모드 어때? 🐱',
    },
    10: {
      effect: '100 코인 + 럭키 확률 3배',
      energy: '생명 풀충전 (5개)',
      message: '포기하지 마! 🌟',
    },
  };
}

interface PracticeMode {
  lives: Infinity,           // 무한
  scoreRecorded: false,      // 기록 안 됨
  coinReward: 0.5,           // 50% 획득
  missionProgress: false,    // 진행 안 됨
  leaderboardUpdated: false, // 반영 안 됨
  energyRecovery: true,      // 연습 중 회복
  exitCondition: '30층 도달 OR 생명 3개 이상 회복',
}
```

**구현 노트**:
- 연속 실패 추적
- 자동 보호 트리거
- 연습 모드 전환

---

### 11.8 환생 망설임 시스템

#### Prestige Hesitation System
- **복잡도**: Medium
- **위치**: Client
- **의존성**: Prestige System
- **우선순위**: P2

**주요 요소**:
```typescript
interface PrestigeHesitation {
  // 환생 계산기
  calculator: {
    currentBonus: '+5%',     // 현재 환생 시 보너스
    nextTierBonus: '+6%',    // 다음 티어 보너스
    floorGap: 8,             // 다음 티어까지 층수
    message: '8층만 더 가면 +1% 추가!',
  };

  // 3단계 확인
  confirmationSteps: [
    '환생 계산기',           // 보너스 확인 + 더 도전 유도
    '손실 경고',             // 층수 0층 리셋 (빨간 경고)
    '최종 확인',             // 체크박스 확인
  ];

  // 환생 유도
  prestigeSuggestion: {
    sameFloor5Fails: '환생하면 더 쉬워질 수 있어요!',
    noProgress30Days: '환생으로 새로운 도전 어때요?',
    floor50Plus: '환생 가능! 버튼 반짝임',
  };
}
```

**v1.6.1 환생 되돌리기**:
```typescript
interface PrestigeUndo {
  timeLimit: 3600000,        // 1시간
  freeUndoCount: 1,          // 계정당 평생 1회
  diamondCost: 500,          // 2회 이후
  restoreData: {
    floor: true,
    level: true,
    currency: true,
    prestigeCount: true,     // 환생 횟수도 원복
  };
}
```

**구현 노트**:
- 환생 계산기 UI
- 다단계 확인 프로세스
- 되돌리기 타이머

---

## 시스템 의존성 다이어그램

```
                    ┌─────────────────────┐
                    │   Game Loop         │
                    │   (Core System)     │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
         ┌────▼────┐     ┌────▼────┐     ┌────▼────┐
         │ Jump    │     │ Landing │     │ Scoring │
         │ System  │     │ System  │     │ Engine  │
         └────┬────┘     └────┬────┘     └────┬────┘
              │                │                │
              └────────────────┼────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Combo System      │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
         ┌────▼────┐     ┌────▼────┐     ┌────▼────┐
         │ Coin    │     │ Energy  │     │ Mission │
         │ System  │     │ System  │     │ System  │
         └────┬────┘     └────┬────┘     └────┬────┘
              │                │                │
              └────────────────┼────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Retention         │
                    │   Systems           │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
         ┌────▼────┐     ┌────▼────┐     ┌────▼────┐
         │ IAP     │     │ Ad      │     │Analytics│
         │ System  │     │ System  │     │ System  │
         └────┬────┘     └────┬────┘     └────┬────┘
              │                │                │
              └────────────────┼────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Backend           │
                    │   (Firebase)        │
                    └─────────────────────┘
```

---

## 데이터 모델 개요

### 핵심 데이터 흐름

```
Player Action (점프)
    ↓
Landing Detection (Perfect/Good/Miss)
    ↓
Score Calculation (기본점수 × 배율들)
    ↓
Reward Distribution (코인, 경험치)
    ↓
State Update (로컬 + 서버 동기화)
    ↓
Analytics Event (Firebase Analytics)
```

### 주요 데이터 엔티티

```typescript
// 1. User (플레이어)
User {
  uid: string;
  profile: Profile;
  progress: Progress;
  currency: Currency;
  inventory: Inventory;
  social: Social;
  retention: Retention;
  monetization: Monetization;
}

// 2. GameSession (게임 세션)
GameSession {
  sessionId: string;
  userId: string;
  startTime: number;
  endTime: number;
  maxFloor: number;
  totalScore: number;
  coinsEarned: number;
  // ...
}

// 3. Leaderboard (리더보드)
LeaderboardEntry {
  userId: string;
  score: number;
  rank: number;
  timestamp: number;
  // ...
}

// 4. Transaction (거래)
Transaction {
  transactionId: string;
  userId: string;
  type: 'earn' | 'spend' | 'iap';
  currency: 'coin' | 'diamond';
  amount: number;
  source: string;
  timestamp: number;
}
```

---

## 구현 로드맵

### Phase 1: MVP (Week 1-2)

**P0 시스템** (필수):
- ✅ 점프/착지 메카닉
- ✅ 점수 시스템
- ✅ 난이도 곡선
- ✅ 특수 캔 (기본 5종)
- ✅ 콤보 시스템
- ✅ 코인 시스템
- ✅ 에너지/생명 시스템
- ✅ 로컬 저장 (LocalStorage)

**기대 결과**: 브라우저에서 플레이 가능한 프로토타입

---

### Phase 2: 콘텐츠 & 비주얼 (Week 3)

**P0 시스템**:
- ✅ 캐릭터 디자인 (러시안블루)
- ✅ 간식캔 비주얼 (5종)
- ✅ 파티클 효과
- ✅ 애니메이션
- ✅ 사운드 효과
- ✅ BGM

**P1 시스템**:
- ✅ 메달 시스템
- ✅ Near-Miss 연출

**기대 결과**: 시각적/청각적으로 완성된 게임

---

### Phase 3: 게임 루프 & 심리 시스템 (Week 4)

**P0 시스템**:
- ✅ 튜토리얼 (Wave 기반)
- ✅ 게임오버 화면

**P1 시스템**:
- ✅ 보스 캔 시스템
- ✅ 감정이입 시스템 (고양이 표정)
- ✅ 손실 회피 시스템 (간식 탑)
- ✅ Near-Miss 시스템 (강화)
- ✅ Mercy 시스템

**기대 결과**: 중독성 있는 게임 루프

---

### Phase 4: 메타 게임 & 진행 (Week 5)

**P0 시스템**:
- ✅ 일일 로그인 보상
- ✅ 스트릭 시스템
- ✅ 미션 시스템
- ✅ 플레이어 레벨 시스템

**P1 시스템**:
- ✅ 고양이 하우스
- ✅ 커스터마이징 (의상 10종)
- ✅ 업적 시스템 (30개)
- ✅ 고양이 레벨 시스템
- ✅ 오프라인 보상

**P2 시스템**:
- ⬜ 환생 시스템 (50층+)

**기대 결과**: 장기 플레이 유도

---

### Phase 5: 백엔드 & 수익화 (Week 6)

**P0 시스템**:
- ✅ Firebase 인증 (Anonymous)
- ✅ Firestore 데이터베이스
- ✅ Cloud Functions (점수 검증, 보상 지급)
- ✅ AdMob 연동 (보상형 광고)
- ✅ IAP 구현 (Google Play, Apple)
- ✅ 푸시 알림 (FCM)
- ✅ Analytics (Firebase)

**P1 시스템**:
- ✅ Anti-Cheat 시스템
- ✅ VIP 시스템
- ✅ 광고 피로도 관리
- ✅ IAP 퍼널 추적
- ✅ 럭키박스 시스템
- ✅ 럭키 이벤트 시스템
- ✅ 확률 투명성 시스템

**P2 시스템**:
- ⬜ 리더보드
- ⬜ 배틀 패스
- ⬜ A/B 테스트

**기대 결과**: 수익화 준비 완료

---

### Phase 6: 소셜 & 폴리싱 (Week 7-8)

**P1 시스템**:
- ⬜ 리더보드 (전체, 친구, 주간)
- ⬜ 고스트 레이스
- ⬜ 공유 시스템
- ⬜ 배틀 패스

**P2 시스템**:
- ⬜ 친구 시스템
- ⬜ 토너먼트 시스템
- ⬜ 도발/메시징 시스템
- ⬜ 초월 시스템

**폴리싱**:
- ✅ 성능 최적화
- ✅ 다양한 기기 테스트
- ✅ Capacitor 앱 빌드
- ✅ 접근성 기능
- ✅ 현지화 (한국어, 영어)

**기대 결과**: 출시 준비 완료

---

### Phase 7: 런칭 & 라이브 운영 (Week 9+)

**런칭**:
- ⬜ Google Play 출시
- ⬜ App Store 출시
- ⬜ 웹 버전 배포

**라이브 운영**:
- ⬜ KPI 모니터링 (D1/D7/D30 리텐션, ARPDAU)
- ⬜ A/B 테스트 실행
- ⬜ 이벤트 운영
- ⬜ 버그 수정
- ⬜ 콘텐츠 업데이트

**Phase 2 기능**:
- ⬜ 더 많은 고양이 (20종)
- ⬜ 더 많은 의상 (100종)
- ⬜ 시즌 이벤트
- ⬜ 특별 챌린지 모드
- ⬜ 클랜/길드 시스템

---

## 우선순위 요약

### P0 (필수, Week 1-6)
코어 게임플레이, 기본 경제, 리텐션 훅, 수익화, 백엔드, 분석

### P1 (중요, Week 5-7)
메타 게임, 진행 시스템, 심리 엔진, 소셜 기본, 가챠

### P2 (추가, Week 8+)
고급 소셜, 엔드게임 콘텐츠, 커뮤니티 기능

---

## 시스템별 복잡도 분석

| 복잡도 | 시스템 수 | 예시 |
|--------|----------|------|
| **Low** | 8 | 메달, 설정, 오프라인 보상, 코인 싱크 |
| **Medium** | 18 | 점프, 캔 스포너, 코인, 에너지, 미션, 감정이입, 손실회피 |
| **High** | 24 | 착지 감지, 점수 계산, 난이도, 콤보, 환생, 토너먼트, IAP, 광고, DB, 이벤트 추적 |

---

## 클라이언트/서버 분리

### Client-Only (15개)
점프, 착지 감지, 물리 엔진, 캔 스포너, 콤보, 메달, 설정, 감정이입, 손실회피, Near-Miss, FOMO, Mercy, 환생 망설임, 세션 상태, 심리 엔진 (일부)

### Both (18개)
점수 계산, 난이도, 특수 캔, 코인, 다이아, 에너지, 코인 싱크, 플레이어 레벨, 고양이 레벨, 일일 로그인, 스트릭, 미션, 업적, 럭키박스, 선물캔, 럭키 이벤트, 영구 상태, IAP

### Server-Only (17개)
환생, 초월, 미니 환생, 리더보드, 고스트 레이스, 토너먼트, 친구, 도발/메시징, 푸시 알림, VIP, 배틀 패스, 가챠 천장, 이벤트 추적, 퍼널 분석, A/B 테스트, 세그멘테이션, 리텐션 분석, 인증, DB, Cloud Functions, Anti-Cheat

---

## 12. 개발 가이드

### 12.1 프로젝트 폴더 구조

```text
src/
├── scenes/               # Phaser Scene 클래스들
│   ├── BootScene.ts          # 에셋 로딩, 스플래시
│   ├── MenuScene.ts          # 메인 메뉴
│   ├── GameScene.ts          # 핵심 게임플레이
│   ├── GameOverScene.ts      # 게임오버 화면
│   ├── ShopScene.ts          # 상점 (고양이/의상)
│   └── HouseScene.ts         # 고양이 하우스
├── managers/             # 싱글톤 매니저들
│   ├── AudioManager.ts       # SFX/BGM 관리
│   ├── ScoreManager.ts       # 점수/콤보/최고기록
│   ├── SaveManager.ts        # 로컬/클라우드 저장
│   └── FirebaseManager.ts    # Firebase 통합
├── objects/              # 게임 오브젝트
│   ├── Cat.ts                # 고양이 캐릭터
│   ├── Can.ts                # 캔 (일반/특수)
│   └── CanPool.ts            # Object Pool
├── config/               # 설정 파일
│   ├── GameConfig.ts         # Phaser 설정
│   ├── DifficultyConfig.ts   # 난이도 테이블
│   └── Constants.ts          # 상수 정의
├── types/                # TypeScript 타입
│   └── index.ts              # 공통 인터페이스
└── index.ts              # 진입점
```

### 12.2 Phaser 씬 전환 흐름

```text
BootScene (에셋 로딩)
    ↓
MenuScene (메인 메뉴)
    ├─[Play]─→ GameScene (게임플레이) ←→ PauseScene
    ├─[Shop]─→ ShopScene → MenuScene
    └─[House]→ HouseScene → MenuScene

GameScene
    ↓ [게임오버]
GameOverScene
    ├─[Retry]─→ GameScene
    ├─[Menu]──→ MenuScene
    └─[Shop]──→ ShopScene
```

### 12.3 매니저 싱글톤 패턴

```typescript
// 하이퍼캐주얼에 적합한 심플한 싱글톤
class AudioManager {
  private static instance: AudioManager;
  private scene: Phaser.Scene;

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  init(scene: Phaser.Scene) {
    this.scene = scene;
  }

  playSFX(key: string) {
    this.scene.sound.play(key);
  }

  playBGM(key: string) {
    this.scene.sound.play(key, { loop: true });
  }
}

// 사용 예시
// BootScene에서: AudioManager.getInstance().init(this);
// GameScene에서: AudioManager.getInstance().playSFX('jump');
```

### 12.4 Firebase 초기화 가이드

```typescript
// src/managers/FirebaseManager.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ... 나머지 설정
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// BootScene에서 호출
export async function initFirebase() {
  await signInAnonymously(auth);
  console.log('Firebase initialized, UID:', auth.currentUser?.uid);
}
```

### 12.5 기본 에러 처리

```typescript
// 간단한 에러 처리 (토스트 + 재시도)
async function safeFirebaseCall<T>(
  fn: () => Promise<T>,
  fallback?: T
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    console.error('Firebase error:', error);
    showToast('연결 오류. 다시 시도해주세요.');
    return fallback ?? null;
  }
}

// 사용 예시
const userData = await safeFirebaseCall(
  () => getDoc(doc(db, 'users', uid)),
  null
);

// 토스트 표시 (Phaser에서)
function showToast(message: string) {
  // 화면 하단에 일시적으로 메시지 표시
  const toast = this.add.text(400, 700, message, {
    fontSize: '18px',
    backgroundColor: '#333'
  }).setOrigin(0.5);

  this.tweens.add({
    targets: toast,
    alpha: 0,
    y: 650,
    duration: 2000,
    onComplete: () => toast.destroy()
  });
}
```

### 12.6 Phaser 설정 (GameConfig.ts)

```typescript
// src/config/GameConfig.ts
import Phaser from 'phaser';
import { BootScene, MenuScene, GameScene, GameOverScene, ShopScene, HouseScene } from '../scenes';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 1200,
  parent: 'game-container',
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 1000 },
      debug: import.meta.env.DEV
    }
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene, ShopScene, HouseScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};
```

### 12.7 에셋 목록

```text
public/assets/
├── sprites/
│   ├── cat_idle.png          # 고양이 기본 (64x64)
│   ├── cat_jump.png          # 점프 스프라이트시트
│   ├── cat_land.png          # 착지 이펙트
│   ├── can_normal.png        # 일반 캔 (48x24)
│   ├── can_gold.png          # 황금 캔
│   ├── can_gift.png          # 선물 캔
│   ├── can_trap.png          # 함정 캔
│   ├── coin.png              # 코인 아이콘
│   └── ui_atlas.png          # UI 스프라이트시트
├── audio/
│   ├── bgm_menu.mp3          # 메뉴 배경음악
│   ├── bgm_game.mp3          # 게임 배경음악
│   ├── sfx_jump.wav          # 점프 효과음
│   ├── sfx_land_perfect.wav  # Perfect 착지
│   ├── sfx_land_good.wav     # Good 착지
│   ├── sfx_coin.wav          # 코인 획득
│   ├── sfx_combo.wav         # 콤보 증가
│   └── sfx_gameover.wav      # 게임오버
└── fonts/
    └── game_font.ttf         # 커스텀 폰트 (선택)
```

### 12.8 환경변수 템플릿 (.env.example)

```env
# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# AdMob (Capacitor 빌드 시)
VITE_ADMOB_APP_ID_ANDROID=ca-app-pub-xxx
VITE_ADMOB_APP_ID_IOS=ca-app-pub-xxx
VITE_ADMOB_BANNER_ID=ca-app-pub-xxx/xxx
VITE_ADMOB_INTERSTITIAL_ID=ca-app-pub-xxx/xxx
VITE_ADMOB_REWARDED_ID=ca-app-pub-xxx/xxx

# 개발 환경
VITE_DEBUG_MODE=true
```

### 12.9 백엔드 서비스 추상화 (마이그레이션 대비)

**ROI**: 초기 +3시간 투자 → 마이그레이션 시 10시간+ 절약

```typescript
// src/services/IDataService.ts - 인터페이스 정의
export interface IDataService {
  // Auth
  signInAnonymously(): Promise<string>;
  getCurrentUserId(): string | null;

  // User Data
  getUser(uid: string): Promise<UserData | null>;
  saveUser(uid: string, data: Partial<UserData>): Promise<void>;

  // Leaderboard
  getLeaderboard(limit: number): Promise<LeaderboardEntry[]>;
  submitScore(uid: string, score: number): Promise<void>;

  // Save/Load
  saveGameProgress(uid: string, progress: GameProgress): Promise<void>;
  loadGameProgress(uid: string): Promise<GameProgress | null>;
}

// src/services/FirebaseDataService.ts - Firebase 구현체
export class FirebaseDataService implements IDataService {
  async signInAnonymously(): Promise<string> {
    const result = await firebaseSignInAnonymously(auth);
    return result.user.uid;
  }

  async getUser(uid: string): Promise<UserData | null> {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as UserData : null;
  }

  async saveUser(uid: string, data: Partial<UserData>): Promise<void> {
    await setDoc(doc(db, 'users', uid), data, { merge: true });
  }

  async getLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
    const q = query(
      collection(db, 'leaderboard'),
      orderBy('score', 'desc'),
      firestoreLimit(limit)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as LeaderboardEntry);
  }

  // ... 나머지 메서드 구현
}

// src/managers/DataManager.ts - 싱글톤 프록시
class DataManager {
  private static instance: DataManager;
  private service!: IDataService;

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  init(service: IDataService) {
    this.service = service;
  }

  // 프록시 메서드들
  signIn = () => this.service.signInAnonymously();
  getUser = (uid: string) => this.service.getUser(uid);
  saveScore = (uid: string, score: number) => this.service.submitScore(uid, score);
  getLeaderboard = (limit: number) => this.service.getLeaderboard(limit);
}

// 사용 예시 (BootScene.ts)
DataManager.getInstance().init(new FirebaseDataService());

// 나중에 Supabase로 마이그레이션 시
// DataManager.getInstance().init(new SupabaseDataService());
```

**폴더 구조 (업데이트)**:

```text
src/
├── services/             # 백엔드 추상화
│   ├── IDataService.ts       # 인터페이스
│   ├── FirebaseDataService.ts # Firebase 구현체
│   └── index.ts              # export
├── managers/
│   ├── DataManager.ts        # 서비스 프록시
│   ├── AudioManager.ts
│   ├── ScoreManager.ts
│   └── SaveManager.ts
├── scenes/
├── objects/
├── config/
├── types/
└── index.ts
```

---

## 최종 정리

**총 시스템 수**: 약 50개

**핵심 시스템** (P0): 25개
**중요 시스템** (P1): 18개
**추가 시스템** (P2): 7개

**구현 예상 기간**:
- MVP (P0): 6주
- 소셜/폴리싱 (P1): 2주
- 총 8주 (2개월)

**기술 스택**:
- Frontend: Phaser 3 + TypeScript + Vite
- Mobile: Capacitor
- Backend: Firebase (Auth, Firestore, Functions, Analytics, FCM)
- Monetization: AdMob + Google Play Billing + Apple IAP

**다음 단계**:
1. 기술 스택 셋업 (Phaser 3 + TypeScript + Vite)
2. 코어 게임플레이 프로토타입 (점프 + 착지)
3. 난이도 시스템 구현
4. 점수/콤보 시스템 연동
5. 경제 시스템 (코인/에너지)
6. 리텐션 시스템 (미션/로그인 보상)
7. 백엔드 통합 (Firebase)
8. 수익화 (광고 + IAP)
9. 소셜 기능
10. 폴리싱 및 런칭

---

**문서 끝**
