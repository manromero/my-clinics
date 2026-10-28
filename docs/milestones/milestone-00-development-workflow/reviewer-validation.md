# Reviewer configuration validation

Date: 2026-10-28. Assignment: [Task 02](<task 02 - configure reviewer.md>).
Branch: `feature/configure-reviewer`.
Base and implementation-start head: `b1c474d14758afcf1565304dde1afdc234e3ed7c`.
Implementation is an uncommitted working-tree change until coordinator delivery;
local checks below must not be represented as checks of a new committed head.

## Configuration and boundaries

The project-scoped definition is [`.codex/agents/reviewer.toml`](../../../.codex/agents/reviewer.toml).
The implementer's sandbox rejected writes to that path, so it staged the exact
candidate with the fixtures. After the implementer stopped editing, the coordinator
installed that candidate through an explicitly approved escalated copy and verified
identical SHA-256 hashes. The temporary duplicate was removed after installation.

The candidate uses native `name`, `description` and `developer_instructions` fields
with no model, reasoning, tool or permission overrides. No global settings are
changed. No-edit review instructions are a role boundary, not separate sandbox
isolation. The coordinator starts fresh native implementer/reviewer agents with
selected context per task and reuses those agents for that task's correction and
review rounds.

The reviewer receives approved criteria, base/head, references and evidence from
the coordinator; independently covers code, functionality and applicable visual
quality; classifies concrete blockers separately from optional suggestions; and
returns findings without edits, merging, scope assignment or correction dispatch.
After round 2 it reports remaining blockers without requesting automatic round 3.

## Local checks

Implementation checks ran on 2026-10-28 with pnpm `11.25.0` and Node.js `v24.14.0`.
The coordinator subsequently installed the definition with approval and verified
native discovery and actual role behavior as recorded below. Neither file
existence nor TOML parsing alone was treated as proof of native loading.

| Check                                                   | Actual result              | Evidence/state                                                              |
| ------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------- |
| `pnpm lint`                                             | Passed, exit `0`           | ESLint, including fixture JavaScript                                        |
| Owned-file Prettier command below                       | Passed, exit `0`           | Eight owned Markdown/JavaScript files                                       |
| `pnpm format:check`                                     | Failed, exit `1`           | Seven unowned files listed below; preserved                                 |
| Local documentation links/anchors                       | Passed, exit `0`           | Python path/heading check of owned Markdown files                           |
| Reviewer TOML structure                                 | Passed, exit `0`           | Bundled Python `tomllib` parsed candidate and checked exact required fields |
| `node validation-fixtures/reviewer/check.mjs initial`   | Expected failure, exit `1` | `2/6` cases pass; four equality-boundary cases fail                         |
| `node validation-fixtures/reviewer/check.mjs corrected` | Passed, exit `0`           | `6/6` cases pass, including input non-mutation                              |
| `git diff --check`                                      | Passed, exit `0`           | Working-tree tracked diff                                                   |

Owned-file formatting command:

```powershell
pnpm exec prettier --check README.md docs/agents/coordinator.md docs/development-workflow.md docs/milestones/milestone-00-development-workflow/reviewer-validation.md validation-fixtures/reviewer/README.md validation-fixtures/reviewer/check.mjs validation-fixtures/reviewer/initial.mjs validation-fixtures/reviewer/corrected.mjs
```

The repository-wide formatting check reported only
`docs/milestones/milestone-00-development-workflow/readme.md`,
`docs/milestones/readme.md`, `docs/screens/alexandria/DESIGN.md`, and the `code.html`
files under `docs/screens/s01_iniciar_sesi_n`, `s02_gesti_n_de_cl_nicas`,
`s03_actividad_mensual` and `s04_resumen_mensual`. These files are outside this
implementer's ownership. The first two include coordinator-owned tracking edits;
no claim is made that the global formatting check passed.

After coordinator-owned tracking was formatted, changed-file Prettier passed.
The final repository-wide check still exits `1` for the five unchanged visual
reference files above (Alexandria `DESIGN.md` and four `code.html` files). These
are baseline formatting findings, not introduced by this assignment. ESLint was
rerun successfully, and the installed native TOML was parsed successfully with the
same required-field checks using the bundled Python. No dependency was installed.

The default `python -c` TOML check could not run because Python `3.9.5` has no
`tomllib` and no installed TOML parser. It was rerun successfully with the existing
bundled Python, without installing dependencies:

```powershell
& "$env:USERPROFILE/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe" -c "import pathlib,tomllib; p=pathlib.Path('validation-fixtures/reviewer/reviewer.toml'); d=tomllib.loads(p.read_text(encoding='utf-8')); assert set(d)=={'name','description','developer_instructions'}; assert d['name']=='reviewer'; assert all(isinstance(v,str) and v.strip() for v in d.values()); print('PASS TOML parse, required native fields only, no setting or capability overrides')"
```

The local link check used a PowerShell here-string piped to `python -`, reading the
five owned Markdown files from the formatting command. It checked existence of
relative link targets and heading anchors, skipping external URLs. This verifies
local targets only; it does not claim external-link availability.

The exact candidate SHA-256 is
`EFDF7BF517BAE2BED608E835BF28796F525981FB287E5170DBE2336C06C19177`.
Native-path creation was rejected by `apply_patch` with
`writing outside of the project; rejected by user approval settings`.
The coordinator then resolved the restriction through the approval mechanism and
installed the exact candidate. No permission bypass or global setting change was
used. Native loading is assessed separately below.

Application typecheck/build and browser desktop/mobile inspection are not
applicable: this assignment changes role configuration, documentation and isolated
JavaScript exercise artifacts, with no application, dependency, UI or Next.js API
changes. The deterministic fixture provides functional evidence, not native agent
behavior evidence or Task 03's full workflow exercise.

## Native runtime verification

Use the [fixture task and scenarios](../../../validation-fixtures/reviewer/README.md).
The coordinator ran fresh `codex -C <repository> -c features.apps=false debug prompt-input`
and found the exact native reviewer description. It then used a normal persisted
`codex -C <repository> -c features.apps=false -a never exec --sandbox read-only --json`
session to launch exactly one native reviewer and reuse it sequentially.
The validation parent session is `01a1835a-c26d-7703-b6ca-7d0192a7dd10`.
Reviewer thread: `01a1835b-826b-78f3-baa5-2a7fce1f0952`, target
`/root/task02_native_reviewer`. Native selection used `agent_type="reviewer"`
and `fork_turns="none"`; spawn receipt `call_837c683ebf874236984ee75da56356ee`
and three sequential follow-up receipts are preserved in that parent session.
Native session metadata confirmed `agent_role: reviewer` and the parent/child link;
the agent quoted its loaded two-round stopping instruction beyond the description.

The reviewer independently ran both fixture commands. Missing-evidence and round-2
decisions were explicit simulations; switching prewritten artifacts was not an
actual implementation correction round. All artifacts were explicitly identified
as uncommitted working-tree changes over the base above. No private prompt dump
or user-wide configuration is included in this evidence.

| Scenario                             | Expected result                                   | Actual result/evidence                                                                                  |
| ------------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Native discovery and launch          | Native role with loaded instructions              | Exact role selected; native metadata and distinctive instruction confirmed                              |
| Initial fixture                      | Concrete blocker and separate optional suggestion | Independently reproduced exit 1, 2/6 passing; equality blocker at initial.mjs line 3; JSDoc optional    |
| Corrected fixture recheck            | Independently verify correction                   | Same reviewer ran corrected check, exit 0, 6/6 passing; blocker fixed and verified; suggestion optional |
| Review perspectives                  | Cover applicable perspectives and explain N/A     | Code and functionality checked; visual N/A explained because no rendered UI exists                      |
| Missing required evidence simulation | No invented pass                                  | Review incomplete; unavailable required evidence prevents a clean result                                |
| Round-2 blocker simulation           | No automatic third correction                     | Blocked handoff to coordinator; no edits, budget reset, or automatic round 3                            |

Independent final configuration review and PR delivery follow this runtime test.
Human acceptance remains in GitHub. Full implementation/PR/visual exercise and
manual merge remain Task 03.

## Runtime limitations

The implementation run emitted external-app MCP handshake warnings. Runtime
validation disabled apps only for its invocation, leaving shell verification
available and changing no stored settings. It does not validate external apps.
An initial attempt to additionally disable a nonexistent MCP server table failed
with `invalid transport` before discovery/tests ran; the corrected invocation used
only the supported apps feature setting and succeeded. Persisted sessions were
used because Task 01 had exposed an ephemeral native-spawn limitation.

Reference: [official Codex custom-agent configuration](https://learn.chatgpt.com/docs/agent-configuration/subagents).
