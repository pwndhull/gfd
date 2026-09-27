---
id: remotes-and-origin
part: 1
title: Remotes and Origin
minutes: 16
level: Beginner
topics: 15 Remote | 16 Origin
objectives:
- Explain what a remote is and what Git stores about it
- Explain why the main remote is usually called origin, and that the name is only a convention
- Distinguish a remote, a remote branch and a remote-tracking branch
- List the remotes of a repository and read their URLs
concepts: remote | origin | remote-tracking branch | upstream | clone | fetch | push
commands: git remote -v | git fetch | git push
---
You have the full local picture: three areas, commits, branches and HEAD. The last foundation is how your repository connects to others. This chapter is short on commands and long on clarity, because misunderstanding remotes causes more "where did my commit go?" moments than anything else.

## What a remote is

**A remote is a named bookmark for another copy of the repository**, stored in your repository's configuration. It holds:

- a **name**, such as `origin`,
- a **URL**, such as `https://github.com/acme/shop.git` or `git@github.com:acme/shop.git`.

That's it. A remote is not a live connection, a mirror or a sync service. It is a name and an address. Git only contacts that address when you run `fetch`, `pull`, `push` or `clone`.

```bash
$ git remote -v
origin  git@github.com:acme/shop.git (fetch)
origin  git@github.com:acme/shop.git (push)
```

```cmd
git remote -v
git :: The Git program.
remote :: The command for listing and managing remotes.
-v :: Short for --verbose: also show each remote's URL. Git lists a fetch URL and a push URL, which are usually the same.
```

## Why "origin"?

When you **clone** a repository, Git automatically adds a remote pointing back to where you cloned from, and names it `origin`. That is the only reason almost every repository has a remote called `origin`.

The name itself is not special to Git. It is exactly like naming a contact "Mum" in your phone: convenient, conventional, and changeable. Some workflows add a second remote:

- In open source, you often **fork** a project on GitHub (make your own server-side copy) and clone your fork. Then `origin` is your fork, and you add a second remote, conventionally called **upstream**, pointing at the original project so you can get its updates.
- Some teams deploy by pushing to a remote named `production` or `heroku`.

```bash
$ git remote -v
origin    git@github.com:you/shop.git (fetch)
origin    git@github.com:you/shop.git (push)
upstream  git@github.com:acme/shop.git (fetch)
upstream  git@github.com:acme/shop.git (push)
```

:::note Two meanings of "upstream"
"upstream" is also used for a branch's tracking relationship ("main's upstream is origin/main", Chapter 23). Context makes it clear: a remote *named* upstream versus a branch's upstream *setting*.
:::

## Three things that are easy to confuse

This distinction is worth slowing down for. When your repository talks about `main`, there are three related but separate things:

1. **`main`**: your **local branch**. You commit here. It moves when you commit, merge, reset and so on.
2. **`origin/main`**: a **remote-tracking branch** in your repository. It records where `main` was on `origin` the last time you fetched, pulled or pushed. You never commit to it directly. It only moves when you communicate with the server.
3. **`main` on the server**: the actual branch in the remote repository. Only the server knows where it is right now.

```diagram tracking
```

The key insight: **`origin/main` is a cached copy, not a live view.** If a teammate pushes to `main` on GitHub, your `origin/main` does not change until you run `git fetch` (or `git pull`). This is why `git status` can cheerfully say "Your branch is up to date with 'origin/main'" while GitHub has newer commits. It is comparing with the last known state.

:::analogy A printed train timetable
`origin/main` is a printed timetable you picked up at the station this morning. It was accurate when you got it. If the railway changed a train since then, your printout does not update itself. `git fetch` is walking back to the station for a fresh copy.
:::

## Seeing remotes in the commit graph

The simulator below starts with your local `main` one commit ahead of `origin/main`, and a teammate has already pushed something you have not fetched. Run the suggested commands in order. Watch the blue `origin/main` label: it only moves on `fetch`, `pull` and `push`.

```viz remote
```

Notice what happens at each step:

1. `git status` says you are 1 commit ahead. It does not know about the teammate's commit yet.
2. `git push` is **rejected**: the server has a commit you do not, and Git refuses to overwrite it.
3. `git fetch` downloads the teammate's commit and moves `origin/main`. Your `main` does not move.
4. `git status` now reports that the branches have **diverged**.
5. `git pull` combines the two lines of work with a merge commit.
6. `git push` now succeeds.

That sequence, rejected push → fetch → integrate → push, is one of the most common daily situations on a team. Part 4 covers every step properly.

## Remote branches beyond main

Every branch on the server gets its own remote-tracking branch after a fetch: `origin/feature/search`, `origin/release/2.4`, and so on. You can list them:

```bash
$ git branch -r
  origin/HEAD -> origin/main
  origin/feature/search
  origin/main
```

`-r` means "remote-tracking branches". `origin/HEAD` records which branch the server considers its default; you can ignore it.

:::warning Deleting a branch on GitHub does not delete origin/feature/x locally
When a pull request is merged and its branch deleted on GitHub, your repository still has `origin/feature/x` until you fetch with pruning: `git fetch --prune`. Chapter 20 explains this and how to make it automatic.
:::

:::recap
### What you learned
- A remote is a name plus a URL for another copy of the repository. Git contacts it only on clone, fetch, pull and push.
- `origin` is the name Git gives the remote you cloned from. It is a convention, not a special keyword.
- `main`, `origin/main` and the server's `main` are three different things.
- `origin/main` is a remote-tracking branch: a cached record of the server's branch, updated by fetch, pull and push.
- A push is rejected when the server has commits you do not have; fetch and integrate first.

### Key terms
```terms
Remote :: A named URL for another copy of the repository.
origin :: The default name of the remote you cloned from.
upstream (remote) :: A conventional name for the original project when you work from a fork.
Remote-tracking branch :: A local, read-only record like `origin/main` of where a server branch was at your last contact.
Fork :: Your own server-side copy of someone else's repository.
```

### Key commands
```commands
git remote -v :: List remotes with their URLs.
git branch -r :: List remote-tracking branches.
git fetch :: Update remote-tracking branches from the server.
```

### Common mistakes
- Believing `origin/main` shows the server's current state. It shows the state at your last fetch.
- Thinking `origin` is a branch. It is the name of a remote.
- Trying to commit on `origin/main`. Remote-tracking branches are updated only by talking to the server.

### Quick quiz
```quiz
? What does a remote consist of?
- A live connection to the server
+ A name and a URL stored in your repository's configuration
- A copy of every branch on the server
- A special branch called origin
> A remote is just a name and an address. Git connects to it only when you fetch, pull, push or clone.

? [scenario] git status says "Your branch is up to date with 'origin/main'", but a teammate says they pushed to main five minutes ago. Who is right?
- Git, because status always checks the server
+ Probably both: status compares with origin/main as of your last fetch, which predates the teammate's push
- Your teammate must have pushed to a different repository
- Git is broken
> `git status` does not contact the server. Run `git fetch` and then `git status` again to see the new commit.

? [tf] You could rename your origin remote to something else and Git would keep working.
+ True
- False
> `origin` is only a conventional name. `git remote rename origin github` works fine; you would then type `github/main` instead of `origin/main`.

? [state] You run git fetch and a teammate's new commit arrives. Which label moves?
- main
+ origin/main
- HEAD
- Both main and origin/main
> Fetch only updates remote-tracking branches. Your own branches move only when you merge, rebase, pull, commit or reset.
```

### Practical exercise
```exercise Inspect a real remote
If you already have any cloned repository on your machine (for example an open-source project, or your team's code), open a terminal inside it and run:

- `git remote -v`
- `git branch -r`

Note the remote names and which branches the server has. If you have no clone yet, come back to this after Chapter 18.
---solution---
Typical output shows one remote named `origin` with an HTTPS or SSH URL, and remote-tracking branches such as `origin/main` plus any feature branches. If you see `upstream` too, the repository was set up from a fork.
```

### What to learn next
That completes the mental model. Part 2 gets practical: installing Git, configuring your identity, and connecting securely to GitHub.
:::
