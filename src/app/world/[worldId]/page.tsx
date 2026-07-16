export const dynamic = 'force-dynamic';

import { getWorldByDomain, getChallengesByWorld, getStudent } from '../../../lib/data';
import WorldMapClient from './WorldMapClient';

interface PageProps {
  params: Promise<{ worldId: string }>;
}

export default async function WorldPage({ params }: PageProps) {
  const resolvedParams = await params;
  const worldId = resolvedParams.worldId;

  const world = await getWorldByDomain(worldId);
  const challenges = await getChallengesByWorld(worldId);
  const student = await getStudent();

  return (
    <WorldMapClient 
      worldId={worldId} 
      initialWorld={world} 
      initialChallenges={challenges} 
      initialStudent={student} 
    />
  );
}
