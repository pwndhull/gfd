---
id: git-vocabulary
part: 1
title: Git's Vocabulary, Decoded
minutes: 15
level: Beginner
topics: 7 Git terminology
objectives:
- Recognise the twenty words you will hear most often on a Git team
- Group Git terms into places, things, pointers and actions
- Translate a sentence of team jargon into plain English
- Know which terms are Git itself and which are GitHub features
concepts: working directory | staging area | repository | commit | branch | HEAD | remote | origin | merge | rebase | pull request
commands: git help | git <command> --help
---
Git has a reputation for confusing vocabulary, partly because some words mean slightly different things in everyday English, and partly because the same idea sometimes has two names. This chapter is a guided tour, not a test. Read it once now; every term comes back later with a full explanation.

## Four families of words

Almost every Git term fits into one of four families. Knowing the family tells you what kind of thing a word is before you know exactly what it means.

| Family | Question it answers | Examples |
|---|---|---|
| **Places** | Where is my work right now? | working directory, staging area, repository, remote |
| **Things** | What does Git store? | commit, snapshot, blob, tree, tag |
| **Pointers** | Which thing am I talking about? | branch, HEAD, origin/main, tag, `HEAD~1` |
| **Actions** | What am I doing to it? | add, commit, push, pull, fetch, merge, rebase, reset |

Keeping these families apart prevents the most common mix-ups. For example, a **branch** feels like a *place* ("I'm on the login branch"), but in Git it is a *pointer*: a label stuck on one commit. That single insight makes branching, merging and rebasing far easier, and Chapter 5 builds on it.

## Places: where your work lives

**Working directory** (also *working tree*). The ordinary project folder you see in your editor and file browser. When you edit a file, you are changing the working directory.

**Staging area** (also *index*, sometimes *cache*). A holding area where you assemble exactly what the next commit will contain. You put changes here with `git add`.

**Repository** (also *repo*, or *the .git folder*). Git's database of every commit ever recorded in this project. It lives in a hidden folder called `.git` at the top of your project.

**Remote**. Another repository somewhere else, usually on a server, that you exchange commits with. **origin** is the conventional name for the main one.

## Things: what Git stores

**Commit**. A recorded snapshot of the project, plus metadata: author, date, message and a link to the commit(s) before it. Commits are permanent in the sense that they are never edited in place; "changing" one really creates a new one.

**Commit hash** (also *SHA*, *commit ID*). A 40-character identifier like `3f2a9c1e0b...` calculated from the commit's contents. People usually shorten it to the first 7 characters: `3f2a9c1`.

**Tag**. A fixed name for one specific commit, usually a release like `v2.3.0`.

**Blob** and **tree**. Git's internal words for a file's contents and a folder listing. You will not need them until Part 15, but you may see them in error messages.

## Pointers: naming a commit

**Branch**. A movable name that points at one commit. When you commit on a branch, the name moves forward to your new commit.

**HEAD**. Git's answer to "where am I?". Usually it points at the branch you are on, which in turn points at a commit.

**main** (or *master*). The name of the default branch in most repositories. `master` was the long-time default; `main` is the modern default on GitHub and in newer Git setups. They behave identically.

**origin/main**. Your repository's memory of where `main` was on the remote `origin` the last time you talked to it. Called a **remote-tracking branch**.

**HEAD~1**, **HEAD^**. Relative references: "one commit before HEAD". `HEAD~3` means three commits back.

## Actions: what you do

| Word | Plain English |
|---|---|
| **init** | Turn a folder into a Git repository |
| **clone** | Copy an existing repository, with all its history, onto your machine |
| **add** / **stage** | Put a change into the staging area for the next commit |
| **commit** | Record the staged changes as a new snapshot |
| **push** | Send your commits to a remote |
| **fetch** | Download commits from a remote without changing your work |
| **pull** | Fetch, then combine those commits into your current branch |
| **merge** | Combine another branch's work into the current branch |
| **rebase** | Replay your commits on top of a different starting point |
| **checkout** / **switch** | Move to a different branch (or, for checkout, several other jobs) |
| **reset** | Move the current branch to a different commit, optionally discarding changes |
| **revert** | Create a new commit that undoes an earlier commit |
| **stash** | Put uncommitted changes aside temporarily |
| **cherry-pick** | Copy one commit from elsewhere onto the current branch |

## GitHub words (not Git)

These come from hosting platforms, not from Git itself. You will not find a `git pull-request` command.

