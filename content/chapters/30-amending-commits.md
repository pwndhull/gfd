---
id: amending-commits
part: 6
title: Fixing the Last Commit with --amend
minutes: 18
level: Intermediate
topics: 65 Amending commits
objectives:
- Fix the last commit's message, add forgotten files and remove unwanted ones
- Correct the author of the last commit
- Explain what amend does internally and why it changes the hash
- Know when amending is safe and what to do if the commit was already pushed
- Undo an amend
concepts: amend | commit hash | rewriting history | reflog | force push
commands: git commit --amend | git commit --amend --no-edit | git commit --amend --reset-author | git reflog | git push --force-with-lease
---
You commit, and immediately notice: a typo in the message, a forgotten file, a stray debug line. `git commit --amend` replaces the most recent commit with a corrected one. It's one of the most useful commands in daily work, and a gentle introduction to rewriting history.

```cmd
git commit --amend
commit :: Record a commit.
--amend :: Instead of adding a new commit on top of HEAD, replace HEAD's commit with a new one built from the current staging area, and open the editor with the old message.
```

## Fix the message

```bash
$ git commit -m "Add pasword reset form"
$ git commit --amend -m "Add password reset form"
[feature/reset 7a1c3e9] Add password reset form
 Date: Tue Mar 3 11:02:44 2026 +1000
 1 file changed, 42 insertions(+)
```

Without `-m`, Git opens your editor with the previous message so you can edit it.

## Add a forgotten file

```bash
$ git commit -m "Add password reset form"
$ git status -s
?? src/auth/reset-form.css          # forgot this
$ git add src/auth/reset-form.css
$ git commit --amend --no-edit
```

`--no-edit` keeps the existing message. The amended commit now contains the CSS as if it had been there from the start.

## Remove something that shouldn't be there

```bash
$ git show --stat HEAD
 src/auth/reset-form.js | 42 ++++
 debug.log              |  3 +
$ git rm --cached debug.log         # remove from the staging area, keep the file on disk
$ git commit --amend --no-edit
$ echo "*.log" >> .gitignore        # stop it happening again
```

To remove a *change* to a tracked file from the last commit (but keep the change in your working directory), restore the file in the staging area to its previous version and amend:

```bash
$ git restore --staged --source=HEAD~1 src/config.js
$ git commit --amend --no-edit
```

## Fix the author

Committed with the wrong email (before configuring your work identity, say)?

```bash
$ git config user.email "priya@acme.dev"
$ git commit --amend --reset-author --no-edit
```

`--reset-author` uses your current name and email and a fresh timestamp. To set a specific author instead: `git commit --amend --author="Priya Sharma <priya@acme.dev>" --no-edit`.

## What amend actually does

Chapter 28 showed that commits are never edited. Amend:

1. builds a **new** commit from the current staging area,
2. gives it the **same parent** as the old HEAD commit (not the old commit itself),
3. moves the branch to the new commit.

```graph Before
          main
            |
A---B---C
```

```graph After git commit --amend
A---B---C'   main
     \
      C      (old commit, now unreachable)
```

`C′` has a new hash. The old `C` isn't on any branch any more, but it still exists and the reflog records it.

Try it in the sandbox: the preset has "Oops: debug logging" on top. Run `git commit --amend -m "Add pricing page"` and watch a new commit take its place while the old one fades.

```viz reset
```

## When amending is safe

| Situation | Amend? |
|---|---|
| Commit not pushed yet | **Yes.** Nobody else has seen it. |
| Pushed to your own feature branch, nobody else uses it | Yes, then `git push --force-with-lease` |
| Pushed to a shared branch or `main` | **No.** Make a new commit instead. |

After amending a pushed commit, a normal push is rejected because the remote still has the old `C`, which isn't an ancestor of `C′`:

```bash
$ git push
 ! [rejected]        feature/reset -> feature/reset (non-fast-forward)
$ git push --force-with-lease
 + 3c9e1a0...7a1c3e9 feature/reset -> feature/reset (forced update)
```

On a shared branch, that force push would remove `C` from under your teammates' feet. They'd pull and get duplicated or conflicting history. Hence the rule: **amend freely before pushing; after pushing, only on branches that are yours alone.**

