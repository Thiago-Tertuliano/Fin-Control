// @ts-nocheck — pacote sem tipos; import relativo evita puxar Vue do entry principal
/**
 * Re-export direto do core — evita puxar o componente Vue do pacote principal.
 */
export {
  svgBanco,
  listarBancos,
  obterPreset,
} from "../../node_modules/@edusites/bancos-brasil/src/core.js";
