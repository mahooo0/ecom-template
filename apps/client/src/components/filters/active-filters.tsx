'use client';

import React from 'react';
import { useFilters } from '../../hooks/use-filters';

interface ActiveFilter {
  label: string;
  onRemove: () => void;
}

function FilterBadge({ label, onRemove }: ActiveFilter) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
      data-testid="active-filter-badge"
    >
      {label}
      <button
        onClick={onRemove}
        className="ml-1 text-blue-600 hover:text-blue-900 focus:outline-none"
        aria-label={`Remove filter: ${label}`}
        data-testid="remove-filter-button"
      >
        &times;
      </button>
    </span>
  );
}

export function ActiveFilters() {
  const [filters, setFilters] = useFilters();

  const activeFilters: ActiveFilter[] = [];

  // Price range filter
  if (filters.minPrice > 0 || (filters.maxPrice > 0 && filters.maxPrice !== 999999)) {
    const minLabel = filters.minPrice > 0 ? `$${(filters.minPrice / 100).toFixed(0)}` : '$0';
    const maxLabel = filters.maxPrice !== 999999 ? `$${(filters.maxPrice / 100).toFixed(0)}` : 'Any';
    activeFilters.push({
      label: `Price: ${minLabel} - ${maxLabel}`,
      onRemove: () => setFilters({ minPrice: 0, maxPrice: 999999, page: 1 }),
    });
  }

  // Brand filters
  filters.brands.forEach((brand) => {
    activeFilters.push({
      label: `Brand: ${brand}`,
      onRemove: () =>
        setFilters({
          brands: filters.brands.filter((b) => b !== brand),
          page: 1,
        }),
    });
  });

  // Attribute filters
  filters.attributes.forEach((attr) => {
    const [key, value] = attr.split(':');
    const label = value ? `${key?.replace(/_/g, ' ')}: ${value}` : attr;
    activeFilters.push({
      label,
      onRemove: () =>
        setFilters({
          attributes: filters.attributes.filter((a) => a !== attr),
          page: 1,
        }),
    });
  });

  // Availability filters
  filters.availability.forEach((avail) => {
    const label = avail === 'in_stock' ? 'In Stock' : avail === 'out_of_stock' ? 'Out of Stock' : avail === 'pre_order' ? 'Pre-Order' : avail;
    activeFilters.push({
      label,
      onRemove: () =>
        setFilters({
          availability: filters.availability.filter((a) => a !== avail),
          page: 1,
        }),
    });
  });

  if (activeFilters.length === 0) return null;

  const clearAll = () => {
    setFilters({
      minPrice: 0,
      maxPrice: 999999,
      brands: [],
      attributes: [],
      availability: [],
      page: 1,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2" data-testid="active-filters">
      {activeFilters.map((filter, index) => (
        <FilterBadge key={index} label={filter.label} onRemove={filter.onRemove} />
      ))}
      <button
        onClick={clearAll}
        className="text-xs text-gray-500 hover:text-gray-700 underline"
        data-testid="clear-all-filters"
      >
        Clear all
      </button>
    </div>
  );
}
