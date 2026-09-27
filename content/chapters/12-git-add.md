---
id: git-add
part: 3
title: Staging Changes with git add
minutes: 22
level: Beginner
topics: 30 git add
objectives:
- Explain what "add" really means in Git
- Stage single files, folders, all changes, and parts of files
- Predict exactly what will and will not be in the next commit
- Inspect the staging area before committing
- Undo staging without losing work
concepts: staging area | index | hunk | tracked file | untracked file
commands: git add | git add -p | git add -A | git add -u | git restore --staged | git diff --staged | git rm --cached
---
`git add` is the most misunderstood command in Git, mostly because of its name. It does not mean "add this file to the project". It means **"copy the current version of this change into the staging area, so it becomes part of the next commit"**. You will run `git add` on files that have existed for years, every time you change them.

## What "add" really does

Recall the three areas from Chapter 4. `git add` reads from the **working directory** and writes to the **staging area**:

```graph git add
Working directory  --git add-->  Staging area  --git commit-->  Repository
   (your edits)                  (next commit)                  (history)
```

Before `git add`, a change exists only in your working directory. Git knows the file changed (status shows it) but the next commit would not include it.

After `git add`, the staging area holds a copy of the file **exactly as it was at that moment**. Git has also already stored that content in its object database, so even if you mess up your working copy, the staged version is safe.

```cmd
git add app.js
git :: The Git program.
add :: Copy the current contents of the given paths into the staging area.
app.js :: The path to stage. Can be a file, a folder, several paths, or a pattern.
```

```bash
$ git add app.js
$ git status -s
A  app.js
?? README.md
```

`git add` prints nothing on success. Run `git status` to see the effect.

## What will be in the next commit?

This is the question `git add` answers. The rule is simple:

**The next commit contains exactly the staging area: the last commit's snapshot, plus every change you have staged since.**

| Included in the next commit | Not included |
|---|---|
| Files you staged with `git add` (at the version you staged) | Edits made *after* you staged a file |
| Unchanged tracked files (carried over from the last commit) | Untracked files you did not add |
| Deletions you staged | Unstaged modifications to tracked files |
| | Anything matched by `.gitignore` |

## Staging options

| Command | Stages | Typical use |
|---|---|---|
| `git add app.js` | One file | Most precise; preferred when you have unrelated changes |
| `git add app.js README.md` | Several files | |
| `git add src/` | Everything changed inside a folder | A feature confined to one folder |
| `git add *.css` | Files matching a pattern in the current folder | |
| `git add .` | All changes in the current folder and below, including new and deleted files | Everything you did, when you ran it from the project root |
| `git add -A` | All changes in the **entire** repository, wherever you run it from | Same as above, independent of your current folder |
| `git add -u` | Changes to **tracked** files only (modifications and deletions), no new files | Update what's already tracked; skip stray new files |
| `git add -p` | Chosen **parts** of files, interactively | Splitting unrelated edits in one file |

:::warning Look before you git add .
`git add .` stages everything: including the debug file, the accidental `.env` with your API keys, and the 200 MB video you dropped in the folder. Run `git status` first, make sure `.gitignore` covers what it should (Chapter 16), and prefer adding specific paths when you are unsure.
:::

## Staging part of a file with git add -p

Real edits are messy. Suppose you fixed a bug in `cart.js` and, in the same file, added a `console.log` while debugging. You want to commit the fix but not the log line. `-p` (short for `--patch`) goes through each changed **hunk** (a block of nearby changed lines) and asks what to do.

```bash
$ git add -p cart.js
diff --git a/cart.js b/cart.js
index 3b18e51..c07a1e4 100644
--- a/cart.js
+++ b/cart.js
@@ -10,7 +10,7 @@ function total(items) {
   let sum = 0;
   for (const item of items) {
-    sum += item.price * item.qty;
+    sum += Math.round(item.price * 100) * item.qty / 100;
   }
   return sum;
 }
(1/2) Stage this hunk [y,n,q,a,d,s,e,?]? y
@@ -30,6 +30,7 @@ function applyCoupon(cart, code) {
+  console.log('coupon', code);
   const coupon = findCoupon(code);
(2/2) Stage this hunk [y,n,q,a,d,s,e,?]? n
```

The answers you need most:

| Key | Meaning |
|---|---|
| `y` | Yes, stage this hunk |
| `n` | No, leave it unstaged |
| `s` | Split this hunk into smaller ones (when possible) |
| `e` | Edit the hunk by hand (advanced) |
| `q` | Quit; hunks already answered keep their choice |
| `?` | Help |

Afterwards, `git status` shows `cart.js` as both staged and not staged: the fix is staged, the log line is not. Commit, and the log line stays behind in your working directory for you to delete.

:::tip Your editor can do this too
VS Code's Source Control panel and JetBrains IDEs let you stage individual lines by selecting them in the diff view. It is the same staging area underneath.
:::

## Inspecting the staging area

Before committing, check what you are about to record:

```bash
$ git diff --staged
```

`git diff` with no options shows **unstaged** changes (working directory vs staging area). `git diff --staged` (the same as `--cached`) shows **staged** changes (last commit vs staging area): exactly what the next commit will contain. Chapter 15 covers reading diffs in detail.

```bash
$ git status          # which files
$ git diff --staged   # which lines
```

These two commands before every commit catch the majority of "I committed the wrong thing" mistakes.

