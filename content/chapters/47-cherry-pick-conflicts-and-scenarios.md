---
id: cherry-pick-conflicts-and-scenarios
part: 11
title: Cherry-pick Conflicts and Real-World Scenarios
minutes: 20
level: Intermediate
topics: 112 Conflicts | 113 Aborting cherry-pick | 114 Real-world scenarios
objectives:
- Resolve a cherry-pick conflict and continue, skip or abort
- Handle a multi-commit cherry-pick that stops midway
- Apply cherry-pick to hotfixes, backports, wrong-branch commits and abandoned branches
- Check whether a commit's change is already on a branch
concepts: cherry-pick | merge conflict | backport | duplicate commit
commands: git cherry-pick --continue | git cherry-pick --skip | git cherry-pick --abort | git cherry-pick --quit | git log --cherry-pick | git cherry
---
Cherry-pick applies a commit's changes to a different starting point. If the code around those changes differs on your branch, Git can't apply them cleanly and stops with a conflict, exactly like the merges and rebases you've already handled.

## A cherry-pick stops

```bash
$ git cherry-pick 03013a1
Auto-merging src/totals.js
CONFLICT (content): Merge conflict in src/totals.js
error: could not apply 03013a1... Fix rounding bug in totals
hint: After resolving the conflicts, mark them with
hint: "git add/rm <pathspec>", then run
hint: "git cherry-pick --continue".
hint: You can instead skip this commit with "git cherry-pick --skip".
hint: To abort and get back to the state before "git cherry-pick",
hint: run "git cherry-pick --abort".
```

```bash
$ git status
On branch release/2.4
You are currently cherry-picking commit 03013a1.
  (fix conflicts and run "git cherry-pick --continue")
  (use "git cherry-pick --skip" to skip this patch)
  (use "git cherry-pick --abort" to cancel the cherry-pick operation)

Unmerged paths:
  (use "git add <file>..." to mark resolution)
	both modified:   src/totals.js
```

