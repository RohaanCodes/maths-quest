import React from 'react';

interface ProgressIndicatorProps {
  currentStepIndex: number;
  totalSteps: number;
  stepNames?: string[];
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStepIndex,
  totalSteps,
  stepNames = ['Intro', 'Learn', 'Example', 'Video', 'Practice'],
}) => {
  return (
    <div className="flex-1 flex items-center justify-between gap-1.5 px-4 md:px-8 max-w-lg mx-auto relative h-10">
      {Array.from({ length: totalSteps }).map((_, idx) => {
        const isCompleted = idx < currentStepIndex;
        const isCurrent = idx === currentStepIndex;
        const isLast = idx === totalSteps - 1;

        return (
          <React.Fragment key={idx}>
            {/* The Dot */}
            <div className="relative flex items-center justify-center">
              {isCurrent ? (
                <>
                  <div className="h-6 w-6 rounded-full bg-primary border-4 border-primary-fixed animate-pulse"></div>
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider whitespace-nowrap shadow-sm">
                    {stepNames[idx] || `Step ${idx + 1}`}
                  </div>
                </>
              ) : (
                <div 
                  className={`h-4.5 w-4.5 rounded-full transition-colors duration-300 ${
                    isCompleted ? 'bg-secondary' : 'bg-surface-container-highest border-2 border-surface-variant'
                  }`}
                ></div>
              )}
            </div>

            {/* Connecting line */}
            {!isLast && (
              <div 
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  isCompleted ? 'bg-secondary' : 'bg-surface-container-highest'
                }`}
              ></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
export default ProgressIndicator;
