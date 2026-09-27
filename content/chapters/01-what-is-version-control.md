---
id: what-is-version-control
part: 1
title: What Is Version Control?
minutes: 16
level: Beginner
topics: 1 What is version control? | 2 Why developers need version control | 3 Problems before Git
objectives:
- Explain version control in one plain-English sentence
- Name five concrete problems version control solves for a team
- Describe how developers worked before tools like Git, and why it broke down
- Recognise the difference between saving a file and recording a version
concepts: version control | snapshot | history | repository | commit
commands: git --version
---
Every developer on your new team will assume you "know Git". Most people who say that actually know six commands and a lot of anxiety. This book fixes that by starting where Git itself started: with the problem it solves. Once the problem is clear, the commands stop looking like magic words.

## Version control in one sentence

**Version control is a system that records changes to a set of files over time, so you can see who changed what, when and why, and get back any earlier version.**

That is the whole idea. Everything else, including branches, merges, pull requests and rebases, is a feature built on top of "record changes and let me get old versions back".

Three words in that sentence matter:

- **Records.** The system keeps the history for you. You do not manage folders of copies by hand.
- **A set of files.** Version control tracks a whole project together, not one document at a time. A change to `login.js` and a matching change to `login.css` can be recorded as one unit.
- **Why.** Every recorded change carries a message written by a person. That message is often more valuable than the code change itself six months later.

:::analogy Save points in a video game
Saving your file is like the game auto-saving your current position: it only remembers *now*. Version control is like the named save slots you create before a boss fight. You can have dozens of them, each labelled ("before the bridge", "got the sword"), and you can load any of them later. Git calls those save slots **commits**.
:::

## Saving is not the same as versioning

When you press Ctrl+S in your editor, the file on disk is overwritten. The previous contents are gone. Your editor's undo history might help for a few minutes, but close the editor and it is lost.

A version control system keeps a **snapshot** each time you ask it to. A snapshot is a complete picture of the tracked files at that moment. You decide when a snapshot is worth taking, usually when you finish a small, meaningful piece of work: "Add password validation", "Fix typo on pricing page".

| | Saving a file | Recording a version |
|---|---|---|
| What it keeps | Only the latest contents | Every snapshot you recorded |
| Who changed it? | Unknown | Author name and email on every snapshot |
| Why? | Unknown | A message written by the author |
| Can you go back? | Only with editor undo, briefly | Any snapshot, any time |
| Works across files? | One file at a time | The whole project together |

```diagram snapshots
```

## Why developers need version control

It is easy to think version control exists so you can undo mistakes. That is true, but on a team it is the smallest of its benefits. Here are the problems it solves, roughly in the order you will feel them in your first month.

### 1. Undo without fear

You refactor a function, run the tests, and three unrelated things break. Without version control you try to remember what the code looked like an hour ago. With it, you can see exactly what you changed and throw away just those changes. Fear of breaking things is the number one reason beginners write timid code. Version control removes that fear.

### 2. Many people, one codebase

Five developers edit the same project in the same week. Somebody has to combine their work. Version control tracks each person's changes separately and combines them, pointing out the rare places where two people changed the same lines in different ways.

### 3. Knowing why code exists

You find a strange line: `if (retries > 3) sleep(200)`. Is it a hack? Is it load-bearing? Version control can tell you who added it, on what day, as part of which change, and what their message said: "Back off when the payment API rate-limits us (incident #412)". Now you know not to delete it.

### 4. Working on several things at once

You are halfway through a new feature when a production bug report arrives. Version control lets you put the feature aside in its own line of work, fix the bug from a clean state, ship the fix, and return to the feature exactly where you left it. Git calls these separate lines of work **branches**, and they get a whole part of this book.

### 5. Reviewing changes before they land

On professional teams, nobody's code goes straight into the main product. It is proposed as a set of recorded changes, a teammate reads the differences, comments, and approves. That review process is built entirely on version control's ability to show "what changed".

### 6. Releasing and supporting versions

