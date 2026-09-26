import type { ContractCategory } from "@skryensya/core/contract";
import type { UsageTree } from "@skryensya/core/usage-tree";
import type { CompiledIndex, CompiledIndexSignature } from "./artifact.js";
import { signaturesIn } from "./usage-walk.js";

/*
 * DETERMINISTIC DISCOVERY: narrowing the published catalogue to a small candidate set BEFORE the
 * agent reasons about the final choice. ADR-0026 is why this exists at all, since ADR-0016 said
 * there would be no intermediary; read it before changing what this does.
 *
 * What this is, said plainly so nothing downstream mistakes it for more:
 *
 *   - LEXICAL, not semantic. A query is split into words and each word is compared to the words of
 *     compiled fields. "Navigate" finds `navigation`; it does not find `link` unless a field that
 *     mentions links also says "navigate". Interpreting intent is the agent's job.
 *   - EXPLAINED. Every candidate carries the exact field, the input term and the field value that
 *     made it a candidate. There is no score, hidden or shown.
 *   - ORDERED BY WRITTEN RULES (see `compareCandidates`), never by a weight.
 *   - RECALL FIRST. A term matching only a signature's `avoidWhen` still makes it a candidate,
 *     because "the thing you described is exactly what this is NOT for" is evidence the agent needs
 *     to reach the alternative that is.
 *   - NEVER THE AUTHORITY. `get_catalog` stays the exhaustive list and `validate_ui` stays the only
 *     judge of a tree. Discovery reads the same compiled index `get_catalog` pages through, so it
 *     cannot know a signature the catalogue does not.
 *
 * Pure: no I/O, no clock, no randomness, so the same index, snippets and input give the same
 * result byte for byte. The tests pin that.
 */

export const DISCOVER_DEFAULT_LIMIT = 20;
export const DISCOVER_MAX_LIMIT = 60;
/** Examples returned alongside candidates. Ids only point at `get_examples(id)`, so few are enough. */
export const DISCOVER_EXAMPLE_LIMIT = 8;

/** The compiled fields a term is compared against, in the order evidence is reported. */
export const DISCOVER_FIELDS = [
  "signature",
  "contract",
  "intent",
  "category",
  "useWhen",
  "alternatives",
  "avoidWhen",
] as const;
export type DiscoverField = (typeof DISCOVER_FIELDS)[number];

/*
 * A term in a signature's own name or declared intent says more about what it IS than the same term
 * in a sentence of prose, and a term in `avoidWhen` says what it is NOT. The ordering rules count
 * these separately rather than weighting them, so each rule stays a comparison a person can redo.
 */
const NAMING_FIELDS: ReadonlySet<string> = new Set(["signature", "contract", "intent", "category"]);

/*
 * NOT a candidate field: an example's text. Matching a signature because some example that CONTAINS
 * it mentions the term made layout primitives (Stack, Text) a candidate for nearly every query,
 * since nearly every example contains them. Examples are matched on their own, in `examples`.
 */
/** How many example ids one candidate lists, in snippet order. `get_examples` lists them all. */
const CANDIDATE_EXAMPLE_LIMIT = 5;

export type DiscoverInput = {
  /** Free text in any language. Matched word by word, lexically. */
  readonly query?: string;
  /** Intent terms as the index spells them (`on-off`, `navigation`), matched whole. */
  readonly intents?: readonly string[];
  /** Hard filter: only signatures of families in this category. */
  readonly category?: ContractCategory;
  /** Hard filter: only signatures whose host element is this tag (`a`, `button`, `input`). */
  readonly host?: string;
  /** Hard filter: only signatures that declare this signature id as a valid parent. */
  readonly parent?: string;
  /** Deprecated signatures are left out unless this is true. */
  readonly includeDeprecated?: boolean;
  readonly limit?: number;
};

export type DiscoverMatch = {
  readonly field: DiscoverField | "example" | "category-filter" | "host-filter" | "parent-filter";
  /** The normalized input term, or the filter value, that produced this match. */
  readonly term: string;
  /** The field value it matched: an intent term, an id, one `useWhen` line, an example id. */
  readonly value: string;
};


export type DiscoverCandidate = {
  readonly signature: string;
  readonly contract: string;
  readonly category?: ContractCategory;
  readonly host: string;
  readonly intent: readonly string[];
  readonly parents: readonly string[];
  readonly useWhen: readonly string[];
  readonly avoidWhen: readonly string[];
  readonly alternatives: readonly string[];
  readonly deprecated?: string;
  readonly matched: readonly DiscoverMatch[];
  /** Up to five established examples whose tree uses this signature. Fetch one with `get_examples`. */
  readonly examples: readonly string[];
};

