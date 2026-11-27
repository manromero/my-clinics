# Private clinic templates

Templates use one private `clinic-templates` bucket and one stored PDF per upload.
There is no temporary bucket, duplicate copy, collector or daily maintenance task.
The [storage decision](template-storage-decision.md) records the final contract.
Clinic-form integration remains task 04; generated invoices are never stored.

## Configured development

Verified on 2026-11-27 against `my-clinics_dev`, ref `lvqbrjybwstvdhaxyxyn`,
organization `njnmfutclorywskqrftd`:

- The six original migrations plus `20261126230000_private_templates.sql` are
  applied. The erroneous template migration was removed and its development
  infrastructure/history corrected under the user's explicit instruction.
- Only `clinic-templates` exists: private, `application/pdf`, maximum **10,000,000
  bytes**. Both former buckets and their four synthetic objects were deleted.
- Existing 14 clinics, 63 activity rows and seven Auth owner IDs match their
  pre-correction digests. Existing clinic revisions remain one.
- RLS, eight service-only template RPCs and absence of ordinary Storage policies
  were verified before restoring the Data API to its original `public` setting.
- Both ordinary fixture accounts passed Save/Cancel/retry/invalid/replace/remove
  and production PDF-read checks, including a real 10 MB standard upload. The two
  new fixture clinics and all affected files were removed: **zero template links
  and zero stored objects remain**. Small request/outcome records remain for retries.
- Project status is `ACTIVE_HEALTHY`. The local server secret is aligned with the
  public URL/key and stored only in ignored `.env.local`. Production and Vercel
  configuration/deployment were not changed.

## Setup for an approved environment

Follow the [manual migration procedure](../../supabase.md#5-manual-migration-application):
verify the explicit target, history and preservation baseline; disable/read back
Data API exposure; review the native dry run; apply only the reviewed migration;
verify grants/RLS before restoring the recorded exposure. CLI 3.0.0 uses
`NODE_USE_SYSTEM_CA=1` for trusted OS certificates. Never disable TLS verification,
reset the database, seed or change unrelated migration history.

Configure and inspect the one bucket after exact-target authorization:

```powershell
$templateRef='lvqbrjybwstvdhaxyxyn'
$env:MYCLINICS_TEMPLATE_CONFIG_AUTHORIZATION=$templateRef
node --conditions=react-server --use-system-ca --env-file=.env.database-validation scripts/template-storage-operator.mjs configure $templateRef
node --conditions=react-server --use-system-ca --env-file=.env.database-validation scripts/template-storage-operator.mjs inspect $templateRef
```

Supply `SUPABASE_TEMPLATE_SECRET_KEY` only in the server environment or ignored
`.env.local`, never `NEXT_PUBLIC_*` or Next.js `env`. Verify the public URL/key and
private key name the same project, then restart the approved server. Production
`xihkrkgrhupiwcsfjctp` is outside this development procedure.

## Server usage

`createTemplateServer(session.client)` verifies the owner for every operation.
The future clinic form keeps the file local until Save:

1. `begin`: reserve fields, clinic revision, request UUID, exact file size and
   SHA-256. `keep`/`replace`/`remove` preserve no-template and inactive clinics.
2. For replacement, use SDK `uploadToSignedUrl` with the returned path/capability
   in `clinic-templates`. No account/service token is returned to the browser.
   Keep the capability in memory; never log or persist it. Do not overwrite.
3. `validate`: validate those same stored bytes as a readable, unencrypted PDF
   with the five required text fields. No second upload or copy occurs.
4. `commit`: atomically save clinic fields and association. `PT409` means another
   edit won. For an uncertain reply, use `outcome` or repeat `commit` with the same
   UUID. `cleanupPending` means Save succeeded but its affected-file deletion
   needs retry; repeating that operation retries only that deletion.
5. `cancel`: preserve the saved pair and delete that request's unused upload.
   Cancel after a completed Save returns its saved outcome rather than undoing it.

Replacement associates the new PDF before deleting the old one; removal unlinks
and deletes that template. Deletion makes two bounded immediate attempts. No
operation scans unrelated files. Request outcomes remain for idempotent retries.

The production route `/api/clinic-templates/<clinicId>/<templateId>` verifies the
current owner/association and streams `private, no-store` bytes. Anonymous requests
return 401 and foreign/stale associations return 404. It is not a test endpoint.

## Limits and verification

An interrupted upload may require a whole-file retry. Signed upload capabilities
last two hours and cannot be revoked individually. Abandoned uploads, failed
deletions or late-arriving files may remain private indefinitely without retrying
that specific operation. No idle cleanup deadline is promised. Downloaded bytes
and already authorized streams cannot be recalled.

`pnpm db:types`, `pnpm db:validate` and `pnpm db:test-tooling` provide disposable
replay/types/parity/upgrade and ordinary SDK lifecycle checks. Application checks,
389 tests and the production build passed; 13 ordinary shared-development checks
also passed after the correction. No test pages, scheduled services, Edge Functions
or screenshots are involved. Deployed Vercel runtime and physical mobile-network
behavior are not inferred from local production verification.
