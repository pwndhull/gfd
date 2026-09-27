# Glossary

Each entry: "## Term", optional meta lines (chapter, see, aka), then a plain-English definition.

## --force-with-lease
chapter: git-push
see: Force push, Rejected push
aka: force-with-lease

A safer kind of force push. Git overwrites the remote branch **only if** it still points where your remote-tracking branch (such as `origin/feature`) says it does. If someone pushed in the meantime, the push is refused, so you can't silently erase their work. Pair it with `--force-if-includes` for extra protection.

## --no-ff
chapter: git-merge
see: Fast-forward, Merge commit
aka: no-ff

An option to `git merge` meaning "no fast-forward": always create a merge commit, even when Git could simply slide the branch forward. Teams use it to keep a visible record of each merged feature.

## .git
chapter: git-init
see: Repository, Object

The hidden folder at the top of a project where Git keeps everything: all commits, branches, tags, configuration and the staging area. Deleting it deletes the project's local history (but not your current files).

## .gitignore
chapter: gitignore
see: Ignored file, Untracked file

A committed file listing patterns of files Git should ignore, such as `node_modules/`, `*.log` or `.env`. It only affects **untracked** files; a file that's already tracked must be removed with `git rm --cached` first.

## .gitmodules
chapter: git-submodules
see: Submodule

A committed file that lists a repository's submodules: each one's folder path and the URL of the repository it comes from.

## @{u}
chapter: tracking-branches
see: Upstream, Tracking branch
aka: @{upstream}

Shorthand for "the upstream of the current branch", for example `origin/main`. `git log @{u}..` lists commits you'd push; `git log ..@{u}` lists commits you'd pull.

## Ahead / behind
chapter: tracking-branches
see: Upstream, Divergent branches

How your branch compares with its upstream: **ahead 2** means you have two commits the upstream lacks (to push); **behind 3** means the upstream has three you lack (to pull). Both at once means the branches have diverged.

## Alias
chapter: git-aliases

A shortcut you define for a Git command, such as `git st` for `git status -sb`. Created with `git config --global alias.st "status -sb"`.

## Amend
chapter: amending-commits
see: Rewriting history

Replacing the most recent commit with a corrected one using `git commit --amend`: fixing its message, adding a forgotten file or removing one. The result is a **new** commit with a new hash.

## Annotated tag
chapter: git-tags
see: Tag, Lightweight tag

A tag stored as a full object with the tagger's name, a date and a message (and optionally a signature). Created with `git tag -a v1.0.0 -m "…"`. Use annotated tags for releases.

## Approval
chapter: code-review
see: Code review, Required status check

A code review state on GitHub meaning "this is ready to merge". Branch protection can require a number of approvals before merging.

## Atomic commit
chapter: commit-messages
see: Commit hygiene

A commit that contains exactly one logical change: a single fix, feature step or refactor, with nothing unrelated mixed in. Atomic commits make review, reverting, bisecting and blame far more useful.

## Author
chapter: anatomy-of-a-commit
see: Committer

The person who originally wrote a change, recorded in each commit with their name, email and date. Usually the same as the committer.

## Autosquash
chapter: interactive-rebase
see: Fixup commit, Interactive rebase

An interactive-rebase option (`--autosquash`) that automatically moves `fixup!` and `squash!` commits next to the commits they fix and marks them for combining.

## Backport
chapter: cherry-pick
see: Cherry-pick, Release branch

Applying a fix to an older, still-supported version, typically by cherry-picking it onto a release branch.

## Bare repository
chapter: git-pull
see: Repository

A repository with no working directory: just the contents of `.git`. Servers store bare repositories because nobody edits files there directly. Created with `git init --bare`.

## Base branch
chapter: pull-requests
see: Head branch, Pull request

In a pull request, the branch the changes will be merged **into**, usually `main`.

## Bisect
chapter: git-bisect
see: Good / bad commit
aka: binary search, git bisect

A command that finds the commit that introduced a bug by binary search: you mark a known-good and a known-bad commit, and Git repeatedly checks out the midpoint for you to test, halving the suspects each time.

## Blame
chapter: blame-and-show
aka: annotate

A command (`git blame`) that shows, for each line of a file, the commit, author and date of its last change. Used to find context and the right person to ask, not to assign fault.

## Blob
chapter: git-internals
see: Tree, Object

The object type that stores the contents of one file: just the bytes, with no name or path. The name is stored in the tree that points to the blob.

## Branch
chapter: commits-branches-head
see: HEAD, Commit, Feature branch

A movable name that points at one commit. When you commit on a branch, it moves forward to the new commit. Creating a branch copies nothing, which is why branches are instant and cheap.

## Branching strategy
chapter: branching-strategies
see: Feature branch, Trunk-based development, GitFlow

