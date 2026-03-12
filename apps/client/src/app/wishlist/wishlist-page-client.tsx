'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useWishlistStore } from '@/stores/wishlist-store';
import { PriceDropBadge } from '@/components/wishlist/price-drop-badge';
import { WishlistButton } from '@/components/product/wishlist-button';
import { formatPrice } from '@/lib/utils';

interface WishlistProduct {
  productId: string;
  priceAtAdd: number;
  notifyPriceDrop: boolean;
  notifyRestock: boolean;
  product?: {
    id: string;
    name: string;
    price: number;
    images: string[];
    slug: string;
  };
}

export function WishlistPageClient() {
  const { isSignedIn, getToken } = useAuth();
  const storeItems = useWishlistStore((s) => s.items);
  const [mounted, setMounted] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const load = async () => {
      setLoading(true);
      try {
        if (isSignedIn) {
          const token = await getToken();
          if (!token) return;
          const res = await fetch('/api/wishlist', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = (await res.json()) as { items?: WishlistProduct[] };
            setWishlistItems(data.items ?? []);
          }
        } else {
          // Guest: use store items directly (no product detail fetch in this iteration)
          const guestItems: WishlistProduct[] = storeItems.map((item) => ({
            productId: item.productId,
            priceAtAdd: item.priceAtAdd,
            notifyPriceDrop: false,
            notifyRestock: false,
          }));
          setWishlistItems(guestItems);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [mounted, isSignedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNotifyToggle = async (
    productId: string,
    field: 'notifyPriceDrop' | 'notifyRestock',
    value: boolean,
  ) => {
    try {
      const token = await getToken();
      if (!token) return;
      await fetch(`/api/wishlist/${productId}/notify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [field]: value }),
      });
      setWishlistItems((prev) =>
        prev.map((item) =>
          item.productId === productId ? { ...item, [field]: value } : item,
        ),
      );
    } catch {
      // Silently fail
    }
  };

  if (!mounted || loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border border-gray-200 p-4 animate-pulse">
              <div className="bg-gray-200 h-48 rounded mb-3" />
              <div className="bg-gray-200 h-4 rounded mb-2" />
              <div className="bg-gray-200 h-4 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <div className="mb-4 text-gray-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-16 w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-6">Save products you love and come back to them later.</p>
        <Link
          href="/products"
          className="inline-block bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">
        My Wishlist{' '}
        <span className="text-gray-400 text-lg font-normal">({wishlistItems.length})</span>
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((item) => {
          const product = item.product;
          const currentPrice = product?.price ?? item.priceAtAdd;
          const productName = product?.name ?? item.productId;
          const productImage = product?.images?.[0] ?? '';
          const productSlug = product?.slug ?? item.productId;

          return (
            <div
              key={item.productId}
              className="rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Product image */}
              <div className="relative">
                <Link href={`/products/${productSlug}`}>
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={productName}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No image</span>
                    </div>
                  )}
                </Link>
                <div className="absolute top-2 right-2">
                  <WishlistButton
                    productId={item.productId}
                    price={currentPrice}
                    size="sm"
                  />
                </div>
              </div>

              {/* Product info */}
              <div className="p-4">
                <Link href={`/products/${productSlug}`} className="hover:underline">
                  <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                    {productName}
                  </h3>
                </Link>

                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-900">{formatPrice(currentPrice)}</span>
                </div>

                {/* Price-drop badge */}
                <div className="mb-3">
                  <PriceDropBadge priceAtAdd={item.priceAtAdd} currentPrice={currentPrice} />
                </div>

                {/* Add to cart */}
                <button className="w-full bg-gray-900 text-white text-sm py-2 rounded-lg hover:bg-gray-700 transition-colors mb-3">
                  Add to Cart
                </button>

                {/* Notify toggles (authenticated only) */}
                {isSignedIn && (
                  <div className="space-y-2 border-t border-gray-100 pt-3">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Price drop alerts</span>
                      <button
                        role="switch"
                        aria-checked={item.notifyPriceDrop}
                        onClick={() =>
                          handleNotifyToggle(item.productId, 'notifyPriceDrop', !item.notifyPriceDrop)
                        }
                        className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                          item.notifyPriceDrop ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            item.notifyPriceDrop ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Restock alerts</span>
                      <button
                        role="switch"
                        aria-checked={item.notifyRestock}
                        onClick={() =>
                          handleNotifyToggle(item.productId, 'notifyRestock', !item.notifyRestock)
                        }
                        className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                          item.notifyRestock ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            item.notifyRestock ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
