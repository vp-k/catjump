# Cat Jump: Tower Stack - 배포 체크리스트

**문서 버전**: 1.0
**작성일**: 2025-11-27
**대상**: Week 8 출시 준비

---

## 목차

1. [사전 준비](#1-사전-준비)
2. [Android 배포](#2-android-배포)
3. [iOS 배포](#3-ios-배포)
4. [Web 배포](#4-web-배포)
5. [Firebase 프로덕션](#5-firebase-프로덕션)
6. [법적 준수](#6-법적-준수)
7. [출시 후 모니터링](#7-출시-후-모니터링)

---

## 1. 사전 준비

### 1.1 계정 준비

- [ ] **Google Play Console** 개발자 계정 ($25 일회성)
- [ ] **Apple Developer Program** 계정 ($99/년)
- [ ] **AdMob** 계정 생성 및 앱 등록
- [ ] **Firebase** 프로젝트 Blaze 요금제
- [ ] **Vercel/Netlify** 계정 (Web 배포용)

### 1.2 앱 정보 준비

| 항목 | 내용 |
|------|------|
| 앱 이름 | Cat Jump: Tower Stack |
| 패키지명 | com.yourcompany.catjump |
| 버전 코드 | 1 |
| 버전 이름 | 1.0.0 |
| 최소 Android | API 24 (Android 7.0) |
| 최소 iOS | iOS 14.0 |

### 1.3 에셋 준비

#### 앱 아이콘
- [ ] Android: 512x512 PNG (Play Store)
- [ ] Android: 192x192, 144x144, 96x96, 72x72, 48x48 (앱 내)
- [ ] iOS: 1024x1024 PNG (App Store)
- [ ] iOS: 180x180, 167x167, 152x152, 120x120 등 (앱 내)

#### 스토어 스크린샷
- [ ] 휴대폰 스크린샷 (최소 4장, 최대 8장)
  - Android: 16:9 또는 9:16
  - iOS: 6.7", 6.5", 5.5" 디스플레이
- [ ] 태블릿 스크린샷 (선택)
- [ ] 기능 그래픽 (Android: 1024x500)

#### 홍보 영상 (선택)
- [ ] YouTube 또는 앱 미리보기 (15-30초)

### 1.4 텍스트 준비

#### 앱 설명 (한국어/영어)
```
짧은 설명 (80자):
고양이와 함께 캔 타워를 쌓아요! 원터치 점프로 하늘까지!

긴 설명:
[게임 소개]
- 간단한 원터치 조작
- 중독성 있는 점프 게임플레이
- 다양한 고양이 캐릭터
- 글로벌 리더보드

[주요 기능]
- Perfect 착지 시스템
- 콤보와 피버 모드
- 일일/주간 미션
- 고양이 하우스 꾸미기
...
```

---

## 2. Android 배포

### 2.1 빌드 준비

#### 서명 키 생성
```bash
# keystore 생성
keytool -genkey -v -keystore catjump-release.keystore \
  -alias catjump -keyalg RSA -keysize 2048 -validity 10000

# keystore 정보를 안전한 곳에 백업!
```

#### capacitor.config.ts
```typescript
const config: CapacitorConfig = {
  appId: 'com.yourcompany.catjump',
  appName: 'Cat Jump',
  webDir: 'dist',
  android: {
    buildOptions: {
      keystorePath: 'catjump-release.keystore',
      keystorePassword: process.env.KEYSTORE_PASSWORD,
      keystoreAlias: 'catjump',
      keystoreAliasPassword: process.env.KEY_PASSWORD,
      releaseType: 'AAB',
    }
  }
};
```

#### 빌드 명령어
```bash
# 웹 빌드
npm run build

# Android 프로젝트 동기화
npx cap sync android

# AAB 빌드 (Android Studio 또는 CLI)
cd android && ./gradlew bundleRelease
```

### 2.2 Play Console 설정

#### 스토어 등록 정보
- [ ] 기본 정보 (이름, 설명)
- [ ] 그래픽 (아이콘, 스크린샷, 기능 그래픽)
- [ ] 카테고리: 게임 > 캐주얼
- [ ] 태그: 하이퍼캐주얼, 점프, 고양이
- [ ] 연락처 정보

#### 콘텐츠 등급
- [ ] IARC 설문 완료
- [ ] 예상 등급: 전체 이용가 (PEGI 3, ESRB E)

#### 앱 콘텐츠
- [ ] 개인정보 처리방침 URL
- [ ] 광고 포함 여부: 예
- [ ] 인앱 구매 포함 여부: 예

#### 타겟 연령
- [ ] 타겟 연령 설정 (13세 이상 권장)
- [ ] **COPPA 준수 필요 시** 어린이 대상 앱 설정

### 2.3 테스트 트랙

```
내부 테스트 → 비공개 테스트 → 공개 테스트 → 프로덕션
```

- [ ] 내부 테스트 트랙 업로드
- [ ] 내부 테스터 추가 (최대 100명)
- [ ] 테스트 후 비공개 테스트로 승격
- [ ] 비공개 테스터 추가
- [ ] 최종 검증 후 프로덕션 출시

### 2.4 출시 체크리스트

- [ ] AAB 파일 업로드
- [ ] 버전 코드/이름 확인
- [ ] 출시 노트 작성
- [ ] 단계적 출시 설정 (10% → 50% → 100%)
- [ ] **출시 버튼 클릭**

---

## 3. iOS 배포

### 3.1 빌드 준비

#### Xcode 설정
- [ ] Bundle Identifier: com.yourcompany.catjump
- [ ] Team 선택 (Apple Developer 계정)
- [ ] Signing & Capabilities 설정
- [ ] App Store Distribution 프로비저닝 프로파일

#### 빌드 명령어
```bash
# 웹 빌드
npm run build

# iOS 프로젝트 동기화
npx cap sync ios

# Xcode에서 Archive 및 App Store 업로드
# Product → Archive → Distribute App
```

### 3.2 App Store Connect 설정

#### 앱 정보
- [ ] 앱 이름
- [ ] 부제목 (선택, 30자)
- [ ] 카테고리: 게임 - 캐주얼
- [ ] 보조 카테고리 (선택)

#### 가격 및 사용 가능 여부
- [ ] 가격: 무료
- [ ] 사용 가능 지역 선택

#### 앱 개인정보 처리방침
- [ ] 개인정보 처리방침 URL
- [ ] 앱 개인정보 섹션 작성
  - 수집 데이터 유형
  - 데이터 사용 목적
  - 사용자 추적 여부

#### 연령 등급
- [ ] 연령 등급 설문 완료
- [ ] 예상: 4+ (모든 연령)

### 3.3 심사 준비

#### 심사 정보
- [ ] 로그인 필요 시 테스트 계정 정보
- [ ] 연락처 정보 (전화번호, 이메일)
- [ ] 심사 노트 (특이사항 설명)

#### 앱 미리보기 및 스크린샷
- [ ] iPhone 6.7" 스크린샷
- [ ] iPhone 6.5" 스크린샷
- [ ] iPhone 5.5" 스크린샷 (선택)
- [ ] iPad Pro 12.9" 스크린샷 (선택)

### 3.4 TestFlight 베타 테스트

- [ ] 빌드 업로드
- [ ] 내부 테스터 추가 (최대 100명)
- [ ] 외부 테스트 그룹 생성 (선택)
- [ ] 베타 앱 설명 및 피드백 수집

### 3.5 출시 체크리스트

- [ ] 빌드 업로드 및 처리 완료
- [ ] 버전 정보 입력
- [ ] 출시 노트 작성
- [ ] 심사 제출
- [ ] 심사 승인 대기 (1-3일)
- [ ] **수동 출시** 또는 **자동 출시** 선택

---

## 4. Web 배포

### 4.1 Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

#### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 4.2 도메인 설정

- [ ] 도메인 구매 (catjump.game 등)
- [ ] DNS 설정 (Vercel에 연결)
- [ ] HTTPS 자동 설정 확인

### 4.3 PWA 체크리스트

- [ ] manifest.json 설정
- [ ] Service Worker 등록
- [ ] 오프라인 페이지
- [ ] 앱 아이콘 (192x192, 512x512)
- [ ] Lighthouse PWA 점수 100

#### manifest.json
```json
{
  "name": "Cat Jump: Tower Stack",
  "short_name": "Cat Jump",
  "description": "고양이와 함께 캔 타워를 쌓아요!",
  "start_url": "/",
  "display": "fullscreen",
  "orientation": "portrait",
  "background_color": "#87CEEB",
  "theme_color": "#FF6B6B",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## 5. Firebase 프로덕션

### 5.1 프로덕션 환경 분리

- [ ] Firebase 프로젝트 2개 운영 (dev / prod)
- [ ] 환경변수로 분리 (.env.production)
- [ ] Firestore 보안 규칙 최종 검토

### 5.2 보안 규칙 최종 확인

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 프로덕션 보안 규칙 최종 확인
    // - 인증 필수 확인
    // - 권한 범위 최소화
    // - rate limiting 고려
  }
}
```

### 5.3 Cloud Functions 배포

```bash
# 프로덕션 배포
firebase use production
firebase deploy --only functions
```

### 5.4 Analytics / Crashlytics 설정

- [ ] Analytics 이벤트 검증
- [ ] Crashlytics 통합 확인
- [ ] 대시보드 알림 설정

---

## 6. 법적 준수

### 6.1 개인정보 처리방침

- [ ] 개인정보 처리방침 페이지 생성
- [ ] 수집 데이터 명시
  - 익명 사용자 ID
  - 게임 플레이 데이터
  - 광고 식별자
- [ ] 데이터 사용 목적 명시
- [ ] 제3자 공유 명시 (AdMob, Firebase)
- [ ] 연락처 정보

### 6.2 COPPA 준수 (어린이 대상 시)

- [ ] 13세 미만 데이터 수집 제한
- [ ] 부모 동의 메커니즘 (필요시)
- [ ] 맞춤 광고 비활성화
- [ ] AdMob 어린이 대상 앱 설정

### 6.3 GDPR 준수 (EU 사용자)

- [ ] 쿠키/데이터 수집 동의 배너
- [ ] 데이터 삭제 요청 메커니즘
- [ ] 개인정보 접근 요청 대응

### 6.4 확률형 아이템 고지

```
가챠 확률 공개 (법적 의무):
- 일반: 70%
- 희귀: 20%
- 영웅: 8%
- 전설: 2%
```

- [ ] 가챠 확률 인게임 공개
- [ ] 스토어 설명에 확률형 아이템 포함 명시

---

## 7. 출시 후 모니터링

### 7.1 모니터링 대시보드

| 도구 | 용도 |
|------|------|
| Firebase Analytics | DAU, 리텐션, 이벤트 |
| Firebase Crashlytics | 크래시 모니터링 |
| AdMob | 광고 수익 |
| Play Console / App Store Connect | 설치, 평점, 리뷰 |

### 7.2 핵심 지표 (KPI)

| 지표 | 목표 | 알림 기준 |
|------|------|----------|
| DAU | - | 전일 대비 20% 감소 |
| D1 Retention | 40%+ | 30% 미만 |
| D7 Retention | 15%+ | 10% 미만 |
| Crash-free Rate | 99%+ | 98% 미만 |
| ARPDAU | - | 전주 대비 30% 감소 |

### 7.3 리뷰 관리

- [ ] 매일 리뷰 확인
- [ ] 부정적 리뷰 대응 (24시간 내)
- [ ] 1-2점 리뷰 버그 보고서로 전환
- [ ] 긍정적 리뷰 감사 답변

### 7.4 핫픽스 절차

```
크래시 발생 → Crashlytics 알림 → 원인 분석 → 핫픽스 → 긴급 배포
```

- [ ] 크래시율 2% 이상 시 핫픽스
- [ ] 긴급 심사 요청 (iOS)
- [ ] 단계적 출시 100%로 변경 (Android)

---

## 체크리스트 요약

### Week 8 출시 D-7

- [ ] 모든 빌드 완료
- [ ] 테스트 완료
- [ ] 스토어 에셋 준비 완료
- [ ] 개인정보 처리방침 URL 준비
- [ ] 법적 준수 확인

### Week 8 출시 D-3

- [ ] Android 내부 테스트 완료
- [ ] iOS TestFlight 완료
- [ ] Web 스테이징 배포 완료
- [ ] 스토어 등록 정보 입력 완료

### Week 8 출시 D-Day

- [ ] Android 프로덕션 출시 (10%)
- [ ] iOS 심사 제출
- [ ] Web 프로덕션 배포
- [ ] 모니터링 시작

### Week 9 출시 후

- [ ] Android 단계적 출시 100%
- [ ] iOS 심사 승인 및 출시
- [ ] 일일 모니터링
- [ ] 리뷰 대응

---

**문서 끝**
