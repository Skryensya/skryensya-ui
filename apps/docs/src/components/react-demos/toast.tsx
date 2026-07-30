/*
 * Live React demos for /components/toast. Toast/ToastRegion take no function props that need to
 * cross the Astro boundary — the state and the onDismiss/onClick closures all live inside each
 * island.
 */
import { useState } from "react";
import { Button } from "@skryensya/react/button";
import { Icon } from "@skryensya/react/icon";
import { Toast, ToastRegion } from "@skryensya/react/content";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

let uid = 0;
const nextId = () => `toast-${(uid += 1)}`;

/** After an action: pressing the button appends a toast; it never starts visible. */
export const ToastEmitDemo = framed(
  function ToastEmitDemo() {
    const [toasts, setToasts] = useState<Array<{ id: string }>>([]);
    const remove = (id: string) =>
      setToasts((all) => all.filter((toast) => toast.id !== id));

    return (
      <>
        <Button
          variant="primary"
          onClick={() => setToasts((all) => [...all, { id: nextId() }])}
        >
          Archivar documento
        </Button>
        <ToastRegion>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              timeout={4000}
              onDismiss={() => remove(toast.id)}
            >
              Documento archivado.
            </Toast>
          ))}
        </ToastRegion>
      </>
    );
  },
  { viewport: "menu" },
);

export const ToastStatusDemo = framed(
  function ToastStatusDemo() {
    const [syncing, setSyncing] = useState(true);
    const [deployed, setDeployed] = useState(true);
    const [failed, setFailed] = useState(true);

    return (
      <ToastRegion data-stack="off">
        {syncing ? (
          <Toast
            tone="info"
            title="Sincronizando"
            icon={<Icon name="info" />}
            timeout={6000}
            onDismiss={() => setSyncing(false)}
          >
            This may take a few seconds.
          </Toast>
        ) : null}
        {deployed ? (
          <Toast
            tone="success"
            title="Despliegue creado"
            icon={<Icon name="success" />}
            onDismiss={() => setDeployed(false)}
          >
            The revision is now in production.
          </Toast>
        ) : null}
        {failed ? (
          <Toast
            tone="danger"
            title="Could not connect"
            icon={<Icon name="danger" />}
            onDismiss={() => setFailed(false)}
          >
            Check the network and try again.
          </Toast>
        ) : null}
      </ToastRegion>
    );
  },
  { viewport: "overlay" },
);

export const ToastStackDemo = framed(
  function ToastStackDemo() {
    const [toasts, setToasts] = useState<
      Array<{ id: string; message: string }>
    >([
      { id: nextId(), message: "Documento 1 archivado." },
      { id: nextId(), message: "Documento 2 archivado." },
      { id: nextId(), message: "Documento 3 archivado." },
    ]);
    const remove = (id: string) =>
      setToasts((all) => all.filter((toast) => toast.id !== id));

    return (
      <>
        <Button
          variant="primary"
          onClick={() =>
            setToasts((all) => [
              ...all,
              {
                id: nextId(),
                message: `Documento ${all.length + 1} archivado.`,
              },
            ])
          }
        >
          Archivar otro
        </Button>
        <ToastRegion>
          {toasts.map((toast) => (
            <Toast key={toast.id} onDismiss={() => remove(toast.id)}>
              {toast.message}
            </Toast>
          ))}
        </ToastRegion>
      </>
    );
  },
  { viewport: "overlay" },
);
