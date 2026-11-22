---
name: github-pr
description: Create or update MyClinics pull requests with GitHub CLI, preserving review history and verifying inline screenshot attachments. Use for authorized PR delivery or edits, not independent review or merging.
---

# GitHub PR delivery

Use the assigned repository, branch and approved scope. Existing assignment
authorization is sufficient; this skill grants no additional permission to publish,
commit or push. Follow the project's workflow for ownership and validation. Never merge.

## Prepare and write

- Confirm repository, branch, base and head with Git and `gh repo view`. Inspect
  `gh pr view <branch> --json number,url,body,baseRefName,headRefName,headRefOid`
  before creating anything. If lookup fails, distinguish absence from access or
  network failure. Use `gh pr list --state all --head <branch>` when needed.
- Check `gh --version` and command help for `--attach` support. Do not substitute
  source commits as media hosting when uploads are unavailable; report the limitation.
- Write the description to a temporary UTF-8 file using literal multiline text
  (a single-quoted PowerShell here-string avoids interpolation). Preserve real
  newlines, Markdown backticks and `$` characters; do not interpolate shell code
  or pass JSON-escaped text as a shell body.
- Explain resulting behavior, scope, task link, acceptance coverage, base/head,
  actual check commands/results and material limitations. Mark blocked work as
  draft. For visual work, use a `Visual evidence` section with capture metadata
  from `chrome-screenshots`; otherwise state why visual evidence does not apply.
- For edits, first save the current body. Preserve review history, prior findings
  and existing attachment URLs. Refresh affected evidence after visual changes,
  labeling superseded captures rather than erasing history.

## Publish and attach

Use explicit arguments, replacing placeholders with confirmed values:

```powershell
gh pr create --base develop --head <branch> --title <title> --body-file <body-file>
gh pr edit <number> --body-file <body-file>
```

Add `--draft` to creation when blocked. For screenshots, include local Markdown
image references in the body and repeat `--attach <image-path>` for each image.
The CLI replaces matching local references with uploaded URLs; paths in a body
file resolve from its directory, then the working directory. Prefer absolute
attachment paths. `--attach '<image-path>#<alt text>'` supplies alt text when
there is no existing image reference. Editing with attachments and no body flag
appends to the existing body. No attachment is required for a text-only change.

**A nonzero exit can still leave a created or updated PR after partial upload
failure.** Inspect the printed URL and saved PR before retrying. Reconcile the
persisted body and upload only missing assets; never blindly repeat creation.
If access prevents determining the saved state, stop mutations and report the
uncertainty to the coordinator.

## Verify and hand off

Read the saved PR using `gh pr view <number> --json url,body,baseRefName,headRefName,headRefOid`.
Confirm target/head, literal Markdown and inline asset URLs, with no unresolved
local paths or temporary session URLs. Retrieve each new attachment with an
authorized HTTP client; confirm successful image content, dimensions and visual
agreement with the local capture. A status code or HTML login page alone is not
image verification. Inspect rendered PR images when browser access is available,
and disclose when rendering could not be checked.

Keep capture metadata and verified URLs in the PR, not a separate `docs/evidence`
report. After verification, remove only this task's temporary captures, body files,
profiles and fixtures; preserve historical evidence and supplied design references.
Return PR URL, base/head, changed files, coverage, checks, evidence and limitations
to the coordinator. Do not claim readiness while required validation is missing.

Sources: [attachments](https://docs.github.com/en/github-cli/github-cli/attaching-files-with-github-cli),
[create](https://cli.github.com/manual/gh_pr_create),
[edit](https://cli.github.com/manual/gh_pr_edit).