export type DiscoverExample = {
  readonly id: string;
  readonly level: string;
  readonly intent: string;
  /** Which returned candidates this example's tree uses. */
  readonly uses: readonly string[];
  /** Input terms found in the example's own id or intent line. */
  readonly matched: readonly DiscoverMatch[];
};

export type DiscoverCoverage = "complete" | "partial" | "none" | "browse";

export type DiscoverResult = {
  /** What was actually searched for, after normalization, so a miss can be diagnosed. */
  readonly input: {
    readonly terms: readonly string[];
    /** Words dropped before matching: too short, or a function word in English or Spanish. */
    readonly ignored: readonly string[];
    readonly filters: {
      readonly category?: string;
      readonly host?: string;
      readonly parent?: string;
      readonly includeDeprecated: boolean;
    };
    readonly limit: number;
  };
  /**
   * `complete`: every term matched something and nothing was cut by `limit`. `partial`: some term
   * matched nothing, or candidates were cut. `none`: nothing matched. `browse`: no term and no
   * filter was given, so nothing was searched and the vocabulary is returned instead.
   */
  readonly coverage: DiscoverCoverage;
  readonly candidates: readonly DiscoverCandidate[];
  /** How many signatures matched before `limit` was applied. */
  readonly total: number;
  readonly truncated: boolean;
  /** Input terms no field matched at all. A non-empty list is the cue to rephrase or read the catalogue. */
  readonly unmatchedTerms: readonly string[];
  readonly examples: readonly DiscoverExample[];
  /** Every category with how many families and signatures it holds: a first facet to narrow by. */
  readonly categories: readonly { readonly id: string; readonly families: number; readonly signatures: number }[];
  /** The whole intent vocabulary, only on a `browse` call (no terms, no filters). */
  readonly vocabulary?: { readonly intents: readonly string[]; readonly hosts: readonly string[] };
  /** A deterministic next step derived from `coverage`, never from a judgement about the match. */
  readonly guidance: string;
};

/** The minimal snippet shape discovery reads. Structural so tests can pass fixtures. */
export type DiscoverSnippet = {
  readonly id: string;
  readonly level: string;
  readonly intent: string;
  readonly tree: UsageTree;
};

/*
 * Function words dropped before matching, English and Spanish because those are the two languages
 * this catalogue's prose and its users actually write in. Deliberately short: a word missing here
 * costs a little noise, a real word wrongly listed here costs a miss, and discovery favours recall.
 */
const STOPWORDS: ReadonlySet<string> = new Set([
  "and", "are", "but", "can", "for", "from", "has", "have", "into", "its", "not", "one", "that",
  "the", "their", "then", "there", "these", "this", "those", "use", "used", "using", "want", "what",
  "when", "where", "which", "while", "who", "will", "with", "without", "you", "your", "some", "any",
  "all", "each", "more", "most", "other", "such", "than", "too", "very", "just", "also", "should",
  "would", "could", "need", "needs", "like", "make", "show", "shows",
  "con", "del", "las", "los", "una", "uno", "unos", "unas", "para", "por", "que", "qué", "sin",
  "sus", "como", "cómo", "este", "esta", "esto", "estos", "estas", "ese", "esa", "eso", "hay",
  "más", "mas", "muy", "pero", "sobre", "entre", "cuando", "donde", "dónde", "cual", "cuál", "quiero",
  "necesito", "algo", "otro", "otra", "cada", "todo", "toda", "todos", "todas", "tiene", "ser",
  "está", "son", "fue",
].map(foldCase));

/** Lowercase, accents removed, so `Navegación` and `navegacion` are the same word. */
function foldCase(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

/**
 * Words of a piece of text: camelCase and dotted ids split (`NavListLink` -> nav, list, link;
 * `Button.navigation` -> button, navigation), accents folded, split on anything not a letter or
 * digit. Used for BOTH the input and every field, so the two sides are always cut the same way.
 */
export function wordsOf(text: string): readonly string[] {
  const split = text.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return foldCase(split)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length > 0);
}

