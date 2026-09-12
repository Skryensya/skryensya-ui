import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Locale, Translate } from "../i18n";
import { namePart } from "./annotation-parts";

/*
 * THE QRCODE EXAMPLES, AS USAGE TREES.
 *
 * Most are a single node, because QRCode takes its whole payload as options and has no composition to
 * author. That is the contract's point rather than a gap in the demos: a QR under a heading beside a
 * copyable link IS a composition, and the last three examples here are exactly that  -  built from
 * pieces the kit already publishes, so the page shows what to assemble instead of asking the
 * contract to grow a card, a popover and an empty state of its own.
 *
 * EVERY VALUE IS A REAL, LOCALE-CORRECT URL. A reader can scan one and land on the page they are
 * reading, which is the only way a QR demo proves anything; a `https://example.com` would show the
 * geometry and teach nothing. That means the Spanish page must encode the `/es` prefix, so these are
 * functions of the locale rather than constants  -  a QR pointing at the wrong locale is a broken
 * link that looks perfectly fine on the page.
 */

const ORIGIN = "https://ui.skryensya.dev";

/** This page's own URL, in the locale the reader is actually on. */
export const qrCodeDocsUrl = (locale: Locale): string =>
  locale === "es" ? `${ORIGIN}/es/componentes/qr-code` : `${ORIGIN}/components/qr-code`;

/** The same, without the scheme, for writing out beside the code. */
const readable = (locale: Locale): string => qrCodeDocsUrl(locale).replace("https://", "");

type Copy = { scanToOpen: string; orBrowse: string; label: string };

const copy = (locale: Locale): Copy =>
  locale === "es"
    ? {
        scanToOpen: "Escaneá para abrir esta página",
        orBrowse: "O entrá directo desde el navegador:",
        label: "Abrir la documentación de QR",
      }
    : {
        scanToOpen: "Scan to open this page",
        orBrowse: "Or go straight there in the browser:",
        label: "Open the QR documentation",
      };


/** Frame, modules and logo: a level-H symbol with every QRCode part present. */
export const qrCodeAnatomyTree = (t: Translate, locale: Locale): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("qrCodePage.anatomyLabel"), inert: true },
  slots: {
    subject: {
      contract: "qr-code",
      signature: "QRCode",
      options: {
        value: qrCodeDocsUrl(locale),
        label: copy(locale).label,
        level: "H",
        logoRatio: 0.22,
        qrSize: "lg",
      },
      slots: {
        logo: { contract: "icon", signature: "Icon", options: { name: "settings", size: "lg" } },
      },
    },
    items: [
      namePart(".sk-qr-code", "block-start", { ringPlacement: "offset", ringDistance: 6 }),
      namePart(".sk-qr-code__frame", "inline-start"),
      namePart(".sk-qr-code__modules", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-qr-code__logo", "block-end", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});

/** 1. The floor: a value and a name for it. Everything else is defaulted. */
export const qrCodeTree = (locale: Locale): UsageTree => ({
  contract: "qr-code",
  signature: "QRCode",
  options: { value: qrCodeDocsUrl(locale), label: copy(locale).label },
});

/** A labelled specimen, for the rows that vary one option across its whole vocabulary. */
const specimen = (label: string, caption: string, options: Record<string, string | number>): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "xs", align: "center" },
  children: [
    { contract: "qr-code", signature: "QRCode", options: { label, ...options } },
    { contract: "typography", signature: "Code", children: caption },
  ],
});

const row = (children: UsageTree[]): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "md", wrap: true, inlineAlign: "end" },
  children,
});

/** 2. The four footprints. Same symbol, four boxes: only the rendered size changes. */
export const qrCodeSizesTree = (locale: Locale): UsageTree =>
  row(
    (["sm", "md", "lg", "xl"] as const).map((qrSize) =>
      specimen(`${copy(locale).label} (${qrSize})`, qrSize, {
        value: qrCodeDocsUrl(locale),
        qrSize,
      }),
    ),
  );

/** 3. The four correction levels, so the density difference is something to look at. */
export const qrCodeLevelsTree = (locale: Locale): UsageTree =>
  row(
    (["L", "M", "Q", "H"] as const).map((level) =>
      specimen(`${copy(locale).label} (${level})`, level, {
        value: qrCodeDocsUrl(locale),
        level,
        qrSize: "md",
      }),
    ),
  );

