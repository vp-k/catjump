# Cat Jump: Tower Stack - 테스트 계획서

**문서 버전**: 1.0
**작성일**: 2025-11-27
**기반 문서**: game-design.md v1.6.2, system-architecture.md v1.1

---

## 목차

1. [테스트 전략 개요](#1-테스트-전략-개요)
2. [단위 테스트](#2-단위-테스트)
3. [통합 테스트](#3-통합-테스트)
4. [E2E 테스트](#4-e2e-테스트)
5. [플레이테스트](#5-플레이테스트)
6. [성능 테스트](#6-성능-테스트)
7. [크로스 플랫폼 테스트](#7-크로스-플랫폼-테스트)
8. [광고/IAP 테스트](#8-광고iap-테스트)
9. [회귀 테스트](#9-회귀-테스트)
10. [버그 리포팅](#10-버그-리포팅)

---

## 1. 테스트 전략 개요

### 1.1 테스트 피라미드

```
           ┌─────────┐
           │  E2E    │  10% - 핵심 플로우
          ─┴─────────┴─
         ┌─────────────┐
         │  통합 테스트  │  20% - 시스템 연동
        ─┴─────────────┴─
       ┌─────────────────┐
       │   단위 테스트     │  70% - 핵심 로직
       └─────────────────┘
```

### 1.2 테스트 도구

| 도구 | 용도 |
|------|------|
| Vitest | 단위/통합 테스트 |
| Playwright | E2E 테스트 |
| Firebase Emulator | 백엔드 테스트 |
| Lighthouse | 성능 측정 |

### 1.3 테스트 일정

| Week | 테스트 활동 |
|------|------------|
| 1-2 | 단위 테스트 작성 (코어 시스템) |
| 3-4 | 통합 테스트 (UI + 게임 로직) |
| 5 | 백엔드 통합 테스트 |
| 6 | 광고/IAP 테스트 |
| 7 | 플레이테스트, 성능 테스트 |
| 8 | 크로스 플랫폼 테스트, 회귀 테스트 |
| 9 | 최종 QA, 버그 수정 |

---

## 2. 단위 테스트

### 2.1 코어 게임 시스템

#### 점프/착지 메카닉
```typescript
describe('JumpMechanics', () => {
  test('탭 입력 시 점프 실행', () => {});
  test('연속 탭 시 점프 무시 (공중)', () => {});
  test('Perfect 존 착지 판정 (±10px)', () => {});
  test('Good 존 착지 판정 (±30px)', () => {});
  test('Miss 판정 (범위 초과)', () => {});
  test('Near-Miss 판정 (5px 이내 Miss)', () => {});
});
```

#### 스코어링/콤보 시스템
```typescript
describe('ScoringSystem', () => {
  test('Perfect 착지 시 10점 + 콤보 보너스', () => {});
  test('Good 착지 시 5점 + 콤보 유지', () => {});
  test('콤보 배율 계산 (5연속 = x1.5)', () => {});
  test('콤보 10 달성 시 피버 모드 진입', () => {});
  test('Miss 시 콤보 리셋', () => {});
  test('코인 획득량 계산 (층수 기반)', () => {});
});
```

#### 캔 스포너 시스템
```typescript
describe('CanSpawner', () => {
  test('일반 캔 스폰 (기본 확률)', () => {});
  test('황금 캔 스폰 (5% 확률)', () => {});
  test('함정 캔 스폰 (10층 이후)', () => {});
  test('선물 캔 스폰 (럭키 이벤트)', () => {});
  test('난이도별 캔 크기 감소', () => {});
  test('캔 이동 속도 증가 (층수 비례)', () => {});
});
```

### 2.2 경제 시스템

```typescript
describe('EconomySystem', () => {
  test('코인 획득', () => {});
  test('코인 소비 (고양이 구매)', () => {});
  test('다이아몬드 획득', () => {});
  test('다이아몬드 소비 (광고 제거)', () => {});
  test('코인 ↔ 다이아 변환 불가 검증', () => {});
});
```

### 2.3 진행 시스템

```typescript
describe('ProgressionSystem', () => {
  test('경험치 획득', () => {});
  test('레벨업 조건 충족', () => {});
  test('환생 조건 (50층)', () => {});
  test('환생 보너스 적용', () => {});
  test('환생 되돌리기 (1시간 내)', () => {});
});
```

### 2.4 심리 엔진

```typescript
describe('PsychologyEngine', () => {
  test('Near-Miss 감지', () => {});
  test('자비 시스템 발동 (연속 5회 실패)', () => {});
  test('손실 회피 경고 표시', () => {});
  test('긍정 강화 메시지 표시', () => {});
  test('FOMO 알림 조건', () => {});
});
```

### 2.5 커버리지 목표

| 시스템 | 목표 커버리지 |
|--------|--------------|
| 코어 게임플레이 | 90%+ |
| 경제 시스템 | 85%+ |
| 진행 시스템 | 80%+ |
| UI 컴포넌트 | 70%+ |
| 유틸리티 | 90%+ |

---

## 3. 통합 테스트

### 3.1 Scene 전환 테스트

```typescript
describe('SceneTransitions', () => {
  test('Boot → Menu 전환', () => {});
  test('Menu → Game 전환', () => {});
  test('Game → GameOver 전환', () => {});
  test('GameOver → Menu 전환', () => {});
  test('Menu → Shop 전환', () => {});
  test('Menu → House 전환', () => {});
  test('모든 Scene 백 버튼 처리', () => {});
});
```

### 3.2 Firebase 연동 테스트

```typescript
describe('FirebaseIntegration', () => {
  test('익명 로그인 성공', () => {});
  test('사용자 데이터 저장', () => {});
  test('사용자 데이터 로드', () => {});
  test('리더보드 조회', () => {});
  test('점수 제출 (Cloud Function)', () => {});
  test('오프라인 모드 동작', () => {});
  test('네트워크 복구 시 동기화', () => {});
});
```

### 3.3 로컬 스토리지 + Firebase 동기화

```typescript
describe('DataSync', () => {
  test('로컬 데이터 캐싱', () => {});
  test('온라인 전환 시 동기화', () => {});
  test('충돌 해결 (서버 우선)', () => {});
  test('오프라인 진행 데이터 보존', () => {});
});
```

### 3.4 매니저 간 통신

```typescript
describe('ManagerCommunication', () => {
  test('GameManager → AudioManager 연동', () => {});
  test('GameManager → DataManager 연동', () => {});
  test('EventManager 이벤트 발행/구독', () => {});
  test('싱글톤 인스턴스 일관성', () => {});
});
```

---

## 4. E2E 테스트

### 4.1 핵심 플레이 플로우

```typescript
describe('CorePlayFlow', () => {
  test('게임 시작 → 점프 → 착지 → 게임오버 → 재시작', async () => {
    // 1. 메뉴에서 플레이 버튼 클릭
    // 2. 터치로 점프
    // 3. 착지 확인
    // 4. 의도적 실패
    // 5. 게임오버 확인
    // 6. 재시작 버튼 클릭
  });

  test('10층 달성 후 게임오버 → 리더보드 갱신', async () => {});
  test('50층 달성 → 환생 옵션 표시', async () => {});
});
```

### 4.2 상점 플로우

```typescript
describe('ShopFlow', () => {
  test('상점 진입 → 고양이 구매 → 장착', async () => {});
  test('코인 부족 시 구매 실패', async () => {});
  test('의상 구매 → 미리보기 → 장착', async () => {});
});
```

### 4.3 미션 플로우

```typescript
describe('MissionFlow', () => {
  test('일일 미션 확인 → 완료 → 보상 수령', async () => {});
  test('주간 미션 진행률 표시', async () => {});
  test('미션 갱신 (자정)', async () => {});
});
```

### 4.4 설정 플로우

```typescript
describe('SettingsFlow', () => {
  test('BGM 끄기 → 재시작 후 유지', async () => {});
  test('SFX 끄기 → 게임 중 무음 확인', async () => {});
  test('언어 변경 → UI 갱신', async () => {});
});
```

---

## 5. 플레이테스트

### 5.1 플레이테스트 체크리스트

#### 신규 유저 경험 (FTUE)
- [ ] 튜토리얼 명확성 (첫 5층)
- [ ] 조작 직관성
- [ ] 피드백 즉각성
- [ ] 첫 보상 만족도
- [ ] 이탈 지점 파악

#### 코어 루프 재미
- [ ] 점프 타이밍 난이도 적절성
- [ ] Perfect 판정 만족감
- [ ] 콤보 달성 성취감
- [ ] 난이도 곡선 적절성
- [ ] 세션 길이 적절성 (30초-2분)

#### 리텐션 요소
- [ ] 일일 보상 매력도
- [ ] 미션 목표 명확성
- [ ] 레벨업 보상 만족도
- [ ] 환생 동기 부여
- [ ] "한 판 더" 욕구

#### 수익화 수용도
- [ ] 광고 노출 빈도 적절성
- [ ] 보상형 광고 가치 인식
- [ ] IAP 가격 적절성
- [ ] 광고 제거 패키지 매력도

### 5.2 플레이테스트 지표

| 지표 | 목표값 | 측정 방법 |
|------|--------|----------|
| 평균 세션 시간 | 90초+ | Analytics |
| 일일 세션 수 | 5회+ | Analytics |
| D1 리텐션 | 40%+ | Analytics |
| FTUE 완료율 | 80%+ | 이벤트 추적 |
| 광고 시청률 | 30%+ | AdMob 리포트 |

### 5.3 플레이테스트 피드백 양식

```markdown
## 플레이테스트 피드백

**테스터**:
**날짜**:
**디바이스**:
**플레이 시간**:

### 재미 요소 (1-5점)
- 점프 조작:
- Perfect 착지 만족감:
- 난이도 적절성:
- 보상 만족도:

### 불편한 점
1.
2.
3.

### 좋았던 점
1.
2.
3.

### 기타 의견
```

---

## 6. 성능 테스트

### 6.1 성능 목표

| 지표 | 목표 | 최소 기준 |
|------|------|----------|
| 초기 로딩 | <3초 | <5초 |
| FPS | 60fps | 30fps |
| 메모리 | <150MB | <200MB |
| 배터리 (30분) | <10% | <15% |
| APK 크기 | <30MB | <50MB |

### 6.2 성능 테스트 시나리오

```typescript
describe('PerformanceTests', () => {
  test('초기 로딩 시간 측정', async () => {
    const startTime = performance.now();
    await loadGame();
    const loadTime = performance.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  test('100층 플레이 시 FPS 유지', async () => {
    // 자동 플레이로 100층까지 진행
    // 평균 FPS 측정
  });

  test('1시간 플레이 후 메모리 누수 검사', async () => {
    // 초기 메모리 측정
    // 1시간 자동 플레이
    // 최종 메모리 측정
    // 증가량 확인
  });

  test('오브젝트 풀링 효과 검증', async () => {
    // 풀링 ON/OFF 비교
  });
});
```

### 6.3 Lighthouse 점수 목표 (웹)

| 카테고리 | 목표 |
|---------|------|
| Performance | 90+ |
| Accessibility | 90+ |
| Best Practices | 90+ |
| PWA | 100 |

---

## 7. 크로스 플랫폼 테스트

### 7.1 테스트 디바이스 매트릭스

#### Android
| 디바이스 | OS 버전 | 해상도 |
|---------|---------|--------|
| Samsung Galaxy S21 | Android 13 | 1080x2400 |
| Samsung Galaxy A52 | Android 12 | 1080x2400 |
| Google Pixel 6 | Android 14 | 1080x2400 |
| Xiaomi Redmi Note 10 | Android 11 | 1080x2400 |
| 저사양 (에뮬레이터) | Android 10 | 720x1280 |

#### iOS
| 디바이스 | OS 버전 | 해상도 |
|---------|---------|--------|
| iPhone 15 | iOS 17 | 1179x2556 |
| iPhone 13 | iOS 16 | 1170x2532 |
| iPhone SE (3rd) | iOS 17 | 750x1334 |
| iPad Air (5th) | iPadOS 17 | 1640x2360 |

#### Web
| 브라우저 | 버전 |
|---------|------|
| Chrome | 최신 |
| Safari | 최신 |
| Firefox | 최신 |
| Edge | 최신 |

### 7.2 플랫폼별 체크리스트

#### Android
- [ ] 터치 반응성
- [ ] 백 버튼 처리
- [ ] 앱 스위칭 시 상태 유지
- [ ] 푸시 알림 수신
- [ ] 인앱 결제 동작

#### iOS
- [ ] 터치 반응성
- [ ] 노치/다이나믹 아일랜드 대응
- [ ] 앱 스위칭 시 상태 유지
- [ ] 푸시 알림 수신
- [ ] 인앱 결제 동작
- [ ] ATT 권한 요청

#### Web
- [ ] 키보드/마우스 대응
- [ ] 창 크기 조절 대응
- [ ] PWA 설치
- [ ] 오프라인 동작

---

## 8. 광고/IAP 테스트

### 8.1 AdMob 테스트

```typescript
describe('AdMobIntegration', () => {
  test('배너 광고 로드', () => {});
  test('전면 광고 로드 및 표시', () => {});
  test('보상형 광고 로드 및 표시', () => {});
  test('보상형 광고 완료 후 보상 지급', () => {});
  test('광고 로드 실패 시 폴백', () => {});
  test('광고 제거 구매 후 광고 미표시', () => {});
});
```

### 8.2 테스트 광고 ID 사용

```typescript
const TEST_AD_IDS = {
  banner: 'ca-app-pub-3940256099942544/6300978111',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
};
```

### 8.3 IAP 테스트

```typescript
describe('IAPIntegration', () => {
  test('상품 목록 조회', () => {});
  test('광고 제거 구매 플로우', () => {});
  test('다이아몬드 패키지 구매 플로우', () => {});
  test('구매 복원', () => {});
  test('영수증 검증 (Cloud Function)', () => {});
  test('네트워크 오류 시 처리', () => {});
});
```

### 8.4 테스트 계정

- **Google Play**: 라이선스 테스터 등록
- **App Store**: Sandbox 테스터 계정

---

## 9. 회귀 테스트

### 9.1 회귀 테스트 스위트

매 릴리즈 전 실행할 핵심 테스트:

```typescript
const REGRESSION_SUITE = [
  // 코어 게임플레이
  '점프 동작',
  'Perfect/Good/Miss 판정',
  '콤보 시스템',
  '게임오버 조건',

  // 데이터 연동
  '로그인',
  '데이터 저장/로드',
  '리더보드',

  // 수익화
  '광고 표시',
  'IAP 구매',

  // UI
  '모든 Scene 전환',
  '설정 저장',
];
```

### 9.2 자동화 CI/CD

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:unit

  e2e-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e

  build:
    needs: [unit-test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
```

---

## 10. 버그 리포팅

### 10.1 버그 리포트 템플릿

```markdown
## 버그 리포트

### 제목
[간단한 버그 설명]

### 심각도
- [ ] Critical (게임 불가)
- [ ] Major (핵심 기능 문제)
- [ ] Minor (불편함)
- [ ] Trivial (사소함)

### 환경
- **플랫폼**: Android / iOS / Web
- **디바이스**:
- **OS 버전**:
- **앱 버전**:

### 재현 절차
1.
2.
3.

### 예상 결과
[정상 동작]

### 실제 결과
[버그 상황]

### 스크린샷/영상
[첨부]

### 추가 정보
[로그, 에러 메시지 등]
```

### 10.2 버그 우선순위

| 심각도 | 수정 기한 | 예시 |
|--------|----------|------|
| Critical | 즉시 | 게임 크래시, 데이터 손실 |
| Major | 24시간 | 결제 오류, 점수 미반영 |
| Minor | 1주일 | UI 깨짐, 사운드 오류 |
| Trivial | 다음 릴리즈 | 오타, 미세한 정렬 |

### 10.3 버그 트래킹

- **도구**: GitHub Issues
- **라벨**: `bug`, `critical`, `major`, `minor`, `platform:android`, `platform:ios`, `platform:web`

---

## 부록: 테스트 명령어

```bash
# 단위 테스트
npm run test:unit

# 단위 테스트 (watch 모드)
npm run test:unit:watch

# 통합 테스트
npm run test:integration

# E2E 테스트
npm run test:e2e

# 전체 테스트
npm run test

# 커버리지 리포트
npm run test:coverage

# Firebase 에뮬레이터와 테스트
npm run test:firebase
```

---

**문서 끝**
