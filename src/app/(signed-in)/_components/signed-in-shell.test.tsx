import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SignedInShell } from "./signed-in-shell";
import { PrefetchSignedInDestinations } from "./signed-in-history-guard";
const route = vi.hoisted(() => ({
  segment: "activity",
  query: "year=2026&month=10&clinic=7&page=4",
}));
vi.mock("next/navigation", () => ({
  useSelectedLayoutSegment: () => route.segment,
  useSearchParams: () => new URLSearchParams(route.query),
}));
vi.mock("../clinics/sign-out", () => ({ signOut: vi.fn() }));
vi.mock("./signed-in-history-guard", async () => ({
  ConcealSignedInContent: (await import("react")).createContext(() => {}),
  PrefetchSignedInDestinations: (await import("react")).createContext(false),
}));
vi.mock("@/lib/components/app-header/app-header", () => ({
  AppHeader: ({
    hrefs,
    prefetch,
  }: {
    hrefs: Record<string, string>;
    prefetch: boolean;
  }) => (
    <header data-prefetch={String(prefetch)}>
      <a href={hrefs["/activity"]}>Activity</a>
      <a href={hrefs["/summary"]}>Summary</a>
    </header>
  ),
}));
const shell = (
  <SignedInShell
    displayName="Fixture"
    defaultPeriod={{ year: 2026, month: 11 }}
  >
    Content
  </SignedInShell>
);
describe("scoped header navigation", () => {
  it("enables prefetch only while session continuity permits presentation", () => {
    const view = render(shell);
    expect(screen.getByRole("banner")).toHaveAttribute(
      "data-prefetch",
      "false",
    );
    view.rerender(
      <PrefetchSignedInDestinations value>
        {shell}
      </PrefetchSignedInDestinations>,
    );
    expect(screen.getByRole("banner")).toHaveAttribute("data-prefetch", "true");
    view.rerender(
      <PrefetchSignedInDestinations value={false}>
        {shell}
      </PrefetchSignedInDestinations>,
    );
    expect(screen.getByRole("banner")).toHaveAttribute(
      "data-prefetch",
      "false",
    );
  });
  it("preserves period and clinic across monthly screens, Clinics and Invoices without carrying pagination", () => {
    route.segment = "activity";
    route.query = "year=2026&month=10&clinic=7&page=4";
    const view = render(shell);
    expect(screen.getByText("Summary")).toHaveAttribute(
      "href",
      "/summary?year=2026&month=10&clinic=7",
    );
    route.segment = "invoices";
    route.query = "";
    view.rerender(
      <SignedInShell
        displayName="Fixture"
        defaultPeriod={{ year: 2026, month: 11 }}
      >
        Clinics
      </SignedInShell>,
    );
    expect(screen.getByText("Activity")).toHaveAttribute(
      "href",
      "/activity?year=2026&month=10&clinic=7",
    );
  });
  it("uses the server's Madrid default period on an initial Clinics visit", () => {
    route.segment = "clinics";
    route.query = "";
    render(shell);
    expect(screen.getByText("Summary")).toHaveAttribute(
      "href",
      "/summary?year=2026&month=11",
    );
  });
});
