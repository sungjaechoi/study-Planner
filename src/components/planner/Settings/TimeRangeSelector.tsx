'use client';

interface TimeRangeSelectorProps {
  label: string;
  value: number;
  onChange: (minutes: number) => void;
  minHour: number;
  maxHour: number;
}

export function TimeRangeSelector({
  label,
  value,
  onChange,
  minHour,
  maxHour,
}: TimeRangeSelectorProps) {
  const hours: number[] = [];
  for (let h = minHour; h <= maxHour; h++) {
    hours.push(h);
  }

  const currentHour = Math.floor(value / 60);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedHour = parseInt(e.target.value, 10);
    onChange(selectedHour * 60);
  };

  const formatHour = (hour: number) => {
    const h = hour % 24;
    return `${h.toString().padStart(2, '0')}:00`;
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-stone-700">{label}</label>
      <div className="relative">
        <select
          value={currentHour}
          onChange={handleChange}
          className="
            w-full px-4 py-2.5 border rounded-xl appearance-none
            text-stone-800 bg-stone-50/50 border-stone-200
            focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:bg-white
            transition-all duration-200
          "
        >
          {hours.map((hour) => (
            <option key={hour} value={hour}>
              {formatHour(hour)}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
