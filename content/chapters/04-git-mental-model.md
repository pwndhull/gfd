---
id: git-mental-model
part: 1
title: The Git Mental Model
minutes: 22
level: Beginner
topics: 8 The Git mental model | 9 Working directory | 10 Staging area | 11 Repository
objectives:
- Draw the three local areas and the arrows between them from memory
- Explain what the working directory, staging area and repository each hold
- Explain why Git has a staging area at all
- Predict which area a given command reads from or writes to
concepts: working directory | staging area | index | repository | snapshot | tracked file | untracked file
commands: git status | git add | git commit | git restore
---
If you remember one diagram from this book, make it this one. Nearly every Git command moves content between three places on your computer. Beginners who struggle with Git are usually missing this model; once you have it, commands like `add`, `commit`, `restore` and `reset` become predictable.

```diagram three-areas
```

## The model in one paragraph

You edit files in the **working directory**. When a change is ready, you copy it into the **staging area** with `git add`. When the staging area contains exactly what you want to record, `git commit` saves it as a permanent snapshot in the **repository**. Git can also copy content back the other way, from the repository to the staging area or from the staging area to your working directory, which is how you undo things.

:::analogy Packing a parcel
The **working directory** is your desk, covered in things you are working on. The **staging area** is an open box: you choose which items go in, and you can take them out again. The **repository** is the post office archive: once you seal the box and hand it over (commit), a labelled parcel is stored forever, and you can always ask for a copy of any old parcel. Nothing on your desk gets shipped unless you put it in the box first.
:::

## Area 1: the working directory

The working directory is the folder you opened in your editor. It contains real files you can open, edit, run and delete.

Git sorts every file in the working directory into one of three groups:

- **Tracked** files are files Git already knows about, because they were in the last commit or have been staged. Git notices when they change.
- **Untracked** files are new files Git has never been told about. Git sees them but ignores their contents until you `git add` them.
- **Ignored** files match a pattern in `.gitignore` (Chapter 16), such as `node_modules/` or `.env`. Git pretends they do not exist.

The working directory is the only area you edit directly. It is also the only area that is **not protected**: if you delete a file or overwrite changes before adding or committing them, Git cannot bring that work back.

:::danger Uncommitted work is unprotected
Git can recover almost anything that was ever committed, even after mistakes (Part 9 shows how). It cannot recover edits that only ever existed in your working directory. Commit small and often, even on a private branch. You can always tidy commits later.
:::

## Area 2: the staging area (index)

The staging area is a list of exactly what the **next** commit will contain. Technically it is a file inside `.git` called `index`, which is why Git's documentation calls this area "the index".

Here is the part that surprises people: the staging area does not start empty. After a commit, the staging area holds a full copy of that commit's snapshot. When you run `git add file.js`, you are **replacing** that file's entry in the staging area with the current version from your working directory. The next commit is simply "whatever the staging area looks like at that moment".

### Why does the staging area exist?

Many version control systems commit whatever you changed, all at once. Git adds this middle step deliberately, because real work is messy. In one sitting you might:

- fix the bug you were asked to fix,
- notice and fix an unrelated typo,
- add some temporary debug logging you do not want to keep.

The staging area lets you record these as **separate, meaningful commits**, and leave the debug logging out entirely:

```bash
$ git add src/cart.js            # stage the bug fix only
$ git commit -m "Fix rounding error in cart total"
$ git add README.md              # stage the typo fix
$ git commit -m "Fix typo in setup instructions"
# debug logging stays unstaged, and is never committed
```

Reviewers, and your future self, get a history where each commit does one thing. That habit is called making **atomic commits**, and Chapter 29 returns to it.

:::tip You can even stage part of a file
`git add -p` walks through each changed chunk of a file and asks whether to stage it. That lets you commit the bug fix and leave the debug line in the same file unstaged. Chapter 12 covers it.
:::

## Area 3: the repository

The repository is the `.git` folder at the top of your project. It contains:

- every commit ever recorded, and the file contents they refer to,
- all your branches and tags,
- the remote-tracking branches like `origin/main`,
- configuration for this repository.

Commits in the repository are permanent in an important sense: Git never edits an existing commit. Commands that seem to "change" history, like amend or rebase, actually create new commits and move a branch label to point at them. The old commits still exist for a while, which is why so much is recoverable.

:::warning Never edit files inside .git by hand
The `.git` folder is Git's private database. Deleting it deletes the entire history of your local repository. Editing files in it by hand can corrupt it. Everything you need to do with it has a Git command.
:::

## Following one change through all three areas

Let's follow a single edit. Suppose `index.html` is tracked and the last commit contains version 1.

| Step | Working directory | Staging area | Repository (last commit) | `git status` says |
|---|---|---|---|---|
| Start | v1 | v1 | v1 | nothing to commit, working tree clean |
| You edit the file | **v2** | v1 | v1 | Changes not staged for commit |
| `git add index.html` | v2 | **v2** | v1 | Changes to be committed |
| You edit again | **v3** | v2 | v1 | *both* staged and not staged |
| `git commit -m "..."` | v3 | v2 | **v2** | Changes not staged for commit |

