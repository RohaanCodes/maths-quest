import { NextResponse } from 'next/server';
import { fetchChallengesFromAirtable } from '../../../lib/airtable';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const worldId = searchParams.get('worldId');
    const challengeId = searchParams.get('challengeId');
    
    const challenges = await fetchChallengesFromAirtable();
    
    if (challengeId) {
      const challenge = challenges.find(c => c.id === challengeId);
      return NextResponse.json(challenge || null);
    }
    
    if (worldId) {
      // Find challenges by worldId
      const filtered = challenges.filter(c => 
        c.worldId === worldId || 
        c.worldId === `world-${worldId}` || 
        c.worldId.toLowerCase().includes(worldId.toLowerCase())
      );
      return NextResponse.json(filtered);
    }

    return NextResponse.json(challenges);
  } catch (error: any) {
    console.error('Error in GET /api/challenges:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
