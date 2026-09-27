# Practical labs

Each lab runs in a throwaway folder under ~/git-labs so nothing touches your real projects.

## Configure Git and verify your identity
id: lab-01
summary: Install check, identity, default branch and sensible defaults
minutes: 10
level: Beginner
chapter: configuring-git

### Objective
Set up Git so every commit you make is correctly attributed and the common defaults won't surprise you.

### Prerequisites
Git 2.23 or newer installed (Chapter 7).

### Starting state
A fresh machine, or one where you're not sure what's configured.

### Instructions
1. Check your Git version.
2. Set your name and email globally.
3. Set `main` as the default branch and choose an editor you know.
4. Apply the recommended settings from Chapter 8: `pull.rebase`, `fetch.prune`, `push.autoSetupRemote`, `rerere.enabled`, `merge.conflictStyle`.
5. List your configuration with origins.

### Expected result
`git config --list --show-origin` shows each value coming from your global `.gitconfig`, and `git config user.email` prints your email.

### Common mistakes
- Using VS Code as the editor without `--wait`.
- Using a personal email for work commits.

### Solution
:::solution
```bash
$ git --version
$ git config --global user.name "Your Name"
$ git config --global user.email "you@example.com"
$ git config --global init.defaultBranch main
$ git config --global core.editor "code --wait"
$ git config --global pull.rebase false
$ git config --global fetch.prune true
$ git config --global push.autoSetupRemote true
$ git config --global rerere.enabled true
$ git config --global merge.conflictStyle zdiff3
$ git config --list --show-origin
```
If your Git is older than 2.35, use `diff3` instead of `zdiff3`.
:::

### Challenge extension
Set up an `includeIf` so repositories under `~/work/` use a different email (Chapter 8), and prove it by running `git config user.email` inside a repository there.

## Your first repository
id: lab-02
summary: init, status, add, commit and log from scratch
minutes: 15
level: Beginner
chapter: git-commit

### Objective
Create a repository and make three well-described commits.

### Prerequisites
Lab 1.

### Starting state
```bash
$ mkdir -p ~/git-labs && cd ~/git-labs && rm -rf lab02 && mkdir lab02 && cd lab02
```

### Instructions
1. Initialise a repository and check `git status`.
2. Create `README.md` and `todo.txt`; check status; stage and commit both as "Create project skeleton".
3. Add a line to `todo.txt`, view it with `git diff`, stage, check `git diff --staged`, and commit.
4. Create `notes.md`, commit it with a message that has a subject and a body.
5. View history with `git log --oneline` and `git log --stat`.

### Expected result
Three commits, newest first, with clear imperative subjects. `git status` reports a clean working tree.

### Common mistakes
- Typing the `$` prompt.
- Committing before staging and seeing "nothing added to commit".

### Solution
:::solution
```bash
$ git init
$ echo "# Lab 02" > README.md && echo "- buy milk" > todo.txt
$ git status -s
$ git add README.md todo.txt
$ git commit -m "Create project skeleton"
$ echo "- call bank" >> todo.txt
$ git diff && git add todo.txt && git diff --staged
$ git commit -m "Add bank call to todo list"
$ echo "Ideas" > notes.md && git add notes.md
$ git commit -m "Add notes file" -m "Keeps ideas separate from the task list."
$ git log --oneline && git log --stat
```
:::

### Challenge extension
Use `git show HEAD~1` and `git show HEAD:todo.txt` to inspect earlier states without changing anything.

## The three areas: stage, unstage, discard
id: lab-03
summary: Move changes between working directory, staging area and repository
minutes: 15
level: Beginner
chapter: git-mental-model

### Objective
Build an intuition for the working directory, staging area and repository by moving one change through all of them and back.

### Prerequisites
Lab 2.

### Starting state
```bash
$ cd ~/git-labs && rm -rf lab03 && git init -q lab03 && cd lab03
$ printf "line 1\nline 2\n" > app.txt && git add . && git commit -qm "Add app"
```

### Instructions
1. Edit `app.txt` and check `git status -s`.
2. Stage it; check status. Edit it again; check status. Explain the two-letter code.
3. Commit, and use `git show` to see which version was committed.
4. Stage the remaining edit, then unstage it with `git restore --staged`.
5. Discard the edit with `git restore`.

### Expected result
Step 2 shows `MM app.txt`. The commit in step 3 contains only the first edit. After step 5, `git status` is clean.

### Common mistakes
- Expecting the commit to include the second edit.
- Using plain `git restore` when you meant to unstage.

### Solution
:::solution
```bash
$ echo "edit A" >> app.txt && git status -s        #  M app.txt
$ git add app.txt && git status -s                 # M  app.txt
$ echo "edit B" >> app.txt && git status -s        # MM app.txt
$ git commit -m "Add edit A" && git show           # only "edit A"
$ git add app.txt && git restore --staged app.txt && git status -s   #  M app.txt
$ git restore app.txt && git status -s             # clean
```
:::

### Challenge extension
Use `git add -p` to stage only one of two separate edits in the same file.

