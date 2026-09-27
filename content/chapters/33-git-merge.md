---
id: git-merge
part: 7
title: Using git merge
minutes: 20
level: Intermediate
topics: 72 git merge
objectives:
- Merge local and remote-tracking branches into the current branch
- Choose between default, --no-ff, --ff-only and --squash deliberately
- Write useful merge commit messages
- Map GitHub's three merge buttons onto Git's behaviour
- Check what a merge will bring in before running it
concepts: merge | fast-forward | merge commit | squash merge | no-ff
commands: git merge | git merge --no-ff | git merge --ff-only | git merge --squash | git merge --abort | git merge --no-edit
---
Chapter 32 explained what merging does. This chapter is about controlling it: the handful of options you'll use, and how they correspond to what teams do on GitHub.

## Before merging: check what's coming

```bash
$ git switch main
$ git pull                                   # make sure main is current
$ git log --oneline main..feature/coupons    # which commits will come in?
$ git diff --stat main...feature/coupons     # which files will change?
$ git status                                 # clean working tree?
```

Git allows a merge with unstaged edits as long as they don't touch files the merge needs to change, but when a real merge commit is needed it refuses if you have **staged** changes, so they don't get mixed into the merge commit. Either way, a clean working tree makes it much easier to back out if something goes wrong.

## The default merge

```bash
$ git merge feature/coupons
```

Fast-forwards when possible; otherwise creates a merge commit and opens your editor with:

```text
Merge branch 'feature/coupons'

# Please enter a commit message to explain why this merge is necessary,
# especially if it merges an updated upstream into a topic branch.
```

Keep it, or add a line explaining what the branch delivered. Save and close to finish. Skip the editor with `--no-edit`, or give the message directly with `-m`:

```bash
$ git merge -m "Merge coupon support (SHOP-231)" feature/coupons
```

## Merging a remote-tracking branch

You can merge any commit reference, including `origin/*`:

```bash
$ git fetch
$ git merge origin/main       # bring the server's latest main into your current branch
```

This is exactly the second half of `git pull` (Chapter 21), and a common way to update a feature branch from `main` without touching your local `main`.

## Options that change the result

| Command | Fast-forward possible | Fast-forward not possible |
|---|---|---|
| `git merge X` | Fast-forward | Merge commit |
| `git merge --no-ff X` | **Merge commit anyway** | Merge commit |
| `git merge --ff-only X` | Fast-forward | **Refuse** |
| `git merge --squash X` | **Stage** X's combined changes; no commit made | Same |

### --no-ff: always record the merge

```bash
$ git merge --no-ff feature/coupons
Merge made by the 'ort' strategy.
```

```graph Fast-forward (default)
A---B---C---D   main, feature/coupons
```

```graph With --no-ff
A---B-------M   main
     \     /
      C---D     feature/coupons
```

`--no-ff` keeps a visible "bubble" showing that C and D arrived together as one feature, and a merge commit you can revert as a unit. Teams using merge commits on `main` often prefer it.

### --ff-only: refuse to create merge commits

```bash
$ git merge --ff-only feature/coupons
hint: Diverging branches can't be fast-forwarded, you need to either:
hint:
hint: 	git merge --no-ff
hint:
hint: or:
hint:
hint: 	git rebase
hint:
fatal: Not possible to fast-forward, aborting.
```

Useful when you expect a straight line, for example updating local `main` from `origin/main` when you never commit to `main` directly. If it refuses, something unexpected is going on, and nothing was changed.

### --squash: one new commit instead of many

```bash
$ git merge --squash feature/coupons
Automatic merge went well; stopped before committing as requested
Squash commit -- not updating HEAD
$ git status -s
M  src/cart.js
A  src/coupons.js
$ git commit -m "Add coupon support (SHOP-231)"
```

`--squash` takes the combined changes of all the branch's commits and **stages** them. You then make one ordinary commit. The result:

```graph After squash merge
A---B---S   main       (S contains C+D's changes, one parent only)
     \
      C---D   feature/coupons (unchanged, not merged in Git's eyes)
```

Things to know:

- `S` is a **normal commit** with one parent. Git doesn't record that `feature/coupons` was merged, so `git branch -d feature/coupons` will refuse (Chapter 26): use `-D` after checking.
- The branch's individual commit messages are gone from `main`'s history (Git pre-fills the editor with them if you commit without `-m`).
- If you keep working on the branch and squash again later, Git will try to re-apply changes already in `S`, causing conflicts. **Delete squashed branches**; start fresh ones.

## GitHub's three merge buttons

Most teams merge via pull requests. GitHub's options map directly onto the above:

| GitHub button | Equivalent | History on main |
|---|---|---|
| **Create a merge commit** | `git merge --no-ff` | Every branch commit, plus a merge commit |
| **Squash and merge** | `git merge --squash` + commit | One commit per pull request |
| **Rebase and merge** | Rebase the commits onto main, then fast-forward | Every branch commit, in a straight line, no merge commit |

