---
id: versioning-and-releases
part: 12
title: Versioning and Releases
minutes: 22
level: Professional
topics: 118 Versioning | 119 Releases | 120 GitHub releases
objectives:
- Choose version numbers using Semantic Versioning
- Run a release from Git: prepare, tag, push, publish
- Maintain release branches and ship patch releases
- Publish a GitHub Release with notes and downloadable assets
concepts: semantic versioning | release | tag | release branch | changelog | GitHub release
commands: git tag -a | git push --follow-tags | git log v1.3.0..v1.4.0 | gh release create
---
Tags record *where* a release is. This chapter covers *what* to call it, *how* to cut it, and how to publish it so people can find and use it.

## Semantic Versioning

Most software uses **Semantic Versioning** (SemVer): `MAJOR.MINOR.PATCH`.

| Part | Increase when | Example |
|---|---|---|
| **MAJOR** | You make **incompatible** changes (users must change something) | `2.4.1` → `3.0.0` |
| **MINOR** | You **add** functionality in a backwards-compatible way | `2.4.1` → `2.5.0` |
| **PATCH** | You make backwards-compatible **bug fixes** | `2.4.1` → `2.4.2` |

Rules that come with it:

- When you increase a number, reset the ones to its right: `2.4.1` → `2.5.0`, not `2.5.1`.
- **Pre-releases** add a hyphen: `3.0.0-alpha.1`, `3.0.0-beta.2`, `3.0.0-rc.1` (release candidate). They sort **before** `3.0.0`.
- **Build metadata** adds a plus: `3.0.0+build.417`. It's ignored when comparing versions.
- `0.y.z` means "initial development: anything may change".

Git tags conventionally add a `v`: `v2.5.0`. Pick one convention and stick to it.

Other schemes exist. **Calendar Versioning** (CalVer, e.g. `2026.03.1`) suits products released on a schedule; many web applications that deploy continuously just use dates or build numbers. What matters is that your team agrees and tags consistently.

## Seeing what changed between versions

```bash
$ git log --oneline v2.4.0..v2.5.0            # commits in 2.5.0 that weren't in 2.4.0
$ git log --oneline --first-parent v2.4.0..v2.5.0   # just the merged PRs, if you use merge commits
$ git diff --stat v2.4.0 v2.5.0               # files changed
$ git shortlog v2.4.0..v2.5.0                 # grouped by author
```

These are the raw material for a **changelog**: a human-written list of notable changes per version, usually in `CHANGELOG.md`, grouped as Added, Changed, Fixed, Removed. Tools can generate a first draft from commit messages, especially if the team uses Conventional Commits (Chapter 59).

## Cutting a release

A typical manual release from `main`:

```bash
$ git switch main && git pull                  # 1. start from the exact code you're releasing
$ npm version 2.5.0 --no-git-tag-version       # 2. bump the version in project files (tool-specific)
$ $EDITOR CHANGELOG.md                         # 3. write the changelog entry
$ git commit -am "Release 2.5.0"               # 4. commit the release preparation
$ git tag -a v2.5.0 -m "Release 2.5.0"         # 5. tag it
$ git push --follow-tags                       # 6. push the commit and the tag together
```

On most teams, step 4 happens through a pull request (because `main` is protected), and the tag push in step 6 **triggers CI** to build, test and publish artifacts (packages, containers, app store builds). Chapter 80 covers release automation.

:::tip Tag the commit you actually tested
Tag exactly the commit CI built and QA tested, not "roughly the same code". If anything lands on `main` in between, check it out by hash before tagging.
:::

## Release branches and patch releases

If you support a version while developing the next, use a **release branch**:

```graph Release branch with a hotfix
A---B---C---D---E---F   main
         \       ^
          R1--R2   release/2.4
          |    |
       v2.4.0 v2.4.1
```

1. When `2.4.0` is ready, branch `release/2.4` from `main` and tag `v2.4.0` on it.
2. `main` moves on toward 2.5.
3. A bug is found in 2.4: fix it on `main`, then cherry-pick (`-x`) onto `release/2.4` (Chapter 47), or fix it on the release branch and merge the release branch back into `main`.
4. Tag `v2.4.1` on the release branch and push.

Teams releasing continuously from `main` often skip release branches entirely and just tag `main`. Chapter 56 compares strategies.

## GitHub Releases

A **GitHub Release** is a page attached to a tag, with release notes and optional downloadable files (**assets**) such as binaries or installers. It's what users see in the repository's sidebar under "Releases".

### Creating one on the web

