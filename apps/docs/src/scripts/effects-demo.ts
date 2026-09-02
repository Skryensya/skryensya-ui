/*
 * The one bit of JS on /efectos, and it exists only because a DEMO needs a way to ask for a replay;
 * the effect itself needs none. `sk-fx-pulse` runs once when the class appears (its own file's
 * header explains why there is no infinite variant), so replaying it here follows the documented
 * recipe: drop the class, force a reflow, put it back.
 */
export function initEffectsDemo(): void {
  const button = document.querySelector<HTMLElement>("[data-fx-pulse-replay]");
  const target = document.querySelector<HTMLElement>("[data-fx-pulse-target]");
  if (!button || !target) return;

  button.addEventListener("click", () => {
    target.classList.remove("sk-fx-pulse");
    void target.offsetWidth; // force a reflow so the re-added class is seen as a fresh animation
    target.classList.add("sk-fx-pulse");
  });
}
