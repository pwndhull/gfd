---
id: using-stashes
part: 10
title: Applying, Popping and Dropping Stashes
minutes: 18
level: Intermediate
topics: 105 Applying stashes | 106 Popping stashes | 107 Dropping stashes | 108 Stash best practices
objectives:
- Restore stashed work with apply or pop and explain the difference
- Restore the staged/unstaged split with --index
- Resolve conflicts when a stash doesn't apply cleanly
- Drop, clear and recover stashes
- Turn a stash into a branch when it has grown into real work
concepts: stash | stash stack | merge conflict | dangling commit
commands: git stash apply | git stash pop | git stash apply --index | git stash drop | git stash clear | git stash branch
---
Putting work aside is half the job. This chapter covers bringing it back, cleaning up, and the habits that keep stashes from becoming a graveyard of forgotten work.

## apply versus pop

Both reapply a stash's changes to your current working directory. The difference is what happens to the stash afterwards:

| Command | Reapplies changes | Removes the stash from the list |
|---|---|---|
| `git stash apply` | Yes | **No** (keep it; you could apply it again elsewhere) |
| `git stash pop` | Yes | **Yes**, but only if it applied without conflicts |

```bash
$ git stash pop
On branch feature/coupons
Changes not staged for commit:
	modified:   src/cart.js
	modified:   src/checkout.js
Dropped refs/stash@{0} (1a37c999c821ffe18e741e5fbeade26c4812b975)
```

Both default to `stash@{0}`. Name another:

```bash
$ git stash apply stash@{2}
$ git stash pop stash@{1}
```

`apply` is the cautious choice when you're applying to a different branch than you stashed from, or you're not sure it'll go cleanly: if something goes wrong, the stash is still there.

## Restoring what was staged

By default, reapplied changes all come back **unstaged**, even the ones you had staged before stashing. To restore the exact staged/unstaged split:

```bash
$ git stash pop --index
```

If the staged part can't be restored cleanly, Git reports it; retry without `--index`.

## When a stash conflicts

A stash is applied with a merge, so if the files changed since you stashed (you switched branch, or pulled), it can conflict:

```bash
$ git stash pop
Auto-merging src/cart.js
CONFLICT (content): Merge conflict in src/cart.js
The stash entry is kept in case you need it again.
```

Note the last line: **pop doesn't drop a stash that conflicted**. Resolve the conflict markers as usual (Chapter 35), then:

```bash
$ git add src/cart.js          # marks resolved (this stages it)
$ git restore --staged src/cart.js   # optional: unstage if you don't want it staged
$ git stash drop               # remove the stash now that it's applied
```

If it's a mess, reset the files (`git restore .` or `git reset --hard` from a state where you've nothing else to lose) and try applying on a different branch; the stash is still safe in the list.

## Dropping and clearing

```bash
$ git stash drop                 # drop stash@{0}
$ git stash drop stash@{2}       # drop a specific one
Dropped stash@{2} (e737322ae3aaa439d3870bc9e070b97e71328918)
$ git stash clear                # drop ALL stashes
```

:::danger git stash clear has no confirmation
It removes every stash at once. Check `git stash list` first.
:::

### Recovering a dropped stash

The drop message prints the stash's commit hash. While it's still in your terminal:

```bash
$ git stash apply e737322ae3aaa439d3870bc9e070b97e71328918
```

If it's scrolled away, dropped stashes are "dangling commits" that `git fsck` can find (Chapter 43):

```bash
$ git fsck --no-reflog | grep "dangling commit"
dangling commit e737322ae3aaa439d3870bc9e070b97e71328918
$ git show e737322          # inspect; stash commits have messages like "WIP on main: ..."
$ git stash apply e737322
```

This works until garbage collection removes them, usually a couple of weeks at least.

## Turning a stash into a branch

A stash that has grown into "real work", or one that no longer applies cleanly on your current branch, is best rescued onto its own branch:

```bash
$ git stash branch feature/validation stash@{1}
Switched to a new branch 'feature/validation'
...
Dropped stash@{1} (…)
```

```cmd
git stash branch feature/validation stash@{1}
stash branch :: Create a new branch at the commit where the stash was originally made, check it out, apply the stash there, and drop it if that succeeds.
feature/validation :: The new branch's name.
stash@{1} :: Which stash (default stash@{0}).
```

