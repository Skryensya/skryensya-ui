import { qrCodeParts, qrSvgDocument, type QrStandaloneOptions } from "./qr-code.js";

/*
 * QR CODE EXPORT: a rendered symbol, saved or shared as a file.
 *
 * FUNCTIONS, NOT A PART. The contract deliberately has no download button (a QR beside a "Save"
 * button is a composition, and the kit already publishes the button), so this is what that button
 * calls. It reads the symbol as it is DRAWN, from either binding (both render the same markup), which
 * is what makes the file match the screen: the tone, the polarity and the colour scheme it was drawn
 * in all reach the file, resolved to plain colours, because none of the tokens behind them exist
 * outside the page.
 *
 * THE LOGO travels when it is something that can leave the page: an inline `<svg>` (an Icon, a brand
 * mark) or an `<img>`. An image has to be same-origin or served with CORS for a raster export, or the
 * canvas refuses to be read; that is reported as an error rather than producing a file without the
 * logo, because a code whose middle is an unexplained hole looks broken. Anything else in the logo
 * slot is left out, and the cleared hole stays clear, which still scans.
 */

export type QrExportType = "image/svg+xml" | "image/png" | "image/jpeg" | "image/webp";

export type QrExportOptions = {
  /** Default `image/png`. */
  readonly type?: QrExportType;
  /** Width and height of the file, in px. Default 1024: enough to print at about 8.5 cm at 300 dpi. */
  readonly size?: number;
  /** For `image/jpeg` and `image/webp`, 0 to 1. */
  readonly quality?: number;
  /** Include the logo when it can travel. Default true. */
  readonly includeLogo?: boolean;
  /**
   * `light` (the default) exports dark modules on light paper whatever the page shows; `as-drawn`
   * exports exactly what is on screen, inverted in dark mode included.
   *
   * THE DEFAULT IS NOT WHAT IS ON SCREEN, on purpose. The component's own `auto` polarity follows the
   * page, which is right on a screen, where a phone camera reads either way. A FILE leaves the screen:
   * it gets printed, put in a slide, sent to a scanner nobody tested. ISO/IEC 18004 only promises the
   * dark-on-light polarity, so that is what a saved code carries unless someone asks otherwise.
   */
  readonly polarity?: "light" | "as-drawn";
};

export class QrExportError extends Error {}

const DEFAULT_SIZE = 1024;

/*
 * A computed colour as plain sRGB. `getComputedStyle` can answer in `oklch()` or `color(srgb …)`,
 * which some image decoders and most other tools do not read. A canvas pixel is the one conversion
 * every browser already does, so the colour is painted once and read back.
 */
