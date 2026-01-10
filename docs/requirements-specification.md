# 스터디 플래너 타임라인 - 요구사항 명세서

## 1. 문서 정보

| 항목 | 내용 |
|------|---------|
| 제품명 | 스터디 플래너 타임라인 |
| 버전 | v1.0 |
| 문서 유형 | 요구사항 명세서 |
| 기반 문서 | study-planner-prd.md |

---

## 2. 사용자 스토리

### US-1: 일일 타임라인 보기
**사용자로서**,
**나는** 특정 날짜의 계획 및 실행 블록을 시간축 기반 타임라인에서 보고 싶다
**그래서** 나의 일일 학습 계획과 실제 수행 현황을 한눈에 파악할 수 있다

**인수 조건:**
- 사용자 설정(dayStart/dayEnd)에 따라 시간축이 정확하게 렌더링된다
- 15분 단위 그리드 라인이 표시된다
- 1시간 간격의 라인/라벨이 강조된다
- PLAN과 EXECUTION 열이 명확히 구분된다

**우선순위:** 높음

---

### US-2: 계획 블록 생성
**사용자로서**,
**나는** PLAN 열에 새로운 학습 계획 블록을 생성하고 싶다
**그래서** 시간대별로 나의 일일 학습 일정을 구성할 수 있다

**인수 조건:**
- 제목, 메모, 과목, 시작/종료 시간을 입력할 수 있다
- 시간이 15분 단위로 스냅된다
- 생성 후 블록이 타임라인에 즉시 나타난다
- 총 계획 시간이 그에 따라 업데이트된다

**우선순위:** 높음

---

### US-3: 수동 실행 기록
**사용자로서**,
**나는** EXECUTION 열에 실제 학습 시간을 수동으로 기록하고 싶다
**그래서** 실제 학습 시간을 계획과 비교할 수 있다

**인수 조건:**
- 시작/종료 시간을 직접 입력할 수 있다
- start < end 검증이 된다
- 15분 단위 입력만 허용된다
- dayStart/dayEnd 범위 내에서만 유효하다

**우선순위:** 높음

---

### US-4: 블록 수정
**사용자로서**,
**나는** 기존 블록 정보를 수정하고 싶다
**그래서** 정확한 계획 또는 실행 기록을 유지할 수 있다

**인수 조건:**
- 제목, 메모, 과목, 시간을 수정할 수 있다
- 시간 변경은 15분 단위로만 가능하다
- 수정 후 오버랩 레이아웃이 재계산된다

**우선순위:** 높음

---

### US-5: 블록 삭제
**사용자로서**,
**나는** 불필요한 블록을 삭제하고 싶다
**그래서** 나의 타임라인을 정리할 수 있다

**인수 조건:**
- 삭제 확인 후 블록이 제거된다
- 총 시간이 즉시 업데이트된다
- 오버랩 레이아웃이 재계산된다

**우선순위:** 높음

---

### US-6: 하루 표시 범위 설정
**사용자로서**,
**나는** 타임라인의 하루 표시 범위(시작/종료 시간)를 설정하고 싶다
**그래서** 나의 생활 패턴에 맞게 화면을 커스터마이징할 수 있다

**인수 조건:**
- dayStart와 dayEnd를 분 단위로 설정할 수 있다
- 설정 변경 시 타임라인이 즉시 다시 렌더링된다
- 설정이 사용자 계정에 저장된다

**우선순위:** 중간

---

### US-7: 겹치는 블록 시각화
**사용자로서**,
**나는** 같은 시간대의 여러 블록이 수평 분할로 표시되길 원한다
**그래서** 모든 블록을 명확하게 볼 수 있다

**인수 조건:**
- 겹치는 블록이 수평으로 균등 분할된다
- 블록이 서로를 가리지 않는다
- laneIndex와 laneCount를 기반으로 width/left가 계산된다

**우선순위:** 높음

---

### US-8: 종일 블록 관리
**사용자로서**,
**나는** 종일 이벤트를 상단 별도 영역에서 관리하고 싶다
**그래서** 시간 기반 블록과 별도로 관리할 수 있다

**인수 조건:**
- is_all_day=true 블록이 상단 영역에 칩/리스트로 표시된다
- 종일 블록은 총 시간 요약에서 제외된다
- 많은 블록이 있을 때 더보기/접기 토글이 제공된다

**우선순위:** 중간

---

### US-9: 계획/실행 총합 확인
**사용자로서**,
**나는** 당일의 총 계획 시간과 실행 시간을 확인하고 싶다
**그래서** 나의 목표 달성 수준을 파악할 수 있다