Customers run version 2.3 while you build 2.4. A security bug appears in 2.3. Version control lets you get the exact code that shipped as 2.3, fix it, and ship 2.3.1, without dragging along half-finished 2.4 work.

### 7. A backup that knows history

Because every copy of a Git project contains the full history (more on that in the next chapter), a laptop dying is an inconvenience rather than a catastrophe.

:::note You will not use all of this on day one
On your first day you will mostly use points 1 and 2: recording your changes and sharing them. The rest arrives naturally as you work on a team. Each has its own chapter.
:::

## How people worked before Git

Understanding the old ways makes Git's design choices obvious. There were three broad stages.

### Stage 1: Copies of folders

The oldest method, and the one many people still use for documents:

```text title="A project folder, the manual way"
website/
website-backup/
website-backup-2/
website-final/
website-final-REALLY-final/
website-final-fixed-header-DO-NOT-DELETE/
```

This breaks down quickly:

- **No messages.** What is the difference between `backup-2` and `final`? Nobody knows without opening both.
- **No authorship.** Who made `fixed-header`? When?
- **Combining work is manual.** If two people each have a copy and both changed things, someone has to open files side by side and merge by hand, usually missing something.
- **Wasted space and confusion.** Full copies of everything, every time.

### Stage 2: Emailing files and "the shared drive"

Teams put code on a shared network drive or emailed zip files around. Now at least there was one place. But two people could open the same file, both edit it, and whoever saved last silently erased the other's work. Some teams used rules like "shout across the office before editing `config.php`". That does not scale past a handful of people in one room.

### Stage 3: Centralized version control

Tools like CVS and Subversion (SVN) introduced a proper server that recorded history. Developers **checked out** files from the server, edited them, and **committed** changes back. This was a big improvement: real history, messages and authorship.

But everything depended on that one server:

- **Server down, work stops.** You could not record a change or even look at history without a network connection to it.
- **Server lost, history lost.** If the server's disk died without a good backup, years of history went with it.
- **Branching was expensive.** Creating a separate line of work often meant copying large parts of the project on the server, so teams avoided it and worked on one shared line, stepping on each other constantly.
- **Commits were public immediately.** There was no way to make a series of small private experiments and tidy them before sharing.

```diagram vcs-models
```

### Stage 4: Distributed version control (Git)

Git, created in 2005 by Linus Torvalds for developing the Linux kernel, took a different approach: **every developer has a complete copy of the project, including its entire history**. You record changes locally, on your own machine, as often as you like. When you are ready, you exchange changes with other copies. A server such as GitHub is just one more copy that the team agrees to treat as the shared meeting point.

That single design decision explains most of what you will learn:

- Committing is fast and works offline, because it only touches your own copy.
- Branching is cheap, because it is a local operation on your own history.
- "Sharing" is a separate, deliberate step (`push`), so you can make messy commits and tidy them before anyone sees them.
- There is no single point of failure; every clone is a full backup.

:::internals Why Git was built
In 2005 the Linux kernel project lost free access to BitKeeper, the proprietary distributed tool it had been using. Torvalds wrote the first version of Git in about two weeks with three goals: speed, strong protection against corrupted or tampered history, and excellent support for thousands of people working in parallel. Those goals still shape Git's behaviour today, including the long commit IDs you will meet soon, which double as checksums of the content.
:::

## Checking that Git exists on your machine

You will install and configure Git properly in Part 2. For now, it is worth knowing how to ask your computer whether Git is already there. Open a terminal (Terminal on macOS, Git Bash or PowerShell on Windows, any terminal on Linux) and type:

```cmd
git --version
git :: The Git program. Every Git command starts with this word.
--version :: An option (also called a flag) asking Git to print its version number and stop. Options usually start with one or two dashes.
```

```bash
$ git --version
git version 2.46.0
```

If you see a version number, Git is installed. Your number may be different; anything from 2.23 onward supports every everyday command in this book, and newer is better. If you see `command not found` or `'git' is not recognized`, that is fine: Chapter 7 walks you through installing it.

