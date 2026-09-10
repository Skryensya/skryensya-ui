import type { QrGeometry, QrLevel } from "./qr-code.js";

/*
 * A QR READER, FOR THE TESTS ONLY, written from ISO/IEC 18004 rather than from our encoder.
 *
 * WHY THIS EXISTS. A QR that carries the wrong bytes is visually indistinguishable from one that
 * carries the right ones: both are a square of noise. Every cheap test therefore passes on a broken
 * symbol - a snapshot passes, a dark-module count passes, "it rendered" passes - and the defect
 * surfaces at a camera, which is to say in someone's hands. So the tests decode.
 *
 * IT IS INDEPENDENT ON PURPOSE. It rebuilds the function-pattern map, the block interleave and the
 * segment headers from the standard, so agreeing with the encoder is evidence rather than a
 * tautology. That independence has already paid once: run against a hand-rolled encoder, this is
 * what proved a mistranscribed block count at version 32 level H, a bug that produced symbols no
 * scanner could read and that nothing else in the suite noticed.
 *
 * NOT EXPORTED FROM THE PACKAGE. It is `.ts` beside the code rather than under a `test/` folder
 * because that is this repo's layout, but nothing ships it: `index.ts` does not re-export it and no
 * export map entry points at it.
 *
 * THE TABLES ARE A SECOND TRANSCRIPTION, deliberately. If they and the encoder's agree, two
 * independent readings of the standard agree. They were checked against three identities that must
 * all hold for every one of the 160 version/level pairs: the block groups sum to the published data
 * codeword count, data plus error correction fills the symbol exactly, and the derived block sizes
 * reproduce the published groups.
 */

