import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ActionLink } from "./action-link";

describe("ActionLink", () => {
  it.each(["text", "primary", "secondary"] as const)(
    "keeps %s navigation as a named link with its full destination",
    (variant) => {
      render(
        <ActionLink
          variant={variant}
          href="/components/foundations?period=2026-10#color"
        >
          Ver fundamentos
        </ActionLink>,
      );
      expect(
        screen.getByRole("link", { name: "Ver fundamentos" }),
      ).toHaveAttribute("href", "/components/foundations?period=2026-10#color");
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    },
  );

  it("keeps decorative icons out of the name and reaches links in tab order", async () => {
    const user = userEvent.setup();
    const activate = vi.fn((event) => event.preventDefault());
    render(
      <>
        <ActionLink
          href="#destination"
          onClick={activate}
          startIcon={
            <svg>
              <title>Volver</title>
            </svg>
          }
          endIcon={
            <svg>
              <title>Flecha</title>
            </svg>
          }
        >
          Actividad de octubre
        </ActionLink>
        <ActionLink href="/components" variant="secondary">
          Catálogo
        </ActionLink>
      </>,
    );
    const first = screen.getByRole("link", { name: "Actividad de octubre" });
    await user.tab();
    expect(first).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(activate).toHaveBeenCalledOnce();
    await user.keyboard(" ");
    expect(activate).toHaveBeenCalledOnce();
    await user.tab();
    expect(screen.getByRole("link", { name: "Catálogo" })).toHaveFocus();
  });

  it("preserves supplied external behavior, descriptions and anchor refs", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <>
        <ActionLink
          ref={ref}
          href="https://example.com/help?lang=es#links"
          target="_blank"
          rel="external noopener noreferrer"
          aria-describedby="external-help"
        >
          Ayuda (nueva pestaña)
        </ActionLink>
        <p id="external-help">Recurso externo</p>
      </>,
    );
    const link = screen.getByRole("link", { name: "Ayuda (nueva pestaña)" });
    expect(link).toHaveAttribute(
      "href",
      "https://example.com/help?lang=es#links",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "external noopener noreferrer");
    expect(link).toHaveAccessibleDescription("Recurso externo");
    expect(ref.current).toBe(link);
  });

  it("accepts Next.js URL objects and leaves same-tab navigation as supplied", () => {
    render(
      <ActionLink
        href={{
          pathname: "/components",
          query: { example: "acción" },
          hash: "catalogo",
        }}
      >
        Explorar
      </ActionLink>,
    );
    const link = screen.getByRole("link", { name: "Explorar" });
    expect(link).toHaveAttribute(
      "href",
      "/components?example=acci%C3%B3n#catalogo",
    );
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });
});
