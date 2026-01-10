import { NextRequest, NextResponse } from 'next/server';
import { getSubjects, createSubject } from '@/server/services/subject.service';
import { createSubjectSchema } from '@/lib/validations/settings';
import { ValidationError } from '@/lib/utils/validation';

const DEV_USER_ID = 'dev-user-001';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('X-User-Id') || DEV_USER_ID;
    const data = await getSubjects(userId);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('X-User-Id') || DEV_USER_ID;
    const body = await request.json();

    // Validate request body
    const validationResult = createSubjectSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: errors } },
        { status: 400 }
      );
    }

    const data = await createSubject(userId, validationResult.data);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: { code: error.code || 'VALIDATION_ERROR', message: error.message, field: error.field } },
        { status: 400 }
      );
    }

    console.error('Error creating subject:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
