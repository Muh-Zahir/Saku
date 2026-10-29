import { db, ensureDbReady } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/schedules
export async function GET(request) {
  try {
    await ensureDbReady();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const month = searchParams.get('month'); // optional format YYYY-MM

    let sql = 'SELECT * FROM financial_schedules';
    const conditions = [];
    const args = [];

    if (type && type !== 'all') {
      conditions.push('type = ?');
      args.push(type);
    }

    if (month) {
      conditions.push("due_date LIKE ?");
      args.push(`${month}%`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY due_date ASC, created_at ASC';

    const result = await db.execute({ sql, args });
    const schedules = result.rows.map((row) => ({
      ...row,
      amount: Number(row.amount || 0),
      is_paid: Boolean(Number(row.is_paid || 0)),
    }));

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error('GET /api/schedules error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/schedules
export async function POST(request) {
  try {
    await ensureDbReady();

    const body = await request.json();
    const {
      id,
      title,
      type = 'debt',
      amount = 0,
      due_date,
      recurring = 'once',
      recurring_day = null,
      wallet_id = null,
      wallet_name = null,
      notes = null,
      is_paid = 0,
    } = body;

    if (!title || !due_date) {
      return NextResponse.json({ error: 'Judul dan tanggal jatuh tempo wajib diisi' }, { status: 400 });
    }

    const scheduleId = id || `sch-${Date.now()}`;
    const numAmount = Math.max(0, Number(amount) || 0);
    const isPaidInt = is_paid ? 1 : 0;
    const paidAt = isPaidInt ? new Date().toISOString().split('T')[0] : null;

    await db.execute({
      sql: `INSERT OR REPLACE INTO financial_schedules 
            (id, title, type, amount, due_date, recurring, recurring_day, wallet_id, wallet_name, notes, is_paid, paid_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        scheduleId,
        title,
        type,
        numAmount,
        due_date,
        recurring,
        recurring_day ?? null,
        wallet_id ?? null,
        wallet_name ?? null,
        notes ?? null,
        isPaidInt,
        paidAt,
      ],
    });

    return NextResponse.json({
      success: true,
      schedule: {
        id: scheduleId,
        title,
        type,
        amount: numAmount,
        due_date,
        recurring,
        recurring_day,
        wallet_id,
        wallet_name,
        notes,
        is_paid: Boolean(isPaidInt),
        paid_at: paidAt,
      },
    });
  } catch (error) {
    console.error('POST /api/schedules error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/schedules
export async function PUT(request) {
  try {
    await ensureDbReady();

    const body = await request.json();
    const {
      id,
      toggle_paid,
      is_paid,
      title,
      type,
      amount,
      due_date,
      recurring,
      recurring_day,
      wallet_id,
      wallet_name,
      notes,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Schedule ID wajib disertakan' }, { status: 400 });
    }

    // Cek apakah ini hanya request toggle status lunas (tanpa mengubah form data lainnya)
    const isOnlyTogglePaid =
      (toggle_paid === true || (is_paid !== undefined && toggle_paid !== false)) &&
      title === undefined &&
      due_date === undefined &&
      amount === undefined &&
      type === undefined;

    if (isOnlyTogglePaid) {
      const nextPaidVal = toggle_paid !== undefined ? (toggle_paid ? 1 : 0) : (is_paid ? 1 : 0);
      const paidAt = nextPaidVal ? new Date().toISOString().split('T')[0] : null;

      await db.execute({
        sql: 'UPDATE financial_schedules SET is_paid = ?, paid_at = ? WHERE id = ?',
        args: [nextPaidVal, paidAt, id],
      });

      return NextResponse.json({ success: true, is_paid: Boolean(nextPaidVal), paid_at: paidAt });
    }

    // General update: edit jadwal finansial lengkap
    const numAmount = amount !== undefined && amount !== null ? Number(amount) : null;
    const isPaidInt = is_paid !== undefined ? (is_paid ? 1 : 0) : null;
    const paidAt = isPaidInt === 1 ? new Date().toISOString().split('T')[0] : (isPaidInt === 0 ? null : null);

    await db.execute({
      sql: `UPDATE financial_schedules 
            SET title = COALESCE(?, title),
                type = COALESCE(?, type),
                amount = COALESCE(?, amount),
                due_date = COALESCE(?, due_date),
                recurring = COALESCE(?, recurring),
                recurring_day = ?,
                wallet_id = ?,
                wallet_name = ?,
                notes = ?,
                is_paid = COALESCE(?, is_paid),
                paid_at = CASE 
                  WHEN ? IS NOT NULL THEN ? 
                  ELSE paid_at 
                END
            WHERE id = ?`,
      args: [
        title ?? null,
        type ?? null,
        numAmount,
        due_date ?? null,
        recurring ?? null,
        recurring_day ?? null,
        wallet_id ?? null,
        wallet_name ?? null,
        notes ?? null,
        isPaidInt,
        isPaidInt,
        paidAt,
        id,
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/schedules error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/schedules?id=...
export async function DELETE(request) {
  try {
    await ensureDbReady();

    let id = null;
    try {
      const url = new URL(request.url);
      id = url.searchParams.get('id');
    } catch (e) {}

    if (!id && request.nextUrl) {
      id = request.nextUrl.searchParams.get('id');
    }

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch (e) {}
    }

    if (!id) {
      return NextResponse.json({ error: 'Schedule ID wajib disertakan' }, { status: 400 });
    }

    await db.execute({
      sql: 'DELETE FROM financial_schedules WHERE id = ?',
      args: [id],
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('DELETE /api/schedules error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
