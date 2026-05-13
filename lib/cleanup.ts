import { prisma } from "@/lib/prisma"

/**
 * Lazy expiry cleanup: checks if a PENDING reservation has expired.
 * If expired, releases the reserved units and marks it as RELEASED.
 * Returns the updated reservation.
 */
export async function cleanupExpiredReservation(reservationId: string) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  })

  if (!reservation) return null

  // Only cleanup PENDING reservations that have expired
  if (
    reservation.status === "PENDING" &&
    new Date() > new Date(reservation.expiresAt)
  ) {
    // Release the reserved units
    await prisma.stock.updateMany({
      where: {
        productId: reservation.productId,
        warehouseId: reservation.warehouseId,
      },
      data: {
        reservedUnits: { decrement: reservation.quantity },
      },
    })

    // Mark reservation as RELEASED
    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "RELEASED" },
    })

    return updated
  }

  return reservation
}
