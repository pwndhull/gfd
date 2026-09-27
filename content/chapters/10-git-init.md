---
id: git-init
part: 3
title: Creating a Repository with git init
minutes: 16
level: Beginner
topics: 26 git init | 27 Understanding .git
objectives:
- Turn an ordinary folder into a Git repository
- Explain what the .git folder contains at a high level
- Recognise and avoid creating a repository in the wrong place
- Remove Git tracking from a folder safely if you need to
concepts: repository | .git | HEAD | refs | objects | working directory
commands: git init | ls -a | git status
---
Time to use Git for real. This part of the book builds one small project from an empty folder to its first push. Follow along in a terminal: the practice folder is disposable, so nothing you do here can harm real work.

## What git init does

`git init` turns the current folder into a Git repository. It creates one hidden folder, `.git`, where Git will keep the entire history. Your existing files are not changed, moved or committed.

```cmd
git init
git :: The Git program.
init :: Short for "initialise": create a new, empty repository in the current folder.
```

## Your first repository

```bash
$ mkdir ~/git-practice
$ cd ~/git-practice
$ mkdir notes-app && cd notes-app
$ git init
Initialized empty Git repository in /Users/priya/git-practice/notes-app/.git/
```

Read the output carefully: it tells you exactly where the repository was created. It is **empty**: there are no commits yet, even if the folder already contains files.

If you skipped setting `init.defaultBranch` in Chapter 8, older Git versions print a long hint about naming the initial branch. It is harmless. You can rename the branch at any time with `git branch -m main`.

```bash
$ git status
On branch main

No commits yet

nothing to commit (create/copy files and use "git add" to track)
```

You are "on branch main" even though no commit exists yet. The branch is **unborn**: HEAD already says it will be `main`, and the branch will actually come into existence with your first commit.

## Looking inside .git

Files and folders starting with a dot are hidden by default. Show them with `ls -a`:

```bash
$ ls -a
.     ..    .git

$ ls .git
HEAD        config      description hooks       info        objects     refs
```

You never need to edit these by hand, but knowing roughly what they hold removes a lot of mystery:

| Item | What it holds |
|---|---|
| `HEAD` | Which branch you are on. Right now it contains the text `ref: refs/heads/main`. |
| `config` | Settings for this repository only (the "local" level from Chapter 8), including remotes. |
| `objects/` | Git's database: every file version, folder listing and commit, compressed and named by hash. |
| `refs/` | Branches (`refs/heads/`), tags (`refs/tags/`) and remote-tracking branches (`refs/remotes/`). Each is a tiny file containing a commit hash. |
| `hooks/` | Sample scripts Git can run at certain moments, such as before a commit (Chapter 68). |
| `info/` | Contains `exclude`, a private ignore list for this repository only. |
| `description` | Used only by a few old web tools. Ignore it. |
| `index` | *Appears after your first `git add`.* The staging area. |

```bash
$ cat .git/HEAD
ref: refs/heads/main
```

That single line is the whole of HEAD's job in its normal state: "you are on the branch `main`". This is the same HEAD → branch → commit chain from Chapter 5, stored as plain text.

:::internals Branches really are tiny files
After your first commit, `.git/refs/heads/main` will contain nothing but a 40-character commit hash and a newline. Creating a branch writes another tiny file like that. This is why branching in Git is instant. (Git sometimes packs many refs into one file called `packed-refs` for efficiency, but the idea is the same.)
:::

## Where not to run git init

A repository covers its folder **and everything inside it**. Two common accidents:

**1. Running `git init` in your home folder.** Now every file you own is "untracked" in one giant repository, and every project inside your home folder appears nested inside it. Git tools become slow and confusing.

**2. Running `git init` inside a folder that is already part of a repository.** You create a repository inside a repository. The outer one sees the inner one as an odd, unreadable folder.

Check before you init:

```bash
$ git rev-parse --show-toplevel
fatal: not a git repository (or any of the parent directories): .git
```

That "fatal" message is what you *want* before `git init`: it means no parent folder is already a repository. If instead it prints a path, you are already inside a repository whose top level is that path.

