# CATJUMP - 긴급 테스트 전략 (Game Producer Report)

**작성일**: 2025-11-29
**현재 단계**: Week 6 완료 (PRODUCTION 단계)
**긴급도**: HIGH - 코어 게임플레이 검증 필요

---

## 1. 현재 상황 분석

### 프로젝트 상태
```
Phase: PRODUCTION (4/8)
Progress: Week 6 완료 (MVP + 수익화 시스템 완성)
Next Milestone: Week 7 (소셜 기능)

문제점: 코어 게임플레이가 정상 동작하지 않음
```

### 코드 분석 결과

#### GameScene.ts 흐름 분석
```
create() 호출 순서:
1. createBackground()         OK - 배경 생성
2. createCanGroup()            OK - 캔 그룹 생성
3. createInitialStack()        OK - 첫 캔 배치 (720/2, 1180, wide)
4. createCat()                 OK - 고양이 생성 (720/2, 1180-30-35=1115)
5. createUI()                  OK - UI 생성
6. setupInput()                OK - 입력 설정
7. setupCollisions()           OK - 충돌 설정
8. startTutorial()             OK - 튜토리얼 시작
9. initGhostRace()             OK - 고스트 초기화 (비동기)
10. spawnNextCan()             ??? - 첫 번째 움직이는 캔 생성
```

#### 잠재적 문제점 발견

##### 1. 초기 캔 위치 (createInitialStack)
- 위치: `(360, 1180)` (화면 하단 100px)
- 화면 높이: `1280px`
- 문제 가능성: 초기 캔이 화면 밖에 있을 수 있음

##### 2. 고양이 초기 위치 (createCat)
- 계산: `y = 1280 - 100 - 30 - 35 = 1115`
- 초기 캔 y: `1180`
- 고양이 y: `1115`
- 문제: 고양이가 캔 위에 떠있음 (1115 < 1180 이므로 위에 있음)
- 예상: 중력에 의해 떨어져야 하지만 충돌 설정 문제 가능

##### 3. 캔 스폰 로직 (spawnNextCan)
```typescript
const topCan = this.stackedCans[this.stackedCans.length - 1];
const newY = topCan.y - GAME_CONFIG.CAN_HEIGHT; // 1180 - 60 = 1120
```
- 첫 번째 움직이는 캔 y: `1120`
- 고양이 y: `1115`
- 문제: 고양이가 떨어지기 전에 캔이 고양이와 겹침

##### 4. 충돌 감지 조건 (onCatLandOnCan)
```typescript
// 고양이가 아래로 떨어지고 있을 때만 처리
if (catBody.velocity.y <= 0) return;

// 공중에 있을 때만 처리
if (!cat.isInAir) return;
```
- 문제: 초기 상태에서 고양이가 idle 상태일 수 있음
- 중력 적용이 늦어지면 충돌 감지 실패 가능

##### 5. 캔 이동 조건 (handleJump)
```typescript
if (this.cat.jump()) {
  // 점프 성공 시 현재 캔 이동 시작
  if (this.currentCan && !this.currentCan.isStacked) {
    // 이미 움직이고 있음
  }
}
```
- 문제: 캔이 spawnNextCan()에서 이미 이동 시작됨 (line 377)
- 점프와 관계없이 캔이 이동함 (정상 동작)

##### 6. 튜토리얼 간섭
```typescript
private isTutorialActive = false;

startTutorial(): void {
  this.isTutorialActive = TutorialManager.startTutorial();
}
```
- 문제: 튜토리얼이 활성화되면 게임 진행 방해 가능성

---

## 2. 테스트 전략

### Phase 1: 기본 검증 (30분)

#### Test Case 1: 초기 화면 검증
```
목적: 화면에 캔과 고양이가 제대로 보이는가?

테스트 순서:
1. 게임 시작
2. 초기 화면 확인
   - 첫 캔이 화면 하단에 보이는가?
   - 고양이가 캔 위에 보이는가?
   - 움직이는 캔이 화면에 나타나는가?

예상 결과:
✅ 첫 캔: 화면 하단 100px 위치
✅ 고양이: 첫 캔 위 약 95px 위치
✅ 움직이는 캔: 첫 캔 위 60px (1120y)

실패 시나리오:
❌ 캔이 화면 밖
❌ 고양이가 보이지 않음
❌ 움직이는 캔이 안 나타남
```

