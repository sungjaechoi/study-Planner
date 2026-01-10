import { NextRequest, NextResponse } from 'next/server';
import { updateBlock, deleteBlock } from '@/server/services/block.service';
import { updateBlockSchema } from '@/lib/validations/block';
import { ValidationError } from '@/lib/utils/validation';

const DEV_USER_ID = 'dev-user-001';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('X-User-Id') || DEV_USER_ID;
    const body = await request.json();

    // Validate request body
    const validationResult = updateBlockSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: '입력값 검증에 실패했습니다', details: errors } },
        { status: 400 }
      );
    }

    const data = await updateBlock(userId, id, validationResult.data);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: { code: error.code || 'VALIDATION_ERROR', message: error.message, field: error.field } },
        { status: error.code === 'NOT_FOUND' ? 404 : 400 }
      );
    }

    console.error('Error updating block:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('X-User-Id') || DEV_USER_ID;

    const data = await deleteBlock(userId, id);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: { code: error.code || 'VALIDATION_ERROR', message: error.message, field: error.field } },
        { status: error.code === 'NOT_FOUND' ? 404 : 400 }
      );
    }

    console.error('Error deleting block:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' } },
      { status: 500 }
    );
  }
}
