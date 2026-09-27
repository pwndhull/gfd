---
id: feature-branch-workflow
part: 5
title: The Feature Branch Workflow
minutes: 22
level: Beginner
topics: 57 Feature branch workflow
objectives:
- Carry a task from an up-to-date main to a merged pull request using a feature branch
- Keep your branch current while main moves on
- Know what to do at each step when something goes wrong
- Explain why the workflow keeps main stable
concepts: feature branch | main | pull request | upstream | merge
commands: git switch -c | git push -u | git pull | git fetch | git merge | git branch -d
---
You now know enough to work the way most professional teams do. This chapter walks through one task end to end. Later parts deepen each step (merging in Part 7, rebasing in Part 8, pull requests in Part 13, team strategies in Part 14), but the shape never changes.

## The workflow in one picture

```graph Feature branch lifecycle
                 feature/password-reset
                  E---F---G
                 /         \
A---B---C---D---+-----------M   main
```

1. Branch from an up-to-date `main`.
2. Commit in small steps on your branch.
3. Push the branch and open a pull request.
4. Get review and passing checks; push fixes.
5. Merge into `main`.
6. Delete the branch.

`main` only ever receives finished, reviewed work. That's the whole point.

## Step 1: start from fresh main

```bash
$ git switch main
$ git pull
Already up to date.            # or a fast-forward
$ git switch -c feature/password-reset
Switched to a new branch 'feature/password-reset'
```

Starting from the latest `main` means your branch includes everyone's recent work, so there's less to reconcile later.

:::tip Name it after the task
`feature/password-reset` or `feature/SHOP-231-password-reset` tells reviewers, CI logs and your future self what the branch is for. Follow your team's convention (Chapter 77).
:::

## Step 2: work in small commits

```bash
# edit files...
$ git status
$ git add src/auth/reset-form.js
$ git commit -m "Add password reset form"

# edit more...
$ git add src/auth/reset-token.js src/auth/reset-token.test.js
$ git commit -m "Generate and verify reset tokens"
```

Each commit should do one thing and leave the code working (Chapter 29). On your own branch, you can also make quick "WIP" commits and tidy them later (Chapter 38).

## Step 3: push early

Push the branch soon, even before it's finished:

```bash
$ git push -u origin feature/password-reset
remote:
remote: Create a pull request for 'feature/password-reset' on GitHub by visiting:
remote:      https://github.com/acme/shop/pull/new/feature/password-reset
remote:
To github.com:acme/shop.git
 * [new branch]      feature/password-reset -> feature/password-reset
branch 'feature/password-reset' set up to track 'origin/feature/password-reset'.
```

Pushing early backs up your work, lets CI run, and lets teammates see what you're doing. Many teams open a **draft pull request** immediately to signal "in progress, feedback welcome".

## Step 4: stay up to date with main

While you work, teammates merge other branches into `main`. The longer your branch lives, the more it diverges. Bring `main`'s changes into your branch regularly, at least before asking for review:

```bash
$ git fetch
$ git merge origin/main        # combine main's new work into your branch
```

or, if your team prefers a linear history on feature branches:

```bash
$ git fetch
$ git rebase origin/main       # replay your commits on top of latest main (Part 8)
```

Either way, you resolve any conflicts **on your branch**, where they only affect you, rather than discovering them at merge time. Chapter 58 compares the two approaches.

## Step 5: open a pull request and iterate

On GitHub, open a pull request from `feature/password-reset` into `main`. Describe what changed and why, and how to test it (Chapter 51).

Reviewers comment; CI runs tests. To respond, just keep committing on the same branch and pushing:

```bash
$ git add src/auth/reset-form.js
$ git commit -m "Show error when token has expired"
$ git push
```

The pull request updates automatically. There's no need to open a new one.

## Step 6: merge and clean up

When approved and green, the pull request is merged, usually with the button on GitHub (your team chooses between merge commit, squash and rebase styles; Chapter 51). Then tidy up locally:

```bash
$ git switch main
$ git pull                                   # main now contains your work
$ git branch -d feature/password-reset       # delete the local label
$ git fetch --prune                          # drop origin/feature/password-reset
```

If GitHub squash-merged, `-d` may refuse (Chapter 26); after confirming the PR merged, use `-D`.

## When things go wrong

