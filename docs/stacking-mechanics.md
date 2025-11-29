# Cat Jump: Tower Stack - 스태킹 메카닉 디자인

> **버전**: 1.3 (game-design.md v1.6.2 동기화)
> **최종 수정**: 2025-11-29
> **v1.3 변경**: 함정캔, 심리 엔진, Mercy 시스템, Near-Miss 확장 반영

---

## 🎮 핵심 게임 루프

### 기본 흐름

```
1. 고양이가 캔 위에 서있음
2. 새 캔이 옆에서 밀고 들어옴
3. 탭 → 고양이 점프 (위로)
4. 새 캔이 기존 캔 위에 쌓임
5. 고양이가 새 캔 위에 착지
6. 점프 안 하면 → 캔에 밀려서 떨어짐 → 게임오버
```

### 캔 이동 방식

```typescript
// 캔이 옆에서 밀고 들어오는 방식
canDirection: 'left' | 'right'  // 랜덤 또는 난이도에 따라 결정
canSpeed: number                 // 층수에 따라 증가

// 캔이 화면 밖에서 시작 → 중앙으로 이동 → 고양이 위치에 도달
// 고양이가 점프하지 않으면 캔에 밀려서 떨어짐
```

---

## 💀 게임 오버 조건

### 1. 캔에 밀림 (메인)

- 점프 타이밍을 놓쳐서 캔에 밀려 떨어짐
- 가장 기본적인 게임오버 조건

### 2. 착지 실패 (Miss)

- 캔 밖에 착지하여 추락
- 점프는 했으나 타이밍/위치 잘못

---

## 🎯 착지 판정 시스템

### 판정 범위

| 판정 | 범위 | 점수 | 피드백 |
|------|------|------|--------|
| **Miss** | 캔 밖 | 0 | 게임오버 |
| **Good** | 캔 가장자리 30% | +10 | 고양이 휘청 + 작은 흔들림 |
| **Perfect!** | 캔 중심 40% | +25 | 이펙트 + 사운드 + 화면 펄스 |

### Phaser 구현

```typescript
// 착지 판정 계산
function calculateLandingPrecision(catX: number, canX: number, canWidth: number): LandingResult {
  const canCenter = canX + canWidth / 2;
  const offset = Math.abs(catX - canCenter);
  const perfectZone = canWidth * 0.2;  // 중심 40% = 좌우 20%씩
  const goodZone = canWidth * 0.35;    // 가장자리 30% 포함

  if (offset <= perfectZone) {
    return { type: 'perfect', score: 25 };
  } else if (offset <= goodZone) {
    return { type: 'good', score: 10 };
  } else {
    return { type: 'miss', score: 0 };
  }
}
```

---

## 🔥 콤보 시스템

### Perfect 연속 착지 보너스

| 연속 | 배율 | 피드백 |
|------|------|--------|
| 1회 | x1 | - |
| 2회 | x1.5 | "Nice!" |
| 3회 | x2 | "Great!" + 화면 컬러 쉬프트 |
| 5회 | x3 | "Amazing!" + 고양이 표정 변화 |
| 10회 | x5 | "LEGENDARY!" + 특별 이펙트 |

### 콤보 규칙

- **Good 착지 시 콤보 리셋** → 긴장감 유지
- 콤보 시각화: 고양이 뒤에 간식 탑이 쌓임
- 콤보 끊기면: 간식 탑 붕괴 이펙트

### Phaser 구현

```typescript
class ComboSystem {
  private combo: number = 0;
  private snackTower: Phaser.GameObjects.Group;

  onLanding(result: LandingResult): void {
    if (result.type === 'perfect') {
      this.combo++;
      this.addSnackToTower();
      this.showComboFeedback();
    } else if (result.type === 'good') {
      if (this.combo > 0) {
        this.collapseSnackTower();
      }
      this.combo = 0;
    }
  }

  getMultiplier(): number {
    if (this.combo >= 10) return 5;
    if (this.combo >= 5) return 3;
    if (this.combo >= 3) return 2;
    if (this.combo >= 2) return 1.5;
    return 1;
  }
}
```

---

## 🥫 특수 캔 시스템

