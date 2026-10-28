# Coordinator configuration validation

Date: 2026-10-28. Assignment: [Task 04](<task 04 - configure coordinator.md>).
Base: `d995bd57737b93db071ec9fe52ebea6553f607c1` (`origin/develop` at branch creation).
Environment: Windows, Codex CLI `0.165.0-alpha.1.2`, repository working directory.

## Instruction discovery

Ran `codex -C <repository> debug prompt-input` in a fresh CLI invocation, parsed
its JSON in memory, and checked three markers without exposing the raw prompt:

| Marker                                    | Result  |
| ----------------------------------------- | ------- |
| Repository `AGENTS.md` content            | Present |
| Primary-agent coordinator activation      | Present |
| Reference to `docs/agents/coordinator.md` | Present |

This proves entry-instruction discovery. The role file is read on instruction;
it is not automatically injected as a native custom subagent definition.

## Read-only behavior exercise

Ran a fresh `codex -C <repository> -a never exec --ephemeral --sandbox read-only --json`
invocation. The test requested the repository's coordinator routing, role source,
four scenario decisions, and responsibility mapping. It explicitly prohibited
file edits, network commands, branch/PR creation, and subagent spawning.

The invocation completed with exit code 0. Its response identified the coordinator,
repository `AGENTS.md`, the coordinator role, and the workflow contract as read.
The returned decisions were checked against the approved contract:

| Scenario                                          | Observed decision                                                                                                 | Result           |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------- |
| Ready, approved assignment                        | Check readiness, preserve work, update `develop`, prepare branch/context and tracking, then delegate sequentially | Matches contract |
| Missing product decision                          | Ask user and record blocker; no implementation branch or implementer dispatch                                     | Matches contract |
| Optional improvement only, required checks passed | Record suggestion and deliver ready for human review; no scope expansion or correction round                      | Matches contract |
| Blocker after correction round 2                  | Deliver blocked PR/evidence and request direction; no third round or reset                                        | Matches contract |

The response correctly assigned branch setup, coordination, tracking, and delivery
to the coordinator; implementation, checks, publication, and PR creation to the
implementer; independent review to the reviewer; and manual merge to the user.
These are simulated decisions, not execution of the described Git/PR actions.

## Independent bootstrap review

A separate reviewer subagent inspected the configuration/documentation diff
against `origin/develop` without editing files. It found no blocking content
issues, confirmed role separation, two-round handling, optional finding treatment,
loading semantics, and dependency order. It independently verified 51 local link
targets and `git diff --check`. It assessed all four scenarios as covered while
explicitly distinguishing desk review from runtime evidence.

Its optional wording suggestion about Task 01/02 dependency preconditions is
retained for final human PR review. It does not block configuration or consume
a correction round. Bootstrap review is not proof of native implementer/reviewer
configuration. No correction rounds were required.

## Checks and limitations

- Prettier formatting and local-link/heading-anchor checks apply to the changed
  Markdown files. Record final command results in Task 04 and the PR.
- `git diff --check` passed during the configuration review.
- Product functionality and visual review are not applicable: no application code
  or UI was changed. Functional evidence is instruction discovery and scenario
  behavior, with no browser comparison needed.
- The read-only CLI run emitted `codex_apps` MCP handshake warnings and continued
  successfully. This test does not validate that integration or external app tools.
- CLI verification required execution outside the outer command sandbox to access
  Codex runtime files; the behavior exercise itself used Codex's read-only sandbox.
- Native delegated role loading, actual assignment delegation, live correction
  rounds, end-to-end PR delivery, and manual merge remain Tasks 01–03. The fresh
  CLI does not prove that an already-running desktop chat reloads its instructions.

## Sources and implementation choice

The user approved the three-role split before configuration. The primary role
uses repository guidance, while delegated custom roles remain project-scoped
configuration work. This follows official [instruction discovery guidance](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
and [subagent configuration](https://learn.chatgpt.com/docs/agent-configuration/subagents).
No personal model settings, sandbox preferences, or credentials were changed.
