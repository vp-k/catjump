# Asset Generator 에셋 완전 분류표

**생성일**: 2025-11-29
**Asset Generator 버전**: 1.0.0
**기준 문서**: `docs/asset-list.md`

---

## 분류 기준

| 상태 | 설명 | 조치 |
|------|------|------|
| **디자인프리** | 코드 생성으로 충분한 품질, 그대로 사용 가능 | 없음 |
| **업그레이드 권장** | 기본 형태 제공, 시간 있으면 개선 | 선택적 대체 |
| **필수 대체** | 플레이스홀더, 반드시 디자이너 작업 필요 | MVP 전 완료 |
| **미생성** | Asset Generator에서 생성 불가, 수작업 필요 | 수작업 제작 |

---

## 1. 간식캔 (Cans) - 10종

### 생성 현황: 10/10 (100%)

| 파일명 | 상태 | 현재 품질 | 비고 |
|--------|------|----------|------|
| `can_tuna.png` | **디자인프리** | 파란색 캔 + TUNA 라벨, 금속 질감 | 128x64, 사용 가능 |
| `can_salmon.png` | **디자인프리** | 핑크색 캔 + SALMON 라벨 | 128x64, 사용 가능 |
| `can_chicken.png` | **디자인프리** | 노란색 캔 + CHICKEN 라벨 | 128x64, 사용 가능 |
| `can_beef.png` | **디자인프리** | 빨간색 캔 + BEEF 라벨 | 128x64, 사용 가능 |
| `can_mix.png` | **디자인프리** | 무지개색 캔 + MIX 라벨 | 128x64, 사용 가능 |
| `can_golden.png` | 업그레이드 권장 | 금색 그라데이션 + 별 | 빛나는 효과 스프라이트 추가 권장 |
| `can_wide.png` | **디자인프리** | 1.4배 넓이 캔 | 179x64, 사용 가능 |
| `can_gift.png` | 업그레이드 권장 | 핑크색 + 리본 형태 | 더 화려한 리본/장식 권장 |
| `can_narrow.png` | **디자인프리** | 0.6배 좁이 캔 | 77x64, 사용 가능 |
| `can_shake.png` | **디자인프리** | 진동선 이펙트 캔 (P1) | 128x64, 사용 가능 |

### 미생성 (P1-P2)
| 파일명 | 우선순위 | 필요 작업 |
|--------|----------|----------|
| `can_fake.png` | P1 | 반투명 캔 (60층+) - 수작업 |
| `can_invisible.png` | P1 | 윤곽선만 캔 (70층+) - 수작업 |
| `can_reverse.png` | P1 | 화살표 캔 (80층+) - 수작업 |
| `can_boss_25.png` | P1 | 거대 캔 192x96 - 수작업 |
| `can_boss_50.png` | P1 | 왕관 장식 캔 - 수작업 |
| `can_boss_75.png` | P2 | 다이아몬드 캔 - 수작업 |
| `can_boss_100.png` | P2 | 무지개 캔 - 수작업 |

---

## 2. 버튼 (Buttons) - 9종

### 생성 현황: 9/9 (100%) - 각 버튼 4상태 (normal, hover, pressed, disabled)

| 파일명 | 상태 | 현재 품질 | 비고 |
|--------|------|----------|------|
| `btn_play_*.png` | **디자인프리** | 초록색 Primary 버튼 | 4상태, 200x60 |
| `btn_shop_*.png` | **디자인프리** | 보라색 Secondary 버튼 | 4상태, 160x60 |
| `btn_settings_*.png` | **디자인프리** | 회색 버튼 + 기어 아이콘 | 4상태, 160x60 |
| `btn_close_*.png` | **디자인프리** | 빨간색 X 버튼 | 3상태, 48x48 |
| `btn_adwatch_*.png` | **디자인프리** | 주황색 AD 버튼 | 4상태, 200x60 |
| `btn_mission_*.png` | **디자인프리** | 청록색 MISSION 버튼 | 4상태, 160x60 |
| `btn_back_*.png` | **디자인프리** | 회색 pill형 BACK 버튼 | 4상태, 120x50 |
| `btn_share_*.png` | **디자인프리** | SHARE 버튼 (P1) | 4상태, 160x60 |
| `btn_leaderboard_*.png` | **디자인프리** | 금색 RANK 버튼 (P1) | 4상태, 160x60 |

