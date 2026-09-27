---
id: viewing-and-comparing-commits
part: 6
title: Viewing and Comparing Commits
minutes: 20
level: Intermediate
topics: 66 Viewing commits | 67 Comparing commits
objectives:
- Show any commit's message and changes with git show
- View or restore a file exactly as it was in any commit
- Compare two commits, branches or tags, and limit the comparison to paths
- Use A..B and A...B correctly in both git log and git diff
concepts: commit | diff | range | merge base | tree
commands: git show | git show <commit>:<path> | git diff <a> <b> | git log A..B | git log A...B | git merge-base
---
You've seen `git log` for lists of commits and `git diff` for changes. This chapter closes the gap: looking at one commit in detail, at files from the past, and comparing any two points in history precisely.

## git show: one commit, in full

```cmd
git show a91be03
show :: Display an object. For a commit: its metadata, message and the diff against its parent.
a91be03 :: The commit to show. Defaults to HEAD. Any reference works: main~2, v1.4.0, HEAD^2.
```

```bash
$ git show a91be03
commit a91be03e2b7c...
Author: Ben Okafor <ben@acme.dev>
Date:   Mon Mar 2 16:20:11 2026 +1000

    Validate coupon expiry

diff --git a/src/coupons.js b/src/coupons.js
index 5d2f90b..c3e7a12 100644
--- a/src/coupons.js
+++ b/src/coupons.js
@@ -14,6 +14,9 @@ export function applyCoupon(cart, code) {
   const coupon = findCoupon(code);
+  if (coupon.expiresAt < Date.now()) {
+    throw new CouponExpiredError(code);
+  }
```

Useful variations:

| Command | Shows |
|---|---|
| `git show` | HEAD's commit and diff |
| `git show --stat a91be03` | Message and changed-file summary only |
| `git show --name-only a91be03` | Message and file names only |
| `git show --no-patch a91be03` | Message and metadata only |
| `git show a91be03 -- src/coupons.js` | Only the part of the diff touching that file |
| `git show v1.4.0` | For an annotated tag: the tag message, then the commit (Chapter 48) |

For a **merge commit**, `git show` displays a "combined diff" that only shows lines that differ from *both* parents, often almost nothing. Use `git show --first-parent <merge>` or `git diff <merge>^1 <merge>` to see everything the merge brought in.

## Files from the past

Use `<commit>:<path>` to refer to a file as it was in a commit:

```bash
$ git show v1.4.0:src/config.js               # print the file as it was at v1.4.0
$ git show HEAD~5:package.json | grep version # use it in a pipeline
$ git show main:README.md > /tmp/old-readme.md
```

To **restore** an old version into your working directory:

```bash
$ git restore --source=v1.4.0 src/config.js
$ git diff                                   # review what that changed
```

`restore --source` overwrites your working copy of that one file with the version from the given commit (older equivalent: `git checkout v1.4.0 -- src/config.js`, which also stages it). Nothing else changes and no commit is made; commit it if you want to keep it.

:::warning restore overwrites uncommitted edits to that file
If you had unsaved work in `src/config.js`, it's replaced. Commit or stash first if unsure.
:::

To list a folder at a point in history:

```bash
$ git ls-tree --name-only -r v1.4.0 src/
```

## Comparing two commits

`git diff` takes any two references:

```bash
$ git diff v1.3.0 v1.4.0 --stat           # what changed between two releases
$ git diff main feature/coupons           # snapshots of two branch tips
$ git diff HEAD~3 HEAD -- src/            # last three commits, only src/
$ git diff a91be03^ a91be03               # same as git show a91be03's diff
```

The order matters: `git diff A B` shows how to get **from A to B**. Swap them and every `+` becomes a `-`.

## Ranges: two dots and three dots

These forms appear everywhere, and **they mean different things in `log` and `diff`**. Use this graph:

```graph Example history
          E---F   feature
         /
A---B---C---D     main
```

C is the **merge base**: the most recent commit both branches share.

| Command | Result | Plain English |
|---|---|---|
| `git log main..feature` | E, F | Commits on feature that aren't on main (what merging feature would bring) |
| `git log feature..main` | D | Commits on main that feature doesn't have (what feature is missing) |
| `git log main...feature` | D, E, F | Commits on either side but not both (symmetric difference) |
| `git log --left-right main...feature` | `< D`, `> E`, `> F` | The same, marked with which side each came from |
| `git diff main..feature` | Snapshot D → snapshot F | Same as `git diff main feature` |
| `git diff main...feature` | Snapshot C → snapshot F | Only feature's changes since it branched (what a pull request shows) |

