# Git workflow

## Branches

- `main` is the primary release branch.
- `develop` is the integration branch for development.
- Create each feature branch from an up-to-date `develop`, and merge it back into `develop` when complete.
- Merge `develop` into `main` to release, then create a tag on the resulting commit on `main`.

Use `feature/<short-description>` for feature branches, for example `feature/clinic-management`.

If `develop` does not exist yet, establish it from the agreed baseline before starting the first feature; do not silently start features from `main` when `develop` is missing.

## Feature delivery

1. Check the working tree and preserve unrelated work.
2. Update `develop` from its remote, if configured, and create the feature branch from it.
3. Implement and validate the change using the checks in [AGENTS.md](../AGENTS.md).
4. Publish the feature branch and open a pull request targeting `develop`. Follow the [development workflow contract](development-workflow.md) for separate review, corrections, and evidence.
5. Include the task/index `done` update in the PR once implementation, required checks, and independent review are complete. Ensure final review covers that update. Present it as ready for human acceptance, with approval and merge pending in GitHub. The user reviews and manually merges it into `develop`; agents never merge PRs. No post-merge status commit is required.

## Releases and tags

1. Validate the release on `develop`.
2. Merge `develop` into `main`.
3. Create an annotated release tag on the resulting commit on `main`.
4. When publishing the release, push `main` and the specific release tag.

Recommended tag format: `v<major>.<minor>.<patch>`, for example `v0.1.0`. The versioning policy and first release number remain to be agreed; do not infer a release version from the example.

Create the tag after the merge so that it identifies the released state of `main`. Tags should not be moved or reused for different commits.

The merge strategy (merge commit, squash, or rebase) and branch protection settings remain to be agreed. This document defines the workflow; it does not configure repository hosting or automation.
