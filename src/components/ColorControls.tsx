import { useState, useMemo } from 'react';
import { FILTER_COLORS } from '../lib/constants';
import { Palette, Search, SlidersHorizontal, Check } from 'lucide-react';

interface ColorControlsProps {
    selectedColor: string;
    onColorChange: (color: string) => void;
}

export function ColorControls({ selectedColor, onColorChange }: ColorControlsProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showCustomPicker, setShowCustomPicker] = useState(false);

    // Filter colors based on search term
    const filteredColors = useMemo(() => {
        return FILTER_COLORS.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const isCustomColor = !FILTER_COLORS.some(c => c.value === selectedColor);

    return (
        <div className="space-y-4">
            {/* Header + Search */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-industrial-muted flex items-center gap-2">
                        <Palette className="w-4 h-4" /> Paleta de Cores
                    </label>
                    <span className="text-xs text-brand-accent font-medium">
                        {isCustomColor ? 'Personalizada' : (FILTER_COLORS.find(c => c.value === selectedColor)?.name || 'Selecionada')}
                    </span>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-industrial-muted" />
                    <input
                        type="text"
                        placeholder="Buscar cor (ex: Vermelho, Ouro)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-industrial-bg border border-industrial-border rounded-lg pl-9 pr-3 py-2 text-sm text-industrial-text focus:outline-none focus:ring-2 focus:ring-brand-accent/50 transition-all placeholder:text-industrial-muted/50"
                    />
                </div>
            </div>

            {/* Custom Color Picker (Draggable) */}
            <div className="bg-industrial-bg/50 p-3 rounded-xl border border-industrial-border/50">
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => document.getElementById('custom-color-input')?.click()}
                >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 via-green-500 to-blue-500 border border-white/20 shadow-lg group-hover:scale-105 transition-transform relative overflow-hidden">
                        <input
                            id="custom-color-input"
                            type="color"
                            value={isCustomColor ? selectedColor : '#000000'}
                            onChange={(e) => onColorChange(e.target.value)}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-semibold text-industrial-text group-hover:text-brand-accent transition-colors">Criar Cor Personalizada</p>
                        <p className="text-[10px] text-industrial-muted">Clique para arrastar e misturar</p>
                    </div>
                    <SlidersHorizontal className="w-4 h-4 text-industrial-muted group-hover:text-brand-accent" />
                </div>
            </div>

            {/* Color Grid */}
            <div className="grid grid-cols-5 gap-3 max-h-48 overflow-y-auto pr-1 customize-scrollbar">
                {filteredColors.map((color) => (
                    <button
                        key={color.value}
                        onClick={() => onColorChange(color.value)}
                        className={`
              relative w-full aspect-square rounded-full transition-all duration-300
              ${selectedColor === color.value
                                ? 'scale-110 ring-2 ring-brand-accent ring-offset-2 ring-offset-industrial-bg shadow-lg shadow-brand-accent/20'
                                : 'hover:scale-105 hover:opacity-90'
                            }
            `}
                        style={{
                            backgroundColor: color.hex,
                            border: color.value === '#ffffff' ? '1px solid #27272a' : 'none'
                        }}
                        aria-label={color.name}
                        title={color.name}
                    >
                        {color.value === 'transparent' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-full h-px bg-red-500 rotate-45" />
                            </div>
                        )}
                        {selectedColor === color.value && color.value !== 'transparent' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Check className={`w-3 h-3 ${color.value === '#ffffff' || color.value === '#FFFDD0' ? 'text-black' : 'text-white'}`} />
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {filteredColors.length === 0 && (
                <p className="text-center text-xs text-industrial-muted py-4">Nenhuma cor encontrada.</p>
            )}
        </div>
    );
}
