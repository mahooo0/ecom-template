import type { ApiResponse, PaginatedResponse, Product, Order, User } from '@repo/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function fetcher<T>(
  url: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const { token, ...fetchOptions } = options || {};
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${url}`, {
    headers,
    ...fetchOptions,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return res.json();
}

export const api = {
  products: {
    getAll: (params?: {
      page?: number;
      limit?: number;
      status?: string;
      productType?: string;
      search?: string;
      sortBy?: string;
      sortOrder?: string;
      token?: string;
    }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', String(params.page));
      if (params?.limit) queryParams.set('limit', String(params.limit));
      if (params?.status) queryParams.set('status', params.status);
      if (params?.productType) queryParams.set('productType', params.productType);
      if (params?.search) queryParams.set('search', params.search);
      if (params?.sortBy) queryParams.set('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.set('sortOrder', params.sortOrder);

      const queryString = queryParams.toString();
      const url = `/products${queryString ? `?${queryString}` : ''}`;

      return fetcher<PaginatedResponse<Product>>(url, { token: params?.token });
    },
    getById: (id: string, token?: string) =>
      fetcher<ApiResponse<Product>>(`/products/${id}`, { token }),
    create: (data: Partial<Product>, token?: string) =>
      fetcher<ApiResponse<Product>>('/products', {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      }),
    update: (id: string, data: Partial<Product>, token?: string) =>
      fetcher<ApiResponse<Product>>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        token,
      }),
    delete: (id: string, token?: string) =>
      fetcher<ApiResponse<void>>(`/products/${id}`, { method: 'DELETE', token }),
    updateStatus: (id: string, status: string, token?: string) =>
      fetcher<ApiResponse<Product>>(`/products/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
        token,
      }),
    bulkUpdateStatus: (ids: string[], status: string, token?: string) =>
      fetcher<ApiResponse<{ count: number }>>('/products/bulk/status', {
        method: 'PATCH',
        body: JSON.stringify({ ids, status }),
        token,
      }),
    bulkDelete: (ids: string[], token?: string) =>
      fetcher<ApiResponse<{ count: number }>>('/products/bulk/delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
        token,
      }),
  },
  orders: {
    getAll: (page = 1, limit = 20) =>
      fetcher<PaginatedResponse<Order>>(`/orders?page=${page}&limit=${limit}`),
    updateStatus: (id: string, status: string) =>
      fetcher<ApiResponse<Order>>(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },
  users: {
    getAll: (page = 1, limit = 20) =>
      fetcher<PaginatedResponse<User>>(`/auth/users?page=${page}&limit=${limit}`),
  },
};
