import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { UserIdentity } from "./user-identity";

describe("UserIdentity", () => {
  it.each(["full", "compact"] as const)(
    "names the %s identity and preserves optional metadata accessibly",
    (variant) => {
      render(
        <UserIdentity
          displayName="María López"
          email="maria@example.test"
          timezone="Europe/Madrid"
          variant={variant}
        />,
      );
      const identity = screen.getByRole("group", { name: "María López" });
      expect(identity).toHaveAccessibleDescription(
        "maria@example.test Zona horaria: Europe/Madrid",
      );
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    },
  );

  it("shows supplied details and treats the avatar as decorative", () => {
    const { container } = render(
      <UserIdentity
        displayName="María López"
        email="maria@example.test"
        avatarSrc="/avatar.png"
      />,
    );
    expect(screen.getByText("María López")).toBeVisible();
    expect(screen.getByText("maria@example.test")).toBeVisible();
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "http://localhost:3000/avatar.png",
    );
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
  });

  it("falls back after an image error and accepts a replacement source", () => {
    const { container, rerender } = render(
      <UserIdentity displayName="María López" avatarSrc="/broken.png" />,
    );
    fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(screen.getByText("ML")).toBeVisible();
    expect(screen.getByRole("group")).toHaveAccessibleName("María López");
    rerender(
      <UserIdentity displayName="María López" avatarSrc="/replacement.png" />,
    );
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "http://localhost:3000/replacement.png",
    );
  });

  it("omits missing or blank optional data and uses name initials without an avatar", () => {
    render(
      <UserIdentity
        displayName="  Lucía   "
        email=" "
        timezone=" "
        avatarSrc=" "
      />,
    );
    expect(
      screen.getByRole("group", { name: "Lucía" }),
    ).toHaveAccessibleDescription("");
    expect(screen.getByText("L")).toBeVisible();
    expect(screen.queryByText(/Zona horaria/)).not.toBeInTheDocument();
  });

  it("retains complete long values and keeps compact information available", () => {
    const name = "María del Carmen Fernández de la Vega";
    const email = "maria.del.carmen.fernandez.de.la.vega@example.test";
    const { rerender } = render(
      <UserIdentity displayName={name} email={email} />,
    );
    expect(screen.getByText(name)).toBeVisible();
    expect(screen.getByText(email)).toBeVisible();
    rerender(
      <UserIdentity displayName={name} email={email} variant="compact" />,
    );
    expect(screen.getByRole("group", { name })).toHaveAccessibleDescription(
      email,
    );
  });

  it("adds no keyboard stop or implicit menu interaction", async () => {
    const user = userEvent.setup();
    render(
      <>
        <UserIdentity displayName="María López" variant="compact" />
        <button>Continuar</button>
      </>,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    await user.tab();
    expect(screen.getByRole("button", { name: "Continuar" })).toHaveFocus();
  });
});
