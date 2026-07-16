'use client';

import React, {
  useEffect,
  useState,
} from 'react';

import { getStudent } from '../lib/data';
import { Student } from '../types';
import AppNavigation from './AppNavigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const [student, setStudent] =
    useState<Student | undefined>(
      undefined,
    );

  const fetchStudentData =
    async (): Promise<void> => {
      try {
        const data =
          await getStudent();

        setStudent(data);
      } catch (error) {
        console.error(
          'Failed to load student data:',
          error,
        );
      }
    };

  useEffect(() => {
    void fetchStudentData();

    const handleUpdate = () => {
      void fetchStudentData();
    };

    window.addEventListener(
      'student-progress-updated',
      handleUpdate,
    );

    return () => {
      window.removeEventListener(
        'student-progress-updated',
        handleUpdate,
      );
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9ff] pb-16 md:pb-0 md:pl-20 min-[1800px]:pl-64">
      <AppNavigation
        student={student}
      />

      <main className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}