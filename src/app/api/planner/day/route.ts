import { NextRequest, NextResponse } from 'next/server';
import { getDayData } from '@/server/services/planner.service';
import { ValidationError } from '@/lib/utils/validation';

// Temporary user ID for development (until auth is implemented)
const DEV_USER_ID = 'dev-user-001';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const userId = request.headers.get('X-User-Id') || DEV_USER_ID;

    if (!date) {
      return NextResponse.json(
        { error: { code: 'MISSING_DATE', message: 'date query parameter is required' } },
        { status: 400 }
      );
    }

    const data = await getDayData(userId, date);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: { code: error.code || 'VALIDATION_ERROR', message: error.message, field: error.field } },
        { status: 400 }
      );
    }

    console.error('Error fetching day data:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