/**
 * THE MATCH RULE, the only one: an input term matches a field word when they are equal, or when
 * both are at least 4 characters and share a prefix of at least max(4, shorter length - 2)
 * characters. That lets `navigate` meet `navigation`, `setting` meet `settings` and `toggle` meet
 * `toggles` without any stemmer, dictionary or synonym list, and it stops `card` from meeting
 * `carousel`. Anything subtler would be a ranker, which is what ADR-0026 keeps out.
 */
export function termMatchesWord(term: string, word: string): boolean {
  if (term === word) return true;
  const shorter = Math.min(term.length, word.length);
  if (shorter < 4) return false;
  let shared = 0;
  while (shared < shorter && term[shared] === word[shared]) shared += 1;
  return shared >= Math.max(4, shorter - 2);
}

function textMatches(term: string, text: string): boolean {
  return wordsOf(text).some((word) => termMatchesWord(term, word));
}

/** Input text to terms. Short words and function words are reported back as `ignored`. */
function termsOf(query: string | undefined): { terms: string[]; ignored: string[] } {
  const terms: string[] = [];
  const ignored: string[] = [];
  for (const word of wordsOf(query ?? "")) {
    const keep = (word.length >= 3 || /\d/.test(word)) && !STOPWORDS.has(word);
    const into = keep ? terms : ignored;
    if (!into.includes(word)) into.push(word);
  }
  return { terms, ignored };
}

type Row = {
  readonly order: number;
  readonly contract: string;
  readonly category?: ContractCategory;
  readonly signature: CompiledIndexSignature;
};

/** Every example id that uses a signature, in snippet order. Built once per snippet list. */
function examplesBySignature(snippets: readonly DiscoverSnippet[]): ReadonlyMap<string, readonly string[]> {
  const into = new Map<string, string[]>();
  for (const snippet of snippets) {
    for (const signature of signaturesIn(snippet.tree)) {
      const list = into.get(signature) ?? [];
      list.push(snippet.id);
      into.set(signature, list);
    }
  }
  return into;
}

function matchRow(row: Row, terms: readonly string[], intents: readonly string[]): DiscoverMatch[] {
  const matched: DiscoverMatch[] = [];
  const signature = row.signature;

  for (const term of intents) {
    const exact = signature.intent.find((value) => value === term);
    if (exact) matched.push({ field: "intent", term, value: exact });
  }

  for (const term of terms) {
    const fields: Array<[DiscoverField, readonly string[]]> = [
      ["signature", [signature.id]],
      ["contract", [row.contract]],
      ["intent", signature.intent],
      ["category", row.category ? [row.category] : []],
      ["useWhen", signature.useWhen],
      ["alternatives", signature.alternatives],
      ["avoidWhen", signature.avoidWhen],
    ];
    for (const [field, values] of fields) {
      const value = values.find((text) => textMatches(term, text));
      if (value !== undefined) matched.push({ field, term, value });
    }
  }

  return matched;
}

type Scored = {
  readonly row: Row;
  readonly matched: readonly DiscoverMatch[];
  /** Distinct input terms matched in signature, contract, intent or category. */
  readonly naming: number;
  /** Distinct naming fields (of those four) that matched any term. */
  readonly namingFields: number;
  /** Distinct input terms matched in any field except avoidWhen. */
  readonly positive: number;
  /** Distinct input terms matched anywhere. */
  readonly any: number;
};

/*
 * THE ORDERING RULES, in priority order. Each is a count a person can redo by hand from `matched`:
 *
 *   1. More distinct input terms matched in a naming field (signature, contract, intent, category).
 *   2. Then more distinct naming fields matched. "switch" in a signature's own id AND its family id
 *      (Switch) outranks "switch" inside one intent term of an unrelated family
 *      (`code-with-a-density-switch`), which rule 1 alone scores the same.
 *   3. Then more distinct terms matched in any field but avoidWhen (adds useWhen, alternatives).
 *   4. Then more distinct terms matched at all (adds avoidWhen).
 *   5. Then catalogue order: the order `get_catalog` lists families and, within one, signatures.
 *
 * Rule 5 is total, so there are no ties left for anything unstable to decide. A candidate matched
 * only through filters has all three counts at zero and keeps catalogue order.
 */
function compareCandidates(a: Scored, b: Scored): number {
  return (
    b.naming - a.naming ||
    b.namingFields - a.namingFields ||
    b.positive - a.positive ||
    b.any - a.any ||
    a.row.order - b.row.order
  );
}