:::recover Undoing an accidental git init
If you ran `git init` in the wrong place and have made no commits you care about, delete the `.git` folder. Your files are untouched; only Git's tracking disappears.

```bash
$ pwd                        # double-check where you are first!
/Users/priya
$ rm -rf .git                # macOS / Linux / Git Bash
```

On Windows PowerShell: `Remove-Item -Recurse -Force .git`. Be completely sure you are in the right folder: deleting `.git` in a real project deletes its entire local history.
:::

## git init versus git clone

You will create brand-new repositories with `git init` far less often than you think. On a team, the project usually already exists on GitHub and you **clone** it (Chapter 18), which creates the `.git` folder for you and fills it with the full history.

| Situation | Command |
|---|---|
| Starting a brand-new project that does not exist anywhere yet | `git init` |
| Putting an existing folder of code under version control for the first time | `git init` |
| Working on a project that already exists on GitHub | `git clone <url>` |

You can also create a folder and repository in one step: `git init my-project` creates `my-project/` with a `.git` inside it.

:::recap
### What you learned
- `git init` creates an empty repository by adding a hidden `.git` folder. It does not commit or change your files.
- The `.git` folder holds the object database, refs (branches and tags), HEAD, config and hooks.
- A fresh repository is on an unborn `main` branch until the first commit.
- Never init in your home folder or inside an existing repository; `git rev-parse --show-toplevel` checks.
- Deleting `.git` removes all local history but leaves your files.

### Key terms
```terms
.git :: The hidden folder containing a repository's entire database and settings.
Unborn branch :: A branch that HEAD names but that has no commit yet; it is created by the first commit.
refs :: Files that give names to commits: branches, tags and remote-tracking branches.
objects :: Git's database of stored content, named by hash.
```

### Key commands
```commands
git init :: Create a new repository in the current folder.
git init <folder> :: Create a folder and a repository inside it.
ls -a :: List files including hidden ones such as .git.
git rev-parse --show-toplevel :: Print the top folder of the current repository, or fail if not in one.
```

### Common mistakes
- Running `git init` in the home folder or inside another repository.
- Expecting `git init` to commit the files already in the folder.
- Using `git init` for a project that already exists on GitHub instead of cloning it.

### Quick quiz
```quiz
? What does git init do to the files already in the folder?
- Commits them as the first snapshot
- Moves them into .git
+ Nothing; they stay untracked until you add and commit them
- Deletes them
> `git init` only creates the `.git` folder. Existing files show up as untracked.

? [predict] What does .git/HEAD contain in a fresh repository with defaultBranch set to main?
| $ cat .git/HEAD
+ ref: refs/heads/main
- A 40-character commit hash
- main
- It is empty
> In the normal state HEAD is a symbolic reference naming the current branch. It holds a raw hash only in detached HEAD state.

? [scenario] You realise you ran git init in your home folder. What is the safest fix?
- Delete your home folder
+ Confirm you are in the home folder, then delete only the .git folder there
- Run git init again
- Commit everything and push it to GitHub
> Removing the stray `.git` folder removes the accidental repository and leaves every file intact.

? [tf] On a team, you usually start work with git init.
- True
+ False
> The project usually already exists on a server, so you start with `git clone`, which sets up the repository and history for you.
```

### Practical exercise
````exercise Create and inspect a repository
1. Create `~/git-practice/notes-app` and run `git init` inside it.
2. Run `git status` and read each line.
3. Run `ls -a` and `ls .git`.
4. Print `.git/HEAD`.
5. Check `git rev-parse --show-toplevel` from inside `notes-app` and from `~/git-practice`.
---solution---
```bash
$ mkdir -p ~/git-practice/notes-app && cd ~/git-practice/notes-app
$ git init
$ git status          # On branch main / No commits yet / nothing to commit
$ ls -a               # . .. .git
$ cat .git/HEAD       # ref: refs/heads/main
$ git rev-parse --show-toplevel     # /Users/you/git-practice/notes-app
$ cd .. && git rev-parse --show-toplevel   # fatal: not a git repository
```
The last command fails because `~/git-practice` itself is not a repository, only its `notes-app` subfolder is.
````

### What to learn next
Your repository is empty. Next you will add files and learn to read `git status`, your most-used command.
:::
