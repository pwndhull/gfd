---
id: your-first-complete-workflow
part: 3
title: Your First Complete Workflow
minutes: 25
level: Beginner
topics: 37 Your first complete workflow
objectives:
- Take a project from an empty folder to a repository on GitHub in one sitting
- Use status, add, diff, commit and log together as a daily loop
- Connect a local repository to a new GitHub repository and push it
- Recognise the everyday rhythm you will repeat thousands of times
concepts: repository | commit | staging area | remote | origin | push | upstream
commands: git init | git status | git add | git commit | git log | git remote add | git push -u
---
This chapter is a quick start and a checkpoint. It walks through a whole session: create a project, make several commits, ignore what should be ignored, and publish it to GitHub. If you skipped ahead to this chapter, it works on its own; each step links back to where it is explained in depth.

Budget about 20 minutes. Type every command rather than copying; your fingers learn the rhythm.

## Step 0: check your setup

```bash
$ git --version
git version 2.46.0
$ git config user.name
Priya Sharma
$ git config user.email
priya@acme.dev
```

If the name or email is empty, set them now ([Chapter 8](#ch-configuring-git)).

## Step 1: create the project and repository

```bash
$ mkdir -p ~/git-practice/recipe-box && cd ~/git-practice/recipe-box
$ git init
Initialized empty Git repository in /Users/priya/git-practice/recipe-box/.git/
```

## Step 2: add some files

```bash
$ echo "# Recipe Box" > README.md
$ echo "A tiny collection of recipes." >> README.md
$ mkdir recipes
$ echo "Pancakes: flour, milk, eggs" > recipes/pancakes.txt
$ echo "debug output" > server.log
```

```bash
$ git status -s
?? README.md
?? recipes/
?? server.log
```

Git sees three new things. Note that it lists the folder `recipes/` rather than each file inside it: status collapses untracked folders to keep output short.

## Step 3: ignore what should not be committed

`server.log` is noise. Ignore logs before your first commit so they never enter history ([Chapter 16](#ch-gitignore)):

```bash
$ echo "*.log" > .gitignore
$ git status -s
?? .gitignore
?? README.md
?? recipes/
```

`server.log` vanished from status. That's the ignore rule working.

## Step 4: stage, check, commit

```bash
$ git add .
$ git status
On branch main

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
	new file:   .gitignore
	new file:   README.md
	new file:   recipes/pancakes.txt

$ git commit -m "Create recipe box with first recipe"
[main (root-commit) 1a2b3c4] Create recipe box with first recipe
 3 files changed, 4 insertions(+)
 create mode 100644 .gitignore
 create mode 100644 README.md
 create mode 100644 recipes/pancakes.txt
```

Notice status's hint says `git rm --cached` to unstage: before the first commit, that is the right command (Chapter 12 explained why).

## Step 5: the daily loop

Now the rhythm you will repeat every day: **edit → status → diff → add → commit**.

```bash
$ echo "Omelette: eggs, butter, salt" > recipes/omelette.txt
$ echo "Pancakes: flour, milk, eggs, a pinch of salt" > recipes/pancakes.txt

$ git status -s
 M recipes/pancakes.txt
?? recipes/omelette.txt

$ git diff
diff --git a/recipes/pancakes.txt b/recipes/pancakes.txt
index 7c3b1a0..e1d9f22 100644
--- a/recipes/pancakes.txt
+++ b/recipes/pancakes.txt
@@ -1 +1 @@
-Pancakes: flour, milk, eggs
+Pancakes: flour, milk, eggs, a pinch of salt
```

Two unrelated changes: a new recipe and a tweak to an old one. Commit them separately so each commit tells one story:

```bash
$ git add recipes/omelette.txt
$ git commit -m "Add omelette recipe"

$ git add recipes/pancakes.txt
$ git commit -m "Add salt to pancakes"

$ git log --oneline
9f8e7d6 (HEAD -> main) Add salt to pancakes
5c4b3a2 Add omelette recipe
1a2b3c4 Create recipe box with first recipe
```

## Step 6: create an empty repository on GitHub

On github.com, click **+** → **New repository**:

- Name: `recipe-box`
- Visibility: Private is fine
- **Do not** tick "Add a README", ".gitignore" or "license". You already have commits locally; an initialised GitHub repository would have its own unrelated first commit, and your first push would be rejected.

GitHub then shows a page with commands. The section "…or push an existing repository from the command line" matches the next step.

:::tip Or use the GitHub CLI
`gh repo create recipe-box --private --source=. --push` creates the GitHub repository, adds it as `origin` and pushes, all in one command.
:::

## Step 7: connect and push

```cmd
git remote add origin git@github.com:priya-sharma/recipe-box.git
remote add :: Register a new remote.
origin :: The name for it. origin is the convention for your main remote.
git@github.com:... :: The URL GitHub showed you. Use the HTTPS one if you set up HTTPS in Chapter 9.
```

```bash
$ git remote add origin git@github.com:priya-sharma/recipe-box.git
$ git push -u origin main
Enumerating objects: 11, done.
Counting objects: 100% (11/11), done.
Writing objects: 100% (11/11), 912 bytes | 912.00 KiB/s, done.
Total 11 (delta 0), reused 0 (delta 0)
To github.com:priya-sharma/recipe-box.git
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main'.
```

```cmd
git push -u origin main
push :: Send commits to a remote.
-u :: Short for --set-upstream: remember origin/main as this branch's upstream, so future plain "git push" and "git pull" know where to go.
origin :: The remote to push to.
main :: The branch to push.
```

The output confirms a **new branch** `main` was created on GitHub, and your local `main` now tracks `origin/main`. Refresh the GitHub page: your files and all three commits are there.

## Step 8: one more round trip

```bash
$ echo "Toast: bread, butter" > recipes/toast.txt
$ git add recipes/toast.txt
$ git commit -m "Add toast recipe"
$ git status -sb
## main...origin/main [ahead 1]
$ git push
$ git status -sb
## main...origin/main
```

Because you used `-u` the first time, plain `git push` is enough now. `[ahead 1]` disappeared after pushing: your branch and `origin/main` match.

## The rhythm, summarised

```text
start of day   git pull                      get teammates' work
while working  edit → git status → git diff → git add → git commit   (repeat, small steps)
share          git push                      publish your commits
```

On a team you will also create a branch for each task before editing (Part 5) and merge through pull requests (Part 13). The loop above stays exactly the same inside each branch.

:::recap
### What you learned
- A full session: `init` → `.gitignore` → `add` → `commit` → repeat → `remote add` → `push -u`.
- Commit unrelated changes separately, even when you made them at the same time.
- Create the GitHub repository empty when you already have local commits.
- `git push -u origin main` publishes a branch and sets its upstream so plain `push` and `pull` work afterwards.

### Key terms
```terms
Upstream :: The remote branch a local branch is linked to, used by plain git push and git pull.
Ahead / behind :: How many commits your branch has that its upstream lacks, and vice versa.
```

### Key commands
```commands
git remote add origin <url> :: Connect a local repository to a remote.
git push -u origin main :: Push main and set its upstream.
git status -sb :: Short status with ahead/behind counts.
```

### Common mistakes
- Creating the GitHub repository with a README when you already have local commits, which leads to a rejected first push.
- Forgetting `-u` on the first push, then seeing "no upstream branch" on the next one.
- Committing logs or secrets because `.gitignore` was added after the first `git add .`.

### Quick quiz
```quiz
? [scenario] You created a GitHub repository with "Add a README" ticked, and your local repository already has commits. What happens when you push?
- The README is merged automatically
+ The push is rejected because the remote has a commit your local history doesn't contain
- GitHub deletes the README
- Your commits replace the README silently
> The histories are unrelated. You would need to fetch and combine them (git pull --allow-unrelated-histories) or recreate the GitHub repository empty.

? What does -u do in git push -u origin main?
- Pushes all branches
- Forces the push
+ Sets origin/main as the upstream of your local main
- Uploads untracked files
> With an upstream set, future `git push` and `git pull` on main need no extra arguments, and `git status` reports ahead/behind.

? [predict] After a commit that you haven't pushed yet, what does git status -sb show on the first line?
- ## main
+ ## main...origin/main [ahead 1]
- ## main [behind 1]
- ## HEAD (no branch)
> You have one commit that origin/main doesn't. After pushing, the [ahead 1] disappears.

? [tf] On a team, the everyday loop is edit, status, diff, add, commit, and push when ready to share.
+ True
- False
> Plus pulling to get others' work and branching per task, which the next parts cover.
```

### Practical exercise
```exercise Publish your own project
Repeat this chapter with a real mini-project of your own: a folder of notes, a small script, or dotfiles. Make at least four commits with clear messages, add a sensible `.gitignore`, and publish it to a new private GitHub repository. Then view your commit history on GitHub.
---solution---
Checklist: `git log --oneline` shows at least four commits; `git remote -v` shows origin; `git status -sb` shows `## main...origin/main` with no ahead/behind; the GitHub repository's commits page lists the same hashes and messages as your local log.
```

### What to learn next
You can create and publish a project. On a team, though, you'll mostly join projects that already exist. Part 4 covers cloning and keeping in sync with a remote.
:::
