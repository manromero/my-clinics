import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoadingState } from "./loading-state";

describe("LoadingState", () => {
  it.each(["spinner", "skeleton", "none"] as const)(
    "announces visible text with %s decoration without progress claims",
    (indicator) => {
      render(
        <LoadingState label="Cargando contenido…" indicator={indicator} />,
      );
      const status = screen.getByRole("status");
      expect(status).toHaveTextContent("Cargando contenido…");
      expect(screen.getByText("Cargando contenido…")).toBeVisible();
      expect(status).toHaveAttribute("aria-live", "polite");
      expect(status).toHaveAttribute("aria-atomic", "true");
      expect(status).not.toHaveAttribute("aria-busy");
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(status).not.toHaveAttribute("tabindex");
    },
  );

  it("associates an external busy region and announces updates outside it", () => {
    function Example({ busy }: { busy: boolean }) {
      return (
        <>
          <LoadingState
            id="loading"
            label={busy ? "Cargando contenido…" : "Contenido disponible"}
            indicator={busy ? "spinner" : "none"}
          />
          <section
            aria-label="Contenido"
            aria-describedby="loading"
            aria-busy={busy}
          >
            {busy ? null : "Contenido de ejemplo"}
          </section>
        </>
      );
    }
    const { rerender } = render(<Example busy />);
    const region = screen.getByRole("region", { name: "Contenido" });
    const status = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-busy", "true");
    expect(region).toHaveAccessibleDescription("Cargando contenido…");
    expect(region).not.toContainElement(status);
    rerender(<Example busy={false} />);
    expect(screen.getByRole("status")).toBe(status);
    expect(status).toHaveTextContent("Contenido disponible");
    expect(region).toHaveAttribute("aria-busy", "false");
    expect(region).toHaveAccessibleDescription("Contenido disponible");
    expect(region).toHaveTextContent("Contenido de ejemplo");
  });

  it("supports region presentation and forwards ids, attributes and refs", () => {
    const ref = { current: null };
    render(
      <LoadingState
        ref={ref}
        id="pending"
        variant="region"
        label="Preparando contenido…"
        data-operation="load"
      />,
    );
    expect(ref.current).toBe(screen.getByRole("status"));
    expect(screen.getByRole("status")).toHaveAttribute("id", "pending");
    expect(screen.getByRole("status")).toHaveAttribute(
      "data-operation",
      "load",
    );
  });
});
