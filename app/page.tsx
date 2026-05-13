"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/inventory/ProductCard";
import { PackageSearch } from "lucide-react";

export default function HomePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-foreground">Global Catalog</h1>
          <p className="text-muted text-lg max-w-xl">
            Real-time stock availability across our fulfillment network. 
            Reservations are held for 10 minutes.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/5] bg-card-bg/50 rounded-2xl border border-card-border" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 border border-dashed border-card-border rounded-3xl bg-card-bg/10">
          <PackageSearch className="w-16 h-16 text-muted/30 mb-6" />
          <h2 className="text-xl font-bold text-foreground mb-2">No Products Found</h2>
          <p className="text-muted">Database seed required to view the catalog.</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
