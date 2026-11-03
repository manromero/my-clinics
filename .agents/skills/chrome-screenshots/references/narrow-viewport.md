# Capture a true narrow viewport

Use when Chrome's window sizing does not yield the required CSS viewport. This
procedure uses Node 24's built-in WebSocket and Chrome DevTools Protocol, without
installing packages. Save the JavaScript below as a temporary `.mjs` file outside
the repository. Resolve `$chromePath`, `$profilePath`, `$scriptPath`, `$targetUrl`
and `$imagePath` first; keep the profile unique to this capture.

```powershell
$chromeProcess = Start-Process -FilePath $chromePath -WindowStyle Hidden -PassThru -ArgumentList @('--headless', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', "--user-data-dir=`"$profilePath`"", 'about:blank')
for ($attempt = 0; $attempt -lt 100 -and !(Test-Path "$profilePath/DevToolsActivePort"); $attempt++) { Start-Sleep -Milliseconds 100 }
if (!(Test-Path "$profilePath/DevToolsActivePort")) { throw 'Chrome debugging endpoint unavailable' }
node $scriptPath $profilePath $targetUrl $imagePath
Stop-Process -Id $chromeProcess.Id -ErrorAction SilentlyContinue
```

The example targets the local smoke fixture's `#metrics` element. For application
evidence, replace that readiness predicate with the actual screen/state's ready
selector or condition; `document.readyState` alone does not prove hydration or
data readiness. Keep URL confirmation and font readiness. Establish interactive
states through this same connection before capture. Bound the invocation with an
execution timeout and report protocol/navigation errors instead of accepting stale output.

```javascript
import { readFile, writeFile } from "node:fs/promises";
const [profile, url, output] = process.argv.slice(2);
const [port] = (await readFile(`${profile}/DevToolsActivePort`, "utf8"))
  .trim()
  .split("\n");
const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const socket = new WebSocket(
  pages.find((p) => p.type === "page").webSocketDebuggerUrl,
);
await new Promise((resolve, reject) => {
  socket.onopen = resolve;
  socket.onerror = reject;
});
let id = 0;
const pending = new Map();
socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (!pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  message.error
    ? reject(new Error(JSON.stringify(message.error)))
    : resolve(message.result);
};
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const requestId = ++id;
    pending.set(requestId, { resolve, reject });
    socket.send(JSON.stringify({ id: requestId, method, params }));
  });
}
try {
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.enable");
  await send("Page.navigate", { url });
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    const result = await send("Runtime.evaluate", {
      expression:
        "location.href === " +
        JSON.stringify(url) +
        ' && document.readyState === "complete" && !!document.querySelector("#metrics")',
      returnByValue: true,
    });
    if (result.result.value) {
      ready = true;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (!ready) throw new Error("Expected fixture did not become ready");
  await send("Runtime.evaluate", {
    expression: "document.fonts.ready.then(() => true)",
    awaitPromise: true,
  });
  const metrics = await send("Runtime.evaluate", {
    expression: "({width:innerWidth,height:innerHeight,dpr:devicePixelRatio})",
    returnByValue: true,
  });
  console.log(JSON.stringify(metrics.result.value));
  const capture = await send("Page.captureScreenshot", { format: "png" });
  await writeFile(output, Buffer.from(capture.data, "base64"));
} finally {
  socket.close();
}
```

This configuration checks a narrow desktop CSS layout (`mobile: false`). It does
not emulate touch input or a mobile browser identity. Configure those separately
only when the task needs them. Inspect the actual PNG and record measured metrics
and pixel dimensions. The local smoke test on Chrome 156.0.8078.80 measured
390 × 844 at DPR 1 with a matching PNG; the initial CLI-only capture measured
500 × 844 despite its 390 × 844 PNG. These are tooling observations, not application
validation. Follow the parent skill's attribution, publication and cleanup rules.
