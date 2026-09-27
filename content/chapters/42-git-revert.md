---
id: git-revert
part: 9
title: Undoing Pushed Commits with git revert
minutes: 22
level: Intermediate
topics: 96 git revert | 97 Reset vs revert
objectives:
- Undo a commit that is already shared, without rewriting history
- Revert several commits, and revert without committing immediately
- Revert a merge commit correctly with -m, and understand the "revert the revert" trap
- Choose confidently between reset and revert
concepts: revert | reset | merge commit | first parent | rewriting history
commands: git revert | git revert --no-edit | git revert -n | git revert -m 1 | git revert --abort
---
`git reset` undoes commits by moving a branch backwards: great locally, harmful on shared branches. `git revert` undoes a commit the other way: it **adds a new commit that applies the opposite changes**. History only grows, so it's safe to push to any branch.

## How revert works

```cmd
git revert a91be03
revert :: Create a new commit that undoes the changes introduced by the given commit.
a91be03 :: The commit to undo. It can be anywhere in the history, not only the latest.
```

```graph Before
A---B---C---D   main  (C changed prices; it's wrong)
```

```graph After git revert C
A---B---C---D---C⁻¹   main
```

`C⁻¹` (written here as the inverse of C) is a new commit whose diff is the exact opposite of C's: lines C added are removed, lines C removed are added back. `C` and `D` are untouched, their hashes unchanged.

```bash
$ git revert 158f651
[main 191c6c0] Revert "Change prices"
 1 file changed, 1 deletion(-)
```

Git opens your editor with a default message:

```text
Revert "Change prices"

This reverts commit 158f651e2b7c....
```

Keep it, and ideally add **why** ("Prices must wait for legal sign-off; reverting until SHOP-900 is approved"). `--no-edit` accepts the default without opening the editor. Then push normally:

```bash
$ git push
```

No force push, no rewritten history, no surprises for teammates. Their next pull just brings in one more commit.

```viz revert
```

## Reverting several commits

```bash
$ git revert --no-edit HEAD~2..HEAD        # revert the last two commits, one revert commit each
$ git revert -n HEAD~2..HEAD               # stage all the inverse changes, don't commit yet
$ git commit -m "Revert coupon feature (both commits)"
```

`-n` (`--no-commit`) applies the reversals to the staging area and working directory without committing, so you can combine them into one revert commit.

Git reverts in reverse order (newest first), which avoids most self-conflicts.

## Revert conflicts

If later commits changed the same lines as the commit you're reverting, Git can't cleanly apply the inverse and stops, just like a merge:

```bash
$ git revert 3c9e1a0
CONFLICT (content): Merge conflict in src/prices.js
error: could not revert 3c9e1a0... Change prices
hint: After resolving the conflicts, mark them with
hint: "git add/rm <pathspec>", then run
hint: "git revert --continue".
```

Resolve, `git add`, `git revert --continue`. Or `git revert --abort` to cancel.

## Reverting a merge commit

A merge commit has two parents, so "the changes it introduced" is ambiguous: relative to which parent? You must say:

```bash
$ git revert -m 1 5f3b2a1
```

```cmd
git revert -m 1 5f3b2a1
-m 1 :: "Mainline": treat parent 1 as the line to keep. Parent 1 is the branch that was merged INTO (usually main), so this undoes everything the merged branch brought in.
5f3b2a1 :: The merge commit.
```

Without `-m`, Git refuses: `error: commit 5f3b2a1 is a merge but no -m option was given.` Nearly always you want `-m 1`.

GitHub's **Revert** button on a merged pull request does exactly this: it creates a new branch with the revert and opens a pull request for it.

### The "revert the revert" trap

After reverting a merged feature branch, suppose the team fixes the problem on the same branch and merges it again. Surprise: **the original commits don't come back**. Git sees them as already merged (they're in `main`'s history), so only the new fix commits are merged, and the revert still removes the rest.

The fix is to **revert the revert** first, restoring the original changes, then merge the new work:

```bash
$ git revert <hash-of-the-revert-commit>
$ git merge feature/coupons
```

This catches experienced developers too. Whenever you revert a merge, note in the message that re-landing the feature requires reverting this revert.

## Reset versus revert

| | `git reset` | `git revert` |
|---|---|---|
| How it undoes | Moves the branch back, removing commits from it | Adds a new commit with the inverse changes |
| History | Rewritten | Preserved (only appended to) |
| Commit hashes of later commits | Removed from the branch | Unchanged |
| Safe on shared/pushed branches | **No** (needs force push) | **Yes** |
| Can undo a commit in the middle of history | Only by also removing everything after it | Yes, just that commit |
| Leaves a record of the undo | No | Yes, a revert commit with a message |
| Typical use | Local cleanup before pushing | Undoing something already on `main` or in production |

