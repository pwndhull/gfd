---
id: refs-and-packfiles
part: 15
title: References and Packfiles
minutes: 20
level: Advanced
topics: 155 References | 156 Packfiles — conceptual explanation
objectives:
- Explain references as human-readable names for object IDs
- Locate branches, tags, remote-tracking branches, HEAD and special refs on disk
- Distinguish direct references from symbolic references
- Explain conceptually how packfiles and delta compression keep repositories small
- Relate garbage collection and packing to recoverability
concepts: ref | HEAD | symbolic reference | branch | tag | remote-tracking branch | packfile | garbage collection
commands: git show-ref | git symbolic-ref | git update-ref | git for-each-ref | git count-objects -v | git gc
---
Chapter 70 showed that Git's database is full of objects named by 40-character hashes. Humans need names. **References** (refs) provide them: small pointers from a readable name to an object ID. Then, to keep millions of objects compact, Git **packs** them. This chapter covers both.

## References

A **ref** is a name that points to an object ID (almost always a commit). Refs live under `.git/refs/`:

| Ref | Path | Points to | Moves when |
|---|---|---|---|
| Branch `main` | `refs/heads/main` | A commit | You commit, merge, reset… |
| Tag `v1.4.0` | `refs/tags/v1.4.0` | A commit (lightweight) or a tag object (annotated) | Never (by convention) |
| Remote-tracking `origin/main` | `refs/remotes/origin/main` | A commit | fetch, pull, push |
| Stash | `refs/stash` | The newest stash commit | stash / pop / drop |
| Notes, PR refs, others | `refs/notes/…`, `refs/pull/…` | Various | Tools |

A branch ref file contains nothing but a hash:

```bash
$ cat .git/refs/heads/main
78f59469b09cdd10129ec17f15276e363cee5978
```

That's the whole implementation of a branch. Creating one writes such a file; deleting one removes it. Nothing else changes, which is why branches are free (Chapter 24) and why deleting a branch doesn't delete commits (Chapter 43).

### Listing refs

```bash
$ git show-ref
78f59469b09cdd10129ec17f15276e363cee5978 refs/heads/main
3c9e1a07c1e2b3a4d5f6a7b8c9d0e1f2a3b4c5d6 refs/remotes/origin/main
a1b2c3d4e5f60718293a4b5c6d7e8f9012345678 refs/tags/v1.4.0

$ git for-each-ref --sort=-committerdate --format='%(refname:short) %(committerdate:relative)' refs/heads/
feature/coupons 2 hours ago
main 3 days ago
```

`for-each-ref` is the scripting-friendly way to report on branches and tags.

### Packed refs

With thousands of tags, one file per ref gets slow. Git periodically moves refs into a single file, `.git/packed-refs`:

```text title=".git/packed-refs"
# pack-refs with: peeled fully-peeled sorted
78f59469b09cdd10129ec17f15276e363cee5978 refs/heads/main
a1b2c3d4e5f60718293a4b5c6d7e8f9012345678 refs/tags/v1.4.0
^8d1c4e2a7b0f39e5c6d1a8b2f4e7c9d0a1b2c3d4
```

A ref may be in `refs/…` or in `packed-refs` (a loose file wins). The `^` line records the commit an annotated tag ultimately points to. This is why you should use Git commands, not file browsing, to inspect refs. (Newer Git versions also offer an alternative "reftable" backend for very large repositories; the concepts are the same.)

## Symbolic references

**HEAD** is special: normally it doesn't contain a hash but the **name of another ref**. That makes it a **symbolic reference**:

```bash
$ cat .git/HEAD
ref: refs/heads/main
$ git symbolic-ref HEAD
refs/heads/main
```

When you commit, Git follows HEAD to `refs/heads/main` and updates **that** file. When you switch branches, Git rewrites HEAD to name a different branch. In detached HEAD (Chapter 61), HEAD holds a raw hash instead.

Other special refs Git maintains in `.git/`:

| Ref | Set by | Holds |
|---|---|---|
| `ORIG_HEAD` | reset, merge, rebase | Previous position of the branch |
| `FETCH_HEAD` | fetch | What was just fetched |
| `MERGE_HEAD` | merge in progress | The commit(s) being merged |
| `CHERRY_PICK_HEAD` / `REVERT_HEAD` | cherry-pick / revert in progress | The commit being applied |

These are how Git "remembers" that a merge or cherry-pick is in progress, and why `git status` can tell you so.

### Updating refs safely

Porcelain commands update refs for you. Scripts use `update-ref`, which also writes the reflog and can check the old value:

```bash
$ git update-ref refs/heads/rescue 89f4424
$ git update-ref refs/heads/main <new> <expected-old>     # fails if main isn't at <expected-old>
```

That "expected old value" check is the same idea as `--force-with-lease` (Chapter 22).

## Revision syntax, revisited

Everything you type to name a commit resolves through refs:

| You type | Git resolves |
|---|---|
| `main` | `refs/heads/main` (then tags, then remotes, if ambiguous) |
| `origin/main` | `refs/remotes/origin/main` |
| `v1.4.0^{commit}` | The commit an annotated tag points to |
| `HEAD~2`, `HEAD^2` | Parents, via commit objects (Chapter 28) |
| `main@{1}` | The branch's reflog (Chapter 62) |
| `a91be03` | An object ID prefix |

