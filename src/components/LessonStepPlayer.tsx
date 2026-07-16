import React from 'react';

import {
  LessonStep,
  ExerciseQuestion,
} from '../types';

import { PracticeExerciseForm } from './PracticeExerciseForm';

interface LessonStepPlayerProps {
  step: LessonStep;
  questions: ExerciseQuestion[];
  onFormSubmit: (
    answers: Record<string, string>,
  ) => void;
  isSubmitting?: boolean;
}

interface StepTheme {
  label: string;
  icon: string;
  accentClass: string;
  badgeClass: string;
  glowClass: string;
  panelClass: string;
}

const STEP_THEMES: Record<
  LessonStep['type'],
  StepTheme
> = {
  intro: {
    label: 'Quest Briefing',
    icon: 'auto_awesome',
    accentClass: 'text-primary',
    badgeClass:
      'border-primary/20 bg-primary-fixed text-on-primary-fixed-variant',
    glowClass: 'bg-primary/10',
    panelClass:
      'border-primary/15 bg-gradient-to-br from-white via-white to-primary-fixed/20',
  },
  learn: {
    label: 'Spell Training',
    icon: 'school',
    accentClass: 'text-secondary',
    badgeClass:
      'border-secondary/20 bg-secondary-container text-on-secondary-container',
    glowClass: 'bg-secondary/10',
    panelClass:
      'border-secondary/15 bg-gradient-to-br from-white via-white to-secondary-fixed/20',
  },
  example: {
    label: 'Worked Example',
    icon: 'psychology_alt',
    accentClass: 'text-tertiary',
    badgeClass:
      'border-tertiary/20 bg-tertiary-fixed text-on-tertiary-fixed',
    glowClass: 'bg-tertiary/10',
    panelClass:
      'border-tertiary/15 bg-gradient-to-br from-white via-white to-tertiary-fixed/15',
  },
  video: {
    label: 'Video Lesson',
    icon: 'play_circle',
    accentClass: 'text-primary',
    badgeClass:
      'border-primary/20 bg-primary-fixed text-on-primary-fixed-variant',
    glowClass: 'bg-primary/10',
    panelClass:
      'border-primary/15 bg-gradient-to-br from-white via-white to-primary-fixed/15',
  },
  practice: {
    label: 'Final Challenge',
    icon: 'swords',
    accentClass: 'text-secondary',
    badgeClass:
      'border-secondary/20 bg-secondary-container text-on-secondary-container',
    glowClass: 'bg-secondary/10',
    panelClass:
      'border-secondary/20 bg-gradient-to-br from-white via-white to-secondary-fixed/15',
  },
};

function getYouTubeVideoId(
  url: string,
): string | null {
  try {
    const parsedUrl = new URL(url);
    const hostname =
      parsedUrl.hostname.replace('www.', '');

    if (hostname === 'youtu.be') {
      return (
        parsedUrl.pathname
          .split('/')
          .filter(Boolean)[0] || null
      );
    }

    if (
      hostname === 'youtube.com' ||
      hostname === 'm.youtube.com'
    ) {
      if (parsedUrl.pathname === '/watch') {
        return parsedUrl.searchParams.get('v');
      }

      if (
        parsedUrl.pathname.startsWith(
          '/embed/',
        )
      ) {
        return (
          parsedUrl.pathname
            .split('/embed/')[1]
            ?.split('/')[0] || null
        );
      }

      if (
        parsedUrl.pathname.startsWith(
          '/shorts/',
        )
      ) {
        return (
          parsedUrl.pathname
            .split('/shorts/')[1]
            ?.split('/')[0] || null
        );
      }
    }

    return null;
  } catch {
    return null;
  }
}

function isDirectVideoUrl(
  url: string,
): boolean {
  try {
    const pathname =
      new URL(url).pathname.toLowerCase();

    return (
      pathname.endsWith('.mp4') ||
      pathname.endsWith('.webm') ||
      pathname.endsWith('.ogg') ||
      pathname.endsWith('.mov')
    );
  } catch {
    return false;
  }
}

