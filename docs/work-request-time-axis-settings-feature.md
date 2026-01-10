# 작업 요청서: 시간 축 사용자 설정 기능 구현

## 요청 개요

| 항목 | 내용 |
|------|------|
| **작업 유형** | 기능 구현 (Feature Implementation) |
| **우선순위** | 중간 |
| **관련 이슈** | [issue-time-axis-fixed-at-6am.md](./issue-time-axis-fixed-at-6am.md) |
| **요청일** | 2026-01-11 |

## 배경

현재 시간 축이 6시(06:00 AM)로 고정되어 있습니다. DB 스키마와 백엔드 API는 이미 구현되어 있으나, 프론트엔드에서 사용자가 설정을 변경할 수 있는 UI가 없습니다.

---

## 현재 시스템 분석

### 이미 구현된 부분

| 레이어 | 상태 | 파일 |
|--------|------|------|
| DB 스키마 | ✅ 완료 | `prisma/schema.prisma` - PlannerSettings 모델 |
| 백엔드 API | ✅ 완료 | `src/app/api/settings/route.ts` - GET/PATCH |
| 서비스 레이어 | ✅ 완료 | `src/server/services/settings.service.ts` |
| 프론트엔드 Store | ⚠️ 부분 | `src/stores/plannerStore.ts` - 조회만 구현 |
| API 클라이언트 | ⚠️ 부분 | `src/lib/api.ts` - updateSettings 타입 미지정 |
| 설정 UI | ❌ 미구현 | 없음 |

### 데이터 흐름 (현재)

```
[DB: PlannerSettings] → [API: GET /api/settings] → [Store: settings] → [page.tsx: dayStartMin]
                        [API: PATCH /api/settings] ← (호출하는 곳 없음)
```

---

## 작업 범위

### Task 1: API 클라이언트 타입 보강

**파일**: `src/lib/api.ts`

**작업 내용**:
```typescript
// 타입 import 추가
import type { SettingsResponse } from '@/types';

// updateSettings 함수에 반환 타입 추가
export async function updateSettings(data: UpdateSettingsRequest): Promise<SettingsResponse> {
  return fetchAPI<SettingsResponse>('/settings', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
```

**타입 정의 추가** (`src/types/index.ts`):
```typescript
export interface SettingsResponse {
  id: string;
  grid_minutes: number;
  day_start_min: number;
  day_end_min: number;
  updated_at: string;
}
```

---

### Task 2: Zustand Store 액션 추가

**파일**: `src/stores/plannerStore.ts`

**작업 내용**:
1. `isSettingsModalOpen` 상태 추가
2. `updateSettings` 액션 추가
3. `openSettingsModal` / `closeSettingsModal` 액션 추가

```typescript
// PlannerState 인터페이스에 추가
isSettingsModalOpen: boolean;
openSettingsModal: () => void;
closeSettingsModal: () => void;
updateSettings: (data: UpdateSettingsRequest) => Promise<void>;

// 초기 상태에 추가
isSettingsModalOpen: false,

// 액션 구현
openSettingsModal: () => {
  set({ isSettingsModalOpen: true });
},

closeSettingsModal: () => {
  set({ isSettingsModalOpen: false });
},

updateSettings: async (data: UpdateSettingsRequest) => {
  try {
    const updatedSettings = await api.updateSettings(data);
    set({
      settings: {
        grid_minutes: updatedSettings.grid_minutes,
        day_start_min: updatedSettings.day_start_min,
        day_end_min: updatedSettings.day_end_min,
      },
      isSettingsModalOpen: false,
    });
    // 타임라인 리렌더링을 위해 데이터 새로고침
    await get().fetchDayData();
  } catch (err) {
    set({ error: err instanceof Error ? err.message : 'Failed to update settings' });
    throw err;
  }
},
```

---

### Task 3: 설정 모달 컴포넌트 생성

**파일**: `src/components/planner/Settings/SettingsModal.tsx` (신규)

**UI 요구사항**:

```
┌─────────────────────────────────────────┐
│  ⚙️ 플래너 설정                    [X]  │
├─────────────────────────────────────────┤
│                                         │
│  📅 하루 시작 시간                       │
│  ┌─────────────────────────────────┐    │
│  │  [▼] 06:00                      │    │
│  └─────────────────────────────────┘    │
│                                         │
│  📅 하루 종료 시간                       │
│  ┌─────────────────────────────────────┐│
│  │  [▼] 23:00                          ││
│  └─────────────────────────────────────┘│
│                                         │
│  🔲 그리드 간격                          │
│  ┌─────────────────────────────────┐    │
│  │  [▼] 15분                       │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────┐  ┌─────────┐              │
│  │  취소   │  │  저장   │              │
│  └─────────┘  └─────────┘              │
└─────────────────────────────────────────┘
```

**Props 인터페이스**:
```typescript
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: {
    day_start_min: number;
    day_end_min: number;
    grid_minutes: number;
  } | null;
  onSave: (settings: UpdateSettingsRequest) => Promise<void>;
}
```

**시간 선택 옵션**:
- 시작 시간: 00:00 ~ 12:00 (1시간 단위)
- 종료 시간: 12:00 ~ 24:00 (1시간 단위)
- 그리드 간격: 15분, 30분, 60분

**유효성 검사**:
- 시작 시간 < 종료 시간
- 최소 6시간 이상 차이

---

### Task 4: 설정 버튼 추가

