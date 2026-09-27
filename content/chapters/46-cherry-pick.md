---
id: cherry-pick
part: 11
title: Copying Commits with git cherry-pick
minutes: 20
level: Intermediate
topics: 109 What cherry-pick means | 110 When to use it | 111 Cherry-picking a commit
objectives:
- Explain cherry-pick as "replay one commit's changes here, as a new commit"
- Cherry-pick single commits, several commits and ranges
- Record where a commit came from with -x
- Decide when cherry-pick is the right tool and when a merge is better
concepts: cherry-pick | commit hash | patch | duplicate commit | backport
commands: git cherry-pick <commit> | git cherry-pick -x | git cherry-pick A..B | git cherry-pick -n
---
Sometimes you don't want a whole branch. You want **one commit** from it: a bug fix buried in a feature branch that production needs today, or a single change to backport to last month's release. `git cherry-pick` copies exactly that.

## What cherry-pick means

**`git cherry-pick X` takes the changes introduced by commit X (the diff between X and its parent) and applies them on top of your current branch as a brand-new commit.**

```snap Before: the fix D is on feature/checkout
git commit -m "Initial commit"
git commit -m "Add homepage"
git switch -c feature/checkout
git commit -m "Add checkout page"
git commit -m "Fix rounding bug in totals"
git commit -m "Add coupon field"
git switch main
```

```snap After: git cherry-pick D (on main)
git commit -m "Initial commit"
git commit -m "Add homepage"
git switch -c feature/checkout
git commit -m "Add checkout page"
git commit -m "Fix rounding bug in totals"
git commit -m "Add coupon field"
git switch main
git cherry-pick D
```

The new commit D′ has:

- the **same changes** and the **same message** and **author** as D,
- a **different parent** (main's tip), so a **different hash**,
- you as the **committer**.

The original D is untouched on `feature/checkout`. Rebase (Chapter 36) is essentially an automated series of cherry-picks; this is the manual, one-at-a-time version.

## Cherry-picking a commit

```cmd
git cherry-pick 03013a1
cherry-pick :: Apply the changes introduced by an existing commit onto HEAD, creating a new commit.
03013a1 :: The commit to copy. Use git log on the other branch to find it; branch names work too (they mean the branch's latest commit).
```

```bash
$ git log --oneline feature/checkout -3
5d2f90b Add coupon field
03013a1 Fix rounding bug in totals
a91be03 Add checkout page

$ git switch main
$ git cherry-pick 03013a1
[main cf52897] Fix rounding bug in totals
 Date: Sat Mar 7 10:18:19 2026 +1000
 1 file changed, 1 insertion(+), 1 deletion(-)
```

The `Date` line is the original author date, preserved from D.

## Recording where it came from: -x

```bash
$ git cherry-pick -x 03013a1
$ git log -1 --format=%B
Fix rounding bug in totals

(cherry picked from commit 03013a15c72528c11c00fe6c42695f2f40c997c5)
```

`-x` appends a line naming the original commit. It's invaluable on release branches, where people later ask "is the fix from main in 2.4?". Use it whenever the original commit is on a branch others can see.

## Several commits and ranges

```bash
$ git cherry-pick 03013a1 5d2f90b          # two specific commits, in this order
$ git cherry-pick a91be03..5d2f90b         # commits AFTER a91be03 up to 5d2f90b
$ git cherry-pick a91be03^..5d2f90b        # INCLUDING a91be03
```

Ranges follow Chapter 31's two-dot rule: `A..B` excludes A. Each commit becomes its own new commit, applied oldest first.

## Other useful options

| Option | Effect |
|---|---|
| `-x` | Append "(cherry picked from commit …)" |
| `-e` / `--edit` | Edit the message before committing |
| `-n` / `--no-commit` | Apply the changes to the staging area without committing (combine several picks into one commit) |
| `-m 1` | Required to cherry-pick a **merge** commit: which parent to diff against (usually 1) |
| `--ff` | If the commit's parent is HEAD, just fast-forward instead of copying |

## When to use cherry-pick

**Good uses:**

- **Hotfix to a release branch.** A fix landed on `main`; customers on `release/2.4` need it. Cherry-pick it with `-x` onto `release/2.4`.
- **Backporting** a fix to older supported versions.
- **Rescuing a commit** from an abandoned or broken branch.
- **Moving a commit made on the wrong branch** (combined with a reset on the original branch; Chapter 72).
- **Grabbing a small, independent change** a teammate made on their branch that you need now, when waiting for their merge isn't practical.

**Poor uses:**

- **Copying most of a branch.** Merge or rebase instead; many cherry-picks mean many duplicates.
- **Commits that depend on earlier commits** you're not picking. The change may not apply, or may apply and not work.
- **As a substitute for merging a branch that will be merged later anyway.** When the original branch merges, Git sees D and D′ as different commits with the same change. Usually Git merges them cleanly (the change is identical), but if the code evolved in between, you get confusing conflicts and duplicated entries in the log.

:::tip Prefer fixing on the oldest branch that needs it
If a fix is needed on both `main` and `release/2.4`, some teams make the fix on the release branch first and merge the release branch forward into `main`. That avoids duplicates entirely. Others fix on `main` and cherry-pick back. Follow your team's release process (Chapter 49).
:::

## Try it

The fix is `D` on `feature/checkout`. Cherry-pick it onto `main` and notice D′ gets a new hash while D stays where it was.

```viz cherry-pick
```

:::recap
### What you learned
- `git cherry-pick X` applies X's changes onto HEAD as a new commit with a new hash, keeping message and author.
- `-x` records the original commit's hash in the message; use it on shared branches.
- Pick several commits or a range (`A..B` excludes A; `A^..B` includes it).
- Great for hotfixes, backports and rescues; poor for copying whole branches or dependent commits.

### Key terms
```terms
Cherry-pick :: Copying one commit's changes onto the current branch as a new commit.
Backport :: Applying a fix to an older release line.
Duplicate commit :: Two commits with the same change but different hashes, typically from cherry-picking.
```

### Key commands
```commands
git cherry-pick <commit> :: Copy one commit onto HEAD.
git cherry-pick -x <commit> :: Copy and record the source hash.
git cherry-pick A..B :: Copy the commits after A up to B.
git cherry-pick -n <commit> :: Apply the changes without committing.
git cherry-pick -m 1 <merge> :: Copy a merge commit's changes relative to its first parent.
```

### Common mistakes
- Cherry-picking many commits instead of merging a branch.
- Cherry-picking a commit whose earlier dependencies are missing.
- Forgetting `-x` on release branches, leaving no trace of the source.

### Quick quiz
```quiz
? [state] You cherry-pick commit D (on feature) onto main. What is true about the new commit?
+ It has the same changes and message as D, but a different parent and a different hash
- It is the same commit as D, now on two branches
- D is moved from feature to main
- It has no author
> A cherry-pick creates a new commit; the original stays where it was.

? What does -x add?
+ A line "(cherry picked from commit <hash>)" to the new commit's message
- Extra safety checks
- A tag on the original commit
- A merge commit
> It records provenance, useful on release branches.

? [predict] Which commits does git cherry-pick A..C apply, if the history is A-B-C?
+ B and C
- A, B and C
- Only C
- Only A
> Two-dot ranges exclude the left side. Use A^..C to include A.

? [scenario] You need 15 of the 16 commits on a feature branch. What's usually better than cherry-picking them?
+ Merge or rebase the branch (reverting or dropping the one you don't want)
- Cherry-pick all 15 one by one
- Copy the files manually
- Cherry-pick with -n 15 times
> Many cherry-picks create many duplicate commits and future conflicts.
```

### Practical exercise
````exercise Hotfix a release line
In a practice repository:
1. On `main`, make commits "Add feature A", "Fix null check in parser", "Add feature B".
2. Create `release/1.0` from the first commit (before the fix).
3. Cherry-pick only the fix onto `release/1.0` with `-x`.
4. Compare the two commits' hashes and messages.
---solution---
```bash
$ git log --oneline -3                           # note the hash of "Fix null check in parser"
$ git switch -c release/1.0 HEAD~2               # the "Add feature A" commit
$ git cherry-pick -x <fix-hash>
$ git log -1 --format="%h %s%n%n%b"              # new hash, same subject, "(cherry picked from ...)"
$ git show --stat <fix-hash> HEAD                # same file changes
```
````

### What to learn next
Cherry-picks can conflict just like merges. Next: resolving and aborting them, and more real-world scenarios.
:::
