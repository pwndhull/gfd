---
title: Final assessment
lede: "One question bank drawn from all twenty parts of this book."
pass: 80
---
This assessment mixes multiple-choice, true/false, prediction, state-tracking, troubleshooting and scenario questions from every part of the book. It exists to check breadth, not to teach anything new, so there's no prose here — just the questions the page above renders.

## Part 1: Understanding Version Control

```quiz
? What problem does version control solve that simply making folder copies like project-v2, project-final does not?
+ It records every change with who, when and why, and lets you get back to any point, not just the ones you remembered to copy
- It makes files smaller
- It prevents you from ever making a mistake
- It automatically writes your code for you
> Manual copies only capture the moments you thought to save, and they explain nothing about why something changed.

? [tf] A distributed version control system like Git gives every clone a complete copy of the project's history, not just the latest snapshot.
+ True
- False
> That's the core difference from centralized systems like the older Subversion or CVS, where only the central server holds full history.

? A Git commit stores a full snapshot of every tracked file, not just the lines that changed. What makes this efficient rather than wasteful?
+ Unchanged files are stored once and reused by every commit that shares them, via content-addressed storage
- Git actually only stores diffs internally, contrary to how it's usually described
- Disk space doesn't matter because Git compresses everything to zero bytes
- Unchanged files are deleted between commits and rebuilt on checkout
> Because objects are addressed by the hash of their content, a file that didn't change between commits is the very same object on disk, referenced by both.

? [predict] You run `git log --oneline` in a brand-new repository with one commit. What happens if you instead run it in a folder that was never initialized with `git init` or cloned?
+ fatal: not a git repository (or any of the parent directories): .git
- An empty list
- Git initializes the repository automatically and then runs the command
- A permission denied error
> Git commands other than `init` and `clone` require an existing repository; outside one, Git reports that plainly.

? [state] A branch points at commit C. You run `git commit`, creating commit D whose parent is C. Which commit does the branch point at afterward?
+ D
- C
- Both C and D
- Neither; branches don't move automatically
> Committing moves the current branch forward to the new commit; that's the entire mechanism behind "branches are movable labels."
```

## Part 2: Installing and Configuring Git

```quiz
? Where does `git config --global` write its settings?
+ A `.gitconfig` file in your home directory, applying to every repository you use
- Inside the current repository's `.git` folder only
- A hidden system file that only administrators can edit
- Nowhere; --global is only a display filter
> `--local` (the default) writes to `.git/config` in one repo; `--global` writes to your home directory and applies everywhere; `--system` covers every user on the machine.

? [tf] If a setting exists at both the local and global level, Git uses the global one because it was set up first.
- True
+ False
> More specific scope wins: local overrides global, which overrides system.

? [troubleshoot] `git push` over SSH fails with "Permission denied (publickey)." What's the most likely fix?
+ Generate an SSH key pair and add the public key to your GitHub account, then test with `ssh -T git@github.com`
- Switch your remote URL to use HTTPS and hope it goes away
- Reinstall Git entirely
- Set `user.email` again
> That error means the server didn't recognize any key you offered; adding a registered public key (or fixing ssh-agent) resolves it.

? Which config setting makes `git pull` merge instead of rebase when a branch has diverged?
+ pull.rebase false (or leaving it unset, since false is the historical default)
- fetch.prune true
- push.autoSetupRemote true
- core.editor
> `pull.rebase` controls whether the integration step of `pull` merges or rebases; `true` rebases, `false`/unset merges.

? [predict] You run `git config --list --show-origin` right after a fresh install with only `user.name` and `user.email` set globally. What shows up?
+ Two lines, each prefixed with the path to your global .gitconfig file
- Every possible Git setting, with defaults filled in
- Nothing, because show-origin requires a repository
- An error, because show-origin needs --global explicitly
> `--show-origin` only lists settings that have actually been set, tagged with which file they came from.
```

## Part 3: Your First Repository

