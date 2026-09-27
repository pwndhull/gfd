---
id: what-is-rebase
part: 8
title: What Rebase Does
minutes: 22
level: Intermediate
topics: 78 What is rebase? | 79 Rebase mental model
objectives:
- Explain rebase as replaying commits onto a new base
- Predict the graph after a rebase, including which commits are new
- Explain why rebased commits have new hashes and what happens to the originals
- Run a basic rebase to update a feature branch from main
concepts: rebase | merge base | upstream | rewriting history | reflog | detached HEAD
commands: git rebase <branch> | git rebase --onto | git reflog
---
Merging combines two lines of history with a merge commit. **Rebasing** takes a different approach: it moves your work so it starts from a newer point, as if you had begun it later. The result is a straight, tidy history, and a few rules you must respect. This chapter builds the mental model; the next decides when to use it.

## Rebase in one sentence

**`git rebase main` takes the commits on your branch that aren't on `main`, and replays them, one by one, on top of `main`'s latest commit.**

```cmd
git rebase main
git :: The Git program.
rebase :: Re-apply the current branch's own commits on top of another base commit.
main :: The new base (called the upstream). Your commits will be replayed after its tip.
```

## The mental model

You already know two facts that make rebase easy to understand:

1. **A branch is just a movable label** (Chapter 24).
2. **Commits can't be changed**, only replaced by new commits with new hashes (Chapter 28).

So rebase can't literally "move" commits. What it does:

```snap Before: feature/login branched from B; main has moved on
git commit -m "Initial commit"
git commit -m "Add homepage"
git switch -c feature/login
git commit -m "Add login form"
git commit -m "Validate password"
git switch main
git commit -m "Fix header spacing"
git switch feature/login
```

```snap After: git rebase main (on feature/login)
git commit -m "Initial commit"
git commit -m "Add homepage"
git switch -c feature/login
git commit -m "Add login form"
git commit -m "Validate password"
git switch main
git commit -m "Fix header spacing"
git switch feature/login
git rebase main
```

Step by step, Git:

1. Finds the commits on `feature/login` that aren't on `main`: C and D (everything after the merge base B).
2. Moves HEAD to `main`'s tip, E (temporarily detached).
3. Replays C's changes on top of E, creating a **new** commit C′ with the same message and author.
4. Replays D's changes on top of C′, creating D′.
5. Moves the `feature/login` label to D′ and re-attaches HEAD.

C′ and D′ contain the same *changes* as C and D, but they have different parents, so different snapshots and different hashes. The original C and D still exist (shown faded), no longer on any branch.

:::analogy Re-stacking plates
You were stacking your plates (commits) on top of plate B. Meanwhile, someone added plate E to the main stack. Rebase lifts your plates off, one at a time, and places each on top of E. They're the same designs, but each is now sitting on a different plate, and in Git, what's underneath is part of a commit's identity. So each is technically a new plate.
:::

## A real rebase

```bash
$ git switch feature/login
$ git rebase main
Successfully rebased and updated refs/heads/feature/login.

$ git log --oneline --graph --all
* ee266ce (HEAD -> feature/login) Validate password
* 76d55db Add login form
* 2c64949 (main) Fix header spacing
* 7be20d4 Add homepage
* e4c9b18 Initial commit
```

The history is a straight line. If you now merge `feature/login` into `main`, it's a fast-forward: no merge commit needed.

## Where did the old commits go?

Rebase doesn't delete anything. The reflog records every step:

```bash
$ git reflog -n 5
ee266ce HEAD@{0}: rebase (finish): returning to refs/heads/feature/login
ee266ce HEAD@{1}: rebase (pick): Validate password
76d55db HEAD@{2}: rebase (pick): Add login form
2c64949 HEAD@{3}: rebase (start): checkout main
a91be03 HEAD@{4}: checkout: moving from main to feature/login
```

`a91be03` at `HEAD@{4}` was the original tip, D. To undo the whole rebase:

```bash
$ git reset --hard a91be03          # or: git reset --hard ORIG_HEAD
```

`ORIG_HEAD` is set to your branch's old tip when a rebase starts, so right after a rebase it's the quickest undo. Chapter 43 covers the reflog fully.

## Rebase changes identity, and that matters

Because rebased commits are new commits:

- **Anyone who has the old commits now has a different history from you.** If `feature/login` was pushed and a teammate based work on D, their D and your D′ are strangers to Git.
- **A normal push is rejected**, since the remote's D isn't an ancestor of D′. You'd need `--force-with-lease` (Chapter 22).

This leads to the most important rule in Part 8, explained fully in the next chapter:

:::danger The golden rule
**Don't rebase commits that other people have based work on.** Rebase your own local commits and your own unshared branches freely. Once a branch is shared, coordinate before rewriting it.
:::

## Where does "upstream" fit?

