import React from 'react';

import { World } from '../types';

import {
  getWorldImage,
} from '../lib/world-assets';

interface WorldCardProps {
  world: World;
  onExplore: (worldId: string) => void;
}

export const WorldCard: React.FC<
  WorldCardProps
> = ({
  world,
  onExplore,
}) => {
  const isLocked =
    world.status === 'locked';

  const isCompleted =
    world.status === 'completed';

  const isCurrent =
    world.status === 'current';

  const worldImage =
    getWorldImage(world.id);

  function handleExplore(): void {
    if (isLocked) {
      return;
    }

    onExplore(world.id);
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLDivElement>,
  ): void {
    if (isLocked) {
      return;
    }

    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();
      onExplore(world.id);
    }
  }

  return (
    <div
      role={isLocked ? undefined : 'button'}
      tabIndex={isLocked ? -1 : 0}
      onClick={handleExplore}
      onKeyDown={handleKeyDown}
      aria-disabled={isLocked}
      aria-label={
        isLocked
          ? `${world.name} is locked`
          : `Open ${world.name}`
      }
      className={`group relative min-h-[360px] overflow-hidden rounded-[28px] border bg-[#07152f] shadow-[0_18px_50px_rgba(7,21,47,0.16)] outline-none transition-all duration-300 ${
        isLocked
          ? 'cursor-not-allowed border-surface-container opacity-70'
          : 'cursor-pointer border-white/20 hover:-translate-y-1.5 hover:shadow-[0_28px_70px_rgba(7,21,47,0.24)] focus-visible:ring-4 focus-visible:ring-primary/20'
      }`}
    >
      {/* Local world artwork */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-transform duration-[1000ms] ease-out ${
          isLocked
            ? 'grayscale'
            : 'group-hover:scale-[1.05]'
        }`}
        style={{
          backgroundImage: `url('${worldImage}')`,
        }}
      />

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#07152f]/96 via-[#07152f]/22 to-black/5" />

      <div className="absolute inset-0 bg-gradient-to-r from-[#07152f]/28 via-transparent to-transparent" />

      {isLocked && (
        <div className="absolute inset-0 bg-[#07152f]/42 backdrop-blur-[1px]" />
      )}

      {/* Decorative lighting */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary/20 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 left-1/3 h-24 w-44 rounded-full bg-secondary/15 blur-3xl" />

      {/* Bottom content */}
      <div className="relative z-20 flex min-h-[360px] flex-col justify-end px-5 pb-7 md:px-6 md:pb-8">
        {/* Status */}
        <div className="mb-3">
          {isCurrent && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-primary/90 px-3 py-1.5 font-display text-[8px] font-black uppercase tracking-[0.14em] text-white shadow-lg backdrop-blur-md">
              <span className="material-symbols-outlined text-sm">
                explore
              </span>

              Current World
            </span>
          )}

          {isCompleted && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-secondary/90 px-3 py-1.5 font-display text-[8px] font-black uppercase tracking-[0.14em] text-white shadow-lg backdrop-blur-md">
              <span className="material-symbols-outlined text-sm">
                verified
              </span>

              Completed
            </span>
          )}

          {isLocked && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/45 px-3 py-1.5 font-display text-[8px] font-black uppercase tracking-[0.14em] text-white/80 backdrop-blur-md">
              <span className="material-symbols-outlined text-sm">
                lock
              </span>

              Locked
            </span>
          )}
        </div>

        {/* Region */}
        <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/65">
          {world.region}
        </p>

        {/* World name */}
        <h3 className="mt-1 max-w-[85%] font-display text-[34px] font-black leading-[1.02] tracking-tight text-white drop-shadow-xl md:text-[42px]">
          {world.name}
        </h3>
      </div>

      {/* Hover arrow */}
      {!isLocked && (
        <div className="absolute bottom-6 right-6 z-30 flex h-12 w-12 translate-x-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white opacity-0 shadow-lg backdrop-blur-md transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
          <span className="material-symbols-outlined text-xl">
            arrow_forward
          </span>
        </div>
      )}
    </div>
  );
};

export default WorldCard;