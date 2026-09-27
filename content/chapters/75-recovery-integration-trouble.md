---
id: recovery-integration-trouble
part: 16
title: "Recovery: Conflict Floods, Bad Pulls and Messy Pull Requests"
minutes: 26
level: Professional
topics: Merge conflict everywhere | Pulled changes that caused conflicts | Need one commit from another branch | Need to clean up a messy PR
objectives:
- Break a huge conflict into manageable pieces or choose a better integration route
- Undo or redo a pull that merged the wrong way or conflicted
- Take exactly one commit from another branch, including its dependencies
- Turn a messy pull request into a clean, reviewable one
concepts: merge conflict | rebase | cherry-pick | interactive rebase | merge base | rerere
commands: git merge --abort | git reset --hard ORIG_HEAD | git pull --ff-only | git cherry-pick -x | git reset --soft $(git merge-base) | git restore --source
---
The last four scenarios are about combining work: conflicts that seem endless, pulls that do the unexpected, needing one specific change, and pull requests that grew out of control.

---

## Scenario 11: Merge conflict everywhere

:::scenario Situation
Your branch has lived for three weeks. You merge `main` into it and Git reports conflicts in 40 files.
:::

### What happened

Both sides changed many of the same regions. Often a few causes explain most conflicts: a mass reformat, a rename or file move on `main`, or two teams refactoring the same module.

### Safest recovery

**1. Stop and get your bearings.** Nothing is lost; you can always `git merge --abort` (or `git rebase --abort`).

```bash
$ git diff --name-only --diff-filter=U | wc -l          # how many files?
$ git diff --name-only --diff-filter=U | sed 's|/[^/]*$||' | sort | uniq -c | sort -rn   # which folders?
$ git log --merge --oneline | head -20                   # which commits on each side cause them?
```

**2. Look for a root cause.** If one commit on `main` reformatted everything or moved folders, handle that first.

**3. Integrate in smaller steps.** Instead of merging all of `main` at once, merge it **up to** points just before and after the troublesome commit:

```bash
$ git merge --abort
$ git log --oneline --first-parent main -30          # find the big reformat or move, say 5d2f90b
$ git merge 5d2f90b^                                 # everything before it: few conflicts
$ git merge 5d2f90b                                  # just the reformat: resolve (often by re-running the formatter)
$ git merge main                                     # the rest
```

Each merge has a small, understandable set of conflicts.

**4. Use the tools that help with volume:**

- `git config rerere.enabled true` so repeated conflicts resolve themselves (Chapter 35).
- `git merge -X ignore-all-space` when conflicts are whitespace-only.
- For a formatting-only conflict in a file: take one side (`git restore --theirs <file>`), then re-apply your logic and run the formatter.
- A three-way merge tool with the base visible (`merge.conflictStyle zdiff3`).

**5. Talk to the people on the other side.** Ten minutes with the author of the conflicting refactor beats hours of guessing.

**6. Consider starting fresh.** Sometimes the fastest route is a new branch from current `main`, re-implementing your change in small commits (copy logic from the old branch with `git show old-branch:path` or `git diff main...old-branch`).

### Dangerous alternatives

- `git merge -X ours main` to "make it go away": it silently discards `main`'s side of every conflict.
- Committing with conflict markers still in files (run `git diff --check`).

### Prevention

Merge or rebase `main` into your branch daily; keep branches short-lived; split big changes into small PRs; coordinate large reformats (Chapter 58).

---

## Scenario 12: Pulled changes that caused conflicts (or an unwanted merge)

:::scenario Situation
You ran `git pull` to "get the latest". Now there are conflicts, or a surprising "Merge branch 'main' of github.com:acme/shop" commit, or the code changed in ways you didn't expect.
:::

### What happened

`git pull` = fetch + merge (or rebase) (Chapter 21). Your local branch had commits of its own, so the pull had to integrate two lines of history.

### Safest recovery

**Pull stopped with conflicts, and you'd rather not deal with them now:**

```bash
$ git merge --abort          # if the pull was merging
$ git rebase --abort         # if the pull was rebasing
```

You're back to your pre-pull state. The fetched commits are still available as `origin/<branch>`.