**인수 조건:**
- 상단에 "계획 총 Xh", "실행 총 Yh"가 표시된다
- 종일 블록은 총합에서 제외된다
- 블록 추가/수정/삭제 시 즉시 업데이트된다

**우선순위:** 높음

---

### US-10: 날짜 탐색
**사용자로서**,
**나는** 날짜를 선택하거나 탐색하고 싶다
**그래서** 다른 날짜의 계획/실행을 확인할 수 있다

**인수 조건:**
- 날짜 선택 UI가 제공된다
- 이전/다음 날짜로 이동할 수 있다
- 선택한 날짜의 데이터가 로드된다

**우선순위:** 높음

---

## 3. 기능 요구사항

### FR-1: 날짜 탐색
- 사용자는 날짜를 선택/탐색할 수 있어야 한다
- 선택한 날짜의 데이터(설정/과목/블록)가 로드되어야 한다

### FR-2: 레이아웃
- 화면은 (1) 상단 종일 영역, (2) 하단 타임라인 영역으로 구성된다
- 타임라인 영역: 왼쪽 시간축 + 오른쪽 2개 열(Plan/Execution)

### FR-3: 시간축
- 사용자가 설정한 하루 범위에 따라 렌더링된다
- 15분 단위 그리드 라인이 존재해야 한다
- 1시간 간격은 강조된 라인/라벨을 가진다
- 스크롤 시 시간축 고정 (권장)

### FR-4: 블록 렌더링
- 블록의 top/height는 start/end를 기반으로 계산된다
- 과목 색상 또는 기본 색상으로 블록이 구분된다
- 블록 내부에 텍스트(제목/설명)가 표시된다

### FR-5: 텍스트 정책 (높이 기반)
- 블록 높이에 따라 표시 텍스트가 달라진다:
  - **높음**: 제목 + 상세 2줄
  - **중간**: 제목 + 상세 1줄 (말줄임)
  - **낮음**: 제목 1줄 (말줄임) 또는 최소 표현 + 탭하여 상세 보기

### FR-6: 오버랩 처리 (같은 열 내)
- 같은 열의 겹치는 블록은 수평 분할로 표시된다
- 각 블록은 `laneIndex`, `laneCount`를 사용하여 위치 지정:
  - `width = 100% / laneCount`
  - `left = laneIndex * width`

### FR-7: 총 시간 표시
- 상단에 "계획 총 Xh", "실행 총 Yh" 표시
- 해당 날짜의 블록들로부터 총합 계산
- `is_all_day=true`는 총합에서 제외 (권장 정책)

### FR-8: 블록 생성
- 사용자는 PLAN 또는 EXECUTION 열에 블록을 생성할 수 있다
- 생성 시 입력값:
  - `type` (PLAN/EXECUTION), `title`, `note` (선택), `subject` (선택)
  - `is_all_day` 플래그
  - `is_all_day=false`이면 `start/end` 필수
- `start/end`에 15분 스냅 적용

### FR-9: 블록 수정
- 사용자는 블록의 제목/설명/과목/시간을 수정할 수 있다
- 시간 수정은 15분 단위로만 가능

### FR-10: 블록 삭제
- 사용자는 블록을 삭제할 수 있다
- 삭제 후 총합/레이아웃(오버랩)이 즉시 업데이트된다

### FR-11: 실행 기록 입력
- 사용자가 EXECUTION 블록 생성 시 "시작/종료 시간"을 직접 입력한다
- 검증:
  - `start < end`
  - 15분 단위
  - `dayStart/dayEnd` 범위에 대한 클램프 또는 경고 정책 필요

### FR-12: 하루 표시 범위 설정
- 사용자는 `dayStart/dayEnd`를 설정할 수 있다
- 설정은 사용자별로 저장되며, 일일 뷰 렌더링에 즉시 반영된다

---

## 4. 데이터 모델 명세

### 4.1 USERS 테이블
```
USERS {
  id: UUID (PK)
  name: string
  timezone: string
  created_at: datetime
  updated_at: datetime
}
```

### 4.2 PLANNER_SETTINGS 테이블
```
PLANNER_SETTINGS {
  id: UUID (PK)
  user_id: UUID (FK -> USERS.id)
  grid_minutes: int (기본값: 15)
  day_start_min: int (0-1440, 기본값: 360 = 오전 6:00)
  day_end_min: int (0-1440, 기본값: 1380 = 오후 11:00)
  created_at: datetime
  updated_at: datetime
}
```
**검증:** `0 <= day_start_min < day_end_min <= 1440`

