'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CldUploadWidget } from 'next-cloudinary';
import { SortableImage } from './sortable-image';

interface ImageManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxFiles?: number;
}

export function ImageManager({
  images,
  onChange,
  maxFiles = 10,
}: ImageManagerProps) {
  const [isUploading, setIsUploading] = useState(false);

  // Set up drag-and-drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Prevents accidental drags
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.indexOf(active.id as string);
      const newIndex = images.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1) {
        onChange(arrayMove(images, oldIndex, newIndex));
      }
    }
  };

  // Handle image removal
  const handleRemove = (url: string) => {
    onChange(images.filter((img) => img !== url));
  };

  // Handle upload success
  const handleUploadSuccess = (result: any) => {
    if (result?.info?.secure_url) {
      onChange([...images, result.info.secure_url]);
    }
    setIsUploading(false);
  };

  const canUploadMore = images.length < maxFiles;

  return (
    <div className="space-y-4">
      {/* Upload button */}
      <CldUploadWidget
        uploadPreset="products"
        signatureEndpoint="/api/sign-cloudinary"
        onSuccess={handleUploadSuccess}
        onOpen={() => setIsUploading(true)}
        onClose={() => setIsUploading(false)}
        options={{
          multiple: true,
          maxFiles: maxFiles - images.length,
          resourceType: 'image',
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
          maxFileSize: 5000000, // 5MB
        }}
      >
        {({ open }) => (
          <button
            type="button"
            onClick={() => open()}
            disabled={!canUploadMore || isUploading}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              {/* Camera/Upload icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <div className="text-sm text-gray-600">
                {isUploading ? (
                  <span>Uploading...</span>
                ) : canUploadMore ? (
                  <span>
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </span>
                ) : (
                  <span className="text-gray-500">Maximum files reached</span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                JPG, PNG, or WebP (max 5MB)
              </div>
            </div>
          </button>
        )}
      </CldUploadWidget>

      {/* Image count indicator */}
      {images.length > 0 && (
        <div className="text-sm text-gray-600">
          {images.length}/{maxFiles} images
        </div>
      )}

      {/* Sortable images grid */}
      {images.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={images} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((url) => (
                <SortableImage
                  key={url}
                  id={url}
                  url={url}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
