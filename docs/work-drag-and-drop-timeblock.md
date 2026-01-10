# TimeBlock 드래그 앤 드롭 기능 구현 가이드

## 1. 개요

### 1.1 기능 설명
TimeBlock 컴포넌트에 드래그 앤 드롭 기능을 추가하여 사용자가 시간 블록을 마우스로 드래그하여 시간대를 변경할 수 있도록 합니다.

### 1.2 현재 구조 분석

#### 시간-픽셀 변환
```typescript
// src/lib/constants.ts
export const PIXELS_PER_MINUTE = 1;  // 1분 = 1px
export const GRID_MINUTES = 15;       // 15분 단위 그리드
```

#### TimeBlock 위치 계산 (현재)
```typescript
// src/components/planner/Timeline/TimeBlock.tsx
const top = (startMin - dayStartMin) * PIXELS_PER_MINUTE;
const height = (endMin - startMin) * PIXELS_PER_MINUTE;
```

#### 데이터 구조
```typescript
// UpdateBlockRequest - 블록 업데이트에 필요한 필드
interface UpdateBlockRequest {
  title?: string;
  note?: string | null;
  subject_id?: string | null;
  is_all_day?: boolean;
  start_min?: number | null;  // 드래그 시 업데이트할 필드
  end_min?: number | null;    // 드래그 시 업데이트할 필드
}
```

## 2. 구현 전략

### 2.1 드래그 방식 선택

**옵션 A: HTML5 Drag and Drop API**
- 장점: 브라우저 네이티브 지원
- 단점: 세밀한 위치 제어 어려움, 드래그 중 시각적 피드백 제한

**옵션 B: 마우스 이벤트 기반 (권장)**
- 장점: 픽셀 단위 정밀 제어, 실시간 시각적 피드백
- 단점: 직접 구현 필요

**선택: 옵션 B (마우스 이벤트 기반)**
- 시간축에서 정확한 위치 계산 필요
- 15분 단위 스냅 기능 구현 용이
- 드래그 중 실시간 미리보기 제공

### 2.2 드래그 모드

1. **이동 모드 (Move)**: 블록 전체를 위/아래로 이동 (시작/종료 시간 동시 변경)
2. **리사이즈 모드 (Resize)**: 블록 상단/하단 가장자리를 드래그하여 길이 변경 (선택적 구현)

## 3. 백엔드 확인

### 3.1 API 엔드포인트
```
PATCH /api/blocks/[id]
```

### 3.2 현재 API 구현 상태
```typescript
// src/app/api/blocks/[id]/route.ts
export async function PATCH(request: NextRequest, context: RouteContext) {
  // start_min, end_min 업데이트 지원됨
  const body = await request.json();
  const block = await blockService.updateBlock(id, body);
  return NextResponse.json(block);
}
```

### 3.3 유효성 검사
```typescript
// src/lib/validations/block.ts
export const updateBlockSchema = z.object({
  start_min: z.number().int().min(0).max(1440).nullable().optional(),
  end_min: z.number().int().min(0).max(1440).nullable().optional(),
  // ... 기타 필드
});
```

**결론: 백엔드 수정 불필요** - 현재 API가 `start_min`, `end_min` 업데이트를 지원함

## 4. 프론트엔드 구현

### 4.1 파일 구조
```
src/
├── components/planner/Timeline/
│   ├── TimeBlock.tsx          # 드래그 기능 추가
│   ├── BlockColumn.tsx        # 드래그 영역 컨테이너
│   └── Timeline.tsx           # 상위 컴포넌트
├── hooks/
│   └── useDragBlock.ts        # 새로 생성 - 드래그 로직 훅
└── stores/
    └── plannerStore.ts        # updateBlock 액션 사용
```

### 4.2 useDragBlock 훅 구현

