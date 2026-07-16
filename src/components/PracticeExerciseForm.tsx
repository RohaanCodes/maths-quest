import React, {
  useMemo,
  useState,
} from 'react';

import { ExerciseQuestion } from '../types';

interface PracticeExerciseFormProps {
  questions: ExerciseQuestion[];
  onSubmit: (
    answers: Record<string, string>,
  ) => void;
  isSubmitting?: boolean;
}

export const PracticeExerciseForm: React.FC<
  PracticeExerciseFormProps
> = ({
  questions,
  onSubmit,
  isSubmitting = false,
}) => {
  const [answers, setAnswers] =
    useState<Record<string, string>>({});

  const [showHints, setShowHints] =
    useState<Record<string, boolean>>({});

  const answeredCount = useMemo(
    () =>
      questions.filter((question) =>
        Boolean(
          answers[question.id]?.trim(),
        ),
      ).length,
    [answers, questions],
  );

  const completionPercentage =
    questions.length > 0
      ? Math.round(
          (answeredCount /
            questions.length) *
            100,
        )
      : 0;

  const allQuestionsAnswered =
    questions.length > 0 &&
    answeredCount === questions.length;

  function updateAnswer(
    questionId: string,
    answer: string,
  ): void {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: answer,
    }));
  }

  function toggleHint(
    questionId: string,
  ): void {
    setShowHints((previous) => ({
      ...previous,
      [questionId]:
        !previous[questionId],
    }));
  }

  function handleSubmit(
    event: React.FormEvent,
  ): void {
    event.preventDefault();

    if (
      !allQuestionsAnswered ||
      isSubmitting
    ) {
      return;
    }

    onSubmit(answers);
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-[26px] border-2 border-dashed border-surface-container-high bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-container text-outline">
          <span className="material-symbols-outlined text-3xl">
            quiz
          </span>
        </div>

        <h3 className="mt-4 font-display text-lg font-black text-on-surface">
          No practice questions available
        </h3>

        <p className="mt-2 text-xs font-medium leading-6 text-on-surface-variant">
          Questions have not been added to
          this mission yet.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Exercise progress */}
      <div className="sticky top-4 z-20 rounded-2xl border border-surface-container-high bg-white/95 p-4 shadow-md backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-secondary">
              Challenge Progress
            </p>

            <p className="mt-1 font-display text-sm font-black text-on-surface">
              {answeredCount} of{' '}
              {questions.length} answered
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary-container font-display text-xs font-black text-on-secondary-container">
            {completionPercentage}%
          </div>
        </div>

        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface-container-highest">
          <div
            className="relative h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
            style={{
              width: `${completionPercentage}%`,
            }}
          >
            <div className="absolute inset-0 animate-glint bg-white/25" />
          </div>
        </div>
      </div>

      {questions.map(
        (question, index) => {
          const answer =
            answers[question.id] || '';

          const hasAnswer =
            Boolean(answer.trim());

          return (
            <section
              key={question.id}
              className={`relative overflow-hidden rounded-[26px] border-2 bg-white p-5 shadow-sm transition-all duration-300 md:p-6 ${
                hasAnswer
                  ? 'border-secondary/25 shadow-[0_12px_32px_rgba(0,108,73,0.08)]'
                  : 'border-surface-container'
              }`}
            >
              {/* Decorative glow */}
              <div
                className={`pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full blur-3xl ${
                  hasAnswer
                    ? 'bg-secondary/10'
                    : 'bg-primary/5'
                }`}
              />

              <div className="relative">
                {/* Question header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-container-high pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl font-display text-sm font-black ${
                        hasAnswer
                          ? 'bg-secondary text-white'
                          : 'bg-primary-fixed text-primary'
                      }`}
                    >
                      {index + 1}
                    </div>

                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
                        Question{' '}
                        {index + 1}
                      </p>

                      <p className="mt-0.5 text-[10px] font-bold capitalize text-on-surface-variant">
                        {formatQuestionType(
                          question.type,
                        )}
                        {' · '}
                        {question.difficulty}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-tertiary-fixed/40 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-tertiary">
                      <span className="material-symbols-outlined text-sm">
                        stars
                      </span>

                      {question.points} Points
                    </span>

                    {question.hint && (
                      <button
                        type="button"
                        onClick={() =>
                          toggleHint(
                            question.id,
                          )
                        }
                        className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all ${
                          showHints[
                            question.id
                          ]
                            ? 'border-tertiary/30 bg-tertiary-fixed text-tertiary'
                            : 'border-surface-container-high bg-surface-container-low text-primary hover:bg-surface-container'
                        }`}
                        aria-label={
                          showHints[
                            question.id
                          ]
                            ? 'Hide hint'
                            : 'Show hint'
                        }
                        title="Show hint"
                      >
                        <span className="material-symbols-outlined filled text-lg">
                          lightbulb
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Question */}
                <h3 className="mt-5 whitespace-pre-line font-display text-lg font-black leading-7 text-on-surface md:text-xl">
                  {question.questionText}
                </h3>

                {/* Hint */}
                {showHints[question.id] &&
                  question.hint && (
                    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-tertiary/20 bg-tertiary-fixed/25 p-4 animate-fade-in">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-tertiary text-white">
                        <span className="material-symbols-outlined text-lg">
                          lightbulb
                        </span>
                      </div>

                      <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.18em] text-tertiary">
                          Spellbook Hint
                        </p>

                        <p className="mt-1 whitespace-pre-line text-xs font-medium leading-6 text-on-tertiary-fixed">
                          {question.hint}
                        </p>
                      </div>
                    </div>
                  )}

                {/* Answer area */}
                <div className="mt-5">
                  {question.type ===
                    'multiple-choice' &&
                  question.options ? (
                    <MultipleChoiceInput
                      question={question}
                      answer={answer}
                      onChange={(value) =>
                        updateAnswer(
                          question.id,
                          value,
                        )
                      }
                    />
                  ) : question.type ===
                    'true-false' ? (
                    <TrueFalseInput
                      answer={answer}
                      onChange={(value) =>
                        updateAnswer(
                          question.id,
                          value,
                        )
                      }
                    />
                  ) : question.type ===
                    'open-ended' ? (
                    <textarea
                      value={answer}
                      onChange={(event) =>
                        updateAnswer(
                          question.id,
                          event.target.value,
                        )
                      }
                      placeholder="Explain your answer here..."
                      rows={5}
                      className="w-full resize-y rounded-2xl border-2 border-surface-variant bg-surface px-4 py-4 text-sm font-semibold leading-6 text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                  ) : (
                    <TextAnswerInput
                      question={question}
                      value={answer}
                      onChange={(value) =>
                        updateAnswer(
                          question.id,
                          value,
                        )
                      }
                    />
                  )}
                </div>

                {/* Answered state */}
                {hasAnswer && (
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-secondary">
                    <span className="material-symbols-outlined text-base">
                      check_circle
                    </span>

                    Answer locked in
                  </div>
                )}
              </div>
            </section>
          );
        },
      )}

      {/* Submit mission */}
      <div className="rounded-[26px] border-2 border-secondary/15 bg-gradient-to-br from-white to-secondary-fixed/20 p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl text-white shadow-md ${
                allQuestionsAnswered
                  ? 'bg-secondary'
                  : 'bg-outline'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">
                {allQuestionsAnswered
                  ? 'verified'
                  : 'lock'}
              </span>
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-secondary">
                Final Submission
              </p>

              <h3 className="mt-1 font-display text-lg font-black text-on-surface">
                {allQuestionsAnswered
                  ? 'Your answers are ready'
                  : `${questions.length - answeredCount} questions remaining`}
              </h3>

              <p className="mt-1 text-xs font-medium text-on-surface-variant">
                Results will appear after
                submitting the mission.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={
              isSubmitting ||
              !allQuestionsAnswered
            }
            className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-8 py-4 font-display text-sm font-black uppercase tracking-wider text-white transition-all md:w-auto ${
              allQuestionsAnswered &&
              !isSubmitting
                ? 'btn-3d-secondary bg-secondary'
                : 'cursor-not-allowed bg-outline opacity-50'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-lg">
                  progress_activity
                </span>

                Checking Answers
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">
                  auto_awesome
                </span>

                Submit Mission
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

interface MultipleChoiceInputProps {
  question: ExerciseQuestion;
  answer: string;
  onChange: (value: string) => void;
}

function MultipleChoiceInput({
  question,
  answer,
  onChange,
}: MultipleChoiceInputProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {question.options?.map(
        (option, index) => {
          const isSelected =
            answer === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() =>
                onChange(option)
              }
              className={`group flex min-h-[64px] items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-display text-sm font-bold transition-all ${
                isSelected
                  ? 'translate-y-0.5 border-[#001a42] bg-primary text-white shadow-[0_4px_0_#001a42]'
                  : 'border-surface-variant bg-surface text-on-surface hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary-fixed/20'
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-white text-primary shadow-sm'
                }`}
              >
                {String.fromCharCode(
                  65 + index,
                )}
              </span>

              <span>{option}</span>

              {isSelected && (
                <span className="material-symbols-outlined ml-auto text-lg">
                  check_circle
                </span>
              )}
            </button>
          );
        },
      )}
    </div>
  );
}

