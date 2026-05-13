"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Stock = {
  warehouseId: string;
  warehouseName: string;
  totalUnits: number;
  availableUnits: number;
};

type Product = {
  id: string;
  name: string;
  stocks: Stock[];
};

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-card-bg rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Product Inventory
        </h1>
        <p className="text-muted text-lg">
          Browse available products and reserve stock from any warehouse.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <p className="text-xl">No products found.</p>
          <p className="mt-2">Run the seed script to add demo data.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-card-bg border border-card-border rounded-xl p-6 hover:border-accent/50 transition-all duration-200 hover:shadow-lg hover:shadow-accent/5"
            >
              <h2 className="text-xl font-semibold mb-4">{product.name}</h2>

              <div className="space-y-3">
                {product.stocks.map((stock) => (
                  <div
                    key={stock.warehouseId}
                    className="bg-background/50 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted">
                        🏭 {stock.warehouseName}
                      </span>
                      <span
                        className={`text-sm font-mono font-semibold ${
                          stock.availableUnits > 0
                            ? "text-success"
                            : "text-danger"
                        }`}
                      >
                        {stock.availableUnits} / {stock.totalUnits} available
                      </span>
                    </div>

                    {stock.availableUnits > 0 ? (
                      <Link
                        href={`/reserve?productId=${product.id}&warehouseId=${stock.warehouseId}&productName=${encodeURIComponent(product.name)}&warehouseName=${encodeURIComponent(stock.warehouseName)}&available=${stock.availableUnits}`}
                        className="block w-full text-center bg-accent hover:bg-accent-hover text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-150"
                      >
                        Reserve Stock →
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="w-full text-center bg-card-border text-muted text-sm font-medium py-2 px-4 rounded-lg cursor-not-allowed"
                      >
                        Out of Stock
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
