---
id: what-is-merging
part: 7
title: What Merging Really Does
minutes: 22
level: Intermediate
topics: 68 What is merging? | 69 Fast-forward merge | 70 Three-way merge | 71 Merge commits
objectives:
- Explain what it means to merge one branch into another
- Predict whether a merge will fast-forward or create a merge commit
- Explain how a three-way merge uses the merge base
- Read and navigate merge commits in history
concepts: merge | fast-forward | three-way merge | merge base | merge commit | first parent
commands: git merge | git merge-base | git log --graph
---
Branches let work diverge. **Merging** brings it back together. It's the most common way work flows into `main`, whether you click a button on GitHub or run `git merge` yourself. Git decides between two very different mechanisms depending on the shape of the history, and knowing which one will happen removes most of the mystery.

## What merge means

**`git merge X` means: bring the work from X into the branch I'm on.** The current branch changes; X doesn't.

```cmd
git merge feature/login
git :: The Git program.
merge :: Integrate the changes from another branch into the current branch.
feature/login :: The branch (or any commit) whose work you want to bring in.
```

That direction trips people up: to put your feature into main, you switch to main first, then merge the feature.

```bash
$ git switch main
$ git merge feature/login
```

## Case 1: fast-forward

If the branch you're on hasn't moved since the other branch split off, there's nothing to combine. Git just slides your branch label forward.

:::jargon fast-forward merge
Plain English: Git can move the branch pointer forward without creating a new merge commit, because no separate line of development needs to be combined.
:::

```snap Before: main hasn't moved
git commit -m "Initial commit"
git commit -m "Add homepage"
git switch -c feature/login
git commit -m "Add login form"
git commit -m "Validate password"
git switch main
```

```snap After: git merge feature/login
git commit -m "Initial commit"
git commit -m "Add homepage"
git switch -c feature/login
git commit -m "Add login form"
git commit -m "Validate password"
git switch main
git merge feature/login
```

```bash
$ git merge feature/login
Updating 7be20d4..a91be03
Fast-forward
 src/login.js | 58 ++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 58 insertions(+)
 create mode 100644 src/login.js
```

No new commit. `main` now points exactly where `feature/login` does. History stays a straight line.

## Case 2: three-way merge

If **both** branches have new commits since they split, Git must actually combine two sets of changes. It creates a **merge commit**.

```snap Before: both branches moved
git commit -m "Initial commit"
git commit -m "Add homepage"
git switch -c feature/login
git commit -m "Add login form"
git commit -m "Validate password"
git switch main
git commit -m "Fix header spacing"
```

```snap After: git merge feature/login
git commit -m "Initial commit"
git commit -m "Add homepage"
git switch -c feature/login
git commit -m "Add login form"
git commit -m "Validate password"
git switch main
git commit -m "Fix header spacing"
git merge feature/login
```

It's called **three-way** because Git looks at three snapshots:

1. **the merge base**: the last commit both branches share (B above),
2. **ours**: the tip of the current branch (E),
3. **theirs**: the tip of the branch being merged (D).

For each file, Git compares both sides with the base:

| Base | Ours | Theirs | Result |
|---|---|---|---|
| same | same | same | Unchanged |
| X | **changed** | X | Take ours |
| X | X | **changed** | Take theirs |
| X | **changed** | **same change** | Take it (both agree) |
| X | **changed** | **different change to the same lines** | **Conflict**: you decide (Chapter 34) |

The base is what makes this smart. Without it, Git couldn't tell whether a line differs because *you* changed it or because *they* did. With it, Git knows who changed what, and only asks you when both sides changed the same lines differently.

```bash
$ git merge-base main feature/login
7be20d4e...
```

:::internals The ort strategy
Git's default merge algorithm is called `ort` (it replaced the older `recursive` strategy in Git 2.34). That's why output says "Merge made by the 'ort' strategy." It works line by line within files, detects renames, and handles the unusual case of several possible merge bases.
:::

## Merge commits

A merge commit is a normal commit with **two parents**:

- **first parent**: the branch you were on (E: `main`'s previous tip),
- **second parent**: the branch you merged (D: `feature/login`'s tip).

Its snapshot is the combined result. Its default message is `Merge branch 'feature/login'`, and Git opens your editor to let you add detail (use `--no-edit` to accept the default).

```bash
$ git merge feature/login
Merge made by the 'ort' strategy.
 src/login.js | 58 ++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 58 insertions(+)
 create mode 100644 src/login.js

$ git log --oneline --graph -5
*   5f3b2a1 (HEAD -> main) Merge branch 'feature/login'
|\
| * a91be03 (feature/login) Validate password
| * 3c9e1a0 Add login form
* | 8d1c4e2 Fix header spacing
|/
* 7be20d4 Add homepage
```

Merge commits have real value: they record **when** a line of work joined `main`, and `git log --first-parent main` then reads like a changelog of merged features. The cost is a history with more branches and joins. Part 8 discusses when teams prefer rebasing instead.

## Which one will happen?

Ask one question: **does the current branch have commits the other branch doesn't?**

- No → fast-forward.
- Yes → three-way merge with a merge commit.
- The other branch is already fully included → "Already up to date." and nothing happens.

```bash
$ git log --oneline feature/login..main    # anything here means a merge commit is needed
```

You can override the default with `--no-ff` (always make a merge commit) or `--ff-only` (refuse unless fast-forward). The next chapter covers them.

## Try both

Run the merge in each sandbox and compare: the first slides `main` forward; the second creates a commit with two parents (drawn with a double ring).

```viz merge-ff
```

```viz merge-3way
```

:::recap
### What you learned
- `git merge X` integrates X into the current branch; switch to the receiving branch first.
- Fast-forward: the current branch hasn't moved, so Git just moves the label. No new commit.
- Three-way merge: both sides moved; Git compares base, ours and theirs and creates a merge commit.
- The merge base lets Git tell who changed what; conflicts only arise when both sides changed the same lines differently.
- A merge commit has two parents: first is the branch you were on, second is the branch you merged.

### Key terms
```terms
Merge :: Integrating another branch's changes into the current branch.
Fast-forward :: Moving a branch label forward to a descendant commit without a merge commit.
Three-way merge :: A merge that compares the merge base with both branch tips.
Merge base :: The most recent commit shared by both branches.
Merge commit :: A commit with two parents recording a merge.
ours / theirs :: The current branch's side / the merged branch's side of a merge.
```

### Key commands
```commands
git merge <branch> :: Merge a branch into the current branch.
git merge-base <a> <b> :: Show the merge base.
git log --oneline --graph :: Visualise merges.
git log --first-parent :: Follow only the main line of merges.
```

### Common mistakes
- Running `git merge main` while on `main` intending to merge a feature (switch to the target first).
- Expecting a merge commit when a fast-forward happens, or vice versa.
- Thinking merge "copies" commits. Fast-forward moves a label; three-way adds one new commit.

### Quick quiz
```quiz
? [state] main is at B. feature/x branched from B and has C and D. main has no new commits. You run git merge feature/x on main. What happens?
+ main fast-forwards to D; no merge commit
- A merge commit with parents B and D is created
- C and D are copied onto main as new commits
- Nothing, it's already up to date
> main hasn't moved since feature/x branched, so its label can simply move forward.

? Why does Git need the merge base for a three-way merge?
- To choose the commit message
+ To tell which side changed each line, so it can combine non-overlapping changes automatically
- To decide which branch to delete
- To compress the history
> Comparing both tips with their common ancestor reveals who changed what.

? [predict] What does this graph line show?
| *   5f3b2a1 (HEAD -> main) Merge branch 'feature/login'
| |\
+ A merge commit with two parents, the second coming from feature/login
- A commit with a conflict
- A rebased commit
- A tag
> The |\ shows two parent lines joining at the merge commit.

? [tf] git merge feature on main changes the feature branch.
- True
+ False
> Only the current branch (main) moves.

? You want to know if merging feature into main will need a merge commit. What do you check?
+ Whether main has commits that feature doesn't: git log feature..main
- Whether feature has commits: git log main..feature
- git status
- git merge-base --all
> If main has its own commits, the histories diverged and a merge commit is needed.
```

### Practical exercise
````exercise Produce both kinds of merge
In a practice repository:
1. Create `feature/a` from main, commit twice, switch to main and merge. Which kind of merge happened?
2. Create `feature/b` from main, commit once. Switch to main, commit once. Merge `feature/b`. Which kind now?
3. Look at `git log --oneline --graph` and identify the merge commit's two parents with `git rev-parse HEAD^1 HEAD^2`.
---solution---
```bash
$ git switch -c feature/a && echo 1 > a1 && git add a1 && git commit -m a1 && echo 2 > a2 && git add a2 && git commit -m a2
$ git switch main && git merge feature/a          # Fast-forward
$ git switch -c feature/b && echo b > b && git add b && git commit -m b
$ git switch main && echo m > m && git add m && git commit -m m
$ git merge --no-edit feature/b                    # Merge made by the 'ort' strategy.
$ git log --oneline --graph -5
$ git rev-parse HEAD^1 HEAD^2                      # main's previous tip, then feature/b's tip
```
````

### What to learn next
Next, the `git merge` command in detail: its options, messages, squash merges and how GitHub's merge buttons map onto them.
:::
