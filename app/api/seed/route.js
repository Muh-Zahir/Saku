import { db, initializeDatabase, seedInitialData, resetDatabaseToZero } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/seed - Initialize or Reset DB with 0 data
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const isReset = searchParams.get('reset') === 'true';

    await initializeDatabase();
    if (isReset) {
      await resetDatabaseToZero();
      return NextResponse.json({ message: 'Database reset to 0 successfully!', reset: true });
    }

    await seedInitialData();
    return NextResponse.json({ message: 'Database initialized with 0 data successfully!', seeded: true });
  } catch (error) {
    console.error('Seed/Reset error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
