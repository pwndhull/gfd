---
id: git-log
part: 3
title: Reading History with git log
minutes: 20
level: Beginner
topics: 32 git log | 33 Reading commit history
objectives:
- Read the default git log output field by field
- Use --oneline, --graph, -n, --stat and -p to shape the output
- Filter history by author, date, message and file
- Navigate and exit the pager comfortably
concepts: commit history | commit hash | pager | decoration | graph
commands: git log | git log --oneline | git log --graph --all | git log --stat | git log -p | git log -- <path>
---
A history is only useful if you can read it. `git log` shows the commits reachable from where you are, newest first. It has dozens of options; this chapter covers the ten you will actually use. Chapter 65 returns to advanced filtering and formatting.

## The default output

```bash
$ git log
commit 8d1c4e2a7b0f39e5c6d1a8b2f4e7c9d0a1b2c3d4 (HEAD -> main)
Author: Priya Sharma <priya@acme.dev>
Date:   Tue Mar 3 10:42:07 2026 +1000

    Load notes store at startup

    The app needs the store before rendering the list view.

commit 51c0e2a9f8d7b6a5c4e3d2f1a0b9c8d7e6f5a4b3
Author: Priya Sharma <priya@acme.dev>
Date:   Tue Mar 3 10:31:55 2026 +1000

    Add notes store
```

Each commit shows:

| Line | Meaning |
|---|---|
| `commit 8d1c4e2…` | The full 40-character hash |
| `(HEAD -> main)` | **Decorations**: which branches, tags and HEAD point at this commit |
| `Author` | Who wrote the change, from their `user.name` and `user.email` |
| `Date` | When the change was authored, with the author's timezone offset |
| Indented text | The message: subject line, blank line, body |

### The pager

When the log is longer than your screen, Git shows it in a **pager** (usually `less`). The terminal looks "stuck" but is waiting for keys:

| Key | Action |
|---|---|
| `Space` / `f` | Next page |
| `b` | Previous page |
| `↓` `↑` or `j` `k` | One line |
| `/text` then Enter | Search forward; `n` for next match |
| `q` | **Quit** |

:::tip Skip the pager for one command
`git --no-pager log -n 5` prints straight to the terminal. Note that `--no-pager` goes before the command name.
:::

## The views you will actually use

### One line per commit

```bash
$ git log --oneline
8d1c4e2 (HEAD -> main) Load notes store at startup
51c0e2a Add notes store
7be20d4 Describe the app in README
3f2a9c1 Create notes app skeleton
```

`--oneline` shows the short hash, decorations and subject. This is the everyday view.

### Only the last few

```bash
$ git log --oneline -n 3        # or simply -3
```

### The graph of all branches

```bash
$ git log --oneline --graph --all
* e4c9b18 (feature/search) Add search box
| * 8d1c4e2 (HEAD -> main, origin/main) Load notes store at startup
|/
* 51c0e2a Add notes store
* 3f2a9c1 Create notes app skeleton
```

```cmd
git log --oneline --graph --all
--oneline :: One line per commit.
--graph :: Draw the branch structure with ASCII lines on the left.
--all :: Show commits from every branch, tag and remote-tracking branch, not only those reachable from HEAD.
```

Read the graph from the top down. Each `*` is a commit. Vertical lines connect a commit to its parent. Where two lines join (`|/`), the branches share history from that point down. Without `--all`, `git log` shows only commits reachable from HEAD, so other branches' work is hidden, which surprises many people.

### Which files changed

```bash
$ git log --stat -n 1
commit 8d1c4e2a... (HEAD -> main)
Author: Priya Sharma <priya@acme.dev>
Date:   Tue Mar 3 10:42:07 2026 +1000

    Load notes store at startup

 app.js | 3 ++-
 1 file changed, 2 insertions(+), 1 deletion(-)
```

`--stat` lists changed files with a count of added (`+`) and removed (`-`) lines.

### The actual changes

```bash
$ git log -p -n 1
```

`-p` ("patch") shows the full diff each commit introduced. Chapter 15 explains how to read diffs.

## Filtering history

| Question | Command |
|---|---|
| What did Sam commit? | `git log --author="Sam"` |
| What happened this week? | `git log --since="1 week ago"` |
| What happened between two dates? | `git log --since=2026-02-01 --until=2026-02-15` |
| Which commits mention "login"? | `git log --grep="login" -i` (`-i` ignores case) |
| What changed in this file? | `git log --oneline -- src/cart.js` |
| What changed in this folder? | `git log --oneline -- src/payments/` |
| Which commits added or removed the text `retryCount`? | `git log -S retryCount` |

