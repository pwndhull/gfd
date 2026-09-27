# Cheat sheet

Rows are "command :: description". A description starting with "!" marks a command that discards or rewrites work.

## Setup
git --version :: Show the installed Git version
git config --global user.name "Your Name" :: Set the name recorded on your commits
git config --global user.email "you@example.com" :: Set the email recorded on your commits
git config --global init.defaultBranch main :: Name the first branch of new repositories main
git config --global core.editor "code --wait" :: Use VS Code for commit messages
git config --global pull.rebase false :: Make git pull merge when branches diverge (true = rebase)
git config --global fetch.prune true :: Remove deleted remote branches on every fetch
git config --global push.autoSetupRemote true :: First push of a branch sets its upstream automatically
git config --global rerere.enabled true :: Remember and reuse conflict resolutions
git config --global merge.conflictStyle zdiff3 :: Show the base version inside conflict markers
git config --list --show-origin :: Show every setting and where it comes from
ssh-keygen -t ed25519 -C "you@example.com" :: Create an SSH key pair
ssh -T git@github.com :: Test SSH authentication with GitHub
gh auth login :: Sign in with the GitHub CLI and set up Git credentials

## Repository
git init :: Create a repository in the current folder
git init <folder> :: Create a folder with a repository inside
git clone <url> :: Copy a repository with its full history
git clone <url> <folder> :: Clone into a folder of your choice
git clone --depth 1 <url> :: Shallow clone: latest snapshot only
git clone --recurse-submodules <url> :: Clone including submodules
git rev-parse --show-toplevel :: Print the repository's top folder

## Files
git status :: Show branch, staged, unstaged and untracked files
git status -sb :: Short status with branch and ahead/behind
git add <file> :: Stage a file's current version
git add -A :: Stage every change (new, modified, deleted)
git add -u :: Stage changes to tracked files only
git add -p :: Choose hunks to stage
git diff :: Show unstaged changes
git diff --staged :: Show what will be committed
git diff HEAD :: Show all changes since the last commit
git diff --stat :: Summary of changed files
git rm <file> :: Delete a file and stage the deletion
git rm --cached <file> :: Stop tracking a file but keep it on disk
git mv <old> <new> :: Rename or move a file and stage it
git check-ignore -v <file> :: Show which ignore rule matches a file

## Commits
git commit -m "Message" :: Commit staged changes
git commit :: Commit and write the message in your editor
git commit -am "Message" :: Stage tracked changes and commit (not new files)
git commit -v :: Show the diff while writing the message
git commit --amend --no-edit :: ! Add staged changes to the last commit (rewrites it)
git commit --amend -m "New message" :: ! Change the last commit's message (rewrites it)
git commit --fixup <hash> :: Record a fix to fold into an earlier commit
git log --oneline :: Compact history
git log --oneline --graph --all :: History of every branch as a graph
git log -p -n 1 :: The last commit with its diff
git log -- <path> :: History of a file or folder
git log -S "text" :: Commits that added or removed text
git log --grep="text" :: Commits whose message mentions text
git show <commit> :: Show one commit's message and diff
git show <commit>:<path> :: Show a file as it was in a commit
git shortlog -sn :: Commit counts by author

## Branches
git branch :: List local branches
git branch -vv :: Branches with upstream and ahead/behind
git branch -a :: Local and remote-tracking branches
git branch <name> :: Create a branch (without switching)
git switch <branch> :: Switch to a branch
git switch -c <branch> :: Create a branch and switch to it
git switch -c <branch> origin/main :: Create a branch from the server's main
git switch - :: Switch back to the previous branch
git branch -m <old> <new> :: Rename a branch
git branch -d <branch> :: Delete a merged branch
git branch -D <branch> :: ! Force-delete a branch, even if unmerged
git branch --merged :: Branches fully contained in the current one
git branch -u origin/<branch> :: Set the current branch's upstream

