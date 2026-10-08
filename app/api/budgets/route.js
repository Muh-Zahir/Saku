import { db, ensureDbReady } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/budgets?period=...
export async function GET(request) {
  try {
    await ensureDbReady();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'September 2026';

    const result = await db.execute({
      sql: 'SELECT * FROM budgets WHERE period = ? ORDER BY limit_amount DESC',
      args: [period],
    });

    let budgets = result.rows.map((b) => ({
      ...b,
      spent: Number(b.spent || 0),
      limit: Number(b.limit_amount || b.limit || 0),
    }));

    if (budgets.length === 0) {
      const allBudgets = await db.execute('SELECT * FROM budgets LIMIT 10');
      budgets = allBudgets.rows.map((b) => ({
        ...b,
        spent: Number(b.spent || 0),
        limit: Number(b.limit_amount || b.limit || 0),
      }));
    }

    return NextResponse.json({ budgets });
  } catch (error) {
    console.error('GET /api/budgets error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/budgets
export async function POST(request) {
  try {
    await ensureDbReady();
    const body = await request.json();
    const { id, name, limit_amount, limit, color, period } = body;
    const currentPeriod = period || 'September 2026';
    const limitVal = Number(limit_amount !== undefined ? limit_amount : limit || 0);

    await db.execute({
      sql: `INSERT INTO budgets (id, name, spent, limit_amount, color, period)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              name = excluded.name,
              limit_amount = excluded.limit_amount,
              color = excluded.color`,
      args: [
        id || `b-${Date.now()}`,
        name,
        0,
        limitVal,
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

// PUT /api/budgets (batch update anggaran bulanan)
export async function PUT(request) {
  try {
    await ensureDbReady();
    const body = await request.json();
    const { budgets, period } = body;
    const currentPeriod = period || 'September 2026';

    if (!Array.isArray(budgets)) {
      return NextResponse.json({ error: 'Data anggaran harus berupa array' }, { status: 400 });
    }

    for (const budget of budgets) {
      const limitVal = Number(budget.limit !== undefined ? budget.limit : budget.limit_amount || 0);
      const spentVal = Number(budget.spent || 0);

      await db.execute({
        sql: `INSERT INTO budgets (id, name, spent, limit_amount, color, period)
              VALUES (?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                limit_amount = excluded.limit_amount,
                color = excluded.color,
                spent = excluded.spent`,
        args: [
          budget.id || `b-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          budget.name,
          spentVal,
          limitVal,
          budget.color || 'green',
          budget.period || currentPeriod,
        ],
      });
    }

    return NextResponse.json({ success: true, budgets });
  } catch (error) {
    console.error('PUT /api/budgets error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/budgets?id=...
export async function DELETE(request) {
  try {
    await ensureDbReady();
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
