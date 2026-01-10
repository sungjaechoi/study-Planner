# 스터디 플래너 타임라인 - 아키텍처 설계 문서

## 1. 문서 정보

| 항목 | 내용 |
|------|---------|
| 제품명 | 스터디 플래너 타임라인 |
| 버전 | v1.0 |
| 문서 유형 | 아키텍처 설계 |
| 기반 문서 | requirements-specification.md, study-planner-prd.md |

---

## 2. 기술 스택

### 2.1 프론트엔드
| 기술 | 버전 | 용도 |
|------------|---------|---------|
| Next.js | 15.x | App Router를 포함한 풀스택 React 프레임워크 |
| React | 19.x | UI 라이브러리 |
| TypeScript | 5.x | 타입 안전 JavaScript |
| Tailwind CSS | 4.x | 유틸리티 우선 CSS 프레임워크 |
| date-fns | 3.x | 날짜 조작 |
| Zustand | 5.x | 경량 상태 관리 |

### 2.2 백엔드
| 기술 | 버전 | 용도 |
|------------|---------|---------|
| Next.js API Routes | 15.x | App Router를 통한 RESTful API 엔드포인트 |
| Prisma | 6.x | 타입 안전 ORM |
| Zod | 3.x | 스키마 검증 |

### 2.3 데이터베이스
| 기술 | 버전 | 용도 |
|------------|---------|---------|
| SQLite | 3.x | 로컬 개발 데이터베이스 |

### 2.4 개발 도구
| 기술 | 용도 |
|------------|---------|
| ESLint | 코드 린팅 |
| Vitest | 단위 테스트 |
| Prettier | 코드 포매팅 |

---

## 3. 시스템 아키텍처

### 3.1 아키텍처 개요

```
+------------------------------------------------------------------+
|                         클라이언트 (브라우저)                        |
|  +--------------------------------------------------------------+ |
|  |                    프레젠테이션 레이어                          | |
|  |  +--------------+  +--------------+  +--------------+         | |
|  |  |   페이지     |  | 컴포넌트     |  |   훅         |         | |
|  |  | (App Router) |  |  (React)     |  |  (커스텀)    |         | |
|  |  +--------------+  +--------------+  +--------------+         | |
|  |                          |                                    | |
|  |  +------------------------------------------------------+     | |
|  |  |              상태 관리 (Zustand)                       |     | |
|  |  +------------------------------------------------------+     | |
|  +--------------------------------------------------------------+ |
|                              | HTTP (REST API)                    |
+------------------------------+------------------------------------+
                               |
+------------------------------+------------------------------------+
|                         서버 (Next.js)                             |
|  +--------------------------------------------------------------+ |
|  |                    API 레이어 (컨트롤러)                        | |
|  |  +------------------------------------------------------+     | |
|  |  |           라우트 핸들러 (app/api/...)                  |     | |
|  |  |    - 요청 파싱 & 검증 (Zod)                           |     | |
|  |  |    - 응답 포매팅                                      |     | |
|  |  +------------------------------------------------------+     | |
|  +--------------------------------------------------------------+ |
|                              |                                    |
|  +--------------------------------------------------------------+ |
|  |                 비즈니스 로직 레이어 (서비스)                    | |
|  |  +------------------------------------------------------+     | |
|  |  |           서비스 (src/server/services/)               |     | |
|  |  |    - 도메인 로직                                      |     | |
|  |  |    - 검증 규칙                                        |     | |
|  |  |    - 오버랩 계산                                      |     | |
|  |  +------------------------------------------------------+     | |
|  +--------------------------------------------------------------+ |
|                              |                                    |
|  +--------------------------------------------------------------+ |
|  |                 데이터 접근 레이어 (리포지토리)                   | |
|  |  +------------------------------------------------------+     | |
|  |  |         Prisma Client                                |     | |
|  |  +------------------------------------------------------+     | |
|  +--------------------------------------------------------------+ |
|                              |                                    |
+------------------------------+------------------------------------+
                               |
+------------------------------+------------------------------------+
|                          데이터베이스                               |
|  +--------------------------------------------------------------+ |
|  |                      SQLite                                   | |
|  |    users | planner_settings | subjects | time_blocks          | |
|  +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

### 3.2 레이어 책임

| 레이어 | 책임 | 위치 |
|-------|---------------|----------|
| 프레젠테이션 | UI 렌더링, 사용자 상호작용, 로컬 상태 | `src/app/`, `src/components/` |
| API (컨트롤러) | HTTP 요청 처리, 검증, 응답 | `src/app/api/` |
| 비즈니스 로직 | 도메인 규칙, 계산, 오케스트레이션 | `src/server/services/` |
| 데이터 접근 | 데이터베이스 연산, 쿼리 | `src/server/db/` |

---

## 4. 데이터베이스 설계

### 4.1 엔티티-관계 다이어그램 (ERD)

```
+------------------+       +----------------------+
|     USERS        |       |   PLANNER_SETTINGS   |
+------------------+       +----------------------+
| id (PK)          |---+   | id (PK)              |
| name             |   |   | user_id (FK)         |---+
| timezone         |   |   | grid_minutes         |   |
| created_at       |   |   | day_start_min        |   |
| updated_at       |   |   | day_end_min          |   |
+------------------+   |   | created_at           |   |
         |             |   | updated_at           |   |
         |             |   +----------------------+   |
         |             |                              |
         |             +------------------------------+
         |                                            |
         v                                            |