Look at the fourth row. After you staged v2, you edited again. The commit records **v2**, the staged version, not v3. The later edit is still sitting in the working directory, unstaged. This catches many beginners out: **`git commit` commits the staging area, not your files.**

:::mistake "I committed but my latest change isn't in it"
You edited the file again after running `git add`. Run `git add` again to stage the newer version, then either make another commit or amend the previous one (Chapter 30).
:::

## Which command touches which area?

| Command | Reads from | Writes to | Plain English |
|---|---|---|---|
| `git add <file>` | Working directory | Staging area | Stage my current version |
| `git commit` | Staging area | Repository | Record what is staged |
| `git restore <file>` | Staging area | Working directory | Throw away my unstaged edits |
| `git restore --staged <file>` | Repository (HEAD) | Staging area | Unstage, keep my edits |
| `git diff` | Staging area vs working directory | nothing | What have I changed but not staged? |
| `git diff --staged` | Repository vs staging area | nothing | What will my next commit contain? |
| `git status` | All three | nothing | Summarise the differences |

You do not need to memorise this table now. Come back to it whenever a command surprises you, and ask: *which area did it read, and which did it write?*

## Watching the model with git status

`git status` is your window into all three areas. Here is real output after editing one tracked file, staging another, and creating a new one:

```bash
$ git status
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	modified:   src/cart.js

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   README.md

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	notes.txt
```

Read it area by area:

- **Changes to be committed**: `src/cart.js` differs between the repository and the staging area. It will be in the next commit.
- **Changes not staged for commit**: `README.md` differs between the staging area and the working directory. It will *not* be in the next commit unless you add it.
- **Untracked files**: `notes.txt` exists only in the working directory. Git is not tracking it.

Git even prints the command to move each file in either direction. Reading `git status` carefully answers most "what is going on?" questions.

:::internals What the index really is
`.git/index` is a binary file listing every tracked path, the ID of the stored content for that path, and file metadata like size and modification time. Git uses that metadata to notice changed files quickly without reading every file. `git ls-files --stage` prints the index in readable form if you are curious.
:::

:::recap
### What you learned
- Git has three local areas: the working directory (your files), the staging area or index (the next commit), and the repository (all commits).
- `git add` copies from the working directory to the staging area; `git commit` records the staging area into the repository.
- The staging area lets you build focused commits from messy work.
- `git commit` records what is staged, not what is in your files.
- Only committed work is protected. Uncommitted edits can be lost for good.

### Key terms
```terms
Working directory :: The real files in your project folder that you edit.
Staging area / index :: The list of exactly what the next commit will contain.
Repository :: The `.git` folder holding all commits, branches and tags.
Tracked file :: A file Git knows about and watches for changes.
Untracked file :: A file in the folder that Git has never been told to track.
Atomic commit :: A commit that contains one logical change.
```

### Key commands
```commands
git status :: Show the state of all three areas.
git add <file> :: Stage the current version of a file.
git commit -m "message" :: Record the staged snapshot.
git restore <file> :: Discard unstaged edits to a file (cannot be undone).
git restore --staged <file> :: Unstage a file but keep your edits.
git diff / git diff --staged :: Show unstaged / staged changes.
```

### Common mistakes
- Editing a file after `git add` and expecting the commit to include the newer edit.
- Believing unstaged or uncommitted work is safe from mistakes.
- Deleting or editing the `.git` folder.

### Quick quiz
```quiz
? [state] You edit app.js, run git add app.js, then edit app.js again and run git commit -m "Update app". Which version of app.js is in the commit?
+ The version at the time you ran git add
- The latest version on disk
- Both versions, as two commits
- Neither; the commit fails
> `git commit` records the staging area. The second edit happened after staging, so it stays in the working directory as an unstaged change.

? Which area can Git NOT help you recover lost changes from?
+ The working directory (uncommitted, unstaged edits)
- The repository
- A commit that was later removed from a branch
- A branch you deleted
> Anything committed can usually be recovered, even after it looks deleted. Edits that were never staged or committed are not stored by Git at all.

? [predict] git status shows a file under "Untracked files". What does that mean?
- The file is staged and will be in the next commit
- The file has been deleted
+ The file exists in your folder but Git is not tracking it yet
- The file is ignored by .gitignore
> Untracked files are new files Git has never been told about. Ignored files do not appear in `git status` at all.

? Why does Git have a staging area?
- To make commits faster
+ So you can choose exactly which changes go into each commit
- Because the repository cannot read your files directly
- To store backups of deleted files
> The staging area lets you split messy work into focused commits and leave unwanted changes, like debug logging, out.
```

### Practical exercise
```exercise Predict before you look
Without running anything, fill in the table for a file `style.css` that is tracked and unchanged:

1. You edit `style.css`. Where do the versions differ?
2. You run `git add style.css`. What does `git status` show?
3. You run `git restore --staged style.css`. What happens to your edit?
---solution---
1. The working directory differs from the staging area. `git status` lists it under "Changes not staged for commit".
2. It appears under "Changes to be committed".
3. The staging area is set back to the committed version, so the file moves back to "Changes not staged for commit". Your edit is still in the working directory; nothing is lost.
```

### What to learn next
You have the three areas. The next chapter covers the three most important *pointers*: commits, branches, and HEAD, and how they relate.
:::
