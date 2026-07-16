export const dynamic = 'force-dynamic';

import {
  getWorlds,
  getStudent,
  getStudentProgress,
} from '../../lib/data';

import HomeClient from './HomeClient';

export default async function HomePage() {
  const [
    worlds,
    student,
    progress,
  ] = await Promise.all([
    getWorlds(),
    getStudent(),
    getStudentProgress(),
  ]);

  return (
    <HomeClient
      initialWorlds={worlds}
      initialStudent={student}
      initialProgress={progress}
    />
  );
}