```quiz
? What does `git add` actually do?
+ Copies the current version of a file into the staging area, ready to be included in the next commit
- Immediately commits the file
- Uploads the file to a remote server
- Marks the file as permanently tracked forever, even after deletion
> Staging is a separate step from committing on purpose: it lets you build a commit out of exactly the changes you want, not just "everything that's different."

? [state] You edit `notes.txt`, run `git add notes.txt`, then edit `notes.txt` again without staging the second change, then run `git commit -m "update"`. Which version of `notes.txt` ends up in the commit?
+ The version as it was at the moment you ran `git add`, not the later edits
- Whatever the file looks like on disk right now
- Both versions, merged automatically
- The commit fails until you run git add again
> The staging area is a snapshot taken at `add` time; committing records exactly what's staged, ignoring changes made afterward.

? [tf] A file listed in `.gitignore` that was already committed before the ignore rule was added will keep showing up in `git status` as modified.
+ True
- False
> `.gitignore` only affects untracked files; an already-tracked file must be explicitly untracked with `git rm --cached` to stop Git watching it.

? What's the difference between `git diff` and `git diff --staged`?
+ `git diff` shows unstaged changes against the last commit; `--staged` shows what's staged, i.e. what the next commit would contain
- They show the same thing in a different color
- `--staged` shows changes already pushed to the remote
- `git diff` only works before the first commit
> They compare different pairs: working tree vs. index for the plain form, index vs. last commit for --staged.

? [predict] What does `git status` show for a file that exists on disk but has never been added or committed?
+ It's listed under "Untracked files"
- It's listed under "Changes to be committed"
- Nothing; Git ignores files it's never seen
- An error, because Git doesn't know what to do with it
> Untracked means Git sees the file but isn't following it yet; it takes an explicit `git add` to start tracking it.
```

## Part 4: Working with Existing Projects

```quiz
? What is the one, precise difference between `git fetch` and `git pull`?
+ fetch only downloads new commits and updates remote-tracking branches (origin/*); pull does that and then also merges (or rebases) into your current branch
- fetch downloads files; pull downloads commits
- pull is fetch's older, deprecated name
- fetch requires authentication; pull does not
> `pull` is fetch plus an integration step. That's why `fetch` is the safer command to run just to look around.

? [state] After `git fetch`, has your local `main` branch moved?
- Yes, it fast-forwards automatically
+ No — only origin/main (the remote-tracking branch) moves; your local main is untouched until you merge, rebase or pull
- Only if there were no conflicts
- Yes, but only the working directory changes, not the branch pointer
> This is the detail that trips up beginners: fetch is deliberately non-destructive to your own branch.

? [tf] `git clone --depth 1` gives you a full copy of the repository's history, just compressed.
- True
+ False
> A shallow clone (`--depth 1`) genuinely omits older history; it isn't there to fetch later without extra steps like `git fetch --unshallow`.

? What does `git push -u origin feature/x` do that a later plain `git push` relies on?
+ It sets feature/x's upstream to origin/feature/x, so future push/pull on that branch know where to go without specifying it
- It force-pushes the branch once, then behaves normally
- It uploads only the files, not the history
- It renames the branch on the remote to "origin"
> `-u`/`--set-upstream` is a one-time link; after that, Git remembers the pairing between your branch and its remote counterpart.

? [scenario] `git push` is rejected with "Updates were rejected because the remote contains work that you do not have locally." What should you do first?
+ `git fetch` (or `git pull`) to get the missing commits, then reconcile before pushing again
- Add --force immediately
- Delete the remote branch and push fresh
- Ignore it and retry the same push
> The rejection is Git protecting a teammate's work; force-pushing over an unseen commit is exactly how work gets lost.
```

## Part 5: Branches

```quiz
? What is a Git branch, precisely?
+ A movable, lightweight pointer (a small file) that references one commit
- A full copy of every file in the project at that point
- A separate folder on disk containing a duplicate history
- A remote-only concept; locally there's only one line of history
> Because it's just a pointer, creating a branch is instant regardless of project size — nothing is duplicated.

? [state] You're on `main` at commit C. You run `git switch -c feature`. What is true immediately afterward?
+ Both main and feature point at C; only HEAD has moved, onto feature
- feature is empty until you commit
- main is deleted
- HEAD now points directly at commit C, detached
> A new branch starts by pointing at your current commit; nothing diverges until one branch or the other gets a new commit.

? [tf] `git branch -d` will delete a branch even if it has unmerged commits that exist nowhere else.
- True
+ False
> `-d` refuses in that case specifically to protect unique work; `-D` (capital) forces it through regardless.

? Why do most teams delete a feature branch immediately after merging its pull request?
+ The branch's commits still exist, reachable through main's history; the branch label itself is just clutter once its job is done
- Deleting a branch deletes its commits from history entirely
- It's required before you're allowed to open another PR
- It prevents the teammate who authored it from working further
> The commits are safe as long as something (main, in this case) still reaches them; only the now-redundant label goes away.

? [predict] What does `git branch -vv` show that plain `git branch` does not?
+ Each branch's upstream tracking branch and how many commits ahead/behind it is
- The full commit history of each branch
- Who created each branch
- The size in bytes of each branch
> The extra verbosity (`-vv`) adds tracking and ahead/behind information per branch, handy for a quick "what needs pushing or pulling" check.
```