Because the branch starts from the exact commit you stashed on, the stash applies without conflicts. Then commit it properly.

## Stash best practices

1. **Always add a message**: `git stash push -m "what and why"`.
2. **Include untracked files** when you've created any: `-u`.
3. **Prefer pop right away**, on the same branch, soon after stashing.
4. **Keep the list short.** Review `git stash list` weekly; drop or branch anything old.
5. **Stash for minutes, commit for hours.** A WIP commit on your branch (and a push) is safer for anything overnight.
6. **Use `apply` when unsure**, then `drop` once you've confirmed it worked.
7. **Don't rely on stash for backups.** Stashes aren't pushed or cloned.

### Useful shortcuts elsewhere

Some commands can stash for you automatically:

```bash
$ git pull --rebase --autostash          # stash, pull, pop
$ git rebase --autostash origin/main     # stash, rebase, pop
$ git switch -m other-branch             # carry changes across by merging them in (conflicts possible)
```

Set `git config --global rebase.autoStash true` to make rebases always do this.

:::recap
### What you learned
- `apply` reapplies a stash and keeps it; `pop` reapplies and drops it (unless there's a conflict).
- `--index` restores which changes were staged.
- Stash conflicts are resolved like merge conflicts; drop the stash manually afterwards.
- `git stash drop` removes one; `git stash clear` removes all; dropped stashes can be recovered from the printed hash or `git fsck`.
- `git stash branch` turns a stash into a branch at its original commit.
- Name stashes, include untracked files, keep the list short, and commit instead of stashing for long interruptions.

### Key terms
```terms
Apply :: Reapply a stash's changes and keep the stash.
Pop :: Reapply a stash's changes and remove it if successful.
Drop :: Delete a stash entry.
Stash branch :: A new branch created from a stash's original commit with the stash applied.
Autostash :: Automatic stash-and-restore around a pull or rebase.
```

### Key commands
```commands
git stash apply [stash@{n}] :: Reapply, keep the stash.
git stash pop [stash@{n}] :: Reapply and drop.
git stash pop --index :: Also restore staged state.
git stash drop [stash@{n}] :: Delete a stash.
git stash clear :: Delete all stashes.
git stash branch <name> [stash@{n}] :: Turn a stash into a branch.
```

### Common mistakes
- Assuming `pop` dropped a conflicted stash, then applying it again later.
- Running `git stash clear` without checking the list.
- Letting stashes pile up for months.

### Quick quiz
```quiz
? [state] git stash pop reports a conflict. Is the stash still in git stash list?
+ Yes; pop only drops the stash if it applies cleanly
- No; pop always drops
- It's moved to the reflog
- It's converted to a branch
> Git keeps it "in case you need it again". Drop it yourself once resolved.

? What is the difference between git stash apply and git stash pop?
+ apply keeps the stash in the list; pop removes it after applying successfully
- apply works only on the current branch
- pop can't be used with stash@{n}
- There is no difference
> Use apply when you want to keep the stash, for example to apply it in several places.

? [scenario] An old stash no longer applies cleanly on main, which has changed a lot. Cleanest option?
+ git stash branch rescue stash@{n}, which applies it on the commit where it was made
- git stash clear
- Force apply with --hard
- Copy the files by hand
> The new branch starts from the stash's original base, so it applies without conflicts.

? [tf] git stash pop restores which changes were staged, by default.
- True
+ False
> By default everything comes back unstaged. Add --index to restore the staged/unstaged split.
```

### Practical exercise
````exercise Pop, conflict, branch
Using the stashes from Chapter 44's exercise (or new ones):
1. Pop the newest stash and check status.
2. Stash a change to `README.md`, commit a different change to the same line, then pop. Resolve the conflict and drop the stash.
3. Turn the remaining stash into a branch with `git stash branch`.
---solution---
```bash
$ git stash pop && git status -s
$ echo "stashed line" >> README.md && git stash
$ echo "committed line" >> README.md && git commit -am "Committed line"
$ git stash pop                    # CONFLICT; the stash entry is kept
# edit README.md to the desired result
$ git add README.md && git stash drop
$ git stash branch from-stash      # applies the last stash on a new branch
```
````

### What to learn next
Part 11 introduces cherry-pick: copying a single commit from one branch to another.
:::