function scoreOf(row: Row, matched: readonly DiscoverMatch[]): Scored {
  const distinct = (keep: (match: DiscoverMatch) => boolean) =>
    new Set(matched.filter(keep).map((match) => match.term)).size;
  const lexical = (match: DiscoverMatch) => !match.field.endsWith("-filter");
  return {
    row,
    matched,
    naming: distinct((match) => NAMING_FIELDS.has(match.field)),
    namingFields: new Set(matched.filter((match) => NAMING_FIELDS.has(match.field)).map((match) => match.field)).size,
    positive: distinct((match) => lexical(match) && match.field !== "avoidWhen"),
    any: distinct(lexical),
  };
}

export function discover(
  index: CompiledIndex,
  snippets: readonly DiscoverSnippet[],
  input: DiscoverInput,
): DiscoverResult {
  const { terms, ignored } = termsOf(input.query);
  const intents = [...new Set((input.intents ?? []).map((term) => foldCase(term.trim())).filter(Boolean))];
  const limit = Math.min(Math.max(1, Math.trunc(input.limit ?? DISCOVER_DEFAULT_LIMIT)), DISCOVER_MAX_LIMIT);
  const includeDeprecated = input.includeDeprecated === true;
  const host = input.host ? foldCase(input.host.trim()) : undefined;
  const filters = {
    ...(input.category ? { category: input.category } : {}),
    ...(host ? { host } : {}),
    ...(input.parent ? { parent: input.parent } : {}),
    includeDeprecated,
  };
  const hasFilter = Boolean(input.category || host || input.parent);

  const rows: Row[] = [];
  for (const entry of index.contracts) {
    for (const signature of entry.signatures) {
      rows.push({ order: rows.length, contract: entry.id, category: entry.category, signature });
    }
  }

  const categories = categoryFacet(index);

  if (terms.length === 0 && intents.length === 0 && !hasFilter) {
    return {
      input: { terms, ignored, filters, limit },
      coverage: "browse",
      candidates: [],
      total: 0,
      truncated: false,
      unmatchedTerms: [],
      examples: [],
      categories,
      vocabulary: vocabularyOf(rows),
      guidance:
        "Nothing to search for was given, so this lists the vocabulary instead. Call again with " +
        "`query` (words describing the UI), `intents` (terms from `vocabulary.intents`), or a " +
        "`category`/`host`/`parent` filter. `get_catalog` remains the exhaustive list.",
    };
  }

  const bySignature = examplesBySignature(snippets);
  const allTerms = [...intents, ...terms];
  const termsSeen = new Set<string>();
  const scored: Scored[] = [];

  for (const row of rows) {
    if (!includeDeprecated && row.signature.deprecated) continue;
    if (input.category && row.category !== input.category) continue;
    if (host && row.signature.host !== host) continue;
    if (input.parent && !row.signature.parents.includes(input.parent)) continue;

    const lexical = matchRow(row, terms, intents);
    if (allTerms.length > 0 && lexical.length === 0) continue;

    const filterEvidence: DiscoverMatch[] = [
      ...(input.category ? [{ field: "category-filter" as const, term: input.category, value: row.category ?? "" }] : []),
      ...(host ? [{ field: "host-filter" as const, term: host, value: row.signature.host }] : []),
      ...(input.parent ? [{ field: "parent-filter" as const, term: input.parent, value: input.parent }] : []),
    ];
    const matched = [...lexical, ...filterEvidence];
    for (const match of lexical) termsSeen.add(match.term);

    scored.push(scoreOf(row, matched));
  }

  scored.sort(compareCandidates);
  const kept = scored.slice(0, limit);
  const candidates = kept.map(({ row, matched }) => candidateOf(row, matched, bySignature));
  const unmatchedTerms = allTerms.filter((term) => !termsSeen.has(term));
  const truncated = scored.length > kept.length;
  const coverage: DiscoverCoverage =
    candidates.length === 0 ? "none" : unmatchedTerms.length > 0 || truncated ? "partial" : "complete";

  return {
    input: { terms, ignored, filters, limit },
    coverage,
    candidates,
    total: scored.length,
    truncated,
    unmatchedTerms,
    examples: relatedExamples(candidates, snippets, terms),
    categories,
    guidance: guidanceFor(coverage, unmatchedTerms, truncated),
  };
}

