import { Breadcrumb } from "@skryensya/react/breadcrumb";
import { Wrapper } from "@skryensya/react/layout";
import { AppNavbar } from "./AppNavbar";
import { CaseDetailPage } from "./pages/CaseDetailPage";
import { CaseListPage } from "./pages/CaseListPage";
import { ExecutionDetailPage } from "./pages/ExecutionDetailPage";
import { casePath, casesPath, useRoute } from "./router";

/*
 * Three routes, dispatched from `useRoute()` — no route-config table, no `<Routes>` tree: with three
 * shapes total, a plain `switch` over `route.type` is the whole router surface this app needs (see
 * `router.ts`'s own doc for why a library was rejected). `installLinkInterceptor()` is armed once in
 * `main.tsx`, not here — it's document-level and has no reason to re-run per render.
 *
 * `<AppNavbar />` is its own `<header>` (the `Navbar` contract's host element), so the breadcrumb sits
 * OUTSIDE it, in `<main>` — nesting the app's page-level "where am I" trail inside the persistent
 * top bar would be two different jobs sharing one landmark.
 *
 * `<Wrapper wrapperSize="lg">` bounds `<main>`'s content to `--size-wrapper-lg` (90rem), replacing
 * the hand-rolled `max-width: 88rem` `app.css` used to carry — that constant duplicated a measure the
 * kit already names, and the two didn't quite agree with the navbar's own gutter, so the header's
 * brand/actions row sat ~48px further out than the page content below it (measured live). `Wrapper`
 * cannot go INSIDE `<Navbar>` itself — `validate_ui` rejects it: `Navbar`'s `children` slot only takes
 * `NavbarBrand | NavbarActions | NavList | Megamenu`, and both of those signatures must sit directly
 * inside `Navbar`, not one level down through a wrapper. So the navbar's own alignment isn't a second
 * `Wrapper` node — it's `--sk-navbar-padding-x` in `app.css`, computed to land on the exact same
 * gutter this `Wrapper` produces, using the same `--size-wrapper-lg` token so the two can't drift
 * apart again.
 */
export function App() {
  const route = useRoute();

  return (
    <>
      <AppNavbar />
      <main>
        <Wrapper size="lg">
          {route.type !== "cases" && (
            <Breadcrumb
              items={[
                { href: casesPath(), label: "cases" },
                ...(route.type === "case"
                  ? [{ label: route.caseId, current: true }]
                  : [
                      { href: casePath(route.caseId), label: route.caseId },
                      { label: `${route.runId} [${route.lang}]`, current: true },
                    ]),
              ]}
            />
          )}

          {route.type === "cases" && <CaseListPage />}
          {route.type === "case" && <CaseDetailPage caseId={route.caseId} />}
          {route.type === "execution" && (
            <ExecutionDetailPage caseId={route.caseId} runId={route.runId} lang={route.lang} />
          )}
        </Wrapper>
      </main>
    </>
  );
}
