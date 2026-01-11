'use client';

import { useMemo } from 'react';
import { minutesToTime } from '@/lib/utils/time';

interface TimeSelectProps {
  label?: string;
  value: number;
  onChange: (minutes: number) => void;
  minTime?: number;
  maxTime?: number;
  interval?: number;
  error?: string;
  disabled?: boolean;
}

export function TimeSelect({
  label,
  value,
  onChange,
  minTime = 0,
  maxTime = 1440,
  interval = 15,
  error,
  disabled = false,
}: TimeSelectProps) {
  const options = useMemo(() => {
    const result: { value: number; label: string }[] = [];
    for (let min = minTime; min < maxTime; min += interval) {
      result.push({
        value: min,
        label: minutesToTime(min),
      });
    }
    return result;
  }, [minTime, maxTime, interval]);

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-stone-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className={`
            block w-full px-4 py-2.5 border rounded-xl appearance-none
            text-stone-800 bg-stone-50/50
            focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:bg-white
            transition-all duration-200
            disabled:bg-stone-100 disabled:cursor-not-allowed disabled:text-stone-500
            ${error ? 'border-red-400 focus:ring-red-500/30 focus:border-red-400' : 'border-stone-200'}
          `}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
