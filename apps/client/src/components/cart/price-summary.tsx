'use client';

import { formatPrice } from '@/lib/utils';

interface PriceSummaryProps {
  subtotal: number;
  discountAmount: number;
  couponCode: string | null;
}

export function PriceSummary({ subtotal, discountAmount, couponCode }: PriceSummaryProps) {
  const total = subtotal - discountAmount;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Subtotal</span>
        <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
      </div>

      {couponCode && discountAmount > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-green-700">Discount ({couponCode})</span>
          <div className="text-right">
            <span className="font-medium text-green-700">-{formatPrice(discountAmount)}</span>
          </div>
        </div>
      )}

      {couponCode && discountAmount > 0 && (
        <div className="text-xs text-green-600 text-right">
          You save {formatPrice(discountAmount)}
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Shipping</span>
        <span className="text-gray-400 italic">Calculated at checkout</span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Tax</span>
        <span className="text-gray-400 italic">Calculated at checkout</span>
      </div>

      <div className="border-t border-gray-200 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-gray-900">Total</span>
          <span className="text-xl font-bold text-gray-900">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
