import { InventoryService } from "@/lib/services/inventory";
import { CreateReservationSchema } from "@/lib/schemas";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = CreateReservationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid request data" },
        { status: 400 }
      );
    }

    const { productId, warehouseId, quantity } = result.data;
    const reservation = await InventoryService.reserve(productId, warehouseId, quantity);

    return NextResponse.json(reservation, { status: 201 });
  } catch (error: unknown) {
    console.error("[RESERVATION_ERROR]", error);
    if (error instanceof Error) {
      if (error.message === "INSUFFICIENT_STOCK") {
        return NextResponse.json({ error: "Not enough stock available." }, { status: 409 });
      }
      if (error.message === "STOCK_NOT_FOUND") {
        return NextResponse.json({ error: "Product stock not found in this warehouse." }, { status: 404 });
      }
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