### 미생성 (P1-P2)
| 파일명 | 우선순위 | 필요 작업 |
|--------|----------|----------|
| `btn_tournament.png` | P1 | 토너먼트 버튼 - config 추가 필요 |
| `btn_season.png` | P1 | 시즌 버튼 - config 추가 필요 |
| `btn_prestige.png` | P1 | 환생 버튼 - config 추가 필요 |
| `btn_transcend.png` | P2 | 초월 버튼 - config 추가 필요 |
| `btn_undo_prestige.png` | P1 | 환생 되돌리기 - config 추가 필요 |

---

## 3. 아이콘 (Icons) - 12종

### 생성 현황: 12/12 (100%)

| 파일명 | 상태 | 현재 품질 | 비고 |
|--------|------|----------|------|
| `icon_coin.png` | **디자인프리** | 원형 + $ 기호 | 64x64, 사용 가능 |
| `icon_diamond.png` | **디자인프리** | 다이아몬드 다각형 | 64x64, 사용 가능 |
| `icon_energy.png` | **디자인프리** | 하트 모양 | 64x64, 사용 가능 |
| `icon_star.png` | **디자인프리** | 5각 별 | 64x64, 사용 가능 |
| `icon_check.png` | **디자인프리** | 체크 마크 | 48x48, 사용 가능 |
| `icon_volume.png` | **디자인프리** | 스피커 + 음파 | 48x48, 사용 가능 |
| `icon_music.png` | **디자인프리** | 음표 모양 | 48x48, 사용 가능 |
| `icon_mission.png` | **디자인프리** | 체크리스트 | 64x64, 사용 가능 |
| `icon_trophy.png` | **디자인프리** | 트로피 (P1) | 64x64, 사용 가능 |
| `icon_gift.png` | **디자인프리** | 선물 상자 (P1) | 64x64, 사용 가능 |
| `icon_lock.png` | **디자인프리** | 자물쇠 (P1) | 64x64, 사용 가능 |
| `icon_info.png` | **디자인프리** | i 정보 아이콘 (P1) | 48x48, 사용 가능 |

### 미생성 (P1-P2)
| 파일명 | 우선순위 | 필요 작업 |
|--------|----------|----------|
| `icon_vibrate.png` | P1 | 진동 아이콘 - config 추가 |
| `icon_tournament.png` | P1 | 토너먼트 아이콘 - config 추가 |
| `icon_season.png` | P1 | 시즌 아이콘 - config 추가 |
| `icon_prestige.png` | P1 | 환생 아이콘 - config 추가 |
| `icon_transcend.png` | P2 | 초월 아이콘 - config 추가 |
| `icon_title.png` | P1 | 칭호 아이콘 - config 추가 |

---

## 4. 메달 (Medals) - 4종

### 생성 현황: 4/4 (100%)

| 파일명 | 상태 | 현재 품질 | 비고 |
|--------|------|----------|------|
| `medal_bronze.png` | 업그레이드 권장 | 원형 + 리본 + 숫자3 | 입체감, 광택 강화 권장 |
| `medal_silver.png` | 업그레이드 권장 | 원형 + 리본 + 숫자2 | 은색 반짝임 강화 권장 |
| `medal_gold.png` | 업그레이드 권장 | 원형 + 리본 + 숫자1 | 금색 광택 효과 강화 권장 |
| `medal_platinum.png` | 업그레이드 권장 | 원형 + 리본 + 별 | 다이아몬드 광채 효과 권장 |

### 미생성 (P1)
| 파일명 | 우선순위 | 필요 작업 |
|--------|----------|----------|
| `medal_shine_effect.png` | P1 | 메달 빛나는 오버레이 - 수작업 |

