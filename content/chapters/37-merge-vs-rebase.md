---
id: merge-vs-rebase
part: 8
title: Merge vs Rebase, and When Rebase Is Dangerous
minutes: 22
level: Intermediate
topics: 80 Merge vs rebase | 87 When rebase is useful | 88 When rebase is dangerous
objectives:
- Compare merge and rebase by result, history, safety and conflict handling
- Choose the right one for common situations on a team
- State the golden rule of rebasing and explain what breaks when it's ignored
- Recover teammates from an unwanted rewrite of a shared branch
concepts: merge | rebase | merge commit | linear history | force push | rewriting history
commands: git merge | git rebase | git push --force-with-lease | git pull --rebase
---
Teams argue about merge versus rebase more than almost any other Git topic. The good news: they're not rivals. Each has jobs it's best at, and one firm rule keeps rebase safe.

## The same starting point, two results

```snap Starting point
git commit -m "Initial commit"
git commit -m "Add homepage"
git switch -c feature/login
git commit -m "Add login form"
git commit -m "Validate password"
git switch main
git commit -m "Fix header spacing"
git switch feature/login
```

```snap git merge main (on feature/login)
git commit -m "Initial commit"
git commit -m "Add homepage"
git switch -c feature/login
git commit -m "Add login form"
git commit -m "Validate password"
git switch main
git commit -m "Fix header spacing"
git switch feature/login
git merge main
```

```snap git rebase main (on feature/login)
git commit -m "Initial commit"
git commit -m "Add homepage"
git switch -c feature/login
git commit -m "Add login form"
git commit -m "Validate password"
git switch main
git commit -m "Fix header spacing"
git switch feature/login
git rebase main
```

Both results contain exactly the same code. They differ in the **history** they record.

## Side by side

| | Merge | Rebase |
|---|---|---|
| What it does | Adds one merge commit joining the two histories | Replays your commits as new commits on the new base |
| Existing commits | Untouched; hashes unchanged | Replaced with new ones; hashes change |
| History shape | Branching and joining; shows what really happened | Straight line; reads as if work happened in sequence |
| Safe on shared branches? | **Yes** | **No**, unless everyone coordinates |
| Push afterwards | Normal push | Force push if the branch was already pushed |
| Conflicts | Resolved once, in the merge commit | Resolved per replayed commit (possibly several times) |
| Undo | `git reset --hard ORIG_HEAD` (local) or `git revert -m 1` (pushed) | `git reset --hard ORIG_HEAD` or the reflog |
| Records when work was integrated | Yes (the merge commit) | No |

Neither is "correct". Merge optimises for **truthful** history. Rebase optimises for **readable** history.

## When rebase is useful

**1. Updating your own feature branch from main.** Your branch is behind `main`. Rebasing replays your few commits on top, so your pull request diff is clean and there's no "Merge branch 'main' into feature/login" noise.

```bash
$ git fetch
$ git rebase origin/main
$ git push --force-with-lease          # only if you had already pushed this branch
```

**2. Pulling on a branch where you have local commits.** `git pull --rebase` avoids a pointless merge commit each time you sync with teammates on the same branch: your unpushed commits get replayed on top of theirs. Since those commits were never pushed, rewriting them is harmless.

**3. Cleaning up before review.** Interactive rebase (next chapter) turns "wip", "fix typo", "actually fix it" into a few meaningful commits.

**4. Before a fast-forward or "Rebase and merge" into main.** Teams that want a linear `main` rebase the branch first so it merges as a fast-forward.

## When rebase is dangerous

:::danger The golden rule
**Do not rebase commits that exist outside your repository and that other people may have based work on.**
:::

Here's what goes wrong if you ignore it. You and Sam both work on `feature/search`, which is pushed.

```graph Shared branch before
A---B---C---D   origin/feature/search (you and Sam both have C and D)
```

You rebase `feature/search` onto `main` and force-push. The server now has C′ and D′. Sam still has C and D, plus a new commit S on top of them:

```graph Sam's view after your force push
          C'--D'   origin/feature/search
         /
A---B---E
     \
      C---D---S    Sam's feature/search
```

When Sam runs `git pull`, Git merges his C–D–S line with your C′–D′ line. The branch now contains **both** C and C′, both D and D′: duplicate changes, confusing conflicts, and a history nobody can review. If Sam instead force-pushes his version, your C′ and D′ vanish from the server.

Rebase is dangerous when:

- the branch is **shared** (other people push to it or build on it),
- the branch is **main**, a release branch, or any long-lived integration branch,
- you've already **published** commits that others have pulled,
- you'd need `--force` to push the result and you're not certain nobody else pushed.

:::warning --force-with-lease reduces risk, it doesn't remove it
`--force-with-lease` refuses to overwrite commits you haven't fetched. But if you *have* fetched a teammate's commit and then rebased without including it, the lease is satisfied and their commit is dropped. The sandbox's force-push preset demonstrates exactly this. The real protection is the golden rule plus communication.
:::

