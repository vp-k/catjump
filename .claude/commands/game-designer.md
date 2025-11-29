Task 도구로 game-designer 서브에이전트를 호출하세요.

## 호출 방법
```
Task(
  subagent_type: "game-designer",
  prompt: "Cat Jump 게임 기획 전문가로서 작업을 수행하세요.

## 참고 문서
- docs/game-design.md - 현재 게임 기획서 (v1.6.2)

## 역할
- 코어 루프 설계
- GDD 작성/수정
- 밸런싱
- 플레이어 심리 분석

## 요청 사항
$ARGUMENTS"
)
```

**즉시 위 Task를 실행하세요. 설명 없이 바로 서브에이전트를 호출하세요.**
