// Type definitions for Study Planner Timeline

export type BlockType = 'PLAN' | 'EXECUTION';

export interface User {
  id: string;
  name: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlannerSettings {
  id: string;
  userId: string;
  gridMinutes: number;
  dayStartMin: number;
  dayEndMin: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  colorHex: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeBlock {
  id: string;
  userId: string;
  subjectId: string | null;
  date: string;
  type: BlockType;
  isAllDay: boolean;
  startMin: number | null;
  endMin: number | null;
  title: string;
  note: string | null;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface DayPlannerResponse {
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
    type: BlockType;
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

export interface CreateBlockRequest {
  date: string;
  type: BlockType;
  title: string;
  note?: string;
  subject_id?: string;
  is_all_day: boolean;
  start_min?: number;
  end_min?: number;
}

export interface UpdateBlockRequest {
  title?: string;
  note?: string | null;
  subject_id?: string | null;
  is_all_day?: boolean;
  start_min?: number | null;
  end_min?: number | null;
}

export interface CreateBlockResponse {
  id: string;
  date: string;
  type: BlockType;
  title: string;
  note: string | null;
  subject_id: string | null;
  is_all_day: boolean;
  start_min: number | null;
  end_min: number | null;
  display_order: number;
  created_at: string;
}

export interface DeleteBlockResponse {
  success: boolean;
  deleted_id: string;
}

export interface APIError {
  error: {
    code: string;
    message: string;
    details?: Array<{
      field?: string;
      message: string;
    }>;
  };
}

export interface UpdateSettingsRequest {
  grid_minutes?: number;
  day_start_min?: number;
  day_end_min?: number;
}

export interface SettingsResponse {
  id: string;
  grid_minutes: number;
  day_start_min: number;
  day_end_min: number;
  updated_at: string;
}

export interface CreateSubjectRequest {
  name: string;
  color_hex: string;
  sort_order?: number;
}

export interface UpdateSubjectRequest {
  name?: string;
  color_hex?: string;
  sort_order?: number;
  is_active?: boolean;
}
