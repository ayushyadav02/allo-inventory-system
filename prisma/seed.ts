import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  // Clean up existing data (order matters due to foreign keys)
  await prisma.reservation.deleteMany()
  await prisma.stock.deleteMany()
  await prisma.product.deleteMany()
  await prisma.warehouse.deleteMany()

  const w1 = await prisma.warehouse.create({
    data: { name: "Delhi Warehouse" },
  })

  const w2 = await prisma.warehouse.create({
    data: { name: "Mumbai Warehouse" },
  })

  const p1 = await prisma.product.create({
    data: { name: "iPhone 15" },
  })

  const p2 = await prisma.product.create({
    data: { name: "MacBook Air M3" },
  })

  const p3 = await prisma.product.create({
    data: { name: "AirPods Pro" },
  })

  await prisma.stock.createMany({
    data: [
      { productId: p1.id, warehouseId: w1.id, totalUnits: 10 },
      { productId: p1.id, warehouseId: w2.id, totalUnits: 5 },
      { productId: p2.id, warehouseId: w1.id, totalUnits: 3 },
      { productId: p2.id, warehouseId: w2.id, totalUnits: 7 },
      { productId: p3.id, warehouseId: w1.id, totalUnits: 20 },
      { productId: p3.id, warehouseId: w2.id, totalUnits: 15 },
    ],
  })

  console.log("✅ Seed complete!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })