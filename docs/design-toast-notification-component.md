# 설계 문서: 토스트 알림 컴포넌트

## 개요

| 항목 | 내용 |
|------|------|
| **문서 유형** | UI 컴포넌트 설계 |
| **작성일** | 2026-01-11 |
| **우선순위** | 중간 |
| **관련 파일** | `page.tsx`, `plannerStore.ts` |

---

## 1. 현재 오류 처리 현황

### 1.1 현재 구조

```
┌─────────────────────────────────────────────────────────────┐
│                    plannerStore.ts                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  error: string | null                               │   │
│  │  set({ error: '...' })  // 오류 발생 시             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      page.tsx                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  {error && (                                        │   │
│  │    <div className="bg-red-50 text-red-600">         │   │
│  │      {error}                                        │   │
│  │    </div>                                           │   │
│  │  )}                                                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 오류 발생 지점

| 파일 | 함수 | 오류 메시지 |
|------|------|-------------|
| `plannerStore.ts` | `fetchDayData` | Failed to fetch data |
| `plannerStore.ts` | `createBlock` | Failed to create block |
| `plannerStore.ts` | `updateBlock` | Failed to update block |
| `plannerStore.ts` | `deleteBlock` | Failed to delete block |
| `plannerStore.ts` | `updateSettings` | Failed to update settings |
| `BlockFormModal.tsx` | `handleSubmit` | 저장에 실패했습니다 |
| `BlockFormModal.tsx` | `handleDelete` | 삭제에 실패했습니다 |
| `SettingsModal.tsx` | `handleSave` | 설정 저장에 실패했습니다 |

### 1.3 현재 방식의 문제점

| 문제 | 설명 |
|------|------|
| 위치 고정 | 오류가 페이지 중간에 표시되어 레이아웃 흐름 방해 |
| 수동 해제 없음 | 사용자가 오류를 닫을 수 없음 |
| 자동 해제 없음 | 오류가 계속 표시됨 |
| 성공 알림 없음 | 성공 시 피드백 부재 |
| 중복 관리 | 각 컴포넌트에서 별도 에러 상태 관리 |

---

## 2. 토스트 컴포넌트 설계

### 2.1 목표

- 전역 상태로 토스트 관리
- 여러 토스트 동시 표시 가능
- 자동 닫기 (타이머)
- 수동 닫기 (X 버튼)
- 다양한 타입 지원 (error, success, warning, info)
- 애니메이션 효과

### 2.2 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    toastStore.ts                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  toasts: Toast[]                                    │   │
│  │  addToast(toast)                                    │   │
│  │  removeToast(id)                                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
          │                              │
          ▼                              ▼
┌──────────────────────┐    ┌──────────────────────────────┐
│    ToastContainer    │    │      어디서든 호출 가능       │
│  ┌────────────────┐  │    │  ┌────────────────────────┐  │
│  │   Toast #1     │  │    │  │  addToast({           │  │
│  │   Toast #2     │  │    │  │    type: 'error',     │  │
│  │   Toast #3     │  │    │  │    message: '...'     │  │
│  └────────────────┘  │    │  │  })                   │  │
└──────────────────────┘    │  └────────────────────────┘  │
                            └──────────────────────────────┘
```

---

## 3. 타입 정의

### 3.1 Toast 인터페이스

```typescript
// src/types/toast.ts

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;  // ms, 기본값 3000
}

export interface ToastOptions {
  type: ToastType;
  message: string;
  duration?: number;
}
```

### 3.2 Store 인터페이스

```typescript
// src/stores/toastStore.ts

interface ToastState {
  toasts: Toast[];
  addToast: (options: ToastOptions) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}
```

---

## 4. 컴포넌트 설계

### 4.1 파일 구조

```
src/
├── components/
│   └── ui/
│       ├── Toast/
│       │   ├── Toast.tsx           # 개별 토스트 컴포넌트
│       │   ├── ToastContainer.tsx  # 토스트 컨테이너
│       │   └── index.ts            # exports
│       └── ...
├── stores/
│   ├── toastStore.ts               # 토스트 상태 관리
│   └── plannerStore.ts
└── types/
    ├── toast.ts                    # 토스트 타입 정의
    └── index.ts
```