A team's agreed rules for which branches exist, where new work happens, how it reaches `main` and how releases are made.

## Changelog
chapter: versioning-and-releases
see: Release, Semantic Versioning

A human-readable list of notable changes in each version, usually in `CHANGELOG.md`, grouped as added, changed, fixed and removed.

## Checkout
chapter: creating-and-switching-branches
see: Switch, Restore, Detached HEAD

The older, multi-purpose command `git checkout`. It switches branches, detaches HEAD at a commit, and overwrites files with versions from elsewhere. Git 2.23 split these jobs into `git switch` and `git restore`.

## Cherry-pick
chapter: cherry-pick
see: Backport, Duplicate commit

Copying the changes introduced by one existing commit onto the current branch as a new commit (`git cherry-pick <hash>`). The new commit has the same message and author but a different hash.

## CI
chapter: github-actions
see: GitHub Actions, Status check, Continuous delivery
aka: continuous integration

Continuous integration: automatically building and testing every change, typically on each push and pull request, so problems are found within minutes.

## Clean
chapter: undoing-working-changes
see: Untracked file
aka: git clean

`git clean` deletes untracked files from the working directory. It's destructive, so always preview with `git clean -n` first. `-d` includes folders; `-x` includes ignored files.

## Clone
chapter: git-clone
see: Remote, origin

To create a complete local copy of an existing repository, including all its history, with `git clone <url>`. Cloning also sets up the `origin` remote and a local default branch.

## Co-author
chapter: team-collaboration
see: Trailer

A second author credited on a commit using a `Co-authored-by: Name <email>` trailer at the end of the message. GitHub shows both people.

## Code review
chapter: code-review
see: Pull request, Review comment, Approval

Teammates reading and commenting on a change before it's merged, to catch problems, share knowledge and keep the codebase consistent.

## CODEOWNERS
chapter: branch-protection-and-codeowners
see: Code review, Protected branch

A file (often `.github/CODEOWNERS`) that maps paths to the people or teams responsible for them. GitHub automatically requests their review on pull requests touching those paths.

## Command Line Tools
chapter: installing-git

Apple's developer tools package for macOS, which includes Git. Installed with `xcode-select --install` or when you first type `git`.

## Commit
chapter: commits-branches-head
see: Snapshot, Parent commit, Commit hash

A recorded snapshot of the whole project, with an author, date, message and a link to its parent commit(s). Commits are permanent: "changing" one really creates a new commit.

## Commit graph
chapter: anatomy-of-a-commit
see: Commit history
aka: graph, DAG

The structure formed by commits pointing to their parents. Branches split it and merges rejoin it. `git log --graph` draws it as text.

## Commit hash
chapter: anatomy-of-a-commit
see: SHA
aka: commit ID, hash

The unique ID of a commit, a 40-character value computed from all of its content, such as `9fceb02d0ae598e95dc970b74767f19372d61af8`. Usually shortened to 7 characters.

## Commit history
chapter: git-log
see: Commit graph
aka: history

The chain of commits reachable from a starting point (usually HEAD), found by following parent links backwards. Viewed with `git log`.

## Commit hygiene
chapter: best-practices-commits-and-branches
see: Atomic commit, Commit message

The habits that keep commits focused, correct and understandable: reviewing staged changes, one logical change per commit, clear messages, no secrets or generated files.

## Commit message
chapter: commit-messages
see: Subject line, Imperative mood

The text stored with a commit: a short subject line, a blank line and an optional body explaining **why** the change was made.

## commit-msg hook
chapter: git-hooks
see: Hook
aka: commit-msg

A hook script that runs after you write a commit message and can reject it, for example to enforce Conventional Commits.

## Committer
chapter: anatomy-of-a-commit
see: Author

The person who created a commit object. Different from the author when someone applies another person's change, for example through cherry-pick or rebase.

## Conflict markers
chapter: merge-conflicts
see: Merge conflict, Ours / theirs

The lines `<<<<<<<`, `=======` and `>>>>>>>` (plus `|||||||` in diff3/zdiff3 style) that Git writes into a file to show the competing versions in a conflict. You must remove them when resolving.

## Content-addressable storage
chapter: git-internals
see: Object, SHA
aka: content-addressable

Storage where each item's key is computed from its content. Git stores objects this way: the same content always gets the same ID, and any change produces a different one.

## Continuous delivery
chapter: best-practices-ci-and-releases
see: CI, Release

Keeping the main branch always releasable, so any commit can be deployed on demand. Continuous **deployment** goes further and deploys every passing change automatically.

## Conventional Commits
chapter: commit-conventions
see: Commit message, Semantic Versioning
aka: commit conventions

A structured commit message format, `type(scope): description`, such as `fix(cart): round totals to cents`. It enables generated changelogs and automated version numbers.

