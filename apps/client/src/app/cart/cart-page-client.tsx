'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useCartStore } from '@/stores/cart-store';
import { api } from '@/lib/api';
import { CartItemRow } from '@/components/cart/cart-item-row';
import { CouponSection } from '@/components/cart/coupon-section';
import { PriceSummary } from '@/components/cart/price-summary';
import { StockWarning } from '@/components/cart/stock-warning';

interface StockValidationResult {
  productId: string;
  variantId?: string;
  requestedQty: number;
  availableQty: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export function CartPageClient() {
  const { isSignedIn, getToken } = useAuth();

  const items = useCartStore((s) => s.items);
  const couponCode = useCartStore((s) => s.couponCode);
  const discountAmount = useCartStore((s) => s.discountAmount);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const subtotal = useCartStore((s) => s.subtotal);

  const [mounted, setMounted] = useState(false);
  const [stockResults, setStockResults] = useState<StockValidationResult[]>([]);
  const [stockLoading, setStockLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isSignedIn || items.length === 0) return;

    const validateStock = async () => {
      setStockLoading(true);
      try {
        const token = await getToken();
        if (!token) return;
        const res = await api.cart.validateStock(token) as {
          success: boolean;
          data?: StockValidationResult[];
        };
        if (res.success && Array.isArray(res.data)) {
          setStockResults(res.data);
        }
      } catch {
        // Silently fail — stock validation is advisory
      } finally {
        setStockLoading(false);
      }
    };

    void validateStock();
  }, [mounted, isSignedIn, items]); // eslint-disable-line react-hooks/exhaustive-deps

  const getStockResult = (productId: string, variantId?: string) => {
    return stockResults.find(
      (r) => r.productId === productId && r.variantId === variantId,
    );
  };

  const hasOutOfStockItems = stockResults.some((r) => r.status === 'out_of_stock');

  const handleUpdateQuantity = async (
    productId: string,
    variantId: string | undefined,
    quantity: number,
  ) => {
    updateQuantity(productId, variantId ?? '', quantity);

    if (isSignedIn) {
      try {
        const token = await getToken();
        if (token) {
          void api.cart.updateQuantity(productId, variantId, quantity, token);
        }
      } catch {
        // Fire-and-forget — optimistic UI already updated
      }
    }
  };

  const handleRemoveItem = async (productId: string, variantId: string | undefined) => {
    removeItem(productId, variantId ?? '');

    if (isSignedIn) {
      try {
        const token = await getToken();
        if (token) {
          void api.cart.removeItem(productId, variantId, token);
        }
      } catch {
        // Fire-and-forget
      }
    }
  };

  const handleClearCart = async () => {
    clearCart();

    if (isSignedIn) {
      try {
        const token = await getToken();
        if (token) {
          void api.cart.clear(token);
        }
      } catch {
        // Fire-and-forget
      }
    }
  };

  // Skeleton while hydrating
  if (!mounted) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 text-center">
        <div className="mb-6 text-gray-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-20 w-20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Add some items to get started.</p>
        <Link
          href="/"
          className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      {/* Page heading */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Shopping Cart{' '}
          <span className="text-gray-400 font-normal text-lg">
            ({items.length} {items.length === 1 ? 'item' : 'items'})
          </span>
        </h1>
        <button
          onClick={() => void handleClearCart()}
          className="text-sm text-red-600 hover:text-red-800 transition-colors"
        >
          Clear Cart
        </button>
      </div>

      {/* Two-column layout: lg = 2/3 + 1/3, mobile = single column */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Item list (2/3 on lg) */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
            {items.map((item) => {
              const stockResult = getStockResult(item.productId, item.variantId);
              return (
                <div key={`${item.productId}-${item.variantId ?? 'no-variant'}`} className="px-4">
                  <CartItemRow
                    item={item}
                    onUpdateQuantity={(qty) =>
                      void handleUpdateQuantity(item.productId, item.variantId, qty)
                    }
                    onRemove={() =>
                      void handleRemoveItem(item.productId, item.variantId)
                    }
                  />
                  {/* Stock warning below each item */}
                  {stockResult && !stockLoading && (
                    <div className="pb-3">
                      <StockWarning
                        status={stockResult.status}
                        availableQty={stockResult.availableQty}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Order summary (1/3 on lg) */}
        <div className="mt-8 lg:mt-0">
          <div className="sticky top-4 bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>

            {/* Coupon section */}
            <div className="border-b border-gray-100 pb-1">
              <CouponSection
                onCouponApplied={(code, discount) => applyCoupon(code, discount)}
                onCouponRemoved={() => removeCoupon()}
                currentCode={couponCode}
                discountAmount={discountAmount}
              />
            </div>

            {/* Price summary */}
            <PriceSummary
              subtotal={subtotal()}
              discountAmount={discountAmount}
              couponCode={couponCode}
            />

            {/* Checkout button */}
            <div className="pt-2 space-y-3">
              {hasOutOfStockItems ? (
                <div>
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-medium cursor-not-allowed"
                  >
                    Proceed to Checkout
                  </button>
                  <p className="text-xs text-red-600 text-center mt-2">
                    Remove out-of-stock items to continue
                  </p>
                </div>
              ) : (
                <Link
                  href="/checkout"
                  className="block w-full bg-gray-900 text-white py-3 rounded-lg font-medium text-center hover:bg-gray-700 transition-colors"
                >
                  Proceed to Checkout
                </Link>
              )}

              <Link
                href="/"
                className="block w-full text-center text-sm text-gray-600 hover:text-gray-900 transition-colors py-1"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
