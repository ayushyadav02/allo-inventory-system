# 📦 Inventory Reservation System

A concurrency-safe inventory reservation system built with **Next.js App Router**, **TypeScript**, **Prisma**, **Supabase PostgreSQL**, and **Tailwind CSS**.

## ✨ Features

- **Product & Warehouse Management** — Browse products with stock levels per warehouse
- **Reservation System** — Reserve stock with PENDING → CONFIRMED / RELEASED flow
- **10-Minute Expiry** — Live countdown timer with lazy cleanup on expired reservations
- **Concurrency-Safe** — Uses Prisma transactions to prevent overselling
- **Error Handling** — Proper 409 (conflict) and 410 (gone/expired) error responses shown in UI

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **ORM**: Prisma v7
- **Database**: Supabase PostgreSQL
- **Styling**: Tailwind CSS v4
- **Deployment**: Vercel + Supabase

## 📁 Project Structure

```
app/
├── api/
│   ├── products/route.ts           GET  /api/products
│   ├── warehouses/route.ts         GET  /api/warehouses
│   └── reservations/
│       ├── route.ts                POST /api/reservations
│       └── [id]/
│           ├── confirm/route.ts    POST /api/reservations/:id/confirm
│           └── release/route.ts    POST /api/reservations/:id/release
├── reserve/page.tsx                Reservation checkout page
├── page.tsx                        Product listing page
├── layout.tsx                      Root layout with nav
└── globals.css                     Design system
lib/
├── prisma.ts                       Prisma client singleton
└── cleanup.ts                      Lazy expiry cleanup helper
prisma/
├── schema.prisma                   Database schema
└── seed.ts                         Demo data seed script
```

## 🚀 Setup

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/ayushyadav02/allo-inventory-system.git
cd allo-inventory-system
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Supabase connection strings:
- `DATABASE_URL` — Pooler connection (port 6543, with `?pgbouncer=true`)
- `DIRECT_URL` — Direct connection (port 5432, for Prisma CLI)

You can find these in your Supabase Dashboard → Settings → Database → Connection string.

### 3. Push Schema & Seed

```bash
npx prisma db push
npx prisma generate
npm run seed
```

### 4. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products with stock info |
| GET | `/api/warehouses` | List all warehouses with stock info |
| POST | `/api/reservations` | Create a reservation (body: `{ productId, warehouseId, quantity }`) |
| POST | `/api/reservations/:id/confirm` | Confirm a pending reservation |
| POST | `/api/reservations/:id/release` | Release a pending reservation |

### Error Codes

| Code | Meaning |
|------|---------|
| 409 | Insufficient stock — not enough available units |
| 410 | Reservation expired or already confirmed/released |

## 🧠 How It Works

1. **Reserve**: User picks a product + warehouse + quantity. A `$transaction` atomically checks availability and increments `reservedUnits`. Reservation expires in 10 minutes.

2. **Countdown**: The UI shows a live countdown. When it hits 0, the reservation auto-expires.

3. **Confirm**: Deducts from `totalUnits` and decreases `reservedUnits` (stock is sold).

4. **Release**: Decreases `reservedUnits` (stock goes back to available).

5. **Lazy Cleanup**: Before confirm/release, the system checks if the reservation has expired and auto-releases it if needed. No cron job required.

## 🚢 Deploy

### Vercel

1. Push your code to GitHub
2. Import the repo on [Vercel](https://vercel.com)
3. Add `DATABASE_URL` to environment variables
4. Deploy!

### Supabase

The database is already on Supabase. Just make sure your tables exist by running `npx prisma db push` once.

## 📄 License

MIT
