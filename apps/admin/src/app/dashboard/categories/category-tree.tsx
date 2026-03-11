'use client';

import React, { useState } from 'react';
import { Tree, NodeModel } from '@minoru/react-dnd-treeview';
import type { Category } from '@repo/types';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface CategoryTreeProps {
  categories: Category[];
}

export default function CategoryTree({ categories }: CategoryTreeProps) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Transform flat categories to tree data format
  const treeData: NodeModel[] = categories.map((cat) => ({
    id: cat.id,
    parent: cat.parentId || 0,
    text: cat.name,
    droppable: true,
    data: cat,
  }));

  const handleDrop = async (
    newTree: NodeModel[],
    options: {
      dragSourceId?: string | number;
      dropTargetId?: string | number;
      dragSource?: NodeModel;
      dropTarget?: NodeModel;
    }
  ) => {
    const { dragSourceId, dropTargetId } = options;

    // Validate drop operation
    if (!dragSourceId || dragSourceId === dropTargetId) {
      return;
    }

    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        alert('Not authenticated');
        return;
      }

      // Call move API
      await api.categories.move(
        String(dragSourceId),
        {
          newParentId: dropTargetId === 0 ? null : String(dropTargetId),
          position: 0,
        },
        token
      );

      // Refresh to get updated tree
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to move category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        alert('Not authenticated');
        return;
      }

      await api.categories.delete(categoryId, token);
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to delete category');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <div className="text-sm text-gray-600">Processing...</div>
        </div>
      )}

      <Tree
        tree={treeData}
        rootId={0}
        onDrop={handleDrop}
        render={(node, { depth, isOpen, onToggle }) => {
          const category = node.data as Category;
          const hasChildren = treeData.some((n) => n.parent === node.id);

          return (
            <div
              className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded"
              style={{ paddingLeft: `${depth * 20 + 12}px` }}
            >
              {/* Expand/collapse toggle */}
              {hasChildren && (
                <button
                  onClick={onToggle}
                  className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
                >
                  {isOpen ? '▼' : '▶'}
                </button>
              )}
              {!hasChildren && <span className="w-4" />}

              {/* Category name */}
              <span className="flex-1 text-sm font-medium text-gray-900">
                {node.text}
              </span>

              {/* Product count badge - optional, would come from API if included */}

              {/* Action buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    router.push(`/dashboard/categories?action=edit&id=${node.id}`)
                  }
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  title="Edit"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() =>
                    router.push(`/dashboard/categories?action=attributes&id=${node.id}`)
                  }
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                  title="Attributes"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(String(node.id))}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
