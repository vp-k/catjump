# Cat Jump: Tower Stack - 문서 가이드

**문서 버전**: 1.1
**작성일**: 2025-11-29
**최종 수정**: 2025-11-29

---

## 문서 구조

```
docs/
├── README.md                    ← 현재 문서 (문서 가이드)
│
├── [기획] ─────────────────────────────────────────────
│   ├── game-design.md           게임 기획서 (마스터)
│   ├── stacking-mechanics.md    스태킹 메카닉 상세
│   └── ui-flow.md               UI/UX 플로우 다이어그램
│
├── [설계] ─────────────────────────────────────────────
│   ├── system-architecture.md   시스템 아키텍처
│   ├── tech-spec.md             기술 명세서
│   └── firebase-setup-guide.md  Firebase 셋업 가이드
│
├── [에셋] ─────────────────────────────────────────────
│   ├── asset-list.md            에셋 목록 (전체)
│   └── asset-generator-plan.md  에셋 제네레이터 계획서
│
├── [개발] ─────────────────────────────────────────────
│   ├── implementation-schedule.md  구현 일정표
│   └── progress.md                 개발 진행 체크리스트
│
└── [출시] ─────────────────────────────────────────────
    ├── test-plan.md             테스트 계획서
    └── deployment-checklist.md  배포 체크리스트
```

---

## 문서별 역할

### 기획 문서

| 문서 | 버전 | 역할 | 대상 |
|------|------|------|------|
| **game-design.md** | v1.6.2 | 마스터 기획서. 게임 전체 설계 | 전체 팀 |
| **stacking-mechanics.md** | v1.3 | 코어 메카닉 상세 (캔 스태킹) | 개발자 |
| **ui-flow.md** | v1.0 | 화면 전환, 팝업 시스템 | 개발자, 디자이너 |

### 설계 문서

| 문서 | 버전 | 역할 | 대상 |
|------|------|------|------|
| **system-architecture.md** | v1.1 | 시스템 구조, 클래스 설계 | 개발자 |
| **tech-spec.md** | v1.2 | 기술 스택, 라이브러리 | 개발자 |
| **firebase-setup-guide.md** | v1.0 | Firebase 설정 가이드 | 개발자 |

### 에셋 문서

| 문서 | 버전 | 역할 | 대상 |
|------|------|------|------|
| **asset-list.md** | v1.1 | 전체 에셋 목록 (P0/P1/P2) | 디자이너, 개발자 |
| **asset-generator-plan.md** | v1.0 | 에셋 자동 생성 도구 계획 | 개발자 |

### 개발 문서

| 문서 | 버전 | 역할 | 대상 |
|------|------|------|------|
| **implementation-schedule.md** | v1.1 | 9주 구현 일정 (Week 0~8) | PM, 개발자 |
| **progress.md** | v2.0 | 개발 진행 체크리스트 | PM, 개발자 |

### 출시 문서

| 문서 | 버전 | 역할 | 대상 |
|------|------|------|------|
| **test-plan.md** | v1.0 | 테스트 전략 및 케이스 | QA, 개발자 |
| **deployment-checklist.md** | v1.0 | 배포 체크리스트 | PM, 개발자 |

---

## 문서 의존 관계

```
game-design.md (마스터)
    │
    ├──→ stacking-mechanics.md (메카닉 상세)
    ├──→ ui-flow.md (UI 상세)
    │
    ├──→ system-architecture.md (시스템 설계)
    │       │
    │       ├──→ tech-spec.md (기술 스택)
    │       └──→ firebase-setup-guide.md (Firebase)
    │
    ├──→ asset-list.md (에셋 목록)
    │       │
    │       └──→ asset-generator-plan.md (생성 도구)
    │
    └──→ implementation-schedule.md (구현 일정)
            │
            ├──→ progress.md (진행 체크리스트)
            ├──→ test-plan.md (테스트 계획)
            └──→ deployment-checklist.md (배포)
```

---

## 문서 동기화 상태

| 문서 | 기반 문서 | 동기화 상태 |
|------|----------|------------|
| stacking-mechanics.md | game-design.md v1.6.2 | ✅ 최신 |
| ui-flow.md | game-design.md v1.6.2 | ✅ 최신 |
| system-architecture.md | game-design.md v1.6.2 | ✅ 최신 |
| tech-spec.md | game-design.md v1.6.2 | ✅ 최신 |
| asset-list.md | game-design.md v1.6.2 | ✅ 최신 |
| implementation-schedule.md | system-architecture.md v1.1 | ✅ 최신 |
| progress.md | implementation-schedule.md v1.1 | ✅ 최신 |
| test-plan.md | game-design.md v1.6.2 | ✅ 최신 |
| deployment-checklist.md | implementation-schedule.md | ✅ 최신 |

---

## 추가 도구 문서

```
tools/
└── asset-generator/
    └── docs/
        ├── implementation_plan.md    구현 계획서
        └── designer-upgrade-list.md  디자이너 업그레이드 목록
```

| 문서 | 역할 |
|------|------|
| **implementation_plan.md** | Asset Generator 구현 상세 |
| **designer-upgrade-list.md** | 생성 에셋 분류 (디자인프리/업그레이드 필요) |

---

## 문서 업데이트 규칙

### 버전 관리

- **Major (v1.x → v2.0)**: 구조 변경, 대규모 수정
- **Minor (v1.0 → v1.1)**: 섹션 추가, 중요 수정
- **Patch (v1.1.0 → v1.1.1)**: 오타, 경미한 수정

### 동기화 규칙

1. **game-design.md** 수정 시 → 의존 문서 검토
2. **implementation-schedule.md** 수정 시 → progress.md 업데이트
3. **asset-list.md** 수정 시 → designer-upgrade-list.md 검토

### 헤더 표준

모든 문서는 다음 헤더 포함:

```markdown
# 문서 제목

**문서 버전**: x.x
**작성일**: YYYY-MM-DD
**최종 수정**: YYYY-MM-DD
**기반 문서**: 부모문서.md vX.X
```

---

## 현재 상태 요약

- **기획**: 완료 (game-design.md v1.6.2)
- **설계**: 완료 (system-architecture.md v1.1)
- **에셋**: Asset Generator 구현 완료 (86개 생성)
- **개발**: Week 0 대기
- **출시**: 문서 준비 완료

### 다음 작업

1. [x] progress.md를 implementation-schedule.md에 맞게 업데이트 (v2.0)
2. [x] tech-spec.md를 game-design.md v1.6.2에 동기화 (v1.2)
3. [x] stacking-mechanics.md를 game-design.md v1.6.2에 동기화 (v1.3)

**모든 문서 동기화 완료!** (2025-11-29)

---

**문서 끝**
