import { useEffect, useRef } from 'react';

interface FilterCanvasProps {
    image: string | null;
    color: string;
    onCanvasReady: (canvas: HTMLCanvasElement) => void;
}

export function FilterCanvas({ image, color, onCanvasReady }: FilterCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !image) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = image;

        img.onload = () => {
            const width = img.naturalWidth;
            const height = img.naturalHeight;
            canvas.width = width;
            canvas.height = height;

            // 1. Draw Original Image
            ctx.drawImage(img, 0, 0);

            // 1b. Capture Original Pixels
            const originalData = ctx.getImageData(0, 0, width, height).data;

            // 2. APPLY FACTORY FINISH ENGINE V12 (Re-Lighting)
            // Sticking with V12 as it provides the best Texture/Color balance.
            if (color !== 'transparent' && color !== '#ffffff') {
                ctx.save();

                // STEP A: PRIMER COAT (Normal)
                ctx.globalCompositeOperation = 'source-over';
                ctx.globalAlpha = 0.75;
                ctx.fillStyle = color;
                ctx.fillRect(0, 0, width, height);

                // STEP B: TEXTURE INJECTION (Multiply)
                ctx.globalCompositeOperation = 'multiply';
                ctx.globalAlpha = 0.8;
                ctx.drawImage(img, 0, 0);

                // STEP C: HIGHLIGHT RESTORATION (Screen)
                ctx.globalCompositeOperation = 'screen';
                ctx.globalAlpha = 0.4;
                ctx.drawImage(img, 0, 0);

                // STEP D: COLOR VIBRANCE (Color)
                ctx.globalCompositeOperation = 'color';
                ctx.globalAlpha = 0.5;
                ctx.fillRect(0, 0, width, height);

                // Clip to Object Bounds
                ctx.globalCompositeOperation = 'destination-in';
                ctx.globalAlpha = 1.0;
                ctx.drawImage(img, 0, 0);

                ctx.restore();

                // 3. SMART MASKING V13 (Broad Spectrum Sticker Shield) 🛡️
                const tintedImageData = ctx.getImageData(0, 0, width, height);
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

                    // A. STICKER SHIELD V13 (Broad Spectrum) 🏷️
                    // User reported failure on white stickers.
                    // Analysis: Stickers reflect the red tank, becoming "Pinkish" (Sat > 55).
                    // Fix: Increased Saturation Tolerance to 90.
                    // Fix: Decreased Luma Threshold to 85 (handles shadows).
                    if (luma > 85 && saturation < 90) {
                        // Luma Curve: 85 -> 0%, 150 -> 100%
                        const lumaFactor = Math.min((luma - 85) / 65, 1.0);

                        // Sat Factor: 90 -> 0%, 0 -> 100%
                        const satFactor = (90 - saturation) / 90;

                        protection = Math.max(protection, lumaFactor * satFactor * 1.5); // Boosted strength
                    }

                    // B. ABSOLUTE HIGHLIGHTS ☀️
                    if (luma > 240) protection = 1.0;

                    // Apply Protection
                    if (protection > 0) {
                        protection = Math.min(protection, 1.0);
                        tintedPixels[i] = tintedPixels[i] * (1 - protection) + rO * protection;
                        tintedPixels[i + 1] = tintedPixels[i + 1] * (1 - protection) + gO * protection;
                        tintedPixels[i + 2] = tintedPixels[i + 2] * (1 - protection) + bO * protection;
                    }
                }
                ctx.putImageData(tintedImageData, 0, 0);
            }

            onCanvasReady(canvas);
        };
    }, [image, color, onCanvasReady]);

    if (!image) return null;

    return (
        <div className="w-full rounded-2xl overflow-hidden border border-industrial-border bg-industrial-bg shadow-xl relative group">
            <canvas ref={canvasRef} className="w-full h-auto block" />
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Shield V13 (Broad Spectrum)
            </div>
        </div>
    );
}
