# Private template storage decision

The final design uses **one private `clinic-templates` bucket**. Upload once,
validate the stored PDF, then atomically associate that same object with the clinic.
There is no temporary bucket, promotion copy, scheduler or daily user command.

## Contract

- Ordinary signed uploads use a fresh owner/request UUID path and `upsert: false`.
  The browser receives only a file-scoped capability, never an account or service
  credential. A valid PDF may contain at most **10,000,000 bytes**.
- The server downloads bounded bytes and validates their size, SHA-256, readable
  unencrypted PDF structure and five required text fields. Only that result can
  make the request publishable. Owners can read their limited metadata; ordinary clients cannot attest
  validation, forge associations or alter/delete Storage objects directly. No overwrite is permitted while an
  object can be validated or published.
- Save writes clinic fields and the template association in one transaction.
  Revision conflicts preserve the winning clinic; repeated request IDs return
  their recorded outcome. Cancel and invalid files never replace the saved pair.
- The real PDF read route checks the current owner and association, then streams
  `private, no-store` bytes. Removing/replacing the template rejects new stale reads.
- Cancel and invalid validation delete that upload. Replacement first associates
  the new object atomically, then deletes the old one. Removal unlinks and deletes
  that template. A row lock prevents deletion of a current or publishable object.
- Deletion retries target only the affected UUID. The original request outcome
  records the previous template identity, so repeating the same operation retries
  its deletion without changing the saved result. `cleanupPending` distinguishes
  successful Save from a remaining deletion error. There is no scan or collector.
- Abandoned uploads, failed deletions and late-arriving bytes may remain private
  indefinitely without another attempt of that same operation. No idle cleanup
  deadline is promised. Request outcomes remain for idempotent retries.

## Why this is smaller

Standard uploads support 10 MB; Supabase recommends resumable uploads above 6 MB
for reliability, rather than imposing a 6 MB limit. For occasional templates,
retrying a whole file is an acceptable simplification. Actual ordinary 10 MB raw
and multipart transfers succeeded. Uploaded bytes go directly to Supabase, so this
choice does not depend on unverified Vercel inbound-body beta settings.

No-upsert Storage completion preserves an existing live object. The implementation
relies on that documented provider contract and prevents deletion while a request
can publish. It does not claim that every adversarial protocol variation was
experimentally tested.

Provider lifecycle policies currently expire only noncurrent object versions;
that cannot detect an unused current object or protect a clinic association.
An idle-time guarantee would require another scheduled execution mechanism.
Deleting the affected file within its operation avoids that extra infrastructure
and manual maintenance obligation, with the retention limit stated above.

## Sources

Inspected 2026-11-26 with Supabase JS 2.119.0, CLI 3.0.0 and Next.js 16.4.3:

- [Standard uploads](https://supabase.com/docs/guides/storage/uploads/standard-uploads)
- [Signed upload capability](https://supabase.com/docs/reference/javascript/file-buckets-createsigneduploadurl)
- [Signed upload options](https://supabase.com/docs/reference/javascript/file-buckets-uploadtosignedurl)
- [Provider completion contract](https://github.com/supabase/storage/blob/4341c445f963ad7372629f6fede14f3e240a1541/src/storage/uploader.ts#L237)
- [Delete actual objects through the API](https://supabase.com/docs/guides/storage/management/delete-objects)
- [Lifecycle policy limitations](https://supabase.com/docs/guides/storage/buckets/lifecycle-policies)
