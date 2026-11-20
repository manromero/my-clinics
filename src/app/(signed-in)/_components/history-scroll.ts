type ScrollPosition = { left: number; top: number };
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
    if (!pending && root.style.display !== "none") {
      positions.set(entryKey(), { left: window.scrollX, top: window.scrollY });
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
      window.scrollTo({ ...target, behavior: "instant" });
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
  root.addEventListener("wheel", cancel, { passive: true });
  root.addEventListener("touchmove", cancel, { passive: true });
  return {
    begin,
    cancel,
    restore,
    dispose() {
      cancel();
      window.removeEventListener("scroll", remember);
      root.removeEventListener("wheel", cancel);
      root.removeEventListener("touchmove", cancel);
    },
  };
}
