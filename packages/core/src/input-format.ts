/*
 * INPUT FORMATS: the validation a text control can own without a server.
 *
 * `<input type="email">` and `<input type="url">` already give the platform's own validity check,
 * and this file does NOT replace them: it sits where the platform has nothing to say. A RUT is
 * arithmetic the browser has never heard of, a Chilean phone number is a numbering plan, and the
 * platform's own `type="url"` blesses `foo:bar` because it is a syntactically valid URL of a scheme
 * nobody can navigate to. Each function here answers "is this a real one", not "does this look like
 * one", which is the whole distinction the option exists for.
 *
 * EVERYTHING HERE IS PURE. No DOM, no timing, no message rendered into a page: a value in, a result
 * out. That is what lets the same decision run in both bindings (decision 13) and be tested without
 * a browser, and it is why the reasons are DATA (`check-digit`, `unknown-prefix`) rather than
 * prose. A binding turns a reason into a sentence; a consumer can turn it into a different one.
 *
 * EMPTINESS IS NOT A FORMAT ERROR, and this file never reports one. An empty field is either fine
 * (the field is optional) or a `required` violation, and `required` is already the platform's, sent
 * down by FormField's own wiring. A format that also policed emptiness would give every optional
 * field two sources of truth for the same red text.
 */

/*
 * The vocabulary, declared here rather than in the contract so that the validators, the messages
 * and the contract's own enum all read the SAME list. `input.ts` spreads this into
 * `options.format.values`, which is what the binding's union is then derived from: adding a format
 * is this line plus a validator, and the compiler names every place that has not caught up.
 */
export const inputFormatNames = ["rut", "phone", "url", "email"] as const;

/**
 * `phone` HAS NO VALIDATOR IN THIS FILE, and that absence is the design rather than a gap.
 *
 * A phone number is only checkable against a numbering plan, and every country has its own: the
 * table is roughly 155 kB of metadata that nobody validating a RUT should have to download. So
 * `@skryensya/phone` wraps libphonenumber-js and registers itself through `registerInputFormat`
 * below, exactly the way `@skryensya/editor` is an optional peer that a page opts into by calling
 * its own mount, rather than something the default runtime drags in.
 *
 * A HAND-WRITTEN CHILEAN PLAN LIVED HERE FIRST, and was deleted rather than kept beside this,
 * because measuring it against the real metadata showed it wrong in BOTH directions: it accepted
 * `+56 9 1234 5678` (the `91x` mobile range is not assigned) and rejected `+56 44 123 4567` (44 is
 * a real area code that the hand-written list simply missed). Two validators that disagree about
 * the same number are worse than one that has to be installed.
 *
 * `rut` keeps its own implementation for the opposite reason: modulo 11 is thirty lines of
 * arithmetic that is the same everywhere and will never need a metadata table.
 */
export type InputFormat = (typeof inputFormatNames)[number];

/**
 * WHY a value was rejected, as data. Bindings map these to sentences; a consumer that wants its own
 * wording maps them to different ones, which is only possible because the reason is not the prose.
 *
 * - `shape`: the characters are not the ones this format is made of at all.
 * - `check-digit`: the shape is right and the arithmetic disagrees. Only a RUT can fail this way,
 *   and it is the single reason this file exists rather than a `pattern` on the contract option.
 * - `unknown-prefix`: the digits are right in number, and no real numbering plan starts that way.
 * - `country`: a phone number in national form with nothing to say which country's plan to read it
 *   against. Not the value's fault, which is why it is its own reason and its own sentence.
 * - `protocol`: a URL of a scheme a browser cannot navigate to (`ftp:`, `javascript:`, `foo:`).
 * - `host`: parsed, and the host is not one that can exist publicly (no dot, so no registry).
 */
export type InputFormatReason = "shape" | "check-digit" | "unknown-prefix" | "country" | "protocol" | "host";

/**
 * `normalized` is the canonical form of an accepted value, never a rewrite of what was typed: the
 * caller decides whether to submit it, display it, or ignore it. A RUT normalizes to `12345678-5`
 * (no dots, uppercase K), a phone to `+56912345678`, a URL to its parsed absolute form. Storing the
 * normalized value is what makes two spellings of one RUT compare equal later.
 */
export type InputFormatResult =
  | { readonly ok: true; readonly normalized: string }
  | { readonly ok: false; readonly reason: InputFormatReason };

const valid = (normalized: string): InputFormatResult => ({ ok: true, normalized });
const invalid = (reason: InputFormatReason): InputFormatResult => ({ ok: false, reason });

/* ------------------------------------------------------------------------------------------------
 * RUT
 * ---------------------------------------------------------------------------------------------- */

