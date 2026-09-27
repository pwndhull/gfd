---
id: pr-and-review-workflow
part: 14
title: The Pull Request and Review Workflow
minutes: 20
level: Professional
topics: 134 Pull request workflow | 135 Code review workflow
objectives:
- Run a pull request from first push to merge with minimal waiting and rework
- Size and slice work into reviewable pull requests, including stacked PRs
- Understand a team's review workflow: who reviews, how fast, and what "done" means
- Handle the PR lifecycle states: draft, review, changes requested, approved, merged
concepts: pull request | code review | draft pull request | stacked pull requests | CI | squash merge
commands: gh pr create | gh pr checks | gh pr merge --auto | git rebase --onto
---
Chapters 51 and 52 covered pull requests and reviews as GitHub features. This chapter treats them as a **team process**: how work flows from "I've started" to "it's in production" without long waits, surprises or rework.

## The lifecycle of a pull request

```text
 draft ──► ready for review ──► changes requested ──► (updated) ──► approved ──► checks green ──► merged ──► branch deleted
                   ▲                     │
                   └─────────────────────┘
```

| State | Author does | Reviewer does |
|---|---|---|
| **Draft** | Pushes early, lets CI run, may ask for direction | Optional early feedback on approach |
| **Ready for review** | Self-reviews, fills the description, requests reviewers | Picks it up promptly |
| **Changes requested** | Replies to each comment, pushes fixes, re-requests review | Waits, then re-reviews only what changed |
| **Approved** | Makes sure checks pass and the branch is current | — |
| **Merged** | Deletes branch, closes the loop on the issue, watches deployment | — |

## Before you open it: a checklist

```bash
$ git fetch && git rebase origin/main       # or merge; start review from current main
$ npm run lint && npm test                  # whatever CI runs, run it locally
$ git log --oneline origin/main..           # is the commit story clean? (Chapter 38)
$ git diff --stat origin/main...            # is the size reasonable?
```

Then self-review in GitHub's Files changed view, and write the description (What / Why / How / Testing, Chapter 51).

## Sizing: the biggest lever you have

Review quality drops sharply as PR size grows: a 100-line PR gets careful attention; a 2,000-line PR gets "LGTM". Small PRs are reviewed faster, merged sooner, conflict less and are easier to revert.

Ways to slice a large change:

| Technique | Example |
|---|---|
| **Refactor first** | PR 1 extracts `PaymentGateway` with no behaviour change; PR 2 adds the new provider |
| **Layer by layer** | PR 1 database migration; PR 2 API; PR 3 UI |
| **Behind a flag** | Merge the new checkout in pieces, disabled, then enable (Chapter 56) |
| **Tests first** | PR 1 adds characterisation tests for legacy code; PR 2 changes it safely |
| **Stacked PRs** | Several PRs where each builds on the previous one's branch |

### Stacked pull requests

When PR 2 depends on PR 1 that's still in review, branch from PR 1's branch and open PR 2 with **PR 1's branch as its base**:

```graph Stacked PRs
o---o   main
     \
      A---B   feature/api     (PR 1: base main)
           \
            C---D   feature/ui   (PR 2: base feature/api)
```

PR 2 then shows only C and D. When PR 1 merges, GitHub retargets PR 2 to `main` automatically if PR 1's branch is deleted. If PR 1 was **squash-merged**, rebase PR 2's own commits onto the new `main` so A and B don't reappear:

```bash
$ git fetch
$ git rebase --onto origin/main feature/api feature/ui     # replay only C and D (Chapter 36)
$ git push --force-with-lease
```

Recent Git also offers `git rebase --update-refs`, which moves every branch in a stack in one rebase.

## The team's review workflow

Teams agree on a few rules, often in CONTRIBUTING.md:

- **Who reviews?** CODEOWNERS for the touched area, plus anyone the author requests. Some teams require two approvals for sensitive code.
- **How fast?** A common norm: first response within one working day; small PRs same day.
- **What blocks merging?** Required approvals, green checks, resolved conversations, up-to-date branch (Chapter 53).
- **Who merges?** Usually the **author**, after approval, so they can watch the deployment.
- **Merge method?** Squash, merge commit or rebase: set in repository settings.
- **What about nits after approval?** Approve with nits; the author addresses or consciously skips them.

### Keeping reviews moving

