import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, warehouseId, quantity } = body

    if (!productId || !warehouseId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: "productId, warehouseId, and quantity (>= 1) are required" },
        { status: 400 }
      )
    }

    // Use a transaction for concurrency safety
    const result = await prisma.$transaction(async (tx) => {
      // Find the stock row
      const stock = await tx.stock.findUnique({
        where: {
          productId_warehouseId: { productId, warehouseId },
        },
      })

      if (!stock) {
        throw new Error("STOCK_NOT_FOUND")
      }

      const availableUnits = stock.totalUnits - stock.reservedUnits

      if (availableUnits < quantity) {
        throw new Error("INSUFFICIENT_STOCK")
      }

      // Reserve the units
      await tx.stock.update({
        where: { id: stock.id },
        data: { reservedUnits: { increment: quantity } },
      })

      // Create reservation with 10 minute expiry
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

      const reservation = await tx.reservation.create({
        data: {
          productId,
          warehouseId,
          quantity,
          status: "PENDING",
          expiresAt,
        },
      })

      return reservation
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"

    if (message === "STOCK_NOT_FOUND") {
      return NextResponse.json(
        { error: "Stock not found for this product/warehouse combination" },
        { status: 404 }
      )
    }

    if (message === "INSUFFICIENT_STOCK") {
      return NextResponse.json(
        { error: "Not enough stock available. Try a smaller quantity." },
        { status: 409 }
      )
    }

    console.error("Reservation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