## Part 6: Commits

```quiz
? A commit object stores all of the following except one. Which?
- A pointer to a tree object representing the snapshot
- A pointer to its parent commit(s)
- Author and committer name, email and timestamp
+ A list of every file in the entire repository's history
- A commit message
> A commit only ever describes its own snapshot and lineage — it has no idea what other commits, past or future, contain.

? [tf] Running `git commit --amend` creates an entirely new commit object with a new hash; it does not edit the old one in place.
+ True
- False
> Git commits are immutable; "amending" really means "replace with a new commit that has the same parent," which is why amending a *pushed* commit requires a force-push.

? Why is "atomic commits" (one logical change per commit) considered good practice?
+ It makes history easy to read, review, revert and bisect, since each commit tells one coherent story
- It reduces the total number of bytes Git stores
- Git technically refuses to commit more than one change at a time
- It's required for `git push` to succeed
> Atomicity is a discipline, not an enforced rule — but it pays off enormously the moment you need to revert or bisect.

? [scenario] You already pushed a commit, and then notice a typo in its message. What's the safe way to fix it if nobody else has based work on it yet?
+ `git commit --amend`, then `git push --force-with-lease`
- Edit the commit message in GitHub's web UI only, leaving your local copy out of sync
- There is no way to fix a pushed commit's message
- `git revert` the commit
> Amending and force-pushing (safely, with --with-lease) is the standard fix when you're confident no one has built on the old version yet; revert would undo the whole change, not just fix the message.

? [predict] What does `git commit --fixup <hash>` create?
+ A new commit tagged as a fixup for the named commit, meant to be folded into it later with `git rebase -i --autosquash`
- A commit that immediately rewrites the named commit
- An error, because --fixup isn't a real flag
- A merge commit
> `--fixup` writes a specially formatted message (`fixup! <original subject>`) that `--autosquash` recognizes and reorders/squashes automatically during an interactive rebase.
```

## Part 7: Merging

```quiz
? What decides whether `git merge` performs a fast-forward instead of creating a merge commit?
+ Whether the current branch's tip is a direct ancestor of the branch being merged in — if so, Git can just move the pointer forward
- Whether you pass --ff explicitly
- The number of commits being merged
- Whether the branches have the same name
> A fast-forward is possible exactly when no new work happened on the current branch since it diverged; otherwise Git needs a real merge commit to join two lines of history.

? [tf] `git merge --squash` creates a merge commit with two parents, just like a normal merge.
- True
+ False
> `--squash` stages the combined changes as a single set but does not commit or record parentage — you commit it yourself, and it ends up with one parent, like any ordinary commit.

? [state] A merge conflict lands you with a file containing `<<<<<<<`, `=======` and `>>>>>>>` markers. What must happen before `git commit` will succeed?
+ Every conflicted file must be edited to remove the markers and reflect the resolution, then staged with git add
- Nothing; committing during a conflict auto-resolves it
- You must delete and recreate the repository
- Only running git merge --continue works; git add is optional
> Git refuses to complete the merge commit until every conflicted path has been staged, which is how it knows you've made a decision.

? Why does Git prefer a three-way merge algorithm (using the common ancestor) over just diffing the two tips against each other?
+ It can tell which side actually changed each line since they diverged, rather than guessing from the final states alone
- Three-way merges are faster
- It's required for fast-forwards
- It avoids needing a merge commit
> Without the common ancestor as a reference point, Git would have no way to distinguish "this line changed on side A" from "this line changed on side B."

? [troubleshoot] `git merge --abort` fails with "There is no merge to abort." What does that tell you?
+ You're not actually in the middle of a conflicted merge — check git status to see what state you're really in
- Git is broken and needs reinstalling
- The merge already succeeded silently
- You need administrator privileges
> `--abort` only works when MERGE_HEAD exists, i.e. there's a merge genuinely in progress; the error is Git accurately reporting there's nothing to cancel.
```

