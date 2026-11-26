# Private template infrastructure operations

This implements the independently accepted [decision](template-storage-decision.md).
It provides infrastructure for tasks 03–06; clinic forms are not wired here.
Generated invoices are never stored. Persistent development rollout is **not yet
authorized or executed**. Obtain approval for the exact target, reviewed commit,
migration, bucket configuration, server secret, and daily cleanup before applying
the steps below. Disposable validation is separately authorized.

## Runtime contract

`src/lib/templates/infrastructure.ts` exports server-only helpers. Pass the verified
session's Supabase client and a separate private service client; the production
factory is `createTemplateServer(session.client)`. Each owner operation calls
`auth.getUser()` afresh. Never pass an owner ID, object path, or validation boolean
from a browser. The service RPCs are executable only by `service_role`; ordinary
clients cannot attest bytes, publish links, or mutate metadata.

1. Keep the file local until Save. Hash its exact bytes with SHA-256 and reserve
   using `begin`: random request UUID, clinic ID/revision as strings (both null
   for creation), clinic fields, mode `keep`/`replace`/`remove`, and optional display
   filename. Replacement additionally requires byte count and hash. New clinics
   must start active; inactive existing clinics accept templates. A request UUID
   binds the entire payload; retries with another payload fail with `22023`.
2. Upload using the **file-scoped signed TUS capability** in `begin.uploadGrant`:
   `transport: "signed-tus"`, `endpoint`, `token`, and `expiresAt`. The server
   verifies the owner, reserves the exact request path, and calls Storage's
   `createSignedUploadUrl` with `upsert: false`. It never returns an account access
   token, refresh token, or service credential. Existing SSR cookies stay HttpOnly.
   Hold the capability only in memory; discard after upload/cancel/sign-out and
   never cache, log or persist it.

   POST to the returned `/storage/v1/upload/resumable/sign` endpoint. Send the
   project's **public** API key in `apikey`, the capability token in `x-signature`,
   and `Tus-Resumable: 1.0.0`. Do not send account `Authorization` or cookies.
   Use 6,291,456-byte chunks, no upsert, the exact returned `uploadPath` and
   quarantine bucket in TUS metadata. Keep `x-signature` and the public API key on
   PATCH/HEAD requests to the returned signed Location. Recover its offset with
   HEAD on retry; 409 never authorizes overwriting an existing object. After an
   uncertain completed upload, let server validation verify the request-bound
   hash/size rather than replacing the object or starting another save identity.

   The base `/upload/resumable` route uses account JWT/RLS authorization and does
   **not** select the signed handler merely because `x-signature` is present.
   The explicit `/sign` route is required. This distinction is verified against
   current official source and actual hosted transfer, not assumed from the
   abbreviated guide example. See the decision report's B1 correction section.

   A capability lasts two hours and permits uploading only its exact bucket/path.
   The server refuses to mint or renew a capability after reservation expiry,
   checking the deadline both before and after signing. An expired request needs
   a new save identity; it cannot extend the cleanup horizon by reminting tokens.
   It is transferable within that scope and cannot be revoked individually.
   Cancel blocks validation/publication, while an issued capability or in-flight
   upload can still finish into unreadable quarantine. No account API authority
   is conferred. The reservation
   predicate enforces the exact owner/request path, pending state, and expiry.
   The original filename never determines a path. Quarantine is unreadable even
   by the owner. Standard uploads are also permitted by the same gate.

3. Call `validate`. The server downloads at most **10,000,000 bytes**, parses in
   an isolated worker, rejects encryption/unreadable PDFs and missing/wrong-type
   text fields, checks the reserved hash and byte count, and seals exactly that
   buffer with overwrite disabled. The parser is PDF-LIB 1.17.1, versioned as
   `pdf-lib@1.17.1/text-fields-v1`. Its ES5 error subclass requires comparing the
   parser's encryption-error message rather than `instanceof`. Task 03 can reuse
   the field/byte/error contract; browser integration remains its own scope.
