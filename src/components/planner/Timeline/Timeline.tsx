'use client';

import { TimeAxis } from './TimeAxis';
import { BlockColumn } from './BlockColumn';
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

interface TimelineProps {
  blocks: Block[];
  subjects: Subject[];
  dayStartMin: number;
  dayEndMin: number;
  onBlockClick: (block: Block) => void;
  onAddBlock: (type: BlockType) => void;
}

export function Timeline({
  blocks,
  subjects,
  dayStartMin,
  dayEndMin,
  onBlockClick,
  onAddBlock,
}: TimelineProps) {
  const planBlocks = blocks.filter(b => b.type === 'PLAN' && !b.is_all_day);
  const executionBlocks = blocks.filter(b => b.type === 'EXECUTION' && !b.is_all_day);

  return (
    <div className="flex-1 overflow-auto">
      <div className="flex min-h-full">
        {/* Time Axis */}
        <TimeAxis dayStartMin={dayStartMin} dayEndMin={dayEndMin} />

        {/* Plan Column */}
        <BlockColumn
          type="PLAN"
          blocks={planBlocks}
          subjects={subjects}
          dayStartMin={dayStartMin}
          dayEndMin={dayEndMin}
          onBlockClick={onBlockClick}
          onAddClick={() => onAddBlock('PLAN')}
        />

        {/* Divider */}
        <div className="w-px bg-gray-300" />

        {/* Execution Column */}
        <BlockColumn
          type="EXECUTION"
          blocks={executionBlocks}
          subjects={subjects}
          dayStartMin={dayStartMin}
          dayEndMin={dayEndMin}
          onBlockClick={onBlockClick}
          onAddClick={() => onAddBlock('EXECUTION')}
        />
      </div>
    </div>
  );
}
