---
id: git-reset
part: 9
title: git reset and Its Three Modes
minutes: 28
level: Intermediate
topics: 92 git reset | 93 Soft reset | 94 Mixed reset | 95 Hard reset
objectives:
- Explain reset as "move the current branch", plus optional changes to the index and files
- Predict exactly what --soft, --mixed and --hard do to each of the three areas
- Use reset to undo commits, squash recent commits and discard local work
- Know when reset is dangerous and how to recover from a bad reset
concepts: reset | soft reset | mixed reset | hard reset | HEAD | staging area | working directory | ORIG_HEAD
commands: git reset --soft | git reset --mixed | git reset --hard | git reset HEAD~1 | git reset --hard ORIG_HEAD
---
`git reset` has a scary reputation because one of its three modes can destroy uncommitted work. Once you see that all three modes do the same first thing, and differ only in how far they go afterwards, reset becomes one of the most useful tools you have.

## What reset does

```cmd
git reset --mixed HEAD~1
reset :: Move the current branch (and HEAD with it) to a different commit, then optionally update the staging area and working directory to match.
--mixed :: The mode: how far to go. --soft, --mixed (the default) or --hard.
HEAD~1 :: The target commit: here, the parent of the current commit.
```

Every reset performs up to three steps, stopping according to the mode:

1. **Move the branch** that HEAD points to, so it points at the target commit. *(all modes)*
2. **Reset the staging area** to match the target commit. *(mixed and hard)*
3. **Reset the working directory** to match the target commit. *(hard only)*

```diagram reset-modes
```

Remember: **soft moves one thing, mixed moves two, hard moves three.**

## Setting the scene

All the examples start here: three commits, the last of which you want to undo.

```graph Starting point
A---B---C   main  <- HEAD
```

C added a line to `a.txt`. The working directory and staging area both match C (a clean state).

## --soft: undo the commit, keep everything staged

```bash
$ git reset --soft HEAD~1
$ git status -s
M  a.txt
```

```graph After reset --soft HEAD~1
A---B   main  <- HEAD        (C's changes are staged)
     \
      C   (unreachable)
```

The branch moved back to B. C's changes are still in the staging area and working directory, **staged and ready to commit again**.

Use it to:

- **redo the last commit** with a different message or extra files (similar to `--amend`),
- **squash the last few commits into one**:

```bash
$ git reset --soft HEAD~3          # undo three commits, keep all their changes staged
$ git commit -m "Add password reset flow"
```

## --mixed (the default): undo the commit, keep changes unstaged

```bash
$ git reset HEAD~1                 # same as git reset --mixed HEAD~1
Unstaged changes after reset:
M	a.txt
$ git status -s
 M a.txt
```

The branch moved back to B, and the staging area was reset to B. C's changes remain in your working directory as **unstaged edits**.

Use it to:

- **undo a commit and re-split it** into several commits with `git add -p` (Chapter 38 used this inside `edit`),
- **unstage files**: `git reset <file>` with a path and no commit is the classic "unstage" form (`git restore --staged` is the modern equivalent).

:::note reset with a path
`git reset <path>` doesn't move any branch. It only copies HEAD's version of that path into the staging area: i.e., it unstages. Branch-moving and path forms of `reset` are different operations sharing a name.
:::

## --hard: make everything match the target

```bash
$ git reset --hard HEAD~1
HEAD is now at 158f651 Change prices
$ git status -s
$
```

The branch, the staging area **and the working directory** now match B exactly. C's changes are gone from your files.

Use it to:

- **throw away local commits** you don't want,
- **throw away all uncommitted changes** to tracked files: `git reset --hard` (target defaults to HEAD),
- **make a branch match the server**: `git reset --hard origin/main`,
- **undo a merge or rebase you just did**: `git reset --hard ORIG_HEAD`.

:::danger --hard destroys uncommitted work
Committed work that `--hard` moves past can be recovered through the reflog (Chapter 43). **Uncommitted** changes in tracked files are overwritten and gone for good. Before any `reset --hard`, run `git status`. If anything is modified that you might want, stash or commit it first. (Untracked files are left alone by reset.)
:::

## The three modes compared

| | Branch / HEAD | Staging area | Working directory | Undo commit's changes end up… | Risk |
|---|---|---|---|---|---|
| `--soft` | Moves | Unchanged | Unchanged | Staged | None |
| `--mixed` | Moves | Reset | Unchanged | Unstaged in files | None |
| `--hard` | Moves | Reset | Reset | **Gone** from files (commits recoverable) | Uncommitted work lost |

Try all three in the sandbox. It models only the branch movement (it has no files), but prints what real Git would do to your staging area and files, and dims the commits you stepped over so you can see they still exist.

```viz reset
```

## Reset targets

You can reset to anything that names a commit:

| Target | Meaning |
|---|---|
| `HEAD~1`, `HEAD~3` | One or three commits back |
| `a91be03` | A specific commit |
| `origin/main` | Where the server's main was at your last fetch |
| `ORIG_HEAD` | Where you were before the last merge, rebase or reset |
| `HEAD@{2}` | Where HEAD was two moves ago (reflog) |