---

## 5. HUD 요소 - 9종

### 생성 현황: 9/9 (100%)

| 파일명 | 상태 | 현재 품질 | 비고 |
|--------|------|----------|------|
| `hud_score_bg.png` | 업그레이드 권장 | 둥근 사각형 배경 | 게임 테마 장식 추가 권장 |
| `hud_combo_bg.png` | 업그레이드 권장 | 그라데이션 배경 | 불꽃/에너지 느낌 강화 권장 |
| `hud_floor_bg.png` | **디자인프리** | 층수 표시 배경 | 100x50, 사용 가능 |
| `hud_energy_empty.png` | **디자인프리** | 빈 하트 | 48x48, 사용 가능 |
| `hud_energy_full.png` | 업그레이드 권장 | 찬 하트 | 고양이 발바닥/생선으로 변경 권장 |
| `hud_energy_timer.png` | **디자인프리** | 에너지 타이머 | 80x30, 사용 가능 |
| `hud_mission_tracker.png` | **디자인프리** | 미션 진행도 | 150x40, 사용 가능 |
| `progress_bar_bg.png` | **디자인프리** | 진행바 배경 | 200x30, 사용 가능 |
| `progress_bar_fill.png` | **디자인프리** | 진행바 채우기 | 200x30, 사용 가능 |

### 미생성 (P1)
| 파일명 | 우선순위 | 필요 작업 |
|--------|----------|----------|
| `hud_countdown_timer.png` | P1 | FOMO 카운트다운 - config 추가 |
| `hud_lucky_queue.png` | P1 | 럭키 이벤트 대기열 - config 추가 |
| `progress_ring.png` | P1 | 원형 진행도 - config 추가 |
| `divider.png` | P1 | 구분선 - config 추가 |

---

## 6. 튜토리얼 요소 - 5종

### 생성 현황: 5/5 (100%)

| 파일명 | 상태 | 현재 품질 | 비고 |
|--------|------|----------|------|
| `tuto_hand.png` | **필수 대체** | 원형 + 탭 표시 (기하학적) | **실제 손가락 일러스트로 대체 필수** |
| `tuto_arrow.png` | 업그레이드 권장 | 기본 화살표 | 귀여운 스타일로 개선 권장 |
| `tuto_highlight.png` | 업그레이드 권장 | 점선 원형 | 반짝이는 효과 추가 권장 |
| `tuto_perfect_zone.png` | **디자인프리** | 초록색 영역 표시 | 128x64, 사용 가능 |
| `tuto_speech_bubble.png` | **디자인프리** | 말풍선 (P1) | 200x100, 사용 가능 |

---

## 7. 이펙트 (Effects) - 10종

### 생성 현황: 10/10 (100%)

| 파일명 | 상태 | 현재 품질 | 비고 |
|--------|------|----------|------|
| `fx_perfect_sparkle.png` | 업그레이드 권장 | 기하학적 광선 | 8프레임 스프라이트시트 애니메이션 권장 |
| `fx_good_dust.png` | 업그레이드 권장 | 단순 원형 파티클 | 먼지 구름 표현 개선 권장 |
| `fx_land_impact.png` | **디자인프리** | 착지 충격파 | 4프레임, 사용 가능 |
| `fx_screen_flash.png` | **디자인프리** | 화면 플래시 | 64x64, 사용 가능 |
| `fx_coin_collect.png` | **디자인프리** | 코인 수집 효과 | 6프레임, 사용 가능 |
| `fx_combo_burst.png` | 업그레이드 권장 | 방사형 광선 | 더 역동적인 폭발 효과 권장 |
| `fx_new_record_confetti.png` | 업그레이드 권장 | 랜덤 사각형/원 | 다양한 색종이 모양 권장 |
| `fx_new_record_flash.png` | **디자인프리** | 금색 플래시 | 64x64, 사용 가능 |
| `fx_ad_loading.png` | **디자인프리** | 로딩 애니메이션 | 8프레임, 사용 가능 |
| `fx_mission_complete.png` | 업그레이드 권장 | 기본 불꽃놀이 | 화려한 폭죽 애니메이션 권장 |

