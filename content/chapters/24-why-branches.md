---
id: why-branches
part: 5
title: Why Branches Exist
minutes: 18
level: Beginner
topics: 47 Why branches exist | 56 Branch mental model
objectives:
- Describe the problems branches solve for individuals and teams
- Explain a branch as a movable pointer and use that model to predict behaviour
- Explain why branches in Git are cheap and why teams create many of them
- Tell apart the branch, the commits it can reach, and the files you see
concepts: branch | HEAD | commit | main | feature branch | reachable
commands: git branch | git log --oneline --graph --all
---
You met branches as labels in Chapter 5. Part 5 turns that model into a working skill. Before any commands, it's worth being clear on **why** professional teams branch for almost everything, because the "why" determines how you should use them.

## The problems branches solve

### Parallel work without interference

Three developers work on three features at once. If they all commit to one line of history, every half-finished change affects everyone: Ana's broken experiment stops Ben's tests passing, and nobody can release anything until all three are done.

With branches, each person works on their own line. `main` stays stable. Finished work is merged into `main` when it's ready and reviewed.

### Switching context safely

You're halfway through a feature when a production bug arrives. On a branch, you commit your work-in-progress, switch to a fresh branch from `main`, fix the bug, ship it, and switch back. Your feature is exactly as you left it.

### Experiments you can throw away

Want to try a risky refactor? Make a branch. If it works, merge it. If it doesn't, delete the branch. `main` never knew it happened.

### Review before integration

On GitHub, a pull request is literally "please merge this branch into that branch". Without branches there would be nothing to review separately (Part 13).

### Releases and hotfixes

A team can keep a `release/2.4` branch stable for customers while `main` moves on toward 2.5, and fix bugs on the release line without shipping unfinished 2.5 work.

## The mental model: a branch is a movable pointer

Everything in this part follows from one sentence you already know:

**A branch is a name that points at one commit. When you commit on it, it moves to the new commit.**

Three consequences, each of which answers a common beginner question:

**1. Creating a branch copies nothing.** It writes one tiny file with a commit hash. That's why creating a branch is instant in a 10 GB repository.

**2. A branch "contains" the commits it can reach.** Git doesn't store a list of commits per branch. The commits "on" a branch are all the commits you can reach by starting at the branch's commit and following parent links backwards.

```graph Reachability
            main
              |
A---B---C---D
         \
          E---F
              |
          feature
```

`main` reaches D, C, B, A. `feature` reaches F, E, C, B, A. Commits A, B and C are on **both** branches. There's no copy: they're shared history.

**3. Deleting a branch deletes a label, not commits.** If commits become unreachable from every branch and tag, they are not destroyed immediately; Git keeps them for a while and the reflog can find them (Chapter 43). That's why deleting a branch is far less scary than it sounds.

:::analogy Sticky notes on a family tree
Draw the commit history as a family tree on a wall. Branches are sticky notes with names on them, stuck onto individual people. Adding a new sticky note doesn't draw new people. Moving a sticky note doesn't change anybody's parents. Taking a sticky note off the wall doesn't remove anybody from the tree, though someone with no sticky note nearby is easy to lose track of.
:::

## Branch, commits and files: three different things

Beginners often blur these together:

| Thing | Question | Example |
|---|---|---|
| The **branch** | Which label am I on? | `feature/login` |
| The **commits** it reaches | What history does it include? | A–B–C–E–F |
| The **files** you see | What's in my working directory? | The snapshot of F, plus any uncommitted edits |

When you switch branches, HEAD moves to the other label, and Git updates your working directory to that branch's snapshot. The files in your editor change, but nothing is lost: the other branch's snapshot is safe in its commits.

## Why Git branches are cheap, and why that matters

In older systems, a branch meant copying the project on the server, so teams branched rarely and reluctantly. In Git:

- creating a branch is writing ~41 bytes,
- switching is updating the files that differ,
- merging is usually automatic.

So the professional habit is: **one branch per task**. A bug fix, a feature, a documentation tweak, an experiment: each gets its own short-lived branch, created from an up-to-date `main`, merged through a pull request, then deleted.

## main is just a branch

`main` has no special powers in Git. It's special by **team agreement**:

- it's the default branch everyone clones and branches from,
- it's what gets deployed or released,
- on GitHub it's usually protected: no direct pushes, changes only through reviewed pull requests.

Treat `main` as the shared, always-working line. Do your work elsewhere.

## See it

The sandbox starts with two commits on `main`. Create a branch, commit on it, go back to `main` and commit there too. Watch how the "shared" commits stay shared and only labels move.

```viz branches
```

:::recap
### What you learned
- Branches let people work in parallel, switch context, experiment safely, review work and maintain releases.
- A branch is a movable pointer; creating one copies nothing.
- The commits on a branch are those reachable by following parents from its tip; many commits are on several branches at once.
- Deleting a branch removes a label; unreachable commits linger and can be recovered for a while.
- Professional habit: one short-lived branch per task, with `main` kept stable.

### Key terms
```terms
Branch :: A movable name pointing at one commit.
Reachable :: A commit is reachable from a branch if you can get to it by following parent links from the branch's commit.
Feature branch :: A short-lived branch for one task.
main :: The conventional default branch, kept stable by team agreement.
```

### Key commands
```commands
git branch :: List local branches.
git log --oneline --graph --all :: See all branches and how they relate.
```

### Common mistakes
- Thinking each branch holds a separate copy of all files.
- Working directly on `main` for everything.
- Keeping branches alive for weeks, which makes merging painful (Chapter 58).

### Quick quiz
```quiz
? [state] main points to D (A-B-C-D). feature was created at B and has commit E. Which commits are on both branches?
+ A and B
- A, B and C
- Only A
- None, each branch has its own copies
> feature reaches E, B, A. main reaches D, C, B, A. The overlap is A and B.

? [tf] Deleting a branch immediately and permanently destroys all commits that were only on it.
- True
+ False
> Unreachable commits remain for a while and can be recovered via the reflog. Deleting removes the label.

? Why do Git teams create a new branch for nearly every task?
- Because Git requires one branch per commit
+ Because branches are nearly free to create and they keep unfinished work away from main
- To make the repository larger
- Because main is read-only in Git
> Cheap branches make isolation, review and cleanup easy.

? What makes main special?
- Git treats main differently from other branches
+ Team convention and server settings such as branch protection
- It stores the full history, other branches don't
- It is the only branch that can be pushed
> Technically it's an ordinary branch. Its importance comes from how the team uses it.
```

### Practical exercise
```exercise Model it on paper, then in the sandbox
Draw the graph after this sequence, marking each branch label and HEAD:
start at A on main; commit B; create branch `fix`; commit C on main; switch to `fix`; commit D; switch to main.

Then reproduce it in the sandbox above with Empty repo and check your drawing.
---solution---
A-B on main. `fix` created at B. C is added on main (main → C). Switching to fix and committing D gives D with parent B (fix → D). Finally HEAD → main. The graph forks at B: B–C (main) and B–D (fix).
```

### What to learn next
Next, the commands: create branches, switch between them, and understand the difference between `git switch` and `git checkout`.
:::
