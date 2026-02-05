export const FILTER_COLORS = [
    { name: 'Original', value: 'transparent', hex: 'transparent' },

    // CORES INDUSTRIAIS (Padrão de Fábrica)
    // Cores ajustadas para mistura com Primer Grayscale
    { name: 'Azul Industrial', value: '#0047AB', hex: '#0047AB' }, // Azul Cobalto Puro (Deep Blue) - Corrige o Roxo
    { name: 'Vermelho Ferrari', value: '#CC0000', hex: '#CC0000' }, // Vermelho sangue denso (Updated V32)
    { name: 'Amarelo Caterpillar', value: '#FFC300', hex: '#FFC300' }, // Ouro industrial
    { name: 'Verde John Deere', value: '#368F2B', hex: '#368F2B' }, // Verde trator
    { name: 'Laranja Safety', value: '#FF5400', hex: '#FF5400' }, // Laranja segurança

    // TONS PREMIUM
    { name: 'Roxo Metálico', value: '#7209B7', hex: '#7209B7' },
    { name: 'Rosa Choque', value: '#F72585', hex: '#F72585' },
    { name: 'Turquesa Oceano', value: '#4CC9F0', hex: '#4CC9F0' },
    { name: 'Vinho Bordeaux', value: '#641220', hex: '#641220' },
    { name: 'Verde Petróleo', value: '#064E3B', hex: '#064E3B' },

    // NEUTROS & METAIS
    { name: 'Preto Piano', value: '#0a0a0a', hex: '#0a0a0a' }, // Quase preto absoluto
    { name: 'Cinza Espacial', value: '#4B5563', hex: '#4B5563' },
    { name: 'Prata Lunar', value: '#E5E7EB', hex: '#E5E7EB' },
    { name: 'Cobre/Bronze', value: '#9A3B3B', hex: '#9A3B3B' }, // Ajustado para ser mais visível
    { name: 'Branco Alumínio', value: '#F3F4F6', hex: '#F3F4F6' },
];

export const APP_CONFIG = {
    whatsappPhone: '', // Vendor can configure this potentially, or generic share
    defaultMessage: '',
};
