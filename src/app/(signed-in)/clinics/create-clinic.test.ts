import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Database } from "@/lib/supabase/database.types";
import { requireSupabaseActionSession } from "@/lib/supabase/session";
import { createClinic } from "./create-clinic";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/session", () => ({
  requireSupabaseActionSession: vi.fn(),
}));

const fetch = vi.fn<typeof globalThis.fetch>();
const user = { id: "verified-user" } as Awaited<
  ReturnType<typeof requireSupabaseActionSession>
>["user"];
const requireSession = vi.mocked(requireSupabaseActionSession);
const nameLengthError =
  "El nombre de la clínica debe tener como máximo 200 caracteres.";

function clinicForm(name: string, percentage: string) {
  const form = new FormData();
  form.set("name", name);
  form.set("percentage", percentage);
  return form;
}

beforeEach(() => {
  vi.resetAllMocks();
  requireSession.mockResolvedValue({
    user,
    client: createClient<Database>(
      "https://myclinics.example",
      "sb_publishable_fixture",
      {
        accessToken: async () => "verified-token",
        global: { fetch },
      },
    ),
  });
});

describe("create clinic server action", () => {
  it("rejects direct calls without a verified session before reaching the Data API", async () => {
    requireSession.mockRejectedValue(new Error("redirect: /login"));
    await expect(createClinic(clinicForm("Fixture", "27"))).rejects.toThrow(
      "redirect: /login",
    );
    expect(fetch).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it.each([
    ["0", 0],
    [" 27,50 ", 27.5],
    ["100.00", 100],
  ])(
    "inserts a trimmed name and %s using database defaults",
    async (raw, value) => {
      fetch.mockResolvedValue(new Response(null, { status: 201 }));
      const form = clinicForm("  Clínica Sintética  ", raw);
      form.set("owner_id", "forged-user");
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
            owner_id: user.id,
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
      expect(fetch).not.toHaveBeenCalled();
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

  it.each(["a", "🦷"])("accepts 200 characters of %s", async (character) => {
    fetch.mockResolvedValue(new Response(null, { status: 201 }));
    const name = character.repeat(200);
    expect(await createClinic(clinicForm(name, "27"))).toEqual({
      status: "saved",
    });
    expect(fetch).toHaveBeenCalledExactlyOnceWith(
      "https://myclinics.example/rest/v1/clinics",
      expect.objectContaining({
        body: JSON.stringify({ name, percentage: 27, owner_id: user.id }),
      }),
    );
  });

  it.each(["a".repeat(201), "🦷".repeat(201), "🦷".repeat(200) + " "])(
    "rejects a raw name of 201 code points before the write",
    async (name) => {
      expect(await createClinic(clinicForm(name, "100.01"))).toEqual({
        status: "invalid",
        nameError: nameLengthError,
        percentageError: "Introduce un porcentaje entre 0 y 100.",
      });
      expect(fetch).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    },
  );

  it("maps the database name length constraint to the name field", async () => {
    fetch.mockResolvedValue(
      Response.json(
        {
          code: "23514",
          message:
            'new row for relation "clinics" violates check constraint "clinics_name_length"',
        },
        { status: 400 },
      ),
    );
    expect(await createClinic(clinicForm("Clínica Sintética", "27"))).toEqual({
      status: "invalid",
      nameError: nameLengthError,
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