**Pull completed, but you don't want the result** (for example an unwanted merge commit on your branch):

```bash
$ git reset --hard ORIG_HEAD         # from a clean working tree
```

Then integrate the way you intended:

```bash
$ git pull --rebase                  # replay your local commits on top instead of merging
# or look first:
$ git fetch
$ git log --oneline HEAD..origin/main
$ git diff --stat HEAD...origin/main
$ git rebase origin/main             # or git merge origin/main, deliberately
```

**Pull brought in a teammate's broken change**: don't reset shared history. Report it; if needed, `git revert` the bad commit (Scenario 6).

### Dangerous alternatives

- `git reset --hard origin/main` when you have unpushed commits on the branch (they disappear from the branch; recoverable via reflog, but easy to overlook).
- Resolving conflicts by blindly accepting "theirs" for everything.

### Prevention

- Set `pull.rebase` (or `pull.ff only`) deliberately (Chapter 8).
- Pull from a clean working tree.
- Fetch and look before integrating when in doubt.

---

## Scenario 13: Need one commit from another branch

:::scenario Situation
A teammate's unfinished branch contains a utility function you need today, or a hotfix on `main` needs to go to `release/2.4`.
:::

### What happened

Nothing went wrong; you just need precise transplanting.

### Safest recovery

```bash
$ git log --oneline other-branch -10         # find the commit
$ git show --stat 5d2f90b                     # check it contains only what you want
$ git cherry-pick -x 5d2f90b
```

`-x` records where it came from (Chapter 46). If the commit depends on earlier commits (it calls a function added two commits before), pick the range:

```bash
$ git cherry-pick -x a91be03^..5d2f90b
```

If the commit mixes the part you need with other changes, take only the files you need instead of the commit:

```bash
$ git restore --source=5d2f90b -- src/utils/money.js
$ git commit -m "Add money helpers from feature/pricing (5d2f90b)"
```

### Dangerous alternatives

- Merging the whole unfinished branch to get one function.
- Copy-pasting code by hand without recording where it came from.

### Prevention

Ask teammates to land shared utilities in their own small PR first; it avoids duplicate commits and later conflicts.

---

## Scenario 14: Need to clean up a messy PR

:::scenario Situation
Your PR has 23 commits ("wip", "fix", "fix again", "merge main", "oops"), touches unrelated files, and includes a formatting change to half the codebase. Reviewers are struggling.
:::

### What happened

The branch accumulated history as you worked. That's normal; now it needs editing before review.

### Safest recovery

First, make a safety branch:

```bash
$ git branch backup/coupons-messy
```

**Option A: squash everything into a few meaningful commits.** Reset softly to where your branch diverged from `main`, then recommit in logical pieces:

```bash
$ git fetch
$ git reset --soft $(git merge-base origin/main HEAD)     # undo all commits, keep all changes staged
$ git restore --staged .                                  # unstage everything to rebuild commits
$ git add -p src/coupons/                                 # stage the first logical piece
$ git commit -m "Add coupon model and validation"
$ git add -p src/checkout/
$ git commit -m "Apply coupons at checkout"
$ git add -A tests/
$ git commit -m "Test coupon edge cases"
```

`git merge-base origin/main HEAD` is the commit where your branch split from main (Chapter 31). The "merge main" commits disappear naturally in this process.

**Option B: interactive rebase** when many commits are already meaningful and you only need to fold in the fixups and drop the noise (Chapter 38):

```bash
$ git rebase -i origin/main
```

**Remove unrelated changes.** Restore files you didn't mean to change back to `main`'s version:

```bash
$ git restore --source=origin/main -- src/legacy/ package.json
$ git commit -m "Revert unrelated changes"      # or fold this into the commits above
```

**Split out the reformat.** Move it to its own PR: create a branch from `main`, run the formatter there, open that PR. Rebase your feature once it merges; your diff shrinks to the real change.

Then publish:

```bash
$ git diff backup/coupons-messy                   # should show only the unrelated changes you removed
$ git push --force-with-lease
```

Comment on the PR: "Squashed into 3 commits and moved the formatting to #412; no functional changes since the last review except removing unrelated files."

