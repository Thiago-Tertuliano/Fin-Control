declare module "@edusites/bancos-brasil/src/core.js" {
  export function svgBanco(slug: string): string | null;
  export function listarBancos(): Array<{ slug: string; name: string }>;
  export function obterPreset(slug: string): { color?: string } | null;
}
