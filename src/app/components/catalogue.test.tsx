import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import ComponentsPage from "./page";
import FoundationsPage from "./foundations/page";
import ButtonPage from "./button/page";

describe("catalogue pages", () => {
  it("links to dedicated pages without embedding their specimens", async () => {
    const user = userEvent.setup();
    render(<ComponentsPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    for (const [name, href] of [
      ["Fundamentos visuales", "/components/foundations"],
      ["Button · Acciones", "/components/button"],
    ]) {
      await user.tab();
      const link = screen.getByRole("link", { name });
      expect(link).toHaveFocus();
      expect(link).toHaveAttribute("href", href);
    }
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByText("Paleta semántica")).not.toBeInTheDocument();
  });

  it.each([
    ["Fundamentos visuales", FoundationsPage],
    ["Button · Acciones", ButtonPage],
  ])(
    "opens %s directly with navigation back to the index",
    async (title, Page) => {
      const user = userEvent.setup();
      render(<Page />);
      expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
      expect(
        screen.getByRole("heading", { level: 1, name: title }),
      ).toBeVisible();
      await user.tab();
      const back = screen.getByRole("link", { name: "Volver al catálogo" });
      expect(back).toHaveFocus();
      expect(back).toHaveAttribute("href", "/components");
      for (const link of screen.getByRole("navigation").querySelectorAll("a")) {
        const destination = document.querySelector(link.getAttribute("href")!);
        expect(destination).toHaveAttribute("tabindex", "-1");
      }
    },
  );
});
