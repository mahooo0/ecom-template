import { prisma } from '@repo/db';
import { eventBus } from '../../common/events/event-bus.js';
import { AppError } from '../../common/middleware/error-handler.js';
import { generateUniqueSlug } from '../../utils/slug.utils.js';
import type { ProductFormData, ProductUpdateData } from '@repo/types/product-schemas';
import type { ProductStatus } from '@repo/types';

interface GetAllOptions {
  page?: number;
  limit?: number;
  status?: ProductStatus;
  productType?: string;
  search?: string;
  sortBy?: 'createdAt' | 'name' | 'price' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export class ProductService {
  async getAll(options: GetAllOptions = {}) {
    const {
      page = 1,
      limit = 20,
      status,
      productType,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (productType) where.productType = productType;
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive' as const,
      };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        where,
        include: {
          category: true,
          brand: true,
          _count: {
            select: { variants: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        variants: {
          include: {
            options: {
              include: {
                option: {
                  include: {
                    group: true,
                    value: true,
                  },
                },
              },
            },
          },
        },
        digitalMeta: true,
        weightedMeta: true,
        bundleItems: {
          include: {
            product: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        collections: {
          include: {
            collection: true,
          },
        },
      },
    });

    if (!product) throw new AppError(404, 'Product not found');
    return product;
  }

  async getBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: {
        slug,
        status: 'ACTIVE' as const,
        isActive: true,
      },
      include: {
        category: true,
        brand: true,
        variants: {
          include: {
            options: {
              include: {
                option: {
                  include: {
                    group: true,
                    value: true,
                  },
                },
              },
            },
          },
        },
        digitalMeta: true,
        weightedMeta: true,
        bundleItems: {
          include: {
            product: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        collections: {
          include: {
            collection: true,
          },
        },
      },
    });

    if (!product) throw new AppError(404, 'Product not found');
    return product;
  }

  async create(data: ProductFormData) {
    // Generate unique slug
    const slug = await generateUniqueSlug(data.name);

    // Build create data based on product type
    const createData: any = {
      name: data.name,
      description: data.description,
      price: data.price,
      compareAtPrice: data.compareAtPrice,
      categoryId: data.categoryId,
      brandId: data.brandId,
      status: data.status || 'DRAFT',
      images: data.images || [],
      sku: data.sku,
      attributes: data.attributes || {},
      isActive: data.isActive ?? true,
      productType: data.productType,
      slug,
    };

    // Type-specific nested creates
    if (data.productType === 'VARIABLE' && 'variants' in data) {
      createData.variants = {
        create: data.variants.map((v) => ({
          sku: v.sku,
          price: v.price,
          stock: v.stock || 0,
          isActive: v.isActive ?? true,
          images: v.images || [],
          options: {
            create: v.options.map((o) => ({
              optionId: o.valueId,
            })),
          },
        })),
      };
    }

    if (data.productType === 'WEIGHTED' && 'weightedMeta' in data) {
      createData.weightedMeta = {
        create: data.weightedMeta,
      };
    }

    if (data.productType === 'DIGITAL' && 'digitalMeta' in data) {
      createData.digitalMeta = {
        create: data.digitalMeta,
      };
    }

    if (data.productType === 'BUNDLED' && 'bundleItems' in data) {
      createData.bundleItems = {
        create: data.bundleItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity || 1,
          discount: item.discount || 0,
        })),
      };
    }

    // Handle tags and collections
    if (data.tagIds && data.tagIds.length > 0) {
      createData.tags = {
        create: data.tagIds.map((tagId) => ({ tagId })),
      };
    }

    if (data.collectionIds && data.collectionIds.length > 0) {
      createData.collections = {
        create: data.collectionIds.map((collectionId) => ({ collectionId })),
      };
    }

    const product = await prisma.product.create({
      data: createData,
      include: {
        category: true,
        brand: true,
        variants: true,
        digitalMeta: true,
        weightedMeta: true,
        bundleItems: true,
        tags: true,
        collections: true,
      },
    });

