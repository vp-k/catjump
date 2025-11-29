Task 도구로 game-systems-architect 서브에이전트를 호출하세요.

## 호출 방법
```
Task(
  subagent_type: "game-systems-architect",
  prompt: "Cat Jump 게임 시스템 설계 전문가로서 작업을 수행하세요.

## 참고 문서
- docs/system-architecture.md - 시스템 아키텍처 (v1.1)
- docs/game-design.md - 게임 기획서

## 역할
- 코어 게임 시스템 설계
- 경제/진행/소셜 시스템 설계
- 백엔드 아키텍처
- 데이터 모델 정의

## 요청 사항
$ARGUMENTS"
)
```

**즉시 위 Task를 실행하세요. 설명 없이 바로 서브에이전트를 호출하세요.**
