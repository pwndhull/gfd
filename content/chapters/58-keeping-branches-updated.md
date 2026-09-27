---
id: keeping-branches-updated
part: 14
title: Keeping Branches Updated and Long-Running Branches
minutes: 22
level: Professional
topics: 136 Keeping branches updated | 139 Handling long-running branches
objectives:
- Decide between merging and rebasing main into your branch, using team context
- Update a branch safely whether or not it has been pushed or shared
- Recognise the costs of long-running branches and reduce them
- Keep a long-running integration or release branch in sync with main
concepts: merge | rebase | long-running branch | feature flag | rerere | force push
commands: git fetch | git merge origin/main | git rebase origin/main | git push --force-with-lease | git log --left-right
---
The longer your branch lives without taking in `main`, the more it diverges, and the bigger the eventual conflict. The cure is simple and cheap: **integrate from main early and often**. This chapter covers how, and what to do when a branch must live for weeks or months.

## How far behind am I?

```bash
$ git fetch
$ git rev-list --left-right --count origin/main...HEAD
14	3
```

Behind by 14, ahead by 3 (left side = `origin/main`, right side = your branch). `rev-list` is the plumbing behind `git log`; `--count` prints totals instead of listing commits. Or look at which files the incoming commits touch:

```bash
$ git diff --stat HEAD...origin/main
```

If they touch the files you're changing, update sooner rather than later.

## Two ways to update

**Merge main into your branch:**

```bash
$ git fetch
$ git merge origin/main
$ git push
```

- Pro: Safe for shared branches; no history rewritten; normal push.
- Pro: One conflict resolution, in one merge commit.
- Con: Adds "Merge branch 'main' into feature/x" commits; noisy if repeated often.

**Rebase your branch onto main:**

```bash
$ git fetch
$ git rebase origin/main
$ git push --force-with-lease        # if the branch was already pushed
```

- Pro: Linear history; your commits sit neatly on top of current main.
- Pro: Your PR shows a clean diff and clean commit list.
- Con: Rewrites your commits: only acceptable if nobody else builds on your branch (Chapter 37).
- Con: Conflicts may need resolving at several commits.

### Which one?

| Situation | Prefer |
|---|---|
| Your own branch, not shared | Rebase (clean PR), unless your team says merge |
| Shared branch several people push to | Merge |
| Team uses squash merges into main | Either; history on the branch disappears at merge anyway, so merge is simplest |
| Team uses rebase-and-merge or wants linear history | Rebase |
| PR under active review and reviewers are mid-review | Merge (or rebase and tell reviewers) |

GitHub's **Update branch** button on a PR offers the same two choices.

:::tip Update before you open a PR and before merging
At minimum, bring main in when you start review, and again just before merging (if the branch is out of date). Protection rules may require it anyway (Chapter 53).
:::

## Long-running branches

Some branches must live long: a big migration, a redesign, a customer-specific fork, or GitFlow's `develop` and release branches. Each week they live, their merge gets harder, reviews get larger and bugs hide in the gap.

### First, try to avoid them

| Instead of a long-running feature branch… | …try |
|---|---|
| A redesign on one branch for two months | Feature flag, merged to main in small pieces |
| A framework upgrade that breaks everything at once | Adapter layers so old and new coexist; migrate module by module |
| A rename across 500 files | Automated codemod in one small, mechanical PR, merged quickly |
| An experiment | A time-boxed spike branch, then a fresh branch for the real implementation |

### If you must have one

1. **Integrate from main frequently**: daily or at least weekly. Small, regular merges beat one enormous one.
2. **Merge, don't rebase**, if several people work on it: rebasing a shared long-lived branch rewrites everyone's history.
3. **Enable rerere** (`git config --global rerere.enabled true`) so recurring conflicts resolve themselves.
4. **Run CI on the branch** so breakage from main's changes is caught immediately.
5. **Land pieces early.** Anything that doesn't depend on the unfinished part (refactors, new utilities, tests) goes to main in its own PR, shrinking the branch.
6. **Keep an owner.** Someone is responsible for keeping it green and current.

### An integration branch for a team