## Reading history
id: lab-04
summary: log, show, diff between commits and filtering
minutes: 15
level: Beginner
chapter: git-log

### Objective
Answer questions about a real project's history using log, show and diff.

### Prerequisites
Lab 2.

### Starting state
```bash
$ cd ~/git-labs && rm -rf lab04 && git clone -q https://github.com/expressjs/express.git lab04 && cd lab04
```

### Instructions
1. Show the last 10 commits on one line each.
2. Show the graph of the last 30 commits on all branches.
3. Find who changed `lib/router` most in the last year (`git shortlog -sn --since=… -- <path>`).
4. Find commits whose message mentions "security".
5. Pick one commit and view it with `--stat`, then view one file as it was in that commit.

### Expected result
You can answer each question with a single command and quit the pager with `q`.

### Common mistakes
- Forgetting `--all` when looking for other branches.
- Using `--grep` when you meant to search code (`-S`).

### Solution
:::solution
```bash
$ git log --oneline -10
$ git log --oneline --graph --all -30
$ git shortlog -sn --since="1 year ago" -- lib/
$ git log --oneline -i --grep="security"
$ git show --stat <hash>
$ git show <hash>:package.json
```
If the repository layout differs, adapt the paths; `git ls-tree --name-only HEAD` lists the top folder.
:::

### Challenge extension
Use `git log -S` to find when a specific function name first appeared, with `--reverse` to see the oldest first.

## .gitignore and untracking a file
id: lab-05
summary: Ignore patterns, check-ignore, and rm --cached
minutes: 15
level: Beginner
chapter: gitignore

### Objective
Keep generated files and secrets out of the repository, and fix a file that was committed by mistake.

### Prerequisites
Lab 2.

### Starting state
```bash
$ cd ~/git-labs && rm -rf lab05 && git init -q lab05 && cd lab05
$ echo "app" > app.js && echo "DEBUG=1" > .env && echo "{}" > local.json && mkdir -p dist && echo x > dist/bundle.js
$ git add app.js local.json && git commit -qm "Initial commit"
```

### Instructions
1. Write a `.gitignore` that ignores `.env`, `dist/` and `*.log`, but not `.env.example`.
2. Verify with `git status` and `git check-ignore -v`.
3. `local.json` was committed by mistake: stop tracking it without deleting it, ignore it, and commit.
4. Create `.env.example` and confirm it's not ignored.

### Expected result
`git status` shows only `.env.example` as new (the `.gitignore` is committed); `local.json` still exists on disk but is no longer tracked.

### Common mistakes
- Adding `local.json` to `.gitignore` without `git rm --cached`.
- Writing `!.env.example` before `.env.*` (order matters; later rules win).

### Solution
:::solution
```bash
$ printf ".env\n.env.*\n!.env.example\ndist/\n*.log\n" > .gitignore
$ git check-ignore -v .env dist/bundle.js
$ git rm --cached local.json && echo "local.json" >> .gitignore
$ git add .gitignore && git commit -m "Ignore env files, build output and local config"
$ echo "DEBUG=" > .env.example && git status -s     # ?? .env.example
$ ls local.json                                    # still on disk
```
:::

### Challenge extension
Set up a global excludes file for `.DS_Store` and editor folders (Chapter 16).

## Remotes: clone, fetch and inspect
id: lab-06
summary: A local "server" with two clones, fetch and origin/main
minutes: 20
level: Beginner
chapter: git-fetch

