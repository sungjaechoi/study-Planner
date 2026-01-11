# Study Planner

> 계획과 실행을 한눈에 비교하며 관리하는 스터디 플래너

## Overview

Study Planner는 하루의 학습 계획과 실제 실행을 시각적으로 비교할 수 있는 타임라인 기반 플래너입니다. 계획한 시간과 실제 수행한 시간을 나란히 배치하여 학습 효율을 분석하고 개선할 수 있습니다.

## Features

- **듀얼 타임라인** - 계획(Plan)과 실행(Execution)을 나란히 배치하여 비교
- **드래그 앤 드롭** - 블록을 드래그하여 시간 조정
- **과목 관리** - 과목별 색상 지정으로 시각적 구분
- **달성률 표시** - 계획 대비 실행 시간 자동 계산
- **플래너 설정** - 하루 시작/종료 시간, 그리드 간격(15/30/60분) 커스터마이징
- **날짜 이동** - 이전/다음 날, 오늘로 빠른 이동

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.1 (App Router) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS 4 |
| State | Zustand 5 |
| Database | SQLite + Prisma ORM |
| Validation | Zod |

## Getting Started

### Prerequisites

- Node.js 18+

### Installation

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.example .env

# 3. 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

> **Note**: 데이터베이스(SQLite)는 저장소에 포함되어 있습니다. 초기화가 필요하면 `npm run db:push`를 실행하세요.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 실행 |
| `npm run db:push` | 스키마를 DB에 적용 |
| `npm run db:studio` | Prisma Studio 실행 |
| `npm run db:seed` | 시드 데이터 생성 |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── blocks/        # 블록 CRUD
│   │   ├── subjects/      # 과목 CRUD
│   │   ├── settings/      # 설정 API
│   │   └── planner/       # 플래너 데이터
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 메인 페이지
├── components/
│   ├── planner/           # 플래너 컴포넌트
│   │   ├── Timeline/      # 타임라인 관련
│   │   ├── DateNav/       # 날짜 네비게이션
│   │   ├── Summary/       # 요약 통계
│   │   ├── BlockForm/     # 블록 폼 모달
│   │   └── Settings/      # 설정 모달
│   └── ui/                # 공통 UI 컴포넌트
├── hooks/                 # 커스텀 훅
├── lib/                   # 유틸리티
│   ├── api.ts            # API 클라이언트
│   ├── constants.ts      # 상수
│   └── utils/            # 유틸 함수
├── stores/               # Zustand 스토어
└── types/                # TypeScript 타입
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/planner/day?date=YYYY-MM-DD` | 특정 날짜 플래너 데이터 |
| GET | `/api/planner/summary?date=YYYY-MM-DD` | 일일 요약 통계 |
| GET/POST | `/api/blocks` | 블록 조회/생성 |
| GET/PUT/DELETE | `/api/blocks/[id]` | 블록 상세/수정/삭제 |
| GET/PUT | `/api/settings` | 설정 조회/수정 |
| GET/POST | `/api/subjects` | 과목 조회/생성 |

## Screenshots

### 메인 화면
- 상단: 날짜 네비게이션 (보라색 그라데이션 헤더)
- 중앙: 일일 요약 (계획/실행 시간, 달성률)
- 하단: 듀얼 타임라인 (계획 | 실행)

### 블록 편집
- 제목, 메모, 과목 선택
- 시작/종료 시간 설정
- 종일 일정 옵션

### 설정
- 하루 시작/종료 시간
- 그리드 간격 선택 (15분/30분/60분)

## Design

**Refined Minimalism with Soft Depth** 디자인 컨셉 적용:
- Stone 컬러 팔레트 (중립적인 배경)
- Indigo 주 색상 (계획)
- Teal 보조 색상 (실행)
- 부드러운 그라데이션과 그림자
- 둥근 모서리 (rounded-xl, rounded-2xl)
- 백드롭 블러 효과

## License

MIT License

---

Built with Next.js and Prisma
