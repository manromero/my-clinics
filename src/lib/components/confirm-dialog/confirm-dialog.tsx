"use client";

import { useRef, useState, type ReactNode } from "react";
import { Alert } from "../alert/alert";
import { Button } from "../button/button";
import { Dialog } from "../dialog/dialog";

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children?: ReactNode;
  /** Caller closes on success and supplies error feedback; rejection leaves the dialog open. */
  onConfirm: () => void | Promise<void>;
  destructive?: boolean;
  /** Also blocks dismissal while a caller-managed operation is pending. */
  pending?: boolean;
  error?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pendingLabel?: string;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onConfirm,
  destructive = false,
  pending = false,
  error,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  pendingLabel = "Procesando…",
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const inFlight = useRef(false);
  const [confirming, setConfirming] = useState(false);
  const busy = pending || confirming;
  async function confirm() {
    if (!open || pending || inFlight.current) return;
    inFlight.current = true;
    setConfirming(true);
    try {
      await onConfirm();
    } catch {
      // Failure content belongs to the caller; never close on rejection.
    } finally {
      inFlight.current = false;
      setConfirming(false);
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!busy && !inFlight.current) onOpenChange(next);
      }}
      title={title}
      description={description}
      size="sm"
      dismissible={!busy}
      initialFocusRef={cancelRef}
      actions={
        <>
          <Button
            ref={cancelRef}
            variant="secondary"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "destructive" : "primary"}
            pending={busy}
            onClick={confirm}
          >
            {busy ? pendingLabel : confirmLabel}
          </Button>
        </>
      }
    >
      <div aria-busy={busy} className="space-y-5">
        {children}
        {error && (
          <Alert
            title="No se pudo completar la acción"
            variant="error"
            announcement="assertive"
          >
            {error}
          </Alert>
        )}
      </div>
      <p
        role="status"
        aria-atomic="true"
        className="text-sm text-on-surface-variant"
      >
        {busy ? pendingLabel : ""}
      </p>
    </Dialog>
  );
}
