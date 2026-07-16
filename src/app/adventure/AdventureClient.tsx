'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { World } from '../../types';
import { getWorlds } from '../../lib/data';
import DashboardLayout from '../../components/DashboardLayout';
import WorldCard from '../../components/WorldCard';

interface AdventureClientProps {
  initialWorlds: World[];
}

export default function AdventureClient({ initialWorlds }: AdventureClientProps) {
  const [worlds, setWorlds] = useState<World[]>(initialWorlds);
  const router = useRouter();

  useEffect(() => {
    getWorlds().then(setWorlds);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 text-left pb-10">
        <div>
          <h2 className="font-display text-3xl font-bold text-on-surface">Adventure Map Realms</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-1">
            Travel across themed floating regions, solve quests, and claim rare medallions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {worlds.map((world) => (
            <WorldCard 
              key={world.id} 
              world={world} 
              onExplore={(id) => router.push(`/world/${id}`)} 
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
