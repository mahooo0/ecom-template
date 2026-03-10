// All monetary values stored as integers (cents). 1299 = $12.99.

import { faker } from '@faker-js/faker';

// Set seed for reproducible data
faker.seed(12345);

// ============================================================================
// USER FACTORIES
// ============================================================================

export interface UserInput {
  clerkId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
  avatar?: string;
  phone?: string;
  isActive?: boolean;
}

export function createUser(overrides?: UserInput) {
  return {
    clerkId: overrides?.clerkId ?? faker.string.uuid(),
    email: overrides?.email ?? faker.internet.email(),
    firstName: overrides?.firstName ?? faker.person.firstName(),
    lastName: overrides?.lastName ?? faker.person.lastName(),
    role: overrides?.role ?? 'CUSTOMER',
    avatar: overrides?.avatar ?? faker.image.avatar(),
    phone: overrides?.phone ?? faker.phone.number(),
    isActive: overrides?.isActive ?? true,
  };
}

// ============================================================================
// CATEGORY FACTORIES
// ============================================================================

export interface CategoryInput {
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  position?: number;
  metaTitle?: string;
  metaDescription?: string;
}

export function createCategory(
  depth: number,
  parentPath: string,
  parentId?: string,
  overrides?: CategoryInput
) {
  const name = overrides?.name ?? faker.commerce.department();
  const slug = overrides?.slug ?? faker.helpers.slugify(name).toLowerCase();
  const path = parentPath ? `${parentPath}.${slug}` : slug;

  return {
    name,
    slug,
    description: overrides?.description ?? faker.commerce.productDescription(),
    image: overrides?.image ?? faker.image.urlLoremFlickr({ category: 'business' }),
    path,
    depth,
    position: overrides?.position ?? faker.number.int({ min: 0, max: 100 }),
    parentId: parentId ?? null,
    metaTitle: overrides?.metaTitle ?? name,
    metaDescription: overrides?.metaDescription ?? faker.lorem.sentence(),
  };
}

// ============================================================================
// BRAND FACTORIES
// ============================================================================

export interface BrandInput {
  name?: string;
  slug?: string;
  description?: string;
  logo?: string;
  website?: string;
}

export function createBrand(overrides?: BrandInput) {
  const name = overrides?.name ?? faker.company.name();
  return {
    name,
    slug: overrides?.slug ?? faker.helpers.slugify(name).toLowerCase(),
    description: overrides?.description ?? faker.company.catchPhrase(),
    logo: overrides?.logo ?? faker.image.urlLoremFlickr({ category: 'business' }),
    website: overrides?.website ?? faker.internet.url(),
  };
}

// ============================================================================
// PRODUCT FACTORIES
// ============================================================================

export interface ProductInput {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  compareAtPrice?: number;
  images?: string[];
  sku?: string;
  productType?: 'SIMPLE' | 'VARIABLE' | 'WEIGHTED' | 'DIGITAL' | 'BUNDLED';
  attributes?: Record<string, any>;
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  isActive?: boolean;
}

export function createProduct(
  categoryId: string,
  brandId?: string,
  overrides?: ProductInput
) {
  const name = overrides?.name ?? faker.commerce.productName();
  const slug = overrides?.slug ??
    `${faker.helpers.slugify(name).toLowerCase()}-${faker.string.alphanumeric(6)}`;

  return {
    name,
    slug,
    description: overrides?.description ?? faker.commerce.productDescription(),
    price: overrides?.price ?? faker.number.int({ min: 999, max: 99999 }),
    compareAtPrice: overrides?.compareAtPrice,
    images: overrides?.images ?? [
      faker.image.urlLoremFlickr({ category: 'product' }),
      faker.image.urlLoremFlickr({ category: 'product' }),
      faker.image.urlLoremFlickr({ category: 'product' }),
    ],
    sku: overrides?.sku ?? faker.string.alphanumeric(8).toUpperCase(),
    productType: overrides?.productType ?? 'SIMPLE',
    attributes: overrides?.attributes ?? {},
    status: overrides?.status ?? 'ACTIVE',
    isActive: overrides?.isActive ?? true,
    categoryId,
    brandId: brandId ?? null,
  };
}

// ============================================================================
// PRODUCT VARIANT FACTORIES
// ============================================================================

export interface ProductVariantInput {
  sku?: string;
  price?: number;
  compareAtPrice?: number;
  stock?: number;
  isActive?: boolean;
  images?: string[];
}

export function createProductVariant(
  productId: string,
  overrides?: ProductVariantInput
) {
  return {
    productId,
    sku: overrides?.sku ?? faker.string.alphanumeric(8).toUpperCase(),
    price: overrides?.price ?? faker.number.int({ min: 999, max: 99999 }),
    compareAtPrice: overrides?.compareAtPrice,
    stock: overrides?.stock ?? faker.number.int({ min: 0, max: 100 }),
    isActive: overrides?.isActive ?? true,
    images: overrides?.images ?? [],
  };
}

// ============================================================================
// REVIEW FACTORIES
// ============================================================================

export interface ReviewInput {
  rating?: number;
  title?: string;
  body?: string;
  photos?: string[];
  isVerifiedPurchase?: boolean;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
  helpfulCount?: number;
}

