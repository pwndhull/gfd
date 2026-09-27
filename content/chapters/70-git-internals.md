---
id: git-internals
part: 15
title: Git Internals: Objects, Trees and Blobs
minutes: 26
level: Advanced
topics: 151 Git internals | 152 Objects | 153 Trees | 154 Blobs
objectives:
- Describe Git as a content-addressable object database
- Name the four object types and what each stores
- Inspect objects with plumbing commands: hash-object, cat-file and ls-tree
- Trace a commit down to the file contents it records
- Explain everyday behaviour (cheap branches, fast checkouts, safe history) from the object model
concepts: object | blob | tree | commit | tag | content-addressable | SHA | plumbing
commands: git cat-file -p | git cat-file -t | git hash-object | git ls-tree | git rev-parse
---
Everything you've learned (commits, branches, merges, rebases, the reflog) sits on a remarkably small foundation. Under the hood, Git is a **key–value database of objects**, plus a handful of files that give names to some of them. Understanding it takes one chapter, and it makes every other part of Git feel inevitable.

## Content-addressable storage

Git stores data as **objects**. Each object's key is the **hash of its content**. Store the same content twice and you get the same key, so it's stored once. Change one byte and you get a completely different key.

```bash
$ echo "hello" | git hash-object --stdin
ce013625030ba8dba906f756967f9e9ca394464a
```

```cmd
git hash-object --stdin
hash-object :: Compute the object ID Git would give some content (add -w to actually store it).
--stdin :: Read the content from standard input rather than a file.
```

Every Git repository in the world computes exactly this ID for the content `hello` followed by a newline. That's what **content-addressable** means: the address *is* derived from the content. (Git hashes a short header, `blob 6\0`, plus the content, using SHA-1 by default.)

Store it and look inside the database:

```bash
$ echo "hello" > hello.txt
$ git hash-object -w hello.txt
ce013625030ba8dba906f756967f9e9ca394464a
$ find .git/objects -type f
.git/objects/ce/013625030ba8dba906f756967f9e9ca394464a
```

Objects are stored (zlib-compressed) in folders named by the first two hex characters of the ID. Later, Git packs them for efficiency (Chapter 71).

## The four object types

| Type | Stores | Analogy |
|---|---|---|
| **blob** | The contents of one file: bytes only, no name, no permissions | A page of text |
| **tree** | A directory listing: names, modes, and the IDs of blobs and sub-trees | A folder's table of contents |
| **commit** | A pointer to one root tree, parent commit(s), author, committer, message | A labelled snapshot |
| **tag** | For annotated tags: a pointer to an object, tag name, tagger, message | A signed label |

```diagram objects
```

### Blobs

A blob is file content and nothing else. The **file name is not in the blob**: it lives in the tree that points to it. That's why renaming a file doesn't create a new blob, and why two identical files anywhere in the project share one blob.

```bash
$ git cat-file -t ce01362
blob
$ git cat-file -p ce01362
hello
```

### Trees

A tree is a folder listing. Each entry has a mode, a type, an object ID and a name:

```bash
$ git cat-file -p HEAD^{tree}
100644 blob ce013625030ba8dba906f756967f9e9ca394464a	hello.txt
040000 tree 6bf39f886ffb9362a2d2c1fae780940353ea5bb5	src
```

| Mode | Meaning |
|---|---|
| `100644` | Normal file |
| `100755` | Executable file |
| `120000` | Symbolic link |
| `040000` | Sub-directory (a tree) |
| `160000` | Submodule commit (a gitlink, Chapter 67) |

`HEAD^{tree}` means "the tree of the commit HEAD points to". Sub-folders are just trees pointing to more trees:

```bash
$ git cat-file -p 6bf39f8
100644 blob e14c4f2a9561ade31986f9319d5c639094509905	app.js
$ git ls-tree -r HEAD            # the whole snapshot, recursively
100644 blob ce013625030ba8dba906f756967f9e9ca394464a	hello.txt
100644 blob e14c4f2a9561ade31986f9319d5c639094509905	src/app.js
```

Git tracks modes like executable-or-not, but not other permissions, owners or empty folders (a tree with no entries isn't stored: Chapter 11's "Git doesn't track empty folders" comes from here).

### Commits

You opened one in Chapter 28:

```bash
$ git cat-file -p HEAD
tree 9f1a3c2e7d4b8a6f0c5e1d2a3b4c5d6e7f8a9b0c
parent 51c0e2a9f8d7b6a5c4e3d2f1a0b9c8d7e6f5a4b3
author Priya Sharma <priya@acme.dev> 1772512927 +1000
committer Priya Sharma <priya@acme.dev> 1772512927 +1000

Load notes store at startup
```

A commit is a tiny text object that points to **one tree** (the root of the snapshot) and its **parent commits**. Following those two kinds of pointer gives you the entire project at every point in history.

### Annotated tags

```bash
$ git cat-file -p v1.4.0
object 8d1c4e2a7b0f39e5c6d1a8b2f4e7c9d0a1b2c3d4
type commit
tag v1.4.0
tagger Priya Sharma <priya@acme.dev> 1772701364 +1000

Release 1.4.0: coupons and faster checkout
```

