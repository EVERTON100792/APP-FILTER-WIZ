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
        setProgress('Iniciando Inteligência Artificial...');

        try {
            // Config for @imgly
            const config: any = {
                progress: (_key: string, current: number, total: number) => {
                    const percent = Math.round((current / total) * 100);
                    setProgress(`Processando: ${percent}%`);
                },
                debug: true
            };

            // We need to pass the blob or url to imgly
            const blob = await removeBackground(imageState.originalUrl, config);
            const url = URL.createObjectURL(blob);

            setImageState(prev => ({
                ...prev,
                processedUrl: url,
                isAiProcessed: true
            }));

        } catch (error) {
            console.error('AI Removal Failed:', error);
            alert('Erro ao remover fundo. Tente novamente ou verifique sua conexão.');
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
