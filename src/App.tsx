import { useState } from 'react';
import { Layout } from './components/Layout';
import { ImageUploader } from './components/ImageUploader';
import { ColorControls } from './components/ColorControls';
import { FilterCanvas } from './components/FilterCanvas';
import { SharePanel } from './components/SharePanel';
import { BackgroundRemover } from './components/BackgroundRemover';
import { useImageProcessor } from './hooks/useImageProcessor';
import { FILTER_COLORS } from './lib/constants';
import { RefreshCw, Sparkles } from 'lucide-react';

import bgFilpar from './assets/bg-filpar.png';

function App() {
  const {
    imageState,
    isLoading,
    progress,
    handleImageUpload,
    triggerBackgroundRemoval
  } = useImageProcessor();

  const [selectedColor, setSelectedColor] = useState(FILTER_COLORS[0].value);
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);

  const selectedColorName = FILTER_COLORS.find(c => c.value === selectedColor)?.name || 'Custom';

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">

        {!imageState.originalUrl ? (
          /* Empty State */
          <div className="space-y-4 max-w-md mx-auto">
            <div className="bg-industrial-surface rounded-xl p-6 border border-industrial-border shadow-sm">
              <h2 className="text-xl font-bold mb-2">Novo Projeto</h2>
              <p className="text-industrial-muted mb-6">
                Tire uma foto do filtro em um fundo claro ou faça upload para começar.
              </p>
              <ImageUploader onImageSelected={handleImageUpload} />
            </div>
          </div>
        ) : (
          /* Editor State - Responsive Layout */
          <div className="lg:grid lg:grid-cols-[1.3fr_1fr] lg:gap-8 lg:items-start max-w-6xl mx-auto">

            {/* LEFT COLUMN: Canvas Preview (Sticky on Desktop) 🖼️ */}
            <div className="space-y-4 lg:sticky lg:top-24 mb-6 lg:mb-0 z-30">
              {/* Mobile/Desktop Toolbar */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" /> Editor
                </h2>
                <button
                  onClick={() => window.location.reload()}
                  className="text-xs text-industrial-muted hover:text-brand-accent flex items-center gap-1 bg-industrial-surface px-3 py-1.5 rounded-full border border-industrial-border transition-colors hidden lg:flex"
                >
                  <RefreshCw className="w-3 h-3" /> Nova Foto
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="lg:hidden text-xs text-industrial-muted hover:text-brand-accent flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Nova
                </button>
              </div>

              {/* Canvas Box */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl glass-panel group">
                <FilterCanvas
                  image={imageState.processedUrl}
                  backgroundImage={imageState.isAiProcessed ? bgFilpar : null}
                  color={selectedColor}
                  onCanvasReady={setCanvasRef}
                />

                {/* SCANNER ANIMATION OVERLAY 🔦 */}
                {isLoading && (
                  <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center">
                    <div className="absolute left-0 right-0 h-1 bg-brand-accent shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-scan z-10 w-full will-change-[top,opacity]" />
                    <div className="bg-industrial-surface/90 border border-brand-accent/30 backdrop-blur-md px-6 py-4 rounded-xl shadow-2xl flex flex-col items-center gap-3 relative z-20">
                      <div className="w-8 h-8 rounded-full border-2 border-brand-accent border-r-transparent animate-spin" />
                      <div className="text-center">
                        <p className="font-bold text-brand-accent tracking-wider text-sm uppercase">Analisando</p>
                        <p className="text-xs text-industrial-muted mt-1 font-mono">{progress || 'Processando...'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile-only Hint */}
              <p className="lg:hidden text-[10px] text-center text-industrial-muted">
                Toque na imagem para ampliar • Role para editar
              </p>
            </div>

            {/* RIGHT COLUMN: Controls (Scrollable) 🎛️ */}
            <div className="space-y-6 lg:pt-11">

              {/* 1. AI Tools */}
              {!imageState.isAiProcessed && (
                <div className="bg-industrial-surface/30 border border-dashed border-industrial-border rounded-xl p-4 hover:border-brand-accent/30 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-semibold text-industrial-muted uppercase">Ferramentas de Fundo</span>
                  </div>

                  <BackgroundRemover
                    onRemove={triggerBackgroundRemoval}
                    isLoading={isLoading}
                    progress={progress}
                    processed={imageState.isAiProcessed}
                  />
                </div>
              )}

              {/* 2. Color Studio */}
              <div className="bg-industrial-surface rounded-2xl p-5 border border-industrial-border space-y-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-accent/20 to-transparent" />

                <div className="text-center pb-2 border-b border-industrial-border/50">
                  <p className="text-xs text-industrial-muted uppercase tracking-wider font-semibold">
                    Selecione a cor do filtro
                  </p>
                </div>

                <ColorControls
                  selectedColor={selectedColor}
                  onColorChange={setSelectedColor}
                />

                <SharePanel
                  canvas={canvasRef}
                  selectedColorName={selectedColorName}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default App;
