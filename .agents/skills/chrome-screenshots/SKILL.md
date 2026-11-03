---
name: chrome-screenshots
description: Capture and inspect desktop and mobile visual evidence with Google Chrome headless. Use for MyClinics implementation or independent review screenshots, with viewport and source attribution; static captures do not verify interactions.
---

# Chrome screenshots

Capture the running result against the task's Alexandria/Stitch references. Keep
the task's visual criteria and required states; screenshots supplement live
interaction checks. Use `github-pr` only when assigned to publish evidence.

## Prepare

- Confirm the target URL, running server and representative screen/state. Record
  `git rev-parse HEAD` and `git status --short`; identify relevant uncommitted
  changes instead of attributing a dirty capture solely to a commit.
- Locate Google Chrome. On this Windows installation the usual executable is
  `C:/Program Files/Google/Chrome/Application/chrome.exe`; verify it exists rather
  than assuming that path is portable. Do not use the user's normal browser profile.
- Create a unique temporary directory outside the repository for PNGs, an isolated
  `--user-data-dir`, logs and any fixtures. Never commit new delivery screenshots
  or use source commits as hosting. Preserve supplied references and old evidence.

## Capture and inspect

Use Chrome headless with explicit output and window size. A PowerShell example
using previously resolved absolute paths and URL:

```powershell
& $chromePath --headless --no-first-run --no-default-browser-check --hide-scrollbars "--user-data-dir=$profilePath" --force-device-scale-factor=1 --window-size=1440,900 --virtual-time-budget=5000 "--screenshot=$imagePath" $targetUrl
```

Wait for this invocation to finish and verify its output, rather than assuming
process launch means completion. Poll the server before capture. A virtual-time
budget allows rendering time but does not prove readiness: inspect the PNG for
the intended page, loaded fonts/assets and completed state, excluding loading,
error or blank frames unless those are the assigned subject. For asynchronous
screens or focus/error/pending states, use available browser automation to wait
for concrete readiness and establish the state, then capture that same session.
A fresh CLI navigation does not preserve another browser's interactive state.

Capture each changed screen on desktop and inspect mobile; capture mobile when
responsive presentation applies or the task requires it (for example 390 Ã— 844).
A narrow window alone is not touch/device emulation. Use appropriate emulation
when testing device-specific behavior and record what was actually configured.

Measure the actual CSS viewport (`window.innerWidth`, `window.innerHeight`,
`devicePixelRatio`) through available automation, or a temporary instrumented
fixture for a smoke test. `--window-size` is a request, not proof of the viewport.
Read the PNG's pixel dimensions separately. Chrome may enforce a minimum CSS
window width: a tested `--window-size=390,844` capture had a 390 × 844 PNG but a
500 × 844 viewport. For a true narrow viewport, use the tested
[DevTools override procedure](references/narrow-viewport.md). If viewport measurement is unavailable,
label it unverified; never infer it solely from image dimensions. Open the actual
PNG with an image viewer and compare the result with applicable references at
each size. A file existing or a successful exit is insufficient visual validation.

## Record and clean up

Record route, state, capture time, capturer, Chrome version, requested window size,
measured viewport/DPR, image dimensions, source commit and relevant dirty changes.
Distinguish who inspected images from who performed live interactions; disclose
unavailable tools and checks. Static headless captures alone do not prove keyboard,
focus transitions, validation, responsive interaction or accessibility behavior.
Refresh affected captures after corrections.

Return temporary paths and metadata to the authorized publisher. Retain delivery
captures until the saved PR's inline attachments and retrieval are verified using
`github-pr`; review-only or local smoke-test outputs can be removed after inspection
and recording results. Keep detailed delivery metadata with the attachment URLs in
the PR rather than separate evidence reports. Verify resolved cleanup paths belong
to this task's temporary directory, stop only its Chrome processes if needed, and
remove only those temporary files/profiles. Do not delete historical evidence.

Source: [Chrome Headless](https://developer.chrome.com/docs/automation-and-testing/headless).
Check installed Chrome behavior for CLI flags; the overview is not a complete flag reference.
