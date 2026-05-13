import { InventoryService } from "@/lib/services/inventory";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await InventoryService.getProducts();
  return NextResponse.json(data);
}
