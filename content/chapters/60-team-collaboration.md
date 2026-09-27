---
id: team-collaboration
part: 14
title: Team Collaboration and Juggling Multiple Features
minutes: 22
level: Professional
topics: 138 Team collaboration | 140 Working on multiple features
objectives:
- Share a branch with teammates without stepping on each other
- Pair program with Git, crediting both authors
- Work on several features at once using branches, stashes, WIP commits and worktrees
- Communicate the Git-related things that teammates need to know
concepts: shared branch | co-author | WIP commit | stash | worktree | pull --rebase
commands: git pull --rebase | git switch | git stash | git worktree add | git commit --trailer
---
The previous chapters described workflows. This one is about the day-to-day habits that make you easy to work with, and about keeping several pieces of your own work moving at the same time without losing track.

## Sharing a branch with teammates

Usually one person owns a branch. Sometimes two or three people work on the same feature branch. The rules change a little:

1. **Pull before you start and before you push.** Use `git pull --rebase` so your unpushed commits sit on top of theirs, without merge noise (Chapter 21).
2. **Push small and often.** The longer your commits sit locally, the more you'll diverge.
3. **Never rewrite shared commits.** No amending pushed commits, no interactive rebase of what others have, no force pushes, unless everyone agrees in the moment (Chapter 37).
4. **Split the work by file or area** where possible, to minimise conflicts.
5. **Announce disruptive changes.** "I'm renaming the `api/` folder, hold off for 20 minutes" saves everyone a painful merge.

```bash
$ git switch feature/checkout-v2
$ git pull --rebase
# ... work, commit ...
$ git pull --rebase
$ git push
```

## Pair and mob programming

When two people write code together at one machine, credit both with a **co-author trailer** (Chapter 59). GitHub shows both avatars on the commit.

```bash
$ git commit -m "Add coupon validation" \
    --trailer "Co-authored-by: Sam Lee <sam@acme.dev>"
```

For remote pairing that switches drivers, a common rhythm is: the driver commits and pushes a WIP commit to a shared branch, the next driver pulls and continues. Tidy the WIP commits before the PR, with the team's agreement.

## Juggling multiple features

You'll often have two or three things in flight: your main task, a review fix on yesterday's PR, a quick bug. Git gives you four tools, each suited to different time scales.

| Tool | Best for | How |
|---|---|---|
| **Branch per task** | Always | `git switch -c fix/header` |
| **Stash** | Interruptions of minutes | `git stash -u`, switch, come back, `git stash pop` (Chapter 44) |
| **WIP commit** | Interruptions of hours or overnight | `git commit -am "WIP: halfway through validation"`, push; later amend or squash |
| **Worktree** | Working on two branches at the same time, side by side | `git worktree add ../shop-hotfix main` (Chapter 66) |

### The WIP commit pattern

```bash
$ git add -A
$ git commit -m "WIP: coupon validation, tests failing"
$ git push                               # backed up, visible to you on any machine
$ git switch fix/urgent-thing
# ... later ...
$ git switch feature/coupons
$ git reset --soft HEAD~1                # un-commit, keep the changes staged
```

