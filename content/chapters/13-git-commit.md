---
id: git-commit
part: 3
title: Recording Snapshots with git commit
minutes: 22
level: Beginner
topics: 31 git commit | 35 Understanding snapshots
objectives:
- Create commits with short and multi-paragraph messages
- Read the output of git commit line by line
- Explain what a commit stores and why Git thinks in snapshots, not diffs
- Know when git commit -a is convenient and when it is risky
- Recognise and handle "nothing to commit"
concepts: commit | snapshot | root commit | commit message | commit hash | parent commit
commands: git commit -m | git commit | git commit -a | git commit -v
---
`git commit` takes everything in the staging area and records it as a new, permanent snapshot in the repository. It is the moment your work becomes part of the project's history.

## Your first commit

In `notes-app`, stage both files and commit:

```bash
$ git add README.md app.js
$ git commit -m "Create notes app skeleton"
[main (root-commit) 3f2a9c1] Create notes app skeleton
 2 files changed, 2 insertions(+)
 create mode 100644 README.md
 create mode 100644 app.js
```

```cmd
git commit -m "Create notes app skeleton"
git :: The Git program.
commit :: Record the staging area as a new commit on the current branch.
-m :: "Message": use the following text as the commit message instead of opening an editor.
"Create notes app skeleton" :: The message. Quotes keep the words together as one argument.
```

Now read the output, because every piece means something:

| Part | Meaning |
|---|---|
| `main` | The branch that moved to the new commit |
| `(root-commit)` | This commit has no parent: it is the first commit in the repository |
| `3f2a9c1` | The first seven characters of the new commit's hash |
| `Create notes app skeleton` | Your message |
| `2 files changed, 2 insertions(+)` | A summary of what changed compared with the parent (here: nothing, since it is the first) |
| `create mode 100644` | These files are new. `100644` is Git's code for "a normal, non-executable file" |

The unborn `main` branch from Chapter 10 now exists and points at `3f2a9c1`. HEAD points at `main`.

## What happens internally

When you run `git commit`, Git:

1. Takes the staging area and stores a **tree** describing every file and folder in it (Chapter 70 explains trees).
2. Creates a **commit object** containing that tree's ID, the parent commit's ID (none for the first commit), author, committer, timestamps and message.
3. Computes the commit's **hash** from all of that content.
4. Moves the current branch (the one HEAD points to) to the new commit.

Nothing is sent anywhere. The commit exists only in your local repository until you push.

## Snapshots, not diffs

Many people imagine Git storing a list of changes: "commit 2 = add line 5 to app.js". Git's model is different and simpler: **every commit is a complete snapshot of every tracked file**.

```diagram snapshots
```

If that sounds wasteful, it isn't:

- Git stores each unique file content **once**, named by its hash. If `README.md` did not change between ten commits, all ten snapshots point at the same stored copy.
- Git compresses everything, and later packs similar versions together efficiently (Chapter 71).

Why does this matter to you? Because it explains Git's behaviour:

- **Checking out an old commit is fast**: Git reads one snapshot; it doesn't replay a chain of edits.
- **A diff is calculated, not stored.** When Git shows "what changed" in a commit, it is comparing that commit's snapshot with its parent's. That is why you can diff any two commits, even ones that are far apart.
- **Commits are self-contained.** Each commit can reproduce the entire project exactly as it was.

:::analogy Photos, not a diary
A diff-based system keeps a diary: "moved the sofa left, painted one wall". To see the room on day 50, you replay 50 entries. Git takes a photo of the whole room each time, and for anything that didn't change, the new photo just reuses the old pixels. Comparing any two days is as simple as putting two photos side by side.
:::

## Writing longer messages

A one-line message is fine for small changes. For anything that needs explaining, write a **subject line** plus a **body**. Two ways:

**Several `-m` flags**, each becoming a paragraph:

```bash
$ git commit -m "Fix rounding error in cart total" -m "Prices were multiplied as floats, so 0.1 + 0.2 produced 0.30000000000000004 in the UI. Totals are now calculated in cents."
```

**Your editor**, by leaving out `-m`:

```bash
$ git commit
```

Git opens the editor you configured in Chapter 8 with a template:

```text
                                        <- write your subject on line 1
# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
#
# On branch main
# Changes to be committed:
#	modified:   cart.js
```

Write a subject on line 1, leave line 2 blank, write the body from line 3. Save and close the editor to finish the commit. Lines starting with `#` are ignored. Saving an **empty** message aborts the commit, which is a handy way to cancel.

Chapter 29 covers what makes a message good. The short version: a subject under about 50 characters, in the imperative ("Fix", "Add", "Remove"), and a body that explains **why**.

:::tip See the diff while writing the message
`git commit -v` includes the full diff of what you are committing at the bottom of the editor template (below a line Git ignores). It reminds you what you are describing and catches last-second surprises.
:::