:::warning Don't pull after amending a pushed commit
The rejected push suggests `git pull`. After an amend, that's the wrong advice: pulling merges the old commit back in, so your branch now has both `C` and `C′` plus a merge commit. For your own branch, use `--force-with-lease` instead.
:::

## Undoing an amend

The previous version is one step back in the reflog:

```bash
$ git reflog -n 3
7a1c3e9 (HEAD -> feature/reset) HEAD@{0}: commit (amend): Add password reset form
3c9e1a0 HEAD@{1}: commit: Add pasword reset form
...
$ git reset --soft HEAD@{1}
```

`--soft` moves the branch back to the old commit and leaves the amended changes staged, so nothing is lost (Chapter 41 explains reset modes).

## Amending older commits

`--amend` only touches the **latest** commit. To fix one further back, use interactive rebase's `edit` or `fixup` (Chapter 38), or a fixup commit:

```bash
$ git commit --fixup a91be03
$ git rebase -i --autosquash origin/main
```

:::recap
### What you learned
- `git commit --amend` replaces the last commit with a new one built from the current staging area.
- Use it to fix messages (`-m`), add files (`git add` then `--amend --no-edit`), remove files (`git rm --cached`), or fix the author (`--reset-author`).
- The amended commit has a new hash; the old one becomes unreachable but recoverable via the reflog.
- Amend unpushed commits freely. After pushing, only on your own branch, followed by `--force-with-lease`.

### Key terms
```terms
Amend :: Replace the latest commit with a corrected new commit.
Rewriting history :: Replacing commits with new ones that have different hashes.
Unreachable commit :: A commit no branch or tag points to; kept temporarily and visible in the reflog.
```

### Key commands
```commands
git commit --amend :: Replace the last commit, editing the message.
git commit --amend -m "msg" :: Replace the message directly.
git commit --amend --no-edit :: Replace the last commit, keep the message.
git commit --amend --reset-author --no-edit :: Re-stamp the last commit with your current identity.
git reset --soft HEAD@{1} :: Undo the last amend, keeping changes staged.
```

### Common mistakes
- Amending a commit already pushed to a shared branch.
- Running `git pull` after amending a pushed commit, duplicating history.
- Forgetting that `--amend` includes everything currently staged, including things you didn't mean to add.

### Quick quiz
```quiz
? [state] You run git add style.css then git commit --amend --no-edit. What is the result?
+ The last commit is replaced by a new commit that also contains style.css, with the same message
- A new commit is added on top containing style.css
- style.css is committed separately with no message
- Nothing, because --no-edit cancels the amend
> Amend rebuilds the last commit from the current staging area.

? [tf] After git commit --amend, the commit keeps its original hash.
- True
+ False
> Any change produces a new commit with a new hash.

? [scenario] You amended a commit that you'd already pushed to your personal feature branch. git push is rejected. What now?
- git pull, then push
+ git push --force-with-lease
- git push --force origin main
- Delete the remote repository
> The remote has the pre-amend commit. A lease-protected force push replaces it on your own branch. Pulling would merge the old commit back in.

? How do you undo an amend you regret?
- git commit --unamend
+ Find the previous commit in git reflog and git reset --soft to it
- git revert HEAD
- It cannot be undone
> The old commit still exists; the reflog shows it as HEAD@{1} right after the amend.
```

### Practical exercise
````exercise Amend three ways
In a practice repository:
1. Commit a new file with a misspelled message, then fix the message.
2. Create a second file, stage it, and add it to the same commit without changing the message.
3. Check `git show --stat HEAD` and `git reflog -n 4`.
4. Undo the last amend with `git reset --soft HEAD@{1}` and look at `git status`.
---solution---
```bash
$ echo a > a.txt && git add a.txt && git commit -m "Ad file a"
$ git commit --amend -m "Add file a"
$ echo b > b.txt && git add b.txt && git commit --amend --no-edit
$ git show --stat HEAD       # a.txt and b.txt
$ git reflog -n 4            # commit (amend) twice, then the original commit
$ git reset --soft HEAD@{1}
$ git status                 # b.txt is staged; HEAD is the "Add file a" commit without b.txt
```
````

### What to learn next
You can make and fix commits. The last chapter of Part 6 is about inspecting them: viewing single commits, files at any point in history, and comparing commits and ranges.
:::
