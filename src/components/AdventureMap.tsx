import React, { useMemo } from 'react';

import {
  Challenge,
  Student,
} from '../types';

import { ChallengeNode } from './ChallengeNode';

interface AdventureMapProps {
  challenges: Challenge[];
  student: Student;
  onNodeClick: (
    challengeId: string,
  ) => void;
}

interface MapPoint {
  left: number;
  top: number;
}

const MAP_BACKGROUND_IMAGE =
  '/worlds/map.webp';

export const AdventureMap: React.FC<
  AdventureMapProps
> = ({
  challenges,
  student,
  onNodeClick,
}) => {
  /*
   * Generate a scalable zigzag path.
   * This works whether a world contains
   * 3, 5, 8, or more challenges.
   */
  const mapPoints = useMemo(
    () =>
      generateMapPoints(
        challenges.length,
      ),
    [challenges.length],
  );

  const pathData = useMemo(
    () => buildPath(mapPoints),
    [mapPoints],
  );

  const currentChallenge =
    challenges.find(
      (challenge) =>
        challenge.status === 'current',
    );

  const completedCount =
    challenges.filter(
      (challenge) =>
        challenge.status === 'completed',
    ).length;

  const completionPercentage =
    challenges.length > 0
      ? Math.round(
          (completedCount /
            challenges.length) *
            100,
        )
      : 0;

  if (challenges.length === 0) {
    return (
      <section className="flex min-h-[420px] items-center justify-center rounded-[32px] border-2 border-surface-container bg-white p-8 shadow-sm">
        <div className="max-w-sm text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-container text-outline">
            <span className="material-symbols-outlined text-3xl">
              map
            </span>
          </div>

          <h2 className="mt-4 font-display text-xl font-black text-on-surface">
            No missions available
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
            This world does not have any
            challenges yet.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {/* Map heading */}
      <div className="flex flex-col gap-4 rounded-3xl border-2 border-surface-container bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
            <span className="material-symbols-outlined text-2xl">
              route
            </span>
          </div>

          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">
              Adventure Path
            </p>

            <h2 className="mt-1 font-display text-xl font-black text-on-surface">
              Complete each mission to move
              forward
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-surface-container-low px-4 py-3">
          <div className="text-right">
            <p className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant">
              World Progress
            </p>

            <p className="mt-0.5 font-display text-lg font-black text-primary">
              {completedCount} /{' '}
              {challenges.length}
            </p>
          </div>

          <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-4 border-primary/15 bg-white">
            <span className="font-display text-xs font-black text-primary">
              {completionPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Visual world map */}
      <div className="relative min-h-[680px] w-full overflow-hidden rounded-[32px] border border-white/20 bg-[#07152f] shadow-[0_24px_70px_rgba(7,21,47,0.2)] md:min-h-[720px]">
        {/* Local public-folder map artwork */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${MAP_BACKGROUND_IMAGE}')`,
          }}
          aria-label="Fantasy mission map"
        />

        {/* Readability overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#07152f]/20 via-transparent to-[#07152f]/70" />

        <div className="absolute inset-0 bg-gradient-to-r from-[#07152f]/25 via-transparent to-[#07152f]/25" />

        {/* Dark edge vignette */}
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_100px_rgba(7,21,47,0.55)]" />

        {/* Ambient light */}
        <div className="pointer-events-none absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-primary/15 blur-[100px]" />

        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-secondary/15 blur-[100px]" />

        {/* Floating fog */}
        <div className="pointer-events-none absolute -left-[10%] top-[18%] h-28 w-[55%] rounded-full bg-white/10 blur-[55px] animate-float" />

        <div
          className="pointer-events-none absolute -right-[5%] top-[52%] h-24 w-[48%] rounded-full bg-white/10 blur-[55px] animate-float"
          style={{
            animationDelay: '1.5s',
          }}
        />

        {/* Decorative stars and particles */}
        <div className="pointer-events-none absolute inset-0 opacity-50">
          <MapParticle
            left="9%"
            top="15%"
            delay="0s"
          />

          <MapParticle
            left="22%"
            top="32%"
            delay="1.1s"
          />

          <MapParticle
            left="46%"
            top="13%"
            delay="0.6s"
          />

          <MapParticle
            left="67%"
            top="27%"
            delay="1.8s"
          />

          <MapParticle
            left="87%"
            top="19%"
            delay="0.3s"
          />

          <MapParticle
            left="77%"
            top="64%"
            delay="1.4s"
          />

          <MapParticle
            left="36%"
            top="72%"
            delay="0.9s"
          />
        </div>

        {/* SVG mission trail */}
        <svg
          className="pointer-events-none absolute inset-0 z-10 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="missionTrailGradient"
              x1="0%"
              y1="100%"
              x2="100%"
              y2="0%"
            >
              <stop
                offset="0%"
                stopColor="#4edea3"
              />

              <stop
                offset="45%"
                stopColor="#2170e4"
              />

              <stop
                offset="100%"
                stopColor="#ffcc5c"
              />
            </linearGradient>

            <filter id="trailGlow">
              <feGaussianBlur
                stdDeviation="1.4"
                result="blur"
              />

              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Trail shadow */}
          <path
            d={pathData}
            fill="none"
            stroke="rgba(7,21,47,0.55)"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Bright trail */}
          <path
            d={pathData}
            fill="none"
            stroke="url(#missionTrailGradient)"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="2.3 2.3"
            filter="url(#trailGlow)"
            className="opacity-90"
          />
        </svg>

        {/* Start marker */}
        <div className="pointer-events-none absolute bottom-6 left-6 z-20 hidden items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-white backdrop-blur-md md:flex">
          <span className="material-symbols-outlined text-base text-secondary-container">
            assistant_navigation
          </span>

          <span className="text-[9px] font-black uppercase tracking-[0.16em]">
            Adventure begins here
          </span>
        </div>

        {/* Challenge nodes */}
        {challenges.map(
          (challenge, index) => {
            const point =
              mapPoints[index];

            return (
              <ChallengeNode
                key={challenge.id}
                challenge={challenge}
                studentAvatarUrl={
                  student.avatarUrl
                }
                onNodeClick={
                  onNodeClick
                }
                left={`${point.left}%`}
                top={`${point.top}%`}
              />
            );
          },
        )}

        {/* Current mission panel */}
        {currentChallenge && (
          <div className="absolute bottom-5 left-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 rounded-3xl border border-white/20 bg-[#07152f]/85 p-4 text-white shadow-[0_20px_60px_rgba(7,21,47,0.45)] backdrop-blur-xl md:bottom-7 md:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_8px_25px_rgba(33,112,228,0.4)]">
                  <div className="absolute inset-0 animate-ping rounded-2xl border border-primary-container opacity-20" />

                  <span className="material-symbols-outlined relative text-3xl">
                    flag
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-primary-container">
                    Current Mission
                  </p>

                  <h3 className="mt-1 truncate font-display text-lg font-black text-white">
                    {currentChallenge.name}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[9px] font-bold text-white/60">
                    <span className="rounded-full bg-white/10 px-2.5 py-1">
                      {
                        currentChallenge.difficulty
                      }
                    </span>

                    <span className="rounded-full bg-white/10 px-2.5 py-1">
                      {
                        currentChallenge.estimatedTime
                      }
                    </span>

                    <span className="rounded-full bg-white/10 px-2.5 py-1">
                      +
                      {
                        currentChallenge.xpReward
                      }{' '}
                      XP
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  onNodeClick(
                    currentChallenge.id,
                  )
                }
                className="btn-3d inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 font-display text-xs font-black uppercase tracking-wider text-white sm:w-auto"
              >
                Continue

                <span className="material-symbols-outlined text-lg">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

/*
|--------------------------------------------------------------------------
| Dynamic map layout
|--------------------------------------------------------------------------
*/

function generateMapPoints(
  challengeCount: number,
): MapPoint[] {
  if (challengeCount <= 0) {
    return [];
  }

  /*
   * The path begins near the lower-left,
   * climbs upward, then alternates left/right.
   *
   * Vertical spacing is calculated dynamically
   * so worlds with different lesson counts work.
   */
  const minimumTop = 12;
  const maximumTop = 72;

  const verticalStep =
    challengeCount > 1
      ? (maximumTop - minimumTop) /
        (challengeCount - 1)
      : 0;

  const horizontalPositions = [
    18,
    38,
    64,
    82,
    60,
    34,
  ];

  return Array.from(
    {
      length: challengeCount,
    },
    (_, index) => {
      /*
       * Reverse vertical order so lesson 1
       * starts near the bottom.
       */
      const top =
        maximumTop -
        index * verticalStep;

      const horizontalIndex =
        index %
        horizontalPositions.length;

      return {
        left:
          horizontalPositions[
            horizontalIndex
          ],
        top,
      };
    },
  );
}

function buildPath(
  points: MapPoint[],
): string {
  if (points.length === 0) {
    return '';
  }

  if (points.length === 1) {
    return `M ${points[0].left} ${points[0].top}`;
  }

  let path =
    `M ${points[0].left} ${points[0].top}`;

  for (
    let index = 1;
    index < points.length;
    index += 1
  ) {
    const previous =
      points[index - 1];

    const current =
      points[index];

    const midpointY =
      (previous.top + current.top) / 2;

    path +=
      ` C ${previous.left} ${midpointY}, ` +
      `${current.left} ${midpointY}, ` +
      `${current.left} ${current.top}`;
  }

  return path;
}

/*
|--------------------------------------------------------------------------
| Ambient particle
|--------------------------------------------------------------------------
*/

interface MapParticleProps {
  left: string;
  top: string;
  delay: string;
}

function MapParticle({
  left,
  top,
  delay,
}: MapParticleProps) {
  return (
    <span
      className="absolute h-1.5 w-1.5 animate-pulse rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]"
      style={{
        left,
        top,
        animationDelay: delay,
      }}
    />
  );
}

export default AdventureMap;