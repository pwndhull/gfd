---
id: git-clone
part: 4
title: Cloning an Existing Project
minutes: 20
level: Beginner
topics: 38 git clone | 39 Understanding cloned repositories
objectives:
- Clone a repository over HTTPS or SSH, into a folder of your choice
- Explain everything git clone sets up for you
- Find the branches that exist on the server after cloning
- Start work on a branch that exists only on the remote
- Use shallow and single-branch clones when a repository is huge
concepts: clone | origin | remote-tracking branch | upstream | default branch | shallow clone
commands: git clone | git branch -a | git switch <remote-branch> | git clone --depth
---
On your first day, someone will send you a repository URL and say "clone it". This chapter explains what that single command does, and how to find your way around the copy it creates.

## Cloning

```cmd
git clone git@github.com:acme/shop.git
git :: The Git program.
clone :: Create a new local repository that is a full copy of an existing one.
git@github.com:acme/shop.git :: The repository's URL (SSH form here). Copy it from the green Code button on GitHub.
```

```bash
$ cd ~/code
$ git clone git@github.com:acme/shop.git
Cloning into 'shop'...
remote: Enumerating objects: 4823, done.
remote: Counting objects: 100% (812/812), done.
remote: Compressing objects: 100% (390/390), done.
remote: Total 4823 (delta 488), reused 640 (delta 402), pack-reused 4011
Receiving objects: 100% (4823/4823), 3.21 MiB | 8.40 MiB/s, done.
Resolving deltas: 100% (2911/2911), done.
$ cd shop
```

The folder name comes from the URL (`shop`). To choose another name, add it at the end:

```bash
$ git clone git@github.com:acme/shop.git shop-frontend
```

Always `cd` into the new folder before running other Git commands; the repository is inside it, not where you ran `clone`.

## What clone sets up

One command does all of this:

1. **Creates the folder** and a `.git` repository inside it.
2. **Downloads every commit** on every branch, plus tags: the complete history.
3. **Adds a remote named `origin`** pointing at the URL you cloned from.
4. **Creates remote-tracking branches** for every branch on the server: `origin/main`, `origin/feature/checkout`, and so on.
5. **Creates one local branch**, the server's default branch (usually `main`), and sets it to **track** `origin/main`.
6. **Checks out** that branch into your working directory.

```bash
$ git remote -v
origin  git@github.com:acme/shop.git (fetch)
origin  git@github.com:acme/shop.git (push)

$ git status
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

"Up to date with 'origin/main'" confirms step 5: your local `main` tracks `origin/main`.

## Where are the other branches?

```bash
$ git branch
* main
```

Only one local branch. But the server had several, and clone downloaded them all as remote-tracking branches:

```bash
$ git branch -a
* main
  remotes/origin/HEAD -> origin/main
  remotes/origin/feature/checkout
  remotes/origin/main
  remotes/origin/release/2.4
