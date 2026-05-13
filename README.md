# 📦 InventoryRS

Hey there! 👋 Welcome to **InventoryRS**, a little side project I put together to handle inventory reservations safely without double-selling stock.

It's built with the Next.js App Router and Prisma, and it hooks up to a Supabase PostgreSQL database. I wanted to see how easily I could manage high-concurrency stock holds, and this is the result!

## ✨ What does it do?

- **Real-time Inventory** — You can browse through products and instantly see how many units are available at different warehouses.
- **Hold My Spot** — When you click "Reserve", the system actually locks in that stock for you for 10 minutes. Nobody else can snatch it while you're checking out.
- **Concurrency-Safe** — Under the hood, I'm using Prisma database transactions so even if 100 people click "Reserve" at the exact same millisecond, the math stays perfect and we never oversell.
- **Lazy Cleanup** — Instead of running a heavy background cron job to release expired 10-minute holds, the app cleans them up "lazily" the next time someone interacts with the system. Pretty neat!

## 🛠 What's under the hood?

I kept the stack pretty modern:
- **Next.js 16 (App Router)** for the frontend and API routes.
- **TypeScript** everywhere.
- **Prisma** to talk to the database.
- **Supabase** for hosting the Postgres database.
- **Tailwind CSS v4** for styling (keeping it clean with a custom light theme and Outfit font!).

## 🚀 Want to run it yourself?

If you want to spin this up locally, it's super easy. You just need Node.js and a free Supabase account.

**1. Clone it down**
```bash
git clone https://github.com/ayushyadav02/allo-inventory-system.git
cd allo-inventory-system
npm install
```

**2. Set up your environment variables**
Copy the example file to get started:
```bash
cp .env.example .env
```
Then, open `.env` and drop in your Supabase connection strings. You'll need the Pooler connection for `DATABASE_URL` and the Direct connection for `DIRECT_URL`.

**3. Push the database schema and seed some data**
```bash
npx prisma db push
npx prisma generate
npm run seed
```
*(This creates all the tables and adds some dummy products so you have something to look at).*

**4. Fire it up!**
```bash
npm run dev
```
Now just head over to [http://localhost:3000](http://localhost:3000) and click around.

## 🧠 How the reservation math actually works

If you're curious about the backend logic:
1. **Reserving:** When you reserve something, the system starts a transaction, checks if there's enough `totalUnits - reservedUnits`, and if so, it increments `reservedUnits` and gives you a 10-minute hold.
2. **Confirming:** If you "buy" the item, the system permanently deducts the stock from `totalUnits` and clears your `reservedUnits` hold.
3. **Releasing:** If you cancel (or time out), it just decreases `reservedUnits` so the stock is available for the next person.

## 🚢 Deploying

If you want to put this on the internet, just push it to GitHub and import it into Vercel. Make sure to add your `DATABASE_URL` in the Vercel dashboard environment variables, and you're good to go.

---
Feel free to fork this, tear it apart, or use it for your own projects! (MIT License)
