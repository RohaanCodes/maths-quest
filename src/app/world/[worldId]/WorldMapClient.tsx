'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import {
  World,
  Challenge,
  Student,
} from '../../../types';

import {
  getWorldByDomain,
  getChallengesByWorld,
  getStudent,
} from '../../../lib/data';

import {
  getWorldImage,
} from '../../../lib/world-assets';

import DashboardLayout from '../../../components/DashboardLayout';
import AdventureMap from '../../../components/AdventureMap';

interface WorldMapClientProps {
  worldId: string;
  initialWorld?: World;
  initialChallenges: Challenge[];
  initialStudent: Student;
}

export default function WorldMapClient({
  worldId,
  initialWorld,
  initialChallenges,
  initialStudent,
}: WorldMapClientProps) {
  const [world, setWorld] = useState<
    World | undefined
  >(initialWorld);

  const [challenges, setChallenges] =
    useState<Challenge[]>(initialChallenges);

  const [student, setStudent] =
    useState<Student>(initialStudent);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const router = useRouter();

  /**
   * Refresh the world, challenge statuses,
   * and student data from Airtable-backed APIs.
   */
  const refreshWorldProgress =
    useCallback(async () => {
      setIsRefreshing(true);

      try {
        const [
          refreshedWorld,
          refreshedChallenges,
          refreshedStudent,
        ] = await Promise.all([
          getWorldByDomain(worldId),
          getChallengesByWorld(worldId),
          getStudent(),
        ]);

        setWorld(refreshedWorld);
        setChallenges(refreshedChallenges);
        setStudent(refreshedStudent);
      } catch (error) {
        console.error(
          'Failed to refresh world progress:',
          error,
        );
      } finally {
        setIsRefreshing(false);
      }
    }, [worldId]);

  /**
   * Refresh once after the client mounts.
   */
  useEffect(() => {
    void refreshWorldProgress();
  }, [refreshWorldProgress]);

  /**
   * Refresh when a challenge is completed.
   */
  useEffect(() => {
    const handleProgressUpdate = () => {
      void refreshWorldProgress();
    };

    window.addEventListener(
      'student-progress-updated',
      handleProgressUpdate,
    );

    return () => {
      window.removeEventListener(
        'student-progress-updated',
        handleProgressUpdate,
      );
    };
  }, [refreshWorldProgress]);

  /**
   * Refresh after browser back/forward navigation.
   */
  useEffect(() => {
    const handlePageShow = () => {
      void refreshWorldProgress();
    };

    window.addEventListener(
      'pageshow',
      handlePageShow,
    );

    return () => {
      window.removeEventListener(
        'pageshow',
        handlePageShow,
      );
    };
  }, [refreshWorldProgress]);

  const completedCount = useMemo(
    () =>
      challenges.filter(
        (challenge) =>
          challenge.status === 'completed',
      ).length,
    [challenges],
  );

  const currentChallenge = useMemo(
    () =>
      challenges.find(
        (challenge) =>
          challenge.status === 'current',
      ),
    [challenges],
  );

  const completionPercentage =
    challenges.length > 0
      ? Math.round(
          (completedCount /
            challenges.length) *
            100,
        )
      : 0;

  const worldImage = world
    ? getWorldImage(world.id)
    : '/worlds/default.webp';

  function handleNodeClick(
    challengeId: string,
  ): void {
    const challenge = challenges.find(
      (item) =>
        item.id === challengeId,
    );

    if (!challenge) {
      return;
    }

    if (challenge.status === 'locked') {
      return;
    }

    router.push(
      `/challenge/${challengeId}`,
    );
  }

  if (!world) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="w-full max-w-md rounded-3xl border-2 border-surface-container bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-container text-outline">
              <span className="material-symbols-outlined text-3xl">
                lock
              </span>
            </div>

            <h2 className="mt-4 font-display text-xl font-bold text-on-surface">
              World unavailable
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              This world could not be loaded or has
              not been unlocked yet.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push('/adventure')
              }
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-display text-sm font-bold text-white transition hover:-translate-y-0.5"
            >
              <span className="material-symbols-outlined text-lg">
                arrow_back
              </span>

              Return to Adventure
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-7xl space-y-6 pb-12">
        {/* World hero */}
        <section className="group relative min-h-[360px] overflow-hidden rounded-[32px] border border-white/20 bg-[#07152f] shadow-[0_24px_70px_rgba(7,21,47,0.24)]">
          {/* Local public-folder artwork */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
            style={{
              backgroundImage: `url('${worldImage}')`,
            }}
          />

          {/* Cinematic overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#07152f]/95 via-[#07152f]/72 to-[#07152f]/20" />

          <div className="absolute inset-0 bg-gradient-to-t from-[#07152f]/85 via-transparent to-black/10" />

          {/* Decorative lighting */}
          <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-primary/25 blur-[90px]" />

          <div className="pointer-events-none absolute bottom-0 left-[35%] h-40 w-80 rounded-full bg-secondary/15 blur-[80px]" />

          <div className="relative z-10 flex min-h-[360px] flex-col justify-between gap-10 p-6 md:p-9 lg:flex-row lg:items-end lg:p-10">
            {/* World content */}
            <div className="max-w-3xl">
              <button
                type="button"
                onClick={() =>
                  router.push('/adventure')
                }
                className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/15 px-4 py-2.5 text-xs font-black text-white backdrop-blur-lg transition-all hover:-translate-y-0.5 hover:bg-white/15 md:mb-12"
              >
                <span className="material-symbols-outlined text-base">
                  arrow_back
                </span>

                Explore All Worlds
              </button>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/85 backdrop-blur-md">
                  <span className="material-symbols-outlined text-sm text-primary-container">
                    public
                  </span>

                  {world.region}
                </span>

                {world.status ===
                  'completed' && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                    <span className="material-symbols-outlined text-sm">
                      verified
                    </span>

                    World Completed
                  </span>
                )}

                {world.status === 'current' && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                    <span className="material-symbols-outlined text-sm">
                      explore
                    </span>

                    Current World
                  </span>
                )}
              </div>

              <h1 className="max-w-3xl font-display text-4xl font-black leading-[1.05] tracking-tight text-white md:text-6xl">
                {world.name}
              </h1>

              <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-white/75 md:text-base">
                {world.description}
              </p>

              {/* Progress bar */}
              <div className="mt-7 max-w-xl">
                <div className="mb-2.5 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-white/75">
                  <span>World Mastery</span>

                  <span className="text-white">
                    {completionPercentage}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full border border-white/15 bg-black/20 backdrop-blur-sm">
                  <div
                    className="relative h-full rounded-full bg-gradient-to-r from-primary-container via-primary to-secondary transition-all duration-700"
                    style={{
                      width: `${completionPercentage}%`,
                    }}
                  >
                    <div className="absolute inset-0 animate-glint bg-white/25" />
                  </div>
                </div>
              </div>
            </div>

            {/* World stats panel */}
            <div className="w-full rounded-3xl border border-white/15 bg-black/20 p-4 shadow-2xl backdrop-blur-xl lg:w-[380px]">
              <div className="grid grid-cols-3 gap-2.5">
                <WorldStat
                  icon="task_alt"
                  label="Cleared"
                  value={completedCount}
                />

                <WorldStat
                  icon="flag"
                  label="Missions"
                  value={challenges.length}
                />

                <WorldStat
                  icon="military_tech"
                  label="Mastery"
                  value={`${completionPercentage}%`}
                />
              </div>

              {currentChallenge && (
                <div className="mt-3 rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/55">
                    Next Mission
                  </p>

                  <h3 className="mt-1.5 line-clamp-2 font-display text-base font-black leading-snug text-white">
                    {currentChallenge.name}
                  </h3>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-[10px] font-bold text-white/60">
                      {
                        currentChallenge.difficulty
                      }
                      {' · '}
                      {
                        currentChallenge.estimatedTime
                      }
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        handleNodeClick(
                          currentChallenge.id,
                        )
                      }
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-lg transition hover:scale-105"
                      aria-label="Continue current mission"
                    >
                      <span className="material-symbols-outlined text-xl">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {isRefreshing && (
            <div className="absolute right-5 top-5 z-20 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3.5 py-2 text-[10px] font-bold text-white shadow-sm backdrop-blur-lg">
              <span className="material-symbols-outlined animate-spin text-sm">
                progress_activity
              </span>

              Updating progress
            </div>
          )}
        </section>

        {/* Current mission */}
        {currentChallenge && (
          <section className="relative overflow-hidden rounded-3xl border-2 border-primary/15 bg-white p-5 shadow-sm md:p-6">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_8px_24px_rgba(0,88,190,0.24)]">
                  <span className="material-symbols-outlined text-3xl">
                    flag
                  </span>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                    Active Mission
                  </p>

                  <h2 className="mt-1 font-display text-xl font-black leading-tight text-on-surface md:text-2xl">
                    {currentChallenge.name}
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-on-surface-variant">
                    <span className="rounded-full bg-surface-container px-2.5 py-1">
                      {
                        currentChallenge.difficulty
                      }
                    </span>

                    <span className="rounded-full bg-surface-container px-2.5 py-1">
                      {
                        currentChallenge.estimatedTime
                      }
                    </span>

                    <span className="rounded-full bg-surface-container px-2.5 py-1">
                      +{currentChallenge.xpReward} XP
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleNodeClick(
                    currentChallenge.id,
                  )
                }
                className="btn-3d inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-7 py-4 font-display text-sm font-bold text-white md:w-auto"
              >
                Continue Mission

                <span className="material-symbols-outlined text-lg">
                  arrow_forward
                </span>
              </button>
            </div>
          </section>
        )}

        {/* Adventure path */}
        <AdventureMap
          challenges={challenges}
          student={student}
          onNodeClick={handleNodeClick}
        />
      </div>
    </DashboardLayout>
  );
}

interface WorldStatProps {
  icon: string;
  label: string;
  value: string | number;
}

function WorldStat({
  icon,
  label,
  value,
}: WorldStatProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-4 text-center">
      <span className="material-symbols-outlined text-xl text-white/75">
        {icon}
      </span>

      <p className="mt-1 font-display text-xl font-black text-white">
        {value}
      </p>

      <p className="mt-1 text-[8px] font-black uppercase tracking-widest text-white/50">
        {label}
      </p>
    </div>
  );
}