'use client';

import { TimeBlock } from './TimeBlock';
import { TimeGrid } from './TimeGrid';
import { useOverlapLayout, type LayoutBlock } from '@/hooks/useOverlapLayout';
import { HOUR_HEIGHT } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
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
  onBlockClick: (block: Block) => void;
  onAddClick: () => void;
}

export function BlockColumn({
  type,
  blocks,
  subjects,
  dayStartMin,
  dayEndMin,
  onBlockClick,
  onAddClick,
}: BlockColumnProps) {
  const layoutBlocks = useOverlapLayout(blocks);
  const totalHours = (dayEndMin - dayStartMin) / 60;
  const columnHeight = totalHours * HOUR_HEIGHT;

  const getSubjectColor = (subjectId: string | null) => {
    if (!subjectId) return undefined;
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.color_hex;
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Column Header */}
      <div className={`
        flex items-center justify-between px-3 py-2 border-b
        ${type === 'PLAN' ? 'bg-blue-50' : 'bg-emerald-50'}
      `}>
        <span className={`text-sm font-medium ${type === 'PLAN' ? 'text-blue-700' : 'text-emerald-700'}`}>
          {type === 'PLAN' ? '계획' : '실행'}
        </span>
        <Button variant="ghost" size="sm" onClick={onAddClick}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Button>
      </div>

      {/* Blocks Area */}
      <div
        className="relative flex-1"
        style={{ height: columnHeight }}
      >
        <TimeGrid dayStartMin={dayStartMin} dayEndMin={dayEndMin} />

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
            laneIndex={block.laneIndex}
            laneCount={block.laneCount}
            subjectColor={getSubjectColor(block.subject_id)}
            onClick={() => onBlockClick(block)}
          />
        ))}
      </div>
    </div>
  );
}
