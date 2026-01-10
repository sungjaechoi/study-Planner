# 이슈 보고서: 블록 수정 기능 오류 및 시간 피커 개선

## 개요

| 항목 | 내용 |
|------|------|
| **작성일** | 2026-01-11 |
| **이슈 유형** | 버그 수정 + 기능 개선 |
| **우선순위** | 높음 |
| **관련 파일** | `plannerStore.ts`, `BlockFormModal.tsx` |

---

## 이슈 1: 블록 CRUD 후 모달이 닫히지 않는 문제

### 현상

블록 삭제(Delete) 후 모달이 자동으로 닫히지 않음

### 원인 분석

#### plannerStore.ts 코드 분석

```typescript
// createBlock - 모달 닫힘 ✅
createBlock: async (data: CreateBlockRequest) => {
  try {
    await api.createBlock(data);
    await get().fetchDayData();
    set({ isFormModalOpen: false, editingBlock: null }); // ✅ 모달 닫기 있음
  } catch (err) { ... }
},

// updateBlock - 모달 닫힘 ✅
updateBlock: async (id: string, data: UpdateBlockRequest) => {
  try {
    await api.updateBlock(id, data);
    await get().fetchDayData();
    set({ isFormModalOpen: false, editingBlock: null }); // ✅ 모달 닫기 있음
  } catch (err) { ... }
},

// deleteBlock - 모달 안 닫힘 ❌
deleteBlock: async (id: string) => {
  try {
    await api.deleteBlock(id);
    await get().fetchDayData();
    // ❌ isFormModalOpen: false 누락!
  } catch (err) { ... }
},
```

### CRUD 모달 닫기 현황

| 작업 | API 호출 | 데이터 새로고침 | 모달 닫기 | 상태 |
|------|----------|----------------|----------|------|
| Create | ✅ | ✅ | ✅ | 정상 |
| Update | ✅ | ✅ | ✅ | 정상 |
| Delete | ✅ | ✅ | ❌ | **버그** |

### 해결 방안

**파일**: `src/stores/plannerStore.ts`

```typescript
deleteBlock: async (id: string) => {
  try {
    await api.deleteBlock(id);
    await get().fetchDayData();
    set({ isFormModalOpen: false, editingBlock: null }); // 추가 필요
  } catch (err) {
    set({ error: err instanceof Error ? err.message : 'Failed to delete block' });
    throw err;
  }
},
```

---

## 이슈 2: 시간 데이터 구조 및 피커 라이브러리 분석

### 현재 데이터 구조

#### 데이터베이스 (Prisma Schema)

```prisma
model TimeBlock {
  startMin     Int?     @map("start_min")   // 0-1440 (분 단위)
  endMin       Int?     @map("end_min")     // 0-1440 (분 단위)
}

model PlannerSettings {
  dayStartMin  Int      @default(360)       // 6:00 AM = 360분
  dayEndMin    Int      @default(1380)      // 11:00 PM = 1380분
}
```

#### API 응답 (snake_case)

```typescript
interface Block {
  start_min: number | null;  // 0-1440
  end_min: number | null;    // 0-1440
}
```

#### 프론트엔드 상태 (BlockFormModal)

```typescript
const [startTime, setStartTime] = useState('09:00');  // "HH:MM" 문자열
const [endTime, setEndTime] = useState('10:00');      // "HH:MM" 문자열
```

### 시간 변환 흐름

```
┌─────────────────────────────────────────────────────────────────┐
│                        데이터 흐름                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [DB: 540]  →  [API: start_min: 540]  →  [UI: "09:00"]         │
│      ↑              minutesToTime()           ↓                 │
│      │                                        │                 │
│      └──────────────────────────────────────←─┘                 │
│           timeToMinutes() + snapTo15Minutes()                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 시간 유틸리티 함수 (src/lib/utils/time.ts)

| 함수 | 입력 | 출력 | 용도 |
|------|------|------|------|
| `minutesToTime(540)` | number | "09:00" | DB → UI 변환 |
| `timeToMinutes("09:00")` | string | 540 | UI → DB 변환 |
| `snapTo15Minutes(547)` | number | 540 | 15분 단위로 스냅 |
| `isValid15MinIncrement(540)` | number | true | 15분 단위 검증 |

### 현재 시간 입력 방식

```tsx
// BlockFormModal.tsx - HTML5 기본 time input 사용
<Input
  type="time"
  value={startTime}        // "HH:MM"
  onChange={(e) => setStartTime(e.target.value)}
  step={900}               // 15분 = 900초
/>
```

#### 현재 방식의 문제점

| 문제 | 설명 |
|------|------|
| 브라우저 일관성 | 브라우저별로 다른 UI 렌더링 |
| 스타일 제한 | 네이티브 UI 커스터마이징 어려움 |
| 15분 단위 강제 | `step` 속성이 모든 브라우저에서 동작하지 않음 |
| 접근성 | 키보드 접근성이 브라우저에 의존 |

---

## 시간 피커 라이브러리 추천

### 프로젝트 기술 스택

```json
{
  "react": "19.2.3",
  "next": "16.1.1",
  "tailwindcss": "^4",
  "date-fns": "^3.0.0"
}
```

### 추천 라이브러리 비교

#### 1. 커스텀 Select 컴포넌트 (추천)

**장점**:
- 외부 의존성 없음
- 완전한 스타일 제어
- 15분 단위 강제 용이
- 기존 프로젝트 패턴과 일치

```tsx
// 예시 구현
const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => {
  const minutes = i * 15;
  return {
    value: minutes,
    label: minutesToTime(minutes), // "00:00", "00:15", ...
  };
});

