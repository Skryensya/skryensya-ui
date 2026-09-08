/*
 * WHAT AN APP DOES WITH A SCROLLBAR: watch it, show the shape of what is coming while it is in
 * flight, then swap that shape for what arrived. None of this is the component's - `CommentThread`
 * has no idea paging exists, the same way it has no idea a network exists.
 *
 * A `scroll` listener, not an `IntersectionObserver`: the scroller here is an ordinary overflow box
 * (`data-comment-demo-scroll`), not the preview frame's own viewport - the frame grows to fit its
 * content rather than scrolling itself - so "near the bottom" is a distance check against
 * `scrollHeight`, the same test a real infinite-scroll consumer runs against their own list.
 */

type IncomingComment = { author: string; body: string };

const scroller = document.querySelector<HTMLElement>("[data-comment-demo-scroll]");
const skeleton = document.querySelector<HTMLElement>("[data-comment-demo-skeleton]");
const thread = document.querySelector<HTMLElement>("[data-sk-comment-thread]");
const template = document.querySelector<HTMLTemplateElement>("template");

const queue: IncomingComment[] = scroller
  ? [
      {
        author: scroller.dataset.commentDemoQueueAAuthor ?? "",
        body: scroller.dataset.commentDemoQueueABody ?? "",
      },
      {
        author: scroller.dataset.commentDemoQueueBAuthor ?? "",
        body: scroller.dataset.commentDemoQueueBBody ?? "",
      },
    ].filter((entry) => entry.body)
  : [];

let loading = false;

/* Cloned from the blueprint, never hand-built, the same rule `sk:commentreply`'s own handler
 * follows in the sibling script. The avatar has no data-hook of its own (`avatar.ts` never needed
 * one before this), so this is the one place a demo script reaches for a part class instead. */
function appendIncoming({ author, body }: IncomingComment): void {
  const fresh = template?.content.firstElementChild?.cloneNode(true);
  if (!thread || !(fresh instanceof HTMLElement)) return;

  fresh.dataset.value = `scroll-${Date.now()}`;
  const write = (attr: string, text: string) => {
    const node = fresh.querySelector<HTMLElement>(`[${attr}]`);
    if (node) node.textContent = text;
  };
  write("data-sk-comment-body", body);
  write("data-sk-comment-author", author);
  fresh.querySelector(".sk-avatar")?.setAttribute("aria-label", author);
  const fallback = fresh.querySelector<HTMLElement>(".sk-avatar__fallback");
  if (fallback) fallback.textContent = author.slice(0, 2).toUpperCase();

  thread.append(fresh);
  void window.skMount?.(fresh);
}

scroller?.addEventListener("scroll", () => {
  if (loading || queue.length === 0 || !scroller || !skeleton) return;
  const nearBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 16;
  if (!nearBottom) return;

  loading = true;
  skeleton.hidden = false;
  setTimeout(() => {
    skeleton.hidden = true;
    const next = queue.shift();
    if (next) appendIncoming(next);
    loading = false;
  }, 900);
});