```

```cmd
git branch -a
branch :: List, create or delete branches.
-a :: "All": include remote-tracking branches as well as local ones.
```

- `* main` is your local branch.
- `remotes/origin/...` entries are the remote-tracking branches: read-only records of the server's branches. `git branch -r` shows only these.
- `origin/HEAD -> origin/main` records the server's default branch.

### Working on a branch that exists on the server

To work on `feature/checkout`, just switch to it by name:

```bash
$ git switch feature/checkout
branch 'feature/checkout' set up to track 'origin/feature/checkout'.
Switched to a new branch 'feature/checkout'
```

There was no local `feature/checkout`, so Git noticed `origin/feature/checkout` exists, created a local branch at the same commit, set it to track the remote one, and switched to it. This convenience works when exactly one remote has a branch with that name. The explicit equivalent is `git switch -c feature/checkout --track origin/feature/checkout`.

:::mistake Checking out origin/feature/checkout directly
`git checkout origin/feature/checkout` does **not** create a local branch. It puts you in detached HEAD at that commit (Chapter 61). Any commits you make will not be on a branch. Use the branch name without `origin/`, as above.
:::

## Understanding what you cloned

You now have a full, independent repository. A few consequences:

- **You have the entire history.** `git log` works offline, back to the very first commit.
- **Nothing you do locally affects the server** until you push.
- **Your copy starts going stale immediately.** Teammates keep pushing; your `origin/*` branches only update when you fetch or pull.
- **Local settings are not cloned.** Hooks, local config and ignored files (like `.env` or `node_modules`) are not part of the history. Projects usually document setup steps in their README: install dependencies, copy `.env.example` to `.env`, and so on.

:::tip First thing after cloning
Read the README and CONTRIBUTING files, then run `git log --oneline -n 20` and `git branch -r`. In five minutes you'll know how the team names branches and writes commit messages.
:::

## Big repositories: shallow and partial clones

Some repositories have decades of history and gigabytes of data. Git has options to download less:

| Command | Downloads | Use when |
|---|---|---|
| `git clone --depth 1 <url>` | Only the latest commit's snapshot (a **shallow clone**) | CI pipelines, or a quick look; you don't need history |
| `git clone --branch release/2.4 <url>` | Everything, but checks out `release/2.4` instead of the default | You want to start on a specific branch |
| `git clone --single-branch --branch main <url>` | Only one branch's history | Huge repository, one branch needed |
| `git clone --filter=blob:none <url>` | All commits, but file contents only on demand (a **partial clone**) | Very large repositories where you still want full history |

Shallow clones have limits: `git log` stops early, and some operations like `git blame` on old lines won't work. `git fetch --unshallow` downloads the rest of the history later if you need it.

## Cloning with HTTPS

The steps are identical with an HTTPS URL. The first time you push (or clone a private repository), your credential manager asks you to sign in ([Chapter 9](#ch-ssh-https-authentication)).

```bash
$ git clone https://github.com/acme/shop.git
```

:::recap
### What you learned
- `git clone <url> [folder]` copies a whole repository with its history.
- Clone adds `origin`, creates remote-tracking branches for every server branch, and one local branch (the default) tracking `origin/main`.
- `git branch -a` shows local and remote-tracking branches.
- `git switch <name>` creates a local tracking branch from a same-named remote branch.
- Shallow (`--depth`), single-branch and partial (`--filter=blob:none`) clones download less.

### Key terms
```terms
Clone :: A full local copy of a remote repository, including all history.
Default branch :: The branch a server considers primary; clone checks it out.
Shallow clone :: A clone with limited history, created with --depth.
Partial clone :: A clone that downloads file contents lazily, created with --filter.
```

### Key commands
```commands
git clone <url> :: Clone into a folder named after the repository.
git clone <url> <folder> :: Clone into a folder of your choice.
git branch -a :: List local and remote-tracking branches.
git switch <branch> :: Create and switch to a local branch tracking the remote branch of the same name.
git clone --depth 1 <url> :: Shallow clone with only the latest commit.
```

### Common mistakes
- Running Git commands in the parent folder instead of `cd`-ing into the clone.
- Using `git checkout origin/branch` and ending up in detached HEAD.
- Expecting `.env`, `node_modules` or hooks to come with the clone.

### Quick quiz
```quiz
? [predict] Right after cloning, what does git branch (without -a) show?
+ Only the default branch, for example * main
- Every branch that exists on the server
- Nothing, because no branch is checked out
- origin/main
> Clone creates just one local branch. The others exist as remote-tracking branches; see them with `git branch -a`.

? [scenario] The server has feature/checkout. You cloned and want to work on it. What do you run?
+ git switch feature/checkout
- git checkout origin/feature/checkout
- git branch origin/feature/checkout
- git clone --branch feature/checkout again
> Switching by the plain name creates a local branch tracking origin/feature/checkout. Checking out origin/... detaches HEAD.

? Which of these is NOT created by git clone?
- A remote named origin
- Remote-tracking branches for the server's branches
+ The .env file from the original developer's machine
- A local branch for the default branch
> Only what is committed to the repository is cloned. Ignored files like .env never were.

? [tf] After cloning, git log shows the project's entire history even without a network connection.
+ True
- False
> A normal clone downloads the full history. (A shallow clone would not.)
```

### Practical exercise
```exercise Clone and explore
Clone a public repository you are curious about (for example `https://github.com/expressjs/express.git`), then:

1. `cd` into it and run `git status`.
2. List all branches with `git branch -a`.
3. Switch to any non-default remote branch by name and confirm it tracks the remote with `git status`.
4. Try `git clone --depth 1` of the same repository into another folder and compare `git log --oneline | wc -l` in both.
---solution---
`git status` reports the default branch up to date with origin. After `git switch <branch>`, status says "Your branch is up to date with 'origin/<branch>'". The full clone's log has many commits; the shallow clone's log has one line (`wc -l` counts lines of output).
```

### What to learn next
Clone created `origin` for you. Next, see how to inspect and manage remotes yourself.
:::
