# Cat Jump: 에셋 제네레이터 구현 계획서

**문서 버전**: 1.0
**작성일**: 2025-11-28
**기반 문서**: asset-list.md v1.1, game-design.md v1.6.2

---

## 목차

1. [개요](#1-개요)
2. [코드 생성 기술 분류](#2-코드-생성-기술-분류)
3. [에셋별 생성 가능성 분석](#3-에셋별-생성-가능성-분석)
4. [에셋 제네레이터 아키텍처](#4-에셋-제네레이터-아키텍처)
5. [구현 우선순위 및 로드맵](#5-구현-우선순위-및-로드맵)
6. [기술 스택 및 도구](#6-기술-스택-및-도구)
7. [예상 개발 시간 및 리소스](#7-예상-개발-시간-및-리소스)
8. [제한 사항 및 대안](#8-제한-사항-및-대안)

---

## 1. 개요

### 1.1 목적

Cat Jump 게임의 에셋 제작 프로세스를 자동화하여:
- 디자이너 없이 MVP 수준의 에셋 생성 가능
- 반복적인 에셋 변형 자동 생성 (색상, 크기 등)
- 일관된 아트 스타일 유지
- 빠른 프로토타이핑 및 테스트

### 1.2 범위

**포함**:
- SVG 기반 UI 요소 (버튼, 아이콘, 패널)
- Canvas 2D로 생성 가능한 간단한 스프라이트
- CSS 기반 이펙트
- Web Audio API 기반 SFX
- 프로시저럴 패턴/텍스처

**제외** (디자이너 작업 필요):
- 복잡한 캐릭터 일러스트 (고양이 얼굴, 표정)
- 고품질 배경 아트
- 손으로 그린 스타일의 에셋
- 전문적인 BGM 작곡

### 1.3 기대 효과

- **개발 시간 단축**: P0 에셋의 50-60% 자동 생성 가능
- **비용 절감**: 초기 프로토타입 단계에서 디자이너 투입 최소화
- **빠른 반복**: 파라미터 조정만으로 에셋 변형 가능
- **일관성**: 코드 기반이므로 스타일 가이드 자동 준수

---

## 2. 코드 생성 기술 분류

### 2.1 기술별 적용 가능성

| 기술 | 적합한 에셋 유형 | 장점 | 단점 |
|------|-----------------|------|------|
| **SVG** | 아이콘, 버튼, UI 프레임, 심플한 캐릭터 | 벡터(확장 가능), 작은 파일 크기 | 복잡한 그라데이션/질감 표현 어려움 |
| **Canvas 2D** | 픽셀아트, 파티클, 간단한 애니메이션 | 픽셀 수준 제어, 애니메이션 가능 | 해상도 의존적 |
| **CSS Gradients** | 배경, 버튼 배경, 간단한 UI | 코드만으로 생성, 성능 우수 | 복잡한 패턴 불가 |
| **CSS Animations** | 펄스, 회전, 페이드 등 | 하드웨어 가속, 부드러움 | 복잡한 타임라인 관리 어려움 |
| **Web Audio API** | 8비트 스타일 SFX, 톤 생성 | 완전 프로시저럴, 파일 불필요 | 복잡한 사운드 불가 |
| **jsfxr** | 레트로 게임 SFX | 파라미터 기반 생성 | 현대적인 사운드 불가 |
| **Noise Functions** | 텍스처, 파티클 패턴 | 자연스러운 랜덤 | 계산 비용 |
| **Sprite Generator** | 픽셀아트 캐릭터 (단순) | 픽셀 배열로 정의 | 복잡한 디자인 불가 |

---

## 3. 에셋별 생성 가능성 분석

### 3.1 스프라이트/이미지 에셋 (총 510개 중 분석)

#### 3.1.1 고양이 캐릭터 (18개)

| 에셋명 | 생성 방법 | 난이도 | 품질 | 자동 생성 권장 |
|--------|----------|--------|------|---------------|
| `cat_idle.png` | 픽셀아트 배열 | ⭐⭐⭐⭐ | 60% | ❌ (디자이너 필요) |
| `cat_jump.png` | 픽셀아트 배열 | ⭐⭐⭐⭐ | 60% | ❌ |
| `cat_silhouette.png` | SVG 단순 도형 | ⭐⭐ | 80% | ✅ (실루엣만) |
| `cat_ghost.png` | SVG + 투명도 | ⭐⭐ | 70% | ✅ (실루엣 기반) |

**결론**: 캐릭터는 **디자이너 작업 필수**. 단, 실루엣/고스트는 생성 가능.

#### 3.1.2 간식캔 (18개)

| 에셋명 | 생성 방법 | 난이도 | 품질 | 자동 생성 권장 |
|--------|----------|--------|------|---------------|
| `can_tuna.png` | SVG 원통형 + 그라데이션 | ⭐⭐ | 85% | ✅ **우수** |
| `can_salmon.png` | SVG (색상 변형) | ⭐⭐ | 85% | ✅ |
| `can_golden.png` | SVG + CSS 애니메이션 | ⭐⭐⭐ | 80% | ✅ |
| `can_wide.png` | SVG (파라미터 조정) | ⭐ | 90% | ✅ |
| `can_shake.png` | SVG + CSS 애니메이션 | ⭐⭐ | 85% | ✅ |
| `can_fake.png` | SVG + 투명도 | ⭐ | 90% | ✅ |
| `can_boss_25.png` | SVG (스케일 1.5배) | ⭐⭐ | 75% | ✅ |

**결론**: 간식캔 전체 **자동 생성 가능** (P0 10종 모두 생성 가능)

#### 3.1.3 UI 요소 - 버튼 (14개)

| 에셋명 | 생성 방법 | 난이도 | 품질 | 자동 생성 권장 |
|--------|----------|--------|------|---------------|
| `btn_play_*.png` | SVG Rounded Rect + Gradient | ⭐ | 90% | ✅ **우수** |
| `btn_shop.png` | SVG (템플릿 기반) | ⭐ | 90% | ✅ |
| `btn_close.png` | SVG (X 아이콘) | ⭐ | 95% | ✅ |
| 모든 버튼 | SVG 템플릿 + 상태별 생성 | ⭐⭐ | 85% | ✅ |

**결론**: 모든 버튼 **자동 생성 가능**

#### 3.1.4 UI 요소 - 아이콘 (18개)

| 에셋명 | 생성 방법 | 난이도 | 품질 | 자동 생성 권장 |
|--------|----------|--------|------|---------------|
| `icon_coin.png` | SVG 원형 + $ 텍스트 | ⭐ | 90% | ✅ |
| `icon_diamond.png` | SVG 다각형 | ⭐⭐ | 85% | ✅ |
| `icon_energy.png` | SVG 하트 path | ⭐ | 90% | ✅ |
| `icon_star.png` | SVG 별 path | ⭐ | 95% | ✅ |
| `icon_trophy.png` | SVG path | ⭐⭐ | 80% | ✅ |
| `icon_volume.png` | SVG path | ⭐ | 90% | ✅ |

**결론**: 아이콘 대부분 **자동 생성 가능** (85% 이상)

#### 3.1.5 UI 요소 - 메달 (5개)

| 에셋명 | 생성 방법 | 난이도 | 품질 | 자동 생성 권장 |
|--------|----------|--------|------|---------------|
| `medal_bronze.png` | SVG 원형 + 그라데이션 | ⭐⭐ | 85% | ✅ |
| `medal_silver.png` | SVG (색상 변형) | ⭐⭐ | 85% | ✅ |
| `medal_shine_effect.png` | SVG + CSS 애니메이션 | ⭐⭐⭐ | 75% | ✅ |

**결론**: 메달 **자동 생성 가능**

#### 3.1.6 UI 요소 - 패널/프레임 (19개)

| 에셋명 | 생성 방법 | 난이도 | 품질 | 자동 생성 권장 |
|--------|----------|--------|------|---------------|
| `panel_basic.png` | SVG Rounded Rect + 9-slice | ⭐⭐ | 85% | ✅ |
| `panel_header.png` | SVG Rect + Gradient | ⭐ | 90% | ✅ |
| `progress_bar_*.png` | SVG Rect + Gradient | ⭐ | 95% | ✅ |

**결론**: 심플한 패널 **자동 생성 가능**, 복잡한 장식은 부분적

#### 3.1.7 HUD 요소 (9개)

| 에셋명 | 생성 방법 | 난이도 | 품질 | 자동 생성 권장 |
|--------|----------|--------|------|---------------|
| `hud_score_bg.png` | SVG Rounded Rect | ⭐ | 90% | ✅ |
| `hud_energy_empty.png` | SVG 하트 (회색) | ⭐ | 90% | ✅ |
| `hud_energy_full.png` | SVG 하트 (빨강) | ⭐ | 90% | ✅ |

**결론**: HUD 전체 **자동 생성 가능**

#### 3.1.8 튜토리얼 요소 (5개)

| 에셋명 | 생성 방법 | 난이도 | 품질 | 자동 생성 권장 |
|--------|----------|--------|------|---------------|
| `tuto_hand.png` | SVG 손가락 + 애니메이션 | ⭐⭐⭐ | 70% | ⚠️ (단순화) |
| `tuto_arrow.png` | SVG path | ⭐ | 95% | ✅ |
| `tuto_highlight.png` | SVG 원형 + 펄스 | ⭐ | 90% | ✅ |
| `tuto_perfect_zone.png` | SVG Rect + 색상 | ⭐ | 95% | ✅ |

**결론**: 손가락 제외 **자동 생성 가능**

#### 3.1.9 파티클/이펙트 (35개)

| 에셋명 | 생성 방법 | 난이도 | 품질 | 자동 생성 권장 |
|--------|----------|--------|------|---------------|
| `fx_perfect_sparkle.png` | Canvas 파티클 시스템 | ⭐⭐⭐ | 80% | ✅ |
| `fx_coin_collect.png` | Canvas 애니메이션 | ⭐⭐ | 85% | ✅ |
| `fx_screen_flash.png` | CSS 전체 화면 | ⭐ | 95% | ✅ |
| `fx_combo_burst.png` | Canvas Radial Gradient | ⭐⭐ | 80% | ✅ |
| `particle_rain.png` | Canvas 드롭 셰이프 | ⭐ | 90% | ✅ |
| `particle_star.png` | SVG 별 | ⭐ | 95% | ✅ |

**결론**: 이펙트 대부분 **Canvas/CSS로 생성 가능** (75%)

#### 3.1.10 배경 (12개)

| 에셋명 | 생성 방법 | 난이도 | 품질 | 자동 생성 권장 |
|--------|----------|--------|------|---------------|
| `bg_gradient.png` | CSS Gradient | ⭐ | 95% | ✅ |
| `bg_living_room_far.png` | SVG 간단한 실루엣 | ⭐⭐⭐⭐ | 50% | ❌ (디자이너) |
| `bg_night_sky.png` | Canvas Gradient + 별 | ⭐⭐ | 75% | ✅ (단순화) |
| `bg_space.png` | Canvas Gradient + 별 | ⭐⭐ | 75% | ✅ |

**결론**: 단순 배경만 **생성 가능** (그라데이션, 별 등)

---

### 3.2 오디오 에셋 (총 52개 중 분석)

#### 3.2.1 BGM (5개)

| 파일명 | 생성 방법 | 난이도 | 품질 | 자동 생성 권장 |
|--------|----------|--------|------|---------------|
| `bgm_main_menu.mp3` | Procedural Music (Tone.js) | ⭐⭐⭐⭐⭐ | 40% | ❌ (작곡가) |
| 모든 BGM | - | - | - | ❌ |

**결론**: BGM은 **전문 작곡가 필요**

#### 3.2.2 SFX (32개)

| 파일명 | 생성 방법 | 난이도 | 품질 | 자동 생성 권장 |
|--------|----------|--------|------|---------------|
| `sfx_jump.wav` | Web Audio API Oscillator | ⭐⭐ | 85% | ✅ |
| `sfx_land_perfect.wav` | jsfxr 파라미터 | ⭐⭐ | 80% | ✅ |
| `sfx_coin_collect.wav` | jsfxr 파라미터 | ⭐ | 90% | ✅ |
| `sfx_button_click.wav` | 간단한 톤 | ⭐ | 90% | ✅ |
| `sfx_new_record.wav` | 멜로디 시퀀스 | ⭐⭐⭐ | 70% | ✅ |
| `sfx_game_over.wav` | 하강 톤 | ⭐⭐ | 75% | ✅ |

**결론**: SFX 대부분 **자동 생성 가능** (80% 이상)

#### 3.2.3 보이스 (6개, P2)

**결론**: 보이스는 **녹음 필요**, 제외

---

### 3.3 폰트 (5개)

| 폰트명 | 획득 방법 | 자동 생성 권장 |
|--------|----------|---------------|
| Pretendard | Google Fonts CDN | ✅ (다운로드) |
| Noto Sans | Google Fonts CDN | ✅ |
| Fredoka One | Google Fonts CDN | ✅ |

**결론**: 오픈소스 폰트 **CDN 링크 또는 다운로드**

---

### 3.4 전체 생성 가능성 요약

| 카테고리 | 총 개수 | 자동 생성 가능 | 비율 | P0 생성 가능 |
|----------|---------|---------------|------|-------------|
| **고양이 캐릭터** | 18 | 2 (실루엣만) | 11% | 0/14 |
| **간식캔** | 18 | 18 | **100%** | 10/10 ✅ |
| **UI 버튼** | 14 | 14 | **100%** | 6/6 ✅ |
| **UI 아이콘** | 18 | 16 | 89% | 10/10 ✅ |
| **메달** | 5 | 5 | **100%** | 4/4 ✅ |
| **UI 패널** | 19 | 15 | 79% | 5/6 ⚠️ |
| **HUD** | 9 | 9 | **100%** | 7/7 ✅ |
| **튜토리얼** | 5 | 4 | 80% | 3/4 ⚠️ |
| **이펙트** | 35 | 26 | 74% | 8/11 ⚠️ |
| **배경** | 12 | 4 | 33% | 2/3 ⚠️ |
| **BGM** | 5 | 0 | 0% | 0/2 ❌ |
| **SFX** | 32 | 28 | 88% | 12/15 ✅ |
| **폰트** | 5 | 5 | **100%** | 3/3 ✅ |
| **총합** | **195** | **146** | **75%** | **70/115 (61%)** |

**핵심 통찰**:
- **P0 에셋 중 61%를 자동 생성 가능** (115개 중 70개)
- **간식캔, UI, SFX는 거의 100% 자동화 가능**
- **캐릭터, 배경, BGM은 디자이너/작곡가 필요**

---

## 4. 에셋 제네레이터 아키텍처

### 4.1 시스템 구조

```
┌─────────────────────────────────────────────────────────┐
│                  Asset Generator CLI                    │
│                    (Node.js Script)                     │
└──────────────────┬──────────────────────────────────────┘
                   │
       ┌───────────┼───────────┐
       │           │           │
       ▼           ▼           ▼
┌─────────┐  ┌──────────┐  ┌──────────┐
│ SVG Gen │  │Canvas Gen│  │Audio Gen │
└─────────┘  └──────────┘  └──────────┘
       │           │           │
       └───────────┼───────────┘
                   │
                   ▼
        ┌────────────────────┐
        │   Output Manager   │
        │  (PNG/SVG/WAV 출력) │
        └────────────────────┘
                   │
                   ▼
        ┌────────────────────┐
        │   assets/ 폴더      │
        │  - sprites/        │
        │  - ui/             │
        │  - audio/          │
        └────────────────────┘
```

### 4.2 핵심 모듈

#### 4.2.1 SVG Generator (`svg-generator.js`)

**역할**: SVG 기반 에셋 생성 (버튼, 아이콘, 간식캔 등)

```javascript
class SVGGenerator {
  constructor(config) {
    this.palette = config.palette; // 색상 팔레트
  }

  // 간식캔 생성
  generateCan(type, options = {}) {
    const { width = 128, height = 64, color, label } = options;
    // SVG 원통형 + 그라데이션 생성
    return svgString;
  }

  // 버튼 생성
  generateButton(text, state = 'normal', options = {}) {
    // Rounded Rect + Gradient + Text
    return svgString;
  }

  // 아이콘 생성
  generateIcon(type, size = 64) {
    // 사전 정의된 path 데이터 사용
    const pathData = iconPaths[type];
    return svgString;
  }

  // SVG를 PNG로 변환
  async toPNG(svgString, outputPath) {
    // sharp 또는 puppeteer 사용
  }
}
```

**지원 에셋**:
- 간식캔 전체 (18개)
- 버튼 전체 (14개)
- 아이콘 대부분 (16개)
- 메달, HUD, 패널 일부

#### 4.2.2 Canvas Generator (`canvas-generator.js`)

**역할**: Canvas 2D API로 픽셀 기반 에셋 생성

```javascript
class CanvasGenerator {
  constructor(width, height) {
    this.canvas = createCanvas(width, height);
    this.ctx = this.canvas.getContext('2d');
  }

  // 파티클 효과 생성
  generateParticle(type, frame) {
    // Perfect sparkle, coin collect 등
    return canvasBuffer;
  }

  // 픽셀아트 렌더링 (간단한 캐릭터 실루엣)
  renderPixelArt(pixelArray, palette, scale = 4) {
    // 2D 배열을 픽셀로 렌더링
    return canvasBuffer;
  }

  // 그라데이션 배경
  generateGradientBG(colors, direction = 'vertical') {
    return canvasBuffer;
  }

  // PNG 저장
  async savePNG(outputPath) {
    const buffer = this.canvas.toBuffer('image/png');
    await fs.writeFile(outputPath, buffer);
  }
}
```

**지원 에셋**:
- 파티클 이펙트 (26개)
- 간단한 배경 (4개)
- 픽셀아트 실루엣

#### 4.2.3 Audio Generator (`audio-generator.js`)

**역할**: Web Audio API + jsfxr로 SFX 생성

```javascript
class AudioGenerator {
  constructor() {
    this.audioContext = new OfflineAudioContext(1, 44100 * 2, 44100);
  }

  // 간단한 톤 생성
  generateTone(frequency, duration, type = 'sine') {
    const oscillator = this.audioContext.createOscillator();
    // 설정...
    return audioBuffer;
  }

  // jsfxr 파라미터 기반 생성
  generateSFX(params) {
    // jsfxr 라이브러리 사용
    return audioBuffer;
  }

  // 멜로디 시퀀스 (신기록 등)
  generateMelody(notes) {
    // 여러 톤 조합
    return audioBuffer;
  }

  // WAV 저장
  async saveWAV(audioBuffer, outputPath) {
    // audiobuffer-to-wav 사용
  }
}
```

**지원 에셋**:
- SFX 대부분 (28개)

**jsfxr 파라미터 예시**:
```javascript
const jumpSound = {
  waveType: 0, // 사각파
  startFrequency: 0.3,
  slide: 0.2,
  sustainTime: 0.1,
  // ...
};
```

#### 4.2.4 Config Manager (`config.js`)

**역할**: 에셋 정의 및 파라미터 관리

```javascript
// config/assets.json
{
  "cans": [
    {
      "id": "can_tuna",
      "type": "basic",
      "color": "#3498db",
      "label": "Tuna",
      "width": 128,
      "height": 64
    },
    {
      "id": "can_golden",
      "type": "special",
      "color": "#FFD700",
      "animation": "glow",
      "width": 128,
      "height": 64
    }
    // ...
  ],
  "buttons": [
    {
      "id": "btn_play",
      "text": "PLAY",
      "color": "#4CAF50",
      "width": 200,
      "height": 60,
      "states": ["normal", "pressed", "disabled"]
    }
    // ...
  ],
  "sfx": [
    {
      "id": "sfx_jump",
      "type": "jsfxr",
      "params": { /* ... */ }
    }
    // ...
  ]
}
```

#### 4.2.5 CLI Interface (`cli.js`)

```bash
# 전체 생성
npm run generate-assets

# 카테고리별 생성
npm run generate-assets --category=cans
npm run generate-assets --category=ui
npm run generate-assets --category=sfx

# 개별 에셋 생성
npm run generate-assets --asset=can_tuna
npm run generate-assets --asset=btn_play

# 우선순위별 생성
npm run generate-assets --priority=P0
```

**내부 구조**:
```javascript
// cli.js
const program = require('commander');

program
  .option('-c, --category <type>', 'Asset category')
  .option('-a, --asset <name>', 'Specific asset')
  .option('-p, --priority <level>', 'Priority level (P0/P1/P2)')
  .parse(process.argv);

async function main() {
  const config = loadConfig('./config/assets.json');
  const svgGen = new SVGGenerator(config.palette);
  const canvasGen = new CanvasGenerator();
  const audioGen = new AudioGenerator();

  // 필터링
  const assets = filterAssets(config, program.opts());

  // 생성
  for (const asset of assets) {
    await generateAsset(asset, { svgGen, canvasGen, audioGen });
  }

  console.log(`✅ Generated ${assets.length} assets`);
}
```

### 4.3 폴더 구조

```
asset-generator/
├── package.json
├── cli.js                  # CLI 진입점
├── config/
│   ├── assets.json         # 에셋 정의
│   ├── palette.json        # 색상 팔레트
│   └── sfx-params.json     # SFX 파라미터
├── src/
│   ├── generators/
│   │   ├── svg-generator.js
│   │   ├── canvas-generator.js
│   │   └── audio-generator.js
│   ├── templates/
│   │   ├── can-template.js
│   │   ├── button-template.js
│   │   └── icon-paths.js
│   └── utils/
│       ├── svg-to-png.js
│       ├── audio-buffer-to-wav.js
│       └── file-manager.js
├── output/                 # 생성된 에셋
│   ├── sprites/
│   ├── ui/
│   └── audio/
└── tests/
    └── generator.test.js
```

---

## 5. 구현 우선순위 및 로드맵

### 5.1 Phase 1: MVP 제네레이터 (P0 에셋 중 필수)

**목표**: 게임 프로토타입에 필요한 최소 에셋 생성

**구현 범위**:
- ✅ 간식캔 10종 (기본 5 + 특수 5)
- ✅ UI 버튼 6종 (play, shop, settings, close, ad, mission)
- ✅ UI 아이콘 10종 (coin, diamond, energy, star, check, volume, music, mission 등)
- ✅ 메달 4종 (bronze, silver, gold, platinum)
- ✅ HUD 7종 (score, combo, floor, energy 등)
- ✅ 튜토리얼 3종 (arrow, highlight, perfect zone)
- ✅ SFX 12종 (jump, land 3종, coin, combo 3종, button, popup, menu)

**생성 가능 에셋**: **52개** (P0의 45%)

**개발 시간**: 2주
- Week 1: SVG Generator + Canvas Generator 기본
- Week 2: Audio Generator + CLI + 테스트

### 5.2 Phase 2: 확장 (P0 나머지 + P1 일부)

**목표**: P0 완성 + P1 UI/이펙트

**추가 구현**:
- ✅ 이펙트 8종 (sparkle, dust, impact, flash, coin collect, combo burst, confetti, flash)
- ✅ 배경 2종 (gradient, night sky)
- ✅ UI 패널 5종 (basic, header, gameover, mission, login reward)
- ✅ SFX 3종 (new record, game over, revival)

**추가 생성 에셋**: **+18개**

**개발 시간**: 1주

### 5.3 Phase 3: 고급 기능 (P1 나머지)

**목표**: 자동화율 극대화

**추가 구현**:
- ✅ 애니메이션 프레임 자동 생성 (glow, shake, pulse)
- ✅ 배리에이션 자동 생성 (색상, 크기)
- ✅ Sprite Atlas 자동 패킹
- ✅ 오디오 스프라이트 자동 생성

**개발 시간**: 1주

### 5.4 총 개발 로드맵

| Phase | 기간 | 생성 에셋 수 | 누적 |
|-------|------|-------------|------|
| Phase 1 (MVP) | 2주 | 52개 | 52개 |
| Phase 2 (확장) | 1주 | 18개 | 70개 |
| Phase 3 (고급) | 1주 | - (자동화 개선) | 70개 |
| **총합** | **4주** | **70개** | **P0의 61%** |

---

## 6. 기술 스택 및 도구

### 6.1 필수 라이브러리

```json
{
  "dependencies": {
    "canvas": "^2.11.2",           // Canvas API (Node.js)
    "sharp": "^0.33.0",            // 이미지 변환 (SVG→PNG)
    "svg.js": "^3.2.0",            // SVG 생성
    "jsfxr": "^1.0.0",             // SFX 생성
    "audiobuffer-to-wav": "^1.0.0", // WAV 저장
    "commander": "^11.1.0",        // CLI
    "chalk": "^5.3.0",             // 터미널 색상
    "ora": "^7.0.1"                // 로딩 스피너
  },
  "devDependencies": {
    "jest": "^29.7.0",             // 테스트
    "prettier": "^3.1.0"           // 포맷팅
  }
}
```

### 6.2 선택적 도구

- **TexturePacker CLI**: Sprite Atlas 자동 생성
- **Puppeteer**: 복잡한 SVG→PNG 변환 (headless browser)
- **Audiosprite**: 오디오 스프라이트 생성

---

## 7. 예상 개발 시간 및 리소스

### 7.1 인력

- **개발자 1명** (풀타임)
- 또는 **개발자 0.5명** (파트타임, 8주)

### 7.2 시간 상세

| 작업 | 예상 시간 |
|------|----------|
| SVG Generator 구현 | 3일 |
| Canvas Generator 구현 | 3일 |
| Audio Generator 구현 | 2일 |
| CLI 및 Config 시스템 | 2일 |
| 에셋 정의 (JSON 작성) | 2일 |
| 테스트 및 디버깅 | 2일 |
| 문서화 | 1일 |
| **총합** | **15일 (3주)** |

### 7.3 비용 절감 효과

**디자이너 없이 자동 생성 시**:
- P0 에셋 70개 자동 생성
- 디자이너 작업 시간 절감: 약 70시간 (에셋당 1시간)
- 비용 절감: $3,500 ~ $7,000 (시간당 $50~$100 가정)

**제네레이터 개발 비용**:
- 개발자 3주: $6,000 ~ $9,000

**ROI**: 첫 프로젝트에서 본전, 이후 프로젝트에서 순이익

---

## 8. 제한 사항 및 대안

### 8.1 제한 사항

#### 8.1.1 디자이너 작업 필수 에셋

| 카테고리 | 개수 | 이유 |
|----------|------|------|
| 고양이 캐릭터 | 14개 (P0) | 복잡한 일러스트, 표정 표현 |
| 추가 고양이 | 5종 (P1) | 종별 특징 표현 |
| 의상 | 75종 (P1) | 디테일한 디자인 |
| 복잡한 배경 | 8개 | 아트 스타일 표현 |
| BGM | 5개 | 전문 작곡 |

**대안**:
- **에셋 스토어 구매**: Unity Asset Store, itch.io
- **AI 이미지 생성**: Midjourney, DALL-E (라이선스 주의)
- **프리랜서 디자이너**: Fiverr, Upwork (저비용)

#### 8.1.2 품질 한계

**자동 생성 품질**: 60-85% (전문 디자이너 대비)

**해결책**:
- **프로토타입 단계**: 자동 생성 에셋 사용
- **정식 출시**: 디자이너 재작업 또는 개선

#### 8.1.3 아트 스타일 일관성

**문제**: 코드 기반 에셋 vs 손그림 에셋 스타일 차이

**해결책**:
- **하이브리드 접근**: 자동 생성 에셋을 베이스로, 디테일 추가
- **스타일 가이드 엄격 적용**: 색상 팔레트, 선 굵기, 그림자 등

### 8.2 기술적 한계

#### 8.2.1 SVG→PNG 변환 품질

**문제**: Headless 환경에서 SVG 렌더링 품질 차이

**해결책**:
- **sharp** 사용 (높은 품질)
- 문제 시 **Puppeteer** (Chrome 렌더링)

#### 8.2.2 오디오 품질

**문제**: jsfxr는 레트로 스타일, 현대적 사운드 불가

**해결책**:
- P0는 jsfxr 사용 (프로토타입)
- P1부터 사운드 디자이너 투입

---

## 9. 구현 예시

### 9.1 간식캔 생성 예시

```javascript
// config/assets.json
{
  "cans": [
    {
      "id": "can_tuna",
      "type": "basic",
      "color": "#3498db",
      "label": "TUNA",
      "icon": "🐟"
    },
    {
      "id": "can_golden",
      "type": "special",
      "color": "#FFD700",
      "animation": "glow"
    }
  ]
}
```

```javascript
// src/generators/svg-generator.js
generateCan(config) {
  const { id, color, label, width = 128, height = 64 } = config;

  const svg = `
    <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${id}_grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${lighten(color, 20)}" />
          <stop offset="100%" style="stop-color:${darken(color, 20)}" />
        </linearGradient>
        <radialGradient id="${id}_shine">
          <stop offset="0%" style="stop-color:#fff;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#fff;stop-opacity:0" />
        </radialGradient>
      </defs>

      <!-- 원통형 몸체 -->
      <rect x="10" y="10" width="${width - 20}" height="${height - 20}"
            rx="8" fill="url(#${id}_grad)"
            stroke="${darken(color, 30)}" stroke-width="2"/>

      <!-- 상단 라벨 -->
      <rect x="20" y="15" width="${width - 40}" height="15"
            rx="4" fill="#fff" opacity="0.9"/>
      <text x="${width / 2}" y="25" font-family="Arial" font-size="10"
            fill="${color}" text-anchor="middle" font-weight="bold">
        ${label}
      </text>

      <!-- 금속 반사광 -->
      <ellipse cx="${width / 2}" cy="20" rx="30" ry="5"
               fill="url(#${id}_shine)"/>
    </svg>
  `;

  return svg;
}
```

**출력**:
- `can_tuna.svg` (벡터)
- `can_tuna.png` (128x64, PNG-24)

### 9.2 버튼 생성 예시

```javascript
generateButton(config) {
  const { id, text, color, width = 200, height = 60, state = 'normal' } = config;

  const stateOffsets = {
    normal: 0,
    pressed: 2,
    disabled: 0
  };

  const opacity = state === 'disabled' ? 0.5 : 1.0;
  const yOffset = stateOffsets[state];

  const svg = `
    <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${id}_grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${lighten(color, 10)}" />
          <stop offset="100%" style="stop-color:${darken(color, 10)}" />
        </linearGradient>
      </defs>

      <!-- 그림자 -->
      <rect x="5" y="${8 + yOffset}" width="${width - 10}" height="${height - 10}"
            rx="10" fill="#000" opacity="0.2"/>

      <!-- 버튼 몸체 -->
      <rect x="5" y="${5 + yOffset}" width="${width - 10}" height="${height - 10}"
            rx="10" fill="url(#${id}_grad)"
            stroke="${darken(color, 20)}" stroke-width="3" opacity="${opacity}"/>

      <!-- 텍스트 -->
      <text x="${width / 2}" y="${height / 2 + 5 + yOffset}"
            font-family="Arial" font-size="20" fill="#fff"
            text-anchor="middle" font-weight="bold">
        ${text}
      </text>
    </svg>
  `;

  return svg;
}
```

**출력**:
- `btn_play_normal.svg/png`
- `btn_play_pressed.svg/png`
- `btn_play_disabled.svg/png`

### 9.3 SFX 생성 예시

```javascript
// config/sfx-params.json
{
  "sfx_jump": {
    "waveType": 0,
    "startFrequency": 0.3,
    "slide": 0.2,
    "sustainTime": 0.1,
    "decayTime": 0.2,
    "masterVolume": 0.5
  },
  "sfx_coin_collect": {
    "waveType": 1,
    "startFrequency": 0.5,
    "slide": 0.4,
    "sustainTime": 0.05,
    "decayTime": 0.3,
    "masterVolume": 0.5
  }
}
```

```javascript
// src/generators/audio-generator.js
const jsfxr = require('jsfxr');
const fs = require('fs').promises;

async function generateSFX(id, params) {
  // jsfxr로 AudioBuffer 생성
  const audioBuffer = jsfxr.generate(params);

  // WAV 변환
  const wavBuffer = audioBufferToWav(audioBuffer);

  // 저장
  await fs.writeFile(`output/audio/${id}.wav`, wavBuffer);
  console.log(`✅ Generated ${id}.wav`);
}
```

**출력**:
- `sfx_jump.wav` (200ms, mono, 96kbps)
- `sfx_coin_collect.wav`

---

## 10. 성공 기준

### 10.1 정량적 목표

- ✅ P0 에셋 중 **60개 이상** 자동 생성
- ✅ 생성 시간: 전체 **5분 이내**
- ✅ 파일 크기: 원본 대비 **90% 이하**
- ✅ CLI 명령어 **3개 이상** 지원

### 10.2 정성적 목표

- ✅ 디자이너 없이 **플레이 가능한 프로토타입** 제작
- ✅ 생성된 에셋이 **스타일 가이드 준수**
- ✅ 개발자가 **10분 이내** 사용법 습득

---

## 11. 다음 단계

### 11.1 즉시 시작 가능

1. **Phase 1 개발 착수** (SVG/Canvas/Audio Generator)
2. **에셋 정의 파일 작성** (config/assets.json)
3. **색상 팔레트 확정** (config/palette.json)

### 11.2 병렬 진행

- **디자이너 작업**: 고양이 캐릭터 14프레임 (P0 필수)
- **음악 작곡가**: BGM 2트랙 (메인 메뉴, 게임플레이)

### 11.3 장기 계획

- **Phase 2/3 개발** (P1 에셋 지원)
- **AI 이미지 생성 연동** (Stable Diffusion API)
- **에셋 버전 관리** (Git LFS)

---

## 부록: 생성 가능 에셋 전체 목록

### A. 간식캔 (18개, 100% 생성 가능)

- ✅ can_tuna, can_salmon, can_chicken, can_beef, can_mix
- ✅ can_golden, can_wide, can_gift, can_narrow, can_shake
- ✅ can_fake, can_invisible, can_reverse
- ✅ can_boss_25, can_boss_50, can_boss_75, can_boss_100

### B. UI 버튼 (14개, 100% 생성 가능)

- ✅ btn_play (3 states), btn_shop, btn_settings, btn_close
- ✅ btn_adwatch, btn_share, btn_leaderboard, btn_mission
- ✅ btn_tournament, btn_season, btn_prestige, btn_transcend, btn_undo_prestige

### C. UI 아이콘 (16개, 89% 생성 가능)

- ✅ icon_coin, icon_diamond, icon_energy, icon_star
- ✅ icon_trophy, icon_gift, icon_lock, icon_check
- ✅ icon_info, icon_volume, icon_music, icon_vibrate
- ✅ icon_mission, icon_tournament, icon_season, icon_prestige

### D. 메달 (5개, 100% 생성 가능)

- ✅ medal_bronze, medal_silver, medal_gold, medal_platinum
- ✅ medal_shine_effect

### E. HUD (9개, 100% 생성 가능)

- ✅ hud_score_bg, hud_combo_bg, hud_floor_bg
- ✅ hud_energy_empty, hud_energy_full, hud_energy_timer
- ✅ hud_mission_tracker, hud_countdown_timer, hud_lucky_queue

### F. 튜토리얼 (4개, 80% 생성 가능)

- ✅ tuto_arrow, tuto_highlight, tuto_perfect_zone
- ⚠️ tuto_hand (단순화 버전), tuto_speech_bubble

### G. 이펙트 (26개, 74% 생성 가능)

- ✅ fx_perfect_sparkle, fx_good_dust, fx_land_impact, fx_screen_flash
- ✅ fx_coin_collect, fx_combo_burst, fx_new_record_confetti, fx_new_record_flash
- ✅ particle_rain, particle_snow, particle_star, particle_butterfly

### H. 배경 (4개, 33% 생성 가능)

- ✅ bg_gradient
- ✅ bg_night_sky (단순화)
- ✅ bg_space (단순화)
- ❌ bg_living_room (디자이너 필요)

### I. SFX (28개, 88% 생성 가능)

- ✅ sfx_jump, sfx_land_perfect, sfx_land_good, sfx_land_miss
- ✅ sfx_combo_up, sfx_combo_break, sfx_combo_milestone
- ✅ sfx_coin_collect, sfx_button_click, sfx_popup_open, sfx_menu_open
- ✅ sfx_new_record, sfx_game_over, sfx_revival

### J. 폰트 (5개, 100% CDN 가능)

- ✅ Pretendard, Noto Sans, Fredoka One, Jua, Pacifico

---

**문서 종료**

이 계획서를 기반으로 에셋 제네레이터 개발을 시작할 수 있습니다.
궁금한 점이나 추가 요청 사항은 개발팀에 문의해주세요.
