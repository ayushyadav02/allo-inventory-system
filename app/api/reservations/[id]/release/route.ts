import { InventoryService } from "@/lib/services/inventory";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reservation = await InventoryService.release(id);
    return NextResponse.json(reservation);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "RESERVATION_NOT_PENDING") {
      return NextResponse.json({ error: error.message }, { status: 410 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
