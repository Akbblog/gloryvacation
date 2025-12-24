"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';

interface EnhancedImageGalleryProps {
  images: string[];
  title: string;
}

export default function EnhancedImageGallery({ images, title }: EnhancedImageGalleryProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isImgLoading, setIsImgLoading] = useState(true);
  const touchStartRef = React.useRef<number | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const nextImage = () => {
    if (images.length > 0) {
      setActiveImageIdx((activeImageIdx + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setActiveImageIdx((activeImageIdx - 1 + images.length) % images.length);
    }
  };

  const openLightbox = (index: number) => {
    setActiveImageIdx(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = 'unset';
  };

  const getImageUrl = (url: string): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('blob:') || url.startsWith('data:')) return url;
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('/')) return url;
    return '/' + url;
  };

  // Touch handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    const delta = e.touches[0].clientX - touchStartRef.current;
    // small threshold handled on end
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const delta = endX - touchStartRef.current;
    touchStartRef.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) nextImage();
    else prevImage();
  };

  // Mobile carousel view
  if (isMobile && images.length > 0) {
    return (
      <>
        <div className="relative h-96 w-full overflow-hidden rounded-2xl bg-gray-200 shadow-lg" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          {isImgLoading && <div className="absolute inset-0 shimmer" />}
          <img
            src={getImageUrl(images[activeImageIdx]) || ''}
            alt={title}
            className={`w-full h-full object-cover transition-transform duration-500 ${isImgLoading ? 'opacity-0' : 'opacity-100'}`}
            loading="lazy"
            onLoad={() => setIsImgLoading(false)}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%239ca3af%22 font-family=%22sans-serif%22 font-size=%2218%22%3EImage%3C/text%3E%3C/svg%3E';
              setIsImgLoading(false);
            }}
          />
          
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg text-gray-800 rounded-full p-2 transition z-10 backdrop-blur-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg text-gray-800 rounded-full p-2 transition z-10 backdrop-blur-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                {activeImageIdx + 1} / {images.length}
              </div>
            </>
          )}
          
          <button
            onClick={() => openLightbox(activeImageIdx)}
            className="absolute top-4 right-4 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 transition z-10"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Lightbox for mobile */}
        {isLightboxOpen && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="relative w-full max-w-4xl">
              <img
                src={getImageUrl(images[activeImageIdx]) || ''}
                alt={title}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm">
                {activeImageIdx + 1} / {images.length}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop grid view
  return (
    <>
      <div className="grid grid-cols-4 gap-3 h-[500px] rounded-2xl overflow-hidden shadow-xl">
        {/* Main large image */}
        <div 
          className="col-span-2 row-span-2 relative bg-gray-200 overflow-hidden cursor-pointer group"
          onClick={() => openLightbox(0)}
        >
          <img
            src={getImageUrl(images[0]) || ''}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%239ca3af%22 font-family=%22sans-serif%22 font-size=%2218%22%3EImage%3C/text%3E%3C/svg%3E';
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
          <div className="absolute bottom-4 right-4 bg-white/90 text-gray-900 px-3 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm">
            View all photos
          </div>
        </div>

        {/* Thumbnail images with hover effects */}
        {images.slice(1, 5).map((img, idx) => (
          <div
            key={idx}
            onClick={() => openLightbox(idx + 1)}
            className="relative bg-gray-200 overflow-hidden cursor-pointer group"
          >
            <img
              src={getImageUrl(img) || ''}
              alt={`${title} - View ${idx + 2}`}
              className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E';
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
          </div>
        ))}

        {/* Show all photos button */}
        {images.length > 5 && (
          <div 
            className="relative bg-gradient-to-br from-gray-300 to-gray-400 overflow-hidden cursor-pointer flex items-center justify-center group hover:from-gray-400 hover:to-gray-500 transition-all"
            onClick={() => openLightbox(0)}
          >
            <div className="text-white font-bold text-lg">
              +{images.length - 5}
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
          </div>
        )}
      </div>

      {/* Lightbox for desktop */}
      {isLightboxOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-8">
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white hover:text-gray-300 z-10 bg-black/50 rounded-full p-2"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="relative w-full max-w-6xl">
            <img
              src={getImageUrl(images[activeImageIdx]) || ''}
              alt={title}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-3 transition-all duration-300"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-3 transition-all duration-300"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
              {activeImageIdx + 1} / {images.length}
            </div>
            
            {/* Thumbnail strip */}
            <div className="absolute bottom-6 left-6 right-6 flex gap-2 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === activeImageIdx ? 'border-white' : 'border-transparent'
                  }`}
                >
                  <img
                    src={getImageUrl(img) || ''}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}