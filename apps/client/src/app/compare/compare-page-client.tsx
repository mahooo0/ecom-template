'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCompareStore } from '@/stores/compare-store';
import { api } from '@/lib/api';
import type { Product } from '@repo/types';

interface CategoryAttribute {
  id: string;
  name: string;
  key: string;
  type: string;
  values: string[];
}

interface ProductWithCategory extends Product {
  category?: {
    id: string;
    name: string;
    attributes?: CategoryAttribute[];
  };
  brand?: {
    id: string;
    name: string;
  };
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function isDifferent(key: string, products: ProductWithCategory[]): boolean {
  const values = products.map((p) => String((p.attributes as Record<string, unknown>)?.[key] ?? ''));
  return new Set(values).size > 1;
}

function isFieldDifferent(values: string[]): boolean {
  return new Set(values).size > 1;
}

export function ComparePageClient() {
  const { items, removeItem } = useCompareStore();
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (items.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all(
      items.map((item) =>
        api.products.getBySlug(item.slug)
          .then((res) => res.data as ProductWithCategory)
          .catch(() => null),
      ),
    ).then((results) => {
      setProducts(results.filter((p): p is ProductWithCategory => p !== null));
      setLoading(false);
    });
  }, [mounted, items]);

  // Loading skeleton
  if (!mounted || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="flex justify-center mb-6">
          <svg
            className="w-20 h-20 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          No products selected for comparison
        </h2>
        <p className="text-gray-500 mb-6">
          Browse products and use the compare checkbox to select items
        </p>
        <Link
          href="/products"
          className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  // Minimum products check
  if (items.length < 2) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Select at least 2 products to compare
        </h2>
        <p className="text-gray-500 mb-6">You have {items.length} product selected</p>
        <div className="flex justify-center gap-4 mb-8">
          {items.map((item) => (
            <div key={item.productId} className="flex flex-col items-center gap-2">
              {item.imageUrl && (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover"
                />
              )}
              <span className="text-sm text-gray-700">{item.name}</span>
            </div>
          ))}
        </div>
        <Link
          href="/products"
          className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Browse More Products
        </Link>
      </div>
    );
  }

  // Build unified attribute key list from all products
  const allAttributeKeys = Array.from(
    new Set(
      products.flatMap((p) => Object.keys((p.attributes as Record<string, unknown>) ?? {})),
    ),
  );

  // Build display name map from category attributes (use first product's category as reference)
  const categoryAttributes: CategoryAttribute[] =
    products[0]?.category?.attributes ?? [];
  const attributeDisplayNames = categoryAttributes.reduce<Record<string, string>>(
    (acc, attr) => {
      acc[attr.key] = attr.name;
      return acc;
    },
    {},
  );

  const getDisplayName = (key: string) =>
    attributeDisplayNames[key] ?? key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Compare Products</h1>
        <Link href="/products" className="text-sm text-gray-500 hover:text-gray-700 underline">
          Continue Shopping
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[640px]">
          <thead>
            <tr>
              {/* Sticky attribute name column header */}
              <th className="sticky left-0 bg-white w-40 min-w-[160px] border-b border-gray-200 p-3 text-left" />
              {products.map((product) => (
                <td
                  key={product.id}
                  className="border-b border-gray-200 p-3 text-center align-top min-w-[180px]"
                >
                  <div className="flex flex-col items-center gap-2">
                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={120}
                        height={120}
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-[120px] h-[120px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                        No image
                      </div>
                    )}
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-sm font-semibold text-gray-900 hover:text-black hover:underline text-center"
                    >
                      {product.name}
                    </Link>
                    <span className="text-base font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors mt-1"
                      aria-label={`Remove ${product.name} from comparison`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Remove
                    </button>
                  </div>
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Price row */}
            {(() => {
              const priceValues = products.map((p) => formatPrice(p.price));
              const priceDiffers = isFieldDifferent(priceValues);
              return (
                <tr>
                  <td className="sticky left-0 bg-white border-b border-gray-100 p-3 text-sm font-medium text-gray-600 w-40 min-w-[160px]">
                    Price
                  </td>
                  {products.map((product) => (
                    <td
                      key={product.id}
                      className={`border-b border-gray-100 p-3 text-sm text-center ${priceDiffers ? 'bg-yellow-50' : ''}`}
                    >
                      {formatPrice(product.price)}
                    </td>
                  ))}
                </tr>
              );
            })()}

            {/* Product Type row */}
            {(() => {
              const typeValues = products.map((p) => p.productType ?? '-');
              const differs = isFieldDifferent(typeValues);
              return (
                <tr>
                  <td className="sticky left-0 bg-white border-b border-gray-100 p-3 text-sm font-medium text-gray-600 w-40 min-w-[160px]">
                    Product Type
                  </td>
                  {products.map((product) => (
                    <td
                      key={product.id}
                      className={`border-b border-gray-100 p-3 text-sm text-center capitalize ${differs ? 'bg-yellow-50' : ''}`}
                    >
                      {product.productType?.toLowerCase().replace(/_/g, ' ') ?? '-'}
                    </td>
                  ))}
                </tr>
              );
            })()}

            {/* Brand row */}
            {(() => {
              const brandValues = products.map((p) => p.brand?.name ?? '-');
              const differs = isFieldDifferent(brandValues);
              return (
                <tr>
                  <td className="sticky left-0 bg-white border-b border-gray-100 p-3 text-sm font-medium text-gray-600 w-40 min-w-[160px]">
                    Brand
                  </td>
                  {products.map((product) => (
                    <td
                      key={product.id}
                      className={`border-b border-gray-100 p-3 text-sm text-center ${differs ? 'bg-yellow-50' : ''}`}
                    >
                      {product.brand?.name ?? '-'}
                    </td>
                  ))}
                </tr>
              );
            })()}

            {/* Category row */}
            {(() => {
              const catValues = products.map((p) => p.category?.name ?? '-');
              const differs = isFieldDifferent(catValues);
              return (
                <tr>
                  <td className="sticky left-0 bg-white border-b border-gray-100 p-3 text-sm font-medium text-gray-600 w-40 min-w-[160px]">
                    Category
                  </td>
                  {products.map((product) => (
                    <td
                      key={product.id}
                      className={`border-b border-gray-100 p-3 text-sm text-center ${differs ? 'bg-yellow-50' : ''}`}
                    >
                      {product.category?.name ?? '-'}
                    </td>
                  ))}
                </tr>
              );
            })()}

            {/* Dynamic attribute rows */}
            {allAttributeKeys.map((key) => {
              const differs = isDifferent(key, products);
              return (
                <tr key={key}>
                  <td className="sticky left-0 bg-white border-b border-gray-100 p-3 text-sm font-medium text-gray-600 w-40 min-w-[160px]">
                    {getDisplayName(key)}
                  </td>
                  {products.map((product) => {
                    const value = (product.attributes as Record<string, unknown>)?.[key];
                    return (
                      <td
                        key={product.id}
                        className={`border-b border-gray-100 p-3 text-sm text-center ${differs ? 'bg-yellow-50' : ''}`}
                      >
                        {value !== undefined && value !== null ? String(value) : '-'}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
