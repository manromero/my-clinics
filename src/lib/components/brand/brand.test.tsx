import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Brand } from "./brand";

const description = "Gestión de clínicas y actividad dental";

describe("Brand", () => {
  it.each(["full", "compact"] as const)(
    "preserves the %s identity without adding a navigation stop",
    async (variant) => {
      const user = userEvent.setup();
      render(
        <>
          <Brand variant={variant} />
          <button>Continuar</button>
        </>,
      );
      expect(
        screen.getByRole("img", { name: "MyClinics" }),
      ).toHaveAccessibleName("MyClinics");
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      expect(screen.queryByText(description)).not.toBeInTheDocument();
      await user.tab();
      expect(screen.getByRole("button", { name: "Continuar" })).toHaveFocus();
    },
  );

  it("shows the optional Spanish description in the full identity and removes it when omitted", () => {
    const { rerender } = render(<Brand description />);
    expect(screen.getByText("MyClinics")).toBeVisible();
    expect(screen.getByText(description)).toBeVisible();
    expect(screen.getByRole("img")).toHaveAccessibleDescription(description);
    rerender(<Brand />);
    expect(screen.queryByText(description)).not.toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAccessibleDescription("");
  });

  it("keeps compact description accessible without rendering a wordmark", () => {
    render(<Brand variant="compact" description />);
    expect(
      screen.getByRole("img", { name: "MyClinics" }),
    ).toHaveAccessibleDescription(description);
    expect(screen.queryByText("MyClinics")).not.toBeInTheDocument();
    expect(screen.getByText(description)).not.toBeVisible();
  });

  it.each(["full", "compact"] as const)(
    "uses the configured destination and keyboard activation for %s links",
    async (variant) => {
      const user = userEvent.setup();
      render(
        <Brand
          variant={variant}
          description
          href="/components?from=brand#catalogo"
        />,
      );
      const link = screen.getByRole("link", { name: "MyClinics" });
      expect(link).toHaveAttribute("href", "/components?from=brand#catalogo");
      expect(link).toHaveAccessibleDescription(description);
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      const activate = vi.fn((event: Event) => event.preventDefault());
      link.addEventListener("click", activate);
      await user.tab();
      expect(link).toHaveFocus();
      await user.keyboard("{Enter}");
      expect(activate).toHaveBeenCalledOnce();
    },
  );
});