- **Reviewers**: batch review time into your day (e.g. after stand-up and after lunch) so nobody waits long.
- **Authors**: while waiting, start the next small PR, or review someone else's.
- **Both**: when a thread passes three back-and-forths, switch to a quick call and summarise the decision in the PR.
- Use **auto-merge** (`gh pr merge --auto --squash`) so an approved PR merges the moment checks pass.

## After merging

"Merged" is not "done":

1. Delete the branch (remote and local).
2. Confirm the linked issue closed.
3. Watch the deployment and error monitoring if your team deploys on merge.
4. If something goes wrong, **revert** the merge commit or the squashed commit (Chapter 42) rather than rushing a fix under pressure.

:::recap
### What you learned
- A PR moves through draft, ready, changes requested, approved and merged; each state has clear author and reviewer actions.
- Before opening: update from main, run CI's checks locally, tidy commits, check size, self-review.
- Small PRs are the biggest lever: slice by refactor-first, layers, flags, tests-first or stacking.
- Stacked PRs use the previous PR's branch as base; after a squash merge, rebase the rest with `--onto`.
- Teams agree on reviewers, response times, merge requirements, who merges and how.
- After merge: clean up, check the issue, watch the deploy, revert rather than panic.

### Key terms
```terms
PR lifecycle :: The states a pull request passes through from draft to merged.
Stacked pull requests :: A chain of PRs where each is based on the previous one's branch.
Self-review :: Reviewing your own diff before asking others.
Auto-merge :: Merging automatically once approvals and checks pass.
```

### Key commands
```commands
git diff --stat origin/main... :: Size of your change before opening a PR.
gh pr create --base <branch> :: Open a PR against a specific base (for stacking).
gh pr checks :: Check CI status.
gh pr merge --auto --squash :: Merge when requirements are met.
git rebase --onto origin/main <old-base> <branch> :: Restack after the base PR merges.
```

### Common mistakes
- One giant PR per feature.
- Opening a PR before running tests locally.
- Stacking PRs and then merging the top one into its base branch instead of into main.
- Leaving approved PRs unmerged for days, then fighting conflicts.

### Quick quiz
```quiz
? [scenario] Your feature will be about 1,800 changed lines. What's the best approach?
+ Split it into several smaller PRs, e.g. refactor first, then layers or flagged pieces
- Open one PR and ask reviewers to be thorough
- Push directly to main to avoid review delays
- Squash it into one commit so it looks smaller
> Smaller PRs get better reviews, merge faster and conflict less.

? In a stack, PR 2 is based on PR 1's branch. What does PR 2's diff show?
+ Only PR 2's own commits
- PR 1 and PR 2's commits
- Everything since the repository started
- Nothing until PR 1 merges
> The diff is relative to its base branch, which is PR 1's branch.

? [tf] On most teams, the PR author merges their own PR after it's approved and checks pass.
+ True
- False
> The author is best placed to watch the deployment and follow up.

? PR 1 was squash-merged. PR 2 (stacked on it) now shows PR 1's old commits again. Why?
+ The squash created a new commit on main, so PR 1's original commits look unmerged; rebase PR 2's own commits onto main with --onto
- GitHub has a bug
- PR 2 must be closed and recreated
- You need to revert PR 1
> The original commits aren't in main's history; only their squashed copy is.
```

### Practical exercise
````exercise Stack two PRs
In a practice GitHub repository:
1. Create `feature/api` from main with one commit; push and open PR 1 against main.
2. Create `feature/ui` from `feature/api` with one commit; push and open PR 2 with base `feature/api`.
3. Squash-merge PR 1 and delete its branch. Observe PR 2's base and commits.
4. Restack PR 2 onto main and push.
---solution---
```bash
$ git switch -c feature/api main && echo api > api.txt && git add . && git commit -m "Add API" && git push -u origin feature/api
$ gh pr create --base main --fill
$ git switch -c feature/ui && echo ui > ui.txt && git add . && git commit -m "Add UI" && git push -u origin feature/ui
$ gh pr create --base feature/api --fill
# squash-merge PR 1 on GitHub and delete feature/api
$ git fetch --prune
$ git rebase --onto origin/main feature/api feature/ui     # your local feature/api still marks the old base
$ git push --force-with-lease
```
GitHub retargets PR 2 to main when feature/api is deleted; after the rebase it shows only "Add UI".
````

### What to learn next
Long reviews and long-lived branches share one enemy: drift from main. Next: keeping branches up to date, and handling branches that must live a long time.
:::