The mnemonic:

- **log**: two dots = "in B, not in A"; three dots = "in either, not both".
- **diff**: two dots = "tip to tip"; three dots = "from the fork point to B's tip".

```bash
$ git merge-base main feature
3c9e1a0...                   # the hash of C
```

`git merge-base` prints the fork point if you ever need it explicitly.

## Comparing across time with the reflog

`@{...}` references use the reflog (Chapter 43) to name where a branch *used to be*:

```bash
$ git diff main@{1} main          # what did the last pull/merge/reset change on main?
$ git log --oneline main@{yesterday}..main   # commits that arrived on main since yesterday
```

`main@{1}` means "where main pointed one move ago", and `main@{yesterday}` means "where main pointed at this time yesterday", according to your local reflog.

## Comparing two versions of a branch

After you rebase or amend a branch that's under review, reviewers want to know "what changed since I last looked?". Git has a command for exactly that:

```bash
$ git range-diff main old-feature-tip new-feature-tip
```

It pairs up the commits in both versions and shows how each one changed. GitHub's "Compare" link after a force push shows something similar.

:::recap
### What you learned
- `git show <commit>` shows a commit's message and diff; `--stat`, `--name-only` and `--no-patch` trim it.
- `<commit>:<path>` refers to a file in a commit; `git restore --source=<commit> <path>` brings it back into your working directory.
- `git diff A B` goes from A to B; limit with `-- <path>`.
- In `log`, `A..B` means "in B not A" and `A...B` means "in either, not both". In `diff`, `A..B` is tip-to-tip and `A...B` is from the merge base.
- `@{n}` and `@{date}` compare with past positions from the reflog.

### Key terms
```terms
Merge base :: The most recent commit two branches have in common.
Two-dot range :: In log, commits reachable from B but not A.
Three-dot range :: In log, the symmetric difference; in diff, changes from the merge base to B.
Combined diff :: The condensed diff git show prints for merge commits.
```

### Key commands
```commands
git show <commit> :: One commit's message and diff.
git show <commit>:<path> :: A file's content at a commit.
git restore --source=<commit> <path> :: Put an old version of a file in your working directory.
git diff <a> <b> [-- path] :: Compare two commits.
git log A..B :: Commits in B that aren't in A.
git merge-base A B :: The commit where A and B diverged.
```

### Common mistakes
- Reading `git show` on a merge commit and concluding the merge changed nothing.
- Using `git diff main..feature` for a PR-style comparison (use three dots).
- Running `git restore --source` over uncommitted edits.

### Quick quiz
```quiz
? [predict] What does this print?
| $ git show v2.0.0:package.json
+ package.json exactly as it was in the commit tagged v2.0.0
- The changes to package.json in v2.0.0
- A list of commits that touched package.json
- An error: show only works on commits
> The <commit>:<path> syntax names a file in a commit's snapshot.

? [state] main is A-B-C-D, feature is A-B-C-E-F. What does git log main..feature list?
+ E and F
- D
- D, E and F
- A, B and C
> Two dots in log: commits reachable from feature but not from main.

? Which command shows exactly what a pull request from feature into main would contain?
- git diff main feature
+ git diff main...feature
- git log main
- git show feature
> Three dots in diff compare the merge base with feature's tip, ignoring changes that happened on main since.

? [scenario] You want the version of utils.js from two commits ago back in your working directory, without changing anything else. Which command?
+ git restore --source=HEAD~2 utils.js
- git reset --hard HEAD~2
- git revert HEAD~2
- git switch HEAD~2
> restore --source overwrites just that file. reset --hard would move the branch and discard everything.
```

### Practical exercise
````exercise Time travel for one file
In a practice repository with a few commits touching the same file:
1. Show the file as it was two commits ago with `git show HEAD~2:<file>`.
2. Compare that version with today's: `git diff HEAD~2 HEAD -- <file>`.
3. Restore the old version into your working directory, inspect `git diff`, then undo with `git restore <file>`.
4. Create a branch from `HEAD~2`, commit something, and compare `git log main..<branch>` with `git log main...<branch>`.
---solution---
```bash
$ git show HEAD~2:README.md
$ git diff HEAD~2 HEAD -- README.md
$ git restore --source=HEAD~2 README.md && git diff
$ git restore README.md                 # back to the committed version
$ git switch -c side HEAD~2 && echo s > s.txt && git add s.txt && git commit -m "Side"
$ git log --oneline main..side          # only "Side"
$ git log --oneline main...side         # "Side" plus main's two newer commits
```
````

### What to learn next
You understand commits deeply. Part 7 is about combining lines of work: merging.
:::
