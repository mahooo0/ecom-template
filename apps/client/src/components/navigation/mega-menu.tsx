import React from 'react';
import type { Category } from '@repo/types';
import { api } from '@/lib/api';

interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
}

function buildTree(categories: Category[]): CategoryWithChildren[] {
  const map = new Map<string, CategoryWithChildren>();
  categories.forEach((c) => map.set(c.id, { ...c, children: [] }));

  const roots: CategoryWithChildren[] = [];
  categories.forEach((c) => {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children.push(node);
    } else if (!c.parentId) {
      roots.push(node);
    }
  });

  return roots;
}

export async function MegaMenu() {
  let categories: Category[] = [];

  try {
    const result = await api.categories.getAll();
    categories = result.data || [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return null;
  }

  // Build tree structure
  const tree = buildTree(categories);

  // Filter to show only top 3 levels (depth 0, 1, 2)
  const topLevelCategories = tree.filter((cat) => cat.depth === 0);

  if (topLevelCategories.length === 0) {
    return null;
  }

  return (
    <nav className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <ul className="flex items-center space-x-8 py-3">
          {topLevelCategories.map((category) => {
            const levelOneChildren = category.children.filter((child) => child.depth === 1);

            return (
              <li key={category.id} className="group relative">
                <a
                  href={`/categories/${category.slug}`}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  {category.name}
                </a>

                {levelOneChildren.length > 0 && (
                  <div className="invisible absolute left-0 top-full z-50 mt-2 w-screen max-w-4xl rounded-lg border border-gray-200 bg-white p-6 shadow-lg opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                    <div className="grid grid-cols-3 gap-6">
                      {levelOneChildren.slice(0, 9).map((level1) => {
                        const levelTwoChildren = level1.children.filter(
                          (child) => child.depth === 2
                        );

                        return (
                          <div key={level1.id}>
                            <a
                              href={`/categories/${level1.slug}`}
                              className="mb-3 block font-semibold text-gray-900 hover:text-gray-700"
                            >
                              {level1.name}
                            </a>
                            {levelTwoChildren.length > 0 && (
                              <ul className="space-y-2">
                                {levelTwoChildren.slice(0, 5).map((level2) => (
                                  <li key={level2.id}>
                                    <a
                                      href={`/categories/${level2.slug}`}
                                      className="text-sm text-gray-600 hover:text-gray-900"
                                    >
                                      {level2.name}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
