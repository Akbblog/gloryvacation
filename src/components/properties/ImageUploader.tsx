"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { Upload, X, Star, GripVertical, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ImageItem = {
    id: string;
    file?: File;
    url: string;
    uploading?: boolean;
    progress?: number;
    error?: string;
    isCover?: boolean;
};

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

async function compressImage(file: File, maxWidth = 1600, quality = 0.8): Promise<Blob> {
    return new Promise((resolve) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        const img = new Image();

        img.onload = () => {
            const ratio = Math.min(1, maxWidth / Math.max(img.width, img.height));
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                resolve(blob!);
            }, "image/jpeg", quality);
        };

        img.src = URL.createObjectURL(file);
    });
}

async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function freeImageHostUpload(file: File, onProgress: (p: number) => void, folder?: string): Promise<{ url: string }> {
    onProgress(10);

    try {
        const compressed = await compressImage(file);
        const base64 = await fileToBase64(new File([compressed], file.name, { type: "image/jpeg" }));

        onProgress(30);

        const payload: any = { base64 };
        if (folder) payload.folder = folder;
        const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            throw new Error('Upload failed');
        }

        const data = await res.json();
        onProgress(100);

        if (data.url) {
            return { url: data.url };
        }
        throw new Error('Upload failed - no URL returned');
    } catch (error) {
        onProgress(0);
        throw error;
    }
}

interface ImageUploaderProps {
    initial?: string[];
    onChange?: (images: string[]) => void;
    maxFiles?: number;
    className?: string;
    uploadFolder?: string;
}

export default function ImageUploader({
    initial = [],
    onChange,
    maxFiles = 12,
    className,
    uploadFolder
}: ImageUploaderProps) {
    const [images, setImages] = useState<ImageItem[]>(() =>
        Array.isArray(initial) ? initial.map((url, index) => ({
            id: generateId(),
            url,
            isCover: index === 0
        })) : []
    );
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const validFiles = Array.from(files).filter(file =>
            file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // 10MB limit
        );

        if (validFiles.length === 0) return;

        const remainingSlots = maxFiles - images.length;
        const filesToUpload = validFiles.slice(0, remainingSlots);

        setIsUploading(true);

        try {
            const newImages: ImageItem[] = [];

            for (const file of filesToUpload) {
                const id = generateId();
                const previewUrl = URL.createObjectURL(file);

                const imageItem: ImageItem = {
                    id,
                    file,
                    url: previewUrl,
                    uploading: true,
                    progress: 0,
                    isCover: images.length === 0 && newImages.length === 0
                };

                newImages.push(imageItem);
            }

            // Add new images to the list
            const updatedImages = [...images, ...newImages];
            setImages(updatedImages);

            // Upload files
            for (const imageItem of newImages) {
                try {
                    const result = await freeImageHostUpload(imageItem.file!, (progress) => {
                        setImages(prev => prev.map(img =>
                            img.id === imageItem.id
                                ? { ...img, progress }
                                : img
                        ));
                    }, uploadFolder);

                    // Replace preview URL with uploaded URL
                    setImages(prev => prev.map(img =>
                        img.id === imageItem.id
                            ? { ...img, url: result.url, uploading: false, progress: 100 }
                            : img
                    ));

                    // Clean up object URL
                    URL.revokeObjectURL(imageItem.url);
                } catch (error) {
                    setImages(prev => prev.map(img =>
                        img.id === imageItem.id
                            ? { ...img, uploading: false, error: 'Upload failed' }
                            : img
                    ));
                }
            }

            // Update parent component
            setImages(current => {
                onChange?.(current.filter(img => !img.error).map(img => img.url));
                return current;
            });

        } finally {
            setIsUploading(false);
        }
    }, [images, maxFiles, onChange]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFileSelect(e.dataTransfer.files);
    }, [handleFileSelect]);

    const removeImage = useCallback((id: string) => {
        setImages(prev => {
            const newImages = prev.filter(img => img.id !== id);
            // If we removed the cover image, make the first remaining image the cover
            if (newImages.length > 0 && !newImages.some(img => img.isCover)) {
                newImages[0].isCover = true;
            }
            // Emit ordered URLs with cover first
            const ordered = [
                ...newImages.filter(img => img.isCover).map(img => img.url),
                ...newImages.filter(img => !img.isCover).map(img => img.url),
            ];
            onChange?.(ordered);
            return newImages;
        });
    }, [onChange]);

    const setCoverImage = useCallback((id: string) => {
        setImages(prev => {
            const next = prev.map(img => ({ ...img, isCover: img.id === id }));
            // Emit ordered URLs with cover first
            const ordered = [
                ...next.filter(img => img.isCover).map(img => img.url),
                ...next.filter(img => !img.isCover).map(img => img.url),
            ];
            onChange?.(ordered);
            return next;
        });
    }, []);

    return (
        <div className={cn("space-y-4", className)}>
            {/* Upload Area */}
            <div
                className={cn(
                    "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
                    isDragOver
                        ? "border-teal-400 bg-teal-50"
                        : "border-gray-300 hover:border-teal-300 hover:bg-gray-50",
                    isUploading && "opacity-50 pointer-events-none"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files)}
                />

                <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-teal-100 rounded-full">
                        <Upload className="w-8 h-8 text-teal-600" />
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Upload Property Images
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Drag and drop images here, or{" "}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-teal-600 hover:text-teal-700 font-medium underline"
                            >
                                browse files
                            </button>
                        </p>
                        <div className="text-sm text-gray-500">
                            <p>Supported formats: JPG, PNG, WebP</p>
                            <p>Maximum file size: 10MB per image</p>
                            <p>Maximum {maxFiles} images</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                        <div
                            key={image.id}
                            className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                        >
                            {/* Image */}
                            <img
                                src={image.url}
                                alt={`Property image ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-family='sans-serif' font-size='18'%3EImage Error%3C/text%3E%3C/svg%3E";
                                }}
                            />

                            {/* Cover Badge */}
                            {image.isCover && (
                                <div className="absolute top-2 left-2 bg-teal-600 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-current" />
                                    Cover
                                </div>
                            )}

                            {/* Upload Progress */}
                            {image.uploading && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                    <div className="bg-white rounded-lg p-4 w-20 h-20 flex flex-col items-center justify-center">
                                        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                                        <span className="text-xs text-gray-600">{image.progress}%</span>
                                    </div>
                                </div>
                            )}

                            {/* Error State */}
                            {image.error && (
                                <div className="absolute inset-0 bg-red-50 flex items-center justify-center">
                                    <div className="text-center p-4">
                                        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                        <p className="text-xs text-red-600">{image.error}</p>
                                    </div>
                                </div>
                            )}

                            {/* Actions Overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <div className="flex gap-2">
                                    {!image.isCover && !image.uploading && !image.error && (
                                        <button
                                            type="button"
                                            onClick={() => setCoverImage(image.id)}
                                            className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                                            title="Set as cover"
                                        >
                                            <Star className="w-4 h-4 text-gray-700" />
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => removeImage(image.id)}
                                        className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                                        title="Remove image"
                                    >
                                        <X className="w-4 h-4 text-red-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Drag Handle */}
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <GripVertical className="w-4 h-4 text-white drop-shadow-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{images.filter(img => !img.error).length} of {maxFiles} images uploaded</span>
                {isUploading && <span className="text-teal-600">Uploading...</span>}
            </div>
        </div>
    );
}
