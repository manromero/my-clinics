import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Database } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { createClinic } from "./create-clinic";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/server-client", () => ({
  createSupabaseServerClient: vi.fn(),
}));

const fetch = vi.fn<typeof globalThis.fetch>();
const getClient = vi.mocked(createSupabaseServerClient);

function clinicForm(name: string, percentage: string) {
  const form = new FormData();
  form.set("name", name);
  form.set("percentage", percentage);
  return form;
}

beforeEach(() => {
  vi.resetAllMocks();
  getClient.mockReturnValue(
    createClient<Database>(
      "https://myclinics.example",
      "sb_publishable_fixture",
      {
        accessToken: async () => null,
        global: { fetch },
      },
    ),
  );
});

describe("create clinic server action", () => {
  it.each([
    ["0", 0],
    [" 27,50 ", 27.5],
    ["100.00", 100],
  ])(
    "inserts a trimmed name and %s using database defaults",
    async (raw, value) => {
      fetch.mockResolvedValue(new Response(null, { status: 201 }));
      const form = clinicForm("  Clínica Sintética  ", raw);
      form.set("id", "123");
      form.set("active", "false");

      expect(await createClinic(form)).toEqual({ status: "saved" });
      expect(fetch).toHaveBeenCalledExactlyOnceWith(
        "https://myclinics.example/rest/v1/clinics",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            name: "Clínica Sintética",
            percentage: value,
          }),
        }),
      );
      expect(revalidatePath).toHaveBeenCalledExactlyOnceWith("/clinics");
    },
  );

  it.each([
    ["", "Introduce el porcentaje por defecto."],
    ["-0.01", "Introduce un porcentaje entre 0 y 100."],
    ["100,01", "Introduce un porcentaje entre 0 y 100."],
    ["25.001", "Usa como máximo dos decimales."],
    ["1e2", "Introduce un porcentaje válido."],
  ])(
    "validates blank names and invalid percentage %j before calling Supabase",
    async (raw, percentageError) => {
      expect(await createClinic(clinicForm(" \u00A0 ", raw))).toEqual({
        status: "invalid",
        nameError: "Introduce el nombre de la clínica.",
        percentageError,
      });
      expect(getClient).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    },
  );

  it("returns an inline name error for the unique-index conflict", async () => {
    fetch.mockResolvedValue(
      Response.json(
        {
          code: "23505",
          message:
            'duplicate key value violates unique constraint "clinics_name_key_unique"',
        },
        { status: 409 },
      ),
    );
    expect(await createClinic(clinicForm("Clínica Sintética", "27"))).toEqual({
      status: "invalid",
      nameError: "Ya existe una clínica con ese nombre.",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("contains a transport failure and refreshes the list after a successful retry", async () => {
    fetch
      .mockRejectedValueOnce(new TypeError("Sensitive transport error"))
      .mockResolvedValueOnce(new Response(null, { status: 201 }));
    const form = clinicForm("Clínica Sintética", "27");

    expect(await createClinic(form)).toEqual({ status: "failed" });
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(await createClinic(form)).toEqual({ status: "saved" });
    expect(revalidatePath).toHaveBeenCalledExactlyOnceWith("/clinics");
  });
});
