'use client';

import type { Order } from '@repo/types';

interface TrackingSectionProps {
  order: Order;
}

const carrierTrackingUrls: Record<string, (tn: string) => string> = {
  USPS: (tn) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${tn}`,
  FedEx: (tn) => `https://www.fedex.com/fedextrack/?trknbr=${tn}`,
  UPS: (tn) => `https://www.ups.com/track?tracknum=${tn}`,
  DHL: (tn) => `https://www.dhl.com/en/express/tracking.html?AWB=${tn}`,
};

export default function TrackingSection({ order }: TrackingSectionProps) {
  if (!order.shipping?.trackingNumber) {
    return null;
  }

  const { carrier, trackingNumber, shippedAt, estimatedDelivery } = order.shipping;
  const trackingUrl = carrier && carrierTrackingUrls[carrier];

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Tracking Information</h2>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Status</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(order.status)}`}>
            {order.status}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">Carrier</span>
          <span className="font-medium">{carrier}</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-gray-600">Tracking Number</span>
          <span className="font-mono text-sm bg-gray-100 px-3 py-2 rounded break-all">
            {trackingNumber}
          </span>
        </div>

        {trackingUrl && (
          <div className="pt-2">
            <a
              href={trackingUrl(trackingNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Track Package
            </a>
          </div>
        )}

        {shippedAt && (
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-gray-600">Shipped</span>
            <span className="font-medium">{formatDate(shippedAt)}</span>
          </div>
        )}

        {estimatedDelivery && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Estimated Delivery</span>
            <span className="font-medium">{formatDate(estimatedDelivery)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
