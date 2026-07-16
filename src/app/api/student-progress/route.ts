import { NextResponse } from 'next/server';

import {
  fetchConfiguredStudentFromAirtable,
  fetchStudentProgressFromAirtable,
  initializeStudentProgressInAirtable,
} from '../../../lib/airtable';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const initialization =
      await initializeStudentProgressInAirtable();

    const student =
      await fetchConfiguredStudentFromAirtable();

    const progress =
      await fetchStudentProgressFromAirtable(
        student.recordId,
      );

    return NextResponse.json({
      student,
      initialization,
      progress,
    });
  } catch (error) {
    console.error(
      'Failed to load configured student progress:',
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to load student progress.',
      },
      {
        status: 500,
      },
    );
  }
}