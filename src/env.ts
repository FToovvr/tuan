export const isProduction = import.meta.env.MODE === "production";
export const entrypoint = isProduction ? "/tuan" : "";
