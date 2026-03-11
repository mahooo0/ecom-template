'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { ShippingRateType } from '@repo/types';

interface CreateMethodFormProps {
  zoneId: string;
  onSuccess: () => void;
}

interface PriceTier {
  minAmount: string;
  shippingCost: string;
}

export function CreateMethodForm({ zoneId, onSuccess }: CreateMethodFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rateType, setRateType] = useState<keyof typeof ShippingRateType>('FLAT_RATE');
  const [flatRate, setFlatRate] = useState('');
  const [weightRate, setWeightRate] = useState('');
  const [minWeight, setMinWeight] = useState('');
  const [maxWeight, setMaxWeight] = useState('');
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>([{ minAmount: '', shippingCost: '' }]);
  const [estimatedDaysMin, setEstimatedDaysMin] = useState('');
  const [estimatedDaysMax, setEstimatedDaysMax] = useState('');
  const [position, setPosition] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddTier = () => {
    setPriceTiers([...priceTiers, { minAmount: '', shippingCost: '' }]);
  };

  const handleRemoveTier = (index: number) => {
    setPriceTiers(priceTiers.filter((_, i) => i !== index));
  };

  const handleTierChange = (index: number, field: keyof PriceTier, value: string) => {
    const newTiers = [...priceTiers];
    if (newTiers[index]) {
      newTiers[index][field] = value;
      setPriceTiers(newTiers);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Method name is required');
      return;
    }

    try {
      setLoading(true);

      const data: any = {
        name: name.trim(),
        description: description.trim() || undefined,
        rateType,
        estimatedDaysMin: estimatedDaysMin ? parseInt(estimatedDaysMin) : undefined,
        estimatedDaysMax: estimatedDaysMax ? parseInt(estimatedDaysMax) : undefined,
        position: parseInt(position),
        isActive,
      };

      // Validate and convert rate type specific fields
      if (rateType === 'FLAT_RATE') {
        if (!flatRate) {
          setError('Flat rate is required for flat rate shipping');
          return;
        }
        const rate = parseFloat(flatRate);
        if (isNaN(rate) || rate < 0) {
          setError('Flat rate must be a valid positive number');
          return;
        }
        data.flatRate = Math.round(rate * 100);
      } else if (rateType === 'WEIGHT_BASED') {
        if (!weightRate) {
          setError('Weight rate is required for weight-based shipping');
          return;
        }
        const rate = parseFloat(weightRate);
        if (isNaN(rate) || rate < 0) {
          setError('Weight rate must be a valid positive number');
          return;
        }
        data.weightRate = Math.round(rate * 100);

        if (minWeight) {
          const min = parseFloat(minWeight);
          if (isNaN(min) || min < 0) {
            setError('Minimum weight must be a valid positive number');
            return;
          }
          data.minWeight = min;
        }

        if (maxWeight) {
          const max = parseFloat(maxWeight);
          if (isNaN(max) || max < 0) {
            setError('Maximum weight must be a valid positive number');
            return;
          }
          data.maxWeight = max;
        }
      } else if (rateType === 'PRICE_BASED') {
        if (priceTiers.length === 0 || !priceTiers[0]?.minAmount || !priceTiers[0]?.shippingCost) {
          setError('At least one price tier is required for price-based shipping');
          return;
        }

        const tiers = priceTiers.map((tier, index) => {
          const minAmount = parseFloat(tier.minAmount);
          const shippingCost = parseFloat(tier.shippingCost);

          if (isNaN(minAmount) || minAmount < 0) {
            throw new Error(`Tier ${index + 1}: Minimum amount must be a valid positive number`);
          }
          if (isNaN(shippingCost) || shippingCost < 0) {
            throw new Error(`Tier ${index + 1}: Shipping cost must be a valid positive number`);
          }

          return {
            minAmount: Math.round(minAmount * 100),
            shippingCost: Math.round(shippingCost * 100),
          };
        });

        // Sort tiers by minAmount ascending
        tiers.sort((a, b) => a.minAmount - b.minAmount);
        data.priceThresholds = tiers;
      }

      const response = await api.shipping.methods.create(zoneId, data);
      if (response.success) {
        // Reset form
        setName('');
        setDescription('');
        setRateType('FLAT_RATE');
        setFlatRate('');
        setWeightRate('');
        setMinWeight('');
        setMaxWeight('');
        setPriceTiers([{ minAmount: '', shippingCost: '' }]);
        setEstimatedDaysMin('');
        setEstimatedDaysMax('');
        setPosition('0');
        setIsActive(true);
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create method');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Method Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder="e.g., Standard Shipping, Express, Economy"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          maxLength={500}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder="Optional description of this shipping method"
        />
        <p className="mt-1 text-xs text-gray-500">{description.length}/500 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Rate Type <span className="text-red-500">*</span>
        </label>
        <div className="mt-2 space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              value="FLAT_RATE"
              checked={rateType === 'FLAT_RATE'}
              onChange={(e) => setRateType(e.target.value as keyof typeof ShippingRateType)}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Flat Rate</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="WEIGHT_BASED"
              checked={rateType === 'WEIGHT_BASED'}
              onChange={(e) => setRateType(e.target.value as keyof typeof ShippingRateType)}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Weight-Based</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="PRICE_BASED"
              checked={rateType === 'PRICE_BASED'}
              onChange={(e) => setRateType(e.target.value as keyof typeof ShippingRateType)}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Price-Based</span>
          </label>
        </div>
      </div>

      {/* Rate Type Specific Fields */}
      {rateType === 'FLAT_RATE' && (
        <div>
          <label htmlFor="flatRate" className="block text-sm font-medium text-gray-700">
            Flat Rate <span className="text-red-500">*</span>
          </label>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500">$</span>
            </div>
            <input
              type="number"
              id="flatRate"
              value={flatRate}
              onChange={(e) => setFlatRate(e.target.value)}
              step="0.01"
              min="0"
              className="block w-full rounded-md border border-gray-300 py-2 pl-7 pr-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>
      )}

      {rateType === 'WEIGHT_BASED' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="weightRate" className="block text-sm font-medium text-gray-700">
              Weight Rate (per kg) <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="number"
                id="weightRate"
                value={weightRate}
                onChange={(e) => setWeightRate(e.target.value)}
                step="0.01"
                min="0"
                className="block w-full rounded-md border border-gray-300 py-2 pl-7 pr-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="minWeight" className="block text-sm font-medium text-gray-700">
                Min Weight (kg)
              </label>
              <input
                type="number"
                id="minWeight"
                value={minWeight}
                onChange={(e) => setMinWeight(e.target.value)}
                step="0.01"
                min="0"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="Optional"
              />
            </div>

            <div>
              <label htmlFor="maxWeight" className="block text-sm font-medium text-gray-700">
                Max Weight (kg)
              </label>
              <input
                type="number"
                id="maxWeight"
                value={maxWeight}
                onChange={(e) => setMaxWeight(e.target.value)}
                step="0.01"
                min="0"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="Optional"
              />
            </div>
          </div>
        </div>
      )}

      {rateType === 'PRICE_BASED' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price Tiers <span className="text-red-500">*</span>
          </label>
          <div className="mt-2 space-y-2">
            {priceTiers.map((tier, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="number"
                      value={tier.minAmount}
                      onChange={(e) => handleTierChange(index, 'minAmount', e.target.value)}
                      step="0.01"
                      min="0"
                      className="block w-full rounded-md border border-gray-300 py-2 pl-7 pr-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      placeholder="Cart minimum"
                    />
                  </div>
                </div>
                <span className="text-gray-500">→</span>
                <div className="flex-1">
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="number"
                      value={tier.shippingCost}
                      onChange={(e) => handleTierChange(index, 'shippingCost', e.target.value)}
                      step="0.01"
                      min="0"
                      className="block w-full rounded-md border border-gray-300 py-2 pl-7 pr-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      placeholder="Shipping cost"
                    />
                  </div>
                </div>
                {priceTiers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTier(index)}
                    className="rounded-md border border-red-300 px-2 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddTier}
            className="mt-2 text-sm text-blue-600 hover:text-blue-900"
          >
            + Add Tier
          </button>
          <p className="mt-1 text-xs text-gray-500">
            Set shipping cost based on cart total. Lower thresholds will be matched first.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="estimatedDaysMin" className="block text-sm font-medium text-gray-700">
            Estimated Days (Min)
          </label>
          <input
            type="number"
            id="estimatedDaysMin"
            value={estimatedDaysMin}
            onChange={(e) => setEstimatedDaysMin(e.target.value)}
            min="0"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="Optional"
          />
        </div>

        <div>
          <label htmlFor="estimatedDaysMax" className="block text-sm font-medium text-gray-700">
            Estimated Days (Max)
          </label>
          <input
            type="number"
            id="estimatedDaysMax"
            value={estimatedDaysMax}
            onChange={(e) => setEstimatedDaysMax(e.target.value)}
            min="0"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="Optional"
          />
        </div>
      </div>

      <div>
        <label htmlFor="position" className="block text-sm font-medium text-gray-700">
          Position
        </label>
        <input
          type="number"
          id="position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          min="0"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">Display order (lower numbers appear first)</p>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
          Active
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Method'}
        </button>
      </div>
    </form>
  );
}
