---
id: creating-and-switching-branches
part: 5
title: Creating and Switching Branches
minutes: 24
level: Beginner
topics: 48 Creating branches | 49 Switching branches | 50 git switch | 51 git checkout
objectives:
- Create a branch from the current commit or any other starting point
- Switch branches and predict what happens to your files
- Handle uncommitted changes when switching
- Use git switch and understand the older git checkout forms you will see everywhere
concepts: branch | HEAD | start point | detached HEAD | working directory
commands: git branch <name> | git switch <name> | git switch -c <name> | git switch - | git checkout <name> | git checkout -b <name>
---
This chapter covers the two commands you'll use most for branches: creating one, and moving between them. You'll also meet `git checkout`, the older all-purpose command that appears in most tutorials and Stack Overflow answers.

## Creating a branch without switching

```cmd
git branch feature/login
git :: The Git program.
branch :: List, create or delete branches.
feature/login :: The name of the new branch. It will point at the commit HEAD is on.
```

```graph Before
      main  <- HEAD
        |
A---B---C
```

```graph After git branch feature/login
      main  <- HEAD
        |
A---B---C
        |
  feature/login
```

Only a label was added. **HEAD did not move**: you are still on `main`. Beginners often run `git branch feature/login`, keep working, and commit to `main` by mistake. Check with `git status` or `git branch` (the `*` marks the current branch).

## Switching branches

```cmd
git switch feature/login
switch :: Move HEAD to another branch and update your working directory and staging area to match it.
feature/login :: The branch to switch to. It must already exist (or exist on a remote, see Chapter 18).
```

```bash
$ git switch feature/login
Switched to branch 'feature/login'
```

What Git does internally:

1. Checks that switching won't overwrite uncommitted changes (see below).
2. Updates your working directory and staging area to the snapshot of `feature/login`'s commit: files that differ are rewritten, files only on one side are added or removed.
3. Points HEAD at `feature/login` (`.git/HEAD` now reads `ref: refs/heads/feature/login`).

Files that are the same in both branches are left alone, so switching is fast even in big projects.

## Create and switch in one step

This is what you'll type most days:

```cmd
git switch -c feature/login
-c :: "Create": create the branch at the current commit, then switch to it.
feature/login :: The new branch's name.
```

```graph After git switch -c feature/login
        main
          |
A---B---C
          |
    feature/login  <- HEAD
```

### From a different starting point

Add a start point to create the branch somewhere other than where you are:

```bash
$ git switch -c hotfix/cart-total origin/main       # start from the server's latest main
$ git switch -c try-old-layout v2.3.0               # start from a tag
$ git switch -c investigate 8d1c4e2                 # start from a specific commit
```

:::tip Branch from fresh main
Before starting a task, update `main` so your branch begins from the latest work:

```bash
$ git switch main
$ git pull
$ git switch -c feature/password-reset
```

Or, without touching local `main`: `git fetch` then `git switch -c feature/password-reset origin/main`.
:::

## Jumping back and forth

```bash
$ git switch -          # switch to the branch you were on before
```

`-` works like `cd -` in the shell. Great for bouncing between a feature and `main`.

## Switching with uncommitted changes

What happens to edits you haven't committed? Git has one priority: **never silently destroy your work**.

**Case 1: your edits don't clash with the other branch.** The file you changed is identical in both branches. Git switches and **carries your uncommitted edits along**. They're not "on" either branch; they're in your working directory.

```bash
$ git status -s
 M README.md
$ git switch feature/login
Switched to branch 'feature/login'
M	README.md
```

**Case 2: your edits clash.** The file you changed is different in the target branch, so switching would overwrite your edit. Git refuses and changes nothing:

```bash
$ git switch feature/login
error: Your local changes to the following files would be overwritten by checkout:
	src/cart.js
Please commit your changes or stash them before you switch branches.
Aborting
```

Your choices:

- **Commit** your work on the current branch (a "WIP" commit is fine; you can amend it later).
- **Stash** it: `git stash`, switch, and later `git stash pop` (Chapter 44).
- **Discard** it if you really don't want it: `git restore src/cart.js` (permanent).

:::warning Carried-along changes are easy to commit on the wrong branch
In Case 1, your edits followed you. If you now commit, they land on the new branch. That's sometimes handy (you started work before remembering to branch) and sometimes a mistake. Check `git status` after switching.
:::

## Branch naming

Git allows most characters, but teams converge on conventions (Chapter 77):

- lowercase, words separated by hyphens: `feature/password-reset`
- a type prefix: `feature/`, `fix/`, `chore/`, `docs/`, `hotfix/`
- often a ticket ID: `fix/SHOP-412-cart-rounding`

A slash creates a folder-like grouping. One gotcha: you can't have both a branch `feature` and a branch `feature/login`, because `feature` would have to be both a file and a folder inside `.git/refs/heads/`.

## git checkout: the older, overloaded command

Before Git 2.23, one command did several unrelated jobs. You'll see it everywhere, so learn to read it:

| Old form (`checkout`) | Modern form | What it does |
|---|---|---|
| `git checkout feature/login` | `git switch feature/login` | Switch branches |
| `git checkout -b feature/login` | `git switch -c feature/login` | Create and switch |
| `git checkout -b fix origin/main` | `git switch -c fix origin/main` | Create from a start point |
| `git checkout 8d1c4e2` | `git switch --detach 8d1c4e2` | Detached HEAD at a commit |
| `git checkout -- app.js` | `git restore app.js` | **Discard** unstaged changes to a file |
| `git checkout main -- app.js` | `git restore --source main app.js` | Get a file's version from another branch |

Note the difference in the last two rows: they don't move HEAD at all; they **overwrite files**. Mixing "switch branches" and "overwrite my files" in one command is exactly why `switch` and `restore` were introduced. A typo like `git checkout app.js` when you meant a branch named `app` can wipe your edits to `app.js` without asking.

:::tip Prefer switch and restore
Use `git switch` for branches and `git restore` for files. They're clearer and they refuse ambiguous requests. `checkout` still works and isn't going away; just read it carefully when you meet it.
:::

### switch refuses to detach by accident

```bash
$ git switch 8d1c4e2
fatal: a branch is expected, got commit '8d1c4e2'
hint: If you want to detach HEAD at the commit, try again with the --detach option.
```

`checkout` would have silently detached HEAD. `switch` asks you to say so explicitly (Chapter 61 covers detached HEAD).

## Try it

```viz branches
```

In the sandbox, try `git checkout -b experiment`, then `git switch main`, then `git switch experiment`, then `git switch A` to see the refusal, and `git switch --detach A` to see detached HEAD.

:::recap
### What you learned
- `git branch <name>` creates a branch without switching; `git switch -c <name>` creates and switches.
- Add a start point to branch from another commit, branch, tag or `origin/main`.
- Switching updates your files to the target branch's snapshot and moves HEAD.
- Uncommitted edits come along if they don't clash; otherwise Git refuses until you commit, stash or discard.
- `git checkout` is the older multi-purpose command: it switches branches *and* overwrites files. Prefer `switch` and `restore`.

### Key terms
```terms
Start point :: The commit a new branch will point at when created.
Switch :: Move HEAD to another branch and update your files to match.
Carried-over changes :: Uncommitted edits that stay in the working directory when you switch branches.
git checkout :: The older command that switches branches, detaches HEAD, and restores files.
```

### Key commands
```commands
git branch <name> :: Create a branch at HEAD without switching.
git switch <name> :: Switch to an existing branch.
git switch -c <name> [start] :: Create a branch and switch to it.
git switch - :: Switch back to the previous branch.
git checkout -b <name> :: Older form of switch -c.
git switch --detach <commit> :: Check out a commit without a branch.
```

### Common mistakes
- Creating a branch with `git branch` and committing to the old branch.
- Committing carried-over changes on the wrong branch.
- Using `git checkout <file>` and discarding edits by accident.
- Branching from a stale `main`.

### Quick quiz
```quiz
? [state] You're on main. You run git branch feature/a and then git commit -m "Work". Which branch has the new commit?
+ main
- feature/a
- Both
- Neither
> `git branch` creates the label but doesn't move HEAD, so the commit lands on main.

? What is the modern equivalent of git checkout -b fix?
- git branch -b fix
+ git switch -c fix
- git switch fix
- git restore -b fix
> `switch -c` creates and switches.

? [scenario] git switch main fails with "Your local changes to the following files would be overwritten". What state is your repository in?
+ Unchanged; you're still on your branch with your edits intact
- Half switched
- Your edits were discarded
- Git created a stash automatically
> Git refused before changing anything. Commit, stash or discard, then switch.

? [predict] What does this do?
| $ git checkout -- config.js
- Switches to a branch called config.js
+ Discards unstaged changes to config.js, replacing it with the staged version
- Stages config.js
- Creates a branch from config.js
> The `--` means "what follows are file paths". This is the old form of `git restore config.js`, and it can't be undone.

? [tf] git switch 8d1c4e2 detaches HEAD at that commit.
- True
+ False
> `switch` refuses and asks you to add --detach. `checkout` would detach silently.
```

### Practical exercise
````exercise Branch and bounce
In `notes-app` (or any practice repository):
1. Update and create `feature/search` from `main`.
2. Commit a new file `search.js`.
3. Switch back to `main` and confirm `search.js` is gone from your folder.
4. Use `git switch -` to return; confirm it's back.
5. Edit `README.md` without committing and switch to `main`. Does it come along? Why?
---solution---
```bash
$ git switch main && git switch -c feature/search
$ echo "// search" > search.js && git add search.js && git commit -m "Add search module"
$ git switch main && ls          # no search.js: main's snapshot doesn't include it
$ git switch - && ls             # back on feature/search: search.js present
$ echo "edit" >> README.md
$ git switch main                # works, and README.md stays modified
```
The README edit comes along because README.md is identical on both branches, so switching doesn't need to overwrite it.
````

### What to learn next
You can create and move between branches. Next: listing, renaming and deleting them, and configuring upstreams per branch.
:::
