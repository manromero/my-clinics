"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
export type DraftStore = Map<string, Map<string, unknown>>;
export const ContinuityDrafts = createContext<{
  store: DraftStore;
  scope: string;
} | null>(null);
function entry(store: DraftStore, scope: string) {
  let value = store.get(scope);
  if (!value) {
    value = new Map();
    store.set(scope, value);
    if (store.size > 32) store.delete(store.keys().next().value!);
  }
  return value;
}
export function useDraftState<T>(
  key: string,
  initial: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] {
  const drafts = useContext(ContinuityDrafts);
  const [state, setState] = useState<T>(() => {
    const values = drafts?.store.get(drafts.scope);
    return values?.has(key)
      ? (values.get(key) as T)
      : typeof initial === "function"
        ? (initial as () => T)()
        : initial;
  });
  const current = useRef(state);
  const active = useRef(true);
  useLayoutEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const set = useCallback<Dispatch<SetStateAction<T>>>(
    (next) => {
      if (!active.current) return;
      const value =
        typeof next === "function"
          ? (next as (previous: T) => T)(current.current)
          : next;
      current.current = value;
      if (drafts) entry(drafts.store, drafts.scope).set(key, value);
      setState(value);
    },
    [drafts, key],
  );
  return [state, set];
}
export function useClearDraft() {
  const drafts = useContext(ContinuityDrafts);
  const active = useRef(true);
  useLayoutEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  return (prefix: string) => {
    if (!active.current) return;
    const values = drafts?.store.get(drafts.scope);
    if (values)
      for (const key of values.keys())
        if (key.startsWith(prefix)) values.delete(key);
  };
}
export function useDraftFocus(
  input: RefObject<HTMLInputElement | null>,
  prefix: string,
) {
  const drafts = useContext(ContinuityDrafts);
  useLayoutEffect(() => {
    if (!drafts) return;
    const values = entry(drafts.store, drafts.scope);
    const field = values.get(`${prefix}:focus`);
    const frame = window.requestAnimationFrame(() => {
      const control =
        typeof field === "string"
          ? input.current?.form?.elements.namedItem(field)
          : null;
      if (control instanceof HTMLElement)
        control.focus({ preventScroll: true });
    });
    const remember = (event: FocusEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLSelectElement ||
        target instanceof HTMLTextAreaElement
      ) {
        if (target.form && target.form === input.current?.form)
          values.set(`${prefix}:focus`, target.name);
      }
    };
    document.addEventListener("focusin", remember);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("focusin", remember);
    };
  }, [drafts, input, prefix]);
}