## Part 8: Rebase

```quiz
? What does `git rebase main` do while you're on a feature branch?
+ Replays your feature branch's commits, one by one, as new commits on top of main's current tip
- Merges main into your feature branch, creating a merge commit
- Deletes your commits and starts over
- Renames your branch to main
> "Replay" is the key word: each original commit is reapplied as a brand-new commit with a new hash and (usually) main as an ancestor.

? [tf] Because rebase creates new commits, the "golden rule" is to never rebase commits that have already been pushed and might be in use by someone else.
+ True
- False
> Rewriting shared history forces everyone downstream to reconcile diverging histories — the exact mess Chapter 37 walks through.

? [scenario] You rebase your feature branch onto an updated main and there's a conflict partway through. What are your three options?
+ Resolve the conflict and `git rebase --continue`; or `git rebase --skip` to drop that commit; or `git rebase --abort` to return to where you started
- Only git rebase --abort is available
- You must delete the branch and start again
- Conflicts during rebase resolve automatically
> Rebase pauses one commit at a time; you get the same three choices at each conflicted commit.

? In an interactive rebase (`git rebase -i`), what does changing a commit's action from `pick` to `squash` do?
+ Folds that commit's changes into the previous one and lets you write a combined message
- Deletes the commit entirely
- Splits the commit into two
- Marks the commit for cherry-picking onto another branch
> `squash` (and its quieter cousin `fixup`) is how interactive rebase combines a string of small commits into one clean one before merging.

? [predict] After a rebase, do the replayed commits have the same hashes as the originals?
- Yes, hashes are based only on content, not history
+ No — a commit's hash includes its parent's hash, so a new parent means a new hash even if the diff is identical
- Only the first replayed commit changes hash
- Hashes only change if there was a conflict
> This is exactly why rebased commits are "new" commits from Git's point of view, even when the code change itself is unchanged.
```

## Part 9: Undoing Changes

```quiz
? What's the key difference between `git reset --mixed` and `git reset --soft`, both targeting HEAD~1?
+ Both move the branch pointer back one commit; --soft leaves the undone commit's changes staged, --mixed (the default) leaves them unstaged but still in your working directory
- --soft discards the changes; --mixed keeps them
- They are identical; --soft is just the old name
- --mixed also changes files on disk to match the older commit; --soft does not
> Both are non-destructive to your working files; they differ only in what happens to the index (staging area).

? [tf] `git reset --hard` will discard uncommitted changes in your working directory with no built-in undo.
+ True
- False
> This is exactly why it's flagged as dangerous throughout the book — always double-check `git status` and `git stash` first if there's anything you might want.

? What does `git revert <commit>` do that `git reset` does not?
+ It creates a brand-new commit whose changes undo the target commit, leaving history intact — safe on shared branches
- It deletes the target commit from history
- It's identical to reset --hard on that commit
- It can only be used on the very last commit
> Revert adds to history instead of rewriting it, which is exactly why it's the safe undo for anything already pushed and shared.

? [state] You accidentally ran `git reset --hard HEAD~3`, losing three commits' worth of work. Is that work actually gone?
+ Not immediately — the commits are still in Git's object database and findable via git reflog, until garbage collection eventually removes them
- Yes, permanently and immediately
- Only if you hadn't committed yet
- Only the file changes are gone; the commit messages survive elsewhere
> `reset` moves pointers; it doesn't delete objects. `git reflog` plus `git reset --hard` (or `git branch newname <hash>`) is the standard recovery.

? [troubleshoot] `git push` fails after you rebased a branch, with "Updates were rejected because the tip of your current branch is behind." You know you rewrote history on purpose. What's the safest next command?
+ `git push --force-with-lease`
- `git push --force`
- `git pull` followed by another plain push
- Delete the remote branch first
> `--force-with-lease` still force-pushes your rewritten history, but refuses if the remote has changed since you last fetched it — catching the case where a teammate pushed something you haven't seen.
```

## Part 10: Stash