### 4.2 ToastContainer 컴포넌트

```tsx
// src/components/ui/Toast/ToastContainer.tsx

'use client';

import { useToastStore } from '@/stores/toastStore';
import { Toast } from './Toast';

export function ToastContainer() {
  const { toasts } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
}
```

### 4.3 Toast 컴포넌트

```tsx
// src/components/ui/Toast/Toast.tsx

'use client';

import { useEffect, useState } from 'react';
import { useToastStore } from '@/stores/toastStore';
import type { Toast as ToastType } from '@/types/toast';

const TOAST_STYLES = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: '✓',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: '✕',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: '⚠',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'ℹ',
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
    requestAnimationFrame(() => setIsVisible(true));

    // 자동 닫기
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => removeToast(id), 300); // 애니메이션 후 제거
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
    >
      {/* Icon */}
      <span className="text-lg flex-shrink-0">{styles.icon}</span>

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

### 4.4 toastStore

```typescript
// src/stores/toastStore.ts

'use client';

import { create } from 'zustand';
import type { Toast, ToastOptions } from '@/types/toast';

interface ToastState {
  toasts: Toast[];
  addToast: (options: ToastOptions) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (options: ToastOptions) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const toast: Toast = {
      id,
      type: options.type,
      message: options.message,
      duration: options.duration ?? 3000,
    };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

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

## 5. UI 디자인

### 5.1 토스트 위치

```
┌─────────────────────────────────────────────────────────────┐
│                                        ┌─────────────────┐  │
│                                        │ ✕ 오류 메시지   │  │
│                                        └─────────────────┘  │
│                                        ┌─────────────────┐  │
│                                        │ ✓ 성공 메시지   │  │
│                                        └─────────────────┘  │
│                                                             │
│                         [메인 콘텐츠]                        │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**위치 옵션:**
- `top-right` (권장) - 우측 상단
- `top-center` - 상단 중앙
- `bottom-right` - 우측 하단
- `bottom-center` - 하단 중앙

### 5.2 토스트 타입별 스타일

| 타입 | 배경색 | 테두리 | 텍스트 | 아이콘 |
|------|--------|--------|--------|--------|
| success | `bg-green-50` | `border-green-200` | `text-green-800` | ✓ |
| error | `bg-red-50` | `border-red-200` | `text-red-800` | ✕ |
| warning | `bg-yellow-50` | `border-yellow-200` | `text-yellow-800` | ⚠ |
| info | `bg-blue-50` | `border-blue-200` | `text-blue-800` | ℹ |

### 5.3 애니메이션

```
진입 애니메이션:
  opacity: 0 → 1
  translateX: 16px → 0

퇴장 애니메이션:
  opacity: 1 → 0
  translateX: 0 → 16px

duration: 300ms
easing: ease-out
```

---

## 6. 사용 방법

### 6.1 ToastContainer 등록

```tsx
// src/app/layout.tsx 또는 page.tsx

import { ToastContainer } from '@/components/ui/Toast';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
```

### 6.2 토스트 호출

**방법 1: toast 헬퍼 함수 사용 (권장)**

```typescript
import { toast } from '@/stores/toastStore';

// 오류 알림
toast.error('블록 생성에 실패했습니다');

// 성공 알림
toast.success('블록이 생성되었습니다');

// 경고 알림
toast.warning('저장되지 않은 변경사항이 있습니다');

// 정보 알림
toast.info('새로운 업데이트가 있습니다');

// 커스텀 duration
toast.error('오류가 발생했습니다', 5000);  // 5초
```

**방법 2: Store 직접 사용**

```typescript
import { useToastStore } from '@/stores/toastStore';

function MyComponent() {
  const { addToast } = useToastStore();

  const handleError = () => {
    addToast({
      type: 'error',
      message: '오류가 발생했습니다',
      duration: 5000,
    });
  };
}
```

### 6.3 plannerStore 통합 예시

```typescript
// src/stores/plannerStore.ts

import { toast } from './toastStore';

// 변경 전
createBlock: async (data: CreateBlockRequest) => {
  try {
    await api.createBlock(data);
    await get().fetchDayData();
    set({ isFormModalOpen: false, editingBlock: null });
  } catch (err) {
    set({ error: err instanceof Error ? err.message : 'Failed to create block' });
    throw err;
  }
},

// 변경 후
createBlock: async (data: CreateBlockRequest) => {
  try {
    await api.createBlock(data);
    await get().fetchDayData();
    set({ isFormModalOpen: false, editingBlock: null });
    toast.success('블록이 생성되었습니다');
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '블록 생성에 실패했습니다');
    throw err;
  }
},
```

---

## 7. 마이그레이션 계획

### 7.1 Phase 1: 토스트 인프라 구축

| 작업 | 파일 |
|------|------|
| 타입 정의 | `src/types/toast.ts` |
| Store 생성 | `src/stores/toastStore.ts` |
| Toast 컴포넌트 | `src/components/ui/Toast/Toast.tsx` |
| ToastContainer | `src/components/ui/Toast/ToastContainer.tsx` |
| Export 설정 | `src/components/ui/Toast/index.ts` |

### 7.2 Phase 2: 전역 적용

| 작업 | 파일 |
|------|------|
| ToastContainer 등록 | `src/app/layout.tsx` |
| error 상태 제거 | `src/stores/plannerStore.ts` |
| 인라인 에러 제거 | `src/app/page.tsx` |

### 7.3 Phase 3: 각 컴포넌트 마이그레이션

| 작업 | 파일 |
|------|------|
| 에러 처리 변경 | `src/stores/plannerStore.ts` |
| 로컬 에러 제거 | `src/components/planner/BlockForm/BlockFormModal.tsx` |
| 로컬 에러 제거 | `src/components/planner/Settings/SettingsModal.tsx` |

---

## 8. 추가 고려 사항

### 8.1 최대 토스트 개수 제한

```typescript
addToast: (options: ToastOptions) => {
  const MAX_TOASTS = 5;

  set((state) => {
    const newToasts = [...state.toasts, toast];
    // 최대 개수 초과 시 오래된 것부터 제거
    if (newToasts.length > MAX_TOASTS) {
      return { toasts: newToasts.slice(-MAX_TOASTS) };
    }
    return { toasts: newToasts };
  });
},
```

### 8.2 중복 메시지 방지

```typescript
addToast: (options: ToastOptions) => {
  const { toasts } = get();

  // 동일 메시지가 이미 있으면 추가하지 않음
  const isDuplicate = toasts.some(
    (t) => t.message === options.message && t.type === options.type
  );

  if (isDuplicate) return;

  // ... 토스트 추가 로직
},
```

### 8.3 Progress Bar (선택)

```tsx
// 자동 닫기 진행률 표시
<div className="absolute bottom-0 left-0 h-1 bg-current opacity-30">
  <div
    className="h-full bg-current transition-all linear"
    style={{
      width: `${progress}%`,
      transitionDuration: `${duration}ms`,
    }}
  />