- **Pull request** (PR). A proposal on GitHub to merge one branch into another, with a page for discussion, review and automated checks. GitLab calls the same idea a **merge request** (MR).
- **Fork**. Your own server-side copy of someone else's repository, used mostly in open source.
- **Review**, **approve**, **request changes**. Code review actions on a pull request.
- **Issue**. A tracked task, bug report or discussion.
- **Actions**. GitHub's automation system that runs tests or deployments when things happen in the repository.

## Translating team-speak

Here is how a real message from a teammate decodes, word by word.

> "Can you rebase your branch on main and force-push? Your PR has conflicts with the migration I merged."

- **rebase your branch on main**: replay your commits on top of the latest `main` so they include my new work (Part 8).
- **force-push**: replace your branch on the server with the rewritten version, which a normal push would refuse (Part 8 and Part 17).
- **Your PR has conflicts**: your changes and mine touch the same lines, so Git cannot combine them automatically (Part 7).
- **I merged**: my pull request was combined into `main` on GitHub.

In a few weeks that sentence will read as plainly as English. Right now the goal is only to know which chapter each phrase lives in.

## Getting help from Git itself

Git ships with a complete manual. Two ways to open it:

```cmd
git commit --help
git :: The Git program.
commit :: The command you want help with. Replace it with any command name.
--help :: Opens the full manual page for that command.
```

```bash
$ git commit -h          # short summary of options, printed in the terminal
$ git commit --help      # full manual page (press q to quit on macOS/Linux)
$ git help glossary      # Git's own glossary of terms
```

On Windows, `--help` usually opens the manual in your web browser. On macOS and Linux it opens in the terminal's pager; press `q` to quit and `/` to search.

:::tip The glossary is always one click away
This book has a searchable [glossary](#glossary). Every key concept chip in the right-hand panel of a chapter links to its entry. Press `/` anywhere to search.
:::

:::recap
### What you learned
- Git terms fall into four families: places, things, pointers and actions.
- The three local places are the working directory, the staging area (index) and the repository.
- A branch is a pointer to a commit, not a folder or a copy. HEAD points to the branch you are on.
- Pull requests, forks, issues and Actions are GitHub features, not Git commands.
- `git <command> -h` and `git <command> --help` show built-in help.

### Key terms
```terms
Working directory :: The project files you see and edit.
Staging area / index :: Where you assemble the next commit.
Repository :: Git's database of all commits, in the `.git` folder.
Branch :: A movable name pointing at a commit.
HEAD :: Git's pointer to where you currently are, usually a branch.
Remote-tracking branch :: A read-only pointer like `origin/main` showing where a remote's branch was at your last fetch.
Pull request :: A GitHub proposal to merge one branch into another, with review and discussion.
```

### Key commands
```commands
git help <command> :: Open the full manual for a command.
git <command> -h :: Print a short summary of a command's options.
git help glossary :: Open Git's own glossary.
```

### Common mistakes
- Treating a branch as a separate folder or copy of the code.
- Looking for a Git command to open a pull request. Pull requests are created on GitHub (or with GitHub's separate `gh` tool).
- Confusing `main` (your local branch) with `origin/main` (your last known copy of the server's branch).

### Quick quiz
```quiz
? Which family does "branch" belong to?
- Places
- Things
+ Pointers
- Actions
> A branch is a movable name that points at a commit. It feels like a place, but it is a pointer.

? Which of these is a GitHub feature rather than a Git command?
- merge
- rebase
+ pull request
- stash
> Pull requests exist on hosting platforms. Git itself has merge, rebase and stash commands.

? [predict] What does this print?
| $ git status -h
- Your commit history
+ A short summary of the status command's options
- The full manual page in your browser
- An error, because -h is not an option
> `-h` prints a brief usage summary for any Git command. `--help` opens the full manual.

? What is another name for the staging area?
- The working tree
+ The index
- The remote
- HEAD
> Git's documentation uses "index" and "staging area" for the same thing.
```

### Practical exercise
```exercise Decode a message
Translate this message into plain English using the tables in this chapter. Note which chapter or part of the book covers each phrase.

"I fetched but origin/main still doesn't have your commit. Did you push, or is it only local? If it's on your branch, just open a PR against main."
---solution---
- *I fetched*: I downloaded the latest commits from the server (Chapter 20).
- *origin/main still doesn't have your commit*: my copy of the server's main branch does not include your change (Chapter 23).
- *Did you push, or is it only local?*: your commit may exist only in your local repository (Chapters 2 and 22).
- *open a PR against main*: create a pull request on GitHub asking to merge your branch into main (Chapter 51).
```

### What to learn next
With the vocabulary in place, the next chapter builds the single most important mental model in Git: the three places your changes move through on the way to becoming a commit.
:::
