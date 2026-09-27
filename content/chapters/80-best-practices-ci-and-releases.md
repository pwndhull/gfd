---
id: best-practices-ci-and-releases
part: 17
title: Git, CI/CD and Release Practices
minutes: 20
level: Professional
topics: CI/CD interaction | Release practices
objectives:
- Explain how Git events drive continuous integration and delivery
- Keep main releasable with required checks, merge queues and feature flags
- Run releases from tags reproducibly, with changelogs and rollback plans
- Handle hotfixes and deployments in a Git-centred way
concepts: CI | continuous delivery | required status check | merge queue | tag | release branch | feature flag | semantic versioning
commands: git tag -a | git push --follow-tags | git describe | git revert | gh release create
---
Your Git history is also the input to your delivery pipeline. Pushes trigger builds, merges trigger deployments, tags trigger releases. This final chapter connects Git practices to shipping software reliably.

## Git events drive the pipeline

| Git event | Typical automation |
|---|---|
| Push to any branch | Build, unit tests, lint |
| Pull request opened or updated | Full CI on the merge result; preview environment |
| Merge to `main` | Deploy to staging (or production, in continuous deployment) |
| Tag `v*` pushed | Build release artifacts, publish packages, create a GitHub Release |
| Push to `release/*` | Build and test the release candidate |
| Schedule | Nightly security scans, dependency updates |

Because workflows live in the repository (Chapter 55), pipeline changes are reviewed like code, and old commits build with the pipeline they had at the time.

## Keeping main releasable

The foundation of continuous delivery is simple: **every commit on `main` could be released**. Practices that make that true:

- **Required status checks** on `main` (Chapter 53).
- **"Require branches to be up to date"** or a **merge queue**, so checks run on the actual combination that lands.
- **Small PRs, merged often** (Chapter 57): less to go wrong per merge, easier to find what did.
- **Feature flags** for unfinished work (Chapter 56): merge daily, release when ready.
- **Fast CI**: if the pipeline takes an hour, people batch changes and skip steps. Aim for minutes.
- **Fix or revert red builds immediately**: a broken `main` blocks everyone. Revert first (Chapter 42), investigate second.

## Reproducible releases from tags

A release should be traceable to exactly one commit, and rebuildable from it.

```bash
$ git switch main && git pull
$ git log --oneline $(git describe --tags --abbrev=0)..HEAD    # what's in this release?
$ git tag -a v2.6.0 -m "Release 2.6.0"
$ git push --follow-tags                                        # CI builds and publishes from the tag
```

Practices:

- **Tag the commit CI tested**, never a local-only commit.
- **Annotated (ideally signed) tags** (Chapters 48 and 79).
- **Semantic versions** that communicate impact (Chapter 49).
- **Build once, promote**: the artifact built from the tag moves from staging to production unchanged, rather than being rebuilt.
- **Embed the version and commit** in the build (for example `git describe --tags` output) so running software can tell you exactly what it is.
- **Changelogs** from Conventional Commits or curated by hand, attached to the GitHub Release.
- **Never move a published tag**; release a new version instead.

## Release models

| Model | How Git is used | Fits |
|---|---|---|
| **Continuous deployment** | Every merge to `main` deploys; tags optional or automatic | Web services with strong tests and flags |
| **Continuous delivery with tagged releases** | `main` always releasable; releases are tags cut on demand | Most SaaS teams |
| **Release branches** | `release/x.y` stabilises while `main` continues; fixes cherry-picked with `-x` | Versioned products, mobile apps, libraries |
| **GitFlow** | `develop` → `release/*` → `main`; hotfix branches | Scheduled releases with long stabilisation (Chapter 56) |

## Hotfixes

When production needs a fix now:

1. **Reproduce and fix** on a branch from the **released** code: from the tag or the release branch, not from a busy `main`.

```bash
$ git switch -c hotfix/2.6.1 v2.6.0
# fix, test, commit
```

2. **Review** quickly but properly (a small PR).
3. **Release**: merge into the release branch (or tag the hotfix branch), tag `v2.6.1`, push the tag.
4. **Bring the fix to `main`**: merge the hotfix branch into `main`, or cherry-pick with `-x` (Chapter 47). Don't let the fix exist only in the release line, or the next release regresses.

## Rollback

Have a plan before you need it:

- **Redeploy the previous tag's artifact**: the fastest rollback, and why builds should be reproducible and kept.
- **Revert the change** on `main` and let the pipeline deploy the revert (Chapter 42).
- **Turn off the feature flag**, if the change was flagged: no deployment needed at all.

Avoid rolling back by rewriting history: force-pushing `main` breaks every clone and the audit trail.

## A release checklist

