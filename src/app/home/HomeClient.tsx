'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import {
  Challenge,
  Student,
  StudentProgress,
  World,
} from '../../types';

import {
  getChallengesByWorld,
  getStudent,
  getStudentProgress,
  getWorlds,
  resetProgress,
} from '../../lib/data';

import {
  getWorldImage,
} from '../../lib/world-assets';

import DashboardLayout from '../../components/DashboardLayout';
import WorldCard from '../../components/WorldCard';

interface HomeClientProps {
  initialWorlds: World[];
  initialStudent: Student;
  initialProgress: StudentProgress;
}

export default function HomeClient({
  initialWorlds,
  initialStudent,
  initialProgress,
}: HomeClientProps) {
  const [worlds, setWorlds] =
    useState<World[]>(initialWorlds);

  const [student, setStudent] =
    useState<Student>(initialStudent);

  const [progress, setProgress] =
    useState<StudentProgress>(
      initialProgress,
    );

  const [
    currentChallenge,
    setCurrentChallenge,
  ] = useState<Challenge | undefined>(
    undefined,
  );

  const [
    isLoadingChallenge,
    setIsLoadingChallenge,
  ] = useState(false);

  const router = useRouter();

  const currentWorld = useMemo(() => {
    return (
      worlds.find(
        (world) =>
          world.status === 'current',
      ) ||
      worlds.find(
        (world) =>
          world.status === 'completed',
      ) ||
      worlds[0]
    );
  }, [worlds]);

  const currentWorldImage = currentWorld
    ? getWorldImage(currentWorld.id)
    : '/worlds/default.webp';

  const currentChallengeImage =
    currentChallenge
      ? `/challenges/${currentChallenge.id}.webp`
      : currentWorldImage;

  const fetchCurrentChallenge =
    useCallback(
      async (
        world: World | undefined,
      ): Promise<void> => {
        if (!world) {
          setCurrentChallenge(undefined);
          return;
        }

        setIsLoadingChallenge(true);

        try {
          const challenges =
            await getChallengesByWorld(
              world.id,
            );

          const activeChallenge =
            challenges.find(
              (challenge) =>
                challenge.status ===
                'current',
            ) ||
            challenges.find(
              (challenge) =>
                challenge.status !==
                'locked',
            ) ||
            challenges[0];

          setCurrentChallenge(
            activeChallenge,
          );
        } catch (error) {
          console.error(
            'Failed to load current challenge:',
            error,
          );

          setCurrentChallenge(undefined);
        } finally {
          setIsLoadingChallenge(false);
        }
      },
      [],
    );

  const fetchHomeData =
    useCallback(async (): Promise<void> => {
      try {
        const [
          latestWorlds,
          latestStudent,
          latestProgress,
        ] = await Promise.all([
          getWorlds(),
          getStudent(),
          getStudentProgress(),
        ]);

        setWorlds(latestWorlds);
        setStudent(latestStudent);
        setProgress(latestProgress);

        const latestCurrentWorld =
          latestWorlds.find(
            (world) =>
              world.status === 'current',
          ) ||
          latestWorlds.find(
            (world) =>
              world.status ===
              'completed',
          ) ||
          latestWorlds[0];

        await fetchCurrentChallenge(
          latestCurrentWorld,
        );
      } catch (error) {
        console.error(
          'Failed to refresh home data:',
          error,
        );
      }
    }, [fetchCurrentChallenge]);

  useEffect(() => {
    void fetchHomeData();

    const handleProgressUpdate = () => {
      void fetchHomeData();
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
  }, [fetchHomeData]);

  useEffect(() => {
    if (
      currentWorld &&
      !currentChallenge
    ) {
      void fetchCurrentChallenge(
        currentWorld,
      );
    }
  }, [
    currentWorld,
    currentChallenge,
    fetchCurrentChallenge,
  ]);

  function handleExploreWorld(
    worldId: string,
  ): void {
    router.push(`/world/${worldId}`);
  }

  function handleContinueAdventure(): void {
    if (currentChallenge) {
      router.push(
        `/challenge/${currentChallenge.id}`,
      );

      return;
    }

    if (currentWorld) {
      router.push(
        `/world/${currentWorld.id}`,
      );
    }
  }

  function handleReset(): void {
    resetProgress();

    window.dispatchEvent(
      new Event(
        'student-progress-updated',
      ),
    );

    void fetchHomeData();
  }

  function handleChallengeImageError(
    event: React.SyntheticEvent<
      HTMLImageElement
    >,
  ): void {
    const image = event.currentTarget;

    if (
      image.dataset.fallbackApplied !==
      'true'
    ) {
      image.dataset.fallbackApplied =
        'true';

      image.src = currentWorldImage;

      return;
    }

    image.src =
      '/worlds/default.webp';
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        {/* Welcome header */}
        <section className="relative overflow-hidden rounded-[28px] border-2 border-surface-container bg-white p-5 shadow-sm md:p-6">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-secondary/5 blur-3xl" />

          <div className="relative flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-center">
            <div className="flex items-center gap-4 text-left">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-primary shadow-inner">
                <span className="material-symbols-outlined filled text-3xl">
                  sports_esports
                </span>
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-primary">
                  Math Quest
                </p>

                <h1 className="mt-1 font-display text-2xl font-black leading-tight text-on-surface lg:text-3xl">
                  Welcome back,{' '}
                  {student.name}!
                </h1>

                <p className="mt-1 text-xs font-medium leading-5 text-on-surface-variant">
                  Your next mathematical
                  adventure is ready.
                </p>
              </div>
            </div>

            <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto">
              <MetricPill
                icon="local_fire_department"
                label="Streak"
                value={`${progress.activeStreak} Days`}
                iconClass="text-amber-500"
              />

              <MetricPill
                icon="bolt"
                label="Level"
                value={String(student.level)}
                iconClass="text-primary"
              />

              <MetricPill
                icon="stars"
                label="XP"
                value={String(student.xp)}
                iconClass="text-tertiary"
              />

              <button
                type="button"
                onClick={handleReset}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-error-container/30 bg-error-container/10 text-error transition-colors hover:bg-error-container/20"
                title="Reset all progress for testing"
                aria-label="Reset progress"
              >
                <span className="material-symbols-outlined">
                  restart_alt
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Dynamic current challenge */}
        {currentWorld && (
          <section className="group relative min-h-[390px] overflow-hidden rounded-[32px] border border-white/20 bg-[#07152f] shadow-[0_24px_70px_rgba(7,21,47,0.24)]">
            <img
              key={
                currentChallenge?.id ||
                currentWorld.id
              }
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.035]"
              src={currentChallengeImage}
              alt={
                currentChallenge
                  ? `${currentChallenge.name} challenge artwork`
                  : `${currentWorld.name} world artwork`
              }
              onError={
                handleChallengeImageError
              }
            />

            {/* Cinematic overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#07152f]/96 via-[#07152f]/72 to-[#07152f]/15" />

            <div className="absolute inset-0 bg-gradient-to-t from-[#07152f]/90 via-transparent to-black/10" />

            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/25 blur-[100px]" />

            <div className="pointer-events-none absolute bottom-0 left-[35%] h-44 w-80 rounded-full bg-secondary/15 blur-[90px]" />

            <div className="relative z-10 flex min-h-[390px] flex-col justify-between gap-8 p-6 md:p-9 lg:flex-row lg:items-end lg:p-10">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-primary/90 px-3.5 py-2 font-display text-[9px] font-black uppercase tracking-[0.16em] text-white shadow-lg backdrop-blur-md">
                    <span className="material-symbols-outlined text-sm">
                      flag
                    </span>

                    Current Challenge
                  </span>

                  <span className="rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-white/75 backdrop-blur-md">
                    {currentWorld.region}
                  </span>

                  {currentChallenge && (
                    <>
                      <span className="rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-white/75 backdrop-blur-md">
                        {
                          currentChallenge.difficulty
                        }
                      </span>

                      <span className="rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-white/75 backdrop-blur-md">
                        {
                          currentChallenge.estimatedTime
                        }
                      </span>
                    </>
                  )}
                </div>

                <p className="mt-6 text-[9px] font-black uppercase tracking-[0.2em] text-primary-container">
                  {currentWorld.name}
                </p>

                <h2 className="mt-2 max-w-3xl font-display text-4xl font-black leading-[1.03] tracking-tight text-white drop-shadow-xl md:text-5xl">
                  {currentChallenge
                    ?.name ||
                    currentWorld.currentQuestName ||
                    'Continue Your Adventure'}
                </h2>

                <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-white/75 md:text-base">
                  {currentChallenge
                    ?.description ||
                    currentWorld.description}
                </p>

                {currentChallenge && (
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white/65">
                      <span className="material-symbols-outlined text-lg text-amber-300">
                        stars
                      </span>

                      +
                      {
                        currentChallenge.xpReward
                      }{' '}
                      XP
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white/65">
                      <span className="material-symbols-outlined text-lg text-secondary-container">
                        quiz
                      </span>

                      {
                        currentChallenge
                          .questions.length
                      }{' '}
                      Questions
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white/65">
                      <span className="material-symbols-outlined text-lg text-primary-container">
                        route
                      </span>

                      {
                        currentChallenge
                          .steps.length
                      }{' '}
                      Stages
                    </span>
                  </div>
                )}
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto">
                <button
                  type="button"
                  onClick={
                    handleContinueAdventure
                  }
                  disabled={
                    isLoadingChallenge
                  }
                  className="btn-3d inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 font-display text-sm font-black uppercase tracking-wider text-white disabled:cursor-wait disabled:opacity-70 sm:w-auto"
                >
                  {isLoadingChallenge ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-lg">
                        progress_activity
                      </span>

                      Loading
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">
                        play_arrow
                      </span>

                      Continue Challenge
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleExploreWorld(
                      currentWorld.id,
                    )
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-7 py-3.5 font-display text-xs font-black text-white backdrop-blur-md transition hover:bg-white/15 sm:w-auto"
                >
                  <span className="material-symbols-outlined text-lg">
                    map
                  </span>

                  View World Map
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Worlds */}
        <section className="space-y-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">
              Your Adventure
            </p>

            <h2 className="mt-1 font-display text-2xl font-black text-on-surface">
              Explore Math Regions
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {worlds.map((world) => (
              <WorldCard
                key={world.id}
                world={world}
                onExplore={
                  handleExploreWorld
                }
              />
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

interface MetricPillProps {
  icon: string;
  label: string;
  value: string;
  iconClass: string;
}

function MetricPill({
  icon,
  label,
  value,
  iconClass,
}: MetricPillProps) {
  return (
    <div className="flex min-h-12 flex-1 items-center gap-2 rounded-2xl border border-surface-container bg-surface-container-low px-4 py-2.5 sm:flex-none">
      <span
        className={`material-symbols-outlined filled ${iconClass}`}
      >
        {icon}
      </span>

      <div className="text-left leading-none">
        <span className="block text-[9px] font-black uppercase tracking-wider text-on-surface-variant">
          {label}
        </span>

        <span className="mt-1 block font-display text-sm font-black text-on-surface">
          {value}
        </span>
      </div>
    </div>
  );
}