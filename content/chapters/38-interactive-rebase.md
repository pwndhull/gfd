---
id: interactive-rebase
part: 8
title: Interactive Rebase
minutes: 28
level: Advanced
topics: 81 Interactive rebase | 82 Squashing commits | 83 Reordering commits | 84 Editing commits
objectives:
- Open an interactive rebase for the right range of commits
- Use pick, reword, edit, squash, fixup and drop
- Squash messy commits into meaningful ones before review
- Reorder commits and split one commit into several
- Use fixup commits with --autosquash for effortless cleanup
concepts: interactive rebase | squash | fixup | reword | todo list | autosquash
commands: git rebase -i | git commit --fixup | git rebase -i --autosquash | git rebase --continue | git rebase --abort
---
Interactive rebase is the editing room for your commits. Before you open a pull request, you can combine checkpoints into meaningful steps, fix old messages, reorder, drop dead ends and split commits that do too much. Reviewers see a clean, logical story; you keep the freedom to commit messily while working.

Everything here rewrites history, so apply the golden rule from Chapter 37: **use it on commits that only you have**, typically your feature branch before (or during, with care) review.

## Starting an interactive rebase

```cmd
git rebase -i origin/main
rebase :: Replay commits.
-i :: Interactive: before replaying, open an editor listing the commits so you can decide what happens to each.
origin/main :: The base. Every commit on your branch after this point is listed.
```

Common ways to choose the range:

| Command | Edits |
|---|---|
| `git rebase -i origin/main` | Every commit on your branch that isn't on `main` (usual choice) |
| `git rebase -i HEAD~3` | The last three commits |
| `git rebase -i a91be03` | Every commit after `a91be03` (not including it) |

Git opens your editor with a **todo list**, oldest commit first:

```text title="git-rebase-todo"
pick a91be03 Add password reset form
pick 3c9e1a0 wip
pick 77a1b20 Add reset token generation
pick e4c9b18 fix typo in form label
pick 5d2f90b more token stuff

# Rebase 8d1c4e2..5d2f90b onto 8d1c4e2 (5 commands)
#
# Commands:
# p, pick <commit> = use commit
# r, reword <commit> = use commit, but edit the commit message
# e, edit <commit> = use commit, but stop for amending
# s, squash <commit> = use commit, but meld into previous commit
# f, fixup [-C | -c] <commit> = like "squash" but keep only the previous
#                    commit's log message, unless -C is used, in which case
#                    keep only this commit's message; -c is same as -C but
#                    opens the editor
# x, exec <command> = run command (the rest of the line) using shell
# b, break = stop here (continue rebase later with 'git rebase --continue')
# d, drop <commit> = remove commit
# ...
# These lines can be re-ordered; they are executed from top to bottom.
#
# If you remove a line here THAT COMMIT WILL BE LOST.
#
# However, if you remove everything, the rebase will be aborted.
```

**Note the order: oldest at the top.** That's the reverse of `git log`. Git executes the list top to bottom, replaying each commit with the action you choose. Edit the words at the start of each line, save and close the editor, and Git carries it out.

## The actions

| Action | Short | Does |
|---|---|---|
| `pick` | `p` | Keep the commit as it is |
| `reword` | `r` | Keep the changes, stop to let you edit the message |
| `edit` | `e` | Replay the commit, then pause so you can amend it or split it |
| `squash` | `s` | Combine into the **previous** commit, and let you edit the combined message |
| `fixup` | `f` | Combine into the previous commit, **discarding** this commit's message |
| `drop` | `d` | Remove the commit entirely (deleting the line does the same) |
| `exec` | `x` | Run a shell command at this point (for example, the tests) |
| `break` | `b` | Pause here; continue with `git rebase --continue` |

## Squashing commits

Turn the five messy commits above into two clean ones:

```text title="git-rebase-todo (edited)"
pick a91be03 Add password reset form
fixup e4c9b18 fix typo in form label
pick 77a1b20 Add reset token generation
fixup 3c9e1a0 wip
fixup 5d2f90b more token stuff
```

