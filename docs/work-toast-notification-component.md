# 작업 가이드: 토스트 알림 컴포넌트 구현

## 작업 개요

| 항목 | 내용 |
|------|------|
| **작업 유형** | 기능 구현 |
| **우선순위** | 중간 |
| **관련 설계** | [design-toast-notification-component.md](./design-toast-notification-component.md) |
| **작성일** | 2026-01-11 |

---

## 작업 범위

### Phase 1: 토스트 인프라 구축
- 타입 정의
- toastStore 생성
- Toast, ToastContainer 컴포넌트 생성

### Phase 2: 전역 적용
- layout.tsx에 ToastContainer 등록
- plannerStore에서 error 상태 제거 및 toast 적용

### Phase 3: 컴포넌트 마이그레이션
- page.tsx 인라인 에러 제거
- BlockFormModal 에러 처리 변경
- SettingsModal 에러 처리 변경

---

## Phase 1: 토스트 인프라 구축

### Task 1-1: 타입 정의

**파일**: `src/types/toast.ts` (신규)

```typescript
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface ToastOptions {
  type: ToastType;
  message: string;
  duration?: number;
}
```

---

### Task 1-2: toastStore 생성

**파일**: `src/stores/toastStore.ts` (신규)

```typescript
'use client';

import { create } from 'zustand';
import type { Toast, ToastOptions } from '@/types/toast';

interface ToastState {
  toasts: Toast[];
  addToast: (options: ToastOptions) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: (options: ToastOptions) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const toast: Toast = {
      id,
      type: options.type,
      message: options.message,
      duration: options.duration ?? 3000,
    };

    set((state) => {
      const newToasts = [...state.toasts, toast];
      // 최대 5개 제한
      if (newToasts.length > 5) {
        return { toasts: newToasts.slice(-5) };
      }
      return { toasts: newToasts };
    });

    return id;
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  clearToasts: () => {
    set({ toasts: [] });
  },
}));

// 편의 함수
export const toast = {
  success: (message: string, duration?: number) =>
    useToastStore.getState().addToast({ type: 'success', message, duration }),
  error: (message: string, duration?: number) =>
    useToastStore.getState().addToast({ type: 'error', message, duration }),
  warning: (message: string, duration?: number) =>
    useToastStore.getState().addToast({ type: 'warning', message, duration }),
  info: (message: string, duration?: number) =>
    useToastStore.getState().addToast({ type: 'info', message, duration }),
};
```

---

### Task 1-3: Toast 컴포넌트 생성

**파일**: `src/components/ui/Toast/Toast.tsx` (신규)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useToastStore } from '@/stores/toastStore';
import type { Toast as ToastType } from '@/types/toast';

const TOAST_STYLES = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

interface ToastProps extends ToastType {}

export function Toast({ id, type, message, duration = 3000 }: ToastProps) {
  const { removeToast } = useToastStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const styles = TOAST_STYLES[type];

  useEffect(() => {
    // 진입 애니메이션
    const enterTimer = setTimeout(() => setIsVisible(true), 10);

    // 자동 닫기
    const exitTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => removeToast(id), 300);
  };

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg
        min-w-[300px] max-w-[400px]
        transition-all duration-300 ease-out
        ${styles.bg} ${styles.border} ${styles.text}
        ${isVisible && !isLeaving ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <span className="flex-shrink-0">{styles.icon}</span>

      {/* Message */}
      <p className="text-sm flex-1">{message}</p>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 hover:opacity-70 transition-opacity"
        aria-label="닫기"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
```

---

### Task 1-4: ToastContainer 컴포넌트 생성

**파일**: `src/components/ui/Toast/ToastContainer.tsx` (신규)

```typescript
'use client';

import { useToastStore } from '@/stores/toastStore';
import { Toast } from './Toast';

export function ToastContainer() {
  const { toasts } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} />
        </div>
      ))}
    </div>
  );
}
```

---

### Task 1-5: Export 설정

**파일**: `src/components/ui/Toast/index.ts` (신규)

```typescript
export { Toast } from './Toast';
export { ToastContainer } from './ToastContainer';
```

---

## Phase 2: 전역 적용

### Task 2-1: layout.tsx에 ToastContainer 등록

**파일**: `src/app/layout.tsx`

**변경 내용**:

```tsx
import { ToastContainer } from '@/components/ui/Toast';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
```

---

### Task 2-2: plannerStore 수정

**파일**: `src/stores/plannerStore.ts`

#### 2-2-1. Import 추가

```typescript
import { toast } from './toastStore';
```

#### 2-2-2. error 상태 제거

**변경 전**:
```typescript
interface PlannerState {
  // ...
  error: string | null;
  // ...
}