interface TrueFalseInputProps {
  answer: string;
  onChange: (value: string) => void;
}

function TrueFalseInput({
  answer,
  onChange,
}: TrueFalseInputProps) {
  const options = [
    {
      label: 'True',
      value: 'true',
      icon: 'check',
    },
    {
      label: 'False',
      value: 'false',
      icon: 'close',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((option) => {
        const isSelected =
          answer.toLowerCase() ===
          option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() =>
              onChange(option.value)
            }
            className={`flex min-h-[72px] items-center justify-center gap-3 rounded-2xl border-2 font-display text-base font-black transition-all ${
              isSelected
                ? 'translate-y-0.5 border-[#001a42] bg-primary text-white shadow-[0_4px_0_#001a42]'
                : 'border-surface-variant bg-surface text-on-surface hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary-fixed/20'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">
              {option.icon}
            </span>

            {option.label}
          </button>
        );
      })}
    </div>
  );
}

interface TextAnswerInputProps {
  question: ExerciseQuestion;
  value: string;
  onChange: (value: string) => void;
}

function TextAnswerInput({
  question,
  value,
  onChange,
}: TextAnswerInputProps) {
  const isNumeric =
    question.type === 'numeric' ||
    question.type === 'decimal' ||
    question.type === 'fraction';

  return (
    <div className="relative">
      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
        {isNumeric
          ? 'calculate'
          : 'edit'}
      </span>

      <input
        type="text"
        inputMode={
          question.type === 'numeric' ||
          question.type === 'decimal'
            ? 'decimal'
            : 'text'
        }
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={getPlaceholder(
          question.type,
        )}
        className="w-full rounded-2xl border-2 border-surface-variant bg-surface py-4 pl-12 pr-4 text-sm font-semibold text-on-surface outline-none transition placeholder:text-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/10"
      />
    </div>
  );
}

function getPlaceholder(
  type: ExerciseQuestion['type'],
): string {
  switch (type) {
    case 'numeric':
      return 'Enter your numeric answer';

    case 'fraction':
      return 'Enter a fraction, for example 3/4';

    case 'decimal':
      return 'Enter your decimal answer';

    case 'short-text':
      return 'Type your short answer';

    default:
      return 'Type your answer';
  }
}

function formatQuestionType(
  type: ExerciseQuestion['type'],
): string {
  return type
    .split('-')
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(' ');
}

export default PracticeExerciseForm;