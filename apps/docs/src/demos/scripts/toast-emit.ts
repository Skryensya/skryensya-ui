const region = document.querySelector("[data-emit-region]");
const template = document.querySelector<HTMLTemplateElement>("[data-toast-template]");

document.querySelector("[data-emit-toast]")?.addEventListener("click", async () => {
  // `content` is a DocumentFragment and only a <template> has one, which is why the query above
  // asks for the element type rather than for any Element.
  const toast = template?.content.firstElementChild?.cloneNode(true);
  if (!region || !(toast instanceof Element)) return;

  region.append(toast);
  await window.skMount?.(toast);
});
