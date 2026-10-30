import { createRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Select, type SelectProps } from "./select";

const options: SelectProps["options"] = [
  { value: "a", label: "Alfa" },
  {
    label: "Grupo",
    options: [
      { value: "b", label: "Beta" },
      { value: "c", label: "Cancelada", disabled: true },
    ],
  },
  {
    label: "Grupo deshabilitado",
    disabled: true,
    options: [{ value: "d", label: "Delta" }],
  },
];

describe("Select", () => {
  it("associates its label, requirement and deduplicated descriptions and removes local descriptions", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <>
        <p id="external">Información externa</p>
        <Select
          id="choice"
          label="Opción"
          options={options}
          required
          help="Ayuda"
          error="Revisa la selección"
          aria-describedby="external choice-help"
        />
      </>,
    );
    const select = screen.getByRole("combobox", { name: "Opción" });
    expect(select).toBeRequired();
    expect(select).toHaveAccessibleDescription(
      "Información externa Ayuda Revisa la selección",
    );
    expect(select).toHaveAttribute(
      "aria-describedby",
      "external choice-help choice-error",
    );
    expect(select).toHaveAttribute("aria-invalid", "true");
    await user.click(screen.getByText("Opción"));
    expect(select).toHaveFocus();
    rerender(
      <>
        <p id="external">Información externa</p>
        <Select
          id="choice"
          label="Opción"
          options={options}
          aria-describedby="external"
        />
      </>,
    );
    expect(select).toHaveAccessibleDescription("Información externa");
    expect(select).not.toHaveAttribute("aria-invalid");
    expect(screen.queryByText("Ayuda")).not.toBeInTheDocument();
    expect(screen.queryByText("Revisa la selección")).not.toBeInTheDocument();
  });

  it("updates controlled selection and can return to the placeholder with native string events", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const blur = vi.fn();
    const ref = createRef<HTMLSelectElement>();
    function Controlled() {
      const [value, setValue] = useState("");
      return (
        <Select
          label="Opción"
          options={options}
          ref={ref}
          name="choice"
          required
          placeholder="Elige"
          value={value}
          onBlur={blur}
          onChange={(event) => {
            change(event.target.value);
            setValue(event.target.value);
          }}
        />
      );
    }
    render(<Controlled />);
    const select = screen.getByRole<HTMLSelectElement>("combobox");
    expect(ref.current).toBe(select);
    expect(select).toHaveAttribute("name", "choice");
    expect(select).toHaveValue("");
    expect(select.validity.valueMissing).toBe(true);
    await user.selectOptions(select, "b");
    expect(select).toHaveValue("b");
    expect(change).toHaveBeenLastCalledWith("b");
    expect(select.checkValidity()).toBe(true);
    await user.selectOptions(select, "");
    expect(change).toHaveBeenLastCalledWith("");
    expect(select.validity.valueMissing).toBe(true);
    await user.tab();
    expect(blur).toHaveBeenCalled();
  });

  it("supports uncontrolled values and prevents selection of disabled options and groups", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <Select
        label="Opción"
        options={options}
        defaultValue="a"
        onChange={change}
      />,
    );
    const select = screen.getByRole("combobox");
    expect(screen.getByRole("group", { name: "Grupo" })).toBeInTheDocument();
    await user.selectOptions(select, ["c", "d"]);
    expect(select).toHaveValue("a");
    expect(change).not.toHaveBeenCalled();
    await user.selectOptions(select, "b");
    expect(select).toHaveValue("b");
    expect(change).toHaveBeenCalledOnce();
  });

  it("supports keyboard focus order and skips a disabled control", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Select
          label="Deshabilitada"
          options={options}
          disabled
          defaultValue="a"
        />
        <Select label="Disponible" options={options} />
        <button>Después</button>
      </>,
    );
    const disabled = screen.getByLabelText("Deshabilitada");
    expect(disabled).toBeDisabled();
    await user.tab();
    expect(screen.getByLabelText("Disponible")).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByLabelText("Disponible")).toHaveFocus();
  });

  it("keeps unique stable IDs, optional empty options and invalid state without dangling descriptions", () => {
    const { rerender } = render(
      <>
        <Select label="Una etiqueta larga" options={[]} />
        <Select label="Dos" options={[]} invalid />
      </>,
    );
    const select =
      screen.getByLabelText<HTMLSelectElement>("Una etiqueta larga");
    const id = select.id;
    expect(select.options).toHaveLength(0);
    expect(select.value).toBe("");
    expect(select.checkValidity()).toBe(true);
    expect(select).not.toHaveAttribute("aria-describedby");
    expect(screen.getByLabelText("Dos").id).not.toBe(id);
    expect(screen.getByLabelText("Dos")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    rerender(
      <Select
        label="Una etiqueta larga"
        options={[]}
        placeholder="No hay opciones"
        help="Nueva ayuda"
      />,
    );
    expect(select.id).toBe(id);
    expect(select).toHaveAccessibleDescription("Nueva ayuda");
    expect(select.options).toHaveLength(1);
    expect(select).toHaveValue("");
  });
});
