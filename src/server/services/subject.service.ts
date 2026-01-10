import { prisma } from '../db/client';
import { ValidationError } from '@/lib/utils/validation';
import type { CreateSubjectRequest } from '@/types';

/**
 * Get all subjects for a user
 */
export async function getSubjects(userId: string) {
  const subjects = await prisma.subject.findMany({
    where: { userId },
    orderBy: { sortOrder: 'asc' },
  });

  return subjects.map((s) => ({
    id: s.id,
    name: s.name,
    color_hex: s.colorHex,
    sort_order: s.sortOrder,
    is_active: s.isActive,
  }));
}

/**
 * Create a new subject
 */
export async function createSubject(
  userId: string,
  data: CreateSubjectRequest
) {
  // Validate color hex format
  if (!/^#[0-9A-Fa-f]{6}$/.test(data.color_hex)) {
    throw new ValidationError(
      'color_hex must be in #RRGGBB format',
      'color_hex',
      'INVALID_COLOR'
    );
  }

  // Get the next sort order if not provided
  let sortOrder = data.sort_order;
  if (sortOrder === undefined) {
    const maxOrder = await prisma.subject.aggregate({
      where: { userId },
      _max: { sortOrder: true },
    });
    sortOrder = (maxOrder._max.sortOrder ?? 0) + 1;
  }

  const subject = await prisma.subject.create({
    data: {
      userId,
      name: data.name,
      colorHex: data.color_hex,
      sortOrder,
      isActive: true,
    },
  });

  return {
    id: subject.id,
    name: subject.name,
    color_hex: subject.colorHex,
    sort_order: subject.sortOrder,
    is_active: subject.isActive,
    created_at: subject.createdAt.toISOString(),
  };
}

/**
 * Delete a subject
 */
export async function deleteSubject(userId: string, subjectId: string) {
  // Find the subject
  const existingSubject = await prisma.subject.findFirst({
    where: { id: subjectId, userId },
  });

  if (!existingSubject) {
    throw new ValidationError(
      'Subject not found',
      'id',
      'NOT_FOUND'
    );
  }

  // Delete subject (blocks will have subject_id set to null via onDelete: SetNull)
  await prisma.subject.delete({
    where: { id: subjectId },
  });

  return {
    success: true,
    deleted_id: subjectId,
  };
}
