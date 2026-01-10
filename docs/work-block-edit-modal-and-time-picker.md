# 작업 가이드: 블록 수정 모달 버그 수정 및 시간 피커 개선

## 작업 개요

| 항목 | 내용 |
|------|------|
| **작업 유형** | 버그 수정 + 기능 개선 |
| **우선순위** | 높음 |
| **관련 이슈** | [issue-block-edit-modal-and-time-picker.md](./issue-block-edit-modal-and-time-picker.md) |
| **작성일** | 2026-01-11 |

---

## 작업 범위

### Phase 1: 버그 수정 (필수)
- deleteBlock 후 모달 닫기

### Phase 2: 기능 개선 (권장)
- TimeSelect 커스텀 컴포넌트 구현
- BlockFormModal에 TimeSelect 적용

---

## Phase 1: 버그 수정

### Task 1-1: deleteBlock 모달 닫기 수정

**파일**: `src/stores/plannerStore.ts`

**현재 코드** (Line 134-142):
```typescript
deleteBlock: async (id: string) => {
  try {
    await api.deleteBlock(id);
    await get().fetchDayData();
  } catch (err) {
    set({ error: err instanceof Error ? err.message : 'Failed to delete block' });
    throw err;
  }
},
```

**수정 코드**:
```typescript
deleteBlock: async (id: string) => {
  try {
    await api.deleteBlock(id);
    await get().fetchDayData();
    set({ isFormModalOpen: false, editingBlock: null }); // 추가
  } catch (err) {
    set({ error: err instanceof Error ? err.message : 'Failed to delete block' });
    throw err;
  }
},
```

**검증**:
- [ ] 블록 삭제 후 모달이 자동으로 닫히는지 확인
- [ ] 에러 발생 시 모달이 유지되는지 확인

---

## Phase 2: 기능 개선

### Task 2-1: TimeSelect 컴포넌트 생성

**파일**: `src/components/ui/TimeSelect.tsx` (신규)

```tsx
'use client';

import { useMemo } from 'react';
import { minutesToTime } from '@/lib/utils/time';

interface TimeSelectProps {
  label?: string;
  value: number;
  onChange: (minutes: number) => void;
  minTime?: number;
  maxTime?: number;
  interval?: number;
  error?: string;
  disabled?: boolean;
}

export function TimeSelect({
  label,
  value,
  onChange,
  minTime = 0,
  maxTime = 1440,
  interval = 15,
  error,
  disabled = false,
}: TimeSelectProps) {
  const options = useMemo(() => {
    const result: { value: number; label: string }[] = [];
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
        disabled={disabled}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm
          text-black bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
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

---

### Task 2-2: Input.tsx에 TimeSelect export 추가

**파일**: `src/components/ui/Input.tsx`

**추가할 내용** (파일 끝):
```typescript
// Re-export TimeSelect for convenience
export { TimeSelect } from './TimeSelect';
```

---

### Task 2-3: BlockFormModal 수정

**파일**: `src/components/planner/BlockForm/BlockFormModal.tsx`

#### 3-1. Import 수정

**변경 전**:
```typescript
import { Input, Select } from '@/components/ui/Input';
import { minutesToTime, timeToMinutes, snapTo15Minutes } from '@/lib/utils/time';
```

**변경 후**:
```typescript
import { Input, Select, TimeSelect } from '@/components/ui/Input';
import { minutesToTime } from '@/lib/utils/time';
```

#### 3-2. State 수정

**변경 전**:
```typescript
const [startTime, setStartTime] = useState('09:00');
const [endTime, setEndTime] = useState('10:00');
```

**변경 후**:
```typescript
const [startMin, setStartMin] = useState(540);   // 09:00 = 540분
const [endMin, setEndMin] = useState(600);       // 10:00 = 600분
```

#### 3-3. useEffect 수정

**변경 전**:
```typescript
useEffect(() => {
  if (editingBlock) {
    setTitle(editingBlock.title);
    setNote(editingBlock.note || '');
    setSubjectId(editingBlock.subject_id || '');
    setIsAllDay(editingBlock.is_all_day);
    if (editingBlock.start_min !== null) {
      setStartTime(minutesToTime(editingBlock.start_min));
    }
    if (editingBlock.end_min !== null) {
      setEndTime(minutesToTime(editingBlock.end_min));
    }
  } else {
    setTitle('');
    setNote('');
    setSubjectId('');
    setIsAllDay(false);
    setStartTime('09:00');
    setEndTime('10:00');
  }
  setError('');
}, [editingBlock, isOpen]);
```

**변경 후**:
```typescript
useEffect(() => {
  if (editingBlock) {
    setTitle(editingBlock.title);
    setNote(editingBlock.note || '');
    setSubjectId(editingBlock.subject_id || '');
    setIsAllDay(editingBlock.is_all_day);
    setStartMin(editingBlock.start_min ?? 540);
    setEndMin(editingBlock.end_min ?? 600);
  } else {
    setTitle('');
    setNote('');
    setSubjectId('');
    setIsAllDay(false);
    setStartMin(540);
    setEndMin(600);
  }
  setError('');
}, [editingBlock, isOpen]);
```

#### 3-4. handleSubmit 수정

**변경 전**:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  if (!title.trim()) {
    setError('제목을 입력해주세요');
    return;
  }

  const startMin = snapTo15Minutes(timeToMinutes(startTime));
  const endMin = snapTo15Minutes(timeToMinutes(endTime));

  if (!isAllDay && startMin >= endMin) {
    setError('종료 시간은 시작 시간 이후여야 합니다');
    return;
  }
  // ... 나머지 코드
```

