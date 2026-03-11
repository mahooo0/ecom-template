'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Order } from '@repo/types';
import AddTrackingForm from './add-tracking-form';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleTrackingSuccess = () => {
    fetchOrder();
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error || 'Order not found'}
        </div>
        <Link href="/dashboard/orders" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const canAddTracking = (order.status === 'PAID' || order.status === 'PROCESSING') && !order.shipping?.trackingNumber;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/orders" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Orders
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
            <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
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

        {order.shipping?.trackingNumber && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Tracking Information</h2>
            <div className="space-y-2 text-gray-700">
              <div>
                <span className="font-medium">Carrier:</span> {order.shipping.carrier}
              </div>
              <div>
                <span className="font-medium">Tracking Number:</span>{' '}
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">{order.shipping.trackingNumber}</span>
              </div>
              {order.shipping.shippedAt && (
                <div>
                  <span className="font-medium">Shipped:</span> {formatDate(order.shipping.shippedAt)}
                </div>
              )}
              {order.shipping.estimatedDelivery && (
                <div>
                  <span className="font-medium">Estimated Delivery:</span> {formatDate(order.shipping.estimatedDelivery)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Items</h2>
        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center pb-4 border-b last:border-b-0">
              <div className="flex items-center gap-4">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
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
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
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

      {canAddTracking && (
        <div className="mb-6">
          <AddTrackingForm orderId={orderId} onSuccess={handleTrackingSuccess} />
        </div>
      )}
    </div>
  );
}
