import { useState, useCallback } from 'react';
import { removeBackground } from '@imgly/background-removal';

export interface ImageState {
    originalUrl: string | null;
    processedUrl: string | null; // The displayed image (potentially bg-removed)
    isAiProcessed: boolean;
}

export function useImageProcessor() {
    const [imageState, setImageState] = useState<ImageState>({
        originalUrl: null,
        processedUrl: null,
        isAiProcessed: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState<string>(''); // For AI Interface

    const handleImageUpload = useCallback((file: File) => {
        const url = URL.createObjectURL(file);
        setImageState({
            originalUrl: url,
            processedUrl: url,
            isAiProcessed: false,
        });
    }, []);

    const triggerBackgroundRemoval = useCallback(async () => {
        if (!imageState.originalUrl) return;

        setIsLoading(true);
        setProgress('Otimizando imagem...');

        try {
            // 1. Resize image to prevent Mobile Crash (OOM)
            // Mobile browsers kill WASM if it uses >~300MB RAM. Large photos (12MP) trigger this.
            const resizeImageForAI = async (url: string): Promise<Blob> => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    img.onload = () => {
                        const MAX_DIM = 1500; // Safe limit for Mobile WASM
                        let width = img.width;
                        let height = img.height;

                        if (width > MAX_DIM || height > MAX_DIM) {
                            if (width > height) {
                                height *= MAX_DIM / width;
                                width = MAX_DIM;
                            } else {
                                width *= MAX_DIM / height;
                                height = MAX_DIM;
                            }
                        }

                        const canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) {
                            reject(new Error('Canvas context failed'));
                            return;
                        }
                        ctx.drawImage(img, 0, 0, width, height);
                        canvas.toBlob(blob => {
                            if (blob) resolve(blob);
                            else reject(new Error('Resize failed'));
                        }, 'image/jpeg', 0.9);
                    };
                    img.onerror = reject;
                    img.src = url;
                });
            };

            const optimizedBlob = await resizeImageForAI(imageState.originalUrl);

            // 2. Run AI on optimized image
            setProgress('Iniciando Inteligência Artificial...');

            // Config for @imgly
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const config: any = {
                progress: (_key: string, current: number, total: number) => {
                    const percent = Math.round((current / total) * 100);
                    setProgress(`Processando: ${percent}%`);
                },
                debug: true,
                device: 'gpu' // Try GPU if available
            };

            const blob = await removeBackground(optimizedBlob, config);
            const url = URL.createObjectURL(blob);

            setImageState(prev => ({
                ...prev,
                processedUrl: url,
                isAiProcessed: true
            }));

        } catch (error) {
            console.error('AI Removal Failed:', error);
            // More helpful error message
            alert('Erro ao processar imagem. O celular pode estar sem memória. Tente fechar outros apps ou usar uma foto menor.');
        } finally {
            setIsLoading(false);
            setProgress('');
        }
    }, [imageState.originalUrl]);

    // The tinting logic will be handled purely in the Canvas component for performance
    // This hook mainly manages the SOURCE image state (Raw vs AI Cleaned)

    return {
        imageState,
        isLoading,
        progress,
        handleImageUpload,
        triggerBackgroundRemoval,
    };
}