### 캔 종류 (Phaser 최적화)

| 캔 종류 | 비주얼 (Phaser) | 효과 | 등장 시점 |
|---------|-----------------|------|-----------|
| 🥫 **기본캔** | 기본 스프라이트 | 없음 | 항상 |
| ⭐ **황금캔** | `setTint(0xFFD700)` + 알파 펄스 | 코인 3배 | 10층+ |
| 📦 **넓은캔** | `setScale(1.4, 1)` | Perfect 존 80%, 점수 절반 | 15층+ |
| 💀 **함정캔** | 검은색 + 해골 아이콘 | 착지 시 즉시 게임오버 | 20층+ |
| 🎁 **선물캔** | 리본 오버레이 스프라이트 | 랜덤 보상 | 25층+ |
| 💫 **흔들캔** | 트윈 좌우 흔들림 | 착지 타이밍 어려움 | 30층+ |

### Phaser 구현

```typescript
enum CanType {
  NORMAL = 'normal',
  GOLDEN = 'golden',
  WIDE = 'wide',
  TRAP = 'trap',
  GIFT = 'gift',
  WOBBLY = 'wobbly'
}

function createCan(scene: Phaser.Scene, type: CanType, x: number, y: number): Can {
  const can = scene.add.sprite(x, y, 'can');

  switch (type) {
    case CanType.GOLDEN:
      can.setTint(0xFFD700);
      scene.tweens.add({
        targets: can,
        alpha: { from: 1, to: 0.7 },
        duration: 300,
        yoyo: true,
        repeat: -1
      });
      break;

    case CanType.WIDE:
      can.setScale(1.4, 1);
      break;

    case CanType.TRAP:
      can.setTint(0x333333);
      const skull = scene.add.sprite(x, y, 'skull_icon');
      can.setData('skull', skull);
      break;

    case CanType.GIFT:
      const ribbon = scene.add.sprite(x, y - 10, 'ribbon');
      can.setData('ribbon', ribbon);
      break;

    case CanType.WOBBLY:
      scene.tweens.add({
        targets: can,
        x: { from: x - 20, to: x + 20 },
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      break;
  }

  return can;
}
```

### 캔 스폰 확률

```typescript
function getCanType(floor: number): CanType {
  const rand = Math.random() * 100;

  if (floor < 10) {
    return CanType.NORMAL;
  }

  if (floor >= 30) {
    // 50% 기본, 25% 좁은, 15% 흔들, 10% 황금
    if (rand < 10) return CanType.GOLDEN;
    if (rand < 25) return CanType.WOBBLY;
    if (rand < 50) return CanType.NARROW;
    return CanType.NORMAL;
  }

  if (floor >= 25) {
    // 선물캔 등장
    if (rand < 10) return CanType.GIFT;
  }

  if (floor >= 20) {
    // 좁은캔 등장
    if (rand < 20) return CanType.NARROW;
    if (rand < 30) return CanType.GOLDEN;
  }

  if (floor >= 15) {
    // 넓은캔 등장
    if (rand < 5) return CanType.WIDE;
    if (rand < 20) return CanType.GOLDEN;
  }

  if (floor >= 10) {
    // 황금캔만 등장
    if (rand < 15) return CanType.GOLDEN;
  }

  return CanType.NORMAL;
}
```

---

## 📈 난이도 곡선

### 층수별 설정

| 층수 | 캔 속도 | 캔 구성 | 방향 | 특징 |
|------|---------|---------|------|------|
| 0-10 | 1x (2000ms) | 기본 100% | 고정 | 적응 구간 |
| 10-20 | 1.2x (1700ms) | 기본 80%, 황금 15%, 넓은 5% | 고정 | 보상 학습 |
| 20-30 | 1.4x (1400ms) | 기본 60%, 좁은 20%, 황금 10%, 선물 10% | 랜덤 | 리스크/리워드 |
| 30-50 | 1.6x (1200ms) | 기본 50%, 좁은 25%, 흔들 15%, 황금 10% | 빈번 전환 | 본격 도전 |
| 50+ | 1.8x+ (1000ms) | 모든 캔 랜덤 | 불규칙 | 마스터 구간 |

### Phaser 구현