    eventBus.emit('product.created', { productId: product.id });
    return product;
  }

  async update(id: string, data: ProductUpdateData) {
    // Regenerate slug if name changed
    let slug: string | undefined;
    if (data.name) {
      slug = await generateUniqueSlug(data.name, id);
    }

    const updateData: any = {
      ...(data.name && { name: data.name }),
      ...(data.description && { description: data.description }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.compareAtPrice !== undefined && { compareAtPrice: data.compareAtPrice }),
      ...(data.categoryId && { categoryId: data.categoryId }),
      ...(data.brandId !== undefined && { brandId: data.brandId }),
      ...(data.status && { status: data.status }),
      ...(data.images && { images: data.images }),
      ...(data.sku && { sku: data.sku }),
      ...(data.attributes && { attributes: data.attributes }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(slug && { slug }),
    };

    // Handle type-specific updates (simplified approach: delete and recreate)
    if ('variants' in data && data.variants) {
      // Delete existing variants and recreate
      await prisma.productVariant.deleteMany({ where: { productId: id } });
      updateData.variants = {
        create: data.variants.map((v) => ({
          sku: v.sku,
          price: v.price,
          stock: v.stock || 0,
          isActive: v.isActive ?? true,
          images: v.images || [],
          options: {
            create: v.options.map((o) => ({
              optionId: o.valueId,
            })),
          },
        })),
      };
    }

    if ('weightedMeta' in data && data.weightedMeta) {
      // Upsert weighted meta
      updateData.weightedMeta = {
        upsert: {
          create: data.weightedMeta,
          update: data.weightedMeta,
        },
      };
    }

    if ('digitalMeta' in data && data.digitalMeta) {
      // Upsert digital meta
      updateData.digitalMeta = {
        upsert: {
          create: data.digitalMeta,
          update: data.digitalMeta,
        },
      };
    }

    if ('bundleItems' in data && data.bundleItems) {
      // Delete existing bundle items and recreate
      await prisma.bundleItem.deleteMany({ where: { bundleProductId: id } });
      updateData.bundleItems = {
        create: data.bundleItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity || 1,
          discount: item.discount || 0,
        })),
      };
    }

    // Handle tags and collections
    if (data.tagIds) {
      await prisma.productTag.deleteMany({ where: { productId: id } });
      if (data.tagIds.length > 0) {
        updateData.tags = {
          create: data.tagIds.map((tagId) => ({ tagId })),
        };
      }
    }

    if (data.collectionIds) {
      await prisma.productCollection.deleteMany({ where: { productId: id } });
      if (data.collectionIds.length > 0) {
        updateData.collections = {
          create: data.collectionIds.map((collectionId) => ({ collectionId })),
        };
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        brand: true,
        variants: true,
        digitalMeta: true,
        weightedMeta: true,
        bundleItems: true,
        tags: true,
        collections: true,
      },
    });

    eventBus.emit('product.updated', { productId: product.id });
    return product;
  }

  async updateStatus(id: string, status: ProductStatus) {
    const product = await prisma.product.update({
      where: { id },
      data: {
        status,
        isActive: status === 'ARCHIVED' ? false : true,
      },
      include: {
        category: true,
        brand: true,
        variants: true,
        digitalMeta: true,
        weightedMeta: true,
        bundleItems: true,
      },
    });

    eventBus.emit('product.updated', { productId: product.id });
    return product;
  }

  async bulkUpdateStatus(ids: string[], status: ProductStatus) {
    const result = await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: {
        status,
        isActive: status === 'ACTIVE',
      },
    });

    // Emit events for each product
    ids.forEach((id) => {
      eventBus.emit('product.updated', { productId: id });
    });

    return result;
  }

  async bulkDelete(ids: string[]) {
    const result = await prisma.product.deleteMany({
      where: { id: { in: ids } },
    });

    // Emit events for each product
    ids.forEach((id) => {
      eventBus.emit('product.deleted', { productId: id });
    });

    return result;
  }

  async delete(id: string) {
    await prisma.product.delete({ where: { id } });
    eventBus.emit('product.deleted', { productId: id });
  }
}

export const productService = new ProductService();
