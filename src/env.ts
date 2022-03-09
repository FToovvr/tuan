export const isProduction = import.meta.env.MODE === "production";
export const assetBaseUrl = isProduction ? "/tuan" : "";
