'use client';

import type { BlockType } from '@/types';

interface AllDayBlock {
  id: string;
  type: BlockType;
  title: string;
  subject_id: string | null;
}

interface Subject {
  id: string;
  name: string;
  color_hex: string;
}

interface AllDayAreaProps {
  blocks: AllDayBlock[];
  subjects: Subject[];
  onBlockClick: (block: AllDayBlock) => void;
}

export function AllDayArea({ blocks, subjects, onBlockClick }: AllDayAreaProps) {
  if (blocks.length === 0) return null;

  const getSubjectColor = (subjectId: string | null) => {
    if (!subjectId) return '#6B7280';
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.color_hex || '#6B7280';
  };

  return (
    <div className="px-4 py-2 bg-gray-50 border-b">
      <div className="text-xs text-gray-500 mb-2">종일</div>
      <div className="flex flex-wrap gap-2">
        {blocks.map((block) => (
          <button
            key={block.id}
            onClick={() => onBlockClick(block)}
            className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${block.type === 'PLAN' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}
              hover:opacity-80 transition-opacity
            `}
            style={{
              borderLeft: `3px solid ${getSubjectColor(block.subject_id)}`
            }}
          >
            {block.title}
          </button>
        ))}
      </div>
    </div>
  );
}
