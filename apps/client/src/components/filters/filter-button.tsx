'use client';

import React from 'react';

interface FilterButtonProps {
  activeFilterCount: number;
  onClick?: () => void;
}

export function FilterButton({ activeFilterCount, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      data-testid="filter-button"
      aria-label="Open filters"
    >
      {/* Filter icon (SVG) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </svg>
      Filters
      {activeFilterCount > 0 && (
        <span
          className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full"
          data-testid="filter-count-badge"
        >
          {activeFilterCount}
        </span>
      )}
    </button>
  );
}
