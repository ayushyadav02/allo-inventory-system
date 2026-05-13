"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

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
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Countdown timer
  useEffect(() => {
    if (!reservation || reservation.status !== "PENDING") return;

    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor(
          (new Date(reservation.expiresAt).getTime() - Date.now()) / 1000
        )
      );
      setTimeLeft(remaining);

      if (remaining <= 0) {
        setReservation((prev) =>
          prev ? { ...prev, status: "RELEASED" } : null
        );
        setError("Reservation expired! Stock has been released.");
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
    setError(null);
    setActionLoading("reserve");

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, warehouseId, quantity }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setError("⚠️ 409 Conflict: " + data.error);
        } else {
          setError(data.error || "Failed to create reservation");
        }
        return;
      }

      setReservation(data);
      const remaining = Math.floor(
        (new Date(data.expiresAt).getTime() - Date.now()) / 1000
      );
      setTimeLeft(remaining);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirm = useCallback(async () => {
    if (!reservation) return;
    setError(null);
    setActionLoading("confirm");

    try {
      const res = await fetch(
        `/api/reservations/${reservation.id}/confirm`,
        { method: "POST" }
      );

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 410) {
          setError("⛔ 410 Gone: " + data.error);
        } else {
          setError(data.error || "Failed to confirm");
        }
        return;
      }

      setReservation(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setActionLoading(null);
    }
  }, [reservation]);

  const handleRelease = useCallback(async () => {
    if (!reservation) return;
    setError(null);
    setActionLoading("release");

    try {
      const res = await fetch(
        `/api/reservations/${reservation.id}/release`,
        { method: "POST" }
      );

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 410) {
          setError("⛔ 410 Gone: " + data.error);
        } else {
          setError(data.error || "Failed to release");
        }
        return;
      }

      setReservation(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setActionLoading(null);
    }
  }, [reservation]);

  if (!productId || !warehouseId) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-muted text-lg">Missing product or warehouse info.</p>
        <Link href="/" className="text-accent hover:underline mt-4 block">
          ← Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link
        href="/"
        className="text-muted hover:text-foreground transition-colors text-sm mb-8 inline-block"
      >
        ← Back to Products
      </Link>

      <div className="bg-card-bg border border-card-border rounded-xl p-8">
        <h1 className="text-2xl font-bold mb-1">{productName}</h1>
        <p className="text-muted mb-6">🏭 {warehouseName}</p>

        {/* Reserve Form */}
        {!reservation && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Quantity (max {available})
              </label>
              <input
                type="number"
                min={1}
                max={available}
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Math.max(1, Math.min(available, parseInt(e.target.value) || 1))
                  )
                }
                className="w-full bg-background border border-card-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <button
              onClick={handleReserve}
              disabled={actionLoading === "reserve"}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-150"
            >
              {actionLoading === "reserve"
                ? "Reserving..."
                : `Reserve ${quantity} unit${quantity > 1 ? "s" : ""}`}
            </button>
          </div>
        )}

        {/* Reservation Details */}
        {reservation && (
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted">Status:</span>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                  reservation.status === "PENDING"
                    ? "bg-warning/20 text-warning"
                    : reservation.status === "CONFIRMED"
                    ? "bg-success/20 text-success"
                    : "bg-danger/20 text-danger"
                }`}
              >
                {reservation.status}
              </span>
            </div>

            {/* Details */}
            <div className="bg-background/50 rounded-lg p-4 space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Reservation ID</span>
                <span>{reservation.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Quantity</span>
                <span>{reservation.quantity} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Created</span>
                <span>{new Date(reservation.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Countdown Timer */}
            {reservation.status === "PENDING" && (
              <div
                className={`text-center p-6 rounded-xl border ${
                  timeLeft <= 60
                    ? "bg-danger/10 border-danger/30"
                    : timeLeft <= 180
                    ? "bg-warning/10 border-warning/30"
                    : "bg-accent/10 border-accent/30"
                }`}
              >
                <p className="text-sm text-muted mb-1">Expires in</p>
                <p
                  className={`text-5xl font-bold font-mono tracking-wider ${
                    timeLeft <= 60
                      ? "text-danger animate-pulse"
                      : timeLeft <= 180
                      ? "text-warning"
                      : "text-accent"
                  }`}
                >
                  {formatTime(timeLeft)}
                </p>
                <p className="text-xs text-muted mt-2">
                  Confirm before time runs out or the reservation will be
                  released
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {reservation.status === "PENDING" && (
              <div className="flex gap-3">
                <button
                  onClick={handleConfirm}
                  disabled={actionLoading !== null}
                  className="flex-1 bg-success hover:bg-success/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-150"
                >
                  {actionLoading === "confirm"
                    ? "Confirming..."
                    : "✓ Confirm Order"}
                </button>
                <button
                  onClick={handleRelease}
                  disabled={actionLoading !== null}
                  className="flex-1 bg-danger hover:bg-danger/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-150"
                >
                  {actionLoading === "release"
                    ? "Releasing..."
                    : "✕ Release"}
                </button>
              </div>
            )}

            {/* Completed State */}
            {reservation.status !== "PENDING" && (
              <div className="text-center space-y-4">
                <p
                  className={`text-lg font-semibold ${
                    reservation.status === "CONFIRMED"
                      ? "text-success"
                      : "text-danger"
                  }`}
                >
                  {reservation.status === "CONFIRMED"
                    ? "✅ Order confirmed! Stock has been deducted."
                    : "❌ Reservation released. Stock has been restored."}
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="bg-accent hover:bg-accent-hover text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  ← Back to Products
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-6 bg-danger/10 border border-danger/30 rounded-lg p-4">
            <p className="text-danger text-sm font-medium">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReservePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-6 py-16">
          <div className="animate-pulse h-96 bg-card-bg rounded-xl" />
        </div>
      }
    >
      <ReservePageContent />
    </Suspense>
  );
}
