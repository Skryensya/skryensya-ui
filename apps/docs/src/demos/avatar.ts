import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

const ACCENT_HEX = "1f5fc3";
const ON_ACCENT_HEX = "ffffff";
const demoSrc = (initials: string) =>
  `https://dummyimage.com/160/${ACCENT_HEX}/${ON_ACCENT_HEX}?text=${initials}`;

/** Photo identities, an initials fallback and a capped group from the same Avatar contract. */
export const avatarTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "md", inlineAlign: "center" },
  attrs: { "aria-label": t("demo.avatar.label") },
  children: [
    {
      contract: "avatar",
      signature: "Avatar.image",
      options: { imageName: "Ada Lovelace", size: "sm", src: demoSrc("AL") },
    },
    {
      contract: "avatar",
      signature: "Avatar.image",
      options: { imageName: "Alan Turing", size: "md", src: demoSrc("AT") },
    },
    {
      contract: "avatar",
      signature: "Avatar.image",
      options: { imageName: "Grace Hopper", size: "lg", src: demoSrc("GH") },
    },
    {
      contract: "avatar",
      signature: "Avatar.initials",
      options: { name: "Ada Lovelace", size: "sm" },
      children: "AL",
    },
    {
      contract: "avatar",
      signature: "AvatarGroup",
      slots: {
        children: [
          {
            contract: "avatar",
            signature: "Avatar.initials",
            options: { name: t("demo.avatar.personOne") },
            children: "P1",
          },
          {
            contract: "avatar",
            signature: "Avatar.initials",
            options: { name: t("demo.avatar.personTwo") },
            children: "P2",
          },
          {
            contract: "avatar",
            signature: "Avatar.initials",
            options: { name: t("demo.avatar.personThree") },
            children: "P3",
          },
        ],
        overflow: "+1",
      },
    },
  ],
});
