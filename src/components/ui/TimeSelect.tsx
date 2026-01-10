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
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm
          text-black bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
