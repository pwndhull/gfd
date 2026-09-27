---
id: rebase-conflicts
part: 8
title: Rebase Conflicts and Aborting a Rebase
minutes: 20
level: Advanced
topics: 85 Rebase conflicts | 86 Aborting rebase
objectives:
- Recognise the in-progress rebase state and read its status output
- Resolve conflicts commit by commit and continue
- Know when to skip a commit and what that does
- Abort a rebase cleanly, or undo one that already finished
- Avoid resolving the same conflict repeatedly
concepts: rebase | merge conflict | ours | theirs | detached HEAD | rerere | ORIG_HEAD
commands: git rebase --continue | git rebase --skip | git rebase --abort | git rebase --edit-todo | git status
---
A merge resolves conflicts once, in one merge commit. A rebase replays commits one at a time, so it can stop at **each** commit that conflicts. The resolution routine is almost the same as Chapter 35; the differences are in how you continue, and in one notorious naming swap.

## A rebase stops

```bash
$ git rebase origin/main
Rebasing (1/2)
Auto-merging f.txt
CONFLICT (content): Merge conflict in f.txt
error: could not apply dc90b9d... Feature change
hint: Resolve all conflicts manually, mark them as resolved with
hint: "git add/rm <conflicted_files>", then run "git rebase --continue".
hint: You can instead skip this commit: run "git rebase --skip".
hint: To abort and get back to the state before "git rebase", run "git rebase --abort".
Could not apply dc90b9d... Feature change
```

Git replayed as far as it could, then stopped while applying `dc90b9d`, the first of your two commits. Status shows exactly where you are:

```bash
$ git status
interactive rebase in progress; onto 2c64949
Last command done (1 command done):
   pick dc90b9d Feature change
Next command to do (1 remaining command):
   pick 0827363 Add x
  (use "git rebase --edit-todo" to view and edit)
You are currently rebasing branch 'feature' on '2c64949'.
  (fix conflicts and then run "git rebase --continue")
  (use "git rebase --skip" to skip this patch)
  (use "git rebase --abort" to check out the original branch)

Unmerged paths:
  (use "git restore --staged <file>..." to unstage)
  (use "git add <file>..." to mark resolution)
	both modified:   f.txt
```

It tells you: which commit failed, what's left, and your three exits. During a rebase, HEAD is **detached** (your prompt may show something like `(no branch, rebasing feature)`). That's normal: the branch label moves only when the rebase finishes.

## Ours and theirs are swapped

Open the file:

```text title="f.txt during a rebase"
base
<<<<<<< HEAD
main
=======
feat
>>>>>>> dc90b9d (Feature change)
```

In a rebase:

- **HEAD / ours** = the new base plus any of your commits already replayed. Here: `main`'s version.
- **theirs** = the commit being replayed: **your** change.

That's the reverse of a merge, because rebase works by checking out the target and applying your commits onto it. So `git restore --theirs f.txt` during a rebase means "take **my** commit's version". Read the content, not the labels.

## Resolving and continuing

The routine:

1. Edit the file to the correct result (here, perhaps keep both lines).
2. `git add` it.
3. `git rebase --continue`.

```bash
$ printf 'base\nmain\nfeat\n' > f.txt
$ git add f.txt
$ git rebase --continue
[detached HEAD 76d55db] Feature change
 1 file changed, 1 insertion(+)
Successfully rebased and updated refs/heads/feature.
```

`--continue` may open your editor to confirm the commit message; save and close to keep it. If a later commit also conflicts, Git stops again and you repeat the routine. Don't run `git commit` yourself during a rebase unless you're splitting a commit; `--continue` makes the commit for you.

:::tip Resolve as the author of that commit
Each stop is about one of your commits. Ask: "if I had written this commit on top of the new base, what would it look like?" Resolve for that commit only; don't pull changes from later commits forward, or the next stop will conflict with you.
:::

## Skipping a commit

```bash
$ git rebase --skip
```

`--skip` drops the current commit from the rebased result. Use it when the commit is no longer needed, typically because the same change already exists on the new base (a teammate made the identical fix, or your commit was cherry-picked into `main` earlier).

Git sometimes suggests this itself: after resolving, if your commit ends up changing nothing, `git rebase --continue` reports that there's nothing to commit and points at `--skip`.

:::warning Skip drops work
Only skip when you're sure the commit's changes are already present or unwanted. Otherwise resolve.
:::

## Aborting

```bash
$ git rebase --abort
```

Returns your branch, HEAD, staging area and working directory to exactly where they were before `git rebase` started. It's always available while the rebase is in progress, however many commits have already been replayed.

Reasons to abort:

- the conflicts are bigger than expected and you'd rather merge (one resolution instead of many),
- you realise you rebased onto the wrong branch,
- you want to talk to the author of the conflicting change first.

## Undoing a finished rebase

`--abort` no longer works once the rebase completes. Use:

```bash
$ git reset --hard ORIG_HEAD
```

or find the pre-rebase tip in the reflog (look for the line just before `rebase (start)`):

