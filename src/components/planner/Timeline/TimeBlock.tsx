'use client';

import { PIXELS_PER_MINUTE, BLOCK_COLORS } from '@/lib/constants';
import { useDragBlock } from '@/hooks/useDragBlock';
import type { BlockType } from '@/types';

interface TimeBlockProps {
  id: string;
  type: BlockType;
  title: string;
  note: string | null;
  startMin: number;
  endMin: number;
  dayStartMin: number;
  dayEndMin: number;
  gridMinutes: number;
  laneIndex: number;
  laneCount: number;
  subjectColor?: string;
  onClick: () => void;
  onDragEnd: (blockId: string, newStartMin: number, newEndMin: number) => Promise<void>;
}

export function TimeBlock({
  id,
  type,
  title,
  note,
  startMin,
  endMin,
  dayStartMin,
  dayEndMin,
  gridMinutes,
  laneIndex,
  laneCount,
  subjectColor,
  onClick,
  onDragEnd,
}: TimeBlockProps) {
  // All blocks are draggable
  const isDraggable = true;

  const {
    isDragging,
    wasDragging,
    dragOffsetY,
    handleMouseDown,
    clearWasDragging,
  } = useDragBlock({
    blockId: id,
    initialStartMin: startMin,
    initialEndMin: endMin,
    dayStartMin,
    dayEndMin,
    gridMinutes,
    onDragEnd,
    enabled: isDraggable,
  });

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

  const handleClick = () => {
    // Prevent click after drag
    if (wasDragging) {
      clearWasDragging();
      return;
    }
    if (!isDragging) {
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
      className={`
        absolute rounded-md border-l-4 p-1 overflow-hidden
        ${colors.bg} ${colors.text}
        transition-shadow select-none
        text-left
        hover:shadow-md
        ${isDragging
          ? 'opacity-80 shadow-lg z-50 cursor-grabbing'
          : isDraggable ? 'cursor-grab' : 'cursor-pointer'
        }
      `}
      style={{
        top,
        height: displayHeight,
        width,
        left,
        borderLeftColor: subjectColor || (type === 'PLAN' ? '#3B82F6' : '#10B981'),
        transform: isDragging ? `translateY(${dragOffsetY}px)` : undefined,
        willChange: isDragging ? 'transform' : undefined,
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
    </div>
  );
}
