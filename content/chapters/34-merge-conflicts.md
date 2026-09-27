---
id: merge-conflicts
part: 7
title: Merge Conflicts and Conflict Markers
minutes: 22
level: Intermediate
topics: 73 Merge conflicts | 74 Understanding conflict markers
objectives:
- Explain exactly when and why Git reports a conflict
- Recognise the state your repository is in during a conflicted merge
- Read standard and diff3/zdiff3 conflict markers confidently
- Identify the different kinds of conflict: content, modify/delete, add/add and binary
concepts: merge conflict | conflict markers | ours | theirs | merge base | unmerged path
commands: git status | git diff | git diff --name-only --diff-filter=U | git log --merge
---
A merge conflict sounds alarming. It isn't. It's Git saying: "you and a teammate both changed the same lines in different ways, and I won't guess which is right." Nothing is broken and nothing is lost. This chapter teaches you to read a conflict; the next teaches you to resolve one.

## Why conflicts happen

Recall the three-way merge table from Chapter 32. Git compares the **merge base** with **ours** (your branch) and **theirs** (the branch you're merging). It can combine changes automatically when:

- only one side changed a region,
- both sides made the identical change,
- the two sides changed different regions of the same file (even adjacent functions).

It stops and asks you only when **both sides changed the same lines (or touching lines) differently** since the base. That's a conflict.

Conflicts are not a sign that anyone did anything wrong. Two people improving the same function in the same week is normal.

## What a conflicted merge looks like

```bash
$ git merge feature/greeting
Auto-merging greet.js
CONFLICT (content): Merge conflict in greet.js
Automatic merge failed; fix conflicts and then commit the result.
```

The merge is **paused**, not failed. Git has:

- merged every file it could,
- staged those successfully merged files,
- written conflict markers into the files it couldn't merge,
- remembered that a merge is in progress (in `.git/MERGE_HEAD`).

`git status` tells you where you are and what to do next:

```bash
$ git status
On branch main
You have unmerged paths.
  (fix conflicts and run "git commit")
  (use "git merge --abort" to abort the merge)

Unmerged paths:
  (use "git add <file>..." to mark resolution)
	both modified:   greet.js

no changes added to commit (use "git add" and/or "git commit -a")
```

**Unmerged paths** are files with conflicts. `both modified` is the ordinary content conflict. You have two ways forward: fix the conflicts and commit, or `git merge --abort` to go back to exactly how things were before the merge.

:::tip Always two exits
During any conflict, merge or rebase or cherry-pick, `git status` prints both the "continue" and the "abort" command. When in doubt, read status.
:::

## Reading conflict markers

Open the file:

```text title="greet.js" {2,4,6}
function greet(user) {
<<<<<<< HEAD
  return "Hello, " + user.name;
=======
  return `Hi ${user.firstName}!`;
>>>>>>> feature/greeting
}
```

```diagram conflict
```

| Marker | Meaning |
|---|---|
| `<<<<<<< HEAD` | Start of **ours**: the version on the branch you're on (HEAD) |
| `=======` | Divider between the two sides |
| `>>>>>>> feature/greeting` | End of **theirs**: the version from the branch being merged |

Everything outside the markers merged cleanly. Inside, Git shows both sides and leaves the decision to you.

### diff3 and zdiff3: showing the base too

With the standard style you can't tell what the line looked like **before** either change. Was it `"Hello, " + user`? Did both sides change it, or only one? The `zdiff3` style (Chapter 8's recommended setting, Git 2.35+; use `diff3` on older versions) adds the base:

```text title="greet.js with merge.conflictStyle=zdiff3"
function greet(user) {
<<<<<<< HEAD
  return "Hello, " + user.name;
||||||| d21d986
  return "Hello, " + user;
=======
  return `Hi ${user.firstName}!`;
>>>>>>> feature/greeting
}
```

The new section between `|||||||` and `=======` is the **merge base** version. Now the story is clear:

- the original returned `"Hello, " + user`,
- **we** changed `user` to `user.name` (a bug fix: `user` is an object),
- **they** switched to a friendlier template using `firstName`.

The right answer is probably their line: it also reads a field of the object (`user.firstName`), so it fixes the same bug while adding the friendlier greeting. Both intents survive. Understanding the **intent** of each side is the real skill in resolving conflicts, and the base makes intent visible.

```bash
$ git config --global merge.conflictStyle zdiff3
```

## Seeing conflicts in other ways

| Command | Shows |
|---|---|
| `git diff` | During a conflict: a combined diff of the conflicted regions, with `++`, `+ `, ` +` markers per side |
| `git diff --name-only --diff-filter=U` | Just the list of conflicted files |
| `git log --merge --oneline` | The commits on both sides that touched the conflicted files, which explain **why** each side changed |
| `git show :1:greet.js` | The base version of the file |
| `git show :2:greet.js` | Ours |
| `git show :3:greet.js` | Theirs |

The `:1:`, `:2:`, `:3:` forms read the three **stages** Git keeps in the index for each conflicted file. They're handy for comparing full versions side by side.

## Kinds of conflict

| Status label | What happened | Typical resolution |
|---|---|---|
| `both modified` | Both sides changed the same lines | Edit the file to the right combination |
| `deleted by them` / `deleted by us` | One side deleted the file, the other modified it (a modify/delete conflict) | Keep it (`git add file`) or accept the deletion (`git rm file`) |
| `both added` | Both sides created a file with the same path but different content | Combine or choose, then `git add` |
| Rename conflicts | One side renamed, the other edited or renamed differently | Git usually follows renames; otherwise pick the final path |
| Binary files | Images, PDFs, compiled files: Git can't insert markers | Choose one version whole (Chapter 35) |

