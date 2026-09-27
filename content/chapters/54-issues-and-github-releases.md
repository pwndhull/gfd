---
id: issues-and-github-releases
part: 13
title: Issues, Projects and Releases on GitHub
minutes: 18
level: Intermediate
topics: 128 Issues | 129 Releases
objectives:
- Write a useful issue: bug report, feature request or task
- Organise issues with labels, assignees, milestones and project boards
- Link commits and pull requests to issues so they close automatically
- Connect GitHub Releases to your tagging workflow
concepts: issue | label | milestone | GitHub release | pull request | tag
commands: gh issue create | gh issue list | gh issue develop | gh release create | gh release list
---
Code lives in branches and pull requests. The work around the code (bugs, requests, plans and decisions) lives in **issues**. On many teams, a feature's life starts as an issue and ends as a release note, and GitHub links the pieces together if you use a few conventions.

## Issues

An **issue** is a numbered discussion thread with a title, a description, labels, assignees and a status (open or closed). Issues and pull requests share one numbering sequence per repository: `#231` might be either.

### Writing a good bug report

```markdown
### What happened
Checkout total shows £10.300000001 for a £10.30 item.

### Expected
£10.30

### Steps to reproduce
1. Add "Blue mug" (£10.30) to the cart
2. Go to checkout

### Environment
Production, Chrome 131, macOS. Started after v2.4.0 (worked in 2.3.2).

### Notes
Possibly floating-point maths in totals.js.
```

A report like this can be fixed without a single follow-up question. Many repositories provide **issue templates** (in `.github/ISSUE_TEMPLATE/`) that prompt for exactly these fields.

### Feature requests and tasks

Describe the **problem** before the solution: "Customers can't reset their own passwords, so support handles ~40 requests a week", then the proposed approach and acceptance criteria. Large work can be broken into **sub-issues** or a checklist.

### Organising issues

| Tool | Use it for |
|---|---|
| **Labels** | Type and area: `bug`, `enhancement`, `payments`, `good first issue` |
| **Assignees** | Who's working on it |
| **Milestones** | Grouping by release or deadline: `v2.5.0`, `Q2 launch` |
| **Projects** | Boards and tables across issues and PRs: columns like Todo / In progress / In review / Done |
| **Mentions** | `@priya-sharma` or `@acme/payments` to notify people |
| **Cross-references** | Typing `#231` links to that issue or PR; `acme/api#12` links across repositories |

```bash
$ gh issue create --title "Checkout total has rounding error" --label bug --body-file bug.md
$ gh issue list --label bug --assignee @me
$ gh issue view 231 --web
```

## Linking issues, commits and pull requests

GitHub connects work automatically when you use **closing keywords** in a pull request description (or in commit messages that reach the default branch):

| Keyword forms | Example |
|---|---|
| close, closes, closed | `Closes #231` |
| fix, fixes, fixed | `Fixes #231` |
| resolve, resolves, resolved | `Resolves acme/web#88` |

When the PR is **merged into the default branch**, the linked issues close automatically and the issue page shows which PR resolved it. A plain mention like "Related to #231" links without closing.

Some teams also put issue or ticket IDs in branch names (`fix/231-checkout-rounding`) and commit messages. External trackers like Jira use keys such as `SHOP-231` and integrate in similar ways.

:::tip Start a branch from an issue
The **Create a branch** link on an issue (or `gh issue develop 231 --checkout`) creates a branch linked to the issue and checks it out, so the PR you open from it is linked automatically.
:::

## Releases on GitHub

Chapter 49 covered releasing: SemVer, tagging and publishing. On the GitHub side:

- **Releases page**: each release is attached to a tag, with notes and optional assets. The latest appears in the repository sidebar.
- **Generated release notes** list merged PRs and new contributors since the previous release; label-based categories can be configured in `.github/release.yml`.
- **Milestones** often match releases: close the `v2.5.0` milestone when the release ships.
- **Draft releases** let you prepare notes before tagging; **pre-releases** flag betas and release candidates.

```bash
$ gh release list
$ gh release view v2.5.0
$ gh release create v2.5.0 --generate-notes --notes-start-tag v2.4.0
$ gh release download v2.5.0 --pattern "*.zip"
```

The connecting thread: an **issue** describes the need → a **branch** implements it → a **PR** closes the issue → merges to `main` → a **tag** marks the release → the **GitHub Release** lists the PR in its notes.

:::recap
### What you learned
- Issues track bugs, features and tasks; good ones describe the problem, expected behaviour and reproduction steps.
- Labels, assignees, milestones, projects and mentions organise work; `#n` cross-links.
- Closing keywords (`Closes #n`, `Fixes #n`, `Resolves #n`) in a PR close the issue when merged into the default branch.
- `gh issue develop` creates a branch linked to an issue.
- GitHub Releases attach notes and assets to tags and can generate notes from merged PRs.

### Key terms
```terms
Issue :: A tracked bug report, request or task on GitHub.
Label :: A category tag on issues and PRs.
Milestone :: A group of issues and PRs targeting a release or date.
Closing keyword :: A word like "Fixes" followed by an issue reference that closes the issue on merge.
Generated release notes :: GitHub's automatic summary of merged PRs between releases.
```

### Key commands
```commands
gh issue create :: Create an issue.
gh issue list --assignee @me :: Your open issues.
gh issue develop <n> --checkout :: Create and check out a branch linked to an issue.
gh release create <tag> --generate-notes :: Publish a release with generated notes.
gh release list :: List releases.
```

### Common mistakes
- Bug reports without reproduction steps or expected behaviour.
- Writing "Closes #231" in a PR targeting a non-default branch and wondering why the issue stays open.
- Discussing requirements only in chat, leaving no record on the issue.

### Quick quiz
```quiz
? [scenario] Your PR description says "Fixes #231". When does issue 231 close?
+ When the PR is merged into the default branch
- When the PR is opened
- When a reviewer approves
- Never; you must close it manually
> Closing keywords take effect on merge into the default branch.

? What makes a bug report most useful?
+ What happened, what was expected, steps to reproduce and the environment
- A title only
- A screenshot with no text
- The word "urgent"
> A developer should be able to reproduce the bug without asking questions.

? [tf] Issues and pull requests share the same number sequence within a repository.
+ True
- False
> That's why #231 can refer to either.

? Which links a PR to an issue WITHOUT closing it on merge?
+ "Related to #231"
- "Closes #231"
- "Fixes #231"
- "Resolves #231"
> Only closing keywords trigger automatic closure.
```

### Practical exercise
````exercise From issue to release
In a practice GitHub repository:
1. Create an issue "Add a CONTRIBUTING guide" with a short problem statement.
2. Use `gh issue develop <n> --checkout` (or create a branch manually), add `CONTRIBUTING.md`, push, and open a PR containing "Closes #<n>".
3. Merge it and confirm the issue closed.
4. Tag and publish a release with generated notes and check that your PR appears.
---solution---
```text
gh issue create --title "Add a CONTRIBUTING guide" --body "New contributors don't know our branch and PR conventions."
gh issue develop 1 --checkout
(write CONTRIBUTING.md, commit, push)
gh pr create --fill --body "Closes #1"
gh pr merge --squash --delete-branch
gh issue view 1        # State: CLOSED, closed by the PR
git switch main && git pull
git tag -a v0.3.0 -m "Release 0.3.0" && git push --follow-tags
gh release create v0.3.0 --generate-notes
```
````

### What to learn next
The last chapter of Part 13 introduces GitHub Actions: the automation that runs your tests and powers required checks.
:::