## Remote
git remote -v :: List remotes and their URLs
git remote add <name> <url> :: Add a remote
git remote set-url origin <url> :: Change a remote's URL
git fetch :: Download commits and update origin/* only
git fetch --prune :: Fetch and drop deleted remote branches
git pull :: Fetch and integrate into the current branch
git pull --rebase :: Fetch and replay your commits on top
git pull --ff-only :: Fetch and fast-forward only
git push :: Push the current branch to its upstream
git push -u origin <branch> :: First push of a branch, setting its upstream
git push origin --delete <branch> :: Delete a branch on the remote
git push --force-with-lease :: ! Replace your own rewritten branch on the remote, safely
git log --oneline @{u}.. :: Commits you would push
git log --oneline ..@{u} :: Commits you would pull

## Merge
git merge <branch> :: Merge a branch into the current branch
git merge --no-ff <branch> :: Merge with a merge commit, always
git merge --ff-only <branch> :: Merge only if it can fast-forward
git merge --squash <branch> :: Stage a branch's combined changes for one commit
git merge --abort :: Cancel a conflicted merge
git diff --name-only --diff-filter=U :: List conflicted files
git restore --ours <file> :: During a merge conflict, keep your branch's version
git restore --theirs <file> :: During a merge conflict, keep the incoming version
git merge --continue :: Finish a merge after resolving
git cherry-pick -x <commit> :: Copy one commit onto the current branch
git cherry-pick --abort :: Cancel a cherry-pick

## Rebase
git rebase origin/main :: ! Replay your commits on top of the latest main
git rebase -i origin/main :: ! Edit, squash, reorder or drop your commits
git rebase -i --autosquash origin/main :: ! Fold fixup commits in automatically
git rebase --onto <new> <old> <branch> :: ! Move a range of commits to a new base
git rebase --continue :: Continue after resolving a conflict
git rebase --skip :: ! Drop the current commit and continue
git rebase --abort :: Cancel the rebase and restore the original branch

## Undo
git restore <file> :: ! Discard unstaged changes to a file
git restore --staged <file> :: Unstage a file, keeping your edits
git restore --source=<commit> <file> :: ! Get a file's version from any commit
git reset --soft HEAD~1 :: Undo the last commit, keep changes staged
git reset HEAD~1 :: Undo the last commit, keep changes unstaged
git reset --hard HEAD~1 :: ! Undo the last commit and discard its changes
git reset --hard :: ! Discard all uncommitted changes to tracked files
git reset --hard ORIG_HEAD :: ! Undo the last merge, rebase or reset
git revert <commit> :: Undo a commit with a new commit (safe for pushed work)
git revert -m 1 <merge-commit> :: Undo a merged branch
git clean -n :: Preview untracked files that would be deleted
git clean -fd :: ! Delete untracked files and folders
git reflog :: Where HEAD has been: find "lost" commits
git branch <name> <hash> :: Recover commits by putting a branch on them

## Stash
git stash :: Stash tracked changes and clean the working directory
git stash -u :: Stash including untracked files
git stash push -m "message" :: Stash with a description
git stash list :: List stashes
git stash show -p stash@{1} :: Show a stash's diff
git stash pop :: Reapply the latest stash and drop it
git stash apply stash@{1} :: Reapply a stash and keep it
git stash drop stash@{1} :: ! Delete a stash
git stash branch <name> :: Turn the latest stash into a branch

## Tags
git tag :: List tags
git tag -a v1.2.0 -m "Release 1.2.0" :: Create an annotated tag on HEAD
git tag -a v1.1.1 -m "Hotfix" <commit> :: Tag an older commit
git show v1.2.0 :: Show a tag and its commit
git push origin v1.2.0 :: Push one tag
git push --follow-tags :: Push commits and their annotated tags
git tag -d v1.2.0 :: Delete a tag locally
git push origin --delete v1.2.0 :: ! Delete a tag on the remote
git describe :: Describe HEAD relative to the latest tag

## Debugging
git blame <file> :: Who last changed each line
git blame -L 10,30 -w -C <file> :: Blame a range, ignoring whitespace and moves
git log -L :function:file :: History of a function
git bisect start HEAD <good> :: Start a binary search for a bug
git bisect good / git bisect bad :: Mark the current commit
git bisect run <command> :: Automate the search with a test command
git bisect reset :: Finish bisecting and return to your branch
git grep -n "text" :: Search tracked files
git diff --check :: Find whitespace errors and leftover conflict markers

## Advanced
git worktree add ../dir -b <branch> origin/main :: Work on another branch in a second folder
git worktree list :: List worktrees
git submodule update --init --recursive :: Check out submodules after cloning
git switch --detach <commit> :: Look at an old commit (detached HEAD)
git cat-file -p <object> :: Inspect a Git object
git ls-tree -r HEAD :: List every file in a commit's snapshot
git rev-parse HEAD :: Print the full hash of HEAD
git fsck --lost-found :: Find dangling commits and blobs
git reflog show <branch> :: A branch's history of positions
git config --global alias.st "status -sb" :: Create an alias
git range-diff main old-tip new-tip :: Compare two versions of a branch
