'use client';

import { useEffect } from 'react';
import { usePlannerStore } from '@/stores/plannerStore';
import { DateNavigation } from '@/components/planner/DateNav/DateNavigation';
import { DaySummary } from '@/components/planner/Summary/DaySummary';
import { AllDayArea } from '@/components/planner/AllDayArea/AllDayArea';
import { Timeline } from '@/components/planner/Timeline/Timeline';
import { BlockFormModal } from '@/components/planner/BlockForm/BlockFormModal';
import { DEFAULT_DAY_START, DEFAULT_DAY_END } from '@/lib/constants';
import type { CreateBlockRequest, UpdateBlockRequest } from '@/types';

export default function Home() {
  const {
    selectedDate,
    settings,
    subjects,
    blocks,
    summary,
    isLoading,
    error,
    isFormModalOpen,
    formBlockType,
    editingBlock,
    setSelectedDate,
    fetchDayData,
    createBlock,
    updateBlock,
    deleteBlock,
    openFormModal,
    closeFormModal,
  } = usePlannerStore();

  useEffect(() => {
    fetchDayData();
  }, [fetchDayData]);

  const allDayBlocks = blocks.filter(b => b.is_all_day);
  const dayStartMin = settings?.day_start_min ?? DEFAULT_DAY_START;
  const dayEndMin = settings?.day_end_min ?? DEFAULT_DAY_END;

  const handleSubmit = async (data: CreateBlockRequest | UpdateBlockRequest) => {
    if (editingBlock) {
      await updateBlock(editingBlock.id, data as UpdateBlockRequest);
    } else {
      await createBlock(data as CreateBlockRequest);
    }
  };

  if (isLoading && !blocks.length) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Date Navigation */}
      <DateNavigation
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {/* Day Summary */}
      <DaySummary
        planTotalMin={summary.plan_total_min}
        executionTotalMin={summary.execution_total_min}
      />

      {/* All Day Area */}
      <AllDayArea
        blocks={allDayBlocks}
        subjects={subjects}
        onBlockClick={(block) => {
          const fullBlock = blocks.find(b => b.id === block.id);
          if (fullBlock) openFormModal(block.type, fullBlock);
        }}
      />

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Timeline */}
      <Timeline
        blocks={blocks}
        subjects={subjects}
        dayStartMin={dayStartMin}
        dayEndMin={dayEndMin}
        onBlockClick={(block) => openFormModal(block.type, block)}
        onAddBlock={(type) => openFormModal(type)}
      />

      {/* Block Form Modal */}
      <BlockFormModal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        blockType={formBlockType}
        editingBlock={editingBlock}
        subjects={subjects}
        selectedDate={selectedDate}
        onSubmit={handleSubmit}
        onDelete={deleteBlock}
      />
    </div>
  );
}
