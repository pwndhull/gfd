---
id: what-is-git
part: 1
title: Git, GitHub, Local and Remote
minutes: 18
level: Beginner
topics: 4 What is Git? | 5 Git vs GitHub | 6 Local vs remote repositories
objectives:
- Describe what Git is and what makes it distributed
- Explain the difference between Git and GitHub without mixing them up
- Tell a local repository from a remote repository
- Know which everyday actions touch the network and which do not
concepts: Git | GitHub | repository | local repository | remote | clone | push | pull
commands: git clone | git push | git pull
---
Chapter 1 explained *why* version control exists. This chapter introduces the specific tool you will use, and clears up the most common confusion new team members have: the difference between Git and GitHub.

## What is Git?

**Git is a free, open-source version control program that runs on your computer.** You install it like any other command-line tool. It tracks the history of a project folder and lets you record, inspect, combine and share changes.

Four facts about Git shape everything else in this book:

1. **Git is distributed.** Every copy of a project, called a **repository**, contains the entire history. Your laptop's copy is as complete as the one on the server.
2. **Git stores snapshots, not lists of edits.** Each commit records what the whole project looked like at that moment. Unchanged files are shared between snapshots rather than copied, so this stays small.
3. **Almost everything is local.** Recording a commit, viewing history, creating a branch, comparing versions: none of these need a network connection, so they are fast.
4. **Git protects its history.** Every commit is identified by a long ID calculated from its contents. If anything in the history were altered or corrupted, the IDs would stop matching and Git would notice.

:::jargon repository (repo)
Plain English: a project folder that Git is tracking, *plus* the hidden database where Git keeps that project's full history. People say "repo" for short. When someone says "clone the repo", they mean "make your own full copy of the project and its history".
:::

## Git vs GitHub

This is the single most common source of confusion for new developers, so it is worth being precise.

| | Git | GitHub |
|---|---|---|
| What it is | A program | A website and company (owned by Microsoft) |
| Where it runs | On your computer | In the cloud, in your browser |
| What it does | Records history, branches, merges | Hosts copies of Git repositories so people can share them |
| Extra features | None beyond version control | Pull requests, code review, issues, permissions, CI (GitHub Actions), wikis |
| Needed to use Git? | Yes | No |
| Alternatives | Mercurial, Subversion (different tools) | GitLab, Bitbucket, Azure DevOps, self-hosted servers |

:::analogy Email and Gmail
Git is like email: an open standard and a set of tools that work anywhere. GitHub is like Gmail: one popular company that hosts your mailbox and adds a nice interface and extra features on top. You can use email without Gmail, and Gmail is not "email itself". Likewise, you can use Git with no GitHub account at all, and GitHub is one of several places to host Git repositories.
:::

Your team almost certainly uses Git *and* a hosting service. This book teaches Git first, because it is what actually manipulates your history. GitHub gets its own part (Part 13) once you understand what it is hosting.

:::tip Where each command runs
Every command that starts with `git` runs Git on your machine. Buttons you click on github.com run GitHub's features on its servers. When a teammate says "just merge it", check whether they mean the `git merge` command locally or the **Merge pull request** button on GitHub. Both combine work, but in different places.
:::

## Local vs remote repositories

Because Git is distributed, a project usually exists in several places at once.

- A **local repository** is the copy on your own computer. You edit files here, record commits here, and experiment freely. Nobody else can see it.
- A **remote repository** is another copy of the same project that lives somewhere else, usually on a server like GitHub. Git keeps a short name for each remote it knows about. The usual name for the main one is **origin**.

The two are not automatically kept in sync. Git deliberately makes sharing a separate step:

- **push** sends your new commits from your local repository to a remote.
- **fetch** downloads new commits from a remote into your local repository, without changing your work.
- **pull** is a fetch followed by combining the downloaded commits into the branch you are working on.
- **clone** creates a brand-new local repository by copying a remote one, including its entire history.

```diagram architecture
```

This separation has practical consequences you will rely on every day:

- You can commit ten times while offline on a train, then push once when you have a connection.
- Your commits are private until you push, so you can tidy them first.
- Seeing a teammate's latest work requires an explicit fetch or pull. If you never fetch, your view of the server grows stale.

:::warning "My commit is saved" is not the same as "my commit is shared"
A common beginner surprise: you commit, go home, and your teammate cannot see your work. Committing records it in *your* local repository only. It reaches the team when you **push**. Until then, if your laptop is lost, so is that commit. Push at least once a day, even for unfinished work on your own branch.
:::

## Which actions need the network?

