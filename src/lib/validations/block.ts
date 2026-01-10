import { z } from 'zod';

export const createBlockSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜는 YYYY-MM-DD 형식이어야 합니다'),
  type: z.enum(['PLAN', 'EXECUTION']),
  title: z.string().min(1, '제목을 입력해주세요').max(200, '제목은 200자 이내로 입력해주세요'),
  note: z.string().max(1000, '메모는 1000자 이내로 입력해주세요').optional(),
  subject_id: z.string().uuid('올바른 과목을 선택해주세요').optional(),
  is_all_day: z.boolean(),
  start_min: z.number().int().min(0).max(1440).optional(),
  end_min: z.number().int().min(0).max(1440).optional(),
}).refine(
  (data) => {
    if (!data.is_all_day) {
      return data.start_min !== undefined && data.end_min !== undefined;
    }
    return true;
  },
  { message: '종일 일정이 아닌 경우 시작 시간과 종료 시간을 입력해주세요', path: ['start_min'] }
).refine(
  (data) => {
    if (!data.is_all_day && data.start_min !== undefined && data.end_min !== undefined) {
      return data.start_min < data.end_min;
    }
    return true;
  },
  { message: '시작 시간은 종료 시간보다 이전이어야 합니다', path: ['time_range'] }
);

export const updateBlockSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  note: z.string().max(1000).nullable().optional(),
  subject_id: z.string().uuid().nullable().optional(),
  is_all_day: z.boolean().optional(),
  start_min: z.number().int().min(0).max(1440).nullable().optional(),
  end_min: z.number().int().min(0).max(1440).nullable().optional(),
});

export type CreateBlockInput = z.infer<typeof createBlockSchema>;
export type UpdateBlockInput = z.infer<typeof updateBlockSchema>;
