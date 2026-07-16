import { NextResponse } from 'next/server';

import {
  saveExerciseAttemptToAirtable,
  type SaveExerciseAttemptInput,
} from '../../../lib/airtable';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as Partial<SaveExerciseAttemptInput>;

    if (
      !body.challengeId ||
      typeof body.challengeId !== 'string'
    ) {
      return NextResponse.json(
        {
          error: 'challengeId is required.',
        },
        {
          status: 400,
        },
      );
    }

    if (
      typeof body.score !== 'number' ||
      typeof body.maxScore !== 'number'
    ) {
      return NextResponse.json(
        {
          error:
            'score and maxScore must be numbers.',
        },
        {
          status: 400,
        },
      );
    }

    if (
      typeof body.pointsEarned !== 'number' ||
      typeof body.totalPoints !== 'number'
    ) {
      return NextResponse.json(
        {
          error:
            'pointsEarned and totalPoints must be numbers.',
        },
        {
          status: 400,
        },
      );
    }

    if (
      typeof body.xpGained !== 'number' ||
      typeof body.gemsGained !== 'number'
    ) {
      return NextResponse.json(
        {
          error:
            'xpGained and gemsGained must be numbers.',
        },
        {
          status: 400,
        },
      );
    }

    if (
      !body.answers ||
      typeof body.answers !== 'object' ||
      Array.isArray(body.answers)
    ) {
      return NextResponse.json(
        {
          error:
            'answers must be an object.',
        },
        {
          status: 400,
        },
      );
    }

    if (!Array.isArray(body.results)) {
      return NextResponse.json(
        {
          error:
            'results must be an array.',
        },
        {
          status: 400,
        },
      );
    }

    if (typeof body.passed !== 'boolean') {
      return NextResponse.json(
        {
          error:
            'passed must be a boolean.',
        },
        {
          status: 400,
        },
      );
    }

    const input: SaveExerciseAttemptInput = {
      challengeId: body.challengeId,
      score: body.score,
      maxScore: body.maxScore,
      pointsEarned: body.pointsEarned,
      totalPoints: body.totalPoints,
      xpGained: body.xpGained,
      gemsGained: body.gemsGained,
      answers:
        body.answers as Record<string, string>,
      results: body.results,
      passed: body.passed,
    };

    const savedAttempt =
      await saveExerciseAttemptToAirtable(
        input,
      );

    return NextResponse.json({
      success: true,
      savedAttempt,
    });
  } catch (error) {
    console.error(
      'Failed to save exercise attempt:',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to save exercise attempt.',
      },
      {
        status: 500,
      },
    );
  }
}