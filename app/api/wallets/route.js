import { db, ensureDbReady } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/wallets
export async function GET() {
  try {
    await ensureDbReady();
    const result = await db.execute('SELECT * FROM wallets ORDER BY created_at ASC');

    const totalSaldo = result.rows.reduce((sum, w) => sum + Number(w.balance || 0), 0);
    const wallets = result.rows.map((w) => ({
      ...w,
      balance: Number(w.balance || 0),
      share: totalSaldo > 0
        ? `${((Number(w.balance || 0) / totalSaldo) * 100).toFixed(1).replace('.', ',')}%`
        : '0%',
    }));

    return NextResponse.json({ wallets });
  } catch (error) {
    console.error('GET /api/wallets error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/wallets (Tambah dompet/rekening baru)
export async function POST(request) {
  try {
    await ensureDbReady();
    const body = await request.json();
    const { id, name, type, balance, color, icon } = body;

    const walletId = id || `w-${Date.now()}`;
    const initialBalance = Number(balance || 0);

    await db.execute({
      sql: `INSERT INTO wallets (id, name, type, balance, color, icon)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        walletId,
        name,
        type || 'Rekening bank',
        initialBalance,
        color || 'emerald',
        icon || 'bank',
      ],
    });

    return NextResponse.json({
      success: true,
      wallet: {
        id: walletId,
        name,
        type: type || 'Rekening bank',
        balance: initialBalance,
        color: color || 'emerald',
        icon: icon || 'bank',
      },
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/wallets error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/wallets (Transfer antar dompet ATAU Update saldo)
export async function PUT(request) {
  try {
    await ensureDbReady();
    const body = await request.json();
    const { fromWallet, toWallet, amount, id, balance } = body;

    // Jika ini adalah transfer antar dompet
    if (fromWallet && toWallet && amount) {
      const numAmount = Number(amount);
      if (numAmount <= 0) {
        return NextResponse.json({ error: 'Nominal transfer tidak valid' }, { status: 400 });
      }

      // Kurangi saldo dari fromWallet
      await db.execute({
        sql: 'UPDATE wallets SET balance = balance - ? WHERE name = ? OR id = ?',
        args: [numAmount, fromWallet, fromWallet],
      });

      // Tambah saldo ke toWallet
      await db.execute({
        sql: 'UPDATE wallets SET balance = balance + ? WHERE name = ? OR id = ?',
        args: [numAmount, toWallet, toWallet],
      });

      return NextResponse.json({ success: true, transfer: { fromWallet, toWallet, amount: numAmount } });
    }

    // Jika ini adalah update saldo langsung
    if (id !== undefined && balance !== undefined) {
      await db.execute({
        sql: 'UPDATE wallets SET balance = ? WHERE id = ?',
        args: [Number(balance), id],
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Parameter tidak lengkap' }, { status: 400 });
  } catch (error) {
    console.error('PUT /api/wallets error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/wallets?id=...
export async function DELETE(request) {
  try {
    await ensureDbReady();
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