const ECC_PER_BLOCK: Readonly<Record<QrLevel, readonly number[]>> = {
  L: [0, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  M: [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  Q: [0, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  H: [0, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
};

const BLOCKS: Readonly<Record<QrLevel, readonly number[]>> = {
  L: [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  M: [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  Q: [0, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  H: [0, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
};

const MASKS: readonly ((x: number, y: number) => boolean)[] = [
  (x, y) => (x + y) % 2 === 0,
  (_x, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

const ALPHANUMERIC = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

/** Alignment pattern centres, by the standard's own rule. Version 32 is the documented exception. */
function alignmentPositions(version: number): number[] {
  if (version === 1) return [];
  const count = Math.floor(version / 7) + 2;
  const step = version === 32 ? 26 : Math.ceil((version * 4 + 4) / (count * 2 - 2)) * 2;
  const positions = [6];
  for (let pos = version * 4 + 17 - 7; positions.length < count; pos -= step) {
    positions.splice(1, 0, pos);
  }
  return positions;
}

/** Every module the symbol reserves for a function pattern, and therefore skips when reading data. */
function reservedMap(version: number): boolean[][] {
  const size = version * 4 + 17;
  const map = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const mark = (x: number, y: number) => {
    if (x >= 0 && y >= 0 && x < size && y < size) map[y]![x] = true;
  };

  for (let i = 0; i < size; i++) {
    mark(6, i);
    mark(i, 6);
  }
  for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]] as const) {
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) mark(cx + dx, cy + dy);
  }
  const positions = alignmentPositions(version);
  for (const cy of positions) {
    for (const cx of positions) {
      const atFinder =
        (cx === 6 && cy === 6) || (cx === 6 && cy === size - 7) || (cx === size - 7 && cy === 6);
      if (atFinder) continue;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) mark(cx + dx, cy + dy);
    }
  }
  for (let i = 0; i < 9; i++) {
    mark(i, 8);
    mark(8, i);
  }
  for (let i = 0; i < 8; i++) {
    mark(size - 1 - i, 8);
    mark(8, size - 1 - i);
  }
  mark(8, size - 8);
  if (version >= 7) {
    for (let i = 0; i < 18; i++) {
      const x = i % 3;
      const y = Math.floor(i / 3);
      mark(size - 11 + x, y);
      mark(y, size - 11 + x);
    }
  }
  return map;
}

/**
 * Error correction level and mask, read out of the symbol's own format field.
 *
 * THE PLACEMENT IS COLUMN-FIRST, and getting that backwards is the trap this function exists to
 * document. The first copy of the 15 bit field runs DOWN column 8 (rows 0-5, skipping the timing
 * module at row 6) and then LEFT along row 8; writing it the other way round is a transposition that
 * an encoder and a decoder written by the same hand will happily share, cancelling out and reading
 * back perfectly while producing a symbol no real scanner accepts. That is precisely what happened
 * here, and only checking against an independent encoder exposed it.
 */
function readFormat(modules: boolean[][]): { level: QrLevel; mask: number } {
  /** `at(column, row)`, in the standard's own (x, y) order. */
  const at = (x: number, y: number) => (modules[y]![x] ? 1 : 0);
  let raw = 0;
  for (let i = 0; i <= 5; i++) raw |= at(8, i) << i;
  raw |= at(8, 7) << 6;
  raw |= at(8, 8) << 7;
  raw |= at(7, 8) << 8;
  for (let i = 9; i < 15; i++) raw |= at(14 - i, 8) << i;
  const data = (raw ^ 0x5412) >>> 10;
  /* The field's own level encoding: L=01, M=00, Q=11, H=10. */
  return { level: (["M", "L", "H", "Q"] as const)[data >>> 3]!, mask: data & 7 };
}

/**
 * The emitted `<path>` back into a module grid.
 *
 * Reading the PATH rather than an intermediate matrix is the point: it tests the bytes that actually
 * reach the page, so a bug in the run merging or the quiet-zone offset is caught here too, not only
 * a bug in the encoder.
 */
function modulesFromPath(path: string, size: number, quietZone: number): boolean[][] {
  const modules = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  /* Each subpath opens with `M x y` and then a command that says which shape wrote it: `h` for a
     merged square run, `a` for a dot, and `h` again for a rounded module (told apart by its
     fractional start). */
  for (const segment of path.split("M").slice(1)) {
    const match = segment.match(/^(-?[\d.]+) (-?[\d.]+)([a-z])/);
    if (!match) continue;
    const first = Number(match[1]);
    const second = Number(match[2]);
    const command = match[3];

    if (command === "a") {
      /* Dot: `M{x + quiet + 0.5 - r} {y + quiet + 0.5}a…`, r = 0.42. */
      const x = Math.round(first - quietZone - 0.5 + 0.42);
      const y = Math.round(second - quietZone - 0.5);
      if (modules[y]?.[x] !== undefined) modules[y]![x] = true;
      continue;
    }

    const run = segment.match(/^-?[\d.]+ -?[\d.]+h(-?[\d.]+)/);
    if (Number.isInteger(first) && Number.isInteger(second) && run) {
      /* Square: one subpath per horizontal run. */
      const width = Number(run[1]);
      const y = second - quietZone;
      for (let i = 0; i < width; i++) {
        const x = first - quietZone + i;
        if (modules[y]?.[x] !== undefined) modules[y]![x] = true;
      }
      continue;
    }

    /* Rounded: `M{x + quiet + r} {y + quiet}h…`, r = 0.25. */
    const x = Math.round(first - quietZone - 0.25);
    const y = Math.round(second - quietZone);
    if (modules[y]?.[x] !== undefined) modules[y]![x] = true;
  }
  return modules;
}

export type QrPathDecoder = {
  (geometry: QrGeometry, quietZone: number): string;
  /** Dark modules seen by the last call, for the test that checks the path is actually merged. */
  lastModuleCount: number;
};

/** Decode a symbol straight from the geometry the contract emits. */
export const decodeQrPath = ((geometry: QrGeometry, quietZone: number): string => {
  const size = geometry.extent - quietZone * 2;
  const version = (size - 17) / 4;
  const modules = modulesFromPath(geometry.path, size, quietZone);

  decodeQrPath.lastModuleCount = modules.reduce(
    (total, row) => total + row.filter(Boolean).length,
    0,
  );

  const { level, mask } = readFormat(modules);
  const reserved = reservedMap(version);
  const masked = MASKS[mask]!;

  /* The two-module-wide column snake, bottom-right to top-left, skipping the timing column. */
  const bits: number[] = [];
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let step = 0; step < size; step++) {
      const upward = ((right + 1) & 2) === 0;
      const y = upward ? size - 1 - step : step;
      for (let column = 0; column < 2; column++) {
        const x = right - column;
        if (reserved[y]![x]) continue;
        const value = modules[y]![x]! !== masked(x, y);
        bits.push(value ? 1 : 0);
      }
    }
  }

  const total = Math.floor(bits.length / 8);
  const stream = new Uint8Array(total);
  for (let i = 0; i < total * 8; i++) if (bits[i]) stream[i >>> 3] |= 0x80 >>> (i & 7);

  /* Undo the interleave: the standard takes one codeword from each block in turn, so that damage
     spreads across blocks instead of destroying one. */
  const blockCount = BLOCKS[level][version]!;
  const eccPerBlock = ECC_PER_BLOCK[level][version]!;
  const shortLength = Math.floor(total / blockCount) - eccPerBlock;
  const longBlocks = total % blockCount;
  const lengths = Array.from(
    { length: blockCount },
    (_, i) => shortLength + (i < blockCount - longBlocks ? 0 : 1),
  );
  const blocks: number[][] = lengths.map(() => []);
  let at = 0;
  for (let i = 0; i < shortLength + 1; i++) {
    for (let b = 0; b < blockCount; b++) if (i < lengths[b]!) blocks[b]!.push(stream[at++]!);
  }
  const data = blocks.flat();

  let cursor = 0;
  const read = (count: number): number => {
    let value = 0;
    for (let i = 0; i < count; i++) {
      value = (value << 1) | ((data[cursor >>> 3]! >>> (7 - (cursor & 7))) & 1);
      cursor++;
    }
    return value;
  };

  const group = version <= 9 ? 0 : version <= 26 ? 1 : 2;
  const countBits: Record<number, readonly number[]> = {
    1: [10, 12, 14],
    2: [9, 11, 13],
    4: [8, 16, 16],
  };

  let text = "";
  for (;;) {
    if (cursor + 4 > data.length * 8) break;
    const mode = read(4);
    if (mode === 0) break;
    if (mode === 7) {
      read(8); // an ECI header, which carries no text of its own
      continue;
    }
    const widths = countBits[mode];
    if (!widths) throw new Error(`Unsupported mode indicator ${mode} in the decoded stream.`);
    const count = read(widths[group]!);

    if (mode === 1) {
      for (let i = 0; i < count; ) {
        const take = Math.min(3, count - i);
        text += String(read(take * 3 + 1)).padStart(take, "0");
        i += take;
      }
    } else if (mode === 2) {
      for (let i = 0; i < count; ) {
        if (count - i === 1) {
          text += ALPHANUMERIC[read(6)];
          i += 1;
        } else {
          const pair = read(11);
          text += ALPHANUMERIC[Math.floor(pair / 45)]! + ALPHANUMERIC[pair % 45]!;
          i += 2;
        }
      }
    } else {
      const bytes = new Uint8Array(count);
      for (let i = 0; i < count; i++) bytes[i] = read(8);
      text += new TextDecoder().decode(bytes);
    }
  }
  return text;
}) as QrPathDecoder;

decodeQrPath.lastModuleCount = 0;