```bash
$ git reflog
ee266ce HEAD@{0}: rebase (finish): returning to refs/heads/feature
ee266ce HEAD@{1}: rebase (pick): Add x
76d55db HEAD@{2}: rebase (continue): Feature change
2c64949 HEAD@{3}: rebase (start): checkout main
0827363 HEAD@{4}: checkout: moving from main to feature
$ git reset --hard 0827363
```

Chapter 43 covers reflog-based recovery in depth, and Chapter 74 walks through "I messed up a rebase" end to end.

## Fewer, smaller conflicts

- **Rebase often.** Rebasing onto `main` daily means each rebase replays onto a few new commits, not a month's worth.
- **Squash first, then rebase.** If ten of your commits all touch the same lines, conflicts repeat at each one. `git rebase -i` to combine them (onto the *old* base, so nothing new conflicts), then rebase onto `main` and resolve once.
- **Enable rerere**: `git config --global rerere.enabled true`. When the same conflict appears again (on a later commit, or in a later rebase), Git reapplies your earlier resolution. Check it and `git add`.
- **Consider merging instead.** If a long branch conflicts heavily, one merge commit with one resolution may be much less work than resolving across many replayed commits.

## Editing the plan mid-rebase

While stopped, you can change the remaining steps:

```bash
$ git rebase --edit-todo
```

For example, change a later `pick` to `drop` if you now realise it's obsolete, then `--continue`.

:::recap
### What you learned
- A rebase can stop at each conflicting commit; `git status` shows progress and the continue/skip/abort options.
- During a rebase HEAD is detached, and ours/theirs are swapped: ours is the new base, theirs is your commit.
- Resolve, `git add`, `git rebase --continue`; repeat per stop.
- `--skip` drops the current commit; use only when its change is already present or unwanted.
- `--abort` restores the pre-rebase state while in progress; afterwards use `ORIG_HEAD` or the reflog.
- Rebase often, squash before rebasing, enable rerere, or merge instead when conflicts pile up.

### Key terms
```terms
Rebase in progress :: The paused state where some commits are replayed and others remain.
Skip :: Drop the current commit from a rebase.
Abort :: Cancel a rebase and restore the original branch.
rerere :: Git's memory of conflict resolutions, reapplied automatically.
```

### Key commands
```commands
git rebase --continue :: Continue after resolving and staging.
git rebase --skip :: Drop the current commit and continue.
git rebase --abort :: Cancel the rebase entirely.
git rebase --edit-todo :: Change the remaining steps.
git reset --hard ORIG_HEAD :: Undo a completed rebase.
```

### Common mistakes
- Using `git restore --ours` expecting "my version" during a rebase (it's the base's).
- Running `git commit` instead of `git rebase --continue`.
- Using `--skip` to make a conflict "go away", losing a commit.
- Panicking at "detached HEAD" during a rebase.

### Quick quiz
```quiz
? [predict] During a rebase of feature onto main, which side is shown between <<<<<<< HEAD and =======?
+ main's version (the new base, plus already-replayed commits)
- Your feature commit's version
- The merge base
- The remote version
> In a rebase, HEAD is the base being built on; your commit is "theirs".

? [state] You resolved a conflict and ran git add. What next?
- git commit -m "Resolve"
+ git rebase --continue
- git merge --continue
- git push
> --continue records the commit and replays the remaining ones.

? When is git rebase --skip appropriate?
+ When the current commit's changes are already on the new base or no longer wanted
- Whenever a conflict looks hard
- To skip the editor
- To avoid force pushing
> Skip removes that commit from the result entirely.

? [scenario] You're halfway through a rebase with three conflicts resolved and realise you picked the wrong base branch. What do you do?
+ git rebase --abort
- git reset --hard HEAD
- Delete .git/rebase-merge
- Finish the rebase then delete the branch
> --abort restores everything to the pre-rebase state, however far you got.

? [tf] A rebase of ten commits can stop for conflicts more than once.
+ True
- False
> Each replayed commit can conflict independently.
```

### Practical exercise
````exercise Resolve a two-stop rebase
Create a branch with two commits that each change the same line of `f.txt`, and a `main` commit that also changes that line. Rebase the branch onto `main`, resolving at each stop. Then undo the whole rebase with `ORIG_HEAD` and redo it with rerere enabled to see whether Git remembers.
---solution---
```bash
$ echo v1 > f.txt && git add f.txt && git commit -m base
$ git switch -c topic && echo v2 > f.txt && git commit -am "Topic 1" && echo v3 > f.txt && git commit -am "Topic 2"
$ git switch main && echo vm > f.txt && git commit -am "Main"
$ git switch topic && git rebase main      # stop 1: resolve to v2, git add, --continue
                                           # stop 2: resolve to v3, git add, --continue
$ git reset --hard ORIG_HEAD
$ git config rerere.enabled true
$ git rebase main                          # resolve again (rerere records this time)
$ git reset --hard ORIG_HEAD && git rebase main   # rerere now pre-resolves: check, git add, --continue
```
With rerere, Git prints "Resolved 'f.txt' using previous resolution." You still stage and continue.
````

### What to learn next
You've now seen `reset --hard ORIG_HEAD` several times. Part 9 explains undoing properly: restore, reset in all three modes, revert, and the reflog safety net.
:::
