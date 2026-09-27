---
id: git-tags
part: 12
title: Tags, Lightweight and Annotated
minutes: 20
level: Intermediate
topics: 115 What are tags? | 116 Lightweight tags | 117 Annotated tags
objectives:
- Explain what a tag is and how it differs from a branch
- Create lightweight and annotated tags, on HEAD or any past commit
- List, inspect, push and delete tags locally and on the remote
- Check out a tagged version safely
concepts: tag | lightweight tag | annotated tag | release | detached HEAD
commands: git tag | git tag -a | git show <tag> | git push origin <tag> | git push --follow-tags | git tag -d | git describe
---
A **tag** is a name for a specific commit that, unlike a branch, **never moves**. Tags mark the points in history that matter: releases like `v2.4.0`, deployments, milestones. When a bug report says "broken since 2.3", tags are how you find exactly what 2.3 was.

## Tags versus branches

Both are references (names pointing at commits). The difference is behaviour:

| | Branch | Tag |
|---|---|---|
| Moves when you commit | Yes | **No** |
| Meant to be changed | Yes | No; treat as permanent |
| Typical name | `feature/login`, `main` | `v2.4.0`, `release-2026-03-07` |
| Pushed by `git push` | The current branch | **No**, only when pushed explicitly |
| Checking it out | Puts you on the branch | Detached HEAD at that commit |

```snap A tag stays put while main moves on
git commit -m "Initial commit"
git commit -m "Add homepage"
git commit -m "Prepare 1.0"
git tag -a v1.0.0 -m "First release"
git commit -m "Add blog"
git commit -m "Add search"
```

## Two kinds of tag

### Lightweight tags

```cmd
git tag v1.0.0-local
tag :: Create, list or delete tags.
v1.0.0-local :: The tag name. With no other options this creates a lightweight tag on HEAD.
```

A **lightweight tag** is just a name pointing at a commit, exactly like a branch that doesn't move. No message, no author, no date. Good for private, temporary bookmarks: "the commit before I started this refactor".

### Annotated tags

```cmd
git tag -a v1.4.0 -m "Release 1.4.0: coupons and faster checkout"
-a :: Create an annotated tag: a full object in Git's database with its own author (the tagger), date and message.
v1.4.0 :: The tag name.
-m "..." :: The tag message. Without -m, Git opens your editor.
```

An **annotated tag** is a separate object that records **who** tagged, **when**, and **why**, and can be cryptographically signed (`git tag -s`). Use annotated tags for anything public: releases, versions, deployments.

```bash
$ git show v1.4.0
tag v1.4.0
Tagger: Priya Sharma <priya@acme.dev>
Date:   Sat Mar 7 11:02:44 2026 +1000

Release 1.4.0: coupons and faster checkout

commit 8d1c4e2a7b0f39e5c6d1a8b2f4e7c9d0a1b2c3d4 (tag: v1.4.0, main)
Author: Ben Okafor <ben@acme.dev>
Date:   Fri Mar 6 16:40:12 2026 +1000

    Validate coupon expiry
...
```

A lightweight tag's `git show` goes straight to the commit, with no tag header.

:::tip Default to annotated
Many tools (such as `git describe` by default, and `git push --follow-tags`) only consider annotated tags. For anything other people will see, always use `-a`.
:::

## Tagging an older commit

Forgot to tag the release when it shipped? Tag any commit by adding its hash:

```bash
$ git log --oneline -5
$ git tag -a v1.3.2 -m "Hotfix release 1.3.2" 51c0e2a
```

## Listing and finding tags

```bash
$ git tag                              # all tags, alphabetically
$ git tag -l "v1.4.*"                  # tags matching a pattern
$ git tag --sort=-v:refname            # newest version first (sorts 1.10 after 1.9 correctly)
$ git tag --contains 03013a1           # which releases include this commit?
$ git log --oneline --decorate         # tags appear as (tag: v1.4.0)
```

### Where am I relative to the last release?

```bash
$ git describe
v1.4.0-3-g8d1c4e2
```

Read it as: the nearest annotated tag is `v1.4.0`; you're **3** commits after it; the current commit is `8d1c4e2` (`g` stands for Git). Build scripts often embed this string as a version number for non-release builds.

## Pushing tags

`git push` does **not** send tags. Push them deliberately:

| Command | Pushes |
|---|---|
| `git push origin v1.4.0` | One tag |
| `git push --follow-tags` | Your branch, plus annotated tags pointing at commits being pushed |
| `git push origin --tags` | **Every** local tag, including lightweight experiments |

`--follow-tags` is the tidy choice; `git config --global push.followTags true` makes it automatic. Avoid `--tags` if you keep private lightweight tags.

## Deleting and moving tags

```bash
$ git tag -d v1.4.0-rc1                   # delete locally
$ git push origin --delete v1.4.0-rc1     # delete on the remote
```

