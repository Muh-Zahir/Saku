import { initializeDatabase, seedInitialData, resetDatabaseToZero } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/seed - Inisialisasi atau reseed data multi-periode
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const isReset = searchParams.get('reset') === 'true';
    const isReseed = searchParams.get('reseed') === 'true' || searchParams.get('force') === 'true';

    await initializeDatabase();

    if (isReset) {
      await resetDatabaseToZero();
      return NextResponse.json({ message: 'Database reset to 0 successfully!', reset: true });
    }

    if (isReseed) {
      await seedInitialData(true);
      return NextResponse.json({ message: 'Database reseeded with multi-period data successfully!', seeded: true });
    }

    await seedInitialData(false);
    return NextResponse.json({ message: 'Database initialized successfully!', seeded: true });
  } catch (error) {
    console.error('Seed/Reset error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