/** Dots, spaces and the hyphen are presentation. The value underneath is digits plus one check character. */
const stripRutPunctuation = (value: string): string => value.replace(/[.\s-]/g, "").toUpperCase();

/**
 * The check digit of a RUT body, by modulo 11.
 *
 * Multipliers cycle 2..7 from the RIGHTMOST digit of the body and wrap, the sum is taken mod 11, and
 * the digit is `11 - remainder`, with the two results that are not single digits spelled: 11 becomes
 * `0` and 10 becomes `K`. That `K` is the reason a RUT cannot be validated by a numeric check and
 * the reason the last character is compared as text.
 *
 * Exported because the arithmetic is worth having on its own: a form that GENERATES a RUT for a
 * fixture, or a test that wants a valid one, should compute it rather than copy a literal that
 * nobody can check by eye.
 */
export function rutCheckDigit(body: string): string {
  let sum = 0;
  let multiplier = 2;
  for (let index = body.length - 1; index >= 0; index -= 1) {
    sum += Number(body[index]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const remainder = 11 - (sum % 11);
  if (remainder === 11) return "0";
  if (remainder === 10) return "K";
  return String(remainder);
}

/*
 * SEVEN OR EIGHT DIGITS, which is a range and not a shape check in disguise.
 *
 * Modulo 11 blesses `1-9` and `2-7` quite happily: they are arithmetically consistent and they are
 * not RUTs. The lower bound puts the floor at 1.000.000, below which no RUT has been issued to a
 * living person, and the upper bound at 99.999.999, above which the register does not go. Without
 * it the "correct" validation accepts a single typed digit, which is exactly the false pass this
 * whole file was written to stop.
 */
const RUT_SHAPE = /^(\d{7,8})([\dK])$/;

/**
 * Validates a Chilean RUT: shape, range, and the modulo 11 check digit.
 *
 * Accepts every spelling in circulation (`12.345.678-5`, `12345678-5`, `123456785`, lowercase `k`)
 * because the punctuation is the reader's, not the number's.
 */
export function validateRut(value: string): InputFormatResult {
  const cleaned = stripRutPunctuation(value);
  const match = RUT_SHAPE.exec(cleaned);
  if (!match) return invalid("shape");

  const [, body, given] = match;
  if (rutCheckDigit(body) !== given) return invalid("check-digit");
  return valid(`${body}-${given}`);
}

/* ------------------------------------------------------------------------------------------------
 * URL
 * ---------------------------------------------------------------------------------------------- */

/** The two schemes a link in a page can actually be followed to. */
const NAVIGABLE_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Validates a web address: parses, then insists on a scheme a browser can follow and a host that
 * can exist.
 *
 * `new URL()` ALONE IS NOT VALIDATION, which is the trap this function is shaped around.
 * `new URL("foo:bar")` succeeds (scheme `foo:`), `new URL("javascript:alert(1)")` succeeds, and
 * `new URL("https://localhost")` succeeds with a host no public registry knows. Parsing answers "is
 * this syntactically a URL"; the two checks after it answer the question a form is actually asking.
 *
 * A value with no scheme is read as `https://`, because `example.com` is what people type into a
 * field labelled "website" and rejecting it teaches nothing. The scheme is added to a COPY for
 * parsing; what comes back in `normalized` is the absolute URL that resulted.
 */
export function validateUrl(value: string): InputFormatResult {
  const trimmed = value.trim();
  /* Internal whitespace never survives a real URL, and `new URL()` percent-encodes it instead of
     failing, so a typed sentence would come back "valid" as an escaped path. */
  if (!trimmed || /\s/.test(trimmed)) return invalid("shape");

  /* Only a scheme-looking prefix is left alone. `example.com:8080` has a colon and is not a scheme,
     which is why this tests the scheme's own grammar rather than the presence of a colon. */
  const hasScheme = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed);
  const candidate = hasScheme ? trimmed : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return invalid("shape");
  }

  if (!NAVIGABLE_PROTOCOLS.has(url.protocol)) return invalid("protocol");

  /* A host with no dot is either a local name (`localhost`, an intranet machine) or a typo. Neither
     is a public web address, which is what a URL field on a form is asking for. IPv6 hosts arrive
     bracketed and contain colons instead, so they are allowed through on their own terms. */
  const host = url.hostname;
  const isBracketedIpv6 = host.startsWith("[") && host.endsWith("]");
  if (!isBracketedIpv6 && !host.includes(".")) return invalid("host");
  /* A trailing or doubled dot parses fine and resolves to nothing. */
  if (!isBracketedIpv6 && (host.startsWith(".") || host.endsWith(".") || host.includes(".."))) {
    return invalid("host");
  }

  return valid(url.href);
}

