---
id: recovery-wrong-place
part: 16
title: "Recovery: Deleted Branches and Wrong-Branch Commits"
minutes: 24
level: Professional
topics: Accidentally deleted a branch | Accidentally committed to main | Wrong branch
objectives:
- Diagnose any Git accident with four questions before touching anything
- Restore a deleted branch, locally or on GitHub
- Move commits made on main to a feature branch, before and after pushing
- Move commits from one feature branch to another
concepts: reflog | branch | cherry-pick | reset | revert | force push | protected branch
commands: git reflog | git branch <name> <hash> | git reset --hard | git cherry-pick | git switch -c | git push --force-with-lease
---
Part 16 is a field guide. Each scenario follows the same structure: **the situation**, **what actually happened** in Git's terms, **the safest recovery**, **dangerous alternatives** to avoid, and **prevention**. Everything uses tools from earlier chapters; the skill is choosing calmly.

## Before any recovery: four questions

Stop typing and answer these. They decide which tools are safe.

| Question | Why it matters |
|---|---|
| **1. Is anything uncommitted that I care about?** | `reset --hard`, `restore` and `clean` destroy it. Commit it to a temporary branch or `git stash -u` first. |
| **2. Was the affected work ever committed?** | If yes, the reflog can find it (Chapter 43). If never committed, recovery options are limited. |
| **3. Has it been pushed?** | Unpushed: rewrite freely. Pushed: prefer adding commits (revert) or coordinate a force push. |
| **4. Is the branch shared?** | Your own branch: `--force-with-lease` is fine. Shared or `main`: never rewrite without agreement. |

And one universal first step when something committed seems lost:

```bash
$ git branch rescue-$(date +%H%M) <hash-you-want-to-keep>
```

A branch makes any commit permanent and safe while you think.

---

## Scenario 1: Accidentally deleted a branch

:::scenario Situation
You tidied up branches and ran `git branch -D feature/search`. It wasn't merged. Two days of work.
:::

### What happened

`-D` deleted a **label** (a ref file, Chapter 71). The commits still exist in the object database, unreachable. The reflog and the deletion message both know where the branch pointed.

### Safest recovery

If the terminal still shows the deletion message:

```bash
Deleted branch feature/search (was 3c9e1a0).
$ git branch feature/search 3c9e1a0
```

If not, search the reflog for the last time you were on it:

```bash
$ git reflog | grep -i "search" | head
77a1b20 HEAD@{7}: checkout: moving from feature/search to main
3c9e1a0 HEAD@{8}: commit: Add search results page
$ git branch feature/search 3c9e1a0
$ git log --oneline feature/search -5       # verify
```

The `checkout: moving from feature/search to main` line is gold: the entry just before it is where the branch was when you left it.

**If it was pushed** and still on GitHub, it's even simpler: `git switch feature/search` recreates it from `origin/feature/search`.

**Deleted on GitHub by mistake?** A merged or closed PR's page has a **Restore branch** button. Otherwise, if anyone has it locally, push it back: `git push origin feature/search`.

### Dangerous alternatives

- Re-cloning to "get it back": a fresh clone doesn't have your unpushed commits or your reflog.
- Running `git gc --prune=now` "to clean up" first.

### Prevention

- Use `git branch -d` (lowercase): it refuses to delete unmerged work.
- Push branches you care about, even if unfinished.
- `git branch --merged` before bulk deletions (Chapter 26).

---

## Scenario 2: Accidentally committed to main

:::scenario Situation
You forgot to create a branch. Three commits of your new feature are on your local `main`.
:::

### What happened

Your local `main` moved ahead of `origin/main` with commits that should be on a feature branch.

```graph Now
A---B---C---X---Y---Z   main
        |
   origin/main
```

### Safest recovery (not pushed yet)

Create the feature branch **at your current position**, then move `main` back to where the server is:

```bash
$ git status                                 # clean? stash or commit anything first
$ git branch feature/coupons                 # label X, Y, Z with the right name
$ git reset --hard origin/main               # move main back; X, Y, Z are safe on the feature branch
$ git switch feature/coupons
```

```graph After
A---B---C   main, origin/main
         \
          X---Y---Z   feature/coupons
```

No cherry-picking needed: you just gave the commits a new label and moved the old label back. (Make sure `origin/main` is where you expect: if you haven't fetched recently, it's where main was at your last fetch, which is still the right place to return to.)

### If you already pushed to main

If `main` isn't protected and the push went through, the commits are now shared. **Don't** reset and force-push `main`. Instead:

- If the work is good and the team is fine with it landing: leave it, and open a follow-up PR for review.
- If it must come out: `git revert` the commits on `main` (Chapter 42), then put the work on a feature branch and open a PR. Remember that re-merging requires reverting the revert first.

Most teams protect `main`, in which case your push was rejected with GH006 and you're in the "not pushed" case.

### Dangerous alternatives

- `git reset --hard HEAD~3` **before** creating the branch: the commits become unreachable (recoverable via reflog, but why make it hard?).
- Force-pushing `main`.

### Prevention

