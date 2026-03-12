'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWishlistStore } from '@/stores/wishlist-store';
import { useWishlistSync } from '@/hooks/use-wishlist-sync';

export function WishlistHeaderBadge() {
  const [mounted, setMounted] = useState(false);
  const totalItems = useWishlistStore((s) => s.totalItems);

  // Run guest-to-auth sync at layout level
  useWishlistSync();

  useEffect(() => {
    setMounted(true);
  }, []);

  const count = mounted ? totalItems() : 0;

  return (
    <Link
      href="/wishlist"
      aria-label={`Wishlist${count > 0 ? ` (${count} items)` : ''}`}
      className="relative flex items-center text-sm hover:text-gray-600"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
