---
id: blame-and-show
part: 15
title: git blame and git show
minutes: 18
level: Advanced
topics: 144 Git blame | 145 Git show
objectives:
- Find which commit last changed each line of a file with git blame
- Narrow blame to line ranges, ignore whitespace and skip formatting commits
- Follow a line back through history past refactors
- Use git show to inspect commits, files at a revision, tags and trees
concepts: blame | commit | commit message | atomic commit | tree
commands: git blame | git blame -L | git blame -w -C | git blame --ignore-rev | git show | git show <rev>:<path>
---
You find a strange line. Before changing it, you want to know: who wrote it, when, and above all **why**? `git blame` points each line at the commit that last changed it, and `git show` opens that commit. Together they turn history into documentation.

:::note "Blame" is not about blame
The name is unfortunate. Use it to find **context** and the right person to ask, never to point fingers. Many tools call the same feature "annotate".
:::

## git blame basics

```bash
$ git blame src/cart.js
a91be03e (Ben Okafor   2026-02-19 14:02:11 +1000 12)   let sum = 0;
3c9e1a07 (Priya Sharma 2026-03-02 09:15:40 +1000 13)   for (const item of items) {
3c9e1a07 (Priya Sharma 2026-03-02 09:15:40 +1000 14)     const cents = Math.round(item.price * 100);
e4c9b18c (Sam Lee      2025-11-04 16:20:03 +1000 15)     if (item.qty > 99) throw new QuantityError();
```

Each line shows: the commit that last changed it, the author, the date, the line number, and the content.

```cmd
git blame -L 12,20 src/cart.js
blame :: Show, for each line of a file, the commit that last modified it.
-L 12,20 :: Only lines 12 to 20. Also accepts a function name: -L :total
src/cart.js :: The file.
```

Useful options:

| Option | Effect |
|---|---|
| `-L 40,60` / `-L :functionName` | Limit to a range or a function |
| `--date=short` | Shorter dates |
| `-e` | Show emails instead of names |
| `-w` | Ignore whitespace-only changes (so re-indentation doesn't "own" lines) |
| `-C` | Detect lines moved or copied from other files in the same commit (`-C -C` searches more widely) |
| `-M` | Detect lines moved within the file |
| `<rev> -- <file>` | Blame as of an older commit: `git blame v2.4.0 -- src/cart.js` |

## From blame to understanding

Blame gives you a hash. Now read the commit:

```bash
$ git show e4c9b18c
commit e4c9b18c...
Author: Sam Lee <sam@acme.dev>
Date:   Tue Nov 4 16:20:03 2025 +1000

    Reject quantities above 99

    The warehouse API rejects orders with a line quantity over 99 and
    the failure only surfaced after payment. Validate before charging.

    Fixes SHOP-512
```

Now you know the line is load-bearing, why it exists, and where the discussion lives (SHOP-512). This is why commit messages that explain **why** matter so much (Chapter 29).

On GitHub, the **Blame** button on any file shows the same, with a handy "view blame prior to this change" icon to step further back.

## Looking past refactors

Often blame points at a boring commit: a reformat, a rename, a file move. The line's real origin is further back.

**Step back through history** by blaming the commit before the one shown:

```bash
$ git blame -L 15,15 3c9e1a07^ -- src/cart.js
```

`3c9e1a07^` means "the parent of that commit", so you see who changed the line before the refactor.

**Ignore known formatting commits permanently.** Put their hashes in a file and point blame at it:

```text title=".git-blame-ignore-revs"
# Prettier reformat of the whole codebase
3c9e1a07c1e2b3a4d5f6a7b8c9d0e1f2a3b4c5d6
```

```bash
$ git config blame.ignoreRevsFile .git-blame-ignore-revs
```

GitHub's blame view also honours a `.git-blame-ignore-revs` file in the repository root.

**Search by content instead of lines** with the "pickaxe" (Chapter 65):

```bash
$ git log -S "QuantityError" --oneline -- src/
```

finds the commits that added or removed that text, even if the line has moved around since.

## git show in depth

`git show` displays any object in a readable way. You've used it for commits; it does more:

| Command | Shows |
|---|---|
| `git show` | The HEAD commit: message and diff |
| `git show a91be03` | A specific commit |
| `git show a91be03 --stat` | Message and changed-file summary |
| `git show a91be03 -- src/cart.js` | Only that commit's changes to one file |
| `git show v2.4.0` | An annotated tag's details, then the commit |
| `git show v2.4.0:src/cart.js` | The file's content at that tag |
| `git show HEAD~3:` | The top-level tree listing at that commit (note the trailing colon) |
| `git show :src/cart.js` | The version of the file currently in the staging area |
| `git show a91be03 --format="%an %ad%n%s" --no-patch` | Custom formatted metadata only |
| `git show --color-words a91be03` | Word-level diff of a commit |

## A line-investigation routine

When you're about to change something you don't understand:

1. `git blame -w -C -L <range> <file>`: who last touched these lines, ignoring whitespace and moves.
2. `git show <hash>`: read the message and the whole change for context.
3. If it's a refactor, `git blame <hash>^ -- <file>` to go further back.
4. Check the linked issue or PR (GitHub shows the PR for each commit).
5. Still unclear? Ask the author. You'll usually get the answer in a minute, and they'll appreciate that you checked first.

:::recap
### What you learned
- `git blame` shows the last commit, author and date for each line; `-L` narrows it.
- `-w`, `-M`, `-C` and `--ignore-rev(s-file)` look past whitespace, moves and formatting commits.
- `git blame <hash>^ -- <file>` steps back past a commit; `git log -S` searches by content.
- `git show` displays commits, tags, files at a revision (`rev:path`), trees and staged files.
- Blame is for context and finding who to ask, not for assigning fault.

### Key terms
```terms
Blame / annotate :: Showing the last commit that modified each line of a file.
Pickaxe :: git log -S or -G, searching history for changes that add or remove text.
Ignore revs file :: A list of commits (such as mass reformatting) for blame to skip.
```

### Key commands
```commands
git blame <file> :: Line-by-line last-change information.
git blame -L 10,30 <file> :: Only certain lines.
git blame -w -C <file> :: Ignore whitespace and detect moved/copied code.
git blame <rev>^ -- <file> :: Blame as it was before a commit.
git show <commit> :: Show a commit.
git show <rev>:<path> :: Show a file at a revision.
git config blame.ignoreRevsFile .git-blame-ignore-revs :: Skip listed commits in blame.
```

### Common mistakes
- Concluding a reformat commit's author wrote the logic.
- Using blame to criticise rather than to understand.
- Forgetting the trailing `^` when stepping back past a commit.

### Quick quiz
```quiz
? [predict] What does this line from git blame tell you?
| e4c9b18c (Sam Lee 2025-11-04 16:20:03 +1000 15)     if (item.qty > 99) throw new QuantityError();
+ Line 15 was last changed by Sam Lee in commit e4c9b18c on 4 November 2025
- Sam Lee wrote the whole file
- Line 15 has a bug
- Commit e4c9b18c is the first commit in the repository
> Blame reports the last commit to modify each line.

? [scenario] Blame shows every line of a file changed in "Run Prettier on codebase". How do you see the real origins?
+ Add that commit to .git-blame-ignore-revs (or use --ignore-rev), or blame the commit's parent
- Delete the commit
- Use git blame --all
- Revert the formatting
> Blame can skip known formatting commits.

? What does git show v2.4.0:src/cart.js print?
+ The contents of src/cart.js at the commit tagged v2.4.0
- The changes to cart.js in v2.4.0
- The blame of cart.js at v2.4.0
- An error
> rev:path names a file inside a commit's snapshot.

? Which blame option ignores changes that only altered whitespace?
+ -w
- -C
- -L
- -e
> -w stops re-indentation from taking ownership of lines.
```

### Practical exercise
```exercise Investigate a line
In any real repository (your team's, or an open-source project):
1. Pick a non-obvious line and run `git blame -w -C -L <n>,<n> <file>`.
2. `git show` the commit. Does the message explain why?
3. Step back once with `git blame -L <n>,<n> <hash>^ -- <file>` and compare.
4. Search for when a distinctive identifier first appeared with `git log -S "<identifier>" --oneline --reverse | head -1`.
---solution---
There's no single answer. Good repositories give you a commit whose message explains the reason and links an issue. `--reverse` with `head -1` lists the oldest commit that added or removed the text first, which is usually when it was introduced.
```

### What to learn next
Next: advanced `git log` filtering and formatting to answer almost any question about history.
:::
