import { prisma } from '../db/client';
import { validateDateFormat } from '@/lib/utils/validation';
import type { DayPlannerResponse, BlockType } from '@/types';

/**
 * Get daily planner data including settings, subjects, blocks, and summary
 */
export async function getDayData(
  userId: string,
  date: string
): Promise<DayPlannerResponse> {
  // Validate date format
  validateDateFormat(date);

  // Fetch settings
  let settings = await prisma.plannerSettings.findUnique({
    where: { userId },
  });

  // Create default settings if not exist
  if (!settings) {
    settings = await prisma.plannerSettings.create({
      data: {
        userId,
        gridMinutes: 15,
        dayStartMin: 360, // 6:00 AM
        dayEndMin: 1380, // 11:00 PM
      },
    });
  }

  // Fetch subjects
  const subjects = await prisma.subject.findMany({
    where: { userId, isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  // Fetch blocks for the date
  const blocks = await prisma.timeBlock.findMany({
    where: {
      userId,
      date,
    },
    orderBy: [
      { type: 'asc' },
      { startMin: 'asc' },
      { displayOrder: 'asc' },
    ],
  });

  // Calculate summary
  const summary = calculateSummary(blocks);

  // Transform to API response format
  return {
    date,
    settings: {
      grid_minutes: settings.gridMinutes,
      day_start_min: settings.dayStartMin,
      day_end_min: settings.dayEndMin,
    },
    subjects: subjects.map((s) => ({
      id: s.id,
      name: s.name,
      color_hex: s.colorHex,
      sort_order: s.sortOrder,
      is_active: s.isActive,
    })),
    blocks: blocks.map((b) => ({
      id: b.id,
      type: b.type as BlockType,
      is_all_day: b.isAllDay,
      start_min: b.startMin,
      end_min: b.endMin,
      title: b.title,
      note: b.note,
      subject_id: b.subjectId,
      display_order: b.displayOrder,
    })),
    summary,
  };
}

/**
 * Calculate daily summary (total plan and execution time)
 */
export function calculateSummary(blocks: { type: string; isAllDay: boolean; startMin: number | null; endMin: number | null }[]): {
  plan_total_min: number;
  execution_total_min: number;
} {
  let planTotalMin = 0;
  let executionTotalMin = 0;

  for (const block of blocks) {
    // Skip all-day blocks
    if (block.isAllDay || block.startMin === null || block.endMin === null) {
      continue;
    }

    const duration = block.endMin - block.startMin;

    if (block.type === 'PLAN') {
      planTotalMin += duration;
    } else if (block.type === 'EXECUTION') {
      executionTotalMin += duration;
    }
  }

  return {
    plan_total_min: planTotalMin,
    execution_total_min: executionTotalMin,
  };
}

/**
 * Get summary for a date range
 */
export async function getSummary(
  userId: string,
  from: string,
  to: string
) {
  validateDateFormat(from);
  validateDateFormat(to);

  // Fetch all blocks in the date range
  const blocks = await prisma.timeBlock.findMany({
    where: {
      userId,
      date: {
        gte: from,
        lte: to,
      },
    },
    include: {
      subject: true,
    },
  });

  // Group by date
  const dailySummaries: Map<string, { plan_total_min: number; execution_total_min: number }> = new Map();
  const subjectSummaries: Map<string, { subject_id: string; subject_name: string; plan_total_min: number; execution_total_min: number }> = new Map();

  let totalPlan = 0;
  let totalExecution = 0;

  for (const block of blocks) {
    if (block.isAllDay || block.startMin === null || block.endMin === null) {
      continue;
    }

    const duration = block.endMin - block.startMin;

    // Daily summary
    if (!dailySummaries.has(block.date)) {
      dailySummaries.set(block.date, { plan_total_min: 0, execution_total_min: 0 });
    }
    const daily = dailySummaries.get(block.date)!;

    // Subject summary
    const subjectId = block.subjectId || 'no-subject';
    const subjectName = block.subject?.name || 'No Subject';
    if (!subjectSummaries.has(subjectId)) {
      subjectSummaries.set(subjectId, { subject_id: subjectId, subject_name: subjectName, plan_total_min: 0, execution_total_min: 0 });
    }
    const subject = subjectSummaries.get(subjectId)!;

    if (block.type === 'PLAN') {
      daily.plan_total_min += duration;
      subject.plan_total_min += duration;
      totalPlan += duration;
    } else {
      daily.execution_total_min += duration;
      subject.execution_total_min += duration;
      totalExecution += duration;
    }
  }

  const achievementRate = totalPlan > 0 ? (totalExecution / totalPlan) * 100 : 0;

  return {
    from,
    to,
    daily_summaries: Array.from(dailySummaries.entries())
      .map(([date, summary]) => ({ date, ...summary }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    subject_summaries: Array.from(subjectSummaries.values()),
    totals: {
      plan_total_min: totalPlan,
      execution_total_min: totalExecution,
      achievement_rate: Math.round(achievementRate * 10) / 10,
    },
  };
}
