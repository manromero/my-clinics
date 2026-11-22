import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { parseEnv } from "node:util";
import { createServerClient } from "@supabase/ssr";

const projectUrl = "https://lvqbrjybwstvdhaxyxyn.supabase.co";
const rolePrefixes = new Map([
  ["implementer", "AGENT_VALIDATION"],
  ["reviewer", "REVIEW_VALIDATION"],
]);

class ValidationError extends Error {}

async function readSettings(file) {
  const contents = await readFile(
    new URL(`../${file}`, import.meta.url),
    "utf8",
  ).catch(() => {
    throw new ValidationError(`Cannot read ${file}.`);
  });
  return parseEnv(contents);
}

async function signIn(prefix) {
  const settings = await readSettings(".env.local");
  const key = settings.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (
    settings.NEXT_PUBLIC_SUPABASE_URL !== projectUrl ||
    !key?.startsWith("sb_publishable_")
  ) {
    throw new ValidationError(
      "Configure .env.local for the approved synthetic Supabase project.",
    );
  }

  const credentials = await readSettings(".env.agent-validation");
  const email = credentials[`${prefix}_EMAIL`];
  const password = credentials[`${prefix}_PASSWORD`];
  const userId = credentials[`${prefix}_USER_ID`];
  const clinicId = credentials[`${prefix}_CLINIC_ID`];
  if (!email || !password || !userId || !/^[1-9]\d*$/.test(clinicId ?? "")) {
    throw new ValidationError(`The ${prefix} fixture settings are incomplete.`);
  }

  const cookies = new Map();
  const client = createServerClient(projectUrl, key, {
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          redirect: "error",
          signal: AbortSignal.timeout(15_000),
        }),
    },
    cookies: {
      getAll: () => [...cookies.values()],
      setAll: (updates) => {
        for (const { name, value, options } of updates) {
          if (options.maxAge === 0) cookies.delete(name);
          else cookies.set(name, { name, value });
        }
      },
    },
  });
  const { data: signedIn, error: signInError } =
    await client.auth.signInWithPassword({ email, password });
  if (signInError || !signedIn.session) {
    throw new ValidationError(
      "Could not sign in to the synthetic fixture account.",
    );
  }

  const { data, error } = await client.auth.getUser();
  if (
    error ||
    data.user?.id !== userId ||
    data.user.email?.toLowerCase() !== email.toLowerCase() ||
    data.user.role !== "authenticated"
  ) {
    throw new ValidationError(
      "The session does not match the configured ordinary user.",
    );
  }
  const { data: clinic, error: clinicError } = await client
    .from("clinics")
    .select("active")
    .eq("id", clinicId)
    .maybeSingle();
  if (clinicError || !clinic?.active || !cookies.size) {
    throw new ValidationError(
      "The verified session cannot read its active fixture clinic.",
    );
  }
  return [...cookies.values()];
}

async function connectBrowser(profile, stopped) {
  const portFile = join(profile, "DevToolsActivePort");
  const portDetails = await Promise.race([
    stopped.then(() => {
      throw new ValidationError("Chrome exited before opening DevTools.");
    }),
    (async () => {
      for (let attempt = 0; attempt < 100; attempt++) {
        const details = await readFile(portFile, "utf8").catch(() => "");
        if (details.includes("/devtools/browser/")) return details;
        await delay(100, undefined, { ref: false });
      }
      throw new ValidationError(
        "Chrome did not open its isolated DevTools endpoint.",
      );
    })(),
  ]);
  const [port, path] = portDetails.trim().split(/\r?\n/);
  if (
    !/^\d{1,5}$/.test(port) ||
    !/^\/devtools\/browser\/[\da-f-]+$/.test(path)
  ) {
    throw new ValidationError("Chrome returned an invalid DevTools endpoint.");
  }
  return { port, socket: new WebSocket(`ws://127.0.0.1:${port}${path}`) };
}

