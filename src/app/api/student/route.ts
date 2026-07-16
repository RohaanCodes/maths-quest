import { NextResponse } from 'next/server';

import {
  fetchConfiguredStudentFromAirtable,
  fetchStudentProgressFromAirtable,
} from '../../../lib/airtable';

export const dynamic = 'force-dynamic';

function calculateLevel(xp: number): number {
  return Math.max(
    1,
    Math.floor(xp / 250) + 1,
  );
}

export async function GET() {
  try {
    const student =
      await fetchConfiguredStudentFromAirtable();

    const progress =
      await fetchStudentProgressFromAirtable(
        student.recordId,
      );

    const completedProgress = progress.filter(
      (item) => item.status === 'Completed',
    );

    const unlockedProgress = progress.filter(
      (item) => item.status === 'Unlocked',
    );

    const totalAttempts = progress.reduce(
      (total, item) =>
        total + item.attempts,
      0,
    );

    const totalPointsEarned = progress.reduce(
      (total, item) =>
        total + item.totalPointsEarned,
      0,
    );

    const bestScore =
      progress.length > 0
        ? Math.max(
            ...progress.map(
              (item) => item.bestScore,
            ),
          )
        : 0;

    const currentProgress =
      unlockedProgress
        .sort(
          (first, second) =>
            first.lessonOrder -
            second.lessonOrder,
        )[0];

    return NextResponse.json({
      student: {
        id: student.studentId,
        recordId: student.recordId,
        name: student.studentName,
        email: student.parentEmail,
        xp: student.xp,
        level: calculateLevel(student.xp),
        rank:
          student.xp >= 2000
            ? 'Math Master'
            : student.xp >= 1000
              ? 'Quest Hero'
              : student.xp >= 500
                ? 'Apprentice'
                : 'Novice',
        tokens: 0,
      },

      progress,

      stats: {
        totalLessons: progress.length,
        completedLessons:
          completedProgress.length,
        unlockedLessons:
          unlockedProgress.length,
        totalAttempts,
        totalPointsEarned,
        bestScore,
        completionPercentage:
          progress.length > 0
            ? Math.round(
                (completedProgress.length /
                  progress.length) *
                  100,
              )
            : 0,

        currentLessonRecordId:
          currentProgress?.lessonRecordId,

        currentWorldId:
          currentProgress?.worldId,
      },
    });
  } catch (error) {
    console.error(
      'Failed to load student data:',
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to load student data.',
      },
      {
        status: 500,
      },
    );
  }
}