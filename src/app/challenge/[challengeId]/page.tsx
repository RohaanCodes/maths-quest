export const dynamic = 'force-dynamic';

import { getChallengeById, getStudent } from '../../../lib/data';
import ChallengeClient from './ChallengeClient';

interface PageProps {
  params: Promise<{ challengeId: string }>;
}

export default async function ChallengePage({ params }: PageProps) {
  const resolvedParams = await params;
  const challengeId = resolvedParams.challengeId;

  const challenge = await getChallengeById(challengeId);
  const student = await getStudent();

  return (
    <ChallengeClient 
      challengeId={challengeId} 
      initialChallenge={challenge} 
      initialStudent={student} 
    />
  );
}