## Credential manager
chapter: ssh-https-authentication
see: HTTPS remote, Personal access token
aka: credential helper

A program Git asks for login details. It signs you in (often through your browser) and stores the credential securely, so you don't type passwords for HTTPS remotes.

## Dangling object
chapter: git-reflog
see: Unreachable commit, Garbage collection
aka: dangling commit, dangling blob

An object nothing refers to, such as a dropped stash or content staged and then discarded. `git fsck --lost-found` can find them until garbage collection removes them.

## Decoration
chapter: git-log

The labels in parentheses in `git log` output, such as `(HEAD -> main, origin/main, tag: v1.0)`, showing which branches, tags and HEAD point at each commit.

## Default branch
chapter: configuring-git
see: main

The main branch of a repository: the one that clone checks out and pull requests target by default. Usually `main` (older repositories: `master`).

## Detached HEAD
chapter: detached-head
see: HEAD

A state where HEAD points directly at a commit instead of at a branch, for example after checking out a tag. It's safe for looking around; commits you make there belong to no branch until you create one.

## Diff
chapter: git-diff
see: Unified diff, Hunk, Patch

A description of the differences between two versions of text: which lines were removed (`-`) and added (`+`). Shown by `git diff`.

## Divergent branches
chapter: git-pull
see: Ahead / behind, Merge, Rebase

Two branches that each have commits the other doesn't. They must be combined with a merge or a rebase.

## Draft pull request
chapter: pull-requests
see: Pull request

A pull request marked as not ready for review. It lets CI run and invites early feedback, but can't be merged until marked ready.

## Duplicate commit
chapter: cherry-pick
see: Cherry-pick, Rebase

Two commits with the same change but different hashes, typically created by cherry-picking or rebasing. Git treats them as unrelated commits.

## Fast-forward
chapter: what-is-merging
see: Merge, --no-ff

Moving a branch forward to a later commit without creating a merge commit, possible when the branch has no commits of its own since the other branch split off.

## Feature branch
chapter: feature-branch-workflow
see: Branch, Pull request

A short-lived branch created for one task, merged back (usually through a pull request) and then deleted.

## Feature flag
chapter: branching-strategies
see: Trunk-based development

A runtime switch that turns a feature on or off without deploying new code. Lets teams merge unfinished work safely and release it when ready.

## Fetch
chapter: git-fetch
see: Pull, Remote-tracking branch

Downloading new commits from a remote and updating remote-tracking branches like `origin/main`, **without** changing your own branches or files.

## First parent
chapter: anatomy-of-a-commit
see: Merge commit, Parent commit

For a merge commit, the parent that was the branch you were on when you merged. `git log --first-parent` follows only these, giving the main line of history.

## Fixup commit
chapter: interactive-rebase
see: Autosquash, Squash
aka: fixup

A commit made with `git commit --fixup <hash>`, marked to be folded into an earlier commit during an interactive rebase with `--autosquash`. Also the `fixup` rebase action, which combines a commit into the previous one and discards its message.

## Force push
chapter: git-push
see: --force-with-lease, Rewriting history

A push that replaces the remote branch's history even when the result isn't a fast-forward, discarding commits only the server had. Never do it on shared branches.

## Fork
chapter: git-remote
see: upstream (remote), Clone

A copy of a repository under your own account on a hosting service. Used to contribute to projects you can't push to: push to your fork, then open a pull request.

## Garbage collection
chapter: refs-and-packfiles
see: Reflog, Dangling object

Git's housekeeping (`git gc`), which packs objects and eventually deletes old unreachable ones after their reflog entries have expired.

## Git
chapter: what-is-git
see: GitHub, Version control

A free, distributed version control program that runs on your computer and records the history of a project.

## Git Bash
chapter: installing-git
see: Terminal

A Unix-style terminal installed with Git for Windows, so you can use the same commands as on macOS and Linux.

## git config
chapter: configuring-git
see: Global config, Local config
aka: config

The command for reading and writing Git settings at system, global (personal) and local (repository) levels.

## Git LFS
chapter: best-practices-commits-and-branches

Git Large File Storage: an extension that stores large binary files (videos, datasets, design files) outside the normal object database, keeping repositories fast.

## GitFlow
chapter: branching-strategies
see: Release branch, Branching strategy

A branching strategy with long-lived `main` and `develop` branches plus feature, release and hotfix branches. Suited to scheduled, versioned releases.

## GitHub
chapter: what-is-git
see: Git, Pull request

A website that hosts Git repositories and adds collaboration features: pull requests, code review, issues, permissions and automation.

## GitHub Actions
chapter: github-actions
see: CI, Workflow (GitHub Actions)

GitHub's automation platform. Workflows defined in `.github/workflows/` run jobs such as tests and deployments when events like pushes or pull requests happen.