Repository admins choose which buttons are allowed. Ask which your team uses; it affects how carefully you need to craft individual commits (with squash, only the PR title and description really matter).

## When a merge stops

A merge can stop before finishing for two reasons:

1. **Conflicts**: both sides changed the same lines. Git pauses with the files marked (next chapter).
2. **Local changes would be overwritten**: you have uncommitted edits to files the merge needs to change. Nothing happens; commit or stash, then retry.

```bash
$ git merge feature/coupons
error: Your local changes to the following files would be overwritten by merge:
	src/cart.js
Please commit your changes or stash them before you merge.
Aborting
```

In the first case, `git merge --abort` returns everything to how it was before the merge.

## Undoing a merge

| Situation | Undo |
|---|---|
| Merge in progress with conflicts | `git merge --abort` |
| Merge finished, not pushed | `git reset --hard ORIG_HEAD` (from a clean working tree) |
| Merge finished and pushed | `git revert -m 1 <merge-commit>` (Chapter 42) |

`ORIG_HEAD` is set by Git to where your branch was before a merge, rebase or reset, which makes it the fastest undo for a local merge you don't like.

:::recap
### What you learned
- Check incoming commits and files before merging; start from a clean working tree.
- `git merge X` fast-forwards when possible, otherwise makes a merge commit; `--no-edit` or `-m` controls the message.
- `--no-ff` always creates a merge commit; `--ff-only` refuses anything else; `--squash` stages the combined changes for one normal commit.
- GitHub's buttons are merge commit (`--no-ff`), squash, and rebase-then-fast-forward.
- Undo with `--abort` (in progress), `reset --hard ORIG_HEAD` (local), or `revert -m 1` (pushed).

### Key terms
```terms
--no-ff :: Always create a merge commit, even if a fast-forward is possible.
--ff-only :: Merge only if it can be a fast-forward.
Squash merge :: Combining all of a branch's changes into one new ordinary commit.
ORIG_HEAD :: A reference Git sets to your previous position before merges, rebases and resets.
```

### Key commands
```commands
git merge <branch> :: Merge into the current branch.
git merge --no-ff <branch> :: Merge with a merge commit.
git merge --ff-only <branch> :: Fast-forward only.
git merge --squash <branch> :: Stage the branch's combined changes.
git merge --abort :: Cancel a merge in progress.
git reset --hard ORIG_HEAD :: Undo a just-completed local merge.
```

### Common mistakes
- Continuing to work on a branch after squash-merging it.
- Using `git branch -d` after a squash merge and being confused by the refusal.
- Undoing a pushed merge with `reset` instead of `revert`.

### Quick quiz
```quiz
? Which GitHub merge button corresponds to git merge --no-ff?
+ Create a merge commit
- Squash and merge
- Rebase and merge
- None of them
> It keeps every commit and adds a merge commit, just like --no-ff.

? [state] After git merge --squash feature/x, what has changed?
- main has a merge commit with two parents
+ feature/x's combined changes are staged; you must commit to finish
- feature/x has been deleted
- main has fast-forwarded to feature/x
> --squash stages changes and stops. Your next commit is a normal single-parent commit.

? [predict] git merge --ff-only feature/y prints "fatal: Not possible to fast-forward, aborting." What happened to your branch?
+ Nothing; the merge was refused because the branches have diverged
- A merge commit was created
- feature/y was rebased
- Your uncommitted changes were lost
> --ff-only refuses rather than creating a merge commit.

? [scenario] You merged a branch into main locally, didn't push, and want to undo it. Safest quick undo from a clean working tree?
+ git reset --hard ORIG_HEAD
- git revert HEAD
- git merge --abort
- git push --force
> ORIG_HEAD points at main before the merge. --abort only works while a merge is still in progress.

? [tf] After a squash merge, git branch -d on the source branch usually succeeds.
- True
+ False
> Git doesn't see the branch's commits in main's history, so -d refuses. Verify, then use -D.
```

### Practical exercise
````exercise Compare merge styles
Create three identical feature branches, each with two commits, from the same point in a practice repository. Merge the first with the default, the second with `--no-ff`, and the third with `--squash` + commit. Compare `git log --oneline --graph` after each.
---solution---
```bash
$ for b in ff noff squash; do git switch -q -c f/$b main && for i in 1 2; do echo $b$i > $b$i.txt && git add . && git commit -qm "$b $i"; done; done
$ git switch main
$ git merge f/ff                        # fast-forward: straight line
$ git merge --no-ff --no-edit f/noff    # merge commit with a bubble
$ git merge --squash f/squash && git commit -m "Squash f/squash"
$ git log --oneline --graph -10
```
The fast-forward adds two commits in a line; `--no-ff` adds two commits plus a merge commit; squash adds one commit containing both changes, and `f/squash` isn't shown as merged.
````

### What to learn next
Most merges just work. The next chapter is about the ones that don't: merge conflicts, and how to read the markers Git puts in your files.
:::
