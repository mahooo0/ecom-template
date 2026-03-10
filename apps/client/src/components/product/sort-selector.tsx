'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface SortOption {
  label: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const sortOptions: SortOption[] = [
  { label: 'Newest', sortBy: 'createdAt', sortOrder: 'desc' },
  { label: 'Price: Low to High', sortBy: 'price', sortOrder: 'asc' },
  { label: 'Price: High to Low', sortBy: 'price', sortOrder: 'desc' },
  { label: 'Name: A-Z', sortBy: 'name', sortOrder: 'asc' },
  { label: 'Name: Z-A', sortBy: 'name', sortOrder: 'desc' },
];

interface SortSelectorProps {
  currentSort?: string;
  currentOrder?: string;
}

export function SortSelector({ currentSort = 'createdAt', currentOrder = 'desc' }: SortSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentValue = `${currentSort}-${currentOrder}`;

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split('-');
    const params = new URLSearchParams(searchParams.toString());

    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    params.set('page', '1'); // Reset to page 1 on sort change

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm font-medium text-gray-700">
        Sort by:
      </label>
      <select
        id="sort"
        value={currentValue}
        onChange={handleSortChange}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {sortOptions.map((option) => (
          <option key={`${option.sortBy}-${option.sortOrder}`} value={`${option.sortBy}-${option.sortOrder}`}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
