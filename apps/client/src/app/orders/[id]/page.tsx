'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Order } from '@repo/types';
import TrackingSection from './tracking-section';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.orders.getById(orderId);
        if (response.success && response.data) {
          setOrder(response.data);
        } else {
          setError('Failed to load order');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      RETURNED: 'bg-orange-100 text-orange-800',
      REFUND_REQUESTED: 'bg-pink-100 text-pink-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
          {error || 'Order not found'}
        </div>
        <Link href="/orders" className="text-blue-600 hover:underline">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/orders" className="text-blue-600 hover:underline">
          ← Back to Orders
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
            <p className="text-gray-600">{formatDate(order.createdAt)}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(order.status)}`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
          <div className="text-gray-700">
            <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
            <p>{order.shippingAddress.country}</p>
            {order.shippingAddress.phone && <p className="mt-2">Phone: {order.shippingAddress.phone}</p>}
          </div>
        </div>

        <TrackingSection order={order} />
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Items</h2>
        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-start pb-4 border-b last:border-b-0">
              <div className="flex items-start gap-4">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                )}
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                  {item.attributes && Object.keys(item.attributes).length > 0 && (
                    <p className="text-sm text-gray-600">
                      {Object.entries(item.attributes).map(([key, value]) => `${key}: ${value}`).join(', ')}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                <p className="text-sm text-gray-600">{formatCurrency(item.price)} each</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Shipping</span>
            <span>{formatCurrency(order.shippingCost)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Tax</span>
            <span>{formatCurrency(order.taxAmount)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
              <span>-{formatCurrency(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
            <span>Total</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {order.statusHistory && order.statusHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Order History</h2>
          <div className="space-y-3">
            {order.statusHistory.map((history, index) => (
              <div key={index} className="flex items-start gap-4 pb-3 border-b last:border-b-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(history.to)}`}>
                      {history.to}
                    </span>
                    {history.from && (
                      <>
                        <span className="text-gray-400">from</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(history.from)}`}>
                          {history.from}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{formatDate(history.changedAt)}</p>
                  {history.note && <p className="text-sm text-gray-700 mt-1">{history.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
