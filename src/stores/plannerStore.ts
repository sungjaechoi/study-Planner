'use client';

import { create } from 'zustand';
import { format } from 'date-fns';
import * as api from '@/lib/api';
import { toast } from './toastStore';
import type {
  BlockType,
  DayPlannerResponse,
  CreateBlockRequest,
  UpdateBlockRequest,
  UpdateSettingsRequest
} from '@/types';

interface BlockData {
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

interface SubjectData {
  id: string;
  name: string;
  color_hex: string;
  sort_order: number;
  is_active: boolean;
}

interface SettingsData {
  grid_minutes: number;
  day_start_min: number;
  day_end_min: number;
}

interface PlannerState {
  // Data
  selectedDate: Date;
  settings: SettingsData | null;
  subjects: SubjectData[];
  blocks: BlockData[];
  summary: { plan_total_min: number; execution_total_min: number };

  // UI State
  isLoading: boolean;
  editingBlock: BlockData | null;
  isFormModalOpen: boolean;
  formBlockType: BlockType;
  isSettingsModalOpen: boolean;

  // Actions
  setSelectedDate: (date: Date) => void;
  fetchDayData: () => Promise<void>;
  createBlock: (data: CreateBlockRequest) => Promise<void>;
  updateBlock: (id: string, data: UpdateBlockRequest) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
  openFormModal: (type: BlockType, block?: BlockData) => void;
  closeFormModal: () => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  updateSettings: (data: UpdateSettingsRequest) => Promise<void>;
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
  // Initial state
  selectedDate: new Date(),
  settings: null,
  subjects: [],
  blocks: [],
  summary: { plan_total_min: 0, execution_total_min: 0 },
  isLoading: false,
  editingBlock: null,
  isFormModalOpen: false,
  formBlockType: 'PLAN',
  isSettingsModalOpen: false,

  // Actions
  setSelectedDate: (date: Date) => {
    set({ selectedDate: date });
    get().fetchDayData();
  },

  fetchDayData: async () => {
    const { selectedDate } = get();
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    set({ isLoading: true });

    try {
      const data: DayPlannerResponse = await api.fetchDayData(dateStr);
      set({
        settings: data.settings,
        subjects: data.subjects,
        blocks: data.blocks,
        summary: data.summary,
        isLoading: false,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다');
      set({ isLoading: false });
    }
  },

  createBlock: async (data: CreateBlockRequest) => {
    try {
      await api.createBlock(data);
      await get().fetchDayData();
      set({ isFormModalOpen: false, editingBlock: null });
      toast.success('블록이 생성되었습니다');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '블록 생성에 실패했습니다');
      throw err;
    }
  },

  updateBlock: async (id: string, data: UpdateBlockRequest) => {
    try {
      await api.updateBlock(id, data);
      await get().fetchDayData();
      set({ isFormModalOpen: false, editingBlock: null });
      toast.success('블록이 수정되었습니다');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '블록 수정에 실패했습니다');
      throw err;
    }
  },

  deleteBlock: async (id: string) => {
    try {
      await api.deleteBlock(id);
      await get().fetchDayData();
      set({ isFormModalOpen: false, editingBlock: null });
      toast.success('블록이 삭제되었습니다');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '블록 삭제에 실패했습니다');
      throw err;
    }
  },

  openFormModal: (type: BlockType, block?: BlockData) => {
    set({
      isFormModalOpen: true,
      formBlockType: type,
      editingBlock: block || null
    });
  },

  closeFormModal: () => {
    set({ isFormModalOpen: false, editingBlock: null });
  },

  openSettingsModal: () => {
    set({ isSettingsModalOpen: true });
  },

  closeSettingsModal: () => {
    set({ isSettingsModalOpen: false });
  },

  updateSettings: async (data: UpdateSettingsRequest) => {
    try {
      const updatedSettings = await api.updateSettings(data);
      set({
        settings: {
          grid_minutes: updatedSettings.grid_minutes,
          day_start_min: updatedSettings.day_start_min,
          day_end_min: updatedSettings.day_end_min,
        },
        isSettingsModalOpen: false,
      });
      await get().fetchDayData();
      toast.success('설정이 저장되었습니다');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '설정 저장에 실패했습니다');
      throw err;
    }
  },
}));
