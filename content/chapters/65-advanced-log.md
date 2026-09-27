---
id: advanced-log
part: 15
title: Advanced git log
minutes: 20
level: Advanced
topics: 146 Git log advanced usage
objectives:
- Combine ranges, filters and path limits to answer precise history questions
- Search history by content with -S and -G, and by message with --grep
- Format log output for reports and scripts
- Follow a function or line range through history
concepts: commit history | range | pickaxe | merge commit | first parent
commands: git log -S | git log -G | git log -L | git log --format | git log --merges | git log --first-parent | git shortlog
---
Chapter 14 covered everyday `git log`. This chapter is the power-user toolkit: answering questions like "when did we stop calling this API?", "what did Sam merge into release/2.4 last month?" or "how did this function evolve?".

## Anatomy of a log query

Almost every advanced query combines four parts:

```text
git log [range] [filters] [format] [-- paths]
```

| Part | Examples |
|---|---|
| **Range** | `main`, `v2.3.0..v2.4.0`, `origin/main..HEAD`, `--all`, `main...feature` |
| **Filters** | `--author`, `--since`, `--until`, `--grep`, `-S`, `-G`, `--merges`, `--no-merges` |
| **Format** | `--oneline`, `--stat`, `-p`, `--graph`, `--format=...` |
| **Paths** | `-- src/payments/`, `-- '*.sql'` |

## Searching by content: the pickaxe

| Option | Finds commits that… |
|---|---|
| `-S"text"` | change the **number of occurrences** of `text` (added or removed it) |
| `-G"regex"` | have **any added or removed line** matching the regex (also catches edits to lines containing it) |

```bash
$ git log -S"legacyCheckout(" --oneline           # when was legacyCheckout called or removed?
$ git log -G"timeout\s*=\s*\d+" --oneline -p       # every change touching a timeout assignment
$ git log -S"API_KEY" --all --oneline              # did an API key ever appear on any branch?
```

`-S` is the classic way to find when something was introduced or deleted. Add `-p` to see the diffs, `--reverse` to list oldest first.

## Searching messages

```bash
$ git log --grep="SHOP-231" --oneline              # commits mentioning a ticket
$ git log --grep="fix" --grep="cart" --all-match   # both words (default is either)
$ git log --grep="wip" -i --oneline                # case-insensitive
$ git log --invert-grep --grep="^chore" --oneline  # exclude chores
```

## History of a function or line range

`git log -L` tracks a range of lines, or a function, through every commit that changed it, showing only the relevant diffs:

```bash
$ git log -L :total:src/cart.js                    # the function named total
$ git log -L 40,60:src/cart.js                     # lines 40–60
```

This is the fastest way to answer "how did this function end up like this?".

## Merges and first parents

| Option | Effect |
|---|---|
| `--merges` | Only merge commits |
| `--no-merges` | Exclude merge commits |
| `--first-parent` | Follow only the first parent of merges: the main line |
| `-m` / `--diff-merges=first-parent` | Show merge commits' diffs against the first parent |

On a `main` that receives PRs as merge commits:

```bash
$ git log --first-parent --oneline main --since="2 weeks ago"
```

lists one line per merged PR: a ready-made summary of recent work.

## Formatting output

`--format` (or `--pretty=format:`) builds custom lines from placeholders:

| Placeholder | Value |
|---|---|
| `%H` / `%h` | Full / short hash |
| `%an` / `%ae` | Author name / email |
| `%ad` / `%ar` | Author date / relative date ("3 days ago") |
| `%s` | Subject |
| `%b` | Body |
| `%d` | Decorations (branches, tags) |
| `%(trailers:key=Co-authored-by)` | Specific trailers |
| `%C(yellow)` … `%Creset` | Colours |

```bash
$ git log --format="%h %ad %<(14,trunc)%an %s" --date=short -5
e4c9b18 2026-03-07 Priya Sharma   Validate coupon expiry
77a1b20 2026-03-06 Ben Okafor     Add coupon field

$ git log --format="%C(auto)%h%d %s %C(dim)(%ar, %an)" --graph --all -15
```

For scripts, use stable output: `git log --format="%H%x09%an%x09%s"` (`%x09` is a tab).

## Summaries and statistics