## GitHub Release
chapter: versioning-and-releases
see: Release, Tag

A GitHub page attached to a tag, with release notes and optional downloadable files. It's a GitHub feature layered on top of Git tags.

## Gitlink
chapter: git-submodules
see: Submodule

The special tree entry (mode `160000`) where a parent repository records the exact commit of a submodule.

## Global config
chapter: configuring-git
see: git config, Local config

Your personal Git settings in `~/.gitconfig`, applied in every repository unless a repository's local config overrides them.

## Good / bad commit
chapter: git-bisect
see: Bisect
aka: good commit, bad commit

In `git bisect`, a good commit doesn't have the bug and a bad commit does. Bisect searches between them for the first bad commit.

## HEAD
chapter: commits-branches-head
see: Detached HEAD, Branch, Symbolic reference

Git's pointer to where you are. Normally it points at the current branch, which points at a commit. When you commit, the branch HEAD points to moves forward.

## HEAD@{n}
chapter: git-reflog
see: Reflog

Where HEAD was n moves ago, according to the reflog. `HEAD@{1}` is your previous position; used to undo resets, rebases and amends.

## HEAD^
chapter: anatomy-of-a-commit
see: HEAD~1, Parent commit
aka: HEAD^1, caret

The first parent of HEAD. `HEAD^2` means the **second** parent, which only exists for merge commits. For ordinary commits, `HEAD^` and `HEAD~1` are the same.

## HEAD~1
chapter: anatomy-of-a-commit
see: HEAD^, Parent commit
aka: HEAD~, tilde

The commit one generation before HEAD. `HEAD~3` means three generations back, always following first parents.

## Head branch
chapter: pull-requests
see: Base branch
aka: compare branch

In a pull request, the branch containing the proposed changes, the one being merged **from**.

## Hard reset
chapter: git-reset
see: Reset, Soft reset, Mixed reset

`git reset --hard`: moves the current branch **and** resets the staging area and working directory to match the target. Uncommitted changes to tracked files are lost; committed work stays recoverable through the reflog.

## Hook
chapter: git-hooks
see: pre-commit hook, commit-msg hook, pre-push hook
aka: commit hook, git hooks

A script Git runs automatically at a specific moment, such as before a commit or push. Pre-hooks can cancel the operation by exiting with an error.

## Hotfix
chapter: best-practices-ci-and-releases
see: Release branch

An urgent fix to released software, usually made on a branch from the released version's tag and then brought back to `main`.

## HTTPS remote
chapter: ssh-https-authentication
see: SSH remote, Credential manager
aka: HTTPS

A remote URL starting with `https://`, authenticated through a credential manager or personal access token.

## Hunk
chapter: git-add
see: Diff

A block of nearby changed lines in a diff, starting with an `@@` header. `git add -p` lets you stage changes hunk by hunk.

## Ignored file
chapter: gitignore
see: .gitignore

A file matching a pattern in `.gitignore` (or another ignore file). Git doesn't show it as untracked and won't add it unless forced.

## Imperative mood
chapter: commit-messages
see: Subject line

Writing commit subjects as commands, such as "Fix login bug" rather than "Fixed…". Test: "If applied, this commit will ___".

## Incoming / outgoing commits
chapter: git-fetch
see: Ahead / behind
aka: incoming commits, outgoing commits

Incoming commits are on the upstream but not your branch (`git log ..@{u}`); outgoing commits are on your branch but not the upstream (`git log @{u}..`).

## Index
chapter: git-mental-model
see: Staging area

Git's official name for the staging area: a file (`.git/index`) listing exactly what the next commit will contain.

## Interactive rebase
chapter: interactive-rebase
see: Rebase, Squash, Fixup commit, Todo list (rebase)

`git rebase -i`: a rebase where you edit a list of commits to reorder, squash, reword, edit or drop them before they're replayed. Used to tidy history before sharing.

## Issue
chapter: issues-and-github-releases

A tracked bug report, feature request or task on GitHub, with a number, labels, assignees and discussion.

## Job
chapter: github-actions
see: Step, Runner

In GitHub Actions, a set of steps that runs on one runner machine as part of a workflow.

## Label
chapter: issues-and-github-releases

A category tag on GitHub issues and pull requests, such as `bug` or `payments`.

## Lightweight tag
chapter: git-tags
see: Tag, Annotated tag

A tag that is only a name pointing at a commit, with no extra information. Fine for private bookmarks; use annotated tags for releases.

## Line endings
chapter: configuring-git

The invisible characters at the end of each line of text: CR LF on Windows, LF on macOS and Linux. Git's `core.autocrlf` and `.gitattributes` keep them consistent.

## Linear history
chapter: merge-vs-rebase
see: Rebase, Merge commit

