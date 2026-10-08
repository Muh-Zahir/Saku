import { db, initializeDatabase, seedInitialData } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/seed - Initialize DB with sample data
export async function GET() {
  try {
    await initializeDatabase();
    await seedInitialData();

    return NextResponse.json({ message: 'Database seeded successfully!', seeded: true });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
