"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Clock, ShieldCheck, Warehouse, ArrowLeft, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Reservation = {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  status: "PENDING" | "CONFIRMED" | "RELEASED";
  expiresAt: string;
  createdAt: string;
};

function ReservePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const productId = searchParams.get("productId") || "";
  const warehouseId = searchParams.get("warehouseId") || "";
  const productName = searchParams.get("productName") || "Product";
  const warehouseName = searchParams.get("warehouseName") || "Warehouse";
  const available = parseInt(searchParams.get("available") || "0");

  const [quantity, setQuantity] = useState(1);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState<string | null>(null);
  useEffect(() => {
    if (!reservation || reservation.status !== "PENDING") return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(reservation.expiresAt).getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        setReservation((prev) => prev ? { ...prev, status: "RELEASED" } : null);
        toast.error("Reservation Expired", { description: "The stock hold has been released." });
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reservation]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleReserve = async () => {
    setLoading("reserve");
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, warehouseId, quantity }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setReservation(data);
      const remaining = Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000);
      setTimeLeft(remaining);
      toast.success("Stock Reserved", { description: `Held for 10 minutes.` });
    } catch (e: any) {
      toast.error("Reservation Failed", { description: e.message });
    } finally {
      setLoading(null);
    }
  };

  const handleAction = async (action: "confirm" | "release") => {
    if (!reservation) return;
    setLoading(action);
    try {
      const res = await fetch(`/api/reservations/${reservation.id}/${action}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setReservation(data);
      toast.success(action === "confirm" ? "Order Confirmed" : "Hold Released");
    } catch (e: any) {
      toast.error(`${action === "confirm" ? "Confirmation" : "Release"} Failed`, { description: e.message });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-foreground mb-10 group">
        <ArrowLeft className="w-4 h-4" />
        Return to Catalog
      </Link>

      <div className="bg-card-bg border border-card-border rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-card-border bg-accent/5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-foreground mb-2">{productName}</h1>
              <div className="flex items-center gap-2 text-muted text-sm font-medium">
                <Warehouse className="w-4 h-4 text-accent" />
                {warehouseName}
              </div>
            </div>
            <div className="bg-background/80 px-4 py-2 rounded-2xl border border-card-border flex flex-col items-end">
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Available</span>
              <span className="text-lg font-black text-foreground">{available}</span>
            </div>
          </div>
        </div>

        <div className="p-8">
          {!reservation ? (
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-xs font-bold text-muted uppercase tracking-widest flex justify-between">
                  Reservation Quantity
                  <span className="text-accent">Max Hold: {Math.min(available, 10)}</span>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max={Math.min(available, 10)}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="flex-1 accent-accent"
                  />
                  <div className="w-16 h-12 flex items-center justify-center bg-background border border-card-border rounded-xl text-xl font-black text-foreground">
                    {quantity}
                  </div>
                </div>
              </div>

              <button
                onClick={handleReserve}
                disabled={loading === "reserve"}
                className="w-full h-14 bg-accent hover:bg-accent-hover disabled:bg-card-border disabled:cursor-not-allowed text-white font-black text-lg rounded-2xl flex items-center justify-center gap-2"
              >
                {loading === "reserve" ? <Loader2 className="w-5 h-5" /> : "Initiate Reservation"}
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted uppercase tracking-widest">System Status</span>
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                  reservation.status === "PENDING" ? "bg-warning/10 text-warning border-warning/20" : 
                  reservation.status === "CONFIRMED" ? "bg-success/10 text-success border-success/20" : 
                  "bg-danger/10 text-danger border-danger/20"
                )}>
                  {reservation.status}
                </div>
              </div>

              {reservation.status === "PENDING" && (
                <div className={cn(
                  "flex flex-col items-center justify-center py-10 rounded-3xl border",
                  timeLeft <= 60 ? "bg-danger/5 border-danger/20" : "bg-accent/5 border-accent/20"
                )}>
                  <div className="flex items-center gap-2 text-muted text-xs font-bold uppercase tracking-widest mb-2">
                    <Clock className={cn("w-4 h-4", timeLeft <= 60 && "text-danger")} />
                    Time Remaining
                  </div>
                  <div className={cn("text-6xl font-black tracking-tighter tabular-nums", timeLeft <= 60 ? "text-danger" : "text-foreground")}>
                    {formatTime(timeLeft)}
                  </div>
                </div>
              )}

              <div className="bg-background/50 rounded-2xl p-6 space-y-3 font-mono text-[10px]">
                <div className="flex justify-between border-b border-card-border/50 pb-2">
                  <span className="text-muted">TRACE ID</span>
                  <span className="text-foreground select-all">{reservation.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">ALLOCATED</span>
                  <span className="text-foreground">{reservation.quantity} UNITS</span>
                </div>
              </div>

              {reservation.status === "PENDING" ? (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleAction("confirm")}
                    disabled={loading !== null}
                    className="flex-1 h-14 bg-success hover:bg-success/80 disabled:opacity-50 text-white font-black rounded-2xl flex items-center justify-center gap-2"
                  >
                    {loading === "confirm" ? <Loader2 className="w-5 h-5" /> : <><CheckCircle2 className="w-5 h-5" /> Confirm</>}
                  </button>
                  <button
                    onClick={() => handleAction("release")}
                    disabled={loading !== null}
                    className="flex-1 h-14 bg-card-border hover:bg-danger/20 hover:text-danger disabled:opacity-50 text-foreground font-black rounded-2xl flex items-center justify-center gap-2"
                  >
                    {loading === "release" ? <Loader2 className="w-5 h-5" /> : <><XCircle className="w-5 h-5" /> Release</>}
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-6 pt-4">
                  <div className={cn(
                    "w-16 h-16 rounded-full mx-auto flex items-center justify-center border-4",
                    reservation.status === "CONFIRMED" ? "bg-success/10 border-success text-success" : "bg-danger/10 border-danger text-danger"
                  )}>
                    {reservation.status === "CONFIRMED" ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                  </div>
                  <h2 className="text-2xl font-black text-foreground">
                    {reservation.status === "CONFIRMED" ? "Order Finalized" : "Stock Released"}
                  </h2>
                  <button
                    onClick={() => router.push("/")}
                    className="bg-accent hover:bg-accent-hover text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-accent/20"
                  >
                    Return to Dashboard
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReservePage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-6 py-32 flex justify-center"><Loader2 className="w-10 h-10 text-accent" /></div>}>
      <ReservePageContent />
    </Suspense>
  );
}
