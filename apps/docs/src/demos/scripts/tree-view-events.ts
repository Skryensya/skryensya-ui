const demo = document.querySelector("[data-tree-events]");

demo?.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  const branch = target.closest<HTMLElement>("[data-sk-tree-view-branch]");
  const item = target.closest<HTMLElement>("[data-sk-tree-view-item]");
  const node = branch ?? item;
  if (!node) return;

  const output = demo.querySelector<HTMLElement>(
    branch ? "[data-tree-expansion]" : "[data-tree-selection]",
  );
  if (!output) return;

  const label = (output.textContent ?? "").split(":")[0];
  output.textContent = `${label}: ${node.dataset.value ?? ""}`;
});