- Create the branch first: `git switch -c feature/x` before editing.
- Protect `main` on GitHub (Chapter 53).
- Show the current branch in your shell prompt.

---

## Scenario 3: Committed to the wrong branch

:::scenario Situation
You meant to commit a fix on `fix/header` but you were still on `feature/search`. The last two commits on `feature/search` belong on `fix/header`.
:::

### What happened

```graph Now
      S1---S2---F1---F2   feature/search   (F1, F2 belong elsewhere)
     /
A---B---C   main, fix/header branched from C
```

### Safest recovery

Copy the two commits to the right branch, then remove them from the wrong one:

```bash
$ git switch fix/header
$ git cherry-pick feature/search~2..feature/search      # copies F1 and F2 (Chapter 46)
$ git switch feature/search
$ git reset --hard HEAD~2                               # only if feature/search wasn't pushed
```

If `fix/header` doesn't exist yet, it's even simpler: create it at the right base and cherry-pick onto it, or use `git rebase --onto`:

```bash
$ git branch fix/header feature/search                  # label the current tip
$ git rebase --onto main feature/search~2 fix/header    # move just F1, F2 onto main (Chapter 36)
$ git switch feature/search && git reset --hard HEAD~2
```

### If feature/search was already pushed

Leave its history alone: after cherry-picking F1 and F2 to `fix/header`, `git revert` them on `feature/search` (or, if the branch is yours alone, reset and `git push --force-with-lease`).

### Dangerous alternatives

- Resetting the wrong branch before copying the commits.
- Copying files by hand between branches, losing authorship and messages.

### Prevention

- `git status` (or your prompt) before every commit.
- Commit on a branch named for the task you're doing; switch before starting unrelated work.

:::recap
### What you learned
- Before any recovery: protect uncommitted work, check whether the work was committed, pushed and shared.
- A deleted branch is a deleted label: recreate it from the deletion message's hash, the reflog, the remote, or GitHub's Restore button.
- Commits on main by mistake: `git branch <feature>`, then `git reset --hard origin/main` (only if unpushed); if pushed, revert.
- Wrong feature branch: cherry-pick to the right branch (or `rebase --onto`), then reset or revert the wrong one.

### Key terms
```terms
Rescue branch :: A temporary branch created to keep commits safe during recovery.
Unreachable commit :: A commit no branch or tag points to; recoverable until garbage collection.
Protected branch :: A server branch that rejects direct pushes.
```

### Key commands
```commands
git branch <name> <hash> :: Recreate a branch or rescue commits.
git reflog | grep <text> :: Find where a branch or commit was.
git reset --hard origin/main :: Move local main back to the server's position.
git cherry-pick A..B :: Copy commits to another branch.
git rebase --onto <new> <old> <branch> :: Move a range of commits.
```

### Common mistakes
- Resetting before labelling the commits you want to keep.
- Re-cloning, which discards your reflog and unpushed work.
- Force-pushing main to "undo" a mistaken push.

### Quick quiz
```quiz
? [scenario] You committed three commits to local main by mistake and haven't pushed. What's the cleanest fix?
+ git branch feature/x, then git reset --hard origin/main, then git switch feature/x
- git revert the three commits on main
- Delete the repository and clone again
- git push --force origin main
> Label the commits first, then move main back. Nothing is copied or lost.

? [troubleshoot] You deleted feature/search with -D and the message is gone from your terminal. Where do you look?
+ git reflog, for the last commit or checkout involving feature/search
- GitHub Issues
- git stash list
- .git/refs/heads/feature/search
> The reflog records every HEAD movement, including leaving the branch.

? [tf] If a mistaken commit on main has already been pushed to a shared main, the safest undo is git revert.
+ True
- False
> Revert adds a commit instead of rewriting shared history.

? Which question should you answer FIRST before running any recovery command?
+ Is there uncommitted work I care about?
- Who made the mistake?
- Is the repository public?
- What Git version am I on?
> Several recovery commands destroy uncommitted work; protect it first.
```

### Practical exercise
````exercise Rehearse scenarios 1 and 2
In a practice repository:
1. Create `feature/demo` with two commits, switch to main, delete it with `-D`, and recover it from the reflog only.
2. On main, make two commits "by mistake" (without pushing), then move them to a new branch `feature/mistake` and put main back to `origin/main` (or to where it was, e.g. `HEAD~2`, if you have no remote).
---solution---
```bash
$ git switch -c feature/demo && echo 1 > d1 && git add . && git commit -m d1 && echo 2 > d2 && git add . && git commit -m d2
$ git switch main && git branch -D feature/demo
$ git reflog | grep "feature/demo" | head -3      # "checkout: moving from feature/demo to main"
$ git branch feature/demo HEAD@{1}                  # the entry before that checkout line; check with git log
$ echo m1 > m1 && git add . && git commit -m m1 && echo m2 > m2 && git add . && git commit -m m2
$ git branch feature/mistake
$ git reset --hard HEAD~2                            # or origin/main
$ git log --oneline --all --graph -8
```
````

### What to learn next
Next: bad commits: the wrong file, leaked secrets, and pushed commits that need undoing.
:::
