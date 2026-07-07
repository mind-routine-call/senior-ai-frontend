# Senior AI Frontend

고령자와 보호자를 연결하는 AI 기반 헬스케어 웹 애플리케이션입니다. 어르신은 AI와 음성 대화를 나누고, 보호자는 대시보드를 통해 건강 상태와 대화 이력을 모니터링합니다.

---

## 주요 기능

### 어르신 (Elder)
- **AI 음성 채팅**: Web Speech API 기반 STT/TTS로 AI와 자연스러운 한국어 음성 대화
- **홈 화면**: 일정 및 오늘의 활동 안내
- **온보딩**: 최초 사용 시 설정 안내

### 보호자 (Guardian)
- **대시보드**: 어르신 건강 위험도(LOW/MEDIUM/HIGH) 및 활동 지표 차트
- **대화 이력**: 어르신과 AI 간의 채팅 기록 열람
- **일정 관리**: 어르신 일정 등록 및 목록 조회
- **시나리오 관리**: AI 대화 시나리오 설정
- **기억 메모**: 어르신 관련 기억 메모 작성 및 조회
- **알림 센터**: 어르신 관련 알림 수신
- **어르신 등록**: 초대 코드로 어르신 계정 연결

### 공통
- **회원가입/로그인**: SMS 인증, 초대 코드 인증, JWT 기반 인증
- **비밀번호 재설정**
- **마이페이지**: 개인정보 변경, 회원 탈퇴

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | React 19 + Vite 8 |
| 라우팅 | React Router DOM v7 |
| 스타일 | Tailwind CSS v4 |
| HTTP 클라이언트 | Axios |
| 차트 | Recharts |
| 아이콘 | Lucide React |
| 폰트 | Pretendard |
| 음성 | Web Speech API (SpeechRecognition / SpeechSynthesis) |
| 린터 | ESLint |

---

## 프로젝트 구조

```
src/
├── api/
│   ├── auth.js          # 인증 관련 API (로그인, 회원가입, 토큰 재발급 등)
│   └── elderChat.js     # 채팅 세션 API (시작, 턴 저장, 종료)
├── components/
│   ├── Button.jsx
│   ├── Input.jsx
│   └── RoleGuard.jsx    # 역할 기반 라우트 보호
├── layouts/
│   └── AppLayout.jsx
├── pages/
│   ├── Auth/            # 인증 (로그인, 회원가입, 비밀번호 재설정)
│   ├── Chat/            # 어르신 AI 채팅 (홈, 온보딩, 채팅)
│   ├── Dashboard/       # 보호자 대시보드
│   ├── ElderRegister/   # 어르신 등록
│   ├── GuardianChat/    # 보호자용 대화 이력
│   ├── Memory/          # 기억 메모
│   ├── MyPage/          # 마이페이지
│   ├── Notification/    # 알림 센터
│   ├── Scenario/        # 시나리오 관리
│   └── Schedule/        # 일정 관리
└── utils/
    └── authSession.js   # Access Token 관리
```

---

## 시작하기

### 요구 사항

- Node.js 18 이상
- npm 또는 yarn

### 설치

```bash
npm install
```

### 환경 변수 설정

`.env.example`을 복사하여 `.env` 파일을 생성하고 값을 설정합니다.

```bash
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:3000
```

### 개발 서버 실행

```bash
npm run dev
```

### 빌드

```bash
npm run build
```

### 빌드 결과물 미리보기

```bash
npm run preview
```

---

## 라우팅 구조

| 경로 | 페이지 | 접근 권한 |
|------|--------|-----------|
| `/` | 스플래시 / 인증 진입 | 공개 |
| `/login` | 로그인 | 공개 |
| `/account` | 보호자 회원가입 | 공개 |
| `/account/elder` | 어르신 회원가입 | 공개 |
| `/reset-password` | 비밀번호 재설정 | 공개 |
| `/dashboard` | 보호자 대시보드 | 보호자 |
| `/schedule` | 일정 관리 | 보호자 |
| `/scenarios` | 시나리오 관리 | 보호자 |
| `/notification` | 알림 센터 | 보호자 |
| `/memory` | 기억 메모 목록 | 보호자 |
| `/guardian/elders/:elderId/chats` | 대화 이력 | 보호자 |
| `/elder-home` | 어르신 홈 | 어르신 |
| `/elder-onboarding` | 어르신 온보딩 | 어르신 |
| `/elder-chat` | AI 채팅 | 어르신 |
| `/mypage` | 마이페이지 | 공통 |

---

## 인증 방식

- JWT Bearer Token 방식 (`Authorization: Bearer <token>`)
- Access Token은 `authSession.js`의 유틸리티로 관리
- Axios 인터셉터를 통해 모든 요청에 토큰 자동 첨부

---

## 음성 기능 상세

어르신 채팅은 브라우저 Web Speech API를 활용합니다.

- **STT**: `SpeechRecognition` / `webkitSpeechRecognition` — 한국어(`ko-KR`) 음성 인식
- **TTS**: `SpeechSynthesis` — 자연스러운 한국어 음성 출력을 위한 보이스 스코어링 시스템 내장
- **발화 분석**: 반복 단어, 추임새(`음`, `어`, `아`), 모호한 표현, 긴 침묵 등을 감지하여 서버에 전달

> 음성 기능은 Chrome 등 Web Speech API를 지원하는 브라우저에서만 동작합니다.
