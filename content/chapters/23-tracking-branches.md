---
id: tracking-branches
part: 4
title: Tracking Branches and origin/main
minutes: 20
level: Intermediate
topics: 44 Tracking branches | 45 Remote branches | 46 Understanding origin/main
objectives:
- Explain the relationship between a local branch, its upstream and the server branch
- Inspect every branch's upstream and ahead/behind counts in one command
- Set, change and remove a branch's upstream
- Use @{u} to compare with the upstream in logs and diffs
- Clean up local branches whose remote branch is gone
concepts: tracking branch | upstream | remote-tracking branch | origin/main | ahead / behind
commands: git branch -vv | git branch -u | git log @{u}.. | git log ..@{u} | git status -sb
---
You have met the pieces: local branches, `origin/main`, upstreams, ahead and behind. This chapter pins down the exact vocabulary, because it is where teammates' explanations most often talk past each other.

```diagram tracking
```

## Three kinds of branch

| Name | Example | Where it lives | Who moves it |
|---|---|---|---|
| **Local branch** | `main`, `feature/login` | Your repository | You: commit, merge, rebase, reset |
| **Remote-tracking branch** | `origin/main`, `origin/feature/login` | Your repository | Only `fetch`, `pull` and `push` |
| **Remote branch** | `main` on GitHub | The server | Whoever pushes |

A **tracking branch** is a local branch that has an **upstream** configured: a remote-tracking branch it compares itself with and syncs to by default. "main tracks origin/main" means: main's upstream is origin/main.

Configuring an upstream gives you four conveniences:

1. `git pull` knows what to fetch and integrate.
2. `git push` knows where to push.
3. `git status` reports ahead/behind.
4. `@{u}` refers to it in commands.

## Seeing every branch's upstream

```bash
$ git branch -vv
  feature/api     5d2f90b [origin/feature/api: behind 2] Add API client
* feature/login   a91be03 [origin/feature/login: ahead 1] Validate password
  experiment      3c9e1a0 Try new layout
  main            8d1c4e2 [origin/main] Load notes store
  old-fix         77a1b20 [origin/old-fix: gone] Fix header
```

```cmd
git branch -vv
branch :: List branches.
-vv :: Very verbose: show each branch's latest commit AND its upstream with ahead/behind counts.
```

Line by line:

- `feature/api` is **behind 2**: the server has two commits you haven't pulled.
- `feature/login` (starred, current) is **ahead 1**: you have one unpushed commit.
- `experiment` has **no upstream**: it exists only locally, never pushed.
- `main` matches its upstream exactly (no counts shown).
- `old-fix`'s upstream is **gone**: the branch was deleted on the server (and your fetch pruned `origin/old-fix`). The local branch is probably safe to delete.

These counts are based on your last fetch. Run `git fetch` first for fresh numbers.

## Setting and changing the upstream

| Situation | Command |
|---|---|
| First push of a new branch | `git push -u origin feature/x` |
| Create a local branch from a remote one | `git switch feature/x` (auto-tracks `origin/feature/x`) |
| Create with an explicit upstream | `git switch -c fix --track origin/release/2.4` |
| Set or change the upstream of the current branch | `git branch -u origin/feature/x` |
| Set for another branch | `git branch -u origin/main my-branch` |
| Remove the upstream | `git branch --unset-upstream` |

`-u` is short for `--set-upstream-to`. Upstream settings live in `.git/config`:

```ini title=".git/config"
[branch "feature/login"]
	remote = origin
	merge = refs/heads/feature/login
```

## @{u}: the upstream shorthand

`@{u}` (or `@{upstream}`) means "the upstream of the current branch". It saves typing and makes commands work on any branch:

| Command | Shows |
|---|---|
| `git log --oneline @{u}..` | Outgoing: commits you have that the upstream doesn't (what you'd push) |
| `git log --oneline ..@{u}` | Incoming: commits the upstream has that you don't (what you'd pull) |
| `git diff @{u}` | Differences between the upstream and your working directory |
| `git rev-list --left-right --count @{u}...HEAD` | Behind and ahead counts as two numbers |

Remember the rule: in `A..B`, the log shows what B has that A doesn't. Leaving one side empty means HEAD.

## "origin/main" versus "origin main"

This trips up almost everyone once.

- **`origin/main`** (one word, slash) is a **ref** in your repository: your remote-tracking branch. Use it where Git expects a commit or branch name: `git log origin/main`, `git merge origin/main`, `git diff main origin/main`.
- **`origin main`** (two words, space) is **remote name** + **branch name on that remote**, used by the network commands: `git pull origin main`, `git push origin main`, `git fetch origin main`.

```bash
$ git merge origin/main      # merge my cached copy of the server's main; no network
$ git pull origin main       # contact origin, fetch its main, then integrate it
```