1. Repository → **Releases** → **Draft a new release**.
2. **Choose a tag**: select an existing tag, or type a new one and GitHub creates it on the branch you choose.
3. Title, e.g. `v2.5.0`.
4. Click **Generate release notes** to draft notes from merged pull requests since the previous release. Edit them into something readable.
5. Attach assets (drag files in) if you ship binaries.
6. Tick **Set as a pre-release** for alpha/beta/rc versions, or **Set as the latest release** for the current stable one.
7. **Publish**, or **Save draft** to finish later.

### Creating one from the terminal

```bash
$ gh release create v2.5.0 --title "v2.5.0" --generate-notes
$ gh release create v3.0.0-rc.1 --prerelease --notes-file notes.md ./dist/app.zip
```

`gh` is GitHub's official CLI. If the tag doesn't exist yet, it's created on the default branch; pushing your own annotated tag first gives you more control.

:::note Releases are GitHub's layer
A GitHub Release is not part of Git; cloning the repository doesn't copy release notes or assets. The **tag** is the Git part. Deleting a release on GitHub doesn't delete its tag, and vice versa you'd delete the tag separately.
:::

### Automating it

Many teams let CI create the release: pushing a `v*` tag triggers a GitHub Actions workflow that builds, runs tests, uploads assets and publishes the release with generated notes (Chapter 55).

:::recap
### What you learned
- SemVer: MAJOR for breaking changes, MINOR for compatible features, PATCH for fixes; pre-releases use `-rc.1` style suffixes.
- `git log A..B`, `--first-parent` and `git shortlog` summarise what changed between versions for a changelog.
- A release: update from main, bump version, changelog, commit, annotated tag, `push --follow-tags`, then CI publishes.
- Release branches let you ship patch releases for older versions while main moves on.
- GitHub Releases attach notes and assets to a tag; create them on the web or with `gh release create`.

### Key terms
```terms
Semantic Versioning :: The MAJOR.MINOR.PATCH scheme communicating the impact of changes.
Pre-release :: A version like 3.0.0-rc.1 that precedes the final release.
Changelog :: A curated, human-readable list of notable changes per version.
Release branch :: A branch used to stabilise and patch a released version.
GitHub Release :: A GitHub page for a tag, with notes and downloadable assets.
```

### Key commands
```commands
git log --oneline vA..vB :: Commits between two versions.
git shortlog vA..vB :: Changes grouped by author.
git tag -a vX.Y.Z -m "Release X.Y.Z" :: Tag a release.
git push --follow-tags :: Push the release commit and its tag.
gh release create vX.Y.Z --generate-notes :: Publish a GitHub Release.
```

### Common mistakes
- Bumping MINOR for a breaking change (surprising users).
- Tagging a commit that wasn't the one tested.
- Forgetting to push the tag, so CI never builds the release.
- Treating GitHub Releases as part of the Git history.

### Quick quiz
```quiz
? Your library removes a public function that users call. Current version 2.7.3. Next version?
+ 3.0.0
- 2.8.0
- 2.7.4
- 2.7.3-breaking
> Removing public API is incompatible: increase MAJOR and reset the others.

? Which sorts first according to SemVer?
+ 3.0.0-rc.1
- 3.0.0
- 3.0.1
- 3.1.0
> Pre-releases come before the corresponding final release.

? [scenario] Customers on 2.4 need a fix while main is working toward 2.5. What's a standard approach?
+ Apply the fix to release/2.4 (cherry-pick from main or fix there and merge back), then tag v2.4.1
- Tag the current main as v2.4.1
- Move the v2.4.0 tag to include the fix
- Tell customers to wait for 2.5
> Release branches exist to patch released versions independently.

? [tf] Cloning a repository copies its GitHub Release notes and assets.
- True
+ False
> Releases are a GitHub feature layered on top of tags. Only the tags are part of Git.
```

### Practical exercise
````exercise Run a release
In a practice repository with a remote on GitHub (or a bare local "server"):
1. Add a `CHANGELOG.md` with a `## 0.2.0` section listing changes since `v0.1.0` (use `git log --oneline v0.1.0..`).
2. Commit "Release 0.2.0", tag `v0.2.0` (annotated), push with `--follow-tags`.
3. If on GitHub, create a release for `v0.2.0` with generated notes (web or `gh`).
---solution---
```bash
$ git log --oneline v0.1.0..HEAD           # material for the changelog
$ $EDITOR CHANGELOG.md
$ git add CHANGELOG.md && git commit -m "Release 0.2.0"
$ git tag -a v0.2.0 -m "Release 0.2.0"
$ git push --follow-tags
$ gh release create v0.2.0 --title "v0.2.0" --generate-notes
```
````

### What to learn next
You've worked with GitHub throughout. Part 13 covers it properly: repositories, pull requests, code review, protection rules and automation.
:::
