---
id: git-pull
part: 4
title: Integrating Changes with git pull
minutes: 22
level: Beginner
topics: 42 git pull
objectives:
- Explain that pull is fetch followed by merge or rebase
- Predict whether a pull will fast-forward, create a merge commit or rebase
- Configure how pull reconciles divergent branches
- Handle pulls with uncommitted local changes
- Recover from a pull you didn't want
concepts: pull | fetch | fast-forward | merge commit | rebase | divergent branches | upstream
commands: git pull | git pull --rebase | git pull --ff-only | git config pull.rebase
---
`git pull` is the command most beginners use to "get the latest". It works well, but because it does two things at once, it is also the command most likely to surprise you. Understanding the two halves removes the surprise.

## pull = fetch + integrate

```cmd
git pull
git :: The Git program.
pull :: Fetch from the current branch's upstream remote, then integrate the upstream branch (for example origin/main) into your current branch.
```

In other words, on `main` tracking `origin/main`:

```bash
$ git pull
# is roughly the same as
$ git fetch origin
$ git merge origin/main      # or: git rebase origin/main, depending on configuration
```

The fetch half is always safe (Chapter 20). The integrate half changes your branch and your files, and that is where the three possible outcomes come from.

## Outcome 1: fast-forward

You made no local commits since the last pull. The server has new commits. Your branch can simply slide forward:

```graph Before
      main
        |
A---B---C
         \
          D---E
              |
          origin/main
```

```graph After git pull
              main
               |
A---B---C---D---E
               |
          origin/main
```

```bash
$ git pull
Updating 7be20d4..a91be03
Fast-forward
 src/coupons.js | 30 ++++++++++++++++++++++++++++++
 1 file changed, 30 insertions(+)
```

No new commit is created. This is the most common and least eventful case.

## Outcome 2: divergent branches

You committed locally **and** a teammate pushed. The histories have diverged:

```graph Diverged
          F   main (yours)
         /
A---B---C
         \
          D---E   origin/main
```

Git has to combine them. There are two ways, and **you** (or your configuration) choose:

**Merge (`pull.rebase false`)** creates a merge commit with two parents:

```graph After pull with merge
          F-------M   main
         /       /
A---B---C---D---E   origin/main
```

**Rebase (`pull.rebase true`)** replays your commit F on top of E, giving a straight line. F becomes a new commit F′ with a different hash:

```graph After pull with rebase
A---B---C---D---E---F'   main
                |
           origin/main
```

Both are legitimate. Many teams prefer rebase for pulls on feature branches, because it avoids clutter like "Merge branch 'main' of github.com:acme/shop" commits. Part 8 explains the trade-offs fully. For now: **follow your team's convention**.

### "Need to specify how to reconcile divergent branches"

If you haven't configured a choice, recent Git versions stop instead of guessing:

```bash
$ git pull
hint: You have divergent branches and need to specify how to reconcile them.
hint: You can do so by running one of the following commands sometime before
hint: your next pull:
hint:
hint:   git config pull.rebase false  # merge
hint:   git config pull.rebase true   # rebase
hint:   git config pull.ff only       # fast-forward only
hint:
hint: You can replace "git config" with "git config --global" to set a default
hint: preference for all repositories. You can also pass --rebase, --no-rebase,
hint: or --ff-only on the command line to override the configured default per
hint: invocation.
fatal: Need to specify how to reconcile divergent branches.
```

Nothing has been changed except the fetch. Pick one globally (Chapter 8), or decide per pull:

```bash
$ git pull --no-rebase      # merge this time
$ git pull --rebase         # rebase this time
```

### The strict option: --ff-only

```bash
$ git pull --ff-only
fatal: Not possible to fast-forward, aborting.
```

`--ff-only` (or `git config pull.ff only`) only ever fast-forwards and refuses otherwise. Some developers like it on `main`, where they never commit directly: if a pull ever refuses, it means something unexpected happened, and they look before integrating.

## Outcome 3: conflicts

If your commits and the incoming ones changed the same lines, Git stops mid-merge or mid-rebase and asks you to resolve the conflict. Chapter 34 (merge) and Chapter 39 (rebase) cover this. The short version: `git status` tells you which files conflict and which command finishes or aborts.

```bash
$ git merge --abort      # if pull was merging
$ git rebase --abort     # if pull was rebasing
```

Either puts you back exactly where you were before the pull, with the fetched commits still available in `origin/main`.

## Pulling with uncommitted changes

Git protects uncommitted work. If an incoming change touches a file you have edited but not committed, the pull stops before changing anything:

```bash
$ git pull
error: Your local changes to the following files would be overwritten by merge:
	src/checkout.js
Please commit your changes or stash them before you merge.
Aborting
```

Options:

1. **Commit** your work (even as a work-in-progress commit on your branch), then pull.
2. **Stash** it, pull, and re-apply it (Chapter 44): `git stash`, `git pull`, `git stash pop`.
3. With rebase pulls, `git pull --rebase --autostash` does the stash-pull-pop dance for you.

If the incoming changes do not touch your edited files, the pull simply proceeds and your uncommitted edits stay as they are.

:::tip Start from clean
The easiest pull is from a clean working tree (`git status` says "working tree clean"). Make a habit of committing or stashing before pulling.
:::

## Pull targets

Usually plain `git pull` is enough, because your branch has an upstream. You can also be explicit:

```bash
$ git pull origin main
```

Read this as **"from the remote `origin`, fetch the branch `main`, and integrate it into my current branch"**. Note the space: `origin main` is *remote* and *branch*, two separate words. That's different from `origin/main`, which is a single name for your remote-tracking branch.