:::danger Don't move published tags
Once a tag is pushed, people and systems rely on it meaning exactly one commit: package registries, deploy pipelines, colleagues' clones. Git won't even update an existing tag on `git fetch` by default. If a release was wrong, make a new version (`v1.4.1`) rather than retagging `v1.4.0`. (`git tag -f` and `git push --force` can move a tag, but it causes exactly the confusion tags exist to prevent.)
:::

## Checking out a tag

To run or inspect an old release:

```bash
$ git switch --detach v1.3.2              # or: git checkout v1.3.2
HEAD is now at 51c0e2a Fix totals rounding
```

You're in detached HEAD (Chapter 61), because a tag can't move to follow new commits. To make changes from there, such as a hotfix on an old version, create a branch:

```bash
$ git switch -c hotfix/1.3.3 v1.3.2
```

## Try it

Create an annotated tag, make another commit, and watch the tag stay behind while `main` moves.

```viz tags
```

:::recap
### What you learned
- A tag is a fixed name for a commit; branches move, tags don't.
- Lightweight tags are bare names; annotated tags (`-a`) store tagger, date and message and can be signed. Use annotated tags for releases.
- Tag old commits by passing a hash. List with patterns and version sorting; `git describe` shows your distance from the last tag.
- Tags aren't pushed by default: push one, or use `--follow-tags`.
- Never move a published tag; release a new version instead.

### Key terms
```terms
Tag :: A fixed name pointing at a commit.
Lightweight tag :: A tag that's only a name, with no extra metadata.
Annotated tag :: A tag object with tagger, date, message and optional signature.
Tagger :: The person who created an annotated tag.
git describe :: A command naming a commit relative to the nearest annotated tag.
```

### Key commands
```commands
git tag <name> :: Create a lightweight tag on HEAD.
git tag -a <name> -m "msg" [commit] :: Create an annotated tag.
git tag -l "pattern" :: List matching tags.
git show <tag> :: Show a tag and its commit.
git push origin <tag> :: Push one tag.
git push --follow-tags :: Push annotated tags with the branch.
git tag -d <name> / git push origin --delete <name> :: Delete a tag locally / remotely.
git describe :: Describe HEAD relative to the latest tag.
```

### Common mistakes
- Forgetting to push tags.
- Using lightweight tags for releases.
- Moving a published tag instead of creating a new version.
- Committing in detached HEAD after checking out a tag, then losing the work.

### Quick quiz
```quiz
? [state] You tag commit C as v1.0 and then make two more commits on main. Where does v1.0 point?
+ Still at C
- At the latest commit on main
- At the first new commit
- Nowhere; tags are deleted when you commit
> Tags never move on their own.

? What does an annotated tag store that a lightweight tag doesn't?
+ Tagger name, date and a message (and optionally a signature)
- The full project files
- A list of all commits in the release
- The branch name
> Annotated tags are full objects with metadata; lightweight tags are just names.

? [tf] git push sends all your new tags to the remote.
- True
+ False
> Tags must be pushed explicitly, or with --follow-tags.

? [predict] What does this mean?
| $ git describe
| v2.1.0-5-g3c9e1a0
+ HEAD is 5 commits after the annotated tag v2.1.0, at commit 3c9e1a0
- Version 2.1.0 has 5 bugs
- The tag v2.1.0 was moved 5 times
- You are on branch g3c9e1a0
> describe = nearest tag, commit count since it, and the abbreviated hash prefixed with g.

? [scenario] You pushed v3.0.0 on the wrong commit and CI already published packages. What should you do?
+ Fix the problem and release v3.0.1
- Delete and recreate v3.0.0 on the right commit, force pushing
- Rename the tag to v3.0.0-final
- Nothing; tags can't be wrong
> Consumers may already have v3.0.0. A new version is unambiguous.
```

### Practical exercise
````exercise Tag a release and inspect it
In a practice repository:
1. Create an annotated tag `v0.1.0` on the current commit and a lightweight tag `before-refactor`.
2. Make two commits, then tag the first of them `v0.1.1` after the fact.
3. Compare `git show v0.1.0` with `git show before-refactor`.
4. Run `git describe`, then push only `v0.1.0` and `v0.1.1` if you have a remote.
---solution---
```bash
$ git tag -a v0.1.0 -m "First preview" && git tag before-refactor
$ echo a > a && git add a && git commit -m "Refactor A" && echo b > b && git add b && git commit -m "Refactor B"
$ git tag -a v0.1.1 -m "Refactor preview" HEAD~1
$ git show v0.1.0          # starts with "tag v0.1.0" and "Tagger:"
$ git show before-refactor # starts directly with "commit ..."
$ git describe             # v0.1.1-1-g<hash>
$ git push origin v0.1.0 v0.1.1
```
````

### What to learn next
Tags name versions. Next: choosing version numbers, running a release, and publishing it as a GitHub Release.
:::
