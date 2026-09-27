---
id: git-worktree
part: 15
title: Multiple Working Directories with git worktree
minutes: 16
level: Advanced
topics: 147 Git worktree
objectives:
- Explain what a worktree is and how it differs from a second clone
- Add, list, move and remove worktrees
- Use worktrees for hotfixes, reviews and long-running tasks without stashing
- Know the rules and limits: one branch per worktree, shared repository data
concepts: worktree | working directory | branch | stash | clone
commands: git worktree add | git worktree list | git worktree remove | git worktree prune
---
Stashing and switching work for short interruptions. But what if you need two branches at once: your feature's dev server running while you review a colleague's PR, or a hotfix build while a long test suite runs on your branch? **Worktrees** give one repository several working directories, each with its own branch checked out.

## What a worktree is

Normally a repository has one **working directory** (the folder with your files) attached to its `.git`. `git worktree add` creates **another** working directory elsewhere on disk, linked to the **same** repository:

```text
~/code/shop/             main worktree        → feature/coupons
~/code/shop-hotfix/      linked worktree      → hotfix/cart-total
~/code/shop-review/      linked worktree      → pr-342
             \______________ all share ~/code/shop/.git ______________/
```

Commits, branches, stashes and the object database are **shared**. Each worktree has its own checked-out branch, its own files, its own staging area and its own HEAD.

| | Second clone | Worktree |
|---|---|---|
| Disk usage | Full copy of history | Only the checked-out files |
| Branches and commits | Separate; must push/fetch to share | Shared instantly |
| Setup | Clone, configure, fetch | One command |
| Same branch in two places | Possible (risky) | Not allowed (by design) |

## Adding a worktree

```cmd
git worktree add ../shop-hotfix -b hotfix/cart-total origin/main
worktree add :: Create a new linked working directory.
../shop-hotfix :: Where to put it. A sibling folder of your project is typical.
-b hotfix/cart-total :: Create this new branch for it (like switch -c).
origin/main :: The starting point for the new branch.
```

```bash
$ git worktree add ../shop-hotfix -b hotfix/cart-total origin/main
Preparing worktree (new branch 'hotfix/cart-total')
HEAD is now at 8d1c4e2 Load notes store at startup
$ cd ../shop-hotfix
$ git status
On branch hotfix/cart-total
```

Other forms:

```bash
$ git worktree add ../shop-review pr-342          # check out an existing branch
$ git worktree add --detach ../shop-v2.3 v2.3.0   # detached at a tag, for inspection
```

Work normally inside it: edit, commit, push. The commits are immediately visible from your main worktree too (`git log hotfix/cart-total`).

## Listing, removing, cleaning up

```bash
$ git worktree list
/Users/priya/code/shop          8d1c4e2 [feature/coupons]
/Users/priya/code/shop-hotfix   3c9e1a0 [hotfix/cart-total]

$ git worktree remove ../shop-hotfix        # refuses if it has uncommitted changes (add --force to override)
$ git worktree prune                        # clean up records of worktrees whose folders you deleted manually
$ git worktree move ../shop-hotfix ../hotfix
```

Removing a worktree doesn't delete its branch; delete that separately with `git branch -d` when it's merged.

## One branch, one worktree

Git won't check out the same branch in two worktrees, because committing in one would move the branch under the other's feet:

```bash
$ git switch hotfix/cart-total
fatal: 'hotfix/cart-total' is already used by worktree at '/Users/priya/code/shop-hotfix'
```

You've seen a cousin of this error when deleting the branch you're on (Chapter 26). If you need the same code twice, use `--detach` or a new branch.

## Good uses

- **Urgent hotfix** without disturbing your feature's working state, running processes or build cache.
- **Reviewing a PR** by running it next to your own branch (`gh pr checkout` inside a review worktree).
- **Long test runs or builds** on one branch while you keep coding on another.
- **Comparing behaviour** of two versions side by side.
- **AI or automated agents** working on separate branches in parallel without interfering with your checkout.

## Things to remember

- Each worktree needs its own **dependencies installed** (`node_modules`, virtualenvs, build outputs) because those are untracked files in each folder.
- Configuration and hooks are shared (they live in the common `.git`).
- Don't nest worktrees inside your main project folder; siblings keep tools and ignore rules simple.
- Worktrees are local conveniences; nothing about them is pushed.

:::recap
### What you learned
- A worktree is an extra working directory for the same repository, with its own branch, files and index but shared history.
- `git worktree add <path> [-b new-branch] [start]` creates one; `list`, `remove`, `move` and `prune` manage them.
- A branch can be checked out in only one worktree at a time.
- Worktrees suit hotfixes, reviews, long builds and side-by-side comparisons without stashing.
- Each worktree needs its own dependencies; removing a worktree doesn't delete its branch.

### Key terms
```terms
Worktree :: A working directory attached to a repository; a repository can have several.
Main worktree :: The original working directory where .git lives.
Linked worktree :: An additional working directory created with git worktree add.
```

### Key commands
```commands
git worktree add <path> <branch> :: Check out an existing branch in a new folder.
git worktree add <path> -b <new> <start> :: Create a new branch in a new folder.
git worktree list :: Show all worktrees.
git worktree remove <path> :: Remove a worktree.
git worktree prune :: Forget worktrees whose folders are gone.
```

### Common mistakes
- Trying to check out a branch that's already used by another worktree.
- Forgetting to install dependencies in a new worktree.
- Deleting a worktree folder by hand and leaving stale records (run `git worktree prune`).

### Quick quiz
```quiz
? What do linked worktrees share with the main worktree?
+ Commits, branches, stashes and configuration
- Only the working files
- Nothing; they're independent clones
- The same checked-out branch
> They share the repository; each has its own files, index and HEAD.

? [predict] What does this error mean?
| fatal: 'feature/x' is already used by worktree at '/code/shop-review'
+ Another worktree has feature/x checked out, so it can't be checked out here too
- feature/x was deleted
- The worktree folder is missing
- You have uncommitted changes
> Each branch can be checked out in only one worktree.

? [scenario] You need a hotfix on main while your feature branch has a running dev server and half-done edits. Best option?
+ git worktree add ../shop-hotfix -b hotfix/x origin/main
- git stash and stop the server
- Clone the repository again
- Commit the half-done edits to main
> A worktree leaves your current folder completely untouched.

? [tf] Removing a worktree with git worktree remove also deletes its branch.
- True
+ False
> The branch remains; delete it separately when merged.
```

### Practical exercise
````exercise Two branches at once
In a practice repository:
1. Add a worktree `../practice-hotfix` on a new branch `hotfix/demo` from main.
2. Commit a change there.
3. From your main worktree, see the new commit with `git log --oneline hotfix/demo -1`.
4. Try `git switch hotfix/demo` in the main worktree and read the error.
5. Remove the worktree and delete the branch.
---solution---
```bash
$ git worktree add ../practice-hotfix -b hotfix/demo main
$ cd ../practice-hotfix && echo fix > fix.txt && git add . && git commit -m "Hotfix demo"
$ cd - && git log --oneline hotfix/demo -1
$ git switch hotfix/demo        # fatal: 'hotfix/demo' is already used by worktree at ...
$ git worktree remove ../practice-hotfix
$ git branch -D hotfix/demo
```
````

### What to learn next
Next: submodules, for including one Git repository inside another.
:::
