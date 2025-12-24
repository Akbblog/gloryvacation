"use client";

import { useState, useRef, useEffect } from "react";

type Item = {
    id: string;
    file?: File | null;
    url: string;
    uploading?: boolean;
    progress?: number;
    isCover?: boolean;
};

type UploadHandler = (file: File, onProgress: (p: number) => void) => Promise<{ url: string }>;

function uid() {
    return Math.random().toString(36).slice(2, 9);
}

async function compressImage(file: File, maxWidth = 1600, quality = 0.75): Promise<Blob> {
    // Basic client-side resize using canvas
    const imgBitmap = await createImageBitmap(file);
    const ratio = Math.min(1, maxWidth / Math.max(imgBitmap.width, imgBitmap.height));
    const width = Math.round(imgBitmap.width * ratio);
    const height = Math.round(imgBitmap.height * ratio);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    ctx.drawImage(imgBitmap, 0, 0, width, height);

    return await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob as Blob), "image/jpeg", quality);
    });
}

export default function ImageUploader({
    initial = [],
    onChange,
    uploadHandler,
    maxFiles = 12,
}: {
    initial?: string[];
    onChange?: (images: string[]) => void;
    uploadHandler?: UploadHandler;
    maxFiles?: number;
}) {
    const [items, setItems] = useState<Item[]>(() => initial.map((u, i) => ({ id: uid() + i, url: u, uploading: false, progress: 100, isCover: i === 0 })));
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        onChange?.(items.map(it => it.url));
    }, [items]);

    const defaultUpload: UploadHandler = async (file, onProgress) => {
        // Simulate upload with a timeout and return object URL
        return new Promise((res) => {
            let p = 0;
            const id = setInterval(() => {
                p += Math.random() * 20;
                if (p >= 100) {
                    clearInterval(id);
                    const url = URL.createObjectURL(file);
                    onProgress(100);
                    setTimeout(() => res({ url }), 200);
                } else {
                    onProgress(Math.round(p));
                }
            }, 150);
        });
    };

    const uploader = uploadHandler || defaultUpload;

    const handleFiles = async (files: FileList | null) => {
        if (!files) return;
        const arr = Array.from(files).slice(0, Math.max(0, maxFiles - items.length));

        for (const file of arr) {
            const id = uid();
            const previewUrl = URL.createObjectURL(file);
            const newItem: Item = { id, file, url: previewUrl, uploading: true, progress: 0 };
            setItems(prev => [...prev, newItem]);

            try {
                const blob = await compressImage(file);
                const compressedFile = new File([blob], file.name.replace(/\s+/g, "_"), { type: blob.type });

                const result = await uploader(compressedFile, (p) => {
                    setItems(prev => prev.map(it => it.id === id ? { ...it, progress: p } : it));
                });

                setItems(prev => prev.map(it => it.id === id ? { ...it, uploading: false, progress: 100, url: result.url, file: null } : it));
            } catch (e) {
                console.error("Upload error", e);
                setItems(prev => prev.map(it => it.id === id ? { ...it, uploading: false } : it));
            }
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const dt = e.dataTransfer;
        handleFiles(dt.files);
    };

    const onPick = () => {
        inputRef.current?.click();
    };

    const removeItem = (id: string) => {
        setItems(prev => {
            const next = prev.filter(it => it.id !== id);
            // ensure cover exists
            if (!next.some(n => n.isCover) && next.length > 0) next[0].isCover = true;
            return next;
        });
    };

    const replaceItem = (id: string, file: File) => {
        const doReplace = async () => {
            const previewUrl = URL.createObjectURL(file);
            setItems(prev => prev.map(it => it.id === id ? { ...it, file, url: previewUrl, uploading: true, progress: 0 } : it));

            try {
                const blob = await compressImage(file);
                const compressedFile = new File([blob], file.name.replace(/\s+/g, "_"), { type: blob.type });
                const result = await uploader(compressedFile, (p) => setItems(prev => prev.map(it => it.id === id ? { ...it, progress: p } : it)));
                setItems(prev => prev.map(it => it.id === id ? { ...it, uploading: false, progress: 100, url: result.url, file: null } : it));
            } catch (e) {
                console.error(e);
                setItems(prev => prev.map(it => it.id === id ? { ...it, uploading: false } : it));
            }
        };

        doReplace();
    };

    const setCover = (id: string) => {
        setItems(prev => prev.map(it => ({ ...it, isCover: it.id === id })));
    };

    const move = (id: string, dir: number) => {
        setItems(prev => {
            const idx = prev.findIndex(p => p.id === id);
            if (idx === -1) return prev;
            const newIdx = idx + dir;
            if (newIdx < 0 || newIdx >= prev.length) return prev;
            const copy = [...prev];
            const [item] = copy.splice(idx, 1);
            copy.splice(newIdx, 0, item);
            return copy;
        });
    };

    return (
        <div>
            <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                className="border-dashed border-2 border-gray-200 rounded-lg p-4 text-center bg-white"
            >
                <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                <div className="flex flex-col items-center gap-3">
                    <div className="text-sm text-gray-600">Drag & drop images here or</div>
                    <button type="button" onClick={onPick} className="px-4 py-2 bg-primary text-white rounded-md">Select Images</button>
                    <div className="text-xs text-gray-400">Max {maxFiles} images. JPEG/PNG recommended.</div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {items.map(item => (
                    <div key={item.id} className="relative rounded-lg overflow-hidden border bg-gray-50">
                        <div className="w-full h-36 relative bg-gray-100">
                            <img src={item.url} alt="preview" className="object-cover w-full h-full" />
                        </div>

                        <div className="p-2 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={() => setCover(item.id)} className={`px-2 py-1 text-xs rounded ${item.isCover ? 'bg-primary text-white' : 'bg-white text-gray-700 border'}`}>Cover</button>
                            </div>
                            <div className="flex items-center gap-1">
                                <button type="button" onClick={() => move(item.id, -1)} className="text-gray-500 px-1">◀</button>
                                <button type="button" onClick={() => move(item.id, 1)} className="text-gray-500 px-1">▶</button>
                                <label className="text-gray-500 px-1 cursor-pointer">
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files) replaceItem(item.id, e.target.files[0]); }} />
                                    Replace
                                </label>
                                <button type="button" onClick={() => removeItem(item.id)} className="text-red-500 px-1">Remove</button>
                            </div>
                        </div>

                        {item.uploading && (
                            <div className="absolute inset-x-0 bottom-0 left-0 right-0">
                                <div className="h-1 bg-gray-200">
                                    <div style={{ width: `${item.progress || 0}%` }} className="h-1 bg-primary transition-all" />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
