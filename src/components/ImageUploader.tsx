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

            {/* Hidden input specifically for Camera Trigger */}
            <input
                type="file"
                id="camera-input"
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                onClick={(e) => e.stopPropagation()} // Prevent bubbling up to the main container click
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

                <div className="flex gap-2 mt-4">
                    {/* Button that triggers the Camera Input specifically */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById('camera-input')?.click();
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-accent text-white hover:bg-brand-accent-hover transition-colors shadow-lg shadow-brand-accent/20"
                    >
                        <Camera className="w-4 h-4" />
                        <span className="font-medium">Abrir Câmera</span>
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            inputRef.current?.click();
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-industrial-bg border border-industrial-border hover:bg-industrial-border transition-colors"
                    >
                        <ImageIcon className="w-4 h-4 text-industrial-muted" />
                        <span className="text-industrial-muted">Galeria</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
