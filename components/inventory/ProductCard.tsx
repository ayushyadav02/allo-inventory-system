import Link from "next/link";
import Image from "next/image";

type Stock = {
  warehouseId: string;
  warehouseName: string;
  totalUnits: number;
  availableUnits: number;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  stocks: Stock[];
};

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden flex flex-col group hover:border-accent/30">
      <div className="relative aspect-[4/3] bg-background">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">No Image</div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-foreground mb-1">{product.name}</h3>
        <p className="text-sm text-muted line-clamp-2 mb-4 leading-relaxed">
          {product.description || "No description provided."}
        </p>

        <div className="mt-auto space-y-3">
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Availability</p>
          {product.stocks.map((stock) => (
            <div key={stock.warehouseId} className="flex items-center justify-between text-sm py-2 border-b border-card-border last:border-0">
              <div className="flex flex-col">
                <span className="text-foreground font-medium">{stock.warehouseName}</span>
                <span className="text-[10px] text-muted">{stock.availableUnits} units left</span>
              </div>
              {stock.availableUnits > 0 ? (
                <Link
                  href={`/reserve?productId=${product.id}&warehouseId=${stock.warehouseId}&productName=${encodeURIComponent(product.name)}&warehouseName=${encodeURIComponent(stock.warehouseName)}&available=${stock.availableUnits}`}
                  className="bg-accent/10 hover:bg-accent text-accent hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                >
                  Reserve
                </Link>
              ) : (
                <span className="text-[10px] font-bold text-danger uppercase">Waitlist</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