```quiz
? What does `git stash` do to your working directory by default?
+ Saves your tracked changes (staged and unstaged) onto a stack and restores a clean working directory matching HEAD
- Commits your changes to a hidden branch permanently
- Deletes untracked files
- Pushes your changes to the remote temporarily
> It's a scratch space for "I need a clean working directory right now, but I'm not ready to commit this."

? [tf] `git stash` includes untracked files by default.
- True
+ False
> Untracked files need `git stash -u` (or `--include-untracked`); the plain form only stashes tracked changes.

? What's the difference between `git stash pop` and `git stash apply`?
+ pop reapplies the stash and removes it from the stash list; apply reapplies it but leaves it on the list
- They're identical
- apply only works on the oldest stash; pop only works on the newest
- pop requires no conflicts; apply allows them
> Keep `apply` when you might want to reapply the same stash again elsewhere (e.g. onto two branches); use `pop` when you're done with it.

? [scenario] `git stash pop` reports a conflict. What happens to the stash entry?
+ It is kept on the stash list (unlike a clean pop) so you don't lose it while you resolve the conflict
- It is silently dropped, conflict or not
- The stash pop command fails entirely and undoes itself
- Git aborts the operation and restores your previous working directory automatically
> Because a conflicted pop can't safely finish the "drop from the list" half automatically, Git leaves the stash in place until you resolve things and drop it yourself.

? [predict] What does `git stash branch new-branch` do?
+ Creates new-branch from the commit the stash was taken from, checks it out, and applies (then drops) the stash on top of it
- Renames the current branch
- Lists which branch each stash belongs to
- Deletes the branch the stash was created on
> It's a rescue move for when the stash no longer applies cleanly to your current branch — recreate the original context first, then reapply.
```

## Part 11: Cherry-pick

```quiz
? What does `git cherry-pick <commit>` do?
+ Applies just that one commit's changes as a new commit on top of your current branch
- Merges the entire branch that commit came from
- Deletes the commit from its original branch
- Renames the commit
> It's a surgical tool: copy one specific change across, without pulling in everything else on that branch.

? [tf] A cherry-picked commit has the exact same hash as the original, since it contains the same changes.
- True
+ False
> A new commit always gets a new hash — different parent, different committer date, different position in history — even with identical file changes.

? What does the `-x` flag add when cherry-picking?
+ A trailer line in the new commit's message, "(cherry picked from commit <hash>)", recording where it came from
- Extra confirmation prompts
- A guarantee that no conflicts will occur
- Extended (verbose) diff output only
> That trailer is the paper trail teams rely on to know a hotfix has already been ported to a given branch.

? [scenario] You cherry-pick a commit and hit a conflict. What are your two ways forward?
+ Resolve the conflict, stage it, and run git cherry-pick --continue; or run git cherry-pick --abort to cancel
- Only --abort is available
- The cherry-pick auto-resolves after a timeout
- You must reset --hard and start your whole session over
> Same shape as a rebase or merge conflict: fix it and continue, or abandon and go back to where you started.

? [predict] After successfully resolving a cherry-pick conflict, does `git cherry -v` recognize the result as matching the original commit?
+ Not necessarily — cherry compares actual patch content, and a manually resolved conflict often produces a different diff from the original, so it can still show the commit as "not yet applied"
- Always yes, since cherry-pick's job is to track that
- Only if you used -x
- Never, cherry-pick and cherry are unrelated
> This is a genuinely subtle case (Chapter 47): the -x trailer, not git cherry, is the reliable record that a pick already happened.
```

## Part 12: Tags and Releases

```quiz
? What's the practical difference between a lightweight tag and an annotated tag?
+ An annotated tag (-a) is a full object with its own tagger, date and message; a lightweight tag is just a name pointing at a commit, with none of that metadata
- Lightweight tags can't be deleted
- Annotated tags automatically trigger a deployment
- There is no real difference; -a only changes how it prints
> For anything you'd call a release, the extra metadata an annotated tag records is worth the one extra flag.

? [tf] `git push` alone will push your newly created tags to the remote automatically.
- True
+ False
> Tags are not included in a plain push; you need `git push <tag>`, `git push --tags`, or (better, for annotated release tags) `git push --follow-tags`.

? What does `git describe` print for a commit that is three commits past the most recent tag v2.0.0?
+ Something like v2.0.0-3-gA1b2c3d — the tag, how many commits since, and a "g"-prefixed short hash
- Just v2.0.0
- An error, since describe only works exactly on tagged commits
- The next expected tag, v2.0.1
> `describe` is built exactly for this: a human-readable "where are we relative to the last release" string, often used in build version strings.

? [scenario] You need to tag a commit from two weeks ago, not the current HEAD. How?
+ git tag -a v1.0.1 -m "message" <commit-hash>
- Tags can only be created on HEAD; you'd have to check out the old commit first
- git checkout <hash> && git tag, and that's the only way
- It requires rewriting history
> Tag commands accept a target commit as their last argument, defaulting to HEAD only when you omit it.

? [predict] What happens on the remote when you run `git push origin --delete v1.0.0`?
+ The tag reference is removed from the remote, though anyone who already fetched it still has a local copy unless they delete it too
- The tagged commit itself is deleted from history
- Nothing; tags can't be deleted once pushed
- Every clone automatically loses the tag too
> Deleting a remote tag only removes that pointer from that remote; it doesn't retroactively reach into everyone else's clones.
```

