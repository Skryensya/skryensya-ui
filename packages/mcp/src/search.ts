import type { SurfaceEntry } from "./catalog.js";

export interface Match extends SurfaceEntry {
  score: number;
}

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "at",
  "for",
  "in",
  "into",
  "of",
  "on",
  "or",
  "that",
  "the",
  "to",
  "with",
]);

function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter(Boolean);
}

function queryWords(text: string): string[] {
  return words(text).filter((w) => !STOPWORDS.has(w));
}

function sharedPrefixLength(a: string, b: string): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

/**
 * True for morphological variants of the same word (navigate/navigation,
 * select/selection) without a real stemmer: a long-enough shared prefix on
 * two words that are each long enough for the prefix to be meaningful.
 *
 * `floor` is the minimum length the SHORTER word must clear before a shared
 * prefix counts — see the two floors below for why this varies by source.
 */
function isFuzzyMatch(a: string, b: string, floor: number): boolean {
  if (a.length < floor || b.length < floor) return false;
  return sharedPrefixLength(a, b) >= Math.min(4, floor);
}

/**
 * Substring/prefix credit for one query word against one haystack word,
 * gated by `floor` on whichever side is being matched short.
 */
function fuzzyCredit(query: string, haystack: string, floor: number): boolean {
  return (
    (haystack.includes(query) && query.length >= floor) ||
    (query.includes(haystack) && haystack.length >= floor) ||
    isFuzzyMatch(query, haystack, floor)
  );
}

// A query word this short only gets substring/prefix credit against free prose ("use"), where an
// accidental hit (e.g. "to" inside "button") is a real risk with no curated vocabulary to protect it.
const PROSE_FLOOR = 4;
// id/surface split into words is a small, curated, author-controlled vocabulary (~50 ids today) —
// a 3-letter word there ("nav" from "nav-list") is a deliberate name, not noise, so it earns credit
// a stray 3-letter word in prose wouldn't. This is what makes "navigation" find "nav-list": "nav"
// used to fail the old single length-4 floor and NavList never surfaced for a query naming it.
const ID_FLOOR = 3;

/**
 * Ranks catalog surfaces against a free-text intent. Keyword overlap over
 * {id, surface, use}, not embeddings: the catalog is small and the fields are
 * short, controlled vocabulary (see docs/ai/README.md), so exact/substring
 * word matches are more predictable than a similarity model here.
 *
 * id/surface and use are scored against separate word lists with separate
 * floors (see PROSE_FLOOR/ID_FLOOR above) because they carry different
 * false-positive risk: id/surface is curated naming, use is free prose.
 */
export function rankByIntent(intent: string, surfaces: SurfaceEntry[]): Match[] {
  const query = queryWords(intent);

  const scored = surfaces.map((entry) => {
    const idWords = words(`${entry.id} ${entry.surface}`);
    const useWords = words(entry.use);
    let score = 0;

    for (const q of query) {
      if (idWords.includes(q) || useWords.includes(q)) {
        score += 2;
      } else if (
        idWords.some((h) => fuzzyCredit(q, h, ID_FLOOR)) ||
        useWords.some((h) => fuzzyCredit(q, h, PROSE_FLOOR))
      ) {
        score += 1;
      }
    }

    return { ...entry, score };
  });

  return scored
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score);
}
