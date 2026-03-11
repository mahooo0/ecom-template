'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Category } from '@repo/types';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

const categoryFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
  image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  metaTitle: z.string().max(60, 'Meta title must be 60 characters or less').optional(),
  metaDescription: z.string().max(160, 'Meta description must be 160 characters or less').optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  category?: Category;
  categories: Category[];
}

export default function CategoryForm({ category, categories }: CategoryFormProps) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      parentId: category?.parentId || null,
      image: category?.image || '',
      metaTitle: category?.metaTitle || '',
      metaDescription: category?.metaDescription || '',
      slug: category?.slug || '',
    },
  });

  const name = watch('name');
  const slug = watch('slug');
  const metaTitle = watch('metaTitle');
  const metaDescription = watch('metaDescription');

  // Auto-generate slug from name (only on create, and if slug hasn't been manually edited)
  useEffect(() => {
    if (!category && name && !slugManuallyEdited) {
      const autoSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setValue('slug', autoSlug);
    }
  }, [name, category, slugManuallyEdited, setValue]);

  // Filter out current category and its descendants from parent options (for edit mode)
  const getDescendantIds = (catId: string): string[] => {
    const descendants = categories.filter((c) => c.parentId === catId);
    return [
      catId,
      ...descendants.flatMap((d) => getDescendantIds(d.id)),
    ];
  };

  const availableParents = category
    ? categories.filter((c) => !getDescendantIds(category.id).includes(c.id))
    : categories;

  const onSubmit = async (data: CategoryFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      if (category) {
        // Update existing category
        await api.categories.update(category.id, data as any, token);
      } else {
        // Create new category
        await api.categories.create(data as any, token);
      }

      // Refresh the page and close the form
      router.push('/dashboard/categories');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          {...register('name')}
          id="name"
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.name && (
          <p className="text-sm text-red-600 mt-1">{String(errors.name.message)}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          {...register('description')}
          id="description"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.description && (
          <p className="text-sm text-red-600 mt-1">{String(errors.description.message)}</p>
        )}
      </div>

      {/* Parent Category */}
      <div>
        <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-1">
          Parent Category
        </label>
        <select
          {...register('parentId')}
          id="parentId"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">None (Root Category)</option>
          {availableParents.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {'—'.repeat(cat.depth)} {cat.name}
            </option>
          ))}
        </select>
        {errors.parentId && (
          <p className="text-sm text-red-600 mt-1">{String(errors.parentId.message)}</p>
        )}
      </div>

      {/* Image URL */}
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
          Image URL
        </label>
        <input
          {...register('image')}
          id="image"
          type="text"
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.image && (
          <p className="text-sm text-red-600 mt-1">{String(errors.image.message)}</p>
        )}
      </div>

      {/* SEO Section */}
      <div className="border-t pt-4 mt-6">
        <h3 className="text-lg font-semibold mb-3">SEO Settings</h3>

        {/* Slug */}
        <div className="mb-4">
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
            URL Slug
          </label>
          <input
            {...register('slug')}
            id="slug"
            type="text"
            onChange={(e) => {
              setSlugManuallyEdited(true);
              register('slug').onChange(e);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {slug && (
            <p className="text-xs text-gray-500 mt-1">
              Preview: /categories/{slug}
            </p>
          )}
          {errors.slug && (
            <p className="text-sm text-red-600 mt-1">{String(errors.slug.message)}</p>
          )}
        </div>

        {/* Meta Title */}
        <div className="mb-4">
          <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
            Meta Title
            <span className="text-xs text-gray-500 ml-2">
              ({metaTitle?.length || 0}/60)
            </span>
          </label>
          <input
            {...register('metaTitle')}
            id="metaTitle"
            type="text"
            maxLength={60}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.metaTitle && (
            <p className="text-sm text-red-600 mt-1">{String(errors.metaTitle.message)}</p>
          )}
        </div>

        {/* Meta Description */}
        <div>
          <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
            Meta Description
            <span className="text-xs text-gray-500 ml-2">
              ({metaDescription?.length || 0}/160)
            </span>
          </label>
          <textarea
            {...register('metaDescription')}
            id="metaDescription"
            rows={2}
            maxLength={160}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.metaDescription && (
            <p className="text-sm text-red-600 mt-1">{String(errors.metaDescription.message)}</p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/categories')}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
