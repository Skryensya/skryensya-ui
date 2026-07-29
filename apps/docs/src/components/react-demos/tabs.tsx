/*
 * Live React demos for /components/tabs. Each export is a self-contained island (no function props
 * crossing the Astro boundary), mounted directly from the page with a bare `<TabsBasicDemo client:load />`.
 */
import { useState } from "react";
import { Icon } from "@skryensya/react/icon";
import { Tabs } from "@skryensya/react/tabs";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const TabsBasicDemo = framed(function TabsBasicDemo() {
  return (
    <Tabs
      defaultValue="summary"
      items={[
        {
          value: "summary",
          label: "Summary",
          children: "Atlas is ready for a July launch.",
        },
        {
          value: "activity",
          label: "Activity",
          children: "Three changes approved during the last week.",
        },
      ]}
    />
  );
});

export const TabsStatesDemo = framed(function TabsStatesDemo() {
  return (
    <Tabs
      defaultValue="details"
      items={[
        {
          value: "details",
          label: (
            <>
              <Icon name="info" size="sm" />
              Details
            </>
          ),
          children: (
            <div className="sk-stack" data-gap="xs">
              <strong>Solicitud #248</strong>
              <span>Update the Atlas runtime to Node 24.</span>
            </div>
          ),
        },
        {
          value: "validation",
          label: (
            <>
              <Icon name="check" size="sm" />
              Validation
            </>
          ),
          children: "12 comprobaciones aprobadas.",
        },
        {
          value: "settings",
          label: (
            <>
              <Icon name="settings" size="sm" />
              Settings
            </>
          ),
          children: "Available after approving application.",
          disabled: true,
        },
      ]}
    />
  );
});

const sectionNames: Record<string, string> = {
  general: "General",
  access: "Acceso",
  notifications: "Avisos",
};

const workspaceItems = [
  {
    value: "general",
    label: (
      <>
        <Icon name="settings" size="sm" />
        General
      </>
    ),
    children: "Atlas · Europe/Madrid · Spanish",
  },
  {
    value: "access",
    label: (
      <>
        <Icon name="user" size="sm" />
        Acceso
      </>
    ),
    children: "8 miembros · 2 administradores",
  },
  {
    value: "notifications",
    label: (
      <>
        <Icon name="info" size="sm" />
        Avisos
      </>
    ),
    children: "Mail and chat for deployments and incidents.",
  },
];

export const TabsAdvancedDemo = framed(function TabsAdvancedDemo() {
  const [value, setValue] = useState("general");

  return (
    <div className="sk-stack" data-gap="sm">
      <Tabs
        value={value}
        orientation="vertical"
        activationMode="manual"
        items={workspaceItems}
        onValueChange={(details) => setValue(details.value)}
      />
      <p aria-live="polite">Active section: {sectionNames[value]}</p>
    </div>
  );
});
