export const isProduction = import.meta.env.MODE === 'production'
export const baseUrl = isProduction ? '/tuan' : ''