import React from 'react';

function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-square bg-gray-200" />

      {/* Content skeleton */}
      <div className="p-4">
        {/* Brand */}
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />

        {/* Product name */}
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-1" />
        <div className="h-5 bg-gray-200 rounded w-1/2 mb-3" />

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>

        {/* Price */}
        <div className="h-6 bg-gray-200 rounded w-20 mb-4" />
      </div>

      {/* Button skeleton */}
      <div className="px-4 pb-4">
        <div className="h-10 bg-gray-200 rounded-lg w-full" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {/* Title skeleton */}
          <div className="h-9 bg-gray-200 rounded w-48 animate-pulse" />

          {/* Sort selector skeleton */}
          <div className="h-10 bg-gray-200 rounded w-40 animate-pulse" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
