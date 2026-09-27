---
id: git-remote
part: 4
title: Managing Remotes with git remote
minutes: 14
level: Beginner
topics: 40 git remote
objectives:
- List, add, rename and remove remotes
- Change a remote's URL
- Inspect a remote in detail with git remote show
- Set up origin and upstream for a forked repository
concepts: remote | origin | upstream (remote) | fork | remote-tracking branch
commands: git remote -v | git remote add | git remote rename | git remote remove | git remote set-url | git remote show
---
Chapter 6 explained what a remote is: a name plus a URL. `git remote` is how you manage those names. Most developers only need it occasionally, but when you do (forking a project, moving a repository, fixing a typo in a URL) it saves you from re-cloning.

## Listing remotes

```bash
$ git remote
origin

$ git remote -v
origin  git@github.com:acme/shop.git (fetch)
origin  git@github.com:acme/shop.git (push)
```

`-v` adds URLs. A remote has separate fetch and push URLs; almost always they are the same.

## Adding a remote

```cmd
git remote add upstream git@github.com:acme/shop.git
remote add :: Register a new remote in this repository's config.
upstream :: The name you choose for it.
git@github.com:acme/shop.git :: Where it lives.
```

Adding a remote downloads nothing. Run `git fetch upstream` to get its branches, which then appear as `upstream/main` and so on.

## The fork workflow: origin and upstream

In open-source projects, and some companies, you cannot push to the main repository directly. Instead:

1. **Fork** it on GitHub: GitHub creates your own copy under your account.
2. **Clone your fork.** Your fork becomes `origin`.
3. **Add the original as `upstream`** so you can get new changes from it.

```bash
$ git clone git@github.com:priya-sharma/shop.git
$ cd shop
$ git remote add upstream git@github.com:acme/shop.git
$ git remote -v
origin    git@github.com:priya-sharma/shop.git (fetch)
origin    git@github.com:priya-sharma/shop.git (push)
upstream  git@github.com:acme/shop.git (fetch)
upstream  git@github.com:acme/shop.git (push)
```

The flow of work:

```graph Fork workflow
acme/shop (upstream) --fetch--> your laptop --push--> priya-sharma/shop (origin)
       ^                                                      |
       +---------------- pull request ------------------------+
```

To bring the original project's latest `main` into your fork:

```bash
$ git fetch upstream
$ git switch main
$ git merge upstream/main        # or: git rebase upstream/main
$ git push origin main
```

GitHub also has a **Sync fork** button on your fork's page that does the same on the server.

## Renaming, removing and changing URLs

```bash
$ git remote rename origin github          # origin/main becomes github/main
$ git remote remove upstream               # also removes upstream/* tracking branches
$ git remote set-url origin https://github.com/acme/shop.git
$ git remote get-url origin                # print just the URL
```

When a repository moves (renamed on GitHub, transferred to another organisation, or migrated to GitLab), update the URL with `set-url`. GitHub redirects renamed repositories for a while, but updating is cleaner.

## Inspecting a remote

```bash
$ git remote show origin
* remote origin
  Fetch URL: git@github.com:acme/shop.git
  Push  URL: git@github.com:acme/shop.git
  HEAD branch: main
  Remote branches:
    feature/checkout tracked
    main             tracked
    old-experiment   stale (use 'git remote prune' to remove)
  Local branch configured for 'git pull':
    main merges with remote main
  Local ref configured for 'git push':
    main pushes to main (up to date)
```

This contacts the server and reports:

- the server's default (`HEAD branch`),
- which remote branches you are tracking,
- **stale** branches: deleted on the server but still present locally as `origin/old-experiment`,
- how your local branches pull and push.

Clean up stale ones with `git remote prune origin`, or better, `git fetch --prune` (or set `fetch.prune true` as recommended in Chapter 8).

## Where remotes are stored

Remotes live in the repository's `.git/config`:

```ini title=".git/config"
[remote "origin"]
	url = git@github.com:acme/shop.git
	fetch = +refs/heads/*:refs/remotes/origin/*
```

The `fetch` line is a **refspec**: "take every branch on the server (`refs/heads/*`) and store it locally as `refs/remotes/origin/*`". That rule is why server branches appear as `origin/<name>`. You rarely need to touch it, but it explains the naming.

:::recap
### What you learned
- `git remote -v` lists remotes and URLs; `add`, `rename`, `remove` and `set-url` manage them.
- In a fork workflow, `origin` is your fork and `upstream` is the original project.
- `git remote show origin` reports tracked, stale and configured branches.
- Remotes are stored in `.git/config`; a refspec maps server branches to `origin/*`.

### Key terms
```terms
Fork :: A server-side copy of a repository under your own account.
upstream (remote) :: Conventional name for the original repository when working from a fork.
Stale branch :: A remote-tracking branch whose server branch no longer exists.
Refspec :: A rule mapping remote references to local ones, such as +refs/heads/*:refs/remotes/origin/*.
```

### Key commands
```commands
git remote -v :: List remotes and URLs.
git remote add <name> <url> :: Add a remote.
git remote rename <old> <new> :: Rename a remote.
git remote remove <name> :: Remove a remote and its tracking branches.
git remote set-url <name> <url> :: Change a remote's URL.
git remote show <name> :: Detailed information about a remote.
git remote prune <name> :: Delete stale remote-tracking branches.
```

### Common mistakes
- Re-cloning when a URL changed, instead of `git remote set-url`.
- Expecting `git remote add` to download branches (run `git fetch <name>`).
- Pushing to `upstream` instead of your fork (`origin`) in a fork workflow.

### Quick quiz
```quiz
? [scenario] Your team moved the repository from GitHub to GitLab. What's the quickest fix for your local clone?
- Delete it and clone again
+ git remote set-url origin <new GitLab URL>
- git remote add gitlab and delete origin
- Edit every commit's URL
> The history doesn't change; only the address does.

? In a fork workflow, which remote do you push your feature branches to?
+ origin (your fork)
- upstream (the original project)
- Both
- Neither; you push only tags
> You usually lack push access to the original. You push to your fork and open a pull request to upstream.

? [predict] What does "stale" mean in this output?
|   Remote branches:
|     old-experiment   stale (use 'git remote prune' to remove)
- The branch hasn't had commits for 90 days
+ The branch was deleted on the server, but your origin/old-experiment still exists
- Your local branch old-experiment is behind
- The branch has merge conflicts
> Prune removes remote-tracking branches that no longer exist on the server.

? [tf] git remote add downloads the new remote's branches immediately.
- True
+ False
> It only stores the name and URL. Run git fetch <name> to download.
```

### Practical exercise
````exercise Simulate a fork setup
Using any cloned repository:
1. Rename `origin` to `upstream`.
2. Add a new remote `origin` pointing at a (possibly non-existent) fork URL such as `git@github.com:you/shop.git`.
3. Run `git remote -v`, then undo your changes so the repository is back to its original state.
---solution---
```bash
$ git remote rename origin upstream
$ git remote add origin git@github.com:you/shop.git
$ git remote -v
$ git remote remove origin
$ git remote rename upstream origin
$ git remote -v
```
Nothing was fetched or pushed, so the fake URL never caused an error.
````

### What to learn next
Remotes are addresses. Next, use one: download what teammates have pushed with `git fetch`.
:::
