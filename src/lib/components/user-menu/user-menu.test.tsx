import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { UserMenu, type UserMenuProps } from "./user-menu";

const identity = { displayName: "Ana Hurtado", email: "ana@example.test" };
const defaults: UserMenuProps = {
  identity,
  onSignOut: vi.fn(),
  accountLink: { href: "#settings", label: "Ajustes" },
};

function trigger() {
  return screen.getByRole("button", { name: "Menú de cuenta de Ana Hurtado" });
}

describe("UserMenu", () => {
  it.each(["full", "compact", "responsive"] as const)(
    "exposes %s identity and native account actions through a disclosure",
    async (variant) => {
      const user = userEvent.setup();
      render(<UserMenu {...defaults} variant={variant} />);
      expect(trigger()).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByRole("region")).not.toBeInTheDocument();
      await user.tab();
      expect(trigger()).toHaveFocus();
      await user.keyboard("{Enter}");
      expect(trigger()).toHaveAttribute("aria-expanded", "true");
      expect(trigger()).toHaveFocus();
      const panel = screen.getByRole("region", {
        name: "Cuenta de Ana Hurtado",
      });
      expect(trigger()).toHaveAttribute("aria-controls", panel.id);
      expect(within(panel).getByText("ana@example.test")).toBeVisible();
      expect(
        within(panel).getByRole("link", { name: "Ajustes" }),
      ).toHaveAttribute("href", "#settings");
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      await user.tab();
      expect(
        screen.getByRole("button", { name: "Cerrar menú de cuenta" }),
      ).toHaveFocus();
      await user.tab();
      expect(screen.getByRole("link", { name: "Ajustes" })).toHaveFocus();
      await user.tab();
      expect(
        screen.getByRole("button", { name: "Cerrar sesión" }),
      ).toHaveFocus();
      await user.tab({ shift: true });
      expect(screen.getByRole("link", { name: "Ajustes" })).toHaveFocus();
      await user.keyboard("{Escape}");
      expect(trigger()).toHaveFocus();
      expect(trigger()).toHaveAttribute("aria-expanded", "false");
    },
  );

  it("supports Space toggling, explicit close and independent instances", async () => {
    const user = userEvent.setup();
    render(
      <>
        <UserMenu {...defaults} />
        <UserMenu identity={{ displayName: "María" }} onSignOut={vi.fn()} />
      </>,
    );
    await user.tab();
    await user.keyboard(" ");
    const firstId = trigger().getAttribute("aria-controls");
    expect(
      screen.getByRole("button", { name: "Menú de cuenta de María" }),
    ).not.toHaveAttribute("aria-controls", firstId);
    await user.click(
      screen.getByRole("button", { name: "Cerrar menú de cuenta" }),
    );
    expect(trigger()).toHaveFocus();
    await user.keyboard(" ");
    await user.keyboard(" ");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("dismisses on outside pointer or focus without trapping or stealing focus", async () => {
    const user = userEvent.setup();
    render(
      <>
        <UserMenu {...defaults} />
        <button>Después</button>
      </>,
    );
    await user.click(trigger());
    fireEvent.pointerDown(document.body);
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger());
    await user.tab();
    await user.tab();
    await user.tab();
    await user.tab();
    expect(screen.getByRole("button", { name: "Después" })).toHaveFocus();
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger());
    await user.tab({ shift: true });
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("calls the caller, blocks duplicate pointer/keyboard requests while pending and allows retry after failure", async () => {
    const user = userEvent.setup();
    const onSignOut = vi.fn();
    const { rerender } = render(
      <UserMenu {...defaults} onSignOut={onSignOut} />,
    );
    await user.click(trigger());
    const signOut = screen.getByRole("button", { name: "Cerrar sesión" });
    await user.click(signOut);
    expect(onSignOut).toHaveBeenCalledTimes(1);
    rerender(<UserMenu {...defaults} onSignOut={onSignOut} signOutPending />);
    expect(signOut).toHaveFocus();
    expect(signOut).toHaveAttribute("aria-disabled", "true");
    expect(signOut).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Cierre de sesión en curso",
    );
    await user.click(signOut);
    await user.keyboard("{Enter} ");
    expect(onSignOut).toHaveBeenCalledTimes(1);
    rerender(
      <UserMenu
        {...defaults}
        onSignOut={onSignOut}
        signOutError="Vuelve a intentarlo."
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "No se ha cerrado la sesión",
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Vuelve a intentarlo.");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(signOut).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onSignOut).toHaveBeenCalledTimes(2);
  });

  it("supports sign-out without an account link, preserves state when reopened and closes on navigation", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <UserMenu
        {...defaults}
        accountLink={undefined}
        signOutError="Error del consumidor"
      />,
    );
    await user.click(trigger());
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    await user.keyboard("{Escape}");
    await user.click(trigger());
    expect(screen.getByRole("alert")).toHaveTextContent("Error del consumidor");
    rerender(<UserMenu {...defaults} />);
    await user.click(screen.getByRole("link", { name: "Ajustes" }));
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).toHaveFocus();
  });
});
