---
id: commit-messages
part: 6
title: Commit Messages and Atomic Commits
minutes: 22
level: Intermediate
topics: 62 Commit messages | 63 Good vs bad commits | 64 Atomic commits
objectives:
- Write a commit message with a clear subject and a useful body
- Recognise the difference between a good and a bad commit, with examples
- Split work into atomic commits that each do one thing
- Use tools that make good commits easy: add -p, commit -v and fixup commits
concepts: commit message | subject line | atomic commit | imperative mood | commit
commands: git commit -v | git add -p | git log --oneline
---
A commit message is a letter to the future. The reader might be a reviewer tomorrow, a teammate debugging production at 2 a.m., or you in eighteen months wondering why a line exists. They have the diff, which shows **what** changed. Only the message can tell them **why**.

## The shape of a good message

```text
Fix double charge when payment API times out

The client retried POST /charges after a 10 s timeout, but the
API had usually succeeded, so customers were charged twice.

Send an idempotency key with each charge so retries are safe,
and raise the timeout to 30 s to match the provider's guidance.

Fixes SHOP-812
```

Seven conventions, widely followed across the industry:

1. **Subject line of about 50 characters** (hard limit ~72). It's what `git log --oneline`, GitHub and email subjects show.
2. **Capitalise the subject.**
3. **No full stop at the end of the subject.**
4. **Imperative mood**: "Fix bug", not "Fixed bug" or "Fixes bug". A good test: the subject should complete the sentence *"If applied, this commit will ___"*.
5. **A blank line between subject and body.** Tools rely on it to tell them apart.
6. **Wrap the body at about 72 characters.**
7. **The body explains why and what, not how.** The code shows how.

Plus team-specific extras: ticket references (`Fixes SHOP-812`, which GitHub can use to close issues, Chapter 54), or a type prefix like `fix:` or `feat:` if your team uses Conventional Commits (Chapter 59).

## Good versus bad

| Bad | Why it's bad | Better |
|---|---|---|
| `fix` | Fix what? | `Fix crash when cart is empty` |
| `updates` | Says nothing | `Update Stripe SDK to 14.2 for 3DS2 support` |
| `WIP` | Fine locally; useless in shared history | Squash before merging (Chapter 38) |
| `Fixed the bug where the thing didn't work because the date parsing used the wrong timezone and also refactored utils` | Two changes; subject too long | Two commits: `Parse order dates as UTC` and `Extract date helpers into utils/date.js` |
| `Address review comments` | Describes the process, not the change | `Validate email before sending reset link` (or fold into the original commit) |
| `asdfgh` | … | Anything real |

A useful self-check: if you can't write a clear subject, the commit is probably doing too much.

## Good and bad commits, beyond the message

A **good commit**:

- does **one logical thing**,
- leaves the project **working** (builds, tests pass),
- contains **everything** that change needs: code, tests, docs, migrations,
- contains **nothing** else: no stray debug logging, unrelated formatting or commented-out experiments,
- has a message that explains **why**.

A **bad commit** mixes a feature, a refactor and a reformat; or breaks the build; or contains half a change whose other half is in the next commit.

## Atomic commits

An **atomic commit** is the smallest change that makes sense on its own. Not the smallest possible change (one commit per line would be absurd), but one idea per commit.

Why it pays off:

| Benefit | How |
|---|---|
| Easier review | Reviewers can read a PR commit by commit, each with one purpose |
| Easier debugging | `git bisect` (Chapter 63) can pinpoint the exact commit that broke something; if that commit does one thing, you've found the bug |
| Safe reverts | `git revert` of an atomic commit removes exactly one change, without collateral damage |
| Useful blame | `git blame` points each line to a commit whose message explains it |
| Cherry-picking | You can copy one fix to a release branch without dragging unrelated work (Part 11) |

### Splitting messy work into atomic commits

You spent an afternoon and have a pile of changes: a bug fix, a rename you did along the way, and some whitespace cleanup. Build the commits one at a time with the staging area:

```bash
$ git status -s
 M src/cart.js
 M src/checkout.js
 M src/utils/money.js

$ git add -p src/utils/money.js     # stage just the rename of formatPrice → formatMoney
$ git add -p src/cart.js            # ...and its call sites
$ git commit -m "Rename formatPrice to formatMoney"

$ git add -p src/cart.js            # now the rounding fix
$ git commit -m "Round cart totals to whole cents"

$ git add -A                        # whatever's left is whitespace cleanup
$ git diff --staged                 # confirm it really is only whitespace
$ git commit -m "Normalise indentation in checkout"
```

