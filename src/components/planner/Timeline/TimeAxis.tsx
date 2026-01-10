'use client';

import { minutesToTime } from '@/lib/utils/time';
import { HOUR_HEIGHT } from '@/lib/constants';

interface TimeAxisProps {
  dayStartMin: number;
  dayEndMin: number;
}

export function TimeAxis({ dayStartMin, dayEndMin }: TimeAxisProps) {
  const hours: number[] = [];
  const startHour = Math.floor(dayStartMin / 60);
  const endHour = Math.ceil(dayEndMin / 60);

  for (let h = startHour; h <= endHour; h++) {
    hours.push(h);
  }

  return (
    <div className="w-16 flex-shrink-0 border-r bg-gray-50">
      {hours.map((hour, index) => (
        <div
          key={hour}
          className="relative"
          style={{ height: index === hours.length - 1 ? 0 : HOUR_HEIGHT }}
        >
          <span className="absolute -top-2 left-2 text-xs text-gray-500">
            {minutesToTime(hour * 60)}
          </span>
        </div>
      ))}
    </div>
  );
}
