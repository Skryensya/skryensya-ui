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
  /** Free text, matched word by word, lexically, against a catalogue written in English. */
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
  /**
   * Present when the input negated the term ("with no save button"). `query`: only the input
   * negates it, so this match is evidence of a conflict and never counts toward order. `both`: the
   * value negates the input's whole negated phrase too (`faq-without-javascript` for "without
   * JavaScript", "there is no save button involved" for "no save button"), so the two agree and it
   * counts as usual.
   */
  readonly negation?: "query" | "both";
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
    /** Terms searched for. */
    readonly terms: readonly string[];
    /**
     * Terms the input negated ("no X", "without X", "sin X"). They never admit a candidate or
     * improve its order; where one matches an admitted candidate it is reported with `negation`.
     */
    readonly negated: readonly string[];
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
  /**
   * Input terms (not negated ones) no field matched at all. A non-empty list is the cue to rephrase
   * or read the catalogue.
   */
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
 * THE MATCH RULE. An input term matches a field word when:
 *
 *   1. they are equal, or one is the plural of the other (`s`/`es`, the shorter at least 3
 *      characters): `tab`/`tabs`, `boton`/`botones`; or
 *   2. they share a prefix of at least 7 characters: `navigate`/`navigation`,
 *      `configure`/`configuration`; or
 *   3. they are ONE STEM PLUS ENDINGS: some shared prefix of at least 4 characters after which each
 *      word has nothing left or one of the ENDINGS below. `select` + `ion`, `open` + `ing`,
 *      `clos` + `e`/`ing`, `cambi` + `a`/`ar`, `naveg` + `acion`/`ar`, `list` + `a`, `tabl` + `a`/`e`.
 *      With a 4-letter stem and nothing left of the input, the catalogue word is usually a
 *      different word that starts the same way (`view` is not `viewer`), so that one case is refused.
 *
 * Words under 4 characters only match by rule 1.
 *
 * THE ENDINGS are a closed, written list of English and Spanish inflections, not a stemmer and not
 * a dictionary of words. An extension counts only when it is one of them, which is what refuses a
 * compound or a different word that merely starts like a catalogue word: `editorial` is not `editor`
 * (-ial), `breakout` is not `break` (-out), `linkedin` is not `linked` (-in), `page` is not `pager`
 * (-r), `active` is not `action` (-ve/-on), `three` is not `thread` (-e/-ad).
 *
 * The rule before this one took a shared prefix of max(4, shorter - 2), which let every pair above
 * match. `discover.test.ts` pins each pair, both the ones this refuses and the ones it must keep.
 */
export function termMatchesWord(term: string, word: string): boolean {
  if (samePlural(term, word)) return true;
  const [shorter, longer] = term.length <= word.length ? [term, word] : [word, term];
  if (shorter.length < 4) return false;
  let shared = 0;
  while (shared < shorter.length && term[shared] === word[shared]) shared += 1;
  if (shared >= 7) return true;
  for (let stem = shared; stem >= 4; stem -= 1) {
    const [short, long] = [shorter.slice(stem), longer.slice(stem)];
    if (stem === 4 && short === "" && term.length < word.length) continue;
    if (inflects(shorter.slice(0, stem), short) && inflects(shorter.slice(0, stem), long)) return true;
  }
  return false;
}

const PLURAL_ENDINGS: ReadonlySet<string> = new Set(["s", "es"]);

/** Equal, or one the plural of the other (`s`/`es`, the shorter at least 3 characters). */
function samePlural(a: string, b: string): boolean {
  if (a === b) return true;
  const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
  return shorter.length >= 3 && longer.startsWith(shorter) && PLURAL_ENDINGS.has(longer.slice(shorter.length));
}

const ENDINGS: ReadonlySet<string> = new Set([
  // English
  "e", "s", "es", "d", "ed", "er", "ers", "ing", "ings", "ion", "ions", "ly", "able", "n",
  // Spanish (plus the "e", "es", "er", "n" above)
  "a", "o", "as", "os", "ar", "ir", "an", "en", "ado", "ada", "ados", "adas", "ando", "cion", "ciones",
  "acion", "aciones", "mente",
]);

/** Nothing left, a listed ending, or a listed ending after a doubled consonant (`label` + `led`). */
function inflects(stem: string, rest: string): boolean {
  if (rest === "" || ENDINGS.has(rest)) return true;
  return rest.length > 1 && rest[0] === stem.at(-1) && /[bcdfgklmnprstvz]/.test(rest[0]!) && ENDINGS.has(rest.slice(1));
}

