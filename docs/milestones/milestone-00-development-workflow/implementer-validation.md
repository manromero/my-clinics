# Implementer configuration validation

Date: 2026-10-28. Assignment: [Task 01](<task 01 - configure implementer.md>).
Base: `b341abf9e86c186f5cd5c751cc169418c7ca97a6`.
Environment: Windows, Codex CLI `0.165.0-alpha.1.2`, repository working directory.

## Configuration and discovery

The project-scoped native definition is
[`.codex/agents/implementer.toml`](../../../.codex/agents/implementer.toml).
It defines `name`, `description`, and `developer_instructions`. Model, reasoning,
permissions, provider, and tools inherit from the parent; no personal/global
settings were changed. The coordinator selects the `implementer` role by name.

A fresh `codex -C <repository> debug prompt-input` invocation completed with exit
code 0. Its JSON was parsed in memory and checked without exposing private prompt
content. The native agent name and exact custom description were present. The
implementer's developer-instruction marker was absent from the primary context,
as expected: those instructions belong to the delegated role, not the coordinator.

## Native read-only role exercise

The first attempt used
`codex -C <repository> -a never exec --ephemeral --sandbox read-only --json`.
The primary agent selected the native configured `implementer`, but launching it
failed with `no rollout found for thread id`. The test explicitly reported failure
and did not substitute a generic agent or claim successful behavior validation.
Its process exit code 0 alone was not treated as a passing test.

Retried the same bounded assignment with a normal CLI session:
`codex -C <repository> -a never exec --sandbox read-only --json`.
This completed with exit code 0, produced `collab_tool_call` events, and reported
exactly one launched agent with configured type `implementer`. The agent identified
a distinctive developer instruction beyond its short description: coordinate
tracking-file edits rather than changing them silently.

The assignment prohibited edits, branch changes, Git/network commands, commits,
PR creation, and further delegation by the implementer. It required waiting for
the native role's result and reporting failure if native selection was unavailable.
Observed answers matched the role contract:

| Scenario                                | Observed decision                                                                                              | Result           |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------- |
| Prepared task and branch                | Confirm coordinator context and use the assigned branch rather than create another                             | Matches contract |
| Missing product behavior                | Return the missing decision to the coordinator rather than invent behavior                                     | Matches contract |
| Unavailable required check              | Report it accurately and do not claim readiness without required validation                                    | Matches contract |
| Round-2 blocker and optional suggestion | Fix the assigned blocker, collect the optional suggestion for human review, and do not start round 3           | Matches contract |
| Correction handoff                      | Return new head, finding responses, and verification to coordinator; PR base `develop`, no merge/self-approval | Matches contract |

The role reported read-only document access and no prohibited actions. These are
runtime role-loading and simulated intake/handoff results, not implementation of
product behavior or execution of the hypothetical checks, corrections, or PR.

## Checks and limitations

- Native CLI discovery and actual custom-role launch validate the TOML's supported
  schema and role selection in the installed client.
- The ephemeral launch failed; the normal persisted CLI run succeeded. Use a normal
  session for this client's native delegation validation. The evidence does not
  establish that every client/version has the same ephemeral behavior.
- CLI runs emitted `codex_apps` MCP transport/handshake errors. The successful
  run continued, but this test does not validate external apps or those tools.
- CLI validation required execution outside the outer command sandbox for runtime
  access; the behavioral test itself used Codex's read-only sandbox.
- Formatting, local links/anchors, and `git diff --check` apply to the changed
  documentation. Final delivery results are recorded in Task 01 and its PR.
- No application code or UI changed, so application builds and browser visual
  comparison are not applicable. Native reviewer setup remains Task 02; actual
  end-to-end implementation, corrections, PR delivery, and manual merge remain
  the representative workflow exercise in Task 03.
- A running desktop session may need a fresh run to discover new custom roles.
  If the active tool surface cannot select this configured role, report that
  limitation instead of representing a generic worker as native role loading.

Reference: [official Codex custom-agent configuration](https://learn.chatgpt.com/docs/agent-configuration/subagents).
