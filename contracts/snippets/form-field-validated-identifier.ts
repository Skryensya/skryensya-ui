import type { Snippet } from "./snippet.js";

export const formFieldValidatedIdentifierSnippet: Snippet = {
  id: "form-field-validated-identifier",
  level: "component",
  intent: "A field whose value has a real validity the browser cannot check, so the control checks it.",
  notes: [
    "`format` is not a `pattern` with a friendlier name, and reaching for one here is the mistake " +
      "this snippet exists to prevent. A RUT's last character is a modulo 11 check digit over the " +
      "digits before it: `12.345.678-4` matches every regular expression a RUT can be described " +
      "with, and is not a RUT. Arithmetic is not a shape, so it cannot live in `pattern`.",
    "NO `error` SLOT IS AUTHORED, unlike `form-field-hint-and-error`, and the contrast is the " +
      "point. There the message is the composer's, because \"passwords don't match\" is something " +
      "the tree knows. Here it is not: whether this particular check digit matches is state no " +
      "tree can carry, so the control writes the message into the field's error slot itself, once " +
      "the reader leaves the field. Authoring one anyway is still allowed and still wins  -  that " +
      "is how you say \"that RUT is already registered\", which the arithmetic cannot know.",
    "The validity also reaches `setCustomValidity`, so a native `<form>` around this refuses to " +
      "submit without anything here reimplementing submission.",
    "`format: \"phone\"` is the same shape plus a `country` (\"CL\", \"US\"), and is the one value " +
      "that needs `@skryensya/phone` installed and registered: numbering plans are ~155 kB of " +
      "metadata, so Core declares the format and ships no validator for it. Unregistered, the " +
      "field renders and simply does not validate. `\"rut\"`, `\"url\"` and `\"email\"` need nothing.",
  ],
  tree: {
    contract: "form-field",
    signature: "FormField",
    options: { required: true },
    slots: {
      label: "RUT",
      hint: "With dots or without them, it makes no difference.",
    },
    children: {
      contract: "input",
      signature: "Input",
      options: { format: "rut", name: "rut", placeholder: "12.345.678-5" },
    },
  },
};