The `--` separates options from file paths. It is optional when the path is unambiguous, but using it is a good habit: it stops Git from confusing a file named like a branch with the branch.

Filters combine: `git log --oneline --author=Sam --since="2 weeks ago" -- src/` means "Sam's commits in the last two weeks that touched `src/`".

:::tip Follow a file through renames
`git log --follow -- src/cart.js` keeps tracking the file's history across renames, which `git log -- <path>` alone does not.
:::

## Reading a history like a teammate

When you join a project, the log is the fastest way to learn it. Try this on any real repository:

1. `git log --oneline -n 30` — skim recent subjects. What kind of work is happening?
2. `git log --oneline --graph --all -n 40` — how are branches used? Many merges? A straight line?
3. `git shortlog -sn --since="3 months ago"` — who is active? (`shortlog` groups commits by author; `-s` shows counts only, `-n` sorts by count.)
4. `git log --oneline -- path/you/will/work/on` — who changed the area you are about to touch, and why?

You will get more context in ten minutes of log reading than from most onboarding documents.

## Commit hashes in practice

You rarely type full hashes. Any unique prefix works, usually seven characters:

```bash
$ git show 51c0e2a        # show one commit (Chapter 31)
$ git log 51c0e2a -n 3    # history starting from that commit
```

In larger repositories Git may print more than seven characters to keep short hashes unique. If a prefix is ambiguous, Git says so and you add a few more characters.

You can also refer to commits relative to HEAD:

| Reference | Means |
|---|---|
| `HEAD` | The commit you are on |
| `HEAD~1` or `HEAD~` | Its parent |
| `HEAD~3` | Three commits back, following first parents |
| `main~2` | Two commits before the tip of `main` |

:::recap
### What you learned
- `git log` lists commits reachable from HEAD, newest first, with hash, decorations, author, date and message.
- Press `q` to leave the pager.
- `--oneline`, `-n`, `--graph --all`, `--stat` and `-p` cover most daily needs.
- Filter with `--author`, `--since`, `--grep`, `-S` and `-- <path>`.
- Short hash prefixes and `HEAD~n` refer to commits without typing full hashes.

### Key terms
```terms
Commit history :: The chain of commits reachable from a starting point, usually HEAD.
Decoration :: The labels in parentheses showing which branches, tags and HEAD point at a commit.
Pager :: The scrolling viewer Git uses for long output; quit with q.
HEAD~n :: The commit n steps back from HEAD along first parents.
```

### Key commands
```commands
git log --oneline :: Compact history.
git log --oneline --graph --all :: History of every branch as a graph.
git log -n 5 :: Only the last five commits.
git log --stat :: Show which files each commit changed.
git log -p :: Show the full diff of each commit.
git log -- <path> :: History of one file or folder.
git log --author=<name> --since=<date> --grep=<text> :: Filter history.
```

### Common mistakes
- Thinking the terminal froze when the pager is open (press `q`).
- Forgetting `--all` and concluding a branch's commits "disappeared".
- Using `git log <file>` without `--` when a branch has a similar name.

### Quick quiz
```quiz
? [predict] What does (HEAD -> main, origin/main) on a commit mean?
- The commit is being merged
+ HEAD points to main, and both main and origin/main point at this commit
- The commit exists only on the server
- main and origin/main have diverged
> Decorations show which references point at a commit. Here your branch and your last-known server branch agree.

? The terminal shows a page of git log output and a colon at the bottom, and won't accept commands. What do you press?
+ q
- Ctrl+S
- Enter repeatedly
- Close the terminal
> You are in the pager. `q` quits it.

? Which command shows commits from every branch, not only the current one?
- git log --oneline
+ git log --all
- git log -p
- git log HEAD~1
> Without `--all`, git log shows only commits reachable from HEAD.

? You want every commit that changed src/cart.js. Which command?
- git log --grep=cart.js
+ git log -- src/cart.js
- git log --author=cart.js
- git log -S src/cart.js
> Paths after `--` limit history to commits that touched them. `--grep` searches messages, and `-S` searches for text added or removed in content.
```

### Practical exercise
```exercise Explore your history
In `notes-app`, run each of these and describe what you see in one sentence each:

1. `git log`
2. `git log --oneline`
3. `git log --stat -n 2`
4. `git log -p -n 1`
5. `git log --oneline -- README.md`
---solution---
1. Full details of every commit, newest first. 2. One line per commit. 3. The last two commits with the files each one changed. 4. The latest commit with its full diff. 5. Only the commits that changed README.md: your skeleton commit and the "Describe the app" commit.
```

### What to learn next
`git log -p` showed diffs. Next, learn to read diffs properly and compare any two states with `git diff`.
:::
