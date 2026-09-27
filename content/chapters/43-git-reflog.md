---
id: git-reflog
part: 9
title: The Reflog and Recovering Lost Work
minutes: 24
level: Intermediate
topics: 98 Recovering lost work | 99 git reflog | 100 Disaster recovery scenarios
objectives:
- Explain what the reflog records and why it makes most mistakes recoverable
- Read reflog entries and use HEAD@{n} and branch@{n} references
- Recover commits after reset, rebase, amend and branch deletion
- Know the limits: what the reflog cannot recover and how long it keeps entries
- Follow a calm recovery procedure when something goes wrong
concepts: reflog | HEAD | unreachable commit | ORIG_HEAD | garbage collection | dangling commit
commands: git reflog | git reflog show <branch> | git reset --hard HEAD@{n} | git branch <name> HEAD@{n} | git fsck --lost-found
---
Here is the most reassuring fact in this book: **if you committed it, you can almost certainly get it back.** Reset too far, a rebase gone wrong, a deleted branch, an amend you regret: none of these destroy commits immediately. Git keeps a private diary of where HEAD and each branch have been, called the **reflog**. This chapter teaches you to read it.

## What the reflog is

Every time HEAD moves (commit, checkout, switch, reset, merge, rebase, pull, amend, cherry-pick), Git appends a line to a log **in your local repository**:

```bash
$ git reflog
e4c9b18 (HEAD -> main) HEAD@{0}: reset: moving to HEAD~2
a91be03 HEAD@{1}: commit: Add FAQ page
3c9e1a0 HEAD@{2}: commit: Add pricing page
e4c9b18 (HEAD -> main) HEAD@{3}: commit: Add homepage
51c0e2a HEAD@{4}: checkout: moving from feature/login to main
77a1b20 HEAD@{5}: commit: Validate password
```

```cmd
git reflog
reflog :: Show the reference log: HEAD's past positions, newest first. Short for git reflog show HEAD.
```

Each line has:

| Part | Example | Meaning |
|---|---|---|
| Hash | `a91be03` | Where HEAD pointed after that action |
| Selector | `HEAD@{1}` | "HEAD, one move ago"; usable as a reference in any command |
| Action | `commit: Add FAQ page` | What moved HEAD |

Reading from the bottom up, this reflog tells a story: you were on `feature/login`, switched to `main`, made three commits, then reset back two. The two "lost" commits are right there at `HEAD@{1}` and `HEAD@{2}`.

## Recovering is just pointing at a hash

Once you know the hash, recovery is one of two commands:

```bash
$ git reset --hard HEAD@{1}             # move the current branch back to that commit
$ git branch rescued a91be03            # or: put a new branch label on it, touching nothing else
```

Creating a branch is the gentler option: nothing about your current state changes, and the lost commits are safe on `rescued` while you decide what to do.

## The reflog as a safety net for everything

| Accident | Look in the reflog for | Recover with |
|---|---|---|
| `git reset --hard` too far | The line before `reset: moving to …` | `git reset --hard HEAD@{n}` |
| Bad rebase | The line before `rebase (start)` | `git reset --hard HEAD@{n}` (or `ORIG_HEAD` right after) |
| Regretted amend | The line before `commit (amend)` | `git reset --soft HEAD@{1}` |
| Deleted a branch | The last `commit:` or `checkout: moving from <branch>` on it | `git branch <name> <hash>` |
| Commits made in detached HEAD, then switched away | The `commit:` lines before `checkout: moving from <hash> to main` | `git branch <name> <hash>` |
| Bad merge or pull | The line before `merge …` / `pull: …` | `git reset --hard HEAD@{n}` |

Try the classic one in the sandbox: reset hard, look at the reflog, reset back.

```viz reset
```

## Branch reflogs and time-based references

Each branch also has its own reflog, recording where **that branch** pointed:

```bash
$ git reflog show main
e4c9b18 main@{0}: reset: moving to HEAD~2
a91be03 main@{1}: commit: Add FAQ page
3c9e1a0 main@{2}: commit: Add pricing page
```

That makes references like these possible:

| Reference | Means |
|---|---|
| `main@{1}` | Where main pointed before its last move |
| `main@{yesterday}` | Where main pointed 24 hours ago |
| `main@{2.hours.ago}` | …two hours ago |
| `HEAD@{5}` | Where HEAD was five moves ago |
| `@{-1}` | The branch you were on before the current one |

```bash
$ git diff main@{1} main                     # what did my last pull/reset do to main?
$ git log --oneline main@{yesterday}..main   # what's new on main since yesterday?
```

For more readable output, add dates: `git reflog --date=relative`.

## Limits of the reflog

The reflog is powerful but not magic:

- **It's local only.** It isn't pushed or cloned. Your teammate's reflog knows nothing about your commits, and a fresh clone has an empty reflog.
- **It only knows about commits.** Changes you never committed (never staged, never stashed) were never stored. `git reset --hard` and `git restore` on uncommitted edits are unrecoverable.
- **It expires.** By default, entries for commits that are still reachable are kept for 90 days, and entries for unreachable commits for 30 days. After that, `git gc` may prune the commits. In practice you have weeks, not minutes.
- **Deleting the repository deletes it.** Re-cloning to "fix" a problem throws away your reflog and any unpushed commits. Don't re-clone in a panic.