```typescript
function getDifficultySettings(floor: number): DifficultySettings {
  const baseSpeed = 2000;

  if (floor < 10) {
    return {
      canSpeed: baseSpeed,
      direction: 'fixed',
      directionChangeChance: 0
    };
  }

  if (floor < 20) {
    return {
      canSpeed: baseSpeed * 0.85,  // 1.2x faster
      direction: 'fixed',
      directionChangeChance: 0
    };
  }

  if (floor < 30) {
    return {
      canSpeed: baseSpeed * 0.7,   // 1.4x faster
      direction: 'random',
      directionChangeChance: 0.3
    };
  }

  if (floor < 50) {
    return {
      canSpeed: baseSpeed * 0.6,   // 1.6x faster
      direction: 'random',
      directionChangeChance: 0.5
    };
  }

  return {
    canSpeed: Math.max(1000, baseSpeed * 0.55),  // 1.8x+ faster, min 1000ms
    direction: 'random',
    directionChangeChance: 0.7
  };
}
```

---

## 🎨 시각적 피드백

### 착지 피드백

| 판정 | 시각 효과 | 사운드 |
|------|----------|--------|
| **Perfect** | 화면 펄스 + 파티클 + 캔 스케일 펄스 | "딩~" 고음 |
| **Good** | 고양이 휘청 + 캔 흔들림 | "퍽" 저음 |
| **Miss** | 화면 흔들림 + 페이드아웃 | 추락 효과음 |

### 콤보 피드백

| 콤보 | 시각 효과 |
|------|----------|
| 2연속 | "Nice!" 텍스트 팝업 |
| 3연속 | "Great!" + 화면 색상 살짝 밝아짐 |
| 5연속 | "Amazing!" + 고양이 눈 반짝 + 배경 색 변화 |
| 10연속 | "LEGENDARY!" + 화면 전체 이펙트 + 코인 비 |

### 고양이 감정 연출

| 상황 | 표정/애니메이션 |
|------|-----------------|
| 대기 | 꼬리 흔들기, 눈 깜빡 |
| Perfect | 눈 반짝 + 미소 |
| 콤보 5+ | 흥분한 표정 + 꼬리 빨리 흔듦 |
| Good (콤보 끊김) | 살짝 실망 표정 |
| 게임오버 직전 | 불안한 표정 |
| 게임오버 | 슬픈 표정 + "다시... 먹고 싶어..." |
| 최고기록 | 배 두드리며 만족 |

---

## 🧠 심리 피드백 연동

### Near-Miss 시스템 (v1.6.1 확장)

```typescript
// 게임오버 시 Near-Miss 메시지
function getGameOverMessage(lastLandingOffset: number, highScore: number, currentScore: number): string {
  const floorDiff = highScore - currentScore;

  // 최고기록 -1/-2/-3층 근접 알림 (v1.6.1)
  if (floorDiff === 1) {
    return `아깝다! 딱 1층만 더 갔으면...!`;
  }
  if (floorDiff === 2) {
    return `아쉬워! 최고기록까지 2층!`;
  }
  if (floorDiff === 3) {
    return `거의 다 왔어! 3층만 더!`;
  }

  // 착지 정밀도 Near-Miss (1px 차이)
  if (lastLandingOffset < 3) {
    return "1px 차이였어... 너무 아까워!";
  }

  return "다시... 먹고 싶어...";
}

// 메달 근접 감지 (v1.6.1)
function checkMedalProximity(currentFloor: number): void {
  const medals = { bronze: 25, silver: 50, gold: 100, platinum: 200 };

  for (const [medal, target] of Object.entries(medals)) {
    const diff = target - currentFloor;
    if (diff > 0 && diff <= 3) {
      showMessage(`${medal} 메달까지 ${diff}층!`, { urgent: true });
      break;
    }
  }
}
```

### 최고기록 근처 알림

```typescript
// 실시간 최고기록 비교
function checkHighScoreProximity(currentFloor: number, highScore: number): void {
  const diff = highScore - currentFloor;

  if (diff === 5) {
    showMessage("최고기록까지 5층!");
  } else if (diff === 2) {
    showMessage("최고기록까지 2층!", { urgent: true });
  } else if (diff === 0) {
    showMessage("최고기록 도달!", { celebration: true });
  }
}
```