/* ------------------------------------------------------------------------------------------------
 * Email
 * ---------------------------------------------------------------------------------------------- */

/*
 * The WHATWG spec's own regular expression for `<input type="email">`, byte for byte.
 *
 * Copied rather than improved on purpose: this is the exact expression the browser applies to a
 * native email input, so a field validated here and the same field validated by the platform agree.
 * An expression of this repo's own devising would be a second opinion, and the disagreement would
 * land on a user whose address one of them rejects.
 *
 * There is no "really correct" email validation short of sending a message to it, and this file
 * does not pretend otherwise. What it adds below the spec is the single check the spec deliberately
 * omits, and see the comment there for why that one is safe to add.
 */
const HTML_EMAIL =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Validates an email address to the platform's own bar, plus a public domain.
 *
 * The spec's expression accepts `someone@localhost` because an intranet address is legal in the
 * abstract. A form on the public web asking for an email is not asking for that, and a missing `.`
 * is overwhelmingly a half-typed domain, so a dotless host is reported as `host` rather than
 * `shape`: the address is well formed and the domain cannot receive mail from outside its own
 * network.
 */
export function validateEmail(value: string): InputFormatResult {
  const trimmed = value.trim();
  if (!HTML_EMAIL.test(trimmed)) return invalid("shape");

  const domain = trimmed.slice(trimmed.lastIndexOf("@") + 1);
  if (!domain.includes(".")) return invalid("host");

  /* Case is insignificant in the domain and significant, in principle, in the local part. Lowercasing
     only the domain is the normalization that is safe to make. */
  const at = trimmed.lastIndexOf("@");
  return valid(`${trimmed.slice(0, at)}@${domain.toLowerCase()}`);
}

/* ------------------------------------------------------------------------------------------------
 * The dispatcher, the display form, and the words
 * ---------------------------------------------------------------------------------------------- */

/**
 * What a format needs to know beyond the value itself.
 *
 * Only `country` so far, and only `phone` reads it: `912345678` is a valid Chilean mobile and a
 * meaningless string anywhere else, so a national-format number cannot be judged without one. A RUT
 * and an email carry their own context entirely.
 */
export type InputFormatContext = { readonly country?: string };

/** One format's implementation: how it judges a value, and optionally how it prints an accepted one. */
export type InputFormatModule = {
  readonly validate: (value: string, context: InputFormatContext) => InputFormatResult;
  /** The display form. Falls back to the result's `normalized` when a format has nothing prettier. */
  readonly display?: (value: string, context: InputFormatContext) => string;
};

/*
 * ONE LOOKUP FOR EVERY FORMAT, built-in or installed, and that uniformity is the point.
 *
 * The three formats this package implements seed the map at load; `phone` is absent until
 * `@skryensya/phone` registers it. A second code path for "the optional ones" would be a second
 * place for the empty case, the message and the display form to be decided differently.
 *
 * Mutable module state, deliberately and with its cost acknowledged: registration is global and
 * order-dependent, which is the price of letting a format arrive from a package core must never
 * name. It is the same trade `@skryensya/editor` makes as an optional peer.
 */
const modules = new Map<InputFormat, InputFormatModule>([
  ["rut", { validate: validateRut, display: displayRut }],
  ["url", { validate: validateUrl }],
  ["email", { validate: validateEmail }],
]);

/**
 * Installs the implementation for a format the contract declares but this package does not ship.
 *
 * Called once at startup by `@skryensya/phone`. Replacing a BUILT-IN is allowed on purpose (a
 * consumer whose email rules are stricter than the platform's should not have to fork the option to
 * say so), which is why this takes any `InputFormat` rather than only the unimplemented ones.
 */
export function registerInputFormat(format: InputFormat, module: InputFormatModule): void {
  modules.set(format, module);
  warned.delete(format);
}

/** Whether a format can be judged at all right now. Useful to a consumer deciding what to render. */
export function hasInputFormat(format: InputFormat): boolean {
  return modules.has(format);
}

/*
 * ONE WARNING PER FORMAT, and never an error.
 *
 * A format with nobody to implement it means a package was not installed, which is the developer's
 * problem and never the person filling in the form. Failing the value would paint a correct phone
 * number red with a message nothing they can type will clear; throwing would take down a page over
 * one misconfigured field. So the field simply goes unvalidated, once, loudly, in the console where
 * the person who can fix it is looking.
 */
const warned = new Set<InputFormat>();

function warnMissing(format: InputFormat): void {
  if (warned.has(format)) return;
  warned.add(format);
  const advice =
    format === "phone"
      ? 'Install @skryensya/phone and call registerPhoneFormat() once at startup.'
      : `Call registerInputFormat(${JSON.stringify(format)}, ...) once at startup.`;
  console.warn(
    `[skryensya] format=${JSON.stringify(format)} has no validator registered, so the field is not ` +
      `being validated. ${advice}`,
  );
}