(Lightweight tags aren't objects at all; they're just references, Chapter 71.)

## How a commit is built

When you run `git commit`, Git:

1. Writes a **blob** for each staged file content it doesn't already have (actually `git add` did this already).
2. Writes a **tree** for each folder in the staging area, bottom-up, reusing any unchanged trees.
3. Writes a **commit** pointing at the root tree and the current HEAD commit as parent.
4. Moves the current branch's reference to the new commit ID.

If you change one file deep in `src/payments/`, the new commit needs: one new blob, new trees for `src/payments/`, `src/` and the root, and one commit. Everything else is **shared** with the previous commit by ID.

## Why this design explains everyday Git

| Behaviour | Explained by |
|---|---|
| Commits are snapshots, but repositories stay small | Unchanged blobs and trees are shared by ID |
| Changing an old commit changes every later hash | Each commit's content includes its parent's ID |
| Git detects corruption | Recomputing an object's hash must match its ID |
| Branches and tags are cheap | They're just names for commit IDs (next chapter) |
| Renames are "detected", not recorded | Trees change names; blobs don't know their names |
| Checking out is fast | Git compares tree IDs and skips identical subtrees |
| "Lost" commits can be recovered | Objects stay in the database until garbage collection |

## Plumbing and porcelain

Git's commands come in two layers:

- **Porcelain**: the friendly commands you use daily (`add`, `commit`, `switch`, `log`).
- **Plumbing**: low-level commands scripts are built from (`hash-object`, `cat-file`, `ls-tree`, `update-ref`, `rev-parse`, `write-tree`, `commit-tree`).

You now know enough plumbing to build a commit by hand, which is a great way to cement the model (see the exercise).

:::recap
### What you learned
- Git is a content-addressable object database: each object's ID is the hash of its content.
- Blobs store file contents without names; trees list names, modes and object IDs; commits point to a root tree and parents; annotated tags point to objects with metadata.
- `git cat-file -t/-p`, `git ls-tree` and `git hash-object` inspect and create objects.
- A commit reuses every unchanged blob and tree, which keeps snapshots cheap.
- Most of Git's behaviour (cheap branches, immutable history, rename detection, recoverability) follows from this model.

### Key terms
```terms
Object :: A unit of data in Git's database, identified by the hash of its content.
Blob :: An object holding one file's contents.
Tree :: An object listing names, modes and IDs of blobs and sub-trees.
Content-addressable :: Storage where each item's key is derived from its content.
Plumbing :: Low-level Git commands designed for scripts.
Porcelain :: User-friendly Git commands built on plumbing.
```

### Key commands
```commands
git hash-object [-w] <file> :: Compute (and with -w, store) a blob ID.
git cat-file -t <id> :: Show an object's type.
git cat-file -p <id> :: Pretty-print an object.
git ls-tree [-r] <tree-ish> :: List a tree's entries (recursively with -r).
git rev-parse HEAD^{tree} :: Get the tree ID of a commit.
```

### Common mistakes
- Thinking commits store diffs.
- Expecting blobs to know their file names.
- Editing files under .git/objects by hand.

### Quick quiz
```quiz
? Where is a file's name stored in Git's object model?
- In the blob
+ In the tree that points to the blob
- In the commit message
- In the index only
> Blobs are pure content. Trees map names to blob IDs.

? [predict] Two different files in different folders contain exactly the same bytes. How many blobs does Git store for them?
+ One
- Two
- None until pushed
- One per commit
> Same content means same hash means one stored object.

? Which object does a commit point to for its snapshot?
+ A single root tree
- Every blob directly
- The previous commit's tree
- The staging area
> The root tree leads to every folder and file.

? [tf] Changing a commit message deep in history requires new hashes for every later commit.
+ True
- False
> Each commit includes its parent's ID, so the change ripples forward.

? What does the tree entry mode 040000 indicate?
- An executable file
+ A sub-directory (another tree)
- A symbolic link
- A submodule
> 100644 is a file, 100755 executable, 120000 symlink, 160000 submodule.
```

### Practical exercise
````exercise Build a commit by hand
In a new empty repository, create a commit using only plumbing commands:
1. Store a blob for "hello" with `hash-object -w`.
2. Put it in the index with `git update-index --add --cacheinfo 100644,<blob>,hello.txt`.
3. Write a tree from the index with `git write-tree`.
4. Create a commit with `git commit-tree <tree> -m "Hand-made commit"`.
5. Point `main` at it with `git update-ref refs/heads/main <commit>` and run `git log`.
---solution---
```bash
$ git init plumbing-lab && cd plumbing-lab
$ blob=$(echo "hello" | git hash-object -w --stdin)
$ git update-index --add --cacheinfo 100644,$blob,hello.txt
$ tree=$(git write-tree)
$ commit=$(git commit-tree $tree -m "Hand-made commit")
$ git update-ref refs/heads/main $commit
$ git log --stat
$ git restore hello.txt          # the file exists only in the database so far; this writes it out
```
You've done by hand everything `git add` and `git commit` do. `$(...)` captures a command's output into a shell variable.
````

### What to learn next
Objects are named by hashes nobody wants to type. The last chapter of Part 15 covers references (branches, tags, HEAD) and how Git packs objects efficiently.
:::
