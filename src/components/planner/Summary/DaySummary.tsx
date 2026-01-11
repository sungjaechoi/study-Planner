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

  const getAchievementColor = () => {
    if (achievementRate >= 100) return 'text-emerald-600';
    if (achievementRate >= 70) return 'text-indigo-600';
    if (achievementRate >= 50) return 'text-amber-600';
    return 'text-stone-500';
  };

  const getProgressWidth = () => {
    return Math.min(achievementRate, 100);
  };

  return (
    <div className="px-4 py-4 bg-white border-b border-stone-100">
      <div className="flex items-center gap-8">
        {/* Plan Stats */}
        <div className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-shadow">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-stone-400 uppercase tracking-wider">계획</div>
            <div className="text-lg font-bold text-stone-800">
              {minutesToHours(planTotalMin)}
            </div>
          </div>
        </div>

        {/* Execution Stats */}
        <div className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/30 transition-shadow">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-stone-400 uppercase tracking-wider">실행</div>
            <div className="text-lg font-bold text-stone-800">
              {minutesToHours(executionTotalMin)}
            </div>
          </div>
        </div>

        {/* Achievement Rate */}
        <div className="ml-auto flex items-center gap-4">
          <div className="w-32">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">달성률</span>
              <span className={`text-sm font-bold ${getAchievementColor()}`}>
                {achievementRate}%
              </span>
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  achievementRate >= 100
                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                    : achievementRate >= 70
                    ? 'bg-gradient-to-r from-indigo-400 to-indigo-500'
                    : achievementRate >= 50
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                    : 'bg-gradient-to-r from-stone-300 to-stone-400'
                }`}
                style={{ width: `${getProgressWidth()}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
