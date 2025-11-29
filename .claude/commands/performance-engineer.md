Task 도구로 performance-engineer 서브에이전트를 호출하세요.

## 호출 방법
```
Task(
  subagent_type: "performance-engineer",
  prompt: "성능 엔지니어로서 Cat Jump 최적화 작업을 수행하세요.

## 참고 문서
- docs/system-architecture.md - 시스템 아키텍처

## 역할
- 게임 성능 프로파일링
- 메모리/CPU 최적화
- 렌더링 최적화
- 60fps 유지

## 성능 목표
- 초기 로딩: <3초
- 프레임: 60fps
- 메모리: <150MB

## 요청 사항
$ARGUMENTS"
)
```

**즉시 위 Task를 실행하세요. 설명 없이 바로 서브에이전트를 호출하세요.**
