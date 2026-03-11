'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface StockMovement {
  id: string;
  createdAt: string;
  productName?: string;
  sku?: string;
  warehouseName?: string;
  quantity: number;
  reason: string;
  reference?: string;
  note?: string;
}

const REASON_OPTIONS = [
  { value: '', label: 'All Reasons' },
  { value: 'SALE', label: 'Sale' },
  { value: 'RETURN', label: 'Return' },
  { value: 'MANUAL_ADJUSTMENT', label: 'Manual Adjustment' },
  { value: 'DAMAGE', label: 'Damage' },
  { value: 'RESTOCK', label: 'Restock' },
  { value: 'RESERVATION', label: 'Reservation' },
  { value: 'RESERVATION_RELEASE', label: 'Reservation Release' },
];

const REASON_BADGE_COLORS: Record<string, string> = {
  SALE: 'bg-blue-100 text-blue-800',
  RETURN: 'bg-green-100 text-green-800',
  MANUAL_ADJUSTMENT: 'bg-yellow-100 text-yellow-800',
  DAMAGE: 'bg-red-100 text-red-800',
  RESTOCK: 'bg-purple-100 text-purple-800',
  RESERVATION: 'bg-gray-100 text-gray-800',
  RESERVATION_RELEASE: 'bg-gray-100 text-gray-600',
};

export default function MovementsPage() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reasonFilter, setReasonFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const response = await api.inventory.movements.getAll({
        reason: reasonFilter || undefined,
        page,
        limit,
      });
      if (response.success && response.data) {
        setMovements(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch movements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [reasonFilter, page]);

  const handleReasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReasonFilter(e.target.value);
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Stock Movement History</h1>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Reason
          </label>
          <select
            value={reasonFilter}
            onChange={handleReasonChange}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {REASON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="text-gray-500">Loading movements...</div>
        </div>
      ) : movements.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">No stock movements found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Product / SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Warehouse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Note
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {movements.map((movement) => (
                <tr key={movement.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {formatDate(movement.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="font-medium">{movement.productName ?? '—'}</div>
                    {movement.sku && (
                      <div className="text-xs text-gray-500 font-mono">{movement.sku}</div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {movement.warehouseName ?? '—'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold">
                    <span
                      className={movement.quantity >= 0 ? 'text-green-600' : 'text-red-600'}
                    >
                      {movement.quantity >= 0 ? '+' : ''}{movement.quantity}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-5 ${
                        REASON_BADGE_COLORS[movement.reason] ?? 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {movement.reason.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {movement.reference ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {movement.note ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page} &bull; Showing {movements.length} movements
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={movements.length < limit}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
