import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AppHeader } from "./app-header";

const identity = { displayName: "Ana Hurtado", email: "ana@example.test" };

describe("AppHeader", () => {
  it("renders a public banner with a linked brand and professional access label", () => {
    render(<AppHeader variant="public" brandHref="/login" />);

    const banner = within(screen.getByRole("banner"));
    expect(banner.getByRole("link", { name: "MyClinics" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(banner.getByText("Acceso Profesional Clínico")).toBeVisible();
    expect(banner.queryByRole("navigation")).not.toBeInTheDocument();
    expect(banner.queryByRole("button")).not.toBeInTheDocument();
  });

  it("exposes signed-in destinations and updates the active page from caller props", () => {
    const account = { identity, onSignOut: vi.fn() };
    const { rerender } = render(
      <AppHeader
        variant="signed-in"
        currentHref="/clinics"
        account={account}
      />,
    );

    const banner = within(screen.getByRole("banner"));
    const navigation = within(
      banner.getByRole("navigation", { name: "Navegación principal" }),
    );
    expect(banner.getByRole("img", { name: "MyClinics" })).toBeInTheDocument();
    expect(
      banner.queryByText("Acceso Profesional Clínico"),
    ).not.toBeInTheDocument();
    expect(navigation.getAllByRole("link")).toHaveLength(4);
    expect(
      navigation.getByRole("link", { current: "page" }),
    ).toHaveAccessibleName("Clínicas");
    rerender(
      <AppHeader
        variant="signed-in"
        currentHref="/summary"
        account={account}
      />,
    );
    expect(
      navigation.getByRole("link", { current: "page" }),
    ).toHaveAccessibleName("Resumen");
    expect(
      navigation.getByRole("link", { name: "Clínicas" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("keeps account actions reachable by keyboard and returns focus on dismissal", async () => {
    const user = userEvent.setup();
    render(
      <AppHeader
        variant="signed-in"
        account={{
          identity,
          onSignOut: vi.fn(),
          accountLink: { href: "/settings", label: "Mi cuenta" },
        }}
      />,
    );

    const trigger = screen.getByRole("button", {
      name: "Menú de cuenta de Ana Hurtado",
    });
    for (const name of ["Actividad", "Resumen", "Clínicas", "Ajustes"]) {
      await user.tab();
      expect(screen.getByRole("link", { name })).toHaveFocus();
    }
    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard(" ");
    const panel = within(
      screen.getByRole("region", { name: "Cuenta de Ana Hurtado" }),
    );
    expect(panel.getByText(identity.email)).toBeVisible();
    await user.tab();
    expect(
      panel.getByRole("button", { name: "Cerrar menú de cuenta" }),
    ).toHaveFocus();
    await user.tab();
    expect(panel.getByRole("link", { name: "Mi cuenta" })).toHaveFocus();
    await user.tab();
    expect(panel.getByRole("button", { name: "Cerrar sesión" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("forwards the supplied sign-out action, pending state and failure", async () => {
    const user = userEvent.setup();
    const account = { identity, onSignOut: vi.fn() };
    const { rerender } = render(
      <AppHeader variant="signed-in" account={account} />,
    );
    await user.click(
      screen.getByRole("button", { name: "Menú de cuenta de Ana Hurtado" }),
    );
    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    expect(account.onSignOut).toHaveBeenCalledTimes(1);

    rerender(
      <AppHeader
        variant="signed-in"
        account={{ ...account, signOutPending: true }}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Cierre de sesión en curso",
    );
    await user.keyboard("{Enter}");
    expect(account.onSignOut).toHaveBeenCalledTimes(1);

    rerender(
      <AppHeader
        variant="signed-in"
        account={{ ...account, signOutError: "Vuelve a intentarlo." }}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Vuelve a intentarlo.");
    await user.keyboard("{Enter}");
    expect(account.onSignOut).toHaveBeenCalledTimes(2);
  });
});