For a multi-person effort, a common shape is a team integration branch with its own short-lived feature branches:

```graph Long-running integration branch
o---o---o---o---o---o---o   main
     \       \       \
      o---o---M---o---M---o   project/checkout-v2
       \     /     \ /
        o---o       o        short feature branches → PRs into project/checkout-v2
```

The `M` commits are regular merges of main into the project branch. When the project finishes, a final PR merges `project/checkout-v2` into main, usually small because main was merged in regularly.

### Release branches

Release branches (Chapter 49) also live for a while. Keep them stable: only fixes land there, and each fix also goes to main (fix on main and cherry-pick with `-x`, or fix on the release branch and merge the release branch into main). Never merge main into a release branch wholesale, since that brings unreleased features along.

## Try it

The playground has `main` and `feature/search`. Make commits on both, then try `git merge main` on the feature, reset, and try `git rebase main` instead. Compare the graphs.

```viz playground
```

:::recap
### What you learned
- Measure drift with `git rev-list --left-right --count origin/main...HEAD`.
- Update by merging `origin/main` (safe, adds merge commits) or rebasing onto it (clean, rewrites your commits).
- Rebase your own branches; merge into shared ones; follow your team's merge method.
- Avoid long-running branches with feature flags, adapters and small PRs; if unavoidable, integrate often, merge rather than rebase, enable rerere, run CI and land pieces early.
- Release branches take fixes only, never a wholesale merge of main.

### Key terms
```terms
Drift :: How far a branch has diverged from main.
Long-running branch :: A branch that lives for weeks or months.
Integration branch :: A shared branch collecting several feature branches before they reach main.
Update branch :: GitHub's button to merge or rebase the base branch into a PR.
```

### Key commands
```commands
git rev-list --left-right --count origin/main...HEAD :: Behind and ahead counts.
git merge origin/main :: Update a branch by merging main.
git rebase origin/main :: Update your own branch by rebasing.
git push --force-with-lease :: Publish a rebased branch you own.
git config --global rerere.enabled true :: Reuse conflict resolutions.
```

### Common mistakes
- Waiting until the day of merging to bring in main.
- Rebasing a shared long-running branch.
- Merging main into a release branch.
- Letting a spike branch quietly become the real implementation.

### Quick quiz
```quiz
? [predict] What do these numbers mean?
| $ git rev-list --left-right --count origin/main...HEAD
| 9	2
+ main has 9 commits you don't have; your branch has 2 main doesn't
- You have 9 commits to push
- 9 files changed, 2 conflicts
- main is 2 commits behind
> Left side is origin/main, right side is HEAD.

? [scenario] Three developers push to project/checkout-v2. It needs main's latest changes. Which approach?
+ Merge origin/main into it
- Rebase it onto main and force push
- Cherry-pick main's commits one by one
- Delete and recreate the branch
> Merging doesn't rewrite commits other people have.

? What's the best way to avoid a two-month redesign branch?
+ Merge small pieces into main behind a feature flag
- Rebase it every hour
- Squash it into one commit
- Make it the default branch
> Flags let incomplete work live safely on main.

? [tf] It's fine to merge main into a release branch to pick up the latest fixes.
- True
+ False
> That brings unreleased features too. Cherry-pick or merge specific fixes instead.
```

### Practical exercise
```exercise Merge versus rebase on your branch
In a practice repository with a remote:
1. Create `feature/x` with two commits and push it.
2. Add three commits to main (simulate teammates) and push.
3. On `feature/x`, check drift with `--left-right --count`.
4. Update by merging; look at the graph. Reset back with `git reset --hard ORIG_HEAD`.
5. Update by rebasing; push with `--force-with-lease`; compare the graph.
---solution---
After the merge, `git log --oneline --graph` shows a merge commit joining main into feature/x. After resetting and rebasing, the graph is a straight line with your two commits (new hashes) on top of main's three. The rebase requires `git push --force-with-lease` because the remote still had the old commits; the merge needed only a normal push.
```

### What to learn next
Consistent commit messages make histories, changelogs and automation work. Next: commit conventions such as Conventional Commits.
:::
