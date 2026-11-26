# Private clinic template storage investigation

Research date: 2026-11-26. The independent reviewer accepted the phase 1 report at
`67fd610d804b1f453e385aa7801603c29d250996`. The investigation below preserves that
phase's evidence and limitations. Phase 2 implementation, operational contracts,
and the sourced `PT409` correction are recorded in the
[operator runbook](template-storage-runbook.md). Persistent shared-development
rollout remains separately unauthorized. Base:
`22942979af63c2db5c7331fc9726c3a75d022f0d` on
`feature/private-template-infrastructure`. No application migration, bucket,
policy, dependency, or deployment setting has been selected for rollout by this
report. Disposable research configuration is explicitly distinguished below.

## Correction round 1 — B1 transport and credential revision

Independent review of implementation `8cf9e85` found a blocking error in the
browser upload contract: `begin.uploadGrant.accessToken` was the full account JWT.
The reviewer used it after Cancel to create/read unrelated owned clinics without
cookies (HTTP 201/200). Returning that credential crossed the existing explicit
HttpOnly boundary and was unnecessary for file transfer. The account-token grant
is removed. This section supersedes the initial recommendation C and the rejected
phase 2 token clarification; the earlier investigation below is retained as history.

The corrected selection is **D, signed direct TUS** with the same private
quarantine, exact-buffer sealing, atomic publication and server-read lifecycle.
The server returns only a no-upsert upload capability for the reserved bucket/path,
its expiry, and the signed TUS endpoint. It does not extract or return the account
access/refresh token. The capability has no account role/subject and cannot
authorize account Data API or Auth requests. Its authority remains file upload,
not metadata association, validation or publication.

