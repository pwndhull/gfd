---
id: pull-requests
part: 13
title: Pull Requests
minutes: 26
level: Intermediate
topics: 123 Pull requests
objectives:
- Explain what a pull request is in Git terms: a proposal to merge one branch into another
- Open a clear pull request with a useful description, reviewers and linked issues
- Update a pull request with new commits, and keep it up to date with main
- Check out someone else's pull request locally
- Understand draft PRs, auto-merge and the three merge methods
concepts: pull request | base branch | head branch | draft pull request | squash merge | merge commit | code review
commands: gh pr create | gh pr checkout | gh pr view | git fetch origin pull/<n>/head
---
A **pull request** (PR) is a proposal: "please merge my branch into that branch". Around that proposal, GitHub builds a page with the diff, discussion, reviews and automated checks. On most teams, **every** change to `main` arrives through a PR.

```diagram pr-workflow
```

## A PR in Git terms

Every PR has two branches:

- **base**: where the changes should go (usually `main`),
- **compare** (also called **head**): the branch with your changes (`feature/password-reset`).

The PR shows `git diff base...compare`, the three-dot diff from Chapter 31: only the changes your branch introduced since it split from `main`. As you push more commits to your branch, the PR updates automatically. When merged, GitHub performs the merge you'd otherwise do with `git merge`.

## Opening a pull request

Push your branch, then either click the **Compare & pull request** banner GitHub shows, follow the link printed in your push output, or use the CLI:

```bash
$ git push -u origin feature/password-reset
$ gh pr create --base main --title "Add password reset flow" --body-file pr.md --reviewer @acme/auth
```

### Title

Write it like a good commit subject (Chapter 29): imperative, specific, short. With squash merging it often **becomes** the commit subject on `main`.

- Weak: `Updates`, `Fix bug`, `Sprint 14 work`
- Strong: `Add password reset flow`, `Fix double charge on payment timeout`

### Description

Reviewers need context the diff can't give. A reliable structure:

```markdown
## What
Adds a "Forgot password?" flow: request form, emailed one-time link, reset form.

## Why
Support gets ~40 reset requests a week (SHOP-231). This removes the manual step.

## How
- Tokens are random 32-byte values, stored hashed, valid for 30 minutes.
- Email sending reuses the existing mailer queue.

## Testing
- Unit tests for token generation and expiry.
- Manually tested with an expired token and a reused token.

## Screenshots
(before/after of the login page)

Closes #231
```

Many repositories include a template in `.github/pull_request_template.md` that pre-fills this.

`Closes #231` (or `Fixes`, `Resolves`) links the PR to issue 231 and closes it automatically when the PR is merged into the default branch (Chapter 54).

### Reviewers, assignees and labels

- **Reviewers**: who should review. `CODEOWNERS` may add some automatically (Chapter 53).
- **Assignees**: who's responsible for the PR (usually you).
- **Labels**: categories such as `bug`, `needs-design`, `breaking-change`.

## Draft pull requests

Open a PR as a **draft** when the work isn't ready for review but you want CI to run, or early feedback on direction. Drafts can't be merged. Click **Ready for review** when done.

```bash
$ gh pr create --draft
$ gh pr ready                      # mark ready later
```

## The PR page

| Tab | Shows |
|---|---|
| **Conversation** | Description, comments, review summaries, check status, merge box |
| **Commits** | The branch's commits |
| **Checks** | CI results (Chapter 55) |
| **Files changed** | The diff, where reviewers leave line comments |

Before requesting review, **review your own PR in the Files changed tab**. You'll catch debug code, commented-out blocks and unintended files faster than anyone.

## Updating a PR

Respond to feedback by committing to the same branch and pushing:

```bash
$ git commit -am "Expire reset tokens after 30 minutes"
$ git push
```

Everyone sees the new commits. If you rewrote the branch (amend, interactive rebase), push with `--force-with-lease`, and mention it in a comment so reviewers know the earlier review state changed.

### Keeping the PR up to date with main

If `main` moves on, your PR may show "This branch is out-of-date with the base branch" or merge conflicts. Update it:

```bash
$ git fetch
$ git merge origin/main              # or: git rebase origin/main, then push --force-with-lease
$ git push
```

GitHub also offers an **Update branch** button (merge or rebase, depending on settings), and a web editor for simple conflicts. For anything non-trivial, resolve locally where you can run the tests.

## Checking out someone else's PR

Reviewing properly often means running the code:

```bash
$ gh pr checkout 342
```

Without `gh`, fetch GitHub's special ref for the PR:

```bash
$ git fetch origin pull/342/head:pr-342
$ git switch pr-342
```

`pull/<number>/head` is a read-only ref GitHub maintains for every PR, including PRs from forks.

