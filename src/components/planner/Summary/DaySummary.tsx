'use client';

import { minutesToHours } from '@/lib/utils/time';

interface DaySummaryProps {
  planTotalMin: number;
  executionTotalMin: number;
}

export function DaySummary({ planTotalMin, executionTotalMin }: DaySummaryProps) {
  const achievementRate = planTotalMin > 0
    ? Math.round((executionTotalMin / planTotalMin) * 100)
    : 0;

  return (
    <div className="flex items-center gap-6 px-4 py-3 bg-gray-50 border-b">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded bg-blue-500" />
        <span className="text-sm text-gray-600">계획</span>
        <span className="font-semibold text-gray-900">
          {minutesToHours(planTotalMin)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded bg-emerald-500" />
        <span className="text-sm text-gray-600">실행</span>
        <span className="font-semibold text-gray-900">
          {minutesToHours(executionTotalMin)}
        </span>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <span className="text-sm text-gray-600">달성률</span>
        <span className={`font-semibold ${achievementRate >= 100 ? 'text-emerald-600' : achievementRate >= 70 ? 'text-blue-600' : 'text-gray-900'}`}>
          {achievementRate}%
        </span>
      </div>
    </div>
  );
}
