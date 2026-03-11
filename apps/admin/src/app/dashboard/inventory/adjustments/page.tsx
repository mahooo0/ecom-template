'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Warehouse {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

const ADJUSTMENT_REASONS = [
  { value: 'MANUAL_ADJUSTMENT', label: 'Manual Adjustment' },
  { value: 'DAMAGE', label: 'Damage' },
  { value: 'RESTOCK', label: 'Restock' },
  { value: 'RETURN', label: 'Return' },
];

export default function AdjustmentsPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [formData, setFormData] = useState({
    variantId: '',
    warehouseId: '',
    quantity: '',
    reason: 'MANUAL_ADJUSTMENT',
    note: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingWarehouses, setLoadingWarehouses] = useState(true);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await api.inventory.warehouses.getAll();
        if (response.success && response.data) {
          setWarehouses(response.data.filter((w: Warehouse) => w.isActive));
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to load warehouses');
      } finally {
        setLoadingWarehouses(false);
      }
    };
    fetchWarehouses();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!formData.variantId.trim()) {
      setErrorMessage('Variant ID is required');
      return;
    }
    if (!formData.warehouseId) {
      setErrorMessage('Warehouse is required');
      return;
    }
    if (!formData.quantity || isNaN(Number(formData.quantity))) {
      setErrorMessage('A valid quantity is required');
      return;
    }

    try {
      setSubmitting(true);
      await api.inventory.stock.adjust({
        variantId: formData.variantId.trim(),
        warehouseId: formData.warehouseId,
        quantity: Number(formData.quantity),
        reason: formData.reason,
        note: formData.note.trim() || undefined,
      });
      setSuccessMessage('Stock adjusted successfully.');
      setFormData({
        variantId: '',
        warehouseId: '',
        quantity: '',
        reason: 'MANUAL_ADJUSTMENT',
        note: '',
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to adjust stock');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manual Stock Adjustment</h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-800">
          Positive quantity adds stock, negative removes stock (e.g., -5 removes 5 units).
        </div>

        {successMessage && (
          <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-800">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-800">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Variant ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="variantId"
              value={formData.variantId}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter variant ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Warehouse <span className="text-red-500">*</span>
            </label>
            {loadingWarehouses ? (
              <p className="mt-1 text-sm text-gray-500">Loading warehouses...</p>
            ) : (
              <select
                name="warehouseId"
                value={formData.warehouseId}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select a warehouse</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name} ({warehouse.code})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., 10 or -5"
            />
            <p className="mt-1 text-xs text-gray-500">
              Use a positive number to add stock, negative to remove.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Reason <span className="text-red-500">*</span>
            </label>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {ADJUSTMENT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Note (optional)
            </label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Optional note about this adjustment"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || loadingWarehouses}
              className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Adjusting...' : 'Apply Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
