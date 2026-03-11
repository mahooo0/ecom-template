import type { ApiResponse, PaginatedResponse, Product, Order, Category, Collection, Brand } from '@repo/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return res.json();
}

interface GetProductsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
}

export const api = {
  products: {
    getAll: (params: GetProductsParams = {}) => {
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', status = 'ACTIVE' } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        status,
      });
      return fetcher<PaginatedResponse<Product>>(`/products?${queryParams.toString()}`);
    },
    getById: (id: string) => fetcher<ApiResponse<Product>>(`/products/${id}`),
    getBySlug: (slug: string) => fetcher<ApiResponse<Product>>(`/products/slug/${slug}`),
  },
  orders: {
    getById: (id: string) => fetcher<ApiResponse<Order>>(`/orders/${id}`),
    getByUser: (userId: string) =>
      fetcher<ApiResponse<Order[]>>(`/orders/user/${userId}`),
    create: (data: Partial<Order>) =>
      fetcher<ApiResponse<Order>>('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  categories: {
    getAll: () => fetcher<ApiResponse<Category[]>>('/categories'),
    getTree: () => fetcher<ApiResponse<Category[]>>('/categories/tree'),
    getBySlug: (slug: string) => fetcher<ApiResponse<Category>>(`/categories/slug/${slug}`),
  },
  collections: {
    getBySlug: (slug: string) => fetcher<ApiResponse<Collection>>(`/collections/slug/${slug}`),
  },
  brands: {
    getAll: () => fetcher<ApiResponse<Brand[]>>('/brands'),
    getBySlug: (slug: string) => fetcher<ApiResponse<Brand>>(`/brands/slug/${slug}`),
  },
};
