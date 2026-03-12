'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useWishlistStore } from '../../stores/wishlist-store';

interface WishlistButtonProps {
  productId: string;
  price: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function WishlistButton({ productId, price, size = 'md', className = '' }: WishlistButtonProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { hasItem, toggleItem, addItem, removeItem } = useWishlistStore((s) => ({
    hasItem: s.hasItem,
    toggleItem: s.toggleItem,
    addItem: s.addItem,
    removeItem: s.removeItem,
  }));

  const { isSignedIn } = useUser();
  const { getToken } = useAuth();

  const isInWishlist = mounted ? hasItem(productId) : false;

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const wasInWishlist = hasItem(productId);

    // Step 1: Optimistic update
    toggleItem(productId, price);

    // Step 2: Background API sync for authenticated users
    if (isSignedIn) {
      try {
        const token = await getToken();
        if (wasInWishlist) {
          // Was removing
          const res = await fetch(`/api/wishlist/${productId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error('Failed to remove from wishlist');
        } else {
          // Was adding
          const res = await fetch('/api/wishlist', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productId, priceAtAdd: price }),
          });
          if (!res.ok) throw new Error('Failed to add to wishlist');
        }
      } catch {
        // Step 3: Revert on failure
        if (wasInWishlist) {
          // Was removing but failed — re-add
          addItem({ productId, priceAtAdd: price });
        } else {
          // Was adding but failed — remove
          removeItem(productId);
        }
      }
    }
    // Guest users: localStorage-only, no API call needed
  };

  return (
    <button
      onClick={handleClick}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`flex items-center justify-center rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 p-1.5 shadow-sm transition-all duration-200 ${className}`}
    >
      <svg
        className={`${iconSize} transition-colors duration-200 ${
          isInWishlist ? 'fill-red-500 text-red-500' : 'fill-none text-gray-400 hover:text-red-400'
        }`}
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
