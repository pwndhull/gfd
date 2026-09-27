---
title: The Full Team Workflow
lede: "One continuous exercise that strings together everything in this book: clone, branch, commit, push, open a pull request, handle review feedback, merge, resolve a real conflict, recover from a mistake, and tag a release. Do it for real, in a scratch repository."
steps:
- Clone the team repository
- Create a feature branch
- Modify the project's files
- Commit your changes
- Push the branch and open a pull request
- Resolve review feedback
- Merge the pull request
- Resolve a merge conflict
- Recover from an intentional mistake
- Tag a release
- Clean up and confirm the final state
---
Every chapter so far has taught one piece of Git in isolation. This project puts the pieces back together. You will play the part of Priya, a developer on a small team that maintains `acme/shop`, working alongside a teammate, Sam. Over eleven steps you will do, for real, everything a professional does in a normal week: branch, commit, open a pull request, get feedback, merge, hit a conflict, make (and recover from) a real mistake, and cut a release.

:::tip How to use this project
Do this with a **real, disposable repository**, not the simulator. The simulator (Playground) is great for exploring "what would happen if," but this project is about building the muscle memory for the real commands, real output and real GitHub screens you'll use every day. Budget 45–60 minutes. Each step names the chapter it builds on, so you can look anything up.

If you don't have write access to a real shared GitHub repository to practice on, create a private one of your own (`gh repo create acme-shop-practice --private --clone`) and play both parts, Priya and Sam, yourself using a second local clone or a second branch. The instructions below assume you have push access to some repository; adapt the URL and branch names to it.
:::

## Setup: get a repository to work in

You need any Git repository you can push to. The simplest option:

```bash
$ gh repo create acme-shop-practice --private --clone --add-readme
✓ Created repository priyasharma/acme-shop-practice on GitHub
  https://github.com/priyasharma/acme-shop-practice
Cloning into 'acme-shop-practice'...
$ cd acme-shop-practice
$ echo "console.log('Shop is up');" > app.js
$ git add app.js
$ git commit -m "Add starting app.js"
$ git push
```

You now have a small repository with a `main` branch containing a `README.md` and `app.js`. That is your `acme/shop` for the rest of this project. The step numbers below match the project checklist above.

## Step 1: Clone the team repository

If you already have the repository from setup, this step is done — that *was* the clone. If you're joining a project that already exists elsewhere, this is where you'd start:

```bash
$ git clone https://github.com/priyasharma/acme-shop-practice.git
Cloning into 'acme-shop-practice'...
remote: Enumerating objects: 6, done.
remote: Total 6 (delta 0), reused 0 (delta 0), pack-reused 0
Receiving objects: 100% (6/6), done.
$ cd acme-shop-practice
```

Cloning does three things in one command (Chapter 18): it downloads the full history, creates a `main` branch tracking `origin/main`, and checks out a working copy of the latest snapshot.

```snap After cloning
git commit -m "Add starting app.js"
```

## Step 2: Create a feature branch

You've been asked to add a discount calculation to the shop. Never commit directly to `main` on a real team (Chapter 24, Chapter 27) — start a feature branch:

```bash
$ git switch -c feature/discount-calc
Switched to a new branch 'feature/discount-calc'
```

`git switch -c` creates the branch pointing at your current commit and moves you onto it in one step. `main` hasn't moved; you're the only one who has moved.

```snap Right after branching
git commit -m "Add starting app.js"
git switch -c feature/discount-calc
```

## Step 3: Modify the project's files

Write the feature. Keep it small and real so the rest of the project has something genuine to review, conflict with, and revert:

```bash
$ cat >> app.js <<'EOF'

function applyDiscount(price, percentOff) {
  return price - (price * percentOff) / 100;
}
EOF
$ git status -sb
## feature/discount-calc
 M app.js
```

## Step 4: Commit your changes

