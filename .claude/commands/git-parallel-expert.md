Task 도구로 git-parallel-expert 서브에이전트를 호출하세요.

## 호출 방법
```
Task(
  subagent_type: "git-parallel-expert",
  prompt: "Git 전문가로서 버전 관리 작업을 수행하세요.

## 브랜치 전략
main → develop → feature/*

## 역할
- Git 워크플로우 관리
- 브랜치 전략
- 커밋 메시지 작성
- 충돌 해결

## 요청 사항
$ARGUMENTS"
)
```

**즉시 위 Task를 실행하세요. 설명 없이 바로 서브에이전트를 호출하세요.**
