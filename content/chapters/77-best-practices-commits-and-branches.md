---
id: best-practices-commits-and-branches
part: 17
title: Best Practices for Commits and Branches
minutes: 18
level: Professional
topics: Commit hygiene | Branch naming | Commit messages | Small changes | Atomic commits
objectives:
- Apply a concise checklist before every commit
- Name branches so they communicate purpose and link to work items
- Keep changes small and commits atomic, and know why it pays off
- Recognise and fix the most common commit-hygiene problems
concepts: atomic commit | commit message | feature branch | small changes | commit hygiene
commands: git diff --staged | git add -p | git commit -v | git switch -c | git rebase -i
---
Part 17 distils the book into habits. None of these are rules for their own sake: each one makes you faster, easier to review, and easier to recover from mistakes. This chapter covers the smallest units of your work: commits and branches.

## Commit hygiene: a pre-commit checklist

Before each commit, ten seconds:

```bash
$ git status              # 1. On the right branch? Only the files I expect?
$ git diff --staged       # 2. Only the lines I mean? No debug output, secrets, commented-out code?
$ npm test                # 3. Does it still work? (or the relevant subset)
$ git commit -v           # 4. Write a message while looking at the diff
```

| Habit | Why |
|---|---|
| Stage deliberately (`git add <paths>`, `git add -p`) | Keeps unrelated edits out (Chapter 12) |
| Review `--staged` every time | Catches mistakes before anyone else sees them |
| Keep the build green at every commit | Makes `git bisect` and reverts reliable (Chapter 63) |
| No generated files, build output, or dependencies | Noise in diffs and conflicts; use `.gitignore` (Chapter 16) |
| No secrets, ever | Leaks are expensive to clean up (Chapter 73) |
| No large binaries without a plan | Repositories grow forever; use Git LFS or artifact storage for big assets |
| Commit often locally; tidy before sharing | Checkpoints protect you; clean history helps reviewers (Chapter 38) |

## Commit messages

The short version of Chapter 29:

- **Subject**: imperative, specific, about 50 characters, no full stop. "Fix double charge on payment timeout".
- **Body**: *why* the change was needed and any non-obvious consequences.
- **Links**: ticket or issue references (`Refs: SHOP-812`, `Fixes #231`).
- **Follow the team's format** (for example Conventional Commits, Chapter 59).

A quick self-test: would a teammate who has never seen this code understand, from the message alone, what changed and why, a year from now?

## Atomic commits and small changes

**One logical change per commit.** A refactor, then the fix that needed it; not both mixed together. Chapter 29 covered why: precise reviews, bisect, reverts, blame and cherry-picks all depend on it.

**Small changes overall.** The same logic applies at the PR level (Chapter 57): small PRs are reviewed faster and better, conflict less, and are cheaper to revert. Small doesn't mean trivial; it means *decomposed*.

Signs your change is too big:

- you can't write a one-line subject that covers it,
- the diff touches several unrelated areas,
- a reviewer would need to hold more than one idea in their head at once,
- you're tempted to write "and" in the PR title.

Techniques: refactor first, then change; land behind a feature flag; split by layer; extract shared utilities into their own PR.

## Branch naming

Good branch names tell teammates (and CI dashboards) what the branch is for at a glance. A widely used shape:

```text
<type>/<ticket>-<short-description>
```

| Example | Meaning |
|---|---|
| `feature/SHOP-231-password-reset` | New feature linked to a ticket |
| `fix/cart-rounding` | Bug fix |
| `hotfix/2.4.1-vat` | Urgent fix for a released version |
| `chore/upgrade-node-22` | Maintenance |
| `docs/setup-guide` | Documentation |
| `spike/graphql-client` | Throwaway experiment |
| `release/2.5` | Release branch (Chapter 49) |

Rules of thumb:

- lowercase, words separated by hyphens,
- short but specific: `fix/cart-rounding` rather than `fix/bug` or `priya-branch-2`,
- include the ticket ID if your team uses a tracker; many tools link automatically,
- avoid characters Git or shells dislike (spaces, `~`, `^`, `:`, `?`, `*`, `[`, `\`),
- remember a branch can't be both `feature` and a prefix `feature/…` (Chapter 25).

Follow your team's convention if it differs; consistency matters more than the exact format.

## Branch lifetime

- **Create from fresh main** (Chapter 27).
- **One branch per task**; don't reuse `feature/misc` for everything.
- **Short-lived**: days, not weeks. If it must live longer, integrate main often (Chapter 58).
- **Delete after merging**, locally and on the remote, with `fetch.prune` to keep the list tidy (Chapter 26).

## Common hygiene problems and fixes

| Problem | Fix |
|---|---|
| "WIP", "fix", "asdf" commits in a PR | `git rebase -i` to squash and reword before review |
| One commit mixing refactor, feature and formatting | Split with `git reset HEAD~` + `git add -p` (Chapter 38) |
| A formatting change touching 200 files mixed into a feature | Separate PR for formatting; add it to `.git-blame-ignore-revs` (Chapter 64) |
| Build broken in intermediate commits | `git rebase -i --exec "npm test" origin/main` to find and fix |
| Debug `console.log` committed | Amend (if last commit) or fixup commit + autosquash |

:::recap
### What you learned
- Before each commit: check status, review the staged diff, run relevant tests, write the message while viewing the diff.
- Keep secrets, generated files and large binaries out of history.
- Messages: imperative subject, a body explaining why, and links; follow team conventions.
- One logical change per commit; small, decomposed PRs.
- Branch names like `type/ticket-short-description`; short-lived branches from fresh main, deleted after merging.

### Key terms
```terms
Commit hygiene :: Habits that keep each commit focused, correct and understandable.
Atomic commit :: A commit containing one logical change.
Branch naming convention :: An agreed pattern for branch names, such as type/ticket-description.
Git LFS :: Git Large File Storage, an extension that stores large binary files outside the normal object database.
```

### Key commands
```commands
git diff --staged :: Review exactly what you're about to commit.
git add -p :: Stage selected hunks.
git commit -v :: Write the message while viewing the diff.
git rebase -i origin/main :: Tidy commits before review.
git switch -c <type>/<ticket>-<description> :: Start a well-named branch.
```

### Common mistakes
- Committing without reviewing the staged diff.
- Branch names like `test`, `fix`, `new-branch`.
- Giant "everything" commits and PRs.

### Quick quiz
```quiz
? Which branch name best follows common conventions?
+ fix/SHOP-412-cart-rounding
- Fix Cart Rounding
- priyas-branch
- bugfix
> Type prefix, ticket, lowercase, hyphenated description.

? What's the most useful single habit before every commit?
+ Reviewing git diff --staged
- Running git gc
- Pushing immediately
- Creating a tag
> It catches wrong files, debug code and secrets before they're recorded.

? [scenario] Your PR title needs the word "and" to describe it: "Add coupons and refactor pricing and upgrade lint". What's the best response?
+ Split it into separate PRs (or at least separate atomic commits)
- Shorten the title
- Squash into one commit
- Merge without review
> "and" is a sign the change contains several independent ideas.

? [tf] Keeping every commit buildable makes git bisect more effective.
+ True
- False
> Broken intermediate commits force skips and muddy results.
```

### Practical exercise
```exercise Audit your last branch
Take the last branch you worked on (or any recent PR in your team) and score it:
1. Are branch name and PR title clear?
2. Is every commit atomic, with an imperative subject and a why?
3. Does every commit build?
4. Any files that shouldn't be there?
Then write down one habit you'll change.
---solution---
Use `git log --oneline origin/main..<branch>` for commits, `git show --stat <hash>` per commit for content, and `git rebase -i --exec "<test command>" origin/main` (on a copy branch) to check buildability. The most common findings are vague subjects and mixed commits, both fixable with interactive rebase.
```

### What to learn next
Next: best practices around pull requests, code review and team conventions.
:::
