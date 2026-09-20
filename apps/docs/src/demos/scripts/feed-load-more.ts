/*
 * WHAT AN APP DOES WITH A FEED WHOSE TOTAL IS UNKNOWN.
 *
 * None of this is the component's. `Feed` never fetches, never counts and never appends; it
 * publishes `aria-busy` for the app to set while a batch is in flight and it keeps every article
 * the app gives it navigable. This file is the other half, written the way a consumer would write
 * it, with a timeout standing in for the server.
 *
 * `aria-setsize` stays at `-1` on every article, including the new ones. That is WAI's value for
 * a total that is genuinely undetermined, and it is the honest one here: this stream does not
 * know how many posts exist, only how many have arrived.
 */
const feed = document.querySelector<HTMLElement>('[data-feed-demo="stream"]');
const button = document.querySelector<HTMLButtonElement>('[data-feed-demo="more"]');

/* Two more batches, then the button retires: a demo that loads forever is a demo nobody finishes. */
let remaining = 2;

button?.addEventListener("click", () => {
  if (!feed || !button || remaining < 1) return;

  const articles = feed.querySelectorAll<HTMLElement>('[role="article"]');
  const last = articles[articles.length - 1];
  if (!last) return;

  /* Set BEFORE the DOM changes and cleared immediately after, which is WAI's own sequencing:
     "aria-busy is set to true before a DOM change... set to false immediately after". */
  feed.setAttribute("aria-busy", "true");
  button.disabled = true;

  window.setTimeout(() => {
    const fresh = last.cloneNode(true);
    if (!(fresh instanceof HTMLElement)) return;

    const position = articles.length + 1;
    fresh.setAttribute("aria-posinset", String(position));
    fresh.setAttribute("aria-setsize", "-1");
    /* The clone carries the id its original's label was pointed at, and two nodes cannot share
       one. A fresh pair keeps `aria-labelledby` resolving to THIS article's own label. */
    const label = fresh.querySelector<HTMLElement>(".sk-feed__article-label");
    if (label) {
      const id = `feed-demo-article-${position}`;
      label.id = id;
      fresh.setAttribute("aria-labelledby", id);
      // The words come from the markup, not from this file: they are translations, and a
      // translation written here would have to be built once per language.
      label.textContent = button.dataset.feedAuthor ?? "";
    }
    const body = fresh.querySelector<HTMLElement>(".sk-feed__article-label + *");
    if (body) body.textContent = button.dataset.feedBody ?? "";

    feed.append(fresh);
    feed.setAttribute("aria-busy", "false");

    remaining -= 1;
    /* Left disabled once the stream is exhausted, rather than hidden: a control that vanishes
       under the pointer that just used it is its own small accessibility problem. */
    button.disabled = remaining < 1;
  }, 700);
});
