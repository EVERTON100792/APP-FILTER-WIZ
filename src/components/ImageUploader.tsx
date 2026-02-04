import React, { useRef, useState } from 'react';
import { Upload, Camera, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
    onImageSelected: (file: File) => void;
}

export function ImageUploader({ onImageSelected }: ImageUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            onImageSelected(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div
            className={`
        relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group
        ${isDragging
                    ? 'border-brand-accent bg-brand-accent/5 scale-[1.02]'
                    : 'border-industrial-border bg-industrial-surface hover:border-industrial-muted'
                }
      `}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
        >
            <input
                type="file"
                ref={inputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-industrial-bg border border-industrial-border flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-8 h-8 text-industrial-muted group-hover:text-brand-accent transition-colors" />
                </div>

                <div className="space-y-1">
                    <h3 className="font-semibold text-industrial-text">
                        Toque para enviar foto
                    </h3>
                    <p className="text-sm text-industrial-muted">
                        ou arraste um arquivo aqui
                    </p>
                </div>

                <div className="flex gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-industrial-bg border border-industrial-border text-xs text-industrial-muted">
                        <Camera className="w-3 h-3" /> Câmera
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-industrial-bg border border-industrial-border text-xs text-industrial-muted">
                        <ImageIcon className="w-3 h-3" /> Galeria
                    </span>
                </div>
            </div>
        </div>
    );
}