What changed:

- `fix typo in form label` was **moved up** under the form commit it belongs to and marked `fixup`, so it melts into it silently.
- `wip` and `more token stuff` became `fixup`s of the token commit.

Save and close. Git replays everything:

```bash
Successfully rebased and updated refs/heads/feature/password-reset.
$ git log --oneline origin/main..
c07a1e4 Add reset token generation
5d2f90b Add password reset form
```

Use `squash` instead of `fixup` when the later commit's message contains something worth keeping: Git opens the editor with both messages so you can write a combined one.

:::tip GitHub can squash for you
If your team uses **Squash and merge**, the whole PR becomes one commit on `main` anyway. Interactive rebase still helps reviewers read your PR commit by commit, and is essential when the team keeps individual commits (merge commits or rebase-and-merge).
:::

## Reordering commits

Move lines. Git replays them in the new order:

```text
pick 77a1b20 Add reset token generation
pick a91be03 Add password reset form
```

Reordering works when the commits are independent. If a later commit depends on changes from an earlier one, you'll get a conflict when Git replays it out of order. Resolve it (next chapter), or abort and keep the original order.

## Rewording messages

```text
reword 5d2f90b Add pasword reset form
pick   c07a1e4 Add reset token generation
```

Git stops at the `reword` commit and opens your editor with its message. Fix it, save, and the rebase continues. (For the **latest** commit, `git commit --amend` is simpler.)

## Editing a commit's content

Mark a commit `edit`:

```text
edit 5d2f90b Add password reset form
pick c07a1e4 Add reset token generation
```

Git replays it and stops:

```bash
Stopped at 5d2f90b...  Add password reset form
You can amend the commit now, with

  git commit --amend

Once you are satisfied with your changes, run

  git rebase --continue
```

You're now "at" that commit, as if it were the latest one. Change files, then:

```bash
$ git add src/auth/reset-form.js
$ git commit --amend --no-edit
$ git rebase --continue
```

### Splitting a commit

`edit` is also how you split a commit that does two things:

```bash
# stopped at the commit to split
$ git reset HEAD~                     # undo the commit, keep its changes unstaged
$ git add src/auth/reset-form.js
$ git commit -m "Add password reset form"
$ git add src/auth/email.js
$ git commit -m "Send password reset email"
$ git rebase --continue
```

`git reset HEAD~` (mixed reset, Chapter 41) moves the branch back one commit and unstages its changes, so you can commit them again in pieces.

## Fixup commits and --autosquash

The smoothest cleanup happens as you work. When you notice a bug in an earlier commit on your branch, commit the fix pointed at that commit:

```bash
$ git log --oneline origin/main..
c07a1e4 Add reset token generation
5d2f90b Add password reset form
# ... fix a bug in the form ...
$ git add src/auth/reset-form.js
$ git commit --fixup 5d2f90b
[feature/password-reset 9e2d1f0] fixup! Add password reset form
```

Later:

```bash
$ git rebase -i --autosquash origin/main
```

Git pre-arranges the todo list, moving `fixup! Add password reset form` directly under its target and marking it `fixup`. You just save and close. Set it as the default with `git config --global rebase.autoSquash true`.

## Running tests at every step

`exec` runs a command after replaying each commit, stopping if it fails. Checking that every commit builds is useful before merging, and essential if you care about `git bisect` (Chapter 63):

```bash
$ git rebase -i --exec "npm test" origin/main
```

## Safety net

- **Abort anytime** while the rebase is in progress: `git rebase --abort` restores the branch exactly as it was.
- **Undo after it finished**: `git reset --hard ORIG_HEAD`, or find the old tip in `git reflog`.
- **Pushed already?** After rewriting your own feature branch, push with `git push --force-with-lease`, and mention it in the PR if people are reviewing.

