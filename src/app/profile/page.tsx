export const dynamic = 'force-dynamic';

import {
  getStudent,
  getStudentProgress,
  getStudentApiData,
} from '../../lib/data';

import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const student = await getStudent();
  const progress = await getStudentProgress();

  const { stats } = await getStudentApiData();

  return (
    <ProfileClient
      initialStudent={student}
      initialProgress={progress}
      initialStats={stats}
    />
  );
}