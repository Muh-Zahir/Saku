import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/savings
export async function GET() {
  try {
    const result = await db.execute(
      'SELECT * FROM savings_goals ORDER BY created_at DESC'
    );
    return NextResponse.json({ savings: result.rows });
  } catch (error) {
    console.error('GET /api/savings error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/savings
export async function POST(request) {
  try {
    const body = await request.json();
    const { id, name, target_date, current_amount, target_amount, type } = body;

    await db.execute({
      sql: `INSERT INTO savings_goals (id, name, target_date, current_amount, target_amount, type)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        id || `s-${Date.now()}`,
        name,
        target_date,
        current_amount || 0,
        target_amount,
        type || 'target',
      ],
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('POST /api/savings error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/savings (update current amount - deposit)
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, current_amount, deposit_amount } = body;

    if (deposit_amount !== undefined) {
      // Add deposit to current amount
      await db.execute({
        sql: 'UPDATE savings_goals SET current_amount = current_amount + ? WHERE id = ?',
        args: [deposit_amount, id],
      });
    } else if (current_amount !== undefined) {
      // Set absolute amount
      await db.execute({
        sql: 'UPDATE savings_goals SET current_amount = ? WHERE id = ?',
        args: [current_amount, id],
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/savings error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/savings?id=...
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Savings goal ID required' }, { status: 400 });
    }

    await db.execute({ sql: 'DELETE FROM savings_goals WHERE id = ?', args: [id] });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/savings error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