/*
 * 4. The three module shapes. Same payload, three drawings, all three still scan.
 *
 * `lg` rather than the `md` the other option rows use, and it is the one row where the size is part
 * of the argument: `dot` and `rounded` ARE curves, and at `md` the curve is a couple of pixels and
 * all three read as the same grey square. Shown too small, this row would quietly claim the option
 * does nothing.
 */
export const qrCodeShapesTree = (locale: Locale): UsageTree =>
  row(
    (["square", "dot", "rounded"] as const).map((moduleShape) =>
      specimen(`${copy(locale).label} (${moduleShape})`, moduleShape, {
        value: qrCodeDocsUrl(locale),
        moduleShape,
        qrSize: "lg",
      }),
    ),
  );

/*
 * 5. THE EIGHT MASKS, and the one row on this page that shows something a reader cannot otherwise
 * see.
 *
 * A mask is XORed over the symbol before it is drawn, and every one of the eight carries the
 * IDENTICAL payload: each of these scans to the same URL, and a reader undoes the mask from the
 * format field without being told. What changes is only the picture.
 *
 * It exists because a raw encoding tends to produce large uniform blocks and runs that look like a
 * finder pattern, and those are what a camera misreads. So the encoder builds all eight, scores them
 * with the standard's four penalty rules, and keeps the quietest  -  which is what `auto`, the
 * default, means. Naming one is for reproducing a specific symbol, or for a row like this.
 */
export const qrCodeMasksTree = (locale: Locale): UsageTree =>
  row(
    (["0", "1", "2", "3", "4", "5", "6", "7"] as const).map((mask) =>
      specimen(
        locale === "es"
          ? `${copy(locale).label} (máscara ${mask})`
          : `${copy(locale).label} (mask ${mask})`,
        mask,
        { value: qrCodeDocsUrl(locale), mask, qrSize: "md" },
      ),
    ),
  );

/*
 * 6. The tints, and the inversion beside them.
 *
 * Three rows on purpose, one per polarity, each tinted the whole vocabulary. Shown together because
 * the difference between them is not stylistic: `auto` (the default) follows the page, `light` pins
 * the pair the standard specifies, and `dark` pins the inversion.
 *
 * Toggle the docs between light and dark mode with this preview on screen: the FIRST row is the only
 * one that moves, which is the whole demonstration.
 */
export const qrCodeTonesTree = (locale: Locale): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "lg" },
  children: (["auto", "light", "dark"] as const).map((polarity) =>
    row(
      (["neutral", "accent", "success", "warning", "danger", "info"] as const).map((tone) =>
        specimen(`${copy(locale).label} (${tone}, ${polarity})`, tone, {
          value: qrCodeDocsUrl(locale),
          tone,
          polarity,
          qrSize: "md",
        }),
      ),
    ),
  ),
});

/*
 * 7. A logo in the middle, at level H.
 *
 * `logoRatio` does two things at once and both are necessary: it clears the modules underneath (so
 * error correction sees a clean erasure rather than noise) and it sizes the box the slot's content
 * sits in. The level is H because a hole needs error correction behind it; the contract's own
 * `qrLogoAdvice` says so out loud when it is not.
 */
export const qrCodeLogoTree = (locale: Locale): UsageTree => ({
  contract: "qr-code",
  signature: "QRCode",
  options: {
    value: qrCodeDocsUrl(locale),
    label: copy(locale).label,
    level: "H",
    logoRatio: 0.22,
    qrSize: "lg",
  },
  slots: {
    logo: { contract: "icon", signature: "Icon", options: { name: "settings", size: "lg" } },
  },
});

/*
 * 8. THE VERTICAL CARD, and the composition worth copying.
 *
 * Stacked rather than side by side, because that is the shape this actually takes in the wild: a
 * ticket, a table tent, a checkout panel. Vertical also lets the code stay large while the text
 * keeps a readable measure, which the horizontal version could not do without one of the two
 * getting cramped.
 *
 * The written link is not decoration. It is what makes the card usable by someone who cannot point
 * a camera at it, and it is the accessibility floor a QR alone never reaches.
 */
