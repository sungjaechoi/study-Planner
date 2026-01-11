'use client';

import { PIXELS_PER_MINUTE } from '@/lib/constants';
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

const BLOCK_STYLES = {
  PLAN: {
    gradient: 'from-indigo-500/90 to-indigo-600/90',
    shadow: 'shadow-indigo-500/20',
    hoverShadow: 'hover:shadow-indigo-500/30',
    ring: 'ring-indigo-400/50',
  },
  EXECUTION: {
    gradient: 'from-teal-500/90 to-emerald-600/90',
    shadow: 'shadow-teal-500/20',
    hoverShadow: 'hover:shadow-teal-500/30',
    ring: 'ring-teal-400/50',
  },
};

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
  const width = `calc(${100 / laneCount}% - 4px)`;
  const left = `calc(${(laneIndex / laneCount) * 100}% + 2px)`;

  const styles = BLOCK_STYLES[type];
  const minHeight = 24;
  const displayHeight = Math.max(height, minHeight);

  const showNote = height >= 50;
  const showTitle = height >= 28;

  const handleClick = () => {
    if (wasDragging) {
      clearWasDragging();
      return;
    }
    if (!isDragging) {
      onClick();
    }
  };

  // Custom gradient if subject color is provided
  const customStyle = subjectColor ? {
    background: `linear-gradient(135deg, ${subjectColor}e6, ${subjectColor}cc)`,
  } : {};

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
        absolute rounded-xl overflow-hidden
        select-none text-left
        transition-all duration-200 ease-out
        ${!subjectColor ? `bg-gradient-to-br ${styles.gradient}` : ''}
        ${isDragging
          ? `opacity-95 shadow-2xl z-50 cursor-grabbing scale-[1.02] ring-2 ${styles.ring}`
          : `shadow-lg ${styles.shadow} ${styles.hoverShadow} hover:scale-[1.01] cursor-grab`
        }
      `}
      style={{
        top,
        height: displayHeight,
        width,
        left,
        transform: isDragging ? `translateY(${dragOffsetY}px)` : undefined,
        willChange: isDragging ? 'transform' : undefined,
        ...customStyle,
      }}
    >
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative h-full px-2.5 py-1.5 flex flex-col justify-center">
        {showTitle ? (
          <>
            <div className="text-xs font-semibold text-white truncate leading-tight drop-shadow-sm">
              {title}
            </div>
            {showNote && note && (
              <div className="text-[10px] text-white/70 truncate mt-0.5 leading-tight">
                {note}
              </div>
            )}
          </>
        ) : (
          <div className="text-[10px] font-semibold text-white truncate leading-tight drop-shadow-sm">
            {title}
          </div>
        )}
      </div>

      {/* Bottom shine */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}