**변경 후**:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  if (!title.trim()) {
    setError('제목을 입력해주세요');
    return;
  }

  if (!isAllDay && startMin >= endMin) {
    setError('종료 시간은 시작 시간 이후여야 합니다');
    return;
  }
  // ... 나머지 코드 (startMin, endMin 변수 선언 제거)
```

#### 3-5. JSX 수정

**변경 전**:
```tsx
{!isAllDay && (
  <div className="grid grid-cols-2 gap-4">
    <Input
      label="시작 시간"
      type="time"
      value={startTime}
      onChange={(e) => setStartTime(e.target.value)}
      step={900}
    />
    <Input
      label="종료 시간"
      type="time"
      value={endTime}
      onChange={(e) => setEndTime(e.target.value)}
      step={900}
    />
  </div>
)}
```

**변경 후**:
```tsx
{!isAllDay && (
  <div className="grid grid-cols-2 gap-4">
    <TimeSelect
      label="시작 시간"
      value={startMin}
      onChange={setStartMin}
      minTime={0}
      maxTime={1425}
    />
    <TimeSelect
      label="종료 시간"
      value={endMin}
      onChange={setEndMin}
      minTime={15}
      maxTime={1440}
    />
  </div>
)}
```

---

## 파일 변경 목록

| Phase | 파일 경로 | 변경 유형 | 필수 여부 |
|-------|----------|----------|----------|
| 1 | `src/stores/plannerStore.ts` | 수정 | 필수 |
| 2 | `src/components/ui/TimeSelect.tsx` | 신규 | 권장 |
| 2 | `src/components/ui/Input.tsx` | 수정 | 권장 |
| 2 | `src/components/planner/BlockForm/BlockFormModal.tsx` | 수정 | 권장 |

---

## 검증 체크리스트

### Phase 1 검증

- [ ] 블록 생성 후 모달 닫힘 확인
- [ ] 블록 수정 후 모달 닫힘 확인
- [ ] 블록 삭제 후 모달 닫힘 확인
- [ ] 에러 발생 시 모달 유지 확인

### Phase 2 검증

- [ ] TimeSelect에서 15분 단위로 시간 선택 가능
- [ ] 시작 시간 < 종료 시간 검증 동작
- [ ] 기존 블록 수정 시 시간 값 올바르게 표시
- [ ] 새 블록 생성 시 기본 시간 (09:00-10:00) 표시

---

## 추가 개선 사항 (선택)

### 동적 시간 범위 적용

사용자 설정에 따른 시간 범위 제한:

```tsx
// page.tsx에서 dayStartMin, dayEndMin을 BlockFormModal에 전달
<BlockFormModal
  ...
  dayStartMin={dayStartMin}
  dayEndMin={dayEndMin}
/>

// BlockFormModal에서 TimeSelect에 적용
<TimeSelect
  label="시작 시간"
  value={startMin}
  onChange={setStartMin}
  minTime={dayStartMin}
  maxTime={dayEndMin - 15}
/>
```

### 시간 선택 시 종료 시간 자동 조정

```typescript
const handleStartMinChange = (newStartMin: number) => {
  setStartMin(newStartMin);
  // 종료 시간이 시작 시간보다 이전이면 자동 조정
  if (endMin <= newStartMin) {
    setEndMin(newStartMin + 60); // 기본 1시간
  }
};
```

---

## 참고 사항

### 분 ↔ 시간 변환

| 시간 | 분 |
|------|-----|
| 00:00 | 0 |
| 06:00 | 360 |
| 09:00 | 540 |
| 10:00 | 600 |
| 12:00 | 720 |
| 18:00 | 1080 |
| 23:45 | 1425 |
| 24:00 | 1440 |

### 15분 단위 옵션 개수

- 전체 (00:00 ~ 24:00): 96개 옵션
- 6시간 범위: 24개 옵션
- 12시간 범위: 48개 옵션
