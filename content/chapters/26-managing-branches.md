---
id: managing-branches
part: 5
title: Listing, Renaming and Deleting Branches
minutes: 20
level: Beginner
topics: 52 Listing branches | 53 Renaming branches | 54 Deleting branches | 55 Tracking branches
objectives:
- List branches with the details you need, including merged and unmerged ones
- Rename local branches and branches that already exist on the remote
- Delete branches safely, locally and on the remote
- Set up tracking for branches as you create, push and rename them
concepts: branch | merged branch | upstream | tracking branch | remote branch
commands: git branch -v | git branch --merged | git branch --no-merged | git branch -m | git branch -d | git branch -D | git push origin --delete
---
Branches are cheap to create, so they accumulate. This chapter is housekeeping: seeing what you have, renaming what's badly named, and deleting what's done, without deleting anything you still need.

## Listing branches

| Command | Shows |
|---|---|
| `git branch` | Local branches; `*` marks the current one |
| `git branch -v` | Plus each branch's latest commit hash and subject |
| `git branch -vv` | Plus each branch's upstream and ahead/behind (Chapter 23) |
| `git branch -r` | Remote-tracking branches only |
| `git branch -a` | Local and remote-tracking |
| `git branch --merged` | Branches whose commits are all reachable from HEAD |
| `git branch --no-merged` | Branches with commits HEAD doesn't have |
| `git branch --sort=-committerdate` | Most recently active first |
| `git branch --list 'fix/*'` | Only names matching a pattern |

```bash
$ git branch -v --sort=-committerdate
* feature/coupons 3c9e1a0 Validate coupon expiry
  main            8d1c4e2 Load notes store at startup
  fix/header      77a1b20 Fix header height on mobile
  spike/graphql   e4c9b18 Try GraphQL client
```

### Merged versus not merged

`--merged` answers "which branches are completely included in where I am now?" From `main`:

```bash
$ git switch main
$ git branch --merged
  fix/header
* main

$ git branch --no-merged
  feature/coupons
  spike/graphql
```

`fix/header`'s commits are all in `main`, so deleting its label loses nothing. `feature/coupons` has commits `main` doesn't, so deleting it would orphan work.

:::note Squash merges hide as "not merged"
If GitHub merged a pull request with **Squash and merge**, the branch's individual commits never enter `main`; a single new commit does. Git can't tell they're equivalent, so the branch shows under `--no-merged`. Check the pull request instead.
:::

## Renaming branches

### A local branch

```cmd
git branch -m old-name new-name
branch :: The branch command.
-m :: "Move": rename a branch. Use -M to overwrite an existing branch with the new name.
old-name new-name :: From, to. Leave out old-name to rename the current branch.
```

```bash
$ git branch -m feature/cuopons feature/coupons   # fix a typo
$ git branch -m feature/coupons-v2                # rename the branch you're on
```

Renaming keeps the commits and moves the reflog; it's just a new name on the same pointer.

### A branch that's already on the remote

The remote doesn't know about your rename. There's no "rename" push; you push the new name and delete the old one:

```bash
$ git branch -m feature/cuopons feature/coupons     # rename locally
$ git push -u origin feature/coupons                 # create the new name on the server, set upstream
$ git push origin --delete feature/cuopons           # remove the old name from the server
```

:::warning Renaming a branch other people use
Teammates who have the old branch checked out keep pushing to the old name, recreating it. Coordinate first. If there's an open pull request for the old branch, GitHub closes it when the branch is deleted; renaming the branch through GitHub's web interface instead updates open pull requests automatically.
:::

### Renaming master to main

Many older repositories rename their default branch. GitHub's branch settings page can rename the default branch on the server and updates open pull requests and branch protection. Each developer then updates their clone:

```bash
$ git branch -m master main
$ git fetch origin
$ git branch -u origin/main main
$ git remote set-head origin -a      # update origin/HEAD to the new default
```

GitHub shows these exact commands to people visiting the repository after a rename.

## Deleting branches

### Safe delete: -d

```bash
$ git branch -d fix/header
Deleted branch fix/header (was 77a1b20).
```

`-d` refuses if the branch has commits not merged into the current branch (or into its upstream):

```bash
$ git branch -d spike/graphql
error: the branch 'spike/graphql' is not fully merged.
If you are sure you want to delete it, run 'git branch -D spike/graphql'
```

This is a guard rail, not an error. Read it as "you'd be losing access to commits".

### Force delete: -D

```bash
$ git branch -D spike/graphql
Deleted branch spike/graphql (was e4c9b18).
```

Use `-D` when you're sure: a failed experiment, or a squash-merged branch you've verified.

:::recover Deleted the wrong branch?
The output shows the commit it pointed to: `(was e4c9b18)`. Recreate it:

```bash
$ git branch spike/graphql e4c9b18
```

If the terminal is gone, `git reflog` shows recent commits you've been on (Chapter 43).
:::

### You can't delete the branch you're on

```bash
$ git branch -d feature/coupons
error: cannot delete branch 'feature/coupons' used by worktree at '/Users/priya/code/shop'
```

Switch to another branch first. (Older Git versions word it as "Cannot delete branch … checked out at …". A **worktree** is a checked-out copy of the repository; you normally have one. Chapter 66 covers having several.)

