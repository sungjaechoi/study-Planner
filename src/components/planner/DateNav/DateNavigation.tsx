'use client';

import { format, addDays, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Button } from '@/components/ui/Button';

interface DateNavigationProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onSettingsClick?: () => void;
}

export function DateNavigation({ selectedDate, onDateChange, onSettingsClick }: DateNavigationProps) {
  const goToPreviousDay = () => onDateChange(subDays(selectedDate, 1));
  const goToNextDay = () => onDateChange(addDays(selectedDate, 1));
  const goToToday = () => onDateChange(new Date());

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={goToPreviousDay}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>

        <div className="text-center min-w-[180px]">
          <div className="text-lg font-semibold text-gray-900">
            {format(selectedDate, 'yyyy년 M월 d일', { locale: ko })}
          </div>
          <div className="text-sm text-gray-500">
            {format(selectedDate, 'EEEE', { locale: ko })}
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={goToNextDay}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={isToday ? 'secondary' : 'primary'}
          size="sm"
          onClick={goToToday}
          disabled={isToday}
        >
          오늘
        </Button>

        {onSettingsClick && (
          <Button variant="ghost" size="sm" onClick={onSettingsClick} aria-label="설정">
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
          </Button>
        )}
      </div>
    </div>
  );
}
