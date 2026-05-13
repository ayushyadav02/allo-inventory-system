import { cleanupExpiredReservation } from "@/lib/cleanup"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Lazy cleanup: check if expired first
    const reservation = await cleanupExpiredReservation(id)

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      )
    }

    if (reservation.status !== "PENDING") {
      return NextResponse.json(
        { error: `Reservation is already ${reservation.status}. Cannot release.` },
        { status: 410 }
      )
    }

    // Release: give back the reserved units
    const result = await prisma.$transaction(async (tx) => {
      await tx.stock.updateMany({
        where: {
          productId: reservation.productId,
          warehouseId: reservation.warehouseId,
        },
        data: {
          reservedUnits: { decrement: reservation.quantity },
        },
      })

      return tx.reservation.update({
        where: { id },
        data: { status: "RELEASED" },
      })
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Release error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
