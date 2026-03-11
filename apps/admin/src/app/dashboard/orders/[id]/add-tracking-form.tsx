'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

interface AddTrackingFormProps {
  orderId: string;
  onSuccess: () => void;
}

export default function AddTrackingForm({ orderId, onSuccess }: AddTrackingFormProps) {
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data: { carrier: string; trackingNumber: string; estimatedDelivery?: string } = {
        carrier,
        trackingNumber,
      };

      if (estimatedDelivery) {
        data.estimatedDelivery = estimatedDelivery;
      }

      await api.orders.addTracking(orderId, data);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add tracking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-6 bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Add Tracking Information</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-200">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="carrier" className="block text-sm font-medium text-gray-700 mb-1">
            Carrier <span className="text-red-500">*</span>
          </label>
          <select
            id="carrier"
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a carrier</option>
            <option value="USPS">USPS</option>
            <option value="FedEx">FedEx</option>
            <option value="UPS">UPS</option>
            <option value="DHL">DHL</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Tracking Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="trackingNumber"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            disabled={!carrier}
            required
            placeholder={carrier ? "Enter tracking number" : "Select a carrier first"}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="estimatedDelivery" className="block text-sm font-medium text-gray-700 mb-1">
            Estimated Delivery Date
          </label>
          <input
            type="date"
            id="estimatedDelivery"
            value={estimatedDelivery}
            onChange={(e) => setEstimatedDelivery(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !carrier || !trackingNumber}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Mark as Shipped'}
        </button>
      </div>
    </form>
  );
}