### 4.3 SUBJECTS 테이블
```
SUBJECTS {
  id: UUID (PK)
  user_id: UUID (FK -> USERS.id)
  name: string
  color_hex: string (예: "#FF5733")
  sort_order: int
  is_active: boolean (기본값: true)
  created_at: datetime
  updated_at: datetime
}
```

### 4.4 TIME_BLOCKS 테이블
```
TIME_BLOCKS {
  id: UUID (PK)
  user_id: UUID (FK -> USERS.id)
  subject_id: UUID (FK -> SUBJECTS.id, nullable)
  date: date
  type: enum ('PLAN', 'EXECUTION')
  is_all_day: boolean (기본값: false)
  start_min: int (nullable, 0-1440)
  end_min: int (nullable, 0-1440)
  title: string
  note: string (nullable)
  display_order: int
  created_at: datetime
  updated_at: datetime
}
```
**검증:**
- `is_all_day=false`인 경우: start_min/end_min 필수, `start_min < end_min`, 15분 단위
- `is_all_day=true`인 경우: start_min/end_min nullable

---

## 5. API 명세

### 5.1 GET /planner/day
**설명:** 설정, 과목, 블록을 포함한 일일 플래너 데이터 조회

**요청:**
```
GET /planner/day?date=YYYY-MM-DD
Authorization: Bearer <token>
```

**응답:**
```json
{
  "date": "2026-01-10",
  "settings": {
    "grid_minutes": 15,
    "day_start_min": 360,
    "day_end_min": 1380
  },
  "subjects": [
    {
      "id": "uuid",
      "name": "수학",
      "color_hex": "#FF5733",
      "sort_order": 1,
      "is_active": true
    }
  ],
  "blocks": [
    {
      "id": "uuid",
      "type": "PLAN",
      "is_all_day": false,
      "start_min": 540,
      "end_min": 600,
      "title": "수학 공부",
      "note": "5장",
      "subject_id": "uuid",
      "display_order": 1
    }
  ],
  "summary": {
    "plan_total_min": 180,
    "execution_total_min": 120
  }
}
```

### 5.2 POST /blocks
**설명:** 새 타임 블록 생성

**요청:**
```json
{
  "date": "2026-01-10",
  "type": "PLAN",
  "title": "수학 공부",
  "note": "5장",
  "subject_id": "uuid",
  "is_all_day": false,
  "start_min": 540,
  "end_min": 600
}
```

**응답:**
```json
{
  "id": "uuid",
  "date": "2026-01-10",
  "type": "PLAN",
  "title": "수학 공부",
  "note": "5장",
  "subject_id": "uuid",
  "is_all_day": false,
  "start_min": 540,
  "end_min": 600,
  "display_order": 1,
  "created_at": "2026-01-10T09:00:00Z"
}
```

### 5.3 PATCH /blocks/:id
**설명:** 기존 타임 블록 수정

**요청:**
```json
{
  "title": "수정된 제목",
  "start_min": 540,
  "end_min": 630
}
```

**응답:**
```json
{
  "id": "uuid",
  "title": "수정된 제목",
  "start_min": 540,
  "end_min": 630,
  "updated_at": "2026-01-10T10:00:00Z"
}
```

### 5.4 DELETE /blocks/:id
**설명:** 타임 블록 삭제

**요청:**
```
DELETE /blocks/:id
Authorization: Bearer <token>
```

**응답:**
```json
{
  "success": true,
  "deleted_id": "uuid"
}
```

### 5.5 GET /planner/summary
**설명:** 주간/월간 리뷰를 위한 요약 조회

**요청:**
```
GET /planner/summary?from=YYYY-MM-DD&to=YYYY-MM-DD
Authorization: Bearer <token>
```

**응답:**
```json
{
  "from": "2026-01-01",
  "to": "2026-01-07",
  "daily_summaries": [
    {
      "date": "2026-01-01",
      "plan_total_min": 480,
      "execution_total_min": 420
    }
  ],
  "subject_summaries": [
    {
      "subject_id": "uuid",
      "subject_name": "수학",
      "plan_total_min": 120,
      "execution_total_min": 100
    }
  ],
  "totals": {
    "plan_total_min": 2400,
    "execution_total_min": 2100,
    "achievement_rate": 87.5
  }
}
```

---

## 6. 비즈니스 규칙

### 6.1 시간 검증 규칙
| 규칙 | 설명 |
|------|-------------|
| BR-1 | 모든 시간 값은 15분 단위여야 한다 (0, 15, 30, 45) |
| BR-2 | start_min은 end_min보다 작아야 한다 |
| BR-3 | 시간 값은 0-1440 범위 내여야 한다 (24시간을 분으로 환산) |
| BR-4 | 블록 시간은 사용자의 dayStart/dayEnd 내에 있어야 한다 (경고 또는 클램프) |