## Part 13: GitHub

```quiz
? What is a fork, as distinct from a clone?
+ A fork is your own copy of someone else's repository on GitHub's servers, which you then clone locally; a clone is just the local-copy step, of your own or anyone else's repo
- They're the same thing, just different names
- A fork always merges back automatically
- Forking deletes the original repository's access for its owner
> Forking is specifically the "make my own server-side copy so I can propose changes via a pull request" workflow used on public/open-source projects.

? [tf] A pull request is a Git feature, built into every clone of the repository.
- True
+ False
> PRs are a GitHub (and similar platforms') feature layered on top of Git; the underlying Git operation is just "these two branches, compared and eventually merged."

? What is CODEOWNERS for?
+ Automatically requesting review from the right people based on which files a pull request touches
- Marking which files are read-only for everyone
- Recording who is allowed to clone the repository
- Assigning issues automatically
> It's a path-to-reviewer mapping file that GitHub reads to route review requests without anyone remembering to tag people manually.

? [scenario] A branch protection rule requires "1 approving review" and "status checks must pass" before merging into main. A PR has one approval but a failing test. What happens if you try to merge?
+ GitHub blocks the merge button until the failing check passes, regardless of the approval
- It merges anyway since one requirement was satisfied
- It merges but immediately reverts
- The failing check is ignored after 24 hours
> Protection rules are ANDed together — every configured requirement has to be satisfied, not just one of them.

? [predict] What does `gh pr checkout 342` do?
+ Fetches PR #342's branch and checks it out locally, so you can run or test it
- Merges PR #342 immediately
- Closes PR #342
- Only works for PRs you authored
> It's the CLI shortcut for "I want this code on my machine to actually run it," equivalent to fetching the PR's ref manually.
```

## Part 14: Professional Workflows

```quiz
? In GitFlow, what is the `develop` branch for?
+ Integrating finished features before they're bundled into a release, kept separate from the always-releasable main
- The branch new developers are assigned to by default
- A backup copy of main
- The branch used only for documentation changes
> GitFlow's structure exists to separate "code we're actively integrating" from "code that's shipped," at the cost of more branches to manage.

? [tf] Trunk-based development, by design, favors long-lived feature branches that stay open for weeks.
- True
+ False
> Trunk-based development is defined by the opposite: small changes merged to a single trunk very frequently, often behind feature flags instead of long branches.

? What does Conventional Commits' `feat:` prefix communicate that a plain message doesn't?
+ A machine-readable signal (often used to automate changelogs and semantic version bumps) that this commit adds a new feature
- That the commit is experimental and might be reverted
- That the commit requires two reviewers
- Nothing; it's purely decorative
> Tools like semantic-release parse these prefixes to decide whether a change is a patch, minor, or major version bump, and to generate changelog sections.

? [scenario] Your team pulls a shared feature branch with `pull.rebase true` configured. A teammate has already rebased and force-pushed that branch once. What should you do before continuing to work on it?
+ Make sure you fetch and rebase (not merge) so you don't create a tangle of both the old and new versions of already-rewritten commits
- Nothing different; force-pushes don't affect other collaborators
- Immediately force-push your own version over theirs
- Delete your local copy of the branch and never touch it again
> Shared branches that get rewritten need everyone to rebase past the rewrite, exactly the scenario Chapter 37 and Chapter 58 walk through.

? [predict] A CI pipeline runs on every pull request and blocks merging on failure. What Git-level mechanism does GitHub use to know what to test?
+ It builds from the PR's head commit merged (or merge-simulated) against the target branch, so checks reflect what the merge would actually contain
- It re-clones the entire GitHub organization's history
- It only tests the target branch, ignoring the PR entirely
- It requires a separate "ci" branch to be created manually
> This is why a PR can show a check as failing even though your branch alone passes tests locally — it's testing against the integration, not your branch in isolation.
```

