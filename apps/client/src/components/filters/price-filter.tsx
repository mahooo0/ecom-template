'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useFilters } from '../../hooks/use-filters';

interface PriceFilterProps {
  minPrice: number;
  maxPrice: number;
}

function centsToDisplayDollars(cents: number): string {
  return (cents / 100).toFixed(0);
}

function displayDollarsToCents(dollars: string): number {
  const parsed = parseFloat(dollars);
  if (isNaN(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

export function PriceFilter({ minPrice, maxPrice }: PriceFilterProps) {
  const [filters, setFilters] = useFilters();

  const [localMin, setLocalMin] = useState(filters.minPrice || minPrice);
  const [localMax, setLocalMax] = useState(filters.maxPrice !== 999999 ? filters.maxPrice : maxPrice);

  // Sync local state when URL filters change from outside
  useEffect(() => {
    setLocalMin(filters.minPrice || minPrice);
    setLocalMax(filters.maxPrice !== 999999 ? filters.maxPrice : maxPrice);
  }, [filters.minPrice, filters.maxPrice, minPrice, maxPrice]);

  const debouncedUpdateUrl = useDebouncedCallback(
    (newMin: number, newMax: number) => {
      setFilters({
        minPrice: newMin <= minPrice ? 0 : newMin,
        maxPrice: newMax >= maxPrice ? 999999 : newMax,
        page: 1,
      });
    },
    300
  );

  const handleSliderChange = useCallback(
    (type: 'min' | 'max', value: number) => {
      if (type === 'min') {
        const clampedMin = Math.min(value, localMax - 100);
        setLocalMin(clampedMin);
        debouncedUpdateUrl(clampedMin, localMax);
      } else {
        const clampedMax = Math.max(value, localMin + 100);
        setLocalMax(clampedMax);
        debouncedUpdateUrl(localMin, clampedMax);
      }
    },
    [localMin, localMax, debouncedUpdateUrl]
  );

  const handleInputChange = useCallback(
    (type: 'min' | 'max', value: string) => {
      const cents = displayDollarsToCents(value);
      if (type === 'min') {
        const clamped = Math.max(minPrice, Math.min(cents, localMax - 100));
        setLocalMin(clamped);
        debouncedUpdateUrl(clamped, localMax);
      } else {
        const clamped = Math.min(maxPrice, Math.max(cents, localMin + 100));
        setLocalMax(clamped);
        debouncedUpdateUrl(localMin, clamped);
      }
    },
    [minPrice, maxPrice, localMin, localMax, debouncedUpdateUrl]
  );

  const handleReset = () => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
    setFilters({ minPrice: 0, maxPrice: 999999, page: 1 });
  };

  const range = maxPrice - minPrice;
  const minPercent = range > 0 ? ((localMin - minPrice) / range) * 100 : 0;
  const maxPercent = range > 0 ? ((localMax - minPrice) / range) * 100 : 100;

  const hasActiveFilter = localMin > minPrice || localMax < maxPrice;

  return (
    <div className="space-y-4" data-testid="price-filter">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Price Range</h3>
        {hasActiveFilter && (
          <button
            onClick={handleReset}
            className="text-xs text-blue-600 hover:text-blue-800"
            data-testid="price-filter-reset"
          >
            Reset
          </button>
        )}
      </div>

      {/* Dual-handle range slider */}
      <div className="relative pt-1" data-testid="price-slider">
        <div className="relative h-2 bg-gray-200 rounded-full">
          {/* Active range track */}
          <div
            className="absolute h-2 bg-blue-500 rounded-full"
            style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
          />
          {/* Min handle */}
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            step={100}
            value={localMin}
            onChange={(e) => handleSliderChange('min', parseInt(e.target.value))}
            className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer"
            style={{ zIndex: localMin > maxPrice - (maxPrice - minPrice) * 0.1 ? 5 : 3 }}
            data-testid="price-slider-min"
            aria-label="Minimum price"
          />
          {/* Max handle */}
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            step={100}
            value={localMax}
            onChange={(e) => handleSliderChange('max', parseInt(e.target.value))}
            className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer"
            style={{ zIndex: 4 }}
            data-testid="price-slider-max"
            aria-label="Maximum price"
          />
        </div>
      </div>

      {/* Min/Max input fields */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">Min ($)</label>
          <input
            type="number"
            min={0}
            max={parseInt(centsToDisplayDollars(localMax)) - 1}
            value={centsToDisplayDollars(localMin)}
            onChange={(e) => handleInputChange('min', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            data-testid="price-input-min"
            aria-label="Minimum price input"
          />
        </div>
        <span className="text-gray-400 mt-4">-</span>
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">Max ($)</label>
          <input
            type="number"
            min={parseInt(centsToDisplayDollars(localMin)) + 1}
            value={centsToDisplayDollars(localMax)}
            onChange={(e) => handleInputChange('max', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            data-testid="price-input-max"
            aria-label="Maximum price input"
          />
        </div>
      </div>
    </div>
  );
}