#### Test Case 2: 점프 동작 검증
```
목적: 점프 버튼이 작동하는가?

테스트 순서:
1. 화면 터치/클릭
2. 고양이 점프 확인
   - 점프 모션이 보이는가?
   - 점프 사운드가 들리는가?
   - 고양이가 위로 올라가는가?

예상 결과:
✅ 점프 모션 애니메이션
✅ 점프 사운드 재생
✅ velocity.y = -500 적용

실패 시나리오:
❌ 클릭해도 반응 없음
❌ 고양이가 안 움직임
❌ 사운드 안 남
```

#### Test Case 3: 착지 검증
```
목적: 착지 판정이 작동하는가?

테스트 순서:
1. 점프
2. 캔 위에 착지 시도
3. 착지 판정 확인
   - Perfect/Good/Miss 텍스트가 나타나는가?
   - 착지 사운드가 들리는가?
   - 다음 캔이 스폰되는가?
   - 층수/점수가 올라가는가?

예상 결과:
✅ 착지 판정 텍스트 표시
✅ 착지 사운드 재생
✅ 다음 캔 스폰
✅ UI 업데이트

실패 시나리오:
❌ 착지해도 반응 없음
❌ 다음 캔 안 나옴
❌ 점수 안 올라감
❌ 고양이가 캔을 통과함
```

### Phase 2: 디버그 로깅 (1시간)

#### 추가할 로그 포인트
```typescript
// GameScene.ts

// 1. create() 시작
create(): void {
  console.log('[GameScene] create() 시작');
  console.log('[GameScene] 화면 크기:', this.cameras.main.width, this.cameras.main.height);
  // ...
}

// 2. 초기 캔 생성
createInitialStack(): void {
  console.log('[GameScene] 초기 캔 생성:', width / 2, height - 100);
  // ...
}

// 3. 고양이 생성
createCat(): void {
  const catY = height - 100 - GAME_CONFIG.CAN_HEIGHT / 2 - 35;
  console.log('[GameScene] 고양이 생성:', width / 2, catY);
  // ...
}

// 4. 캔 스폰
spawnNextCan(): void {
  console.log('[GameScene] 캔 스폰:', {
    floor: GameManager.currentFloor,
    topCan: topCan.y,
    newY,
    canType,
    speed
  });
  // ...
}

// 5. 점프
handleJump(): void {
  console.log('[GameScene] 점프 시도:', {
    isPlaying: GameManager.isPlaying,
    isTutorial: this.isTutorialActive,
    catState: this.cat.catState,
  });
  // ...
}

// 6. 충돌
onCatLandOnCan(): void {
  console.log('[GameScene] 충돌 감지:', {
    catX: cat.x,
    catY: cat.y,
    catVelY: catBody.velocity.y,
    canX: can.x,
    canY: can.y,
    canType: can.canType,
    isStacked: can.isStacked,
    isInAir: cat.isInAir,
  });
  // ...
}
```

### Phase 3: 문제 해결 체크리스트 (2시간)

#### Checkpoint 1: 물리 엔진 확인
```
[ ] Phaser Physics가 활성화되어 있는가?
[ ] Cat에 Physics Body가 있는가?
[ ] Can에 Physics Body가 있는가?
[ ] 중력이 적용되고 있는가?
[ ] 충돌 감지가 활성화되어 있는가?

확인 방법:
- Phaser DevTools 또는 브라우저 콘솔
- console.log(this.cat.body)
- console.log(this.currentCan.body)
```

#### Checkpoint 2: 초기 상태 확인
```
[ ] 고양이가 첫 캔 위에 있는가?
[ ] 고양이가 idle 상태인가?
[ ] 첫 움직이는 캔이 스폰되었는가?
[ ] 캔이 이동하고 있는가?

확인 방법:
- 브라우저 화면 육안 확인
- console.log(this.cat.catState)
- console.log(this.currentCan?.x)
```

#### Checkpoint 3: 입력 처리 확인
```
[ ] 클릭 이벤트가 등록되어 있는가?
[ ] 스페이스바 이벤트가 등록되어 있는가?
[ ] handleJump()이 호출되는가?
[ ] cat.jump()가 true를 반환하는가?

확인 방법:
- 화면 클릭 시 콘솔 로그 확인
- this.input.on('pointerdown') 확인
```

#### Checkpoint 4: 충돌 처리 확인
```
[ ] Collider가 생성되어 있는가?
[ ] onCatLandOnCan()이 호출되는가?
[ ] 조건문을 통과하는가?
[ ] processLanding()이 호출되는가?

확인 방법:
- 착지 시도 시 콘솔 로그 확인
- 조건문 각 단계에 로그 추가
```