## Part 15: Advanced Git

```quiz
? What is "detached HEAD"?
+ HEAD pointing directly at a commit instead of at a branch name — normal for looking at old history, risky if you commit there without creating a branch
- An error state that always requires git fsck to fix
- What happens when you delete your only branch
- A synonym for an unborn branch (a repo with no commits yet)
> New commits made in detached HEAD aren't reachable from any branch, so `git switch -c <name>` to save them before switching away is the standard habit.

? [tf] `git reflog` records every commit ever made in the repository, including ones made by any collaborator.
- True
+ False
> Reflog is purely local and per-repository: it tracks where *your* HEAD (and branches) have pointed on *your* machine, and isn't shared by cloning or fetching.

? What does `git bisect` automate?
+ A binary search through commit history to find the exact commit that introduced a bug, given a known-good and known-bad commit
- Automatically fixing merge conflicts
- Splitting one large commit into several
- Comparing two entire branches file by file
> By testing the midpoint and narrowing the range based on good/bad answers, it turns "which of these 500 commits broke it" into about 9 tests.

? [scenario] `git blame` on a line shows it was last touched by a commit that just reformatted the whole file, hiding who actually wrote the logic. What flag helps?
+ -w (ignore whitespace) and/or -C (detect moved/copied lines), which look past pure reformatting to find the earlier meaningful change
- --force, which overrides blame's normal behavior
- There's no way around this; blame only ever shows the most recent touch
- --squash, which merges all history into one blame entry
> This is exactly the "reformatting commit" problem blame is famous for, and exactly what -w and -C exist to see past.

? [predict] What's stored in a Git "tree" object?
+ A list of entries (filenames, modes, and pointers to blob or tree objects) representing one directory's contents at a point in time
- The literal file contents
- A commit's metadata
- A compressed diff against the previous commit
> Blobs hold file contents, trees hold directory structure, commits point at a root tree plus metadata — the three-object model underlying everything.
```

## Part 16: Real-World Disaster Recovery

```quiz
? You committed to `main` when you meant to be on a feature branch, and haven't pushed yet. What's the cleanest fix?
+ Create the feature branch pointing at the current commit, then reset main back to where it was before (git branch feature, then git reset --hard <old-main-tip>)
- There's no way to move a commit to a different branch after the fact
- Delete the repository and start over
- Force-push immediately to overwrite the mistake on the remote
> Since a branch is just a pointer, "moving" a commit to another branch is really "point a new branch at it, then move the original branch back."

? [tf] Once a commit has been pushed to a shared remote, force-pushing over it is always safe as long as you use --force-with-lease.
- True
+ False
> --force-with-lease protects against overwriting commits you haven't fetched, but it doesn't make rewriting shared history harmless — teammates who already have the old commits still need to reconcile.

? [scenario] You deleted a branch with `git branch -D` before realizing it had unmerged work you needed. What's the recovery path?
+ Find the branch's last commit hash in git reflog (look for the checkout/commit entries), then recreate the branch there with git branch <name> <hash>
- The work is unrecoverable the moment the branch is deleted
- Only GitHub support can recover a deleted local branch
- You must re-clone the repository from the remote to get it back
> Deleting a branch removes the label, not the commits; as long as they're still in the reflog's window (or otherwise referenced), they're recoverable.

? What's the most common cause of "detached HEAD, now what?" panic, and the standard way out?
+ Checking out a specific commit or tag rather than a branch; the fix is git switch -c <new-branch> before doing any more work, if you want to keep it
- A corrupted .git folder that needs re-initializing
- It only happens after a failed rebase and can't be avoided
- Running out of disk space
> It's a completely normal, intentional Git state for "let me just look at this old version" — the risk is only in forgetting to branch before committing there.

? [predict] `git push` fails with a non-fast-forward error right after you rebased a shared branch that a teammate already pulled. What is the safest recovery conversation to have, before touching Git commands further?
+ Confirm with the teammate whether they've built new work on top of the old version, since that determines whether a force-push will lose anything of theirs
- There's nothing to discuss; force-push immediately
- Tell them to delete their local copy without checking first
- Revert the rebase entirely to avoid ever discussing it
> The Git commands (force-with-lease, or asking them to rebase their new work onto your pushed version) come after establishing what work actually exists that could be lost.
```

## Part 17: Professional Best Practices

