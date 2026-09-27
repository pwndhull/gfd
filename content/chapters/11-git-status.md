---
id: git-status
part: 3
title: Reading git status
minutes: 18
level: Beginner
topics: 28 git status | 29 Creating files
objectives:
- Create files and watch Git notice them
- Read every section of git status output
- Use the short status format and decode its two-letter codes
- Make git status your habit before and after every command
concepts: untracked file | tracked file | modified | staged | working tree clean
commands: git status | git status -s | git status -sb
---
If you run one Git command more than any other, it should be `git status`. It is read-only, instant and safe, and it tells you exactly what state your three areas are in. Experienced developers run it constantly, before and after almost everything.

```cmd
git status
git :: The Git program.
status :: Show which branch you are on, how it compares with its upstream, and which files are staged, modified or untracked. It never changes anything.
```

## Creating your first files

Continue in the `notes-app` repository from the previous chapter. Create two files. You can use your editor, or the shell:

```bash
$ echo "# Notes App" > README.md
$ echo "console.log('notes');" > app.js
```

(`echo "text" > file` writes that text into a new file. It is just a quick way to create files from the terminal.)

Now ask Git what it sees:

```bash
$ git status
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	README.md
	app.js

nothing added to commit but untracked files present (use "git add" to track)
```

Git noticed both files, but lists them as **untracked**: they exist in your working directory, but Git has never stored them. Creating a file never makes Git track it automatically. That is deliberate, so build outputs, secrets and personal notes do not sneak into history.

## The anatomy of git status

Once a project has some history and work in progress, status output has up to five parts. Here is a busy example:

```bash
$ git status
On branch main
Your branch is ahead of 'origin/main' by 2 commits.
  (use "git push" to publish your local commits)

Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	new file:   notes.js
	modified:   app.js

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   README.md
	deleted:    old.txt

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	todo.txt
```

| Part | What it tells you | Areas compared |
|---|---|---|
| **On branch main** | Where HEAD points | HEAD |
| **Your branch is ahead…** | How your branch compares with its upstream as of your last fetch | Local branch vs `origin/main` |
| **Changes to be committed** | What the next commit will contain | Repository vs staging area |
| **Changes not staged for commit** | Edits you have made to tracked files but not staged | Staging area vs working directory |
| **Untracked files** | New files Git is not tracking | Working directory only |

The labels on each file tell you what kind of change it is: `new file`, `modified`, `deleted`, `renamed`. And every section includes the commands to move files between areas. When in doubt, read the hints: they are accurate and tailored to the current situation.

:::tip A file can appear in two sections at once
If you stage a file and then edit it again, it shows up under both "Changes to be committed" (the staged version) and "Changes not staged for commit" (your newer edits). That is Chapter 4's model in action: the staging area and working directory hold different versions.
:::

## The states a file moves through

```graph File lifecycle
untracked --git add--> staged --git commit--> unmodified
                          ^                       |
                          |                    you edit
                          |                       v
                          +------git add------ modified
```

- **Untracked**: new to Git.
- **Staged**: in the staging area, will be in the next commit.
- **Unmodified** (also *clean*): tracked, and identical to the last commit. Clean files do not appear in `git status` at all.
- **Modified**: tracked, and changed since it was last staged.

## Short status

When you know the long format, the short format is faster to scan:

```bash
$ git status -s
A  notes.js
M  app.js
 M README.md
 D old.txt
?? todo.txt
MM config.js
```

Each line starts with **two columns**:

- The **left** column is the staging area (what is staged).
- The **right** column is the working directory (what is not staged yet).

| Code | Meaning |
|---|---|
| `??` | Untracked |
| `A ` | New file, staged |
| `M ` | Modified, staged |
| ` M` | Modified, not staged |
| `MM` | Staged, then modified again |
| ` D` | Deleted, not staged |
| `D ` | Deletion staged |
| `R ` | Renamed, staged |

Add `-b` to include the branch line: `git status -sb` prints `## main...origin/main [ahead 2]` at the top. Many developers alias this to `git st` (Chapter 69).

## When status says nothing

```bash
$ git status
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

**Working tree clean** means all three areas agree: nothing untracked, nothing modified, nothing staged. This is the best state to be in before switching branches, pulling, or starting something new.

:::warning "Up to date" is only as fresh as your last fetch
`git status` does not contact the server. "Your branch is up to date with 'origin/main'" compares with your remote-tracking branch, which may be hours old. Run `git fetch` first if the answer matters.
:::

## Why empty folders never show up

Create an empty folder and run status:

```bash
$ mkdir assets
$ git status -s
?? README.md
?? app.js
```

`assets/` does not appear. **Git tracks files, not folders.** A folder exists in Git's snapshots only because it contains tracked files. If you need an otherwise-empty folder in the repository, put a small placeholder file in it; a common convention is an empty file named `.gitkeep`. (The name has no special meaning to Git; it is just a file.)

:::recap
### What you learned
- New files are untracked until you add them. Git never tracks files automatically.
- `git status` shows the branch, the comparison with the upstream, staged changes, unstaged changes and untracked files.
- Each section compares two of the three areas.
- `git status -s` uses two columns: staging area on the left, working directory on the right.
- "Working tree clean" means nothing to commit. Git does not track empty folders.

### Key terms
```terms
Untracked :: A file in the folder that Git has never stored.
Unmodified / clean :: A tracked file identical to the last commit.
Modified :: A tracked file changed since it was last staged.
Staged :: A change placed in the staging area for the next commit.
Working tree clean :: The state where there is nothing to stage or commit.
```

### Key commands
```commands
git status :: Full status of the branch and all three areas.
git status -s :: Short, two-column status.
git status -sb :: Short status with the branch and ahead/behind line.
```

### Common mistakes
- Assuming a new file is being tracked because it is in the folder.
- Trusting "up to date" without fetching first.
- Expecting empty folders to be committed.

### Quick quiz
```quiz
? [predict] What does the short status line " M app.js" mean (note the leading space)?
- app.js is untracked
- app.js is modified and staged
+ app.js is modified but not staged
- app.js was deleted
> The left column (staging area) is blank and the right column (working directory) shows M: modified, not staged.

? [predict] What does "MM config.js" mean?
+ config.js was staged, then modified again after staging
- config.js was merged twice
- config.js has a merge conflict
- config.js is modified in two branches
> Left M: a version is staged. Right M: the working directory has further changes on top of it.

? [tf] git status contacts the server to check whether your branch is up to date.
- True
+ False
> `git status` is local only. It compares with `origin/main` as of your last fetch, pull or push.

? [scenario] You created an empty folder called logs, but git status doesn't mention it. Why?
- The folder is ignored by default
+ Git tracks files, not folders; an empty folder has nothing to track
- You must run git init inside every folder
- Folders only appear after the first push
> Add a file inside it (for example `.gitkeep`) if the folder must exist in the repository.
```

### Practical exercise
````exercise Watch the states change
In `notes-app`:
1. Run `git status -s` and note the codes.
2. Run `git add README.md` and run `git status -s` again.
3. Append a line to `README.md` (`echo "More" >> README.md`) and check the short status once more.

Predict each output before you run it.
---solution---
```text
1.  ?? README.md
    ?? app.js
2.  A  README.md
    ?? app.js
3.  AM README.md
    ?? app.js
```
In step 3 the left column still says `A` (the staged, newly added version) and the right says `M` (you changed it again after staging). `>>` appends to a file instead of overwriting it.
````

### What to learn next
You can see what Git sees. Next, control what goes into a commit with `git add` and the staging area.
:::