:::recap
### What you learned
- `git rebase -i <base>` opens a todo list of your commits, oldest first, and replays them per your instructions.
- `pick` keeps, `reword` edits the message, `edit` pauses to amend or split, `squash` and `fixup` combine into the previous commit, `drop` removes.
- Move lines to reorder; dependent commits may conflict.
- `git commit --fixup <hash>` plus `--autosquash` makes cleanup nearly automatic.
- `--exec` runs tests at each step. Abort with `--abort`; undo with `ORIG_HEAD` or the reflog.

### Key terms
```terms
Interactive rebase :: A rebase where you choose what happens to each commit via a todo list.
Todo list :: The editable list of commits and actions interactive rebase executes top to bottom.
Squash :: Combine a commit into the previous one, merging their messages.
Fixup :: Combine a commit into the previous one, discarding its message.
Autosquash :: Automatic arrangement of fixup! and squash! commits in the todo list.
```

### Key commands
```commands
git rebase -i origin/main :: Edit all commits on your branch.
git rebase -i HEAD~n :: Edit the last n commits.
git commit --fixup <hash> :: Record a fix for an earlier commit.
git rebase -i --autosquash <base> :: Fold fixup commits in automatically.
git rebase --continue / --abort :: Proceed after a stop / cancel entirely.
git rebase -i --exec "<cmd>" <base> :: Run a command after each commit.
```

### Common mistakes
- Forgetting that the todo list is oldest-first.
- Marking the **first** line as `squash` or `fixup` (there's no previous commit to combine into; Git refuses).
- Deleting a line by accident, which drops that commit.
- Interactive rebasing a shared branch.

### Quick quiz
```quiz
? In the interactive rebase todo list, where is the most recent commit?
- At the top
+ At the bottom
- It isn't listed
- Sorted by author
> The list is oldest first, because Git replays it top to bottom.

? [predict] What will the result be?
| pick a1 Add form
| fixup b2 Fix typo
| pick c3 Add token
- Three commits
+ Two commits: "Add form" (including the typo fix) and "Add token"
- One commit
- An error because fixup must be last
> fixup melts b2 into the commit above it, discarding b2's message.

? What's the difference between squash and fixup?
+ squash lets you combine both messages; fixup keeps only the earlier commit's message
- fixup deletes the changes
- squash only works on the last commit
- There is no difference
> Both combine changes into the previous commit; they differ in what happens to the message.

? [scenario] You want to split one commit into two. Which action do you mark it with?
- reword
- squash
+ edit, then git reset HEAD~ and commit in pieces before continuing
- drop
> edit pauses at the commit; a mixed reset unpacks it so you can commit the parts separately.

? [tf] git rebase --abort can undo a rebase after it has finished successfully.
- True
+ False
> --abort only works while a rebase is in progress. Afterwards, use git reset --hard ORIG_HEAD or the reflog.
```

### Practical exercise
````exercise Clean up a messy branch
In a practice repository, create a branch with five commits: "Add form", "wip", "Add token", "fix typo", "more token". Make "fix typo" touch the form file.
1. Interactive-rebase so you end with exactly two commits: form and token, with good messages.
2. Then add a small fix for the form using `git commit --fixup` and fold it in with `--autosquash`.
---solution---
```bash
$ git rebase -i main
# edit the todo list to:
#   pick   <hash> Add form
#   fixup  <hash> fix typo
#   pick   <hash> Add token
#   fixup  <hash> wip
#   fixup  <hash> more token
$ git log --oneline main..            # two commits
$ echo "fix" >> form.txt && git add form.txt
$ git commit --fixup <hash-of-Add-form>
$ git rebase -i --autosquash main     # just save and close the pre-arranged list
$ git log --oneline main..            # still two commits
```
If "wip" touched the form file rather than the token file, move it under "Add form" instead. Put each fixup under the commit it belongs to.
````

### What to learn next
Rebases can stop for conflicts, just like merges, sometimes several times. The last chapter of Part 8 covers resolving, skipping and aborting them.
:::