function textMatches(term: string, text: string): boolean {
  return fieldWords(text).some(({ word }) => termMatchesWord(term, word));
}

/*
 * NEGATION, and nothing more of syntax than that. "A switch with no save button" should not make
 * `save` and `button` evidence FOR a split button. The scanner below is deliberately small, the same
 * on both sides, and not a parser:
 *
 *   - a negator (`no`, `not`, `without`, `never`; `sin`, `no`, `ni`, `nunca`) negates the next
 *     NEGATION_REACH content words after it;
 *   - clause punctuation, or a word that opens a new clause (`and`, `but`, `with`; `y`, `pero`,
 *     `sino`, `con`), ends the negation early; `or`/`o` do not, so "no save or cancel" negates both;
 *   - `n't` is read as `not`;
 *   - one postposed form, the absolute construction "with X disabled" (`with`/`con`, exactly ONE
 *     word, then `disabled`/`off`/`desactivado`/`deshabilitado`/`apagado`), negates X: "works with
 *     JavaScript disabled" is "works without JavaScript". Exactly one word, because "with the submit
 *     button disabled" describes a button that is there, and a bare "a disabled button" is a
 *     description, not a negation. The marker word is consumed like a negator.
 *
 * Any other postposed negation ("sin que haga falta X", "JavaScript is not needed") is NOT
 * recognised, and says so here rather than being guessed at.
 */