### 미생성 (P0-P2)
| 파일명 | 우선순위 | 필요 작업 |
|--------|----------|----------|
| `fx_snack_tower_*.png` | **P0** | **간식 탑 10개 - 수작업 필수** |
| `fx_coin_rain.png` | P1 | 코인 비 파티클 - config 추가 |
| `fx_golden_rain.png` | P1 | 황금 비 - config 추가 |
| `fx_diamond_shine.png` | P1 | 다이아몬드 반짝임 - config 추가 |
| `fx_gift_open.png` | P1 | 선물 상자 열기 - config 추가 |
| `fx_combo_streak.png` | P1 | 콤보 빛줄기 - config 추가 |
| `fx_combo_ring.png` | P1 | 콤보 링 확산 - config 추가 |
| `fx_tower_collapse.png` | P1 | 탑 붕괴 효과 - config 추가 |
| `fx_lucky_time_border.png` | P1 | Lucky Time 테두리 - config 추가 |
| `fx_near_miss_glow.png` | P1 | Near-Miss 발광 - config 추가 |
| `fx_near_miss_border_game.png` | P1 | Near-Miss 테두리 - config 추가 |
| `fx_near_miss_slowmo_blur.png` | P1 | 슬로모션 블러 - config 추가 |
| `fx_mercy_trigger.png` | P1 | Mercy 발동 - config 추가 |
| `fx_lucky_event_queue.png` | P1 | 럭키 이벤트 큐 - config 추가 |
| `fx_prestige_aura.png` | P1 | 환생 오라 - config 추가 |
| `fx_transcend_glow.png` | P2 | 초월 발광 - config 추가 |
| `fx_season_end_confetti.png` | P1 | 시즌 종료 색종이 - config 추가 |
| `fx_share_success.png` | P1 | 공유 성공 - config 추가 |
| `fx_season_rank_up.png` | P1 | 시즌 랭킹 상승 - config 추가 |
| `particle_rain.png` | P2 | 빗방울 - config 추가 |
| `particle_snow.png` | P2 | 눈송이 - config 추가 |
| `particle_star.png` | P2 | 별 - config 추가 |
| `particle_butterfly.png` | P2 | 나비 - config 추가 |
| `particle_sparkle.png` | P2 | 반짝임 - config 추가 |

---

## 8. 패널 (Panels) - 7종

### 생성 현황: 7/7 (100%)

| 파일명 | 상태 | 현재 품질 | 비고 |
|--------|------|----------|------|
| `panel_basic.png` | 업그레이드 권장 | 어두운 그라데이션 | 캐릭터/테마 장식 추가 권장 |
| `panel_header.png` | **디자인프리** | 상단 헤더 패널 | 400x80, 사용 가능 |
| `panel_gameover.png` | 업그레이드 권장 | 빨간 헤더 패널 | 슬픈 고양이 일러스트 추가 권장 |
| `panel_mission.png` | 업그레이드 권장 | 초록 헤더 패널 | 미션 아이콘 장식 권장 |
| `panel_login_reward.png` | 업그레이드 권장 | 금색 헤더 패널 | 선물 상자 일러스트 권장 |
| `panel_offline_reward.png` | **디자인프리** | 보라색 헤더 패널 | 400x400, 사용 가능 |
| `panel_ad_preview.png` | **디자인프리** | 주황색 헤더 패널 | 350x200, 사용 가능 |