```bash
$ git add app.js
$ git diff --staged
diff --git a/app.js b/app.js
index 3b4d2a1..9e21a0c 100644
--- a/app.js
+++ b/app.js
@@ -1 +1,5 @@
 console.log('Shop is up');
+
+function applyDiscount(price, percentOff) {
+  return price - (price * percentOff) / 100;
+}
$ git commit -m "Add applyDiscount helper"
[feature/discount-calc 4a7c1e9] Add applyDiscount helper
 1 file changed, 4 insertions(+)
```

One commit for one idea (Chapter 28, Chapter 29): the discount function, nothing else mixed in.

```snap After committing the feature
git commit -m "Add starting app.js"
git switch -c feature/discount-calc
git commit -m "Add applyDiscount helper"
```

## Step 5: Push the branch and open a pull request

```bash
$ git push -u origin feature/discount-calc
Enumerating objects: 5, done.
...
To github.com:priyasharma/acme-shop-practice.git
 * [new branch]      feature/discount-calc -> feature/discount-calc
branch 'feature/discount-calc' set up to track 'origin/feature/discount-calc'.
```

`-u` (`--set-upstream`) links your local branch to the new remote one, so a plain `git push` and `git pull` will know where to go from now on (Chapter 22).

```bash
$ gh pr create --fill
Creating pull request for feature/discount-calc into main in priyasharma/acme-shop-practice

https://github.com/priyasharma/acme-shop-practice/pull/1
```

`--fill` uses your commit's message and body as the PR title and description; for real work, write a fuller description by hand — what changed, why, and how to test it (Chapter 51, Chapter 78).

## Step 6: Resolve review feedback

Sam reviews the PR and leaves a comment: *"Discounts over 100% would make the price negative — worth guarding against?"* You address it with a new commit rather than rewriting history mid-review, so Sam's review stays anchored to what they already saw (Chapter 52):

```bash
$ cat > app.js <<'EOF'
console.log('Shop is up');

function applyDiscount(price, percentOff) {
  const pct = Math.min(Math.max(percentOff, 0), 100);
  return price - (price * pct) / 100;
}
EOF
$ git add app.js
$ git diff --staged
diff --git a/app.js b/app.js
index d50c1da..13fb3a5 100644
--- a/app.js
+++ b/app.js
@@ -1,5 +1,6 @@
 console.log('Shop is up');

 function applyDiscount(price, percentOff) {
-  return price - (price * percentOff) / 100;
+  const pct = Math.min(Math.max(percentOff, 0), 100);
+  return price - (price * pct) / 100;
 }
$ git commit -m "Clamp discount percentage to 0-100"
[feature/discount-calc 8f0c22d] Clamp discount percentage to 0-100
 1 file changed, 2 insertions(+), 1 deletion(-)
$ git push
```

Reply to Sam's comment in the PR ("Done in 8f0c22d") and re-request review. The PR now shows two commits; that's normal and honest — it shows the review working.

:::note If you'd been asked to squash first
Some teams prefer you clean up commits before merging rather than after. That's `git rebase -i` (Chapter 39), not something this project needs, since you're about to merge with a merge commit anyway.
:::

## Step 7: Merge the pull request

With an approval, merge on GitHub (or with `gh pr merge`) using whichever method your team has standardized on (Chapter 51):

```bash
$ gh pr merge 1 --merge --delete-branch
✓ Merged pull request #1 (Add applyDiscount helper)
✓ Deleted branch feature/discount-calc and switched to branch main
```

```bash
$ git switch main
$ git pull
Updating 4a1e9f0..b2c9a11
Fast-forward
 app.js | 5 +++++
 1 file changed, 5 insertions(+)
```

```snap After the merge
git commit -m "Add starting app.js"
git switch -c feature/discount-calc
git commit -m "Add applyDiscount helper"
git commit -m "Clamp discount percentage to 0-100"
git switch main
git merge feature/discount-calc
```

## Step 8: Resolve a merge conflict

