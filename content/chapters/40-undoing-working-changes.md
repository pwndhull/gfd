---
id: undoing-working-changes
part: 9
title: Undoing Uncommitted Changes
minutes: 20
level: Intermediate
topics: 89 Undoing working-directory changes | 90 git restore | 91 Unstaging files
objectives:
- Choose the right undo command by asking where the change currently lives
- Discard edits to tracked files, fully or partly, with git restore
- Unstage files without losing edits
- Remove untracked files safely with git clean
- Explain which of these operations cannot be undone
concepts: working directory | staging area | untracked file | restore | clean
commands: git restore | git restore --staged | git restore -p | git restore --source | git clean -n | git clean -fd
---
Part 9 is about undoing. The first question for any undo is always the same: **where does the change live right now?** Chapter 4's three areas give you the map:

| The change is… | Undo with | Chapter |
|---|---|---|
| In your working directory only (not staged) | `git restore <file>` | This one |
| Staged, not committed | `git restore --staged <file>` | This one |
| A brand-new untracked file | `git clean` (or delete it) | This one |
| Committed, not pushed | `git reset` | 41 |
| Committed and pushed | `git revert` | 42 |
| "Lost" after a reset, rebase or deleted branch | `git reflog` | 43 |

This chapter handles everything that hasn't been committed yet. It's also where the **truly irreversible** operations live, so read the warnings.

## Discarding changes to a file

```cmd
git restore src/cart.js
restore :: Restore files in the working directory (or staging area) from another version.
src/cart.js :: The file to restore. By default it's restored from the staging area, which usually equals the last commit.
```

```bash
$ git status -s
 M src/cart.js
$ git restore src/cart.js
$ git status -s
$
```

Your edits to `src/cart.js` are gone and the file matches the last staged/committed version.

:::danger There is no undo for this
Unstaged edits were never stored by Git. `git restore <file>` overwrites them permanently. Your editor's local history might help; Git can't. If you're unsure, stash instead (`git stash`, Chapter 44): it's a reversible way to clear your working directory.
:::

### Discarding everything

```bash
$ git restore .                  # every tracked file in this folder and below
```

### Discarding part of a file

```bash
$ git restore -p src/cart.js
```

Walks through each changed hunk and asks whether to discard it, like `git add -p` in reverse. Perfect for removing debug lines while keeping real work.

### Restoring from a specific commit

```bash
$ git restore --source=HEAD~3 src/cart.js       # the version from three commits ago
$ git restore --source=main src/cart.js         # main's version
```

This changes the working directory only; the file then shows as modified, ready to review and commit.

## Unstaging

You staged something you didn't mean to. Move it out of the staging area; your edits stay in the working directory.

```cmd
git restore --staged src/cart.js
--staged :: Restore the staging area (index) instead of the working directory, using HEAD's version.
src/cart.js :: The file to unstage.
```

```bash
$ git status -s
M  src/cart.js
$ git restore --staged src/cart.js
$ git status -s
 M src/cart.js
```

This one is completely safe: nothing is lost. You'll also see older forms that do the same thing: `git reset HEAD src/cart.js` or `git reset src/cart.js`.

### Unstage and discard in one go

```bash
$ git restore --staged --worktree src/cart.js
```

Resets both the staging area and the working file to HEAD's version. Irreversible for the working-directory edits, like plain `git restore`.

### Before the first commit

There's no HEAD to restore from yet, so use `git rm --cached <file>` to unstage (Chapter 12).

## Undoing a deletion

If you deleted a tracked file (in your editor or with `rm`) and want it back:

```bash
$ git status -s
 D src/cart.js
$ git restore src/cart.js
```

If you staged the deletion (`git rm`), restore both areas:

```bash
$ git restore --staged --worktree src/cart.js
```

## Removing untracked files: git clean

`git restore` only touches tracked files. New files Git has never tracked (build output, stray experiments) are removed with `git clean`. It's destructive, so it **requires** a flag.

```cmd
git clean -n
clean :: Remove untracked files from the working directory.
-n :: Dry run: list what would be removed without removing anything. Always run this first.
```

```bash
$ git clean -n
Would remove junk.tmp
$ git clean -nd
Would remove build/
Would remove junk.tmp
```

| Command | Removes |
|---|---|
| `git clean -n` | Nothing: preview untracked files |
| `git clean -f` | Untracked files (not folders) |
| `git clean -fd` | Untracked files and folders |
| `git clean -fdx` | Untracked **and ignored** files and folders (e.g. `node_modules/`, `.env`!) |
| `git clean -i` | Interactive: choose what to delete |