### 미생성 (P1-P2)
| 파일명 | 우선순위 | 필요 작업 |
|--------|----------|----------|
| `panel_achievement.png` | P1 | 업적 알림 - config 추가 |
| `panel_tournament.png` | P1 | 토너먼트 패널 - config 추가 |
| `panel_season.png` | P1 | 시즌 패널 - config 추가 |
| `panel_prestige.png` | P1 | 환생 패널 - config 추가 |
| `panel_transcend.png` | P2 | 초월 패널 - config 추가 |
| `panel_comeback.png` | P1 | 복귀 보상 - config 추가 |
| `panel_lucky_event.png` | P1 | 럭키 이벤트 - config 추가 |
| `panel_near_record.png` | P1 | 최고기록 근접 - config 추가 |
| `panel_mercy.png` | P1 | Mercy 시스템 - config 추가 |
| `panel_share.png` | P1 | 공유 패널 - config 추가 |
| `panel_first_purchase.png` | P1 | 첫 구매 - config 추가 |
| `panel_probability.png` | P1 | 확률 정보 - config 추가 |

---

## 9. SFX (효과음) - 20종

### 생성 현황: 20/20 (100%)

| 파일명 | 상태 | 현재 품질 | 비고 |
|--------|------|----------|------|
| `sfx_jump.wav` | **디자인프리** | jsfxr jump preset | 레트로 사운드, 사용 가능 |
| `sfx_land_perfect.wav` | **디자인프리** | jsfxr powerUp preset | 사용 가능 |
| `sfx_land_good.wav` | **디자인프리** | jsfxr hitHurt preset | 사용 가능 |
| `sfx_land_miss.wav` | **디자인프리** | jsfxr explosion preset | 사용 가능 |
| `sfx_combo_up.wav` | **디자인프리** | jsfxr pickupCoin preset | 사용 가능 |
| `sfx_combo_break.wav` | **디자인프리** | jsfxr hitHurt preset | 사용 가능 |
| `sfx_fall.wav` | **디자인프리** | jsfxr jump preset | 사용 가능 |
| `sfx_combo_milestone.wav` | **디자인프리** | jsfxr powerUp preset | 사용 가능 |
| `sfx_coin_collect.wav` | **디자인프리** | jsfxr pickupCoin preset | 사용 가능 |
| `sfx_button_click.wav` | **디자인프리** | jsfxr blipSelect preset | 사용 가능 |
| `sfx_popup_open.wav` | **디자인프리** | jsfxr blipSelect preset | 사용 가능 |
| `sfx_popup_close.wav` | **디자인프리** | jsfxr blipSelect preset | 사용 가능 |
| `sfx_menu_open.wav` | **디자인프리** | jsfxr blipSelect preset | 사용 가능 |
| `sfx_new_record.wav` | **디자인프리** | jsfxr powerUp preset | 사용 가능 |
| `sfx_game_over.wav` | **디자인프리** | jsfxr explosion preset | 사용 가능 |
| `sfx_revival.wav` | **디자인프리** | jsfxr powerUp preset | 사용 가능 |
| `sfx_coin_rain.wav` | **디자인프리** | jsfxr pickupCoin (P1) | 사용 가능 |
| `sfx_gift_open.wav` | **디자인프리** | jsfxr powerUp (P1) | 사용 가능 |
| `sfx_diamond_get.wav` | **디자인프리** | jsfxr pickupCoin (P1) | 사용 가능 |
| `sfx_level_up.wav` | **디자인프리** | jsfxr powerUp (P1) | 사용 가능 |

### 미생성 (P0-P2)
| 파일명 | 우선순위 | 필요 작업 |
|--------|----------|----------|
| `sfx_button_hover.wav` | P1 | config 추가 |
| `sfx_tab_switch.wav` | P1 | config 추가 |
| `sfx_whoosh.wav` | P1 | config 추가 |
| `sfx_near_record.wav` | P1 | 심장박동 루프 - 수작업 권장 |
| `sfx_mercy_trigger.wav` | P1 | config 추가 |
| `sfx_prestige.wav` | P1 | 극적인 전환 - 수작업 권장 |
| `sfx_lucky_time.wav` | P1 | config 추가 |
| `sfx_boss_can_appear.wav` | P1 | config 추가 |
| `voice_*.wav` (6종) | P2 | 보이스 - 녹음 필요 |

---

