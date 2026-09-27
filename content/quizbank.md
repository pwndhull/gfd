---
title: Quiz bank extra practice
lede: "More practice questions, beyond the ones built into each chapter."
---
Extra questions for the quiz bank's "Extra practice" filter, organized loosely by topic so you can drill a weak spot.

## Foundations and setup

```quiz
? [predict] What does `git init` print in a folder that has no existing repository?
+ Initialized empty Git repository in <path>/.git/
- Repository created successfully on GitHub
- Nothing, it runs silently
- A list of files that will be tracked
> `init` creates the `.git` folder and confirms where; it doesn't touch your existing files or start tracking anything automatically.

? [tf] `git config user.email` (without --global or --local) reads whichever value currently applies in the current repository, respecting the local-over-global precedence.
+ True
- False
> Reading a config key without a scope flag returns the effective value after all scopes are merged, same as most settings resolve when Git actually uses them.

? [troubleshoot] Every commit you make shows the wrong name, even though you're sure you ran `git config --global user.name` correctly. What should you check?
+ Whether this specific repository has a conflicting user.name set locally, which would override the global value
- Whether your computer's clock is correct
- Whether you have administrator rights
- Whether Git needs to be reinstalled
> Local config always wins over global; a stale local override is the classic cause of "I set it globally but it's still wrong here."

? What's the practical benefit of SSH authentication over HTTPS with a personal access token, day to day?
+ Once your key is set up, you're never prompted for credentials again, and the key isn't a bearer secret that leaks the same way a pasted token can
- SSH is required to view public repositories
- HTTPS cannot clone private repositories at all
- SSH automatically encrypts the file contents differently on disk
> Both are secure transports; the practical difference is mostly about credential handling convenience and how the secret is stored and revoked.
```

## The daily loop

```quiz
? [predict] What does `git status -sb` add to plain `git status`?
+ A compact one-line-per-file format, plus the current branch and its ahead/behind count relative to its upstream
- A list of every commit ever made
- Nothing; -sb is not a real option
- A count of how many collaborators are online
> The short format trades the verbose explanations for density, which is exactly what you want once you already know what the symbols mean.

? [tf] `git add -p` lets you stage individual hunks within a file rather than the whole file at once.
+ True
- False
> The patch mode walks through each hunk and asks whether to stage it, split it further, or skip it — useful when one file has two unrelated changes mixed together.

? [scenario] You want to stage every change to files Git is already tracking, but not any brand-new untracked files. Which command?
+ git add -u
- git add -A
- git add .
- git add --all
> `-u` ("update") limits staging to files Git already knows about; `-A` and `.` (in modern Git) also pick up new, untracked files.

? [predict] What does `git log -- path/to/file.js` show, compared to plain `git log`?
+ Only commits that actually touched that file or path
- Every commit, with the file's diff appended
- An error, since -- requires two arguments
- Only the most recent commit
> The `--` separates paths from revision arguments and filters history down to commits that changed something under that path.

? [state] A file is staged (added) and then deleted from disk without using `git rm`. What does `git status` show?
+ The file shown as both "staged" (from the add) in one section, and "deleted" in the unstaged changes section, since the index and working tree now disagree
- Nothing; Git doesn't notice files deleted outside its own commands
- An error requiring git fsck
- The file disappears from status entirely
> Git compares three states — HEAD, the index, and the working directory — independently, so a file can genuinely show up in more than one status section at once.
```

## Remotes, fetch, pull, push

```quiz
? [predict] What does `git remote -v` show?
+ Each configured remote's name and URL, for both fetch and push
- The commit history from every remote
- Only the default remote, named origin
- A live connection status to each remote
> It's purely a listing of what's configured locally; it doesn't contact the network at all.

? [scenario] You cloned a repository, and a teammate later renamed the GitHub repo. What command updates where your `origin` points?
+ git remote set-url origin <new-url>
- git clone the new URL over the old folder
- git remote rename origin
- Nothing; Git updates it automatically
> `set-url` is the direct way to repoint an existing remote name without re-cloning or losing your local branches and stashes.

? [tf] `git fetch --prune` will also delete local branches that track a since-deleted remote branch.
- True
+ False
> `--prune` removes the stale remote-tracking branches (origin/*) themselves, but leaves your own local branches alone even if they were tracking one that's gone.

? [predict] What does `git log --oneline @{u}..` show?
+ Commits on your current branch that exist locally but haven't been pushed to its upstream yet
- Commits on the upstream that you haven't pulled yet
- Every commit in the repository
- An error, since @{u} isn't valid syntax
> `@{u}` refers to the current branch's upstream; `@{u}..` (upstream to HEAD) is exactly "what would git push send."

? [troubleshoot] `git push` reports "fatal: The current branch feature has no upstream branch." What fixes it, and why did it happen?
+ git push -u origin feature — it happens the first time you push a newly created local branch, since there's nothing on the remote for it to track yet
- Reinstall Git
- Switch to main and push from there instead
- Delete the branch and start over
> This is expected and harmless the first time; -u links the branch so every later plain push/pull on it just works.
```

## Branch and commit habits

```quiz
? [scenario] You want to rename your current branch from `login-fix` to `feature/login-fix` without losing any history.
+ git branch -m feature/login-fix
- You must delete the branch and recreate it with the new name
- git switch --detach then re-create
- Renaming a branch always requires force-pushing first
> `-m` (move/rename) just relabels the pointer; every commit on the branch is completely untouched.

? [tf] Two different branches can point at the exact same commit at the same time.
+ True
- False
> Nothing prevents it — branches are independent labels, and it's completely normal right after creating a new branch before any new commits land on either.

? [predict] What does `git log --grep="fix:"` search?
+ Commit messages, for ones containing the text "fix:"
- File contents in every commit's snapshot
- Branch names
- Author names only
> `--grep` filters by message content; `-S`/`-G` are the ones that search the actual code changes instead.

? [scenario] You want to see which branches have already been fully merged into main, so you know which are safe to delete.
+ git branch --merged main
- git branch --all
- git log --graph --all
- git branch -d (it will tell you if you try)
> `--merged` filters the branch list down to exactly the ones whose tip is an ancestor of the branch you named — the safe-to-delete set.

? [predict] What does `git shortlog -sn` summarize?
+ A count of commits per author, sorted by count, across the current branch's history
- The shortest commit messages in the repository
- A truncated log of just the last few commits
- File sizes by author
> It's a quick "who's been committing here" report, handy for spotting whether history is dominated by one author or evenly spread.
```

## Merge and rebase

```quiz
? [state] main is at commit C. feature was branched from C and has commits D and E. No new commits landed on main. You run `git merge feature` from main. What happens?
+ Fast-forward: main simply moves to point at E, with no new merge commit created
- A merge commit is always created regardless
- The merge fails since feature is ahead
- main and feature swap positions
> Fast-forward is exactly this case: since main hasn't moved, "merging" is just catching main up to where feature already is.

? [tf] `git merge --no-ff` forces a merge commit to be created even when a fast-forward would otherwise be possible.
+ True
- False
> Some teams use `--no-ff` on purpose, specifically to preserve a visible marker in history that a feature branch existed and was merged, even for simple cases.

? [scenario] Midway through resolving a merge conflict, you decide it's too messy and want to start over from before the merge began.
+ git merge --abort
- git reset --hard HEAD~1
- Delete the .git folder
- git commit --amend
> `--abort` is built exactly for this: it cleanly restores the pre-merge state, which a manual reset could easily get wrong mid-conflict.

? [predict] During an interactive rebase, what does changing `pick` to `drop` (or deleting the line entirely) do to that commit?
+ It is omitted from the replayed history entirely, as if it never happened
- It is squashed into the next commit
- It is skipped only if it would conflict
- It marks the commit for later cherry-picking
> Interactive rebase's todo list is literally the plan for what to replay; removing an entry means that change never gets reapplied.

? [scenario] You rebase feature onto main, and afterward realize you rebased onto the wrong commit entirely. You haven't pushed yet. How do you get back to where you started?
+ git reflog to find feature's pre-rebase tip, then git reset --hard to that hash (or git rebase --abort, if the rebase is still in progress)
- There is no way back once a rebase completes
- git revert the rebase
- Delete the branch and re-clone
> Rebase, like everything else that moves branch pointers, is fully recoverable via reflog as long as you catch it before garbage collection.
```

## Undo, stash, tags

```quiz
? [predict] What does `git restore <file>` (no --staged) do?
+ Discards unstaged changes to that file, replacing it with the version from the index (or HEAD if unstaged)
- Unstages the file without touching its content
- Deletes the file
- Restores a file that was deleted in a previous commit, by filename search
> Plain `restore` targets your working directory changes; `--staged` is the one that only touches the index, leaving working-directory edits alone.

? [tf] `git clean -n` will delete untracked files, same as `-f`, but silently.
- True
+ False
> `-n` (dry run) only previews what would be deleted; nothing is actually removed until you add `-f` (force).

? [scenario] You want to grab just one file's content as it existed in a specific old commit, without checking out that whole commit.
+ git restore --source=<commit> <file>
- git checkout <commit> (the whole repository)
- git revert <commit> -- <file>
- git stash show <commit>
> `--source` lets `restore` pull a file's content from anywhere in history into your current working directory, one file at a time.

? [predict] What's recorded in `git tag -a v2.0.0 -m "message"` that a plain `git tag v2.0.0` would not record?
+ A tagger name/email, a timestamp, and the message, since the annotated form creates a real tag object
- The commit hash, which only annotated tags store
- Nothing observable; -a is purely cosmetic
- The list of files changed since the last tag
> A lightweight tag really is just a name-to-commit pointer with no object of its own; annotated tags exist specifically to carry that extra metadata.

? [scenario] You have three stashes and want to see the diff in the middle one without applying it.
+ git stash show -p stash@{1}
- git stash pop stash@{1}, then undo
- git stash list --diff
- You must apply it to see the diff
> `stash show -p` inspects a stash's contents without touching your working directory or the stash list at all.
```

## GitHub and team process

```quiz
? [predict] What's the difference between "Merge," "Squash and merge," and "Rebase and merge" as GitHub's three merge button options?
+ Merge creates a merge commit preserving all individual commits; Squash and merge combines everything into one commit on the target branch; Rebase and merge replays the PR's commits individually on top of the target with new hashes, no merge commit
- They all produce identical history; the names are just cosmetic
- Squash and merge deletes the pull request's record
- Rebase and merge requires the author to rebase manually first
> Same underlying Git operations as the rest of the book, just triggered from a button — worth knowing which one your team has picked and why.

? [tf] Draft pull requests can still run CI checks before being marked "Ready for review."
+ True
- False
> Drafts are a signalling and (optionally) review-gating feature; CI typically still runs so the author gets feedback before formally requesting review.

? [scenario] Your organization wants every commit on `main` to be traceable to an approved pull request, with no direct pushes allowed, ever.
+ A branch protection rule on main requiring pull requests before merging, with direct pushes (including by admins, if desired) disabled
- Renaming main to something harder to guess
- Removing everyone's push access to the whole repository
- A .gitignore rule
> Branch protection rules are exactly the GitHub-level enforcement mechanism for "this branch is only ever updated through reviewed PRs."

? [predict] What does a required status check block, specifically?
+ The merge button, until the named CI job reports success on the PR's latest commit
- Every push to any branch in the repository
- Cloning the repository
- Issue creation
> Required checks are scoped to merging into the protected branch; they don't stop you from pushing to your own feature branch or from working locally.

? [scenario] A GitHub Actions workflow should run tests on every pull request but only deploy on pushes to main. How is that usually expressed?
+ Two jobs (or triggers) — one on the `pull_request` event running tests, another on `push` to main running the deploy step, often gated on the tests job succeeding
- One workflow that always deploys, and you just don't look at the result for PRs
- A single trigger that fires on absolutely every event
- It requires a separate repository for testing versus deploying
> Actions workflows key off event types precisely so risky steps (deploys) are scoped to the branch and event where they're actually safe to run.
```

## Advanced Git and internals