## git commit -a: staging and committing in one step

```cmd
git commit -a -m "Update styles"
-a :: "All": automatically stage every modification and deletion of TRACKED files before committing.
-m :: Use the next argument as the message.
```

It is convenient, but know its limits:

- It **does not** include untracked (new) files. You must `git add` those first.
- It stages **everything** modified, so it bypasses the chance to leave debug code out or split unrelated changes.

Use it when you know your working directory contains exactly one logical change to already-tracked files. Many developers combine the flags: `git commit -am "message"`.

## "Nothing to commit"

If the staging area matches the last commit, there is nothing to record:

```bash
$ git commit -m "Update"
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
	modified:   app.js

no changes added to commit (use "git add" and/or "git commit -a")
```

Git refuses to create an empty commit and reminds you to stage. If you see `nothing to commit, working tree clean`, there are no changes at all.

## Committing often

A commit is your safety net. Uncommitted work can be lost for good; committed work can almost always be recovered, even after serious mistakes (Part 9). Good rhythm:

- commit whenever you reach a small, working step,
- commit before trying something risky ("before refactor" is a perfectly good checkpoint),
- commit before switching tasks or pulling.

You will learn to tidy a series of small commits into a clean story before sharing it (Chapter 38), so do not worry about committing "too much" on your own branch.

## Try it in the sandbox

The simulator models commits as a chain. Each `git commit` adds a snapshot and moves `main` and HEAD forward.

```viz commits
```

:::recap
### What you learned
- `git commit` records the staging area as a new commit and moves the current branch to it.
- The output shows the branch, whether it is the root commit, the short hash, the message and a change summary.
- Each commit is a complete snapshot; unchanged files are shared, not copied. Diffs are calculated by comparing snapshots.
- Use `-m` for short messages, or your editor for a subject plus body. An empty message aborts.
- `git commit -a` stages tracked changes automatically but skips new files.

### Key terms
```terms
Commit :: A permanent snapshot of the staging area plus metadata, added to the current branch.
Root commit :: The first commit in a repository; it has no parent.
Snapshot :: A complete record of every tracked file at one moment.
Commit message :: The human-written explanation stored with a commit: a subject line and optional body.
```

### Key commands
```commands
git commit -m "message" :: Commit staged changes with a message.
git commit :: Commit and write the message in your editor.
git commit -a -m "message" :: Stage all tracked modifications and deletions, then commit.
git commit -v :: Show the diff in the editor while writing the message.
```

### Common mistakes
- Expecting `git commit -a` to include new files.
- Committing without checking `git diff --staged` first.
- Waiting too long between commits and losing uncommitted work.

### Quick quiz
```quiz
? [predict] What does "(root-commit)" in the commit output mean?
| [main (root-commit) 3f2a9c1] Create notes app skeleton
- The commit was made by an administrator
+ It is the first commit in the repository and has no parent
- The commit was pushed to the server
- The commit changed the root folder
> The root commit is where history begins; every later commit descends from it.

? How does Git store the history of a file that changed in 3 of 10 commits?
- Ten full copies of the file
+ Three distinct stored versions; commits where it didn't change point at the same stored content
- One copy plus a list of line edits
- It stores only the latest version
> Git stores each unique content once, named by its hash. Snapshots reuse unchanged content.

? [state] You created new.js and modified app.js (both unstaged). You run git commit -am "Update". What is in the commit?
+ The change to app.js only
- Both files
- new.js only
- Nothing
> `-a` stages modifications to tracked files. new.js is untracked, so it is not included.

? [tf] git commit sends your commit to GitHub.
- True
+ False
> Commits are local until you run `git push`.

? [troubleshoot] git commit prints "no changes added to commit". What should you do?
- Run git init again
+ Stage the changes you want with git add, then commit
- Use git push first
- Delete the .git folder
> The staging area matches the last commit, so there is nothing to record. Stage something first.
```

### Practical exercise
````exercise Make three commits
In `notes-app`:
1. Add a line to `README.md` describing the app. Commit it with a one-line message.
2. Create `notes.js` containing `export const notes = [];`. Commit it.
3. Change `app.js` to import notes. Commit using your editor, with a subject and a one-sentence body explaining why.
4. Run `git log --oneline` to see all your commits.
---solution---
```bash
$ echo "A tiny app for keeping notes." >> README.md
$ git add README.md
$ git commit -m "Describe the app in README"
$ echo "export const notes = [];" > notes.js
$ git add notes.js
$ git commit -m "Add notes store"
$ # edit app.js
$ git add app.js
$ git commit
#   Load notes store at startup
#
#   The app needs the store before rendering the list view.
$ git log --oneline
```
You should see four commits in total (including your first skeleton commit), newest first.
````

### What to learn next
You have a history. Next, learn to read it with `git log`.
:::
