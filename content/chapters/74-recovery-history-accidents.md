---
id: recovery-history-accidents
part: 16
title: "Recovery: Rebases, Lost Commits, Hard Resets and Force Pushes"
minutes: 28
level: Professional
topics: Messed up a rebase | Lost commits | Need to recover work after reset --hard | Force pushed accidentally
objectives:
- Undo a rebase that went wrong, during or after it
- Find lost commits with the reflog and git fsck
- Recover committed and staged work after git reset --hard, and know what can't be recovered
- Restore a remote branch after an accidental force push
concepts: reflog | ORIG_HEAD | dangling object | force push | rebase | reset
commands: git rebase --abort | git reset --hard ORIG_HEAD | git reflog | git fsck --lost-found | git reflog show origin/<branch> | git push --force-with-lease
---
These four scenarios all involve history being moved or rewritten in a way you didn't intend. The pattern of recovery is always the same: **find the hash of the good state, then point a branch at it.** The reflog does most of the finding.

---

## Scenario 7: Messed up a rebase

:::scenario Situation
You rebased your feature branch onto main, resolved a dozen conflicts, and now the tests fail, a commit seems to be missing, and the code looks wrong.
:::

### What happened

Rebase replayed your commits as new commits (Chapter 36). A conflict may have been resolved incorrectly, or a commit skipped. The **original** commits still exist, untouched.

### Safest recovery

**Still in progress?** Abort. Everything goes back to how it was before `git rebase`:

```bash
$ git rebase --abort
```

**Finished just now?** `ORIG_HEAD` points at your branch's pre-rebase tip:

```bash
$ git reset --hard ORIG_HEAD
```

**Finished a while ago** (ORIG_HEAD has since been overwritten by another reset or merge)? Use the reflog. Find `rebase (start)`; the entry **just below it** is where you were before:

```bash
$ git reflog -n 20
ee266ce HEAD@{0}: rebase (finish): returning to refs/heads/feature/coupons
ee266ce HEAD@{1}: rebase (pick): Validate coupon expiry
76d55db HEAD@{2}: rebase (continue): Add coupon field
2c64949 HEAD@{3}: rebase (start): checkout origin/main
0827363 HEAD@{4}: commit: Validate coupon expiry            <-- before the rebase
$ git branch coupons-before-rebase 0827363                 # keep it safe first
$ git reset --hard coupons-before-rebase
```

The branch reflog is even more direct: `git reflog show feature/coupons` shows `rebase (finish)` and, one line below, the old tip.

**Already force-pushed the bad rebase?** Restore locally as above, check it's right, then `git push --force-with-lease` again.

Then decide: retry the rebase more carefully (rerere will remember the good resolutions), or merge `main` instead, which needs only one conflict resolution (Chapter 58).

### Dangerous alternatives

- Trying to "fix forward" by hand-copying code from the old commits.
- Running more rebases on top of the broken result before saving the old tip.

### Prevention

- Rebase often so each rebase is small (Chapter 39).
- Squash your own commits first, then rebase: fewer replay steps, fewer conflicts.
- Run the tests before pushing after any rebase.

---

## Scenario 8: Lost commits

:::scenario Situation
"I definitely committed that fix last week. It's not on any branch." You don't know what happened: maybe a detached HEAD, a deleted branch, a dropped stash, or a reset.
:::

### What happened

A commit that isn't reachable from any branch, tag or HEAD is invisible to `git log`, but it stays in the database for weeks (Chapter 62).

### Safest recovery: search in order

**1. Search commit messages everywhere, including the reflog:**

```bash
$ git log --all --oneline --grep="rounding"            # on any branch or tag?
$ git log -g --oneline --grep="rounding"               # anywhere HEAD has been?
```

**2. Search by content** if you remember a distinctive line:

```bash
$ git log -g -p -S"Math.round(total * 100)" --oneline
```

**3. Read the reflog around the time** you worked on it:

```bash
$ git reflog --date=relative | less
```

Look for `checkout: moving from <hash> to …` (you left a detached HEAD, Chapter 61), `reset: moving to …`, or `branch: …`.

**4. Ask `fsck` for dangling commits** (covers dropped stashes and anything whose reflog entries are gone):

```bash
$ git fsck --no-reflog | awk '/dangling commit/ {print $3}' | xargs git log --no-walk --oneline
5d2f90b WIP on feature/coupons: 77a1b20 Validate coupon expiry
3c9e1a0 Fix rounding in totals
```

**5. Once found, branch it:**

```bash
$ git branch rescued-rounding 3c9e1a0
```

Also check **other places the commit may exist**: your other machines, a teammate's clone (if you pushed it once, their `origin/<branch>` reflog may have it), or GitHub (a closed PR still shows its commits, and you can restore its branch).

### Dangerous alternatives

- `git gc`, `git prune` or `git reflog expire` while searching.
- Assuming it's gone and rewriting from memory before checking the reflog.