| Action | Network needed? | Command |
|---|---|---|
| Record a commit | No | `git commit` |
| View history | No | `git log` |
| Create or switch branches | No | `git branch`, `git switch` |
| Compare versions | No | `git diff` |
| Combine two branches | No | `git merge` |
| Copy a repository for the first time | Yes | `git clone` |
| Share your commits | Yes | `git push` |
| Get teammates' commits | Yes | `git fetch`, `git pull` |

Only four everyday commands talk to another machine: `clone`, `fetch`, `pull` and `push`. Everything else happens instantly on your computer. Keeping this list in mind explains many "why didn't that update?" moments later.

## A day in the life, at a glance

Here is what an ordinary working day looks like in commands. Do not run these yet; each command gets its own chapter. The goal is to see the shape of the work.

```bash title="An ordinary day (preview)"
$ git pull                              # get what teammates pushed overnight
$ git switch -c feature/password-reset   # start a separate line of work
# ... edit files in your editor ...
$ git add reset.js                       # choose what goes into the next snapshot
$ git commit -m "Add password reset form"  # record the snapshot locally
$ git push -u origin feature/password-reset  # share it with the team
# ... open a pull request on GitHub, get a review, merge ...
```

Notice the rhythm: **get the latest → work locally in small recorded steps → share**. The rest of this book fills in each step and, just as importantly, what to do when a step goes wrong.

:::recap
### What you learned
- Git is a free version control program on your computer; it is distributed, snapshot-based and mostly local.
- GitHub is a hosting website for Git repositories that adds collaboration features. Git works without it.
- A local repository is your copy; a remote repository is another copy, usually on a server, typically named `origin`.
- Only `clone`, `fetch`, `pull` and `push` use the network. Committing and branching are local and private until you push.

### Key terms
```terms
Git :: The version control program that runs on your computer.
GitHub :: A website that hosts Git repositories and adds pull requests, reviews, issues and automation.
Local repository :: The copy of a project and its history on your own computer.
Remote repository :: Another copy of the project, usually on a server, that you push to and fetch from.
origin :: The conventional name Git gives the remote you cloned from.
Clone :: To create a new local repository by copying an existing one, including all history.
Push / fetch / pull :: Send your commits to a remote / download a remote's commits / download and combine them into your branch.
```

### Key commands
```commands
git clone <url> :: Copy a remote repository to your computer (Chapter 18).
git push :: Send your local commits to the remote (Chapter 22).
git fetch :: Download new commits from the remote without changing your work (Chapter 20).
git pull :: Fetch, then combine the new commits into your current branch (Chapter 21).
```

### Common mistakes
- Saying "GitHub" when you mean Git, or expecting GitHub to know about commits you have not pushed.
- Assuming your commit is backed up because you committed. It is only on your machine until you push.
- Assuming your local view of the server is current. It is only as fresh as your last fetch or pull.

### Quick quiz
```quiz
? Which statement is true?
- GitHub is the program that records commits on your computer
+ Git records history on your computer; GitHub hosts copies of repositories online
- You need a GitHub account to use Git
- Git and GitHub are two names for the same thing
> Git is the local program. GitHub is a hosting service built around Git. You can use Git entirely offline without any account.

? [tf] After running git commit, your teammates can immediately see your new commit on GitHub.
- True
+ False
> A commit is recorded only in your local repository. It reaches GitHub when you run `git push`.

? [scenario] You are on a flight with no Wi-Fi. Which of these can you still do?
- Push your commits to GitHub
+ Commit, create branches and view history
- Clone a new repository
- Pull your teammates' latest commits
> Committing, branching and viewing history are local operations. Clone, fetch, pull and push need to reach the remote.

? What does the name origin usually refer to?
- The first commit in the repository
- The main branch
+ The remote repository you cloned from
- Your local copy of the project
> `origin` is simply the default short name Git gives the remote you cloned from. It is a name for a URL, not a branch or commit.
```

### Practical exercise
```exercise Map your team's setup
Ask a teammate, or look at your team's documentation, and answer:

1. Which hosting service does your team use (GitHub, GitLab, Bitbucket, something else)?
2. What is the URL of the main repository you will work on?
3. Is the main branch called `main`, `master`, `develop` or something else?

Then, for each of these actions, write "local" or "network": commit, push, view history, create a branch, pull.
---solution---
The first three answers depend on your team. Keep them handy: you will need the URL in Chapter 18 (clone).

Commit: local. Push: network. View history: local. Create a branch: local. Pull: network.
```

### What to learn next
You now know where Git lives and where your work can live. Next, a guided tour of Git's vocabulary so the words in the rest of the book feel familiar before you need them.
:::
