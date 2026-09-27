---
id: commits-branches-head
part: 1
title: Commits, Branches and HEAD
minutes: 22
level: Beginner
topics: 12 Commit | 13 Branch | 14 HEAD
objectives:
- Describe what a commit contains and how commits link into a history
- Explain why a branch is just a movable label, and why that makes branches cheap
- Explain what HEAD is and how it moves when you commit or switch
- Read a simple commit graph with branches and HEAD marked
concepts: commit | parent commit | commit hash | branch | HEAD | detached HEAD | main
commands: git log --oneline | git branch | git switch
---
Chapter 4 gave you the three *places*. This chapter gives you the three *pointers* that describe your history: commits link to each other, branches point at commits, and HEAD points at a branch. With these, you can read any commit graph a teammate draws on a whiteboard.

## Commits: snapshots linked into a chain

A **commit** is a recorded snapshot of the whole project. Each commit stores:

- a pointer to the snapshot of every tracked file at that moment,
- the **author** (name and email) and the date,
- the **committer** (usually the same person),
- a **message** explaining the change,
- a link to its **parent** commit: the commit that came directly before it.

That last item is what turns separate snapshots into a history. Each commit points back to its parent, so the commits form a chain:

```graph History of main
A <-- B <-- C
```

Arrows in Git point **backwards**, from child to parent, because a commit knows its parent but never knows its future children. Most diagrams, including the ones in this book, leave the arrowheads off and simply draw time flowing left to right:

```graph Same history, usual notation
A---B---C
```

Every commit also has an ID, the **commit hash**, such as `9fceb02d0ae598e95dc970b74767f19372d61af8`. It is calculated from the commit's content, parents and metadata, so it is unique to that exact commit. You will mostly see the short form, `9fceb02`. In diagrams, we use letters like A, B and C to keep things readable.

:::internals Why commits cannot be edited
Because a commit's hash is calculated from its content *and* its parent's hash, changing anything in an old commit would change its hash, which would change its child's hash, and so on up the chain. Git never does that in place. Instead, commands that "rewrite" history create brand-new commits with new hashes. Chapter 28 explores this.
:::

## Branches: movable labels

Here is the most important sentence in this chapter:

**A branch is a name that points at one commit.** Nothing more.

A branch is not a folder. It is not a copy of your files. It is a tiny file inside `.git` that contains a single commit hash. When you commit on a branch, Git moves that name forward to point at the new commit.

```graph Before committing
        main
          |
A---B---C
```

```graph After one commit on main
            main
              |
A---B---C---D
```

Because creating a branch just writes one small file, it is instant, no matter how big the project is. That is why Git teams create a new branch for every task, even tiny ones.

:::analogy A bookmark in a book
A branch is a bookmark. The pages (commits) are already printed. Creating a new bookmark does not copy any pages. When you "write" a new page on the bookmarked branch, you move the bookmark to it. Two bookmarks can sit in the same place, and you can move one without affecting the other.
:::

### Two branches, one history

When you create a new branch, it starts by pointing at the same commit you are on. Nothing diverges until someone commits.

```graph Right after creating feature/login
        main
          |
A---B---C
          |
    feature/login
```

After a commit on `feature/login` and a different commit on `main`, the lines diverge:

```graph Both branches have moved on
            main
              |
A---B---C---D
         \
          E
          |
    feature/login
```

Commits A, B and C are shared by both branches. D exists only on `main`; E exists only on `feature/login`. Later you will **merge** them to combine the work (Part 7).

## HEAD: where you are

If several branches exist, how does Git know which one to move when you commit? That is HEAD's job.

**HEAD is a pointer to your current position.** Normally, HEAD points at a branch name, and that branch points at a commit. You will often see this written as `HEAD -> main`.

```diagram head
```

When you commit, Git:

1. creates the new commit with the commit HEAD currently leads to as its parent,
2. moves the branch that HEAD points at to the new commit,
3. leaves HEAD pointing at the same branch, so HEAD "comes along" automatically.

When you **switch** branches with `git switch feature/login`, Git:

1. changes HEAD to point at `feature/login`,
2. updates your working directory and staging area to match the commit that branch points to.

That second step is why files in your editor change when you switch branches. Git is showing you the snapshot of the branch you moved to.

:::jargon detached HEAD
Plain English: HEAD is pointing straight at a commit instead of at a branch. This happens when you check out a specific commit or tag to look at old code. It is not an error. But new commits made in this state do not belong to any branch, so they are easy to lose when you switch away. Chapter 61 covers it in depth; the fix is simply to create a branch: `git switch -c my-branch`.
:::

