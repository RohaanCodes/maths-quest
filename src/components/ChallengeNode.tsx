import React from 'react';

import { Challenge } from '../types';

interface ChallengeNodeProps {
  challenge: Challenge;
  studentAvatarUrl?: string;
  onNodeClick: (
    challengeId: string,
  ) => void;
  left: string;
  top: string;
}

export const ChallengeNode: React.FC<
  ChallengeNodeProps
> = ({
  challenge,
  studentAvatarUrl,
  onNodeClick,
  left,
  top,
}) => {
  const isCompleted =
    challenge.status === 'completed';

  const isCurrent =
    challenge.status === 'current';

  const isLocked =
    challenge.status === 'locked';

  function handleClick(): void {
    if (isLocked) {
      return;
    }

    onNodeClick(challenge.id);
  }

  return (
    <div
      className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 ${
        isCurrent ? 'z-30' : ''
      }`}
      style={{
        left,
        top,
      }}
    >
      {/* Current mission glow */}
      {isCurrent && (
        <>
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border border-primary-container/40 bg-primary/10" />

          <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-primary/20 blur-xl" />

          <div className="pointer-events-none absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/30" />
        </>
      )}

      {/* Completed glow */}
      {isCompleted && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/25 blur-xl" />
      )}

      {/* Player marker */}
      {isCurrent &&
        studentAvatarUrl && (
          <div className="pointer-events-none absolute -top-20 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center animate-float">
            <div className="relative">
              <div className="absolute -inset-1.5 rounded-full bg-primary/35 blur-md" />

              <div className="relative h-13 w-13 overflow-hidden rounded-full border-4 border-white bg-white shadow-[0_10px_26px_rgba(7,21,47,0.35)] ring-2 ring-primary">
                <img
                  className="h-full w-full object-cover"
                  src={studentAvatarUrl}
                  alt="Current player"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="-mt-1.5 h-3.5 w-3.5 rotate-45 border-b border-r border-white/70 bg-white shadow-sm" />
          </div>
        )}

      {/* Mission number/status label */}
      <div
        className={`pointer-events-none absolute left-1/2 top-full z-30 mt-3 -translate-x-1/2 whitespace-nowrap rounded-full border px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.15em] shadow-lg backdrop-blur-md ${
          isCompleted
            ? 'border-secondary/30 bg-[#07392b]/90 text-secondary-container'
            : isCurrent
              ? 'border-primary-container/30 bg-[#07152f]/90 text-primary-container'
              : 'border-white/10 bg-black/45 text-white/45'
        }`}
      >
        {isCompleted
          ? 'Mission Complete'
          : isCurrent
            ? 'Current Mission'
            : 'Locked'}
      </div>

      {/* Main node */}
      <button
        type="button"
        onClick={handleClick}
        disabled={isLocked}
        title={challenge.name}
        aria-label={
          isLocked
            ? `${challenge.name} is locked`
            : `Open ${challenge.name}`
        }
        className={`group relative flex h-[72px] w-[72px] items-center justify-center rounded-full border-[5px] outline-none transition-all duration-300 focus-visible:ring-4 focus-visible:ring-white/40 ${
          isCompleted
            ? 'cursor-pointer border-white bg-gradient-to-br from-[#4edea3] to-[#087f5b] text-white shadow-[0_7px_0_#046c4d,0_14px_28px_rgba(8,127,91,0.42)] hover:-translate-y-1 hover:scale-105 hover:shadow-[0_10px_0_#046c4d,0_20px_32px_rgba(8,127,91,0.5)] active:translate-y-1 active:shadow-[0_3px_0_#046c4d]'
            : isCurrent
              ? 'cursor-pointer border-white bg-gradient-to-br from-[#4b9cff] via-primary to-[#003f8f] text-white shadow-[0_8px_0_#001a42,0_16px_34px_rgba(33,112,228,0.52)] hover:-translate-y-1.5 hover:scale-110 hover:shadow-[0_11px_0_#001a42,0_24px_40px_rgba(33,112,228,0.6)] active:translate-y-1 active:shadow-[0_3px_0_#001a42]'
              : 'cursor-not-allowed border-slate-400/80 bg-gradient-to-br from-slate-300 to-slate-500 text-slate-100 opacity-85 shadow-[0_6px_0_#64748b,0_12px_24px_rgba(15,23,42,0.25)] grayscale'
        }`}
      >
        {/* Inner ring */}
        <span
          className={`absolute inset-[7px] rounded-full border ${
            isCompleted
              ? 'border-white/35'
              : isCurrent
                ? 'border-white/30'
                : 'border-white/15'
          }`}
        />

        {/* Shine */}
        {!isLocked && (
          <span className="pointer-events-none absolute left-3 top-2 h-4 w-7 rotate-[-18deg] rounded-full bg-white/25 blur-[1px]" />
        )}

        {/* Icon */}
        {isCompleted && (
          <span className="material-symbols-outlined relative text-4xl font-black drop-shadow-[0_3px_5px_rgba(0,0,0,0.22)]">
            check
          </span>
        )}

        {isCurrent && (
          <span className="material-symbols-outlined filled relative animate-pulse-slow text-[42px] text-amber-300 drop-shadow-[0_3px_6px_rgba(0,0,0,0.35)]">
            star
          </span>
        )}

        {isLocked && (
          <span className="material-symbols-outlined relative text-3xl drop-shadow-sm">
            lock
          </span>
        )}

        {/* Hover tooltip */}
        {!isLocked && (
          <div className="pointer-events-none absolute bottom-[92px] left-1/2 hidden w-52 -translate-x-1/2 rounded-2xl border border-white/15 bg-[#07152f]/95 p-3 text-left text-white opacity-0 shadow-[0_14px_38px_rgba(7,21,47,0.45)] backdrop-blur-xl transition-all duration-200 group-hover:block group-hover:opacity-100 md:block md:translate-y-2 md:group-hover:translate-y-0">
            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-primary-container">
              {isCompleted
                ? 'Completed Mission'
                : 'Ready to Play'}
            </p>

            <h4 className="mt-1 line-clamp-2 font-display text-sm font-black leading-snug text-white">
              {challenge.name}
            </h4>

            <div className="mt-2 flex items-center gap-2 text-[9px] font-bold text-white/55">
              <span>
                {challenge.difficulty}
              </span>

              <span>•</span>

              <span>
                {challenge.estimatedTime}
              </span>

              <span>•</span>

              <span>
                +{challenge.xpReward} XP
              </span>
            </div>

            <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-white/15 bg-[#07152f]/95" />
          </div>
        )}
      </button>
    </div>
  );
};

export default ChallengeNode;