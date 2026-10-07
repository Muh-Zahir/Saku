import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/wallets
export async function GET() {
  try {
    const result = await db.execute('SELECT * FROM wallets ORDER BY created_at ASC');
    return NextResponse.json({ wallets: result.rows });
  } catch (error) {
    console.error('GET /api/wallets error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/wallets
export async function POST(request) {
  try {
    const body = await request.json();
    const { id, name, type, balance, color, icon } = body;

    await db.execute({
      sql: `INSERT INTO wallets (id, name, type, balance, color, icon)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        id || `w-${Date.now()}`,
        name,
        type || 'bank',
        balance || 0,
        color || 'emerald',
        icon || 'wallet',
      ],
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('POST /api/wallets error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/wallets (update balance transfer)
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, balance } = body;

    await db.execute({
      sql: 'UPDATE wallets SET balance = ? WHERE id = ?',
      args: [balance, id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/wallets error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/wallets?id=...
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Wallet ID required' }, { status: 400 });
    }

    await db.execute({ sql: 'DELETE FROM wallets WHERE id = ?', args: [id] });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/wallets error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
