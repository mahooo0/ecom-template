'use client';

import { useEffect, useRef } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useWishlistStore } from '@/stores/wishlist-store';

export function useWishlistSync() {
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();
  const items = useWishlistStore((s) => s.items);
  const addItem = useWishlistStore((s) => s.addItem);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!isSignedIn || syncedRef.current) return;

    const sync = async () => {
      syncedRef.current = true;

      try {
        const token = await getToken();
        if (!token) return;

        if (items.length > 0) {
          // Fire-and-forget: sync local guest items to server
          fetch('/api/wishlist/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ items }),
          }).catch(() => {
            // Silently fail — local state remains intact
          });
        }

        // Fetch full wishlist from server to update local store
        const res = await fetch('/api/wishlist', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = (await res.json()) as { items?: Array<{ productId: string; priceAtAdd: number }> };
          if (data.items && Array.isArray(data.items)) {
            data.items.forEach((item) => {
              addItem({ productId: item.productId, priceAtAdd: item.priceAtAdd });
            });
          }
        }
      } catch {
        // Silently fail — local state remains intact
      }
    };

    void sync();
  }, [isSignedIn]); // eslint-disable-line react-hooks/exhaustive-deps
}