Real teams hit conflicts constantly; this project makes sure you've actually resolved one rather than only reading about it. Simulate Sam editing the same line you're about to touch, on `main`, while you were working on your own branch:

```bash
$ git switch main
$ cat > app.js <<'EOF'
console.log('Shop is up and running');

function applyDiscount(price, percentOff) {
  const pct = Math.min(Math.max(percentOff, 0), 100);
  return price - (price * pct) / 100;
}
EOF
$ git add app.js
$ git commit -m "Tweak startup message"
[main c1d0a92] Tweak startup message
```

(In real life this would be Sam's commit, pushed while you were on your branch. Here you're playing both parts, so just commit it to `main`.) Now create your own branch from **before** that commit and edit the same line differently:

```bash
$ git switch -c feature/startup-log c1d0a92~1
$ cat > app.js <<'EOF'
console.log('Shop is up: v2');

function applyDiscount(price, percentOff) {
  const pct = Math.min(Math.max(percentOff, 0), 100);
  return price - (price * pct) / 100;
}
EOF
$ git add app.js
$ git commit -m "Update startup log line"
[feature/startup-log e5a301f] Update startup log line
$ git switch main
$ git merge feature/startup-log
Auto-merging app.js
CONFLICT (content): Merge conflict in app.js
Automatic merge failed; fix conflicts and then commit the result.
```

Open `app.js`. Git has marked the disagreement:

```diff
<<<<<<< HEAD
console.log('Shop is up and running');
=======
console.log('Shop is up: v2');
>>>>>>> feature/startup-log
```

You decide the real fix keeps both intents:

```bash
$ cat > app.js <<'EOF'
console.log('Shop is up and running (v2)');

function applyDiscount(price, percentOff) {
  const pct = Math.min(Math.max(percentOff, 0), 100);
  return price - (price * pct) / 100;
}
EOF
$ git diff --check
$ git add app.js
$ git commit -m "Merge feature/startup-log, keep both startup message updates"
[main 7b9c4e2] Merge feature/startup-log, keep both startup message updates
```

`git diff --check` before committing catches any conflict markers you might have missed (Chapter 34, Chapter 35). The resulting history has a real merge commit with two parents:

```snap After resolving the conflict
git commit -m "Add starting app.js"
git commit -m "Tweak startup message"
git switch -c feature/startup-log HEAD~1
git commit -m "Update startup log line"
git switch main
git merge feature/startup-log
```

```quiz
? [scenario] You're mid-conflict and `git status` still lists a file under "Unmerged paths" after you edited it. What did you forget?
+ `git add` the file once you've resolved it — Git doesn't know it's resolved until it's staged
- Nothing; the conflict resolves itself on commit
- You must `git merge --abort` and start over
- You need to delete and recreate the file
> Resolving a conflict means editing the file *and* staging it. `git add` is what tells Git you've made your choice.
```

## Step 9: Recover from an intentional mistake

Now break something on purpose, the way real mistakes happen, and recover from it. Amend the merge commit you just made with the wrong message, then push it as if you'd already shared it — and realize you shouldn't have rewritten a commit others may have fetched:

```bash
$ git commit --amend -m "fix stuff"
[main a3f81d0] fix stuff
$ git log --oneline -3
a3f81d0 (HEAD -> main) fix stuff
e5a301f Update startup log line
c1d0a92 Tweak startup message
```

The amended commit still has two parents (amending only changes the message, not the parents), so a plain `git log` interleaves both branches it merged, ordered by commit date rather than by a single straight line.

You've just replaced a well-described merge commit with a useless one, and (in this drill) already pushed it — a classic "oops" (Chapter 74). The safety net is `git reflog`, which remembers where `HEAD` has been regardless of branches or messages (Chapter 62):

