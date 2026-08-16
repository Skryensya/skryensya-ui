document.querySelectorAll(".sk-toast-region").forEach((region) => {
  region.addEventListener("sk-dismiss", (event) => {
    // The toast that asked to be dismissed is the event's target, and removing it is the whole
    // contract: the region owns no list of its children.
    if (event.target instanceof Element) event.target.remove();
  });
});
