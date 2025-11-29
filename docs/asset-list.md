# Cat Jump: Tower Stack - 에셋 목록 (Asset List)

**문서 버전**: 1.1
**작성일**: 2025-11-27
**최종 수정**: 2025-11-27 (에셋 검증 완료, 47개 누락 항목 추가)
**기반 문서**: game-design.md v1.6.2, system-architecture.md v1.1

---

## 목차

1. [스프라이트/이미지 에셋](#1-스프라이트이미지-에셋)
   - 1.1 고양이 캐릭터
   - 1.2 간식캔
   - 1.3 UI 요소
   - 1.4 파티클/이펙트
   - 1.5 배경
2. [오디오 에셋](#2-오디오-에셋)
   - 2.1 BGM (배경음악)
   - 2.2 SFX (효과음)
3. [폰트](#3-폰트)
4. [우선순위 정리](#4-우선순위-정리)

---

## 1. 스프라이트/이미지 에셋

### 1.1 고양이 캐릭터

#### 1.1.1 메인 캐릭터: 통통한 러시안블루

| 에셋명 | 설명 | 크기 (px) | 프레임 수 | 포맷 | 우선순위 |
|--------|------|-----------|-----------|------|----------|
| `cat_idle.png` | 기본 대기 자세 (깜빡임 포함) | 128x128 | 4프레임 (30fps) | PNG-24 | P0 |
| `cat_jump.png` | 점프 시작 자세 | 128x128 | 2프레임 | PNG-24 | P0 |
| `cat_air.png` | 공중 자세 | 128x128 | 2프레임 (교차) | PNG-24 | P0 |
| `cat_land_perfect.png` | Perfect 착지 자세 (자신만만) | 128x128 | 3프레임 | PNG-24 | P0 |
| `cat_land_good.png` | Good 착지 자세 (휘청거림) | 128x128 | 4프레임 | PNG-24 | P0 |
| `cat_land_miss.png` | 낙하 자세 | 128x128 | 3프레임 | PNG-24 | P0 |
| `cat_happy.png` | 콤보/신기록 시 기쁜 표정 | 128x128 | 4프레임 | PNG-24 | P0 |
| `cat_sad.png` | 게임오버 시 슬픈 표정 | 128x128 | 3프레임 | PNG-24 | P0 |
| `cat_hungry.png` | 배고픈 표정 (게임 시작) | 128x128 | 4프레임 (배꼽 애니메이션) | PNG-24 | P1 |
| `cat_excited.png` | 눈 반짝반짝 (콤보 중) | 128x128 | 4프레임 | PNG-24 | P1 |
| `cat_sweat.png` | 긴장/땀 흘리는 표정 (Near-Miss) | 128x128 | 3프레임 | PNG-24 | P1 |
| `cat_satisfied.png` | 배 두드리며 만족하는 표정 | 128x128 | 4프레임 | PNG-24 | P1 |
| `cat_fall.png` | 낙하 중 표정 | 128x128 | 3프레임 | PNG-24 | P0 |
| `cat_parachute.png` | 낙하산 애니메이션 (Wave 0) | 128x128 | 6프레임 | PNG-24 | P1 |

**스타일 가이드**:
- 둥글둥글한 실루엣, 통통한 몸매 강조
- 큰 눈, 작은 코, 심플한 표정 (점, 선으로 표현)
- 회색-파랑빛 털 (러시안블루 특징)
- 부드러운 그라데이션 털 표현
- 모든 스프라이트는 중앙 정렬 (pivot: center)

#### 1.1.2 추가 고양이 (수집 요소)

| 에셋명 | 고양이 종류 | 특징 | 크기 | 우선순위 |
|--------|------------|------|------|----------|
| `cat_persian_set.png` | 페르시안 | 긴 털, 우아한 자세 | 128x128 | P1 |
| `cat_siamese_set.png` | 샴 | 날씬한 몸매, 크림색 | 128x128 | P1 |
| `cat_sphinx_set.png` | 스핑크스 | 무털, 주름진 피부 | 128x128 | P1 |
| `cat_munchkin_set.png` | 먼치킨 | 짧은 다리 강조 | 128x128 | P1 |
| `cat_scottish_set.png` | 스코티시폴드 | 접힌 귀 | 128x128 | P1 |

**노트**:
- 각 고양이는 기본 애니메이션 세트 필요 (idle, jump, land)
- 총 5종 x 10프레임 ≈ 50프레임
- Texture Atlas로 통합 권장

#### 1.1.3 고양이 의상 (커스터마이징)

| 카테고리 | 에셋명 예시 | 설명 | 크기 | 개수 | 우선순위 |
|---------|------------|------|------|------|----------|
| **모자** | `hat_*.png` | 산타모자, 왕관, 베레모, 헬멧 등 | 64x64 | 20종 | P1 |
| **안경** | `glasses_*.png` | 선글라스, 뿔테안경, 파티안경 등 | 64x64 | 10종 | P1 |
| **옷** | `costume_*.png` | 티셔츠, 드레스, 턱시도, 잠옷 등 | 128x128 | 30종 | P1 |
| **액세서리** | `accessory_*.png` | 나비넥타이, 목걸이, 리본 등 | 64x64 | 15종 | P1 |
| **특수의상** | `special_*.png` | 산타, 마법사, 해적, 우주비행사 등 | 128x128 | 15종 | P2 |
| **시즌한정** | `seasonal_*.png` | 크리스마스, 할로윈, 설날 등 | 128x128 | 10종 | P2 |

**노트**:
- 의상은 오버레이 방식으로 고양이 위에 겹쳐 표시
- 투명 배경 필수 (PNG-24 알파 채널)
- 고양이 애니메이션과 동기화 필요

#### 1.1.4 특수 고양이 에셋

| 에셋명 | 설명 | 크기 (px) | 용도 | 우선순위 |
|--------|------|-----------|------|----------|
| `cat_ghost.png` | 반투명 고양이 (유령) | 128x128 | 친구/최고기록 표시 | P1 |
| `cat_mystery_silhouette.png` | 미스터리 캣 실루엣 | 128x128 | Mystery Cat 럭키 이벤트 | P1 |

---

### 1.2 간식캔

#### 1.2.1 기본 간식캔 (5종)

| 에셋명 | 캔 종류 | 색상 | 크기 (px) | 설명 | 우선순위 |
|--------|---------|------|-----------|------|----------|
| `can_tuna.png` | 참치캔 | 파란색 | 128x64 | 기본 원통형 캔 | P0 |
| `can_salmon.png` | 연어캔 | 핑크색 | 128x64 | 연어 일러스트 | P0 |
| `can_chicken.png` | 닭고기캔 | 노란색 | 128x64 | 닭고기 일러스트 | P0 |
| `can_beef.png` | 소고기캔 | 빨간색 | 128x64 | 소고기 일러스트 | P0 |
| `can_mix.png` | 혼합캔 | 무지개색 | 128x64 | 다채로운 라벨 | P0 |

**스타일 가이드**:
- 원통형 (쌓기 최적화)
- 상단/측면 라벨 디자인
- 금속 질감 (하이라이트/그림자)
- 반사광 효과 (top 5px 화이트 그라데이션)

#### 1.2.2 특수 캔

| 에셋명 | 캔 종류 | 비주얼 특징 | 크기 (px) | 게임 효과 | 우선순위 |
|--------|---------|-------------|-----------|-----------|----------|
| `can_golden.png` | 황금캔 (⭐) | 금색 (0xFFD700) + 빛나는 효과 | 128x64 | 코인 3배 | P0 |
| `can_wide.png` | 넓은캔 (📦) | 1.4배 넓이 | 179x64 | 착지 쉬움, 점수 절반 | P0 |
| `can_gift.png` | 선물캔 (🎁) | 리본 장식 오버레이 | 128x64 | 랜덤 보상 | P0 |
| `can_narrow.png` | 좁은캔 (🎯) | 0.6배 좁이 | 77x64 | 착지 어려움, 점수 2배 | P0 |
| `can_shake.png` | 흔들캔 (💫) | 좌우 진동선 이펙트 | 128x64 ㅍ 좌우 흔들림 애니메이션 | P1 |
| `can_fake.png` | 가짜캔 (60층+) | 반투명 (50% 알파) | 128x64 | 착지 시 사라짐 | P1 |
| `can_invisible.png` | 투명캔 (70층+) | 윤곽선만 표시 | 128x64 | 거의 안 보임 | P1 |
| `can_reverse.png` | 역방향캔 (80층+) | 화살표 표시 | 128x64 | 반대 방향 이동 | P1 |

**애니메이션 요구사항**:
- `can_shake.png`: 4프레임 트윈 애니메이션 (좌우 3° 흔들림)
- `can_golden.png`: 알파 펄스 (0.7~1.0, 1초 주기)
- `can_fake.png`: 페이드아웃 애니메이션 (300ms)

#### 1.2.3 보스 캔 (특별 층)

| 에셋명 | 등장 층 | 디자인 특징 | 크기 (px) | 우선순위 |
|--------|---------|-------------|-----------|----------|
| `can_boss_25.png` | 25층 | 거대한 참치캔 (1.5배) | 192x96 | P1 |
| `can_boss_50.png` | 50층 | 황금 왕관 장식 캔  황금 왕관 장식 캔 | 192x96 | P1 |
| `can_boss_75.png` | 75층 | 다이아몬드 장식 캔 | 192x96 | P2 |
| `can_boss_100.png` | 100층 | 무지개 빛나는 캔 | 192x96 | P2 |

---

### 1.3 UI 요소

#### 1.3.1 버튼

| 에셋명 | 설명 | 크기 (px) | 상태 | 포맷 | 우선순위 |
|--------|------|-----------|------|------|----------|
| `btn_play_normal.png` | 플레이 버튼 | 200x60 | 기본 | PNG-24 | P0 |
| `btn_play_pressed.png` | 플레이 버튼 (눌림) | 200x60 | 눌림 | PNG-24 | P0 |
| `btn_play_disabled.png` | 플레이 버튼 (비활성) | 200x60 | 비활성 | PNG-24 | P0 |
| `btn_shop.png` | 상점 버튼 (3 상태) | 160x60 | - | PNG-24 | P0 |
| `btn_settings.png` | 설정 버튼 (3 상태) | 160x60 | - | PNG-24 | P0 |
| `btn_close.png` | 닫기 버튼 (X) | 48x48 | - | PNG-24 | P0 |
| `btn_adwatch.png` | 광고 시청 버튼 | 200x60 | - | PNG-24 | P0 |
| `btn_share.png` | 공유 버튼 | 160x60 | - | PNG-24 | P1 |
| `btn_leaderboard.png` | 리더보드 버튼 | 160x60 | - | PNG-24 | P1 |
| `btn_mission.png` | 미션 버튼 | 160x60 | - | PNG-24 | P0 |
| `btn_tournament.png` | 토너먼트 버튼 | 160x60 | - | PNG-24 | P1 |
| `btn_season.png` | 시즌/배틀패스 버튼 | 160x60 | - | PNG-24 | P1 |
| `btn_prestige.png` | 환생 버튼 (3 상태) | 160x60 | - | PNG-24 | P1 |
| `btn_transcend.png` | 초월 버튼 (3 상태) | 160x60 | - | PNG-24 | P2 |
| `btn_undo_prestige.png` | 환생 되돌리기 버튼 | 160x60 | - | PNG-24 | P1 |

**스타일 가이드**:
- 둥근 모서리 (border-radius: 10px)
- Flat + 살짝 그림자 (깊이감)
- 밝고 생동감 있는 파스텔 톤
- 넓은 여백 (최소 터치 영역 44x44px)

#### 1.3.2 아이콘

| 에셋명 | 설명 | 크기 (px) | 용도 | 우선순위 |
|--------|------|-----------|------|----------|
| `icon_coin.png` | 코인 아이콘 | 64x64 | 통화 표시 | P0 |
| `icon_diamond.png` | 다이아몬드 아이콘 | 64x64 | 프리미엄 통화 | P0 |
| `icon_energy.png` | 에너지 (하트) 아이콘 | 64x64 | 생명 시스템 | P0 |
| `icon_star.png` | 별 아이콘 | 64x64 | 등급/평가 | P0 |
| `icon_trophy.png` | 트로피 아이콘 | 64x64 | 업적 | P1 |
| `icon_gift.png` | 선물 아이콘 | 64x64 | 보상 | P1 |
| `icon_lock.png` | 자물쇠 아이콘 | 64x64 | 잠금 | P1 |
| `icon_check.png` | 체크 아이콘 | 48x48 | 완료 표시 | P0 |
| `icon_info.png` | 정보 아이콘 | 48x48 | 도움말 | P1 |
| `icon_volume.png` | 볼륨 아이콘 | 48x48 | 사운드 설정 | P0 |
| `icon_music.png` | 음악 아이콘 | 48x48 | 음악 설정 | P0 |
| `icon_vibrate.png` | 진동 아이콘 | 48x48 | 햅틱 설정 | P1 |
| `icon_mission.png` | 미션 아이콘 | 64x64 | 일일/주간 미션 | P0 |
| `icon_tournament.png` | 토너먼트 아이콘 | 64x64 | 주간 토너먼트 | P1 |
| `icon_season.png` | 시즌 아이콘 | 64x64 | 시즌/배틀패스 | P1 |
| `icon_prestige.png` | 환생 아이콘 | 64x64 | 환생 시스템 | P1 |
| `icon_transcend.png` | 초월 아이콘 | 64x64 | 초월 시스템 | P2 |
| `icon_title.png` | 칭호 아이콘 | 64x64 | 플레이어 칭호 | P1 |

#### 1.3.3 메달

| 에셋명 | 메달 종류 | 크기 (px) | 획득 조건 | 우선순위 |
|--------|-----------|-----------|-----------|----------|
| `medal_bronze.png` | 브론즈 메달 (🥉) | 96x96 | 10-24층 | P0 |
| `medal_silver.png` | 실버 메달 (🥈) | 96x96 | 25-39층 | P0 |
| `medal_gold.png` | 골드 메달 (🥇) | 96x96 | 40-49층 | P0 |
| `medal_platinum.png` | 플래티넘 메달 (💎) | 96x96 | 50층+ | P0 |
| `medal_shine_effect.png` | 메달 빛나는 효과 | 128x128 | 오버레이 | P1 |

**애니메이션**:
- 메달 획득 시 회전 + 스케일 애니메이션
- 빛나는 효과 (펄스, 1.5초 주기)

#### 1.3.4 UI 패널/프레임

| 에셋명 | 설명 | 크기 (px) | 용도 | 우선순위 |
|--------|------|-----------|------|----------|
| `panel_basic.png` | 기본 패널 배경 | 9-slice | 팝업, 다이얼로그 | P0 |
| `panel_header.png` | 헤더 패널 | 전체 너비 x 80 | 상단 HUD | P0 |
| `panel_gameover.png` | 게임오버 패널 | 400x600 | 게임오버 화면 | P0 |
| `panel_achievement.png` | 업적 알림 패널 | 350x100 | 토스트 알림 | P1 |
| `panel_mission.png` | 미션 패널 | 400x600 | 미션 화면 | P0 |
| `panel_tournament.png` | 토너먼트 패널 | 400x600 | 토너먼트 화면 | P1 |
| `panel_season.png` | 시즌/배틀패스 패널 | 400x800 | 시즌 화면 | P1 |
| `panel_prestige.png` | 환생 패널 | 400x600 | 환생 화면 | P1 |
| `panel_transcend.png` | 초월 패널 | 400x600 | 초월 화면 | P2 |
| `panel_login_reward.png` | 로그인 보상 패널 | 400x500 | 일일 로그인 | P0 |
| `panel_offline_reward.png` | 오프라인 보상 패널 | 400x400 | 오프라인 보상 | P0 |
| `panel_comeback.png` | 복귀 보상 패널 | 400x500 | 복귀 보상 | P1 |
| `panel_lucky_event.png` | 럭키 이벤트 패널 | 350x150 | 이벤트 알림 | P1 |
| `panel_near_record.png` | 최고기록 근접 패널 | 350x150 | 기록 근접 알림 | P1 |
| `panel_mercy.png` | Mercy 시스템 패널 | 350x150 | 연속실패 보호 | P1 |
| `panel_ad_preview.png` | 광고 보상 프리뷰 패널 | 350x200 | 광고 시청 전 | P0 |
| `panel_share.png` | 공유 패널 | 400x500 | 공유 기능 | P1 |
| `panel_first_purchase.png` | 첫 구매 패널 | 400x500 | 첫 구매 유도 | P1 |
| `panel_probability.png` | 확률 정보 패널 | 400x600 | 법적 준수 | P1 |
| `progress_bar_bg.png` | 진행바 배경 | 200x30 | 경험치, 에너지 | P0 |
| `progress_bar_fill.png` | 진행바 채우기 | 200x30 | - | P0 |
| `progress_ring.png` | 원형 진행도 | 128x128 | 환생/초월 진행도 | P1 |
| `divider.png` | 구분선 | 전체 너비 x 2 | 섹션 구분 | P1 |

#### 1.3.5 HUD 요소

| 에셋명 | 설명 | 크기 (px) | 위치 | 우선순위 |
|--------|------|-----------|------|----------|
| `hud_score_bg.png` | 점수 표시 배경 | 150x50 | 상단 중앙 | P0 |
| `hud_combo_bg.png` | 콤보 표시 배경 | 120x40 | 상단 우측 | P0 |
| `hud_floor_bg.png` | 층수 표시 배경 | 100x50 | 상단 좌측 | P0 |
| `hud_energy_empty.png` | 빈 하트 | 48x48 | 우측 상단 | P0 |
| `hud_energy_full.png` | 찬 하트 | 48x48 | 우측 상단 | P0 |
| `hud_energy_timer.png` | 에너지 타이머 표시 | 80x30 | 우측 상단 | P0 |
| `hud_mission_tracker.png` | 미션 진행도 트래커 | 150x40 | 상단 | P0 |
| `hud_countdown_timer.png` | FOMO 카운트다운 타이머 | 100x40 | 상단 | P1 |
| `hud_lucky_queue.png` | 럭키 이벤트 대기열 | 120x40 | 우측 | P1 |

#### 1.3.7 뱃지/칭호 시스템

| 에셋명 | 설명 | 크기 (px) | 용도 | 우선순위 |
|--------|------|-----------|------|----------|
| `badge_champion.png` | 챔피언 뱃지 | 64x64 | 토너먼트 1위 | P1 |
| `badge_share_king.png` | 공유왕 뱃지 | 64x64 | 주간 공유 TOP 10 | P1 |
| `badge_prestige_1.png` ~ `badge_prestige_10.png` | 환생 등급 뱃지 | 64x64 | 환생 횟수별 | P1 |
| `badge_transcend_1.png` ~ `badge_transcend_10.png` | 초월 등급 뱃지 | 64x64 | 초월 단계별 | P2 |
| `badge_season_bronze.png` | 시즌 브론즈 칭호 | 96x96 | 시즌 랭킹 | P1 |
| `badge_season_silver.png` | 시즌 실버 칭호 | 96x96 | 시즌 랭킹 | P1 |
| `badge_season_gold.png` | 시즌 골드 칭호 | 96x96 | 시즌 랭킹 | P1 |
| `badge_season_platinum.png` | 시즌 플래티넘 칭호 | 96x96 | 시즌 랭킹 | P1 |
| `badge_season_diamond.png` | 시즌 다이아 칭호 | 96x96 | 시즌 랭킹 | P1 |
| `tier_indicator_bronze.png` | 토너먼트 브론즈 티어 | 48x48 | 티어 표시 | P1 |
| `tier_indicator_silver.png` | 토너먼트 실버 티어 | 48x48 | 티어 표시 | P1 |
| `tier_indicator_gold.png` | 토너먼트 골드 티어 | 48x48 | 티어 표시 | P1 |
| `tier_indicator_platinum.png` | 토너먼트 플래티넘 티어 | 48x48 | 티어 표시 | P1 |
| `tier_indicator_diamond.png` | 토너먼트 다이아 티어 | 48x48 | 티어 표시 | P1 |

#### 1.3.8 화면 배경

| 에셋명 | 설명 | 크기 (px) | 용도 | 우선순위 |
|--------|------|-----------|------|----------|
| `screen_mission.png` | 미션 화면 배경 | 1080x1920 | 일일/주간 미션 | P0 |
| `screen_leaderboard.png` | 리더보드 화면 배경 | 1080x1920 | 리더보드 | P1 |
| `screen_tournament.png` | 토너먼트 화면 배경 | 1080x1920 | 주간 토너먼트 | P1 |
| `screen_achievement.png` | 업적 화면 배경 | 1080x1920 | 업적 시스템 | P1 |
| `screen_prestige.png` | 환생 화면 배경 | 1080x1920 | 환생 시스템 | P1 |
| `screen_transcend.png` | 초월 화면 배경 | 1080x1920 | 초월 시스템 | P2 |
| `screen_season.png` | 시즌/배틀패스 화면 배경 | 1080x1920 | 시즌 시스템 | P1 |

#### 1.3.6 튜토리얼 요소

| 에셋명 | 설명 | 크기 (px) | 용도 | 우선순위 |
|--------|------|-----------|------|----------|
| `tuto_hand.png` | 손가락 가이드 | 64x64 | 탭 가이드 (4프레임) | P0 |
| `tuto_arrow.png` | 화살표 가이드 | 64x64 | 방향 표시 | P0 |
| `tuto_highlight.png` | 하이라이트 원형 | 200x200 | 영역 강조 | P0 |
| `tuto_perfect_zone.png` | Perfect 존 표시 | 128x64 | 초록색 영역 | P0 |
| `tuto_speech_bubble.png` | 말풍선 (고양이) | 200x100 | 대사 표시 | P1 |

---

### 1.4 파티클/이펙트

#### 1.4.1 착지 이펙트

| 에셋명 | 설명 | 크기 (px) | 프레임 수 | 재생 시간 | 우선순위 |
|--------|------|-----------|-----------|-----------|----------|
| `fx_perfect_sparkle.png` | Perfect 착지 반짝임 | 128x128 | 8프레임 | 400ms | P0 |
| `fx_good_dust.png` | Good 착지 먼지 | 96x96 | 6프레임 | 300ms | P0 |
| `fx_land_impact.png` | 착지 충격파 | 128x64 | 4프레임 | 200ms | P0 |
| `fx_screen_flash.png` | 화면 플래시 (Perfect) | 전체 화면 | - | 100ms | P0 |

#### 1.4.2 코인/보상 이펙트

| 에셋명 | 설명 | 크기 (px) | 애니메이션 | 우선순위 |
|--------|------|-----------|------------|----------|
| `fx_coin_collect.png` | 코인 수집 효과 | 64x64 | 6프레임, 300ms | P0 |
| `fx_coin_rain.png` | 코인 비 파티클 | 32x32 | 8프레임 | P1 |
| `fx_golden_rain.png` | 황금 비 파티클 (Lucky Time) | 32x32 | 8프레임 | P1 |
| `fx_diamond_shine.png` | 다이아몬드 반짝임 | 64x64 | 10프레임 | P1 |
| `fx_gift_open.png` | 선물 상자 열기 | 128x128 | 12프레임, 600ms | P1 |

#### 1.4.3 콤보 이펙트

| 에셋명 | 설명 | 크기 (px) | 용도 | 우선순위 |
|--------|------|-----------|------|----------|
| `fx_combo_burst.png` | 콤보 돌파 효과 | 128x128 | 5/10/15콤보 시 | P0 |
| `fx_combo_streak.png` | 콤보 연속 빛줄기 | 64x256 | 콤보 중 배경 | P1 |
| `fx_combo_ring.png` | 콤보 링 확산 | 128x128 | 8프레임 | P1 |
| `fx_snack_tower_*.png` | 간식 탑 (콤보 시각화) | 64x64 | 10개 타일 | P0 |
| `fx_tower_collapse.png` | 탑 붕괴 효과 | 128x256 | 12프레임, 800ms | P1 |

#### 1.4.4 특수 이벤트 이펙트

| 에셋명 | 설명 | 크기 (px) | 용도 | 우선순위 |
|--------|------|-----------|------|----------|
| `fx_lucky_time_border.png` | Lucky Time 금색 테두리 | 전체 화면 | 펄스 애니메이션 | P1 |
| `fx_new_record_confetti.png` | 신기록 축하 색종이 | 32x32 | 파티클 50개 | P0 |
| `fx_new_record_flash.png` | 신기록 금색 플래시 | 전체 화면 | 500ms | P0 |
| `fx_near_miss_glow.png` | Near-Miss 시 테두리 발광 | 전체 화면 | 펄스 | P1 |
| `fx_slow_motion.png` | 슬로우 모션 블러 효과 | - | 셰이더 | P1 |
| `fx_near_miss_border_game.png` | Near-Miss 테두리 발광 (게임 진행 중) | 전체 화면 | 펄스 0.3초 | P1 |
| `fx_near_miss_slowmo_blur.png` | Near-Miss 슬로우모션 블러 | 전체 화면 | 블러 효과 | P1 |
| `fx_mercy_trigger.png` | Mercy System 발동 이펙트 | 256x256 | 8프레임 | P1 |
| `fx_lucky_event_queue.png` | 럭키 이벤트 대기열 표시 | 128x128 | 아이콘 + 텍스트 | P1 |
| `fx_prestige_aura.png` | 환생 완료 오라 | 256x256 | 12프레임, 루프 | P1 |
| `fx_transcend_glow.png` | 초월자 전용 발광 이펙트 | 128x128 | 10프레임, 루프 | P2 |
| `fx_season_end_confetti.png` | 시즌 종료 축하 색종이 | 32x32 | 파티클 50개 | P1 |
| `fx_ad_loading.png` | 광고 로딩 중 애니메이션 | 128x128 | 8프레임, 루프 | P0 |
| `fx_share_success.png` | 공유 성공 축하 이펙트 | 256x256 | 10프레임 | P1 |
| `fx_mission_complete.png` | 미션 완료 폭죽 효과 | 256x256 | 12프레임 | P0 |
| `fx_season_rank_up.png` | 시즌 랭킹 상승 이펙트 | 256x256 | 10프레임 | P1 |

#### 1.4.5 날씨/환경 파티클

| 에셋명 | 설명 | 크기 (px) | 개수 | 우선순위 |
|--------|------|-----------|------|----------|
| `particle_rain.png` | 빗방울 | 8x16 | 50개 | P2 |
| `particle_snow.png` | 눈송이 | 16x16 | 30개 | P2 |
| `particle_star.png` | 별 (밤하늘) | 12x12 | 20개 | P2 |
| `particle_butterfly.png` | 나비 (정원) | 24x24 | 5개 | P2 |
| `particle_sparkle.png` | 반짝임 (무지개 스테이지) | 16x16 | 20개 | P2 |

---

### 1.5 배경

#### 1.5.1 테마 스테이지 배경

| 에셋명 | 스테이지 | 층수 범위 | 크기 (px) | Parallax 레이어 | 우선순위 |
|--------|---------|-----------|-----------|-----------------|----------|
| `bg_living_room_far.png` | 거실 (🏠) | 1-10층 | 1080x1920 | 배경 (0.2x) | P0 |
| `bg_living_room_mid.png` | 거실 (중간) | 1-10층 | 1080x1920 | 중간 (0.5x) | P0 |
| `bg_living_room_near.png` | 거실 (전경) | 1-10층 | 1080x1920 | 전경 (0.8x) | P1 |
| `bg_garden_far.png` | 정원 (🌳) | 11-20층 | 1080x1920 | 배경 (0.2x) | P1 |
| `bg_garden_mid.png` | 정원 (중간) | 11-20층 | 1080x1920 | 중간 (0.5x) | P1 |
| `bg_rooftop.png` | 옥상 (🌅) | 21-30층 | 1080x1920 | 배경 (0.3x) | P1 |
| `bg_night_sky.png` | 밤하늘 (🌙) | 31-40층 | 1080x1920 | 배경 (0.2x) | P1 |
| `bg_space.png` | 우주 (🚀) | 41-50층 | 1080x1920 | 배경 (0.1x) | P1 |
| `bg_rainbow.png` | 무지개 (🌈) | 51층+ | 1080x1920 | 배경 (0.3x) | P2 |

**노트**:
- Parallax Scrolling을 위해 레이어별 분리
- 세로 타일링 가능하도록 상하 반복 패턴
- 압축률 높은 JPG 사용 가능 (배경은 투명도 불필요)

#### 1.5.2 메뉴 배경

| 에셋명 | 설명 | 크기 (px) | 용도 | 우선순위 |
|--------|------|-----------|------|----------|
| `bg_main_menu.png` | 메인 메뉴 배경 | 1080x1920 | 메인 화면 | P0 |
| `bg_shop.png` | 상점 배경 | 1080x1920 | 상점 화면 | P1 |
| `bg_cat_house.png` | 고양이 하우스 배경 | 1080x1920 | 하우스 화면 | P1 |
| `bg_gradient.png` | 그라데이션 배경 | 1080x1920 | 범용 | P0 |
| `bg_tournament.png` | 토너먼트 전용 배경 | 1080x1920 | 토너먼트 (경쟁 분위기) | P1 |

---

## 2. 오디오 에셋

### 2.1 BGM (배경음악)

| 파일명 | 설명 | BPM | 스타일 | 길이 | 포맷 | 비트레이트 | 우선순위 |
|--------|------|-----|--------|------|------|-----------|----------|
| `bgm_main_menu.mp3` | 메인 메뉴 음악 | 80-90 | 편안한 재즈/로파이 | 2분 (루프) | MP3 | 128kbps | P0 |
| `bgm_gameplay_0_20.mp3` | 게임플레이 (0-20층) | 110-120 | 경쾌한 일렉트로닉 | 2분 (루프) | MP3 | 128kbps | P0 |
| `bgm_gameplay_20_40.mp3` | 게임플레이 (20-40층) | 130-140 | 긴장감 있는 비트 | 2분 (루프) | MP3 | 128kbps | P1 |
| `bgm_gameplay_40plus.mp3` | 게임플레이 (40층+) | 150+ | 인텐스 신스웨이브 | 2분 (루프) | MP3 | 128kbps | P1 |
| `bgm_cat_house.mp3` | 고양이 하우스 음악 | 70-80 | 아늑한 어쿠스틱/힐링 | 2분 (루프) | MP3 | 128kbps | P1 |

**스타일 가이드**:
- 밝고 긍정적인 분위기
- 반복 재생에도 질리지 않는 멜로디
- 층수별 자연스러운 크로스페이드 전환 (3초)
- SFX를 덮지 않도록 중간 음역대 비움

**총 용량 예산**: ~6MB (5개 트랙)

---

### 2.2 SFX (효과음)

#### 2.2.1 게임플레이 효과음

| 파일명 | 설명 | 길이 | 톤 | 포맷 | 비트레이트 | 우선순위 |
|--------|------|------|-----|------|-----------|----------|
| `sfx_jump.wav` | 점프 시작 ("뿅") | 200ms | 중간 톤 | WebM/AAC | 96kbps mono | P0 |
| `sfx_land_perfect.wav` | Perfect 착지 ("띵!") | 300ms | 높은 톤 + 반짝임 | WebM/AAC | 96kbps mono | P0 |
| `sfx_land_good.wav` | Good 착지 ("톡") | 250ms | 중간 톤 | WebM/AAC | 96kbps mono | P0 |
| `sfx_land_miss.wav` | Miss 착지 ("쿵") | 400ms | 낮은 톤 | WebM/AAC | 96kbps mono | P0 |
| `sfx_combo_up.wav` | 콤보 증가 ("띵띵!") | 300ms | 상승 음계 | WebM/AAC | 96kbps mono | P0 |
| `sfx_combo_break.wav` | 콤보 끊김 ("뚝") | 400ms | 낮은 효과음 | WebM/AAC | 96kbps mono | P0 |
| `sfx_fall.wav` | 낙하 중 ("슉~") | 300ms | 하강 톤 | WebM/AAC | 96kbps mono | P0 |
| `sfx_combo_milestone.wav` | 콤보 마일스톤 (5, 10, 20) | 500ms | 상승 멜로디 | WebM/AAC | 96kbps mono | P0 |

#### 2.2.2 보상/수집 효과음

| 파일명 | 설명 | 길이 | 톤 | 우선순위 |
|--------|------|------|-----|----------|
| `sfx_coin_collect.wav` | 코인 획득 ("찰랑") | 200ms | 밝은 톤 | P0 |
| `sfx_coin_rain.wav` | 코인 비 (Lucky Time) | 500ms | 연속 코인 소리 | P1 |
| `sfx_gift_open.wav` | 선물 상자 열기 | 600ms | 서프라이즈 | P1 |
| `sfx_diamond_get.wav` | 다이아 획득 | 400ms | 반짝이는 소리 | P1 |
| `sfx_level_up.wav` | 레벨업 | 800ms | 상승 멜로디 | P1 |

#### 2.2.3 UI 효과음

| 파일명 | 설명 | 길이 | 우선순위 |
|--------|------|------|----------|
| `sfx_button_click.wav` | 버튼 클릭 | 100ms | P0 |
| `sfx_button_hover.wav` | 버튼 호버 (Web) | 50ms | P1 |
| `sfx_popup_open.wav` | 팝업 열기 | 300ms | P0 |
| `sfx_popup_close.wav` | 팝업 닫기 | 200ms | P0 |
| `sfx_tab_switch.wav` | 탭 전환 | 150ms | P1 |
| `sfx_whoosh.wav` | 화면 전환 ("휙") | 400ms | P1 |
| `sfx_menu_open.wav` | 메뉴 열림 ("스르륵") | 300ms | P0 |

#### 2.2.4 특수 이벤트 효과음

| 파일명 | 설명 | 길이 | 우선순위 |
|--------|------|------|----------|
| `sfx_new_record.wav` | 신기록 달성 ("빠밤!" 팡파레) | 2초 | P0 |
| `sfx_near_record.wav` | 최고기록 근접 (심장박동 BPM 80→120) | 1초 (루프) | P1 |
| `sfx_mercy_trigger.wav` | Mercy System 발동 | 600ms | P1 |
| `sfx_prestige.wav` | 환생 완료 (극적인 전환) | 2초 | P1 |
| `sfx_game_over.wav` | 게임오버 ("미야옹~") | 1.5초 | P0 |
| `sfx_lucky_time.wav` | Lucky Time 시작 | 1초 | P1 |
| `sfx_boss_can_appear.wav` | 보스 캔 등장 | 1초 | P1 |
| `sfx_revival.wav` | 부활 (광고 시청 후) | 800ms | P0 |

#### 2.2.5 콤보 메시지 보이스 (선택)

| 파일명 | 메시지 | 콤보 수 | 길이 | 우선순위 |
|--------|--------|---------|------|----------|
| `voice_nice.wav` | "Nice!" | 2콤보 | 500ms | P2 |
| `voice_great.wav` | "Great!" | 3콤보 | 500ms | P2 |
| `voice_amazing.wav` | "Amazing!" | 5콤보 | 600ms | P2 |
| `voice_incredible.wav` | "Incredible!" | 10콤보 | 700ms | P2 |
| `voice_legendary.wav` | "LEGENDARY!" | 15콤보 | 800ms | P2 |
| `voice_godlike.wav` | "GODLIKE!" | 20콤보 | 800ms | P2 |

**노트**:
- 현지화 시 언어별 녹음 필요 (한국어, 영어, 일본어, 중국어)
- 또는 텍스트 표시로 대체 가능 (예산 절감)

#### 2.2.6 오디오 스프라이트 (최적화)

**권장 구조**: 모든 SFX를 1개 파일로 통합

| 파일명 | 설명 | 포맷 | 총 길이 | 용량 | 우선순위 |
|--------|------|------|---------|------|----------|
| `sfx_sprite.webm` | 모든 SFX 통합 | WebM/AAC | ~20초 | ~2MB | P0 |

**sprite.json 메타데이터**:
```json
{
  "jump": { "start": 0, "end": 0.2 },
  "land_perfect": { "start": 0.2, "end": 0.5 },
  "land_good": { "start": 0.5, "end": 0.75 },
  ...
}
```

**총 오디오 메모리 예산**: < 10MB

---

## 3. 폰트

| 폰트명 | 용도 | 스타일 | 라이선스 | 파일 포맷 | 우선순위 |
|--------|------|--------|---------|-----------|----------|
| **Pretendard** | 한국어 UI 텍스트 | Sans-serif, 깔끔 | SIL OFL | WOFF2 | P0 |
| **Noto Sans** | 다국어 폴백 | Sans-serif | SIL OFL | WOFF2 | P0 |
| **Fredoka One** | 게임 내 점수/콤보 | 둥글고 귀여운 | SIL OFL | WOFF2 | P0 |
| **Jua** | 한국어 제목 | 둥글고 통통한 | SIL OFL | WOFF2 | P1 |
| **Pacifico** | 장식 텍스트 (영문) | 필기체 | SIL OFL | WOFF2 | P2 |

**폰트 로딩 전략**:
- 게임 시작 시 preload (subset으로 용량 최소화)
- 기본 400/700 weight만 사용 (용량 절감)
- 한글: 2,350자 완성형 한글만 포함

**총 폰트 용량 예산**: < 2MB

---

## 4. 우선순위 정리

### P0 (MVP 필수 - 출시 전 필수)

**캐릭터**:
- 메인 고양이 기본 애니메이션 (idle, jump, land) - 12프레임
- 감정 표현 (happy, sad) - 6프레임

**간식캔**:
- 기본 5종 + 특수 5종 (황금, 넓은, 선물, 좁은, 흔들) - 10종

**UI**:
- 필수 버튼 (play, shop, settings, close, ad) - 5종
- 필수 아이콘 (coin, diamond, energy, star) - 4종
- 메달 4종 (bronze, silver, gold, platinum)
- HUD 요소 전체
- 튜토리얼 가이드 (hand, arrow, highlight, perfect zone)

**이펙트**:
- 착지 이펙트 (perfect, good, impact)
- 코인 수집 효과
- 콤보 이펙트
- 신기록 효과

**배경**:
- 메인 메뉴 배경
- 거실 스테이지 (1-10층) 기본 레이어
- 그라데이션 범용 배경

**오디오**:
- BGM: 메인 메뉴 + 게임플레이 (0-20층) - 2트랙
- SFX: 점프, 착지 3종, 코인, 콤보, 게임오버, 신기록, UI - 12개
- SFX 스프라이트 통합 파일

**폰트**:
- Pretendard (한국어)
- Noto Sans (다국어)
- Fredoka One (점수)

**P0 총 작업량 추정**: 약 180개 에셋 (검증 후 +30개)

---

### P1 (소프트 런칭 전)

**캐릭터**:
- 추가 감정 (hungry, excited, sweat, satisfied) - 14프레임
- 추가 고양이 5종 (페르시안, 샴, 스핑크스, 먼치킨, 스코티시) - 각 10프레임
- 의상 75종 (모자 20, 안경 10, 옷 30, 액세서리 15)

**간식캔**:
- 특수 캔 3종 (fake, invisible, reverse)
- 보스 캔 2종 (25층, 50층)

**UI**:
- 추가 버튼 (share, leaderboard)
- 추가 아이콘 (trophy, gift, lock, info, vibrate)
- UI 패널 전체
- 메달 빛나는 효과

**이펙트**:
- 코인 비, 황금 비, 다이아몬드 반짝임
- 콤보 추가 이펙트
- 특수 이벤트 이펙트 (Lucky Time, Near-Miss)

**배경**:
- 나머지 스테이지 5개 (정원, 옥상, 밤하늘, 우주)
- 상점, 하우스 배경

**오디오**:
- BGM: 게임플레이 (20-40층, 40층+), 하우스 - 3트랙
- SFX: 보상/이벤트 효과음 추가 - 10개

**폰트**:
- Jua (한국어 제목)

**P1 총 작업량 추정**: 약 250개 에셋 (검증 후 +50개)

---

### P2 (글로벌 런칭 전)

**캐릭터**:
- 특수 의상 15종
- 시즌 한정 의상 10종

**간식캔**:
- 보스 캔 2종 (75층, 100층)

**이펙트**:
- 날씨/환경 파티클 (비, 눈, 별, 나비, 반짝임)

**배경**:
- 무지개 스테이지 (51층+)
- Parallax 전경/중경 레이어

**오디오**:
- 콤보 메시지 보이스 (6개 x 4언어) - 선택사항

**폰트**:
- Pacifico (장식)

**P2 총 작업량 추정**: 약 80개 에셋

---

## 5. 에셋 제작 가이드라인

### 5.1 파일 명명 규칙

```
{category}_{name}_{state}.{ext}

예시:
- cat_idle_normal.png
- can_golden_glow.png
- btn_play_pressed.png
- sfx_land_perfect.wav
- bg_living_room_far.png
```

### 5.2 스프라이트 시트 구조

**권장**: Texture Atlas로 통합 (성능 최적화)

| Atlas 이름 | 포함 에셋 | 예상 크기 |
|-----------|-----------|-----------|
| `atlas_cat_main.png` | 메인 고양이 전체 프레임 | 2048x2048 |
| `atlas_cans.png` | 모든 간식캔 | 2048x1024 |
| `atlas_ui.png` | 모든 UI 요소 | 2048x2048 |
| `atlas_fx.png` | 모든 이펙트 | 2048x2048 |

**JSON 메타데이터 예시**:
```json
{
  "frames": {
    "cat_idle_0.png": {
      "frame": { "x": 0, "y": 0, "w": 128, "h": 128 },
      "pivot": { "x": 0.5, "y": 0.5 }
    },
    ...
  }
}
```

### 5.3 색상 팔레트

**메인 컬러**:
- 러시안블루 회색-파랑: `#7393B3`
- 파스텔 핑크: `#FFB3D9`
- 파스텔 민트: `#B3FFD9`
- 파스텔 노랑: `#FFF5B3`
- 밝은 흰색: `#FFFFFF`

**기능 컬러**:
- Perfect (녹색): `#4CAF50`
- Good (노란색): `#FFC107`
- Miss (빨강): `#F44336`
- 황금캔 (금색): `#FFD700`
- 다이아몬드 (청록): `#00CED1`

### 5.4 접근성 (색맹 모드)

| 기본 색상 | 적록색맹 대체 | 청황색맹 대체 |
|-----------|---------------|---------------|
| Perfect (녹색) | 파랑 `#2196F3` | 흰색 `#FFFFFF` |
| Good (노란색) | 주황 `#FF9800` | 보라 `#9C27B0` |
| Miss (빨강) | 검정 + 패턴 | 빨강 유지 |
| 황금캔 (금색) | 별 패턴 추가 | 별 패턴 추가 |

### 5.5 최적화 가이드

**이미지**:
- PNG-24: 투명도 필요한 경우 (캐릭터, UI, 이펙트)
- PNG-8: 단색/심플한 UI (용량 절감)
- JPG: 배경 (투명도 불필요, 높은 압축률)
- 해상도: @2x (512x512 이하), @3x (1024x1024 이하)
- 압축: TinyPNG, ImageOptim 사용

**오디오**:
- SFX: WebM/AAC, 96kbps mono, < 500ms
- BGM: MP3, 128kbps stereo, 2분 루프
- 오디오 스프라이트로 통합 (HTTP 요청 최소화)

**총 에셋 용량 예산**:
- 텍스처: < 50MB
- 오디오: < 10MB
- 폰트: < 2MB
- **총합**: < 70MB (초기 다운로드 < 30MB APK/IPA 목표)

---

## 6. 제작 도구 추천

### 6.1 그래픽

- **Aseprite**: 픽셀아트, 애니메이션
- **Affinity Designer**: 벡터 UI, 아이콘
- **Procreate**: 캐릭터 일러스트 (iPad)
- **Photoshop**: 범용 그래픽 편집
- **TexturePacker**: Sprite Atlas 제작

### 6.2 오디오

- **Audacity**: 오디오 편집 (무료)
- **jsfxr**: 8비트 SFX 생성
- **Audiosprite**: 오디오 스프라이트 생성
- **GarageBand / FL Studio**: BGM 작곡

### 6.3 폰트

- **Google Fonts**: 무료 라이선스 폰트
- **Font Squirrel**: 상업용 무료 폰트
- **Webfont Generator**: WOFF2 변환

---

## 7. 납품 형식

### 7.1 폴더 구조

```
assets/
├── sprites/
│   ├── cat/
│   │   ├── main/
│   │   └── skins/
│   ├── cans/
│   ├── ui/
│   └── fx/
├── backgrounds/
├── audio/
│   ├── bgm/
│   └── sfx/
├── fonts/
└── atlases/
    ├── atlas_cat_main.png
    ├── atlas_cat_main.json
    ├── atlas_cans.png
    ├── atlas_cans.json
    ├── atlas_ui.png
    ├── atlas_ui.json
    ├── atlas_fx.png
    └── atlas_fx.json
```

### 7.2 원본 파일 (보관용)

- PSD/AI/Aseprite 원본 파일
- 별도 폴더 `source/` 에 보관
- 버전 관리 (Git LFS 추천)

### 7.3 메타데이터

각 에셋에 대한 `metadata.json` 제공:
```json
{
  "name": "cat_idle",
  "type": "animation",
  "frames": 4,
  "framerate": 30,
  "size": "128x128",
  "pivot": "center",
  "tags": ["character", "main", "idle"]
}
```

---

## 8. 참고 자료

### 8.1 비주얼 스타일 레퍼런스

- **Crossy Road**: 복셀 아트, 귀여운 캐릭터
- **Stack**: 미니멀리즘, 색상 전환
- **Neko Atsume (고양이 수집)**: 고양이 디자인
- **Monument Valley**: 파스텔 톤, 깔끔한 UI

### 8.2 오디오 스타일 레퍼런스

- **Animal Crossing**: 아늑하고 귀여운 BGM
- **Fruit Ninja**: 명확한 SFX 피드백
- **Crossy Road**: 간결하고 중독적인 효과음

---

## 부록: 체크리스트

### MVP (P0) 완료 기준

**캐릭터 (14프레임)**:
- [ ] 고양이 기본 애니메이션 12프레임 (idle, jump, air, land 3종, happy, sad)
- [ ] 고양이 낙하 애니메이션 3프레임 (fall)

**간식캔 (10종)**:
- [ ] 기본 간식캔 5종 (참치, 연어, 닭고기, 소고기, 혼합)
- [ ] 특수 캔 5종 (황금, 넓은, 선물, 좁은, 흔들)

**UI 요소**:
- [ ] 필수 버튼 6종 (play, shop, settings, close, ad, mission)
- [ ] 필수 아이콘 10종 (coin, diamond, energy, star, check, volume, music, mission 등)
- [ ] 메달 4종 (bronze, silver, gold, platinum)
- [ ] HUD 전체 (score, combo, floor, energy, mission tracker)
- [ ] 튜토리얼 가이드 4종 (hand, arrow, highlight, perfect zone)
- [ ] 주요 팝업 4종 (login reward, offline reward, ad preview, gameover)
- [ ] 미션 화면 배경

**이펙트 (11종)**:
- [ ] 착지 이펙트 3종 (perfect, good, impact)
- [ ] 코인 수집 효과
- [ ] 콤보 이펙트
- [ ] 신기록 효과 2종 (confetti, flash)
- [ ] 광고 로딩 애니메이션
- [ ] 미션 완료 폭죽

**배경 (3종)**:
- [ ] 메인 메뉴 배경
- [ ] 거실 스테이지 (1-10층) 기본 레이어
- [ ] 그라데이션 범용 배경

**오디오**:
- [ ] BGM 2트랙 (메인 메뉴 + 게임플레이 0-20층)
- [ ] SFX 스프라이트 (15개 효과음: jump, fall, land 3종, combo 3종, coin, menu_open 등)

**폰트 (3종)**:
- [ ] Pretendard (한국어)
- [ ] Noto Sans (다국어)
- [ ] Fredoka One (점수)

### 소프트 런칭 (P1) 완료 기준

**캐릭터**:
- [ ] 추가 감정 표현 4종 (hungry, excited, sweat, satisfied)
- [ ] 낙하산 애니메이션 (Wave 0)
- [ ] 추가 고양이 5종 (페르시안, 샴, 스핑크스, 먼치킨, 스코티시)
- [ ] 특수 고양이 2종 (ghost, mystery silhouette)
- [ ] 의상 75종 (모자 20, 안경 10, 옷 30, 액세서리 15)

**간식캔**:
- [ ] 특수 캔 3종 (fake, invisible, reverse)
- [ ] 보스 캔 2종 (25층, 50층)

**UI 시스템**:
- [ ] 추가 버튼 7종 (share, leaderboard, tournament, season, prestige, undo_prestige)
- [ ] 추가 아이콘 6종 (tournament, season, prestige, title 등)
- [ ] 뱃지/칭호 시스템 25종 (prestige, transcend, season, tournament tier)
- [ ] 화면 배경 6종 (leaderboard, tournament, achievement, prestige, season)
- [ ] 팝업 패널 10종 (comeback, lucky event, near record, mercy, share, first purchase, probability 등)
- [ ] HUD 추가 3종 (countdown timer, lucky queue)

**이펙트**:
- [ ] Near-Miss 시스템 3종 (border, slowmo blur, glow)
- [ ] Mercy 시스템 이펙트
- [ ] 럭키 이벤트 이펙트 4종 (Lucky Time, queue, border)
- [ ] 환생 시스템 이펙트 (aura)
- [ ] 공유/소셜 이펙트 2종 (share success, season rank up)
- [ ] 콤보 추가 이펙트 (streak, ring)
- [ ] 코인 비, 황금 비, 다이아몬드 반짝임

**배경**:
- [ ] 나머지 스테이지 5종 (정원, 옥상, 밤하늘, 우주)
- [ ] 상점, 하우스 배경
- [ ] 토너먼트 전용 배경

**오디오**:
- [ ] BGM 3트랙 추가 (게임플레이 20-40층, 40층+, 하우스)
- [ ] SFX 13개 추가 (보상/이벤트 효과음, mercy, prestige 등)

### 글로벌 런칭 (P2) 완료 기준
- [ ] 시즌 의상 25종
- [ ] 날씨 파티클
- [ ] 무지개 스테이지
- [ ] 보이스 (선택)

---

**문서 종료**

디자이너는 이 문서를 기반으로 에셋 제작을 시작할 수 있습니다.
질문이나 추가 요청 사항은 개발팀에 문의해주세요.
