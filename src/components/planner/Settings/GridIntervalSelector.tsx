'use client';

interface GridIntervalSelectorProps {
  value: number;
  onChange: (minutes: number) => void;
}

const GRID_OPTIONS = [
  { value: 15, label: '15분', description: '더 세밀하게' },
  { value: 30, label: '30분', description: '균형 잡힌' },
  { value: 60, label: '60분', description: '심플하게' },
];

export function GridIntervalSelector({ value, onChange }: GridIntervalSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-stone-700">그리드 간격</label>
      <div className="grid grid-cols-3 gap-2">
        {GRID_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              px-3 py-3 rounded-xl border-2 text-center transition-all duration-200
              ${value === option.value
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-stone-200 bg-stone-50/50 text-stone-600 hover:border-stone-300 hover:bg-stone-100'}
            `}
          >
            <div className="text-sm font-bold">{option.label}</div>
            <div className="text-xs mt-0.5 opacity-70">{option.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
