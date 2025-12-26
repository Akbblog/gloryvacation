"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2, ZoomIn, ZoomOut, Grid3X3, Share2, Download, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedImageGalleryProps {
  images: string[];
  title: string;
}

export default function EnhancedImageGallery({ images, title }: EnhancedImageGalleryProps) {
  const validImages = Array.isArray(images) && images.length > 0 ? images : [];
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isGridView, setIsGridView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchStartTimeRef = useRef<number>(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Preload adjacent images
  useEffect(() => {
    if (validImages.length === 0) return;
    
    const toPreload = [
      activeImageIdx,
      (activeImageIdx + 1) % validImages.length,
      (activeImageIdx - 1 + validImages.length) % validImages.length,
    ];

    toPreload.forEach((idx) => {
      if (!loadedImages.has(idx)) {
        const img = new Image();
        img.src = getImageUrl(validImages[idx]) || '';
        img.onload = () => {
          setLoadedImages((prev) => new Set([...prev, idx]));
        };
      }
    });
  }, [activeImageIdx, validImages.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        case 'Escape':
          closeLightbox();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case 'g':
          setIsGridView((prev) => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, activeImageIdx]);

  // Auto-hide controls
  useEffect(() => {
    if (isLightboxOpen && !isGridView) {
      const resetControlsTimer = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
          if (!isGridView) setShowControls(false);
        }, 3000);
      };

      resetControlsTimer();
      window.addEventListener('mousemove', resetControlsTimer);
      window.addEventListener('touchstart', resetControlsTimer);

      return () => {
        window.removeEventListener('mousemove', resetControlsTimer);
        window.removeEventListener('touchstart', resetControlsTimer);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      };
    }
  }, [isLightboxOpen, isGridView]);

  const nextImage = useCallback(() => {
    if (validImages.length > 0) {
      setActiveImageIdx((prev) => (prev + 1) % validImages.length);
      setZoomLevel(1);
      setIsZoomed(false);
    }
  }, [validImages.length]);

  const prevImage = useCallback(() => {
    if (validImages.length > 0) {
      setActiveImageIdx((prev) => (prev - 1 + validImages.length) % validImages.length);
      setZoomLevel(1);
      setIsZoomed(false);
    }
  }, [validImages.length]);

  const openLightbox = (index: number) => {
    setActiveImageIdx(index);
    setIsLightboxOpen(true);
    setIsGridView(false);
    setZoomLevel(1);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setIsGridView(false);
    setZoomLevel(1);
    setIsZoomed(false);
    document.body.style.overflow = 'unset';
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
    setIsZoomed(true);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 0.5, 1);
    setZoomLevel(newZoom);
    if (newZoom === 1) setIsZoomed(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this property: ${title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
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
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    touchStartTimeRef.current = Date.now();
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - touchStartRef.current.x;
    const deltaY = endY - touchStartRef.current.y;
    const timeDiff = Date.now() - touchStartTimeRef.current;
    
    touchStartRef.current = null;

    // Only swipe if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50 && timeDiff < 300) {
      if (deltaX < 0) nextImage();
      else prevImage();
    }
  };

  // Placeholder fallback
  const placeholderSvg = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%239ca3af%22 font-family=%22sans-serif%22 font-size=%2218%22%3ENo Image%3C/text%3E%3C/svg%3E';

  if (validImages.length === 0) {
    return (
      <div className="h-[400px] md:h-[500px] bg-gray-100 rounded-2xl flex items-center justify-center">
        <p className="text-gray-400">No images available</p>
      </div>
    );
  }

  // Mobile carousel view
  if (isMobile) {
    return (
      <>
        <div 
          className="relative h-80 sm:h-96 w-full overflow-hidden rounded-2xl bg-gray-100 shadow-lg"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Image with transition */}
          <div className="relative w-full h-full">
            {validImages.map((img, idx) => (
              <div
                key={idx}
                className={cn(
                  "absolute inset-0 transition-all duration-500 ease-out",
                  idx === activeImageIdx ? "opacity-100 scale-100" : "opacity-0 scale-105"
                )}
              >
                <img
                  src={getImageUrl(img) || placeholderSvg}
                  alt={`${title} - Image ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading={idx === 0 ? "eager" : "lazy"}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = placeholderSvg;
                  }}
                />
              </div>
            ))}
          </div>

          {/* Gradient overlays */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

          {/* Navigation arrows */}
          {validImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg text-gray-800 rounded-full p-2.5 transition-all duration-200 z-10 backdrop-blur-sm active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg text-gray-800 rounded-full p-2.5 transition-all duration-200 z-10 backdrop-blur-sm active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Top actions */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className={cn(
                "p-2.5 rounded-full shadow-lg transition-all duration-200 backdrop-blur-sm",
                isFavorited ? "bg-red-500 text-white" : "bg-white/90 text-gray-800 hover:bg-white"
              )}
            >
              <Heart className={cn("w-5 h-5", isFavorited && "fill-current")} />
            </button>
            <button
              onClick={() => openLightbox(activeImageIdx)}
              className="bg-white/90 hover:bg-white shadow-lg text-gray-800 rounded-full p-2.5 transition-all duration-200 backdrop-blur-sm"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>

          {/* Image counter & dots */}
          <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-3">
            {/* Dot indicators */}
            {validImages.length <= 8 && (
              <div className="flex gap-1.5">
                {validImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      idx === activeImageIdx 
                        ? "bg-white w-6" 
                        : "bg-white/50 hover:bg-white/70"
                    )}
                  />
                ))}
              </div>
            )}
            
            {/* Counter badge */}
            <div className="bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
              {activeImageIdx + 1} / {validImages.length}
            </div>
          </div>
        </div>

        {/* Mobile Lightbox */}
        {isLightboxOpen && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Header */}
            <div className={cn(
              "absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20 transition-opacity duration-300",
              showControls ? "opacity-100" : "opacity-0"
            )}>
              <button
                onClick={closeLightbox}
                className="text-white bg-black/50 rounded-full p-2 backdrop-blur-sm"
              >
                <X className="w-6 h-6" />
              </button>
              <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                {activeImageIdx + 1} / {validImages.length}
              </span>
              <button
                onClick={handleShare}
                className="text-white bg-black/50 rounded-full p-2 backdrop-blur-sm"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Main image area */}
            <div 
              className="flex-1 flex items-center justify-center"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <img
                src={getImageUrl(validImages[activeImageIdx]) || placeholderSvg}
                alt={`${title} - Image ${activeImageIdx + 1}`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = placeholderSvg;
                }}
              />
            </div>

            {/* Bottom thumbnails */}
            <div className={cn(
              "absolute bottom-0 left-0 right-0 p-4 transition-opacity duration-300",
              showControls ? "opacity-100" : "opacity-0"
            )}>
              <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
                {validImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={cn(
                      "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 snap-start",
                      idx === activeImageIdx 
                        ? "ring-2 ring-white scale-105" 
                        : "opacity-60 hover:opacity-100"
                    )}
                  >
                    <img
                      src={getImageUrl(img) || placeholderSvg}
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

  // Desktop grid view
  return (
    <>
      <div className="relative group">
        <div className="grid grid-cols-4 gap-2 h-[480px] rounded-2xl overflow-hidden">
          {/* Main large image */}
          <div 
            className="col-span-2 row-span-2 relative bg-gray-100 overflow-hidden cursor-pointer group/main"
            onClick={() => openLightbox(0)}
          >
            <img
              src={getImageUrl(validImages[0]) || placeholderSvg}
              alt={`${title} - Main`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover/main:scale-105"
              loading="eager"
              onError={(e) => {
                (e.target as HTMLImageElement).src = placeholderSvg;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover/main:opacity-100 transition-opacity duration-300" />
            
            {/* View all photos button */}
            <button className="absolute bottom-4 right-4 bg-white/95 hover:bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold backdrop-blur-sm shadow-lg flex items-center gap-2 transition-all duration-200 hover:shadow-xl">
              <Grid3X3 className="w-4 h-4" />
              View all photos
            </button>
          </div>

          {/* Thumbnail images */}
          {validImages.slice(1, 5).map((img, idx) => (
            <div
              key={idx}
              onClick={() => openLightbox(idx + 1)}
              className="relative bg-gray-100 overflow-hidden cursor-pointer group/thumb"
            >
              <img
                src={getImageUrl(img) || placeholderSvg}
                alt={`${title} - Image ${idx + 2}`}
                className="w-full h-full object-cover transition-all duration-500 group-hover/thumb:scale-110"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = placeholderSvg;
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/20 transition-all duration-300" />
            </div>
          ))}

          {/* More images overlay */}
          {validImages.length > 5 && (
            <div 
              className="relative bg-gray-800 overflow-hidden cursor-pointer flex items-center justify-center group/more"
              onClick={() => openLightbox(5)}
            >
              <img
                src={getImageUrl(validImages[5]) || placeholderSvg}
                alt={`${title} - More`}
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover/more:opacity-50 transition-opacity duration-300"
                loading="lazy"
              />
              <div className="relative z-10 text-center">
                <span className="text-white font-bold text-2xl">+{validImages.length - 5}</span>
                <p className="text-white/80 text-sm mt-1">more photos</p>
              </div>
            </div>
          )}
        </div>

        {/* Floating action buttons */}
        <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleShare}
            className="bg-white/95 hover:bg-white text-gray-800 rounded-full p-2.5 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsFavorited(!isFavorited)}
            className={cn(
              "rounded-full p-2.5 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl",
              isFavorited 
                ? "bg-red-500 text-white hover:bg-red-600" 
                : "bg-white/95 hover:bg-white text-gray-800"
            )}
          >
            <Heart className={cn("w-5 h-5", isFavorited && "fill-current")} />
          </button>
        </div>
      </div>

      {/* Desktop Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
          {/* Header */}
          <div className={cn(
            "flex items-center justify-between p-4 transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            <div className="flex items-center gap-4">
              <button
                onClick={closeLightbox}
                className="text-white hover:text-gray-300 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
              <span className="text-white font-medium">
                {activeImageIdx + 1} / {validImages.length}
              </span>
            </div>

            <h2 className="text-white font-semibold text-lg hidden md:block truncate max-w-md">
              {title}
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsGridView(!isGridView)}
                className={cn(
                  "text-white rounded-full p-2 transition-all duration-200",
                  isGridView ? "bg-white/30" : "bg-white/10 hover:bg-white/20"
                )}
                title="Grid view (G)"
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              {!isGridView && (
                <>
                  <button
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 1}
                    className="text-white bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-full p-2 transition-all duration-200"
                    title="Zoom out (-)"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 3}
                    className="text-white bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-full p-2 transition-all duration-200"
                    title="Zoom in (+)"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                </>
              )}
              <button
                onClick={handleShare}
                className="text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all duration-200"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main content */}
          {isGridView ? (
            // Grid view
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-7xl mx-auto">
                {validImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveImageIdx(idx);
                      setIsGridView(false);
                    }}
                    className="relative aspect-[4/3] bg-gray-800 rounded-lg overflow-hidden group/grid hover:ring-2 hover:ring-white transition-all duration-200"
                  >
                    <img
                      src={getImageUrl(img) || placeholderSvg}
                      alt={`${title} - Image ${idx + 1}`}
                      className="w-full h-full object-cover group-hover/grid:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/grid:bg-black/20 transition-colors duration-200" />
                    <span className="absolute bottom-2 left-2 text-white text-sm font-medium bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
                      {idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Single image view
            <div className="flex-1 flex items-center justify-center relative" ref={imageContainerRef}>
              {/* Navigation arrows */}
              {validImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className={cn(
                      "absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full p-3 md:p-4 transition-all duration-300 z-10",
                      showControls ? "opacity-100" : "opacity-0"
                    )}
                  >
                    <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                  </button>
                  <button
                    onClick={nextImage}
                    className={cn(
                      "absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full p-3 md:p-4 transition-all duration-300 z-10",
                      showControls ? "opacity-100" : "opacity-0"
                    )}
                  >
                    <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                  </button>
                </>
              )}

              {/* Main image with zoom */}
              <div 
                className={cn(
                  "max-w-[90vw] max-h-[75vh] overflow-hidden transition-all duration-300",
                  isZoomed && "cursor-move"
                )}
              >
                <img
                  src={getImageUrl(validImages[activeImageIdx]) || placeholderSvg}
                  alt={`${title} - Image ${activeImageIdx + 1}`}
                  className="max-w-full max-h-[75vh] object-contain transition-transform duration-300"
                  style={{ transform: `scale(${zoomLevel})` }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = placeholderSvg;
                  }}
                />
              </div>
            </div>
          )}

          {/* Bottom thumbnail strip - only in single view */}
          {!isGridView && (
            <div className={cn(
              "p-4 transition-opacity duration-300",
              showControls ? "opacity-100" : "opacity-0"
            )}>
              <div className="flex justify-center gap-2 overflow-x-auto max-w-4xl mx-auto pb-2">
                {validImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveImageIdx(idx);
                      setZoomLevel(1);
                      setIsZoomed(false);
                    }}
                    className={cn(
                      "flex-shrink-0 w-16 h-12 md:w-20 md:h-14 rounded-lg overflow-hidden transition-all duration-200",
                      idx === activeImageIdx 
                        ? "ring-2 ring-white scale-105 opacity-100" 
                        : "opacity-50 hover:opacity-80"
                    )}
                  >
                    <img
                      src={getImageUrl(img) || placeholderSvg}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}