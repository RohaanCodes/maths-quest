import React from 'react';
import Link from 'next/link';
import {
  usePathname,
  useRouter,
} from 'next/navigation';

import { Student } from '../types';

interface AppNavigationProps {
  student?: Student;
}

export const AppNavigation: React.FC<
  AppNavigationProps
> = ({ student }) => {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      path: '/home',
      label: 'Home',
      icon: 'home',
    },
    {
      path: '/adventure',
      label: 'Adventure',
      icon: 'explore',
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: 'person',
    },
  ];

  return (
    <>
      {/* Tablet and desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-20 flex-col justify-between border-r-2 border-surface-container bg-white px-3 py-5 shadow-sm md:flex min-[1800px]:w-64 min-[1800px]:px-4 min-[1800px]:py-6">
        <div className="space-y-6">
          {/* Brand */}
          <button
            type="button"
            onClick={() =>
              router.push('/home')
            }
            className="flex w-full items-center justify-center rounded-2xl text-left outline-none transition hover:bg-surface-container-low min-[1800px]:justify-start min-[1800px]:px-2 min-[1800px]:py-1"
            aria-label="Go to Math Quest home"
          >
            {/* Collapsed logo */}
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-sm min-[1800px]:hidden">
              <span className="material-symbols-outlined text-2xl">
                auto_stories
              </span>
            </div>

            {/* Expanded brand */}
            <div className="hidden min-[1800px]:block">
              <h1 className="font-display text-3xl tracking-tight text-primary">
                Math Quest
              </h1>

              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Level {student?.level || 1}{' '}
                Explorer
              </p>
            </div>
          </button>

          {/* Student */}
          {student && (
            <button
              type="button"
              onClick={() =>
                router.push('/profile')
              }
              className="flex w-full items-center justify-center rounded-2xl border border-surface-container bg-surface-container-low p-2 transition-colors hover:bg-surface-container min-[1800px]:justify-start min-[1800px]:gap-3"
              aria-label={`Open ${student.name}'s profile`}
            >
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-primary bg-primary-fixed">
                <img
                  className="h-full w-full object-cover"
                  src={student.avatarUrl}
                  alt={student.name}
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="hidden min-w-0 text-left min-[1800px]:block">
                <p className="truncate font-display text-sm font-bold text-on-surface">
                  {student.name}
                </p>

                <p className="truncate text-[11px] font-semibold text-on-surface-variant">
                  Rank: {student.rank}
                </p>
              </div>
            </button>
          )}

          {/* Navigation */}
          <nav className="space-y-2 pt-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.path ||
                pathname.startsWith(
                  `${item.path}/`,
                );

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  aria-label={item.label}
                  title={item.label}
                  className={`group relative flex h-13 items-center justify-center rounded-2xl px-3 py-3 font-display text-sm font-bold transition-all min-[1800px]:justify-start min-[1800px]:gap-3 min-[1800px]:px-4 ${
                    isActive
                      ? 'bg-primary-container/15 text-primary'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-2xl ${
                      isActive ? 'filled' : ''
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span className="hidden min-[1800px]:inline">
                    {item.label}
                  </span>

                  {isActive && (
                    <span className="absolute right-0 h-8 w-1 rounded-l-full bg-primary min-[1800px]:h-9" />
                  )}

                  {/* Tooltip for collapsed sidebar */}
                  <span className="pointer-events-none absolute left-[68px] z-50 hidden whitespace-nowrap rounded-lg bg-[#07152f] px-3 py-2 text-[11px] font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 md:block min-[1800px]:hidden">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* XP indicator */}
        {student && (
          <div className="flex justify-center min-[1800px]:justify-start">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/15 bg-primary-fixed/40 text-primary min-[1800px]:h-auto min-[1800px]:w-full min-[1800px]:justify-start min-[1800px]:gap-3 min-[1800px]:p-3">
              <span className="material-symbols-outlined text-xl">
                stars
              </span>

              <div className="hidden min-[1800px]:block">
                <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant">
                  Total XP
                </p>

                <p className="font-display text-sm font-black text-primary">
                  {student.xp}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t-2 border-surface-container bg-white shadow-lg md:hidden">
        {navItems.map((item) => {
          const isActive =
            pathname === item.path ||
            pathname.startsWith(
              `${item.path}/`,
            );

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex w-1/3 flex-col items-center gap-1 font-display text-[11px] font-bold transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span
                className={`material-symbols-outlined ${
                  isActive ? 'filled' : ''
                }`}
              >
                {item.icon}
              </span>

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default AppNavigation;