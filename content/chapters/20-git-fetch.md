---
id: git-fetch
part: 4
title: Downloading Changes with git fetch
minutes: 18
level: Beginner
topics: 41 git fetch
objectives:
- Explain exactly what fetch changes and what it never touches
- Read fetch output, including new, updated and deleted branches
- Inspect incoming commits before integrating them
- Keep remote-tracking branches tidy with --prune
concepts: fetch | remote-tracking branch | origin/main | prune | incoming commits
commands: git fetch | git fetch --prune | git fetch --all | git log main..origin/main | git diff main...origin/main
---
`git fetch` is the safest network command in Git. It downloads new commits from a remote and updates your remote-tracking branches, and that is all. It never changes your branches, your staging area or your files. That makes it the perfect "what's new?" command.

```diagram fetch-pull
```

## What fetch does

```cmd
git fetch origin
git :: The Git program.
fetch :: Download commits and references from a remote.
origin :: Which remote. If omitted, Git uses the current branch's upstream remote, or origin.
```

Step by step:

1. Git contacts `origin` and asks which branches exist and where they point.
2. It downloads any commits you don't have yet.
3. It moves your remote-tracking branches (`origin/main`, `origin/feature/x`, …) to match the server.

It does **not**:

- move your local branches (`main`, `feature/x`),
- change your working directory or staging area,
- create local branches for new remote branches.

You can run `git fetch` at any moment, even with uncommitted work, even mid-task. It cannot cause conflicts.

## Reading fetch output

```bash
$ git fetch
remote: Enumerating objects: 14, done.
remote: Counting objects: 100% (14/14), done.
remote: Compressing objects: 100% (6/6), done.
remote: Total 9 (delta 4), reused 0 (delta 0), pack-reused 0
Unpacking objects: 100% (9/9), 1.02 KiB | 104.00 KiB/s, done.
From github.com:acme/shop
   8d1c4e2..a91be03  main             -> origin/main
 * [new branch]      feature/coupons  -> origin/feature/coupons
 + 5d2f90b...c3e7a12 feature/api      -> origin/feature/api  (forced update)
```

The lines after `From` are the important part:

| Line | Meaning |
|---|---|
| `8d1c4e2..a91be03  main -> origin/main` | `origin/main` moved forward from `8d1c4e2` to `a91be03`. Two dots mean an ordinary fast-forward. |
| `* [new branch] feature/coupons -> origin/feature/coupons` | A branch you had never seen. It now exists as a remote-tracking branch. |
| `+ 5d2f90b...c3e7a12 feature/api (forced update)` | Someone **force-pushed** this branch: its history was rewritten on the server. Three dots and `+` flag it. If you have a local `feature/api`, be careful before pulling (Chapter 58). |

If nothing changed, fetch prints nothing at all.

## Looking before you leap

Because fetch only updates `origin/*`, you can inspect what arrived before deciding what to do.

**What's new on the server that I don't have?**

```bash
$ git log --oneline main..origin/main
a91be03 Add coupon validation
7c1e9f0 Update checkout copy
```

`A..B` in `git log` means "commits reachable from B but not from A". So `main..origin/main` lists **incoming** commits.

**What do I have that the server doesn't?**

```bash
$ git log --oneline origin/main..main
```

That lists **outgoing** commits: your unpushed work.

**What will change in the code?**

```bash
$ git diff main...origin/main --stat
 src/checkout.js | 12 +++++++-----
 src/coupons.js  | 30 ++++++++++++++++++++++++++++++
```

**The whole picture as a graph:**

```bash
$ git log --oneline --graph main origin/main
```

And `git status` now reports ahead/behind based on the fresh data:

```bash
$ git status
On branch main
Your branch is behind 'origin/main' by 2 commits, and can be fast-forwarded.
  (use "git pull" to update your local branch)
```

Once you have looked, integrate with `git pull`, `git merge origin/main` or `git rebase origin/main` (next chapter and Part 8).

## Fetch options you'll use

| Command | Effect |
|---|---|
| `git fetch` | Fetch from the default remote |
| `git fetch origin` | Fetch from `origin` explicitly |
| `git fetch upstream` | Fetch from another remote, such as the original project in a fork workflow |
| `git fetch --all` | Fetch from every configured remote |
| `git fetch --prune` | Also delete remote-tracking branches whose server branch was deleted |
| `git fetch --tags` | Fetch all tags, even ones not on fetched branches |
| `git fetch origin main` | Fetch only one branch |

### Pruning