| Problem | What to do | Chapter |
|---|---|---|
| Forgot to branch; committed on `main` | Move the commits to a new branch | 72 |
| Push rejected | `git pull` (or fetch + rebase), then push | 22 |
| Conflicts when updating from main | Resolve on your branch, commit or continue rebase | 34, 39 |
| Need to switch to an urgent fix mid-task | Commit or stash, switch, come back later | 44 |
| Branch history is messy before review | Clean it up with interactive rebase | 38 |
| Wrong file committed | Amend, or restore and recommit | 30, 73 |

## Why this works

- **main is always releasable**, because only reviewed, tested work arrives.
- **Work is isolated**: a half-finished feature can't break anyone else.
- **Review has a natural unit**: the branch.
- **History tells a story**: each branch's commits (or its squashed commit) explain one change.

## Rehearse it

Run through the whole lifecycle in the sandbox. Create a branch, commit twice, switch back to main, simulate a teammate's commit on main, then merge your branch.

```viz playground
```

Suggested sequence: `git switch -c feature/reset`, two commits, `git switch main`, `git commit -m "Teammate work"`, `git merge feature/reset`, `git branch -d feature/reset`.

:::recap
### What you learned
- The feature branch workflow: fresh `main` → branch → small commits → push → pull request → update from main → merge → delete.
- Push early and keep committing to the same branch; the pull request updates itself.
- Integrate `main` into your branch regularly (merge or rebase) so conflicts surface early and on your branch.
- After merging, update `main`, delete the local branch and prune.

### Key terms
```terms
Feature branch :: A short-lived branch holding the work for one task.
Pull request :: A request on GitHub to merge one branch into another, with review and checks.
Draft pull request :: A pull request marked as work in progress.
```

### Key commands
```commands
git switch main && git pull :: Start from the latest main.
git switch -c feature/<name> :: Create the task branch.
git push -u origin feature/<name> :: Publish the branch.
git fetch && git merge origin/main :: Bring main's changes into your branch.
git branch -d feature/<name> :: Delete the local branch after merging.
```

### Common mistakes
- Starting a branch from an outdated `main`.
- Letting a feature branch live for weeks without updating from `main`.
- Opening a new pull request for every round of review fixes.
- Forgetting to delete merged branches.

### Quick quiz
```quiz
? Why start a feature branch from an up-to-date main?
- Git requires it
+ So the branch includes teammates' recent work and there's less to reconcile later
- To make the branch name unique
- So the pull request is created automatically
> An outdated start point means more divergence and more potential conflicts.

? [scenario] A reviewer asks for changes on your open pull request. What do you do?
+ Commit the changes on the same branch and push; the PR updates
- Close the PR and open a new one
- Commit directly to main
- Delete the branch and start again
> A pull request tracks the branch, so new pushes appear automatically.

? [tf] In the feature branch workflow, conflicts with main are best resolved on your feature branch before merging.
+ True
- False
> Updating your branch from main regularly surfaces conflicts early, on your branch, where only you are affected.

? [state] After your PR is merged on GitHub, you're still on feature/x locally. What cleanup sequence makes sense?
- git branch -d feature/x while still on it
+ git switch main, git pull, git branch -d feature/x, git fetch --prune
- git push --force
- git reset --hard origin/feature/x
> Switch away first, update main so it includes your merged work, then delete the label and prune.
```

### Practical exercise
````exercise Full lifecycle, locally
Using the bare "server" setup from Chapter 21 (or any repository you can push to):
1. Create `feature/greeting` from fresh `main`, make two commits, push with `-u`.
2. In your other clone (the "teammate"), commit to `main` and push.
3. Back on `feature/greeting`, fetch and merge `origin/main` into your branch.
4. Merge your branch into `main` locally, push `main`, delete the branch locally and on the remote.
---solution---
```bash
$ git switch main && git pull && git switch -c feature/greeting
$ echo "hi" > greet.txt && git add greet.txt && git commit -m "Add greeting"
$ echo "hello" >> greet.txt && git commit -am "Extend greeting"
$ git push -u origin feature/greeting
# teammate clone: commit on main and git push
$ git fetch && git merge origin/main
$ git switch main && git pull && git merge feature/greeting && git push
$ git branch -d feature/greeting && git push origin --delete feature/greeting
```
On a real team, step 4 happens through a pull request on GitHub instead of a local merge.
````

### What to learn next
You've been making commits for five parts. Part 6 looks closely at them: what's inside a commit, how to write messages people want to read, and how to fix the last one.
:::