```quiz
? [predict] What is a "detached HEAD" state's HEAD file actually pointing to, versus the normal state?
+ Directly at a commit hash, instead of at a ref path like refs/heads/main
- Nothing; detached HEAD means the file is empty
- A remote branch, always
- A tag, exclusively
> Normally `.git/HEAD` contains a symbolic reference like `ref: refs/heads/main`; detached, it holds a raw commit hash instead.

? [tf] `git worktree add` lets you check out a second branch into a separate folder while keeping your first checkout exactly where it is, sharing the same repository history.
+ True
- False
> Worktrees share one `.git` object database across multiple working directories, which is exactly what makes "run the old version in one folder while coding in another" possible without a second clone.

? [scenario] A pre-commit hook is blocking every commit with an error message you didn't expect, and you need to commit right now to save work before investigating.
+ git commit --no-verify (used sparingly, and only for your own local safety net — not as a habit for skipping real checks)
- Delete the .git/hooks folder entirely
- There's no way to bypass a hook
- Reinstall Git
> `--no-verify` skips both pre-commit and commit-msg hooks for that one commit; it's an escape hatch, not a substitute for fixing whatever the hook is actually complaining about.

? [predict] What does `git cat-file -p <hash>` do?
+ Pretty-prints the raw content of the Git object (blob, tree, commit or tag) at that hash
- Concatenates every file in the repository
- Converts a file to a different format
- Lists which commits reference that object
> It's the plumbing-level "show me exactly what's stored" command, useful for understanding the object model rather than for everyday work.

? [scenario] You want to know exactly which lines of a function changed over its whole history, following it even across the commit that moved it to a different file.
+ git log -L :functionName:path/to/file, and/or git log --follow for the rename tracking
- git blame is the only tool for this and it can't follow renames
- This information isn't tracked by Git at all
- git show HEAD~100 for each commit manually
> `-L` traces a function or line range's history directly, and `--follow` extends `log`'s path tracking across renames that a plain path filter would miss.
```

## Recovery and safety

```quiz
? [scenario] You force-pushed and immediately realize it overwrote three commits a teammate needs. They haven't fetched since before your push.
+ Ask them for the last commit hash they have locally (or check your own reflog if you have a copy), then push a fix that restores those commits — cherry-pick or reset to recreate them
- Nothing can be done; force-push is irreversible for everyone involved
- Tell them to force-push their old copy back immediately without coordinating
- Delete the remote repository and start fresh
> As long as the commits exist somewhere (your reflog, their local clone, a CI artifact), they can be recovered and reapplied; the fix is coordination, not panic.

? [tf] `git fsck --lost-found` can help locate commits that are no longer referenced by any branch, tag or reflog entry.
+ True
- False
> It's the deeper, slower safety net beyond reflog — useful once reflog entries have expired but the underlying objects haven't been garbage-collected yet.

? [scenario] You need to permanently remove a file that was committed with sensitive data from a public repository's entire history, not just its latest version.
+ Use a history-rewriting tool like git filter-repo to remove it from every commit, then force-push every affected branch, and rotate whatever secret was exposed
- Delete the file and commit that; that's sufficient
- Add it to .gitignore
- Ask GitHub support to delete just that one commit
> Because every later commit's hash depends on its history, "removing it from history" genuinely means rewriting every commit after the file was introduced — plus assuming the secret is already compromised.

? [predict] What does `git reflog expire` (run implicitly by garbage collection, using defaults of 90 days for reachable entries and 30 for unreachable ones) do to entries older than their window?
+ Removes them from the reflog, after which the commits they referenced become eligible for garbage collection if nothing else reaches them
- Nothing; reflog entries never expire by default
- Deletes the entire reflog immediately
- Converts them into permanent tags automatically
> This is why "recover it from reflog" has a shelf life — it's a safety net, not permanent long-term storage for abandoned work.

? [scenario] Your `main` branch's latest commit turns out to be badly broken, and it's already been pulled by several teammates. What's the team-safe fix?
+ git revert the bad commit (creating a new commit that undoes it), rather than resetting or rewriting main's history
- git reset --hard to before the bad commit, then force-push
- Delete main and recreate it
- Ask everyone to individually delete and re-clone
> Revert adds to history instead of rewriting it, so everyone's existing clones stay compatible with a simple pull — exactly why it's the standard fix for a bad commit that's already shared.
```
