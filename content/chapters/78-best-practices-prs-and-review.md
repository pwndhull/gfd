---
id: best-practices-prs-and-review
part: 17
title: Best Practices for Pull Requests, Review and Team Conventions
minutes: 18
level: Professional
topics: PR hygiene | Code review | Team conventions
objectives:
- Prepare pull requests that are fast and pleasant to review
- Review others' work effectively and kindly
- Establish and document team Git conventions
- Keep the whole team's workflow consistent with automation
concepts: pull request | code review | CODEOWNERS | branching strategy | commit conventions
commands: gh pr create | gh pr checks | gh pr review
---
A team's Git workflow is only as good as its weakest habit. This chapter collects the practices that make pull requests flow, reviews useful, and conventions stick, so the whole team spends time on the product rather than on process.

## PR hygiene: the author's checklist

**Before opening:**

- [ ] Branch is up to date with `main` (merged or rebased, Chapter 58).
- [ ] Tests, lint and type checks pass locally.
- [ ] Commits are tidy (atomic, clear messages) or the team squash-merges.
- [ ] Diff contains only this change: no formatting sweeps, no stray files.
- [ ] Size is reviewable (a few hundred lines is a good ceiling); otherwise split.
- [ ] Self-reviewed in GitHub's **Files changed** view.

**The PR itself:**

- [ ] A title that works as a commit subject.
- [ ] A description: **what**, **why**, **how to test**, screenshots for UI, risks and rollout notes.
- [ ] Linked issue (`Closes #231`) and the right reviewers.
- [ ] Draft if it isn't ready; "Ready for review" when it is.

**During review:**

- [ ] Reply to every comment ("Done in 3c9e1a0", or a reasoned disagreement).
- [ ] Push fixes as new commits so reviewers can see what changed; squash later if needed.
- [ ] Re-request review when ready.
- [ ] If you rewrite history, use `--force-with-lease` and say so.

**After merging:**

- [ ] Delete the branch; update local `main`.
- [ ] Watch the deployment and error monitoring.
- [ ] Close the loop on the issue or ticket.

## Code review: the reviewer's checklist

From Chapter 52, condensed:

1. **Context first**: description, linked issue, CI status.
2. **Big picture**: is this the right change, in the right place, at the right size?
3. **Tests**: do they describe the behaviour and cover edge cases?
4. **Code**: correctness, clarity, security, performance, consistency with the codebase.
5. **Run it** when behaviour matters.
6. **Comment well**: specific, actionable, kind; label as blocking, suggestion, nit, question or praise.
7. **Decide**: approve (with optional nits), request changes (with clear reasons), or comment.

And the team-level norms that make review work:

- **Respond within one working day**, sooner for small PRs.
- **Automate style**: formatters and linters in CI and hooks, so humans never argue about spacing.
- **Two-minute call rule**: after a couple of back-and-forths on one thread, talk, then record the decision in the PR.
- **Approve with nits** when only optional items remain.
- **Review is shared learning**: newcomers should review too, not only be reviewed.

## Team conventions worth writing down

Every team makes these decisions, explicitly or by accident. Write them in `CONTRIBUTING.md` so newcomers don't have to guess:

| Decision | Examples |
|---|---|
| Branching strategy | Feature branches from `main`; or GitFlow with `develop` (Chapter 56) |
| Branch naming | `type/TICKET-description` (Chapter 77) |
| Commit message format | Conventional Commits, or free-form with ticket prefix (Chapter 59) |
| Pull integration | `pull.rebase true` for feature branches |
| Updating PRs from main | Merge or rebase? Force push allowed on own branches? |
| Merge method on GitHub | Squash, merge commit or rebase (Chapter 51) |
| Required reviews | 1 approval; 2 for payments/security; CODEOWNERS required |
| Required checks | Build, unit tests, lint, type check, security scan |
| Releases | Tag format, changelog, who releases, release branches (Chapter 49) |
| Hotfix process | Where fixes land first; cherry-pick with `-x` |
| Protected branches | `main`, `release/*`; no force pushes |

