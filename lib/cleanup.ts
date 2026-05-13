import { prisma } from "@/lib/prisma"

export async function cleanupExpiredReservation(reservationId: string) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  })

  if (!reservation) return null

  if (
    reservation.status === "PENDING" &&
    new Date() > new Date(reservation.expiresAt)
  ) {
    await prisma.stock.updateMany({
      where: {
        productId: reservation.productId,
        warehouseId: reservation.warehouseId,
      },
      data: {
        reservedUnits: { decrement: reservation.quantity },
      },
    })

    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "RELEASED" },
    })

    return updated
  }

  return reservation
}
