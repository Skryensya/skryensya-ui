/*
 * THE DESTINATIONS A DEMO SHOWS WHEN NOBODY HANDED IT REAL ONES.
 *
 * A demo that renders links takes its hrefs from the page, which knows where things live. The
 * playground calls every demo with `t` alone and has nowhere real to send anyone, and a missing href
 * is not "no link", it is an invalid tree, so the demo used to be dropped from the playground without
 * a word. Defaulting to this instead keeps the SHAPE of every link (which is what the example is
 * about) and sends it nowhere.
 *
 * Every key reads "#", and so does every index, so one value stands in for a named record
 * (`{ home, reports }`) and for a list (`hrefs[3]`) alike.
 */
export function placeholderHrefs<T>(): T {
  return new Proxy(
    {},
    { get: (_target, key) => (typeof key === "string" ? "#" : undefined) },
  ) as T;
}

/** The single-href case. */
export const PLACEHOLDER_HREF = "#";
