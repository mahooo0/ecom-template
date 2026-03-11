'use client';

import React from 'react';
import { useFilters } from '../../hooks/use-filters';
import type { CategoryAttribute } from '@repo/types';

interface FacetCount {
  value: string;
  count: number;
}

interface AttributeFilterProps {
  attribute: CategoryAttribute;
  facetCounts?: FacetCount[];
}

function getFacetCount(facetCounts: FacetCount[] | undefined, value: string): number | undefined {
  if (!facetCounts) return undefined;
  const found = facetCounts.find((f) => f.value === value);
  return found?.count;
}

export function AttributeFilter({ attribute, facetCounts }: AttributeFilterProps) {
  const [filters, setFilters] = useFilters();

  const attributeKey = attribute.key;

  const isActive = (value: string) =>
    filters.attributes.includes(`${attributeKey}:${value}`);

  const toggle = (value: string) => {
    const filterValue = `${attributeKey}:${value}`;
    const current = filters.attributes;
    const updated = current.includes(filterValue)
      ? current.filter((a) => a !== filterValue)
      : [...current, filterValue];
    setFilters({ attributes: updated, page: 1 });
  };

  const toggleBoolean = () => {
    const filterValue = `${attributeKey}:true`;
    const current = filters.attributes;
    const updated = current.includes(filterValue)
      ? current.filter((a) => a !== filterValue)
      : [...current, filterValue];
    setFilters({ attributes: updated, page: 1 });
  };

  if (attribute.type === 'SELECT') {
    return (
      <div className="space-y-2" data-testid={`attribute-filter-${attributeKey}`}>
        <h3 className="text-sm font-semibold text-gray-900">{attribute.name}</h3>
        <div className="space-y-1">
          {attribute.values.map((value) => {
            const count = getFacetCount(facetCounts, value);
            const checked = isActive(value);
            return (
              <label
                key={value}
                className="flex items-center gap-2 cursor-pointer group"
                data-testid={`attribute-option-${value}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  aria-label={`${attribute.name}: ${value}`}
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1">
                  {value}
                  {attribute.unit && ` ${attribute.unit}`}
                </span>
                {count !== undefined && (
                  <span className="text-xs text-gray-400" data-testid="facet-count">
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

  if (attribute.type === 'RANGE') {
    const values = attribute.values;
    const minVal = values[0] ? parseFloat(values[0]) : 0;
    const maxVal = values[values.length - 1] ? parseFloat(values[values.length - 1]) : 100;

    // Find current range selection
    const activeAttrs = filters.attributes.filter((a) => a.startsWith(`${attributeKey}:`));
    const activeMax = activeAttrs.length > 0
      ? parseFloat(activeAttrs[0].split(':')[1] || maxVal.toString())
      : maxVal;

    return (
      <div className="space-y-2" data-testid={`attribute-filter-${attributeKey}`}>
        <h3 className="text-sm font-semibold text-gray-900">
          {attribute.name}
          {attribute.unit && ` (${attribute.unit})`}
        </h3>
        <input
          type="range"
          min={minVal}
          max={maxVal}
          step={values.length > 1 ? parseFloat(values[1] || '1') - minVal : 1}
          value={activeMax}
          onChange={(e) => {
            const val = e.target.value;
            const filterValue = `${attributeKey}:${val}`;
            const updated = filters.attributes
              .filter((a) => !a.startsWith(`${attributeKey}:`))
              .concat(filterValue);
            setFilters({ attributes: updated, page: 1 });
          }}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
          data-testid={`attribute-range-slider-${attributeKey}`}
          aria-label={`${attribute.name} range`}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{minVal}{attribute.unit}</span>
          <span>{activeMax}{attribute.unit}</span>
        </div>
      </div>
    );
  }

  if (attribute.type === 'BOOLEAN') {
    const checked = isActive('true');
    return (
      <div className="space-y-2" data-testid={`attribute-filter-${attributeKey}`}>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={toggleBoolean}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            data-testid={`attribute-boolean-${attributeKey}`}
            aria-label={attribute.name}
          />
          <span className="text-sm font-semibold text-gray-900">{attribute.name}</span>
        </label>
      </div>
    );
  }

  return null;
}
