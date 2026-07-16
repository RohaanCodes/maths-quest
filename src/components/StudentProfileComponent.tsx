import React from 'react';

import {
  Student,
  StudentProgress,
  StudentStats,
} from '../types';

interface StudentProfileComponentProps {
  student: Student;
  progress: StudentProgress;
  stats?: StudentStats;
}

export const StudentProfileComponent: React.FC<
  StudentProfileComponentProps
> = ({
  student,
  progress,
  stats,
}) => {
  const xpPerLevel = 250;

  /*
   * Airtable stores lifetime XP.
   * Calculate progress inside the current level.
   */
  const currentLevelStartXp =
    Math.max(0, (student.level - 1) * xpPerLevel);

  const nextLevelXp =
    student.level * xpPerLevel;

  const xpInsideCurrentLevel =
    Math.max(
      0,
      student.xp - currentLevelStartXp,
    );

  const levelProgressPercentage =
    Math.min(
      100,
      Math.max(
        0,
        (xpInsideCurrentLevel / xpPerLevel) *
          100,
      ),
    );

  const completedLessons =
    stats?.completedLessons ??
    progress.completedChallengeIds.length;

  const totalLessons =
    stats?.totalLessons ?? 60;

  const unlockedWorlds =
    progress.unlockedWorldIds.length;

  const completionPercentage =
    stats?.completionPercentage ??
    (totalLessons > 0
      ? Math.round(
          (completedLessons / totalLessons) *
            100,
        )
      : 0);

  const totalAttempts =
    stats?.totalAttempts ?? 0;

  const bestScore =
    stats?.bestScore ?? 0;

  const totalPointsEarned =
    stats?.totalPointsEarned ?? 0;

  return (
    <div className="w-full space-y-6">
      {/* Profile hero */}
      <section className="relative overflow-hidden rounded-3xl border-2 border-surface-container bg-white p-6 shadow-sm lg:p-8">
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative flex flex-col items-center gap-7 md:flex-row md:items-center">
          {/* Avatar */}
          <div className="group relative shrink-0">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-primary to-secondary opacity-60 blur-sm transition-opacity group-hover:opacity-90" />

            <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-md">
              <img
                className="h-full w-full object-cover"
                src={student.avatarUrl}
                alt={student.name}
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-white bg-primary px-3 py-1 font-display text-xs font-black uppercase tracking-wide text-white shadow-sm">
              Level {student.level}
            </div>
          </div>

          {/* Identity and XP */}
          <div className="min-w-0 flex-1 text-center md:text-left">
            <span className="inline-flex rounded-full bg-primary-fixed px-3 py-1 font-display text-[10px] font-black uppercase tracking-widest text-on-primary-fixed-variant">
              {student.rank} Explorer
            </span>

            <h1 className="mt-2 truncate font-display text-3xl font-black leading-tight text-on-surface md:text-4xl">
              {student.name}
            </h1>

            <p className="mt-1 text-xs font-semibold text-on-surface-variant">
              Student ID:{' '}
              <span className="font-mono font-black text-primary">
                {student.id}
              </span>
              {' · '}
              Status:{' '}
              <span className="font-bold text-secondary">
                Active
              </span>
            </p>

            <div className="mx-auto mt-5 max-w-xl space-y-2 md:mx-0">
              <div className="flex items-center justify-between gap-3 text-[11px] font-bold text-on-surface-variant">
                <span>
                  {xpInsideCurrentLevel} /{' '}
                  {xpPerLevel} XP
                </span>

                <span className="font-extrabold text-primary">
                  {Math.max(
                    0,
                    nextLevelXp - student.xp,
                  )}{' '}
                  XP to Level {student.level + 1}
                </span>
              </div>

              <div className="relative h-4 w-full overflow-hidden rounded-full bg-surface-container-highest">
                <div
                  className="relative h-full rounded-full bg-gradient-to-r from-primary to-primary-container transition-all duration-500"
                  style={{
                    width: `${levelProgressPercentage}%`,
                  }}
                >
                  <div className="absolute inset-0 animate-glint bg-white/20" />
                </div>
              </div>

              <p className="text-[10px] font-semibold text-on-surface-variant">
                {student.xp} lifetime XP earned
              </p>
            </div>
          </div>

          {/* Completion block */}
          <div className="w-full shrink-0 rounded-2xl border-2 border-primary/15 bg-primary-fixed/20 p-5 text-center md:w-52">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-sm">
              <span className="material-symbols-outlined text-2xl">
                workspace_premium
              </span>
            </div>

            <p className="mt-3 font-display text-[10px] font-black uppercase tracking-widest text-primary">
              Curriculum Progress
            </p>

            <h2 className="mt-1 font-display text-3xl font-black text-on-surface">
              {completionPercentage}%
            </h2>

            <p className="mt-1 text-xs font-semibold text-on-surface-variant">
              {completedLessons} of {totalLessons}{' '}
              missions complete
            </p>
          </div>
        </div>
      </section>

      {/* Real statistics */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon="task_alt"
          label="Missions Completed"
          value={completedLessons}
          suffix={`/ ${totalLessons}`}
          iconClassName="text-primary"
        />

        <StatCard
          icon="history_edu"
          label="Total Attempts"
          value={totalAttempts}
          suffix="Attempts"
          iconClassName="text-secondary"
        />

        <StatCard
          icon="verified"
          label="Best Score"
          value={bestScore}
          suffix="%"
          iconClassName="text-tertiary"
        />

        <StatCard
          icon="stars"
          label="Points Earned"
          value={totalPointsEarned}
          suffix="Points"
          iconClassName="text-primary"
        />
      </section>

      {/* Learning journey */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-3xl border-2 border-surface-container bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3 border-b border-surface-container-high pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container">
              <span className="material-symbols-outlined">
                route
              </span>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-secondary">
                Learning Journey
              </p>

              <h3 className="font-display text-xl font-black text-on-surface">
                Adventure progress
              </h3>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <JourneyMetric
              label="Worlds Available"
              value={unlockedWorlds}
              icon="public"
            />

            <JourneyMetric
              label="Current World"
              value={
                stats?.currentWorldId
                  ? formatWorldName(
                      stats.currentWorldId,
                    )
                  : 'First World'
              }
              icon="map"
            />

            <JourneyMetric
              label="Current Mission"
              value={
                stats?.currentLessonRecordId
                  ? `Mission ${
                      completedLessons + 1
                    }`
                  : 'Not started'
              }
              icon="flag"
            />
          </div>
        </div>

        {/* Daily activity */}
        <div className="rounded-3xl border-2 border-surface-container bg-white p-6 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-tertiary-container text-on-tertiary-container">
            <span className="material-symbols-outlined">
              local_fire_department
            </span>
          </div>

          <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            Daily Activity
          </p>

          <h3 className="mt-1 font-display text-2xl font-black text-on-surface">
            {progress.dailyGoalProgress} /{' '}
            {progress.dailyGoalMax}
          </h3>

          <p className="mt-1 text-xs font-medium text-on-surface-variant">
            Daily learning goal
          </p>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-surface-container-highest">
            <div
              className="h-full rounded-full bg-tertiary transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  progress.dailyGoalMax > 0
                    ? (progress.dailyGoalProgress /
                        progress.dailyGoalMax) *
                        100
                    : 0,
                )}%`,
              }}
            />
          </div>

          <div className="mt-5 flex items-center justify-between rounded-2xl bg-surface-container-low p-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                Active Streak
              </p>

              <p className="mt-1 font-display text-xl font-black text-on-surface">
                {progress.activeStreak} days
              </p>
            </div>

            <span className="material-symbols-outlined text-3xl text-tertiary">
              local_fire_department
            </span>
          </div>
        </div>
      </section>

      {/* Badges */}
      <section className="rounded-3xl border-2 border-surface-container bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-surface-container-high pb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
            <span className="material-symbols-outlined">
              military_tech
            </span>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">
              Achievements
            </p>

            <h3 className="font-display text-xl font-black text-on-surface">
              Earned badges
            </h3>
          </div>
        </div>

        {progress.earnedBadges.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {progress.earnedBadges.map(
              (badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-4 rounded-2xl border-2 border-surface-container bg-surface p-5 shadow-inner transition hover:-translate-y-0.5"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-surface-variant bg-white shadow-sm">
                    {badge.image ? (
                      <img
                        className="h-[90%] w-[90%] object-contain"
                        src={badge.image}
                        alt={badge.name}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-3xl text-primary">
                        military_tech
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 text-left">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-primary">
                      {badge.type} badge
                    </span>

                    <h4 className="mt-1 truncate font-display text-sm font-black text-on-surface">
                      {badge.name}
                    </h4>

                    <p className="mt-1 line-clamp-2 text-xs font-medium leading-snug text-on-surface-variant">
                      {badge.description}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-surface-container-high bg-surface-container-low px-6 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-outline shadow-sm">
              <span className="material-symbols-outlined text-3xl">
                military_tech
              </span>
            </div>

            <h4 className="mt-4 font-display text-lg font-black text-on-surface">
              Your badge collection begins here
            </h4>

            <p className="mt-2 max-w-md text-xs font-medium leading-relaxed text-on-surface-variant">
              Complete missions and master new
              worlds to earn special achievement
              badges.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  suffix: string;
  iconClassName: string;
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  iconClassName,
}: StatCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border-2 border-surface-container bg-white p-5 text-left shadow-sm">
      <span
        className={`material-symbols-outlined text-3xl ${iconClassName}`}
      >
        {icon}
      </span>

      <p className="mt-2 font-display text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
        {label}
      </p>

      <h2 className="mt-1 font-display text-2xl font-black leading-none text-on-surface">
        {value}{' '}
        <span className="text-xs font-semibold text-on-surface-variant">
          {suffix}
        </span>
      </h2>
    </div>
  );
}

interface JourneyMetricProps {
  label: string;
  value: string | number;
  icon: string;
}

function JourneyMetric({
  label,
  value,
  icon,
}: JourneyMetricProps) {
  return (
    <div className="rounded-2xl bg-surface-container-low p-4">
      <span className="material-symbols-outlined text-xl text-primary">
        {icon}
      </span>

      <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-on-surface-variant">
        {label}
      </p>

      <p className="mt-1 line-clamp-2 font-display text-sm font-black text-on-surface">
        {value}
      </p>
    </div>
  );
}

function formatWorldName(
  worldId: string,
): string {
  return worldId
    .replace(/^world-/, '')
    .replace(/^\d+-[a-z]+-/, '')
    .split('-')
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(' ');
}

export default StudentProfileComponent;