`git rebase` with no argument rebases onto the current branch's upstream (for example `origin/feature/login`). More commonly you'll name the base:

| Command | Replays your commits onto |
|---|---|
| `git rebase main` | Your local `main` |
| `git rebase origin/main` | The server's `main` as of your last fetch (usually what you want) |
| `git pull --rebase` | Your upstream, after fetching (Chapter 21) |

The everyday version for updating a feature branch:

```bash
$ git fetch
$ git rebase origin/main
```

## Advanced: rebase --onto

Occasionally you want to move a range of commits to a completely different base, for example because you branched from the wrong branch:

```graph You branched from feature/a by mistake
A---B   main
     \
      C---D   feature/a
           \
            E---F   feature/b (should be based on main)
```

```bash
$ git rebase --onto main feature/a feature/b
```

Read it as: "take the commits in `feature/b` that aren't in `feature/a` (E and F) and replay them onto `main`."

```graph After rebase --onto
      E'--F'   feature/b
     /
A---B   main
     \
      C---D   feature/a
```

## Try it

Run `git rebase main` in the sandbox and watch C and D fade while C′ and D′ appear on top of E. Then switch to `main` and merge: it fast-forwards.

```viz rebase
```

:::recap
### What you learned
- `git rebase X` replays your branch's commits (those not on X) on top of X's tip.
- Replayed commits are new commits with new hashes; the originals remain, unreachable, and are recoverable through the reflog or `ORIG_HEAD`.
- After a rebase, merging the branch into its base is a fast-forward, giving linear history.
- Rewriting commits others have is disruptive: don't rebase shared history without coordinating.
- `git rebase --onto new-base old-base branch` moves a specific range of commits.

### Key terms
```terms
Rebase :: Replaying commits on top of a different base commit.
Upstream (rebase) :: The branch or commit you rebase onto.
Replay :: Re-applying a commit's changes on a new parent, creating a new commit.
ORIG_HEAD :: Your branch's previous tip, set when a rebase starts.
Linear history :: A history with no merge commits: one straight line.
```

### Key commands
```commands
git rebase <branch> :: Replay current branch's commits onto <branch>.
git fetch && git rebase origin/main :: Update a feature branch from the latest main.
git rebase --onto <new> <old> <branch> :: Move a range of commits to a new base.
git reset --hard ORIG_HEAD :: Undo a just-finished rebase.
```

### Common mistakes
- Thinking rebase moves commits unchanged; they are new commits with new hashes.
- Rebasing a branch teammates are using.
- Pulling after rebasing a pushed branch, which merges the old commits back in.

### Quick quiz
```quiz
? [state] feature has commits C and D on top of B. main has moved to E (parent B). You run git rebase main on feature. What is feature's history afterwards?
+ A-B-E-C'-D'
- A-B-C-D-E
- A-B-C-D with a merge commit to E
- A-B-E, with C and D deleted
> Your commits are replayed after main's tip as new commits C′ and D′.

? [tf] After a rebase, the original commits are immediately and permanently deleted.
- True
+ False
> They remain in the object database and the reflog until garbage collection, so the rebase can be undone.

? Why does a normal push fail after rebasing a branch you'd already pushed?
- Rebased branches can't be pushed
+ The remote's old tip isn't an ancestor of your new tip, so it's not a fast-forward
- The remote needs to be fetched first
- Rebase deletes the upstream setting
> The remote still has the pre-rebase commits. A lease-protected force push is needed, and only if the branch is yours alone.

? [scenario] You branched feature/b from feature/a by mistake, and want feature/b's own commits on top of main instead. Which command?
+ git rebase --onto main feature/a feature/b
- git rebase main
- git merge main
- git cherry-pick feature/a
> --onto replays commits reachable from feature/b but not from feature/a onto main.
```

### Practical exercise
````exercise Rebase a feature branch
In a practice repository:
1. Create `feature` from main with two commits touching `feature.txt`.
2. On `main`, commit a change to a different file.
3. Rebase `feature` onto `main`. Compare hashes before and after with `git log --oneline`.
4. Undo the rebase with `ORIG_HEAD`, then redo it.
5. Merge `feature` into `main` and confirm it fast-forwards.
---solution---
```bash
$ git switch -c feature && echo 1 > feature.txt && git add . && git commit -m "Feature 1"
$ echo 2 >> feature.txt && git commit -am "Feature 2"
$ git log --oneline -2                 # note the hashes
$ git switch main && echo m > main.txt && git add . && git commit -m "Main work"
$ git switch feature && git rebase main
$ git log --oneline -3                 # same messages, new hashes, on top of "Main work"
$ git reset --hard ORIG_HEAD           # back to the original commits
$ git rebase main
$ git switch main && git merge feature # Fast-forward
```
````

### What to learn next
Rebase and merge both integrate work. The next chapter compares them head to head and gives you clear rules for when each is the right tool, and when rebase is dangerous.
:::
