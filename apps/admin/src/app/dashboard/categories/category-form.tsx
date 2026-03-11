'use client';

import React from 'react';
import type { Category } from '@repo/types';

interface CategoryFormProps {
  category?: Category;
  categories: Category[];
}

export default function CategoryForm({ category, categories }: CategoryFormProps) {
  return (
    <div>
      <p className="text-gray-500">Category form - to be implemented in Task 2</p>
    </div>
  );
}
