'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

interface CreateZoneFormProps {
  onSuccess: () => void;
}

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'AU', name: 'Australia' },
  { code: 'JP', name: 'Japan' },
  { code: 'BR', name: 'Brazil' },
  { code: 'IN', name: 'India' },
  { code: 'MX', name: 'Mexico' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'PL', name: 'Poland' },
  { code: 'AT', name: 'Austria' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'BE', name: 'Belgium' },
  { code: 'IE', name: 'Ireland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'NZ', name: 'New Zealand' },
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

const CA_PROVINCES = [
  'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT',
];

export function CreateZoneForm({ onSuccess }: CreateZoneFormProps) {
  const [name, setName] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const showStateSelection = selectedCountries.includes('US') || selectedCountries.includes('CA');

  const handleCountryToggle = (countryCode: string) => {
    setSelectedCountries((prev) =>
      prev.includes(countryCode)
        ? prev.filter((c) => c !== countryCode)
        : [...prev, countryCode]
    );
  };

  const handleStateToggle = (stateCode: string) => {
    setSelectedStates((prev) =>
      prev.includes(stateCode)
        ? prev.filter((s) => s !== stateCode)
        : [...prev, stateCode]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Zone name is required');
      return;
    }

    if (selectedCountries.length === 0) {
      setError('Select at least one country');
      return;
    }

    try {
      setLoading(true);

      const data: any = {
        name: name.trim(),
        countries: selectedCountries,
        states: selectedStates,
        isActive,
      };

      if (freeShippingThreshold) {
        const threshold = parseFloat(freeShippingThreshold);
        if (isNaN(threshold) || threshold < 0) {
          setError('Free shipping threshold must be a valid positive number');
          return;
        }
        data.freeShippingThreshold = Math.round(threshold * 100);
      }

      const response = await api.shipping.zones.create(data);
      if (response.success) {
        setName('');
        setSelectedCountries([]);
        setSelectedStates([]);
        setFreeShippingThreshold('');
        setIsActive(true);
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create zone');
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
          Zone Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder="e.g., North America, Europe, Domestic"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Countries <span className="text-red-500">*</span>
        </label>
        <div className="mt-2 grid max-h-60 grid-cols-2 gap-2 overflow-y-auto rounded-md border border-gray-300 p-3">
          {COUNTRIES.map((country) => (
            <label key={country.code} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedCountries.includes(country.code)}
                onChange={() => handleCountryToggle(country.code)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                {country.name} ({country.code})
              </span>
            </label>
          ))}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Select one or more countries for this zone
        </p>
      </div>

      {showStateSelection && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            States/Provinces (Optional)
          </label>
          <div className="mt-2 grid max-h-48 grid-cols-3 gap-2 overflow-y-auto rounded-md border border-gray-300 p-3">
            {selectedCountries.includes('US') && (
              <>
                <div className="col-span-3 mb-1 text-xs font-semibold text-gray-600">
                  US States
                </div>
                {US_STATES.map((state) => (
                  <label key={state} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedStates.includes(state)}
                      onChange={() => handleStateToggle(state)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{state}</span>
                  </label>
                ))}
              </>
            )}
            {selectedCountries.includes('CA') && (
              <>
                <div className="col-span-3 mb-1 mt-2 text-xs font-semibold text-gray-600">
                  Canadian Provinces
                </div>
                {CA_PROVINCES.map((province) => (
                  <label key={province} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedStates.includes(province)}
                      onChange={() => handleStateToggle(province)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{province}</span>
                  </label>
                ))}
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Leave empty to apply to all states/provinces in selected countries
          </p>
        </div>
      )}

      <div>
        <label htmlFor="threshold" className="block text-sm font-medium text-gray-700">
          Free Shipping Threshold
        </label>
        <div className="relative mt-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-500">$</span>
          </div>
          <input
            type="number"
            id="threshold"
            value={freeShippingThreshold}
            onChange={(e) => setFreeShippingThreshold(e.target.value)}
            step="0.01"
            min="0"
            className="block w-full rounded-md border border-gray-300 py-2 pl-7 pr-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Orders above this amount get free shipping. Leave empty for no free shipping.
        </p>
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
          {loading ? 'Creating...' : 'Create Zone'}
        </button>
      </div>
    </form>
  );
}