### Prevention

- Never leave work only in detached HEAD or in a stash.
- Push branches regularly; the server is a second copy.

---

## Scenario 9: Recover work after git reset --hard

:::scenario Situation
You meant `git reset --soft HEAD~1` and typed `git reset --hard HEAD~1`. Or you ran `git reset --hard` to "clean up" and wiped an afternoon of edits.
:::

### What happened

`reset --hard` moved the branch **and** overwrote the staging area and working directory (Chapter 41). What can come back depends on where the work was:

| Where the work was | Recoverable? | How |
|---|---|---|
| **Committed** (the commits you reset past) | Yes | Reflog |
| **Staged** (`git add`ed) but not committed | Usually | `git fsck --lost-found` (dangling blobs) |
| **Only in the working directory**, never staged | **No, not by Git** | Editor/IDE local history, OS backups |
| Untracked files | Untouched by reset | Still there |

### Recovering committed work

```bash
$ git reflog -n 3
51c0e2a HEAD@{0}: reset: moving to HEAD~1
a91be03 HEAD@{1}: commit: Add FAQ page
$ git reset --hard a91be03          # or: git reset --hard HEAD@{1}
```

If you really meant `--soft`, go back and do that instead:

```bash
$ git reset --hard HEAD@{1}         # undo the mistaken reset
$ git reset --soft HEAD~1           # the reset you meant
```

### Recovering staged but uncommitted work

When you `git add` a file, Git writes its content as a blob immediately (Chapter 70). After `reset --hard` nothing references those blobs, but they're still in the database:

```bash
$ git fsck --lost-found
dangling blob 0d5ec45028fd04097b2a65dab9f7ddfc20661bb0
$ ls .git/lost-found/other/
0d5ec45028fd04097b2a65dab9f7ddfc20661bb0
$ cat .git/lost-found/other/0d5ec45028fd04097b2a65dab9f7ddfc20661bb0
precious staged work
```

Blobs have no file names (names live in trees), so you identify each one by reading its content, then copy it back to the right path. Tedious, but it has saved many afternoons.

### Unstaged work

Git never stored it. Check your editor's local history (VS Code **Timeline**, JetBrains **Local History**), OS backups (Time Machine, File History), or anything still open in an editor buffer. Don't close editors until you've checked.

### Dangerous alternatives

- Running further `reset --hard`, `restore` or `clean` commands while panicking.
- `git gc` (it may prune the dangling blobs you need).

### Prevention

- Run `git status` before any `reset --hard`.
- Prefer `git stash -u` over discarding; you can always `git stash drop` later.
- Commit WIP frequently; committed work is almost indestructible.
- Consider an alias for the safe version: `git config --global alias.unstage "restore --staged"`.

---

## Scenario 10: Force pushed accidentally

:::scenario Situation
You ran `git push --force` on `feature/checkout-v2` (or worse, `main`, if unprotected) and it overwrote commits your teammate Sam had pushed an hour earlier.
:::

### What happened

The server's branch now points at your history. Sam's commits aren't on it any more. They still exist in **Sam's clone** (his local branch), possibly in **your** repository (if you fetched before pushing), and on **GitHub's servers** for a while.

```text
 + 77a1b20...3c9e1a0 feature/checkout-v2 -> feature/checkout-v2 (forced update)
```

The push output even tells you the old tip: `77a1b20`.

### Safest recovery

**Step 1: tell the team right away**, so nobody pulls, resets or pushes the branch until it's fixed.

**Step 2: find the old tip.** Sources, easiest first:

- The push output: `+ 77a1b20...3c9e1a0` (old…new).
- Your remote-tracking reflog, if you had fetched Sam's work before pushing:

```bash
$ git reflog show origin/feature/checkout-v2
3c9e1a0 refs/remotes/origin/feature/checkout-v2@{0}: update by push
77a1b20 refs/remotes/origin/feature/checkout-v2@{1}: fetch: fast-forward
```

- Sam's clone: his `feature/checkout-v2` still points at his commits.
- GitHub: the repository's **Activity** view lists pushes, including force pushes, with before/after links; a PR's timeline shows "force-pushed from 77a1b20 to 3c9e1a0".

