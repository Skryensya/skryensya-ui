/*
 * Behaviour for `LanguageMenu.astro`: switch to the same page in the chosen language, and remember
 * the choice.
 *
 * Each row is a real `<a href>` to this document's other translation, so in principle the browser
 * navigates on its own. In practice the row is ALSO a Zag `menuitemradio`: clicking it sends the
 * machine's `ITEM_CLICK` (toggle the radio, close the menu, restore focus to the trigger), and
 * that teardown running in the same tick as the click is not something to trust the plain anchor
 * navigation to survive, especially on touch. So this drives the navigation itself:
 *
 *   1. write `languagePreference` (synchronous) so the pre-paint redirect in `Base.astro` keeps
 *      honouring the choice on every later visit to an unprefixed page, and
 *   2. `location.assign` to the row's href, a full load. That is what a language switch wants
 *      anyway (the whole document re-renders in the new language), and it leaves a real history
 *      entry, because unlike the pre-paint redirect this IS a navigation the reader asked for.
 *
 * A single delegated listener in the CAPTURE phase, bound once on `document`: capture so the write
 * and the redirect win before Zag's handler runs, delegation so the header instance, the drawer
 * instance and any future one are all covered without re-binding per mount. The synthetic click
 * Zag dispatches for keyboard activation (`clickIfLink`) is a real `click` event and flows through
 * here too, so Enter/Space on a row behaves identically.
 */
import { setPreference } from "@skryensya/vanilla/storage";
import { locales } from "../i18n/ui";
import { languagePreference } from "../lib/preferences";

const isLocale = (value: string | null | undefined): value is (typeof locales)[number] =>
  value != null && (locales as readonly string[]).includes(value);

let bound = false;

export function initLanguageMenu(): void {
  if (bound) return;
  bound = true;

  document.addEventListener(
    "click",
    (event) => {
      const row = (event.target as Element | null)?.closest<HTMLAnchorElement>(
        "a[data-sk-lang-set]",
      );
      if (!row) return;
      const locale = row.dataset.skLangSet;
      if (!isLocale(locale)) return;

      setPreference(languagePreference, locale);

      /* Already reading this language: let the menu just close, no reload. */
      if (locale === document.documentElement.lang) return;

      const href = row.getAttribute("href");
      if (!href) return;
      event.preventDefault();
      window.location.assign(href);
    },
    true,
  );
}
