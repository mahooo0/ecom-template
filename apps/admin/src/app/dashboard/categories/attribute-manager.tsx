'use client';

import React from 'react';
import type { CategoryAttribute } from '@repo/types';

interface AttributeManagerProps {
  categoryId: string;
  attributes: CategoryAttribute[];
}

export default function AttributeManager({
  categoryId,
  attributes,
}: AttributeManagerProps) {
  return (
    <div>
      <p className="text-gray-500">Attribute manager - to be implemented in Task 2</p>
    </div>
  );
}
