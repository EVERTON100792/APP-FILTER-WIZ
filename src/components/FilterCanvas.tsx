import { useEffect, useRef, useState } from 'react';

interface FilterCanvasProps {
    image: string | null;
    backgroundImage?: string | null;
    color: string;
    onCanvasReady: (canvas: HTMLCanvasElement) => void;
}

export function FilterCanvas({ image, backgroundImage, color, onCanvasReady }: FilterCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPainting, setIsPainting] = useState(false);
    const [displayColor, setDisplayColor] = useState(color);

    // Painting Animation Effect
    useEffect(() => {
        if (color !== displayColor) {
            setIsPainting(true);
            const timer = setTimeout(() => {
                setDisplayColor(color);
                setIsPainting(false);
            }, 1000); // Faster painting effect (1s)
            return () => clearTimeout(timer);
        }
    }, [color, displayColor]);

    useEffect(() => {
        if (!canvasRef.current || !image) return;

        const mainCanvas = canvasRef.current;
        const mainCtx = mainCanvas.getContext('2d', { willReadFrequently: true });
        if (!mainCtx) return;

        mainCtx.imageSmoothingEnabled = true;
        mainCtx.imageSmoothingQuality = 'high';

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = image;

        const bgImg = new Image();
        if (backgroundImage) {
            bgImg.crossOrigin = 'anonymous';
            bgImg.src = backgroundImage;
        }

        const render = () => {
            // PERFORMANCE FIX: Downsample huge images to prevent mobile crash
            const MAX_DIMENSION = 2000;
            let width = img.naturalWidth;
            let height = img.naturalHeight;

            if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                const ratio = width / height;
                if (width > height) {
                    width = MAX_DIMENSION;
                    height = Math.round(MAX_DIMENSION / ratio);
                } else {
                    height = MAX_DIMENSION;
                    width = Math.round(MAX_DIMENSION * ratio);
                }
            }

            // Set Main Canvas Size
            mainCanvas.width = width;
            mainCanvas.height = height;

            // --- LAYER 1: BACKGROUND (Transparent + Logo) ---
            mainCtx.clearRect(0, 0, width, height);

            if (backgroundImage && bgImg.complete) {
                mainCtx.save();
                const bgScale = Math.min(width, height) * 0.5; // 50% of smallest dimension
                const bgW = (bgImg.naturalWidth / bgImg.naturalHeight) * bgScale;
                const bgH = bgScale;
                const bgX = (width - bgW) / 2;
                const bgY = (height - bgH) / 2;

                mainCtx.globalAlpha = 0.15; // Subtle watermark (15%)
                mainCtx.drawImage(bgImg, bgX, bgY, bgW, bgH);
                mainCtx.restore();
            }

            // --- LAYER 2: SUBJECT (Filtered) ---
            // Create offscreen canvas for the subject to apply filters independently
            const offCanvas = document.createElement('canvas');
            offCanvas.width = width;
            offCanvas.height = height;
            const offCtx = offCanvas.getContext('2d');
            if (!offCtx) return;

            // 1. Draw Original Image (Subject)
            offCtx.drawImage(img, 0, 0, width, height);

            // 1b. Capture Original Pixels (for Masking logic)
            const originalData = offCtx.getImageData(0, 0, width, height).data;

            // 2. APPLY FACTORY FINISH ENGINE V12 (Re-Lighting)
            if (displayColor !== 'transparent' && displayColor !== '#ffffff') {
                offCtx.save();

                // STEP A: PRIMER COAT (Normal)
                offCtx.globalCompositeOperation = 'source-over';
                offCtx.globalAlpha = 0.65;
                offCtx.fillStyle = displayColor;
                offCtx.fillRect(0, 0, width, height);

                // STEP B: TEXTURE INJECTION (Multiply)
                offCtx.globalCompositeOperation = 'multiply';
                offCtx.globalAlpha = 0.6;
                offCtx.drawImage(img, 0, 0, width, height);

                // STEP C: HIGHLIGHT RESTORATION (Screen)
                offCtx.globalCompositeOperation = 'screen';
                offCtx.globalAlpha = 0.5;
                offCtx.drawImage(img, 0, 0, width, height);

                // STEP D: COLOR VIBRANCE (Color)
                offCtx.globalCompositeOperation = 'color';
                offCtx.globalAlpha = 0.4;
                offCtx.fillRect(0, 0, width, height);

                // Clip to Object Bounds (This is what was deleting the background before!)
                // Now it only clips the offscreen canvas, preserving transparency around the subject
                offCtx.globalCompositeOperation = 'destination-in';
                offCtx.globalAlpha = 1.0;
                offCtx.drawImage(img, 0, 0, width, height);

                offCtx.restore();

                // 3. SMART MASKING V13 (Broad Spectrum Sticker Shield) 🛡️
                const tintedImageData = offCtx.getImageData(0, 0, width, height);
                const tintedPixels = tintedImageData.data;

                for (let i = 0; i < originalData.length; i += 4) {
                    const rO = originalData[i];
                    const gO = originalData[i + 1];
                    const bO = originalData[i + 2];
                    const a = originalData[i + 3];

                    if (a === 0) continue;

                    const luma = 0.299 * rO + 0.587 * gO + 0.114 * bO;
                    const max = Math.max(rO, gO, bO);
                    const min = Math.min(rO, gO, bO);
                    const saturation = max - min;

                    let protection = 0.0;

                    if (luma > 85 && saturation < 90) {
                        const lumaFactor = Math.min((luma - 85) / 65, 1.0);
                        const satFactor = (90 - saturation) / 90;
                        protection = Math.max(protection, lumaFactor * satFactor * 1.5);
                    }

                    if (luma > 240) protection = 1.0;

                    if (protection > 0) {
                        protection = Math.min(protection, 1.0);
                        tintedPixels[i] = tintedPixels[i] * (1 - protection) + rO * protection;
                        tintedPixels[i + 1] = tintedPixels[i + 1] * (1 - protection) + gO * protection;
                        tintedPixels[i + 2] = tintedPixels[i + 2] * (1 - protection) + bO * protection;
                    }
                }
                offCtx.putImageData(tintedImageData, 0, 0);
            }

            // --- COMPOSITE: Draw Filtered Subject onto Main Canvas ---
            mainCtx.drawImage(offCanvas, 0, 0);

            onCanvasReady(mainCanvas);
        };

        // Wait for main image
        img.onload = () => {
            if (backgroundImage) {
                if (bgImg.complete) {
                    render();
                } else {
                    bgImg.onload = render;
                }
            } else {
                render();
            }
        };

    }, [image, backgroundImage, displayColor, onCanvasReady]);

    if (!image) return null;

    return (
        <div className="w-full rounded-2xl overflow-hidden border border-industrial-border bg-industrial-bg shadow-xl relative group">
            <canvas ref={canvasRef} className="w-full h-auto block" />

            {/* SHIELD BADGE */}
            <div className={`absolute top-4 right-4 bg-black/50 backdrop-blur text-white text-[10px] px-2 py-1 rounded transition-opacity duration-300 ${isPainting ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                Shield V13 (Broad Spectrum)
            </div>

            {/* PAINTING OVERLAY ANIMATION */}
            {isPainting && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] z-20">
                    <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-300">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-brand-accent rounded-full border-t-transparent animate-spin"></div>
                            <div
                                className="absolute inset-2 rounded-full opacity-50 animate-pulse"
                                style={{ backgroundColor: color }}
                            ></div>
                        </div>
                        <div className="px-4 py-2 bg-industrial-surface/90 rounded-full border border-industrial-border shadow-2xl backdrop-blur-md">
                            <p className="text-xs font-bold uppercase tracking-widest text-white animate-pulse">
                                Aplicando Tinta...
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