Inspected 2026-11-26: the [resumable guide](https://supabase.com/docs/guides/storage/uploads/resumable-uploads)
describes `x-signature`; the exact route distinction is explicit in official
Storage source at revision `4341c445f963ad7372629f6fede14f3e240a1541`:
[route registration](https://github.com/supabase/storage/blob/4341c445f963ad7372629f6fede14f3e240a1541/src/http/routes/tus/index.ts#L206)
and [capability verification](https://github.com/supabase/storage/blob/4341c445f963ad7372629f6fede14f3e240a1541/src/http/routes/tus/lifecycle.ts#L58).
The signed endpoint is `/storage/v1/upload/resumable/sign`. It accepts the public
project `apikey` plus `x-signature`, without account Authorization or cookies,
and checks the upload-scoped signature against the bucket/object name. Returned
PATCH/HEAD Locations retain `/sign`. The base `/resumable` route uses ordinary
JWT/RLS authorization; adding `x-signature` alone does not switch handlers. This
explains the reviewer's failed base-route diagnostics without relaxing policies.

Disposable correction probe `iqujehhtqgvjlgnuexij` independently transferred and
resumed a 10,000,000-byte PDF through the signed route without an account bearer,
rejected a different path, rejected 10,000,001 bytes with 413, and passed the
existing selected lifecycle checks. That target was deleted and inventory-confirmed
absent. Expanded correction receipts in PR #72 verify the original account-API
reproduction and Cancel during upload; their head/source hashes distinguish them
from the historical account-token transfer evidence. Renewed affected review is
required before treating this revised transport contract as accepted.

The capability lasts two hours and is transferable for its one path; it cannot be
revoked individually ([signed upload API](https://supabase.com/docs/reference/javascript/storage-from-createsigneduploadurl)).
Cancellation is therefore a publication boundary: late bytes can finish into
unreadable quarantine, but cancelled requests cannot validate or publish and do
not alter the saved clinic/template pair. The existing 27-hour post-expiry cleanup
grace conservatively covers a two-hour capability followed by a 24-hour TUS URL,
plus one hour. No new SQL, Storage policy, or generated-type change is needed.
Signed standard upload remains a supported alternative; its whole-file restart
tradeoff is unnecessary here because the signed TUS route is now proven. No
broader account credential or insecure policy exception is required to retain
resumability.

## Decision criteria established before selection

The [requirements](../../requirements.md#invoice-templates-and-generation) require
optional private templates for active and inactive clinics, readable unencrypted
PDFs with five text fields, a 10 MB limit, explicit Save/Cancel, and preservation
of saved state on failure. Generated invoices are never stored.

These are hard gates, not points to exchange for speed:

1. A verified owner controls the clinic and the exact saved bytes; neither paths,
   MIME headers, client validation, nor client-supplied metadata confer trust.
2. A save changes clinic fields and the template association in one database
   transaction. Cancel and validation/storage/database failures leave the saved
   pair intact. A competing request cannot publish unvalidated or stale bytes.
3. A valid 10 MB document transfers within every applicable transport limit,
   including protocol overhead. Unknown host settings cannot count as a pass.
4. Access, cache lifetime, retry, and orphan recovery have explicit contracts.

After those gates, use a simple ordinal assessment: strong / adequate / weak /
unproven. Prefer resilient mobile transfer, then operational simplicity and
compatibility with the existing stack, then latency/resource cost. This ordering
reflects a small clinic application with occasional template changes: there is no
measured upload volume or paid hosting budget to justify a throughput-optimized
system. No weighted aggregate can make a gate failure acceptable.

## Inspected baseline and applicability

- Repository `package.json` and lockfile: pnpm 11.25.0, Next.js 16.4.3,
  `@supabase/supabase-js` 2.119.0 declaration, SSR 0.12.7 declaration, React 19.3.0,
  Supabase CLI 3.0.0. Probe runtime: Node 24.14.0. No PDF or TUS application
  dependency is present. PDF-LIB 1.17.1 is an isolated research dependency only;
  task 03 still owns library selection and the reusable validator/fixtures.
- `src/app/(signed-in)/clinics/create-clinic.ts` and `update-clinic.ts` use Server
  Actions, verify Auth for each call, and perform a single clinics mutation using
  the user's client. They have no combined template transaction or concurrency
  version. IDs cross the boundary as strings. Existing grants/RLS enforce owner
  isolation, and clinics may remain without a template.
- `next.config.ts` does not override action body limits. Installed
  `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/serverActions.md`
  specifies a 1 MB raw action body default, including multipart overhead. Its
  10–20 KB overhead guidance is a sizing estimate, not a guarantee. Installed
  `01-app/01-getting-started/15-route-handlers.md` describes Web Request/Response
  handlers and uncached request-time handling by default. New handlers must
  authenticate themselves; layouts and the current Proxy matcher do not secure
  arbitrary new `/api` routes.
- Read-only requests to the documented canonical host
  `https://my-clinics.vercel.app` returned 307 to `/login`; `/login` returned 200.
  Both had `server: Vercel` and an `x-vercel-id` header. This confirms Vercel
  applicability but reveals neither account plan nor function configuration.
  There is no local `.vercel` link, Vercel CLI executable, or `VERCEL*` process
  environment variable. GitHub's most recent deployment record inspected was
  `7765882490`, environment `hosted-activity-acceptance`, SHA
  `c31d8b8450e095fefd4b7cd3329fab92d8d7e433`, with an empty `environment_url`.
  These observations do **not** establish the actual compute/memory/body settings.
- The existing database runner checks `public` schema parity and generated types,
  not Storage bucket configuration or real object operations. SQL role tests do
  not replace HTTP Storage checks. Its scoped PAT intentionally omits API Keys.

## Current primary sources

All links were consulted on 2026-11-26; hosted documentation can change.

| Source                                                                                                                                                                                                 | Material finding and applicability                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Vercel limits](https://vercel.com/docs/functions/limitations), [20 November announcement](https://vercel.com/changelog/vercel-functions-now-support-request-bodies-up-to-20mib)                       | Default inbound is 4.5 MB; 20 MiB public beta requires Fluid Compute, Performance 4 GB memory (Pro/Enterprise), `VERCEL_SUPPORT_LARGE_REQUEST_BODY=1`, and redeployment in each selected environment. Node/Python/Bun qualify; Edge keeps its smaller cap. Middleware cannot inspect bodies after opt-in. Unstreamed responses retain 4.5 MB. Actual project eligibility/settings are unknown. |
| [Standard upload](https://supabase.com/docs/guides/storage/uploads/standard-uploads)                                                                                                                   | 10 MB is supported in principle; 6 MB is a reliability recommendation, not a hard maximum. Supabase recommends resumable upload above that size. Standard upload cannot be rejected merely because 10 MB exceeds 6 MB.                                                                                                                                                                         |
| [Resumable upload](https://supabase.com/docs/guides/storage/uploads/resumable-uploads)                                                                                                                 | TUS supports authenticated and signed-token uploads, recommends the direct Storage hostname and 6 × 1024²-byte chunks. Upload URLs last up to 24 hours. Conflicting writers receive 409 without upsert; upsert makes the last completion win.                                                                                                                                                  |
| [File limits](https://supabase.com/docs/guides/storage/uploads/file-limits)                                                                                                                            | Global and bucket restrictions both apply. Free supports a global maximum of 50 MB, sufficient in principle. The configured bucket must enforce the chosen byte limit independently of the browser.                                                                                                                                                                                            |
| [Access control](https://supabase.com/docs/guides/storage/security/access-control), [private downloads](https://supabase.com/docs/guides/storage/serving/downloads)                                    | Private Storage uses RLS; secret/service keys bypass RLS. Private downloads can use user Authorization or signed URLs. MIME and path policies do not parse PDF bytes.                                                                                                                                                                                                                          |
| [Signed upload API](https://supabase.com/docs/reference/javascript/storage-from-createsigneduploadurl)                                                                                                 | A signed upload token is a bearer capability, usable without the user session for two hours. Restricting the UI's lifetime does not revoke the token.                                                                                                                                                                                                                                          |
| [Smart CDN](https://supabase.com/docs/guides/storage/cdn/smart-cdn)                                                                                                                                    | Pro+ CDN and browser cache lifetimes differ from token expiry. Signed cached responses can outlive token expiry; authenticated CDN responses can persist until JWT expiry. Invalidation may take 60 seconds. New paths prevent replacement staleness; server authorization is needed for immediate access re-evaluation. Free-only probes cannot prove Pro CDN behavior.                       |
| [Storage schema](https://supabase.com/docs/guides/storage/schema/design), [deletion](https://supabase.com/docs/guides/storage/management/delete-objects)                                               | Storage SQL metadata is not the underlying object store. Remove bytes through the Storage API; do not delete `storage.objects` rows as cleanup. Platform definitions must stay intact.                                                                                                                                                                                                         |
| [Lifecycle policies](https://supabase.com/docs/guides/storage/buckets/lifecycle-policies)                                                                                                              | New public-alpha rules expire noncurrent versions, require versioning, and run approximately daily. They do not replace pending-upload/orphan collection for this design.                                                                                                                                                                                                                      |
| [PDFDocument](https://pdf-lib.js.org/docs/api/classes/pdfdocument), [PDFForm](https://pdf-lib.js.org/docs/api/classes/pdfform), [load options](https://pdf-lib.js.org/docs/api/interfaces/loadoptions) | Byte loading, encryption detection, and typed text-field lookup support a validator proof. Parsing acceptance is library-specific, not a general PDF security certification or malware scan.                                                                                                                                                                                                   |
| [Supabase pricing](https://supabase.com/pricing), [Edge limits](https://supabase.com/docs/guides/functions/limits)                                                                                     | Free includes 1 GB file storage and 5 GB egress; Edge workers have 256 MB memory and 2 seconds CPU. These are capacity constraints, not measurements of application usage or proof that a parser fits every document.                                                                                                                                                                          |

## Alternatives compared as complete lifecycles

All credible variants need a trusted validator, a single database commit, and
garbage collection. Moving the upload alone does not solve those problems.

| Variant                                                                                                                 | Transfer and validation                                                                                                                                                                                                                                                                                                                | Save, identity, access and cleanup                                                                                                                                                                                                                                                                | Assessment                                                                                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A. Application server receives file, validates, writes a new private object, commits clinic/metadata                    | One browser upload; Node validator sees submitted bytes directly. Requires verified Vercel beta eligibility/settings or another explicitly chosen host. An action additionally needs a raw-body override; a Node Route Handler avoids that action-specific limit but not Vercel's limit. Streamed download needed for 10 MB responses. | Immutable final keys, transactional pointer swap, version check, and post-commit garbage collection. Can use server-authorized reads and keep all Storage writes private to server. Failed DB save leaves one orphan.                                                                             | Strong simplicity and fewer prevalidation steps; weak interrupted-upload recovery. **Conditional viable contender**, not disproved by obsolete limits. Host gate currently unproven; paid-plan dependence cannot be silently introduced.                    |
| B. Authenticated direct standard upload to private quarantine; server validates downloaded bytes and writes sealed copy | Avoids application ingress cap; 10 MB falls within Storage's supported range. A failed network upload restarts the file. Validator downloads at most limit+1 bytes, then writes precisely the validated buffer to sealed Storage.                                                                                                      | Reservation binds owner and random path. Nothing in quarantine is client-readable or usable. DB commit binds sealed version to clinic. Orphans from upload, validation or failed save require collection. Server-authorized read avoids signed download lifetime and CDN authorization ambiguity. | Adequate simplicity; mobile retry weaker than C. Supported fallback, not ruled out for size. Hosted raw and multipart boundary transfers passed.                                                                                                            |
| C. Authenticated direct TUS upload to quarantine; same validator/sealed/transaction/read lifecycle                      | Avoids application ingress cap and resumes from the completed chunk. Adds TUS client/protocol work and small control requests. Uses user access token, no upsert, fixed chunks, no user-readable quarantine.                                                                                                                           | Same atomic save as B. Sealed copy protects against delayed upload completion, replayed capabilities or changes to quarantine during validation. Fresh immutable version is the preview/download identity. Cleanup handles abandoned TUS and sealed orphans.                                      | **Provisional recommendation** for mobile resilience without requiring a paid hosting feature. More operational/code complexity than A/B; hosted transfer/resume and read-boundary mechanisms proved; final policy/lifecycle validation belongs to phase 2. |
| D. Server issues signed direct standard/TUS upload capability; same sealing/commit                                      | Avoids application ingress cap and can avoid browser token plumbing. Token path-bound but transferable, and may survive sign-out/cancel. Two-hour lifetime requires cleanup grace and replay-resistant publication.                                                                                                                    | Server reservation, sealed copy and final commit still necessary. No client-read permission in quarantine. Revoking reservation prevents publication, not necessarily continued token upload.                                                                                                     | Viable where external upload delegation is needed; this app already has Auth. Added capability lifetime provides no confirmed product benefit over C.                                                                                                       |
| E. Supabase Edge Function receives/validates file; final transaction and private read                                   | Avoids Vercel ingress but adds another deploy/runtime/secret boundary. Edge CPU/memory budgets require representative parser stress tests; 10 MB compressed PDF can expand well beyond 10 MB.                                                                                                                                          | Same immutable object and DB transaction; same collector. User verification must happen in function, and service credentials must never authorize a forged clinic.                                                                                                                                | Plausible alternative, **unproven** runtime limits. No evidence to justify adding a second application runtime now.                                                                                                                                         |

Rejected shortcuts: browser-only validation (a direct caller bypasses it), MIME-only
validation (not byte validation), overwriting the current path before database
save (Cancel/failure destroys saved bytes), and separately saving clinic then
template metadata (partial success). Storing PDFs as database bytea/base64 would
avoid object/metadata cleanup transactions but fails the assigned Storage scope,
inflates transport/database use, and adds backup cost. It is not an eligible
implementation alternative for this task.

## Provisional contract for tasks 03–06

This is a concrete proposal for independent challenge, not permission to configure
it. If the hosted proofs contradict it, revise and re-review before implementation.

### Byte and validation boundary

Use decimal **10 MB = 10,000,000 bytes**, inclusive, consistently in browser,
authoritative validator and Storage buckets. Requirements say MB, not MiB; decimal
avoids silently allowing 485,760 extra bytes. Do not base64-wrap the file. For
TUS, protocol chunk size remains 6,291,456 bytes; it is not the file limit.

Task 03 may reuse one validator in browser and server, but only the server result
is authoritative. Its contract accepts bytes and returns either a valid result
with exact byte count/SHA-256/validator version or structured invalid reasons:
too large, encrypted, unreadable, missing fields, or wrong field type. Required
text fields are `invoice_number`, `issue_date`, `gross_amount`,
`withholding_amount`, and `net_amount`. Never enable `ignoreEncryption` to accept
an encrypted PDF. Do not claim PDF sanitization, archival compliance, or malware
protection. Apply bounds/timeouts to downloaded bytes and parser work; compressed
content and unusual field trees need representative negative fixtures in 03.

### Upload and trusted sealing

Keep the local file local until Save; Cancel before Save creates no remote object.
On Save, verify Auth and reserve a random upload identity for that owner. For an
edit, verify clinic ownership regardless of active state; for creation, use an
owner-bound draft reservation without prematurely creating a saved clinic. The
server derives paths; a filename is display metadata only. Ordinary users cannot
insert or update reservation ownership, validation status, hashes, or final paths.

Quarantine and sealed templates are separate private buckets. Permit authenticated
INSERT only to an exact live owner reservation in quarantine, not arbitrary UUID
prefixes; deny ordinary SELECT/UPDATE/DELETE there. No upsert. The proof's broad
prefix rule is deliberately a transport experiment, **not** the proposed policy.
Sealed writes are server-only; never accept a client-selected sealed path. Read
quarantine through a server-only secret client after checking the reservation.
Validate that bounded buffer, hash it, and upload exactly those validated bytes
under a new sealed UUID with overwrite disabled. Do not validate one download and
then use Storage copy/move of a potentially changed source.

For ordinary application reads, prefer an authenticated Node streaming handler
that checks current clinic ownership and exact current template identity before
reading sealed Storage using its private server client. Deny direct client reads
and signed-URL creation in the sealed bucket. Emit `Cache-Control: private,
no-store` and fetch upstream without application caching. Never return public
URLs, secret keys or upstream signed URLs. This adds application egress but makes
the authorization/association check explicit and avoids normal-flow bearer URLs.
An already authorized downloaded buffer cannot be recalled; sign-out and input
generation guards must clear browser state. Mid-stream revocation is not promised.

### Atomic publication and concurrency

One narrow SQL operation publishes clinic fields and the sealed template metadata
in a transaction. It must independently enforce owner/clinic association and
validated reservation, with narrowly granted execution or a trusted server-only
commit role. Do not grant an authenticated caller a generic function accepting
`validated=true`, arbitrary owner IDs or object paths. Restrict ordinary table
writes so no existing action can bypass the combined save contract.

Store template UUID, clinic ID, owner, sealed bucket/key, exact bytes, SHA-256,
validator version, optional original filename and validation time in application
metadata; platform-managed Storage metadata is not authoritative. Enforce one
current template per clinic and bind owner/clinic with database constraints plus
authorization checks. No-template clinics are valid, active or inactive.

Lock the clinic and compare an expected save version for every change to its
template association. A stale competing edit returns a conflict with inputs
retained; it cannot silently overwrite a newer template. Creation uses an
idempotency UUID; edit saves and removals also retain a request identity. Record
the completed request and outcome transactionally so a lost HTTP response can be
retried without duplicate clinics or a false failure. If success is uncertain,
query that outcome before showing a failed save. A transport timeout alone does
not prove rollback. Old saved pointers remain until successful commit. A failed
unique-name or validation check changes neither clinic nor current template.

Cancel after an in-flight request cannot undo a committed save: the UI must disable
or defer Cancel while Save is committing, resolve the request outcome, and display
the actual result. Cancel before commit may invalidate its reservation; the same
transactional state check prevents later publication. Task 04 must make this
interaction explicit and verify it rather than promising network cancellation
undoes a database commit.

### Freshness and cleanup

Return opaque template UUID, hash, byte count and display filename to the owner.
Tasks 05–06 key fetched bytes and preview generation by template UUID/hash plus
current valid input snapshot and session generation. Clear download readiness on
every input/template/session change, ignore late asynchronous results, and verify
the returned identity/hash before using bytes. Never identify a template solely
by clinic ID, filename, or a mutable URL. New sessions/devices query the current
association. Inactive clinics use the same contract.

Never delete old bytes before commit. The transaction marks old versions retired
and queues cleanup; storage deletion is an idempotent later action. Recheck lack
of a current reference under a state/lease claim before deleting. A collector and
publisher must not race between a reference check and deletion: only reservations
that are terminal/expired and cannot transition to saved may be collected. Resume
or complete retries cannot resurrect a terminal reservation. Keep failed delete
jobs for retry, and verify absence with privileged API listing/info. Do not treat
a filtered empty owner deletion response as proof of byte deletion.

Proposed operational values, not measured requirements: reservations expire after
24 hours; collect terminal quarantine objects 25 hours after reservation expiry
to exceed the lifetime of TUS URLs issued just before that expiry. Retire
unreferenced sealed objects after 24 hours. Use server timestamps. A daily collector
bounds ordinary quarantine retention to roughly 73 hours from reservation creation;
immediate Cancel can queue best-effort deletion but cannot
guarantee all upload capability/retry state vanished. Retain necessary tombstones
through that grace period. Quotas, one active reservation per save identity and
bounded pending uploads prevent unbounded abandoned-file growth. This needs an
explicit scheduled/operator execution path in phase 2; built-in version lifecycle
rules do not implement it.

## Measured proofs and limitations

The reproducible [probe](template-storage-probe.mjs) is research code, not the
application validator or migration harness. It never configures shared development
or production and validates the disposable name/org before deletion. Results are
redacted and credential values are never printed. TLS verification stays enabled.

### Local PDF and multipart proof — passed

[Recorded results](template-storage-local-results.json), Node 24.14.0, isolated
PDF-LIB 1.17.1. Synthetic PDFs have real AcroForm text fields and an uncompressed
padding stream, with the final serialized byte count asserted. The implementation
checks actual bytes rather than a declared length or MIME type.

| Check                                                           | Actual result                                                   |
| --------------------------------------------------------------- | --------------------------------------------------------------- |
| 9,999,999 bytes                                                 | Valid; 8 ms local parse/field check                             |
| 10,000,000 bytes                                                | Valid; 8 ms local parse/field check                             |
| 10,000,001 bytes                                                | Rejected before parse; under 1 ms                               |
| Missing required field                                          | Rejected; 3 ms                                                  |
| Required name implemented as checkbox                           | Rejected; 10 ms                                                 |
| `application/pdf`-claiming arbitrary bytes                      | Rejected locally; 1 ms                                          |
| Two official encrypted fixtures                                 | Encryption rejection verified for both                          |
| Multipart encoding of 10,000,000-byte file and one clinic field | 10,000,279 raw bytes: 279 bytes overhead for this exact request |

The fixture source is
[PDF-LIB revision 93dd36e](https://github.com/Hopding/pdf-lib/tree/93dd36e85aa659a3bca09867d2d8fac172501fbe/assets/pdfs);
SHA-256 values are in the results. Its encrypted-new fixture emits parser warnings
before rejecting encryption. Research error categorization is intentionally coarse;
task 03 must supply the user-visible reason taxonomy. No library is installed in
the application or selected for task 03 by these tests.

These times are single warm workstation observations, not mobile, Vercel, network,
peak-memory, or adversarial-complexity benchmarks. End-of-run RSS was 169,861,120
bytes after generating many documents; it does not measure incremental validator
memory. The large zero stream tests byte transport rather than difficult PDF
rendering. The multipart result does not cover React action metadata, long names,
or other form fields. A future server-file route must use an explicit total-body
ceiling with overhead allowance and independently enforce the file byte limit.

### Hosted lifecycle — completed research proof; all targets deleted

The first run created `myclinics-validation-template-c9de80194a`, ref
`jvncfmriewhwyyjrpciu`, EU Central, after verifying development was `INACTIVE`.
It reached healthy state and disabled its Data API. Fetching API keys returned
HTTP 403. The original token lacked API Keys access by design. The finalizer deleted
this exact target and the organization inventory confirmed it absent.
[Actual failed-run evidence](template-storage-probe-jvncfmriewhwyyjrpciu-results.json).

The user then updated the scoped PAT with API Keys **Read** and API Key Secrets
**Read**, preserving its existing permissions.
Current [key documentation](https://supabase.com/docs/guides/getting-started/api-keys)
requires both permissions for `GET /v1/projects/{ref}/api-keys?reveal=true`.
Revealed keys stayed only inside the process for synthetic Auth/Storage requests;
no credential values were emitted or committed.

The next run used `etxkuazppylxohjbscya`,
`myclinics-validation-template-69ef6c12a5`. Most probes passed, but the final research
assertion incorrectly expected an immediate failed download after successful
privileged object deletion. Cached bytes were still readable. The run exited 1
and deleted the target, with absence confirmed in organization inventory.
[Preserved failed research assertion](template-storage-probe-etxkuazppylxohjbscya-results.json).
This was evidence against the assumed revocation mechanism, not an access failure.
The probe was corrected to distinguish API deletion/list absence from a cached
download, and to measure the proposed server read boundary.

The final run used `emvglsxducywzeyjwmvq`,
`myclinics-validation-template-a8464ffa37`, EU Central, Node 24.14.0,
Supabase JS 2.119.0 and research PDF-LIB 1.17.1. It exited 0 and deleted the target;
organization inventory confirmed absence. Development was verified `INACTIVE`
before each creation; production was never a write target. The Data API remained
disabled throughout. [Complete final evidence](template-storage-probe-emvglsxducywzeyjwmvq-results.json)
records the exact probe SHA-256 and versions; earlier failed runs are retained
separately.
The coordinator restores development after receiving cleanup confirmation.

| Final hosted check                                                      | Actual result                                                                                                       |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Standard raw 10,000,000-byte upload                                     | Passed; 1,102 ms                                                                                                    |
| SDK Blob/multipart 10,000,000-byte upload                               | Passed; 933 ms                                                                                                      |
| Second ordinary owner's 9,999,999-byte upload                           | Passed                                                                                                              |
| 10,000,001-byte standard upload                                         | Rejected with 413                                                                                                   |
| Duplicate path without upsert                                           | Rejected with 409                                                                                                   |
| Owner/cross-owner/anonymous quarantine reads                            | All denied, 404                                                                                                     |
| Cross-owner/anonymous quarantine writes                                 | Denied, 403                                                                                                         |
| Arbitrary bytes declaring `application/pdf`                             | Storage accepted them; confirms authoritative byte parsing is necessary                                             |
| TUS 10 MB, recover offset after first chunk                             | Passed; recovered 6,291,456-byte offset; final SHA-256 matched; 2,973 ms including privileged verification download |
| Signed upload with anonymous client and valid token                     | Passed; token is a bearer capability                                                                                |
| Same signed token used for another owner's path                         | Denied, 400                                                                                                         |
| Download quarantine buffer, parse, upload exact buffer to sealed bucket | Passed; byte count and hash recorded                                                                                |
| Direct ordinary client insert/update in sealed bucket                   | Denied, 403                                                                                                         |
| Experimental owner-readable sealed object                               | Owner read passed; other owner and anonymous denied, 404                                                            |
| SQL model unique-name save failure                                      | Clinic fields/version/template all preserved                                                                        |
| Two concurrent SQL model saves with same expected version               | Exactly one success and one conflict                                                                                |
| Server read PoC, owner/cross-owner/anonymous                            | 200 with 10 MB and matching hash / 404 / 401                                                                        |
| Server read PoC after current association revoked                       | 404                                                                                                                 |
| Fresh sealed object after experimental client SELECT policy removed     | Direct owner Storage download denied; authorized server stream passed and hash matched                              |
| Privileged Storage deletion                                             | API succeeded; object absent from privileged list; earlier authenticated download still returned cached bytes       |

The direct read comparison is material. The initial response had
`Cache-Control: private, max-age=0, must-revalidate` and `cf-cache-status: HIT`.
After SQL set the association to `current=false` and a separate SQL read confirmed
that value, the same authenticated URL still returned 200/CF HIT. A fresh
`cacheNonce` URL returned 400/CF BYPASS, while the server's current-association
check returned 404. The signed download URL, issued with a 60-second TTL, also
returned 200 after association revocation. Following API deletion and confirmed
list absence, the old authenticated URL again returned 200/CF HIT. These are
new HTTP requests, not re-use of an already acquired in-memory PDF. We did not
measure the total cache-retention window or wait for signed expiry, and infer no
arbitrary duration from these observations. `Age` and `x-cache` headers were absent;
ETags are preserved in redacted results. No token or signed URL is recorded.

The successful streaming proof ran a temporary Node HTTP server bound to loopback.
Each request independently verified its bearer token with Supabase Auth, selected
the current owner association through Management API SQL, and only then fetched
and streamed Storage bytes using the process-only service key. Responses carried
`private, no-store`. It also proved the server could read a fresh sealed object
with no client SELECT policy. The server closed in `finally`. This tests the
mechanism, not the final Next.js route, cookie auth integration, production
deployment, immediate session invalidation, or a browser/mobile interaction.

Remaining phase 2 checks include exact reservation/clinic/owner policies, inactive
clinic behavior, metadata HTTP authorization, path/clinic forgery, the real
combined-save/idempotency transaction, upload expiry and collector/publisher races,
and production-host streaming. The SQL model proves atomic update/conflict
feasibility; it does not implement full Save/Cancel or uncertain-response recovery.
The delete-attempt probes checked that original bytes were still returned through
privileged downloads; cached delivery means they alone do not prove underlying
object preservation. Phase 2 must additionally verify privileged listing/state
after each denied delete. TUS resumed from a complete chunk via HEAD; we did not
kill a TCP connection mid-chunk or run a real mobile browser. No TUS over-limit
transfer was tested; the selected bucket limit must also be verified through TUS
during implementation. No persistent infrastructure or final security acceptance
is claimed from these disposable research policies.

### Performance and cost reasoning — estimates, not measurements

For a 10 MB upload, raw transmission takes at least 8 seconds at 10 Mbit/s or
40 seconds at 2 Mbit/s, before RTT/protocol overhead. TUS's first 6 MiB chunk is
about 25.2 seconds at 2 Mbit/s; resuming after that chunk retransmits at most the
remaining 3,708,544 file bytes instead of restarting all 10 MB. These are arithmetic
estimates, not device/network measurements. TUS still retries a partially failed
chunk and adds control round trips; it is not always faster on a healthy link.

Quarantine plus sealed copy temporarily consumes 20 MB for one maximum-size file;
replacement can temporarily add the old 10 MB, or 30 MB total. Repeated abandoned
uploads accumulate until collection. Free 1 GB capacity is approximately 100
decimal maximum-sized saved templates before other usage; actual quota accounting
and existing storage reduce capacity. Validation adds one Storage download and
one sealed upload. A template read through the application adds application
egress and invocation; it also consumes Storage egress. No upload volume, Vercel
plan, regional billing path or actual cost is known, so no monthly bill is claimed.
The server-upload alternative removes quarantine transfer but may require a paid
Vercel plan and loses resume. Quantify actual host resource use during phase 2.

## Reproduction and next decision gate

Keep dependencies and fixture bytes in ignored `.env.template-research`. Create a
private `package.json` there and a nested `pnpm-workspace.yaml` with `packages: []`
before installing `pdf-lib@1.17.1` with pnpm, so the root lockfile is not changed.
Use `NODE_OPTIONS=--use-system-ca` for network package installation if needed;
never disable TLS. Download the two encrypted fixtures from the pinned source
above into that directory. The probe imports PDF-LIB only from that isolated path.

```powershell
New-Item -ItemType Directory -Force .env.template-research | Out-Null
Set-Content .env.template-research/package.json '{"private":true}'
Set-Content .env.template-research/pnpm-workspace.yaml 'packages: []'
$env:NODE_OPTIONS='--use-system-ca'
pnpm --dir .env.template-research add pdf-lib@1.17.1
node --use-system-ca 'docs/milestones/milestone-07-invoices/template-storage-probe.mjs' --setup-fixtures
node 'docs/milestones/milestone-07-invoices/template-storage-probe.mjs' --local
node --use-system-ca --env-file=.env.database-validation 'docs/milestones/milestone-07-invoices/template-storage-probe.mjs'
```

The final command requires the authorized environment marker, the expanded scoped
PAT, Free capacity, and confirmed paused development. It creates one disposable
project and destroys it in `finally`; keep the process running until cleanup is
reported. Failed cleanup requires inspecting/removing that printed disposable ref,
never a shared ref. Hosted output is saved under its unique ref. Do not run it as
an ordinary unit test or in production. The test grants wider quarantine-prefix
INSERT and temporary ready SELECT to compare alternatives; it does not claim to
implement the recommended reservation/streaming-read policies.

Phase 1 checks actually executed: local probe (passed), `node --check` on the
probe (passed), `pnpm exec eslint` on the probe (passed), `pnpm lint` (passed),
`pnpm format:check` (passed), and resolution of all six local Markdown file links
(passed). The final hosted probe completed successfully and its recorded SHA-256
matches the delivered probe source. Sandboxed pnpm initially failed to reach
Corepack's registry; repeating
with authorized external tooling and system certificate trust succeeded. No
application/build/schema/type change is included: `pnpm typecheck`, `pnpm build`,
`pnpm db:types`, `pnpm db:validate`, and `pnpm db:test-tooling` were not performed
for this research-only delivery. Phase 2 still requires its specified checks.
Use `--local --verify` to rerun local assertions without overwriting the original
timing evidence; `--setup-fixtures` verifies pinned fixture SHA-256 values.

Before decision acceptance: independently challenge the completed hosted proofs and
the two-bucket/streaming-read cost against simpler alternatives, then review the
proposed contract and its stated implementation-stage validation gaps. Vercel
settings may remain unavailable if the chosen design
does not rely on the beta, but must remain an explicit limitation on alternative A.
No configuration starts before that review. Phase 2 must implement/replay/parity
check the selected schema, generate types, verify all real Storage operations and
the chosen cleanup/identity/failure contract, provide operator/rollback commands,
and obtain a concrete reviewed development rollout authorization. Tasks 03–06
consume only the independently accepted contract, not this provisional draft.
