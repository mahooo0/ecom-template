'use client';

import React from 'react';
import { useFilters } from '../../hooks/use-filters';

interface AvailabilityFacet {
  in_stock?: number;
  out_of_stock?: number;
  pre_order?: number;
}

interface AvailabilityFilterProps {
  facetCounts?: AvailabilityFacet;
}

export function AvailabilityFilter({ facetCounts }: AvailabilityFilterProps) {
  const [filters, setFilters] = useFilters();

  const toggle = (value: 'in_stock' | 'out_of_stock' | 'pre_order') => {
    const current = filters.availability;
    const updated = current.includes(value)
      ? current.filter((a) => a !== value)
      : [...current, value];
    setFilters({ availability: updated, page: 1 });
  };

  const isInStockActive = filters.availability.includes('in_stock');
  const isOutOfStockActive = filters.availability.includes('out_of_stock');
  const isPreOrderActive = filters.availability.includes('pre_order');

  return (
    <div className="space-y-2" data-testid="availability-filter">
      <h3 className="text-sm font-semibold text-gray-900">Availability</h3>
      <div className="space-y-1">
        <label className="flex items-center gap-2 cursor-pointer group" data-testid="availability-in-stock">
          <input
            type="checkbox"
            checked={isInStockActive}
            onChange={() => toggle('in_stock')}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            aria-label="In Stock"
          />
          <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1">In Stock</span>
          {facetCounts?.in_stock !== undefined && (
            <span className="text-xs text-gray-400" data-testid="in-stock-count">
              ({facetCounts.in_stock})
            </span>
          )}
        </label>
        <label className="flex items-center gap-2 cursor-pointer group" data-testid="availability-out-of-stock">
          <input
            type="checkbox"
            checked={isOutOfStockActive}
            onChange={() => toggle('out_of_stock')}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            aria-label="Out of Stock"
          />
          <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1">Out of Stock</span>
          {facetCounts?.out_of_stock !== undefined && (
            <span className="text-xs text-gray-400" data-testid="out-of-stock-count">
              ({facetCounts.out_of_stock})
            </span>
          )}
        </label>
        <label className="flex items-center gap-2 cursor-pointer group" data-testid="availability-pre-order">
          <input
            type="checkbox"
            checked={isPreOrderActive}
            onChange={() => toggle('pre_order')}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            aria-label="Pre-Order"
          />
          <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1">Pre-Order</span>
          {facetCounts?.pre_order !== undefined && (
            <span className="text-xs text-gray-400" data-testid="pre-order-count">
              ({facetCounts.pre_order})
            </span>
          )}
        </label>
      </div>
    </div>
  );
}
