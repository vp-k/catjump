Task 도구로 game-producer 서브에이전트를 호출하세요.

## 호출 방법

```text
Task(
  subagent_type: "game-producer",
  prompt: "Cat Jump 프로젝트 프로듀서로서 작업을 수행하세요.

## 프로젝트 문서
- docs/game-design.md - 게임 기획서 (v1.6.2)
- docs/system-architecture.md - 시스템 아키텍처 (v1.1)
- docs/asset-list.md - 에셋 목록 (v1.1)
- docs/implementation-schedule.md - 구현 일정표 (v1.1)
- docs/firebase-setup-guide.md - Firebase 셋업 가이드 (v1.0)

## 역할
- 게임 개발 전체 라이프사이클 관리
- 프로젝트 진행 상황 파악
- 다음 단계 안내

## 요청 사항
$ARGUMENTS"
)
```

**즉시 위 Task를 실행하세요. 설명 없이 바로 서브에이전트를 호출하세요.**
