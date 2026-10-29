import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { colorFamilies } from "./foundations";
import ComponentsPage from "./page";

describe("Alexandria foundations", () => {
  it("registers every palette role as a labelled specimen", () => {
    render(<ComponentsPage />);
    for (const family of colorFamilies) {
      const list = screen.getByRole("list", { name: family.title });
      expect(within(list).getAllByRole("listitem")).toHaveLength(
        family.tokens.length,
      );
      for (const token of family.tokens)
        expect(within(list).getByText(token)).toBeVisible();
    }
    expect(
      screen.getByRole("list", { name: "Escala de espacio" }),
    ).toBeVisible();
    expect(
      screen.getByRole("list", { name: "Escala de radios" }),
    ).toBeVisible();
    expect(screen.getByText(/Inter · Un texto sereno/)).toHaveTextContent(
      "ñ, ¿qué tal?",
    );
    expect(
      screen.getByRole("list", { name: "Tratamientos de estado" }),
    ).toHaveTextContent("Error · Revisa la información.");
  });

  it("links the focus specimen to a real motion destination", () => {
    render(<ComponentsPage />);
    const link = screen.getByRole("link", { name: "Explorar movimiento" });
    expect(document.querySelector(link.getAttribute("href")!)).toBe(
      screen.getByRole("heading", { name: "Movimiento respetuoso" }),
    );
  });

  it("replays motion by keyboard and announces each replay without duplicating content", async () => {
    const user = userEvent.setup();
    render(<ComponentsPage />);
    const button = screen.getByRole("button", { name: "Repetir muestra" });
    button.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Muestra reproducida 1 vez.",
    );
    expect(button).toHaveFocus();
    await user.keyboard(" ");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Muestra reproducida 2 veces.",
    );
    expect(screen.getAllByText("El contenido encuentra su lugar")).toHaveLength(
      1,
    );
  });
});
