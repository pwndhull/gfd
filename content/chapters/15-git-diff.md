---
id: git-diff
part: 3
title: Seeing Changes with git diff
minutes: 20
level: Beginner
topics: 34 git diff
objectives:
- Read unified diff output: headers, hunk headers and changed lines
- Compare the working directory, staging area and commits with the right diff command
- Summarise changes with --stat and --name-only
- Use word-level diffs for prose and long lines
concepts: diff | hunk | unified diff | staging area | working directory
commands: git diff | git diff --staged | git diff HEAD | git diff <a> <b> | git diff --stat | git diff --word-diff
---
A **diff** is a description of the differences between two versions of text. You will read diffs every day: before committing, during code review, and when investigating bugs. The format looks cryptic at first, but it has only four kinds of line.

## Which diff command compares what?

Everything depends on **which two things** you compare. Map it onto the three areas:

| Command | Compares | Answers |
|---|---|---|
| `git diff` | Staging area → working directory | What have I changed but **not staged**? |
| `git diff --staged` | Last commit → staging area | What **will be committed**? |
| `git diff HEAD` | Last commit → working directory | Everything I changed since the last commit, staged or not |
| `git diff main feature` | Tip of `main` → tip of `feature` | How do these two branches differ? |
| `git diff 3f2a9c1 8d1c4e2` | One commit → another | What changed between these commits? |
| `git diff HEAD~1` | Previous commit → working directory | What changed since one commit ago, including my current edits |

:::mistake "git diff shows nothing, but I changed things"
If you already staged your changes, plain `git diff` is empty, because the staging area and working directory match. Use `git diff --staged` to see staged changes, or `git diff HEAD` to see everything.
:::

## Reading a diff

Suppose you changed one line in `cart.js` and added another:

```diff
diff --git a/src/cart.js b/src/cart.js
index 3b18e51..c07a1e4 100644
--- a/src/cart.js
+++ b/src/cart.js
@@ -10,7 +10,8 @@ function total(items) {
   let sum = 0;
   for (const item of items) {
-    sum += item.price * item.qty;
+    const cents = Math.round(item.price * 100);
+    sum += cents * item.qty;
   }
-  return sum;
+  return sum / 100;
 }
```

Line by line:

| Line | Meaning |
|---|---|
| `diff --git a/src/cart.js b/src/cart.js` | Start of the diff for one file. `a/` is the old version, `b/` the new one. |
| `index 3b18e51..c07a1e4 100644` | Short IDs of the old and new file contents, and the file mode. You can ignore it. |
| `--- a/src/cart.js` | Lines marked `-` below come from the old version. |
| `+++ b/src/cart.js` | Lines marked `+` below come from the new version. |
| `@@ -10,7 +10,8 @@ function total(items) {` | The **hunk header**: this block starts at line 10 and covers 7 lines in the old file, and starts at line 10 covering 8 lines in the new file. The text after `@@` is the nearest function name, for context. |
| Lines starting with a space | Unchanged context lines, shown to help you find your place (three by default). |
| Lines starting with `-` | Removed. |
| Lines starting with `+` | Added. |

**A changed line is shown as a removal followed by an addition.** There is no "modified line" marker. Git compares text line by line; to change a line is to remove the old one and add the new one.

For new files the old side is `/dev/null`; for deleted files the new side is `/dev/null`. Renames show `rename from` and `rename to` lines.

## Summaries

For a big change, start with the overview:

```bash
$ git diff --stat
 src/cart.js     |  5 +++--
 src/coupons.js  | 22 ++++++++++++++++++++++
 README.md       |  2 +-
 3 files changed, 26 insertions(+), 3 deletions(-)

$ git diff --name-only
src/cart.js
src/coupons.js
README.md
```

Then narrow down to one file:

```bash
$ git diff -- src/cart.js
```

## Comparing branches

Before opening a pull request, it is useful to see everything your branch would bring into `main`:

```bash
$ git diff main...feature/coupons --stat
```

Note the **three dots**. Two and three dots mean different things in `git diff`:

| Form | Compares | Use it for |
|---|---|---|
| `git diff main feature` (same as `main..feature`) | The tip of main against the tip of feature | "How do these two snapshots differ right now?" Includes changes on main that feature doesn't have, shown as removals. |
| `git diff main...feature` | The point where feature branched off main, against the tip of feature | "What did this branch change?" This is what a pull request shows. |

For "what does my branch do?", use three dots.

