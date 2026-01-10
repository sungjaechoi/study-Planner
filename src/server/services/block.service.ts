import { prisma } from '../db/client';
import { validateTimeBlock, validateDateFormat, ValidationError } from '@/lib/utils/validation';
import type { CreateBlockRequest, UpdateBlockRequest, BlockType } from '@/types';

/**
 * Create a new time block
 */
export async function createBlock(
  userId: string,
  data: CreateBlockRequest
) {
  // Validate date
  validateDateFormat(data.date);

  // Validate time block
  validateTimeBlock({
    isAllDay: data.is_all_day,
    startMin: data.start_min,
    endMin: data.end_min,
  });

  // Validate subject exists if provided
  if (data.subject_id) {
    const subject = await prisma.subject.findFirst({
      where: { id: data.subject_id, userId },
    });

    if (!subject) {
      throw new ValidationError(
        '과목을 찾을 수 없습니다',
        'subject_id',
        'NOT_FOUND'
      );
    }
  }

  // Get the next display order
  const maxOrder = await prisma.timeBlock.aggregate({
    where: { userId, date: data.date, type: data.type },
    _max: { displayOrder: true },
  });

  const displayOrder = (maxOrder._max.displayOrder ?? 0) + 1;

  // Create block
  const block = await prisma.timeBlock.create({
    data: {
      userId,
      subjectId: data.subject_id || null,
      date: data.date,
      type: data.type,
      isAllDay: data.is_all_day,
      startMin: data.start_min ?? null,
      endMin: data.end_min ?? null,
      title: data.title,
      note: data.note || null,
      displayOrder,
    },
  });

  return {
    id: block.id,
    date: block.date,
    type: block.type as BlockType,
    title: block.title,
    note: block.note,
    subject_id: block.subjectId,
    is_all_day: block.isAllDay,
    start_min: block.startMin,
    end_min: block.endMin,
    display_order: block.displayOrder,
    created_at: block.createdAt.toISOString(),
  };
}

/**
 * Update an existing time block
 */
export async function updateBlock(
  userId: string,
  blockId: string,
  data: UpdateBlockRequest
) {
  // Find the block
  const existingBlock = await prisma.timeBlock.findFirst({
    where: { id: blockId, userId },
  });

  if (!existingBlock) {
    throw new ValidationError(
      '블록을 찾을 수 없습니다',
      'id',
      'NOT_FOUND'
    );
  }

  // Validate time if provided
  if (
    data.is_all_day !== undefined ||
    data.start_min !== undefined ||
    data.end_min !== undefined
  ) {
    validateTimeBlock({
      isAllDay: data.is_all_day ?? existingBlock.isAllDay,
      startMin: data.start_min !== undefined ? data.start_min : existingBlock.startMin,
      endMin: data.end_min !== undefined ? data.end_min : existingBlock.endMin,
    });
  }

  // Validate subject if provided
  if (data.subject_id !== undefined && data.subject_id !== null) {
    const subject = await prisma.subject.findFirst({
      where: { id: data.subject_id, userId },
    });

    if (!subject) {
      throw new ValidationError(
        '과목을 찾을 수 없습니다',
        'subject_id',
        'NOT_FOUND'
      );
    }
  }

  // Update block
  const updatedBlock = await prisma.timeBlock.update({
    where: { id: blockId },
    data: {
      title: data.title,
      note: data.note !== undefined ? data.note : undefined,
      subjectId: data.subject_id !== undefined ? data.subject_id : undefined,
      isAllDay: data.is_all_day,
      startMin: data.start_min !== undefined ? data.start_min : undefined,
      endMin: data.end_min !== undefined ? data.end_min : undefined,
    },
  });

  return {
    id: updatedBlock.id,
    title: updatedBlock.title,
    note: updatedBlock.note,
    subject_id: updatedBlock.subjectId,
    is_all_day: updatedBlock.isAllDay,
    start_min: updatedBlock.startMin,
    end_min: updatedBlock.endMin,
    updated_at: updatedBlock.updatedAt.toISOString(),
  };
}

/**
 * Delete a time block
 */
export async function deleteBlock(userId: string, blockId: string) {
  // Find the block
  const existingBlock = await prisma.timeBlock.findFirst({
    where: { id: blockId, userId },
  });

  if (!existingBlock) {
    throw new ValidationError(
      '블록을 찾을 수 없습니다',
      'id',
      'NOT_FOUND'
    );
  }

  // Delete block
  await prisma.timeBlock.delete({
    where: { id: blockId },
  });

  return {
    success: true,
    deleted_id: blockId,
  };
}
