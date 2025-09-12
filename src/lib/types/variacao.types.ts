export const tipoVariacao = [
  "Cor",
  "Tamanho",
  "Acabamento",
  "Voltagem",
] as const;
export type TypeTipoVariacao = (typeof tipoVariacao)[number];
