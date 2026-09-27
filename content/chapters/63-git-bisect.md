---
id: git-bisect
part: 15
title: Finding Bugs with git bisect
minutes: 20
level: Advanced
topics: 143 Git bisect
objectives:
- Explain how bisect uses binary search over commits
- Run a manual bisect session, marking commits good or bad
- Automate bisect with a test script
- Handle untestable commits and finish cleanly
concepts: bisect | binary search | good commit | bad commit | detached HEAD | atomic commit
commands: git bisect start | git bisect good | git bisect bad | git bisect skip | git bisect run | git bisect reset | git bisect log
---
"Checkout worked last month. Now it doesn't. Four hundred commits went in since." Reading them all would take a day. **`git bisect`** finds the exact commit that introduced the problem in about nine test runs, because it halves the search space each time.

## How it works

You tell Git one commit where things were **good** and one where they're **bad**. Git checks out the commit halfway between them and asks you to test it. Your answer eliminates half the remaining commits. Repeat until one commit is left: the first bad one.

```graph Bisecting 8 commits
good                               bad
 A---B---C---D---E---F---G---H
             ^ test D: good → bug is in E..H
                     ^ test F: bad  → bug is in E..F
                 ^ test E: good → F is the first bad commit
```

The number of steps grows very slowly: 8 commits need 3 tests, 1,000 need about 10, 1,000,000 about 20.

```viz bisect
```

## A manual session

```bash
$ git bisect start
$ git bisect bad                       # the current commit is broken
$ git bisect good v2.4.0               # this release worked
Bisecting: 3 revisions left to test after this (roughly 2 steps)
[89795e5ba7df76f3eead9805ad12f52257037970] Commit 4
```

Git has checked out a commit in the middle (in detached HEAD, Chapter 61). Test it: run the app, run the failing test, check the page. Then report:

```bash
$ git bisect good
Bisecting: 1 revision left to test after this (roughly 1 step)
[b969a9fbe136c2aecbccdcf05dd0619b46c1b437] Commit 6
$ git bisect bad
Bisecting: 0 revisions left to test after this (roughly 0 steps)
[5aae566ea54728b5c8c080004ed20d34bd057cdb] Commit 5
$ git bisect good
b969a9fbe136c2aecbccdcf05dd0619b46c1b437 is the first bad commit
commit b969a9fbe136c2aecbccdcf05dd0619b46c1b437
Author: Ben Okafor <ben@acme.dev>
Date:   Thu Feb 19 14:02:11 2026 +1000

    Refactor totals calculation
```

Then **always** end the session, which returns you to where you started:

```bash
$ git bisect reset
Previous HEAD position was 5aae566 Commit 5
Switched to branch 'main'
```

Now read that commit (`git show b969a9f`). If it's atomic and well described (Chapter 29), the cause is usually obvious.

| Command | Meaning |
|---|---|
| `git bisect start [bad] [good]` | Begin; optionally give bad and good right away: `git bisect start HEAD v2.4.0` |
| `git bisect bad [commit]` | This commit (or the current one) has the bug |
| `git bisect good [commit]` | This commit does not have the bug |
| `git bisect skip` | Can't test this one (doesn't build, unrelated breakage); pick another nearby |
| `git bisect reset` | End the session and return to the original branch |
| `git bisect log` | Show the decisions so far (can be replayed with `git bisect replay`) |
| `git bisect visualize` | Show the remaining suspects (`git bisect view --oneline`) |

:::tip Terms other than good and bad
If you're hunting for when something *changed* rather than broke (say, when a feature started being faster), "good" and "bad" feel odd. Use `git bisect start --term-old=slow --term-new=fast` and then `git bisect slow` / `git bisect fast`. The built-in aliases `old` and `new` also work.
:::

## Automating with bisect run

If a command can decide good or bad, Git can do the whole search unattended:

```cmd
git bisect run npm test -- cart.test.js
bisect run :: Run the given command at each step and use its exit code to mark the commit.
npm test -- cart.test.js :: Any command. Exit code 0 means good; 1 to 127 (except 125) means bad; 125 means skip.
```

```bash
$ git bisect start HEAD v2.4.0
$ git bisect run npm test -- cart.test.js
...
b969a9fbe136c2aecbccdcf05dd0619b46c1b437 is the first bad commit
bisect found first bad commit
$ git bisect reset
```

Tips for automated runs:

