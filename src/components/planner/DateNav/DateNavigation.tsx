'use client';

import { format, addDays, subDays, isToday as checkIsToday } from 'date-fns';
import { ko } from 'date-fns/locale';

interface DateNavigationProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onSettingsClick?: () => void;
}

export function DateNavigation({ selectedDate, onDateChange, onSettingsClick }: DateNavigationProps) {
  const goToPreviousDay = () => onDateChange(subDays(selectedDate, 1));
  const goToNextDay = () => onDateChange(addDays(selectedDate, 1));
  const goToToday = () => onDateChange(new Date());

  const isToday = checkIsToday(selectedDate);
  const dayOfWeek = format(selectedDate, 'EEEE', { locale: ko });

  return (
    <header className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800" />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Left: Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={goToPreviousDay}
              className="p-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 active:scale-95"
              aria-label="이전 날"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={goToNextDay}
              className="p-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 active:scale-95"
              aria-label="다음 날"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Center: Date Display */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl font-bold text-white tracking-tight">
                {format(selectedDate, 'd')}
              </span>
              <div className="text-left">
                <div className="text-sm font-medium text-white/90">
                  {format(selectedDate, 'yyyy년 M월', { locale: ko })}
                </div>
                <div className="text-xs text-white/60 font-medium">
                  {dayOfWeek}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              disabled={isToday}
              className={`
                px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95
                ${isToday
                  ? 'bg-white/10 text-white/40 cursor-not-allowed'
                  : 'bg-white text-indigo-700 hover:bg-white/90 shadow-lg shadow-black/10'
                }
              `}
            >
              오늘
            </button>

            {onSettingsClick && (
              <button
                onClick={onSettingsClick}
                className="p-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 active:scale-95"
                aria-label="설정"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
