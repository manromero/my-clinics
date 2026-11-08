import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import { readFile, writeFile, mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Chrome headless/CDP capture follows the chrome-screenshots skill, including
// measured CSS viewports, explicit readiness and attribution for every capture.
export async function chromeClinicChecks({ output, query, seed, head }) {
  const chrome =
    process.env.CHROME_PATH ??
    (process.platform === "win32"
      ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
      : "/usr/bin/google-chrome");
  const profile = await mkdtemp(join(tmpdir(), "myclinics-chrome-"));
  const child = spawn(
    chrome,
    [
      "--headless",
      "--no-sandbox",
      "--no-first-run",
      "--no-default-browser-check",
      "--hide-scrollbars",
      "--remote-debugging-port=0",
      `--user-data-dir=${profile}`,
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  let socket;
  try {
    let port;
    for (let i = 0; i < 100; i++) {
      try {
        [port] = (await readFile(join(profile, "DevToolsActivePort"), "utf8"))
          .trim()
          .split("\n");
        break;
      } catch {
        await pause(100);
      }
    }
    assert.ok(port, "Chrome debugging endpoint unavailable");
    const tabs = await (
      await fetch(`http://127.0.0.1:${port}/json/list`)
    ).json();
    socket = new WebSocket(
      tabs.find((p) => p.type === "page").webSocketDebuggerUrl,
    );
    await new Promise((resolve, reject) => {
      socket.onopen = resolve;
      socket.onerror = reject;
    });
    let id = 0;
    const pending = new Map();
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const request = pending.get(message.id);
      if (!request) return;
      pending.delete(message.id);
      if (message.error) request.reject(new Error("Chrome protocol failed"));
      else request.resolve(message.result);
    };
    const send = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const requestId = ++id;
        pending.set(requestId, { resolve, reject });
        socket.send(JSON.stringify({ id: requestId, method, params }));
      });
    const evaluate = async (expression) => {
      const result = await send("Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      if (result.exceptionDetails) throw new Error("Browser evaluation failed");
      return result.result.value;
    };
    const wait = async (expression) => {
      for (let i = 0; i < 200; i++) {
        if (await evaluate(expression)) return;
        await pause(100);
      }
      throw new Error(`Browser condition timed out: ${expression}`);
    };
    await send("Page.enable");
    await send("Network.enable");
    const captures = [];
    for (const width of [1440, 390]) {
      const height = width === 1440 ? 1000 : 844;
      const label = width === 1440 ? "desktop" : "mobile";
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: false,
      });
      const capture = async (state) => {
        await evaluate("document.fonts.ready.then(() => true)");
        const metrics = await evaluate(
          "({width:innerWidth,height:innerHeight,dpr:devicePixelRatio,overflow:document.documentElement.scrollWidth>innerWidth})",
        );
        assert.equal(metrics.width, width);
        assert.equal(metrics.overflow, false, "Horizontal overflow");
        const image = await send("Page.captureScreenshot", { format: "png" });
        const file = `${label}-${state}.png`;
        await writeFile(join(output, file), Buffer.from(image.data, "base64"));
        captures.push({
          file,
          state,
          route: "/clinics",
          time: new Date().toISOString(),
          metrics,
          head,
          capturer: "Task06 implementer, CI Chrome headless/CDP",
          chrome: execFileSync(chrome, ["--version"], {
            encoding: "utf8",
          }).trim(),
          emulation: "narrow desktop CSS; no touch/mobile identity",
        });
      };
      const navigate = async (suffix = "") => {
        await send("Page.navigate", {
          url: `http://127.0.0.1:3106/clinics${suffix}`,
        });
        await wait(
          "document.readyState==='complete' && document.querySelector('main') && location.pathname==='/clinics'",
        );
      };
      await query("truncate public.clinics restart identity");
      await query(seed);
      await send("Network.emulateNetworkConditions", {
        offline: false,
        latency: 1500,
        downloadThroughput: -1,
        uploadThroughput: -1,
      });
      await navigate();
      await wait("document.body.innerText.includes('Cargando clínicas')");
      await capture("loading");
      await send("Network.emulateNetworkConditions", {
        offline: false,
        latency: 0,
        downloadThroughput: -1,
        uploadThroughput: -1,
      });
      await wait(
        "document.body.innerText.includes('Clínica Sintética Decimal')",
      );
      assert.ok(
        await evaluate(
          "document.body.innerText.includes('37,25 %') && document.body.innerText.includes('Activa') && document.body.innerText.includes('Inactiva') && ![...document.querySelectorAll('button')].some(b=>/Nueva clínica|Editar|Eliminar/.test(b.innerText))",
        ),
      );
      await capture("loaded");
      await navigate();
      await wait(
        "document.body.innerText.includes('Clínica Sintética Decimal')",
      );
      await query("update public.clinics set active=false");
      await navigate();
      await wait(
        "document.body.innerText.includes('Todas las clínicas están inactivas')",
      );
      await capture("all-inactive");
      await query("truncate public.clinics restart identity");
      await navigate();
      await wait("document.body.innerText.includes('Aún no hay clínicas')");
      await capture("empty");
      await query(seed);
      await query(
        "alter table public.clinics rename to clinics_validation_unavailable",
      );
      try {
        await navigate();
        await wait(
          "document.body.innerText.includes('No se pudieron cargar las clínicas')",
        );
        await capture("error");
      } finally {
        await query(
          "alter table public.clinics_validation_unavailable rename to clinics",
        );
      }
      await evaluate(
        "[...document.querySelectorAll('button')].find(b=>b.innerText==='Reintentar').click()",
      );
      await wait(
        "document.body.innerText.includes('Clínica Sintética Decimal')",
      );
      await capture("retry");
      // A live preview save must remain separate from persistent data.
      await navigate("?preview=empty");
      await wait(
        "[...document.querySelectorAll('button')].some(b=>b.innerText==='Nueva clínica')",
      );
      await evaluate(
        "[...document.querySelectorAll('button')].find(b=>b.innerText==='Nueva clínica').click()",
      );
      await wait("!!document.querySelector('dialog[open] input[name=name]')");
      await evaluate(
        "document.querySelector('input[name=name]').value='Solo memoria'; document.querySelector('input[name=percentage]').focus()",
      );
      await send("Input.insertText", { text: "25" });
      await evaluate(
        "[...document.querySelectorAll('button')].find(b=>b.innerText==='Guardar').click()",
      );
      await wait("document.body.innerText.includes('Clínica guardada')");
      await navigate();
      await wait(
        "document.body.innerText.includes('Clínica Sintética Decimal')",
      );
      assert.ok(
        await evaluate("!document.body.innerText.includes('Solo memoria')"),
      );
    }
    await writeFile(
      join(output, "capture-metadata.json"),
      JSON.stringify(
        {
          head,
          clean: !execFileSync("git", ["status", "--porcelain"], {
            encoding: "utf8",
          }).trim(),
          references: [
            "docs/screens/alexandria/DESIGN.md",
            "docs/screens/s02_gesti_n_de_cl_nicas/code.html",
            "docs/screens/s02_gesti_n_de_cl_nicas/screen.png",
          ],
          captures,
        },
        null,
        2,
      ),
    );
    console.log(
      "Live desktop/mobile loading, list, inactive, empty, database failure, retry, reload, unavailable writes, preview isolation and overflow checks passed",
    );
  } finally {
    socket?.close();
    child.kill();
    await new Promise((resolve) => {
      if (child.exitCode !== null) resolve();
      else child.once("exit", resolve);
    });
    // profile was created by mkdtemp under the OS temp directory in this call.
    await rm(profile, { recursive: true, force: true });
  }
}
