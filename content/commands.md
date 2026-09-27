# Command reference

## git init
category: Repository
danger: safe
related: git clone, git status
purpose: Create a new, empty Git repository in the current (or given) folder.

### Syntax
```bash
git init [<directory>]
git init --bare [<directory>]
git init -b <branch-name>
```

### Examples
```bash
$ git init                      # turn the current folder into a repository
$ git init my-project           # create my-project/ with a repository inside
$ git init --bare server.git    # a repository with no working directory, for use as a remote
```

### Options
| Option | Meaning |
|---|---|
| `-b <name>`, `--initial-branch` | Name of the first branch (overrides `init.defaultBranch`) |
| `--bare` | Create a bare repository (no working directory) |

### Common mistakes
- Running it in your home folder or inside an existing repository.
- Using `init` for a project that already exists on a server; use `git clone`.
- Expecting it to commit existing files: it doesn't.

### Learn more
[Chapter 10: Creating a Repository with git init](#ch-git-init)

## git clone
category: Repository
danger: safe
related: git remote, git fetch, git init
purpose: Copy an existing repository, with its full history, and set up the origin remote and a local default branch.

### Syntax
```bash
git clone <url> [<directory>]
git clone --branch <branch> <url>
git clone --depth <n> <url>
```

### Examples
```bash
$ git clone git@github.com:acme/shop.git
$ git clone https://github.com/acme/shop.git shop-frontend
$ git clone --recurse-submodules git@github.com:acme/shop.git
$ git clone --depth 1 https://github.com/acme/shop.git   # latest snapshot only
```

### Options
| Option | Meaning |
|---|---|
| `--branch <name>`, `-b` | Check out this branch (or tag) instead of the default |
| `--depth <n>` | Shallow clone with only the last n commits |
| `--single-branch` | Download only one branch's history |
| `--filter=blob:none` | Partial clone: fetch file contents on demand |
| `--recurse-submodules` | Also clone and check out submodules |

### Common mistakes
- Forgetting to `cd` into the new folder.
- Checking out `origin/<branch>` instead of `<branch>` afterwards (detached HEAD).
- Expecting ignored files like `.env` to be included.

### Learn more
[Chapter 18: Cloning an Existing Project](#ch-git-clone)

## git config
category: Setup
danger: safe
related: git init, git help
purpose: Read and write Git settings at the system, global (you) and local (repository) levels.

### Syntax
```bash
git config [--global | --local | --system] <key> [<value>]
git config --list [--show-origin]
git config [--global] --unset <key>
git config [--global] --edit
```

### Examples
```bash
$ git config --global user.name "Priya Sharma"
$ git config --global user.email "priya@acme.dev"
$ git config --global init.defaultBranch main
$ git config --global core.editor "code --wait"
$ git config --global pull.rebase false
$ git config --list --show-origin
$ git config user.email                       # read one value
```

### Options
| Option | Meaning |
|---|---|
| `--global` | Your personal settings (`~/.gitconfig`) |
| `--local` | This repository only (`.git/config`); default inside a repository |
| `--system` | All users on this machine |
| `--list`, `-l` | Print all settings |
| `--show-origin` | Show which file each setting comes from |
| `--unset` | Remove a setting |
| `--edit`, `-e` | Open the config file in your editor |

### Common mistakes
- Setting an editor like VS Code without `--wait`.
- Expecting a changed email to update past commits.
- Confusing global and local values; use `--show-origin` to check.

### Learn more
[Chapter 8: Configuring Git](#ch-configuring-git)

## git status
category: Files
danger: safe
related: git diff, git add, git restore
purpose: Show the current branch, its relation to the upstream, and which files are staged, modified or untracked.

### Syntax
```bash
git status [-s] [-b] [--ignored] [<path>...]
```

### Examples
```bash
$ git status
$ git status -s                # short two-column format
$ git status -sb               # short, plus branch and ahead/behind
$ git status --ignored         # include ignored files
```

### Options
| Option | Meaning |
|---|---|
| `-s`, `--short` | Two-column short format (left: staged, right: unstaged) |
| `-b`, `--branch` | Show branch and tracking info in short format |
| `--ignored` | List ignored files too |

### Common mistakes
- Trusting "up to date" without fetching first; status never contacts the server.
- Not reading the hints: status prints the command for each next step.

### Learn more
[Chapter 11: Reading git status](#ch-git-status)

## git add
category: Files
danger: safe
related: git restore, git commit, git diff
purpose: Stage changes (copy the current version of files into the staging area) for the next commit.

### Syntax
```bash
git add <path>...
git add -A | .
git add -u
git add -p [<path>]
```

### Examples
```bash
$ git add src/cart.js
$ git add src/                 # everything changed inside a folder
$ git add -A                   # every change in the repository
$ git add -u                   # tracked files only (modifications and deletions)
$ git add -p src/cart.js       # choose hunks interactively
```

### Options
| Option | Meaning |
|---|---|
| `-A`, `--all` | Stage all changes, including new and deleted files, repository-wide |
| `-u`, `--update` | Stage modifications and deletions of tracked files only |
| `-p`, `--patch` | Interactively choose hunks |
| `-f`, `--force` | Add ignored files |
| `-n`, `--dry-run` | Show what would be added |

### Common mistakes
- `git add .` without checking status, committing secrets or build output.
- Editing after `git add` and forgetting to add again.

### Learn more
[Chapter 12: Staging Changes with git add](#ch-git-add)

## git commit
category: Commits
danger: safe
related: git add, git log, git reset
purpose: Record the staged changes as a new commit on the current branch.

### Syntax
```bash
git commit [-m <msg>] [-a] [-v]
git commit --amend [--no-edit]
git commit --fixup <commit>
```

### Examples
```bash
$ git commit -m "Fix rounding error in cart total"
$ git commit                              # write the message in your editor
$ git commit -am "Update styles"          # stage tracked changes and commit
$ git commit --amend --no-edit            # add staged changes to the last commit
$ git commit --fixup 5d2f90b              # a fix to fold into an earlier commit later
$ git commit --trailer "Co-authored-by: Sam Lee <sam@acme.dev>"
```

### Options
| Option | Meaning |
|---|---|
| `-m <msg>` | Message (repeat for extra paragraphs) |
| `-a`, `--all` | Stage modified and deleted tracked files first (not new files) |
| `-v` | Show the diff in the editor |
| `--amend` | Replace the last commit |
| `--no-edit` | Keep the existing message (with `--amend`) |
| `--fixup <c>` | Create a `fixup!` commit for autosquash |
| `--allow-empty` | Commit with no changes |
| `-s` | Add a Signed-off-by trailer |
| `-S` | Sign the commit |
| `--no-verify`, `-n` | Skip pre-commit and commit-msg hooks |

### Common mistakes
- Expecting `-a` to include new files.
- Amending commits already pushed to a shared branch.
- Vague messages like "fix".

### Learn more
[Chapter 13: git commit](#ch-git-commit), [Chapter 30: --amend](#ch-amending-commits)

## git log
category: Commits
danger: safe
related: git show, git diff, git reflog
purpose: Show commit history, with many options for filtering and formatting.

### Syntax
```bash
git log [<options>] [<revision-range>] [-- <path>...]
```

### Examples
```bash
$ git log --oneline --graph --all
$ git log -n 5 --stat
$ git log main..feature                  # on feature, not on main
$ git log --author="Sam" --since="2 weeks ago"
$ git log --grep="SHOP-231"
$ git log -S"legacyCheckout(" --oneline  # when was this text added/removed?
$ git log -L :total:src/cart.js          # history of a function
$ git log --follow -- src/cart.js        # a file's history across renames
```

### Options
| Option | Meaning |
|---|---|
| `--oneline` | One line per commit |
| `--graph` | Draw branch structure |
| `--all` | All branches, tags and remotes |
| `-n <N>` | Limit number of commits |
| `--stat` / `-p` | Changed files / full diffs |
| `--author`, `--since`, `--until` | Filter by author and date |
| `--grep` | Search messages |
| `-S` / `-G` | Search changes for text / regex |
| `--first-parent` | Follow only first parents |
| `--merges` / `--no-merges` | Only / exclude merge commits |
| `--format` | Custom output |
| `-g` | Walk the reflog |

### Common mistakes
- Forgetting `--all` and thinking other branches' commits vanished.
- Not knowing to press `q` to leave the pager.

### Learn more
[Chapter 14: git log](#ch-git-log), [Chapter 65: Advanced git log](#ch-advanced-log)

## git diff
category: Files
danger: safe
related: git status, git add, git show
purpose: Show differences between the working directory, staging area and commits.

### Syntax
```bash
git diff                          # working directory vs staging area
git diff --staged                 # staging area vs last commit
git diff <commit> [<commit>] [-- <path>]
git diff <a>...<b>                # from the merge base to b
```

### Examples
```bash
$ git diff
$ git diff --staged
$ git diff HEAD
$ git diff main...feature/coupons --stat
$ git diff v1.3.0 v1.4.0 -- src/
$ git diff --word-diff
$ git diff --check                # whitespace errors and conflict markers
```

### Options
| Option | Meaning |
|---|---|
| `--staged`, `--cached` | Compare staging area with HEAD |
| `--stat` / `--name-only` | Summaries |
| `--word-diff` | Word-level differences |
| `-w` | Ignore whitespace |
| `-U<n>` | Lines of context |
| `--check` | Report whitespace problems and conflict markers |

### Common mistakes
- Seeing an empty `git diff` after staging (use `--staged`).
- Using two dots for PR-style comparisons (use three).

### Learn more
[Chapter 15: git diff](#ch-git-diff)

## git show
category: Commits
danger: safe
related: git log, git diff, git cat-file
purpose: Display a commit (message and diff), a tag, a tree, or a file at a given revision.

### Syntax
```bash
git show [<object>]
git show <revision>:<path>
```

### Examples
```bash
$ git show
$ git show a91be03 --stat
$ git show v2.4.0
$ git show v2.4.0:src/cart.js
$ git show HEAD~2 -- src/cart.js
```

### Options
| Option | Meaning |
|---|---|
| `--stat` / `--name-only` | File summary only |
| `--no-patch` | Metadata and message only |
| `--format` | Custom format |

### Common mistakes
- Reading a merge commit's `git show` (a combined diff) and concluding it changed nothing; use `git diff <merge>^1 <merge>`.

### Learn more
[Chapter 31: Viewing and Comparing Commits](#ch-viewing-and-comparing-commits)

## git restore
category: Undo
danger: medium
related: git reset, git switch, git checkout
purpose: Restore files in the working directory or staging area from the index or another commit; used to discard edits or unstage.

### Syntax
```bash
git restore <path>...                     # discard unstaged changes
git restore --staged <path>...            # unstage
git restore --source=<commit> <path>...   # take a version from a commit
```

### Examples
```bash
$ git restore src/cart.js
$ git restore -p src/cart.js
$ git restore --staged src/cart.js
$ git restore --staged --worktree src/cart.js
$ git restore --source=v1.4.0 src/config.js
$ git restore --theirs package-lock.json   # during a conflict
```

### Options
| Option | Meaning |
|---|---|
| `--staged`, `-S` | Restore the staging area |
| `--worktree`, `-W` | Restore the working directory (default) |
| `--source=<c>`, `-s` | Take content from this commit |
| `-p`, `--patch` | Choose hunks |
| `--ours` / `--theirs` | During a conflict, take one side |

### Common mistakes
- Discarding edits when you meant to unstage (add `--staged`).
- Using `--ours`/`--theirs` after `git add` on a conflicted file.

### Learn more
[Chapter 40: Undoing Uncommitted Changes](#ch-undoing-working-changes)

## git rm
category: Files
danger: medium
related: git mv, git restore, git clean
purpose: Remove files from the working directory and the index, or (with --cached) stop tracking them while keeping them on disk.

### Syntax
```bash
git rm <path>...
git rm --cached <path>...
git rm -r <folder>
```

### Examples
```bash
$ git rm old.txt                    # delete and stage the deletion
$ git rm --cached .env              # stop tracking, keep the file
$ git rm -r --cached node_modules/  # stop tracking a folder
```

### Options
| Option | Meaning |
|---|---|
| `--cached` | Only remove from the index |
| `-r` | Recurse into folders |
| `-f` | Force removal of modified files |
| `-n` | Dry run |

### Common mistakes
- Forgetting `--cached` and deleting a file you wanted to keep locally.
- Assuming it removes a file from past commits (it doesn't).

### Learn more
[Chapter 16: .gitignore](#ch-gitignore)

## git mv
category: Files
danger: safe
related: git rm, git add
purpose: Move or rename a tracked file and stage the change in one step.

### Syntax
```bash
git mv <source> <destination>
```

### Examples
```bash
$ git mv notes.js notes-list.js
$ git mv src/utils.js src/lib/utils.js
```

### Options
| Option | Meaning |
|---|---|
| `-f` | Overwrite the destination |
| `-n` | Dry run |

### Common mistakes
- Thinking Git records renames; it detects them from content similarity.

### Learn more
[Chapter 12: git add](#ch-git-add)

## git branch
category: Branches
danger: low
related: git switch, git checkout, git merge
purpose: List, create, rename and delete branches, and set upstreams.

### Syntax
```bash
git branch [-a | -r] [-v | -vv]
git branch <name> [<start-point>]
git branch -m [<old>] <new>
git branch -d | -D <name>
git branch -u <upstream>
```

### Examples
```bash
$ git branch -vv --sort=-committerdate
$ git branch feature/login
$ git branch hotfix origin/main
$ git branch -m feature/cuopons feature/coupons
$ git branch -d feature/done
$ git branch -D spike/failed
$ git branch --merged
$ git branch -u origin/feature/x
$ git branch rescued 3c9e1a0        # recover commits
```

### Options
| Option | Meaning |
|---|---|
| `-a` / `-r` | All / remote-tracking branches |
| `-v` / `-vv` | Latest commit / plus upstream and ahead/behind |
| `-m` / `-M` | Rename / force rename |
| `-d` / `-D` | Delete merged / force delete |
| `-u <up>` | Set upstream |
| `--merged` / `--no-merged` | Filter by merge status |
| `--sort` | Sort, e.g. `-committerdate` |

### Common mistakes
- Creating a branch and forgetting to switch to it.
- Force-deleting unmerged work with `-D` by habit.

### Learn more
[Chapter 25](#ch-creating-and-switching-branches), [Chapter 26](#ch-managing-branches)

## git switch
category: Branches
danger: low
related: git branch, git checkout, git restore
purpose: Switch to another branch (optionally creating it), updating your working directory.

### Syntax
```bash
git switch <branch>
git switch -c <new-branch> [<start-point>]
git switch --detach <commit>
git switch -
```

### Examples
```bash
$ git switch main
$ git switch -c feature/login
$ git switch -c hotfix/cart origin/main
$ git switch -                       # previous branch
$ git switch --detach v2.3.0
```

### Options
| Option | Meaning |
|---|---|
| `-c <name>` | Create and switch |
| `-C <name>` | Create or reset and switch |
| `--detach` | Detach HEAD at a commit |
| `--track` | Set upstream when creating from a remote branch |
| `-m` | Merge local changes into the target branch when switching |

### Common mistakes
- Switching with uncommitted changes and committing them on the wrong branch.

### Learn more
[Chapter 25: Creating and Switching Branches](#ch-creating-and-switching-branches)

## git checkout
category: Branches
danger: medium
related: git switch, git restore
purpose: The older multi-purpose command: switch branches, detach HEAD at a commit, or overwrite files from the index or another commit.

### Syntax
```bash
git checkout <branch>
git checkout -b <new-branch> [<start-point>]
git checkout <commit>
git checkout [<commit>] -- <path>...
```

### Examples
```bash
$ git checkout main                   # = git switch main
$ git checkout -b feature/login       # = git switch -c feature/login
$ git checkout v2.3.0                 # detached HEAD
$ git checkout -- app.js              # = git restore app.js (discards edits!)
$ git checkout main -- app.js         # take main's version of app.js
```

### Options
| Option | Meaning |
|---|---|
| `-b <name>` | Create and switch |
| `--ours` / `--theirs` | During conflicts, take one side of a file |
| `-m` | Recreate conflict markers for a file |

### Common mistakes
- Accidentally overwriting a file's edits when you meant a branch name.
- Checking out `origin/<branch>` and committing in detached HEAD.

### Learn more
[Chapter 25](#ch-creating-and-switching-branches)

## git merge
category: Merge
danger: low
related: git rebase, git pull, git cherry-pick
purpose: Integrate another branch into the current branch, by fast-forward or with a merge commit.

### Syntax
```bash
git merge <branch>
git merge --no-ff | --ff-only | --squash <branch>
git merge --abort | --continue
```

### Examples
```bash
$ git merge feature/coupons
$ git merge --no-ff --no-edit feature/coupons
$ git merge --ff-only origin/main
$ git merge --squash feature/coupons && git commit
$ git merge --abort
```

### Options
| Option | Meaning |
|---|---|
| `--no-ff` | Always create a merge commit |
| `--ff-only` | Refuse unless a fast-forward is possible |
| `--squash` | Stage the combined changes without committing |
| `-m <msg>` / `--no-edit` | Message / accept default |
| `--abort` / `--continue` | Cancel / finish a conflicted merge |
| `-X ours` / `-X theirs` | Auto-resolve conflicting hunks for one side |

### Common mistakes
- Running it on the wrong branch (it merges INTO the current branch).
- Committing conflict markers.
- Using `-X ours` to escape conflicts, silently discarding the other side.

### Learn more
[Chapter 32](#ch-what-is-merging), [Chapter 33](#ch-git-merge), [Chapter 35](#ch-resolving-conflicts)

## git rebase
category: Rebase
danger: high
related: git merge, git cherry-pick, git reflog
purpose: Replay the current branch's commits on top of another base, creating new commits; interactive mode edits history.

### Syntax
```bash
git rebase <upstream>
git rebase -i <base>
git rebase --onto <new-base> <old-base> [<branch>]
git rebase --continue | --skip | --abort
```

### Examples
```bash
$ git fetch && git rebase origin/main
$ git rebase -i origin/main
$ git rebase -i --autosquash origin/main
$ git rebase --onto main feature/a feature/b
$ git rebase -i --exec "npm test" origin/main
$ git rebase --abort
```

### Options
| Option | Meaning |
|---|---|
| `-i` | Interactive: edit the todo list |
| `--onto` | Replay a range onto a different base |
| `--autosquash` | Arrange fixup!/squash! commits automatically |
| `--autostash` | Stash and restore local changes around the rebase |
| `--exec <cmd>` | Run a command after each commit |
| `--update-refs` | Also move branches pointing into the rebased range |
| `--continue` / `--skip` / `--abort` | Control a stopped rebase |

### Common mistakes
- Rebasing a shared branch.
- Pulling after rebasing a pushed branch (duplicates commits).
- Confusing ours/theirs during conflicts (they're swapped).

### Learn more
[Chapters 36–39](#ch-what-is-rebase)

## git cherry-pick
category: Merge
danger: low
related: git rebase, git revert, git merge
purpose: Apply the changes introduced by existing commits onto the current branch as new commits.

### Syntax
```bash
git cherry-pick <commit>...
git cherry-pick <A>..<B>
git cherry-pick --continue | --skip | --abort | --quit
```

### Examples
```bash
$ git cherry-pick -x 03013a1
$ git cherry-pick a91be03^..5d2f90b
$ git cherry-pick -n 03013a1 5d2f90b
$ git cherry-pick -m 1 <merge-commit>
```

### Options
| Option | Meaning |
|---|---|
| `-x` | Record the source commit in the message |
| `-n`, `--no-commit` | Apply without committing |
| `-e` | Edit the message |
| `-m <n>` | Mainline parent for merge commits |
| `--continue` / `--skip` / `--abort` / `--quit` | Control a stopped pick |

### Common mistakes
- Picking commits whose dependencies you didn't pick.
- Cherry-picking a whole branch instead of merging it.

### Learn more
[Chapter 46](#ch-cherry-pick), [Chapter 47](#ch-cherry-pick-conflicts-and-scenarios)

## git revert
category: Undo
danger: low
related: git reset, git cherry-pick
purpose: Create a new commit that undoes the changes of an earlier commit, without rewriting history.

### Syntax
```bash
git revert <commit>...
git revert -m 1 <merge-commit>
git revert --continue | --abort
```

### Examples
```bash
$ git revert c07a1e4
$ git revert --no-edit HEAD
$ git revert -n HEAD~2..HEAD && git commit -m "Revert coupon feature"
$ git revert -m 1 5f3b2a1
```

### Options
| Option | Meaning |
|---|---|
| `--no-edit` | Accept the default message |
| `-n`, `--no-commit` | Stage the inverse changes only |
| `-m <n>` | Mainline parent for merge commits |
| `--continue` / `--abort` | Control a conflicted revert |

### Common mistakes
- Forgetting `-m 1` for merges.
- Re-merging a reverted branch without reverting the revert.

### Learn more
[Chapter 42: git revert](#ch-git-revert)

## git reset
category: Undo
danger: high
related: git revert, git restore, git reflog
purpose: Move the current branch (and HEAD) to another commit, and optionally reset the staging area and working directory.

### Syntax
```bash
git reset [--soft | --mixed | --hard] [<commit>]
git reset [<commit>] -- <path>...
```

### Examples
```bash
$ git reset --soft HEAD~1           # undo last commit, keep changes staged
$ git reset HEAD~1                  # undo last commit, keep changes unstaged
$ git reset --hard HEAD~1           # undo last commit and discard its changes
$ git reset --hard origin/main      # match the fetched server branch
$ git reset --hard ORIG_HEAD        # undo the last merge/rebase/reset
$ git reset src/cart.js             # unstage a file
```

### Options
| Option | Meaning |
|---|---|
| `--soft` | Move the branch only |
| `--mixed` | Also reset the staging area (default) |
| `--hard` | Also reset the working directory: uncommitted changes lost |
| `--keep` | Like hard, but refuses if it would lose local changes |

### Common mistakes
- `--hard` with uncommitted work you needed.
- Resetting commits already pushed to shared branches.

### Learn more
[Chapter 41: git reset](#ch-git-reset)

## git reflog
category: Undo
danger: safe
related: git reset, git log, git fsck
purpose: Show the local history of where HEAD and branches have pointed, the key to recovering "lost" commits.

### Syntax
```bash
git reflog [show] [<ref>]
git log -g [<ref>]
```

### Examples
```bash
$ git reflog
$ git reflog show main --date=relative
$ git reset --hard HEAD@{2}
$ git branch rescued HEAD@{5}
$ git diff main@{1} main
```

### Options
| Option | Meaning |
|---|---|
| `show <ref>` | A specific branch's reflog |
| `--date=relative` / `iso` | Include times |
| `-n <N>` | Limit entries |

### Common mistakes
- Re-cloning instead of reading the reflog.
- Expecting it to recover never-committed edits.

### Learn more
[Chapter 43](#ch-git-reflog), [Chapter 62](#ch-reflog-deep-dive)

## git stash
category: Stash
danger: low
related: git switch, git restore, git worktree
purpose: Save uncommitted changes to a stack and clean the working directory; restore them later.

### Syntax
```bash
git stash [push] [-u] [-m <msg>] [-- <path>...]
git stash list | show [-p] [<stash>]
git stash apply | pop [--index] [<stash>]
git stash drop [<stash>] | clear
git stash branch <name> [<stash>]
```

### Examples
```bash
$ git stash push -u -m "half-done coupon validation"
$ git stash list
$ git stash show -p stash@{1}
$ git stash pop
$ git stash apply stash@{2}
$ git stash branch feature/validation stash@{1}
```

### Options
| Option | Meaning |
|---|---|
| `-u` / `-a` | Include untracked / also ignored files |
| `-m <msg>` | Description |
| `-p` | Choose hunks |
| `--staged` | Stash only staged changes |
| `--keep-index` | Keep staged changes in place too |
| `--index` | (apply/pop) Restore staged state |

### Common mistakes
- Forgetting `-u`, leaving new files behind.
- Letting stashes pile up; using stash for long-term storage.
- `git stash clear` without checking the list.

### Learn more
[Chapter 44](#ch-git-stash), [Chapter 45](#ch-using-stashes)

## git tag
category: Tags
danger: low
related: git describe, git push, git show
purpose: Create, list, delete and verify tags that name specific commits.

### Syntax
```bash
git tag [-l <pattern>]
git tag <name> [<commit>]
git tag -a <name> -m <msg> [<commit>]
git tag -d <name>
```

### Examples
```bash
$ git tag -a v2.5.0 -m "Release 2.5.0"
$ git tag -a v2.4.1 -m "Hotfix" 51c0e2a
$ git tag -l "v2.*" --sort=-v:refname
$ git push origin v2.5.0
$ git push --follow-tags
$ git tag -d v2.5.0-rc1 && git push origin --delete v2.5.0-rc1
```

### Options
| Option | Meaning |
|---|---|
| `-a` | Annotated tag |
| `-s` | Signed annotated tag |
| `-m <msg>` | Tag message |
| `-l <pattern>` | List matching tags |
| `-d` | Delete |
| `--contains <c>` | Tags that include a commit |

### Common mistakes
- Forgetting that `git push` doesn't send tags.
- Moving published tags.

### Learn more
[Chapter 48](#ch-git-tags), [Chapter 49](#ch-versioning-and-releases)

## git fetch
category: Remote
danger: safe
related: git pull, git remote, git merge
purpose: Download commits and update remote-tracking branches without changing your own branches or files.

### Syntax
```bash
git fetch [<remote>] [<branch>]
git fetch --all | --prune | --tags
```

### Examples
```bash
$ git fetch
$ git fetch --prune
$ git fetch upstream
$ git log --oneline main..origin/main    # what arrived?
```

### Options
| Option | Meaning |
|---|---|
| `--all` | All remotes |
| `--prune`, `-p` | Remove deleted remote branches' tracking refs |
| `--tags` | Fetch all tags |
| `--unshallow` | Complete a shallow clone |

### Common mistakes
- Expecting fetch to update your files.

### Learn more
[Chapter 20: git fetch](#ch-git-fetch)

## git pull
category: Remote
danger: medium
related: git fetch, git merge, git rebase
purpose: Fetch from the upstream and integrate it into the current branch by merging or rebasing.

### Syntax
```bash
git pull [--rebase | --no-rebase | --ff-only] [<remote> [<branch>]]
```

### Examples
```bash
$ git pull
$ git pull --rebase
$ git pull --ff-only
$ git pull origin main              # fetch origin's main, integrate into the CURRENT branch
$ git pull --rebase --autostash
```

### Options
| Option | Meaning |
|---|---|
| `--rebase` / `--no-rebase` | Integrate by rebase / merge |
| `--ff-only` | Only fast-forward |
| `--autostash` | Stash local changes around the pull |

### Common mistakes
- Pulling with uncommitted changes.
- Not knowing whether your pulls merge or rebase.
- Pulling after rebasing a pushed branch.

### Learn more
[Chapter 21: git pull](#ch-git-pull)

## git push
category: Remote
danger: medium
related: git fetch, git pull, git remote
purpose: Upload local commits to a remote and update the remote branch.

### Syntax
```bash
git push [-u] [<remote> [<branch>]]
git push --force-with-lease [--force-if-includes]
git push <remote> --delete <branch>
git push --follow-tags | <remote> <tag>
```

### Examples
```bash
$ git push
$ git push -u origin feature/login
$ git push --force-with-lease --force-if-includes
$ git push origin --delete feature/old
$ git push --follow-tags
```

### Options
| Option | Meaning |
|---|---|
| `-u`, `--set-upstream` | Set the upstream for the branch |
| `--force-with-lease` | Force only if the remote hasn't moved since your last fetch |
| `--force-if-includes` | Also require the remote tip to be in your local history |
| `--force`, `-f` | Force unconditionally (avoid) |
| `--delete` | Delete a remote branch or tag |
| `--follow-tags` | Also push annotated tags reachable from pushed commits |
| `--no-verify` | Skip the pre-push hook |

### Common mistakes
- `--force` to get past a rejection.
- Forgetting `-u` on first push.
- Forgetting to push tags.

### Learn more
[Chapter 22: git push](#ch-git-push)

## git remote
category: Remote
danger: low
related: git fetch, git push, git clone
purpose: List, add, rename, remove and inspect remotes, and change their URLs.

### Syntax
```bash
git remote [-v]
git remote add <name> <url>
git remote rename <old> <new>
git remote remove <name>
git remote set-url <name> <url>
git remote show <name>
```

### Examples
```bash
$ git remote -v
$ git remote add upstream git@github.com:acme/shop.git
$ git remote set-url origin git@github.com:acme/shop.git
$ git remote show origin
$ git remote prune origin
```

### Options
| Option | Meaning |
|---|---|
| `-v` | Show URLs |
| `prune` | Delete stale remote-tracking branches |
| `get-url` | Print a remote's URL |

### Common mistakes
- Re-cloning when only the URL changed.

### Learn more
[Chapter 19: git remote](#ch-git-remote)

## git clean
category: Undo
danger: high
related: git restore, git reset, git stash
purpose: Delete untracked files (and optionally folders and ignored files) from the working directory.

### Syntax
```bash
git clean -n | -f [-d] [-x] [-i]
```

### Examples
```bash
$ git clean -n                 # preview
$ git clean -fd                # remove untracked files and folders
$ git clean -ndx               # preview including ignored files
$ git clean -i                 # interactive
```

### Options
| Option | Meaning |
|---|---|
| `-n` | Dry run |
| `-f` | Force (required to delete) |
| `-d` | Include folders |
| `-x` | Include ignored files |
| `-X` | Only ignored files |
| `-i` | Interactive |

### Common mistakes
- Running `-fdx` without previewing and deleting `.env` or local data.

### Learn more
[Chapter 40](#ch-undoing-working-changes)

## git blame
category: Debugging
danger: safe
related: git log, git show
purpose: Show which commit and author last changed each line of a file.

### Syntax
```bash
git blame [-L <range>] [-w] [-C] [<rev>] [--] <file>
```

### Examples
```bash
$ git blame src/cart.js
$ git blame -L 40,60 src/cart.js
$ git blame -L :total src/cart.js
$ git blame -w -C src/cart.js
$ git blame 3c9e1a0^ -- src/cart.js
```

### Options
| Option | Meaning |
|---|---|
| `-L <a,b>` / `-L :func` | Limit lines |
| `-w` | Ignore whitespace |
| `-C` / `-M` | Detect copied / moved lines |
| `--ignore-rev <c>` / `--ignore-revs-file <f>` | Skip formatting commits |

### Common mistakes
- Crediting a reformat commit's author with the logic.

### Learn more
[Chapter 64: git blame and git show](#ch-blame-and-show)

## git bisect
category: Debugging
danger: safe
related: git log, git revert
purpose: Binary-search history to find the commit that introduced a bug.

### Syntax
```bash
git bisect start [<bad> [<good>]]
git bisect good | bad | skip [<commit>]
git bisect run <cmd>
git bisect reset
```

### Examples
```bash
$ git bisect start HEAD v2.4.0
$ git bisect good
$ git bisect bad
$ git bisect run npm test -- cart.test.js
$ git bisect reset
```

### Options
| Option | Meaning |
|---|---|
| `skip` | Untestable commit |
| `run <cmd>` | Automate: exit 0 good, 1–127 bad, 125 skip |
| `log` / `replay` | Record / replay a session |
| `--term-old` / `--term-new` | Custom terms instead of good/bad |

### Common mistakes
- Forgetting `git bisect reset`.

### Learn more
[Chapter 63: git bisect](#ch-git-bisect)

## git worktree
category: Advanced
danger: low
related: git switch, git stash
purpose: Manage extra working directories attached to the same repository, each with its own checked-out branch.

### Syntax
```bash
git worktree add <path> [<branch>]
git worktree add <path> -b <new-branch> [<start>]
git worktree list | remove <path> | prune
```

### Examples
```bash
$ git worktree add ../shop-hotfix -b hotfix/cart origin/main
$ git worktree list
$ git worktree remove ../shop-hotfix
```

### Options
| Option | Meaning |
|---|---|
| `-b <name>` | Create a new branch |
| `--detach` | Detached HEAD in the worktree |
| `--force` | Remove despite local changes |

### Common mistakes
- Trying to check out the same branch in two worktrees.

### Learn more
[Chapter 66: git worktree](#ch-git-worktree)

## git submodule
category: Advanced
danger: medium
related: git clone
purpose: Embed and manage other repositories at specific commits inside a parent repository.

### Syntax
```bash
git submodule add <url> <path>
git submodule update [--init] [--recursive] [--remote]
git submodule status | foreach <cmd> | sync
```

### Examples
```bash
$ git submodule add git@github.com:acme/ui-kit.git libs/ui
$ git submodule update --init --recursive
$ git submodule update --remote libs/ui
$ git config --global submodule.recurse true
```

### Options
| Option | Meaning |
|---|---|
| `--init` | Initialise uninitialised submodules |
| `--recursive` | Include nested submodules |
| `--remote` | Update to the tracked branch's latest commit |

### Common mistakes
- Pushing the parent before the submodule.
- Committing in a detached submodule without a branch.

### Learn more
[Chapter 67: Git Submodules](#ch-git-submodules)

## git describe
category: Tags
danger: safe
related: git tag
purpose: Name a commit relative to the nearest annotated tag, e.g. v1.4.0-3-g8d1c4e2.

### Syntax
```bash
git describe [--tags] [--abbrev=<n>] [<commit>]
```

### Examples
```bash
$ git describe
$ git describe --tags --abbrev=0     # most recent tag name
```

### Options
| Option | Meaning |
|---|---|
| `--tags` | Consider lightweight tags too |
| `--abbrev=0` | Print only the tag name |
| `--dirty` | Append -dirty if there are local changes |

### Common mistakes
- Expecting lightweight tags to count without `--tags`.

### Learn more
[Chapter 48: Tags](#ch-git-tags)

## git shortlog
category: Commits
danger: safe
related: git log
purpose: Summarise commits grouped by author.

### Syntax
```bash
git shortlog [-s] [-n] [<range>]
```

### Examples
```bash
$ git shortlog -sn --since="3 months ago"
$ git shortlog v2.4.0..v2.5.0
```

### Options
| Option | Meaning |
|---|---|
| `-s` | Counts only |
| `-n` | Sort by count |
| `-e` | Show emails |

### Common mistakes
- Treating commit counts as a measure of contribution.

### Learn more
[Chapter 14: git log](#ch-git-log)

## git grep
category: Debugging
danger: safe
related: git log
purpose: Search the contents of tracked files (in the working tree or any commit) quickly.

### Syntax
```bash
git grep [-n] [-i] <pattern> [<tree>] [-- <path>]
```

### Examples
```bash
$ git grep -n "formatMoney"
$ git grep -n "API_KEY" v2.4.0            # search a tagged version
$ git grep -c "TODO" -- src/
```

### Options
| Option | Meaning |
|---|---|
| `-n` | Line numbers |
| `-i` | Case-insensitive |
| `-c` | Count matches per file |
| `-w` | Whole words |

### Common mistakes
- Expecting it to search untracked files (use `--untracked`).

### Learn more
[Chapter 65: Advanced git log](#ch-advanced-log)

## git rev-parse
category: Advanced
danger: safe
related: git show, git cat-file
purpose: Resolve names (branches, tags, HEAD~2, @{u}) to object IDs and report repository information.

### Syntax
```bash
git rev-parse <name>...
git rev-parse --show-toplevel | --abbrev-ref HEAD
```

### Examples
```bash
$ git rev-parse HEAD
$ git rev-parse --short HEAD
$ git rev-parse --abbrev-ref HEAD       # current branch name
$ git rev-parse --show-toplevel         # repository root folder
```

### Options
| Option | Meaning |
|---|---|
| `--short` | Abbreviated hash |
| `--abbrev-ref` | Symbolic name instead of hash |
| `--show-toplevel` | Top-level directory |

### Common mistakes
- Parsing `git status` output in scripts instead of using plumbing like this.

### Learn more
[Chapter 71: References and Packfiles](#ch-refs-and-packfiles)

## git cat-file
category: Advanced
danger: safe
related: git show, git ls-tree
purpose: Inspect objects in Git's database: type, size and content.

### Syntax
```bash
git cat-file -t | -s | -p <object>
```

### Examples
```bash
$ git cat-file -p HEAD
$ git cat-file -p HEAD^{tree}
$ git cat-file -t ce01362
```

### Options
| Option | Meaning |
|---|---|
| `-t` | Type |
| `-s` | Size |
| `-p` | Pretty-print content |

### Common mistakes
- Editing objects by hand in .git/objects.

### Learn more
[Chapter 70: Git Internals](#ch-git-internals)

## git fsck
category: Advanced
danger: safe
related: git reflog, git gc
purpose: Check repository integrity and list dangling (unreferenced) objects, useful for deep recovery.

### Syntax
```bash
git fsck [--lost-found] [--no-reflog] [--unreachable]
```

### Examples
```bash
$ git fsck --lost-found                  # write dangling objects to .git/lost-found
$ git fsck --no-reflog | grep "dangling commit"
```

### Options
| Option | Meaning |
|---|---|
| `--lost-found` | Save dangling objects to .git/lost-found |
| `--no-reflog` | Ignore reflog references |
| `--unreachable` | Report all unreachable objects |

### Common mistakes
- Running `git gc --prune=now` before looking.

### Learn more
[Chapter 43](#ch-git-reflog), [Chapter 74](#ch-recovery-history-accidents)

## git gc
category: Advanced
danger: medium
related: git fsck, git reflog
purpose: Housekeeping: pack objects and refs, expire old reflog entries, prune old unreachable objects.

### Syntax
```bash
git gc [--aggressive] [--prune=<date>]
git maintenance start
```

### Examples
```bash
$ git gc
$ git count-objects -v
```

### Options
| Option | Meaning |
|---|---|
| `--prune=<date>` | Prune unreachable objects older than date (`now` is dangerous) |
| `--aggressive` | Slower, more thorough packing |

### Common mistakes
- Running `--prune=now` while trying to recover lost work.

### Learn more
[Chapter 71: References and Packfiles](#ch-refs-and-packfiles)

## git range-diff
category: Advanced
danger: safe
related: git rebase, git diff
purpose: Compare two versions of a series of commits, e.g. a branch before and after rebasing.

### Syntax
```bash
git range-diff <base> <old-tip> <new-tip>
git range-diff <old-range> <new-range>
```

### Examples
```bash
$ git range-diff main feature@{1} feature
```

### Options
| Option | Meaning |
|---|---|
| `--creation-factor` | Tune how commits are paired |

### Common mistakes
- Using plain diff between tips, which mixes in base changes.

### Learn more
[Chapter 31: Viewing and Comparing Commits](#ch-viewing-and-comparing-commits)

## git help
category: Setup
danger: safe
related: git config
purpose: Open Git's built-in manual for any command or topic.

### Syntax
```bash
git help <command>
git <command> --help
git <command> -h
```

### Examples
```bash
$ git commit -h
$ git help rebase
$ git help glossary
```

### Options
| Option | Meaning |
|---|---|
| `-h` | Short usage summary in the terminal |
| `--help` | Full manual page |
| `-a` | List all commands |

### Common mistakes
- Searching the web first when the manual answers it precisely.

### Learn more
[Chapter 3: Git's Vocabulary, Decoded](#ch-git-vocabulary)

## git filter-repo
category: Advanced
danger: high
related: git rebase, git push
purpose: (Separate tool) Rewrite entire repository history, for example to remove a file or secret from every commit.

### Syntax
```bash
git filter-repo --invert-paths --path <path>
git filter-repo --replace-text <expressions-file>
```

### Examples
```bash
$ git filter-repo --invert-paths --path .env
$ git filter-repo --replace-text secrets.txt
```

### Options
| Option | Meaning |
|---|---|
| `--path <p>` | Select paths |
| `--invert-paths` | Keep everything except the selected paths |
| `--replace-text <f>` | Replace strings everywhere |
| `--force` | Allow running outside a fresh clone |

### Common mistakes
- Rewriting before rotating a leaked secret.
- Not coordinating: everyone must re-clone afterwards.

### Learn more
[Chapter 73: Recovery: Wrong Files, Leaked Secrets and Pushed Mistakes](#ch-recovery-bad-commits)
