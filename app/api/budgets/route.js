import { db, ensureDbReady, parseDateComponents, getPaydayCycleInfo } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/budgets?period=...
export async function GET(request) {
  try {
    await ensureDbReady();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'Oktober 2026';
    const cycleMode = searchParams.get('cycle') || 'payday';
    const paydayDay = parseInt(searchParams.get('paydayDay') || '25', 10);

    const paydayCycle = getPaydayCycleInfo(period, paydayDay);

    const [budgetResult, txResult] = await Promise.all([
      db.execute({
        sql: 'SELECT * FROM budgets WHERE period = ? ORDER BY limit_amount DESC',
        args: [period],
      }),
      db.execute("SELECT period, type, category, amount, date FROM transactions WHERE type = 'expense'"),
    ]);

    const allExpenses = txResult.rows;

    let budgets = budgetResult.rows.map((b) => {
      const paydaySpent = allExpenses
        .filter((t) => {
          if (t.category !== b.name) return false;
          const { timestamp } = parseDateComponents(t.date, t.period);
          return timestamp >= paydayCycle.startTimestamp && timestamp <= paydayCycle.endTimestamp;
        })
        .reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);

      const calendarSpent = allExpenses
        .filter((t) => t.category === b.name && t.period === period)
        .reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);

      const spent = cycleMode === 'calendar' ? calendarSpent : paydaySpent;

      return {
        ...b,
        spent,
        limit: Number(b.limit_amount || b.limit || 0),
        paydaySpent,
        calendarSpent,
      };
    });

    return NextResponse.json({ budgets, paydayCycle });
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
    const currentPeriod = period || 'Oktober 2026';
    const limitVal = Number(limit_amount !== undefined ? limit_amount : limit || 0);

    const budgetId = id || `b-${Date.now()}`;

    await db.execute({
      sql: `INSERT INTO budgets (id, name, spent, limit_amount, color, period)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              name = excluded.name,
              limit_amount = excluded.limit_amount,
              color = excluded.color`,
      args: [
        budgetId,
        name,
        0,
        limitVal,
        color || 'green',
        currentPeriod,
      ],
    });

    return NextResponse.json({ success: true, id: budgetId }, { status: 201 });
  } catch (error) {
    console.error('POST /api/budgets error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/budgets (batch update / sync anggaran bulanan)
export async function PUT(request) {
  try {
    await ensureDbReady();
    const body = await request.json();
    const { budgets, period } = body;
    const currentPeriod = period || 'Oktober 2026';

    if (!Array.isArray(budgets)) {
      return NextResponse.json({ error: 'Data anggaran harus berupa array' }, { status: 400 });
    }

    // 1. Ambil anggaran yang ada sekarang untuk melacak rename kategori
    const existingResult = await db.execute({
      sql: 'SELECT id, name FROM budgets WHERE period = ?',
      args: [currentPeriod],
    });
    const existingMap = new Map(existingResult.rows.map((r) => [r.id, r.name]));

    // 2. Hapus anggaran yang tidak ada lagi di daftar (Sinkronisasi DELETE)
    const activeIds = budgets.map((b) => b.id).filter(Boolean);
    if (activeIds.length > 0) {
      const placeholders = activeIds.map(() => '?').join(',');
      await db.execute({
        sql: `DELETE FROM budgets WHERE period = ? AND id NOT IN (${placeholders})`,
        args: [currentPeriod, ...activeIds],
      });
    } else {
      await db.execute({
        sql: `DELETE FROM budgets WHERE period = ?`,
        args: [currentPeriod],
      });
    }

    // 3. Simpan dan perbarui item anggaran (INSERT / UPDATE)
    for (const budget of budgets) {
      const limitVal = Number(budget.limit !== undefined ? budget.limit : budget.limit_amount || 0);
      const spentVal = Number(budget.spent || 0);
      const budgetId = budget.id || `b-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      // Jika nama berubah, perbarui juga riwayat transaksi yang berkategori lama
      const oldName = existingMap.get(budgetId);
      if (oldName && budget.name && oldName !== budget.name) {
        await db.execute({
          sql: 'UPDATE transactions SET category = ? WHERE category = ?',
          args: [budget.name, oldName],
        });
      }

      await db.execute({
        sql: `INSERT INTO budgets (id, name, spent, limit_amount, color, period)
              VALUES (?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                limit_amount = excluded.limit_amount,
                color = excluded.color,
                spent = excluded.spent`,
        args: [
          budgetId,
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
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {
        // body might be empty
      }
    }

    if (!id) {
      return NextResponse.json({ error: 'Budget ID required' }, { status: 400 });
    }

    await db.execute({ sql: 'DELETE FROM budgets WHERE id = ?', args: [id] });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('DELETE /api/budgets error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
