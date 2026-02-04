import { Wand2, Loader2 } from 'lucide-react';

interface BackgroundRemoverProps {
    onRemove: () => void;
    isLoading: boolean;
    progress: string;
    processed: boolean;
}

export function BackgroundRemover({ onRemove, isLoading, progress, processed }: BackgroundRemoverProps) {
    if (processed) return null; // Hide if already processed

    return (
        <div className="bg-industrial-surface/50 border border-industrial-border rounded-xl p-4 flex flex-col items-center gap-3">
            <div className="text-center">
                <h4 className="text-sm font-medium text-industrial-text">Fundo com cenário?</h4>
                <p className="text-xs text-industrial-muted">
                    Use nossa IA para limpar o fundo e deixar o filtro perfeito.
                </p>
            </div>

            <button
                onClick={onRemove}
                disabled={isLoading}
                className={`
          relative w-full py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all
          ${isLoading
                        ? 'bg-industrial-border text-industrial-muted cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-purple-500/20'
                    }
        `}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {progress || 'Processando...'}
                    </>
                ) : (
                    <>
                        <Wand2 className="w-4 h-4" />
                        Remover Fundo (Mágico)
                    </>
                )}
            </button>
        </div>
    );
}