:::mistake Typing the dollar sign
Throughout this book, a line starting with `$ ` is something you type, and the `$` stands for your terminal's prompt. Do not type the `$` itself. Lines without it are output that Git prints back.
:::

## What version control does not do

Setting expectations now avoids confusion later:

- **It does not save automatically.** Git records a snapshot only when you tell it to. Unrecorded edits are not protected.
- **It is not a backup of your whole computer.** It tracks the files in one project folder, and only those you tell it to track.
- **It does not understand your code.** Git sees text lines, not functions. It can combine two edits to different lines of the same file, but it cannot know whether the combined program still works. That is what tests and code review are for.
- **It is not GitHub.** Git is the tool on your computer. GitHub is a website that hosts copies of Git projects and adds collaboration features. The next chapter makes this distinction clear.

:::recap
### What you learned
- Version control records changes to a set of files over time, with who, when and why, so any earlier version can be recovered.
- Saving overwrites; recording a version keeps a snapshot you can return to.
- On a team, version control's biggest benefits are combining work, explaining why code exists, working on several things at once, and reviewing changes.
- Before Git, teams used folder copies, shared drives, then centralized servers. Each broke down as teams grew.
- Git is distributed: every copy has the full history, so committing and branching are fast, local and safe.

### Key terms
```terms
Version control :: A system that records changes to files over time so you can review them and recover earlier versions.
Snapshot :: A complete picture of all tracked files at one moment in time.
Commit :: Git's name for one recorded snapshot, along with its author, date and message.
Repository :: A project tracked by version control, including all of its history.
Centralized version control :: A model where the full history lives only on one server (for example Subversion).
Distributed version control :: A model where every copy contains the full history (for example Git).
```

### Key commands
```commands
git --version :: Prints the installed Git version. A quick way to check that Git is installed.
```

### Common mistakes
- Assuming that saving a file in your editor also records it in Git. It does not; recording is a separate step.
- Thinking Git and GitHub are the same thing.
- Typing the `$` prompt character when copying commands from documentation.

### Quick quiz
```quiz
? Which description best matches version control?
- A tool that automatically saves your files every few minutes
+ A system that records snapshots of a project over time, with author, date and message, so earlier versions can be recovered
- A website where you upload code to share it
- A program that checks your code for bugs
> Version control records snapshots when you ask it to, along with who made them and why. It does not save automatically and it does not check correctness.

? [tf] In Git, you need a network connection to record a new snapshot of your work.
- True
+ False
> Git is distributed. Recording a commit only touches your local copy, so it works offline. You need the network only to exchange commits with another copy, such as GitHub.

? [scenario] You find a mysterious line of code and want to know whether it is safe to delete. How does version control help most?
- It automatically deletes unused code
+ It shows who added the line, when, and the message explaining why
- It prevents you from deleting code other people wrote
- It runs the program to check if the line matters
> Every recorded change carries an author, date and message. Tools like `git log` and `git blame` (covered later) let you find out why a line exists before you change it.

? What was the biggest weakness of centralized version control compared with Git?
- It had no commit messages
+ The full history lived on one server, so work stopped when it was unreachable and history was at risk if it was lost
- It could only track one file
- It did not support more than one developer
> Centralized tools did record messages and authors, but everything depended on the single server. Git gives every developer a full copy of the history.
```

### Practical exercise
```exercise Check your starting point
Open a terminal and run `git --version`. Write down the version number, or the error you get.

Then think of one project (school, work or personal) where you kept multiple copies of files by hand. List two things you could not find out from those copies that version control would have told you.
---solution---
If you saw something like `git version 2.44.0`, Git is installed and you can skip straight to configuration in Chapter 8 when you get there. If you saw "command not found" or "not recognized", Chapter 7 covers installation for your operating system.

Typical answers for the second part: *which copy was the latest*, *who made a change*, *why a change was made*, *what exactly differed between two copies*, and *how to combine two people's edits*.
```

### What to learn next
Now that you know what version control is for, the next chapter introduces Git itself: what makes it different, how it relates to GitHub, and what "local" and "remote" repositories mean.
:::
