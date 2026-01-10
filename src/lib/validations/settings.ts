import { z } from 'zod';

export const updateSettingsSchema = z.object({
  grid_minutes: z.union([z.literal(15), z.literal(30), z.literal(60)]).optional(),
  day_start_min: z.number().int().min(0).max(1439).optional(),
  day_end_min: z.number().int().min(1).max(1440).optional(),
}).refine(
  (data) => {
    if (data.day_start_min !== undefined && data.day_end_min !== undefined) {
      return data.day_start_min < data.day_end_min;
    }
    return true;
  },
  { message: 'day_start_min must be less than day_end_min', path: ['day_range'] }
);

export const createSubjectSchema = z.object({
  name: z.string().min(1, 'name is required').max(100),
  color_hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'color_hex must be in #RRGGBB format'),
  sort_order: z.number().int().min(0).optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
