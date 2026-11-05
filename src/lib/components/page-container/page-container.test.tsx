import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PageContainer } from "./page-container";

describe("PageContainer", () => {
  it("defaults to a neutral wrapper and preserves direct content composition", () => {
    const { container } = render(
      <PageContainer>
        <h1>Mi página</h1>
        <p>Contenido independiente</p>
      </PageContainer>,
    );
    const wrapper = container.firstElementChild;
    expect(wrapper?.tagName).toBe("DIV");
    expect(wrapper?.children).toHaveLength(2);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Mi página",
    );
    expect(screen.queryByRole("main")).not.toBeInTheDocument();
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it.each([
    ["main", "main"],
    ["section", "region"],
    ["article", "article"],
  ] as const)(
    "supports %s composition with caller-supplied accessible attributes",
    (as, role) => {
      render(
        <PageContainer
          as={as}
          id="content"
          aria-labelledby="title"
          aria-describedby="help"
          lang="es"
          tabIndex={-1}
        >
          <h1 id="title">Contenido de ejemplo</h1>
          <p id="help">Información adicional</p>
          <section aria-label="Contenido anidado">
            <h2>Detalles</h2>
          </section>
        </PageContainer>,
      );
      const page = screen.getByRole(role, { name: "Contenido de ejemplo" });
      expect(page.tagName.toLowerCase()).toBe(as);
      expect(page).toHaveAccessibleDescription("Información adicional");
      expect(page).toHaveAttribute("id", "content");
      expect(page).toHaveAttribute("lang", "es");
      expect(page).toHaveAttribute("tabindex", "-1");
      expect(within(page).getByRole("heading", { level: 2 })).toHaveTextContent(
        "Detalles",
      );
    },
  );

  it("preserves child keyboard behavior and forwards native caller events", async () => {
    const user = userEvent.setup();
    const activate = vi.fn();
    const focus = vi.fn();
    render(
      <PageContainer onFocus={focus}>
        <a href="#details">Consultar detalles</a>
        <button onClick={activate}>Continuar</button>
      </PageContainer>,
    );
    await user.tab();
    expect(screen.getByRole("link")).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    await user.keyboard("{Enter} ");
    expect(activate).toHaveBeenCalledTimes(2);
    expect(focus).toHaveBeenCalledTimes(2);
  });
});
