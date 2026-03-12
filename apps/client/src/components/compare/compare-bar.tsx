'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCompareStore } from '../../stores/compare-store';

export function CompareBar() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { items, removeItem, clearItems } = useCompareStore((s) => ({
    items: s.items,
    removeItem: s.removeItem,
    clearItems: s.clearItems,
  }));

  // Handle hydration — show nothing until mounted
  if (!mounted || items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-gray-700 shrink-0">Compare:</span>

        <div className="flex flex-wrap items-center gap-2 flex-1">
          {items.map((item) => (
            <div key={item.productId} className="relative group/thumb">
              <div className="w-10 h-10 relative rounded border border-gray-200 overflow-hidden bg-gray-100">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <button
                onClick={() => removeItem(item.productId)}
                aria-label={`Remove ${item.name} from compare`}
                className="absolute -top-1 -right-1 w-4 h-4 bg-gray-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity text-xs leading-none"
              >
                &times;
              </button>
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: Math.max(0, 2 - items.length) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="w-10 h-10 rounded border border-dashed border-gray-300 bg-gray-50"
            />
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearItems}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Clear
          </button>
          {items.length >= 2 ? (
            <Link
              href="/compare"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 px-4 rounded-lg transition-colors duration-200"
            >
              Compare ({items.length})
            </Link>
          ) : (
            <span className="bg-gray-200 text-gray-400 text-sm font-medium py-1.5 px-4 rounded-lg cursor-not-allowed">
              Compare ({items.length})
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