Resetting **forward** is also possible: after `git reset --hard HEAD~2`, `git reset --hard ORIG_HEAD` (or `HEAD@{1}`) moves you right back.

## When not to use reset

Reset moves a branch backward, removing commits from it. **If those commits were already pushed** and others may have them, resetting and force-pushing rewrites shared history (Chapter 37). For pushed commits, use `git revert` instead (next chapter), which undoes changes by adding a new commit.

| Situation | Use |
|---|---|
| Undo commits that are only on my machine | `git reset` |
| Undo commits already on a shared branch | `git revert` |
| Squash my last few unpushed commits | `git reset --soft HEAD~n` then commit, or interactive rebase |
| Throw away everything I haven't committed | `git reset --hard` (after checking status) or `git stash` |
| Make my local main identical to the server | `git fetch` then `git reset --hard origin/main` |

## Recovering from a bad reset

You ran `git reset --hard HEAD~3` and those commits mattered. They're not on any branch, but they still exist:

```bash
$ git reflog -n 3
158f651 HEAD@{0}: reset: moving to HEAD~3
e4c9b18 HEAD@{1}: commit: Add FAQ
...
$ git reset --hard e4c9b18           # or: git reset --hard HEAD@{1}
```

The next chapter but one covers the reflog in depth, and Chapter 74 covers recovery after a hard reset in real-world detail.

:::recap
### What you learned
- `git reset <mode> <commit>` moves the current branch to the commit, then optionally resets the staging area and working directory.
- `--soft` moves only the branch (changes stay staged); `--mixed` also resets the staging area (changes become unstaged); `--hard` also resets files (uncommitted changes lost).
- `git reset <path>` is a different operation: it unstages.
- Use reset for unpushed commits; use revert for pushed ones.
- Committed work passed over by reset is recoverable via the reflog; uncommitted work lost by `--hard` is not.

### Key terms
```terms
Reset :: Move the current branch to another commit, optionally resetting the index and working directory.
Soft reset :: Move the branch only.
Mixed reset :: Move the branch and reset the staging area (default).
Hard reset :: Move the branch and reset the staging area and working directory.
ORIG_HEAD :: The previous position saved by reset, merge and rebase.
```

### Key commands
```commands
git reset --soft HEAD~1 :: Undo the last commit, keep changes staged.
git reset HEAD~1 :: Undo the last commit, keep changes unstaged.
git reset --hard HEAD~1 :: Undo the last commit and discard its changes.
git reset --hard :: Discard all uncommitted changes to tracked files.
git reset --hard origin/main :: Make the current branch match the fetched server branch.
git reset --hard ORIG_HEAD :: Undo the last merge, rebase or reset.
```

### Common mistakes
- Using `--hard` with uncommitted work you wanted.
- Resetting commits that were already pushed to a shared branch.
- Expecting reset to remove untracked files (use `git clean`).
- Confusing `git reset <file>` (unstage) with `git reset <commit>` (move branch).

### Quick quiz
```quiz
? [state] You run git reset --soft HEAD~1. Where are the last commit's changes?
+ Staged, ready to commit again
- Unstaged in the working directory
- Gone
- In a new branch
> Soft only moves the branch; the staging area still holds those changes.

? [state] You run git reset HEAD~2 (no mode). What happens?
+ The branch moves back two commits; their changes remain as unstaged edits
- The branch moves back two commits and the changes are discarded
- Only the staging area changes
- Git asks which mode you want
> The default mode is --mixed.

? [scenario] You want your local main to be exactly what the server has, discarding local commits on main. Which sequence?
+ git fetch, then git reset --hard origin/main
- git pull --force
- git revert origin/main
- git reset --soft origin/main
> Fetch updates origin/main; a hard reset makes your branch, index and files match it.

? [tf] After git reset --hard HEAD~1, the removed commit can often still be recovered.
+ True
- False
> The commit object remains and the reflog records it. Only uncommitted changes are unrecoverable.

? Which command is appropriate to undo a commit that is already on the shared main branch?
- git reset --hard HEAD~1 then force push
+ git revert <commit>
- git commit --amend
- git reset --soft HEAD~1
> Revert adds a new commit undoing the change without rewriting shared history.
```

### Practical exercise
````exercise All three modes
In a practice repository with at least four commits:
1. `git reset --soft HEAD~1` and check `git status -s`. Recommit.
2. `git reset HEAD~1` and check `git status -s`. Recommit.
3. `git reset --hard HEAD~1`, then bring the commit back using the reflog.
4. Squash your last three commits into one with a soft reset.
---solution---
```bash
$ git reset --soft HEAD~1 && git status -s    # M  (left column: staged)
$ git commit -m "Redo last commit"
$ git reset HEAD~1 && git status -s           #  M (right column: unstaged)
$ git commit -am "Redo last commit again"
$ git reset --hard HEAD~1
$ git reflog -n 2                             # HEAD@{1} is the commit you just removed
$ git reset --hard HEAD@{1}
$ git reset --soft HEAD~3 && git commit -m "Squashed: three changes in one"
```
````

### What to learn next
Reset rewrites history, which is fine locally. For commits your team already has, you need the safe alternative: `git revert`.
:::
