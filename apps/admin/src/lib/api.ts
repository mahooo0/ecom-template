import type { ApiResponse, PaginatedResponse, Product, Order, User, ShippingZone, ShippingMethod, Category, CategoryAttribute, Brand, Tag, Collection } from '@repo/types';

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
    getById: (id: string) => fetcher<ApiResponse<Order>>(`/orders/${id}`),
    updateStatus: (id: string, status: string) =>
      fetcher<ApiResponse<Order>>(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    addTracking: (id: string, data: { carrier: string; trackingNumber: string; estimatedDelivery?: string }) =>
      fetcher<ApiResponse<Order>>(`/orders/${id}/tracking`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },
  users: {
    getAll: (page = 1, limit = 20) =>
      fetcher<PaginatedResponse<User>>(`/auth/users?page=${page}&limit=${limit}`),
  },
  shipping: {
    zones: {
      getAll: () => fetcher<ApiResponse<ShippingZone[]>>('/shipping/zones'),
      getById: (id: string) => fetcher<ApiResponse<ShippingZone & { methods: ShippingMethod[] }>>(`/shipping/zones/${id}`),
      create: (data: Partial<ShippingZone>) => fetcher<ApiResponse<ShippingZone>>('/shipping/zones', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: Partial<ShippingZone>) => fetcher<ApiResponse<ShippingZone>>(`/shipping/zones/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) => fetcher<ApiResponse<void>>(`/shipping/zones/${id}`, { method: 'DELETE' }),
    },
    methods: {
      create: (zoneId: string, data: Partial<ShippingMethod>) => fetcher<ApiResponse<ShippingMethod>>(`/shipping/zones/${zoneId}/methods`, { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: Partial<ShippingMethod>) => fetcher<ApiResponse<ShippingMethod>>(`/shipping/methods/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) => fetcher<ApiResponse<void>>(`/shipping/methods/${id}`, { method: 'DELETE' }),
    },
  },
  categories: {
    getAll: (token?: string) => fetcher<ApiResponse<Category[]>>('/categories', { token }),
    getTree: (token?: string) => fetcher<ApiResponse<Category[]>>('/categories/tree', { token }),
    getById: (id: string, token?: string) => fetcher<ApiResponse<Category & { attributes: CategoryAttribute[], children: Category[] }>>(`/categories/${id}`, { token }),
    create: (data: Partial<Category>, token?: string) => fetcher<ApiResponse<Category>>('/categories', { method: 'POST', body: JSON.stringify(data), token }),
    update: (id: string, data: Partial<Category>, token?: string) => fetcher<ApiResponse<Category>>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
    delete: (id: string, token?: string) => fetcher<ApiResponse<void>>(`/categories/${id}`, { method: 'DELETE', token }),
    move: (id: string, data: { newParentId: string | null; position: number }, token?: string) => fetcher<ApiResponse<Category>>(`/categories/${id}/move`, { method: 'PATCH', body: JSON.stringify(data), token }),
    reorder: (data: { parentId: string | null; orderedIds: string[] }, token?: string) => fetcher<ApiResponse<void>>('/categories/reorder', { method: 'PATCH', body: JSON.stringify(data), token }),
    // Attributes
    getAttributes: (categoryId: string, token?: string) => fetcher<ApiResponse<CategoryAttribute[]>>(`/categories/${categoryId}/attributes`, { token }),
    createAttribute: (categoryId: string, data: Partial<CategoryAttribute>, token?: string) => fetcher<ApiResponse<CategoryAttribute>>(`/categories/${categoryId}/attributes`, { method: 'POST', body: JSON.stringify(data), token }),
    updateAttribute: (attributeId: string, data: Partial<CategoryAttribute>, token?: string) => fetcher<ApiResponse<CategoryAttribute>>(`/categories/attributes/${attributeId}`, { method: 'PUT', body: JSON.stringify(data), token }),
    deleteAttribute: (attributeId: string, token?: string) => fetcher<ApiResponse<void>>(`/categories/attributes/${attributeId}`, { method: 'DELETE', token }),
  },
  collections: {
    getAll: (params?: { page?: number; limit?: number; token?: string }) => {
      const qp = new URLSearchParams();
      if (params?.page) qp.set('page', String(params.page));
      if (params?.limit) qp.set('limit', String(params.limit));
      const qs = qp.toString();
      return fetcher<PaginatedResponse<Collection>>(`/collections${qs ? `?${qs}` : ''}`, { token: params?.token });
    },
    getById: (id: string, token?: string) => fetcher<ApiResponse<Collection>>(`/collections/${id}`, { token }),
    create: (data: Partial<Collection>, token?: string) => fetcher<ApiResponse<Collection>>('/collections', { method: 'POST', body: JSON.stringify(data), token }),
    update: (id: string, data: Partial<Collection>, token?: string) => fetcher<ApiResponse<Collection>>(`/collections/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
    delete: (id: string, token?: string) => fetcher<ApiResponse<void>>(`/collections/${id}`, { method: 'DELETE', token }),
    addProduct: (collectionId: string, productId: string, token?: string) => fetcher<ApiResponse<void>>(`/collections/${collectionId}/products`, { method: 'POST', body: JSON.stringify({ productId }), token }),
    removeProduct: (collectionId: string, productId: string, token?: string) => fetcher<ApiResponse<void>>(`/collections/${collectionId}/products/${productId}`, { method: 'DELETE', token }),
  },
  brands: {
    getAll: (params?: { page?: number; limit?: number; token?: string }) => {
      const qp = new URLSearchParams();
      if (params?.page) qp.set('page', String(params.page));
      if (params?.limit) qp.set('limit', String(params.limit));
      const qs = qp.toString();
      return fetcher<PaginatedResponse<Brand>>(`/brands${qs ? `?${qs}` : ''}`, { token: params?.token });
    },
    getById: (id: string, token?: string) => fetcher<ApiResponse<Brand>>(`/brands/${id}`, { token }),
    create: (data: Partial<Brand>, token?: string) => fetcher<ApiResponse<Brand>>('/brands', { method: 'POST', body: JSON.stringify(data), token }),
    update: (id: string, data: Partial<Brand>, token?: string) => fetcher<ApiResponse<Brand>>(`/brands/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
    delete: (id: string, token?: string) => fetcher<ApiResponse<void>>(`/brands/${id}`, { method: 'DELETE', token }),
  },
  tags: {
    getAll: (token?: string) => fetcher<ApiResponse<Tag[]>>('/tags', { token }),
    create: (data: { name: string }, token?: string) => fetcher<ApiResponse<Tag>>('/tags', { method: 'POST', body: JSON.stringify(data), token }),
    delete: (id: string, token?: string) => fetcher<ApiResponse<void>>(`/tags/${id}`, { method: 'DELETE', token }),
  },
  inventory: {
    dashboard: () => fetcher<ApiResponse<any>>('/inventory/dashboard'),
    stock: {
      getByVariant: (variantId: string) => fetcher<ApiResponse<any[]>>(`/inventory/stock?variantId=${variantId}`),
      getLevel: (variantId: string, warehouseId: string) => fetcher<ApiResponse<any>>(`/inventory/stock?variantId=${variantId}&warehouseId=${warehouseId}`),
      adjust: (data: { variantId: string; warehouseId: string; quantity: number; reason: string; note?: string; reference?: string }) =>
        fetcher<ApiResponse<any>>('/inventory/adjust', { method: 'POST', body: JSON.stringify(data) }),
    },
    alerts: () => fetcher<ApiResponse<any[]>>('/inventory/alerts'),
    warehouses: {
      getAll: () => fetcher<ApiResponse<any[]>>('/inventory/warehouses'),
      getById: (id: string) => fetcher<ApiResponse<any>>(`/inventory/warehouses/${id}`),
      create: (data: any) => fetcher<ApiResponse<any>>('/inventory/warehouses', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => fetcher<ApiResponse<any>>(`/inventory/warehouses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) => fetcher<ApiResponse<void>>(`/inventory/warehouses/${id}`, { method: 'DELETE' }),
    },
    movements: {
      getAll: (params?: { inventoryItemId?: string; reason?: string; page?: number; limit?: number }) => {
        const qp = new URLSearchParams();
        if (params?.inventoryItemId) qp.set('inventoryItemId', params.inventoryItemId);
        if (params?.reason) qp.set('reason', params.reason);
        if (params?.page) qp.set('page', String(params.page));
        if (params?.limit) qp.set('limit', String(params.limit));
        const qs = qp.toString();
        return fetcher<ApiResponse<any[]>>(`/inventory/movements${qs ? `?${qs}` : ''}`);
      },
    },
  },
};