- [ ] `main` is green; required checks passed on the exact commit.
- [ ] Changelog or release notes drafted from `git log previous-tag..HEAD`.
- [ ] Version bumped where the project records it.
- [ ] Annotated tag created on the tested commit and pushed.
- [ ] Pipeline built and published artifacts from the tag.
- [ ] GitHub Release published with notes (and assets, if any).
- [ ] Deployment verified; monitoring watched.
- [ ] Rollback path known: previous tag's artifact available.

## Closing thoughts

You started this book with "version control records changes over time". Everything since has been a way to make those records **useful**: commits that explain themselves, branches that isolate work, merges and rebases that combine it, recovery tools that make mistakes survivable, and team practices that let many people change one codebase safely.

The next step is practice. Work through the [labs](#labs), run the [final project](#project), and take the [final assessment](#assessment).

:::recap
### What you learned
- Pushes, pull requests, merges and tags trigger CI/CD; workflows are versioned with the code.
- Keep `main` releasable: required checks, up-to-date branches or merge queues, small PRs, flags, fast CI, and immediate reverts of red builds.
- Release from annotated tags on tested commits; build once and promote; embed versions; never move tags.
- Choose a release model that fits: continuous deployment, tagged releases, release branches or GitFlow.
- Hotfix from the released code, then bring the fix back to `main`; roll back by redeploying, reverting or flagging, not by rewriting history.

### Key terms
```terms
Continuous integration (CI) :: Automatically building and testing every change.
Continuous delivery :: Keeping main always releasable, with releases on demand.
Continuous deployment :: Automatically deploying every change that passes the pipeline.
Merge queue :: A queue that tests PRs combined with those ahead of them before merging.
Build once, promote :: Deploying the same artifact through each environment rather than rebuilding.
Rollback :: Returning production to a previous known-good state.
```

### Key commands
```commands
git describe --tags --abbrev=0 :: Find the most recent tag.
git log --oneline <last-tag>..HEAD :: What a new release contains.
git tag -a vX.Y.Z -m "Release X.Y.Z" :: Tag a release.
git push --follow-tags :: Push the commit and its tag together.
git switch -c hotfix/<version> <tag> :: Start a hotfix from released code.
git revert <hash> :: Roll back a change on main safely.
```

### Common mistakes
- Tagging a commit that wasn't tested by CI.
- Fixing production only on the release line and regressing in the next release.
- Rolling back by force-pushing `main`.
- Slow pipelines that encourage batching and skipping checks.

### Quick quiz
```quiz
? [scenario] Production needs an urgent fix. v2.6.0 is live; main has many unreleased changes. Where do you start the fix?
+ A hotfix branch from the v2.6.0 tag (or the release branch)
- Directly on main
- On develop, then wait for the next release
- On the previous feature branch
> Branching from released code ships only the fix, without unreleased work.

? What does "build once, promote" mean?
+ The artifact built from the release tag is deployed unchanged to each environment
- Build every environment from main separately
- Only build on Fridays
- Promote whoever built it
> Rebuilding per environment risks shipping something different from what was tested.

? [tf] After a hotfix ships from a release branch, it must also reach main.
+ True
- False
> Otherwise the next release from main reintroduces the bug.

? A deploy from main broke production. What's the safest Git-based rollback?
+ Revert the offending commit on main and let the pipeline deploy it (or redeploy the previous artifact)
- git reset --hard and force push main
- Delete the release tag
- Rewrite the commit message
> Reverting keeps history intact for everyone and is auditable.
```

### Practical exercise
````exercise Rehearse a release and a hotfix
In a practice repository with a remote:
1. Tag `v1.0.0` on main and push it.
2. Add two feature commits to main (unreleased).
3. A bug is reported in 1.0.0: create `hotfix/1.0.1` from the tag, fix, tag `v1.0.1`, push.
4. Bring the fix to main with a merge or `cherry-pick -x`.
5. Confirm with `git log --oneline --graph --all` and `git branch --contains` / `git log --grep` that the fix is in both lines.
---solution---
```bash
$ git tag -a v1.0.0 -m "Release 1.0.0" && git push --follow-tags
$ echo f1 > f1 && git add . && git commit -m "feat: f1" && echo f2 > f2 && git add . && git commit -m "feat: f2"
$ git switch -c hotfix/1.0.1 v1.0.0
$ echo fix > fix.txt && git add . && git commit -m "fix: correct totals"
$ git tag -a v1.0.1 -m "Release 1.0.1" && git push -u origin hotfix/1.0.1 --follow-tags
$ git switch main && git merge --no-edit hotfix/1.0.1 && git push
$ git log --oneline --graph --all -8
$ git branch --contains <fix-hash>        # hotfix/1.0.1 and main
```
````

### What to learn next
Head to the practical labs to turn everything into muscle memory, then complete the final project and assessment.
:::
