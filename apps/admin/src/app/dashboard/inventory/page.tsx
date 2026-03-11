'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface DashboardData {
  totalItems: number;
  totalWarehouses: number;
  lowStockCount: number;
  recentMovements: number;
}

interface LowStockAlert {
  id: string;
  productName: string;
  sku: string;
  warehouseName: string;
  available: number;
  threshold: number;
}

export default function InventoryDashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, alertsRes] = await Promise.all([
        api.inventory.dashboard(),
        api.inventory.alerts(),
      ]);

      if (dashboardRes.success && dashboardRes.data) {
        setDashboardData(dashboardRes.data);
      }
      if (alertsRes.success && alertsRes.data) {
        setAlerts(alertsRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">{error}</div>
    );
  }

  const stats = [
    {
      label: 'Total SKUs Tracked',
      value: dashboardData?.totalItems ?? 0,
      highlight: false,
    },
    {
      label: 'Total Warehouses',
      value: dashboardData?.totalWarehouses ?? 0,
      highlight: false,
    },
    {
      label: 'Low Stock Alerts',
      value: dashboardData?.lowStockCount ?? 0,
      highlight: (dashboardData?.lowStockCount ?? 0) > 0,
    },
    {
      label: 'Recent Movements',
      value: dashboardData?.recentMovements ?? 0,
      highlight: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inventory Dashboard</h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-lg border p-6 shadow-sm ${
              stat.highlight
                ? 'border-red-200 bg-red-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p
              className={`mt-2 text-3xl font-bold ${
                stat.highlight ? 'text-red-600' : 'text-gray-900'
              }`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Low Stock Alerts Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
          <p className="mt-1 text-sm text-gray-500">
            Items at or below their restock threshold
          </p>
        </div>

        {alerts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No low stock alerts. All items are sufficiently stocked.</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Warehouse
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Available
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Threshold
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {alerts.map((alert) => {
                  const isCritical = alert.available === 0;
                  const rowClass = isCritical
                    ? 'bg-red-50 hover:bg-red-100'
                    : 'bg-amber-50 hover:bg-amber-100';
                  return (
                    <tr key={alert.id} className={rowClass}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {alert.productName}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {alert.sku}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {alert.warehouseName}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`font-semibold ${
                            isCritical ? 'text-red-600' : 'text-amber-600'
                          }`}
                        >
                          {alert.available}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {alert.threshold}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
