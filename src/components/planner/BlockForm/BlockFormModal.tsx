'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select, TimeSelect } from '@/components/ui/Input';
import type { BlockType, CreateBlockRequest, UpdateBlockRequest } from '@/types';

interface Block {
  id: string;
  type: BlockType;
  is_all_day: boolean;
  start_min: number | null;
  end_min: number | null;
  title: string;
  note: string | null;
  subject_id: string | null;
}

interface Subject {
  id: string;
  name: string;
  color_hex: string;
}

interface BlockFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockType: BlockType;
  editingBlock: Block | null;
  subjects: Subject[];
  selectedDate: Date;
  onSubmit: (data: CreateBlockRequest | UpdateBlockRequest) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function BlockFormModal({
  isOpen,
  onClose,
  blockType,
  editingBlock,
  subjects,
  selectedDate,
  onSubmit,
  onDelete,
}: BlockFormModalProps) {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [startMin, setStartMin] = useState(540);  // 09:00
  const [endMin, setEndMin] = useState(600);      // 10:00
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!editingBlock;

  useEffect(() => {
    if (editingBlock) {
      setTitle(editingBlock.title);
      setNote(editingBlock.note || '');
      setSubjectId(editingBlock.subject_id || '');
      setIsAllDay(editingBlock.is_all_day);
      setStartMin(editingBlock.start_min ?? 540);
      setEndMin(editingBlock.end_min ?? 600);
    } else {
      setTitle('');
      setNote('');
      setSubjectId('');
      setIsAllDay(false);
      setStartMin(540);
      setEndMin(600);
    }
    setError('');
  }, [editingBlock, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('제목을 입력해주세요');
      return;
    }

    if (!isAllDay && startMin >= endMin) {
      setError('종료 시간은 시작 시간 이후여야 합니다');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing) {
        const updateData: UpdateBlockRequest = {
          title: title.trim(),
          note: note.trim() || null,
          subject_id: subjectId || null,
          is_all_day: isAllDay,
          start_min: isAllDay ? null : startMin,
          end_min: isAllDay ? null : endMin,
        };
        await onSubmit(updateData);
      } else {
        const createData: CreateBlockRequest = {
          date: format(selectedDate, 'yyyy-MM-dd'),
          type: blockType,
          title: title.trim(),
          note: note.trim() || undefined,
          subject_id: subjectId || undefined,
          is_all_day: isAllDay,
          start_min: isAllDay ? undefined : startMin,
          end_min: isAllDay ? undefined : endMin,
        };
        await onSubmit(createData);
      }
    } catch {
      // API 에러는 plannerStore에서 toast로 처리됨
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingBlock || !onDelete) return;

    if (!confirm('이 블록을 삭제하시겠습니까?')) return;

    setIsSubmitting(true);
    try {
      await onDelete(editingBlock.id);
    } catch {
      // API 에러는 plannerStore에서 toast로 처리됨
    } finally {
      setIsSubmitting(false);
    }
  };

  const subjectOptions = [
    { value: '', label: '과목 없음' },
    ...subjects.map(s => ({ value: s.id, label: s.name })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? '블록 수정' : `${blockType === 'PLAN' ? '계획' : '실행'} 추가`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3.5 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <Input
          label="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="블록 제목을 입력하세요"
          required
        />

        <Input
          label="메모 (선택)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="메모를 입력하세요"
        />

        <Select
          label="과목"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          options={subjectOptions}
        />

        <label htmlFor="isAllDay" className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              id="isAllDay"
              checked={isAllDay}
              onChange={(e) => setIsAllDay(e.target.checked)}
              className="peer sr-only"
            />
            <div className={`
              w-5 h-5 border-2 rounded-lg transition-all duration-200
              ${isAllDay
                ? 'bg-indigo-500 border-indigo-500'
                : 'border-stone-300 group-hover:border-stone-400'}
            `}>
              {isAllDay && (
                <svg className="w-full h-full text-white p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900 transition-colors">
            종일 일정
          </span>
        </label>

        {!isAllDay && (
          <div className="grid grid-cols-2 gap-4">
            <TimeSelect
              label="시작 시간"
              value={startMin}
              onChange={setStartMin}
              minTime={0}
              maxTime={1425}
            />
            <TimeSelect
              label="종료 시간"
              value={endMin}
              onChange={setEndMin}
              minTime={15}
              maxTime={1440}
            />
          </div>
        )}

        <div className="flex justify-between pt-5 border-t border-stone-100">
          {isEditing && onDelete ? (
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              삭제
            </Button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : isEditing ? '저장' : '생성'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
