'use client';

import { HOUR_HEIGHT, GRID_MINUTES } from '@/lib/constants';

interface TimeGridProps {
  dayStartMin: number;
  dayEndMin: number;
}

export function TimeGrid({ dayStartMin, dayEndMin }: TimeGridProps) {
  const totalMinutes = dayEndMin - dayStartMin;
  const totalHours = totalMinutes / 60;
  const gridLines: number[] = [];

  for (let m = 0; m <= totalMinutes; m += GRID_MINUTES) {
    gridLines.push(m);
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ height: totalHours * HOUR_HEIGHT }}
    >
      {gridLines.map((minutes) => {
        const isHourLine = minutes % 60 === 0;
        const isHalfHourLine = minutes % 30 === 0 && !isHourLine;
        const top = (minutes / 60) * HOUR_HEIGHT;

        return (
          <div
            key={minutes}
            className={`absolute left-0 right-0 border-t ${
              isHourLine
                ? 'border-stone-200'
                : isHalfHourLine
                ? 'border-stone-100'
                : 'border-stone-50'
            }`}
            style={{ top }}
          />
        );
      })}
    </div>
  );
}