- Write a **small script** that reproduces exactly the bug and nothing else, and put it **outside** the repository (or untracked), so checking out old commits doesn't change or remove it.
- Make the script **exit 125** when a commit can't be tested (for example if the build fails for unrelated reasons), so bisect skips it rather than blaming it.
- Old commits may need different dependencies: include `npm ci` (or equivalent) in the script if necessary.

```bash title="/tmp/check-rounding.sh"
#!/bin/sh
npm ci --silent || exit 125            # can't build this commit: skip it
node -e "
  const { total } = require('./src/cart');
  process.exit(total([{ price: 10.3, qty: 1 }]) === 10.3 ? 0 : 1);
"
```

```bash
$ chmod +x /tmp/check-rounding.sh
$ git bisect run /tmp/check-rounding.sh
```

## When bisect works best

- **Atomic commits** (Chapter 29): the first bad commit contains one change, so the cause is clear.
- **Every commit builds and passes tests**: squash-merged histories and `rebase --exec` (Chapter 38) help. Broken intermediate commits force many `skip`s.
- **A reliable reproduction**: flaky bugs give wrong answers; run the check several times per step if needed.
- **Merges**: bisect handles merge-heavy history fine; it may land on a merge commit, meaning the combination of both sides caused the bug.

:::recap
### What you learned
- `git bisect` binary-searches history between a known good and a known bad commit; each test halves the suspects.
- Manual flow: `start`, `bad`, `good <commit>`, test and mark each step, then always `reset`.
- `skip` avoids untestable commits; `log` records the session.
- `git bisect run <cmd>` automates: exit 0 = good, 1–127 = bad, 125 = skip.
- Atomic, always-building commits make bisect fast and precise.

### Key terms
```terms
Bisect :: A binary search through commit history to find the first bad commit.
Good commit :: A commit known not to have the bug.
Bad commit :: A commit known to have the bug.
First bad commit :: The earliest commit in the range with the bug; bisect's result.
Exit code 125 :: The code a bisect run script returns to skip a commit.
```

### Key commands
```commands
git bisect start [bad] [good] :: Begin bisecting.
git bisect good / bad [commit] :: Mark a commit.
git bisect skip :: Skip an untestable commit.
git bisect run <command> :: Automate using a command's exit code.
git bisect reset :: Finish and return to your branch.
git bisect log :: Show the session's decisions.
```

### Common mistakes
- Forgetting `git bisect reset` and continuing to work in detached HEAD.
- Marking a commit bad because of an unrelated failure instead of skipping.
- Keeping the test script inside the repository where old checkouts change it.

### Quick quiz
```quiz
? About how many test steps does bisect need to search 1,000 commits?
- 1,000
- 100
+ About 10
- 2
> Each step halves the range: 2^10 = 1,024.

? [predict] In git bisect run, what does an exit code of 125 mean?
+ Skip this commit; it can't be tested
- The commit is good
- The commit is bad
- Abort the bisect
> 0 is good, 1–127 except 125 is bad, 125 is skip.

? [scenario] You finished bisecting and found the culprit. What must you do before continuing work?
+ git bisect reset
- git reset --hard
- Nothing
- git bisect good
> reset ends the session and returns you to your original branch; otherwise you stay detached on an old commit.

? Why do atomic commits make bisect more useful?
+ The first bad commit then contains a single change, pointing straight at the cause
- They make bisect faster to type
- Bisect ignores non-atomic commits
- They avoid detached HEAD
> A commit that mixes ten changes still leaves you searching.
```

### Practical exercise
````exercise Bisect manually and automatically
Create a repository with 12 commits that each change `n.txt`, where commit 8 also creates `bug.txt`:
```bash
$ for i in $(seq 1 12); do echo v$i > n.txt; [ $i -ge 8 ] && echo broken > bug.txt; git add -A; git commit -qm "Commit $i"; done
```
1. Bisect manually between `HEAD~11` (good) and `HEAD` (bad), testing with `test -f bug.txt`.
2. Reset, then find it again with `git bisect run`.
---solution---
```bash
$ git bisect start HEAD HEAD~11
$ test -f bug.txt && git bisect bad || git bisect good     # repeat until done
$ git bisect reset
$ git bisect start HEAD HEAD~11
$ git bisect run sh -c '! test -f bug.txt'                  # good when bug.txt is absent
$ git bisect reset
```
Both report "Commit 8" as the first bad commit, after about four steps.
````

### What to learn next
Bisect finds *which commit*. Next: `git blame` and `git show`, which find *which commit touched a line* and explain it.
:::