## Undoing staging

Staged something by mistake? Move it back out. Your edits stay in the working directory; nothing is lost.

```cmd
git restore --staged app.js
restore :: Restore file contents in one of Git's areas.
--staged :: Restore the staging area (not your working files), using the version from the last commit.
app.js :: The file to unstage.
```

```bash
$ git status -s
M  app.js
$ git restore --staged app.js
$ git status -s
 M app.js
```

The `M` moved from the left column (staged) to the right column (modified, not staged).

:::note Before the first commit
In a brand-new repository with no commits, there is no "last commit" to restore from. `git restore --staged` fails there with an error. Use `git rm --cached <file>` instead, which removes the file from the staging area without deleting it from disk. You may also see the older form `git reset HEAD <file>` in documentation and Stack Overflow answers; it does the same thing as `git restore --staged` once there is at least one commit.
:::

## Staging deletions and renames

Deleting or renaming a tracked file is also a change that must be staged.

```bash
$ rm old.txt
$ git status -s
 D old.txt
$ git add old.txt          # yes, "add" a deletion: stage the fact it is gone
$ git status -s
D  old.txt
```

Git has shortcuts that change the file and stage it in one step:

```bash
$ git rm old.txt                   # delete the file and stage the deletion
$ git mv notes.js notes-list.js    # rename and stage the rename
```

Git does not actually record renames. It notices that a deleted file and a new file have very similar content and **shows** it as a rename. That is why `git status` can say `renamed:` even if you renamed a file in your editor and staged both sides with `git add -A`.

:::recap
### What you learned
- `git add` copies the current version of a change into the staging area; the next commit contains exactly what is staged.
- Edits made after staging are not in the next commit unless you add again.
- `.` and `-A` stage everything; `-u` stages tracked files only; `-p` stages chosen hunks.
- `git diff --staged` shows exactly what you are about to commit.
- `git restore --staged <file>` unstages without losing edits (use `git rm --cached` before the first commit).
- Deletions and renames are staged changes too; `git rm` and `git mv` do both steps at once.

### Key terms
```terms
Staging / adding :: Copying a change into the staging area for the next commit.
Hunk :: A block of nearby changed lines in a diff.
Patch mode :: `git add -p`, which stages chosen hunks interactively.
Unstage :: Remove a change from the staging area while keeping it in your working directory.
```

### Key commands
```commands
git add <path> :: Stage a file or folder.
git add -A :: Stage every change in the repository, including new and deleted files.
git add -u :: Stage changes to tracked files only.
git add -p :: Choose hunks to stage interactively.
git diff --staged :: Show what is staged for the next commit.
git restore --staged <file> :: Unstage a file, keeping your edits.
git rm --cached <file> :: Stop tracking a file but keep it on disk.
```

### Common mistakes
- Running `git add .` without checking status, and committing secrets, logs or huge files.
- Editing after staging and forgetting to stage again.
- Thinking `git restore --staged` deletes your changes (it doesn't; plain `git restore` without `--staged` does).

### Quick quiz
```quiz
? What does git add do to a file that has been tracked for months?
- Nothing, it's already added
+ Stages its current version so the change goes into the next commit
- Creates a second copy of the file
- Commits the file immediately
> "Add" means stage the current contents. You run it every time you want a change in the next commit.

? [state] You modified a.js and b.js, then ran git add a.js and git commit -m "Update". Where is your change to b.js?
- In the commit
- Lost
+ Still in your working directory, unstaged
- In the staging area
> Only staged changes are committed. b.js remains modified and unstaged.

? Which command stages modifications and deletions of tracked files but ignores new untracked files?
- git add .
- git add -A
+ git add -u
- git add -p
> `-u` means update what's already tracked. New files are skipped.

? [troubleshoot] You accidentally staged secrets.env (no commit yet since the repo has history). How do you unstage it without deleting the file?
- git restore secrets.env
+ git restore --staged secrets.env
- rm secrets.env
- git commit --amend
> `--staged` restores the staging area from the last commit. Plain `git restore secrets.env` would overwrite your working copy instead. Then add the file to .gitignore.

? [predict] What does git diff --staged show?
- Changes you have not staged yet
+ Changes that are staged and will be in the next commit
- The difference between two branches
- Untracked files
> `--staged` compares the last commit with the staging area.
```

### Practical exercise
````exercise Split one file into two commits
In `notes-app`, make sure `app.js` is committed first (if you have no commits yet, run `git add app.js README.md` and `git commit -m "Initial files"`). Then:

1. Edit `app.js` to change the log message on line 1, **and** add a second line `// TODO: remove debug`.
2. Use `git add -p app.js` to stage only the log message change.
3. Confirm with `git diff --staged` and `git diff`.
4. Commit with the message "Update startup message".
---solution---
```bash
$ git add -p app.js
# answer y to the hunk with the message change
# if both changes are in one hunk, press s to split, or e to edit
$ git diff --staged   # shows only the message change
$ git diff            # shows only the TODO line
$ git commit -m "Update startup message"
$ git status -s       #  M app.js  (the TODO line remains unstaged)
```
If Git cannot split the hunk because the lines are adjacent, press `e` and delete the `+` line you do not want to stage from the editor that opens, then save and close.
````

### What to learn next
You can build exactly the snapshot you want. Next, record it with `git commit`, and see why Git thinks in snapshots rather than lists of changes.
:::