### 6.2 오버랩 처리 알고리즘
```
알고리즘: 겹치는 블록에 대한 레인 할당

1. 블록을 start_min으로 정렬, 그 다음 end_min으로 정렬
2. 각 블록에 대해:
   a. 모든 겹치는 블록 찾기 (block.start < other.end && block.end > other.start인 경우)
   b. 오버랩 그룹 생성
   c. 그룹 내에서 laneIndex (0 기반) 할당
   d. laneCount = 그룹 내 총 레인 수로 설정
3. 위치 계산:
   - width = 100% / laneCount
   - left = laneIndex * (100% / laneCount)
```
**복잡도:** 정렬에 O(n log n) + 레인 할당에 O(n)

### 6.3 요약 계산
- is_all_day = false인 모든 블록에 대해 (end_min - start_min) 합산
- type별로 그룹화 (PLAN/EXECUTION)
- 종일 블록은 총합에서 제외

---

## 7. 비기능 요구사항

### 7.1 성능
| 요구사항 | 목표 |
|-------------|--------|
| NFR-1 | 일일 뷰에서 최대 200개 블록을 지연 없이 렌더링 |
| NFR-2 | 오버랩 계산 알고리즘: O(n log n) 효율 |
| NFR-3 | 일일 데이터에 대한 API 응답 시간 < 500ms |

### 7.2 보안
| 요구사항 | 설명 |
|-------------|-------------|
| NFR-4 | 사용자는 자신의 데이터에만 접근 가능 |
| NFR-5 | API 엔드포인트는 인증 필요 |
| NFR-6 | 클라이언트와 서버 양쪽에서 입력 검증 |

### 7.3 사용성
| 요구사항 | 설명 |
|-------------|-------------|
| NFR-7 | 구분에 색상만 의존하지 않음 (제목/아이콘/테두리 사용) |
| NFR-8 | 모달 다이얼로그가 키보드 포커스 지원 |
| NFR-9 | 다양한 화면 크기에 대응하는 반응형 레이아웃 |

### 7.4 일관성
| 요구사항 | 설명 |
|-------------|-------------|
| NFR-10 | 클라이언트와 서버에서 동일하게 15분 스냅 적용 |
| NFR-11 | 자정 경계에서 타임존 인식 날짜 처리 |

---

## 8. 제약사항

1. **그리드 단위:** 15분 고정
2. **실행 기록:** 수동 입력만 (자동 타이머 없음)
3. **협업:** v1에서 공유/협업 기능 없음
4. **AI 기능:** v1에서 AI 추천이나 분석 없음
5. **오프라인:** v1에서 오프라인/동기화 지원 없음

---

## 9. 범위 외 (v1)

1. 자동 타이머 기반 실행 측정
2. AI 추천 및 난이도 분석
3. 학습 콘텐츠 통합
4. 협업/공유 기능 (공동 플래너)
5. 주간/월간 리뷰 (v1 확장)
6. 오프라인/동기화 지원 (v1 확장)

---

## 10. 엣지 케이스 및 검증

### 10.1 엣지 케이스
| 케이스 | 처리 |
|------|----------|
| 블록이 dayStart/dayEnd를 넘어가는 경우 | 경계로 클램프하거나 사용자에게 경고 |
| 정확히 같은 시간을 가진 여러 블록 | 허용, 레인으로 표시 |
| 빈 제목 | 필수 필드, 검증 오류 |
| 과목이 삭제되었지만 기존 블록이 있는 경우 | 블록 유지, "과목 없음"으로 표시 |
| 하루 중간에 타임존 변경 | 사용자가 설정한 타임존 사용 |

### 10.2 검증 오류 메시지
| 오류 | 메시지 |
|-------|---------|
| start >= end | "시작 시간은 종료 시간보다 이전이어야 합니다" |
| 15분 단위 아님 | "시간은 15분 단위여야 합니다" |
| 하루 범위 벗어남 | "설정된 하루 범위를 벗어났습니다" |
| 필수 필드 누락 | "{필드}는 필수입니다" |

---

## 11. 기술 의존성

### 11.1 프론트엔드
- React/Next.js 또는 유사 프레임워크
- 날짜/시간 조작 라이브러리 (date-fns, dayjs)
- 실시간 업데이트를 위한 상태 관리

### 11.2 백엔드
- RESTful API 프레임워크
- UUID 생성
- 타임존 지원 데이터베이스
- 인증 미들웨어

### 11.3 데이터베이스
- PostgreSQL (권장) 또는 유사 RDBMS
- UUID, ENUM 타입 지원
- 타임존 인식 datetime 필드