A history with no merge commits: a single straight line of commits, usually produced by rebasing or squash merging.

## Local config
chapter: configuring-git
see: git config, Global config

Settings stored in one repository's `.git/config`, overriding your global settings for that repository.

## Local repository
chapter: what-is-git
see: Remote

The copy of a project and its history on your own computer. Commits are made here and shared with a remote by pushing.

## Long-running branch
chapter: keeping-branches-updated
see: Feature flag

A branch that lives for weeks or months. It drifts from `main` and gets harder to merge unless main is integrated into it regularly.

## main
chapter: why-branches
see: Default branch

The conventional name of a repository's default branch. It has no special powers in Git; teams treat it as the stable, shared line of work.

## Merge
chapter: what-is-merging
see: Fast-forward, Three-way merge, Merge commit

Combining another branch's work into the current branch with `git merge`, either by fast-forwarding or by creating a merge commit.

## Merge base
chapter: viewing-and-comparing-commits
see: Three-way merge

The most recent commit two branches have in common. Git compares both sides against it during a three-way merge. Found with `git merge-base`.

## Merge commit
chapter: what-is-merging
see: First parent, Merge

A commit with two (or more) parents that records the combination of two lines of history.

## Merge conflict
chapter: merge-conflicts
see: Conflict markers, Unmerged path

A situation where both sides of a merge (or rebase or cherry-pick) changed the same lines differently, so Git asks you to decide the final content.

## Merge queue
chapter: pull-requests
see: Required status check

A GitHub feature that tests pull requests combined with the ones ahead of them before merging, so `main` never breaks from two PRs that were fine individually.

## Merge request
see: Pull request

GitLab's name for a pull request.

## Merged branch
chapter: managing-branches

A branch whose commits are all reachable from the current branch, so deleting it loses nothing. Listed by `git branch --merged`.

## Milestone
chapter: issues-and-github-releases

A GitHub grouping of issues and pull requests that target a release or deadline.

## Mixed reset
chapter: git-reset
see: Reset, Soft reset, Hard reset

The default mode of `git reset`: moves the current branch and resets the staging area, leaving your working files unchanged (so undone changes become unstaged edits).

## Modified
chapter: git-status
see: Tracked file, Staging area

A tracked file whose contents differ from its last staged or committed version.

## Monorepo
chapter: git-submodules

A single repository that holds several projects or packages, as an alternative to linking separate repositories with submodules.

## Object
chapter: git-internals
see: Blob, Tree, Commit, Content-addressable storage
aka: objects

A unit of data in Git's database, identified by the hash of its content. There are four types: blob, tree, commit and annotated tag.

## ORIG_HEAD
chapter: git-merge
see: Reset

A reference Git sets to your branch's previous position before a reset, merge or rebase. `git reset --hard ORIG_HEAD` undoes the last one.

## Organisation
chapter: github-fundamentals
aka: organization

A shared GitHub account that owns repositories for a company or project, with teams and permissions for its members.

## origin
chapter: remotes-and-origin
see: Remote, Clone

The conventional name of the remote you cloned from. It's just a name for a URL, not a branch.

## origin/main
chapter: tracking-branches
see: Remote-tracking branch

Your repository's record of where `main` was on the `origin` remote the last time you fetched, pulled or pushed. It's local and read-only, and doesn't update by itself.

## Ours / theirs
chapter: merge-conflicts
see: Merge conflict
aka: ours, theirs

In a merge conflict, **ours** is the branch you're on (HEAD) and **theirs** is the branch being merged. During a rebase the roles are swapped: ours is the new base and theirs is your commit.

## Packfile
chapter: refs-and-packfiles
see: Object, Garbage collection

A file that stores many Git objects together with delta compression, keeping repositories small. Also what fetch and push transfer.

## Pager
chapter: git-log

The scrolling viewer (usually `less`) Git uses for long output. Press `q` to quit, space to page down, `/` to search.

## Parent commit
chapter: anatomy-of-a-commit
see: First parent, Root commit, HEAD~1

The commit a commit was built on. Normal commits have one parent, merge commits two, and the root commit none.

## Patch
chapter: git-add
see: Diff, Hunk

A set of changes in diff form. "Patch mode" (`-p`) lets commands like `add`, `restore` and `stash` work on selected hunks.

## PATH
chapter: installing-git

The list of folders your system searches when you type a command name. If Git isn't on your PATH, the terminal can't find `git`.

## Pattern (ignore pattern)
chapter: gitignore
aka: pattern

A rule in `.gitignore` such as `*.log`, `build/` or `!keep.log` that matches files to ignore or re-include.

## Personal access token
chapter: ssh-https-authentication
see: Credential manager
aka: PAT, token

A revocable, scoped password substitute for authenticating Git over HTTPS or GitHub's API. Treat it like a password.

