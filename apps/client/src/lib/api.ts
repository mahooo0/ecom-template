import type { ApiResponse, PaginatedResponse, Product, Order, Category, Collection, Brand, CartItem } from '@repo/types';

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
  categoryId?: string;
  categoryPath?: string;
}

export interface FilterProductsParams {
  categoryPath?: string;
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  attributes?: string[];
  availability?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FacetsParams {
  categoryPath?: string;
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  attributes?: string[];
  availability?: string[];
}

export interface FacetCounts {
  brands: Array<{ id: string; name: string; count: number }>;
  attributes: Record<string, Array<{ value: string; count: number }>>;
  availability: Array<{ status: string; count: number }>;
  priceRange: { min: number; max: number };
}

export interface FilterProductsResponse {
  success: boolean;
  data: Product[];
  total: number;
  totalPages: number;
}

export interface FacetsResponse {
  success: boolean;
  data: FacetCounts;
}

export const api = {
  products: {
    getAll: (params: GetProductsParams = {}) => {
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', status = 'ACTIVE', categoryId, categoryPath } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        status,
      });
      if (categoryId) queryParams.set('categoryId', categoryId);
      if (categoryPath) queryParams.set('categoryPath', categoryPath);
      return fetcher<PaginatedResponse<Product>>(`/products?${queryParams.toString()}`);
    },
    getById: (id: string) => fetcher<ApiResponse<Product>>(`/products/${id}`),
    getBySlug: (slug: string) => fetcher<ApiResponse<Product>>(`/products/slug/${slug}`),
    getRelated: (productId: string, limit = 5) =>
      fetcher<ApiResponse<Product[]>>(`/products/${productId}/related?limit=${limit}`),
    getFrequentlyBoughtTogether: (productId: string, limit = 3) =>
      fetcher<ApiResponse<Product[]>>(`/products/${productId}/fbt?limit=${limit}`),
    filter: (params: FilterProductsParams = {}) => {
      const queryParams = new URLSearchParams();
      if (params.categoryPath) queryParams.set('categoryPath', params.categoryPath);
      if (params.minPrice !== undefined && params.minPrice > 0) queryParams.set('minPrice', params.minPrice.toString());
      if (params.maxPrice !== undefined && params.maxPrice < 999999) queryParams.set('maxPrice', params.maxPrice.toString());
      if (params.brands && params.brands.length > 0) queryParams.set('brands', params.brands.join(','));
      if (params.attributes && params.attributes.length > 0) queryParams.set('attributes', params.attributes.join(','));
      if (params.availability && params.availability.length > 0) queryParams.set('availability', params.availability.join(','));
      if (params.page && params.page > 1) queryParams.set('page', params.page.toString());
      if (params.limit) queryParams.set('limit', params.limit.toString());
      if (params.sortBy && params.sortBy !== 'createdAt') queryParams.set('sortBy', params.sortBy);
      if (params.sortOrder && params.sortOrder !== 'desc') queryParams.set('sortOrder', params.sortOrder);
      const qs = queryParams.toString();
      return fetcher<FilterProductsResponse>(`/products/filter${qs ? `?${qs}` : ''}`);
    },
    facets: (params: FacetsParams = {}) => {
      const queryParams = new URLSearchParams();
      if (params.categoryPath) queryParams.set('categoryPath', params.categoryPath);
      if (params.minPrice !== undefined && params.minPrice > 0) queryParams.set('minPrice', params.minPrice.toString());
      if (params.maxPrice !== undefined && params.maxPrice < 999999) queryParams.set('maxPrice', params.maxPrice.toString());
      if (params.brands && params.brands.length > 0) queryParams.set('brands', params.brands.join(','));
      if (params.attributes && params.attributes.length > 0) queryParams.set('attributes', params.attributes.join(','));
      if (params.availability && params.availability.length > 0) queryParams.set('availability', params.availability.join(','));
      const qs = queryParams.toString();
      return fetcher<FacetsResponse>(`/products/facets${qs ? `?${qs}` : ''}`);
    },
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
  cart: {
    get: (token: string) =>
      fetcher<ApiResponse<{ items: CartItem[]; couponCode?: string | null; discountAmount?: number }>>('/cart', {
        headers: { Authorization: `Bearer ${token}` },
      }),
    addItem: (item: CartItem, token: string) =>
      fetcher<ApiResponse<unknown>>('/cart/items', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(item),
      }),
    updateQuantity: (productId: string, variantId: string | undefined, quantity: number, token: string) =>
      fetcher<ApiResponse<unknown>>('/cart/items', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId, variantId, quantity }),
      }),
    removeItem: (productId: string, variantId: string | undefined, token: string) =>
      fetcher<ApiResponse<unknown>>('/cart/items', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId, variantId }),
      }),
    clear: (token: string) =>
      fetcher<ApiResponse<unknown>>('/cart', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }),
    merge: (items: CartItem[], couponCode: string | null, token: string) =>
      fetcher<ApiResponse<unknown>>('/cart/merge', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items, couponCode }),
      }),
    applyCoupon: (code: string, token: string) =>
      fetcher<ApiResponse<unknown>>('/cart/coupon', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code }),
      }),
    removeCoupon: (token: string) =>
      fetcher<ApiResponse<unknown>>('/cart/coupon', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }),
    validateCoupon: (code: string, token: string) =>
      fetcher<ApiResponse<unknown>>('/cart/coupon/validate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code }),
      }),
    validateStock: (token: string) =>
      fetcher<ApiResponse<unknown>>('/cart/stock-validation', {
        headers: { Authorization: `Bearer ${token}` },
      }),
  },
};
