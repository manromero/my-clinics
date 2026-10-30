import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SegmentedControl } from "./segmented-control";

const options = [
  { value: "active", label: "Activa" },
  { value: "inactive", label: "Inactiva" },
];

describe("SegmentedControl", () => {
  it("names the group and radios, selects exclusively and submits the native value", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <form aria-label="Ejemplo">
        <SegmentedControl
          label="Estado"
          name="state"
          options={options}
          defaultValue="active"
          onValueChange={change}
        />
      </form>,
    );
    const group = screen.getByRole("radiogroup", { name: "Estado" });
    const active = within(group).getByRole("radio", { name: "Activa" });
    const inactive = within(group).getByRole("radio", { name: "Inactiva" });
    expect(active).toBeChecked();
    await user.click(inactive);
    expect(inactive).toBeChecked();
    expect(active).not.toBeChecked();
    expect(change).toHaveBeenCalledExactlyOnceWith("inactive");
    expect(
      new FormData(screen.getByRole<HTMLFormElement>("form")).get("state"),
    ).toBe("inactive");
  });

  it("supports controlled keyboard arrows, wrapping and skipped disabled options", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState("active");
      return (
        <SegmentedControl
          label="Estado"
          value={value}
          onValueChange={setValue}
          options={[
            options[0],
            { value: "blocked", label: "No disponible", disabled: true },
            options[1],
          ]}
        />
      );
    }
    render(<Controlled />);
    const active = screen.getByRole("radio", { name: "Activa" });
    const inactive = screen.getByRole("radio", { name: "Inactiva" });
    await user.tab();
    expect(active).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(inactive).toHaveFocus();
    expect(inactive).toBeChecked();
    expect(active).not.toBeChecked();
    await user.keyboard("{ArrowDown}");
    expect(active).toHaveFocus();
    expect(active).toBeChecked();
    await user.keyboard("{ArrowLeft}");
    expect(inactive).toBeChecked();
    await user.keyboard("{ArrowUp}");
    expect(active).toBeChecked();
  });

  it("blocks disabled options and a disabled group without emitting changes", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { rerender } = render(
      <SegmentedControl
        label="Estado"
        options={[options[0], { ...options[1], disabled: true }]}
        defaultValue="active"
        onValueChange={change}
      />,
    );
    await user.click(screen.getByText("Inactiva"));
    expect(screen.getByRole("radio", { name: "Inactiva" })).toBeDisabled();
    expect(change).not.toHaveBeenCalled();
    rerender(
      <SegmentedControl
        label="Estado"
        options={options}
        defaultValue="active"
        disabled
        onValueChange={change}
      />,
    );
    for (const radio of screen.getAllByRole("radio"))
      expect(radio).toBeDisabled();
    await user.click(screen.getByText("Inactiva"));
    await user.tab();
    expect(screen.getByRole("radio", { name: "Activa" })).toBeChecked();
    expect(change).not.toHaveBeenCalled();
  });

  it("isolates unnamed groups and lets Space select an initially empty group", async () => {
    const user = userEvent.setup();
    render(
      <>
        <SegmentedControl
          label="Primero"
          options={options}
          defaultValue="active"
        />
        <SegmentedControl label="Segundo" options={options} />
      </>,
    );
    const first = screen.getByRole("radiogroup", { name: "Primero" });
    const second = screen.getByRole("radiogroup", { name: "Segundo" });
    await user.tab();
    await user.tab();
    await user.keyboard(" ");
    expect(within(second).getByRole("radio", { name: "Activa" })).toBeChecked();
    expect(within(first).getByRole("radio", { name: "Activa" })).toBeChecked();
  });
});
