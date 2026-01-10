import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/server/services/settings.service';
import { updateSettingsSchema } from '@/lib/validations/settings';
import { ValidationError } from '@/lib/utils/validation';

const DEV_USER_ID = 'dev-user-001';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('X-User-Id') || DEV_USER_ID;
    const data = await getSettings(userId);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get('X-User-Id') || DEV_USER_ID;
    const body = await request.json();

    // Validate request body
    const validationResult = updateSettingsSchema.safeParse(body);
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

    const data = await updateSettings(userId, validationResult.data);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: { code: error.code || 'VALIDATION_ERROR', message: error.message, field: error.field } },
        { status: 400 }
      );
    }

    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
