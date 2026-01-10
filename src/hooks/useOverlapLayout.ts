'use client';

import { useMemo } from 'react';
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

export interface LayoutBlock extends Block {
  laneIndex: number;
  laneCount: number;
}

export function useOverlapLayout(blocks: Block[]): LayoutBlock[] {
  return useMemo(() => {
    // Filter out all-day blocks
    const timedBlocks = blocks.filter(
      (b) => !b.is_all_day && b.start_min !== null && b.end_min !== null
    );

    if (timedBlocks.length === 0) return [];

    // Sort by start time, then by end time
    const sorted = [...timedBlocks].sort((a, b) => {
      if (a.start_min !== b.start_min) return a.start_min! - b.start_min!;
      return a.end_min! - b.end_min!;
    });

    // Find overlapping groups
    const groups: Block[][] = [];
    let currentGroup: Block[] = [sorted[0]];
    let groupEnd = sorted[0].end_min!;

    for (let i = 1; i < sorted.length; i++) {
      const block = sorted[i];
      if (block.start_min! < groupEnd) {
        // Overlaps with current group
        currentGroup.push(block);
        groupEnd = Math.max(groupEnd, block.end_min!);
      } else {
        // New group
        groups.push(currentGroup);
        currentGroup = [block];
        groupEnd = block.end_min!;
      }
    }
    groups.push(currentGroup);

    // Assign lanes within each group
    const result: LayoutBlock[] = [];
    for (const group of groups) {
      const laneCount = group.length;
      group.forEach((block, index) => {
        result.push({
          ...block,
          laneIndex: index,
          laneCount,
        });
      });
    }

    return result;
  }, [blocks]);
}
