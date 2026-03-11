'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  InstantSearch,
  SearchBox,
  Hits,
  useInstantSearch,
} from 'react-instantsearch';
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';

const searchClient = instantMeiliSearch(
  process.env.NEXT_PUBLIC_MEILISEARCH_HOST || 'http://localhost:7700',
  process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY || ''
);

interface ProductHit {
  id: string;
  name: string;
  price: number;
  images: string[];
  objectID: string;
}

function ProductHit({ hit }: { hit: ProductHit }) {
  const formattedPrice = `$${(hit.price / 100).toFixed(2)}`;

  return (
    <Link
      href={`/products/${hit.id}`}
      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded"
    >
      {hit.images && hit.images.length > 0 ? (
        <img
          src={hit.images[0]}
          alt={hit.name}
          className="w-12 h-12 object-cover rounded"
        />
      ) : (
        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
          No image
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{hit.name}</p>
        <p className="text-sm text-gray-600">{formattedPrice}</p>
      </div>
    </Link>
  );
}

function SearchDropdown({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { results, indexUiState } = useInstantSearch();
  const query = indexUiState.query || '';

  if (!isOpen || !query) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      <Hits hitComponent={ProductHit} />
      {results && results.nbHits > 0 && (
        <div className="border-t border-gray-200 p-2">
          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            className="block text-center text-sm text-blue-600 hover:text-blue-800"
            onClick={onClose}
          >
            View all {results.nbHits} results
          </Link>
        </div>
      )}
    </div>
  );
}

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName="products"
      future={{ preserveSharedStateOnUnmount: true }}
    >
      <div ref={containerRef} className="relative">
        <SearchBox
          placeholder="Search products..."
          classNames={{
            root: 'relative',
            form: 'relative',
            input:
              'w-64 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none',
            submit: 'hidden',
            reset: 'absolute right-2 top-1/2 -translate-y-1/2',
            submitIcon: 'hidden',
            resetIcon: 'w-4 h-4 text-gray-400',
            loadingIcon: 'hidden',
          }}
          onChangeCapture={() => setIsOpen(true)}
        />
        <SearchDropdown isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </div>
    </InstantSearch>
  );
}
