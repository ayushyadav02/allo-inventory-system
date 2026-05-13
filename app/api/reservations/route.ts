import { InventoryService } from "@/lib/services/inventory";
import { CreateReservationSchema } from "@/lib/schemas";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = CreateReservationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { productId, warehouseId, quantity } = result.data;
    const reservation = await InventoryService.reserve(productId, warehouseId, quantity);

    return NextResponse.json(reservation, { status: 201 });
  } catch (error: any) {
    if (error.message === "INSUFFICIENT_STOCK") {
      return NextResponse.json({ error: "Not enough stock available." }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
