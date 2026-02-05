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

            // 2. ENGINE V30: "3D VOLUME RECOVERY" (Smart Shield + 3D Coat)
            if (displayColor !== 'transparent' && displayColor !== '#ffffff') {

                // --- STAGE 0: PRIMER (Grayscale Luma) ---
                const grayData = offCtx.createImageData(width, height);
                for (let i = 0; i < originalData.length; i += 4) {
                    const r = originalData[i];
                    const g = originalData[i + 1];
                    const b = originalData[i + 2];
                    const a = originalData[i + 3];

                    if (a > 0) {
                        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                        // Boost contrast slightly on the primer to help definition
                        grayData.data[i] = gray;
                        grayData.data[i + 1] = gray;
                        grayData.data[i + 2] = gray;
                        grayData.data[i + 3] = a;
                    }
                }
                // Draw Primer (Base)
                offCtx.putImageData(grayData, 0, 0);

                offCtx.save();

                // --- STAGE 1: SHADOW DEFINITION (Multiply) ---
                // Pinta as sombras NATURAIS da peça com a cor da tinta.
                // Isso garante que a 'curva' do cilindro seja preservada.
                offCtx.globalCompositeOperation = 'multiply';
                offCtx.globalAlpha = 0.8;
                offCtx.fillStyle = displayColor;
                offCtx.fillRect(0, 0, width, height);

                // --- STAGE 2: BASE COLOR (Normal/Color) ---
                // Garante que a cor seja vibrante (Hue fix), mas com transparência para não chapar.
                offCtx.globalCompositeOperation = 'color';
                offCtx.globalAlpha = 0.75; // V32: Increased from 0.6 to 0.75 for denser color 
                offCtx.fillStyle = displayColor;
                offCtx.fillRect(0, 0, width, height);

                // --- STAGE 3: METALLIC TEXTURE (Overlay) ---
                // Reaplica a textura do PRIMER (Grayscale) por cima.
                // Isso traz de volta os arranhões, relevos e imperfeições do metal.
                offCtx.globalCompositeOperation = 'overlay';
                offCtx.globalAlpha = 0.4;
                offCtx.drawImage(offCanvas, 0, 0); // Desenha o próprio grayscale sobre si mesmo

                // --- STAGE 4: SPECULAR SHINE (Smart Gloss) ---
                // Apenas os brilhos intensos originais.
                offCtx.globalCompositeOperation = 'screen';
                offCtx.globalAlpha = 0.5;
                offCtx.drawImage(img, 0, 0, width, height);

                // --- STAGE 5: FINAL TINT (Soft Light) ---
                // Um banho final de luz colorida para integrar tudo.
                offCtx.globalCompositeOperation = 'soft-light';
                offCtx.globalAlpha = 0.15; // V32: Reduced from 0.3 to prevent washing out details
                offCtx.fillStyle = displayColor;
                offCtx.fillRect(0, 0, width, height);


                // Clip to Object Bounds
                offCtx.globalCompositeOperation = 'destination-in';
                offCtx.globalAlpha = 1.0;
                offCtx.drawImage(img, 0, 0, width, height);

                offCtx.restore();

                // 3. SMART MASKING V30 (Glass & Chrome Protocol) 🛡️
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

                    // CRITERIA A: GLASS / NEUTRAL AREAS (Visores, Cromados, Etiquetas)
                    // Coisas que não tem cor (Saturação baixa) não devem ser pintadas.
                    // Antes era < 0.15, agora < 0.22 para pegar mais 'vidro sujo' e metais.
                    // E ignoramos coisas muito escuras (Luma < 40) pois podem ser sombras profundas pintadas.
                    if (saturation < 0.22 && luma > 40) {
                        protection = 1.0;

                        // Smooth falloff for saturation (0.18 to 0.22)
                        // Se saturação é 0 (puro cinza), proteção 100%. Se 0.21, proteção parcial.
                        if (saturation > 0.15) {
                            protection = 1.0 - ((saturation - 0.15) / 0.07);
                        }
                    }

                    // CRITERIA B: EXTREME HIGHLIGHTS (Reflexos de Luz no Vidro)
                    else if (luma > 235) {
                        protection = 1.0; // Brilho puro = Branco
                    }

                    // CRITERIA C: DEEP BLACKS (Borrachas, frestas escuras)
                    // Se algo é quase preto puro, não adianta pintar de azul/vermelho.
                    // Mantem o preto original para contraste.
                    else if (luma < 15) {
                        protection = 0.8;
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
                Shield V30 (Sticker Shield Pro)
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
