import { prisma } from '@repo/db';
import { eventBus } from '../../common/events/event-bus.js';
import { AppError } from '../../common/middleware/error-handler.js';
import { generateUniqueSlug } from '../../utils/slug.utils.js';
import type { ProductFormData, ProductUpdateData } from '@repo/types/product-schemas';
import { productSchema } from '@repo/types/product-schemas';
import type { ProductStatus } from '@repo/types';
import Papa from 'papaparse';

interface GetAllOptions {
  page?: number;
  limit?: number;
  status?: ProductStatus;
  productType?: string;
  search?: string;
  categoryId?: string;
  categoryPath?: string;
  sortBy?: 'createdAt' | 'name' | 'price' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

interface ImportResult {
  total: number;
  imported: number;
  failed: number;
  errors: Array<{ row: number; field?: string; message: string }>;
}

export class ProductService {
  async getAll(options: GetAllOptions = {}) {
    const {
      page = 1,
      limit = 20,
      status,
      productType,
      search,
      categoryId,
      categoryPath,
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
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (categoryPath) {
      where.category = {
        path: {
          startsWith: categoryPath,
        },
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

  async importFromCsv(fileBuffer: Buffer): Promise<ImportResult> {
    const csvString = fileBuffer.toString('utf-8');

    // Parse CSV with Papa Parse
    const parseResult = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
    });

    const rows = parseResult.data as any[];
    const result: ImportResult = {
      total: rows.length,
      imported: 0,
      failed: 0,
      errors: [],
    };

    // Helper to parse price strings ($12.99 -> 1299 cents, or direct integer)
    const parsePrice = (priceStr: string): number => {
      if (!priceStr) return 0;
      const cleaned = priceStr.replace(/[$,]/g, '').trim();
      const num = parseFloat(cleaned);
      // If it has decimal places, assume it's dollars and convert to cents
      if (cleaned.includes('.')) {
        return Math.round(num * 100);
      }
      // Otherwise, assume it's already in cents
      return parseInt(cleaned, 10);
    };

    // Helper to split pipe-separated values
    const splitPipes = (value: string): string[] => {
      if (!value || !value.trim()) return [];
      return value.split('|').map((v) => v.trim()).filter((v) => v);
    };

    // Process each row sequentially
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 because row 1 is headers and arrays are 0-indexed

      try {
        // Build ProductFormData from CSV row
        const productType = row.producttype?.toUpperCase();

        // Skip VARIABLE products (not supported in CSV import)
        if (productType === 'VARIABLE') {
          result.failed++;
          result.errors.push({
            row: rowNumber,
            message: 'VARIABLE product type is not supported in CSV import. Use the admin form to create variable products.',
          });
          continue;
        }

        // Parse common fields
        const images = splitPipes(row.images);
        const price = parsePrice(row.price);

        const productData: any = {
          name: row.name,
          description: row.description,
          price,
          sku: row.sku,
          productType,
          categoryId: row.categoryid,
          brandId: row.brandid || undefined,
          status: row.status?.toUpperCase() || 'DRAFT',
          images,
          attributes: {},
          isActive: true,
        };

        // Add type-specific fields
        if (productType === 'WEIGHTED') {
          productData.weightedMeta = {
            unit: row.unit?.toUpperCase() || 'KG',
            pricePerUnit: parsePrice(row.priceperunit),
            minWeight: row.minweight ? parseFloat(row.minweight) : undefined,
            maxWeight: row.maxweight ? parseFloat(row.maxweight) : undefined,
            stepWeight: row.stepweight ? parseFloat(row.stepweight) : undefined,
          };
        }

        if (productType === 'DIGITAL') {
          productData.digitalMeta = {
            fileUrl: row.fileurl,
            fileName: row.filename,
            fileSize: row.filesize ? parseInt(row.filesize, 10) : 0,
            fileFormat: row.fileformat,
            maxDownloads: row.maxdownloads ? parseInt(row.maxdownloads, 10) : undefined,
            accessDuration: row.accessduration ? parseInt(row.accessduration, 10) : undefined,
          };
        }

        if (productType === 'BUNDLED') {
          const bundleProductIds = splitPipes(row.bundleproductids);
          const bundleQuantities = splitPipes(row.bundlequantities);
          const bundleDiscounts = splitPipes(row.bundlediscounts || '');

          if (bundleProductIds.length >= 2) {
            productData.bundleItems = bundleProductIds.map((productId, idx) => ({
              productId,
              quantity: bundleQuantities[idx] ? parseInt(bundleQuantities[idx], 10) : 1,
              discount: bundleDiscounts[idx] ? parseInt(bundleDiscounts[idx], 10) : 0,
            }));
          }
        }

        // Validate with Zod schema
        const validated = productSchema.safeParse(productData);

        if (!validated.success) {
          result.failed++;
          const firstError = validated.error.errors[0];
          result.errors.push({
            row: rowNumber,
            field: firstError?.path.join('.'),
            message: firstError?.message || 'Validation error',
          });
          continue;
        }

        // Create product
        try {
          await this.create(validated.data as ProductFormData);
          result.imported++;
        } catch (dbError: any) {
          result.failed++;
          result.errors.push({
            row: rowNumber,
            message: dbError.message || 'Database error while creating product',
          });
        }
      } catch (error: any) {
        result.failed++;
        result.errors.push({
          row: rowNumber,
          message: error.message || 'Unexpected error processing row',
        });
      }
    }

    return result;
  }
}

export const productService = new ProductService();
