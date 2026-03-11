import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import type { Brand } from '@repo/types';
import BrandForm from './brand-form';

interface PageProps {
  searchParams: Promise<{
    action?: string;
    id?: string;
  }>;
}

export default async function BrandsPage(props: PageProps) {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    redirect('/sign-in');
  }

  const searchParams = await props.searchParams;
  const action = searchParams.action;
  const id = searchParams.id;

  // Fetch brands
  const brandsResponse = await api.brands.getAll({ token });
  const brands = brandsResponse.data || [];

  // Fetch brand details if editing
  let selectedBrand: Brand | null = null;
  if (id && action === 'edit') {
    try {
      const response = await api.brands.getById(id, token);
      selectedBrand = response.data || null;
    } catch (error) {
      console.error('Failed to fetch brand:', error);
    }
  }

  const handleDeleteBrand = async (brandId: string) => {
    'use server';
    const { getToken } = await auth();
    const token = await getToken();
    if (!token) return;
    await api.brands.delete(brandId, token);
    redirect('/dashboard/brands');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Brands</h1>
        <a
          href="/dashboard/brands?action=create"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Brand
        </a>
      </div>

      {/* Show form for create/edit */}
      {(action === 'create' || action === 'edit') && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            {action === 'create' ? 'Create Brand' : 'Edit Brand'}
          </h2>
          <BrandForm
            brand={selectedBrand || undefined}
            onSuccess={() => {
              redirect('/dashboard/brands');
            }}
          />
        </div>
      )}

      {/* Brands table */}
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
                Logo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Website
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {brands.map((brand: Brand) => (
              <tr key={brand.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {brand.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {brand.slug}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="h-8 w-8 object-contain"
                    />
                  ) : (
                    <span className="text-gray-400">No logo</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {brand.website ? (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Visit
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {/* Products count would be populated by API */}
                  -
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <a
                      href={`/dashboard/brands?action=edit&id=${brand.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </a>
                    <form action={handleDeleteBrand.bind(null, brand.id)}>
                      <button
                        type="submit"
                        className="text-red-600 hover:text-red-900"
                        onClick={(e) => {
                          if (!confirm('Are you sure you want to delete this brand?')) {
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
        {brands.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No brands found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}