// 초기 상태
error: null,
```

**변경 후**:
```typescript
interface PlannerState {
  // ...
  // error 제거
  // ...
}

// 초기 상태에서 error 제거
```

#### 2-2-3. 각 액션에서 toast 사용

**fetchDayData**:
```typescript
// 변경 전
catch (err) {
  set({
    error: err instanceof Error ? err.message : 'Failed to fetch data',
    isLoading: false
  });
}

// 변경 후
catch (err) {
  toast.error(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다');
  set({ isLoading: false });
}
```

**createBlock**:
```typescript
// 변경 전
try {
  await api.createBlock(data);
  await get().fetchDayData();
  set({ isFormModalOpen: false, editingBlock: null });
} catch (err) {
  set({ error: err instanceof Error ? err.message : 'Failed to create block' });
  throw err;
}

// 변경 후
try {
  await api.createBlock(data);
  await get().fetchDayData();
  set({ isFormModalOpen: false, editingBlock: null });
  toast.success('블록이 생성되었습니다');
} catch (err) {
  toast.error(err instanceof Error ? err.message : '블록 생성에 실패했습니다');
  throw err;
}
```

**updateBlock**:
```typescript
// 변경 후
try {
  await api.updateBlock(id, data);
  await get().fetchDayData();
  set({ isFormModalOpen: false, editingBlock: null });
  toast.success('블록이 수정되었습니다');
} catch (err) {
  toast.error(err instanceof Error ? err.message : '블록 수정에 실패했습니다');
  throw err;
}
```

**deleteBlock**:
```typescript
// 변경 후
try {
  await api.deleteBlock(id);
  await get().fetchDayData();
  set({ isFormModalOpen: false, editingBlock: null });
  toast.success('블록이 삭제되었습니다');
} catch (err) {
  toast.error(err instanceof Error ? err.message : '블록 삭제에 실패했습니다');
  throw err;
}
```

**updateSettings**:
```typescript
// 변경 후
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
  await get().fetchDayData();
  toast.success('설정이 저장되었습니다');
} catch (err) {
  toast.error(err instanceof Error ? err.message : '설정 저장에 실패했습니다');
  throw err;
}
```

---

## Phase 3: 컴포넌트 마이그레이션

### Task 3-1: page.tsx 인라인 에러 제거

**파일**: `src/app/page.tsx`

**제거할 코드**:
```tsx
// Store에서 error 제거
const {
  // ...
  error,  // 제거
  // ...
} = usePlannerStore();

// 인라인 에러 표시 제거
{/* Error Display */}
{error && (
  <div className="px-4 py-2 bg-red-50 text-red-600 text-sm">
    {error}
  </div>
)}
```

---

### Task 3-2: BlockFormModal 에러 처리 변경

**파일**: `src/components/planner/BlockForm/BlockFormModal.tsx`

#### 3-2-1. Import 추가

```typescript
import { toast } from '@/stores/toastStore';
```

#### 3-2-2. 로컬 error 상태 유지 (폼 검증용)

폼 검증 에러(제목 미입력, 시간 유효성 등)는 로컬 상태로 유지하고,
API 에러만 toast로 처리합니다.

```typescript
// handleSubmit 내 catch 블록
catch (err) {
  // 로컬 에러 표시 제거, toast로 대체
  toast.error(err instanceof Error ? err.message : '저장에 실패했습니다');
}

