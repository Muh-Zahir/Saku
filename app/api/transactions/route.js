import { db, ensureDbReady } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/transactions
export async function GET(request) {
  try {
    await ensureDbReady();

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || 100;
    const type = searchParams.get('type');
    const wallet = searchParams.get('wallet');

    let query = 'SELECT * FROM transactions';
    const conditions = [];
    const args = [];

    if (type && type !== 'all') {
      conditions.push('type = ?');
      args.push(type);
    }
    if (wallet && wallet !== 'Semua') {
      conditions.push('wallet_name = ?');
      args.push(wallet);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    args.push(Number(limit));

    const result = await db.execute({ sql: query, args });
    const transactions = result.rows.map((row) => ({
      ...row,
      amount: Number(row.amount || 0),
      wallet: row.wallet_name || row.wallet || 'BCA',
    }));

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('GET /api/transactions error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/transactions
export async function POST(request) {
  try {
    await ensureDbReady();

    const body = await request.json();
    const { id, title, date, category, wallet_id, wallet, wallet_name, amount, type, icon, notes } = body;

    const actualWalletName = wallet_name || wallet || 'BCA';
    const txId = id || `tx-${Date.now()}`;
    const numAmount = Number(amount);

    await db.execute({
      sql: `INSERT INTO transactions (id, title, date, category, wallet_id, wallet_name, amount, type, icon, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        txId,
        title,
        date || 'Hari ini',
        category || 'Lainnya',
        wallet_id || null,
        actualWalletName,
        numAmount,
        type,
        icon || (type === 'income' ? 'briefcase' : 'shopping-bag'),
        notes || null,
      ],
    });

    // Update saldo dompet
    const balanceChange = type === 'income' ? Math.abs(numAmount) : -Math.abs(numAmount);
    if (wallet_id) {
      await db.execute({
        sql: 'UPDATE wallets SET balance = balance + ? WHERE id = ?',
        args: [balanceChange, wallet_id],
      });
    } else {
      await db.execute({
        sql: 'UPDATE wallets SET balance = balance + ? WHERE name = ?',
        args: [balanceChange, actualWalletName],
      });
    }

    // Update pengeluaran anggaran jika expense
    if (type === 'expense' && category) {
      await db.execute({
        sql: 'UPDATE budgets SET spent = spent + ? WHERE name = ?',
        args: [Math.abs(numAmount), category],
      });
    }

    return NextResponse.json({
      success: true,
      transaction: {
        id: txId,
        title,
        date,
        category,
        wallet: actualWalletName,
        wallet_name: actualWalletName,
        amount: numAmount,
        type,
        icon,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/transactions error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/transactions?id=...
export async function DELETE(request) {
  try {
    await ensureDbReady();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 });
    }

    // Dapatkan data transaksi sebelum dihapus untuk rollback saldo
    const existing = await db.execute({
      sql: 'SELECT * FROM transactions WHERE id = ?',
      args: [id],
    });

    if (existing.rows.length > 0) {
      const tx = existing.rows[0];
      const revertAmount = tx.type === 'income' ? -Math.abs(tx.amount) : Math.abs(tx.amount);

      // Rollback saldo dompet
      if (tx.wallet_id) {
        await db.execute({
          sql: 'UPDATE wallets SET balance = balance + ? WHERE id = ?',
          args: [revertAmount, tx.wallet_id],
        });
      } else if (tx.wallet_name) {
        await db.execute({
          sql: 'UPDATE wallets SET balance = balance + ? WHERE name = ?',
          args: [revertAmount, tx.wallet_name],
        });
      }

      // Rollback spent anggaran jika expense
      if (tx.type === 'expense' && tx.category) {
        await db.execute({
          sql: 'UPDATE budgets SET spent = MAX(0, spent - ?) WHERE name = ?',
          args: [Math.abs(tx.amount), tx.category],
        });
      }
    }

    await db.execute({ sql: 'DELETE FROM transactions WHERE id = ?', args: [id] });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('DELETE /api/transactions error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
