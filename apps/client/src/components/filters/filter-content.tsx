'use client';

import React from 'react';
import type { CategoryAttribute } from '@repo/types';
import { PriceFilter } from './price-filter';
import { AttributeFilter } from './attribute-filter';
import { AvailabilityFilter } from './availability-filter';
import { useFilters } from '../../hooks/use-filters';

interface FacetCount {
  value: string;
  count: number;
}

interface BrandFacet {
  name: string;
  count: number;
}

interface AvailabilityFacet {
  in_stock?: number;
  out_of_stock?: number;
  pre_order?: number;
}

interface PriceRange {
  min: number;
  max: number;
}

export interface FilterContentProps {
  categoryAttributes: CategoryAttribute[];
  facetCounts: {
    brands: BrandFacet[];
    attributes: Record<string, FacetCount[]>;
    availability: AvailabilityFacet;
    priceRange: PriceRange;
  };
}

function Separator() {
  return <hr className="border-gray-200" />;
}

function BrandFilter({ brands }: { brands: BrandFacet[] }) {
  const [filters, setFilters] = useFilters();

  if (brands.length === 0) return null;

  const toggle = (brandName: string) => {
    const current = filters.brands;
    const updated = current.includes(brandName)
      ? current.filter((b) => b !== brandName)
      : [...current, brandName];
    setFilters({ brands: updated, page: 1 });
  };

  return (
    <div className="space-y-2" data-testid="brand-filter">
      <h3 className="text-sm font-semibold text-gray-900">Brand</h3>
      <div className="space-y-1">
        {brands.map(({ name, count }) => {
          const checked = filters.brands.includes(name);
          return (
            <label
              key={name}
              className="flex items-center gap-2 cursor-pointer group"
              data-testid={`brand-option-${name}`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(name)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                aria-label={`Brand: ${name}`}
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1">{name}</span>
              {count !== undefined && (
                <span className="text-xs text-gray-400" data-testid="brand-facet-count">
                  ({count})
                </span>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}

export function FilterContent({ categoryAttributes, facetCounts }: FilterContentProps) {
  return (
    <div className="space-y-4" data-testid="filter-content">
      {/* Price Range */}
      <PriceFilter
        minPrice={facetCounts.priceRange.min}
        maxPrice={facetCounts.priceRange.max}
      />

      <Separator />

      {/* Brands */}
      <BrandFilter brands={facetCounts.brands} />

      {facetCounts.brands.length > 0 && <Separator />}

      {/* Category Attributes */}
      {categoryAttributes
        .filter((attr) => attr.isFilterable)
        .sort((a, b) => a.position - b.position)
        .map((attr, index, arr) => (
          <React.Fragment key={attr.id}>
            <AttributeFilter
              attribute={attr}
              facetCounts={facetCounts.attributes[attr.key]}
            />
            {index < arr.length - 1 && <Separator />}
          </React.Fragment>
        ))}

      {categoryAttributes.filter((attr) => attr.isFilterable).length > 0 && (
        <Separator />
      )}

      {/* Availability */}
      <AvailabilityFilter facetCounts={facetCounts.availability} />
    </div>
  );
}