In the conflict markers, **HEAD is your branch** (where you're picking to) and the other side is the **commit being picked**:

```text
<<<<<<< HEAD
  return Math.round(total);
=======
  return Math.round(total * 100) / 100;
>>>>>>> 03013a1 (Fix rounding bug in totals)
```

Here, `release/2.4` has older code than the branch the fix was written on. Resolve by applying the **intent** of the fix to the release branch's version of the code.

## Continue, skip, abort, quit

| Command | Effect |
|---|---|
| `git add <file>` then `git cherry-pick --continue` | Commit the resolved pick (message pre-filled) and continue with any remaining commits |
| `git cherry-pick --skip` | Drop this commit and continue with the next one in a multi-commit pick |
| `git cherry-pick --abort` | Cancel everything and return to the state before `git cherry-pick` started |
| `git cherry-pick --quit` | Stop the sequence but keep the commits already picked (and the current conflict for you to handle) |

### Multi-commit picks

With `git cherry-pick A..E`, Git applies commits one at a time. If the third conflicts, the first two are already committed. After resolving, `--continue` carries on with the fourth. `--abort` rolls back **all** of them, including the ones already applied. `--quit` keeps the first two and stops.

### When the pick is empty

If the change is already on your branch (someone picked it earlier), Git says:

```bash
The previous cherry-pick is now empty, possibly due to conflict resolution.
If you wish to commit it anyway, use:

    git commit --allow-empty

Otherwise, please use 'git cherry-pick --skip'
```

Usually `--skip` is correct.

## Is this change already on the branch?

Because cherry-picked commits have new hashes, `git branch --contains` won't find them. Git can compare **changes** instead:

```bash
$ git log --oneline --cherry-pick --right-only release/2.4...main
```

This lists commits on `main` whose changes are **not** yet on `release/2.4`, hiding those that were already cherry-picked (equivalent patches). The older `git cherry` does something similar:

```bash
$ git cherry -v release/2.4 main
- 03013a1 Fix rounding bug in totals        # "-" = an equivalent change is already there
+ 5d2f90b Add coupon field                  # "+" = not there yet
```

If you used `-x`, you can also simply search messages: `git log release/2.4 --grep=03013a1`.

## Real-world scenarios

### 1. Hotfix a supported release

A security fix merged to `main`. Customers run 2.4.

```bash
$ git fetch
$ git switch release/2.4
$ git pull
$ git cherry-pick -x <fix-hash>
# resolve if needed, run the tests
$ git push
$ git tag -a v2.4.1 -m "Security fix for SHOP-977"      # Chapter 48
$ git push origin v2.4.1
```

Many teams do this through a pull request into `release/2.4` rather than pushing directly.

### 2. Committed to the wrong branch

You made a commit on `main` that belongs on `feature/search`, and haven't pushed:

```bash
$ git switch feature/search
$ git cherry-pick main              # copy main's latest commit here
$ git switch main
$ git reset --hard HEAD~1           # remove it from main (not pushed, so safe)
```

Chapter 72 covers variants, including when you've already pushed.

### 3. Rescue work from an abandoned branch

A colleague's experimental branch was abandoned, but one commit adds a utility you need:

```bash
$ git log --oneline origin/spike/graphql
$ git cherry-pick -x <utility-commit>
```

### 4. Pull one change out of a large PR

A teammate's big pull request contains an independent bug fix you need today. Cherry-pick just that commit onto your branch. When their PR merges later, Git usually recognises the identical change; if the code has moved on, expect a small conflict and resolve it once.

### 5. Build a release from selected changes

For teams that assemble releases from approved changes, cherry-picking a list of commits (with `-x`) onto a release branch is standard. Review the result with `git log --oneline --cherry-pick --left-right release/3.0...main` to see what's included and what's not.

:::recap
### What you learned
- A cherry-pick conflict shows HEAD (your branch) versus the commit being picked; resolve for the fix's intent.
- `--continue` after `git add`; `--skip` drops the current commit; `--abort` cancels everything; `--quit` keeps what's done.
- Empty picks mean the change is already present; usually skip.
- `git log --cherry-pick` and `git cherry` find changes already copied, despite different hashes.
- Typical uses: hotfixes, wrong-branch commits, rescues and selective releases.

### Key terms
```terms
Cherry-pick conflict :: A conflict applying a commit's changes to a different base.
Equivalent patch :: Two commits whose changes are identical though their hashes differ.
--quit :: Stop a cherry-pick sequence, keeping commits already made.
```

### Key commands
```commands
git cherry-pick --continue :: Commit the resolved pick and continue.
git cherry-pick --skip :: Skip the current commit.
git cherry-pick --abort :: Cancel and restore the original state.
git log --cherry-pick --right-only A...B :: Commits on B whose changes aren't on A.
git cherry -v <upstream> <head> :: Mark commits already applied (-) or missing (+).
```

### Common mistakes
- Aborting a multi-commit pick and being surprised that earlier picks were rolled back too (use `--quit` to keep them).
- Checking for a fix with `git branch --contains <hash>` after cherry-picking (hashes differ).
- Resolving a pick by copying the whole newer file rather than applying just the fix.

### Quick quiz
```quiz
? [predict] In a cherry-pick conflict, which side is between <<<<<<< HEAD and =======?
+ The branch you are cherry-picking onto
- The commit being cherry-picked
- The merge base
- The remote branch
> HEAD is where you are. The picked commit's version follows the divider.

? [scenario] You're cherry-picking five commits. The third conflicts and you decide you only want the first two. Which command?
- git cherry-pick --abort
+ git cherry-pick --quit, then clean up the conflicted state
- git cherry-pick --skip twice
- git reset --hard
> --abort would also undo the first two. --quit keeps them and stops the sequence.

? Why doesn't git branch --contains <hash> find a cherry-picked fix on the release branch?
+ The cherry-picked commit has a different hash from the original
- Cherry-picked commits are hidden
- --contains only works for tags
- Release branches aren't searched
> Use git log --cherry-pick, git cherry, or search for the -x note.

? [tf] git cherry-pick --abort during a multi-commit pick keeps the commits that were already applied.
- True
+ False
> --abort returns to the state before the whole cherry-pick started.
```

### Practical exercise
````exercise Cherry-pick with a conflict
In a practice repository:
1. Create `release/1.0` from main. On main, change line 1 of `totals.js`, then in a second commit apply a "fix" to the same line.
2. Cherry-pick only the fix onto `release/1.0` and resolve the conflict.
3. Run `git cherry -v release/1.0 main`. Does it recognise the fix as applied? Then find it through the `-x` note instead.
---solution---
```bash
$ echo "return total" > totals.js && git add . && git commit -m "Add totals"
$ git branch release/1.0
$ echo "return round(total)" > totals.js && git commit -am "Round totals"
$ echo "return round(total, 2)" > totals.js && git commit -am "Fix rounding precision"
$ git switch release/1.0 && git cherry-pick -x main     # conflict: HEAD has "return total"
# edit totals.js to the fixed version appropriate for this branch
$ git add totals.js && git cherry-pick --continue
$ git cherry -v release/1.0 main    # both commits show "+"
$ git log --oneline release/1.0 --grep="cherry picked from"
```
`git cherry` compares the actual diffs. Because you resolved a conflict, your picked commit's diff differs from the original (it starts from `return total`, not `return round(total)`), so Git can't tell they're the same fix and marks both as missing. The `-x` note is the reliable record. `git cherry` shows `-` only for picks that applied cleanly.
````

### What to learn next
Part 12 covers tags: naming important commits, versioning, and publishing releases.
:::