```typescript
// src/hooks/useDragBlock.ts
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { PIXELS_PER_MINUTE, GRID_MINUTES } from '@/lib/constants';

interface UseDragBlockProps {
  blockId: string;
  initialStartMin: number;
  initialEndMin: number;
  dayStartMin: number;
  dayEndMin: number;
  onDragEnd: (blockId: string, newStartMin: number, newEndMin: number) => Promise<void>;
}

interface DragState {
  isDragging: boolean;
  startY: number;
  initialTop: number;
  currentStartMin: number;
  currentEndMin: number;
}

export function useDragBlock({
  blockId,
  initialStartMin,
  initialEndMin,
  dayStartMin,
  dayEndMin,
  onDragEnd,
}: UseDragBlockProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startY: 0,
    initialTop: 0,
    currentStartMin: initialStartMin,
    currentEndMin: initialEndMin,
  });

  const dragRef = useRef<DragState>(dragState);
  dragRef.current = dragState;

  // 15분 단위로 스냅
  const snapToGrid = useCallback((minutes: number): number => {
    return Math.round(minutes / GRID_MINUTES) * GRID_MINUTES;
  }, []);

  // 드래그 시작
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const top = (initialStartMin - dayStartMin) * PIXELS_PER_MINUTE;

    setDragState({
      isDragging: true,
      startY: e.clientY,
      initialTop: top,
      currentStartMin: initialStartMin,
      currentEndMin: initialEndMin,
    });
  }, [initialStartMin, initialEndMin, dayStartMin]);

  // 드래그 중
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragRef.current.isDragging) return;

    const deltaY = e.clientY - dragRef.current.startY;
    const deltaMinutes = deltaY / PIXELS_PER_MINUTE;
    const duration = initialEndMin - initialStartMin;

    let newStartMin = snapToGrid(initialStartMin + deltaMinutes);
    let newEndMin = newStartMin + duration;

    // 경계 체크
    if (newStartMin < dayStartMin) {
      newStartMin = dayStartMin;
      newEndMin = newStartMin + duration;
    }
    if (newEndMin > dayEndMin) {
      newEndMin = dayEndMin;
      newStartMin = newEndMin - duration;
    }

    setDragState(prev => ({
      ...prev,
      currentStartMin: newStartMin,
      currentEndMin: newEndMin,
    }));
  }, [initialStartMin, initialEndMin, dayStartMin, dayEndMin, snapToGrid]);

  // 드래그 종료
  const handleMouseUp = useCallback(async () => {
    if (!dragRef.current.isDragging) return;

    const { currentStartMin, currentEndMin } = dragRef.current;

    setDragState(prev => ({
      ...prev,
      isDragging: false,
    }));

    // 시간이 변경된 경우에만 API 호출
    if (currentStartMin !== initialStartMin || currentEndMin !== initialEndMin) {
      await onDragEnd(blockId, currentStartMin, currentEndMin);
    }
  }, [blockId, initialStartMin, initialEndMin, onDragEnd]);

  // 전역 이벤트 리스너
  useEffect(() => {
    if (dragState.isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  return {
    isDragging: dragState.isDragging,
    currentStartMin: dragState.currentStartMin,
    currentEndMin: dragState.currentEndMin,
    handleMouseDown,
  };
}
```

### 4.3 TimeBlock 컴포넌트 수정

```typescript
// src/components/planner/Timeline/TimeBlock.tsx
'use client';

import type { BlockType } from '@/types';
import { PIXELS_PER_MINUTE } from '@/lib/constants';
import { useDragBlock } from '@/hooks/useDragBlock';

interface TimeBlockProps {
  id: string;
  type: BlockType;
  title: string;
  note: string | null;
  startMin: number;
  endMin: number;
  dayStartMin: number;
  dayEndMin: number;  // 새로 추가
  laneIndex: number;
  laneCount: number;
  subjectColor?: string;
  onClick: () => void;
  onDragEnd: (blockId: string, newStartMin: number, newEndMin: number) => Promise<void>;  // 새로 추가
}

export function TimeBlock({
  id,
  type,
  title,
  note,
  startMin,
  endMin,
  dayStartMin,
  dayEndMin,
  laneIndex,
  laneCount,
  subjectColor,
  onClick,
  onDragEnd,
}: TimeBlockProps) {
  const {
    isDragging,
    currentStartMin,
    currentEndMin,
    handleMouseDown,
  } = useDragBlock({
    blockId: id,
    initialStartMin: startMin,
    initialEndMin: endMin,
    dayStartMin,
    dayEndMin,
    onDragEnd,
  });

  // 드래그 중에는 현재 위치 사용, 아니면 원래 위치
  const displayStartMin = isDragging ? currentStartMin : startMin;
  const displayEndMin = isDragging ? currentEndMin : endMin;

  const top = (displayStartMin - dayStartMin) * PIXELS_PER_MINUTE;
  const height = (displayEndMin - displayStartMin) * PIXELS_PER_MINUTE;

  // 레인 기반 너비/위치 계산
  const laneWidth = 100 / laneCount;
  const left = `${laneIndex * laneWidth}%`;
  const width = `${laneWidth}%`;

  const bgColor = type === 'PLAN'
    ? 'bg-blue-100 border-blue-300'
    : 'bg-green-100 border-green-300';

  const handleClick = (e: React.MouseEvent) => {
    // 드래그 후에는 클릭 이벤트 무시
    if (!isDragging) {
      onClick();
    }
  };

  return (
    <div
      className={`
        absolute border rounded-md px-2 py-1 overflow-hidden
        ${bgColor}
        ${isDragging ? 'opacity-80 shadow-lg z-50 cursor-grabbing' : 'cursor-grab hover:shadow-md'}
        transition-shadow
      `}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        left,
        width,
        backgroundColor: subjectColor ? `${subjectColor}20` : undefined,
        borderColor: subjectColor || undefined,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <div className="text-xs font-medium truncate">{title}</div>
      {note && height > 40 && (
        <div className="text-xs text-gray-500 truncate">{note}</div>
      )}
    </div>
  );
}
```

