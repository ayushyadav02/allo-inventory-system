import { prisma } from "@/lib/prisma";

export class InventoryService {
  /**
   * Cleans up all expired reservations for a clean stock state.
   * This is the "human" way of ensuring data is always fresh.
   */
  static async cleanupAllExpired() {
    const expired = await prisma.reservation.findMany({
      where: {
        status: "PENDING",
        expiresAt: { lt: new Date() },
      },
    });

    if (expired.length === 0) return;

    await prisma.$transaction(async (tx) => {
      for (const res of expired) {
        await tx.stock.updateMany({
          where: {
            productId: res.productId,
            warehouseId: res.warehouseId,
          },
          data: {
            reservedUnits: { decrement: res.quantity },
          },
        });
      }

      await tx.reservation.updateMany({
        where: { id: { in: expired.map((e) => e.id) } },
        data: { status: "RELEASED" },
      });
    });

    console.log(`🧹 Cleaned up ${expired.length} expired reservations`);
  }

  static async getProducts() {
    await this.cleanupAllExpired();

    const products = await prisma.product.findMany({
      include: {
        stocks: {
          include: { warehouse: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      imageUrl: p.imageUrl,
      stocks: p.stocks.map((s) => ({
        warehouseId: s.warehouseId,
        warehouseName: s.warehouse.name,
        totalUnits: s.totalUnits,
        availableUnits: s.totalUnits - s.reservedUnits,
      })),
    }));
  }

  static async reserve(productId: string, warehouseId: string, quantity: number) {
    return await prisma.$transaction(async (tx) => {
      const stock = await tx.stock.findUnique({
        where: { productId_warehouseId: { productId, warehouseId } },
      });

      if (!stock) throw new Error("STOCK_NOT_FOUND");

      const available = stock.totalUnits - stock.reservedUnits;
      if (available < quantity) throw new Error("INSUFFICIENT_STOCK");

      await tx.stock.update({
        where: { id: stock.id },
        data: { reservedUnits: { increment: quantity } },
      });

      return await tx.reservation.create({
        data: {
          productId,
          warehouseId,
          quantity,
          status: "PENDING",
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      });
    });
  }

  static async confirm(id: string) {
    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation || reservation.status !== "PENDING") {
      throw new Error("RESERVATION_NOT_PENDING");
    }

    if (new Date() > reservation.expiresAt) {
      await this.release(id);
      throw new Error("RESERVATION_EXPIRED");
    }

    return await prisma.$transaction(async (tx) => {
      await tx.stock.updateMany({
        where: {
          productId: reservation.productId,
          warehouseId: reservation.warehouseId,
        },
        data: {
          totalUnits: { decrement: reservation.quantity },
          reservedUnits: { decrement: reservation.quantity },
        },
      });

      return await tx.reservation.update({
        where: { id },
        data: { status: "CONFIRMED" },
      });
    });
  }

  static async release(id: string) {
    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation || reservation.status !== "PENDING") {
      throw new Error("RESERVATION_NOT_PENDING");
    }

    return await prisma.$transaction(async (tx) => {
      await tx.stock.updateMany({
        where: {
          productId: reservation.productId,
          warehouseId: reservation.warehouseId,
        },
        data: {
          reservedUnits: { decrement: reservation.quantity },
        },
      });

      return await tx.reservation.update({
        where: { id },
        data: { status: "RELEASED" },
      });
    });
  }
}