+------------------+       +----------------------+   |
|    SUBJECTS      |       |    TIME_BLOCKS       |   |
+------------------+       +----------------------+   |
| id (PK)          |---+   | id (PK)              |   |
| user_id (FK)     |---|---| user_id (FK)         |<--+
| name             |   |   | subject_id (FK)?     |<--+
| color_hex        |   |   | date                 |
| sort_order       |   |   | type (PLAN/EXEC)     |
| is_active        |   |   | is_all_day           |
| created_at       |   |   | start_min            |
| updated_at       |   |   | end_min              |
+------------------+   |   | title                |
                       |   | note                 |
                       |   | display_order        |
                       |   | created_at           |
                       |   | updated_at           |
                       |   +----------------------+
                       |            |
                       +------------+
```

### 4.2 테이블 명세

#### 4.2.1 users
| 컬럼 | 타입 | 제약조건 | 설명 |
|--------|------|-------------|-------------|
| id | TEXT (UUID) | PK | 고유 식별자 |
| name | TEXT | NOT NULL | 사용자 표시 이름 |
| timezone | TEXT | NOT NULL, DEFAULT 'Asia/Seoul' | 사용자 타임존 |
| created_at | DATETIME | NOT NULL, DEFAULT NOW | 생성 타임스탬프 |
| updated_at | DATETIME | NOT NULL | 마지막 수정 타임스탬프 |

#### 4.2.2 planner_settings
| 컬럼 | 타입 | 제약조건 | 설명 |
|--------|------|-------------|-------------|
| id | TEXT (UUID) | PK | 고유 식별자 |
| user_id | TEXT (UUID) | FK -> users.id, UNIQUE | 소유 사용자 |
| grid_minutes | INTEGER | NOT NULL, DEFAULT 15 | 그리드 간격 (분) |
| day_start_min | INTEGER | NOT NULL, DEFAULT 360 | 하루 시작 (0-1440) |
| day_end_min | INTEGER | NOT NULL, DEFAULT 1380 | 하루 종료 (0-1440) |
| created_at | DATETIME | NOT NULL, DEFAULT NOW | 생성 타임스탬프 |
| updated_at | DATETIME | NOT NULL | 마지막 수정 타임스탬프 |

**검증**: `0 <= day_start_min < day_end_min <= 1440`

#### 4.2.3 subjects
| 컬럼 | 타입 | 제약조건 | 설명 |
|--------|------|-------------|-------------|
| id | TEXT (UUID) | PK | 고유 식별자 |
| user_id | TEXT (UUID) | FK -> users.id | 소유 사용자 |
| name | TEXT | NOT NULL | 과목명 |
| color_hex | TEXT | NOT NULL | 색상 코드 (예: #FF5733) |
| sort_order | INTEGER | NOT NULL, DEFAULT 0 | 표시 순서 |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | 활성 상태 |
| created_at | DATETIME | NOT NULL, DEFAULT NOW | 생성 타임스탬프 |
| updated_at | DATETIME | NOT NULL | 마지막 수정 타임스탬프 |

**인덱스**: `(user_id, sort_order)`

#### 4.2.4 time_blocks
| 컬럼 | 타입 | 제약조건 | 설명 |
|--------|------|-------------|-------------|
| id | TEXT (UUID) | PK | 고유 식별자 |
| user_id | TEXT (UUID) | FK -> users.id | 소유 사용자 |
| subject_id | TEXT (UUID) | FK -> subjects.id, NULLABLE | 관련 과목 |
| date | TEXT | NOT NULL | 날짜 (YYYY-MM-DD 형식) |
| type | TEXT | NOT NULL, CHECK (PLAN/EXECUTION) | 블록 유형 |
| is_all_day | BOOLEAN | NOT NULL, DEFAULT false | 종일 플래그 |
| start_min | INTEGER | NULLABLE | 시작 시간 (0-1440) |
| end_min | INTEGER | NULLABLE | 종료 시간 (0-1440) |
| title | TEXT | NOT NULL | 블록 제목 |
| note | TEXT | NULLABLE | 추가 메모 |
| display_order | INTEGER | NOT NULL, DEFAULT 0 | 표시 순서 |
| created_at | DATETIME | NOT NULL, DEFAULT NOW | 생성 타임스탬프 |
| updated_at | DATETIME | NOT NULL | 마지막 수정 타임스탬프 |

**인덱스**:
- `(user_id, date, type)` - 주요 쿼리 패턴
- `(user_id, date)` - 날짜 기반 쿼리

**검증**:
- `is_all_day = false`인 경우: `start_min`과 `end_min` 필수, `start_min < end_min`
- 시간 값은 15분 단위여야 함 (0, 15, 30, 45분)

---

## 5. API 설계

### 5.1 API 개요

| 메소드 | 엔드포인트 | 설명 |
|--------|----------|-------------|
| GET | `/api/planner/day` | 일일 플래너 데이터 조회 |
| GET | `/api/planner/summary` | 기간 요약 조회 |
| POST | `/api/blocks` | 타임 블록 생성 |
| PATCH | `/api/blocks/[id]` | 타임 블록 수정 |
| DELETE | `/api/blocks/[id]` | 타임 블록 삭제 |
| PATCH | `/api/settings` | 플래너 설정 수정 |
| GET | `/api/subjects` | 사용자 과목 조회 |
| POST | `/api/subjects` | 과목 생성 |
| PATCH | `/api/subjects/[id]` | 과목 수정 |
| DELETE | `/api/subjects/[id]` | 과목 삭제 |

### 5.2 API 계약

#### 5.2.1 GET /api/planner/day

**요청**:
```
GET /api/planner/day?date=YYYY-MM-DD
Headers:
  X-User-Id: <user-uuid>
