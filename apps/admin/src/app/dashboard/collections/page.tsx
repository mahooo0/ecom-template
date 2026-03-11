import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import type { Collection, Product } from '@repo/types';
import CollectionForm from './collection-form';
import ProductSelector from './product-selector';

interface PageProps {
  searchParams: Promise<{
    action?: string;
    id?: string;
  }>;
}

export default async function CollectionsPage(props: PageProps) {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    redirect('/sign-in');
  }

  const searchParams = await props.searchParams;
  const action = searchParams.action;
  const id = searchParams.id;

  // Fetch collections
  const collectionsResponse = await api.collections.getAll({ token });
  const collections = collectionsResponse.data || [];

  // Fetch collection details if editing or managing products
  let selectedCollection: (Collection & { products?: Product[] }) | null = null;
  if (id && (action === 'edit' || action === 'products')) {
    try {
      const response = await api.collections.getById(id, token);
      selectedCollection = response.data || null;
    } catch (error) {
      console.error('Failed to fetch collection:', error);
    }
  }

  // Fetch all products for product selector
  let products: Product[] = [];
  if (action === 'products' && selectedCollection) {
    try {
      const productsResponse = await api.products.getAll({ token });
      products = productsResponse.data || [];
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  }

  const handleDeleteCollection = async (collectionId: string) => {
    'use server';
    const { getToken } = await auth();
    const token = await getToken();
    if (!token) return;
    await api.collections.delete(collectionId, token);
    redirect('/dashboard/collections');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Collections</h1>
        <a
          href="/dashboard/collections?action=create"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Collection
        </a>
      </div>

      {/* Show form for create/edit */}
      {(action === 'create' || action === 'edit') && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            {action === 'create' ? 'Create Collection' : 'Edit Collection'}
          </h2>
          <CollectionForm
            collection={selectedCollection || undefined}
            onSuccess={() => {
              redirect('/dashboard/collections');
            }}
          />
        </div>
      )}

      {/* Show product selector */}
      {action === 'products' && selectedCollection && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Manage Products in "{selectedCollection.name}"
          </h2>
          <ProductSelector
            collectionId={selectedCollection.id}
            products={products}
          />
        </div>
      )}

      {/* Collections table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {collections.map((collection: Collection) => (
              <tr key={collection.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {collection.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {collection.slug}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {/* Products count would be populated by API */}
                  -
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {collection.isActive ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <a
                      href={`/dashboard/collections?action=edit&id=${collection.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </a>
                    <a
                      href={`/dashboard/collections?action=products&id=${collection.id}`}
                      className="text-green-600 hover:text-green-900"
                    >
                      Products
                    </a>
                    <form action={handleDeleteCollection.bind(null, collection.id)}>
                      <button
                        type="submit"
                        className="text-red-600 hover:text-red-900"
                        onClick={(e) => {
                          if (!confirm('Are you sure you want to delete this collection?')) {
                            e.preventDefault();
                          }
                        }}
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {collections.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No collections found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}
