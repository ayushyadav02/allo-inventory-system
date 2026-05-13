import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {

  const w1 = await prisma.warehouse.create({
    data: {
      name: "Delhi Warehouse"
    }
  })

  const w2 = await prisma.warehouse.create({
    data: {
      name: "Mumbai Warehouse"
    }
  })

  const p1 = await prisma.product.create({
    data: {
      name: "iPhone 15"
    }
  })

  const p2 = await prisma.product.create({
    data: {
      name: "MacBook Air"
    }
  })

  await prisma.stock.createMany({
    data: [
      {
        productId: p1.id,
        warehouseId: w1.id,
        totalUnits: 5
      },
      {
        productId: p1.id,
        warehouseId: w2.id,
        totalUnits: 3
      },
      {
        productId: p2.id,
        warehouseId: w1.id,
        totalUnits: 2
      }
    ]
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
  })