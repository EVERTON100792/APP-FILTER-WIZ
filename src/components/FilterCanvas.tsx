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

            // --- LAYER 1: BACKGROUND (REMOVED as per user request) ---
            mainCtx.clearRect(0, 0, width, height);

            // --- LAYER 2: SUBJECT (Filtered) ---
            // Create offscreen canvas for the subject to apply filters independently
            const offCanvas = document.createElement('canvas');
            offCanvas.width = width;
            offCanvas.height = height;
            const offCtx = offCanvas.getContext('2d');
            if (!offCtx) return;

            // 1. Draw Original Image (Subject)
            offCtx.drawImage(img, 0, 0, width, height);

            const originalImageData = offCtx.getImageData(0, 0, width, height);
            const originalData = originalImageData.data;

            // 2. ENGINE V33: "REALISTIC INDUSTRIAL" (Solid & Deep)
            if (displayColor !== 'transparent' && displayColor !== '#ffffff') {

                // --- STAGE 0: PRIMER (Grayscale Luma) ---
                // Base neutra para receber a cor
                const grayData = offCtx.createImageData(width, height);
                for (let i = 0; i < originalData.length; i += 4) {
                    const r = originalData[i];
                    const g = originalData[i + 1];
                    const b = originalData[i + 2];
                    const a = originalData[i + 3];

                    if (a > 0) {
                        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                        // Boost contrast slightly
                        grayData.data[i] = gray;
                        grayData.data[i + 1] = gray;
                        grayData.data[i + 2] = gray;
                        grayData.data[i + 3] = a;
                    }
                }
                offCtx.putImageData(grayData, 0, 0);

                offCtx.save();

                // --- STAGE 1: SOLID COLOR BASE (Multiply) ---
                // Aumentado para dar profundidade e cor real
                offCtx.globalCompositeOperation = 'multiply';
                offCtx.globalAlpha = 0.9; // V33: Aumentado para 0.9 (Era 0.8)
                offCtx.fillStyle = displayColor;
                offCtx.fillRect(0, 0, width, height);

                // --- STAGE 2: VIBRANCE (Color Burn / Color) ---
                // Garante que a cor não fique "lavada" pelo cinza
                offCtx.globalCompositeOperation = 'color';
                offCtx.globalAlpha = 0.8; // V33: Aumentado para 0.8
                offCtx.fillStyle = displayColor;
                offCtx.fillRect(0, 0, width, height);

                // --- STAGE 3: TEXTURE RECOVERY (Overlay) ---
                // Traz de volta os detalhes metálicos, mas suave
                offCtx.globalCompositeOperation = 'overlay';
                offCtx.globalAlpha = 0.35;
                offCtx.drawImage(offCanvas, 0, 0);

                // --- STAGE 4: HIGHLIGHTS (Screen) ---
                // Apenas os brilhos mais fortes
                offCtx.globalCompositeOperation = 'screen';
                offCtx.globalAlpha = 0.4; // Reduzido um pouco para não lavar a cor
                offCtx.drawImage(img, 0, 0, width, height);

                // Clip to Object Bounds
                offCtx.globalCompositeOperation = 'destination-in';
                offCtx.globalAlpha = 1.0;
                offCtx.drawImage(img, 0, 0, width, height);

                offCtx.restore();

                // 3. SMART MASKING V33 (Realistic Industrial) 🛡️
                const finalImageData = offCtx.getImageData(0, 0, width, height);
                const finalPixels = finalImageData.data;

                for (let i = 0; i < originalData.length; i += 4) {
                    const rO = originalData[i];
                    const gO = originalData[i + 1];
                    const bO = originalData[i + 2];
                    const a = originalData[i + 3];

                    if (a === 0) continue;

                    const luma = 0.299 * rO + 0.587 * gO + 0.114 * bO;
                    const max = Math.max(rO, gO, bO);
                    const min = Math.min(rO, gO, bO);
                    const saturation = max === 0 ? 0 : (max - min) / max;

                    let protection = 0.0;

                    // CRITERIA A: GLASS / NEUTRAL AREAS
                    // V33: Reduzido drasticamente o limite de saturação.
                    // Isso permite pintar metais cinzentos (saturation ~0.05 a 0.10) que antes eram protegidos.
                    // Só protege o que é MUITO cinza/vidro ou muito claro.
                    if (saturation < 0.10 && luma > 50) {
                        // Falloff mais suave
                        if (saturation < 0.05) protection = 0.9;
                        else protection = 0.5;
                    }

                    // CRITERIA B: EXTREME HIGHLIGHTS (Vidros Estourados)
                    if (luma > 240) {
                        protection = 1.0;
                    }

                    // CRITERIA C: DEEP BLACKS
                    // Mantem apenas o preto absoluto
                    else if (luma < 10) {
                        protection = 0.9;
                    }

                    if (protection > 0) {
                        protection = Math.min(protection, 1.0);
                        // Restore original pixel
                        finalPixels[i] = finalPixels[i] * (1 - protection) + rO * protection;
                        finalPixels[i + 1] = finalPixels[i + 1] * (1 - protection) + gO * protection;
                        finalPixels[i + 2] = finalPixels[i + 2] * (1 - protection) + bO * protection;
                    }
                }
                offCtx.putImageData(finalImageData, 0, 0);
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
        <div
            className="w-full rounded-2xl overflow-hidden border border-industrial-border bg-zinc-800 shadow-xl relative group"
        >
            <canvas ref={canvasRef} className="w-full h-auto block" />

            {/* SHIELD BADGE */}
            <div className={`absolute top-4 right-4 bg-black/50 backdrop-blur text-white text-[10px] px-2 py-1 rounded transition-opacity duration-300 ${isPainting ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                Shield V15 (Sticker Shield Pro)
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
