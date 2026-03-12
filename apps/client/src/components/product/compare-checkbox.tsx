'use client';

import React, { useState, useEffect } from 'react';
import { useCompareStore } from '../../stores/compare-store';

interface CompareCheckboxProps {
  productId: string;
  name: string;
  imageUrl: string;
  slug: string;
}

export function CompareCheckbox({ productId, name, imageUrl, slug }: CompareCheckboxProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { hasItem, toggleItem, isFull } = useCompareStore((s) => ({
    hasItem: s.hasItem,
    toggleItem: s.toggleItem,
    isFull: s.isFull,
  }));

  const isChecked = mounted ? hasItem(productId) : false;
  const isDisabled = mounted ? (isFull() && !isChecked) : false;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    toggleItem({ productId, name, imageUrl, slug });
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <label
      onClick={handleClick}
      className={`flex items-center gap-1 bg-white bg-opacity-80 hover:bg-opacity-100 rounded px-1.5 py-1 shadow-sm cursor-pointer select-none transition-all duration-200 ${
        isDisabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      title={isDisabled ? 'Max 4 products can be compared' : 'Add to compare'}
    >
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleChange}
        disabled={isDisabled}
        className="w-3 h-3 accent-blue-600 cursor-pointer"
        aria-label={`Compare ${name}`}
      />
      <span className="text-xs text-gray-600 font-medium">Compare</span>
    </label>
  );
}
