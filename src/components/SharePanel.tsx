import { useState } from 'react';
import { Share2, Download, Check } from 'lucide-react';
import { APP_CONFIG } from '../lib/constants';

interface SharePanelProps {
    canvas: HTMLCanvasElement | null;
    selectedColorName: string;
}

export function SharePanel({ canvas, selectedColorName }: SharePanelProps) {
    const [isSharing, setIsSharing] = useState(false);

    // Helper to convert canvas to blob
    const getCanvasBlob = async (quality = 0.9): Promise<Blob | null> => {
        return new Promise(resolve => canvas?.toBlob(resolve, 'image/png', quality));
    };

    const handleShare = async () => {
        if (!canvas) return;
        setIsSharing(true);

        try {
            const blob = await getCanvasBlob();
            if (!blob) throw new Error('Falha ao gerar imagem');

            const file = new File([blob], `filtro-${selectedColorName}.png`, { type: 'image/png' });

            // Web Share API v2 (Supports files)
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Filtro Colorido',
                    text: `${APP_CONFIG.defaultMessage} Cor: ${selectedColorName}`,
                });
            } else {
                // Fallback: Check if we are on mobile (trying to share) or desktop
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

                if (isMobile) {
                    // On mobile without share API, we try to open image in new tab or download
                    handleDownload();
                    alert('Seu navegador não suporta compartilhamento direto. A imagem foi baixada.');
                } else {
                    // Desktop fallback
                    handleDownload();
                    const text = encodeURIComponent(`${APP_CONFIG.defaultMessage} (Veja a imagem baixada)`);
                    window.open(`https://wa.me/?text=${text}`, '_blank');
                }
            }
        } catch (error) {
            console.error('Share failed:', error);
            // If share fails, try to just download
            handleDownload();
        } finally {
            setIsSharing(false);
        }
    };

    const handleDownload = () => {
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `filtro-${selectedColorName}.png`;
        link.href = canvas.toDataURL('image/png', 0.9);
        link.click();
    };

    return (
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-industrial-border">
            <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-industrial-surface border border-industrial-border font-medium text-industrial-text hover:bg-industrial-border transition-colors group"
            >
                <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                Baixar
            </button>

            <button
                onClick={handleShare}
                disabled={isSharing}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white font-medium shadow-lg shadow-brand-accent/20 transition-all active:scale-95"
            >
                {isSharing ? (
                    <Check className="w-5 h-5" />
                ) : (
                    <Share2 className="w-5 h-5" />
                )}
                {isSharing ? 'Enviado' : 'Enviar Whats'}
            </button>
        </div>
    );
}