```bash
$ git reflog -5
a3f81d0 (HEAD -> main) HEAD@{0}: commit (amend): fix stuff
7b9c4e2 HEAD@{1}: commit (merge): Merge feature/startup-log, keep both startup message updates
c1d0a92 HEAD@{2}: checkout: moving from feature/startup-log to main
e5a301f HEAD@{3}: commit: Update startup log line
b2c9a11 HEAD@{4}: checkout: moving from main to feature/startup-log
```

`HEAD@{1}` is your good commit, still sitting there with its original hash and message even though no branch points at it anymore. Recover it safely:

```bash
$ git reset --hard HEAD@{1}
HEAD is now at 7b9c4e2 Merge feature/startup-log, keep both startup message updates
```

:::danger Only reset --hard on commits you have not shared, or that you are deliberately rewriting with the team's agreement
Here you're the only one who has this branch (this is a solo practice repository), so `reset --hard` on your own recent history is safe. On a real shared `main` that a teammate might already have pulled, you would instead `git revert` the bad amend, or push the corrected commit with `git push --force-with-lease` **only** after confirming with the team, per Chapter 74's decision tree.
:::

```bash
$ git push --force-with-lease
```

`--force-with-lease` refuses to overwrite the remote if it has changed since you last fetched it, which is exactly the guardrail you want after a mistake like this (Chapter 43, Chapter 74).

```quiz
? [predict] After `git reset --hard HEAD@{1}`, what happened to the "fix stuff" commit?
+ It still exists as a dangling commit until Git's garbage collector eventually removes it, but no branch points at it
- It was permanently and immediately deleted
- It was converted into a new branch automatically
- It was pushed to a hidden remote backup
> `reset --hard` moves the branch pointer; it doesn't erase objects. The old commit is unreachable but recoverable (via reflog) until garbage collection.
```

## Step 10: Tag a release

The feature is merged and the mistake is cleaned up. Ship it:

```bash
$ git switch main
$ git pull
$ git tag -a v1.1.0 -m "Add discount calculation"
$ git push --follow-tags
```

An annotated tag (`-a`) records who tagged it, when, and why — worth the extra flag over a lightweight tag for anything you'd call a release (Chapter 48). `--follow-tags` pushes the commits *and* any annotated tags reachable from them in one step, so you don't forget the second push.

```bash
$ git show v1.1.0
tag v1.1.0
Tagger: Priya Sharma <priya@acme.dev>
Date:   ...

Add discount calculation
commit 7b9c4e2...
Merge: c1d0a92 e5a301f
Author: Priya Sharma <priya@acme.dev>
Date:   ...

    Merge feature/startup-log, keep both startup message updates
...
```

The `Merge:` line names both parents — the proof, right there in `git show`, that this is a real merge commit rather than a fast-forward.

```snap The tagged release
git commit -m "Add starting app.js"
git commit -m "Tweak startup message"
git switch -c feature/startup-log HEAD~1
git commit -m "Update startup log line"
git switch main
git merge feature/startup-log
git tag -a v1.1.0 -m "Add discount calculation"
```

## Step 11: Clean up and confirm the final state

```bash
$ git branch --merged main
  feature/startup-log
* main
$ git branch -d feature/startup-log
Deleted branch feature/startup-log (was e5a301f).
$ git log --oneline --graph --all
* 7b9c4e2 (HEAD -> main, tag: v1.1.0, origin/main) Merge feature/startup-log, keep both startup message updates
|\
| * e5a301f Update startup log line
* | c1d0a92 Tweak startup message
|/
*   b2c9a11 Merge pull request #1 from feature/discount-calc
|\
| * 8f0c22d Clamp discount percentage to 0-100
| * 4a7c1e9 Add applyDiscount helper
|/
* <initial commit>
$ git status
On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean
```

A clean `git status`, a `main` that matches `origin/main`, a merged branch deleted, and a signed-off release tag: that's what "done" looks like on a healthy team.