### Objective
See exactly what fetch changes (and doesn't) using a bare repository as a pretend server.

### Prerequisites
Labs 1–2.

### Starting state
```bash
$ cd ~/git-labs && rm -rf lab06 && mkdir lab06 && cd lab06
$ git init -q --bare server.git
$ git clone -q server.git alice && cd alice
$ echo "v1" > app.txt && git add . && git commit -qm "Initial commit" && git push -q -u origin main
$ cd .. && git clone -q server.git bob
```

### Instructions
1. In `alice`, commit a change and push.
2. In `bob`, run `git status`. Does it know about Alice's commit?
3. In `bob`, run `git fetch`. Check `git status`, `git log --oneline --all --graph` and `git log --oneline main..origin/main`.
4. Confirm `bob`'s files haven't changed yet.
5. Integrate with `git merge origin/main` (a fast-forward).

### Expected result
Before fetching, Bob's status says "up to date". After fetching, it says "behind by 1 commit". Files change only after the merge.

### Common mistakes
- Expecting fetch to update files.
- Running commands in the wrong clone folder.

### Solution
:::solution
```bash
$ cd ../alice && echo "v2" > app.txt && git commit -qam "Update to v2" && git push -q
$ cd ../bob && git status            # up to date (stale)
$ git fetch && git status            # behind 'origin/main' by 1 commit
$ git log --oneline main..origin/main
$ cat app.txt                        # still v1
$ git merge origin/main && cat app.txt   # fast-forward, now v2
```
:::

### Challenge extension
Delete a branch on the "server" from Alice (`git push origin --delete <branch>`) and see Bob's `origin/<branch>` disappear with `git fetch --prune`.

## Push, rejected push and pull
id: lab-07
summary: Cause a rejected push and fix it with pull (merge and rebase)
minutes: 20
level: Beginner
chapter: git-push

### Objective
Experience a rejected push, understand why, and fix it both ways.

### Prerequisites
Lab 6 (reuse its folders or recreate them).

### Starting state
The `lab06` folder with `server.git`, `alice` and `bob`, both up to date.

### Instructions
1. Commit different files in Alice and Bob. Push from Alice.
2. Push from Bob and read the rejection.
3. Fix it with `git pull --no-rebase`, push, and look at the graph.
4. Repeat steps 1–2, then fix it with `git pull --rebase` and compare the graph.

### Expected result
Step 2 shows `! [rejected] … (fetch first)`. The merge fix adds a merge commit; the rebase fix gives a straight line.

### Common mistakes
- Using `--force` to get past the rejection (it would delete Alice's commit on the server).

### Solution
:::solution
```bash
$ cd ~/git-labs/lab06/alice && echo a > a.txt && git add . && git commit -qm "Alice work" && git push -q
$ cd ../bob && echo b > b.txt && git add . && git commit -qm "Bob work" && git push     # rejected
$ git pull --no-rebase && git push && git log --oneline --graph -5
$ cd ../alice && git pull -q && echo a2 > a2.txt && git add . && git commit -qm "Alice more" && git push -q
$ cd ../bob && echo b2 > b2.txt && git add . && git commit -qm "Bob more"
$ git pull --rebase && git push && git log --oneline --graph -6
```
:::

### Challenge extension
Try `git pull --ff-only` in the diverged state and read its refusal.

## Branches: create, switch, delete and recover
id: lab-08
summary: Branch lifecycle including recovering a force-deleted branch
minutes: 15
level: Beginner
chapter: managing-branches

### Objective
Become fluent with branch commands and confident that deleting a branch is recoverable.

### Prerequisites
Lab 2.

### Starting state
```bash
$ cd ~/git-labs && rm -rf lab08 && git init -q lab08 && cd lab08
$ echo base > base.txt && git add . && git commit -qm "Base"
```

### Instructions
1. Create `feature/search` with `git branch`, confirm you're still on `main`, then switch.
2. Make two commits. Switch back to `main` and confirm the files disappear.
3. Rename the branch to `feature/site-search`.
4. Try `git branch -d`; read the refusal; force-delete with `-D`.
5. Recover it from the reflog.

### Expected result
After step 5, `git log --oneline feature/site-search` shows both commits again.

### Common mistakes
- Committing on `main` after `git branch` (it doesn't switch).

### Solution
:::solution
```bash
$ git branch feature/search && git branch        # * main
$ git switch feature/search
$ echo s1 > s1.txt && git add . && git commit -qm "Add search box"
$ echo s2 > s2.txt && git add . && git commit -qm "Add results page"
$ git switch main && ls                         # only base.txt
$ git branch -m feature/search feature/site-search
$ git branch -d feature/site-search             # not fully merged
$ git branch -D feature/site-search             # Deleted branch ... (was <hash>)
$ git reflog | head -5
$ git branch feature/site-search <hash>
$ git log --oneline feature/site-search -3
```
:::

### Challenge extension
Use `git branch -vv --sort=-committerdate` and `git branch --merged` after merging one branch.

## Feature branch workflow, end to end
id: lab-09
summary: Branch, commit, push, update from main, merge and clean up
minutes: 25
level: Intermediate
chapter: feature-branch-workflow

### Objective
Rehearse the everyday team workflow using a local bare server and two clones.

### Prerequisites
Labs 6–8.

### Starting state
```bash
$ cd ~/git-labs && rm -rf lab09 && mkdir lab09 && cd lab09
$ git init -q --bare server.git && git clone -q server.git you && git clone -q server.git teammate 2>/dev/null
$ cd you && echo v1 > app.txt && git add . && git commit -qm "Initial commit" && git push -q -u origin main
$ cd ../teammate && git pull -q origin main && git branch -u origin/main
```

### Instructions
1. In `you`: update main, create `feature/greeting`, make two commits, push with `-u`.
2. In `teammate`: commit to main and push.
3. In `you`: bring main's new work into your branch (merge or rebase), push again.
4. Merge your branch into main (standing in for a PR), push main.
5. Delete the branch locally and on the server.

### Expected result
Main contains both people's work; `feature/greeting` no longer exists anywhere.

### Common mistakes
- Branching from a stale main.
- Forgetting to push after updating from main.

### Solution
:::solution
```bash
$ cd ~/git-labs/lab09/you && git switch main && git pull -q
$ git switch -c feature/greeting
$ echo hi > greet.txt && git add . && git commit -qm "Add greeting"
$ echo hello >> greet.txt && git commit -qam "Extend greeting"
$ git push -u origin feature/greeting
$ cd ../teammate && echo t > t.txt && git add . && git commit -qm "Teammate change" && git push -q
$ cd ../you && git fetch && git merge --no-edit origin/main && git push
$ git switch main && git pull -q && git merge --no-edit feature/greeting && git push
$ git branch -d feature/greeting && git push origin --delete feature/greeting
```
On a real team, step 4 is a pull request on GitHub.
:::

### Challenge extension
Do step 3 with `git rebase origin/main` instead and push with `--force-with-lease`.

## Fast-forward and three-way merges
id: lab-10
summary: Produce and read both kinds of merge, plus --no-ff and --squash
minutes: 20
level: Intermediate
chapter: what-is-merging

### Objective
Predict and observe which kind of merge Git performs.

### Prerequisites
Lab 8.

### Starting state
```bash
$ cd ~/git-labs && rm -rf lab10 && git init -q lab10 && cd lab10
$ echo base > base.txt && git add . && git commit -qm "Base"
```

### Instructions
1. Create `ff` with one commit; merge into main. Predict first: fast-forward or merge commit?
2. Create `three` with one commit; also commit on main; merge `three`. Predict first.
3. Create `noff` with one commit; merge with `--no-ff`.
4. Create `sq` with two commits; merge with `--squash` and commit.
5. Inspect `git log --oneline --graph` and identify each merge's parents.

### Expected result
Step 1 fast-forwards; steps 2 and 3 create merge commits; step 4 creates one ordinary commit.

### Common mistakes
- Forgetting to commit after `--squash`.

### Solution
:::solution
```bash
$ git switch -qc ff && echo f > f.txt && git add . && git commit -qm "F" && git switch -q main && git merge ff
$ git switch -qc three && echo t > t.txt && git add . && git commit -qm "T" && git switch -q main
$ echo m > m.txt && git add . && git commit -qm "M" && git merge --no-edit three
$ git switch -qc noff && echo n > n.txt && git add . && git commit -qm "N" && git switch -q main && git merge --no-ff --no-edit noff
$ git switch -qc sq && echo 1 > s1 && git add . && git commit -qm "S1" && echo 2 > s2 && git add . && git commit -qm "S2"
$ git switch -q main && git merge --squash sq && git commit -m "Squash sq"
$ git log --oneline --graph -10
```
:::

### Challenge extension
Undo the last merge commit with `git reset --hard ORIG_HEAD`, then redo it.

## Resolving merge conflicts
id: lab-11
summary: Content, list and modify/delete conflicts, with abort and zdiff3
minutes: 25
level: Intermediate
chapter: resolving-conflicts

### Objective
Resolve three common kinds of conflict calmly and correctly.

### Prerequisites
Lab 10.

### Starting state
```bash
$ cd ~/git-labs && rm -rf lab11 && git init -q lab11 && cd lab11
$ git config merge.conflictStyle zdiff3
$ echo "timeout = 10" > config.txt && echo "apples" > list.txt && echo "old" > legacy.txt
$ git add . && git commit -qm "Base"
$ git switch -qc other
$ echo "timeout = 60" > config.txt && echo "bananas" >> list.txt && git rm -q legacy.txt && git commit -qam "Other changes"
$ git switch -q main
$ echo "timeout = 30" > config.txt && echo "cherries" >> list.txt && echo "new" >> legacy.txt && git commit -qam "Main changes"
```

### Instructions
1. Merge `other`. Read the output and `git status`.
2. Abort, then merge again (practising the escape hatch).
3. Resolve `config.txt` to `timeout = 60`.
4. Resolve `list.txt` by keeping all three fruits.
5. Resolve `legacy.txt` by accepting the deletion.
6. Check for leftover markers, then finish the merge.

### Expected result
A merge commit whose tree has `timeout = 60`, three fruits, and no `legacy.txt`. `git diff --check` reports nothing.

### Common mistakes
- Leaving `=======` lines in files.
- Using `git add` on `legacy.txt` (keeps it) instead of `git rm`.

### Solution
:::solution
```bash
$ git merge other                  # 2 content conflicts + modify/delete
$ git status
$ git merge --abort && git merge other
$ echo "timeout = 60" > config.txt
$ printf "apples\ncherries\nbananas\n" > list.txt
$ git rm -q legacy.txt
$ git diff --check
$ git add config.txt list.txt
$ git commit --no-edit
$ git log --oneline --graph -4
```
:::

### Challenge extension
Recreate the conflict on a new branch and try `git restore --theirs` and `git checkout -m` (Chapter 35).

## Rebasing a feature branch
id: lab-12
summary: Rebase onto main, observe new hashes, undo with ORIG_HEAD
minutes: 20
level: Intermediate
chapter: what-is-rebase

### Objective
See that rebase replays commits as new ones, and practise undoing it.

### Prerequisites
Lab 10.

### Starting state
```bash
$ cd ~/git-labs && rm -rf lab12 && git init -q lab12 && cd lab12
$ echo base > base.txt && git add . && git commit -qm "Base"
$ git switch -qc feature && echo f1 > f1.txt && git add . && git commit -qm "Feature 1" && echo f2 > f2.txt && git add . && git commit -qm "Feature 2"
$ git switch -q main && echo m > m.txt && git add . && git commit -qm "Main work"
```

### Instructions
1. Record the feature commits' hashes.
2. Rebase `feature` onto `main`. Compare hashes and the graph.
3. Undo the rebase with `ORIG_HEAD`, confirm the old hashes are back.
4. Redo the rebase; merge `feature` into main and confirm it fast-forwards.

### Expected result
New hashes after the rebase; a linear graph; a fast-forward merge.

### Common mistakes
- Rebasing `main` onto `feature` instead of the other way round.

### Solution
:::solution
```bash
$ git log --oneline feature -2
$ git switch feature && git rebase main
$ git log --oneline --graph --all -5
$ git reset --hard ORIG_HEAD && git log --oneline -2
$ git rebase main && git switch main && git merge feature     # Fast-forward
```
:::

### Challenge extension
Create a conflicting change on main and rebase again, resolving with `git rebase --continue`.

## Interactive rebase cleanup
id: lab-13
summary: Squash, reword, reorder and drop commits before review
minutes: 25
level: Advanced
chapter: interactive-rebase

### Objective
Turn a messy branch into a clean, reviewable one.

### Prerequisites
Lab 12.

### Starting state
```bash
$ cd ~/git-labs && rm -rf lab13 && git init -q lab13 && cd lab13
$ echo base > base.txt && git add . && git commit -qm "Base" && git switch -qc feature
$ echo form > form.txt && git add . && git commit -qm "Add form"
$ echo wip >> form.txt && git commit -qam "wip"
$ echo token > token.txt && git add . && git commit -qm "Add tokn"
$ echo fix >> form.txt && git commit -qam "fix typo"
$ echo debug > debug.txt && git add . && git commit -qm "debug stuff"
```

### Instructions
1. Start `git rebase -i main`.
2. Make the result: "Add form" (with wip and fix typo folded in), "Add token" (reworded), and drop "debug stuff".
3. Verify with `git log --oneline main..` and `ls`.

### Expected result
Two commits: "Add form" and "Add token". `debug.txt` doesn't exist.

### Common mistakes
- Forgetting the list is oldest first.
- Putting `fixup` on the first line.

### Solution
:::solution
Edit the todo list to:
```text
pick   <hash> Add form
fixup  <hash> wip
fixup  <hash> fix typo
reword <hash> Add tokn
drop   <hash> debug stuff
```
When the editor opens for the reword, change the message to "Add token". Then:
```bash
$ git log --oneline main..
$ ls
```
If you get a conflict from reordering, resolve it and `git rebase --continue`, or `git rebase --abort` and try again.
:::

### Challenge extension
Make a fix with `git commit --fixup <hash>` and fold it in with `git rebase -i --autosquash main`.

## Amend and fixup commits
id: lab-14
summary: Fix the last commit, an older commit, and undo an amend
minutes: 15
level: Intermediate
chapter: amending-commits

### Objective
Correct commits before sharing them.

### Prerequisites
Lab 13.

### Starting state
```bash
$ cd ~/git-labs && rm -rf lab14 && git init -q lab14 && cd lab14
$ echo a > a.txt && git add . && git commit -qm "Ad file a"
```

### Instructions
1. Fix the typo in the message.
2. Create `b.txt` and add it to the same commit without changing the message.
3. Look at the reflog and undo the last amend with a soft reset.
4. Make two more commits, then add a fix to the first of them using `--fixup` and `--autosquash`.

### Expected result
Clean messages, and the reflog shows each amend as a separate step.

### Common mistakes
- Amending when you meant to create a new commit.

### Solution
:::solution
```bash
$ git commit --amend -m "Add file a"
$ echo b > b.txt && git add b.txt && git commit --amend --no-edit
$ git reflog -n 3 && git reset --soft HEAD@{1} && git status -s     # A  b.txt staged
$ git commit -m "Add file b"
$ echo c > c.txt && git add . && git commit -qm "Add file c"
$ echo a2 >> a.txt && git add a.txt && git commit --fixup HEAD~2
$ git rebase -i --autosquash --root
```
`--root` lets the rebase include the very first commit.
:::

### Challenge extension
Change the author of the last commit with `--reset-author`.

## reset: soft, mixed and hard
id: lab-15
summary: Predict each mode's effect on the three areas
minutes: 20
level: Intermediate
chapter: git-reset

### Objective
Know exactly what each reset mode does before you run it.

### Prerequisites
Lab 3.

### Starting state
```bash
$ cd ~/git-labs && rm -rf lab15 && git init -q lab15 && cd lab15
$ for i in 1 2 3 4; do echo $i > f$i.txt; git add .; git commit -qm "Commit $i"; done
```

### Instructions
1. `git reset --soft HEAD~1`; predict, then check status. Recommit.
2. `git reset HEAD~1`; predict, then check status. Recommit.
3. Make an uncommitted edit to `f1.txt`, then `git reset --hard HEAD~1`. What happened to the edit and to "Commit 4"?
4. Recover "Commit 4" with the reflog.
5. Squash the last three commits into one with a soft reset.

### Expected result
Soft leaves changes staged; mixed leaves them unstaged (a file the commit added shows as untracked); hard discards both the edit (forever) and the commit (recoverable).

### Common mistakes
- Running `--hard` with edits you wanted.

### Solution
:::solution
```bash
$ git reset --soft HEAD~1 && git status -s && git commit -qm "Commit 4"
$ git reset HEAD~1 && git status -s && git add . && git commit -qm "Commit 4"
$ echo edit >> f1.txt && git reset --hard HEAD~1 && cat f1.txt    # edit gone
$ git reflog -n 3 && git reset --hard HEAD@{1}                     # Commit 4 back
$ git reset --soft HEAD~3 && git commit -m "Commits 2-4 squashed"
$ git log --oneline
```
:::

### Challenge extension
Use `git reset --keep` and compare with `--hard` when there are local edits.

## Revert, including a merge
id: lab-16
summary: Undo pushed-style commits safely, and revert the revert
minutes: 20
level: Intermediate
chapter: git-revert

### Objective
Undo changes without rewriting history.

### Prerequisites
Lab 10.

### Starting state
```bash
$ cd ~/git-labs && rm -rf lab16 && git init -q lab16 && cd lab16
$ echo "price = 10" > prices.txt && git add . && git commit -qm "Add prices"
$ echo "price = 12" > prices.txt && git commit -qam "Change prices"
$ echo faq > faq.txt && git add . && git commit -qm "Add FAQ"
```

### Instructions
1. Revert "Change prices" and check that `faq.txt` remains.
2. Revert the revert.
3. Create a branch with one commit, merge with `--no-ff`, then revert the merge with `-m 1`.

### Expected result
History grows by one commit per revert; nothing is removed from history.

### Common mistakes
- Forgetting `-m 1` for the merge.

### Solution
:::solution
```bash
$ git revert --no-edit HEAD~1 && cat prices.txt && ls       # price = 10, faq.txt present
$ git revert --no-edit HEAD && cat prices.txt               # price = 12
$ git switch -qc feat && echo x > x.txt && git add . && git commit -qm "Add x"
$ git switch -q main && git merge --no-ff --no-edit feat
$ git revert --no-edit -m 1 HEAD && ls                      # x.txt gone
$ git log --oneline --graph -8
```
:::

### Challenge extension
Try `git revert -n` over a range and commit the result as a single revert.

## Reflog rescue
id: lab-17
summary: Recover from a hard reset, a deleted branch and detached HEAD work
minutes: 20
level: Intermediate
chapter: git-reflog

### Objective
Prove to yourself that committed work is very hard to lose.

### Prerequisites
Lab 15.

### Starting state
```bash
$ cd ~/git-labs && rm -rf lab17 && git init -q lab17 && cd lab17
$ for i in 1 2 3; do echo $i > f$i; git add .; git commit -qm "Commit $i"; done
```

### Instructions
1. `git reset --hard HEAD~2`; recover with the reflog.
2. Create `experiment`, commit, switch away, `-D` it, recover it.
3. Detach HEAD at `HEAD~1`, commit, switch back to main, recover the commit into a branch.
4. Stage a new file's content, `git reset --hard`, and recover the content with `git fsck --lost-found`.

### Expected result
Everything recovered except nothing: even the staged-only content comes back as a dangling blob.

### Common mistakes
- Running `git gc` while experimenting.

### Solution
:::solution
```bash
$ git reset --hard HEAD~2 && git reflog -n 3 && git reset --hard HEAD@{1}
$ git switch -qc experiment && echo e > e && git add . && git commit -qm "Experiment"
$ git switch -q main && git branch -D experiment && git branch experiment HEAD@{1}
$ git switch --detach HEAD~1 && echo d > d && git add . && git commit -qm "Detached work"
$ git switch main && git branch rescued HEAD@{1}
$ echo "precious" > p.txt && git add p.txt && git reset --hard
$ git fsck --lost-found && cat .git/lost-found/other/*
```
Check each `HEAD@{n}` with `git show` before resetting to it; the index depends on your exact steps.
:::

### Challenge extension
Use `git log -g --grep="Experiment"` to find a commit by message in the reflog.

## Stash workflow
id: lab-18
summary: Interrupt work, stash with untracked files, pop and resolve
minutes: 15
level: Intermediate
chapter: git-stash

### Objective
Handle an interruption without committing or losing work.

### Prerequisites
Lab 8.

### Starting state
```bash
$ cd ~/git-labs && rm -rf lab18 && git init -q lab18 && cd lab18
$ echo "v1" > app.txt && git add . && git commit -qm "Base" && git switch -qc feature
$ echo "feature edit" >> app.txt && echo "new" > notes.txt
```

### Instructions
1. Stash everything (including the untracked file) with a message.
2. Switch to main, fix a "bug" in `app.txt`, commit.
3. Return to `feature` and pop the stash.
4. Merge main into feature; now create a conflicting stash scenario and resolve it.

### Expected result
Your feature edits and `notes.txt` return intact after the interruption.

### Common mistakes
- Forgetting `-u` and leaving `notes.txt` behind.

### Solution
:::solution
```bash
$ git stash push -u -m "feature in progress"
$ git switch main && echo "v1 fixed" > app.txt && git commit -qam "Fix bug"
$ git switch feature && git stash pop && git status -s
$ git stash push -m "again" && git merge -q --no-edit main && git stash pop   # conflict in app.txt
# edit app.txt, then:
$ git add app.txt && git restore --staged app.txt && git stash drop
```
:::

### Challenge extension
Turn a stash into a branch with `git stash branch`.

## Cherry-pick a hotfix to a release branch
id: lab-19
summary: Backport one fix with -x and verify it
minutes: 15
level: Intermediate
chapter: cherry-pick

### Objective
Copy exactly one fix onto a release line.

### Prerequisites
Lab 10.

### Starting state
```bash
$ cd ~/git-labs && rm -rf lab19 && git init -q lab19 && cd lab19
$ echo "total = a + b" > calc.txt && git add . && git commit -qm "Add calc" && git branch release/1.0
$ echo feature > feature.txt && git add . && git commit -qm "Add feature"
$ echo "total = round(a + b)" > calc.txt && git commit -qam "Fix rounding"
$ echo more > more.txt && git add . && git commit -qm "Add more features"
```

### Instructions
1. Find the hash of "Fix rounding".
2. Cherry-pick it onto `release/1.0` with `-x`.
3. Confirm the release branch has the fix but not the features.
4. Check the message records the source commit.

### Expected result
`release/1.0` has "Add calc" and the cherry-picked fix only.

### Common mistakes
- Picking the wrong commit or a range by accident.

### Solution
:::solution
```bash
$ git log --oneline
$ git switch release/1.0
$ git cherry-pick -x <fix-hash>
$ ls && cat calc.txt              # no feature.txt; rounding fixed
$ git log -1 --format=%B          # "(cherry picked from commit ...)"
```
:::

### Challenge extension
Use `git cherry -v release/1.0 main` to see which commits are already represented.

## Tags and a release
id: lab-20
summary: Annotated tags, describe, and a patch release
minutes: 15
level: Intermediate
chapter: git-tags

### Objective
Mark releases and find your way around them.

### Prerequisites
Lab 19.

### Starting state
```bash
$ cd ~/git-labs && rm -rf lab20 && git init -q lab20 && cd lab20
$ for i in 1 2 3; do echo $i > f$i; git add .; git commit -qm "Change $i"; done
```

### Instructions
1. Tag the current commit `v1.0.0` (annotated).
2. Make two commits; run `git describe`.
3. Create `hotfix/1.0.1` from the tag, commit a fix, tag `v1.0.1`.
4. List tags sorted by version, and show `v1.0.1`.

### Expected result
`git describe` on main prints `v1.0.0-2-g<hash>`; tags list as v1.0.1, v1.0.0.

### Common mistakes
- Lightweight tags for releases; forgetting to push tags (if using a remote).

### Solution
:::solution
```bash
$ git tag -a v1.0.0 -m "Release 1.0.0"
$ echo 4 > f4 && git add . && git commit -qm "Change 4" && echo 5 > f5 && git add . && git commit -qm "Change 5"
$ git describe
$ git switch -c hotfix/1.0.1 v1.0.0 && echo fix > fix && git add . && git commit -qm "Fix bug"
$ git tag -a v1.0.1 -m "Release 1.0.1"
$ git tag --sort=-v:refname && git show v1.0.1 --stat
```
:::

### Challenge extension
Bring the hotfix back into main with a merge.

## Bisect a bug
id: lab-21
summary: Find the first bad commit manually and with bisect run
minutes: 20
level: Advanced
chapter: git-bisect

### Objective
Find a regression in a long history in a handful of steps.

### Prerequisites
Lab 4.

### Starting state
```bash
$ cd ~/git-labs && rm -rf lab21 && git init -q lab21 && cd lab21
$ for i in $(seq 1 30); do echo "v$i" > n.txt; [ $i -ge 19 ] && echo broken > bug.txt; git add -A; git commit -qm "Commit $i"; done
```

### Instructions
1. Start bisect with HEAD bad and the first commit good.
2. At each step, test with `test -f bug.txt` and mark good or bad.
3. Note the result, reset.
4. Repeat automatically with `git bisect run`.

### Expected result
Both methods report "Commit 19" as the first bad commit, in about five steps.

### Common mistakes
- Forgetting `git bisect reset`.

### Solution
:::solution
```bash
$ git bisect start HEAD $(git rev-list --max-parents=0 HEAD)
$ test -f bug.txt && git bisect bad || git bisect good     # repeat
$ git bisect reset
$ git bisect start HEAD $(git rev-list --max-parents=0 HEAD)
$ git bisect run sh -c '! test -f bug.txt'
$ git bisect reset
```
`git rev-list --max-parents=0 HEAD` prints the root commit.
:::

### Challenge extension
Make one commit "untestable" and have your script `exit 125` for it.

## Worktrees and detached HEAD
id: lab-22
summary: Two branches at once, and safe experiments in detached HEAD
minutes: 15
level: Advanced
chapter: git-worktree

### Objective
Work on two branches simultaneously and understand detached HEAD.

### Prerequisites
Lab 8.

### Starting state
```bash
$ cd ~/git-labs && rm -rf lab22 lab22-hotfix && git init -q lab22 && cd lab22
$ echo v1 > app.txt && git add . && git commit -qm "Base" && git switch -qc feature && echo wip >> app.txt
```

### Instructions
1. With uncommitted work on `feature`, add a worktree `../lab22-hotfix` on a new branch `hotfix` from main.
2. Commit a fix there. See it from the main folder with `git log hotfix`.
3. Remove the worktree.
4. In the main folder, detach at `main`, make an experimental commit, then keep it with `git switch -c`.

### Expected result
Your uncommitted `feature` work is untouched throughout; the experiment ends up on a branch.

### Common mistakes
- Trying to check out `hotfix` in both folders.

### Solution
:::solution
```bash
$ git worktree add ../lab22-hotfix -b hotfix main
$ cd ../lab22-hotfix && echo fix > fix.txt && git add . && git commit -qm "Hotfix"
$ cd ../lab22 && git log --oneline hotfix -1 && git status -s     #  M app.txt still there
$ git worktree remove ../lab22-hotfix
$ git stash -u && git switch --detach main
$ echo exp > exp.txt && git add . && git commit -qm "Experiment"
$ git switch -c experiment && git switch feature && git stash pop
```
:::

### Challenge extension
Run `git worktree list` with two worktrees and try `git switch hotfix` in the main folder to see the error.

## Git hooks
id: lab-23
summary: A pre-commit and a commit-msg hook, shared with core.hooksPath
minutes: 20
level: Advanced
chapter: git-hooks

### Objective
Automate checks that run before commits.

### Prerequisites
Lab 2.

### Starting state
```bash
$ cd ~/git-labs && rm -rf lab23 && git init -q lab23 && cd lab23
$ echo base > base.txt && git add . && git commit -qm "Base"
```

### Instructions
1. Write a `pre-commit` hook in `.githooks/` that blocks staged lines containing "TODO:".
2. Write a `commit-msg` hook that requires the subject to start with a capital letter.
3. Point `core.hooksPath` at `.githooks`.
4. Test both hooks, then bypass once with `--no-verify`.

### Expected result
Bad commits are refused with clear messages; good ones succeed.

### Common mistakes
- Forgetting `chmod +x`.

### Solution
:::solution
```bash
$ mkdir .githooks
$ printf '#!/bin/sh\nif git diff --cached | grep -q "^+.*TODO:"; then echo "pre-commit: remove TODO: lines" >&2; exit 1; fi\n' > .githooks/pre-commit
$ printf '#!/bin/sh\nhead -1 "$1" | grep -q "^[A-Z]" || { echo "commit-msg: start the subject with a capital letter" >&2; exit 1; }\n' > .githooks/commit-msg
$ chmod +x .githooks/*
$ git config core.hooksPath .githooks
$ echo "TODO: later" > t.txt && git add t.txt && git commit -m "Add t"      # refused
$ echo "done" > t.txt && git add t.txt && git commit -m "add t"             # refused (lowercase)
$ git commit -m "Add t"                                                      # accepted
```
:::

### Challenge extension
Make the pre-commit hook also run `git diff --cached --check`.

## Disaster drill: wrong branch and deleted work
id: lab-24
summary: Move commits off main and rescue a deleted branch under time pressure
minutes: 20
level: Professional
chapter: recovery-wrong-place

### Objective
Rehearse two of the most common real-world accidents until the fixes are automatic.

### Prerequisites
Labs 8, 15 and 17.

### Starting state
```bash
$ cd ~/git-labs && rm -rf lab24 && mkdir lab24 && cd lab24
$ git init -q --bare server.git && git clone -q server.git work 2>/dev/null && cd work
$ echo v1 > app.txt && git add . && git commit -qm "Initial commit" && git push -q -u origin main
$ echo c1 > c1 && git add . && git commit -qm "Coupon model" && echo c2 > c2 && git add . && git commit -qm "Coupon UI"
$ git switch -qc spike && echo s > s && git add . && git commit -qm "Spike idea" && git switch -q main && git branch -D spike
```

### Instructions
1. Two coupon commits are on local `main` by mistake. Move them to `feature/coupons` and put main back to `origin/main`.
2. The `spike` branch was force-deleted. Recover it.
3. Push `feature/coupons` and confirm the server's main is untouched.

### Expected result
`main` equals `origin/main`; `feature/coupons` has both coupon commits; `spike` exists again.

### Common mistakes
- Resetting main before creating the feature branch.

### Solution
:::solution
```bash
$ git branch feature/coupons
$ git reset --hard origin/main
$ git reflog | grep -i spike | head -3
$ git branch spike <hash of "Spike idea">
$ git push -u origin feature/coupons
$ git log --oneline --all --graph
```
:::

### Challenge extension
Simulate an accidental force push to a shared branch from a second clone and restore it using the push output and the remote-tracking reflog (Chapter 74).
