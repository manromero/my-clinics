import { mkdirSync, writeFileSync } from "node:fs";
import type {
  FullResult,
  Reporter,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";
import { artifactDir } from "./config";

export default class HostedActivityReporter implements Reporter {
  private results: { project: string; status: string; durationMs: number }[] =
    [];

  onTestEnd(test: TestCase, result: TestResult) {
    const project = test.parent.project()?.name ?? "unknown";
    this.results.push({
      project,
      status: result.status,
      durationMs: result.duration,
    });
    console.log(
      `Hosted Activity ${project}: ${result.status} (${result.duration} ms)`,
    );
  }

  onError() {
    console.error("Playwright could not complete hosted Activity acceptance.");
  }

  onEnd(result: FullResult) {
    const mode =
      process.env.ACTIVITY_DIAGNOSTIC_PROBE === "1" ? "probe" : "normal";
    mkdirSync(artifactDir, { recursive: true });
    writeFileSync(
      `${artifactDir}/${mode}-result.json`,
      JSON.stringify({ status: result.status, tests: this.results }, null, 2),
    );
  }
}