<Select
  label="시작 시간"
  value={startMin}
  onChange={(e) => setStartMin(Number(e.target.value))}
  options={TIME_OPTIONS}
/>
```

**평가**: ⭐⭐⭐⭐⭐ (가장 추천)

---

#### 2. @headlessui/react + Tailwind

**설치**: `npm install @headlessui/react`

**장점**:
- Tailwind와 완벽한 통합
- 접근성 기본 제공
- 완전한 스타일 제어

**단점**:
- 직접 시간 리스트 구현 필요

```tsx
import { Listbox } from '@headlessui/react';

<Listbox value={selectedTime} onChange={setSelectedTime}>
  <Listbox.Button>{selectedTime}</Listbox.Button>
  <Listbox.Options>
    {timeOptions.map((time) => (
      <Listbox.Option key={time} value={time}>
        {time}
      </Listbox.Option>
    ))}
  </Listbox.Options>
</Listbox>
```

**평가**: ⭐⭐⭐⭐ (UI 커스터마이징 필요시)

---

#### 3. react-datepicker

**설치**: `npm install react-datepicker`

**장점**:
- 성숙한 라이브러리
- 시간 전용 모드 지원
- date-fns 기반 (이미 사용 중)

**단점**:
- 번들 크기 증가 (~50KB)
- 스타일 오버라이드 필요

```tsx
import DatePicker from 'react-datepicker';

<DatePicker
  selected={startTime}
  onChange={setStartTime}
  showTimeSelect
  showTimeSelectOnly
  timeIntervals={15}
  dateFormat="HH:mm"
/>
```

**평가**: ⭐⭐⭐ (기능 풍부하나 오버스펙)

---

#### 4. react-time-picker

**설치**: `npm install react-time-picker`

**장점**:
- 시간 전용 컴포넌트
- 가벼운 번들 크기

**단점**:
- React 19 호환성 미확인
- 제한된 커스터마이징

**평가**: ⭐⭐ (호환성 확인 필요)

---

### 최종 추천

| 순위 | 라이브러리 | 이유 |
|------|------------|------|
| 1 | **커스텀 Select** | 의존성 없음, 완전한 제어, 프로젝트 패턴 일치 |
| 2 | @headlessui/react | 접근성 우수, Tailwind 통합 |
| 3 | react-datepicker | 검증된 라이브러리 (date-fns 사용 중) |

---

## 구현 제안: 커스텀 TimeSelect 컴포넌트

### 파일 구조

```
src/components/ui/
└── TimeSelect.tsx    # 신규 생성
```

### 컴포넌트 설계

```tsx
// src/components/ui/TimeSelect.tsx
interface TimeSelectProps {
  label?: string;
  value: number;              // 분 단위 (0-1440)
  onChange: (minutes: number) => void;
  minTime?: number;           // 최소 시간 (분)
  maxTime?: number;           // 최대 시간 (분)
  interval?: number;          // 간격 (기본 15분)
  error?: string;
}

export function TimeSelect({
  label,
  value,
  onChange,
  minTime = 0,
  maxTime = 1440,
  interval = 15,
  error,
}: TimeSelectProps) {
  const options = useMemo(() => {
    const result = [];
    for (let min = minTime; min < maxTime; min += interval) {
      result.push({
        value: min,
        label: minutesToTime(min),
      });
    }
    return result;
  }, [minTime, maxTime, interval]);

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm
          text-black
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

### BlockFormModal 수정 예시

```tsx
// 변경 전
const [startTime, setStartTime] = useState('09:00');  // string
const [endTime, setEndTime] = useState('10:00');      // string

// 변경 후
const [startMin, setStartMin] = useState(540);        // number (9 * 60)
const [endMin, setEndMin] = useState(600);            // number (10 * 60)

// JSX
<TimeSelect
  label="시작 시간"
  value={startMin}
  onChange={setStartMin}
  minTime={dayStartMin}
  maxTime={dayEndMin}
/>
```

---

## 작업 체크리스트

### 버그 수정

- [ ] `plannerStore.ts` - deleteBlock에 모달 닫기 로직 추가

### 기능 개선 (선택)

- [ ] `TimeSelect.tsx` 컴포넌트 생성
- [ ] `BlockFormModal.tsx` - TimeSelect 적용
- [ ] 시간 범위 검증 (dayStartMin ~ dayEndMin)

---

## 참고: 분 ↔ 시간 변환표

| 시간 | 분(minutes) |
|------|-------------|
| 00:00 | 0 |
| 06:00 | 360 |
| 09:00 | 540 |
| 12:00 | 720 |
| 18:00 | 1080 |
| 23:00 | 1380 |
| 24:00 | 1440 |