function plainColour(doc: Document, css: string, fallback: string): string {
  if (!css || css === "transparent" || css === "rgba(0, 0, 0, 0)") return fallback;
  const context = doc.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!context) return css;
  context.fillStyle = fallback;
  context.fillStyle = css;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
  return a === 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${Math.round((a! / 255) * 1000) / 1000})`;
}

function logoOf(root: HTMLElement, win: Window): QrStandaloneOptions["logo"] {
  const holder = root.querySelector<HTMLElement>(`:scope > .${qrCodeParts.logo}`);
  const image = holder?.querySelector("img");
  if (image?.currentSrc || image?.src) return { href: new URL(image.currentSrc || image.src, win.location.href).href };
  const svg = holder?.querySelector("svg");
  if (!svg) return undefined;
  /* `currentColor` resolved to the colour the icon is actually painted in: outside the page there is
     no `color` to inherit, and an icon drawn in currentColor would come out black on any paper. */
  const copy = svg.cloneNode(true) as SVGSVGElement;
  copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  copy.setAttribute("color", plainColour(root.ownerDocument, win.getComputedStyle(svg).color, "#000"));
  if (!copy.getAttribute("viewBox")) {
    const box = svg.getBoundingClientRect();
    if (box.width && box.height) copy.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
  }
  return { svg: new XMLSerializer().serializeToString(copy) };
}

/** The rendered symbol as a self-contained SVG document, colours and logo included. */
export function qrCodeToSvg(
  root: HTMLElement,
  options: Pick<QrExportOptions, "size" | "includeLogo" | "polarity"> = {},
): string {
  const frame = root.querySelector<SVGSVGElement>(`:scope > .${qrCodeParts.frame}`);
  const path = frame?.querySelector(`.${qrCodeParts.modules}`)?.getAttribute("d");
  const extent = Number(frame?.getAttribute("viewBox")?.split(/\s+/)[2]);
  if (!path || !Number.isFinite(extent) || extent <= 0) {
    throw new QrExportError("This QR code has nothing drawn to export yet.");
  }
  const doc = root.ownerDocument;
  const win = doc.defaultView ?? window;
  /* The standard polarity is read from the component's OWN `light` rule: the colours are resolved with
     `data-polarity="light"` set for the length of one synchronous read, and the attribute put back
     before anything can paint. The tone stays the tone; only which way round it is changes. */
  const pin = options.polarity !== "as-drawn";
  const previous = root.getAttribute("data-polarity");
  if (pin) root.setAttribute("data-polarity", "light");
  try {
    const style = win.getComputedStyle(root);
    const size = options.size ?? DEFAULT_SIZE;
    const logoRatio = Number.parseFloat(style.getPropertyValue("--sk-qr-code-logo-ratio"));
    return qrSvgDocument(
      { path, extent },
      {
        modules: plainColour(doc, style.color, "#000"),
        paper: plainColour(doc, style.backgroundColor, "#fff"),
        size,
        logo: options.includeLogo === false ? undefined : logoOf(root, win),
        logoRatio: Number.isFinite(logoRatio) ? logoRatio : 0,
      },
    );
  } finally {
    if (pin) {
      if (previous === null) root.removeAttribute("data-polarity");
      else root.setAttribute("data-polarity", previous);
    }
  }
}

const svgDataUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

/** The rendered symbol as a Blob of the requested type. */
export async function qrCodeToBlob(root: HTMLElement, options: QrExportOptions = {}): Promise<Blob> {
  const type = options.type ?? "image/png";
  const size = options.size ?? DEFAULT_SIZE;
  const svg = qrCodeToSvg(root, options);
  if (type === "image/svg+xml") return new Blob([svg], { type });

  const doc = root.ownerDocument;
  const canvas = doc.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new QrExportError("This browser cannot draw to a canvas, so only SVG can be exported.");

  const image = new (doc.defaultView ?? window).Image();
  /* An image logo is fetched by the SVG itself; `anonymous` is what lets a CORS-enabled one through. */
  image.crossOrigin = "anonymous";
  image.decoding = "async";
  image.src = svgDataUrl(svg);
  try {
    await image.decode();
  } catch {
    throw new QrExportError("The QR code could not be rendered to an image.");
  }
  /* Crisp modules: a QR scaled with smoothing grows grey seams between them, which a reader sees as noise. */
  context.imageSmoothingEnabled = false;
  context.drawImage(image, 0, 0, size, size);

  return new Promise<Blob>((resolve, reject) => {
    try {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new QrExportError(`This browser cannot encode ${type}.`))),
        type,
        options.quality,
      );
    } catch (cause) {
      /* A tainted canvas: the logo image was cross-origin without CORS. */
      reject(new QrExportError("The logo image does not allow export (serve it with CORS, or export without it).", { cause }));
    }
  });
}

/** The rendered symbol as a data URL of the requested type. */
export async function qrCodeToDataUrl(root: HTMLElement, options: QrExportOptions = {}): Promise<string> {
  if ((options.type ?? "image/png") === "image/svg+xml") return svgDataUrl(qrCodeToSvg(root, options));
  const blob = await qrCodeToBlob(root, options);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new QrExportError("The exported image could not be read back."));
    reader.readAsDataURL(blob);
  });
}

const extensions: Record<QrExportType, string> = {
  "image/svg+xml": "svg",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

/**
 * Saves the rendered symbol as a file. `fileName` without an extension gets the type's own; the
 * default is `qr-code`. Resolves once the download has been handed to the browser.
 */
export async function downloadQrCode(
  root: HTMLElement,
  options: QrExportOptions & { readonly fileName?: string } = {},
): Promise<void> {
  const type = options.type ?? "image/png";
  const blob = await qrCodeToBlob(root, options);
  const doc = root.ownerDocument;
  const url = URL.createObjectURL(blob);
  const name = options.fileName ?? "qr-code";
  const link = doc.createElement("a");
  link.href = url;
  link.download = /\.[a-z0-9]+$/i.test(name) ? name : `${name}.${extensions[type]}`;
  link.hidden = true;
  doc.body.append(link);
  try {
    link.click();
  } finally {
    link.remove();
    /* Revoked on the next task, after the click has handed the URL to the download. */
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}
