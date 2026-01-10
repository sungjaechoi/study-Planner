import { NextRequest, NextResponse } from 'next/server';
import { deleteSubject } from '@/server/services/subject.service';
import { ValidationError } from '@/lib/utils/validation';

const DEV_USER_ID = 'dev-user-001';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('X-User-Id') || DEV_USER_ID;

    const data = await deleteSubject(userId, id);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: { code: error.code || 'VALIDATION_ERROR', message: error.message, field: error.field } },
        { status: error.code === 'NOT_FOUND' ? 404 : 400 }
      );
    }

    console.error('Error deleting subject:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
