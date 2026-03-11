'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CreateZoneForm } from './create-zone-form';
import type { ShippingZone } from '@repo/types';

export default function ShippingZonesPage() {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const response = await api.shipping.zones.getAll();
      if (response.success && response.data) {
        setZones(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch zones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete zone "${name}"?`)) {
      return;
    }

    try {
      await api.shipping.zones.delete(id);
      await fetchZones();
    } catch (err: any) {
      alert(err.message || 'Failed to delete zone');
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    fetchZones();
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-gray-500">Loading zones...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Shipping Zones</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {showCreateForm ? 'Cancel' : 'Create Zone'}
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      {showCreateForm && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Create New Zone</h2>
          <CreateZoneForm onSuccess={handleCreateSuccess} />
        </div>
      )}

      {zones.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">
            No shipping zones configured. Create one to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Zone Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Countries
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  States
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Free Shipping
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {zones.map((zone) => (
                <tr key={zone.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {zone.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {zone.countries.join(', ')}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {zone.states.length > 0 ? `${zone.states.length} states` : 'All'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {zone.freeShippingThreshold
                      ? `$${(zone.freeShippingThreshold / 100).toFixed(2)}`
                      : 'None'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-5 ${
                        zone.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {zone.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <Link
                      href={`/dashboard/shipping/zones/${zone.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(zone.id, zone.name)}
                      className="ml-4 text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