### 4.4 BlockColumn 수정

```typescript
// src/components/planner/Timeline/BlockColumn.tsx
// TimeBlock에 onDragEnd와 dayEndMin props 전달

<TimeBlock
  key={block.id}
  id={block.id}
  type={block.type}
  title={block.title}
  note={block.note}
  startMin={block.startMin}
  endMin={block.endMin}
  dayStartMin={dayStartMin}
  dayEndMin={dayEndMin}  // 추가
  laneIndex={block.laneIndex}
  laneCount={block.laneCount}
  subjectColor={block.subjectColor}
  onClick={() => onBlockClick(block)}
  onDragEnd={onDragEnd}  // 추가
/>
```

### 4.5 Timeline 컴포넌트 수정

```typescript
// src/components/planner/Timeline/Timeline.tsx
// onDragEnd 핸들러 추가 및 BlockColumn에 전달

interface TimelineProps {
  blocks: Block[];
  subjects: Subject[];
  dayStartMin: number;
  dayEndMin: number;
  onBlockClick: (block: Block) => void;
  onAddBlock: (type: BlockType) => void;
  onDragEnd: (blockId: string, newStartMin: number, newEndMin: number) => Promise<void>;  // 추가
}

// BlockColumn에 전달
<BlockColumn
  type="PLAN"
  blocks={planBlocks}
  subjects={subjects}
  dayStartMin={dayStartMin}
  dayEndMin={dayEndMin}
  onBlockClick={onBlockClick}
  onAddBlock={() => onAddBlock('PLAN')}
  onDragEnd={onDragEnd}  // 추가
/>
```

### 4.6 page.tsx 수정

```typescript
// src/app/page.tsx
// handleDragEnd 핸들러 추가

const handleDragEnd = async (blockId: string, newStartMin: number, newEndMin: number) => {
  await updateBlock(blockId, {
    start_min: newStartMin,
    end_min: newEndMin,
  });
};

// Timeline에 전달
<Timeline
  blocks={blocks}
  subjects={subjects}
  dayStartMin={dayStartMin}
  dayEndMin={dayEndMin}
  onBlockClick={(block) => openFormModal(block.type, block)}
  onAddBlock={(type) => openFormModal(type)}
  onDragEnd={handleDragEnd}  // 추가
/>
```

## 5. 구현 순서

### Phase 1: 기본 드래그 기능
1. `useDragBlock` 훅 생성
2. `TimeBlock` 컴포넌트에 드래그 기능 추가
3. Props 체인 연결 (Timeline → BlockColumn → TimeBlock)
4. `page.tsx`에서 `handleDragEnd` 핸들러 구현

### Phase 2: UX 개선
1. 드래그 중 시각적 피드백 (그림자, 투명도)
2. 15분 그리드 스냅 가이드라인 표시
3. 경계 도달 시 시각적 표시

### Phase 3: 추가 기능 (선택)
1. 리사이즈 기능 (상단/하단 가장자리 드래그)
2. 터치 디바이스 지원
3. 키보드 접근성

## 6. 테스트 시나리오

### 6.1 기본 기능
- [ ] 블록을 위/아래로 드래그하여 이동
- [ ] 드래그 종료 시 API 호출 확인
- [ ] 15분 단위로 스냅되는지 확인

### 6.2 경계 처리
- [ ] dayStartMin 이전으로 이동 불가
- [ ] dayEndMin 이후로 이동 불가
- [ ] 블록 길이 유지되는지 확인

### 6.3 상호작용
- [ ] 드래그 후 클릭 이벤트 차단
- [ ] 다른 블록과 겹침 시 레이아웃 유지
- [ ] 드래그 취소 (ESC 키) 처리

### 6.4 에러 처리
- [ ] API 실패 시 원래 위치로 롤백
- [ ] 네트워크 오류 시 Toast 알림

## 7. 주의사항

1. **성능**: 드래그 중 과도한 리렌더링 방지 (useRef 활용)
2. **접근성**: 키보드로도 시간 변경 가능하도록 고려
3. **모바일**: 터치 이벤트는 별도 구현 필요 (touchstart, touchmove, touchend)
4. **충돌 처리**: 겹치는 블록 레이아웃은 기존 `useOverlapLayout` 훅이 처리

## 8. 예상 소요 파일 수정

| 파일 | 작업 |
|------|------|
| `src/hooks/useDragBlock.ts` | 새로 생성 |
| `src/components/planner/Timeline/TimeBlock.tsx` | 수정 |
| `src/components/planner/Timeline/BlockColumn.tsx` | 수정 (props 전달) |
| `src/components/planner/Timeline/Timeline.tsx` | 수정 (props 전달) |
| `src/app/page.tsx` | 수정 (핸들러 추가) |
