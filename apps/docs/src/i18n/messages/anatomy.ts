/*
 * THE FILLER EVERY ANATOMY DIAGRAM'S SUBJECT IS MADE OF.
 *
 * An anatomy diagram names PARTS. Its subject is there to have parts, not to say anything: the
 * moment a specimen reads "How long does shipping take?" the reader is reading a FAQ instead of
 * looking at `sk-tile__title`, and the length of that real sentence is also what decides where the
 * label ends up, so a copy edit two locales away silently redraws the diagram.
 *
 * So the subjects share one small Latin vocabulary, in lengths that match the slot: a word for a
 * row, a phrase for a title, a sentence for a description. See `demos/anatomy-subject.ts` for the
 * companion rule about which ICONS go generic and which ones stay.
 *
 * ONE SET OF STRINGS FOR BOTH LOCALES, and that is what placeholder Latin is FOR: translating it
 * would be inventing a Spanish dialect of nothing. `demo.commentThread.*` already does this and
 * carries the same allowlist entry in `ui.test.ts`.
 */
export const anatomyMessages = {
  es: {
    "anatomy.label": "Lorem ipsum",
    "anatomy.title": "Lorem ipsum dolor",
    "anatomy.description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    "anatomy.action": "Dolor sit",
    "anatomy.item1": "Lorem ipsum",
    "anatomy.item2": "Dolor sit amet",
    "anatomy.item3": "Consectetur elit",
  },
  en: {
    "anatomy.label": "Lorem ipsum",
    "anatomy.title": "Lorem ipsum dolor",
    "anatomy.description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    "anatomy.action": "Dolor sit",
    "anatomy.item1": "Lorem ipsum",
    "anatomy.item2": "Dolor sit amet",
    "anatomy.item3": "Consectetur elit",
  },
} as const;