function candidateOf(
  row: Row,
  matched: readonly DiscoverMatch[],
  bySignature: ReadonlyMap<string, readonly string[]>,
): DiscoverCandidate {
  const signature = row.signature;
  return {
    signature: signature.id,
    contract: row.contract,
    ...(row.category ? { category: row.category } : {}),
    host: signature.host,
    intent: signature.intent,
    parents: signature.parents,
    useWhen: signature.useWhen,
    avoidWhen: signature.avoidWhen,
    alternatives: signature.alternatives,
    ...(signature.deprecated ? { deprecated: signature.deprecated } : {}),
    matched,
    examples: (bySignature.get(signature.id) ?? []).slice(0, CANDIDATE_EXAMPLE_LIMIT),
  };
}

/*
 * Examples worth a look, by two deterministic relationships only: the example's tree USES a
 * returned candidate, or an input term appears in the example's own id or intent line. Ordered by
 * distinct terms matched, then by the position of the earliest candidate it uses, then snippet
 * order.
 */
function relatedExamples(
  candidates: readonly DiscoverCandidate[],
  snippets: readonly DiscoverSnippet[],
  terms: readonly string[],
): DiscoverExample[] {
  const position = new Map(candidates.map((candidate, at) => [candidate.signature, at]));
  const related = snippets.flatMap((snippet, order) => {
    const used = signaturesIn(snippet.tree).filter((id) => position.has(id));
    const matched: DiscoverMatch[] = [];
    for (const term of terms) {
      if (textMatches(term, snippet.id)) matched.push({ field: "example", term, value: snippet.id });
      else if (textMatches(term, snippet.intent)) matched.push({ field: "example", term, value: snippet.intent });
    }
    if (used.length === 0 && matched.length === 0) return [];
    const earliest = Math.min(...used.map((id) => position.get(id)!), Number.MAX_SAFE_INTEGER);
    return [{ snippet, order, used, matched, earliest }];
  });

  related.sort(
    (a, b) =>
      new Set(b.matched.map((m) => m.term)).size - new Set(a.matched.map((m) => m.term)).size ||
      a.earliest - b.earliest ||
      a.order - b.order,
  );

  return related.slice(0, DISCOVER_EXAMPLE_LIMIT).map(({ snippet, used, matched }) => ({
    id: snippet.id,
    level: snippet.level,
    intent: snippet.intent,
    uses: [...used].sort((a, b) => position.get(a)! - position.get(b)!),
    matched,
  }));
}

function categoryFacet(index: CompiledIndex): DiscoverResult["categories"] {
  const counts = new Map<string, { families: number; signatures: number }>();
  for (const entry of index.contracts) {
    const id = entry.category ?? "uncategorized";
    const count = counts.get(id) ?? { families: 0, signatures: 0 };
    count.families += 1;
    count.signatures += entry.signatures.length;
    counts.set(id, count);
  }
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "en"))
    .map(([id, count]) => ({ id, ...count }));
}

function vocabularyOf(rows: readonly Row[]): NonNullable<DiscoverResult["vocabulary"]> {
  const intents = new Set<string>();
  const hosts = new Set<string>();
  for (const row of rows) {
    if (row.signature.deprecated) continue;
    for (const term of row.signature.intent) intents.add(term);
    hosts.add(row.signature.host);
  }
  const sorted = (values: Set<string>) => [...values].sort((a, b) => a.localeCompare(b, "en"));
  return { intents: sorted(intents), hosts: sorted(hosts) };
}

function guidanceFor(coverage: DiscoverCoverage, unmatched: readonly string[], truncated: boolean): string {
  const validate =
    "Pick by reading useWhen and avoidWhen, inspect a listed example if one fits, read the chosen " +
    "contract with get_contract, then validate_ui.";
  switch (coverage) {
    case "complete":
      return `Every term matched. ${validate}`;
    case "partial": {
      const parts = [
        unmatched.length > 0 ? `No field matched: ${unmatched.join(", ")}.` : "",
        truncated ? "More candidates matched than `limit` returned; narrow with a filter or raise `limit`." : "",
      ].filter(Boolean);
      return (
        `${parts.join(" ")} Matching is lexical, so a missing word may just be phrased differently: ` +
        "retry with other words or `intents` from a no-argument call, or page through get_catalog " +
        `if nothing here fits. ${validate}`
      );
    }
    case "none":
      return (
        "Nothing matched. Matching is lexical, so rephrase, try `intents` from a no-argument call, " +
        "or page through get_catalog, which lists every published family."
      );
    case "browse":
      return "";
  }
}
