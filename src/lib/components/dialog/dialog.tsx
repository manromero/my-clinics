"use client";

import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type RefObject,
  type PointerEvent,
} from "react";
import { IconButton } from "../icon-button/icon-button";

export type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  size?: "sm" | "md";
  dismissible?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
};

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  actions,
  size = "md",
  dismissible = true,
  initialFocusRef,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const backdropPress = useRef(false);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current!;
    const opener = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    // Chrome can initially focus the scrolling region ahead of its controls.
    if (document.activeElement === bodyRef.current) {
      const walker = document.createTreeWalker(dialog, NodeFilter.SHOW_ELEMENT);
      let focused = false;
      while (walker.nextNode()) {
        const control = walker.currentNode;
        if (!(control instanceof HTMLElement) || control.tabIndex < 0) continue;
        control.focus();
        if (document.activeElement === control) {
          focused = true;
          break;
        }
      }
      if (!focused) dialog.focus();
    }
    const initial = initialFocusRef?.current;
    if (initial && dialog.contains(initial)) initial.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, [open, initialFocusRef]);

  function outside(event: PointerEvent<HTMLDialogElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    );
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      aria-modal="true"
      closedby={dismissible ? undefined : "none"}
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onOpenChange(false);
      }}
      onClose={() => {
        if (dialogRef.current && !dialogRef.current.open && open)
          onOpenChange(false);
      }}
      onPointerDown={(event) => {
        backdropPress.current =
          event.target === event.currentTarget && outside(event);
      }}
      onPointerUp={(event) => {
        if (
          dismissible &&
          backdropPress.current &&
          event.target === event.currentTarget &&
          outside(event)
        )
          onOpenChange(false);
        backdropPress.current = false;
      }}
      className={`m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-hidden rounded-2xl border-0 bg-surface-container-lowest p-0 text-on-surface shadow-floating backdrop:bg-on-surface/35 ${size === "sm" ? "sm:max-w-md" : "sm:max-w-2xl"}`}
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
        <header className="flex shrink-0 items-start gap-4 px-6 pt-6 pb-4 sm:px-8 sm:pt-8">
          <div className="min-w-0 flex-1 wrap-anywhere">
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
          </div>
          {dismissible && (
            <IconButton
              label="Cerrar diálogo"
              size="sm"
              onClick={() => onOpenChange(false)}
              icon={
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              }
            />
          )}
        </header>
        <div
          ref={bodyRef}
          className="min-h-0 overflow-y-auto overscroll-contain px-6 py-4 leading-7 wrap-anywhere sm:px-8"
        >
          {children}
        </div>
        {actions && (
          <footer className="flex shrink-0 flex-wrap justify-end gap-3 rounded-b-2xl bg-surface-container-low px-6 py-5 sm:px-8 [&>*]:max-w-full">
            {actions}
          </footer>
        )}
      </div>
    </dialog>
  );
}
