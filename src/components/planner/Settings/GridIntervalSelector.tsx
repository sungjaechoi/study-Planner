'use client';

interface GridIntervalSelectorProps {
  value: number;
  onChange: (minutes: number) => void;
}

const GRID_OPTIONS = [
  { value: 15, label: '15분' },
  { value: 30, label: '30분' },
  { value: 60, label: '60분' },
];

export function GridIntervalSelector({ value, onChange }: GridIntervalSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(parseInt(e.target.value, 10));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">그리드 간격</label>
      <select
        value={value}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black placeholder:text-gray-300"
      >
        {GRID_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