### Dangerous alternatives

- Closing the PR and opening a new one, losing the review discussion (sometimes acceptable, but announce it).
- Force-pushing a rewritten PR someone else is also pushing to.

### Prevention

- Tidy as you go with `git commit --fixup` and `--autosquash` (Chapter 38).
- Keep formatting and refactors out of feature PRs.
- Open small PRs early rather than one large one late (Chapter 57).

:::recap
### What you learned
- Conflict flood: abort, diagnose (by folder and with `git log --merge`), merge `main` in steps around the troublesome commit, use rerere and whitespace options, talk to authors, or restart from fresh main.
- Bad pull: `merge --abort` / `rebase --abort` during, `reset --hard ORIG_HEAD` after; then integrate deliberately; revert others' broken changes rather than rewriting.
- One commit: `cherry-pick -x` (with a range for dependencies) or `restore --source` for just the files you need.
- Messy PR: backup branch, then `reset --soft $(git merge-base origin/main HEAD)` and recommit, or interactive rebase; restore unrelated files from main; split formatting into its own PR; push with lease and explain.

### Key terms
```terms
Merge base :: The commit where two branches diverged, found with git merge-base.
Incremental merge :: Merging a branch in several steps up to specific commits to keep conflicts small.
Backup branch :: A branch created before risky history editing so the original is easy to restore.
```

### Key commands
```commands
git diff --name-only --diff-filter=U :: List conflicted files.
git merge <commit> :: Merge only up to a specific commit.
git reset --hard ORIG_HEAD :: Undo a completed pull or merge.
git cherry-pick -x <commit> :: Copy one commit with its source recorded.
git restore --source=<commit> -- <paths> :: Take specific files from another commit.
git reset --soft $(git merge-base origin/main HEAD) :: Collapse a branch's commits, keeping changes staged.
```

### Common mistakes
- Using `-X ours` or "accept all" to escape conflicts.
- Rebuilding a messy PR without a backup branch.
- Cherry-picking a commit without the commits it depends on.

### Quick quiz
```quiz
? [scenario] Merging main into your old branch gives 40 conflicting files, mostly because main reformatted the codebase in one commit. Good strategy?
+ Abort, merge main up to just before the reformat, then the reformat commit (re-running the formatter), then the rest
- git merge -X ours main
- Delete all conflicted files
- Force-push your branch over main
> Incremental merges isolate the noisy commit so each step is small.

? [state] A pull just created an unwanted merge commit on your branch and you haven't pushed. How do you undo it?
+ git reset --hard ORIG_HEAD (from a clean working tree)
- git merge --abort
- git revert HEAD and push
- git pull again
> The merge is complete, so --abort no longer applies; ORIG_HEAD points at your pre-pull tip.

? What does git reset --soft $(git merge-base origin/main HEAD) do on a feature branch?
+ Removes all the branch's commits while keeping all their changes staged, ready to recommit
- Deletes the branch
- Merges main into the branch
- Discards all your changes
> It moves the branch back to the fork point without touching the index or files.

? [tf] To take one function from a teammate's unfinished branch, merging their whole branch is the cleanest approach.
- True
+ False
> Cherry-pick the commit (or restore just the file) instead of pulling in unfinished work.
```

### Practical exercise
````exercise Clean a messy branch
In a practice repository:
1. Create `feature/messy` with six small commits including "wip", "fix typo" and an unrelated change to `README.md`.
2. Make a backup branch.
3. Collapse the branch with `reset --soft` to the merge base and rebuild it as two commits, restoring `README.md` from main.
4. Compare with the backup using `git diff backup/messy`.
---solution---
```bash
$ git branch backup/messy
$ git reset --soft $(git merge-base main HEAD)
$ git restore --staged . && git restore --source=main -- README.md
$ git add -p && git commit -m "Add feature core"
$ git add -A && git commit -m "Add feature tests"
$ git log --oneline main..       # two commits
$ git diff backup/messy          # only README.md differs (its unrelated change removed)
```
````

### What to learn next
Part 17 gathers the habits that prevent most of these scenarios in the first place: professional best practices.
:::
