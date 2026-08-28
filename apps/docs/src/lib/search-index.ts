import type { CommandPaletteEntry } from "@skryensya/core/command-palette";
import { localizePath, useTranslations, type Locale } from "../i18n";
import { getNavigation } from "./navigation";

/*
 * Search sees the complete library. The catalogue is a view, not a rail category, but remains a
 * deliberate result for people who want to browse rather than arrive with a component name. Kept as
 * a module because Base uses only the URL now, while the JSON endpoints own the data bytes.
 */
export function buildSearchIndex(locale: Locale): CommandPaletteEntry[] {
  const t = useTranslations(locale);
  const navigation = getNavigation(locale);

  return [
    ...navigation.flatMap((section) =>
      section.groups.flatMap((group) =>
        group.items
          .filter((item) => !item.todo)
          .map((item) => ({
            label: item.label,
            aliases: item.aliases ?? [],
            href: item.href,
            section: section.section,
            group: group.group,
          })),
      ),
    ),
    {
      label: t("search.exploreComponents"),
      aliases: ["all", "catalog", "catálogo", "todos"],
      href: localizePath("/componentes", locale),
      section: t("section.components"),
      group: t("group.explore"),
    },
    {
      label: t("search.layoutGuide"),
      aliases: ["overview", "primitivas", "resumen"],
      href: localizePath("/componentes/primitivas", locale),
      section: t("section.components"),
      group: t("group.layout"),
    },
    {
      label: t("nav.presets"),
      aliases: ["personalizar", "marca", "brand", "uc", "theming"],
      href: localizePath("/presets", locale),
      section: t("group.global"),
      group: t("nav.presets"),
    },
  ];
}