const NEGATORS: ReadonlySet<string> = new Set(["no", "not", "without", "never", "sin", "ni", "nunca"]);
const NEGATION_BREAKS: ReadonlySet<string> = new Set(["and", "but", "with", "y", "pero", "sino", "con"]);
const NEGATION_REACH = 3;
const WITH = new Set(["with", "con"]);
const POSTPOSED: ReadonlySet<string> = new Set([
  "disabled", "off", "desactivado", "desactivada", "deshabilitado", "deshabilitada", "apagado", "apagada",
]);
const CLAUSES = /[.,;:!?¡¿()[\]{}\n"“”]+/u;

/** `group`: which negation a negated word belongs to, so "no save button" stays one phrase. */
type PolarWord = { readonly word: string; readonly negated: boolean; readonly group?: number; readonly syntax?: true };

/** Whether a word can be a search term at all: long enough (or a number) and not a function word. */
function isContentWord(word: string): boolean {
  return (word.length >= 3 || /\d/.test(word)) && !STOPWORDS.has(word) && !NEGATORS.has(word);
}

/** Splits into words and marks each one negated or not, clause by clause. */
function polarWords(text: string, split: (clause: string) => readonly string[]): PolarWord[] {
  const out: PolarWord[] = [];
  let group = 0;
  for (const clause of text.replace(/n['’]t\b/giu, " not").split(CLAUSES)) {
    let reach = 0;
    for (const word of split(clause)) {
      if (NEGATORS.has(word)) {
        reach = NEGATION_REACH;
        group += 1;
        continue;
      }
      if (NEGATION_BREAKS.has(word)) reach = 0;
      const content = isContentWord(word);
      const [before, x] = [out.at(-2), out.at(-1)];
      if (POSTPOSED.has(word) && x && before && WITH.has(before.word) && isContentWord(x.word) && !out.at(-1)?.syntax) {
        group += 1;
        out[out.length - 1] = { word: x.word, negated: true, group };
        out.push({ word, negated: false, syntax: true });
        continue;
      }
      const negated = reach > 0 && content;
      out.push(negated ? { word, negated, group } : { word, negated });
      if (content && reach > 0) reach -= 1;
    }
  }
  return out;
}

/*
 * A field's words: its ids split at camelCase AND kept whole, so `NavListLink` offers nav, list,
 * link and navlistlink. An input word is never split at camelCase, which is why the whole form is
 * needed: "JavaScript" in a query is `javascript`, the way every intent spells it, not java + script.
 */
function fieldWords(text: string): readonly PolarWord[] {
  const cached = FIELD_WORDS.get(text);
  if (cached) return cached;
  const words = polarWords(text, (clause) => {
    const words: string[] = [];
    for (const token of clause.split(/[^\p{L}\p{N}]+/u)) {
      const parts = wordsOf(token);
      words.push(...parts);
      if (parts.length > 1) words.push(foldCase(token));
    }
    return words;
  });
  FIELD_WORDS.set(text, words);
  return words;
}

/* A pure function of the text, so memoized: the same prose is otherwise re-cut once per term. */
const FIELD_WORDS = new Map<string, readonly PolarWord[]>();

/** The first word of `text` a term matches, and whether the text negates it there. */
function matchIn(term: string, text: string): PolarWord | undefined {
  return fieldWords(text).find(({ word }) => termMatchesWord(term, word));
}

/**
 * Input text to terms: positive ones, negated ones (see NEGATORS), and words dropped as too short
 * or as function words. A word used both ways is positive: "a button, but no save button" still
 * asks for a button.
 */
function termsOf(query: string | undefined): {
  terms: string[];
  negated: string[];
  /** Each negation's words, together: "no save button" is one phrase, [save, button]. */
  phrases: string[][];
  ignored: string[];
} {
  const positive: string[] = [];
  const negated: string[] = [];
  const ignored: string[] = [];
  const groups = new Map<number, string[]>();
  const words = polarWords(query ?? "", (clause) => foldCase(clause).split(/[^\p{L}\p{N}]+/u).filter(Boolean));
  for (const { word, negated: isNegated, group, syntax } of words) {
    const into = syntax || !isContentWord(word) ? ignored : isNegated ? negated : positive;
    if (!into.includes(word)) into.push(word);
    if (into === negated && group !== undefined) groups.set(group, [...(groups.get(group) ?? []), word]);
  }
  const kept = negated.filter((word) => !positive.includes(word));
  const phrases = [...groups.values()].map((phrase) => phrase.filter((word) => kept.includes(word))).filter((phrase) => phrase.length > 0);
  return { terms: positive, negated: kept, phrases, ignored };
}

/**
 * Whether a value negates a whole negated phrase of the input: every word of "no save button" is
 * negated in the value too ("there is no save button involved"). One shared negated word is not
 * agreement: "never a row of buttons" says nothing about save buttons.
 */
function negatesPhrase(value: string, phrase: readonly string[]): boolean {
  const words = fieldWords(value);
  return phrase.every((term) => words.some(({ word, negated }) => negated && termMatchesWord(term, word)));
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

/** Whether a match counts toward admission and order: anything but a negation only the input makes. */
function counts(match: DiscoverMatch): boolean {
  return match.negation !== "query" && !match.field.endsWith("-filter");
}

function matchRow(
  row: Row,
  terms: readonly string[],
  negated: readonly string[],
  phrases: readonly (readonly string[])[],
  intents: readonly string[],
): DiscoverMatch[] {
  const matched: DiscoverMatch[] = [];
  const signature = row.signature;

  for (const term of intents) {
    const exact = signature.intent.find((value) => value === term);
    if (exact) matched.push({ field: "intent", term, value: exact });
  }

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
    /*
     * Which value a term is reported against, when several match: the one most input terms match
     * (so "view switcher" is reported as the single intent `view-switcher`, not two), then the one
     * equal to the term, then the first. Only reported values feed the ordering rules, so this is
     * what keeps every rule recomputable from `matched`.
     */
    const hits = values.map((value) => ({
      value,
      terms: terms.filter((term) => matchIn(term, value) !== undefined),
    }));
    const pick = (term: string, candidates: typeof hits) =>
      [...candidates].sort(
        (a, b) =>
          b.terms.length - a.terms.length ||
          Number(samePlural(foldCase(b.value), term)) - Number(samePlural(foldCase(a.value), term)),
      )[0];

    for (const term of terms) {
      const best = pick(term, hits.filter((hit) => hit.terms.includes(term)));
      if (best) matched.push({ field, term, value: best.value });
    }
    for (const term of negated) {
      const mine = phrases.filter((phrase) => phrase.includes(term));
      const found = values.flatMap((value) => {
        const word = matchIn(term, value);
        return word ? [{ value, both: mine.some((phrase) => negatesPhrase(value, phrase)) }] : [];
      });
      const best = found.find((hit) => hit.both) ?? found[0];
      if (best) matched.push({ field, term, value: best.value, negation: best.both ? "both" : "query" });
    }
  }

  return matched;
}

type Scored = {
  readonly row: Row;
  readonly matched: readonly DiscoverMatch[];
  /** Distinct counting terms matched in signature, contract, intent or category. */
  readonly naming: number;
  /** The most distinct counting terms any ONE naming value matched: `view-switcher` for "view switcher". */
  readonly phrase: number;
  /** Distinct counting terms equal to a whole naming value, or its plural: "buttons" and the `button` family. */
  readonly exact: number;
  /** Distinct naming fields (of those four) that matched a counting term. */
  readonly namingFields: number;
  /** Distinct counting terms matched in any field except avoidWhen. */
  readonly positive: number;
  /** Distinct counting terms matched in avoidWhen: the case described is one this is NOT for. */
  readonly avoided: number;
};

/*
 * THE ORDERING RULES, in priority order. Each is a count a person can redo by hand from `matched`,
 * using only the matches that count (every one except `negation: "query"`):
 *
 *   Naming evidence (signature, contract, intent, category):
 *   1. More distinct terms matched in a naming field.
 *   2. Then more terms matched by ONE naming value. "view switcher" meeting Segmented's single
 *      intent `view-switcher` says more than "view" in TreeView's id and "list" in one of its intents.
 *   3. Then more terms equal to a whole naming value, or its plural. "button" IS the `button`
 *      family; it is only a part of `state-button` and of the intent `icon-button-with-states`.
 *   4. Then more distinct naming fields matched. "switch" in a signature's own id AND its family id
 *      (Switch) outranks "switch" inside one intent term of an unrelated family.
 *   Positive semantic evidence:
 *   5. Then more distinct terms matched in any field but avoidWhen (adds useWhen, alternatives).
 *   Conflicting evidence:
 *   6. Then FEWER distinct terms matched in avoidWhen. Such a match still admits a candidate, since
 *      "exactly what this is not for" is how an agent reaches the alternative, but it never makes a
 *      candidate look better than one without it.
 *   7. Then catalogue order: the order `get_catalog` lists families and, within one, signatures.
 *
 * Rule 7 is total, so there are no ties left for anything unstable to decide. A candidate matched
 * only through filters has every count at zero and keeps catalogue order.
 */
function compareCandidates(a: Scored, b: Scored): number {
  return (
    b.naming - a.naming ||
    b.phrase - a.phrase ||
    b.exact - a.exact ||
    b.namingFields - a.namingFields ||
    b.positive - a.positive ||
    a.avoided - b.avoided ||
    a.row.order - b.row.order
  );
}

function scoreOf(row: Row, all: readonly DiscoverMatch[]): Scored {
  const matched = all.filter(counts);
  const distinct = (keep: (match: DiscoverMatch) => boolean) =>
    new Set(matched.filter(keep).map((match) => match.term)).size;
  const naming = matched.filter((match) => NAMING_FIELDS.has(match.field));
  const byValue = new Map<string, Set<string>>();
  for (const match of naming) {
    const key = `${match.field}\u0000${match.value}`;
    byValue.set(key, (byValue.get(key) ?? new Set()).add(match.term));
  }
  return {
    row,
    matched: all,
    naming: distinct((match) => NAMING_FIELDS.has(match.field)),
    phrase: Math.max(0, ...[...byValue.values()].map((set) => set.size)),
    exact: new Set(naming.filter((match) => samePlural(foldCase(match.value), match.term)).map((match) => match.term)).size,
    namingFields: new Set(naming.map((match) => match.field)).size,
    positive: distinct((match) => match.field !== "avoidWhen"),
    avoided: distinct((match) => match.field === "avoidWhen"),
  };
}

export function discover(
  index: CompiledIndex,
  snippets: readonly DiscoverSnippet[],
  input: DiscoverInput,
): DiscoverResult {
  const { terms, negated, phrases, ignored } = termsOf(input.query);
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
      input: { terms, negated, ignored, filters, limit },
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

    const lexical = matchRow(row, terms, negated, phrases, intents);
    // A negation only the input makes never admits: "no save button" is not a reason to list SplitButton.
    if (allTerms.length > 0 && !lexical.some(counts)) continue;

    const filterEvidence: DiscoverMatch[] = [
      ...(input.category ? [{ field: "category-filter" as const, term: input.category, value: row.category ?? "" }] : []),
      ...(host ? [{ field: "host-filter" as const, term: host, value: row.signature.host }] : []),
      ...(input.parent ? [{ field: "parent-filter" as const, term: input.parent, value: input.parent }] : []),
    ];
    const matched = [...lexical, ...filterEvidence];
    for (const match of lexical) if (counts(match)) termsSeen.add(match.term);

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
    input: { terms, negated, ignored, filters, limit },
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
        `${parts.join(" ")} Matching is lexical and the catalogue is written in English, so a missing ` +
        "word may just be phrased differently: retry in English or with other words, try `intents` " +
        "from a no-argument call, or page through get_catalog " +
        `if nothing here fits. ${validate}`
      );
    }
    case "none":
      return (
        "Nothing matched. Matching is lexical and the catalogue is written in English, so rephrase " +
        "in English, try `intents` from a no-argument call, " +
        "or page through get_catalog, which lists every published family."
      );
    case "browse":
      return "";
  }
}
