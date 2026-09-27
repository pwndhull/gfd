---
id: reflog-deep-dive
part: 15
title: The Reflog in Depth
minutes: 16
level: Advanced
topics: 142 Reflog
objectives:
- Distinguish HEAD's reflog from branch reflogs and the stash reflog
- Use @{n}, @{date}, @{-n}, @{u} and @{push} references fluently
- Explain reflog expiry, garbage collection and what they mean for recovery
- Use the reflog for forensics: what happened to this branch, and when?
concepts: reflog | HEAD | garbage collection | unreachable commit | ORIG_HEAD
commands: git reflog show | git log -g | git reflog --date=iso | git gc | git reflog expire
---
Chapter 43 used the reflog as a rescue tool. Advanced users also treat it as a **forensic record**: exactly what happened to each branch, in order, with timestamps. This chapter covers the details.

## Many reflogs, not one

Git keeps a separate reflog for:

| Reflog | Records | Read with |
|---|---|---|
| `HEAD` | Every move of HEAD: switches, commits, resets, merges, rebases | `git reflog` |
| Each local branch | Every change to where that branch points | `git reflog show main` |
| Remote-tracking branches | Updates from fetch, pull and push | `git reflog show origin/main` |
| `refs/stash` | The stash stack itself | `git stash list` |

They live in `.git/logs/`. A branch reflog is especially useful: it ignores all your switching around and shows only that branch's history of positions.

```bash
$ git reflog show feature/coupons --date=iso
3c9e1a0 feature/coupons@{2026-03-07 11:02:44 +1000}: rebase (finish): refs/heads/feature/coupons onto 8d1c4e2
77a1b20 feature/coupons@{2026-03-07 09:15:02 +1000}: commit: Validate coupon expiry
a91be03 feature/coupons@{2026-03-06 17:48:30 +1000}: commit: Add coupon field
5d2f90b feature/coupons@{2026-03-06 14:20:11 +1000}: branch: Created from main
```

## Reflog references

| Syntax | Meaning | Example |
|---|---|---|
| `@{n}` | Where the **current branch** was n moves ago | `git diff @{1}` |
| `<branch>@{n}` | Where a branch was n moves ago | `main@{3}` |
| `HEAD@{n}` | Where HEAD was n moves ago | `git reset --hard HEAD@{2}` |
| `<branch>@{<date>}` | Where a branch was at a time | `main@{yesterday}`, `main@{2026-03-01}`, `main@{1.week.ago}` |
| `@{-n}` | The nth previously checked-out branch | `git switch @{-1}` (same as `git switch -`) |
| `@{u}` / `@{upstream}` | The current branch's upstream | `git log @{u}..` |
| `@{push}` | Where the current branch would push to | `git diff @{push}` |

`@` alone means `HEAD`.

Note the difference between `HEAD@{1}` and `main@{1}` when you've been switching branches: `HEAD@{1}` might be a different branch entirely; `main@{1}` is always a previous position of `main`.

## Reflog as history: git log -g

`git log -g` (walk reflogs) shows reflog entries with full commit details:

```bash
$ git log -g --oneline main -5
8d1c4e2 main@{0}: pull: Fast-forward
e4c9b18 main@{1}: commit: Update footer
```

Combine with `--date=relative` or `--format` to build timelines: "main was reset at 16:02 by a pull that fast-forwarded three commits".

## Expiry and garbage collection

Reflogs don't grow forever. Two settings control expiry (defaults shown):

| Setting | Default | Applies to entries for commits that are… |
|---|---|---|
| `gc.reflogExpire` | 90 days | still reachable from the branch |
| `gc.reflogExpireUnreachable` | 30 days | no longer reachable from the branch |

Once reflog entries expire, the commits they referenced may become truly unreferenced, and **garbage collection** (`git gc`, run automatically from time to time by commands like `commit` and `fetch`) can delete them after a further grace period (`gc.pruneExpire`, two weeks by default).

In practice: **you have about a month to recover a commit you threw away**, often longer. If something is precious and orphaned, put a branch or tag on it now, and it's safe indefinitely.