## Pickaxe
chapter: advanced-log

The `git log -S` and `-G` options that search commit changes for text, finding when something was added or removed.

## Plumbing / porcelain
chapter: git-internals
aka: plumbing, porcelain

Git's two layers of commands: **porcelain** commands for people (`commit`, `switch`) and low-level **plumbing** commands for scripts (`cat-file`, `update-ref`).

## pre-commit hook
chapter: git-hooks
see: Hook
aka: pre-commit

A hook that runs before a commit is created, typically running formatters, linters or secret scanners on staged files. It can cancel the commit.

## pre-push hook
chapter: git-hooks
see: Hook
aka: pre-push

A hook that runs before `git push` sends anything, often used to run tests. It can cancel the push.

## Protected branch
chapter: branch-protection-and-codeowners
see: Ruleset, Required status check

A server branch with rules such as "changes only through reviewed pull requests" and "no force pushes". Direct pushes are rejected.

## Prune
chapter: git-fetch
see: Remote-tracking branch

Removing remote-tracking branches whose branches no longer exist on the server, with `git fetch --prune`.

## Pull
chapter: git-pull
see: Fetch, Merge, Rebase

`git pull`: fetch from the upstream, then integrate it into the current branch by merging or rebasing.

## pull --rebase
chapter: git-pull
see: Pull, Rebase

A pull that integrates by replaying your local commits on top of the fetched ones, avoiding a merge commit.

## Pull request
chapter: pull-requests
see: Code review, Base branch, Head branch
aka: PR

A GitHub proposal to merge one branch into another, with a page for the diff, discussion, reviews and automated checks.

## Push
chapter: git-push
see: Rejected push, Force push

Uploading your commits to a remote and moving the remote branch to match, with `git push`.

## Reachable
chapter: why-branches
see: Unreachable commit

A commit is reachable from a branch (or tag or HEAD) if you can get to it by following parent links from that branch's commit. `git log` shows reachable commits.

## Rebase
chapter: what-is-rebase
see: Interactive rebase, Merge, Rewriting history

Replaying your branch's commits on top of another commit, creating new commits with new hashes and a linear history. Don't rebase commits others have based work on.

## Ref
chapter: refs-and-packfiles
see: Symbolic reference, Branch, Tag
aka: refs, reference

A name that points to an object ID, such as a branch (`refs/heads/main`), tag (`refs/tags/v1.0`) or remote-tracking branch (`refs/remotes/origin/main`).

## Reflog
chapter: git-reflog
see: HEAD@{n}, Unreachable commit

A local log of where HEAD and each branch have pointed over time. The main tool for recovering commits after resets, rebases and deleted branches.

## Refspec
chapter: git-remote

A rule mapping remote references to local ones, such as `+refs/heads/*:refs/remotes/origin/*`, which is why server branches appear as `origin/<name>`.

## Rejected push
chapter: git-push
see: Push, Fetch

A push the server refused, usually because the remote has commits you don't (not a fast-forward) or a protection rule forbids it. Nothing is changed.

## Release
chapter: versioning-and-releases
see: Tag, Semantic Versioning, GitHub Release

A version of the software made available to users, identified in Git by a tag on the exact commit that was built.

## Release branch
chapter: versioning-and-releases
see: Hotfix, Backport

A branch used to stabilise and patch a released version while `main` continues toward the next one.

## Remote
chapter: remotes-and-origin
see: origin, Fetch, Push

A named URL for another copy of the repository, usually on a server. Git contacts it only when you clone, fetch, pull or push.

## Remote branch
chapter: tracking-branches
see: Remote-tracking branch

A branch as it exists on the server. Your repository records its last known position in a remote-tracking branch.

## Remote-tracking branch
chapter: tracking-branches
see: origin/main, Fetch

A local, read-only reference like `origin/main` that records where a server branch was at your last fetch, pull or push.

## Repository
chapter: what-is-git
see: .git, Local repository, Remote
aka: repo

A project tracked by Git, including all of its history, stored in the `.git` folder.

## Required status check
chapter: branch-protection-and-codeowners
see: Status check, Protected branch

A CI check that must pass before a pull request can be merged, enforced by branch protection or rulesets.

## rerere
chapter: resolving-conflicts
see: Merge conflict

"Reuse recorded resolution": when enabled, Git remembers how you resolved a conflict and reapplies it automatically if the same conflict appears again.

## Reset
chapter: git-reset
see: Soft reset, Mixed reset, Hard reset

`git reset` moves the current branch to another commit and, depending on the mode, also resets the staging area and working directory.

## Restore
chapter: undoing-working-changes
see: Unstage

`git restore` copies file versions into the working directory or (with `--staged`) the staging area. Used to discard edits or unstage files.

## Revert
chapter: git-revert
see: Reset