export const qrCodeCardTree = (locale: Locale): UsageTree => {
  const c = copy(locale);
  return {
    contract: "box",
    signature: "Box",
    options: { surface: "surface", border: "subtle", padding: "lg" },
    attrs: { style: "inline-size: 18rem;" },
    children: [
      {
        contract: "layout",
        signature: "Stack",
        options: { gap: "md", align: "center" },
        children: [
          {
            contract: "qr-code",
            signature: "QRCode",
            options: { value: qrCodeDocsUrl(locale), label: c.label, qrSize: "lg" },
          },
          {
            contract: "layout",
            signature: "Stack",
            options: { gap: "xs", align: "center" },
            children: [
              {
                contract: "typography",
                signature: "Heading",
                options: { headingSize: "h4", flush: true },
                children: c.scanToOpen,
              },
              {
                contract: "typography",
                signature: "Text",
                options: { tone: "secondary", size: "sm" },
                children: c.orBrowse,
              },
              {
                contract: "typography",
                signature: "Link",
                options: { href: qrCodeDocsUrl(locale) },
                children: readable(locale),
              },
            ],
          },
        ],
      },
    ],
  };
};

/*
 * 9. "Open this on your phone", as a popover.
 *
 * The case a QR is genuinely best at: the reader is already on a desktop and wants to carry the
 * current page to a device in their pocket. A popover is right because the code is an aside  -  it
 * answers a question nobody asked until they asked it, and it should not occupy the layout until
 * then.
 */
export const qrCodePopoverTree = (locale: Locale): UsageTree => {
  const c = copy(locale);
  return {
    contract: "popover",
    signature: "Popover",
    options: { panelId: "qr-handoff", placement: "block-end", triggerVariant: "outline" },
    slots: {
      trigger: locale === "es" ? "Abrir en el teléfono" : "Open on my phone",
      title: c.scanToOpen,
      children: {
        contract: "layout",
        signature: "Stack",
        options: { gap: "sm", align: "center" },
        children: [
          {
            contract: "qr-code",
            signature: "QRCode",
            options: { value: qrCodeDocsUrl(locale), label: c.label, qrSize: "md" },
          },
          {
            contract: "typography",
            signature: "Text",
            options: { tone: "secondary", size: "sm" },
            children: readable(locale),
          },
        ],
      },
    },
  };
};

/*
 * 10. A ticket stub: the code as the payload of a record, not as a call to action.
 *
 * Here the QR is what gets scanned AT a door, so it is the largest thing in the box and the text
 * around it is the human-readable copy of the same fact. `tone="accent"` and a logo are the two
 * branding levers a real ticket reaches for, shown together at the level that survives both.
 */
export const qrCodeTicketTree = (locale: Locale): UsageTree => {
  const isEs = locale === "es";
  return {
    contract: "box",
    signature: "Box",
    options: { surface: "raised", border: "subtle", padding: "lg" },
    attrs: { style: "inline-size: 20rem;" },
    children: [
      {
        contract: "layout",
        signature: "Stack",
        options: { gap: "md", align: "center" },
        children: [
          {
            contract: "layout",
            signature: "Stack",
            options: { gap: "xs", align: "center" },
            children: [
              {
                contract: "badge",
                signature: "Badge",
                options: { tone: "accent" },
                children: isEs ? "Entrada general" : "General admission",
              },
              {
                contract: "typography",
                signature: "Heading",
                options: { headingSize: "h4", flush: true },
                children: isEs ? "Noche de apertura" : "Opening night",
              },
              {
                contract: "typography",
                signature: "Text",
                options: { tone: "secondary", size: "sm" },
                children: isEs ? "Sala 2 · 21:00 · Fila F, asiento 12" : "Room 2 · 9:00 pm · Row F, seat 12",
              },
            ],
          },
          {
            contract: "qr-code",
            signature: "QRCode",
            options: {
              value: `${ORIGIN}/t/8F2K-19QD-7C4M`,
              label: isEs ? "Entrada 8F2K-19QD-7C4M" : "Ticket 8F2K-19QD-7C4M",
              level: "H",
              tone: "accent",
              logoRatio: 0.2,
              qrSize: "lg",
            },
            slots: {
              logo: { contract: "icon", signature: "Icon", options: { name: "calendar", size: "lg" } },
            },
          },
          {
            contract: "typography",
            signature: "Code",
            children: "8F2K-19QD-7C4M",
          },
        ],
      },
    ],
  };
};
