"use client";

import {
  useId,
  useRef,
  type ReactNode,
  type RefObject,
  type FormEventHandler,
} from "react";
import { Alert } from "../alert/alert";
import { Button } from "../button/button";
import { Dialog } from "../dialog/dialog";
import { Surface } from "../surface/surface";

type CommonProps = {
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
  pending?: boolean;
  error?: string;
  saveLabel?: string;
  cancelLabel?: string;
  pendingLabel?: string;
  noValidate?: boolean;
};
export type FormPanelProps = CommonProps &
  (
    | { presentation?: "panel"; open?: never; initialFocusRef?: never }
    | {
        presentation: "modal";
        open: boolean;
        initialFocusRef?: RefObject<HTMLElement | null>;
      }
  );

export function FormPanel({
  title,
  description,
  children,
  onSubmit,
  onCancel,
  pending = false,
  error,
  saveLabel = "Guardar",
  cancelLabel = "Cancelar",
  pendingLabel = "Guardando…",
  noValidate = false,
  presentation = "panel",
  open,
  initialFocusRef,
}: FormPanelProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const saveRef = useRef<HTMLButtonElement>(null);
  const actions = (
    <>
      <Button variant="secondary" disabled={pending} onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button ref={saveRef} type="submit" form={id} pending={pending}>
        {pending ? pendingLabel : saveLabel}
      </Button>
    </>
  );
  const form = (
    <form
      id={id}
      aria-label={title}
      aria-busy={pending}
      noValidate={noValidate}
      onSubmit={(event) => {
        event.preventDefault();
        if (!pending) onSubmit(event);
      }}
      className="space-y-6"
    >
      {error && (
        <Alert
          title="No se pudo guardar"
          variant="error"
          announcement="assertive"
        >
          {error}
        </Alert>
      )}
      <fieldset
        disabled={pending}
        className="m-0 min-w-0 space-y-5 border-0 p-0"
      >
        {children}
      </fieldset>
      <p
        role="status"
        aria-atomic="true"
        className="text-sm text-on-surface-variant"
      >
        {pending ? pendingLabel : ""}
      </p>
    </form>
  );
  if (presentation === "modal")
    return (
      <Dialog
        open={open!}
        onOpenChange={(next) => {
          if (!next && !pending) onCancel();
        }}
        title={title}
        description={description}
        pending={pending}
        initialFocusRef={initialFocusRef}
        resumeFocusRef={saveRef}
        actions={actions}
      >
        {form}
      </Dialog>
    );
  return (
    <Surface
      as="section"
      variant="tonal"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      header={
        <>
          <h2 id={titleId} className="font-headline text-title">
            {title}
          </h2>
          {description && (
            <p
              id={descriptionId}
              className="mt-3 text-sm leading-6 text-on-surface-variant"
            >
              {description}
            </p>
          )}
        </>
      }
      actions={actions}
    >
      {form}
    </Surface>
  );
}
