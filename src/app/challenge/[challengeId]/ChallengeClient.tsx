'use client';

import React, {
  useMemo,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import {
  Challenge,
  Student,
  ExerciseAttempt,
} from '../../../types';

import {
  submitChallengeAnswers,
} from '../../../lib/data';

import DashboardLayout from '../../../components/DashboardLayout';
import ProgressIndicator from '../../../components/ProgressIndicator';
import LessonStepPlayer from '../../../components/LessonStepPlayer';
import MissionCompleteScreen from '../../../components/MissionCompleteScreen';

interface ChallengeClientProps {
  challengeId: string;
  initialChallenge?: Challenge;
  initialStudent: Student;
}

const STEP_LABELS: Record<
  Challenge['steps'][number]['type'],
  string
> = {
  intro: 'Briefing',
  learn: 'Learn',
  example: 'Example',
  video: 'Video',
  practice: 'Practice',
};

const STEP_ICONS: Record<
  Challenge['steps'][number]['type'],
  string
> = {
  intro: 'auto_awesome',
  learn: 'school',
  example: 'psychology_alt',
  video: 'play_circle',
  practice: 'swords',
};

export default function ChallengeClient({
  challengeId: _challengeId,
  initialChallenge,
  initialStudent,
}: ChallengeClientProps) {
  const [challenge] = useState<
    Challenge | undefined
  >(initialChallenge);

  const [student] = useState<Student>(
    initialStudent,
  );

  const [
    currentStepIdx,
    setCurrentStepIdx,
  ] = useState(0);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [attempt, setAttempt] =
    useState<
      ExerciseAttempt | undefined
    >(undefined);

  const [
    submitError,
    setSubmitError,
  ] = useState<string | null>(null);

  const router = useRouter();

  const activeStep =
    challenge?.steps[currentStepIdx];

  const isFirstStep =
    currentStepIdx === 0;

  const isLastStep =
    challenge
      ? currentStepIdx ===
        challenge.steps.length - 1
      : false;

  const stepProgress = useMemo(() => {
    if (!challenge?.steps.length) {
      return 0;
    }

    return Math.round(
      ((currentStepIdx + 1) /
        challenge.steps.length) *
        100,
    );
  }, [
    challenge?.steps.length,
    currentStepIdx,
  ]);

  if (!challenge) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[65vh] items-center justify-center px-4">
          <div className="w-full max-w-md rounded-[30px] border-2 border-surface-container bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-container text-outline">
              <span className="material-symbols-outlined text-3xl">
                search_off
              </span>
            </div>

            <h2 className="mt-4 font-display text-xl font-black text-on-surface">
              Challenge not found
            </h2>

            <p className="mt-2 text-sm font-medium leading-6 text-on-surface-variant">
              This mission may have been
              removed or is temporarily
              unavailable.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push('/adventure')
              }
              className="btn-3d mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 font-display text-sm font-black text-white"
            >
              <span className="material-symbols-outlined text-lg">
                map
              </span>

              Return to Adventure
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (attempt) {
    return (
      <DashboardLayout>
        <MissionCompleteScreen
          score={attempt.score}
          maxScore={attempt.maxScore}
          pointsEarned={
            attempt.pointsEarned
          }
          totalPoints={
            attempt.totalPoints
          }
          xpGained={attempt.xpGained}
          gemsGained={
            attempt.gemsGained
          }
          studentLevel={student.level}
          questions={challenge.questions}
          results={attempt.results}
          onBackToMap={() => {
            window.dispatchEvent(
              new Event(
                'student-progress-updated',
              ),
            );

            router.push(
              `/world/${challenge.worldId}`,
            );
          }}
        />
      </DashboardLayout>
    );
  }

  function handleNext(): void {
    if (
      currentStepIdx <
      challenge.steps.length - 1
    ) {
      setCurrentStepIdx(
        (previous) => previous + 1,
      );

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }

  function handlePrev(): void {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(
        (previous) => previous - 1,
      );

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }

  function handleStepSelect(
    index: number,
  ): void {
    if (
      index < 0 ||
      index >= challenge.steps.length
    ) {
      return;
    }

    setCurrentStepIdx(index);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  async function handleFormSubmit(
    answers: Record<string, string>,
  ): Promise<void> {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response =
        await submitChallengeAnswers(
          challenge.id,
          answers,
        );

      window.dispatchEvent(
        new Event(
          'student-progress-updated',
        ),
      );

      setAttempt(response);
    } catch (error) {
      console.error(
        'Failed to submit challenge:',
        error,
      );

      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Something went wrong while checking your answers.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-7xl pb-28">
        {/* Challenge shell header */}
        <header className="sticky top-0 z-30 mb-6 pt-1">
          <div className="overflow-hidden rounded-[26px] border-2 border-surface-container bg-white/95 shadow-md backdrop-blur-xl">
            <div className="flex items-center gap-4 px-4 py-4 md:px-5">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/world/${challenge.worldId}`,
                  )
                }
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-surface-container-high bg-surface-container-low text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface"
                aria-label="Exit challenge"
                title="Exit to map"
              >
                <span className="material-symbols-outlined text-xl">
                  close
                </span>
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[8px] font-black uppercase tracking-[0.18em] text-primary">
                      Active Mission
                    </p>

                    <h1 className="mt-1 truncate font-display text-base font-black text-on-surface md:text-lg">
                      {challenge.name}
                    </h1>
                  </div>

                  <div className="hidden items-center gap-2 sm:flex">
                    <span className="rounded-full bg-surface-container px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-on-surface-variant">
                      {
                        challenge.difficulty
                      }
                    </span>

                    <span className="rounded-full bg-surface-container px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-on-surface-variant">
                      {
                        challenge.estimatedTime
                      }
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <ProgressIndicator
                    currentStepIndex={
                      currentStepIdx
                    }
                    totalSteps={
                      challenge.steps.length
                    }
                  />
                </div>
              </div>

              <div className="hidden shrink-0 items-center gap-3 lg:flex">
                <div className="text-right">
                  <p className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant">
                    Lesson Progress
                  </p>

                  <p className="mt-1 font-display text-sm font-black text-primary">
                    {stepProgress}%
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-primary-fixed">
                  <img
                    className="h-full w-full object-cover"
                    src={student.avatarUrl}
                    alt={student.name}
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>

            {/* Step tabs */}
            <div className="border-t border-surface-container-high px-3 py-3">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {challenge.steps.map(
                  (step, index) => {
                    const isActive =
                      index === currentStepIdx;

                    const isComplete =
                      index < currentStepIdx;

                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() =>
                          handleStepSelect(index)
                        }
                        className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-[9px] font-black uppercase tracking-wider transition ${
                          isActive
                            ? 'border-primary bg-primary text-white shadow-sm'
                            : isComplete
                              ? 'border-secondary/20 bg-secondary-fixed/30 text-secondary'
                              : 'border-surface-container-high bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {isComplete
                            ? 'check_circle'
                            : STEP_ICONS[
                                step.type
                              ]}
                        </span>

                        {
                          STEP_LABELS[
                            step.type
                          ]
                        }
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Submission error */}
        {submitError && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-error/20 bg-error-container/40 p-4 text-on-error-container">
            <span className="material-symbols-outlined mt-0.5 text-xl">
              error
            </span>

            <div className="flex-1">
              <p className="font-display text-sm font-black">
                Submission failed
              </p>

              <p className="mt-1 text-xs font-medium leading-6">
                {submitError}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setSubmitError(null)
              }
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5"
              aria-label="Dismiss error"
            >
              <span className="material-symbols-outlined text-lg">
                close
              </span>
            </button>
          </div>
        )}

        {/* Active step */}
        <main className="min-h-[480px]">
          {activeStep ? (
            <LessonStepPlayer
              step={activeStep}
              questions={
                challenge.questions
              }
              onFormSubmit={
                handleFormSubmit
              }
              isSubmitting={
                isSubmitting
              }
            />
          ) : (
            <div className="rounded-[28px] border-2 border-surface-container bg-white p-8 text-center shadow-sm">
              <p className="font-display text-lg font-black text-on-surface">
                This lesson step is unavailable.
              </p>
            </div>
          )}
        </main>

        {/* Bottom navigation */}
        {activeStep && (
          <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-surface-container-high bg-white/95 p-3 shadow-[0_-10px_35px_rgba(7,21,47,0.08)] backdrop-blur-xl md:left-20 min-[1800px]:left-64">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-1 md:px-6">
              <button
                type="button"
                onClick={handlePrev}
                disabled={isFirstStep}
                className={`inline-flex min-w-[104px] items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 font-display text-xs font-black uppercase tracking-wider transition ${
                  isFirstStep
                    ? 'cursor-not-allowed border-surface-container text-outline opacity-40'
                    : 'border-surface-container-high bg-white text-on-surface hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  arrow_back
                </span>

                <span className="hidden sm:inline">
                  Back
                </span>
              </button>

              <div className="min-w-0 flex-1 text-center">
                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
                  Step {currentStepIdx + 1} of{' '}
                  {challenge.steps.length}
                </p>

                <p className="mt-1 truncate font-display text-xs font-black text-on-surface">
                  {activeStep.title}
                </p>
              </div>

              {isLastStep ? (
                <div className="inline-flex min-w-[104px] items-center justify-center gap-2 rounded-2xl bg-secondary-container px-4 py-3 font-display text-[9px] font-black uppercase tracking-wider text-on-secondary-container">
                  <span className="material-symbols-outlined text-base">
                    swords
                  </span>

                  <span className="hidden sm:inline">
                    Practice
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-3d inline-flex min-w-[104px] items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 font-display text-xs font-black uppercase tracking-wider text-white"
                >
                  <span className="hidden sm:inline">
                    Continue
                  </span>

                  <span className="material-symbols-outlined text-base">
                    arrow_forward
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}