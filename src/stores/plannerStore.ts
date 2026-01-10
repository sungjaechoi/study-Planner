'use client';

import { create } from 'zustand';
import { format } from 'date-fns';
import * as api from '@/lib/api';
import type {
  BlockType,
  DayPlannerResponse,
  CreateBlockRequest,
  UpdateBlockRequest
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
  error: string | null;
  editingBlock: BlockData | null;
  isFormModalOpen: boolean;
  formBlockType: BlockType;

  // Actions
  setSelectedDate: (date: Date) => void;
  fetchDayData: () => Promise<void>;
  createBlock: (data: CreateBlockRequest) => Promise<void>;
  updateBlock: (id: string, data: UpdateBlockRequest) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
  openFormModal: (type: BlockType, block?: BlockData) => void;
  closeFormModal: () => void;
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
  // Initial state
  selectedDate: new Date(),
  settings: null,
  subjects: [],
  blocks: [],
  summary: { plan_total_min: 0, execution_total_min: 0 },
  isLoading: false,
  error: null,
  editingBlock: null,
  isFormModalOpen: false,
  formBlockType: 'PLAN',

  // Actions
  setSelectedDate: (date: Date) => {
    set({ selectedDate: date });
    get().fetchDayData();
  },

  fetchDayData: async () => {
    const { selectedDate } = get();
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    set({ isLoading: true, error: null });

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
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch data',
        isLoading: false
      });
    }
  },

  createBlock: async (data: CreateBlockRequest) => {
    try {
      await api.createBlock(data);
      await get().fetchDayData();
      set({ isFormModalOpen: false, editingBlock: null });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to create block' });
      throw err;
    }
  },

  updateBlock: async (id: string, data: UpdateBlockRequest) => {
    try {
      await api.updateBlock(id, data);
      await get().fetchDayData();
      set({ isFormModalOpen: false, editingBlock: null });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update block' });
      throw err;
    }
  },

  deleteBlock: async (id: string) => {
    try {
      await api.deleteBlock(id);
      await get().fetchDayData();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete block' });
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
}));
