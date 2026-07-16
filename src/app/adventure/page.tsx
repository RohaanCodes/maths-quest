export const dynamic = 'force-dynamic';

import { getWorlds } from '../../lib/data';
import AdventureClient from './AdventureClient';

export default async function AdventurePage() {
  const worlds = await getWorlds();

  return <AdventureClient initialWorlds={worlds} />;
}