When a pull request is merged, the branch is often deleted on GitHub. Without pruning, your `origin/feature/done-long-ago` lingers forever:

```bash
$ git fetch --prune
From github.com:acme/shop
 - [deleted]         (none)     -> origin/feature/coupons
```

Set `git config --global fetch.prune true` (Chapter 8) and every fetch prunes automatically.

:::note Pruning never deletes your local branches
`--prune` only removes remote-tracking branches like `origin/feature/coupons`. Your local `feature/coupons` stays. `git branch -vv` marks such branches with `[origin/feature/coupons: gone]`, which is a handy signal that you can delete them (Chapter 26).
:::

## Why fetch regularly

- **Accurate status.** `git status` and your editor's "↓2 ↑1" counters compare with `origin/*`. Fresh data means accurate numbers.
- **Early warning.** You see that a teammate is changing the same files before your branches drift far apart.
- **It's harmless.** Many editors fetch automatically in the background for exactly this reason.

:::analogy Checking the post without opening it
Fetch is collecting today's post and putting it on the hall table. Nothing in your house changes. You can read the envelopes (`git log main..origin/main`) and decide when to open them (`git merge`). `git pull` is collecting the post and immediately opening all of it at the kitchen table.
:::

## Try it

In the simulator, a teammate has pushed to `main`. Fetch, and watch only the blue `origin/main` label move.

```viz remote
```

:::recap
### What you learned
- `git fetch` downloads new commits and updates remote-tracking branches only. It never touches your branches or files.
- Fetch output shows fast-forwards (`..`), new branches, deletions (with `--prune`) and forced updates (`...` and `+`).
- `git log main..origin/main` lists incoming commits; `origin/main..main` lists outgoing ones.
- `--prune` removes remote-tracking branches deleted on the server; set `fetch.prune` to make it automatic.

### Key terms
```terms
Fetch :: Download commits and update remote-tracking branches, without changing local branches.
Incoming commits :: Commits on the remote-tracking branch that your local branch doesn't have.
Outgoing commits :: Local commits the remote-tracking branch doesn't have.
Prune :: Remove remote-tracking branches whose server branches were deleted.
Forced update :: A remote branch whose history was rewritten, shown with + and three dots.
```

### Key commands
```commands
git fetch :: Update remote-tracking branches from the default remote.
git fetch --prune :: Fetch and remove deleted remote branches.
git fetch --all :: Fetch from every remote.
git log main..origin/main :: List commits you haven't integrated yet.
git diff main...origin/main :: Show what the incoming commits change.
```

### Common mistakes
- Expecting `git fetch` to update your files. It only updates `origin/*`.
- Trusting `git status` "up to date" without fetching first.
- Ignoring a "(forced update)" line on a branch you are working on.

### Quick quiz
```quiz
? [state] You have uncommitted edits on main. You run git fetch and a teammate's commit arrives. What changes?
- Your files are updated and your edits merged in
- Your edits are stashed automatically
+ Only origin/main moves; your branch, staging area and files are untouched
- Git refuses to fetch because you have uncommitted edits
> Fetch never touches your working directory or local branches, so it is always safe.

? Which command lists commits that are on the server's main (as of your last fetch) but not on your local main?
+ git log main..origin/main
- git log origin/main..main
- git diff main
- git status --all
> A..B shows commits reachable from B but not A: here, incoming commits.

? [predict] What does this fetch line tell you?
|  + 5d2f90b...c3e7a12 feature/api -> origin/feature/api  (forced update)
- A new branch appeared
- The branch was deleted
+ Someone rewrote feature/api's history on the server (force push)
- feature/api was merged into main
> Three dots and a + mark a non-fast-forward update. Take care if you have local commits on that branch.

? [tf] git fetch --prune deletes your local branches whose remote branches were deleted.
- True
+ False
> It removes only remote-tracking branches such as origin/feature/x. Local branches remain; `git branch -vv` shows them as "gone".
```

### Practical exercise
```exercise Inspect before integrating
Clone any active public repository (or use your team's). Wait a day, or ask a teammate to push something, then:

1. Run `git fetch` and read the output.
2. List incoming commits with `git log --oneline main..origin/main`.
3. Summarise their changes with `git diff --stat main...origin/main`.
4. Only then run `git pull`.
---solution---
Step 1 shows one line per updated branch. Step 2 lists the commits your main lacks; step 3 summarises their file changes. After step 4, `git log main..origin/main` prints nothing because main now includes them.
```

### What to learn next
Fetch shows you what's new. Next, integrate it into your branch with `git pull`, and understand the choice it makes between merging and rebasing.
:::
