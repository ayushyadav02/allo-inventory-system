import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      stocks: {
        include: {
          warehouse: true,
        },
      },
    },
  })

  const data = products.map((p) => ({
    id: p.id,
    name: p.name,
    stocks: p.stocks.map((s) => ({
      warehouseId: s.warehouseId,
      warehouseName: s.warehouse.name,
      totalUnits: s.totalUnits,
      availableUnits: s.totalUnits - s.reservedUnits,
    })),
  }))

  return NextResponse.json(data)
}