:::warning Pulling main into a feature branch
`git pull origin main` while on `feature/login` merges (or rebases) the server's `main` into `feature/login`. That is sometimes exactly what you want (to update your branch), and sometimes an accident. Check which branch you're on first.
:::

## Undoing a pull

If a pull merged something you didn't want, the reflog records where your branch was before:

```bash
$ git reflog -n 3
a91be03 (HEAD -> main) HEAD@{0}: pull: Fast-forward
7be20d4 HEAD@{1}: commit: Add homepage
...
$ git reset --hard HEAD@{1}
```

`git reset --hard` discards uncommitted changes, so only do this from a clean state. Chapters 41 and 43 explain `reset` and `reflog` properly. `ORIG_HEAD` is also set before merges and rebases, so `git reset --hard ORIG_HEAD` is a shortcut for undoing the last one.

:::recap
### What you learned
- `git pull` = `git fetch` + integrate (merge or rebase) the upstream branch into the current one.
- If you have no local commits, pull fast-forwards. If both sides have commits, the branches have diverged.
- Divergent pulls merge (merge commit) or rebase (replayed commits), per `pull.rebase` or `--rebase` / `--no-rebase`.
- `--ff-only` refuses anything but a fast-forward.
- Pull refuses to overwrite uncommitted changes; commit or stash first.
- `git pull origin main` means remote `origin`, branch `main`.

### Key terms
```terms
Pull :: Fetch from the upstream and integrate it into the current branch.
Fast-forward :: Moving a branch forward to a descendant commit without creating a merge commit.
Divergent branches :: Two branches that each have commits the other lacks.
Merge commit :: A commit with two parents that combines two lines of history.
Rebase (on pull) :: Replaying your local commits on top of the fetched ones instead of merging.
```

### Key commands
```commands
git pull :: Fetch and integrate the upstream into the current branch.
git pull --rebase :: Integrate by rebasing your local commits.
git pull --no-rebase :: Integrate with a merge.
git pull --ff-only :: Only fast-forward; refuse otherwise.
git config --global pull.rebase false|true :: Set the default for divergent pulls.
git pull --rebase --autostash :: Stash local edits, pull with rebase, re-apply edits.
```

### Common mistakes
- Pulling with uncommitted edits and panicking at the "would be overwritten" error (nothing was changed).
- Not knowing whether your pulls merge or rebase, then being surprised by merge commits.
- Confusing `git pull origin main` with a pull into `main`: it pulls into your *current* branch.

### Quick quiz
```quiz
? [state] Your local main has no new commits, and origin has two new commits on main. You run git pull. What happens?
+ main fast-forwards to include the two commits; no merge commit is created
- A merge commit is created
- Your commits are rebased
- Nothing, you must run fetch first
> With nothing local to combine, Git just moves main forward.

? [troubleshoot] git pull prints "fatal: Need to specify how to reconcile divergent branches". What happened?
- Your local repository is corrupt
+ Both sides have new commits and Git doesn't know whether to merge or rebase; nothing was integrated yet
- You have uncommitted changes
- The remote rejected your pull
> Configure pull.rebase (true or false) or pass --rebase / --no-rebase for this pull.

? [predict] You're on feature/login and run git pull origin main. What happens?
- Your local main is updated
+ The server's main is fetched and integrated into feature/login
- feature/login is pushed to main
- Git switches to main and pulls
> The integration target is always your current branch. `origin main` names what to fetch.

? [scenario] git pull refuses: "Your local changes to the following files would be overwritten by merge". What is the state of your repository?
+ Unchanged apart from the fetch; your edits are safe
- Your edits have been lost
- The merge is half done and must be aborted
- Your edits were committed automatically
> Git checks before touching anything. Commit or stash, then pull again.

? [tf] git pull --rebase gives your local commits new hashes.
+ True
- False
> Rebase replays commits as new commits on top of the fetched ones, so their hashes change.
```

### Practical exercise
````exercise Watch both pull styles
You'll simulate a teammate with a second clone on your own machine.
1. Create a bare "server" repository and a first clone: `git init --bare /tmp/server.git`, then `git clone /tmp/server.git alice`.
2. In `alice`, commit a file and run `git push -u origin main`.
3. Now clone the server again as `bob`.
4. Commit different files in both clones. Push from `alice`.
5. In `bob`, run `git pull --no-rebase` and look at `git log --oneline --graph`.
6. Repeat step 4, then in `bob` use `git pull --rebase` and compare the graph.
---solution---
```bash
$ git init --bare /tmp/server.git
$ git clone /tmp/server.git alice          # warns that the repository is empty: fine
$ cd alice && echo a > a.txt && git add a.txt && git commit -m "Alice 1" && git push -u origin main
$ cd .. && git clone /tmp/server.git bob
$ cd bob && echo b > b.txt && git add b.txt && git commit -m "Bob 1"
$ cd ../alice && echo a2 >> a.txt && git commit -am "Alice 2" && git push
$ cd ../bob && git pull --no-rebase && git log --oneline --graph
```
With `--no-rebase` you see a merge commit joining "Bob 1" and "Alice 2". With `--rebase`, the graph is a straight line and Bob's commit sits on top with a new hash. A **bare** repository has no working directory; it behaves like a server, which makes it perfect for practising. Bob is cloned after Alice's first push so that his `main` exists and tracks `origin/main` from the start.
````

### What to learn next
You can bring others' work in. Next, send yours out with `git push`, and learn why pushes get rejected.
:::