```bash
$ git merge feature/cleanup
CONFLICT (modify/delete): src/legacy.js deleted in feature/cleanup and modified in HEAD.  Version HEAD of src/legacy.js left in tree.
Automatic merge failed; fix conflicts and then commit the result.
```

## Where conflicts don't come from

A few things that surprise people:

- **Adjacent-line edits often conflict.** Git needs a line of unchanged context between two changes to merge them cleanly.
- **A conflict-free merge can still be broken.** Ana renames a function; Ben, on another branch, adds a new call to the old name. The merge is textually clean but won't compile. Tests and CI catch this; conflicts don't.
- **Whitespace and formatting changes cause conflicts.** A branch that reformats a whole file conflicts with every other branch touching that file. Separate formatting commits from logic changes, and agree on an auto-formatter.

## Watch the model

The sandbox has no file contents, so it never conflicts, but it shows the three commits a conflict is about. In the three-way preset, before merging, run `git log --oneline --all` and identify the merge base, ours and theirs.

```viz merge-3way
```

:::recap
### What you learned
- A conflict happens when both sides changed the same lines differently since the merge base.
- A conflicted merge is paused: clean files are staged, conflicted ones contain markers, and status shows both the continue and abort paths.
- `<<<<<<< HEAD` … `=======` … `>>>>>>> branch` separate ours and theirs; `zdiff3` adds the base between `|||||||` and `=======`.
- `git log --merge`, `git diff --diff-filter=U` and `git show :1/:2/:3:file` help you understand a conflict.
- Kinds of conflict include content, modify/delete, add/add, rename and binary.

### Key terms
```terms
Merge conflict :: Overlapping, different changes from both sides that Git can't combine automatically.
Conflict markers :: The <<<<<<<, |||||||, ======= and >>>>>>> lines Git writes into a conflicted file.
Ours / HEAD :: In a merge, the branch you are on.
Theirs :: In a merge, the branch being merged in.
Unmerged path :: A file with an unresolved conflict.
zdiff3 :: A conflict style that also shows the merge base version.
```

### Key commands
```commands
git status :: See conflicted files and the continue/abort options.
git diff --name-only --diff-filter=U :: List conflicted files.
git log --merge --oneline :: Commits on both sides that touched conflicted files.
git show :1:<file> / :2:<file> / :3:<file> :: Base / ours / theirs versions.
git config --global merge.conflictStyle zdiff3 :: Show the base inside conflict markers.
```

### Common mistakes
- Panicking and deleting the repository or re-cloning. The merge is only paused.
- Assuming a conflict-free merge is a working merge.
- Resolving by picking one side blindly without understanding both intents.

### Quick quiz
```quiz
? [state] A merge reports conflicts in one file of the ten it touched. What is the state of the other nine?
+ Merged and staged
- Untouched, waiting for you to merge them manually
- Discarded
- Committed already
> Git merges and stages everything it can, and marks only the conflicted files.

? [predict] In this conflict, which text comes from the branch being merged in?
| <<<<<<< HEAD
|   timeout = 30
| =======
|   timeout = 60
| >>>>>>> feature/slow-api
- timeout = 30
+ timeout = 60
- Both
- Neither
> The part between ======= and >>>>>>> is theirs: the branch named after the closing marker.

? What extra section does zdiff3 add to conflict markers?
+ The merge base version, between ||||||| and =======
- The commit messages of both sides
- A suggested resolution
- Line numbers
> Seeing the original makes each side's intent clear.

? [tf] If a merge has no conflicts, the resulting code is guaranteed to work.
- True
+ False
> Textual merging can combine changes that are logically incompatible, such as a rename on one side and a new call to the old name on the other.

? [scenario] git status shows "deleted by them: src/legacy.js". What does that mean?
+ The branch being merged deleted the file, while your branch modified it
- You deleted the file by accident
- The file is untracked
- Both sides deleted the file
> It's a modify/delete conflict: decide whether to keep your modified version or accept the deletion.
```

### Practical exercise
````exercise Create and read a conflict
In a new practice repository:
1. Commit `config.txt` containing `timeout = 10`.
2. On branch `slow`, change it to `timeout = 60` and commit. On `main`, change it to `timeout = 30` and commit.
3. Merge `slow` into `main` with the default conflict style and read the file.
4. Abort, set `zdiff3` for this repository, merge again and compare. Then abort again.
---solution---
```bash
$ git init conflict-lab && cd conflict-lab
$ echo "timeout = 10" > config.txt && git add . && git commit -m "Add config"
$ git switch -c slow && echo "timeout = 60" > config.txt && git commit -am "Raise timeout for slow API"
$ git switch main && echo "timeout = 30" > config.txt && git commit -am "Raise timeout slightly"
$ git merge slow            # CONFLICT (content)
$ cat config.txt
$ git merge --abort
$ git config merge.conflictStyle zdiff3
$ git merge slow && cat config.txt    # now includes ||||||| <base> timeout = 10
$ git merge --abort
```
Keep this repository: the next chapter resolves this exact conflict.
````

### What to learn next
You can read a conflict. Next: resolving it properly, aborting when needed, and handling the conflicts that come up most often on real teams.
:::
