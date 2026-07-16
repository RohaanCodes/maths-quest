'use client';

import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Student,
  StudentProgress,
  StudentStats,
} from '../../types';

import {
  getStudentApiData,
} from '../../lib/data';

import DashboardLayout from '../../components/DashboardLayout';
import StudentProfileComponent from '../../components/StudentProfileComponent';

interface ProfileClientProps {
  initialStudent: Student;
  initialProgress: StudentProgress;
  initialStats: StudentStats;
}

export default function ProfileClient({
  initialStudent,
  initialProgress,
  initialStats,
}: ProfileClientProps) {
  const [student, setStudent] =
    useState<Student>(initialStudent);

  const [progress, setProgress] =
    useState<StudentProgress>(
      initialProgress,
    );

  const [stats, setStats] =
    useState<StudentStats>(initialStats);

  const refreshProfile =
    useCallback(async () => {
      try {
        const data =
          await getStudentApiData();

        const completedChallengeIds =
          data.progress
            .filter(
              (item) =>
                item.status === 'Completed',
            )
            .map(
              (item) =>
                item.lessonRecordId,
            );

        const unlockedWorldIds =
          Array.from(
            new Set(
              data.progress
                .filter(
                  (item) =>
                    item.status ===
                      'Unlocked' ||
                    item.status ===
                      'Completed',
                )
                .map(
                  (item) => item.worldId,
                )
                .filter(Boolean),
            ),
          );

        setStudent({
          id: data.student.id,
          name: data.student.name,
          email: data.student.email,
          rank: data.student.rank,
          xp: data.student.xp,
          tokens: data.student.tokens,
          level: data.student.level,
          avatarUrl:
            initialStudent.avatarUrl,
        });

        setProgress({
          studentId: data.student.id,
          completedChallengeIds,
          unlockedWorldIds,
          activeStreak: 0,
          dailyGoalProgress: Math.min(
            data.stats.completedLessons,
            1,
          ),
          dailyGoalMax: 1,
          earnedBadges: [],
        });

        setStats(data.stats);
      } catch (error) {
        console.error(
          'Failed to refresh profile:',
          error,
        );
      }
    }, [initialStudent.avatarUrl]);

  useEffect(() => {
    void refreshProfile();

    window.addEventListener(
      'student-progress-updated',
      refreshProfile,
    );

    return () => {
      window.removeEventListener(
        'student-progress-updated',
        refreshProfile,
      );
    };
  }, [refreshProfile]);

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10 text-left">
        <div>
          <h2 className="font-display text-3xl font-bold text-on-surface">
            Your Explorer Profile
          </h2>

          <p className="mt-1 text-xs font-medium text-on-surface-variant">
            Review your progress, scores, and
            achievements across Math Quest.
          </p>
        </div>

        <StudentProfileComponent
          student={student}
          progress={progress}
          stats={stats}
        />
      </div>
    </DashboardLayout>
  );
}