import { db, ensureDbReady } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/savings
export async function GET() {
  try {
    await ensureDbReady();
    const result = await db.execute('SELECT * FROM savings_goals ORDER BY created_at DESC');

    const savings = result.rows.map((s) => ({
      ...s,
      targetDate: s.target_date || 'Target Des 2026',
      current: Number(s.current_amount || 0),
      target: Number(s.target_amount || 0),
    }));

    return NextResponse.json({ savings });
  } catch (error) {
    console.error('GET /api/savings error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/savings (Tambah target baru)
export async function POST(request) {
  try {
    await ensureDbReady();
    const body = await request.json();
    const { id, name, targetDate, target_date, current, current_amount, target, target_amount, type } = body;

    const goalId = id || `s-${Date.now()}`;
    const dateStr = targetDate || target_date || 'Target Des 2026';
    const curVal = Number(current !== undefined ? current : current_amount || 0);
    const tgtVal = Number(target !== undefined ? target : target_amount || 0);

    await db.execute({
      sql: `INSERT INTO savings_goals (id, name, target_date, current_amount, target_amount, type)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        goalId,
        name,
        dateStr,
        curVal,
        tgtVal,
        type || 'shield',
      ],
    });

    return NextResponse.json({
      success: true,
      goal: {
        id: goalId,
        name,
        targetDate: dateStr,
        current: curVal,
        target: tgtVal,
        type: type || 'shield',
      },
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/savings error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/savings (Deposit / Setoran ke tabungan)
export async function PUT(request) {
  try {
    await ensureDbReady();
    const body = await request.json();
    const { id, current_amount, current, deposit_amount } = body;

    if (!id) {
      return NextResponse.json({ error: 'Goal ID required' }, { status: 400 });
    }

    if (deposit_amount !== undefined) {
      await db.execute({
        sql: 'UPDATE savings_goals SET current_amount = current_amount + ? WHERE id = ?',
        args: [Number(deposit_amount), id],
      });
    } else if (current !== undefined || current_amount !== undefined) {
      const val = Number(current !== undefined ? current : current_amount);
      await db.execute({
        sql: 'UPDATE savings_goals SET current_amount = ? WHERE id = ?',
        args: [val, id],
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
    await ensureDbReady();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Goal ID required' }, { status: 400 });
    }

    await db.execute({ sql: 'DELETE FROM savings_goals WHERE id = ?', args: [id] });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/savings error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
