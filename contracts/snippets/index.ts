import { actionRowInCardsSnippet } from "./action-row-in-cards.js";
import { calloutErrorWithRetrySnippet } from "./callout-error-with-retry.js";
import { footerCreditLineSnippet } from "./footer-credit-line.js";
import { formFieldHintAndErrorSnippet } from "./form-field-hint-and-error.js";
import { heroCenteredMinimalSnippet } from "./hero-centered-minimal.js";
import { heroSplitWithMediaSnippet } from "./hero-split-with-media.js";
import { heroWithActionsSnippet } from "./hero-with-actions.js";
import { heroWithAppBadgesSnippet } from "./hero-with-app-badges.js";
import { heroWithAudienceTabsSnippet } from "./hero-with-audience-tabs.js";
import { heroWithCodePreviewSnippet } from "./hero-with-code-preview.js";
import { heroWithEmailCaptureSnippet } from "./hero-with-email-capture.js";
import { heroWithEyebrowSnippet } from "./hero-with-eyebrow.js";
import { heroWithLogoWallSnippet } from "./hero-with-logo-wall.js";
import { heroWithPricingToggleSnippet } from "./hero-with-pricing-toggle.js";
import { heroWithSocialProofSnippet } from "./hero-with-social-proof.js";
import { heroWithTestimonialSnippet } from "./hero-with-testimonial.js";
import { heroWithVideoDemoSnippet } from "./hero-with-video-demo.js";
import { iconButtonToolbarWithTooltipsSnippet } from "./icon-button-toolbar-with-tooltips.js";
import { iconOnlyButtonTooltipSnippet } from "./icon-only-button-tooltip.js";
import { paginationStandaloneSnippet } from "./pagination-standalone.js";
import { productCardInGridSnippet } from "./product-card-in-grid.js";
import { settingsRowWithSwitchSnippet } from "./settings-row-with-switch.js";
import { tableWithPaginationSnippet } from "./table-with-pagination.js";
import type { Snippet } from "./snippet.js";

/*
 * Every snippet, component-level first (one family, well-composed), then molecule-level (a few
 * families, one small piece of UI). Mirrors `@skryensya/recipes`' own `index.ts`: the compiler
 * validates every tree here against the contracts, so this list is not a catalogue of good
 * intentions. A snippet naming a signature that changed fails the build.
 */
export const snippets: readonly Snippet[] = [
  calloutErrorWithRetrySnippet,
  iconOnlyButtonTooltipSnippet,
  formFieldHintAndErrorSnippet,
  heroWithActionsSnippet,
  heroCenteredMinimalSnippet,
  heroWithEyebrowSnippet,
  footerCreditLineSnippet,
  paginationStandaloneSnippet,
  settingsRowWithSwitchSnippet,
  actionRowInCardsSnippet,
  productCardInGridSnippet,
  iconButtonToolbarWithTooltipsSnippet,
  tableWithPaginationSnippet,
  heroSplitWithMediaSnippet,
  heroWithSocialProofSnippet,
  heroWithEmailCaptureSnippet,
  heroWithAppBadgesSnippet,
  heroWithLogoWallSnippet,
  heroWithPricingToggleSnippet,
  heroWithCodePreviewSnippet,
  heroWithVideoDemoSnippet,
  heroWithAudienceTabsSnippet,
  heroWithTestimonialSnippet,
];

export type { Snippet, SnippetLevel } from "./snippet.js";