#### Checkpoint 5: 튜토리얼 간섭 확인
```
[ ] 튜토리얼이 점프를 막고 있는가?
[ ] TutorialManager.startTutorial() 반환값은?
[ ] isTutorialActive가 true인가?

확인 방법:
- console.log(this.isTutorialActive)
- TutorialManager 비활성화 테스트
```

---

## 3. 단계별 수정 계획

### Step 1: 디버그 모드 추가 (30분)

```typescript
// GameScene.ts - create() 시작 부분에 추가

create(): void {
  // 디버그 모드 활성화
  const DEBUG_MODE = true;

  if (DEBUG_MODE) {
    // 물리 디버그 표시
    this.physics.world.createDebugGraphic();

    // FPS 표시
    const fpsText = this.add.text(10, 10, '', {
      fontSize: '14px',
      color: '#00ff00'
    }).setScrollFactor(0).setDepth(1000);

    this.events.on('update', () => {
      fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
    });
  }

  // ... 기존 코드
}
```

### Step 2: 초기 위치 수정 (필요 시) (15분)

```typescript
// 초기 캔이 화면 밖에 있는 경우
createInitialStack(): void {
  const { width, height } = this.cameras.main;

  // 수정: 화면 하단에서 150px 위로 (여유 공간)
  const initialCan = new Can(
    this,
    width / 2,
    height - 150,  // 기존: height - 100
    'wide'
  );
  // ...
}

createCat(): void {
  const { width, height } = this.cameras.main;

  // 수정: 초기 캔 위치에 맞춰 조정
  this.cat = new Cat(
    this,
    width / 2,
    height - 150 - GAME_CONFIG.CAN_HEIGHT / 2 - 35  // 기존: height - 100
  );
}
```

### Step 3: 충돌 감지 개선 (필요 시) (30분)

```typescript
private onCatLandOnCan(
  catObj: Phaser.Types.Physics.Arcade.GameObjectWithBody,
  canObj: Phaser.Types.Physics.Arcade.GameObjectWithBody
): void {
  const cat = catObj as Cat;
  const can = canObj as Can;

  // 디버그 로그
  console.log('[GameScene] 충돌 감지:', {
    catY: cat.y,
    catVelY: (cat.body as Phaser.Physics.Arcade.Body)?.velocity.y,
    canY: can.y,
    canType: can.canType,
    isStacked: can.isStacked,
    catState: cat.catState,
  });

  // 씬 종료 중이면 무시
  if (this.isShuttingDown) return;

  // 현재 캔이 아니면 무시
  if (can !== this.currentCan) return;

  // 이미 스택된 캔이면 무시
  if (can.isStacked) return;

  const catBody = cat.body as Phaser.Physics.Arcade.Body;
  if (!catBody) return;

  // 고양이가 아래로 떨어지고 있을 때만 처리
  if (catBody.velocity.y <= 0) {
    console.log('[GameScene] 충돌 무시: velocity.y <= 0');
    return;
  }

  // 공중에 있을 때만 처리
  if (!cat.isInAir) {
    console.log('[GameScene] 충돌 무시: not in air');
    return;
  }

  console.log('[GameScene] 착지 처리 시작');
  this.processLanding(can);
}
```

### Step 4: 튜토리얼 임시 비활성화 (5분)

```typescript
// GameScene.ts
create(): void {
  // ...

  // 튜토리얼 시작
  // this.startTutorial();  // 임시 주석 처리
  this.isTutorialActive = false;  // 강제 비활성화

  // ...
}
```

---

## 4. 테스트 시나리오

### 시나리오 A: 정상 플레이 (Happy Path)
```
1. 게임 시작
   EXPECT: 첫 캔 보임, 고양이 보임, 움직이는 캔 보임

2. 화면 터치
   EXPECT: 고양이 점프, 점프 사운드

3. 캔 중앙에 착지
   EXPECT: "Perfect!" 텍스트, 착지 사운드, 다음 캔 스폰

4. 계속 플레이 (5회)
   EXPECT: 층수 증가, 점수 증가, 콤보 표시

5. 의도적으로 미스
   EXPECT: "Miss" 텍스트, 고양이 떨어짐, 1초 후 게임 오버
```