`git add -p` (Chapter 12) is the key tool. `git commit -v` (Chapter 13) shows the staged diff while you write the message, so the message matches the content.

:::tip Order refactors before fixes
When a fix needs a refactor, commit the refactor first ("Extract…", "Rename…") with no behaviour change, then the fix. Reviewers can check the refactor quickly and focus their attention on the fix.
:::

## Local commits can be messy; shared ones shouldn't

You don't need perfect commits while working. Commit often, with quick messages, as checkpoints. Before you ask for review, tidy them into a clean story with interactive rebase (Chapter 38):

```bash
$ git log --oneline origin/main..
e4c9b18 fix typo
77a1b20 wip
3c9e1a0 more reset stuff
a91be03 start password reset
```

becomes

```bash
$ git log --oneline origin/main..
5d2f90b Validate reset token expiry
c07a1e4 Add password reset form and email
```

Git even helps you plan this while working: `git commit --fixup <hash>` creates a commit marked to be merged into an earlier one automatically during a later rebase (Chapter 38).

## Reading messages effectively

Good messages pay off when you search:

```bash
$ git log --oneline --grep="idempotency"
$ git log -S "idempotency_key" --oneline      # when was this code introduced?
$ git blame -L 40,60 src/payments.js          # who wrote these lines, in which commit? (Chapter 64)
```

:::recap
### What you learned
- A message has a short imperative subject, a blank line, and a body explaining why.
- Test the subject: "If applied, this commit will…".
- Good commits do one thing, keep the project working and include everything that change needs.
- Atomic commits make review, bisect, revert, blame and cherry-pick work well.
- Use `git add -p` and `git commit -v` to build atomic commits; tidy local history before review.

### Key terms
```terms
Subject line :: The first line of a commit message, shown in one-line views.
Message body :: The paragraphs after the blank line, explaining why.
Imperative mood :: Writing as a command: "Add", "Fix", "Remove".
Atomic commit :: A commit containing exactly one logical change.
Fixup commit :: A commit made with --fixup, marked to be folded into an earlier commit during rebase.
```

### Key commands
```commands
git commit -v :: Write the message while seeing the staged diff.
git add -p :: Stage hunks to build focused commits.
git commit --fixup <hash> :: Record a fix meant for an earlier commit.
git log --grep=<text> :: Search commit messages.
```

### Common mistakes
- Subjects like "fix", "update" or "changes".
- Explaining how the code works instead of why the change was needed.
- Mixing refactors, fixes and formatting in one commit.
- Leaving "WIP" and "address review" commits in shared history.

### Quick quiz
```quiz
? Which subject line best follows the conventions?
- fixed login bug.
- Fixes: login
+ Reject expired tokens during login
- I changed the login code so that expired tokens will now be rejected properly by the server
> Imperative, capitalised, concise, no full stop, and it says what the change does.

? What should the body of a commit message mainly explain?
- The exact lines that changed
+ Why the change was needed, and any important context or trade-offs
- The name of the branch
- How long the change took
> The diff already shows what changed. The message's unique value is the why.

? [scenario] git bisect finds that a single commit broke checkout. The commit's message is "Refactor, fix typos, update deps, tweak checkout". Why is this painful?
+ The commit isn't atomic, so you still have to work out which of several changes caused the bug
- bisect cannot handle long messages
- The commit needs a ticket number
- Refactors can't be reverted
> Atomic commits make bisect results precise: the offending commit contains just one change.

? [tf] Every commit on your local branch must be perfect before you commit it.
- True
+ False
> Commit often as checkpoints; tidy the history with interactive rebase before sharing for review.
```

### Practical exercise
````exercise Split and describe
In a practice repository, make three unrelated changes in two files: rename a function, fix a bug in it, and add a comment elsewhere. Then:
1. Use `git add -p` to create three atomic commits.
2. Write a message for each following all seven conventions; give the bug fix a body.
3. Review them with `git log -p -n 3`.
---solution---
A good result looks like:
```text
3c9e1a0 Explain retry limits in README
77a1b20 Return 0 for an empty cart total
a91be03 Rename sum to cartTotal
```
with the bug fix's body explaining why the empty-cart case mattered (for example "Checkout crashed when the cart was cleared in another tab"). Each commit's diff in `git log -p` should contain only its own change.
````

### What to learn next
Even careful developers commit and immediately spot a typo or a forgotten file. Next: fixing the last commit with `--amend`.
:::
