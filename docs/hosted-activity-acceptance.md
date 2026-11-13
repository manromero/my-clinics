# Hosted Activity acceptance

This suite exercises persistent creation on `/activity` with Chrome on desktop
and an emulated touch device. Each project checks the saved date, clinic and
amounts, as well as all four totals, immediately after saving, after reload and
after a fresh password sign-in in a separate browser context. Google OAuth
continues to use the [separate sign-in validation](supabase.md#google-oauth-for-hosted-development).

## One-time setup

1. Confirm `my-clinics` (`lvqbrjybwstvdhaxyxyn`) is still a synthetic-only
   development project. Verify the owner policies, activity migrations and
   Data API access under the [hosted Supabase guide](supabase.md). The suite
   accepts only `https://lvqbrjybwstvdhaxyxyn.supabase.co` and uses its
   publishable key and authenticated owner sessions.
2. Provision two exclusive Supabase Auth users with distinct synthetic emails,
   strong generated passwords, confirmed email addresses and the following
   `user_metadata.full_name` values. Create each user's active clinic at 25%
   under that user's ownership. Record the Auth user UUID and the clinic's
   numeric ID as text. Keep the fixture accounts out of interactive testing and
   avoid using their credentials for any other job.

   | Browser | `full_name`                 | Active clinic name                 |
   | ------- | --------------------------- | ---------------------------------- |
   | Desktop | Activity Acceptance Desktop | Activity Acceptance Desktop Clinic |
   | Mobile  | Activity Acceptance Mobile  | Activity Acceptance Mobile Clinic  |

3. In the GitHub repository settings, create the `hosted-activity-acceptance`
   environment. Under **Deployment branches and tags**, select **Selected
   branches and tags**, then add exact **Branch** rules for `develop` and
   `feature/hosted-activity-acceptance`. Verify the restriction before setting
   environment secrets. Keep all values in this environment, including the
   publishable key, and restrict write access to the allowed branches to trusted
   collaborators. Remove the feature-branch environment rule when pre-merge
   validation is finished and it is no longer needed.
4. Set these GitHub environment secrets through a trusted operator session.

   | Secret                                                    | Value                                        |
   | --------------------------------------------------------- | -------------------------------------------- |
   | `ACTIVITY_SUPABASE_PUBLISHABLE_KEY`                       | The approved project's `sb_publishable_` key |
   | `ACTIVITY_DESKTOP_EMAIL`, `ACTIVITY_MOBILE_EMAIL`         | The fixture users' emails                    |
   | `ACTIVITY_DESKTOP_PASSWORD`, `ACTIVITY_MOBILE_PASSWORD`   | Their passwords                              |
   | `ACTIVITY_DESKTOP_USER_ID`, `ACTIVITY_MOBILE_USER_ID`     | Their Auth user UUIDs                        |
   | `ACTIVITY_DESKTOP_CLINIC_ID`, `ACTIVITY_MOBILE_CLINIC_ID` | The fixture clinic IDs                       |

The [GitHub workflow](../.github/workflows/hosted-activity-acceptance.yml) runs
on trusted pushes to the two allowed branches in `manromero/my-clinics`. It can
also be manually dispatched for an allowed branch once the workflow is on
GitHub's default branch. The feature branch exercises the deliberate failure
after the normal suite. On manual dispatch select `diagnostic_probe` when
testing failure reporting and cleanup. Pushes to `develop` run the normal suite.

## Run and diagnose

Open the Actions run and check the job summary. The `hosted-activity-acceptance`
artifact contains project outcomes, timed step traces and Chrome screenshots
when a verified Activity screen was available. The trace identifies the failed
step and whether cleanup verified absence. Screenshots record the viewport,
device pixel ratio and Chrome version in the corresponding trace. The suite
masks the signed-in header and uses only dedicated synthetic fixture data.
Raw Playwright traces, HTML reports, video, cookies, storage state and raw
errors are excluded. Avoid enabling Playwright debugging or overriding its
reporter and capture settings with live credentials.

The intentional desktop probe must fail after confirming the saved row and
totals, produce a trace and screenshot, and report that it removed exactly one
row and verified its absence. The CI step passes only when those results match.
A login, application, artifact or cleanup failure fails the CI step.

The workflow serializes runs with a shared concurrency group and allows a
running job to finish cleanup before the next starts. Desktop and mobile use
distinct accounts and clinics. Each test chooses an unused synthetic month and
a random marker. Before saving it verifies the target, account, active fixture
and empty period. Cleanup uses the ordinary owner session and finds rows by
exact clinic ID, date and marker, deletes through `delete_activity` and checks
that the matching rows are gone. It runs after attempted saves even when an
assertion fails. The artifact's synthetic marker and date identify the affected
scope for investigation if a runner is interrupted or cleanup fails.

For local diagnosis, coordinate with the operator so that no Actions job or
other local suite is using these fixtures. Load the same settings into a
dedicated shell from the operator's secret store, using the approved URL for
`NEXT_PUBLIC_SUPABASE_URL` and the publishable key for
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Run the production build and suite from
the repository root. Use a shell without `DEBUG` or `PWDEBUG` set.

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm exec playwright install chrome
pnpm test:hosted-activity
```

The suite starts its own app on `127.0.0.1:3205` and refuses to reuse an
existing server. To verify the target guard without credentials or network
access, run `pnpm test:hosted-activity-tooling`.
