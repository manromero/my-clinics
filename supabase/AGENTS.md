# Database agent instructions

Read [the setup guide](README.md) before database changes. Use the pinned
`pnpm supabase` CLI. All databases are hosted; do not start Docker, local Supabase,
local PostgreSQL, or a shadow database on this workstation.

- `schemas/*.sql`: desired application schema, edited first, in lexical order.
- `migrations/<timestamp>_<name>.sql`: reviewed, append-only change history.
  CLI 3.0.0 declarative `sync` is local-only; author SQL manually until a separately
  verified remote-only generation method is approved. Never imply generation ran.
- `seed.sql`: deterministic synthetic data only; currently empty and disabled.
- `tests/`: future database validation SQL, implemented in Task 04.
- Repository-root `src/lib/supabase/database.types.ts`: reserved type location for
  Task 04; do not hand-author types or create an empty placeholder now.

Review schema and migration changes together. Do not edit applied migrations,
change schema through Studio, import real data, or add business entities outside
an assigned task. Record drift and reconcile with reviewed SQL rather than silently
repairing migration history. Task 04 establishes executable parity/replay/upgrade
checks on separately authorized disposable hosted databases or branches.

Every remote command names an explicit verified project ref. Linking a checkout
is not approval to change that project. Keep Data API disabled before Task 09's
security gate; config.toml does not configure the hosted project by itself.
Read-only inspection and migration application are separate steps. Remote reset,
seed, repair, config push and destructive SQL require explicit target/scope approval;
never use them as routine recovery. Do not use global `--yes` to bypass review.
Never print credentials, pass them in chat, commit them or expose them through
`NEXT_PUBLIC_*` / Next.js config. Follow the manual procedure in the setup guide.
