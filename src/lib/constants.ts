export const FILTER_COLORS = [
    { name: 'Original', value: 'transparent', hex: 'transparent' },
    // Primárias
    { name: 'Vermelho Puro', value: '#dc2626', hex: '#dc2626' }, // Red-600
    { name: 'Azul Real', value: '#2563eb', hex: '#2563eb' }, // Blue-600
    { name: 'Amarelo Ouro', value: '#ca8a04', hex: '#ca8a04' }, // Yellow-600 (Darker for visibility)

    // Secundárias & Populares
    { name: 'Verde Bandeira', value: '#16a34a', hex: '#16a34a' }, // Green-600
    { name: 'Laranja Vivo', value: '#ea580c', hex: '#ea580c' }, // Orange-600
    { name: 'Roxo Profundo', value: '#7c3aed', hex: '#7c3aed' }, // Violet-600

    // Especiais/Automotivos
    { name: 'Preto Fosco', value: '#171717', hex: '#171717' },
    { name: 'Cinza Titânio', value: '#475569', hex: '#475569' },
    { name: 'Rosa Choque', value: '#db2777', hex: '#db2777' },
    { name: 'Ciano Turbo', value: '#06b6d4', hex: '#06b6d4' },
    { name: 'Marrom Café', value: '#78350f', hex: '#78350f' },

    { name: 'Branco Puro', value: '#ffffff', hex: '#ffffff' },
];

export const APP_CONFIG = {
    whatsappPhone: '', // Vendor can configure this potentially, or generic share
    defaultMessage: 'Olha como ficou o filtro na cor que você escolheu!',
};