## 10. 미생성 카테고리 (수작업 필수)

### 고양이 캐릭터 - **완전 수작업 필요**

Asset Generator로 생성 **불가능**. 일러스트레이터 작업 필수.

#### P0 필수 (28프레임)
| 파일명 | 프레임 | 크기 | 설명 |
|--------|--------|------|------|
| `cat_idle.png` | 4 | 128x128 | 기본 대기, 깜빡임 |
| `cat_jump.png` | 2 | 128x128 | 점프 시작 |
| `cat_air.png` | 2 | 128x128 | 공중 자세 |
| `cat_land_perfect.png` | 3 | 128x128 | Perfect 착지 |
| `cat_land_good.png` | 4 | 128x128 | Good 착지 |
| `cat_land_miss.png` | 3 | 128x128 | Miss 착지 |
| `cat_happy.png` | 4 | 128x128 | 기쁜 표정 |
| `cat_sad.png` | 3 | 128x128 | 슬픈 표정 |
| `cat_fall.png` | 3 | 128x128 | 낙하 중 |

#### P1 추가 캐릭터
- `cat_hungry.png` (4프레임), `cat_excited.png` (4프레임), `cat_sweat.png` (3프레임), `cat_satisfied.png` (4프레임)
- `cat_parachute.png` (6프레임)
- 추가 고양이 5종 (페르시안, 샴, 스핑크스, 먼치킨, 스코티시) - 각 10프레임
- 특수 고양이 2종 (`cat_ghost.png`, `cat_mystery_silhouette.png`)
- 의상 75종 (모자 20, 안경 10, 옷 30, 액세서리 15)

### 배경 이미지 - **완전 수작업 필요**

Asset Generator로 생성 **불가능**. 일러스트레이터 작업 필수.

#### P0 필수 (3종)
| 파일명 | 크기 | 설명 |
|--------|------|------|
| `bg_main_menu.png` | 1080x1920 | 메인 메뉴 배경 |
| `bg_living_room_far.png` | 1080x1920 | 거실 배경 (1-10층) |
| `bg_gradient.png` | 1080x1920 | 범용 그라데이션 |

#### P0 화면 배경
| 파일명 | 크기 | 설명 |
|--------|------|------|
| `screen_mission.png` | 1080x1920 | 미션 화면 배경 |

#### P1 추가 배경
- `bg_living_room_mid.png`, `bg_living_room_near.png`
- `bg_garden_far.png`, `bg_garden_mid.png`
- `bg_rooftop.png`, `bg_night_sky.png`, `bg_space.png`
- `bg_shop.png`, `bg_cat_house.png`, `bg_tournament.png`
- `screen_leaderboard.png`, `screen_tournament.png`, `screen_achievement.png`, `screen_prestige.png`, `screen_season.png`

#### P2 배경
- `bg_rainbow.png`
- `screen_transcend.png`

### BGM (배경음악) - **완전 수작업 필요**

Asset Generator로 생성 **불가능**. 작곡가 작업 필수.

| 파일명 | 우선순위 | 스타일 | 길이 |
|--------|----------|--------|------|
| `bgm_main_menu.mp3` | **P0** | 재즈/로파이 80-90 BPM | 2분 루프 |
| `bgm_gameplay_0_20.mp3` | **P0** | 경쾌한 일렉트로닉 110-120 BPM | 2분 루프 |
| `bgm_gameplay_20_40.mp3` | P1 | 긴장감 비트 130-140 BPM | 2분 루프 |
| `bgm_gameplay_40plus.mp3` | P1 | 인텐스 신스웨이브 150+ BPM | 2분 루프 |
| `bgm_cat_house.mp3` | P1 | 아늑한 힐링 70-80 BPM | 2분 루프 |

### 폰트 - **외부 소스 필요**