/**
 * Validates `value` against `format`.
 *
 * An empty value is ACCEPTED, always. See this file's own header: emptiness is `required`'s
 * question, and answering it here would give an optional field two contradictory sources of red.
 *
 * An UNREGISTERED format is also accepted, with one console warning. See `warnMissing`.
 */
export function validateInputFormat(
  format: InputFormat,
  value: string,
  context: InputFormatContext = {},
): InputFormatResult {
  if (value.trim() === "") return valid("");
  const module = modules.get(format);
  if (!module) {
    warnMissing(format);
    return valid(value.trim());
  }
  return module.validate(value, context);
}

/**
 * WHEN THE MESSAGE IS ALLOWED TO SHOW, and the reason this one-line rule is a function.
 *
 * Validity is continuous (it is recomputed on every keystroke, so the platform's own submit gate
 * stays current) and the MESSAGE is not: turning a field red while someone is still typing the
 * fourth digit of their RUT is scolding them for not having finished. The error appears once they
 * have left the field, and from then on it tracks the value live so that fixing it clears it.
 *
 * `touched` is the binding's to own, because "has this person left the field yet" is DOM. The rule
 * over it lives here so that React and the enhancer cannot drift on the one thing a reader sees.
 * Same shape, and the same reasoning, as `isQuestionnaireItemInvalid`'s `attempted` gate.
 */
export function shouldShowInputError(touched: boolean, result: InputFormatResult): boolean {
  return touched && !result.ok;
}

/**
 * The canonical DISPLAY form of a value, which is not the same as `normalized`.
 *
 * `normalized` is for storing and comparing (`12345678-5`); this is for showing a person what they
 * typed, punctuated the way the country writes it (`12.345.678-5`). Pure, and applied by nobody
 * automatically: neither binding rewrites a field while it is being typed in, because moving a
 * caret out from under someone mid-word is a worse bug than an unpunctuated RUT. It is here for a
 * consumer that wants to format on blur, or on submit, and can decide that for itself.
 */
export function formatInputValue(
  format: InputFormat,
  value: string,
  context: InputFormatContext = {},
): string {
  const result = validateInputFormat(format, value, context);
  if (!result.ok || result.normalized === "") return value;
  return modules.get(format)?.display?.(value, context) ?? result.normalized;
}

/** `12345678-5` becomes `12.345.678-5`: thousands separators from the right, at either body length. */
function displayRut(value: string): string {
  const result = validateRut(value);
  if (!result.ok) return value;
  const [body, checkDigit] = result.normalized.split("-");
  return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${checkDigit}`;
}

/**
 * The default sentence for every reason a format can reject a value, in English, because the kit is
 * English and the locale is the consumer's (decision 21).
 *
 * Keyed by format FIRST: "the check digit does not match" is only ever a RUT's problem, and a shared
 * table of reasons would have to be worded so vaguely that it stopped telling anyone what to fix.
 * Every entry says what is wrong with THIS value, never "invalid", and never restates the label.
 *
 * A consumer replaces one message with the `errorLabel` option on the control, or all of them by
 * reading `reason` off the event and writing its own.
 */
export const inputFormatMessages: Readonly<
  Record<InputFormat, Partial<Record<InputFormatReason, string>>>
> = {
  rut: {
    shape: "A RUT is 7 or 8 digits followed by a check digit, like 12.345.678-5.",
    "check-digit": "That check digit does not match the number before it.",
  },
  /*
   * Present even though `@skryensya/phone` owns the validator: the WORDS are the kit's, so a
   * consumer who installs the package gets sentences written to the same bar as the rest, and one
   * who replaces the validator still inherits them.
   */
  phone: {
    shape: "That is not a phone number.",
    "unknown-prefix": "No number like that exists in that country.",
    country: "Add the country code, like +56, or set the field's country.",
  },
  url: {
    shape: "That is not a web address.",
    protocol: "Only http and https addresses can be opened.",
    host: "That address has no domain, like example.com.",
  },
  email: {
    shape: "An email address looks like name@example.com.",
    host: "That address has no domain, like example.com.",
  },
};

/**
 * The sentence for a rejection. Falls back to the format's `shape` message for a reason a format
 * never produces, so a caller can hand this any pair without a missing-key hole opening in the UI.
 */
export function inputFormatMessage(format: InputFormat, reason: InputFormatReason): string {
  const messages = inputFormatMessages[format];
  return messages[reason] ?? messages.shape ?? "";
}
