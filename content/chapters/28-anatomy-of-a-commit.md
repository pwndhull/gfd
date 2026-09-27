---
id: anatomy-of-a-commit
part: 6
title: Anatomy of a Commit
minutes: 22
level: Intermediate
topics: 58 What is a commit? | 59 Commit history | 60 Commit hashes | 61 Parent commits
objectives:
- List every piece of information stored in a commit object
- Explain how a commit hash is calculated and why it changes when anything changes
- Navigate parents with ~ and ^, including merge commits with two parents
- Explain why "rewriting history" always means creating new commits
- Tell author and committer apart
concepts: commit | commit hash | SHA | parent commit | merge commit | root commit | author | committer | tree
commands: git cat-file -p | git log --format | git rev-parse | git show HEAD~2
---
You've made dozens of commits. This chapter opens one up. Knowing exactly what's inside a commit explains a lot of Git behaviour that otherwise seems arbitrary: why amending changes the hash, why rebased commits are "different", and why Git can detect corruption.

## A commit is a small text record

Git lets you print any stored object in readable form with `git cat-file -p` ("pretty-print"). Here's a real commit:

```bash
$ git cat-file -p HEAD
tree 9f1a3c2e7d4b8a6f0c5e1d2a3b4c5d6e7f8a9b0c
parent 51c0e2a9f8d7b6a5c4e3d2f1a0b9c8d7e6f5a4b3
author Priya Sharma <priya@acme.dev> 1772512927 +1000
committer Priya Sharma <priya@acme.dev> 1772512927 +1000

Load notes store at startup

The app needs the store before rendering the list view.
```

```cmd
git cat-file -p HEAD
cat-file :: A low-level command that shows objects in Git's database.
-p :: Pretty-print the object's content in readable form.
HEAD :: Which object: here, the commit HEAD points to. Any hash or ref works.
```

That's the whole commit. Line by line:

| Field | Meaning |
|---|---|
| `tree` | The hash of a **tree** object: the snapshot of the project's top folder, which in turn lists every file and subfolder. |
| `parent` | The hash of the previous commit. A root commit has none; a merge commit has two or more. |
| `author` | Who originally wrote the change, their email, a Unix timestamp and timezone offset. |
| `committer` | Who created *this* commit object, and when. |
| *(blank line)* | Separates headers from the message. |
| Message | Subject line, blank line, body. |

Signed commits also carry a `gpgsig` header with a cryptographic signature (Chapter 79). Notice what's **not** there: no list of changed files, no diff, no branch name. The commit points at a complete snapshot (the tree) and at its parent(s). Diffs are computed by comparing trees; branches point at commits, never the other way round.

### Author versus committer

Usually identical. They differ when someone applies another person's change:

- **Cherry-picking** or **rebasing** someone's commit keeps the original author but records you as committer.
- **Applying a patch** from email does the same.

GitHub shows both when they differ ("Ana authored and Ben committed"). `git log --format=fuller` shows both dates.

## Commit hashes

A commit's ID is a hash computed from **all** of the text above: tree hash, parent hash(es), author, committer, timestamps and message.

```text
hash = SHA-1( "commit <size>\0" + tree + parent + author + committer + message )
```