```bash
$ git shortlog -sn --since="3 months ago"          # commits per author
$ git log --since="1 month ago" --numstat --format="" | awk '{a+=$1; d+=$2} END {print a, d}'   # lines added/deleted
$ git log --diff-filter=D --name-only --oneline    # commits that deleted files, and which
$ git log --diff-filter=A --format="%h %s" -- '*.sql'   # when each SQL file was added
```

`--diff-filter` letters: `A` added, `D` deleted, `M` modified, `R` renamed, `C` copied.

## Worked questions

| Question | Query |
|---|---|
| What changed between two releases, excluding merges? | `git log --no-merges --oneline v2.3.0..v2.4.0` |
| What's on my branch that isn't on main? | `git log --oneline main..HEAD` |
| Which commits touched payments in the last week, by Sam? | `git log --oneline --author=Sam --since="1 week ago" -- src/payments/` |
| When was this config key removed? | `git log -S"enableLegacyCart" --oneline -- config/` |
| How did validateAddress evolve? | `git log -L :validateAddress:src/address.js` |
| Which PRs merged into main this sprint? | `git log --first-parent --merges --oneline --since=2026-03-01 main` |
| Who knows this folder best? | `git shortlog -sn -- src/search/` |

:::recap
### What you learned
- Advanced queries combine a range, filters, a format and path limits.
- `-S` finds commits that add or remove text; `-G` finds changes to lines matching a regex; `--grep` searches messages.
- `git log -L` follows a function or line range through history.
- `--first-parent`, `--merges` and `--no-merges` control how merges appear.
- `--format` placeholders build reports; `git shortlog` and `--diff-filter` summarise.

### Key terms
```terms
Pickaxe :: The -S and -G options that search commit diffs for content.
Revision range :: A set of commits described with .., ..., ^ or --all.
Format placeholder :: A %-code in --format output, such as %h or %an.
--diff-filter :: Limits output to files added, deleted, modified or renamed.
```

### Key commands
```commands
git log -S"text" :: Commits adding or removing text.
git log -G"regex" :: Commits changing lines matching a regex.
git log -L :func:file :: History of a function.
git log --first-parent main :: The main line of history.
git log --format="%h %an %s" :: Custom output.
git shortlog -sn :: Commit counts by author.
```

### Common mistakes
- Using `--grep` (messages) when you meant `-S` (content).
- Forgetting `--all` when searching for something on other branches.
- Parsing default `git log` output in scripts instead of a stable `--format`.

### Quick quiz
```quiz
? [scenario] You want the commit that first introduced the function name calculateTax. Which query?
+ git log -S"calculateTax" --oneline --reverse
- git log --grep="calculateTax"
- git blame calculateTax
- git log --author=calculateTax
> -S searches diffs for the text; --reverse lists the oldest first.

? What does git log -L :total:src/cart.js show?
+ Every commit that changed the total function, with just those diffs
- The total number of commits touching cart.js
- The last line of cart.js
- Lines containing the word total
> -L tracks a line range or function through history.

? [predict] Which commits does this list?
| git log --first-parent --merges --oneline main
+ Merge commits on main's main line, typically one per merged PR
- All commits on all branches
- Only non-merge commits
- Commits whose first parent is missing
> First-parent keeps to main's line; --merges keeps only merge commits.

? Which placeholder prints the relative author date, such as "3 days ago"?
- %ad
+ %ar
- %h
- %s
> %ar is "author date, relative".
```

### Practical exercise
```exercise Answer five questions
In any repository with some history, write a single git log command for each:
1. Commits in the last 30 days, excluding merges, as short hash, date and subject.
2. The first commit that mentions "README" in its message.
3. Every commit that added or removed the word "TODO".
4. Files deleted in the last 100 commits.
5. The history of one function you pick.
---solution---
1. `git log --no-merges --since="30 days ago" --format="%h %ad %s" --date=short`
2. `git log --grep="README" --reverse --oneline | head -1`
3. `git log -S"TODO" --oneline`
4. `git log -100 --diff-filter=D --name-only --format=""`
5. `git log -L :<function>:<file>`
```

### What to learn next
Next: `git worktree`, for working on several branches at the same time in separate folders.
:::
