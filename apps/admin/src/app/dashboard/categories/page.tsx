import { auth } from '@clerk/nextjs/server';
import { api } from '@/lib/api';
import Link from 'next/link';
import CategoryTree from './category-tree';
import CategoryForm from './category-form';
import AttributeManager from './attribute-manager';

interface SearchParams {
  action?: string;
  id?: string;
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { getToken } = await auth();
  const token = await getToken();
  const params = await searchParams;

  if (!token) {
    return <div>Not authenticated</div>;
  }

  // Fetch all categories
  const response = await api.categories.getAll(token);
  const categories = response.data || [];

  // Fetch specific category if editing or managing attributes
  let selectedCategory = null;
  let categoryAttributes: any[] = [];
  if (params.id) {
    const categoryResponse = await api.categories.getById(params.id, token);
    selectedCategory = categoryResponse.data || null;
    if (selectedCategory) {
      categoryAttributes = selectedCategory.attributes || [];
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categories</h1>
        {!params.action && (
          <Link
            href="/dashboard/categories?action=create"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Category
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tree view */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Category Hierarchy</h2>
          <CategoryTree categories={categories} />
        </div>

        {/* Side panel - Form or Attribute Manager */}
        {params.action === 'create' && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Create Category</h2>
            <CategoryForm categories={categories} />
          </div>
        )}

        {params.action === 'edit' && selectedCategory && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Edit Category</h2>
            <CategoryForm category={selectedCategory} categories={categories} />
          </div>
        )}

        {params.action === 'attributes' && selectedCategory && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">
              Manage Attributes: {selectedCategory.name}
            </h2>
            <AttributeManager
              categoryId={selectedCategory.id}
              attributes={categoryAttributes}
            />
          </div>
        )}
      </div>
    </div>
  );
}
