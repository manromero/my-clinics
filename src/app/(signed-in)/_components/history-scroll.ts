type FocusPosition = {
  name?: string;
  radioValue?: string;
  href?: string;
  label?: string;
  tag: string;
  text?: string;
};
type ScrollPosition = { left: number; top: number; focus?: FocusPosition };
function focusPosition(root: HTMLElement): FocusPosition | undefined {
  const node = document.activeElement;
  if (
    !(node instanceof HTMLElement) ||
    !root.contains(node) ||
    node === document.body
  )
    return;
  return {
    tag: node.tagName,
    name: node.getAttribute("name") ?? undefined,
    radioValue:
      node instanceof HTMLInputElement && node.type === "radio"
        ? node.value
        : undefined,
    href: node.getAttribute("href") ?? undefined,
    label: node.getAttribute("aria-label") ?? undefined,
    text: node.textContent?.trim(),
  };
}
function findFocus(root: HTMLElement, saved: FocusPosition) {
  return [
    ...root.querySelectorAll<HTMLElement>(
      "input,select,textarea,button,a,[tabindex]",
    ),
  ].find((node) => {
    if (saved.radioValue)
      return (
        node instanceof HTMLInputElement &&
        node.type === "radio" &&
        node.value === saved.radioValue
      );
    if (saved.name) return node.getAttribute("name") === saved.name;
    if (saved.href) return node.getAttribute("href") === saved.href;
    if (saved.label) return node.getAttribute("aria-label") === saved.label;
    return (
      node.tagName === saved.tag && node.textContent?.trim() === saved.text
    );
  });
}
type HistoryWindow = Window & {
  navigation?: { currentEntry: Pick<NavigationHistoryEntry, "key"> | null };
};

export function createHistoryScroll(root: HTMLElement) {
  const positions = new Map<string, ScrollPosition>();
  let pending: { href: string; position?: ScrollPosition } | undefined;
  let observer: ResizeObserver | undefined;
  let timeout: number | undefined;

  function entryKey() {
    return (
      (window as HistoryWindow).navigation?.currentEntry?.key ?? location.href
    );
  }

  function remember() {
    if (!pending && !root.inert) {
      positions.set(entryKey(), {
        left: window.scrollX,
        top: window.scrollY,
        focus: focusPosition(root) ?? positions.get(entryKey())?.focus,
      });
      if (positions.size > 32) positions.delete(positions.keys().next().value!);
    }
  }

  function cancel() {
    pending = undefined;
    observer?.disconnect();
    window.clearTimeout(timeout);
  }

  function begin() {
    cancel();
    pending = { href: location.href, position: positions.get(entryKey()) };
  }

  function restore(pathname: string, search: string) {
    if (!pending) return;
    const { href, position } = pending;
    if (href !== location.href) return cancel();
    const url = new URL(href);
    if (pathname !== url.pathname || search !== url.searchParams.toString())
      return;
    if (!position) return cancel();
    const target = position;

    function scroll(allowClamp = false) {
      if (href !== location.href) return cancel();
      if (root.style.display === "none") return;
      const page = document.scrollingElement;
      if (
        !allowClamp &&
        page &&
        page.scrollHeight - page.clientHeight < target.top
      ) {
        return;
      }
      const focus = target.focus ? findFocus(root, target.focus) : undefined;
      if (target.focus && !focus && !allowClamp) return;
      window.scrollTo({
        left: target.left,
        top: target.top,
        behavior: "instant",
      });
      if (focus)
        window.requestAnimationFrame(() => {
          if (focus.isConnected && href === location.href)
            focus.focus({ preventScroll: true });
        });
      cancel();
    }

    // Native restoration runs before the verified route is rendered and can
    // clamp the offset to the previous screen's height. Retry after its content
    // resizes, with a bound for destinations whose saved position no longer fits.
    observer?.disconnect();
    window.clearTimeout(timeout);
    observer = new ResizeObserver(() => scroll());
    observer.observe(root);
    timeout = window.setTimeout(() => scroll(true), 2000);
    scroll();
  }

  remember();
  window.addEventListener("scroll", remember, { passive: true });
  root.addEventListener("focusin", remember);
  root.addEventListener("wheel", cancel, { passive: true });
  root.addEventListener("touchmove", cancel, { passive: true });
  return {
    begin,
    cancel,
    restore,
    dispose() {
      cancel();
      window.removeEventListener("scroll", remember);
      root.removeEventListener("focusin", remember);
      root.removeEventListener("wheel", cancel);
      root.removeEventListener("touchmove", cancel);
    },
  };
}