:::danger Don't "clean up" during a recovery
Commands like `git gc --prune=now` or `git reflog expire --expire=now --all` destroy exactly the safety net you're relying on. Never run them while trying to recover something. They're used deliberately only when you must purge data, such as after removing a leaked secret (Chapter 73).
:::

## Forensics: what happened?

The reflog answers "what did I do?" questions precisely:

```bash
$ git reflog --date=relative -15
```

Typical findings:

- `reset: moving to HEAD~3` right before things went wrong → someone (you) reset too far.
- `rebase (start)` … `rebase (finish)` → a rebase rewrote the branch; the entry just before `start` is the old tip.
- `pull: Merge made by the 'ort' strategy.` → a pull merged instead of fast-forwarding.
- `checkout: moving from 3c9e1a0 to main` → you were detached at `3c9e1a0` (Chapter 61).
- `commit (amend)` → an amend replaced the previous tip.

Remember the limit: the reflog is **your** local history. It says nothing about what teammates did in their clones or what happened on the server (GitHub keeps its own activity logs for pushes and force pushes).

:::recap
### What you learned
- There are reflogs for HEAD, each branch, remote-tracking branches and the stash.
- `@{n}`, `branch@{date}`, `@{-n}`, `@{u}` and `@{push}` reference past and related positions.
- `git log -g` walks reflogs with full commit output.
- Reflog entries expire after 90 days (reachable) or 30 days (unreachable); gc then prunes old unreferenced objects.
- Branch or tag anything precious; never prune while recovering.
- The reflog is a forensic record of your own actions only.

### Key terms
```terms
Branch reflog :: The history of positions of one branch.
@{u} / @{push} :: The upstream / push destination of the current branch.
Reflog expiry :: The age after which reflog entries are deleted.
Garbage collection :: Git's cleanup that removes unreferenced objects after a grace period.
```

### Key commands
```commands
git reflog show <branch> :: One branch's reflog.
git reflog --date=iso :: Reflog with timestamps.
git log -g --oneline <ref> :: Walk a reflog as a log.
git diff main@{1} main :: What the last update to main changed.
git log main@{yesterday}..main :: What arrived on main since yesterday.
```

### Common mistakes
- Confusing `HEAD@{1}` (HEAD's previous position, possibly on another branch) with `main@{1}`.
- Running `git gc --prune=now` while trying to recover a commit.
- Expecting the reflog to show teammates' actions.

### Quick quiz
```quiz
? [scenario] You've been switching between several branches. You want main's position before your last pull. Which reference?
+ main@{1}
- HEAD@{1}
- HEAD~1
- @{-1}
> main@{1} is main's previous position regardless of what HEAD did.

? What is @{-1}?
+ The branch you had checked out before the current one
- The commit before HEAD
- The upstream branch
- The last stash
> git switch - is shorthand for switching to @{-1}.

? By default, roughly how long do reflog entries for unreachable commits survive?
+ 30 days
- 1 day
- 1 year
- Forever
> gc.reflogExpireUnreachable defaults to 30 days; reachable entries default to 90.

? [tf] git reflog on your laptop shows when a teammate force-pushed to the shared branch.
- True
+ False
> It shows only your local ref changes. Your origin/<branch> reflog shows when your fetches saw the change.
```

### Practical exercise
```exercise Timeline of a branch
In a practice repository:
1. Create a branch, commit twice, rebase it onto main, amend the last commit.
2. Show the branch's reflog with ISO dates and label each line with what you did.
3. Use `git diff <branch>@{3} <branch>` to see what the rebase and amend changed overall.
---solution---
The branch reflog (newest first) will show `commit (amend)`, `rebase (finish)`, two `commit:` entries and `branch: Created from main`. The exact index for "before the rebase" depends on your steps; find the entry just below `rebase (finish)` and diff against it. Because the rebase replayed onto new main commits, the diff includes main's changes plus your amend.
```

### What to learn next
Next: `git bisect`, which uses binary search through history to find exactly which commit introduced a bug.
:::
