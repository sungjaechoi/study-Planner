# 이슈 보고서: 시간 축 6시 고정 문제

## 개요

| 항목 | 내용 |
|------|------|
| **이슈 유형** | 하드코딩된 기본값 |
| **심각도** | 중간 |
| **영향 범위** | 타임라인 전체 UI |
| **발견일** | 2026-01-11 |

## 문제 설명

시간 축(Time Axis)이 항상 **6시(06:00 AM)**부터 시작하도록 고정되어 있습니다. 이는 `DEFAULT_DAY_START = 360` (360분 = 6시간)이 여러 곳에 하드코딩되어 있기 때문입니다.

---

## 근본 원인 분석

### 1. 하드코딩된 상수 정의

**파일**: `src/lib/constants.ts` (라인 5)

```typescript
export const DEFAULT_DAY_START = 360;  // 6:00 AM (360분 = 6시간)
export const DEFAULT_DAY_END = 1380;   // 11:00 PM (1380분 = 23시간)
```

이 상수가 시간 축의 기본 시작점을 결정합니다.

---

### 2. 영향받는 파일 목록

| 파일 경로 | 라인 | 코드 | 설명 |
|----------|------|------|------|
| `src/lib/constants.ts` | 5 | `DEFAULT_DAY_START = 360` | 전역 상수 정의 |
| `src/server/services/planner.service.ts` | 26-27 | `dayStartMin: 360` | getDayData 함수 기본값 |
| `src/server/services/settings.service.ts` | 19-20 | `dayStartMin: 360` | getSettings 함수 기본값 |
| `src/server/services/settings.service.ts` | 57-58 | `dayStartMin: data.day_start_min ?? 360` | updateSettings 함수 fallback |

---

## 데이터 흐름

```
┌─────────────────────────────────────────────────────────────┐
│                    constants.ts                              │
│              DEFAULT_DAY_START = 360                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ planner       │ │ settings      │ │ app/page.tsx  │
│ .service.ts   │ │ .service.ts   │ │               │
│ dayStartMin:  │ │ dayStartMin:  │ │ dayStartMin = │
│ 360           │ │ 360           │ │ settings ??   │
└───────┬───────┘ └───────┬───────┘ │ DEFAULT_START │
        │                 │         └───────┬───────┘
        └─────────────────┴─────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │    Timeline 컴포넌트   │
              │  (dayStartMin props)  │
              └───────────┬───────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│  TimeAxis.tsx │ │ TimeGrid.tsx  │ │ TimeBlock.tsx │
│  시간 레이블   │ │  그리드 라인   │ │  블록 위치     │
│  렌더링       │ │  렌더링        │ │  계산          │
└───────────────┘ └───────────────┘ └───────────────┘
```

---

## 관련 컴포넌트 상세 분석

### TimeAxis.tsx (`src/components/planner/Timeline/TimeAxis.tsx`)

```typescript
// 라인 11-18
export function TimeAxis({ dayStartMin, dayEndMin }: TimeAxisProps) {
  const hours: number[] = [];
  const startHour = Math.floor(dayStartMin / 60);  // 360/60 = 6시
  const endHour = Math.ceil(dayEndMin / 60);       // 1380/60 = 23시

  for (let h = startHour; h <= endHour; h++) {
    hours.push(h);
  }
  // 6, 7, 8, ... 23 시간 레이블 생성
}
```

**동작**: `dayStartMin`을 60으로 나누어 시작 시간을 계산합니다. 360분이 전달되면 6시부터 시작합니다.

### TimeBlock.tsx (`src/components/planner/Timeline/TimeBlock.tsx`)

```typescript
// 라인 32-33
const top = (startMin - dayStartMin) * PIXELS_PER_MINUTE;
const height = (endMin - startMin) * PIXELS_PER_MINUTE;
```

**동작**: `dayStartMin`을 기준점(0)으로 블록의 Y 위치를 계산합니다.

### TimeGrid.tsx (`src/components/planner/Timeline/TimeGrid.tsx`)

```typescript
// 라인 11-18
const totalMinutes = dayEndMin - dayStartMin;  // 1380 - 360 = 1020분
for (let m = 0; m <= totalMinutes; m += GRID_MINUTES) {
  gridLines.push(m);
}
```

**동작**: 전체 표시 범위를 계산하여 15분 간격의 그리드 라인을 생성합니다.

---