```

**응답 (200 OK)**:
```typescript
interface DayPlannerResponse {
  date: string;
  settings: {
    grid_minutes: number;
    day_start_min: number;
    day_end_min: number;
  };
  subjects: Array<{
    id: string;
    name: string;
    color_hex: string;
    sort_order: number;
    is_active: boolean;
  }>;
  blocks: Array<{
    id: string;
    type: "PLAN" | "EXECUTION";
    is_all_day: boolean;
    start_min: number | null;
    end_min: number | null;
    title: string;
    note: string | null;
    subject_id: string | null;
    display_order: number;
  }>;
  summary: {
    plan_total_min: number;
    execution_total_min: number;
  };
}
```

#### 5.2.2 POST /api/blocks

**요청**:
```typescript
interface CreateBlockRequest {
  date: string;
  type: "PLAN" | "EXECUTION";
  title: string;
  note?: string;
  subject_id?: string;
  is_all_day: boolean;
  start_min?: number;
  end_min?: number;
}
```

**응답 (201 Created)**:
```typescript
interface CreateBlockResponse {
  id: string;
  date: string;
  type: "PLAN" | "EXECUTION";
  title: string;
  note: string | null;
  subject_id: string | null;
  is_all_day: boolean;
  start_min: number | null;
  end_min: number | null;
  display_order: number;
  created_at: string;
}
```

#### 5.2.3 PATCH /api/blocks/[id]

**요청**:
```typescript
interface UpdateBlockRequest {
  title?: string;
  note?: string;
  subject_id?: string | null;
  is_all_day?: boolean;
  start_min?: number | null;
  end_min?: number | null;
}
```

#### 5.2.4 DELETE /api/blocks/[id]

**응답 (200 OK)**:
```typescript
interface DeleteBlockResponse {
  success: boolean;
  deleted_id: string;
}
```

### 5.3 오류 응답 형식

```typescript
interface APIError {
  error: {
    code: string;
    message: string;
    details?: Array<{
      field?: string;
      message: string;
    }>;
  };
}
```

**오류 코드**:
| 코드 | HTTP 상태 | 설명 |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | 요청 검증 실패 |
| INVALID_DATE | 400 | 잘못된 날짜 형식 |
| TIME_RANGE_ERROR | 400 | start_min >= end_min |
| NOT_15MIN_INCREMENT | 400 | 15분 단위가 아닌 시간 |
| UNAUTHORIZED | 401 | 인증 필요 |
| FORBIDDEN | 403 | 접근 거부 |
| NOT_FOUND | 404 | 리소스를 찾을 수 없음 |
| INTERNAL_ERROR | 500 | 서버 오류 |

---

## 6. 프론트엔드 아키텍처

### 6.1 컴포넌트 구조

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 루트 레이아웃
│   ├── page.tsx                  # 홈 페이지
│   ├── planner/
│   │   └── page.tsx              # 일일 플래너 페이지
│   └── api/                      # API 라우트
│
├── components/
│   ├── ui/                       # 기본 UI 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Input.tsx
│   │   └── Select.tsx
│   │
│   └── planner/                  # 플래너 전용 컴포넌트
│       ├── Timeline/
│       │   ├── Timeline.tsx           # 메인 타임라인 컨테이너
│       │   ├── TimeAxis.tsx           # 왼쪽 시간축
│       │   ├── TimeGrid.tsx           # 배경 그리드 라인
│       │   ├── BlockColumn.tsx        # Plan/Execution 열
│       │   └── TimeBlock.tsx          # 개별 블록
│       │
│       ├── AllDayArea/
│       │   ├── AllDayArea.tsx         # 종일 블록 컨테이너
│       │   └── AllDayChip.tsx         # 종일 블록 칩
│       │
│       ├── BlockForm/
│       │   ├── BlockFormModal.tsx     # 블록 생성/수정 모달
│       │   ├── TimeInput.tsx          # 시간 선택기 (15분 스냅)
│       │   └── SubjectSelect.tsx      # 과목 드롭다운
│       │
│       ├── Summary/
│       │   └── DaySummary.tsx         # 계획/실행 총합
│       │
│       └── DateNav/
│           └── DateNavigation.tsx     # 날짜 선택기/탐색
│
├── hooks/
│   ├── usePlannerData.ts         # 일일 플래너 데이터 fetch
│   ├── useBlocks.ts              # 블록 CRUD 연산
│   ├── useOverlapLayout.ts       # 레인 위치 계산
│   └── useTimeUtils.ts           # 시간 포매팅 유틸리티
│
├── stores/
│   └── plannerStore.ts           # Zustand 스토어
│
├── lib/
│   ├── api.ts                    # API 클라이언트
│   ├── utils.ts                  # 일반 유틸리티
│   └── constants.ts              # 앱 상수
│
└── types/
    └── index.ts                  # TypeScript 타입 정의
```