async function command(socket, id, method, params) {
  const listener = new AbortController();
  const timeout = AbortSignal.timeout(10_000);
  const response = new Promise((resolve, reject) => {
    socket.addEventListener(
      "message",
      (event) => {
        const message = JSON.parse(event.data);
        if (message.id !== id) return;
        if (message.error)
          reject(new ValidationError(`Chrome rejected ${method}.`));
        else resolve(message.result);
      },
      { signal: listener.signal },
    );
    socket.addEventListener(
      "close",
      () =>
        reject(new ValidationError(`Chrome disconnected during ${method}.`)),
      { once: true, signal: listener.signal },
    );
    timeout.addEventListener(
      "abort",
      () => reject(new ValidationError(`Chrome timed out during ${method}.`)),
      { once: true, signal: listener.signal },
    );
  });
  try {
    socket.send(JSON.stringify({ id, method, params }));
    return await response;
  } finally {
    listener.abort();
  }
}

async function openBrowser(url, cookies) {
  const profile = await mkdtemp(join(tmpdir(), "myclinics-agent-validation-"));
  const chromePath =
    process.env.MYCLINICS_CHROME_PATH ||
    (process.platform === "win32"
      ? join(
          process.env.ProgramFiles || "C:\\Program Files",
          "Google",
          "Chrome",
          "Application",
          "chrome.exe",
        )
      : "google-chrome");
  const chrome = spawn(
    chromePath,
    [
      "--headless",
      "--remote-debugging-port=0",
      "--remote-debugging-address=127.0.0.1",
      `--user-data-dir=${profile}`,
      "--no-first-run",
      "--no-default-browser-check",
      "about:blank",
    ],
    { stdio: "ignore", windowsHide: true },
  );
  const stopped = new Promise((resolve) => {
    chrome.once("error", resolve);
    chrome.once("close", resolve);
  });
  const stop = () => chrome.kill();
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  let socket;

  try {
    const browser = await connectBrowser(profile, stopped);
    socket = browser.socket;
    await once(socket, "open", { signal: AbortSignal.timeout(10_000) });
    // Use an off-the-record context so the Auth cookies stay in memory.
    const { browserContextId } = await command(
      socket,
      1,
      "Target.createBrowserContext",
    );
    if (!browserContextId)
      throw new ValidationError("Chrome could not create an isolated context.");
    await command(socket, 2, "Storage.setCookies", {
      browserContextId,
      cookies: cookies.map((cookie) => ({
        ...cookie,
        url: `${url.origin}/`,
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
      })),
    });
    await command(socket, 3, "Target.createTarget", {
      url: url.href,
      browserContextId,
    });
    socket.close();
    console.log(
      `Synthetic browser session ready. DevTools: http://127.0.0.1:${browser.port}`,
    );
    await stopped;
  } finally {
    socket?.close();
    if (chrome.pid && chrome.exitCode === null && chrome.signalCode === null)
      stop();
    await stopped;
    process.removeListener("SIGINT", stop);
    process.removeListener("SIGTERM", stop);
    await rm(profile, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 100,
    });
  }
}

try {
  const [role, port, path = "/activity", ...extra] = process.argv.slice(2);
  const prefix = rolePrefixes.get(role);
  if (
    !prefix ||
    !/^\d{1,5}$/.test(port ?? "") ||
    Number(port) < 1 ||
    Number(port) > 65535 ||
    extra.length ||
    !path.startsWith("/")
  ) {
    throw new ValidationError(
      "Usage: node scripts/agent-validation.mjs <implementer|reviewer> <local app port> [/path]",
    );
  }
  const origin = `http://127.0.0.1:${Number(port)}`;
  const url = new URL(path, origin);
  if (url.origin !== new URL(origin).origin || url.username || url.password) {
    throw new ValidationError(
      "The validation page must use the specified loopback application.",
    );
  }
  await openBrowser(url, await signIn(prefix));
} catch (error) {
  console.error(
    error instanceof ValidationError
      ? error.message
      : "Local validation could not start or clean up. Check Chrome and network access.",
  );
  process.exitCode = 1;
}
