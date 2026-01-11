'use client';

import { TimeBlock } from './TimeBlock';
import { TimeGrid } from './TimeGrid';
import { useOverlapLayout, type LayoutBlock } from '@/hooks/useOverlapLayout';
import { HOUR_HEIGHT } from '@/lib/constants';
import type { BlockType } from '@/types';

interface Block {
  id: string;
  type: BlockType;
  is_all_day: boolean;
  start_min: number | null;
  end_min: number | null;
  title: string;
  note: string | null;
  subject_id: string | null;
  display_order: number;
}

interface Subject {
  id: string;
  name: string;
  color_hex: string;
}

interface BlockColumnProps {
  type: BlockType;
  blocks: Block[];
  subjects: Subject[];
  dayStartMin: number;
  dayEndMin: number;
  gridMinutes: number;
  onBlockClick: (block: Block) => void;
  onAddClick: () => void;
  onDragEnd: (blockId: string, newStartMin: number, newEndMin: number) => Promise<void>;
}

const COLUMN_STYLES = {
  PLAN: {
    headerBg: 'bg-gradient-to-r from-indigo-50 to-indigo-100/50',
    headerText: 'text-indigo-700',
    headerIcon: 'bg-indigo-500',
    addBtnHover: 'hover:bg-indigo-100',
  },
  EXECUTION: {
    headerBg: 'bg-gradient-to-r from-teal-50 to-emerald-100/50',
    headerText: 'text-teal-700',
    headerIcon: 'bg-teal-500',
    addBtnHover: 'hover:bg-teal-100',
  },
};

export function BlockColumn({
  type,
  blocks,
  subjects,
  dayStartMin,
  dayEndMin,
  gridMinutes,
  onBlockClick,
  onAddClick,
  onDragEnd,
}: BlockColumnProps) {
  const layoutBlocks = useOverlapLayout(blocks);
  const totalHours = (dayEndMin - dayStartMin) / 60;
  const columnHeight = totalHours * HOUR_HEIGHT;
  const styles = COLUMN_STYLES[type];

  const getSubjectColor = (subjectId: string | null) => {
    if (!subjectId) return undefined;
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.color_hex;
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Column Header */}
      <div className={`
        sticky top-0 z-10 flex items-center justify-between px-3 py-2.5
        ${styles.headerBg} border-b border-stone-100
        backdrop-blur-sm
      `}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${styles.headerIcon}`} />
          <span className={`text-sm font-semibold ${styles.headerText}`}>
            {type === 'PLAN' ? '계획' : '실행'}
          </span>
          {blocks.length > 0 && (
            <span className="text-xs text-stone-400 font-medium">
              ({blocks.length})
            </span>
          )}
        </div>
        <button
          onClick={onAddClick}
          className={`p-1.5 rounded-lg text-stone-400 hover:text-stone-600 ${styles.addBtnHover} transition-colors`}
          aria-label={`${type === 'PLAN' ? '계획' : '실행'} 추가`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Blocks Area */}
      <div
        className="relative flex-1 bg-white"
        style={{ height: columnHeight }}
      >
        <TimeGrid dayStartMin={dayStartMin} dayEndMin={dayEndMin} />

        {/* Empty state background pattern */}
        {blocks.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-stone-300">
              <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p className="text-xs font-medium">클릭하여 추가</p>
            </div>
          </div>
        )}

        {layoutBlocks.map((block: LayoutBlock) => (
          <TimeBlock
            key={block.id}
            id={block.id}
            type={block.type}
            title={block.title}
            note={block.note}
            startMin={block.start_min!}
            endMin={block.end_min!}
            dayStartMin={dayStartMin}
            dayEndMin={dayEndMin}
            gridMinutes={gridMinutes}
            laneIndex={block.laneIndex}
            laneCount={block.laneCount}
            subjectColor={getSubjectColor(block.subject_id)}
            onClick={() => onBlockClick(block)}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
    </div>
  );
}
