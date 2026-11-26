# Private template setup and operation

Use one private bucket: `clinic-templates`, MIME `application/pdf`, maximum
10,000,000 bytes. The [decision](template-storage-decision.md) defines the lifecycle.
Clinic form integration remains task 04. Generated invoices are never stored.

## Setup

The final migration is `20261126230000_private_templates.sql`. On a fresh approved
six-migration baseline, verify project identity/history and preservation first,
then disable and read back the Data API before migration. Follow the
[manual migration procedure](../../supabase.md#5-manual-migration-application).
Review a dry run containing only the final template migration, no seeds or roles.
CLI 3.0.0 trusts the operating-system CA store with `NODE_USE_SYSTEM_CA=1`; never
turn off TLS verification. A command-specific consent flag requires exact user
scope and independent procedure acceptance; never use a global consent setting.

After grants/RLS are verified, configure and inspect the bucket with the reviewed
exact-target authorization marker:

```powershell
$templateRef='lvqbrjybwstvdhaxyxyn'
$env:MYCLINICS_TEMPLATE_CONFIG_AUTHORIZATION=$templateRef
node --conditions=react-server --use-system-ca --env-file=.env.database-validation scripts/template-storage-operator.mjs configure $templateRef
node --conditions=react-server --use-system-ca --env-file=.env.database-validation scripts/template-storage-operator.mjs inspect $templateRef
```

Supply `SUPABASE_TEMPLATE_SECRET_KEY` only to the server environment or ignored
`.env.local`. Never use `NEXT_PUBLIC_*` or Next.js `env` for it. Verify the public
URL/key and private key name the same project. Restart the approved local server.
Restore the recorded Data API setting only after permission checks. No Vercel
or production deployment is authorized by this development procedure.

## Server contract

`createTemplateServer(session.client)` verifies the owner for every operation:

1. `begin`: reserve clinic fields, revision, UUID, exact file size and SHA-256.
   `keep`/`replace`/`remove` are supported. Retry with the same identity/payload.
2. For replacement, call ordinary SDK `uploadToSignedUrl` with the returned path
   and capability in `clinic-templates`. No overwrite. Keep the capability in
   memory; do not log or persist it. Interrupted uploads may require a whole-file
   retry. After an uncertain reply, validation determines whether bytes arrived.
3. `validate`: validate the actual stored object. No second upload/copy occurs.
4. `commit`: atomically save fields and association. `PT409` means a competing
   edit won; reload before a new save identity. An uncertain reply requires
   `outcome` with the same UUID. Cleanup errors do not reverse a successful Save.
5. `cancel`: preserve the saved pair and automatically delete unused bytes.

Only the current association is readable at
`/api/clinic-templates/<clinicId>/<templateId>`. This is a production API, not a
sample route. It returns private/no-store PDF bytes; anonymous requests return
401 and foreign/stale associations return 404. Previously downloaded bytes and
already authorized streams cannot be recalled.

Cancel and invalid validation delete their own upload. Replacement/removal delete
only the previous object after the clinic transaction succeeds. Two bounded
attempts run immediately; `cleanupPending` indicates that the saved operation
succeeded but its deletion still needs retry. Repeat that same operation identity
to retry only its affected object. There is no scan, collector, scheduled job or
manual daily command. An abandoned upload or late-arriving file may remain private
indefinitely unless that specific operation is retried. Signed capabilities last
two hours and cannot be revoked individually. Outcomes remain for safe retries.

## Existing development reconciliation — review required before execution

The user explicitly instructed removal of this task's erroneous two-bucket
migration, including reconciliation of its already applied development state.
This is an exception only for `20261126160000`, not permission to rewrite other
migration history. The PR therefore contains one correct final template migration.
No revised shared-development change is executed by these repository edits.

The exact proposed reconciliation is limited to `my-clinics_dev`, ref
`lvqbrjybwstvdhaxyxyn`, organization `njnmfutclorywskqrftd`. Production ref
`xihkrkgrhupiwcsfjctp` is excluded. Before any write, require:

- Healthy exact identity; seven history records comprising the six versions
  through `20261114120000` plus erroneous `20261126160000`, and no other drift.
- Zero current template links; the 14 clinics, 63 activity rows and seven Auth
  owner IDs match the recorded preservation baseline. Existing revisions equal one.
- Only the four known synthetic objects across `clinic-template-quarantine` and
  `clinic-template-sealed`: request IDs `3383f441-a571-4d2b-a3c3-39bde0f88869`
  (10,000,000 bytes per bucket) and `7cfcda0c-f236-4a12-9929-fb0d70370402`
  (10,000 bytes per bucket). The four known terminal request/outcome rows and
  their payload identities must match; stop for any additional template data.

After independent acceptance of the concrete procedure and exact hosted scope:

1. Stop the local template server; disable and verify Data API exposure.
2. Delete only those enumerated objects through Storage API and confirm listing
   absence. Delete the two old buckets only after verifying they are empty.
3. In one reviewed SQL transaction, recheck the guards; remove only this task's
   Storage policy, template routines/triggers, `clinic_templates` and
   `template_save_requests`, and the added `clinics.template_revision` column.
   Remove only history version `20261126160000`. No CASCADE, reset, seed,
   unrestricted history repair or change to the six previous migration records.
4. Recheck preserved clinic/activity/owner data, then native dry-run/apply the
   single final migration. Verify desired schema, service-only RPCs, metadata RLS
   and absence of ordinary Storage policies before configuring the new bucket.
5. Verify ordinary two-account 10 MB Save/Cancel/retry/replace/remove, current
   private production reads, affected-file deletion/retry and preservation. Restore/read
   back the original Data API state. Record results and remaining limitations.

If a guard fails, stop and preserve existing objects/data for a revised review.
The actual transaction and native apply commands must be independently reviewed
before execution; this scope description is not an applied rollback.

## Validation

`pnpm db:types` and `pnpm db:validate` use authorized disposable projects, not shared
development. They check generated types, SQL roles, replay/upgrade/parity and
ordinary SDK lifecycle operations. `pnpm db:test-tooling`, application checks and
production build remain required. No new test endpoints, Edge Functions, cron,
queues or background scheduler are needed. No deployed Vercel or physical mobile
network behavior is inferred from local production checks.