```quiz
? Why do many teams enforce a linear, readable history on `main` (via squash-merge or rebase workflows) rather than keeping every intermediate WIP commit?
+ A clean main history reads like a changelog and is far easier to bisect, blame and review months later
- Git technically cannot store more than a fixed number of commits
- It makes the repository smaller on disk
- It's required for pull requests to work at all
> The messiness of in-progress work is often useful during review but not worth preserving forever in the branch that represents "what shipped, and why."

? [tf] Signing commits (with GPG or SSH) proves the content hasn't been altered since it was written.
+ True
- False
> A signature verifies both the identity of the signer and that the exact signed content (including the commit's hash, which covers its full history) hasn't changed.

? What does a good pull request description include that "fixed the bug" does not?
+ What changed, why, how to test it, and any risks or rollout notes
- Nothing more is needed if the diff is small
- The full contents of every changed file, pasted as text
- A promise that no review is necessary
> Reviewers need context the diff alone can't supply — the "why," in particular, is invisible from code alone.

? [scenario] A CI pipeline should block a release from being tagged if tests fail. Where does that check most naturally live?
+ In the CI workflow itself, gating the job that creates the tag/release on the test job succeeding
- In a Git hook that runs only on the release manager's own laptop
- It can't be automated; someone must remember to check manually
- In the .gitignore file
> Local hooks aren't enforceable across a team (anyone can skip them); a required, server-side CI gate is the reliable place for release-blocking checks.

? [predict] A secret (API key) was committed and pushed weeks ago, then removed in a later commit. Is it actually gone from the repository?
+ No — it's still present in the older commit's history and must be treated as compromised (rotate it) and only fully purged from history with a tool like git filter-repo, plus a force-push
- Yes, since the later commit deleted it
- Yes, as soon as it's no longer in the latest commit's files
- Only remote copies are affected; local clones never had it
> Removing a file's current content doesn't erase it from history; the immediate, non-negotiable step is rotating the secret, since it must be assumed exposed regardless of what you do to history afterward.
```

## Cross-cutting: putting it together

```quiz
? [scenario] You need to combine three messy WIP commits on your feature branch into one clean commit before opening a PR. Which tool is built exactly for this?
+ Interactive rebase (git rebase -i), squashing or fixing up the extra commits
- git merge --squash against your own branch
- git cherry-pick each commit onto a new branch one at a time
- git stash, three times
> `rebase -i` lets you reorder, reword, squash and drop commits on your own not-yet-shared branch — exactly this kind of pre-PR cleanup.

? [scenario] A teammate asks "did my fix from last Tuesday ever make it into the release branch?" What's the fastest way to check?
+ git log release-branch --grep="<their fix's message>" or git branch --contains <their commit's hash>
- Ask them to re-push it just in case
- Check GitHub's homepage for the organization
- There's no reliable way to check this
> Both commands answer "is this specific piece of work reachable from this branch," which is exactly the question being asked.

? [scenario] Your team's `main` branch requires linear history (no merge commits allowed) but also requires that feature branches be up to date with main before merging. What local workflow satisfies both?
+ Rebase your feature branch onto main before opening/updating the PR, then let GitHub fast-forward or squash-merge — never a plain three-way merge
- Merge main into your branch repeatedly and hope GitHub sorts it out
- Force-push main directly
- It's impossible to satisfy both requirements at once
> Rebasing keeps your branch's commits as if they were written after main's latest state, which is precisely what a linear-history requirement is checking for.

? [predict] You run `git log --all --graph --oneline` right after cloning a repository with several remote branches but no local branches besides main. What do you see for those other branches?
+ Their history, labeled as remote-tracking branches like origin/feature-x, since --all includes remote-tracking refs too
- Nothing, since --all only means "all commits on the current branch"
- An error, since --all requires --remotes explicitly
- Only branch names with no commit graph
> `--all` is genuinely all refs Git knows about locally, which after a clone includes every branch on the remote as an origin/* tracking ref.

? [scenario] You're reviewing a PR and want to run the code, not just read the diff. What's the most direct route from GitHub's PR page to a local, runnable checkout?
+ gh pr checkout <number> (or git fetch origin pull/<number>/head:<local-branch>)
- Clone the entire repository again into a new folder for every PR
- Copy-paste the diff into your own branch by hand
- Ask the author to email you a zip of their branch
> Both commands fetch exactly that PR's branch into a normal local branch you can build, run and test like any other.
```
