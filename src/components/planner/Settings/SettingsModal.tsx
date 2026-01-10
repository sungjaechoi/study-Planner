'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TimeRangeSelector } from './TimeRangeSelector';
import { GridIntervalSelector } from './GridIntervalSelector';
import type { UpdateSettingsRequest } from '@/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: {
    day_start_min: number;
    day_end_min: number;
    grid_minutes: number;
  } | null;
  onSave: (settings: UpdateSettingsRequest) => Promise<void>;
}

const MIN_HOURS_DIFFERENCE = 6;

export function SettingsModal({
  isOpen,
  onClose,
  currentSettings,
  onSave,
}: SettingsModalProps) {
  const [dayStartMin, setDayStartMin] = useState(0);
  const [dayEndMin, setDayEndMin] = useState(1440);
  const [gridMinutes, setGridMinutes] = useState(15);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentSettings) {
      setDayStartMin(currentSettings.day_start_min);
      setDayEndMin(currentSettings.day_end_min);
      setGridMinutes(currentSettings.grid_minutes);
    }
  }, [currentSettings]);

  const validate = (): boolean => {
    if (dayStartMin >= dayEndMin) {
      setError('시작 시간은 종료 시간보다 빨라야 합니다.');
      return false;
    }

    const hoursDifference = (dayEndMin - dayStartMin) / 60;
    if (hoursDifference < MIN_HOURS_DIFFERENCE) {
      setError(`최소 ${MIN_HOURS_DIFFERENCE}시간 이상 차이가 나야 합니다.`);
      return false;
    }

    setError(null);
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      await onSave({
        day_start_min: dayStartMin,
        day_end_min: dayEndMin,
        grid_minutes: gridMinutes,
      });
    } catch {
      // API 에러는 plannerStore에서 toast로 처리됨
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setError(null);
    if (currentSettings) {
      setDayStartMin(currentSettings.day_start_min);
      setDayEndMin(currentSettings.day_end_min);
      setGridMinutes(currentSettings.grid_minutes);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="플래너 설정">
      <div className="space-y-6">
        <TimeRangeSelector
          label="하루 시작 시간"
          value={dayStartMin}
          onChange={setDayStartMin}
          minHour={0}
          maxHour={12}
        />

        <TimeRangeSelector
          label="하루 종료 시간"
          value={dayEndMin}
          onChange={setDayEndMin}
          minHour={12}
          maxHour={24}
        />

        <GridIntervalSelector
          value={gridMinutes}
          onChange={setGridMinutes}
        />

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="ghost" onClick={handleClose} disabled={isSaving}>
            취소
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