## Word-level diffs

For documentation, long lines and prose, a whole-line diff hides the actual change. Ask for words instead:

```bash
$ git diff --word-diff
Customers can [-return-]{+exchange or return+} items within [-14-]{+30+} days.
```

`[-...-]` is removed text; `{+...+}` is added text. `--word-diff=color` shows the same thing with colour only.

## Useful diff options

| Option | Effect |
|---|---|
| `-w` | Ignore whitespace changes (useful when someone reformatted indentation) |
| `-U10` | Show 10 lines of context instead of 3 |
| `--color-words` | Coloured word diff |
| `--staged --stat` | Summary of what you are about to commit |
| `-- path` | Limit to certain files or folders |

:::tip Use a visual diff when it helps
`git difftool` opens diffs in a graphical tool (configure it with `diff.tool`). Most editors also show Git diffs visually. Reading the text format fluently still pays off, because code review tools, terminals and chat all use it.
:::

## A pre-commit habit

Before every commit:

```bash
$ git status              # which files?
$ git diff --staged       # which lines, exactly?
```

You will catch leftover `console.log`s, commented-out code, accidental formatting changes and the wrong file, before they reach a reviewer.

:::recap
### What you learned
- `git diff` shows unstaged changes; `--staged` shows staged changes; `HEAD` shows both.
- You can diff any two commits or branches. Use `main...feature` to see what a branch changed.
- In a diff, `-` lines are removed, `+` lines are added, space lines are context, and `@@` headers locate the hunk.
- `--stat` and `--name-only` summarise; `--word-diff` shows word-level changes; `-w` ignores whitespace.

### Key terms
```terms
Diff :: A description of the differences between two versions of text.
Unified diff :: The standard diff format with ---, +++, @@ headers and -, + and space lines.
Hunk header :: The @@ line giving the starting line and length of a block in the old and new files.
Context lines :: Unchanged lines shown around a change to help you locate it.
```

### Key commands
```commands
git diff :: Unstaged changes.
git diff --staged :: Staged changes (what the next commit will contain).
git diff HEAD :: All changes since the last commit.
git diff <a> <b> :: Differences between two commits or branches.
git diff main...feature :: What a branch changed since it split from main.
git diff --stat :: Summary of changed files.
git diff --word-diff :: Show changes word by word.
```

### Common mistakes
- Running `git diff` after staging and concluding nothing changed.
- Using two dots when you meant "what did my branch change" (use three).
- Committing without reviewing `git diff --staged`.

### Quick quiz
```quiz
? You staged all your changes. What does plain git diff show?
+ Nothing, because the working directory matches the staging area
- All your staged changes
- The last commit's changes
- An error
> Plain `git diff` compares the staging area with the working directory. Use `--staged` for staged changes.

? [predict] What does this hunk header mean?
| @@ -20,6 +20,9 @@ def checkout(cart):
- Lines 20–26 were deleted
+ The block starts at line 20 in both versions, covering 6 lines in the old file and 9 in the new
- 6 lines were removed and 9 were added
- The function checkout starts at line 20
> The -start,count and +start,count pairs locate the block. Here the new version has three more lines in this region.

? How does a diff show a line that was edited?
- With an M prefix
+ As a removed line (-) followed by an added line (+)
- With a ~ prefix
- It shows only the new line
> Git compares line by line; an edited line is the removal of the old text and the addition of the new.

? [scenario] Before opening a pull request, you want to see only what your branch feature/coupons changed since it split from main. Which command?
- git diff main feature/coupons
+ git diff main...feature/coupons
- git diff --staged
- git diff HEAD~1
> Three dots compare from the common ancestor to the branch tip, which is exactly what a pull request shows.
```

### Practical exercise
````exercise Diff all three ways
In `notes-app`:
1. Change a word in `README.md` and stage it.
2. Change a different word in `README.md` without staging.
3. Run `git diff`, `git diff --staged` and `git diff HEAD`, and explain what each shows.
4. Try `git diff --word-diff HEAD`.
---solution---
```bash
$ git diff            # shows only the second (unstaged) word change
$ git diff --staged   # shows only the first (staged) word change
$ git diff HEAD       # shows both, compared with the last commit
$ git diff --word-diff HEAD   # the same, marked as [-old-]{+new+}
```
This is Chapter 4's three-area model in action: each command compares a different pair of areas.
````

### What to learn next
You can see every change. Next, make sure some things never become changes at all, with `.gitignore`.
:::