export function createReview(
  userId: string,
  productId: string,
  overrides?: ReviewInput
) {
  return {
    userId,
    productId,
    rating: overrides?.rating ?? faker.number.int({ min: 1, max: 5 }),
    title: overrides?.title ?? faker.lorem.sentence(),
    body: overrides?.body ?? faker.lorem.paragraph(),
    photos: overrides?.photos ?? (faker.datatype.boolean() ? [faker.image.urlLoremFlickr({ category: 'product' })] : []),
    isVerifiedPurchase: overrides?.isVerifiedPurchase ?? faker.datatype.boolean(),
    status: overrides?.status ?? 'APPROVED',
    helpfulCount: overrides?.helpfulCount ?? faker.number.int({ min: 0, max: 50 }),
  };
}

// ============================================================================
// COUPON FACTORIES
// ============================================================================

export interface CouponInput {
  code?: string;
  description?: string;
  discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  discountValue?: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  perCustomerLimit?: number;
  startsAt?: Date;
  expiresAt?: Date;
  isActive?: boolean;
}

export function createCoupon(overrides?: CouponInput) {
  const startsAt = overrides?.startsAt ?? faker.date.past();
  const expiresAt = overrides?.expiresAt ?? faker.date.future();

  return {
    code: overrides?.code ?? faker.string.alphanumeric(8).toUpperCase(),
    description: overrides?.description ?? faker.lorem.sentence(),
    discountType: overrides?.discountType ?? faker.helpers.arrayElement(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING']),
    discountValue: overrides?.discountValue ?? faker.number.int({ min: 500, max: 5000 }),
    minOrderAmount: overrides?.minOrderAmount,
    maxDiscountAmount: overrides?.maxDiscountAmount,
    usageLimit: overrides?.usageLimit ?? faker.number.int({ min: 10, max: 1000 }),
    usageCount: 0,
    perCustomerLimit: overrides?.perCustomerLimit ?? 1,
    applicableProductIds: [],
    applicableCategoryIds: [],
    startsAt,
    expiresAt,
    isActive: overrides?.isActive ?? true,
  };
}

// ============================================================================
// ORDER DATA FACTORIES (MongoDB)
// ============================================================================

export interface OrderDataInput {
  orderNumber?: string;
  status?: string;
  guestEmail?: string;
  subtotal?: number;
  taxAmount?: number;
  shippingCost?: number;
  discountAmount?: number;
  totalAmount?: number;
  couponCode?: string;
  notes?: string;
}

export function createOrderData(
  userId: string,
  items: any[],
  overrides?: OrderDataInput
) {
  const orderNumber = overrides?.orderNumber ?? `ORD-${faker.string.alphanumeric(8).toUpperCase()}`;
  const status = overrides?.status ?? faker.helpers.arrayElement([
    'pending',
    'paid',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ]);

  const subtotal = overrides?.subtotal ?? faker.number.int({ min: 5000, max: 50000 });
  const taxAmount = overrides?.taxAmount ?? Math.floor(subtotal * 0.08);
  const shippingCost = overrides?.shippingCost ?? faker.number.int({ min: 599, max: 1999 });
  const discountAmount = overrides?.discountAmount ?? 0;
  const totalAmount = overrides?.totalAmount ?? (subtotal + taxAmount + shippingCost - discountAmount);

  return {
    orderNumber,
    userId,
    guestEmail: overrides?.guestEmail,
    items,
    status,
    statusHistory: [{
      from: 'pending',
      to: status,
      changedAt: faker.date.recent(),
      note: 'Order status initialized',
    }],
    subtotal,
    taxAmount,
    shippingCost,
    discountAmount,
    totalAmount,
    shippingAddress: {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      country: 'US',
      phone: faker.phone.number(),
    },
    billingAddress: {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      country: 'US',
      phone: faker.phone.number(),
    },
    shipping: status === 'shipped' || status === 'delivered' ? {
      method: faker.helpers.arrayElement(['Standard', 'Express', 'Overnight']),
      carrier: faker.helpers.arrayElement(['USPS', 'UPS', 'FedEx']),
      trackingNumber: faker.string.alphanumeric(12).toUpperCase(),
      estimatedDelivery: faker.date.future(),
      shippedAt: status === 'shipped' || status === 'delivered' ? faker.date.recent() : undefined,
      deliveredAt: status === 'delivered' ? faker.date.recent() : undefined,
      cost: shippingCost,
    } : undefined,
    payment: {
      provider: 'stripe',
      paymentIntentId: `pi_${faker.string.alphanumeric(24)}`,
      status: status === 'paid' || status === 'processing' || status === 'shipped' || status === 'delivered'
        ? 'succeeded'
        : 'pending',
      amount: totalAmount,
      refundedAmount: 0,
      paidAt: status !== 'pending' ? faker.date.recent() : undefined,
    },
    couponCode: overrides?.couponCode,
    notes: overrides?.notes,
  };
}

// ============================================================================
// CART DATA FACTORIES (MongoDB)
// ============================================================================

export interface CartDataInput {
  userId?: string;
  sessionId?: string;
  couponCode?: string;
  expiresAt?: Date;
}

export function createCartData(overrides?: CartDataInput) {
  const isGuest = !overrides?.userId;

  return {
    userId: overrides?.userId,
    sessionId: overrides?.sessionId ?? (isGuest ? faker.string.uuid() : undefined),
    items: [],
    couponCode: overrides?.couponCode,
    expiresAt: overrides?.expiresAt ?? (isGuest ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined),
  };
}
