'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/stores/cart-store';
import { useCartSync } from '@/hooks/use-cart-sync';
import { MiniCartDrawer } from './mini-cart-drawer';

export function CartHeaderButton() {
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems);

  // Mount sync hook at layout level (same as useWishlistSync in WishlistHeaderBadge)
  useCartSync();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hydration-safe: render 0 until mounted, then real count
  const count = mounted ? totalItems() : 0;

  return (
    <>
      <button
        onClick={() => setDrawerOpen(true)}
        aria-label={`Cart${count > 0 ? ` (${count} items)` : ''}`}
        className="relative flex items-center text-sm hover:text-gray-600"
      >
        {/* Shopping bag icon */}
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
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>

        {/* Badge */}
        <span
          className="absolute -top-1.5 -right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-black text-white text-[10px] font-bold leading-none px-0.5"
          aria-hidden="true"
        >
          {count > 99 ? '99+' : count}
        </span>
      </button>

      <MiniCartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
