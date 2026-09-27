---
id: git-stash
part: 10
title: Setting Work Aside with git stash
minutes: 20
level: Intermediate
topics: 101 Why stash exists | 102 git stash | 103 Creating stashes | 104 Listing stashes
objectives:
- Explain the problem stash solves and when a commit is the better choice
- Stash tracked changes, untracked files, specific paths or chosen hunks
- Name stashes so you can find them later
- List and inspect stashes before using them
concepts: stash | stash stack | working directory | staging area | untracked file
commands: git stash | git stash push -m | git stash -u | git stash push -- <path> | git stash list | git stash show -p
---
You're in the middle of something, the working directory full of half-finished edits, and you need a clean slate **right now**: to switch branches for an urgent fix, to pull, or to try something quickly. You don't want to commit broken work, and you certainly don't want to discard it. That's what `git stash` is for.

## Why stash exists

Git refuses to switch branches or pull when uncommitted changes would be overwritten (Chapters 21 and 25). Your options are:

1. **Commit** the work in progress.
2. **Discard** it (permanent, Chapter 40).
3. **Stash** it: save it somewhere safe, clean your working directory, and bring it back later.

```diagram stash
```

:::analogy A drawer next to your desk
Your boss drops an urgent task on your desk. You sweep your current papers into a drawer (stash), deal with the urgent task on a clear desk, then take the papers back out (pop) exactly as they were. The drawer can hold several piles, most recent on top.
:::

## Your first stash

```bash
$ git status -s
 M src/checkout.js
M  src/cart.js

$ git stash
Saved working directory and index state WIP on feature/coupons: 8d1c4e2 Add coupon field

$ git status -s
$
```

```cmd
git stash
stash :: Save your uncommitted changes (staged and unstaged, tracked files only by default) onto the stash stack, then reset the working directory and staging area to HEAD. Short for "git stash push".
```

Your working directory is now clean, matching HEAD. Both the unstaged change to `checkout.js` and the staged change to `cart.js` are saved in the stash.

Now you can switch branches, pull or experiment freely. When you're back:

```bash
$ git stash pop
```

and your changes return (Chapter 45 covers applying in detail).

## What gets stashed

| Command | Stashes |
|---|---|
| `git stash` | Modified and staged **tracked** files |
| `git stash -u` (`--include-untracked`) | Also **untracked** files |
| `git stash -a` (`--all`) | Also **ignored** files (rarely wanted) |
| `git stash push -- src/cart.js` | Only the listed paths |
| `git stash -p` | Only the hunks you choose interactively |
| `git stash --staged` | Only what's staged (Git 2.35+) |
| `git stash --keep-index` | Everything, but leave staged changes in place too |

:::warning New files are left behind by default
Plain `git stash` ignores untracked files. They stay in your working directory and follow you to the next branch, which can be confusing (and can cause "would be overwritten" errors if the other branch has a file with the same name). If you created new files, use `git stash -u`.
:::

## Naming your stashes

The default description, `WIP on <branch>: <last commit>`, tells you almost nothing a week later. Add a message:

```bash
$ git stash push -m "half-done coupon validation"
Saved working directory and index state On feature/coupons: half-done coupon validation
```

## Listing stashes

Stashes form a stack. The newest is `stash@{0}`; older ones move down as you add more.

```bash
$ git stash list
stash@{0}: On feature/coupons: half-done coupon validation
stash@{1}: WIP on main: 819c495 Tweak prices
stash@{2}: On feature/search: experiment with debounce
```

Each line shows the stash reference, the branch you were on, and the message.

:::note Stashes aren't tied to branches
The branch name in the list is just a note of where you were. You can apply any stash on any branch.
:::

## Inspecting a stash

Look before you apply:

```bash
$ git stash show                  # summary of files, for stash@{0}
 src/cart.js     | 4 ++--
 src/checkout.js | 9 +++++++++

$ git stash show -p stash@{1}     # full diff of a specific stash
$ git stash show -u stash@{0}     # include untracked files in the summary (Git 2.32+)
```