The WIP commit is honest ("this isn't done"), safe (it's pushed) and easy to undo. If the branch is shared or under review, amend or squash it later instead of resetting.

### Worktrees in one paragraph

A **worktree** is an additional working directory attached to the same repository, with a different branch checked out. You can have `~/code/shop` on `feature/coupons` and `~/code/shop-hotfix` on `main` simultaneously, each with its own files, without stashing or switching. Chapter 66 covers it fully.

```bash
$ git worktree add ../shop-hotfix -b hotfix/cart-total origin/main
$ cd ../shop-hotfix
```

### Keeping track

With several branches alive, use:

```bash
$ git branch -vv --sort=-committerdate        # most recent first, with upstreams
$ git stash list                              # anything parked?
$ gh pr status                                # your PRs and review requests
```

## Communication habits

Git problems between people are often communication problems:

- **Before force-pushing a branch someone might have**, say so.
- **Before a large rename, reformat or folder move**, warn the team or do it at a quiet time.
- **When you merge something that affects others** (new env variable, migration, changed setup), post a short note and update the README.
- **When you break main**, say so immediately and revert first, fix second.
- **When you're stuck in a Git mess**, ask early. A colleague with the reflog open can fix in two minutes what might cost you an afternoon.

## Etiquette checklist

- Pull before starting work; push before ending the day.
- One branch per task; delete branches after merging.
- Small PRs with clear descriptions; review others' PRs promptly.
- Don't commit generated files, secrets or large binaries (Chapter 79).
- Don't rewrite history others have; use `--force-with-lease` only on your own branches.
- Keep `main` green.

:::recap
### What you learned
- On shared branches: `pull --rebase` often, push small, never rewrite shared commits, split work, announce disruptive changes.
- Credit pair programming with `Co-authored-by` trailers.
- Juggle work with branches (always), stashes (minutes), WIP commits (hours) and worktrees (simultaneous).
- `git branch -vv --sort=-committerdate`, `git stash list` and `gh pr status` show what's in flight.
- Most Git conflicts between people are avoided by saying what you're about to do.

### Key terms
```terms
Shared branch :: A branch several people push to.
WIP commit :: A temporary work-in-progress commit, later amended or squashed.
Co-author :: A second author credited via a Co-authored-by trailer.
Worktree :: An extra working directory for the same repository with another branch checked out.
```

### Key commands
```commands
git pull --rebase :: Sync a shared branch without merge commits.
git commit --trailer "Co-authored-by: Name <email>" :: Credit a pair.
git commit -am "WIP: ..." :: Park work as a commit.
git reset --soft HEAD~1 :: Un-commit a WIP commit, keeping changes staged.
git worktree add <path> <branch> :: Work on another branch in a separate folder.
gh pr status :: Your PRs and pending reviews.
```

### Common mistakes
- Amending or rebasing commits on a branch a teammate is also using.
- Stashing work overnight and forgetting it.
- Silent force pushes.
- Staying stuck in a Git problem for hours instead of asking.

### Quick quiz
```quiz
? [scenario] You and a teammate both commit to feature/checkout-v2. What should you run before pushing?
+ git pull --rebase
- git push --force
- git reset --hard origin/main
- git rebase -i HEAD~10
> Rebasing your unpushed commits on top of theirs avoids merge noise without rewriting anything they have.

? Which tool fits "I need to work on a hotfix and keep my feature's dev server running at the same time"?
- git stash
- A WIP commit
+ git worktree
- git cherry-pick
> Worktrees give you a second working directory with its own checked-out branch.

? How do you credit a pair-programming partner on a commit?
+ Add a "Co-authored-by: Name <email>" trailer
- Put their name in the branch name
- Commit twice, once as each person
- Change user.name to both names
> GitHub recognises the trailer and credits both people.

? [tf] A WIP commit pushed to your own branch is a safer way to park work overnight than a stash.
+ True
- False
> It's backed up on the server and stays with its branch; stashes are local and easy to forget.
```

### Practical exercise
````exercise Juggle three tasks
In a practice repository:
1. Start `feature/a` and make an uncommitted change.
2. An "urgent" bug arrives: stash with a message, create `fix/b` from main, commit a fix.
3. Go back to `feature/a`, pop the stash, then park it as a WIP commit.
4. Add a worktree for `main` in a sibling folder, make a change there on a new branch `docs/c`, commit.
5. List all in-flight work.
---solution---
```bash
$ git switch -c feature/a && echo a >> a.txt
$ git stash push -u -m "feature/a in progress"
$ git switch -c fix/b main && echo fix > fix.txt && git add . && git commit -m "Fix b"
$ git switch feature/a && git stash pop
$ git add -A && git commit -m "WIP: feature a"
$ git worktree add ../practice-docs -b docs/c main
$ cd ../practice-docs && echo docs > DOCS.md && git add . && git commit -m "Add docs"
$ cd - && git branch -vv --sort=-committerdate && git stash list && git worktree list
```
````

### What to learn next
Part 15 goes deeper into Git: detached HEAD, the reflog in detail, bisect, blame, advanced log, worktrees, submodules, hooks, aliases and Git's internal object model.
:::
