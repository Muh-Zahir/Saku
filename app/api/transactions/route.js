import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/transactions
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || 50;
    const type = searchParams.get('type');
    const wallet = searchParams.get('wallet');

    let query = 'SELECT * FROM transactions';
    const conditions = [];
    const args = [];

    if (type) {
      conditions.push('type = ?');
      args.push(type);
    }
    if (wallet) {
      conditions.push('wallet_name = ?');
      args.push(wallet);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    args.push(Number(limit));

    const result = await db.execute({ sql: query, args });
    return NextResponse.json({ transactions: result.rows });
  } catch (error) {
    console.error('GET /api/transactions error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/transactions
export async function POST(request) {
  try {
    const body = await request.json();
    const { id, title, date, category, wallet_id, wallet_name, amount, type, icon, notes } = body;

    await db.execute({
      sql: `INSERT INTO transactions (id, title, date, category, wallet_id, wallet_name, amount, type, icon, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id || `tx-${Date.now()}`,
        title,
        date,
        category,
        wallet_id || 'default',
        wallet_name,
        amount,
        type,
        icon || 'circle',
        notes || null,
      ],
    });

    // Update wallet balance
    if (wallet_id) {
      const balanceChange = type === 'income' ? amount : -Math.abs(amount);
      await db.execute({
        sql: 'UPDATE wallets SET balance = balance + ? WHERE id = ?',
        args: [balanceChange, wallet_id],
      });
    }

    // Update budget spent if expense
    if (type === 'expense' && category) {
      const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM
      await db.execute({
        sql: 'UPDATE budgets SET spent = spent + ? WHERE name = ? AND period = ?',
        args: [Math.abs(amount), category, currentPeriod],
      });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('POST /api/transactions error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/transactions?id=...
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 });
    }

    await db.execute({ sql: 'DELETE FROM transactions WHERE id = ?', args: [id] });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/transactions error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
