import { mkdir, writeFile } from "node:fs/promises";
import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  createScope,
  removeCreatedRows,
  verifyEmptyPeriod,
} from "./activity-data";
import { account, artifactDir, type ProjectName } from "./config";
import { signIn, verifyFixture, type OwnerClient } from "./session";

const amounts = ["120,00 €", "30,00 €", "25,50 €"];
const zero = "0,00 €";

async function expectTotals(page: Page, expected: string[]) {
  const totals = page.getByRole("region", { name: "Totales del periodo" });
  const labels = [
    "Facturación total",
    "Ganancia bruta",
    "Ganancia tras IRPF",
    "Registros",
  ];
  for (const [index, label] of labels.entries()) {
    const card = totals.locator("dl").filter({ hasText: label });
    await expect(card.locator("dd")).toHaveText(expected[index]);
  }
}

async function expectSavedRow(row: Locator, date: string, clinic: string) {
  await expect(row).toBeVisible();
  for (const value of [date, clinic, ...amounts]) {
    await expect(row.getByText(value, { exact: true })).toBeVisible();
  }
}

test("persists a new activity and exact totals across sessions", async ({
  browser,
  page,
}, info) => {
  const project = info.project.name as ProjectName;
  const fixture = account(project);
  const scope = createScope(project);
  const probe = process.env.ACTIVITY_DIAGNOSTIC_PROBE === "1";
  const path = `${artifactDir}/${probe ? "probe" : "normal"}-${project}`;
  const trace: { step: string; ms: number; result: "passed" | "failed" }[] = [];
  const startedAt = Date.now();
  let client: OwnerClient | undefined;
  let saveAttempted = false;
  let saveConfirmed = false;
  let screenVerified = false;
  let removed: number | null = null;
  let failed = false;
  let probeTriggered = false;
  let screenshot = false;

  async function step<T>(name: string, run: () => Promise<T>) {
    return test.step(name, async () => {
      try {
        const result = await run();
        trace.push({
          step: name,
          ms: Date.now() - startedAt,
          result: "passed",
        });
        return result;
      } catch {
        trace.push({
          step: name,
          ms: Date.now() - startedAt,
          result: "failed",
        });
        throw new Error(`Hosted Activity step failed: ${name}`);
      }
    });
  }

  function row(view: Page) {
    const records = view.getByRole(project === "desktop" ? "table" : "list", {
      name: "Registros de actividad",
    });
    return records
      .getByRole(project === "desktop" ? "row" : "listitem")
      .filter({
        has: view.getByText(scope.marker, { exact: true }),
      });
  }

  await mkdir(artifactDir, { recursive: true });
  try {
    const owner = await step("Verify Supabase password session", () =>
      signIn(project, page.context()),
    );
    client = owner;
    await step("Verify the active 25% fixture clinic", () =>
      verifyFixture(owner, project),
    );
    await step("Check that the synthetic clinic period is unused", () =>
      verifyEmptyPeriod(owner, scope),
    );
    await step(
      "Open authenticated activity and check zero totals",
      async () => {
        await page.goto(scope.path);
        await expect(
          page.getByRole("heading", { name: "Actividad mensual" }),
        ).toBeVisible();
        await expect(
          page.getByRole("status").filter({ hasText: fixture.clinicName }),
        ).toBeVisible();
        screenVerified = true;
        await expectTotals(page, [zero, zero, zero, "0"]);
      },
    );
    await step("Enter activity through the form", async () => {
      await page.getByRole("button", { name: "Nueva actividad" }).click();
      const form = page.getByRole("dialog", { name: "Nueva actividad" });
      await form.getByLabel("Fecha").fill(scope.date);
      await form
        .getByLabel("Clínica")
        .selectOption({ label: fixture.clinicName });
      await form.getByLabel("Concepto").fill(scope.marker);
      await form.getByLabel("Importe", { exact: true }).fill("120,00");
      saveAttempted = true;
      await Promise.all([
        page.waitForResponse(
          (response) =>
            new URL(response.url()).pathname === "/activity" &&
            response.request().method() === "POST",
          { timeout: 15_000 },
        ),
        form.getByRole("button", { name: "Guardar" }).click(),
      ]);
      await expect(
        page.getByText("Actividad guardada.", { exact: true }),
      ).toBeVisible();
      saveConfirmed = true;
    });
    await step("Check saved row and exact totals", async () => {
      await expectSavedRow(row(page), scope.displayDate, fixture.clinicName);
      await expectTotals(page, [...amounts, "1"]);
    });
    if (probe) {
      await step("Deliberately fail after confirming a saved row", async () => {
        probeTriggered = true;
        throw new Error("Intentional hosted Activity diagnostics probe.");
      });
    }
    await step("Reload and check saved row and exact totals", async () => {
      await page.reload();
      await expectSavedRow(row(page), scope.displayDate, fixture.clinicName);
      await expectTotals(page, [...amounts, "1"]);
    });
    await step(
      "Independently sign in and check the same saved data",
      async () => {
        const context = await browser.newContext();
        try {
          await signIn(project, context);
          const secondPage = await context.newPage();
          await secondPage.goto(scope.path);
          await expectSavedRow(
            row(secondPage),
            scope.displayDate,
            fixture.clinicName,
          );
          await expectTotals(secondPage, [...amounts, "1"]);
        } finally {
          await context.close();
        }
      },
    );
  } catch {
    failed = true;
  } finally {
    try {
      const cleanupClient = client;
      if (cleanupClient && saveAttempted) {
        await step(
          "Remove only run-owned activity and verify absence",
          async () => {
            removed = await removeCreatedRows(cleanupClient, scope);
            if (saveConfirmed && removed !== 1) {
              throw new Error(
                "Expected exactly one run-owned activity to be removed.",
              );
            }
          },
        );
      }
    } catch {
      failed = true;
    }

    let browserEvidence:
      | { width: number; height: number; dpr: number; chrome: string }
      | undefined;
    if (screenVerified) {
      try {
        browserEvidence = {
          ...(await page.evaluate(() => ({
            width: innerWidth,
            height: innerHeight,
            dpr: devicePixelRatio,
          }))),
          chrome: browser.version(),
        };
        await page.screenshot({
          path: `${path}.png`,
          mask: [
            page.getByRole("banner"),
            page.getByText(fixture.email, { exact: true }),
          ],
          maskColor: "#e8e8e8",
          fullPage: true,
          scale: "css",
          timeout: 5_000,
        });
        screenshot = true;
      } catch {
        trace.push({
          step: "Capture redacted browser screenshot",
          ms: Date.now() - startedAt,
          result: "failed",
        });
      }
    }
    await writeFile(
      `${path}.trace.json`,
      JSON.stringify(
        {
          project,
          mode: probe ? "probe" : "normal",
          date: scope.date,
          marker: scope.marker,
          steps: trace,
          probeTriggered,
          saveConfirmed,
          removed,
          screenshot,
          browserEvidence,
          commit: process.env.GITHUB_SHA,
          capturedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
    );
  }
  if (failed)
    throw new Error(
      "Hosted Activity failed. Inspect the safe step trace and cleanup result.",
    );
});
