'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CreateMethodForm } from './create-method-form';
import type { ShippingZone, ShippingMethod } from '@repo/types';

export default function ZoneDetailPage() {
  const params = useParams();
  const router = useRouter();
  const zoneId = params.id as string;

  const [zone, setZone] = useState<(ShippingZone & { methods: ShippingMethod[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMethodForm, setShowMethodForm] = useState(false);
  const [editingZone, setEditingZone] = useState(false);
  const [zoneName, setZoneName] = useState('');
  const [zoneThreshold, setZoneThreshold] = useState('');
  const [zoneActive, setZoneActive] = useState(true);

  const fetchZone = async () => {
    try {
      setLoading(true);
      const response = await api.shipping.zones.getById(zoneId);
      if (response.success && response.data) {
        setZone(response.data);
        setZoneName(response.data.name);
        setZoneThreshold(
          response.data.freeShippingThreshold
            ? (response.data.freeShippingThreshold / 100).toFixed(2)
            : ''
        );
        setZoneActive(response.data.isActive);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch zone');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZone();
  }, [zoneId]);

  const handleUpdateZone = async () => {
    if (!zone) return;

    try {
      const data: any = {
        name: zoneName.trim(),
        isActive: zoneActive,
      };

      if (zoneThreshold) {
        const threshold = parseFloat(zoneThreshold);
        if (isNaN(threshold) || threshold < 0) {
          alert('Free shipping threshold must be a valid positive number');
          return;
        }
        data.freeShippingThreshold = Math.round(threshold * 100);
      } else {
        data.freeShippingThreshold = null;
      }

      await api.shipping.zones.update(zoneId, data);
      await fetchZone();
      setEditingZone(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update zone');
    }
  };

  const handleDeleteMethod = async (methodId: string, methodName: string) => {
    if (!window.confirm(`Are you sure you want to delete method "${methodName}"?`)) {
      return;
    }

    try {
      await api.shipping.methods.delete(methodId);
      await fetchZone();
    } catch (err: any) {
      alert(err.message || 'Failed to delete method');
    }
  };

  const handleMethodSuccess = () => {
    setShowMethodForm(false);
    fetchZone();
  };

  const getRateTypeBadgeColor = (rateType: string) => {
    switch (rateType) {
      case 'FLAT_RATE':
        return 'bg-blue-100 text-blue-800';
      case 'WEIGHT_BASED':
        return 'bg-green-100 text-green-800';
      case 'PRICE_BASED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRateDetails = (method: ShippingMethod) => {
    switch (method.rateType) {
      case 'FLAT_RATE':
        return method.flatRate ? `$${(method.flatRate / 100).toFixed(2)}` : 'N/A';
      case 'WEIGHT_BASED':
        const rate = method.weightRate ? `$${(method.weightRate / 100).toFixed(2)}/kg` : 'N/A';
        const limits = [];
        if (method.minWeight) limits.push(`min ${method.minWeight}kg`);
        if (method.maxWeight) limits.push(`max ${method.maxWeight}kg`);
        return limits.length > 0 ? `${rate} (${limits.join(', ')})` : rate;
      case 'PRICE_BASED':
        if (!method.priceThresholds) return 'No tiers';
        const thresholds = Array.isArray(method.priceThresholds)
          ? method.priceThresholds
          : Object.values(method.priceThresholds);
        return `${thresholds.length} tiers`;
      default:
        return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-gray-500">Loading zone...</div>
      </div>
    );
  }

  if (error || !zone) {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
          {error || 'Zone not found'}
        </div>
        <Link
          href="/dashboard/shipping/zones"
          className="inline-block text-blue-600 hover:text-blue-900"
        >
          &larr; Back to zones
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/shipping/zones"
            className="text-blue-600 hover:text-blue-900"
          >
            &larr; Back
          </Link>
          <h1 className="text-3xl font-bold">Zone: {zone.name}</h1>
        </div>
      </div>

      {/* Zone Info Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Zone Information</h2>
          {!editingZone ? (
            <button
              onClick={() => setEditingZone(true)}
              className="text-sm text-blue-600 hover:text-blue-900"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleUpdateZone}
                className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingZone(false);
                  setZoneName(zone.name);
                  setZoneThreshold(
                    zone.freeShippingThreshold
                      ? (zone.freeShippingThreshold / 100).toFixed(2)
                      : ''
                  );
                  setZoneActive(zone.isActive);
                }}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Zone Name</label>
            {editingZone ? (
              <input
                type="text"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            ) : (
              <p className="mt-1 text-gray-900">{zone.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Countries</label>
            <p className="mt-1 text-gray-900">{zone.countries.join(', ')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">States/Provinces</label>
            <p className="mt-1 text-gray-900">
              {zone.states.length > 0 ? zone.states.join(', ') : 'All'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Free Shipping Threshold
            </label>
            {editingZone ? (
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  value={zoneThreshold}
                  onChange={(e) => setZoneThreshold(e.target.value)}
                  step="0.01"
                  min="0"
                  className="block w-full rounded-md border border-gray-300 py-2 pl-7 pr-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            ) : (
              <p className="mt-1 text-gray-900">
                {zone.freeShippingThreshold
                  ? `$${(zone.freeShippingThreshold / 100).toFixed(2)}`
                  : 'None'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            {editingZone ? (
              <div className="mt-1 flex items-center">
                <input
                  type="checkbox"
                  checked={zoneActive}
                  onChange={(e) => setZoneActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </div>
            ) : (
              <span
                className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-5 ${
                  zone.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {zone.isActive ? 'Active' : 'Inactive'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Shipping Methods */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Shipping Methods</h2>
          <button
            onClick={() => setShowMethodForm(!showMethodForm)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {showMethodForm ? 'Cancel' : 'Add Method'}
          </button>
        </div>

        {showMethodForm && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold">Create New Method</h3>
            <CreateMethodForm zoneId={zoneId} onSuccess={handleMethodSuccess} />
          </div>
        )}

        {zone.methods.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-500">
              No shipping methods configured. Add one to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Rate Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Rate Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Delivery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Position
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
                {zone.methods
                  .sort((a, b) => a.position - b.position)
                  .map((method) => (
                    <tr key={method.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{method.name}</div>
                        {method.description && (
                          <div className="text-sm text-gray-500">{method.description}</div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-5 ${getRateTypeBadgeColor(method.rateType)}`}
                        >
                          {method.rateType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {formatRateDetails(method)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {method.estimatedDaysMin && method.estimatedDaysMax
                          ? `${method.estimatedDaysMin}-${method.estimatedDaysMax} days`
                          : 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {method.position}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-5 ${
                            method.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {method.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteMethod(method.id, method.name)}
                          className="text-red-600 hover:text-red-900"
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
    </div>
  );
}