**Step 3: combine both histories** (don't just overwrite in the other direction, or your own work disappears):

```bash
$ git branch sams-work 77a1b20                           # works if the commit is in your repository (you had fetched it)
$ git switch feature/checkout-v2
$ git merge sams-work                                    # or rebase your commits onto sams-work
$ git push --force-with-lease                            # the branch now contains everyone's work
```

If `git branch` says the commit doesn't exist, you never fetched it. Try `git fetch origin 77a1b20` (hosting services often allow fetching a commit by its hash while they still have it), but the simplest route is usually to have **Sam** push his version to a new branch (`git push origin feature/checkout-v2:sams-backup`) and then combine.

### If main was force-pushed

Same steps, with more urgency. Afterwards, **protect main** (block force pushes, require PRs) so it can't happen again (Chapter 53).

### Dangerous alternatives

- Force-pushing Sam's version back without your commits: now your work is lost.
- Everyone running `git pull` on the rewritten branch, merging divergent histories into a tangle.
- Resetting clones to the new remote before recovering the old commits.

### Prevention

- **Never use `--force`**; use `--force-with-lease` (Chapter 22), ideally via an alias (`git fpush`).
- Fetch before rebasing and pushing, and look at what's new.
- Block force pushes on `main` and shared branches with rulesets.
- Agree that shared branches are merged into, never rebased.

:::recap
### What you learned
- Bad rebase: `--abort` during; `reset --hard ORIG_HEAD` right after; reflog (`rebase (start)` and the line below) later.
- Lost commits: search with `--all --grep`, `-g`, `-S`, the reflog, and `git fsck --no-reflog` for dangling commits; branch whatever you find.
- After `reset --hard`: committed work via reflog, staged work via `git fsck --lost-found`, unstaged work only via editor or OS history.
- Accidental force push: warn the team, find the old tip (push output, remote-tracking reflog, a teammate's clone, GitHub activity), combine both histories, push with lease, and protect the branch.

### Key terms
```terms
ORIG_HEAD :: The previous branch position saved by reset, merge and rebase.
Dangling blob :: Staged content no longer referenced, recoverable with git fsck --lost-found.
Dangling commit :: A commit with no references, including dropped stashes.
Forced update :: A push that replaced a branch's history, shown with + and three dots.
```

### Key commands
```commands
git rebase --abort :: Cancel a rebase in progress.
git reset --hard ORIG_HEAD :: Undo the last rebase, merge or reset.
git log -g --grep=<text> :: Search messages across the reflog.
git fsck --no-reflog :: List dangling commits and blobs.
git fsck --lost-found :: Write dangling objects to .git/lost-found.
git reflog show origin/<branch> :: See previous positions of a remote-tracking branch.
```

### Common mistakes
- Panicking and running more destructive commands before finding the good state.
- Overwriting a teammate's force push with another blind force push.
- Believing `reset --hard` destroyed commits (it didn't; it destroyed uncommitted edits).

### Quick quiz
```quiz
? [scenario] You finished a rebase five minutes ago and haven't run any other commands. It went wrong. Quickest undo?
+ git reset --hard ORIG_HEAD
- git rebase --abort
- git revert HEAD
- Re-clone the repository
> ORIG_HEAD holds the pre-rebase tip right after a rebase. --abort only works during one.

? Which of these can Git NOT recover after git reset --hard?
- Commits you reset past
- Content you had staged with git add
+ Edits that were never staged or committed
- Untracked files (they're untouched)
> Unstaged edits were never stored by Git.

? [predict] What does this push output tell you?
|  + 77a1b20...3c9e1a0 feature/x -> feature/x (forced update)
+ The branch was force-updated from 77a1b20 to 3c9e1a0; 77a1b20 is the old tip to recover
- 77a1b20 and 3c9e1a0 were merged
- The push was rejected
- 3c9e1a0 was deleted
> Forced updates show old...new; keep the old hash.

? [troubleshoot] You're hunting a commit that isn't on any branch and isn't in git reflog. What's the next tool?
+ git fsck --no-reflog, then inspect dangling commits
- git gc --prune=now
- git clean -fdx
- git stash clear
> fsck finds unreferenced objects the reflog doesn't list.
```

### Practical exercise
````exercise Four recoveries in a row
In a throwaway repository:
1. Make three commits, run `git reset --hard HEAD~3`, and restore them.
2. Stage a new file (don't commit), run `git reset --hard`, and recover its content with `git fsck --lost-found`.
3. Create a branch with two commits, rebase it onto main (make main have one extra commit first), then undo the rebase with the branch reflog.
4. Make a commit in detached HEAD, switch away, and find it with `git fsck --no-reflog`... then notice it's also in `git reflog`.
---solution---
```bash
$ git reset --hard HEAD@{1}                                  # step 1
$ echo "secret plan" > plan.txt && git add plan.txt && git reset --hard
$ git fsck --lost-found && cat .git/lost-found/other/*       # step 2
$ git reflog show <branch>                                   # step 3: find the line below "rebase (finish)"
$ git reset --hard <branch>@{1}
$ git switch --detach HEAD~1 && echo x > x && git add x && git commit -m "Detached work"
$ git switch main
$ git fsck --no-reflog | grep "dangling commit"              # step 4
$ git reflog | grep "Detached work"
```
Commits found through the reflog aren't "dangling" to plain `git fsck`, because the reflog references them; `--no-reflog` ignores reflog references and reports them.
````

### What to learn next
The last recovery chapter covers integration trouble: conflict floods, bad pulls, needing one commit, and cleaning up messy pull requests.
:::
