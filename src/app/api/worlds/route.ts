import { NextResponse } from 'next/server';
import { fetchWorldsFromAirtable } from '../../../lib/airtable';

export async function GET() {
  try {
    const worlds = await fetchWorldsFromAirtable();
    return NextResponse.json(worlds);
  } catch (error: any) {
    console.error('Error in GET /api/worlds:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
