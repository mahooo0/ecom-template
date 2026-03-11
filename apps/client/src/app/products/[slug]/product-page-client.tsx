'use client';

import { useState, useCallback } from 'react';
import ProductImageGallery from '@/components/product/product-image-gallery';
import { VariantSelector } from '@/components/product/variant-selector';
import { StockStatus } from '@/components/product/stock-status';
import { AddToCartButton } from '@/components/product/add-to-cart-button';
import { WeightedQuantitySelector } from '@/components/product/weighted-quantity-selector';
import { StarRating } from '@/components/ui/star-rating';
import { formatPrice } from '@/lib/utils';
import type { ProductDetail, ProductVariantDetail } from '@/types/product-detail';

interface ProductPageClientProps {
  product: ProductDetail;
}

export function ProductPageClient({ product }: ProductPageClientProps) {
  const isVariable = product.productType === 'VARIABLE';
  const isWeighted = product.productType === 'WEIGHTED';

  const firstVariant: ProductVariantDetail | null =
    isVariable && product.variants.length > 0 ? (product.variants[0] ?? null) : null;

  const [selectedVariant, setSelectedVariant] = useState<ProductVariantDetail | null>(firstVariant);
  const [weightTotal, setWeightTotal] = useState<number>(
    product.weightedMeta?.minWeight ?? 0.1,
  );
  const [weightedPrice, setWeightedPrice] = useState<number>(product.price);

  // Derived values
  const variantImages =
    selectedVariant && (selectedVariant as { images?: string[] }).images?.length
      ? (selectedVariant as { images?: string[] }).images!
      : [];
  const currentImages = variantImages.length > 0 ? variantImages : product.images;
  const currentPrice = isWeighted
    ? weightedPrice
    : selectedVariant?.price ?? product.price;
  const currentStock =
    selectedVariant?.stock ??
    (product.variants.length > 0 ? (product.variants[0]?.stock ?? 0) : 0);
  const currentSku = selectedVariant?.sku ?? product.sku ?? '';
  const currentVariantId = selectedVariant?.id;

  const handleVariantChange = useCallback((variant: ProductVariantDetail | null) => {
    setSelectedVariant(variant);
  }, []);

  const handleWeightChange = useCallback((weight: number) => {
    setWeightTotal(weight);
  }, []);

  const handleWeightedPriceChange = useCallback((totalCents: number) => {
    setWeightedPrice(totalCents);
  }, []);

  const isOnSale =
    product.compareAtPrice != null && product.compareAtPrice > currentPrice;

  const categoryName =
    (product.category as { name?: string })?.name ?? null;

  const averageRating = (product as { averageRating?: number }).averageRating ?? 0;
  const reviewCount = (product as { reviewCount?: number }).reviewCount ?? 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left column: image gallery */}
      <div>
        <ProductImageGallery images={currentImages} productName={product.name} />
      </div>

      {/* Right column: product info + purchase area */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumb */}
        {categoryName && (
          <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
            <span>Products</span>
            <span className="mx-1">/</span>
            <span>{categoryName}</span>
          </nav>
        )}

        {/* Product name */}
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{product.name}</h1>

        {/* Brand */}
        {product.brand && (
          <p className="text-sm text-gray-500">
            by{' '}
            <span className="font-medium text-gray-700">
              {(product.brand as { name: string }).name}
            </span>
          </p>
        )}

        {/* Rating */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={averageRating} size="sm" />
            <span className="text-sm text-gray-500">
              ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold text-gray-900">
            {formatPrice(currentPrice)}
          </span>
          {isOnSale && product.compareAtPrice != null && (
            <>
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
              <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">
                Sale
              </span>
            </>
          )}
        </div>

        {/* Variant selector (VARIABLE type) */}
        {isVariable && product.variants.length > 0 && (
          <VariantSelector
            variants={product.variants}
            onVariantChange={handleVariantChange}
          />
        )}

        {/* Weighted quantity selector (WEIGHTED type) */}
        {isWeighted && product.weightedMeta && (
          <WeightedQuantitySelector
            pricePerUnit={product.weightedMeta.pricePerUnit}
            unit={product.weightedMeta.unit}
            minWeight={product.weightedMeta.minWeight ?? undefined}
            maxWeight={product.weightedMeta.maxWeight ?? undefined}
            onWeightChange={handleWeightChange}
            onPriceChange={handleWeightedPriceChange}
          />
        )}

        {/* Stock status */}
        <StockStatus stock={currentStock} />

        {/* Add to cart */}
        <AddToCartButton
          productId={product.id}
          variantId={currentVariantId}
          productName={product.name}
          price={currentPrice}
          imageUrl={currentImages[0] ?? ''}
          sku={currentSku}
          stock={currentStock}
          productType={product.productType}
          weight={isWeighted ? weightTotal : undefined}
        />

        {/* SKU */}
        {currentSku && (
          <p className="text-xs text-gray-400">SKU: {currentSku}</p>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {product.tags.map((tagEntry) => (
              <span
                key={tagEntry.tagId}
                className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
              >
                {tagEntry.tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