## 서비스 레이어 분석

### planner.service.ts (`src/server/services/planner.service.ts`)

```typescript
// 라인 21-30 (getDayData 함수)
if (!settings) {
  settings = await prisma.plannerSettings.create({
    data: {
      userId,
      gridMinutes: 15,
      dayStartMin: 360,   // 하드코딩
      dayEndMin: 1380,    // 하드코딩
    },
  });
}
```

**문제점**: 설정이 없을 때 기본값으로 360을 사용합니다.

### settings.service.ts (`src/server/services/settings.service.ts`)

```typescript
// 라인 14-23 (getSettings 함수)
if (!settings) {
  settings = await prisma.plannerSettings.create({
    data: {
      userId,
      gridMinutes: 15,
      dayStartMin: 360,   // 하드코딩
      dayEndMin: 1380,    // 하드코딩
    },
  });
}

// 라인 52-59 (updateSettings 함수)
settings = await prisma.plannerSettings.create({
  data: {
    userId,
    gridMinutes: data.grid_minutes ?? 15,
    dayStartMin: data.day_start_min ?? 360,  // 하드코딩 fallback
    dayEndMin: data.day_end_min ?? 1380,     // 하드코딩 fallback
  },
});
```

**문제점**: 설정이 없을 때 기본값으로 360을 사용하며, fallback 값도 360으로 하드코딩되어 있습니다.

---

## 추가 발견 사항

### BlockFormModal 기본값 불일치

**파일**: `src/components/planner/BlockForm/BlockFormModal.tsx` (라인 53-54)

```typescript
const [startTime, setStartTime] = useState('09:00');
const [endTime, setEndTime] = useState('10:00');
```

블록 생성 폼의 기본 시작 시간이 09:00으로 설정되어 있어, 시간 축 시작점(06:00)과 일치하지 않습니다.

---

## 현재 시스템 상태

### 이미 구현된 부분

| 레이어 | 상태 | 파일 |
|--------|------|------|
| DB 스키마 | ✅ 완료 | `prisma/schema.prisma` - PlannerSettings 모델 |
| 백엔드 API | ✅ 완료 | `src/app/api/settings/route.ts` - GET/PATCH |
| 서비스 레이어 | ✅ 완료 | `src/server/services/settings.service.ts` |
| 프론트엔드 Store | ⚠️ 부분 | `src/stores/plannerStore.ts` - 조회만 구현 |
| API 클라이언트 | ✅ 완료 | `src/lib/api.ts` - updateSettings 존재 |
| 설정 UI | ❌ 미구현 | 없음 |

---

## 수정 방안 (권장)

### 방안 1: 상수 값 변경 (최소 수정)

`src/lib/constants.ts`의 `DEFAULT_DAY_START` 값을 원하는 시작 시간으로 변경합니다.

```typescript
// 예: 0시부터 시작하도록 변경
export const DEFAULT_DAY_START = 0;     // 00:00 AM
export const DEFAULT_DAY_END = 1440;    // 24:00 (자정)
```

### 방안 2: 사용자 설정 기능 활성화 (장기)

현재 설정 시스템(`PlannerSettings`)은 존재하지만 사용자가 변경할 UI가 없습니다:

1. 설정 모달 UI 구현
2. Store에 `updateSettings` 액션 추가
3. DateNavigation에 설정 버튼 추가

---

## 영향받는 파일 수정 체크리스트

- [ ] `src/lib/constants.ts` - DEFAULT_DAY_START 값 변경 또는 설정 상수 추가
- [ ] `src/server/services/planner.service.ts` - 상수 참조로 변경
- [ ] `src/server/services/settings.service.ts` - 상수 참조로 변경
- [ ] `src/stores/plannerStore.ts` - updateSettings 액션 추가 (UI 구현 시)
- [ ] `src/components/planner/Settings/SettingsModal.tsx` - 신규 생성 (UI 구현 시)
- [ ] `src/components/planner/BlockForm/BlockFormModal.tsx` - 폼 기본값 조정 (선택사항)

---

## 참고 사항

- 현재 아키텍처는 `dayStartMin`과 `dayEndMin`을 props로 전달받는 구조이므로, 상위에서 값만 변경하면 하위 컴포넌트에 자동으로 반영됩니다.
- 분(minute) 단위 시간 체계: `0` = 00:00, `60` = 01:00, `360` = 06:00, `1440` = 24:00