### 6.2 상태 관리 (Zustand)

```typescript
interface PlannerState {
  // 데이터
  selectedDate: Date;
  settings: PlannerSettings | null;
  subjects: Subject[];
  blocks: TimeBlock[];

  // UI 상태
  isLoading: boolean;
  editingBlock: TimeBlock | null;
  isFormModalOpen: boolean;

  // 액션
  setSelectedDate: (date: Date) => void;
  fetchDayData: (date: string) => Promise<void>;
  createBlock: (data: CreateBlockRequest) => Promise<void>;
  updateBlock: (id: string, data: UpdateBlockRequest) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
  openFormModal: (block?: TimeBlock) => void;
  closeFormModal: () => void;
}
```

---

## 7. 프로젝트 디렉토리 구조

```
study-planner/
├── prisma/
│   ├── schema.prisma             # 데이터베이스 스키마
│   └── migrations/               # 마이그레이션 파일
│
├── src/
│   ├── app/                      # Next.js App Router 페이지
│   │   ├── api/                  # API 라우트
│   │   │   ├── planner/
│   │   │   │   ├── day/
│   │   │   │   │   └── route.ts
│   │   │   │   └── summary/
│   │   │   │       └── route.ts
│   │   │   ├── blocks/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── subjects/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   └── settings/
│   │   │       └── route.ts
│   │   ├── planner/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   │
│   ├── components/               # React 컴포넌트
│   ├── hooks/                    # 커스텀 React 훅
│   ├── stores/                   # Zustand 스토어
│   ├── lib/                      # 유틸리티 및 헬퍼
│   ├── types/                    # TypeScript 타입
│   │
│   └── server/                   # 서버 사이드 코드
│       ├── services/             # 비즈니스 로직
│       └── db/                   # 데이터베이스 유틸리티
│
├── docs/                         # 문서
├── public/                       # 정적 자산
│
├── .env                          # 환경 변수
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## 8. 핵심 알고리즘

### 8.1 오버랩 레이아웃 알고리즘

```typescript
function calculateOverlapLayout(blocks: TimeBlock[]): LayoutBlock[] {
  if (blocks.length === 0) return [];

  // 시작 시간으로 정렬, 그 다음 종료 시간으로 정렬
  const sorted = [...blocks].sort((a, b) => {
    if (a.start_min !== b.start_min) return a.start_min - b.start_min;
    return a.end_min - b.end_min;
  });

  // 겹치는 그룹 찾기 및 레인 할당
  const groups: TimeBlock[][] = [];
  let currentGroup: TimeBlock[] = [sorted[0]];
  let groupEnd = sorted[0].end_min;

  for (let i = 1; i < sorted.length; i++) {
    const block = sorted[i];
    if (block.start_min < groupEnd) {
      currentGroup.push(block);
      groupEnd = Math.max(groupEnd, block.end_min);
    } else {
      groups.push(currentGroup);
      currentGroup = [block];
      groupEnd = block.end_min;
    }
  }
  groups.push(currentGroup);

  // 각 그룹 내에서 레인 할당
  const result: LayoutBlock[] = [];
  for (const group of groups) {
    const laneCount = group.length;
    group.forEach((block, index) => {
      result.push({
        ...block,
        laneIndex: index,
        laneCount
      });
    });
  }

  return result;
}
```

### 8.2 시간 스냅 알고리즘

```typescript
function snapTo15Minutes(minutes: number): number {
  return Math.round(minutes / 15) * 15;
}

function isValid15MinIncrement(minutes: number): boolean {
  return minutes % 15 === 0;
}
```

---

## 9. 상수

```typescript
export const GRID_MINUTES = 15;
export const MINUTES_PER_HOUR = 60;
export const MINUTES_PER_DAY = 1440;

export const DEFAULT_DAY_START = 360;  // 오전 6:00
export const DEFAULT_DAY_END = 1380;   // 오후 11:00

export const BLOCK_COLORS = {
  DEFAULT_PLAN: '#3B82F6',      // blue-500
  DEFAULT_EXECUTION: '#10B981', // emerald-500
};
```

---

## 10. 환경 변수

```bash
# .env.example

# 데이터베이스
DATABASE_URL="file:./dev.db"

# 애플리케이션
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# 개발
NODE_ENV="development"
```