`git revert` creates a new commit that undoes an earlier commit's changes, without rewriting history. The safe way to undo pushed commits.

## Review comment
chapter: code-review
see: Code review, Suggested change

Feedback attached to specific lines of a pull request.

## Reword
chapter: interactive-rebase
see: Interactive rebase

The interactive-rebase action that keeps a commit's changes but lets you edit its message.

## Revision range
chapter: viewing-and-comparing-commits
see: Merge base
aka: range

A way to name a set of commits: `A..B` (commits in B but not A), `A...B` (in either but not both), or `^A B`. Used by `git log`, `cherry-pick` and more.

## Rewriting history
chapter: anatomy-of-a-commit
see: Amend, Rebase, Force push

Replacing existing commits with new ones (via amend, rebase, reset or filter-repo). Harmless for commits only you have; disruptive for shared ones.

## Root commit
chapter: git-commit
see: Parent commit

The first commit in a repository. It has no parent.

## Ruleset
chapter: branch-protection-and-codeowners
see: Protected branch

A GitHub set of rules targeting branches or tags, such as requiring pull requests, blocking force pushes or protecting release tags.

## Runner
chapter: github-actions
see: Job

The machine (hosted by GitHub or self-hosted) that executes a GitHub Actions job.

## Secret
chapter: best-practices-safety
see: Personal access token

A credential such as a password, API key or token. Secrets must never be committed; if one is, rotate it immediately.

## Semantic Versioning
chapter: versioning-and-releases
see: Release, Conventional Commits
aka: SemVer, semantic versioning

The MAJOR.MINOR.PATCH version scheme: increase MAJOR for incompatible changes, MINOR for compatible features, PATCH for fixes.

## SHA
chapter: anatomy-of-a-commit
see: Commit hash, Content-addressable storage

The hash algorithm Git uses to compute object IDs (SHA-1 by default, SHA-256 optionally). People also say "SHA" to mean a commit's hash.

## Shallow clone
chapter: git-clone
see: Clone

A clone with limited history, made with `--depth`, used when you don't need the full history (for example in CI).

## Shared branch
chapter: team-collaboration
see: Rewriting history

A branch several people push to. Don't rewrite its history; integrate with `git pull --rebase` for your own unpushed commits and merge otherwise.

## Signed commit
chapter: best-practices-safety

A commit with a cryptographic signature proving who created it. GitHub marks verified signatures, and branch protection can require them.

## Small changes
chapter: best-practices-commits-and-branches
see: Atomic commit, Stacked pull requests

The practice of keeping commits and pull requests small and focused, which makes them easier to review, test, merge and revert.

## Snapshot
chapter: git-commit
see: Commit, Tree

A complete record of every tracked file at one moment. Each commit stores a snapshot; unchanged files are shared between snapshots rather than copied.

## Soft reset
chapter: git-reset
see: Reset, Mixed reset

`git reset --soft`: moves the current branch only, leaving the undone commits' changes staged.

## Squash
chapter: interactive-rebase
see: Fixup commit, Squash merge

Combining several commits into one. In interactive rebase, `squash` melds a commit into the previous one and lets you edit the combined message.

## Squash merge
chapter: git-merge
see: Squash