4. Call `commit`. One transaction locks the request and clinic, compares the
   revision, writes clinic fields and template pointer, retires the old template,
   and records the outcome. `PT409` means a competing edit won; retain inputs and
   reload the current clinic. `23505` means a duplicate clinic name; saved fields
   and template remain unchanged. Failed validation/storage never publishes.

   Domain revision conflicts deliberately use `PT409`/HTTP 409, not the database's
   serialization-failure code. During acceptance the original `40001` caused
   repeated server transactions and a gateway failure. The current
   [Supabase diagnosis](https://supabase.com/kb/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b)
   documents this PostgREST bug and recommends `PT409` for domain conflicts. RPC
   requests have a 30-second transport deadline; uncertain commits still require
   outcome lookup. Actual database serialization failures remain distinct.

5. For an uncertain commit response, query `outcome` with the **same request UUID**
   before displaying failure. Retrying commit returns that recorded outcome,
   including after retirement/cleanup. It never republishes an old pointer.
   Cancel before commit makes the reservation terminal. Cancel after commit
   returns the saved outcome; it does not undo it. Task 04 must disable/defer
   Cancel while the commit outcome is unresolved.
6. Read only through
   `GET /api/clinic-templates/<clinicId>/<templateId>`. It verifies the SSR session
   and exact current owner association before streaming bytes with
   `Cache-Control: private, no-store`. Anonymous requests return 401, inaccessible
   or stale versions return 404, missing infrastructure/configuration returns 503. It supplies `X-Template-Id` and `X-Template-SHA256`; consumers must verify
   identity/hash and ignore late generation results after any input, template or
   session change. No client SELECT policy exists for sealed files; normal-flow
   signed URLs are not created. Downloaded buffers cannot be recalled, and an
   already authorized stream is not retroactively revoked.

Validation workers have a five-second deadline and a 128 MB old-generation heap
limit, with 16 MB young generation and a 4 MB stack. These are **not a total RSS or
native-allocation memory guarantee**. Parsing is not sanitization, malware scanning
or PDF certification. Storage downloads have a 120-second network deadline;
the deployment's own function-duration limit also applies. Validate representative
templates when changing parser/runtime versions. Failed transient validation can
retry after its two-minute lease; request expiry is 24 hours. A returned invalid
PDF result cancels the request; choosing another file needs a new UUID.

The per-owner admission lock caps live pending/validating/ready requests at ten
(`54000` on overflow). No saved template is overwritten. Saved request outcomes
are retained for idempotency, not invoice history. Metadata is owner-readable with
limited column grants; direct insert/update/delete and forged linkage are denied.
The existing no-template clinic actions remain usable and advance a revision on
each update, protecting later combined saves against stale clinic fields.

## Hosted configuration and rollout proposal

Target for the proposed synthetic development rollout:
`lvqbrjybwstvdhaxyxyn`, `my-clinics_dev`, organization `njnmfutclorywskqrftd`.
Production `xihkrkgrhupiwcsfjctp` is prohibited by both disposable and template
operator mutation paths. The following is a reviewable plan, not an executed
rollout or a request to widen authorization implicitly.

1. Record reviewed head, current migration history, and a read-only inventory of
   clinics/activity/owners. Verify exact ref/name/org and healthy status. Follow
   [the manual migration procedure](../../supabase.md#5-manual-migration-application).
   Disable the Data API before migration. The only new migration is
   `20261126160000_private_templates.sql`; do not replay desired SQL on an existing
   target or repair history. Expected preservation: same existing clinics/activity,
   no template links, revision 1 on existing clinics.
2. Review the CLI's dry run and apply the append-only migration using the existing
   manual procedure. Verify the migration record and application catalog against
   the reviewed files. Application Storage policy coverage includes only the
   `templates_*` policies, not all provider-managed Storage tables or internals.
   Verify `storage.objects` RLS remains enabled. Review **all** Storage policies
   for overlap; the operator refuses unexpected policy inventory rather than
   deleting another application's policy.

   Exact CLI 3.0.0 commands, after approval and target verification:

   ```powershell
   $templateRef='lvqbrjybwstvdhaxyxyn'
   pnpm supabase db query --remote=$templateRef --read-only --file supabase/check.sql
   pnpm supabase migration list --remote=$templateRef
   pnpm supabase db push --remote=$templateRef --dry-run --skip-vault
   pnpm supabase db push --remote=$templateRef --skip-vault
   ```

   The preview must name only `20261126160000_private_templates.sql`. These
   migration commands have **not** been run against development for this task.
   CLI help was checked locally; native transport/authentication may still need
   operator resolution. Stop on unexpected history, drift or connectivity errors.

3. Supply the organization-scoped PAT in ignored `.env.database-validation`, with
   existing lifecycle/database/config permissions plus API Keys Read and API Key
   Secrets Read. The bucket operator fetches keys into process memory, never logs
   them, and creates/updates only the two named buckets. Both must be private,
   limit 10,000,000 bytes, and allow only `application/pdf`. Global Storage limits
   must permit that file size; the actual boundary transfer is the final check.

   ```powershell
   $templateRef='lvqbrjybwstvdhaxyxyn'
   $env:MYCLINICS_TEMPLATE_CONFIG_AUTHORIZATION=$templateRef
   node --conditions=react-server --use-system-ca --env-file=.env.database-validation scripts/template-storage-operator.mjs configure $templateRef
   node --conditions=react-server --use-system-ca --env-file=.env.database-validation scripts/template-storage-operator.mjs inspect $templateRef
   ```

   Set the authorization marker only after approval of this exact rollout. It is
   a fail-closed execution guard, not an authorization substitute. Never run the
   disposable acceptance suite against development; it creates fixtures and
   advances timestamps only in projects created by that invocation.

4. Provision `SUPABASE_TEMPLATE_SECRET_KEY` in the server environment or ignored
   `.env.local`. It is a project secret/service-role key, **never** `NEXT_PUBLIC_*`
   or a Next.js `env` entry. Keep `NEXT_PUBLIC_SUPABASE_URL` and the publishable key
   aligned with the same approved project. Restart/redeploy the approved server
   after environment changes. Restrict operator credentials to trusted server use.
   No secret configuration has been written to the shared target by this task.
5. Verify grants/policies and bucket API configuration before restoring the approved
   synthetic Data API exposure. Perform separately authorized two-account
   development acceptance with reviewed fixtures, preserving other synthetic data.
   Test the production build read route, unchanged no-template workflows, and
   inactive clinics. There is no clinic upload UI in task 02; use the reviewed
   server helper contract for acceptance. Record refs, head, checks and cleanup.

## Cleanup and recovery

Run the operator **daily**, repeating batches until fewer than 100 candidates are
returned. This operator execution path is provided; no unattended schedule is
installed on a shared target without rollout authorization.

```powershell
node --conditions=react-server --use-system-ca --env-file=.env.database-validation scripts/template-storage-operator.mjs collect $templateRef
```

Keep the same reviewed target authorization marker. A row-locked claim prevents
publication after collection begins. Current linked versions cannot be claimed.
Retired sealed objects wait 24 hours. Unpublished objects wait until reservation
expiry plus 27 hours. This conservative bound composes a two-hour signed-upload
capability, a TUS URL initiated near
that token's expiry with up to 24 more hours, and one hour of grace. This extends
the research proposal's 25-hour value; it does not assume that every provider
request actually survives all those windows.
Quarantine cleanup also runs for still-published templates after that grace.
Daily execution bounds ordinary quarantine retention to roughly 75 hours from
reservation creation. Claim leases expire after five minutes for retry; a failed
delete leaves the claim retryable. Deletion uses the Storage API, followed by a
privileged filtered listing to confirm absence. Never delete `storage.objects`
metadata directly, overwrite a sealed key, or delete a current link to free space.

A provider/CDN may still serve an old cached Storage URL after logical deletion.
The application denies direct client reads and does a fresh association check
before each read, so a newly requested retired/removed template is rejected even
if Storage retains a cached response. We do not promise a provider cache purge
deadline or mid-stream cancellation. Keep originals and cleanup receipts in the
operator record when investigating outages; never copy secrets into evidence.

If upload succeeds but validation fails transiently, retry validation after its
lease expires; exact hash/size binding and immutable sealed-key recovery prevent
publishing different bytes. If commit succeeds but its response is lost, query
the request outcome. If collection fails, retry the same ID after lease expiry.
The SQL claim and reference checks remain authoritative; do not bypass them by
calling raw Storage deletion as a repair shortcut.

## Scoped rollback

First disable the new read route through server-secret removal/restart and stop
the future template UI/actions; keep existing clinic workflows available. Stop
cleanup while investigating a lifecycle incident. Preserve current objects and
outcomes. Database downgrade is not required to roll the app back: added tables,
revision trigger and column grants are compatible with the previous clinic code.

If a schema rollback is necessary, obtain a separate reviewed append-only reverse
migration, inventory owned links/requests and objects, and back up the approved
synthetic data first. Do not delete a bucket or use CASCADE against platform
schemas. Only after explicit approval and proving there are no retained current
templates may an operator remove the two application buckets through Storage API,
then the application policy/functions/tables and revision trigger/column in
dependency order. Never erase or rewrite migration history. Production has no
authorization under this plan.

## Validation reproduction and coverage

Use Node 24 and pnpm 11.25.0, TLS verification enabled. Hosted commands need the
authorized disposable marker, scoped PAT, and one Free slot. They verify target
identity, prohibit development/production mutations, and delete only projects
created by that invocation. Preserve every printed ref and final absence result.

```powershell
$env:NODE_OPTIONS='--use-system-ca'
pnpm db:types
pnpm db:test-tooling
pnpm db:validate
pnpm db:test-templates
pnpm lint
pnpm typecheck
pnpm format:check
pnpm test -- src/lib/templates/pdf-validation.test.ts
pnpm build
```

`db:validate` adds actual bucket/API/policy/lifecycle checks after transactional SQL
owner/grant assertions. It temporarily enables only `public` on its disposable
project, then disables it before every Management SQL query and in `finally`.
Both `db:validate` and `db:test-templates` build/start the actual Next production server
against that disposable project, creates an SSR cookie session, tests the full
10 MB streamed response, and verifies removed-template 404. It stores redacted
stage receipts in ignored `.env.template-validation-<ref>.json`; PR evidence records
the delivered commit, refs, outcomes and cleanup. No UI screenshot applies.

On this workstation the pinned native CLI reports `GenTypesNetworkError` /
`TransportError` for generation. The runner falls back **only for that exact
transport error** to the official
[hosted generation endpoint](https://supabase.com/docs/reference/api/v1-generate-typescript-types),
using Node's system certificate trust. Auth/schema/other failures do not trigger
fallback. `pnpm db:types` still generates twice from a fresh replay, reconciles
desired/history catalog parity, and only then writes generated types. No type is
hand-authored. `db:validate` checks committed freshness without rewriting it.

Storage coverage is deliberately bounded: application policy definitions join the
semantic SQL catalog; bucket private/MIME/byte settings and Storage API behavior
are checked independently. Provider migrations, backend object-store internals,
CDN propagation timing, real mobile network failures and a deployed Vercel runtime
are not equated with catalog parity or the local production server proof.
