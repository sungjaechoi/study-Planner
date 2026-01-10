import { NextRequest, NextResponse } from 'next/server';
import { getSummary } from '@/server/services/planner.service';
import { ValidationError } from '@/lib/utils/validation';

const DEV_USER_ID = 'dev-user-001';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const userId = request.headers.get('X-User-Id') || DEV_USER_ID;

    if (!from || !to) {
      return NextResponse.json(
        { error: { code: 'MISSING_PARAMS', message: 'from and to query parameters are required' } },
        { status: 400 }
      );
    }

    const data = await getSummary(userId, from, to);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: { code: error.code || 'VALIDATION_ERROR', message: error.message, field: error.field } },
        { status: 400 }
      );
    }

    console.error('Error fetching summary:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
