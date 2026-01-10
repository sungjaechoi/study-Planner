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
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        value={currentHour}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black placeholder:text-gray-300"
      >
        {hours.map((hour) => (
          <option key={hour} value={hour}>
            {formatHour(hour)}
          </option>
        ))}
      </select>
    </div>
  );
}
