import { InventoryService } from "@/lib/services/inventory";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reservation = await InventoryService.confirm(id);
    return NextResponse.json(reservation);
  } catch (error: any) {
    if (error.message === "RESERVATION_NOT_PENDING" || error.message === "RESERVATION_EXPIRED") {
      return NextResponse.json({ error: error.message }, { status: 410 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
