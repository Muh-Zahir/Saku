import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/budgets?period=YYYY-MM
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || new Date().toISOString().slice(0, 7);

    const result = await db.execute({
      sql: 'SELECT * FROM budgets WHERE period = ? ORDER BY name ASC',
      args: [period],
    });

    return NextResponse.json({ budgets: result.rows });
  } catch (error) {
    console.error('GET /api/budgets error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/budgets
export async function POST(request) {
  try {
    const body = await request.json();
    const { id, name, limit_amount, color, period } = body;
    const currentPeriod = period || new Date().toISOString().slice(0, 7);

    await db.execute({
      sql: `INSERT INTO budgets (id, name, limit_amount, color, period)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              name = excluded.name,
              limit_amount = excluded.limit_amount,
              color = excluded.color`,
      args: [
        id || `b-${Date.now()}`,
        name,
        limit_amount,
        color || 'green',
        currentPeriod,
      ],
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('POST /api/budgets error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/budgets (batch update budgets)
export async function PUT(request) {
  try {
    const body = await request.json();
    const { budgets, period } = body;
    const currentPeriod = period || new Date().toISOString().slice(0, 7);

    // Delete existing budgets for this period and re-insert
    await db.execute({
      sql: 'DELETE FROM budgets WHERE period = ?',
      args: [currentPeriod],
    });

    for (const budget of budgets) {
      await db.execute({
        sql: `INSERT INTO budgets (id, name, spent, limit_amount, color, period)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          budget.id || `b-${Date.now()}-${Math.random()}`,
          budget.name,
          budget.spent || 0,
          budget.limit_amount || budget.limit,
          budget.color || 'green',
          currentPeriod,
        ],
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/budgets error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/budgets?id=...
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Budget ID required' }, { status: 400 });
    }

    await db.execute({ sql: 'DELETE FROM budgets WHERE id = ?', args: [id] });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/budgets error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
