---
id: git-submodules
part: 15
title: Git Submodules
minutes: 20
level: Advanced
topics: 148 Git submodules
objectives:
- Explain what a submodule is: a pinned commit of another repository inside yours
- Clone a repository with submodules and initialise them correctly
- Update a submodule to a newer commit and record that in the parent
- Recognise common submodule problems and alternatives
concepts: submodule | gitlink | detached HEAD | .gitmodules | monorepo
commands: git submodule add | git clone --recurse-submodules | git submodule update --init --recursive | git submodule update --remote | git submodule status
---
A **submodule** lets one repository include another repository at a specific commit. Teams use it for shared libraries, vendored dependencies or design assets kept in their own repository. It's powerful, precise, and famously easy to get confused by. Most of the confusion disappears with one idea: **the parent stores a commit hash, not files.**

## The model

When you add a submodule, the parent repository records two things:

1. In `.gitmodules` (a committed file): the submodule's path and URL.
2. In the parent's tree: a special entry called a **gitlink** that stores **one commit hash** of the submodule repository.

```text title=".gitmodules"
[submodule "libs/ui"]
	path = libs/ui
	url = git@github.com:acme/ui-kit.git
```

```bash
$ git ls-tree HEAD libs/
160000 commit 5d2f90b3a1c2...	libs/ui
```

Mode `160000` and type `commit` mark the gitlink. The parent doesn't contain the UI kit's files; it contains "use ui-kit at commit 5d2f90b". The `libs/ui` folder is a full, separate Git repository checked out at that commit.

:::analogy A bookmark with a page number
A submodule entry is a bookmark that says "the ui-kit book, page 5d2f90b". The parent project doesn't copy the book. Anyone opening the project follows the bookmark to the exact same page. Turning to a newer page (updating the submodule) means moving the bookmark and committing that change in the parent.
:::

## Adding a submodule

```bash
$ git submodule add git@github.com:acme/ui-kit.git libs/ui
Cloning into '/Users/priya/code/shop/libs/ui'...
$ git status -s
A  .gitmodules
A  libs/ui
$ git commit -m "Add ui-kit as a submodule"
```

## Cloning a repository that has submodules

A plain clone leaves submodule folders **empty**:

```bash
$ git clone git@github.com:acme/shop.git
$ ls shop/libs/ui
$                                   # nothing
```

Either clone recursively:

```bash
$ git clone --recurse-submodules git@github.com:acme/shop.git
```

or initialise afterwards:

```cmd
git submodule update --init --recursive
submodule update :: Check out each submodule at the commit the parent records.
--init :: Also set up submodules that haven't been initialised yet (first time after cloning).
--recursive :: Do the same for submodules inside submodules.
```

## Day-to-day: pulling a parent that moved its submodule

When a teammate updates the submodule pointer and you pull the parent, your submodule folder is **not** updated automatically:

```bash
$ git pull
$ git status
	modified:   libs/ui (new commits)
```

That confusing line means: "the parent now records a different commit than the one checked out in `libs/ui`". Sync it:

```bash
$ git submodule update --recursive
```

To make `pull`, `switch` and similar commands update submodules automatically:

```bash
$ git config --global submodule.recurse true
```

## Updating a submodule to a newer version

To move the parent to a newer ui-kit commit:

```bash
$ git submodule update --remote libs/ui      # fetch and check out the latest of the tracked branch
$ git diff --submodule                       # see which commits the pointer moved across
Submodule libs/ui 5d2f90b..c3e7a12:
  > Add dark mode tokens
  > Fix button focus ring
$ git add libs/ui
$ git commit -m "Update ui-kit to include dark mode tokens"
```

`--remote` uses the branch configured in `.gitmodules` (`branch = main`), or the submodule's default branch. Alternatively, `cd libs/ui`, `git fetch`, `git switch --detach <tag>` for a specific version, then return to the parent and `git add libs/ui`.

## Working inside a submodule

A submodule is checked out in **detached HEAD** (Chapter 61), because the parent specifies a commit, not a branch. If you need to make changes to the library itself:

```bash
$ cd libs/ui
$ git switch main                 # get on a branch before committing
# edit, commit
$ git push                        # push the SUBMODULE's commit first
$ cd ../..
$ git add libs/ui
$ git commit -m "Use ui-kit fix for focus ring"
$ git push                        # then push the parent
```

:::danger Push the submodule before the parent
If you push a parent commit pointing at a submodule commit that exists only on your laptop, teammates get `fatal: remote error: upload-pack: not our ref …` when they update. `git push --recurse-submodules=check` refuses to push the parent in that situation; `=on-demand` pushes the submodules first automatically.
:::

## Useful commands

