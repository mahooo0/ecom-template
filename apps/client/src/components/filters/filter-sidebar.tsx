'use client';

import React from 'react';
import type { FilterContentProps } from './filter-content';
import { FilterContent } from './filter-content';
import { ActiveFilters } from './active-filters';

type FilterSidebarProps = FilterContentProps;

export function FilterSidebar({ categoryAttributes, facetCounts }: FilterSidebarProps) {
  return (
    <aside
      className="hidden lg:block w-64 shrink-0"
      data-testid="filter-sidebar"
    >
      <div className="sticky top-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">Filters</h2>
        </div>

        {/* Active filters summary */}
        <div className="mb-4">
          <ActiveFilters />
        </div>

        {/* Scrollable filter content */}
        <div className="overflow-y-auto max-h-[calc(100vh-10rem)] pr-1">
          <FilterContent
            categoryAttributes={categoryAttributes}
            facetCounts={facetCounts}
          />
        </div>
      </div>
    </aside>
  );
}