</div>
```

### 8.4 접근성 (Accessibility)

```tsx
<div
  role="alert"
  aria-live="polite"
  aria-atomic="true"
>
  {message}
</div>
```

---

## 9. 참고 라이브러리

외부 라이브러리 사용 시 대안:

| 라이브러리 | 크기 | 특징 |
|------------|------|------|
| react-hot-toast | ~5KB | 가볍고 커스터마이징 용이 |
| sonner | ~7KB | 모던 디자인, 스택 지원 |
| react-toastify | ~12KB | 기능 풍부, 테마 지원 |

**권장**: 현재 프로젝트 규모에서는 커스텀 구현이 적합 (외부 의존성 최소화)

---

## 10. 예상 결과

### Before

```tsx
{error && (
  <div className="px-4 py-2 bg-red-50 text-red-600 text-sm">
    {error}
  </div>
)}
```

### After

```
┌─────────────────────────────────────────────────────────────┐
│                                     ┌───────────────────┐   │
│                                     │ ✕ 블록 생성 실패  │   │
│                                     │              [X]  │   │
│                                     └───────────────────┘   │
│                                                             │
│                    [메인 콘텐츠 - 레이아웃 방해 없음]         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**개선점:**
- 레이아웃 흐름 유지
- 자동 닫기로 사용자 경험 향상
- 성공/실패 모두 피드백 제공
- 전역 관리로 코드 일관성 확보