### 시나리오 B: 엣지 케이스
```
1. 게임 시작 후 10초 대기
   EXPECT: 캔이 좌우로 왔다갔다 함

2. 캔이 화면 끝에 있을 때 점프
   EXPECT: 미스 판정, 게임 오버

3. 빠르게 연속 클릭 (10회)
   EXPECT: 한 번만 점프 (이중 점프 방지)

4. 점프 중에 다시 클릭
   EXPECT: 반응 없음 (공중에서 점프 불가)
```

### 시나리오 C: 특수 캔
```
1. 10층까지 올라가기
   EXPECT: 황금캔 등장 가능성

2. 황금캔에 착지
   EXPECT: 황금 이펙트, 5배 코인

3. 20층까지 올라가기
   EXPECT: 함정캔 등장 가능성

4. 함정캔에 착지
   EXPECT: 함정 이펙트, 즉시 게임 오버
```

---

## 5. 우선순위 작업 목록

### P0 (긴급 - 오늘 해결)
```
1. [ ] 디버그 로그 추가 (30분)
   - GameScene.ts에 로그 포인트 추가
   - 브라우저 콘솔에서 로그 확인

2. [ ] Phase 1 테스트 실행 (30분)
   - Test Case 1, 2, 3 실행
   - 실패 지점 파악

3. [ ] 문제 진단 (30분)
   - Checkpoint 1-5 체크
   - 근본 원인 파악

4. [ ] 긴급 수정 (1시간)
   - Step 1-4 중 필요한 것만 적용
   - 재테스트
```

### P1 (중요 - 내일 해결)
```
1. [ ] 전체 시나리오 테스트 (1시간)
   - 시나리오 A, B, C 실행
   - 엣지 케이스 검증

2. [ ] 튜토리얼 재활성화 및 테스트 (1시간)
   - 튜토리얼과 게임플레이 호환성 확인

3. [ ] 성능 프로파일링 (1시간)
   - FPS 확인
   - 메모리 누수 확인
```

### P2 (개선 - 이번 주 내)
```
1. [ ] 디버그 패널 강화
   - 실시간 상태 표시
   - 테스트 단축키 추가

2. [ ] 자동 테스트 스크립트 작성
   - 반복 테스트 자동화

3. [ ] 코드 리팩토링
   - 가독성 개선
   - 주석 추가
```

---

## 6. 다음 단계 (Week 7 진입 전)

### 블로킹 이슈 해결 후
```
1. Week 6 검증 완료
   - [ ] 코어 게임플레이 정상 동작
   - [ ] 에너지 시스템 동작
   - [ ] 미션 시스템 동작
   - [ ] 리텐션 시스템 동작
   - [ ] IAP/AdMob 동작

2. Week 7 진입 준비
   - [ ] 리더보드 설계 리뷰
   - [ ] 고스트 레이스 설계 리뷰
   - [ ] 공유 시스템 설계 리뷰
```

---

## 7. 프로듀서 코멘트

### 현재 상황
이 프로젝트는 **Week 6 완료 상태**(MVP + 수익화 완성)이지만,
**코어 게임플레이가 동작하지 않는다는 것은 치명적**입니다.

### 원인 추정
1. 빠른 개발 속도로 인한 검증 부족
2. 새 기능 추가 시 기존 기능 회귀 테스트 누락
3. UI 버튼 수정 과정에서 게임 로직 손상 가능성

### 권장 사항
1. **즉시 Week 7 진입 중단**
2. **코어 게임플레이 수정 최우선**
3. **수정 후 전체 회귀 테스트 필수**
4. **Week 7 진입은 코어 게임 검증 완료 후**

### 장기 개선 사항
1. CI/CD에 자동 테스트 추가
2. 주요 기능별 단위 테스트 작성
3. 주 1회 전체 플레이테스트 스케줄 추가

---

## 8. 연락 사항

### 디버그 모드 활성화 방법
```typescript
// GameScene.ts 상단에 추가
const DEBUG_MODE = true;
```

### 로그 확인 방법
```
1. Chrome DevTools 열기 (F12)
2. Console 탭 선택
3. [GameScene] 로그 필터링
4. 각 단계별 로그 확인
```

### 문제 발견 시 보고 양식
```
문제: [간단한 설명]
재현 단계: [1, 2, 3...]
예상 동작: [...]
실제 동작: [...]
로그: [관련 로그 복사]
```

---

**작성자**: Game Producer AI
**우선순위**: CRITICAL
**예상 해결 시간**: 2-3시간

**다음 단계**: 디버그 로그 추가 후 재테스트

---
