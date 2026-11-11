import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Database } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { updateClinic } from "./update-clinic";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/server-client", () => ({
  createSupabaseServerClient: vi.fn(),
}));

const fetch = vi.fn<typeof globalThis.fetch>();
const getClient = vi.mocked(createSupabaseServerClient);
const clinicId = "9223372036854775807";

function clinicForm(name = "  Clínica Sintética  ", percentage = "27,50") {
  const form = new FormData();
  form.set("name", name);
  form.set("percentage", percentage);
  form.set("active", "inactive");
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

describe("update clinic server action", () => {
  it.each([
    ["inactive", false],
    ["active", true],
  ])(
    "updates only the selected bigint ID with state %s",
    async (state, active) => {
      fetch.mockResolvedValue(Response.json([{ id: clinicId }]));
      const form = clinicForm();
      form.set("active", state);
      form.set("id", "1");

      expect(await updateClinic(clinicId, form)).toEqual({ status: "saved" });
      expect(fetch).toHaveBeenCalledExactlyOnceWith(
        `https://myclinics.example/rest/v1/clinics?id=eq.${clinicId}&select=id%3A%3Atext`,
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({
            name: "Clínica Sintética",
            percentage: 27.5,
            active,
          }),
        }),
      );
      expect(revalidatePath).toHaveBeenCalledExactlyOnceWith("/clinics");
    },
  );

  it("rejects invalid clinic values before writing", async () => {
    expect(
      await updateClinic(clinicId, clinicForm("🦷".repeat(201), "1,111")),
    ).toEqual({
      status: "invalid",
      nameError:
        "El nombre de la clínica debe tener como máximo 200 caracteres.",
      percentageError: "Usa como máximo dos decimales.",
    });
    expect(getClient).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it.each(["", "0", "1,active.eq.true", "9223372036854775808"])(
    "rejects invalid ID %j before writing",
    async (id) => {
      expect(await updateClinic(id, clinicForm())).toEqual({
        status: "missing",
      });
      expect(getClient).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    },
  );

  it("requires an explicit active state", async () => {
    const form = clinicForm();
    form.delete("active");

    expect(await updateClinic(clinicId, form)).toEqual({ status: "failed" });
    expect(getClient).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("returns a name error for the database's normalized unique-index conflict", async () => {
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

    expect(await updateClinic(clinicId, clinicForm())).toEqual({
      status: "invalid",
      nameError: "Ya existe una clínica con ese nombre.",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("distinguishes a missing row from success", async () => {
    fetch.mockResolvedValue(Response.json([]));

    expect(await updateClinic(clinicId, clinicForm())).toEqual({
      status: "missing",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("keeps an unexpected returned ID or transport failure from reporting success", async () => {
    fetch
      .mockResolvedValueOnce(Response.json([{ id: "1" }]))
      .mockRejectedValueOnce(new TypeError("Sensitive transport error"))
      .mockResolvedValueOnce(Response.json([{ id: clinicId }]));
    const form = clinicForm();

    expect(await updateClinic(clinicId, form)).toEqual({ status: "failed" });
    expect(await updateClinic(clinicId, form)).toEqual({ status: "failed" });
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(await updateClinic(clinicId, form)).toEqual({ status: "saved" });
    expect(revalidatePath).toHaveBeenCalledExactlyOnceWith("/clinics");
  });
});
