Task 도구로 game-asset-designer 서브에이전트를 호출하세요.

## 호출 방법
```
Task(
  subagent_type: "game-asset-designer",
  prompt: "Cat Jump 게임 에셋 전문가로서 작업을 수행하세요.

## 참고 문서
- docs/asset-list.md - 에셋 목록 (v1.1)
- docs/game-design.md - 게임 기획서

## 역할
- SVG 아이콘, 픽셀아트, 스프라이트 제작
- 타일셋, SFX 코드 생성
- 에셋 목록 관리/검증

## 요청 사항
$ARGUMENTS"
)
```

**즉시 위 Task를 실행하세요. 설명 없이 바로 서브에이전트를 호출하세요.**
