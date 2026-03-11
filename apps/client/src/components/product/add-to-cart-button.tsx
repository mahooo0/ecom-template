'use client';

import { useState } from 'react';
import { useCartStore } from '@/stores/cart-store';

interface AddToCartButtonProps {
  productId: string;
  variantId?: string;
  productName: string;
  price: number;
  imageUrl: string;
  sku?: string;
  stock: number;
  productType: string;
  weight?: number;
}

export function AddToCartButton({
  productId,
  variantId,
  productName,
  price,
  imageUrl,
  sku = '',
  stock,
  productType,
  weight,
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const isOutOfStock = stock <= 0;
  const isWeighted = productType === 'WEIGHTED';
  const maxQuantity = stock > 99 ? 99 : stock;

  function handleDecrement() {
    setQuantity((q) => Math.max(1, q - 1));
  }

  function handleIncrement() {
    setQuantity((q) => Math.min(maxQuantity, q + 1));
  }

  function handleQuantityChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) return;
    setQuantity(Math.max(1, Math.min(maxQuantity, val)));
  }

  function handleAddToCart() {
    if (isOutOfStock) return;

    const effectiveQuantity = isWeighted ? (weight ?? 1) : quantity;

    addItem({
      productId,
      variantId: variantId ?? '',
      name: productName,
      price,
      quantity: effectiveQuantity,
      imageUrl,
      sku,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="space-y-3">
      {/* Quantity selector -- hidden for WEIGHTED products */}
      {!isWeighted && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Quantity</span>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={quantity <= 1 || isOutOfStock}
              className="px-3 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              min={1}
              max={maxQuantity}
              disabled={isOutOfStock}
              className="w-14 text-center py-2 border-x border-gray-300 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
              aria-label="Quantity"
            />
            <button
              type="button"
              onClick={handleIncrement}
              disabled={quantity >= maxQuantity || isOutOfStock}
              className="px-3 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Add to Cart button */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
          isOutOfStock
            ? 'bg-gray-400 cursor-not-allowed'
            : added
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isOutOfStock ? 'Out of Stock' : added ? 'Added!' : 'Add to Cart'}
      </button>
    </div>
  );
}