function VideoResource({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const youtubeVideoId =
    getYouTubeVideoId(url);

  if (youtubeVideoId) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${youtubeVideoId}`}
        title={title}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

  if (isDirectVideoUrl(url)) {
    return (
      <video
        src={url}
        controls
        preload="metadata"
        className="h-full w-full object-cover"
      >
        Your browser does not support this video.
      </video>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-full w-full flex-col items-center justify-center gap-5 bg-gradient-to-br from-[#07152f] to-primary p-8 text-center text-white transition-transform hover:scale-[1.01]"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-xl backdrop-blur-md">
        <span className="material-symbols-outlined text-5xl">
          open_in_new
        </span>
      </div>

      <div>
        <p className="font-display text-lg font-black">
          Open Learning Resource
        </p>

        <p className="mt-2 text-xs font-medium text-white/65">
          This lesson opens in a new browser
          tab.
        </p>
      </div>
    </a>
  );
}

export const LessonStepPlayer: React.FC<
  LessonStepPlayerProps
> = ({
  step,
  questions,
  onFormSubmit,
  isSubmitting = false,
}) => {
  const theme = STEP_THEMES[step.type];

  return (
    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12 xl:gap-8">
      {/* Wizard guide */}
      <aside className="xl:sticky xl:top-6 xl:col-span-4">
        <div className="relative overflow-hidden rounded-[30px] border-2 border-surface-container bg-white p-5 shadow-sm md:p-6">
          <div
            className={`pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full blur-3xl ${theme.glowClass}`}
          />

          <div className="relative">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${theme.badgeClass}`}
              >
                <span className="material-symbols-outlined text-2xl">
                  {theme.icon}
                </span>
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
                  Your Guide
                </p>

                <h3 className="font-display text-base font-black text-on-surface">
                  Spellkeeper Wizard
                </h3>
              </div>
            </div>

            <div className="relative mx-auto mt-4 flex h-52 w-full max-w-[240px] items-end justify-center md:h-60">
              <div
                className={`absolute bottom-4 h-36 w-36 rounded-full blur-3xl ${theme.glowClass}`}
              />

              <img
                className="relative z-10 h-full w-full object-contain animate-float"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4gGC0gskGBMWAoR-tsdLJvISzbxtvHk9Yvt0NK2NSDzUvkd_oU28-hNlDZUIy7m0sNojr4gKel7AY-y2v7Yc7YnkD9PrDNfZ5lMicWp4AFU6aHdnp3GeIevbDXpSiRSV96SvSQ9UyEW5tCyAcP0_qqDj6jFbl6V9KGuksMIf5U5UPYM-rfyk5fGOBljFa5VdRahmeFQX2PhXXoNfAKD1jFEycEFEpxLAJuRiiLaL9wcXbTSB9ZroJ"
                alt="Spellkeeper Wizard"
                referrerPolicy="no-referrer"
              />
            </div>

            {step.wizardText && (
              <div className="relative mt-3 rounded-2xl border border-surface-container-high bg-surface-container-low p-4">
                <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t border-surface-container-high bg-surface-container-low" />

                <p className="text-center text-xs font-semibold leading-relaxed text-on-surface-variant">
                  {step.wizardText}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Lesson content */}
      <section className="space-y-5 xl:col-span-8">
        <div
          className={`relative overflow-hidden rounded-[30px] border-2 p-6 shadow-sm md:p-8 ${theme.panelClass}`}
        >
          <div
            className={`pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl ${theme.glowClass}`}
          />

          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 font-display text-[9px] font-black uppercase tracking-[0.16em] ${theme.badgeClass}`}
              >
                <span className="material-symbols-outlined text-sm">
                  {theme.icon}
                </span>

                {theme.label}
              </span>

              <span className="text-[9px] font-black uppercase tracking-[0.16em] text-on-surface-variant/60">
                Math Quest Lesson
              </span>
            </div>

            <h2 className="mt-5 max-w-3xl font-display text-3xl font-black leading-[1.08] tracking-tight text-on-surface md:text-4xl">
              {step.title}
            </h2>

            {step.type !== 'example' &&
              step.type !== 'video' &&
              step.type !== 'practice' && (
                <div className="mt-5 max-w-3xl whitespace-pre-line text-sm font-medium leading-7 text-on-surface-variant md:text-base">
                  {step.content}
                </div>
              )}
          </div>
        </div>

        {step.type === 'intro' && (
          <div className="rounded-[26px] border-2 border-primary/10 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
                <span className="material-symbols-outlined text-2xl">
                  flag
                </span>
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-primary">
                  Your Mission
                </p>

                <p className="mt-2 whitespace-pre-line text-sm font-medium leading-7 text-on-surface-variant">
                  {step.content}
                </p>
              </div>
            </div>
          </div>
        )}

        {step.type === 'learn' && (
          <div className="rounded-[26px] border-2 border-secondary/10 bg-white p-6 shadow-sm md:p-7">
            <div className="flex items-center gap-3 border-b border-surface-container-high pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container">
                <span className="material-symbols-outlined text-2xl">
                  menu_book
                </span>
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-secondary">
                  Core Concept
                </p>

                <p className="text-xs font-semibold text-on-surface-variant">
                  Learn the rule before using it.
                </p>
              </div>
            </div>

            <div className="mt-5 whitespace-pre-line text-sm font-medium leading-7 text-on-surface-variant md:text-base">
              {step.content}
            </div>
          </div>
        )}

        {step.type === 'example' &&
          step.workedExample && (
            <div className="space-y-5">
              <div className="rounded-[26px] border-2 border-surface-container bg-white p-6 shadow-sm md:p-7">
                <div className="space-y-5">
                  {step.workedExample.steps.map(
                    (
                      exampleStep,
                      index,
                    ) => (
                      <div
                        key={`${exampleStep.number}-${index}`}
                        className="relative rounded-2xl border border-surface-container-high bg-surface-container-low p-4 md:p-5"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm font-black text-white shadow-md">
                            {exampleStep.number}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="rounded-2xl border border-surface-variant bg-white px-4 py-4 shadow-inner">
                              <p className="whitespace-pre-line text-center font-mono text-lg font-black text-on-surface md:text-xl">
                                {
                                  exampleStep.expression
                                }
                              </p>
                            </div>

                            <p className="mt-3 whitespace-pre-line text-xs font-medium leading-6 text-on-surface-variant md:text-sm">
                              {
                                exampleStep.explanation
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>

                {step.workedExample
                  .ahaMoment && (
                  <div className="mt-5 flex items-start gap-3 rounded-2xl border border-secondary/20 bg-secondary-fixed/30 p-4">
                    <span className="material-symbols-outlined filled text-2xl text-secondary">
                      lightbulb
                    </span>

                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-secondary">
                        Aha Moment
                      </p>

                      <p className="mt-1 text-xs font-bold leading-6 text-on-secondary-container md:text-sm">
                        {
                          step.workedExample
                            .ahaMoment
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {step.workedExample
                  .ruleOfBalance && (
                  <InsightCard
                    icon="key"
                    label="Key Rule"
                    content={
                      step.workedExample
                        .ruleOfBalance
                    }
                    variant="primary"
                  />
                )}

                {step.workedExample
                  .mentalTrick && (
                  <InsightCard
                    icon="warning"
                    label="Watch Out"
                    content={
                      step.workedExample
                        .mentalTrick
                    }
                    variant="warning"
                  />
                )}
              </div>
            </div>
          )}

        {step.type === 'video' &&
          step.videoUrl && (
            <div className="overflow-hidden rounded-[26px] border-2 border-surface-container bg-white shadow-sm">
              <div className="p-5 md:p-6">
                <p className="whitespace-pre-line text-xs font-medium leading-6 text-on-surface-variant md:text-sm">
                  {step.content}
                </p>
              </div>

              <div className="relative aspect-video w-full overflow-hidden bg-black">
                <VideoResource
                  url={step.videoUrl}
                  title={step.title}
                />
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-surface-container-high p-4 md:px-6">
                <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
                  <span className="material-symbols-outlined text-base text-primary">
                    smart_display
                  </span>

                  Watch the full lesson before
                  continuing.
                </div>

                <a
                  href={step.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-2 rounded-full bg-surface-container px-3 py-2 text-[10px] font-black uppercase tracking-wider text-primary transition hover:bg-surface-container-high"
                >
                  Open

                  <span className="material-symbols-outlined text-sm">
                    open_in_new
                  </span>
                </a>
              </div>
            </div>
          )}

        {step.type === 'practice' && (
          <div className="space-y-5">
            <div className="rounded-[26px] border-2 border-secondary/15 bg-white p-5 shadow-sm md:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-white shadow-md">
                  <span className="material-symbols-outlined text-2xl">
                    swords
                  </span>
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-secondary">
                    Ready for Battle
                  </p>

                  <p className="mt-2 whitespace-pre-line text-xs font-medium leading-6 text-on-surface-variant md:text-sm">
                    {step.content}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-surface-container px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-on-surface-variant">
                      {questions.length}{' '}
                      Questions
                    </span>

                    <span className="rounded-full bg-surface-container px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-on-surface-variant">
                      Instant Results
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <PracticeExerciseForm
              questions={questions}
              onSubmit={onFormSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        )}
      </section>
    </div>
  );
};

interface InsightCardProps {
  icon: string;
  label: string;
  content: string;
  variant: 'primary' | 'warning';
}

function InsightCard({
  icon,
  label,
  content,
  variant,
}: InsightCardProps) {
  const isWarning =
    variant === 'warning';

  return (
    <div
      className={`rounded-[24px] border-2 bg-white p-5 shadow-sm ${
        isWarning
          ? 'border-tertiary/20'
          : 'border-primary/15'
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            isWarning
              ? 'bg-tertiary-fixed text-tertiary'
              : 'bg-primary-fixed text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {icon}
          </span>
        </div>

        <h4 className="font-display text-xs font-black uppercase tracking-wider text-on-surface">
          {label}
        </h4>
      </div>

      <p className="mt-3 whitespace-pre-line text-xs font-medium leading-6 text-on-surface-variant">
        {content}
      </p>
    </div>
  );
}

export default LessonStepPlayer;