## Make the conventions automatic

Conventions that rely on memory drift. Encode them:

| Convention | Automate with |
|---|---|
| Protected main, reviews, checks | Rulesets / branch protection (Chapter 53) |
| Reviewers per area | `CODEOWNERS` (Chapter 53) |
| PR description structure | `.github/pull_request_template.md` |
| Issue quality | `.github/ISSUE_TEMPLATE/` forms |
| Commit or PR title format | commit-msg hook and/or a CI check on PR titles (Chapters 59, 68) |
| Formatting and lint | Pre-commit hooks for speed, CI for enforcement |
| Merge method | Repository settings: allow only the chosen method |
| Branch cleanup | "Automatically delete head branches" setting |
| Stale branches and PRs | Scheduled workflows or GitHub's built-in insights |

## A healthy team, in Git terms

You'll know the workflow is healthy when:

- `main` is green nearly all the time,
- most PRs are small and merged within a day or two,
- reviews are prompt and courteous,
- history is readable (`git log --first-parent main` reads like a changelog),
- nobody is afraid to ask "I think I broke something in Git, can you help?"

:::recap
### What you learned
- Authors: update from main, pass checks locally, tidy commits, keep PRs small, self-review, describe what/why/how to test, reply to every comment.
- Reviewers: context, big picture, tests, code, run it, comment specifically and kindly, decide clearly, respond within a day.
- Write team conventions down: strategy, naming, messages, pull style, merge method, reviews, checks, releases, hotfixes, protections.
- Automate conventions with rulesets, CODEOWNERS, templates, hooks, CI checks and repository settings.

### Key terms
```terms
PR hygiene :: Practices that make pull requests easy to review and merge.
CONTRIBUTING.md :: The file documenting how to contribute: conventions, process and setup.
PR template :: A file that pre-fills pull request descriptions.
```

### Key commands
```commands
gh pr create --draft :: Open a draft PR early.
gh pr checks :: Confirm CI before requesting review.
gh pr review --approve :: Approve.
gh pr merge --auto --squash --delete-branch :: Merge when ready and clean up.
```

### Common mistakes
- Undocumented conventions that newcomers learn only by being corrected.
- Relying on memory for rules that tools could enforce.
- Reviews that focus on style instead of behaviour.

### Quick quiz
```quiz
? What belongs in a PR description?
+ What changed, why, how to test it, and any risks
- The full diff pasted as text
- Only the ticket number
- The reviewer's name
> Reviewers need the context the diff can't provide.

? [scenario] Your team keeps arguing about formatting in reviews. Best fix?
+ Adopt an automatic formatter and enforce it in hooks and CI
- Require three reviewers
- Ban comments about code
- Squash every PR
> Tools settle style so reviewers focus on logic.

? Where should team Git conventions be documented?
+ CONTRIBUTING.md (plus templates and settings that enforce them)
- Only in a chat channel
- In each developer's head
- In .git/config
> Newcomers need a single, versioned place to read them.

? [tf] Newcomers should review PRs, not only receive reviews.
+ True
- False
> Reviewing is one of the fastest ways to learn a codebase.
```

### Practical exercise
```exercise Draft your team's CONTRIBUTING.md
Using the "Team conventions worth writing down" table, draft a one-page `CONTRIBUTING.md` for your team (or for a practice project). For each row, write your team's current answer, or "undecided". Share it with a teammate and compare answers.
---solution---
A good CONTRIBUTING.md is short and concrete, for example: "Branch from main as `type/TICKET-description`. Conventional Commits for PR titles (we squash-merge). Rebase your own branches on main; merge main into shared ones. One approval required; CODEOWNERS for payments. CI: build, test, lint must pass. Releases: annotated `vX.Y.Z` tags from main by the release captain." Undecided rows are the most valuable output: they're where the team's confusion lives.
```

### What to learn next
Next: safety practices: avoiding force pushes, using force-with-lease, keeping secrets out, and signing commits.
:::