## Understanding origin/main in status messages

Put it all together with the messages you'll see most:

| `git status` says | Meaning | Usual action |
|---|---|---|
| Your branch is up to date with 'origin/main' | Same commit as your *last-fetched* copy of the server | `git fetch` if you need certainty |
| Your branch is ahead of 'origin/main' by 2 commits | You have 2 unpushed commits | `git push` |
| Your branch is behind 'origin/main' by 3 commits, and can be fast-forwarded | Server has 3 commits you don't; you have none it lacks | `git pull` |
| Your branch and 'origin/main' have diverged, and have 2 and 3 different commits each | Both sides have new commits | `git pull` (merge or rebase), then `git push` |
| Your branch is based on 'origin/x', but the upstream is gone | Server branch deleted | Delete or re-point the local branch |

## Cleaning up gone branches

After a few weeks, your local branch list fills with merged work. Find branches whose upstream is gone:

```bash
$ git fetch --prune
$ git branch -vv | grep ': gone]'
  old-fix         77a1b20 [origin/old-fix: gone] Fix header
```

Delete them one at a time with `git branch -d old-fix`. `-d` refuses to delete a branch whose commits aren't merged into your current branch, which is a useful safety check (Chapter 26). If the pull request was **squash-merged** on GitHub, `-d` may refuse even though the work is merged, because the original commits aren't in main's history; confirm the PR merged, then use `-D`.

:::recap
### What you learned
- A tracking branch is a local branch with an upstream; the upstream is usually a remote-tracking branch like `origin/main`.
- `git branch -vv` shows every branch's upstream with ahead, behind and gone markers.
- Set upstreams with `push -u`, `switch` on a remote name, `--track`, or `git branch -u`.
- `@{u}` names the upstream: `@{u}..` is outgoing, `..@{u}` is incoming.
- `origin/main` is a ref in your repository; `origin main` is remote plus branch for network commands.

### Key terms
```terms
Tracking branch :: A local branch configured with an upstream.
Upstream :: The branch a tracking branch compares with and syncs to by default.
Remote-tracking branch :: A local, read-only ref like origin/main recording a server branch as of the last contact.
@{u} :: Shorthand for the current branch's upstream.
Gone :: Marker for a local branch whose upstream no longer exists.
```

### Key commands
```commands
git branch -vv :: Show upstreams and ahead/behind for all branches.
git branch -u origin/<branch> :: Set the current branch's upstream.
git branch --unset-upstream :: Remove the upstream.
git log @{u}.. :: Commits you would push.
git log ..@{u} :: Commits you would pull.
git status -sb :: Branch line with ahead/behind in short form.
```

### Common mistakes
- Typing `git merge origin main` (two words) and getting an error or an unexpected merge.
- Reading ahead/behind counts without fetching first.
- Deleting "gone" branches with `-D` without confirming the work was merged.

### Quick quiz
```quiz
? [predict] What does this line from git branch -vv tell you?
|   feature/api   5d2f90b [origin/feature/api: ahead 1, behind 2] Add API client
+ You have 1 commit the upstream lacks, and it has 2 you lack: the branches have diverged
- feature/api is 1 commit behind main
- The branch was deleted on the server
- You need to force push
> Ahead and behind together mean divergence. Pull (merge or rebase), then push.

? Which command lists commits you would send with git push?
+ git log @{u}..
- git log ..@{u}
- git log origin
- git status --push
> `@{u}..` shows commits reachable from HEAD but not from the upstream.

? [tf] git merge origin/main contacts the server.
- True
+ False
> origin/main is a local remote-tracking ref. Only fetch, pull, push and clone use the network.

? [scenario] git branch -vv marks old-fix as [origin/old-fix: gone]. What does that usually mean?
+ The branch was deleted on the server, typically after its pull request merged
- Your local old-fix lost its commits
- old-fix was force-pushed
- Your network connection failed
> Confirm the work is merged, then delete the local branch.
```

### Practical exercise
```exercise Audit your branches
In any repository with a few branches:
1. Run `git fetch --prune` then `git branch -vv`.
2. For the current branch, list outgoing and incoming commits with `@{u}`.
3. Find any branch without an upstream and decide whether it should be pushed or deleted.
4. Find any `gone` branches and delete the ones whose work is merged.
---solution---
`git log --oneline @{u}..` and `git log --oneline ..@{u}` show outgoing and incoming commits. A branch with no bracket in `-vv` output has no upstream; push it with `git push -u origin <name>` if it matters. Delete merged gone branches with `git branch -d <name>`.
```

### What to learn next
You can collaborate on a single branch. Part 5 is about the real power of Git: many branches, cheaply, for everything you work on.
:::
