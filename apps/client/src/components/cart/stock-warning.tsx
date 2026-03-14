'use client';

interface StockWarningProps {
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  availableQty: number;
}

export function StockWarning({ status, availableQty }: StockWarningProps) {
  if (status === 'in_stock') {
    return null;
  }

  if (status === 'low_stock') {
    return (
      <span className="inline-flex items-center text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
        Only {availableQty} left
      </span>
    );
  }

  // out_of_stock
  return (
    <span className="inline-flex items-center text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
      Out of Stock
    </span>
  );
}
