import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  FileInput,
  type FileInputProps,
  type FileInputValue,
} from "./file-input";

const pdf = new File(["1234"], "report.pdf", { type: "application/pdf" });
const wrong = new File(["text"], "notes.txt", { type: "text/plain" });
function Controlled(props: Partial<FileInputProps>) {
  const [value, setValue] = useState<FileInputValue>(props.value ?? null);
  return (
    <FileInput label="Documento" {...props} value={value} onChange={setValue} />
  );
}
function input() {
  return screen.getByLabelText(/Documento/, {
    selector: "input",
  }) as HTMLInputElement;
}
function drop(files: File[]) {
  fireEvent.drop(input().closest(".space-y-3")!, { dataTransfer: { files } });
}

describe("FileInput", () => {
  it("associates labels, requirement, help, status and error with stable unique IDs", () => {
    const { rerender } = render(
      <FileInput
        label="Documento"
        value={null}
        onChange={vi.fn()}
        required
        help="Ayuda"
        error="Revisa el archivo"
      />,
    );
    const id = input().id;
    expect(input()).toHaveAttribute("aria-required", "true");
    expect(input()).toHaveAttribute("aria-invalid", "true");
    expect(input()).toHaveAccessibleDescription(
      expect.stringContaining("Ayuda Revisa el archivo"),
    );
    rerender(
      <>
        <FileInput label="Documento" value={null} onChange={vi.fn()} />
        <FileInput label="Otro" value={null} onChange={vi.fn()} />
      </>,
    );
    expect(input().id).toBe(id);
    expect(screen.getByLabelText(/Otro/, { selector: "input" }).id).not.toBe(
      id,
    );
    expect(input()).not.toHaveAttribute("aria-invalid");
  });

  it("retains saved descriptors on invalid type, excessive size and multiple drops then clears errors on valid selection", () => {
    render(
      <Controlled
        value={{ kind: "persisted", name: "saved.pdf" }}
        accept=".pdf,application/pdf"
        maxBytes={4}
      />,
    );
    drop([wrong]);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Tipo de archivo no permitido",
    );
    expect(screen.getByRole("status")).toHaveTextContent("Guardado: saved.pdf");
    drop([new File(["12345"], "big.pdf")]);
    expect(screen.getByRole("alert")).toHaveTextContent("máximo de 4 bytes");
    drop([pdf, pdf]);
    expect(screen.getByRole("alert")).toHaveTextContent("un solo archivo");
    drop([pdf]);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Seleccionado: report.pdf",
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("applies the same chooser validation and permits same-file selection after rejection and removal", async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<Controlled accept="application/pdf" />);
    await user.upload(input(), wrong);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(input().value).toBe("");
    await user.upload(input(), wrong);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    await user.upload(input(), pdf);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    fireEvent(input(), new Event("cancel", { bubbles: true }));
    fireEvent.change(input(), { target: { files: [] } });
    expect(screen.getByRole("status")).toHaveTextContent("report.pdf");
    await user.click(screen.getByRole("button", { name: /Quitar/ }));
    expect(input()).toHaveFocus();
    expect(screen.getByRole("status")).not.toHaveTextContent("report.pdf");
    await user.upload(input(), pdf);
    expect(screen.getByRole("status")).toHaveTextContent("report.pdf");
  });

  it.each([{ disabled: true }, { pending: true }])(
    "blocks chooser, remove and drops while %j",
    async (state) => {
      const change = vi.fn();
      render(
        <FileInput
          label="Documento"
          value={{ kind: "local", file: pdf }}
          onChange={change}
          {...state}
        />,
      );
      expect(input()).toBeDisabled();
      expect(screen.getByRole("button", { name: /Quitar/ })).toBeDisabled();
      drop([wrong]);
      fireEvent.change(input(), { target: { files: [wrong] } });
      expect(change).not.toHaveBeenCalled();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    },
  );

  it("offers keyboard focus, nested drag feedback and respects consumer-owned state", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <FileInput
        label="Documento"
        value={null}
        onChange={change}
        accept="image/*"
      />,
    );
    await user.tab();
    expect(input()).toHaveFocus();
    const target = input().closest(".space-y-3")!;
    fireEvent.dragEnter(target, { dataTransfer: { types: ["Files"] } });
    fireEvent.dragEnter(input(), { dataTransfer: { types: ["Files"] } });
    fireEvent.dragLeave(input());
    expect(screen.getByRole("status")).toHaveTextContent("Suelta");
    fireEvent.dragLeave(target);
    expect(screen.getByRole("status")).not.toHaveTextContent("Suelta");
    const image = new File(["x"], "image", { type: "image/png" });
    drop([image]);
    expect(change).toHaveBeenCalledWith({ kind: "local", file: image });
    expect(screen.getByRole("status")).not.toHaveTextContent("Seleccionado");
    expect(input()).not.toHaveAttribute("multiple");
  });
});
