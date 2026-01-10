'use client';

import { PIXELS_PER_MINUTE, BLOCK_COLORS } from '@/lib/constants';
import type { BlockType } from '@/types';

interface TimeBlockProps {
  id: string;
  type: BlockType;
  title: string;
  note: string | null;
  startMin: number;
  endMin: number;
  dayStartMin: number;
  laneIndex: number;
  laneCount: number;
  subjectColor?: string;
  onClick: () => void;
}

export function TimeBlock({
  type,
  title,
  note,
  startMin,
  endMin,
  dayStartMin,
  laneIndex,
  laneCount,
  subjectColor,
  onClick,
}: TimeBlockProps) {
  const top = (startMin - dayStartMin) * PIXELS_PER_MINUTE;
  const height = (endMin - startMin) * PIXELS_PER_MINUTE;
  const width = `${100 / laneCount}%`;
  const left = `${(laneIndex / laneCount) * 100}%`;

  const colors = BLOCK_COLORS[type];
  const minHeight = 20;
  const displayHeight = Math.max(height, minHeight);

  // Determine text display based on height
  const showNote = height >= 45;
  const showTitle = height >= 25;

  return (
    <button
      onClick={onClick}
      className={`
        absolute rounded-md border-l-4 p-1 overflow-hidden
        ${colors.bg} ${colors.text}
        hover:shadow-md transition-shadow cursor-pointer
        text-left
      `}
      style={{
        top,
        height: displayHeight,
        width,
        left,
        borderLeftColor: subjectColor || (type === 'PLAN' ? '#3B82F6' : '#10B981'),
      }}
    >
      {showTitle && (
        <div className="text-xs font-medium truncate">{title}</div>
      )}
      {showNote && note && (
        <div className="text-xs text-gray-600 truncate">{note}</div>
      )}
      {!showTitle && (
        <div className="text-xs font-medium truncate">{title.slice(0, 10)}</div>
      )}
    </button>
  );
}
