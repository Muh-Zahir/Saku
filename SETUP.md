# 🚀 Setup Turso & Vercel untuk Saku

## 1. Setup Turso (Database)

### Install Turso CLI
```bash
# Windows (via scoop)
scoop install turso

# Atau via npm
npm install -g @tursodatabase/cli
```

### Login & Buat Database
```bash
# Login ke Turso
turso auth login

# Buat database baru
turso db create saku

# Lihat URL database
turso db show saku

# Generate auth token
turso db tokens create saku
```

### Salin credentials ke `.env.local`
```env
TURSO_DATABASE_URL=libsql://saku-[username].turso.io
TURSO_AUTH_TOKEN=eyJ...token...
```

---

## 2. Inisialisasi Database Schema

Setelah credentials diset, jalankan:
```bash
# Development: akses endpoint ini di browser
http://localhost:3000/api/seed

# Atau gunakan curl
curl http://localhost:3000/api/seed
```

Ini akan membuat semua tabel dan mengisi dengan data sample.

---

## 3. Deploy ke Vercel

### Via Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (dari folder project)
vercel

# Set environment variables
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN

# Deploy production
vercel --prod
```

### Via Vercel Dashboard (GUI)
1. Buka https://vercel.com/new
2. Import repository `Muh-Zahir/Saku` dari GitHub
3. Buka tab **Environment Variables**
4. Tambahkan:
   - `TURSO_DATABASE_URL` = URL dari `turso db show saku`
   - `TURSO_AUTH_TOKEN` = token dari `turso db tokens create saku`
5. Klik **Deploy**

---

## 4. Seed Production Database

Setelah deploy berhasil:
```bash
curl https://your-app.vercel.app/api/seed
```

---

## Struktur API Routes

| Endpoint | Method | Keterangan |
|----------|--------|------------|
| `/api/transactions` | GET | Ambil semua transaksi |
| `/api/transactions` | POST | Tambah transaksi baru |
| `/api/transactions` | DELETE | Hapus transaksi |
| `/api/wallets` | GET | Ambil semua dompet |
| `/api/wallets` | POST | Tambah dompet baru |
| `/api/wallets` | PUT | Update saldo dompet |
| `/api/budgets` | GET | Ambil anggaran per periode |
| `/api/budgets` | POST | Tambah/update anggaran |
| `/api/budgets` | PUT | Batch update anggaran |
| `/api/savings` | GET | Ambil semua target tabungan |
| `/api/savings` | POST | Tambah target baru |
| `/api/savings` | PUT | Deposit ke tabungan |
| `/api/seed` | GET | Inisialisasi DB + sample data |
