'use client';

import React, { useEffect, useState } from 'react';
import {
  ExerciseQuestion,
  ExerciseQuestionResult,
} from '../types';

interface MissionCompleteScreenProps {
  score: number;
  maxScore: number;

  pointsEarned: number;
  totalPoints: number;

  xpGained: number;
  gemsGained: number;
  studentLevel: number;

  questions: ExerciseQuestion[];
  results: ExerciseQuestionResult[];

  onBackToMap: () => void;
}

interface ConfettiParticle {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
  shape: string;
}

export const MissionCompleteScreen: React.FC<
  MissionCompleteScreenProps
> = ({
  score,
  maxScore,
  pointsEarned,
  totalPoints,
  xpGained,
  gemsGained,
  studentLevel,
  questions,
  results,
  onBackToMap,
}) => {
  const [confetti, setConfetti] = useState<
    ConfettiParticle[]
  >([]);

  const percentage =
    maxScore > 0
      ? Math.round((score / maxScore) * 100)
      : 0;

  useEffect(() => {
    const colors = [
      '#0058be',
      '#006c49',
      '#825100',
      '#2170e4',
      '#4edea3',
      '#ffddb8',
    ];

    const shapes = [
      'rounded-full',
      'rounded-sm',
    ];

    const particles = Array.from({
      length: 60,
    }).map((_, index) => ({
      id: index,
      left: Math.random() * 100,
      size: Math.random() * 8 + 6,
      delay: Math.random() * 2,
      duration: Math.random() * 2 + 3,
      color:
        colors[
          Math.floor(Math.random() * colors.length)
        ],
      shape:
        shapes[
          Math.floor(Math.random() * shapes.length)
        ],
    }));

    setConfetti(particles);
  }, []);

  function getQuestion(
    questionId: string,
  ): ExerciseQuestion | undefined {
    return questions.find(
      (question) => question.id === questionId,
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-surface px-4 py-10 md:px-6">
      {/* Confetti */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        {confetti.map((particle) => (
          <div
            key={particle.id}
            className={`absolute animate-confetti ${particle.shape}`}
            style={{
              left: `${particle.left}%`,
              top: '-20px',
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute left-1/2 top-64 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-[100px]" />

      <div className="relative z-20 mx-auto flex w-full max-w-5xl flex-col items-center">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-display text-4xl tracking-tight text-primary lg:text-5xl">
            Mission Complete
          </h1>

          <p className="font-display text-lg font-bold text-on-surface-variant">
            You answered {score} of {maxScore}{' '}
            questions correctly.
          </p>
        </div>

        {/* Summary */}
        <div className="mb-8 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border-b-4 border-surface-container-highest bg-white p-5 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
              <span className="material-symbols-outlined">
                task_alt
              </span>
            </div>

            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Score
            </p>

            <p className="mt-1 font-display text-3xl font-black text-primary">
              {score}/{maxScore}
            </p>
          </div>

          <div className="rounded-2xl border-b-4 border-surface-container-highest bg-white p-5 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
              <span className="material-symbols-outlined">
                percent
              </span>
            </div>

            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Accuracy
            </p>

            <p className="mt-1 font-display text-3xl font-black text-secondary">
              {percentage}%
            </p>
          </div>

          <div className="rounded-2xl border-b-4 border-surface-container-highest bg-white p-5 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary-fixed text-primary">
              <span className="material-symbols-outlined">
                star
              </span>
            </div>

            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Points
            </p>

            <p className="mt-1 font-display text-3xl font-black text-primary">
              {pointsEarned}/{totalPoints}
            </p>
          </div>

          <div className="rounded-2xl border-b-4 border-surface-container-highest bg-white p-5 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-tertiary-container text-on-tertiary-container">
              <span className="material-symbols-outlined">
                diamond
              </span>
            </div>

            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Rewards
            </p>

            <p className="mt-1 font-display text-2xl font-black text-tertiary">
              +{xpGained} XP
            </p>

            <p className="text-xs font-bold text-on-surface-variant">
              +{gemsGained} Gems
            </p>
          </div>
        </div>

        {/* Answer review */}
        <div className="w-full rounded-3xl border-2 border-surface-container bg-white p-5 shadow-sm md:p-7">
          <div className="mb-5 flex items-center justify-between gap-4 border-b border-surface-container-high pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                Answer Review
              </p>

              <h2 className="mt-1 font-display text-2xl font-bold text-on-surface">
                See what you got right
              </h2>
            </div>

            <div className="rounded-full bg-surface-container px-4 py-2 text-xs font-bold text-on-surface-variant">
              Level {studentLevel}
            </div>
          </div>

          <div className="space-y-4">
            {results.map((result, index) => {
              const question = getQuestion(
                result.questionId,
              );

              return (
                <div
                  key={result.questionId}
                  className={`rounded-2xl border-2 p-5 ${
                    result.isCorrect
                      ? 'border-secondary/30 bg-secondary-fixed/20'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white ${
                        result.isCorrect
                          ? 'bg-secondary'
                          : 'bg-red-500'
                      }`}
                    >
                      <span className="material-symbols-outlined">
                        {result.isCorrect
                          ? 'check'
                          : 'close'}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-display text-xs font-black uppercase tracking-wider text-on-surface-variant">
                          Question{' '}
                          {question?.number ??
                            index + 1}
                        </p>

                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                            result.isCorrect
                              ? 'bg-secondary-container text-on-secondary-container'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {result.isCorrect
                            ? `+${result.pointsEarned} points`
                            : `0/${result.maxPoints} points`}
                        </span>
                      </div>

                      <p className="mt-2 whitespace-pre-line font-display text-base font-bold leading-relaxed text-on-surface">
                        {question?.questionText ||
                          'Math question'}
                      </p>

                      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="rounded-xl border border-surface-container-high bg-white p-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                            Your Answer
                          </p>

                          <p
                            className={`mt-1 break-words font-mono text-sm font-bold ${
                              result.isCorrect
                                ? 'text-secondary'
                                : 'text-red-600'
                            }`}
                          >
                            {result.studentAnswer ||
                              'No answer'}
                          </p>
                        </div>

                        <div className="rounded-xl border border-surface-container-high bg-white p-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                            Correct Answer
                          </p>

                          <p className="mt-1 break-words font-mono text-sm font-bold text-primary">
                            {result.correctAnswer ||
                              'Teacher review required'}
                          </p>
                        </div>
                      </div>

                      {result.explanation && (
                        <div className="mt-3 rounded-xl border border-primary/15 bg-primary-fixed/20 p-4">
                          <p className="flex items-center gap-2 text-xs font-bold text-primary">
                            <span className="material-symbols-outlined text-base">
                              lightbulb
                            </span>
                            Explanation
                          </p>

                          <p className="mt-1 whitespace-pre-line text-xs font-medium leading-relaxed text-on-surface-variant">
                            {result.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Continue */}
        <div className="mt-8 w-full max-w-sm">
          <button
            onClick={onBackToMap}
            className="btn-3d flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-display text-base font-bold text-white"
          >
            <span className="material-symbols-outlined">
              map
            </span>

            <span>Continue Adventure</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MissionCompleteScreen;