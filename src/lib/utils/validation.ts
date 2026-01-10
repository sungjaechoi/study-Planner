import { isValid15MinIncrement, isValidTimeRange } from './time';

/**
 * Validation error class
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validate time block data
 */
export function validateTimeBlock(data: {
  isAllDay: boolean;
  startMin?: number | null;
  endMin?: number | null;
  dayStartMin?: number;
  dayEndMin?: number;
}): void {
  const { isAllDay, startMin, endMin, dayStartMin, dayEndMin } = data;

  if (!isAllDay) {
    // Non-all-day blocks require start and end times
    if (startMin === undefined || startMin === null || endMin === undefined || endMin === null) {
      throw new ValidationError(
        '종일 일정이 아닌 경우 시작 시간과 종료 시간을 입력해주세요',
        'time',
        'MISSING_TIME'
      );
    }

    // Validate 15-minute increments
    if (!isValid15MinIncrement(startMin)) {
      throw new ValidationError(
        '시작 시간은 15분 단위로 입력해주세요',
        'start_min',
        'NOT_15MIN_INCREMENT'
      );
    }

    if (!isValid15MinIncrement(endMin)) {
      throw new ValidationError(
        '종료 시간은 15분 단위로 입력해주세요',
        'end_min',
        'NOT_15MIN_INCREMENT'
      );
    }

    // Validate time range
    if (!isValidTimeRange(startMin, endMin)) {
      throw new ValidationError(
        '시작 시간은 종료 시간보다 이전이어야 합니다',
        'time',
        'TIME_RANGE_ERROR'
      );
    }

    // Validate against day range if provided
    if (dayStartMin !== undefined && dayEndMin !== undefined) {
      if (startMin < dayStartMin || endMin > dayEndMin) {
        throw new ValidationError(
          `시간은 설정된 하루 범위 내에 있어야 합니다 (${dayStartMin}-${dayEndMin})`,
          'time',
          'OUT_OF_DAY_RANGE'
        );
      }
    }
  }
}

/**
 * Validate planner settings
 */
export function validatePlannerSettings(data: {
  gridMinutes?: number;
  dayStartMin?: number;
  dayEndMin?: number;
}): void {
  const { gridMinutes, dayStartMin, dayEndMin } = data;

  if (gridMinutes !== undefined && gridMinutes !== 15) {
    throw new ValidationError(
      '그리드 단위는 15분이어야 합니다',
      'grid_minutes',
      'INVALID_GRID_MINUTES'
    );
  }

  if (dayStartMin !== undefined && dayEndMin !== undefined) {
    if (dayStartMin < 0 || dayStartMin >= dayEndMin || dayEndMin > 1440) {
      throw new ValidationError(
        '하루 시작 시간은 종료 시간보다 이전이어야 하며, 0-1440 범위 내에 있어야 합니다',
        'day_range',
        'INVALID_DAY_RANGE'
      );
    }
  }
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function validateDateFormat(date: string): void {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    throw new ValidationError(
      '날짜는 YYYY-MM-DD 형식이어야 합니다',
      'date',
      'INVALID_DATE'
    );
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new ValidationError(
      '유효하지 않은 날짜입니다',
      'date',
      'INVALID_DATE'
    );
  }
}
