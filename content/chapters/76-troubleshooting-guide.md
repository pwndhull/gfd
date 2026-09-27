---
id: troubleshooting-guide
part: 16
title: Troubleshooting Guide: Symptoms, Causes and Fixes
minutes: 22
level: Intermediate
topics: Troubleshooting guide | Error messages | Quick fixes
objectives:
- Look up a Git error message or symptom and find its cause quickly
- Apply the safe fix, and know which chapter explains it in depth
- Recognise which messages are harmless and which need care
concepts: detached HEAD | rejected push | merge conflict | upstream | protected branch | reflog
commands: git status | git reflog | git fetch | git pull --rebase | git push -u | git merge --abort | git rebase --abort
---
This chapter is a lookup table. Find the message or symptom you're seeing, read the cause, apply the fix. Each row links to the chapter with the full explanation. When nothing here matches, run `git status`: it describes the current state and usually prints the next command to use.

:::tip Search works on error text
Press `/` and paste a fragment of the error, such as "divergent" or "no upstream". The search covers this guide and every chapter.
:::

## Setup and authentication

| You see | Cause | Fix | Read |
|---|---|---|---|
| `git: command not found` / `'git' is not recognized` | Git not installed or not on PATH | Install; reopen the terminal | [Ch 7](#ch-installing-git) |
| `Author identity unknown` / `Please tell me who you are` | `user.name` / `user.email` not set | `git config --global user.name "…"` and `user.email` | [Ch 8](#ch-configuring-git) |
| `Permission denied (publickey)` | SSH key not loaded or not on GitHub | `ssh-add`, add the `.pub` key to GitHub, `ssh -T git@github.com` | [Ch 9](#ch-ssh-https-authentication) |
| `Authentication failed` over HTTPS | Account password used, or expired token | Use a credential manager (`gh auth login`) or a new token | [Ch 9](#ch-ssh-https-authentication) |
| `Repository not found` | No access, wrong URL, or SSO not authorised | Check the URL; ask for access; authorise SSO for your key/token | [Ch 9](#ch-ssh-https-authentication) |
| Git opened a strange editor full of `~` lines | Vim is the default editor | `Esc`, then `:wq` to save or `:q!` to abort; set `core.editor` | [Ch 8](#ch-configuring-git) |
| `Aborting commit due to empty commit message` | Editor closed immediately (e.g. VS Code without `--wait`) or you saved an empty message | `git config --global core.editor "code --wait"` | [Ch 8](#ch-configuring-git) |

## Repository and staging

| You see | Cause | Fix | Read |
|---|---|---|---|
| `fatal: not a git repository (or any of the parent directories)` | You're outside a repository | `cd` into the project, or `git init` / `git clone` | [Ch 10](#ch-git-init) |
| Every file in your home folder shows as untracked | `git init` was run in the wrong folder | Delete that stray `.git` folder (carefully) | [Ch 10](#ch-git-init) |
| `nothing added to commit but untracked files present` | New files not staged | `git add <files>` | [Ch 12](#ch-git-add) |
| `no changes added to commit` | Changes exist but aren't staged | `git add` or `git commit -a` | [Ch 13](#ch-git-commit) |
| Your latest edit isn't in the commit | You edited after `git add` | `git add` again; amend if needed | [Ch 4](#ch-git-mental-model) |
| `.gitignore` "doesn't work" for a file | The file is already tracked | `git rm --cached <file>`, commit | [Ch 16](#ch-gitignore) |
| `git diff` shows nothing, but you changed things | Changes are staged | `git diff --staged` | [Ch 15](#ch-git-diff) |
| Every line of a file shows as changed | Line-ending (CRLF/LF) differences | Set `core.autocrlf`; add `.gitattributes` | [Ch 8](#ch-configuring-git) |
| Terminal "frozen" with `:` at the bottom | You're in the pager | Press `q` | [Ch 14](#ch-git-log) |

## Branches and HEAD

| You see | Cause | Fix | Read |
|---|---|---|---|
| `You are in 'detached HEAD' state` | You checked out a commit, tag or `origin/…` | Look around safely; `git switch -c <name>` to keep commits; `git switch -` to go back | [Ch 61](#ch-detached-head) |
| `Warning: you are leaving N commits behind` | You committed while detached and switched away | `git branch <name> <hash shown>` | [Ch 61](#ch-detached-head) |
| `fatal: a branch is expected, got commit` | `git switch` given a commit | Add `--detach`, or use a branch name | [Ch 25](#ch-creating-and-switching-branches) |
| `Your local changes … would be overwritten by checkout` | Uncommitted edits clash with the target branch | Commit, `git stash`, or discard | [Ch 25](#ch-creating-and-switching-branches) |
| `error: the branch 'x' is not fully merged` | `-d` protects unmerged commits | Merge it, or `-D` if you're sure | [Ch 26](#ch-managing-branches) |
| `cannot delete branch 'x' used by worktree` | It's checked out (here or in another worktree) | Switch away first | [Ch 26](#ch-managing-branches) |
| Branch shows `[origin/x: gone]` | Remote branch was deleted (usually after merging) | Confirm merged, then `git branch -d x` | [Ch 23](#ch-tracking-branches) |

## Remotes: fetch, pull, push

| You see | Cause | Fix | Read |
|---|---|---|---|
| `The current branch x has no upstream branch` | First push of a new branch | `git push -u origin x` (or set `push.autoSetupRemote`) | [Ch 22](#ch-git-push) |
| `! [rejected] … (fetch first)` | Server has commits you don't | `git pull` (or fetch + rebase), then push | [Ch 22](#ch-git-push) |
| `! [rejected] … (non-fast-forward)` | You fetched but haven't integrated, or you rewrote history | Integrate, then push; if you rewrote your own branch, `--force-with-lease` | [Ch 22](#ch-git-push) |
| `Need to specify how to reconcile divergent branches` | Pull needs merge-or-rebase decision | `git pull --rebase` or `--no-rebase`; set `pull.rebase` | [Ch 21](#ch-git-pull) |
| `Your local changes … would be overwritten by merge` (on pull) | Uncommitted edits clash with incoming changes | Commit or stash, then pull | [Ch 21](#ch-git-pull) |
| `There is no tracking information for the current branch` | Branch has no upstream | `git branch -u origin/<branch>` | [Ch 23](#ch-tracking-branches) |
| `GH006: Protected branch update failed` | Direct push to a protected branch | Push a branch, open a PR | [Ch 53](#ch-branch-protection-and-codeowners) |
| `Your branch is up to date` but GitHub has newer commits | Status compares with your last fetch | `git fetch` then `git status` | [Ch 6](#ch-remotes-and-origin) |
| `(forced update)` in fetch output | Someone rewrote a remote branch | Don't pull blindly; see the recovery chapter | [Ch 74](#ch-recovery-history-accidents) |

## Merging, rebasing, cherry-picking

| You see | Cause | Fix | Read |
|---|---|---|---|
| `CONFLICT (content): Merge conflict in …` | Both sides changed the same lines | Edit, `git add`, `git commit` / `--continue`; or `--abort` | [Ch 35](#ch-resolving-conflicts) |
| `CONFLICT (modify/delete)` | One side deleted a file the other changed | `git add` to keep or `git rm` to delete | [Ch 34](#ch-merge-conflicts) |
| `You have unmerged paths` | A merge is in progress with unresolved files | Resolve and `git add`, or `git merge --abort` | [Ch 35](#ch-resolving-conflicts) |
| `could not apply <hash>…` during rebase | A replayed commit conflicts | Resolve, `git add`, `git rebase --continue`; or `--skip` / `--abort` | [Ch 39](#ch-rebase-conflicts) |
| `--ours` gave you the wrong side during a rebase | ours/theirs are swapped in rebases | Use `--theirs` for your own commit's version | [Ch 39](#ch-rebase-conflicts) |
| `commit X is a merge but no -m option was given` | Reverting or cherry-picking a merge commit | Add `-m 1` | [Ch 42](#ch-git-revert) |
| `The previous cherry-pick is now empty` | The change is already on this branch | `git cherry-pick --skip` | [Ch 47](#ch-cherry-pick-conflicts-and-scenarios) |
| `Not possible to fast-forward, aborting` | `--ff-only` and the branches diverged | Merge or rebase deliberately | [Ch 33](#ch-git-merge) |

## Undoing and recovering

| Symptom | Fix | Read |
|---|---|---|
| Committed to the wrong branch | Branch/cherry-pick, then reset or revert the wrong branch | [Ch 72](#ch-recovery-wrong-place) |
| Need to undo the last local commit, keep changes | `git reset --soft HEAD~1` | [Ch 41](#ch-git-reset) |
| Need to undo a pushed commit | `git revert <hash>` | [Ch 42](#ch-git-revert) |
| Reset or rebase went too far | `git reflog`, then `git reset --hard HEAD@{n}` | [Ch 43](#ch-git-reflog) |
| Deleted a branch | `git branch <name> <hash>` from the message or reflog | [Ch 72](#ch-recovery-wrong-place) |
| Lost staged work after `reset --hard` | `git fsck --lost-found` | [Ch 74](#ch-recovery-history-accidents) |
| Committed a secret | Rotate it first, then clean up | [Ch 73](#ch-recovery-bad-commits) |
| Dropped a stash | Hash from the drop message, or `git fsck` | [Ch 45](#ch-using-stashes) |

## Harmless messages you can relax about

- **`warning: LF will be replaced by CRLF`**: line-ending conversion doing its job (Chapter 8).
- **`You appear to have cloned an empty repository`**: the remote has no commits yet.
- **`Already up to date.`**: nothing to merge.
- **`HEAD is now at …`** after a reset or checkout: confirmation, not an error.
- **`hint:` lines**: advice, not errors. They usually include the command you need.

:::recap
### What you learned
- Most Git errors map to a small number of causes: missing identity or auth, unstaged changes, missing upstream, divergence, protection rules, conflicts, and detached HEAD.
- `git status` and the `hint:` lines usually tell you the next command.
- For anything involving lost work, go to the reflog before doing anything else.

### Key terms
```terms
Divergent branches :: Two branches that each have commits the other lacks.
Rejected push :: A push the server refused because it wasn't a fast-forward or broke a rule.
Hint :: Advisory output from Git suggesting the next step.
```

### Key commands
```commands
git status :: First command for any confusing state.
git fetch && git status :: Refresh your view of the remote before trusting ahead/behind.
git merge --abort / git rebase --abort :: Leave an in-progress operation safely.
git reflog :: First command for any lost work.
```

### Common mistakes
- Ignoring the `hint:` lines, which usually contain the fix.
- Reaching for `--force` or `reset --hard` before understanding the message.
- Re-cloning to escape a confusing state (you lose your reflog and unpushed work).

### Quick quiz
```quiz
? [troubleshoot] git commit prints "Author identity unknown". Fix?
+ Set user.name and user.email with git config
- Run git init
- Push first
- Install GitHub Desktop
> Git needs an identity to stamp on commits.

? [troubleshoot] git push prints "! [rejected] main -> main (fetch first)". Fix?
+ Pull (or fetch and rebase), then push again
- git push --force
- Delete origin
- git reset --hard
> The server has work you don't; integrate it first.

? [troubleshoot] git switch main fails with "Your local changes to the following files would be overwritten by checkout". Which is NOT a valid way forward?
- Commit the changes
- Stash the changes
- Discard the changes with git restore
+ Delete the .git folder
> Commit, stash or discard, then switch.

? [troubleshoot] You see "warning: LF will be replaced by CRLF". What should you do?
+ Nothing urgent; it's line-ending conversion working as configured
- Re-clone
- Revert the last commit
- Disable Git
> It's informational.

? [troubleshoot] git pull prints "Need to specify how to reconcile divergent branches". What has already happened?
+ Only the fetch; nothing was integrated yet
- Your branch was reset
- A merge commit was created
- Your changes were stashed
> Choose --rebase or --no-rebase (or configure pull.rebase) and pull again.
```

### Practical exercise
```exercise Build your own error log
For the next two weeks, whenever Git prints an error or warning you didn't expect, write down the exact message, what you were doing, and the fix. Compare with this table. After two weeks, you'll have a personal cheat sheet of the situations your team's workflow actually produces.
---solution---
Typical entries for new team members: "no upstream branch" (first push), "rejected (fetch first)" (teammate pushed), "divergent branches" (pull), "would be overwritten by checkout" (switching with edits), and "GH006 protected branch". Each maps to a single habit: push with -u, pull before push, configure pull.rebase, commit or stash before switching, and use PRs for main.
```

### What to learn next
Part 17 turns everything into habits: professional best practices for commits, pull requests, safety and releases.
:::
