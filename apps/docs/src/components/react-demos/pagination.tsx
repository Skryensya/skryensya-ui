/*
 * Live React demo for /components/pagination. Self-contained island: the current page is local
 * state, kept entirely inside the demo (no function props cross the Astro boundary).
 */
import { useState } from "react";
import { Pagination } from "@skryensya/react/pagination";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const PaginationDemo = framed(function PaginationDemo() {
  const [page, setPage] = useState(5);
  return (
    <Pagination
      page={page}
      total={12}
      onPageChange={setPage}
      label="Pagination"
      previousLabel="Previous page"
      nextLabel="Next page"
    />
  );
});