```snap git reset --hard B (local only)
git commit -m "Initial commit"
git commit -m "Add homepage"
git commit -m "Change prices"
git commit -m "Add FAQ"
git reset --hard B
```

```snap git revert C (safe for shared branches)
git commit -m "Initial commit"
git commit -m "Add homepage"
git commit -m "Change prices"
git commit -m "Add FAQ"
git revert C
```

Notice that reset lost D (Add FAQ) as well, because it can only move the branch backwards. Revert removed just C's changes and kept D.

:::tip Rule of thumb
**Has anyone else possibly got this commit?** If yes (pushed to a shared branch, deployed, in a PR others reviewed), revert. If no (only on your machine or your private branch), reset or rebase is fine.
:::

:::recap
### What you learned
- `git revert <commit>` adds a new commit that undoes that commit's changes; history is preserved and a normal push works.
- Revert ranges with `A..B`; use `-n` to combine several reverts into one commit.
- Conflicts are resolved like merges, then `git revert --continue`, or `--abort`.
- Merge commits need `-m 1`. Re-merging a reverted branch requires reverting the revert first.
- Reset rewrites history and suits local work; revert appends and suits shared work.

### Key terms
```terms
Revert :: A new commit that applies the inverse of an earlier commit's changes.
Mainline (-m) :: The parent a merge commit's changes are measured against when reverting it.
Revert the revert :: Reverting a revert commit to restore the original changes.
```

### Key commands
```commands
git revert <commit> :: Undo a commit with a new commit.
git revert --no-edit <commit> :: Revert with the default message.
git revert -n <range> :: Stage inverse changes for several commits without committing.
git revert -m 1 <merge> :: Undo everything a merge brought in.
git revert --continue / --abort :: Finish or cancel a conflicted revert.
```

### Common mistakes
- Using reset and force push to undo a commit on `main`.
- Forgetting `-m 1` when reverting a merge.
- Re-merging a previously reverted feature branch without reverting the revert.
- Writing no explanation in the revert message.

### Quick quiz
```quiz
? [state] main is A-B-C-D and all are pushed. You run git revert C and push. What does main look like?
+ A-B-C-D-E, where E undoes C's changes
- A-B-D
- A-B-C
- A-B-C-D with C deleted from history
> Revert only appends. C remains in history; E cancels its effect.

? [tf] After git revert on a pushed commit, you need git push --force.
- True
+ False
> Revert adds a commit on top, so a normal fast-forward push works.

? [predict] What happens here?
| $ git revert 5f3b2a1
| error: commit 5f3b2a1 is a merge but no -m option was given.
+ Git refuses because it doesn't know which parent to revert relative to; use git revert -m 1 5f3b2a1
- The merge was reverted successfully
- The commit doesn't exist
- You must abort a revert in progress
> Merge commits have two parents, so you must choose the mainline.

? [scenario] A feature was merged, then reverted. The team fixed it on the same branch and merged again, but most of the feature is still missing. Why?
+ The original commits are already in main's history, so Git didn't re-apply them; the revert still cancels them. Revert the revert first.
- GitHub lost the commits
- The branch needs to be rebased onto main twice
- Reverts expire after 30 days
> Git merges history, not intentions. Revert the revert to restore the original changes.

? Which undo removes a single commit from the middle of a shared branch's effect while keeping later commits' changes?
+ git revert <that commit>
- git reset --hard <that commit>^
- git reset --soft <that commit>
- git commit --amend
> Revert targets one commit's changes. Reset can only cut the branch back, losing everything after it.
```

### Practical exercise
````exercise Revert, then revert the revert
In a practice repository:
1. Make three commits A (add file), B (change a line), C (add another file).
2. Revert B and check that C's file is still there.
3. Revert the revert and check that B's change is back.
4. Create a branch, merge it with `--no-ff`, revert the merge with `-m 1`, and inspect `git log --oneline --graph`.
---solution---
```bash
$ git revert --no-edit HEAD~1            # reverts B
$ ls; git log --oneline -3
$ git revert --no-edit HEAD              # reverts the revert: B's change returns
$ git switch -c feat && echo f > f.txt && git add f.txt && git commit -m "Add f"
$ git switch main && git merge --no-ff --no-edit feat
$ git revert --no-edit -m 1 HEAD         # f.txt disappears; history keeps both commits
$ git log --oneline --graph -6
```
````

### What to learn next
Reset, rebase, amend and deleted branches all leave commits "orphaned". The reflog is how you find them again, and it's the safety net underneath all of Git.
:::