:::recap
### What you learned
- The full lifecycle — clone, branch, edit, commit, push, PR, review, merge, conflict, recovery, tag — is not eleven separate skills. It's one rhythm, and every piece you've studied is one beat in it.
- Review feedback is answered with new commits during review, not history rewrites, so the reviewer's comments stay anchored to what they saw.
- A merge conflict is a disagreement Git can't resolve alone: edit the file to reflect the decision, stage it, then commit.
- `git reflog` is the safety net under history-rewriting mistakes: it remembers commits that no branch points at anymore, as long as they haven't been garbage-collected.
- An annotated tag plus `--follow-tags` is the smallest complete way to ship a release.

### Key terms
```terms
Fast-forward :: Moving a branch pointer forward with no new commit, because its target is already an ancestor.
Merge commit :: A commit with two or more parents, created when a fast-forward is not possible.
Conflict marker :: The <<<<<<<, ======= and >>>>>>> lines Git inserts to show both sides of an unresolved change.
Dangling commit :: A commit no branch, tag or other ref points to, kept alive only by the reflog until garbage collection.
Annotated tag :: A tag stored as its own Git object, with a tagger, date and message — the kind to use for releases.
```

### Key commands
```commands
gh pr create --fill :: Open a PR using the branch's commit message as the title and body.
gh pr merge --merge --delete-branch :: Merge a PR with a merge commit and delete the source branch.
git diff --check :: Scan staged changes for leftover conflict markers before committing.
git reflog :: List everywhere HEAD has pointed, including commits no branch reaches anymore.
git tag -a v1.1.0 -m "..." :: Create an annotated tag for a release.
git push --follow-tags :: Push commits and any annotated tags that point at them.
```

### Common mistakes
- Committing straight to `main` instead of branching, which turns every change into a race with the rest of the team.
- Rewriting commits mid-review instead of adding new ones, which hides what the reviewer already approved.
- Force-pushing without `--with-lease` after a mistake, overwriting a teammate's work you hadn't fetched yet.
- Using a lightweight tag for a release, losing the tagger, date and message an annotated tag would have recorded.

### Quick quiz
```quiz
? Why branch instead of committing straight to main?
+ It isolates your work so main stays deployable while you're mid-change
- It makes commits smaller automatically
- It is required by Git and cannot be disabled
- It prevents merge conflicts entirely
> Branching buys isolation, not conflict immunity — conflicts are resolved later, at merge time, on your terms.

? [tf] Once you `git add` a resolved conflicted file, the merge is automatically committed.
- True
+ False
> Staging the resolution is step one; you still run `git commit` to complete the merge.

? What does `--force-with-lease` protect against that plain `--force` does not?
+ Overwriting commits on the remote that you haven't seen yet
- Typing the wrong branch name
- Losing your own local commits
- Conflicts during a rebase
> `--force-with-lease` checks the remote hasn't moved since your last fetch before it overwrites anything.

? [scenario] Months after this project, you find a dangling commit is gone when you check the reflog. What most likely happened?
+ Git's garbage collector ran and removed commits nothing referenced
- Someone deleted it from GitHub
- Reflog entries never expire, so this can't happen
- The commit was merged into another branch
> Unreachable reflog entries expire after 30 days by default (`gc.reflogExpireUnreachable`), and garbage collection can then remove the objects behind them. Recover promptly if you need to.
```

### Practical exercise
```exercise Do it again, faster
Delete your practice repository (or create a fresh one) and repeat all eleven steps without looking at this chapter, timing yourself. Note anywhere you had to stop and think, or reach for `git status` or `git log` to reorient — those are the spots worth another look at the relevant chapter.
---solution---
There's no single "correct" solution here — the exercise is the repetition itself. A fluent run of this project should take a confident developer under 20 minutes; if a particular step (conflicts and recovery are the usual culprits) took much longer, revisit that chapter's diagrams and try the corresponding lab again before moving to the final assessment.
```

### What to learn next
You've now practiced everything the final assessment will ask about. Head there next, or explore the [Git sandbox](#playground) if any single step still feels shaky.
:::