### Deleting on the remote

```bash
$ git push origin --delete fix/header
To github.com:acme/shop.git
 - [deleted]         fix/header
```

Deleting on the remote doesn't delete your local branch, and deleting locally doesn't delete the remote one. After a pull request merges, you typically:

1. click **Delete branch** on GitHub (or have it automatic in repository settings),
2. `git fetch --prune` to drop `origin/fix/header`,
3. `git branch -d fix/header` to drop your local label.

## Tracking branches in practice

Chapter 23 explained upstreams. Here's how they get set during a branch's life:

| Moment | Command | Upstream afterwards |
|---|---|---|
| Create local branch | `git switch -c feature/x` | None |
| First push | `git push -u origin feature/x` | `origin/feature/x` |
| Start from someone's pushed branch | `git switch feature/y` | `origin/feature/y` |
| Base a branch on a remote branch explicitly | `git switch -c fix --track origin/release/2.4` | `origin/release/2.4` |
| Rename locally | `git branch -m new` | Unchanged: still the old remote name |
| Point at a new remote name | `git branch -u origin/new` | `origin/new` |

That "rename keeps the old upstream" row is why the remote-rename recipe above re-pushes with `-u`.

## A tidy-up routine

Once a week:

```bash
$ git switch main && git pull
$ git fetch --prune
$ git branch --merged        # safe to delete (except main)
$ git branch -vv | grep gone # upstream deleted: probably merged via PR
```

Delete what's done. A short branch list makes `git switch` tab-completion and your mental model much nicer.

:::recap
### What you learned
- `git branch` with `-v`, `-vv`, `-a`, `--merged`, `--no-merged` and `--sort` shows what you have.
- `git branch -m` renames; for a pushed branch, push the new name with `-u` and delete the old one.
- `git branch -d` deletes only merged branches; `-D` forces. The deletion message shows the hash to recover from.
- `git push origin --delete <branch>` deletes on the server; local and remote deletions are separate.
- Upstreams are set by `push -u`, switching to a remote branch name, `--track` or `git branch -u`.

### Key terms
```terms
Merged branch :: A branch whose commits are all reachable from the current branch.
Force delete :: Deleting a branch with -D regardless of whether its commits are merged.
Rename :: Changing a branch's name with -m; commits are unaffected.
```

### Key commands
```commands
git branch -v :: Branches with their latest commit.
git branch --merged / --no-merged :: Branches fully included / not included in HEAD.
git branch -m [old] new :: Rename a branch.
git branch -d <branch> :: Delete a merged branch.
git branch -D <branch> :: Force-delete a branch.
git push origin --delete <branch> :: Delete a branch on the remote.
git branch <name> <hash> :: Recreate a deleted branch at a known commit.
```

### Common mistakes
- Using `-D` by habit and deleting unmerged work.
- Renaming a pushed branch locally and expecting the remote to follow.
- Deleting a remote branch that teammates still use.

### Quick quiz
```quiz
? [predict] What does this mean?
| $ git branch -d spike/api
| error: the branch 'spike/api' is not fully merged.
+ spike/api has commits that aren't in your current branch, so Git won't delete it with -d
- spike/api doesn't exist
- You're currently on spike/api
- spike/api has merge conflicts
> -d protects unmerged work. Use -D only if you're sure you don't need those commits.

? You renamed feature/x to feature/y locally. What happens on GitHub?
- feature/x is renamed automatically
+ Nothing; feature/x still exists there until you push feature/y and delete feature/x
- GitHub deletes feature/x
- Your next push fails permanently
> Renames are local. Push the new name and delete the old one on the remote.

? [scenario] You just force-deleted a branch by mistake and the terminal still shows "Deleted branch hotfix (was 51c0e2a)". Fastest recovery?
+ git branch hotfix 51c0e2a
- git undo
- git revert 51c0e2a
- Re-clone the repository
> The commit still exists. Put a branch label back on it.

? Which command shows branches whose work is fully contained in the current branch?
- git branch -a
+ git branch --merged
- git branch -vv
- git branch --no-merged
> --merged lists branches reachable from HEAD, so deleting them loses nothing.
```

### Practical exercise
````exercise Housekeeping drill
In a practice repository:
1. Create branches `tmp/a` and `tmp/b` from `main`. Commit something on `tmp/b` only.
2. From `main`, list `--merged` and `--no-merged`.
3. Rename `tmp/a` to `tmp/alpha`.
4. Delete `tmp/alpha` with `-d`. Try `-d` on `tmp/b`, read the refusal, then delete it with `-D`.
5. Recreate `tmp/b` from the hash in the deletion message.
---solution---
```bash
$ git switch main
$ git branch tmp/a && git switch -c tmp/b
$ echo b > b.txt && git add b.txt && git commit -m "b"
$ git switch main
$ git branch --merged        # main, tmp/a
$ git branch --no-merged     # tmp/b
$ git branch -m tmp/a tmp/alpha
$ git branch -d tmp/alpha
$ git branch -d tmp/b        # refused: not fully merged
$ git branch -D tmp/b        # Deleted branch tmp/b (was <hash>)
$ git branch tmp/b <hash>
```
````

### What to learn next
You can manage branches. The last chapter of Part 5 puts them to work in the feature branch workflow that most teams use every day.
:::