| 파일명 | 우선순위 | 소스 | 용도 |
|--------|----------|------|------|
| Pretendard | **P0** | Google Fonts | 한국어 UI |
| Noto Sans | **P0** | Google Fonts | 다국어 폴백 |
| Fredoka One | **P0** | Google Fonts | 점수/콤보 |
| Jua | P1 | Google Fonts | 한국어 제목 |
| Pacifico | P2 | Google Fonts | 장식 텍스트 |

### 뱃지/칭호 (P1-P2) - 수작업 필요
- `badge_champion.png`, `badge_share_king.png` (64x64)
- `badge_prestige_1~10.png` (64x64, 10개)
- `badge_transcend_1~10.png` (64x64, 10개)
- `badge_season_*.png` (bronze, silver, gold, platinum, diamond) (96x96, 5개)
- `tier_indicator_*.png` (bronze, silver, gold, platinum, diamond) (48x48, 5개)

---

## 요약 통계

### Asset Generator 생성 현황

| 카테고리 | 생성 | P0 필요 | 완료율 |
|---------|-----|---------|--------|
| 간식캔 | 10 | 10 | **100%** |
| 버튼 | 36 (9종x4상태) | 24 (6종x4상태) | **100%** |
| 아이콘 | 12 | 10 | **100%** |
| 메달 | 4 | 4 | **100%** |
| HUD | 9 | 9 | **100%** |
| 튜토리얼 | 5 | 4 | **100%** |
| 이펙트 | 10 | 11 | **91%** (간식탑 미생성) |
| 패널 | 7 | 7 | **100%** |
| SFX | 20 | 15 | **100%** |
| **소계** | **113** | **94** | **98%** |

### 상태별 분류 (생성된 에셋 기준)

| 상태 | 개수 | 비율 | 설명 |
|------|-----|------|------|
| **디자인프리** | 61 | 71% | 그대로 사용 가능 |
| **업그레이드 권장** | 24 | 28% | 시간 있으면 개선 |
| **필수 대체** | 1 | 1% | `tuto_hand.png` |

### 수작업 필수 항목 (Asset Generator 범위 외)

| 카테고리 | P0 개수 | 설명 |
|---------|--------|------|
| 고양이 캐릭터 | 28프레임 (9파일) | 일러스트 |
| 배경 | 3종 | 1080x1920 |
| 화면 배경 | 1종 | screen_mission |
| BGM | 2트랙 | 작곡 |
| 폰트 | 3종 | 외부 다운로드 |
| 간식 탑 이펙트 | 10개 | fx_snack_tower |
| **P0 총 수작업** | **~47개** | - |

---

## MVP 전 체크리스트

### Asset Generator 필수 대체 (1개)
- [ ] `tuto_hand.png` - 실제 손가락 일러스트로 대체

### 수작업 제작 필수 (Asset Generator 범위 외)
- [ ] 고양이 캐릭터 전체 스프라이트 (9파일, 28프레임)
- [ ] 배경 3종 (메인메뉴, 거실, 그라데이션)
- [ ] 화면 배경 1종 (screen_mission)
- [ ] BGM 2트랙 (메인메뉴, 게임플레이 0-20층)
- [ ] 폰트 3종 다운로드 (Pretendard, Noto Sans, Fredoka One)
- [ ] 간식 탑 이펙트 10개 (`fx_snack_tower_*.png`)

### 소프트 런칭 전 권장 (업그레이드)
- [ ] 메달 4종 디테일 개선
- [ ] 이펙트 5종 애니메이션 버전
- [ ] HUD 3종 테마 적용
- [ ] 패널 4종 일러스트 추가
- [ ] 튜토리얼 2종 스타일 개선
- [ ] 특수 캔 2종 효과 강화

---

## 파일 교체 방법

1. 새 파일을 동일한 파일명으로 제작
2. `tools/asset-generator/output/` 해당 폴더에 저장
3. 또는 `assets/` 폴더에 직접 저장

**주의:**
- 파일명 반드시 동일 유지
- 크기(px) 동일 유지
- PNG-24 포맷, 투명 배경
- Asset Generator 재실행 시 `--force` 없으면 기존 파일 유지

---

**문서 끝**