| Command | Does |
|---|---|
| `git submodule status` | Each submodule's checked-out commit; `-` = not initialised, `+` = differs from the recorded commit |
| `git diff --submodule` | Show submodule changes as lists of commits |
| `git submodule foreach 'git status -s'` | Run a command in every submodule |
| `git submodule sync` | Apply URL changes from `.gitmodules` to local config |
| `git rm libs/ui` | Remove a submodule (then delete `.git/modules/libs/ui` to fully clean up) |

## Alternatives

Submodules fit when you truly need **an exact commit of another repository** in your tree. Often something else is simpler:

| Need | Alternative |
|---|---|
| Use a library at a version | A **package manager** (npm, pip, Maven…) with a lock file |
| Several related projects developed together | A **monorepo**: one repository with several packages |
| Copy another repository's files in, occasionally syncing | **git subtree** (history merged into yours, no special commands for users) |

:::recap
### What you learned
- A submodule records a specific commit of another repository; `.gitmodules` holds its path and URL.
- Clone with `--recurse-submodules` or run `git submodule update --init --recursive`.
- "modified: path (new commits)" means the checked-out submodule commit differs from the recorded one; run `git submodule update`.
- Update the pointer with `git submodule update --remote`, then `git add` and commit in the parent.
- Submodules are detached by default; switch to a branch before committing inside one, and push the submodule before the parent.
- Package managers, monorepos and subtree are often simpler.

### Key terms
```terms
Submodule :: Another Git repository embedded at a specific commit inside a parent repository.
Gitlink :: The tree entry (mode 160000) where the parent records the submodule's commit.
.gitmodules :: The committed file listing submodule paths and URLs.
Monorepo :: A single repository containing several projects or packages.
```

### Key commands
```commands
git submodule add <url> <path> :: Add a submodule.
git clone --recurse-submodules <url> :: Clone including submodules.
git submodule update --init --recursive :: Initialise and check out recorded submodule commits.
git submodule update --remote <path> :: Move a submodule to its branch's latest commit.
git submodule status :: Show submodule states.
git config --global submodule.recurse true :: Keep submodules in sync automatically.
```

### Common mistakes
- Cloning without submodules and wondering why folders are empty.
- Committing inside a detached submodule and losing the commit.
- Pushing the parent before the submodule commit it points to.
- Using submodules where a package manager would do.

### Quick quiz
```quiz
? What does the parent repository store for a submodule?
+ A single commit hash of the submodule repository (plus its path and URL in .gitmodules)
- A copy of all the submodule's files
- The submodule's full history
- A branch name that always follows the latest commit
> The gitlink pins one exact commit.

? [troubleshoot] You cloned a project and libs/ui is empty. Fix?
+ git submodule update --init --recursive
- git pull --force
- Delete libs/ui and clone ui-kit manually
- git reset --hard
> Plain clones don't populate submodules.

? [predict] After git pull, git status shows this. What does it mean?
| 	modified:   libs/ui (new commits)
+ The parent records a different submodule commit than the one checked out; run git submodule update
- Someone committed inside your submodule
- libs/ui has uncommitted file changes
- The submodule URL changed
> Pulling the parent moved the pointer but not your checkout.

? [scenario] You fixed a bug inside libs/ui and committed in both repositories. What order do you push?
+ The submodule first, then the parent
- The parent first, then the submodule
- Only the parent
- Only the submodule
> Otherwise the parent points at a commit nobody else can fetch.
```

### Practical exercise
````exercise Build a submodule setup locally
1. Create a bare "library" repository with one commit (use a normal repo and push it to `/tmp/lib.git`).
2. In a practice project, `git submodule add /tmp/lib.git libs/lib` and commit.
3. Add a commit to the library (in another clone) and push it.
4. In the project, update the submodule to the new commit and commit the pointer change.
5. Clone the project elsewhere without `--recurse-submodules`, observe the empty folder, then initialise it.
---solution---
```bash
$ git init --bare /tmp/lib.git && git clone /tmp/lib.git /tmp/lib-work
$ cd /tmp/lib-work && echo v1 > lib.txt && git add . && git commit -m "v1" && git push -u origin main
$ cd ~/git-practice/notes-app
$ git -c protocol.file.allow=always submodule add /tmp/lib.git libs/lib && git commit -m "Add lib submodule"
$ cd /tmp/lib-work && echo v2 > lib.txt && git commit -am "v2" && git push
$ cd ~/git-practice/notes-app && git -c protocol.file.allow=always submodule update --remote libs/lib
$ git diff --submodule && git add libs/lib && git commit -m "Update lib to v2"
```
Recent Git versions block local-path submodules by default for security, hence `-c protocol.file.allow=always` in this local exercise. Real submodules use HTTPS or SSH URLs and don't need it.
````

### What to learn next
Next: Git hooks, scripts that run automatically at points like commit and push.
:::
