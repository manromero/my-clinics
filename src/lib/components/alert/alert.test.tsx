import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Alert } from "./alert";

describe("Alert", () => {
  it.each(["info", "success", "warning", "error"] as const)(
    "names a static %s message without live announcements",
    (variant) => {
      render(
        <Alert title="Información del ejemplo" variant={variant}>
          Los valores se conservan.
        </Alert>,
      );
      const message = screen.getByRole("group", {
        name: "Información del ejemplo",
      });
      expect(
        within(message).getByText("Los valores se conservan."),
      ).toBeVisible();
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(message.querySelector("[aria-live]")).toBeNull();
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    },
  );

  it.each([
    ["polite", "status"],
    ["assertive", "alert"],
  ] as const)(
    "announces changing content as %s and excludes its action",
    (announcement, role) => {
      const { rerender } = render(
        <Alert
          title="Resultado"
          announcement={announcement}
          action={{ label: "Reintentar", onClick: vi.fn() }}
        >
          Primer intento fallido.
        </Alert>,
      );
      expect(screen.getByRole(role)).toHaveTextContent("Resultado");
      expect(screen.getByRole(role)).toHaveAttribute("aria-atomic", "true");
      expect(
        within(screen.getByRole(role)).queryByRole("button"),
      ).not.toBeInTheDocument();
      rerender(
        <Alert title="Resultado" announcement={announcement}>
          Segundo intento completado.
        </Alert>,
      );
      expect(screen.getByRole(role)).toHaveTextContent(
        "Segundo intento completado.",
      );
      expect(
        screen.queryByText("Primer intento fallido."),
      ).not.toBeInTheDocument();
    },
  );

  it("supports keyboard retry without submitting a surrounding form", async () => {
    const user = userEvent.setup();
    const retry = vi.fn();
    const submit = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={submit}>
        <Alert
          title="No se pudo guardar"
          action={{ label: "Reintentar", onClick: retry }}
        >
          Conservamos los valores.
        </Alert>
      </form>,
    );
    await user.tab();
    expect(screen.getByRole("button", { name: "Reintentar" })).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(retry).toHaveBeenCalledTimes(2);
    expect(submit).not.toHaveBeenCalled();
  });

  it.each([{ disabled: true }, { pending: true }])(
    "prevents unavailable actions: %o",
    async (state) => {
      const retry = vi.fn();
      render(
        <Alert
          title="No se pudo guardar"
          action={{ label: "Reintentar", onClick: retry, ...state }}
        >
          Conservamos los valores.
        </Alert>,
      );
      await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));
      expect(retry).not.toHaveBeenCalled();
      expect(screen.getByRole("button")).toBeDisabled();
    },
  );

  it("keeps names unique and forwards div attributes and refs", () => {
    const ref = { current: null };
    render(
      <>
        <Alert ref={ref} id="help" title="Ayuda">
          Contenido
        </Alert>
        <Alert title="Aviso">Otro contenido</Alert>
      </>,
    );
    expect(ref.current).toBe(screen.getByRole("group", { name: "Ayuda" }));
    expect(screen.getByRole("group", { name: "Ayuda" })).toHaveAttribute(
      "id",
      "help",
    );
    expect(screen.getByRole("group", { name: "Aviso" })).toHaveAccessibleName(
      "Aviso",
    );
  });
});
