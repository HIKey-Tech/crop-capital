import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

interface ImageGalleryProps {
  images: Array<string>
  alt: string
  className?: string
  aspectRatio?: 'hero' | 'square' | 'wide'
}

export function ImageGallery({
  images,
  alt,
  className,
  aspectRatio = 'hero',
}: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const allImages = images.length > 0 ? images : []

  if (allImages.length === 0) {
    return (
      <div
        className={cn(
          'bg-muted flex items-center justify-center rounded-xl border border-border text-muted-foreground',
          aspectRatio === 'hero' && 'h-64 md:h-80',
          aspectRatio === 'square' && 'aspect-square',
          aspectRatio === 'wide' && 'aspect-video',
          className,
        )}
      >
        No image available
      </div>
    )
  }

  if (allImages.length === 1) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border border-border',
          aspectRatio === 'hero' && 'h-64 md:h-80',
          aspectRatio === 'square' && 'aspect-square',
          aspectRatio === 'wide' && 'aspect-video',
          className,
        )}
      >
        <img
          src={allImages[0]}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  function handlePrev() {
    setActiveIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
  }

  function handleNext() {
    setActiveIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Main Image */}
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border border-border group',
          aspectRatio === 'hero' && 'h-64 md:h-80',
          aspectRatio === 'square' && 'aspect-square',
          aspectRatio === 'wide' && 'aspect-video',
        )}
      >
        <img
          src={allImages[activeIndex]}
          alt={`${alt} - Image ${activeIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
        />

        {/* Navigation Arrows */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm border border-border"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm border border-border"
          aria-label="Next image"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Image Counter */}
        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
          {activeIndex + 1} / {allImages.length}
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {allImages.map((src, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveIndex(idx)}
            className={cn(
              'shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all',
              idx === activeIndex
                ? 'border-primary ring-1 ring-primary/30'
                : 'border-border opacity-60 hover:opacity-100',
            )}
          >
            <img
              src={src}
              alt={`${alt} thumbnail ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