### 손실 회피 시각화

```typescript
// 콤보 간식 탑 시스템
class SnackTowerVisualizer {
  private tower: Phaser.GameObjects.Group;

  addSnack(): void {
    // 콤보 증가 시 간식 하나 추가
    const snack = this.scene.add.sprite(x, y, 'snack');
    this.tower.add(snack);
  }

  wobble(): void {
    // Good 착지 시 탑 흔들림
    this.scene.tweens.add({
      targets: this.tower.getChildren(),
      x: '+=5',
      duration: 100,
      yoyo: true,
      repeat: 3
    });
  }

  collapse(): void {
    // 콤보 끊길 때 탑 붕괴
    this.tower.getChildren().forEach((snack, i) => {
      this.scene.tweens.add({
        targets: snack,
        y: '+=300',
        x: `+=${(Math.random() - 0.5) * 100}`,
        angle: Math.random() * 360,
        alpha: 0,
        duration: 500,
        delay: i * 50,
        onComplete: () => snack.destroy()
      });
    });
  }
}
```

### Mercy 시스템 (v1.6 추가)

```typescript
// 연속 실패 보호 시스템
class MercySystem {
  private consecutiveFails: number = 0;
  private perfectZoneMultiplier: number = 1.0;
  private speedMultiplier: number = 1.0;

  onGameOver(): void {
    this.consecutiveFails++;

    // 연속 3회 실패: Perfect 존 20% 확대
    if (this.consecutiveFails >= 3) {
      this.perfectZoneMultiplier = 1.2;
    }

    // 연속 5회 실패: 캔 속도 15% 감소
    if (this.consecutiveFails >= 5) {
      this.speedMultiplier = 0.85;
    }
  }

  onSuccess(): void {
    // 10층 이상 도달 시 점진적 정상화
    this.consecutiveFails = Math.max(0, this.consecutiveFails - 1);

    if (this.consecutiveFails < 3) {
      this.perfectZoneMultiplier = 1.0;
    }
    if (this.consecutiveFails < 5) {
      this.speedMultiplier = 1.0;
    }
  }

  getPerfectZoneMultiplier(): number {
    return this.perfectZoneMultiplier;
  }

  getSpeedMultiplier(): number {
    return this.speedMultiplier;
  }
}
```

---

## 🏆 점수 시스템

### 기본 점수

- Perfect 착지: +25 × 콤보 배율
- Good 착지: +10 (콤보 리셋)

### 특수 캔 보너스

- 황금캔: 코인 3배
- 넓은캔: 점수 0.5배 (Perfect 존 80%)
- 함정캔: 착지 시 즉시 게임오버 (피해야 함!)
- 선물캔: 랜덤 보상 (코인/다이아/의상조각)

### 층수 보너스

- 10층 도달: +500
- 20층 도달: +1000
- 30층 도달: +2000
- 50층 도달: +5000

---

## 🎯 구현 우선순위

### Phase 1 (MVP)

- [ ] 캔이 옆에서 밀고 들어오는 메카닉
- [ ] 기본 점프 및 착지 판정 (Good/Perfect)
- [ ] 기본 점수 시스템
- [ ] 게임오버 처리

### Phase 2 (코어 시스템)

- [ ] 콤보 시스템 + 간식 탑 시각화
- [ ] 난이도 곡선 (속도/방향)
- [ ] 착지 피드백 (시각/사운드)
- [ ] 고양이 감정 시스템

### Phase 3 (특수 시스템)

- [ ] 특수 캔 (황금, 넓은, 함정, 선물, 흔들)
- [ ] Near-Miss 피드백 (v1.6.1 확장)
- [ ] 심리 메시지 시스템
- [ ] Mercy 시스템 (연속 실패 보호)

### Phase 4 (폴리싱)

- [ ] 콤보 끊김 시 탑 붕괴 이펙트
- [ ] 층수 보너스 연출
- [ ] 게임오버 화면 심리 메시지
- [ ] 메달 근접 감지 알림
- [ ] 유령 고양이 (친구/전체 기록)