`git rev-parse <anything>` shows the final ID, which is handy for scripts and for checking what a name means.

## Packfiles: how Git stays small

New objects start life as **loose objects**: one compressed file each in `.git/objects/xx/`. That's simple but wasteful for large histories: 10,000 versions of a big file would each be stored whole.

So Git periodically **packs** objects:

```bash
$ git count-objects -v
count: 5
size: 20
in-pack: 0
packs: 0
$ git gc
$ git count-objects -v
count: 0
size: 0
in-pack: 5
packs: 1
$ ls .git/objects/pack
pack-7190a19c….idx  pack-7190a19c….pack  pack-7190a19c….rev
```

Conceptually, a **packfile**:

1. Puts many objects into one file (`.pack`) with an index (`.idx`) for fast lookup by ID.
2. Uses **delta compression**: similar objects (for example, successive versions of the same file) are stored as one full object plus compact "what changed" deltas.
3. Chooses delta bases heuristically by type, name and size; often the **newest** version is stored whole and older ones as deltas, since recent versions are read most.

This is why the snapshot model (Chapter 13) doesn't make repositories huge: on disk, Git ends up storing something close to differences anyway, while presenting you with clean snapshots.

Packfiles are also the unit of **transfer**. When you fetch or push, Git negotiates which objects the other side lacks, builds a pack of just those (with deltas), and sends one file. That's the "Enumerating objects / Compressing objects / Writing objects" progress you've seen on every push.

## Garbage collection

`git gc` (run automatically from time to time) does housekeeping:

- packs loose objects and packs refs,
- expires old reflog entries (Chapter 62),
- **prunes** unreachable objects older than the grace period (two weeks by default).

So an object you "lost" survives until **both** its reflog entries have expired **and** the prune grace period has passed. Normal use never needs manual `gc`; very large repositories may use `git maintenance start` to schedule it in the background.

:::recap
### What you learned
- Refs give names to object IDs: branches (`refs/heads`), tags (`refs/tags`), remote-tracking branches (`refs/remotes`), the stash and more.
- A branch is a file containing a hash; refs can also live in `packed-refs`.
- HEAD is usually a symbolic ref naming a branch; ORIG_HEAD, FETCH_HEAD, MERGE_HEAD and friends record operations.
- `show-ref`, `for-each-ref`, `symbolic-ref`, `update-ref` and `rev-parse` work with refs.
- Packfiles store many objects together with delta compression, and are what fetch and push transfer.
- `git gc` packs, expires reflogs and prunes old unreachable objects.

### Key terms
```terms
Ref (reference) :: A name that points to an object ID.
Symbolic reference :: A ref that points to another ref, like HEAD → refs/heads/main.
packed-refs :: A single file storing many refs for efficiency.
Loose object :: An object stored in its own file under .git/objects.
Packfile :: A file storing many objects with delta compression.
Delta compression :: Storing an object as the differences from a similar object.
```

### Key commands
```commands
git show-ref :: List refs and their IDs.
git for-each-ref --format=... :: Report on refs for scripts.
git symbolic-ref HEAD :: Show which branch HEAD names.
git update-ref <ref> <new> [<old>] :: Safely set a ref.
git rev-parse <name> :: Resolve any name to an object ID.
git count-objects -v :: Loose versus packed object counts.
git gc :: Pack objects and clean up.
```

### Common mistakes
- Reading `.git/refs` directly and missing refs that are in `packed-refs`.
- Editing ref files by hand instead of using `update-ref` (no reflog, no safety check).
- Running aggressive garbage collection during a recovery.

### Quick quiz
```quiz
? [predict] What does .git/refs/heads/feature/login contain?
+ The commit ID the branch points to
- A list of all commits on the branch
- The branch's files
- The branch's upstream name
> A branch is a file containing a single hash.

? What makes HEAD a symbolic reference?
+ It normally contains the name of another ref, such as ref: refs/heads/main
- It points to a tag
- It's stored in packed-refs
- It changes on every commit
> Git follows HEAD to the branch it names.

? Why don't snapshot-based commits make repositories enormous?
+ Unchanged objects are shared, and packfiles store similar versions as deltas
- Git deletes old commits
- Git only stores the latest version
- Commits are compressed into zip files
> Sharing plus delta compression keeps storage close to the size of the changes.

? [tf] git push transfers a packfile containing only the objects the remote doesn't have.
+ True
- False
> Both sides negotiate what's missing, and Git sends a compact pack.
```

### Practical exercise
```exercise Explore refs and packs
In a practice repository with a few branches and tags:
1. Run `git show-ref` and match each line to a branch, tag or remote.
2. Print `.git/HEAD` and `git symbolic-ref HEAD`.
3. Run `git count-objects -v`, then `git gc`, then `git count-objects -v` again, and compare `count` and `in-pack`.
4. Use `git for-each-ref --sort=-committerdate --format='%(refname:short) %(committerdate:relative)' refs/heads/` to list branches by recent activity.
---solution---
After `git gc`, `count` (loose objects) usually drops to 0 and `in-pack` rises, with `packs: 1`. `.git/refs/heads` may become nearly empty because refs moved into `packed-refs`, yet `git show-ref` still lists them all.
```

### What to learn next
You now understand Git from the commands down to the bytes. Part 16 puts it all to work in realistic disaster-recovery scenarios.
:::
