Task 도구로 parallel-orchestrator 서브에이전트를 호출하세요.

## 호출 방법
```
Task(
  subagent_type: "parallel-orchestrator",
  prompt: "병렬 오케스트레이터로서 독립적인 작업을 동시 실행하세요.

## 역할
- 독립적 태스크 식별
- 병렬 Task 호출 실행
- 결과 집계/병합

## 병렬 실행 패턴
여러 Task를 동시에 호출:
- Task(subagent_type: 'A', prompt: '...')
- Task(subagent_type: 'B', prompt: '...')

## 요청 사항
$ARGUMENTS"
)
```

**즉시 위 Task를 실행하세요. 설명 없이 바로 서브에이전트를 호출하세요.**