By default Git uses SHA-1, producing 40 hexadecimal characters. (Git also supports SHA-256 repositories with 64-character IDs; they're still uncommon.)

Three consequences:

1. **The same content always produces the same hash**, on any machine. That's how two clones agree on what a commit is.
2. **Any change produces a completely different hash.** Fix a typo in the message, change the timestamp, change the parent: new hash.
3. **A hash vouches for the entire history behind it.** Because each commit includes its parent's hash, changing any old commit would change every descendant's hash. Git uses this to detect corruption, and it's why you can trust that `a91be03` on your machine is exactly `a91be03` on your teammate's.

:::internals Short hashes
`git log --oneline` shows seven characters by default, extending them automatically in large repositories to stay unique. Any unambiguous prefix works in commands. `git rev-parse HEAD` prints the full hash; `git rev-parse --short HEAD` the short one.
:::

## Rewriting history means making new commits

Because a hash covers everything, **a commit can never be edited**. What looks like editing is:

1. creating a new commit with the changed content (and therefore a new hash),
2. moving the branch label to it.

```graph Before amend
          main
            |
A---B---C
```

```graph After git commit --amend
      C (no longer on any branch)
     /
A---B---C'
        |
       main
```

`C′` is a new commit with a new hash. The old `C` still exists in the database until Git cleans up unreachable objects (weeks later by default), which is why the reflog can find it.

This is **the** key to understanding amend (Chapter 30), rebase (Part 8), cherry-pick (Part 11) and why rewriting shared history hurts teammates: they still have the old commits, and now there are new ones with the same changes but different IDs.

## Parent commits

The parent link turns snapshots into history.

| Commit kind | Parents | Example |
|---|---|---|
| Root commit | 0 | The first commit in the repository |
| Normal commit | 1 | Almost every commit |
| Merge commit | 2 (rarely more) | The result of merging two branches |

```graph A merge commit
          E---F   feature
         /     \
A---B---C---D---M   main
```

`M` has two parents: `D` (the first parent: the branch you were on when you merged) and `F` (the second parent: the branch you merged in). The order matters for navigation.

### Navigating with ~ and ^

| Reference | Means |
|---|---|
| `HEAD~1` or `HEAD~` or `HEAD^` | First parent of HEAD |
| `HEAD~2` | First parent of the first parent (two steps back along first parents) |
| `HEAD^2` | **Second** parent of HEAD (only exists for merge commits) |
| `HEAD^2~1` | Second parent, then one step back along its first parents |
| `main@{1}` | Where `main` pointed before its last move (reflog, Chapter 43) |

With the graph above and HEAD at `M`: `HEAD~1` is `D`, `HEAD~2` is `C`, `HEAD^2` is `F`, `HEAD^2~1` is `E`.

**Tilde (`~`) counts generations. Caret (`^`) picks which parent.** For ordinary commits with one parent, `~1` and `^1` are the same thing.

```bash
$ git show --oneline --no-patch HEAD~2
$ git rev-parse HEAD^2
```

## Commit history is a graph

"The history" is not a list; it's a **directed acyclic graph** (DAG): commits point to parents, never forming loops. A branch's history is everything reachable from its tip. That's why:

- `git log` walks parents from HEAD,
- the same commit can be in many branches' histories,
- merge commits make the graph fork and rejoin.

`git log --first-parent` follows only first parents, which on `main` with merge commits gives a clean list of "what was merged when".

```bash
$ git log --oneline --graph
*   5f3b2a1 (HEAD -> main) Merge branch 'feature/coupons'
|\
| * 3c9e1a0 Validate coupon expiry
| * 77a1b20 Add coupon field
* | 8d1c4e2 Fix header spacing
|/
* 51c0e2a Add notes store
$ git log --oneline --first-parent
5f3b2a1 (HEAD -> main) Merge branch 'feature/coupons'
8d1c4e2 Fix header spacing
51c0e2a Add notes store
```

## Explore it in the sandbox

In the three-way merge preset, run the merge, then try `git log --oneline` and refer to commits with `HEAD~1` and `HEAD^2` (for example `git checkout HEAD^2` then `git switch main`).

```viz merge-3way
```

:::recap
### What you learned
- A commit is a small record: tree (snapshot), parent(s), author, committer and message.
- The hash is computed from all of that, so any change creates a different commit; commits are never edited in place.
- "Rewriting" history creates new commits and moves labels; old commits linger until garbage-collected.
- Root commits have no parent, normal commits one, merge commits two. `~n` goes back generations, `^n` picks a parent.
- History is a graph; `--first-parent` follows the main line.

### Key terms
```terms
Tree :: The object recording a folder's contents; a commit points to the root tree.
Commit hash / SHA :: The ID computed from a commit's full content.
Parent commit :: The commit(s) a commit builds on.
Merge commit :: A commit with two or more parents.
Author :: The person who wrote the change.
Committer :: The person who created the commit object.
First parent :: For a merge commit, the branch that was checked out when merging.
```

### Key commands
```commands
git cat-file -p <commit> :: Print a commit's raw content.
git rev-parse <ref> :: Print the full hash a reference points to.
git log --format=fuller :: Show author and committer separately.
git log --first-parent :: Follow only first parents.
git show HEAD~2 :: Show the commit two generations back.
```

### Common mistakes
- Thinking a commit stores a diff. It stores a snapshot pointer; diffs are computed.
- Assuming an amended or rebased commit is "the same commit". It has a new hash.
- Confusing `HEAD~2` (grandparent) with `HEAD^2` (second parent of a merge).

### Quick quiz
```quiz
? Which of these is NOT stored inside a commit object?
- The tree hash
- The parent hash
+ The name of the branch it was made on
- The author's email
> Branches point at commits, not the other way round. A commit has no idea which branches contain it.

? [scenario] You fix a typo in the last commit's message with --amend. What happens to the hash?
+ A new commit with a different hash replaces it on the branch
- The hash stays the same
- Only the last characters change
- The old commit is deleted immediately
> The hash covers the message, so any change produces a new commit. The old one lingers until garbage collection.

? [state] M is a merge commit with first parent D and second parent F. What is HEAD^2 when HEAD is M?
- D
+ F
- The grandparent of M
- It doesn't exist
> ^2 selects the second parent: the branch that was merged in.

? What's the difference between HEAD~2 and HEAD^2?
+ HEAD~2 goes back two generations along first parents; HEAD^2 is the second parent of HEAD
- They are identical
- HEAD~2 is two commits forward
- HEAD^2 works only on tags
> Tilde counts generations; caret chooses among parents.

? [tf] Two people who create commits with identical tree, parents, author, committer, timestamps and message get the same hash.
+ True
- False
> The hash is a pure function of the content. In practice timestamps almost always differ.
```

### Practical exercise
```exercise Look inside
In any repository with a merge commit (create one in a practice repo if needed):
1. Run `git cat-file -p HEAD` and identify each field.
2. Run `git cat-file -p` on the tree hash it prints. What do you see?
3. Find a merge commit with `git log --merges -n 1 --oneline` and print both parents with `git rev-parse <hash>^1 <hash>^2`.
4. Run `git log --oneline --first-parent -n 10` on main and compare with plain `git log --oneline -n 10`.
---solution---
Step 2 prints one line per file or folder: mode, type (`blob` for files, `tree` for folders), hash and name. Step 3 prints two different hashes. Step 4's first-parent log skips the individual commits that came in through merges and shows only the main line.
```

### What to learn next
You know what a commit is. Next, how to make commits that are worth reading: good messages and atomic changes.
:::
