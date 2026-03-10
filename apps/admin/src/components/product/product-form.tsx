'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductFormData } from '@repo/types';
import { api } from '@/lib/api';
import { ImageManager } from './image-manager';
import { SimpleFields } from './simple-fields';
import { VariableFields } from './variable-fields';
import { WeightedFields } from './weighted-fields';
import { DigitalFields } from './digital-fields';
import { BundledFields } from './bundled-fields';

interface Category {
  id: string;
  name: string;
  path: string;
}

interface Brand {
  id: string;
  name: string;
}

interface OptionGroup {
  id: string;
  name: string;
  displayName: string;
  values: Array<{
    id: string;
    value: string;
    label: string;
  }>;
}

interface ProductReference {
  id: string;
  name: string;
  price: number;
}

interface ProductFormProps {
  defaultValues?: Partial<ProductFormData>;
  categories: Category[];
  brands: Brand[];
  optionGroups: OptionGroup[];
  products: ProductReference[];
  isEdit?: boolean;
  productId?: string;
}

export function ProductForm({
  defaultValues,
  categories,
  brands,
  optionGroups,
  products,
  isEdit = false,
  productId,
}: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<any>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: defaultValues || {
      productType: 'SIMPLE',
      name: '',
      description: '',
      price: 0,
      sku: '',
      categoryId: '',
      status: 'DRAFT',
      images: [],
      attributes: {},
      isActive: true,
    },
  });

  const productType = form.watch('productType');
  const images = form.watch('images');

  const handleSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (isEdit && productId) {
        await api.products.update(productId, data as any);
      } else {
        await api.products.create(data as any);
      }

      router.push('/products');
      router.refresh();
    } catch (err) {
      setError((err as Error).message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (newImages: string[]) => {
    form.setValue('images', newImages);
  };

  // Auto-generate SKU from name if empty
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue('name', name);

    // Only auto-generate SKU if it's empty and we're creating a new product
    if (!isEdit && !form.getValues('sku')) {
      const sku = name
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 50);
      if (sku) {
        form.setValue('sku', sku);
      }
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Base Fields */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>

            {/* Product Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Type *
              </label>
              <select
                {...form.register('productType')}
                disabled={isEdit}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="SIMPLE">Simple Product</option>
                <option value="VARIABLE">Variable Product</option>
                <option value="WEIGHTED">Weighted Product</option>
                <option value="DIGITAL">Digital Product</option>
                <option value="BUNDLED">Bundled Product</option>
              </select>
              {isEdit && (
                <p className="mt-1 text-xs text-gray-500">
                  Product type cannot be changed after creation
                </p>
              )}
              {form.formState.errors.productType && (
                <p className="mt-1 text-sm text-red-600">
                  {String(form.formState.errors.productType.message)}
                </p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                {...form.register('name')}
                type="text"
                onChange={handleNameChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter product name"
              />
              {form.formState.errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {String(form.formState.errors.name.message)}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                {...form.register('description')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your product"
              />
              {form.formState.errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {String(form.formState.errors.description.message)}
                </p>
              )}
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU *
              </label>
              <input
                {...form.register('sku')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="PRODUCT-SKU-001"
              />
              <p className="mt-1 text-xs text-gray-500">
                Unique product identifier (auto-generated from name if empty)
              </p>
              {form.formState.errors.sku && (
                <p className="mt-1 text-sm text-red-600">
                  {String(form.formState.errors.sku.message)}
                </p>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Pricing</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Base Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Price (cents) *
                </label>
                <input
                  {...form.register('price', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1999"
                  min="0"
                  step="1"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Price in cents (e.g., 1999 = $19.99)
                </p>
                {form.formState.errors.price && (
                  <p className="mt-1 text-sm text-red-600">
                    {String(form.formState.errors.price.message)}
                  </p>
                )}
              </div>

              {/* Compare At Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compare At Price (cents)
                </label>
                <input
                  {...form.register('compareAtPrice', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="2499"
                  min="0"
                  step="1"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Optional - show as strikethrough price
                </p>
                {form.formState.errors.compareAtPrice && (
                  <p className="mt-1 text-sm text-red-600">
                    {String(form.formState.errors.compareAtPrice.message)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Organization */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Organization</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  {...form.register('categoryId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.path || category.name}
                    </option>
                  ))}
                </select>
                {form.formState.errors.categoryId && (
                  <p className="mt-1 text-sm text-red-600">
                    {String(form.formState.errors.categoryId.message)}
                  </p>
                )}
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <select
                  {...form.register('brandId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a brand (optional)</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  {...form.register('status')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Type-Specific Fields */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Product Type Details
            </h2>

            {productType === 'SIMPLE' && <SimpleFields form={form} />}
            {productType === 'VARIABLE' && (
              <VariableFields form={form} optionGroups={optionGroups} />
            )}
            {productType === 'WEIGHTED' && <WeightedFields form={form} />}
            {productType === 'DIGITAL' && <DigitalFields form={form} />}
            {productType === 'BUNDLED' && (
              <BundledFields
                form={form}
                products={products.filter((p) => p.id !== productId)}
              />
            )}
          </div>
        </div>

        {/* Right Column - Media */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Media</h2>
            <ImageManager
              images={images || []}
              onChange={handleImageChange}
              maxFiles={10}
            />
          </div>
        </div>
      </div>

      {/* Submit Button - Sticky at bottom */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4 flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.push('/products')}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
