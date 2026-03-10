import React from 'react';
import type { Metadata } from 'next';
import { ProductGrid } from '@/components/product/product-grid';
import { SortSelector } from '@/components/product/sort-selector';
import { Pagination } from '@/components/product/pagination';
import { api } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Products | Store',
  description: 'Browse our product catalog',
};

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const limit = parseInt(params.limit || '20', 10);
  const sortBy = params.sortBy || 'createdAt';
  const sortOrder = params.sortOrder || 'desc';

  // Fetch products from API
  const result = await api.products.getAll({
    page,
    limit,
    sortBy,
    sortOrder,
    status: 'ACTIVE',
  });

  const products = result.data || [];
  const total = result.total || 0;
  const totalPages = result.totalPages || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            All Products
            <span className="ml-2 text-lg font-normal text-gray-500">({total})</span>
          </h1>
          <SortSelector currentSort={sortBy} currentOrder={sortOrder} />
        </div>
      </div>

      <ProductGrid products={products} />

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} basePath="/products" />
      )}
    </div>
  );
}
