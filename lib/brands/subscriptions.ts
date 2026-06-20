export type SubscriptionBrand = {
  id: string;
  label: string;
  color: string;
  bgColor?: string;
  /** ID para lazy-load via simple-icons (ex: "netflix" → SiNetflix) */
  iconId?: string;
  lucideIcon?: "dumbbell" | "wifi" | "home" | "repeat";
};

/** Ordem importa: matches mais específicos primeiro */
export const SUBSCRIPTION_BRANDS: Array<{
  id: string;
  keywords: string[];
  brand: SubscriptionBrand;
}> = [
  {
    id: "netflix",
    keywords: ["netflix"],
    brand: { id: "netflix", label: "Netflix", color: "#E50914", iconId: "netflix" },
  },
  {
    id: "spotify",
    keywords: ["spotify"],
    brand: { id: "spotify", label: "Spotify", color: "#1DB954", iconId: "spotify" },
  },
  {
    id: "icloud",
    keywords: ["icloud"],
    brand: { id: "icloud", label: "iCloud", color: "#3693F3", iconId: "icloud" },
  },
  {
    id: "apple",
    keywords: ["apple", "apple music", "apple tv"],
    brand: {
      id: "apple",
      label: "Apple",
      color: "#000000",
      bgColor: "#1a1a1a",
      iconId: "apple",
    },
  },
  {
    id: "youtube",
    keywords: ["youtube", "youtube premium", "yt premium"],
    brand: { id: "youtube", label: "YouTube", color: "#FF0000", iconId: "youtube" },
  },
  {
    id: "hbomax",
    keywords: ["hbo max", "hbomax", "max streaming"],
    brand: { id: "hbomax", label: "HBO Max", color: "#B535F6", iconId: "hbomax" },
  },
  {
    id: "hbo",
    keywords: ["hbo"],
    brand: {
      id: "hbo",
      label: "HBO",
      color: "#000000",
      bgColor: "#1a1a1a",
      iconId: "hbo",
    },
  },
  {
    id: "crunchyroll",
    keywords: ["crunchyroll"],
    brand: {
      id: "crunchyroll",
      label: "Crunchyroll",
      color: "#F47521",
      iconId: "crunchyroll",
    },
  },
  {
    id: "deezer",
    keywords: ["deezer"],
    brand: { id: "deezer", label: "Deezer", color: "#FEAA2D", iconId: "deezer" },
  },
  {
    id: "notion",
    keywords: ["notion"],
    brand: {
      id: "notion",
      label: "Notion",
      color: "#000000",
      bgColor: "#1a1a1a",
      iconId: "notion",
    },
  },
  {
    id: "github",
    keywords: ["github"],
    brand: {
      id: "github",
      label: "GitHub",
      color: "#FFFFFF",
      bgColor: "#181717",
      iconId: "github",
    },
  },
  {
    id: "dropbox",
    keywords: ["dropbox"],
    brand: { id: "dropbox", label: "Dropbox", color: "#0061FF", iconId: "dropbox" },
  },
  {
    id: "google",
    keywords: ["google one", "google drive", "google workspace"],
    brand: { id: "google", label: "Google", color: "#4285F4", iconId: "google" },
  },
  {
    id: "vivo",
    keywords: ["vivo", "vivo fibra", "vivo internet"],
    brand: { id: "vivo", label: "Vivo", color: "#660099", iconId: "vivo" },
  },
  {
    id: "telegram",
    keywords: ["telegram", "telegram premium"],
    brand: { id: "telegram", label: "Telegram", color: "#26A5E4", iconId: "telegram" },
  },
  {
    id: "whatsapp",
    keywords: ["whatsapp"],
    brand: { id: "whatsapp", label: "WhatsApp", color: "#25D366", iconId: "whatsapp" },
  },
  {
    id: "smartfit",
    keywords: ["smart fit", "smartfit", "academia"],
    brand: {
      id: "smartfit",
      label: "Academia",
      color: "#F97316",
      lucideIcon: "dumbbell",
    },
  },
  {
    id: "internet",
    keywords: ["internet", "fibra", "banda larga", "wi-fi", "wifi"],
    brand: {
      id: "internet",
      label: "Internet",
      color: "#3B82F6",
      lucideIcon: "wifi",
    },
  },
  {
    id: "aluguel",
    keywords: ["aluguel", "condomínio", "condominio"],
    brand: {
      id: "aluguel",
      label: "Moradia",
      color: "#8B5CF6",
      lucideIcon: "home",
    },
  },
];

export function resolveSubscriptionBrand(description: string): SubscriptionBrand | null {
  const normalized = description
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  for (const entry of SUBSCRIPTION_BRANDS) {
    if (entry.keywords.some((kw) => normalized.includes(kw))) {
      return entry.brand;
    }
  }

  return null;
}