// handleDelete 내 catch 블록
catch (err) {
  toast.error(err instanceof Error ? err.message : '삭제에 실패했습니다');
}
```

**참고**: 폼 검증 에러(제목 미입력, 시간 오류)는 인라인 에러로 유지하는 것이 UX상 더 적절합니다.

---

### Task 3-3: SettingsModal 에러 처리 변경

**파일**: `src/components/planner/Settings/SettingsModal.tsx`

```typescript
import { toast } from '@/stores/toastStore';

// handleSave 내 catch 블록
catch {
  toast.error('설정 저장에 실패했습니다');
}
```

---

## 파일 변경 목록

| Phase | 파일 경로 | 변경 유형 |
|-------|----------|----------|
| 1 | `src/types/toast.ts` | 신규 |
| 1 | `src/stores/toastStore.ts` | 신규 |
| 1 | `src/components/ui/Toast/Toast.tsx` | 신규 |
| 1 | `src/components/ui/Toast/ToastContainer.tsx` | 신규 |
| 1 | `src/components/ui/Toast/index.ts` | 신규 |
| 2 | `src/app/layout.tsx` | 수정 |
| 2 | `src/stores/plannerStore.ts` | 수정 |
| 3 | `src/app/page.tsx` | 수정 |
| 3 | `src/components/planner/BlockForm/BlockFormModal.tsx` | 수정 |
| 3 | `src/components/planner/Settings/SettingsModal.tsx` | 수정 |

---

## 검증 체크리스트

### Phase 1 검증

- [ ] toast.success() 호출 시 초록색 토스트 표시
- [ ] toast.error() 호출 시 빨간색 토스트 표시
- [ ] 토스트 자동 닫힘 (3초 후)
- [ ] X 버튼 클릭 시 토스트 닫힘
- [ ] 여러 토스트 동시 표시 가능
- [ ] 진입/퇴장 애니메이션 동작

### Phase 2 검증

- [ ] 블록 생성 성공 시 성공 토스트
- [ ] 블록 수정 성공 시 성공 토스트
- [ ] 블록 삭제 성공 시 성공 토스트
- [ ] 설정 저장 성공 시 성공 토스트
- [ ] API 오류 시 에러 토스트

### Phase 3 검증

- [ ] page.tsx에서 인라인 에러 제거됨
- [ ] 폼 검증 에러는 인라인으로 유지됨
- [ ] 레이아웃 흐름 방해 없음

---

## 테스트 코드 (수동 테스트)

브라우저 콘솔에서 테스트:

```javascript
// 성공 토스트
window.__toastStore?.getState().addToast({ type: 'success', message: '성공!' });

// 에러 토스트
window.__toastStore?.getState().addToast({ type: 'error', message: '에러 발생' });

// 여러 개 동시 테스트
for (let i = 0; i < 5; i++) {
  window.__toastStore?.getState().addToast({
    type: ['success', 'error', 'warning', 'info'][i % 4],
    message: `테스트 메시지 ${i + 1}`
  });
}
```

**참고**: toastStore를 window에 노출하려면 개발 환경에서만 다음 코드 추가:

```typescript
// src/stores/toastStore.ts 맨 아래
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__toastStore = useToastStore;
}
```

---

## 추가 개선 사항 (선택)

### 토스트 위치 설정

```typescript
// toastStore에 position 상태 추가
type ToastPosition = 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';

// ToastContainer에서 위치별 스타일 적용
const POSITION_STYLES = {
  'top-right': 'top-4 right-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};
```

### 진행 바 추가

```tsx
// Toast.tsx에 진행 바 추가
<div className="absolute bottom-0 left-0 right-0 h-1 bg-current/20 rounded-b-lg overflow-hidden">
  <div
    className="h-full bg-current/40"
    style={{
      animation: `shrink ${duration}ms linear forwards`,
    }}
  />
</div>

// CSS 애니메이션
@keyframes shrink {
  from { width: 100%; }
  to { width: 0%; }
}
```
