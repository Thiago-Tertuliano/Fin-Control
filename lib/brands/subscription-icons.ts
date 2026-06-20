import type { IconType } from "@icons-pack/react-simple-icons";

/** Carrega ícones sob demanda — evita importar 13k+ ícones no boot do dev server */
export const SUBSCRIPTION_ICON_LOADERS: Record<
  string,
  () => Promise<{ default: IconType }>
> = {
  netflix: () =>
    import("@icons-pack/react-simple-icons/icons/SiNetflix").then((m) => ({
      default: m.default,
    })),
  spotify: () =>
    import("@icons-pack/react-simple-icons/icons/SiSpotify").then((m) => ({
      default: m.default,
    })),
  icloud: () =>
    import("@icons-pack/react-simple-icons/icons/SiIcloud").then((m) => ({
      default: m.default,
    })),
  apple: () =>
    import("@icons-pack/react-simple-icons/icons/SiApple").then((m) => ({
      default: m.default,
    })),
  youtube: () =>
    import("@icons-pack/react-simple-icons/icons/SiYoutube").then((m) => ({
      default: m.default,
    })),
  hbomax: () =>
    import("@icons-pack/react-simple-icons/icons/SiHbomax").then((m) => ({
      default: m.default,
    })),
  hbo: () =>
    import("@icons-pack/react-simple-icons/icons/SiHbo").then((m) => ({
      default: m.default,
    })),
  crunchyroll: () =>
    import("@icons-pack/react-simple-icons/icons/SiCrunchyroll").then((m) => ({
      default: m.default,
    })),
  deezer: () =>
    import("@icons-pack/react-simple-icons/icons/SiDeezer").then((m) => ({
      default: m.default,
    })),
  notion: () =>
    import("@icons-pack/react-simple-icons/icons/SiNotion").then((m) => ({
      default: m.default,
    })),
  github: () =>
    import("@icons-pack/react-simple-icons/icons/SiGithub").then((m) => ({
      default: m.default,
    })),
  dropbox: () =>
    import("@icons-pack/react-simple-icons/icons/SiDropbox").then((m) => ({
      default: m.default,
    })),
  google: () =>
    import("@icons-pack/react-simple-icons/icons/SiGoogle").then((m) => ({
      default: m.default,
    })),
  vivo: () =>
    import("@icons-pack/react-simple-icons/icons/SiVivo").then((m) => ({
      default: m.default,
    })),
  telegram: () =>
    import("@icons-pack/react-simple-icons/icons/SiTelegram").then((m) => ({
      default: m.default,
    })),
  whatsapp: () =>
    import("@icons-pack/react-simple-icons/icons/SiWhatsapp").then((m) => ({
      default: m.default,
    })),
};

export async function loadSubscriptionIcon(
  iconId: string
): Promise<IconType | null> {
  const loader = SUBSCRIPTION_ICON_LOADERS[iconId];
  if (!loader) return null;
  const mod = await loader();
  return mod.default;
}