```viz force-push
```

## Recovering a teammate from a rewritten shared branch

If someone force-pushed a rewritten shared branch, and you have **no local work to keep** on it:

```bash
$ git fetch
$ git switch feature/search
$ git reset --hard origin/feature/search
```

If you **do** have local commits (like Sam's S), replay only those onto the new version:

```bash
$ git fetch
$ git rebase --onto origin/feature/search <old-tip-you-had> feature/search
```

where `<old-tip-you-had>` is the commit you were based on before the rewrite (D in the example, findable in `git reflog` or as your previous `origin/feature/search@{1}`). Recent Git versions often handle this automatically with plain `git pull --rebase`, which detects commits that were already rebased upstream.

## A practical team policy

Many teams settle on something like this:

1. **Your own unpushed commits**: rebase freely (`git pull --rebase`, interactive rebase).
2. **Your own pushed feature branch that only you use**: rebase is fine; push with `--force-with-lease`; tell reviewers if the PR is under review.
3. **A feature branch shared with others**: merge `main` into it, or agree explicitly before rebasing.
4. **main and release branches**: never rebase; never force push; protect them on GitHub.
5. **Integrating into main**: whatever the team chose on GitHub (merge commit, squash, or rebase and merge).

:::recap
### What you learned
- Merge adds a merge commit and preserves existing commits; rebase replays commits and replaces them.
- Merge gives truthful history and is always safe; rebase gives linear, readable history but rewrites commits.
- Rebase is great for updating your own branches, `pull --rebase` on unpushed work, and cleanup before review.
- The golden rule: don't rebase commits others may have built on. Never rebase main or shared branches.
- `--force-with-lease` helps but is not a substitute for coordination.

### Key terms
```terms
Golden rule of rebasing :: Never rebase commits that others may have based work on.
Linear history :: A history without merge commits.
Force push :: Overwriting a remote branch with rewritten history.
Integration branch :: A long-lived shared branch such as main or develop.
```

### Key commands
```commands
git merge origin/main :: Update a branch from main without rewriting anything.
git rebase origin/main :: Update your own branch by replaying it onto main.
git pull --rebase :: Sync without merge commits by replaying unpushed commits.
git push --force-with-lease :: Publish a rebased branch that only you use.
git reset --hard origin/<branch> :: Discard local state and match a rewritten remote branch.
```

### Common mistakes
- Rebasing `main` or another shared branch.
- Force-pushing a rewritten branch someone else was working on without warning them.
- Merging `main` into a feature branch dozens of times, making review hard, when a rebase would be cleaner (or vice versa, rebasing a shared branch).

### Quick quiz
```quiz
? Which is always safe to do on a branch other people also push to?
+ Merge main into it
- Rebase it onto main and force push
- Amend its pushed commits
- Force push your local version
> Merging adds a commit without rewriting existing ones.

? [scenario] You rebased and force-pushed feature/search, which Sam also works on. Sam pulls. What likely happens?
+ Sam's branch ends up containing both the old and rewritten versions of the commits, with duplicate changes and conflicts
- Sam's branch updates cleanly
- Git refuses Sam's pull forever
- Sam's work is automatically rebased correctly every time
> The old and new commits are different to Git. Merging them duplicates history. This is why the golden rule exists.

? [tf] git pull --rebase on commits you haven't pushed yet breaks the golden rule.
- True
+ False
> Unpushed commits exist only in your repository, so nobody else depends on them.

? What does merge preserve that rebase does not?
+ The original commits and a record of when branches were integrated
- The code changes
- The commit messages
- The author names
> Rebase keeps messages, authors and changes, but creates new commits and removes the merge point.

? [troubleshoot] A teammate force-pushed a rewritten shared branch. You have no local changes on it. Simplest way to match the server?
+ git fetch then git reset --hard origin/<branch>
- git pull --no-rebase
- git merge origin/<branch> repeatedly
- Delete the repository
> With nothing local to keep, resetting to the new remote tip is clean and fast.
```

### Practical exercise
````exercise See both histories
In a practice repository, create the starting point from this chapter (feature branch with two commits, main with one new commit). Then:
1. Create `try-merge` and `try-rebase` branches at the feature tip.
2. On `try-merge`, `git merge main`. On `try-rebase`, `git rebase main`.
3. Compare `git log --oneline --graph try-merge` with `git log --oneline --graph try-rebase`, and `git diff try-merge try-rebase`.
---solution---
```bash
$ git branch try-merge feature && git branch try-rebase feature
$ git switch try-merge && git merge --no-edit main
$ git switch try-rebase && git rebase main
$ git log --oneline --graph try-merge     # a merge commit joining two lines
$ git log --oneline --graph try-rebase    # a straight line
$ git diff try-merge try-rebase           # empty: same code, different history
```
````

### What to learn next
Rebase has a second, even more useful mode: interactive rebase, for editing, squashing, reordering and rewording your commits before you share them.
:::
