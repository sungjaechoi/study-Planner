'use client';

import { useEffect } from 'react';
import { usePlannerStore } from '@/stores/plannerStore';
import { DateNavigation } from '@/components/planner/DateNav/DateNavigation';
import { DaySummary } from '@/components/planner/Summary/DaySummary';
import { AllDayArea } from '@/components/planner/AllDayArea/AllDayArea';
import { Timeline } from '@/components/planner/Timeline/Timeline';
import { BlockFormModal } from '@/components/planner/BlockForm/BlockFormModal';
import { SettingsModal } from '@/components/planner/Settings';
import { DEFAULT_DAY_START, DEFAULT_DAY_END, GRID_MINUTES } from '@/lib/constants';
import type { CreateBlockRequest, UpdateBlockRequest } from '@/types';

export default function Home() {
  const {
    selectedDate,
    settings,
    subjects,
    blocks,
    summary,
    isLoading,
    isFormModalOpen,
    formBlockType,
    editingBlock,
    isSettingsModalOpen,
    setSelectedDate,
    fetchDayData,
    createBlock,
    updateBlock,
    deleteBlock,
    openFormModal,
    closeFormModal,
    openSettingsModal,
    closeSettingsModal,
    updateSettings,
  } = usePlannerStore();

  useEffect(() => {
    fetchDayData();
  }, [fetchDayData]);

  const allDayBlocks = blocks.filter(b => b.is_all_day);
  const dayStartMin = settings?.day_start_min ?? DEFAULT_DAY_START;
  const dayEndMin = settings?.day_end_min ?? DEFAULT_DAY_END;
  const gridMinutes = settings?.grid_minutes ?? GRID_MINUTES;

  const handleSubmit = async (data: CreateBlockRequest | UpdateBlockRequest) => {
    if (editingBlock) {
      await updateBlock(editingBlock.id, data as UpdateBlockRequest);
    } else {
      await createBlock(data as CreateBlockRequest);
    }
  };

  const handleDragEnd = async (blockId: string, newStartMin: number, newEndMin: number) => {
    await updateBlock(blockId, {
      start_min: newStartMin,
      end_min: newEndMin,
    });
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
        onSettingsClick={openSettingsModal}
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

      {/* Timeline */}
      <Timeline
        blocks={blocks}
        subjects={subjects}
        dayStartMin={dayStartMin}
        dayEndMin={dayEndMin}
        gridMinutes={gridMinutes}
        onBlockClick={(block) => openFormModal(block.type, block)}
        onAddBlock={(type) => openFormModal(type)}
        onDragEnd={handleDragEnd}
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

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={closeSettingsModal}
        currentSettings={settings}
        onSave={updateSettings}
      />
    </div>
  );
}
