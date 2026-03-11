'use client';

const LOW_STOCK_THRESHOLD = 5;

interface StockStatusProps {
  stock: number;
}

export function StockStatus({ stock }: StockStatusProps) {
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600">
        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
        Out of Stock
      </span>
    );
  }

  if (stock <= LOW_STOCK_THRESHOLD) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600">
        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
        Low Stock ({stock} left)
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
      <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
      In Stock
    </span>
  );
}
