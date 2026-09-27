---
id: git-push
part: 4
title: Sharing Work with git push
minutes: 22
level: Beginner
topics: 43 git push
objectives:
- Push a branch and set its upstream the first time
- Explain what the server does when it receives a push
- Diagnose and fix a rejected push without losing anyone's work
- Delete a remote branch and push tags
- Understand why force pushing is dangerous before you ever need it
concepts: push | upstream | fast-forward | rejected push | force push | protected branch
commands: git push | git push -u origin <branch> | git push origin --delete <branch> | git push --force-with-lease
---
`git push` uploads your local commits to a remote and moves the remote branch to point at them. It is the moment your work becomes visible to the team, and the only everyday command that changes somebody else's repository. That's why Git is careful about it.

```diagram push
```

## A normal push

```cmd
git push origin feature/login
git :: The Git program.
push :: Upload commits and update a branch on a remote.
origin :: Which remote to push to.
feature/login :: Which local branch to push. It updates the branch of the same name on the remote.
```

When the branch already has an upstream, plain `git push` is enough:

```bash
$ git push
Enumerating objects: 7, done.
Counting objects: 100% (7/7), done.
Delta compression using up to 10 threads
Compressing objects: 100% (4/4), done.
Writing objects: 100% (4/4), 612 bytes | 612.00 KiB/s, done.
Total 4 (delta 2), reused 0 (delta 0), pack-reused 0
To github.com:acme/shop.git
   7be20d4..a91be03  feature/login -> feature/login
```

The last line is the result: the remote's `feature/login` moved from `7be20d4` to `a91be03`. Git also updates your `origin/feature/login` to match.

## The first push of a new branch

A branch you created locally has no upstream yet:

```bash
$ git switch -c feature/x
$ git push
fatal: The current branch feature/x has no upstream branch.
To push the current branch and set the remote as upstream, use

    git push --set-upstream origin feature/x
```

Do what it says (`-u` is the short form of `--set-upstream`):

```bash
$ git push -u origin feature/x
 * [new branch]      feature/x -> feature/x
branch 'feature/x' set up to track 'origin/feature/x'.
```

GitHub usually adds a helpful line in the output with a link to open a pull request for the new branch.

:::tip Never type -u again
With `git config --global push.autoSetupRemote true` (Git 2.37+, recommended in Chapter 8), the first plain `git push` of a new branch creates it on the remote and sets the upstream automatically.
:::

## What the server checks

When your push arrives, the server accepts it only if it is a **fast-forward**: the remote branch's current commit must be an ancestor of what you are pushing. In plain English: **your branch must already contain everything the server's branch has**. You may only add commits on top.

This rule is what stops you from silently erasing a teammate's work.

## Rejected pushes

Two flavours, same cause: the server has commits you haven't integrated.

**"fetch first"**: the server has commits your repository has never seen.

```bash
$ git push
To github.com:acme/shop.git
 ! [rejected]        main -> main (fetch first)
error: failed to push some refs to 'github.com:acme/shop.git'
hint: Updates were rejected because the remote contains work that you do not
hint: have locally. This is usually caused by another repository pushing to
hint: the same ref. If you want to integrate the remote changes, use
hint: 'git pull' before pushing again.
```

**"non-fast-forward"**: you have fetched those commits, but your branch doesn't include them yet.

```bash
$ git push
 ! [rejected]        main -> main (non-fast-forward)
error: failed to push some refs to 'github.com:acme/shop.git'
hint: Updates were rejected because the tip of your current branch is behind
hint: its remote counterpart. If you want to integrate the remote changes,
hint: use 'git pull' before pushing again.
```

Either way, **nothing was changed on the server** and nothing was lost locally. The fix is always the same shape:

```bash
$ git pull            # fetch + merge or rebase (Chapter 21)
# resolve conflicts if any
$ git push
```

```viz remote
```

:::danger Do not reach for --force to "fix" a rejection
A rejected push means the server has work you don't. `git push --force` tells the server to discard that work and use yours instead. On a shared branch, that deletes your teammates' commits from the branch. Always integrate (pull), then push normally.
:::

## Force pushing, briefly

There is one legitimate reason to replace a remote branch's history: you **rewrote your own branch** (with amend or rebase, Parts 6 and 8) after pushing it. The rewritten commits have new hashes, so a normal push is rejected as non-fast-forward even though no teammate did anything.

For that case, use the safer variant:

```cmd
git push --force-with-lease
--force-with-lease :: Overwrite the remote branch ONLY if it still points where your origin/<branch> says it does. If someone else pushed in the meantime, refuse.
```

Plain `--force` overwrites unconditionally. `--force-with-lease` checks that you are overwriting exactly what you expect, so it refuses if a teammate pushed after your last fetch. Chapter 37 and Chapter 79 cover the rules in full. Until then: **never force push to `main` or any branch others commit to.**

## Pushing to protected branches

Most teams protect `main` on GitHub so that changes arrive only through reviewed pull requests. A direct push is refused by the server:

```bash
$ git push origin main
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: error: Changes must be made through a pull request.
 ! [remote rejected] main -> main (protected branch hook declined)
```

That's the system working as intended. Push a branch and open a pull request instead (Chapter 51). If you committed to `main` by accident, Chapter 72 shows how to move those commits to a new branch.

## Deleting a remote branch

After a pull request merges, delete its branch on the server (GitHub has a button for this too):

```bash
$ git push origin --delete feature/x
To github.com:acme/shop.git
 - [deleted]         feature/x
```

Your local `feature/x` is unaffected; delete it separately with `git branch -d feature/x` (Chapter 26).

## Pushing tags

`git push` does not send tags by default. Push them explicitly (Chapter 48):

```bash
$ git push origin v1.4.0          # one tag
$ git push --follow-tags          # annotated tags that point at commits you are pushing
```

## Before you push: a checklist

```bash
$ git status                       # clean? on the branch you think?
$ git log --oneline @{u}..         # what exactly am I about to publish?
$ git push
```

`@{u}` means "this branch's upstream", so `@{u}..` lists your outgoing commits (Chapter 23).

:::recap
### What you learned
- `git push` uploads commits and moves the remote branch; it updates `origin/<branch>` too.
- The first push of a branch needs `-u origin <branch>` (or `push.autoSetupRemote`).
- The server only accepts fast-forward pushes. A rejection means the server has work you lack: pull, then push.
- `--force` overwrites remote history; `--force-with-lease` does so only if nobody else has pushed. Never force a shared branch.
- Protected branches refuse direct pushes; use pull requests.
- `git push origin --delete <branch>` removes a remote branch; tags need explicit pushes.

### Key terms
```terms
Push :: Upload commits and move a branch on a remote.
Upstream :: The remote branch that plain git push and git pull use for the current branch.
Rejected push :: A push the server refuses because it would not be a fast-forward.
Force push :: A push that replaces the remote branch's history even when it isn't a fast-forward.
--force-with-lease :: A force push that refuses if the remote branch changed since your last fetch.
Protected branch :: A server-side branch with rules such as "changes only through pull requests".
```

### Key commands
```commands
git push :: Push the current branch to its upstream.
git push -u origin <branch> :: First push of a branch, setting its upstream.
git push origin --delete <branch> :: Delete a branch on the remote.
git push --force-with-lease :: Replace your own rewritten branch safely.
git push origin <tag> :: Push a tag.
git log @{u}.. :: Preview the commits you are about to push.
```

### Common mistakes
- Using `--force` to get past a rejection, erasing a teammate's commits.
- Forgetting that tags are not pushed by default.
- Pushing without checking which branch you're on.

### Quick quiz
```quiz
? [predict] What does this mean?
|  ! [rejected]        main -> main (fetch first)
+ The server has commits you don't have; pull (or fetch and integrate) and push again
- Your push succeeded but needs confirmation
- You must run git fetch --prune
- The main branch is protected
> Nothing was changed on the server. Integrate the remote work, then push.

? [tf] A rejected push can delete your local commits.
- True
+ False
> A rejection changes nothing, locally or on the server.

? Why is --force-with-lease safer than --force?
- It pushes more slowly
+ It refuses to overwrite the remote branch if someone else has pushed since your last fetch
- It creates a backup branch on GitHub
- It only works on main
> The "lease" is your origin/<branch>. If the server no longer matches it, someone else's work is there, and the push is refused.

? [scenario] You pushed feature/x, then amended its last commit locally. git push is rejected as non-fast-forward. Nobody else uses feature/x. What's appropriate?
- git push --force to main
+ git push --force-with-lease
- Delete the repository and re-clone
- git pull, which duplicates the amended commit
> You rewrote your own branch; the remote still has the old commit. A lease-protected force push replaces it safely.

? [troubleshoot] git push says "The current branch feature/y has no upstream branch". Fix?
+ git push -u origin feature/y
- git pull
- git branch -d feature/y
- git remote add upstream
> The branch has never been pushed. -u creates it on the remote and links them.
```

### Practical exercise
````exercise Cause and fix a rejection
Using the bare-server setup from Chapter 21's exercise (or two clones of any repository you own):
1. Make a commit in clone A and push.
2. Without pulling, make a different commit in clone B and try to push. Read the rejection.
3. Fix it properly and push from B.
4. Push a new branch from B with `-u`, then delete it on the remote.
---solution---
```bash
# in B after the rejection
$ git pull --rebase          # or --no-rebase, per your preference
$ git push
$ git switch -c tmp/test && git push -u origin tmp/test
$ git push origin --delete tmp/test
$ git switch main && git branch -d tmp/test
```
The first push from B shows `! [rejected] ... (fetch first)`. After pulling, the push succeeds as a fast-forward.
````

### What to learn next
You've used upstreams in pull, push and status. The last chapter of Part 4 explains tracking branches precisely, including what `origin/main` means in every context.
:::