## Stash versus a WIP commit

A throwaway commit is often better than a stash:

| | Stash | WIP commit on your branch |
|---|---|---|
| Speed | One command | Two (`add`, `commit`) |
| Tied to a branch | No, floats freely | Yes, stays with the branch |
| Visible | Only in `git stash list` | In `git log`, and on GitHub if pushed |
| Backed up by push | **No**, stashes are local only | Yes, if you push the branch |
| Easy to forget | Very | Less so |
| Cleaning up | `pop` | `git reset --soft HEAD~1` or squash later |

Rule of thumb: **stash for minutes, commit for hours**. Quick interruptions (pull, a five-minute check on another branch) suit stash. If you might not come back until tomorrow, commit to your branch (and push it).

## Try it

The sandbox doesn't model file contents, so it can't stash. Try it for real in the exercise.

:::recap
### What you learned
- `git stash` saves uncommitted changes to tracked files and cleans your working directory.
- `-u` includes untracked files, `-a` ignored ones, `-- <path>` limits to paths, `-p` to hunks, `--staged` to staged changes.
- `git stash push -m "message"` makes stashes findable.
- `git stash list` shows the stack, newest first as `stash@{0}`; `git stash show -p` shows the diff.
- Stashes are local and easy to forget; for longer interruptions, commit instead.

### Key terms
```terms
Stash :: A saved set of uncommitted changes, stored separately from branches.
Stash stack :: The list of stashes, newest at stash@{0}.
stash@{n} :: The reference to the nth most recent stash.
WIP :: Work in progress; the default label on unnamed stashes.
```

### Key commands
```commands
git stash :: Stash tracked changes and clean the working directory.
git stash -u :: Also stash untracked files.
git stash push -m "msg" :: Stash with a descriptive message.
git stash push -- <path> :: Stash only some files.
git stash list :: List stashes.
git stash show -p [stash@{n}] :: Show a stash's full diff.
```

### Common mistakes
- Stashing without `-u` and leaving new files behind.
- Accumulating a dozen unnamed stashes and forgetting what they are.
- Using stash as long-term storage; stashes are never pushed.

### Quick quiz
```quiz
? [state] You have a modified tracked file and a new untracked file. You run git stash. What does git status show afterwards?
+ Only the untracked file
- Nothing; the working directory is completely clean
- Only the modified file
- Both files
> Plain stash ignores untracked files. Use -u to include them.

? Which stash is stash@{0}?
+ The most recently created one
- The oldest one
- The one made on main
- The one with the longest message
> Stashes form a stack; new ones push older ones down.

? [scenario] You need to switch to fix a production bug and expect to be back in 10 minutes. Your edits aren't ready to commit. Best option?
+ git stash -u, switch, fix, switch back, git stash pop
- git reset --hard
- Delete your changes and rewrite them later
- git commit --amend onto someone else's commit
> A short interruption is exactly what stash is for.

? [tf] Stashes are pushed to GitHub with git push.
- True
+ False
> Stashes live only in your local repository. Push a branch if you need a backup.
```

### Practical exercise
````exercise Stash and inspect
In a practice repository:
1. Modify a tracked file and create a new file.
2. Run `git stash` and check status. Then stash again with `-u` and a message.
3. List stashes and show the full diff of the named one.
4. Keep both stashes for the next chapter's exercise.
---solution---
```bash
$ echo "change" >> README.md && echo "new" > draft.md
$ git stash && git status -s         # ?? draft.md remains
$ git stash push -u -m "draft notes"
$ git status -s                      # clean
$ git stash list                     # stash@{0}: On main: draft notes / stash@{1}: WIP on main: ...
$ git stash show -p -u stash@{0}     # shows draft.md's content
```
````

### What to learn next
Next: getting stashed work back with apply and pop, dealing with conflicts, dropping stashes, and a few best practices.
:::