Merging a branch by combining all its changes into one new ordinary commit on the target branch (`git merge --squash`, or GitHub's "Squash and merge").

## SSH key
chapter: ssh-https-authentication
see: SSH remote

A key pair used to authenticate over SSH: a private key kept secret on your computer and a public key given to GitHub.

## SSH remote
chapter: ssh-https-authentication
see: HTTPS remote, SSH key
aka: SSH

A remote URL such as `git@github.com:acme/shop.git`, authenticated with an SSH key.

## Stacked pull requests
chapter: pr-and-review-workflow
see: Small changes

A chain of pull requests where each is based on the previous one's branch, letting large work be reviewed in small pieces.

## Staging area
chapter: git-mental-model
see: Index, Working directory
aka: staged, stage

The place where you assemble exactly what your next commit will contain, using `git add`. Also called the index.

## Start point
chapter: creating-and-switching-branches

The commit a new branch will point at when created, such as `origin/main` in `git switch -c fix origin/main`.

## Stash
chapter: git-stash
see: Stash stack

A saved set of uncommitted changes, put aside with `git stash` and brought back with `git stash pop` or `apply`.

## Stash stack
chapter: git-stash
see: Stash
aka: stash@{n}

The list of saved stashes, newest first as `stash@{0}`. Shown by `git stash list`.

## Status check
chapter: github-actions
see: Required status check, CI

A pass or fail result shown on a commit or pull request, typically from a CI job.

## Step
chapter: github-actions
see: Job

A single command or action within a GitHub Actions job.

## Subject line
chapter: commit-messages
see: Commit message

The first line of a commit message: a short, imperative summary shown in one-line views.

## Submodule
chapter: git-submodules
see: .gitmodules, Gitlink

Another Git repository embedded inside a parent repository at a specific commit.

## Suggested change
chapter: code-review
see: Review comment

A review comment containing replacement code that the pull request author can commit with one click.

## Switch
chapter: creating-and-switching-branches
see: Checkout

`git switch <branch>` moves HEAD to another branch and updates your files to match. `git switch -c <name>` creates the branch first.

## Symbolic reference
chapter: refs-and-packfiles
see: HEAD, Ref

A reference that points to another reference rather than to an object. HEAD is normally symbolic: it contains `ref: refs/heads/main`.

## Tag
chapter: git-tags
see: Annotated tag, Lightweight tag, Release

A fixed name for one commit that never moves, typically marking a release such as `v2.4.0`.

## Terminal
chapter: installing-git
see: Git Bash

A text window where you type commands. Also called a shell or command line.

## Three-way merge
chapter: what-is-merging
see: Merge base, Merge commit

A merge that compares both branch tips with their merge base to combine changes, creating a merge commit.

## Todo list (rebase)
chapter: interactive-rebase
see: Interactive rebase
aka: todo list

The editable list of commits and actions that an interactive rebase executes from top (oldest) to bottom.

## Tracked file
chapter: git-mental-model
see: Untracked file

A file Git knows about because it was in the last commit or has been staged. Git watches it for changes.

## Tracking branch
chapter: tracking-branches
see: Upstream, Remote-tracking branch

A local branch configured with an upstream, so plain `git pull`, `git push` and ahead/behind counts know which remote branch to use.

## Trailer
chapter: commit-conventions
see: Co-author

A structured `Key: value` line at the end of a commit message, such as `Co-authored-by:` or `Signed-off-by:`.

## Tree
chapter: git-internals
see: Blob, Commit

The object type that records a folder: names, modes and the IDs of the blobs (files) and trees (sub-folders) it contains.

## Trunk-based development
chapter: branching-strategies
see: Feature flag, Branching strategy

A strategy where everyone integrates into one main branch at least daily through tiny branches, using feature flags for unfinished work.

## Two-factor authentication
chapter: ssh-https-authentication
aka: 2FA

A login that needs a second proof of identity (an authenticator app, passkey or security key) as well as your password. GitHub requires it for contributors.

## Unified diff
chapter: git-diff
see: Diff, Hunk

The standard diff format with `---` / `+++` file headers, `@@` hunk headers and lines starting with `-`, `+` or a space.

## Unmerged path
chapter: merge-conflicts
see: Merge conflict

A file with an unresolved conflict, listed under "Unmerged paths" in `git status`.

## Unreachable commit
chapter: git-reflog
see: Reflog, Dangling object, Reachable

A commit no branch, tag or HEAD can reach, for example after a reset or rebase. It remains recoverable through the reflog until garbage collection.

## Unstage
chapter: undoing-working-changes
see: Staging area, Restore

Removing a change from the staging area while keeping it in your working directory, with `git restore --staged <file>`.

## Untracked file
chapter: git-status
see: Tracked file, .gitignore

A file in your folder that Git has never been told to track. It won't be committed until you `git add` it.

## Upstream
chapter: tracking-branches
see: Tracking branch, @{u}

The remote branch a local branch is linked to, such as `origin/main` for `main`. Used by plain `git pull`, `git push` and status messages.

## upstream (remote)
chapter: git-remote
see: Fork, origin

The conventional name for the original repository when you work from a fork, alongside `origin` for your fork.

## user.name / user.email
chapter: configuring-git
see: Author
aka: user.name, user.email

The settings that identify you as the author of commits. Set them once with `git config --global`.

## Version control
chapter: what-is-version-control
see: Git

A system that records changes to a set of files over time, so you can see who changed what, when and why, and recover earlier versions.

## WIP commit
chapter: team-collaboration
see: Stash

A temporary "work in progress" commit used to park unfinished work, later amended, squashed or reset.

## Workflow (GitHub Actions)
chapter: github-actions
see: GitHub Actions, Job
aka: workflow

A YAML file in `.github/workflows/` that defines which events trigger automation and which jobs run.

## Working directory
chapter: git-mental-model
see: Staging area, Working tree

The folder of real files you see and edit. Git compares it with the staging area to find unstaged changes.

## Working tree
chapter: git-mental-model
see: Working directory

Another name for the working directory: the checked-out files of a repository.

## Working tree clean
chapter: git-status

The `git status` message meaning there's nothing to stage or commit: your files, staging area and last commit all agree.

## Worktree
chapter: git-worktree
see: Working directory

An additional working directory attached to the same repository with a different branch checked out, created with `git worktree add`.
