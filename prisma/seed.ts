import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.reservation.deleteMany()
  await prisma.stock.deleteMany()
  await prisma.product.deleteMany()
  await prisma.warehouse.deleteMany()

  const w1 = await prisma.warehouse.create({
    data: { name: "Delhi Main Fulfillment" },
  })

  const w2 = await prisma.warehouse.create({
    data: { name: "Mumbai Express Hub" },
  })

  await prisma.product.create({
    data: {
      name: "iPhone 15 Pro",
      description: "Titanium design, A17 Pro chip, and a versatile Pro camera system. The ultimate iPhone experience.",
      imageUrl: "/products/iphone.png",
      stocks: {
        create: [
          { warehouseId: w1.id, totalUnits: 15 },
          { warehouseId: w2.id, totalUnits: 10 },
        ]
      }
    },
  })

  await prisma.product.create({
    data: {
      name: "MacBook Air M3",
      description: "Supercharged by M3 chip. Strikingly thin and fast, so you can work, play, or create anywhere.",
      imageUrl: "/products/macbook.png",
      stocks: {
        create: [
          { warehouseId: w1.id, totalUnits: 5 },
          { warehouseId: w2.id, totalUnits: 8 },
        ]
      }
    },
  })

  await prisma.product.create({
    data: {
      name: "AirPods Pro (2nd Gen)",
      description: "Up to 2x more Active Noise Cancellation. Transparency mode and Personalized Spatial Audio.",
      imageUrl: "/products/airpods.png",
      stocks: {
        create: [
          { warehouseId: w1.id, totalUnits: 30 },
          { warehouseId: w2.id, totalUnits: 25 },
        ]
      }
    },
  })

  console.log("✅ Realistic seed complete!")
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