**파일**: `src/components/planner/DateNav/DateNavigation.tsx`

**작업 내용**:
- 우측에 설정 아이콘(⚙️) 버튼 추가
- `onSettingsClick` prop 추가

**수정 예시**:
```tsx
interface DateNavigationProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onSettingsClick?: () => void;  // 추가
}

// JSX에 추가
{onSettingsClick && (
  <Button variant="ghost" size="sm" onClick={onSettingsClick} aria-label="설정">
    <SettingsIcon className="w-5 h-5" />
  </Button>
)}
```

---

### Task 5: 메인 페이지 통합

**파일**: `src/app/page.tsx`

**작업 내용**:
1. Store에서 설정 관련 상태/액션 가져오기
2. DateNavigation에 onSettingsClick 연결
3. SettingsModal 컴포넌트 렌더링

```typescript
// Store에서 추가로 가져오기
const {
  // ... 기존 상태
  isSettingsModalOpen,
  openSettingsModal,
  closeSettingsModal,
  updateSettings,
} = usePlannerStore();

// DateNavigation에 prop 추가
<DateNavigation
  selectedDate={selectedDate}
  onDateChange={setSelectedDate}
  onSettingsClick={openSettingsModal}
/>

// SettingsModal 렌더링
<SettingsModal
  isOpen={isSettingsModalOpen}
  onClose={closeSettingsModal}
  currentSettings={settings}
  onSave={updateSettings}
/>
```

---

## 파일 변경 목록

| 작업 | 파일 경로 | 변경 유형 |
|------|----------|----------|
| Task 1 | `src/lib/api.ts` | 수정 |
| Task 1 | `src/types/index.ts` | 수정 |
| Task 2 | `src/stores/plannerStore.ts` | 수정 |
| Task 3 | `src/components/planner/Settings/SettingsModal.tsx` | 신규 |
| Task 3 | `src/components/planner/Settings/index.ts` | 신규 |
| Task 4 | `src/components/planner/DateNav/DateNavigation.tsx` | 수정 |
| Task 5 | `src/app/page.tsx` | 수정 |

---

## 추가 컴포넌트 (권장)

### TimeRangeSelector.tsx

시작/종료 시간 선택을 위한 재사용 가능한 컴포넌트:

```typescript
interface TimeRangeSelectorProps {
  label: string;
  value: number;  // 분 단위
  onChange: (minutes: number) => void;
  minHour: number;
  maxHour: number;
}
```

### GridIntervalSelector.tsx

그리드 간격 선택 컴포넌트:

```typescript
interface GridIntervalSelectorProps {
  value: number;  // 15, 30, 60
  onChange: (minutes: number) => void;
}
```

---

## 검증 기준 (Acceptance Criteria)

### 기능 검증

- [ ] 설정 버튼 클릭 시 모달이 열림
- [ ] 현재 설정값이 모달에 표시됨
- [ ] 시작/종료 시간 변경 가능
- [ ] 그리드 간격 변경 가능
- [ ] 저장 시 API 호출 후 타임라인 즉시 반영
- [ ] 취소 시 변경사항 폐기
- [ ] 잘못된 값 입력 시 에러 메시지 표시

### UI/UX 검증

- [ ] 모달 외부 클릭 시 닫힘
- [ ] ESC 키로 모달 닫힘
- [ ] 저장 중 로딩 상태 표시
- [ ] 모바일 반응형 지원

### 데이터 검증

- [ ] 새로고침 후에도 설정값 유지
- [ ] 다른 날짜로 이동해도 설정값 유지

---

## 의존성

- 기존 API `/api/settings` (GET/PATCH) 활용
- 기존 Prisma 스키마 `PlannerSettings` 모델 활용
- 기존 Modal 컴포넌트 (`src/components/ui/Modal.tsx`) 재사용
- Zustand 상태 관리 패턴 준수

---

## 참고 자료

### 분(minute) ↔ 시간 변환표

| 시간 | 분(minute) |
|------|------------|
| 00:00 | 0 |
| 06:00 | 360 |
| 09:00 | 540 |
| 12:00 | 720 |
| 18:00 | 1080 |
| 23:00 | 1380 |
| 24:00 | 1440 |

### 관련 파일 구조

```
src/
├── app/
│   ├── api/settings/route.ts      # ✅ 백엔드 API
│   └── page.tsx                   # 📝 수정 필요
├── components/planner/
│   ├── DateNav/
│   │   └── DateNavigation.tsx     # 📝 수정 필요
│   └── Settings/                  # 🆕 신규 생성
│       ├── SettingsModal.tsx
│       ├── TimeRangeSelector.tsx
│       ├── GridIntervalSelector.tsx
│       └── index.ts
├── lib/
│   └── api.ts                     # 📝 수정 필요
├── types/
│   └── index.ts                   # 📝 수정 필요
├── stores/
│   └── plannerStore.ts            # 📝 수정 필요
└── server/services/
    └── settings.service.ts        # ✅ 완료
```

---

## 예상 결과

작업 완료 후 사용자는:
1. 설정 버튼(⚙️)을 클릭하여 설정 모달 열기
2. 원하는 시작/종료 시간 선택 (예: 00:00 ~ 24:00)
3. 원하는 그리드 간격 선택 (15분, 30분, 60분)
4. 저장 버튼 클릭
5. 타임라인이 즉시 새로운 시간 범위로 업데이트됨
