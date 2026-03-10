import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@repo/types';
import { StarRating } from '../ui/star-rating';

interface ProductCardProps {
  product: Product & {
    averageRating?: number;
    reviewCount?: number;
    brand?: { name: string };
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images[0];
  const hasImage = imageUrl && imageUrl.length > 0;
  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="aspect-square relative bg-gray-100">
          {hasImage ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-gray-400"
              data-testid="image-placeholder"
            >
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="p-4">
          {product.brand?.name && (
            <p className="text-sm text-gray-500 mb-1">{product.brand.name}</p>
          )}
          <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">{product.name}</h3>

          {product.averageRating !== undefined && (
            <div className="flex items-center gap-1 mb-2">
              <StarRating rating={product.averageRating} size="sm" />
              {product.reviewCount !== undefined && product.reviewCount > 0 && (
                <span className="text-sm text-gray-500">({product.reviewCount})</span>
              )}
            </div>
          )}

          <div className="flex items-baseline gap-2">
            {onSale ? (
              <>
                <span className="text-lg font-semibold text-red-600">
                  {formatPrice(product.price)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.compareAtPrice!)}
                </span>
              </>
            ) : (
              <span className="text-lg font-semibold text-gray-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
