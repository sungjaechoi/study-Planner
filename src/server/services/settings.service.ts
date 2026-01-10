import { prisma } from '../db/client';
import { validatePlannerSettings } from '@/lib/utils/validation';
import type { UpdateSettingsRequest } from '@/types';

/**
 * Get user planner settings
 */
export async function getSettings(userId: string) {
  let settings = await prisma.plannerSettings.findUnique({
    where: { userId },
  });

  // Create default settings if not exist
  if (!settings) {
    settings = await prisma.plannerSettings.create({
      data: {
        userId,
        gridMinutes: 15,
        dayStartMin: 360,
        dayEndMin: 1380,
      },
    });
  }

  return {
    id: settings.id,
    grid_minutes: settings.gridMinutes,
    day_start_min: settings.dayStartMin,
    day_end_min: settings.dayEndMin,
  };
}

/**
 * Update user planner settings
 */
export async function updateSettings(
  userId: string,
  data: UpdateSettingsRequest
) {
  // Validate settings
  validatePlannerSettings({
    gridMinutes: data.grid_minutes,
    dayStartMin: data.day_start_min,
    dayEndMin: data.day_end_min,
  });

  // Get or create settings
  let settings = await prisma.plannerSettings.findUnique({
    where: { userId },
  });

  if (!settings) {
    settings = await prisma.plannerSettings.create({
      data: {
        userId,
        gridMinutes: data.grid_minutes ?? 15,
        dayStartMin: data.day_start_min ?? 360,
        dayEndMin: data.day_end_min ?? 1380,
      },
    });
  } else {
    settings = await prisma.plannerSettings.update({
      where: { userId },
      data: {
        gridMinutes: data.grid_minutes,
        dayStartMin: data.day_start_min,
        dayEndMin: data.day_end_min,
      },
    });
  }

  return {
    id: settings.id,
    grid_minutes: settings.gridMinutes,
    day_start_min: settings.dayStartMin,
    day_end_min: settings.dayEndMin,
    updated_at: settings.updatedAt.toISOString(),
  };
}