```diagram detached-head
```

## See it move

The simulator below shows branches as labels and HEAD as the highlighted `HEAD →` label. Try the suggested commands in order and watch which label moves after each one.

```viz branches
```

Things to notice as you click:

- `git branch feature/login` adds a label but **does not move HEAD**. You are still on `main`.
- `git switch feature/login` moves HEAD to the new branch. No commits change.
- The commit you make next moves only `feature/login`. `main` stays put.
- Switching back to `main` and committing makes the history split into two lines.

## Reading HEAD in real output

Real Git shows the same information in `git log`:

```bash
$ git log --oneline --decorate
a3f9c21 (HEAD -> feature/login) Add login form
7be20d4 (main) Add homepage
e4c9b18 Initial commit
```

Read the parentheses as labels stuck on commits:

- `HEAD -> feature/login` means HEAD points at the branch `feature/login`, which points at `a3f9c21`.
- `main` points at `7be20d4`, one commit behind.

And `git branch` lists branches, starring the one HEAD points at:

```bash
$ git branch
* feature/login
  main
```

:::tip "main" and "master"
Older repositories and older Git installations use `master` as the default branch name. Newer ones use `main`. They are ordinary branches with no special powers; the name is just a convention. This book uses `main`. If your team uses `master`, mentally substitute it everywhere.
:::

:::recap
### What you learned
- A commit is a snapshot plus author, date, message and a link to its parent. Commits form a chain.
- Each commit is identified by a hash calculated from its contents; commits are never edited in place.
- A branch is a movable name pointing at one commit. Creating one is instant and copies nothing.
- HEAD points at the branch you are on. Committing moves that branch forward; switching moves HEAD.
- Detached HEAD means HEAD points at a commit directly. Create a branch to keep any work made there.

### Key terms
```terms
Commit :: A snapshot of the project plus metadata and a link to its parent.
Parent commit :: The commit directly before another commit in history.
Commit hash :: The unique ID of a commit, calculated from its contents.
Branch :: A movable name that points at one commit.
HEAD :: The pointer to your current position, normally a branch.
Detached HEAD :: A state where HEAD points directly at a commit, not a branch.
```

### Key commands
```commands
git log --oneline --decorate :: Compact history showing which labels point where.
git branch :: List branches; the current one has a star.
git switch <branch> :: Move HEAD to another branch and update your files.
```

### Common mistakes
- Thinking a branch is a copy of the project. It is a label on a commit.
- Expecting `git branch <name>` to move you onto the new branch. It only creates it.
- Committing in detached HEAD and switching away without creating a branch.

### Quick quiz
```quiz
? What does a branch actually store?
- A full copy of all project files
- A list of every commit on the branch
+ The hash of one commit
- The differences from the main branch
> A branch is a tiny reference containing one commit hash. The history comes from following parent links backward from that commit.

? [state] HEAD points to main, which points to commit C. You run git commit. What happens?
- HEAD moves to the new commit; main stays at C
+ A new commit D is created with parent C, and main moves to D; HEAD still points to main
- main and HEAD both stay at C
- A new branch is created automatically
> Committing moves the branch HEAD points to. HEAD keeps pointing at that branch, so it follows along.

? [predict] Which line shows the branch you are currently on?
| $ git log --oneline --decorate
| 51c0e2a (HEAD -> fix/header) Fix header height
| 7be20d4 (main) Add homepage
- main
+ fix/header
- 7be20d4
- There is no current branch
> `HEAD -> fix/header` means HEAD points at the branch `fix/header`.

? [tf] Creating a new branch in a large repository takes longer than in a small one, because Git copies the files.
- True
+ False
> Creating a branch only writes one small reference containing a commit hash. It takes the same instant regardless of project size.
```

### Practical exercise
````exercise Draw the graph
Starting from this history, draw what the graph looks like after each step. Mark where `main`, `feature` and HEAD point.

```text
A---B   (main, HEAD -> main)
```

1. `git branch feature`
2. `git switch feature`
3. commit C
4. `git switch main`
5. commit D

Then check your drawing in the simulator above by running the same commands.
---solution---
1. Both `main` and `feature` point at B. HEAD → main.
2. HEAD → feature. Nothing else changes.
3. C is created with parent B. `feature` moves to C. `main` stays at B.
4. HEAD → main. Your files now show snapshot B.
5. D is created with parent B. `main` moves to D. The history splits: B has two children, C (feature) and D (main).
````

### What to learn next
Your history now has branches and a HEAD. The last piece of the Part 1 model is how your repository relates to other copies: remotes, and the special remote called origin.
:::
