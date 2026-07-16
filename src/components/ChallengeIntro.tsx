import React from 'react';
import { Challenge } from '../types';

interface ChallengeIntroProps {
  challenge: Challenge;
  onStart: () => void;
  onBack: () => void;
}

export const ChallengeIntro: React.FC<ChallengeIntroProps> = ({
  challenge,
  onStart,
  onBack,
}) => {
  return (
    <div className="w-full space-y-6 pb-20">
      {/* Cinematic Hero Section: Castle Vault */}
      <div className="relative w-full h-[400px] lg:h-[460px] rounded-3xl overflow-hidden flex items-center justify-center p-6 shadow-md border-2 border-surface-container-highest">
        {/* Background Painting */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/30 to-black/10 z-10"></div>
          <img 
            className="w-full h-full object-cover transition-transform duration-10000 hover:scale-110" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmAGDIwn80jhQFMOsP3Zkl4WOCus5AHP8ripl2gep3MfTBo55FATL4WyUiK7tyEzgAiidRdivPJvVhP1hBi8Umx1gIcxmdDxLohb8BX6Tk-0Nxd_YZb4VUvPHIa_ZDZcTNWWWQud8h3bQI9NjOaKZMKbNKqrfhJ5XHu9EqRNm7P4EJVmAJ6eMApaL13c07KLbICO764P1l54hTlNoetm6kLhRRWnH7ASiP7QkZnQHFrNJ9UbM0vSZD" 
            alt="Royal Vault Door" 
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Content Talisman card */}
        <div className="relative z-10 max-w-xl w-full text-center bg-white/90 backdrop-blur-md p-6 lg:p-8 rounded-2xl shadow-xl border border-surface-container-high translate-y-6">
          <div className="flex justify-center -mt-16 lg:-mt-20 mb-3">
            <div className="w-20 h-20 bg-tertiary-container rounded-full flex items-center justify-center shadow-lg border-4 border-on-tertiary-container text-white animate-float">
              <span className="material-symbols-outlined text-4xl filled">key</span>
            </div>
          </div>
          <div>
            <span className="inline-block px-3.5 py-0.5 bg-secondary-container text-on-secondary-fixed-variant font-display font-bold text-[10px] rounded-full uppercase tracking-widest mb-1.5">
              ACTIVE QUEST
            </span>
            <h2 className="font-display text-2xl lg:text-3xl text-on-surface leading-tight">
              {challenge.name}
            </h2>
          </div>
          <p className="text-sm font-medium text-on-surface-variant max-w-md mx-auto mt-2 leading-relaxed">
            {challenge.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center pt-5">
            <button 
              onClick={onStart}
              className="px-8 py-3.5 bg-primary text-white font-display font-bold text-sm rounded-full btn-3d w-full sm:w-auto hover:scale-105 transition-transform"
            >
              Start Challenge
            </button>
            <button 
              onClick={onBack}
              className="px-6 py-3.5 bg-surface-container text-on-surface-variant font-display font-bold text-sm rounded-full hover:bg-surface-container-high transition-colors w-full sm:w-auto"
            >
              Back to Map
            </button>
          </div>
        </div>
      </div>

      {/* Rewards & Requirements Bento Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto px-1">
        {/* Completion Reward Card */}
        <div className="bg-white p-5 rounded-2xl border-2 border-surface-container shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary-fixed rounded-xl text-primary shrink-0">
              <span className="material-symbols-outlined text-2xl filled">bolt</span>
            </div>
            <span className="font-display font-bold text-sm text-on-surface">Completion Reward</span>
          </div>
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-xs font-bold">
              <span>{challenge.xpReward} XP</span>
              <span className="text-primary">+{challenge.bonusXp} Bonus</span>
            </div>
            <div className="h-3 w-full bg-primary/10 rounded-full overflow-hidden relative">
              <div className="h-full bg-primary rounded-full w-full relative">
                <div className="absolute inset-0 bg-white/20 animate-glint"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quest Badge Card */}
        <div className="bg-white p-5 rounded-2xl border-2 border-surface-container shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-tertiary-fixed rounded-xl text-tertiary shrink-0">
              <span className="material-symbols-outlined text-2xl filled">military_tech</span>
            </div>
            <span className="font-display font-bold text-sm text-on-surface">Quest Badge</span>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-tertiary-fixed to-tertiary border border-white shadow-sm flex items-center justify-center text-white text-sm shrink-0 font-bold">
              <span className="material-symbols-outlined text-sm filled">{challenge.badge?.icon || 'lock_open'}</span>
            </div>
            <div className="truncate">
              <span className="text-xs font-bold block text-on-surface">{challenge.badge?.name || 'Vault Breaker'}</span>
              <span className="text-[10px] font-medium text-on-surface-variant block truncate">{challenge.badge?.description}</span>
            </div>
          </div>
        </div>

        {/* Requirements Card */}
        <div className="bg-white p-5 rounded-2xl border-2 border-surface-container shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-secondary-container/20 rounded-xl text-secondary shrink-0">
              <span className="material-symbols-outlined text-2xl filled">assignment_turned_in</span>
            </div>
            <span className="font-display font-bold text-sm text-on-surface">Level Requirements</span>
          </div>
          <ul className="text-xs space-y-1.5 pt-1 text-on-surface-variant">
            {challenge.requirements.map((req, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xs text-secondary font-black">check_circle</span>
                <span className="font-medium">{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Quest Details Bento Board */}
      <div className="max-w-5xl mx-auto bg-white p-5 rounded-2xl border-2 border-surface-container shadow-sm">
        <h3 className="font-display font-bold text-sm text-on-surface mb-3 uppercase tracking-wider">Quest Blueprint</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[240px] md:h-[220px]">
          {/* Main Visual Board Panel */}
          <div className="md:col-span-2 relative rounded-xl overflow-hidden border border-surface-container-high h-full">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuB3gcxLnpTdqarWQA9OP9_U7TQuuVg1Q19ozRtX9xrpm8qbzpSgULiccDOd4fHw7PYM8D3PxwQ0sIHKSL5gqIEjNct3kGA20uocaO6ncsjoIkJazixogqRm2-VXaGcE3trbzHVU6DEnxJXkg5y0ZxUAryxn5PCeO8nPFMU7L_F8ssDruOYAAPXOZqEzZxRHOrT-ViXTTRPjwq0mVcd5hD2IdipFo9Nv11uyyConiZIJPYVStV-v4ZbK')` }}
              aria-label="Ancient variable grid painting"
            ></div>
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow border border-surface-container text-left">
              <p className="text-xs font-display font-bold text-primary">Challenge Level: Heroic</p>
              <p className="text-[10px] font-medium text-on-surface-variant">Estimated Solve Rate: 85%</p>
            </div>
          </div>

          {/* Quick Stats Grid Column */}
          <div className="flex flex-col gap-3 h-full justify-between">
            <div className="bg-tertiary-fixed-dim/15 rounded-xl p-4 flex items-center justify-center flex-col gap-1 border-2 border-dashed border-tertiary-fixed h-[48%]">
              <span className="material-symbols-outlined text-tertiary text-2xl">casino</span>
              <span className="text-xs font-bold text-tertiary font-display">Rare Loot Dropped</span>
            </div>
            <div className="bg-secondary-container/15 rounded-xl p-4 flex items-center justify-center flex-col gap-1 border border-secondary/20 h-[48%]">
              <span className="material-symbols-outlined text-secondary text-2xl">groups</span>
              <span className="text-xs font-bold text-secondary font-display">Team Spell Castable</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChallengeIntro;
