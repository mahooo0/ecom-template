import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { ProductGrid } from '@/components/product/product-grid';
import { SortSelector } from '@/components/product/sort-selector';
import { Pagination } from '@/components/product/pagination';
import { api } from '@/lib/api';
import type { Category } from '@repo/types';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  try {
    const result = await api.categories.getBySlug(slug);
    const category = result.data;

    if (!category) {
      return { title: 'Category Not Found' };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';
    const url = `${siteUrl}/categories/${category.slug}`;

    return {
      title: category.metaTitle || category.name,
      description: category.metaDescription || category.description || undefined,
      alternates: { canonical: url },
      openGraph: {
        title: category.metaTitle || category.name,
        description: category.metaDescription || category.description || undefined,
        url,
        type: 'website',
        images: category.image ? [{ url: category.image }] : [],
      },
    };
  } catch (error) {
    return { title: 'Category Not Found' };
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const queryParams = await searchParams;

  const page = parseInt(queryParams.page || '1', 10);
  const limit = parseInt(queryParams.limit || '20', 10);
  const sortBy = queryParams.sortBy || 'createdAt';
  const sortOrder = queryParams.sortOrder || 'desc';

  // Fetch category
  let category: Category | null = null;
  try {
    const result = await api.categories.getBySlug(slug);
    category = result.data || null;
  } catch (error) {
    notFound();
  }

  if (!category) {
    notFound();
  }

  // Fetch all categories to find subcategories
  let subcategories: Category[] = [];
  try {
    const allCategoriesResult = await api.categories.getAll();
    const allCategories = allCategoriesResult.data || [];
    subcategories = allCategories.filter((cat) => cat.parentId === category.id);
    subcategories.sort((a, b) => a.position - b.position);
  } catch (error) {
    console.error('Failed to fetch subcategories:', error);
  }

  // Fetch products from this category and all descendants
  let products: any[] = [];
  let total = 0;
  let totalPages = 1;
  try {
    const result = await api.products.getAll({
      page,
      limit,
      sortBy,
      sortOrder,
      status: 'ACTIVE',
      categoryPath: category.path,
    });
    products = result.data || [];
    total = result.total || 0;
    totalPages = result.totalPages || 1;
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs categorySlug={slug} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-gray-600 text-base">{category.description}</p>
        )}
      </div>

      {subcategories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {subcategories.map((subcat) => (
              <a
                key={subcat.id}
                href={`/categories/${subcat.slug}`}
                className="group block rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:shadow-md transition-all"
              >
                {subcat.image && (
                  <div className="mb-3 aspect-square overflow-hidden rounded-md bg-gray-100">
                    <img
                      src={subcat.image}
                      alt={subcat.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <h3 className="text-sm font-medium text-gray-900 text-center">
                  {subcat.name}
                </h3>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Products
          <span className="ml-2 text-lg font-normal text-gray-500">({total})</span>
        </h2>
        <SortSelector currentSort={sortBy} currentOrder={sortOrder} />
      </div>

      <ProductGrid products={products} />

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath={`/categories/${slug}`}
        />
      )}
    </div>
  );
}