### Beyond the reflog: dangling objects

Some objects were never in the reflog, such as a stash you dropped or content you staged but never committed. Git may still have them as **dangling** objects until garbage collection:

```bash
$ git fsck --lost-found
dangling commit 5d2f90b...
dangling blob c07a1e4...
```

`git show <hash>` inspects each. Dangling blobs are staged file contents; dangling commits are often dropped stashes. This is a last resort, but it has saved many afternoons.

## A calm recovery procedure

When something seems lost, follow this order:

1. **Stop.** Don't run more commands that change things, don't delete the folder, don't re-clone.
2. **Protect current work.** If `git status` shows uncommitted changes you care about, `git stash -u` or commit them to a temporary branch.
3. **Read the reflog.** `git reflog --date=relative` and find the last line where things were right.
4. **Inspect before moving.** `git show <hash>` or `git log --oneline <hash>` to confirm it's the state you want.
5. **Recover non-destructively first.** `git branch rescue <hash>`. Now it's safe no matter what.
6. **Then fix your branch.** `git reset --hard rescue` (or merge/cherry-pick from `rescue`).
7. **If it was pushed**, think about teammates before force-pushing anything (Part 16).

Part 16 applies this procedure to fourteen realistic disasters in detail.

:::recap
### What you learned
- The reflog records every position HEAD (and each branch) has had in your local repository.
- `HEAD@{n}`, `branch@{n}` and `branch@{date}` refer to past positions and work in any command.
- Recover commits with `git reset --hard <hash>` or, more safely, `git branch <name> <hash>`.
- The reflog is local, only covers commits, and expires (90 days reachable, 30 unreachable, by default).
- `git fsck --lost-found` finds dangling objects the reflog doesn't cover.
- In a crisis: stop, protect, read the reflog, inspect, branch, then fix.

### Key terms
```terms
Reflog :: A local log of where HEAD and each branch have pointed over time.
HEAD@{n} :: HEAD's position n moves ago.
Unreachable commit :: A commit no branch, tag or HEAD can reach; kept until garbage collection.
Dangling object :: An unreferenced object that git fsck can still find.
Garbage collection :: Git's periodic cleanup that eventually deletes expired unreachable objects.
```

### Key commands
```commands
git reflog :: Show HEAD's history of positions.
git reflog show <branch> :: Show one branch's history.
git reflog --date=relative :: Include times like "2 hours ago".
git reset --hard HEAD@{n} :: Move back to an earlier state.
git branch <name> <hash> :: Put a branch on a recovered commit.
git fsck --lost-found :: List dangling commits and blobs.
```

### Common mistakes
- Re-cloning after a mistake, discarding the reflog and unpushed commits.
- Assuming the reflog can recover uncommitted work.
- Resetting to a reflog entry without inspecting it first.
- Expecting to find a teammate's lost commits in your reflog.

### Quick quiz
```quiz
? [predict] What does HEAD@{2} refer to?
| a91be03 HEAD@{0}: reset: moving to HEAD~1
| 3c9e1a0 HEAD@{1}: commit: Add FAQ
| e4c9b18 HEAD@{2}: commit: Add pricing
+ Commit e4c9b18, where HEAD was two moves ago
- The second commit in the repository
- The commit two steps back along parents from HEAD
- A branch named HEAD
> Reflog selectors count moves of HEAD, not parent steps (that's HEAD~2).

? [scenario] You deleted feature/x with -D and closed the terminal. How can you get it back?
+ Find its last commit in git reflog and run git branch feature/x <hash>
- It's gone forever
- git undo branch
- Re-clone the repository
> The commit still exists; the reflog shows where you were when you last worked on it.

? [tf] Your teammate can use their reflog to recover commits you made on your laptop and never pushed.
- True
+ False
> The reflog is local to each repository and is never shared.

? Which of these can the reflog NOT help you recover?
- Commits removed by git reset --hard
- Commits replaced by a rebase
+ Edits you never staged or committed, discarded with git restore
- A branch you deleted
> Git never stored those edits, so there's nothing to find.

? What is the safest first step once you've found a lost commit's hash?
+ git branch rescue <hash>, which changes nothing else
- git reset --hard <hash> immediately
- git push --force
- git gc
> Creating a branch protects the commit without touching your current state.
```

### Practical exercise
````exercise Lose and find
In a practice repository:
1. Make three commits.
2. Run `git reset --hard HEAD~3` (they "disappear").
3. Find them with `git reflog` and restore them with a branch called `rescue`.
4. Delete `rescue` with `-D` and recover it again from the deletion message or the reflog.
5. Run `git reflog show main` and `git reflog --date=relative`.
---solution---
```bash
$ for i in 1 2 3; do echo $i > f$i && git add . && git commit -qm "Commit $i"; done
$ git reset --hard HEAD~3
$ git reflog -n 5            # HEAD@{1} is "commit: Commit 3"
$ git branch rescue HEAD@{1}
$ git log --oneline rescue   # all three commits are back
$ git branch -D rescue       # Deleted branch rescue (was <hash>)
$ git branch rescue <hash>
```
````

### What to learn next
Part 10 covers `git stash`: a reversible way to put uncommitted work aside, which is also your safest alternative to discarding changes.
:::
