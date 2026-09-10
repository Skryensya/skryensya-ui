/*
 * Types for the ONE deep import this package takes from `qrcode` (node-qrcode).
 *
 * `@types/qrcode` exists, but it describes the package's main entry: the rendering API (`toString`,
 * `toDataURL`, `toCanvas`), which pulls `pngjs` and `yargs` behind it and which nothing here uses.
 * What we want is `lib/core/qrcode.js`, the symbol builder underneath all of that: it returns the
 * matrix and pulls one transitive dependency (`dijkstrajs`, the graph that finds the cheapest
 * segmentation). That path is not in the published types at all, so this declares the shape we
 * actually call rather than adding a types package for an entry we deliberately avoid.
 */
declare module "qrcode/lib/core/qrcode.js" {
  export type QrCodeErrorCorrectionLevel = "L" | "M" | "Q" | "H";

  export type QrCodeSymbol = {
    /** 1-40. */
    readonly version: number;
    readonly errorCorrectionLevel: { readonly bit: number };
    readonly modules: {
      /** Modules per side, quiet zone excluded. */
      readonly size: number;
      /** Row-major, one byte per module, 1 where the module is dark. */
      readonly data: Uint8Array;
    };
    /** The runs the encoder split the input into, and the mode it chose for each. */
    readonly segments: readonly { readonly mode: { readonly id: string } }[];
  };

  export function create(
    data: string,
    options?: {
      version?: number;
      errorCorrectionLevel?: QrCodeErrorCorrectionLevel;
      maskPattern?: number;
    },
  ): QrCodeSymbol;
}