## Merging

When the PR is approved and checks pass, it's merged with one of the three methods your repository allows (Chapter 33):

| Method | Result on main | Good for |
|---|---|---|
| **Create a merge commit** | All branch commits + a merge commit | Teams wanting full history and PR boundaries |
| **Squash and merge** | One commit containing the whole PR | Teams wanting one commit per PR; messy branch history doesn't matter |
| **Rebase and merge** | All branch commits, replayed linearly, no merge commit | Teams wanting linear history with meaningful individual commits |

**Auto-merge** lets you tell GitHub "merge this as soon as approvals and checks are satisfied". Some teams use a **merge queue**, which tests each PR combined with the ones ahead of it before merging, so `main` never breaks from two PRs that were fine individually.

After merging, delete the branch (GitHub can do this automatically) and clean up locally (Chapter 27).

## What makes a PR easy to review

- **Small.** Aim for a few hundred changed lines at most. Large features can be split into a stack of PRs.
- **One purpose.** Don't mix a refactor with a feature; separate PRs, or at least separate commits.
- **Self-reviewed**, with tests passing before you ask for review.
- **Explained.** The description answers what, why, and how to test.
- **Responsive.** Reply to every comment, even with "Done".

:::recap
### What you learned
- A PR proposes merging a compare (head) branch into a base branch; it shows the three-dot diff and updates as you push.
- Write a specific title and a description covering what, why, how and testing; link issues with `Closes #n`.
- Drafts signal work in progress; self-review before requesting review.
- Update PRs by pushing; keep them current with merge or rebase from `main`.
- `gh pr checkout` or `git fetch origin pull/<n>/head:<branch>` checks out a PR locally.
- Merge methods: merge commit, squash, rebase; auto-merge and merge queues automate merging.

### Key terms
```terms
Pull request :: A GitHub proposal to merge one branch into another, with review and checks.
Base branch :: The branch a PR will merge into.
Head / compare branch :: The branch containing the proposed changes.
Draft pull request :: A PR marked as not ready for review.
Auto-merge :: Automatically merging a PR once its requirements are met.
Merge queue :: A queue that tests PRs together before merging them into main.
```

### Key commands
```commands
gh pr create :: Open a PR for the current branch.
gh pr create --draft :: Open a draft PR.
gh pr checkout <n> :: Check out a PR locally.
git fetch origin pull/<n>/head:<branch> :: Fetch a PR without gh.
gh pr view --web :: Open the PR in the browser.
gh pr merge --auto --squash :: Enable auto-merge with squash.
```

### Common mistakes
- Opening a new PR for every round of feedback instead of pushing to the same branch.
- Huge PRs that mix several concerns.
- Empty descriptions ("see ticket").
- Force-pushing a rewritten PR without telling reviewers.

### Quick quiz
```quiz
? What does a pull request's "Files changed" tab show?
+ The changes the head branch introduces since it diverged from the base branch
- Every difference between the two branch tips
- All files in the repository
- Only files you manually selected
> It's the three-dot diff: only your branch's changes.

? [scenario] A reviewer requests changes. How do you update your PR?
+ Commit the changes to the same branch and push
- Close the PR and open a new one
- Edit the files on main directly
- Create a new branch for each comment
> The PR tracks the branch, so pushes update it automatically.

? [tf] "Closes #231" in a PR description closes issue 231 as soon as the PR is opened.
- True
+ False
> The issue closes when the PR is merged into the default branch.

? Which merge method results in exactly one new commit on main per PR?
- Create a merge commit
+ Squash and merge
- Rebase and merge
- Auto-merge
> Squash combines all of the PR's changes into one commit.

? [predict] What does this do?
| $ git fetch origin pull/342/head:pr-342
+ Downloads PR #342's commits into a local branch called pr-342
- Merges PR #342 into main
- Pushes your branch as PR #342
- Deletes PR #342
> GitHub exposes each PR's head as a fetchable ref.
```

### Practical exercise
```exercise Open a real pull request
In a repository you can push to (your own test repository is fine):
1. Create `feature/readme-setup`, add a "Setup" section to the README, commit and push.
2. Open a draft PR with a description using the What / Why / How / Testing structure.
3. Push one more commit and watch the PR update.
4. Mark it ready, then merge it with the method your repository allows, and delete the branch.
---solution---
Using gh: `gh pr create --draft --fill` creates the draft from your commit messages; `gh pr ready` marks it ready; `gh pr merge --squash --delete-branch` merges and deletes the remote branch. Locally, finish with `git switch main && git pull && git branch -d feature/readme-setup` (or `-D` after a squash merge).
```

### What to learn next
A PR is only as good as its review. Next: giving and receiving code review on GitHub.
:::