:::danger git clean -x deletes ignored files too
`-x` removes everything Git ignores: dependencies, build caches, and local config such as `.env`. That can be exactly what you want for a pristine build, or a very bad afternoon. Preview with `git clean -ndx` first.
:::

## The "start over" combination

To make your working directory exactly match the last commit, discarding every uncommitted change, tracked and untracked:

```bash
$ git status                     # look first
$ git stash -u                   # safer: keeps a copy you can restore
# or, irreversibly:
$ git restore --staged --worktree .
$ git clean -fd
```

`git reset --hard` (next chapter) also resets tracked files but leaves untracked files alone.

## Which command changes what

| Command | Staging area | Working directory | Reversible? |
|---|---|---|---|
| `git restore <file>` | — | Reset to staged version | **No** |
| `git restore --staged <file>` | Reset to HEAD | — | Yes |
| `git restore --staged --worktree <file>` | Reset to HEAD | Reset to HEAD | **No** (working edits) |
| `git restore --source=<commit> <file>` | — | Set to that commit's version | **No** (working edits) |
| `git clean -f` | — | Delete untracked files | **No** |
| `git stash` | Saved and reset | Saved and reset | Yes |

:::recap
### What you learned
- Pick the undo by where the change lives: working directory, staging area, commit, or pushed commit.
- `git restore <file>` discards unstaged edits permanently; `-p` does it hunk by hunk; `--source` restores from any commit.
- `git restore --staged <file>` unstages safely; add `--worktree` to discard too.
- `git clean` removes untracked files; always dry-run with `-n`; `-x` includes ignored files.
- When unsure, stash instead of discarding.

### Key terms
```terms
Discard :: Throw away uncommitted changes, usually irreversibly.
Unstage :: Remove a change from the staging area while keeping it in the working directory.
Untracked file :: A file Git has never stored; git restore doesn't affect it.
Dry run :: A preview that shows what a command would do without doing it.
```

### Key commands
```commands
git restore <file> :: Discard unstaged changes to a file.
git restore -p <file> :: Discard selected hunks.
git restore --staged <file> :: Unstage, keeping edits.
git restore --staged --worktree <file> :: Unstage and discard.
git restore --source=<commit> <file> :: Get a file's version from any commit.
git clean -n / -fd :: Preview / remove untracked files and folders.
```

### Common mistakes
- Running `git restore .` meaning to unstage (that discards edits; use `--staged`).
- Running `git clean -fdx` without previewing and deleting `.env` or local data.
- Expecting `git restore` to remove new untracked files.

### Quick quiz
```quiz
? [scenario] You staged config.js by mistake and want it out of the next commit, but keep your edits. Which command?
+ git restore --staged config.js
- git restore config.js
- git clean -f config.js
- git reset --hard
> --staged changes only the staging area. Plain restore would discard the edits.

? [tf] git restore <file> on unstaged edits can be undone with git reflog.
- True
+ False
> Unstaged edits were never stored in Git, so nothing can bring them back.

? What does git clean -n do?
+ Lists untracked files that would be removed, without removing anything
- Removes untracked files
- Removes ignored files only
- Cleans up merged branches
> -n is a dry run. Always preview before -f.

? [predict] Which files would git clean -fd delete?
| ?? build/
| ?? notes.tmp
|  M src/app.js
+ build/ and notes.tmp
- src/app.js only
- All three
- Nothing without -x
> clean removes untracked files and, with -d, folders. Modified tracked files are untouched.

? You want to throw away only the console.log lines you added, keeping other edits in the same file. Which command?
+ git restore -p <file>
- git restore <file>
- git clean -p
- git reset -p --hard
> Patch mode lets you choose hunks to discard.
```

### Practical exercise
````exercise Undo at every level
In a practice repository with a committed `app.js`:
1. Edit `app.js`, then discard the edit.
2. Edit it again, stage it, then unstage it (keeping the edit).
3. Create `scratch.txt` and a folder `tmp/` with a file inside. Preview and then remove them with `git clean`.
4. Delete `app.js` with `rm`, then bring it back.
---solution---
```bash
$ echo "oops" >> app.js && git restore app.js
$ echo "keep" >> app.js && git add app.js && git restore --staged app.js && git status -s   #  M app.js
$ touch scratch.txt && mkdir tmp && touch tmp/x
$ git clean -nd && git clean -fd
$ rm app.js && git restore app.js
```
After step 2, `app.js` still contains "keep" as an unstaged change. Discard it with `git restore app.js` if you want a clean slate.
````

### What to learn next
Everything so far was uncommitted. Next: undoing commits themselves with `git reset` and its three modes.
:::
