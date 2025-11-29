# Cat Jump: Tower Stack - Firebase 프로젝트 셋업 가이드

**문서 버전**: 1.1
**작성일**: 2025-11-28
**대상**: 개발자

---

## 목차

### Part 1: 초기 셋업 (지금 - 15분)
1. [사전 준비](#1-사전-준비)
2. [Firebase 프로젝트 생성](#2-firebase-프로젝트-생성)
3. [Firebase 서비스 활성화](#3-firebase-서비스-활성화)
4. [Firestore 보안 규칙](#4-firestore-보안-규칙)

### Part 2: Week 1 - 프로젝트 셋업 시
5. [환경변수 설정](#5-환경변수-설정)

### Part 3: Week 5 - 백엔드 연동 시
6. [Cloud Functions 설정](#6-cloud-functions-설정)
7. [프로젝트 연동 코드](#7-프로젝트-연동-코드)
8. [인덱스 설정](#8-인덱스-설정)
9. [검증 체크리스트](#9-검증-체크리스트)

---

# Part 1: 초기 셋업 (지금)

> **소요 시간**: 15분
> **목표**: Firebase 콘솔에서 프로젝트 생성 및 기본 서비스 활성화

---

## 1. 사전 준비

### 필수 요구사항

| 항목 | 요구사항 |
|------|----------|
| Google 계정 | Firebase 콘솔 접근용 |

### Firebase CLI (나중에 설치해도 됨)

```bash
# Week 5에 Cloud Functions 배포 시 필요
npm install -g firebase-tools
firebase login
```

---

## 2. Firebase 프로젝트 생성

### 2.1 Firebase 콘솔에서 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. **프로젝트 추가** 클릭
3. 프로젝트 이름: `cat-jump-tower`
4. Google Analytics 활성화 → 기본 계정 선택
5. **프로젝트 만들기** 완료

### 2.2 웹 앱 등록

1. 프로젝트 개요 → **웹 앱 추가** (</> 아이콘)
2. 앱 닉네임: `cat-jump-web`
3. Firebase Hosting 체크 해제
4. **앱 등록** 클릭
5. **Firebase SDK 설정 정보 복사** → 메모장에 저장

```javascript
// 이 정보를 복사해서 저장해두세요 (Week 1에 사용)
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "cat-jump-tower.firebaseapp.com",
  projectId: "cat-jump-tower",
  storageBucket: "cat-jump-tower.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  measurementId: "G-XXXXXXX"
};
```

---

## 3. Firebase 서비스 활성화

### 3.1 Authentication (익명 인증)

1. 좌측 메뉴 **빌드** → **Authentication** → **시작하기**
2. **로그인 방법** 탭
3. **익명** 선택 → **사용 설정** 활성화 → **저장**

### 3.2 Firestore Database

1. 좌측 메뉴 **빌드** → **Firestore Database** → **데이터베이스 만들기**
2. 위치: `asia-northeast3` (서울)
3. **테스트 모드에서 시작** 선택
4. **만들기** 클릭

### 3.3 Analytics (자동 활성화)

- 프로젝트 생성 시 활성화됨
- 추가 설정 불필요

### 3.4 Cloud Functions (Week 5에 설정)

> **지금은 건너뛰기** - Blaze 요금제 업그레이드는 Week 5에 진행

---

## 4. Firestore 보안 규칙

### 4.1 보안 규칙 적용

**Firestore Database** → **규칙** 탭에서 아래 내용으로 교체:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 사용자 데이터 - 본인만 읽기/쓰기
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 리더보드 - 모든 인증 사용자 읽기, 본인만 쓰기
    match /leaderboard/{entryId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null
        && request.auth.uid == resource.data.userId;
    }

    // 글로벌 설정 - 읽기만 허용
    match /config/{document} {
      allow read: if true;
      allow write: if false;
    }

    // 이벤트 데이터 - 읽기만 허용
    match /events/{eventId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

**게시** 버튼 클릭

---

## Part 1 완료 체크리스트

- [ ] Firebase 프로젝트 생성됨
- [ ] 웹 앱 등록됨
- [ ] SDK 설정 정보 복사해둠
- [ ] Authentication > 익명 로그인 활성화됨
- [ ] Firestore Database 생성됨 (asia-northeast3)
- [ ] 보안 규칙 적용됨

**Part 1 완료!** → Week 1에서 프로젝트 셋업 시 Part 2 진행

---

# Part 2: Week 1 - 프로젝트 셋업 시

> **시점**: Vite + Phaser 프로젝트 초기화 후
> **소요 시간**: 5분

---

## 5. 환경변수 설정

### 5.1 .env.example 생성

프로젝트 루트에 `.env.example` 파일 생성:

```env
# Firebase 설정 (Firebase 콘솔에서 복사)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXX

# AdMob (Week 6에 설정)
VITE_ADMOB_APP_ID_ANDROID=ca-app-pub-xxx~xxx
VITE_ADMOB_APP_ID_IOS=ca-app-pub-xxx~xxx
VITE_ADMOB_BANNER_ID=ca-app-pub-xxx/xxx
VITE_ADMOB_INTERSTITIAL_ID=ca-app-pub-xxx/xxx
VITE_ADMOB_REWARDED_ID=ca-app-pub-xxx/xxx

# 개발 환경
VITE_DEBUG_MODE=true
```

### 5.2 .env.local 생성

```bash
# .env.example 복사
cp .env.example .env.local

# Part 1에서 저장해둔 SDK 설정 정보로 값 입력
```

### 5.3 .gitignore 확인

```gitignore
# 환경변수 (민감정보)
.env.local
.env.*.local
.env.production

# Firebase
.firebase/
firebase-debug.log
```

---

## Part 2 완료 체크리스트

- [ ] .env.example 생성됨
- [ ] .env.local 생성 및 실제 값 입력됨
- [ ] .gitignore에 환경변수 파일 추가됨

**Part 2 완료!** → Week 5에서 백엔드 연동 시 Part 3 진행

---

# Part 3: Week 5 - 백엔드 연동 시

> **시점**: 코어 게임플레이 완료 후 백엔드 연동
> **소요 시간**: 30분

---

## 6. Cloud Functions 설정

### 6.1 Blaze 요금제 업그레이드

1. Firebase Console → 좌측 하단 **업그레이드** 클릭
2. **Blaze (종량제)** 선택
3. 결제 정보 입력
4. 예산 알림 설정: $10/월 권장

> **무료 할당량**: 월 125,000회 호출, 충분함

### 6.2 Firebase CLI 설치 및 로그인

```bash
npm install -g firebase-tools
firebase login
firebase use cat-jump-tower
```

### 6.3 Functions 초기화

```bash
# 프로젝트 루트에서 실행
firebase init functions

# 선택 옵션:
# - Use an existing project → cat-jump-tower
# - 언어: TypeScript
# - ESLint: Yes
# - 종속성 설치: Yes
```

### 6.4 Functions 폴더 구조

```
functions/
├── src/
│   ├── index.ts           # 진입점
│   └── leaderboard.ts     # 리더보드 함수
├── package.json
└── tsconfig.json
```

### 6.5 리더보드 점수 검증 함수

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

export const submitScore = functions
  .region('asia-northeast3')
  .https.onCall(async (data, context) => {
    // 인증 확인
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', '로그인 필요');
    }

    const { score, playTime, perfectCount, comboMax } = data;
    const uid = context.auth.uid;

    // 기본 검증
    if (typeof score !== 'number' || score < 0 || score > 9999) {
      throw new functions.https.HttpsError('invalid-argument', '유효하지 않은 점수');
    }

    // 플레이 시간 기반 검증 (층당 최소 0.5초)
    const minPlayTime = score * 500;
    if (playTime < minPlayTime) {
      console.warn(`Suspicious: uid=${uid}, score=${score}, playTime=${playTime}`);
    }

    // 리더보드 업데이트
    const leaderboardRef = db.collection('leaderboard').doc(uid);
    const userRef = db.collection('users').doc(uid);

    await db.runTransaction(async (transaction) => {
      const leaderboardDoc = await transaction.get(leaderboardRef);
      const currentBest = leaderboardDoc.exists ? leaderboardDoc.data()?.score || 0 : 0;

      if (score > currentBest) {
        transaction.set(leaderboardRef, {
          userId: uid,
          score,
          perfectCount,
          comboMax,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        transaction.update(userRef, {
          bestScore: score,
          lastPlayed: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    });

    return { success: true, newBest: score };
  });
```

### 6.6 Functions 배포

```bash
firebase deploy --only functions
```

---

## 7. 프로젝트 연동 코드

### 7.1 Firebase SDK 설치

```bash
npm install firebase
```

### 7.2 Firebase 초기화 모듈

```typescript
// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { getFunctions, httpsCallable } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const functions = getFunctions(app, 'asia-northeast3');

export async function signInAnonymouslyWrapper(): Promise<string> {
  const result = await signInAnonymously(auth);
  return result.user.uid;
}

export function onAuthChange(callback: (uid: string | null) => void) {
  return onAuthStateChanged(auth, (user) => {
    callback(user?.uid ?? null);
  });
}

export function logGameEvent(eventName: string, params?: Record<string, any>) {
  logEvent(analytics, eventName, params);
}

export const submitScoreFunction = httpsCallable(functions, 'submitScore');
```

### 7.3 IDataService 구현체

```typescript
// src/services/FirebaseDataService.ts
import {
  doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs
} from 'firebase/firestore';
import { db, auth, signInAnonymouslyWrapper, submitScoreFunction } from '../config/firebase';
import type { IDataService, UserData, LeaderboardEntry, GameProgress } from './IDataService';

export class FirebaseDataService implements IDataService {
  async signInAnonymously(): Promise<string> {
    return signInAnonymouslyWrapper();
  }

  getCurrentUserId(): string | null {
    return auth.currentUser?.uid ?? null;
  }

  async getUser(uid: string): Promise<UserData | null> {
    const docSnap = await getDoc(doc(db, 'users', uid));
    return docSnap.exists() ? (docSnap.data() as UserData) : null;
  }

  async saveUser(uid: string, data: Partial<UserData>): Promise<void> {
    await setDoc(doc(db, 'users', uid), data, { merge: true });
  }

  async getLeaderboard(limitCount: number): Promise<LeaderboardEntry[]> {
    const q = query(
      collection(db, 'leaderboard'),
      orderBy('score', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as LeaderboardEntry);
  }

  async submitScore(uid: string, score: number, metadata?: object): Promise<void> {
    await submitScoreFunction({ score, ...metadata });
  }

  async saveGameProgress(uid: string, progress: GameProgress): Promise<void> {
    await setDoc(doc(db, 'users', uid, 'progress', 'current'), progress);
  }

  async loadGameProgress(uid: string): Promise<GameProgress | null> {
    const docSnap = await getDoc(doc(db, 'users', uid, 'progress', 'current'));
    return docSnap.exists() ? (docSnap.data() as GameProgress) : null;
  }
}
```

---

## 8. 인덱스 설정

> 코드에서 쿼리 실행 시 콘솔에 인덱스 생성 링크가 자동으로 표시됩니다.

**필요한 인덱스**:

| 컬렉션 ID | 필드 | 순서 |
|-----------|------|------|
| leaderboard | score | 내림차순 |
| leaderboard | timestamp | 오름차순 |
| users | lastLogin | 내림차순 |

**생성 방법**:
1. 코드에서 리더보드 쿼리 실행
2. 브라우저 콘솔에서 에러 메시지의 링크 클릭
3. Firebase Console에서 인덱스 자동 생성

---

## 9. 검증 체크리스트

### 9.1 Firebase 콘솔 확인

- [ ] Cloud Functions 활성화됨 (Blaze 요금제)
- [ ] submitScore 함수 배포됨

### 9.2 코드 연동 테스트

```typescript
// BootScene에서 테스트
async function testFirebase() {
  try {
    const uid = await signInAnonymouslyWrapper();
    console.log('익명 로그인 성공:', uid);

    await setDoc(doc(db, 'users', uid), {
      testField: 'Hello Firebase!',
      createdAt: new Date().toISOString(),
    });
    console.log('Firestore 쓰기 성공');

    logGameEvent('test_event', { test: true });
    console.log('Analytics 이벤트 전송');

    return true;
  } catch (error) {
    console.error('Firebase 테스트 실패:', error);
    return false;
  }
}
```

### 9.3 완료 체크리스트

- [ ] 익명 로그인 동작 확인
- [ ] Firestore 읽기/쓰기 동작 확인
- [ ] Cloud Functions 호출 확인
- [ ] 인덱스 생성 완료

---

## 부록: 유용한 명령어

```bash
# Firebase 프로젝트 목록
firebase projects:list

# 현재 프로젝트 확인
firebase use

# Firestore 규칙만 배포
firebase deploy --only firestore:rules

# Functions만 배포
firebase deploy --only functions

# Functions 로그 확인
firebase functions:log

# 에뮬레이터 실행 (로컬 테스트용)
firebase emulators:start --only firestore,auth,functions
```

---

**문서 끝**
