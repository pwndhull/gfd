---
id: detached-head
part: 15
title: Detached HEAD, Demystified
minutes: 18
level: Advanced
topics: 141 Detached HEAD
objectives:
- Explain precisely what "detached HEAD" means and how you get into it
- Use detached HEAD deliberately to inspect old code safely
- Keep commits made while detached by creating a branch
- Recover commits you left behind after switching away
concepts: detached HEAD | HEAD | branch | tag | reflog | unreachable commit
commands: git switch --detach | git checkout <commit> | git switch -c | git branch <name> <hash> | git reflog
---
"You are in 'detached HEAD' state" is one of Git's most alarming-sounding messages. It's also one of the most harmless, once you know what it means. You've seen it briefly in Chapters 5, 18, 39 and 48; this chapter puts it all together.

## What it means

Normally, HEAD points at a **branch**, and the branch points at a commit (Chapter 5):

```text
HEAD → main → C
```

In **detached HEAD**, HEAD points **directly at a commit**, with no branch in between:

```text
HEAD → B
```

```diagram detached-head
```

`.git/HEAD` shows the difference:

```bash
$ cat .git/HEAD
ref: refs/heads/main          # attached: names a branch

$ cat .git/HEAD
51c0e2a9f8d7b6a5c4e3d2f1a0b9c8d7e6f5a4b3     # detached: a raw commit hash
```

That's all. Nothing is broken, nothing is lost.

## How you get there

| Action | Why it detaches |
|---|---|
| `git checkout 51c0e2a` or `git switch --detach 51c0e2a` | You asked for a commit, not a branch |
| `git checkout v2.4.0` | Tags don't move, so HEAD can't follow a tag as a branch |
| `git checkout origin/main` | Remote-tracking branches aren't yours to commit on |
| `git checkout HEAD~3` | A relative reference is a commit |
| During a rebase, `git bisect` or some submodule operations | Git temporarily works on commits, then reattaches |

`git switch` refuses to detach unless you pass `--detach`, which prevents accidents (Chapter 25). `git checkout` detaches silently apart from its warning.

## What you can do while detached

Everything read-only is completely safe:

- read the code, run the app, run tests at an old version,
- `git log`, `git diff`, `git show`,
- compare behaviour: "did this bug exist in 2.3?"

```bash
$ git switch --detach v2.3.0
HEAD is now at 51c0e2a Fix totals rounding
$ npm test
$ git switch -              # back to the branch you were on
```

## Committing while detached

You **can** commit in detached HEAD. The new commits hang off the commit you detached at, and HEAD moves along with them. The catch: **no branch points at them**.

```graph Committing while detached
          E---F   <- HEAD (no branch)
         /
A---B---C---D   main
```

As long as you stay here, nothing's wrong. When you switch away, E and F become unreachable, and Git warns you:

```bash
$ git switch main
Warning: you are leaving 2 commits behind, not connected to
any of your branches:

  89f4424 Try new layout
  3c9e1a0 Experiment with grid

If you want to keep it by creating a new branch, this may be a good time
to do so with:

 git branch <new-branch-name> 89f4424

Switched to branch 'main'
```

### Keeping the work

Before switching away, give it a branch:

```bash
$ git switch -c experiment/grid-layout
```

That's the whole fix: HEAD now points at a branch again, and the branch points at your commits.

### Already switched away?

Use the hash from the warning, or find it in the reflog (Chapter 43):

```bash
$ git branch experiment/grid-layout 89f4424
# or
$ git reflog
e4c9b18 HEAD@{0}: checkout: moving from 89f4424... to main
89f4424 HEAD@{1}: commit: Try new layout
$ git branch experiment/grid-layout HEAD@{1}
```

## Fixing a bug in an old version

A real use of detached HEAD: patch release 2.3.1 from tag `v2.3.0`.

```bash
$ git switch -c hotfix/2.3.1 v2.3.0     # create a branch at the tag directly, never detached
# fix, commit, test
$ git tag -a v2.3.1 -m "Fix totals rounding in 2.3"
$ git push -u origin hotfix/2.3.1 --follow-tags
```

Creating the branch straight from the tag skips the detached state entirely.

## Recognising it

- `git status` says `HEAD detached at 51c0e2a` (or `HEAD detached from …` if you've committed since).
- `git branch` shows `* (HEAD detached at 51c0e2a)`.
- Many shell prompts show a hash instead of a branch name.
- Editors show the hash in the status bar.

## Try it

Check out an older commit, commit an experiment, switch away, then rescue it from the reflog.

```viz head
```

:::recap
### What you learned
- Detached HEAD means HEAD points at a commit instead of a branch. It's safe.
- You get there by checking out a commit, tag, remote-tracking branch or relative reference; rebase and bisect use it temporarily.
- Reading and testing old code while detached is safe.
- Commits made while detached belong to no branch; create one with `git switch -c` before leaving.
- Left commits behind? Use the hash from Git's warning or the reflog with `git branch <name> <hash>`.

### Key terms
```terms
Detached HEAD :: A state where HEAD points directly at a commit, not at a branch.
Attached HEAD :: The normal state, where HEAD names a branch.
Orphaned commits :: Commits not reachable from any branch or tag, such as those left after leaving detached HEAD.
```

### Key commands
```commands
git switch --detach <commit> :: Deliberately detach HEAD at a commit.
git switch - :: Return to the previous branch.
git switch -c <branch> :: Create a branch at the current (detached) commit.
git branch <name> <hash> :: Rescue commits after leaving detached HEAD.
cat .git/HEAD :: See whether HEAD names a branch or a raw commit.
```

### Common mistakes
- Panicking at the warning and running destructive commands.
- Making several commits while detached and switching away without a branch.
- Checking out `origin/feature` instead of `feature` and committing there.

### Quick quiz
```quiz
? [predict] What does this mean?
| $ cat .git/HEAD
| 51c0e2a9f8d7b6a5c4e3d2f1a0b9c8d7e6f5a4b3
+ HEAD is detached at commit 51c0e2a
- HEAD points at a branch named 51c0e2a
- The repository is corrupted
- main has been deleted
> A raw hash in HEAD means detached; normally it reads "ref: refs/heads/<branch>".

? Which action does NOT detach HEAD?
- git checkout v2.0.0
- git checkout HEAD~2
- git checkout origin/main
+ git switch main
> Switching to a local branch keeps HEAD attached.

? [scenario] You made two commits while detached, then switched to main. Git printed a warning with a hash. How do you keep the commits?
+ git branch keep-this <hash from the warning>
- git revert <hash>
- Re-clone the repository
- They are gone forever
> The commits still exist; give them a branch.

? [tf] Running tests on an old tag in detached HEAD can damage your branches.
- True
+ False
> Read-only work while detached is completely safe.
```

### Practical exercise
````exercise Detach, commit, rescue
1. In a practice repository, `git switch --detach HEAD~2`.
2. Commit two small changes.
3. `git switch main` and read the warning.
4. Rescue the commits into `experiment/rescued` using the reflog, not the warning's hash.
---solution---
```bash
$ git switch --detach HEAD~2
$ echo x > x.txt && git add x.txt && git commit -m "Experiment 1"
$ echo y > y.txt && git add y.txt && git commit -m "Experiment 2"
$ git switch main                     # Warning: you are leaving 2 commits behind
$ git reflog -n 3                     # HEAD@{1}: commit: Experiment 2
$ git branch experiment/rescued HEAD@{1}
$ git log --oneline experiment/rescued -3
```
````

### What to learn next
The reflog has rescued you repeatedly. Next, a deeper look: branch reflogs, time expressions, expiry and garbage collection.
:::
