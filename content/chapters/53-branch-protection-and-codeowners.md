---
id: branch-protection-and-codeowners
part: 13
title: Branch Protection and CODEOWNERS
minutes: 20
level: Professional
topics: 126 Branch protection | 127 CODEOWNERS
objectives:
- Explain what branch protection and rulesets enforce and why teams use them
- Recognise the common rules and the errors you'll see when you hit them
- Write a CODEOWNERS file and predict who gets requested for review
- Work productively within protected branches
concepts: protected branch | ruleset | required status check | CODEOWNERS | code review | merge queue
commands: git push | gh pr create
---
On a professional team, nobody pushes straight to `main`, not even the lead. That isn't distrust; it's a system that guarantees every change is reviewed and tested before it reaches the branch everyone depends on. GitHub enforces it with **branch protection** (and its newer, more flexible form, **rulesets**), and routes reviews with **CODEOWNERS**.

## What branch protection does

Protection rules attach to a branch name or pattern (such as `main` or `release/*`) and restrict what can happen to it. Admins configure them under **Settings → Rules → Rulesets** (or the classic **Branches → Branch protection rules**).

| Rule | Effect |
|---|---|
| **Require a pull request before merging** | No direct pushes; all changes arrive via PR |
| **Required approvals** (e.g. 1 or 2) | That many approving reviews needed |
| **Dismiss stale approvals when new commits are pushed** | Approvals reset if the code changes after review |
| **Require review from Code Owners** | An owner of the changed files must approve (see below) |
| **Require status checks to pass** | Named CI jobs (tests, lint, build) must be green |
| **Require branches to be up to date before merging** | The PR must include the latest `main` so checks ran on the combined code |
| **Require conversation resolution** | All review threads must be resolved |
| **Require signed commits** | Commits must carry verified signatures |
| **Require linear history** | No merge commits; only squash or rebase merges |
| **Require a merge queue** | Merges go through a queue that tests PRs together |
| **Block force pushes** | Nobody can rewrite the branch's history |
| **Restrict deletions** | The branch can't be deleted |

**Rulesets** apply the same kinds of rules but can target many branches and tags at once, stack with each other, and be shared across an organisation. Tag rulesets can, for example, stop anyone from moving or deleting `v*` tags.

## What it feels like as a developer

When you run into a rule, the error comes from the server during `push` or in the PR's merge box:

```bash
$ git push origin main
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: error: Changes must be made through a pull request.
To github.com:acme/shop.git
 ! [remote rejected] main -> main (protected branch hook declined)
error: failed to push some refs to 'github.com:acme/shop.git'
```

The fix is always the workflow you already know: push a branch, open a PR.

```bash
$ git switch -c fix/header-height
$ git push -u origin fix/header-height
$ gh pr create --fill
```

In the PR, the merge box lists anything still missing: "Review required", "Some checks haven't completed yet", "This branch is out-of-date with the base branch". Each has a clear action: request a review, wait for or fix CI, click **Update branch** (or merge/rebase `main` yourself).

:::tip Force pushes are blocked on main, allowed on your branches
Protection typically blocks force pushes to `main` and release branches, while your own feature branches stay unprotected so you can rebase and `--force-with-lease` them freely (Chapter 37).
:::

## CODEOWNERS

A `CODEOWNERS` file maps paths in the repository to the people or teams responsible for them. When a PR changes those paths, GitHub **automatically requests review** from the owners, and, if the "require review from Code Owners" rule is on, **their approval is required**.

Put it in `.github/CODEOWNERS` (or the repository root, or `docs/`):

```text title=".github/CODEOWNERS"
# Default owners for everything
*                       @acme/web-platform

# Frontend
/src/ui/                @acme/frontend
*.css                   @acme/design-systems

# Payments: two teams must be involved
/src/payments/          @acme/payments @acme/security

# Infrastructure and CI config
/.github/workflows/     @acme/devops
/terraform/             @acme/devops

# A single file with an individual owner
/src/config/flags.ts    @priya-sharma
```

Rules of the syntax:

- Patterns work like `.gitignore` patterns (Chapter 16).
- Owners are `@username`, `@org/team-name` or email addresses of users.
- **The last matching pattern wins.** A change to `/src/payments/api.ts` matches `*` and `/src/payments/`; the later line applies, so payments and security are requested, not web-platform.
- Owners must have write access to the repository.
- Put broad rules at the top and specific ones below them.

```bash
$ gh pr view 342 --json reviewRequests
```

shows who has been requested, including code owners.

:::note CODEOWNERS is itself code
Changes to `CODEOWNERS` go through PRs like everything else, and it's common to make a platform or lead team the owner of the file itself.
:::

## Why teams accept the friction

- `main` is always releasable, so deploys and new branches start from a known-good state.
- Every change has at least one other pair of eyes.
- Nobody can accidentally force-push away a week of the team's work.
- Reviews reach the people who know each area.
- Audit and compliance requirements are met by construction.

The cost is a few minutes per change, and it disappears once the PR workflow is a habit.

:::recap
### What you learned
- Branch protection and rulesets enforce rules on important branches: PRs required, approvals, passing checks, up-to-date branches, resolved conversations, no force pushes.
- Pushing to a protected branch is rejected with GH006; use a branch and a PR.
- The PR merge box lists what's still required.
- `CODEOWNERS` maps paths to owners who are auto-requested and optionally required; the last matching pattern wins.

### Key terms
```terms
Protected branch :: A branch with server-enforced rules about how it can change.
Ruleset :: A flexible set of GitHub rules targeting branches or tags.
Required status check :: A CI job that must pass before merging.
CODEOWNERS :: A file assigning owners to paths for automatic review requests.
Stale approval :: An approval given before newer commits were pushed.
```

### Key commands
```commands
git switch -c <branch> && git push -u origin <branch> :: The way around "protected branch" errors.
gh pr create --fill :: Open a PR from your commits.
gh pr checks :: See required checks for the current PR.
gh pr view --json reviewRequests :: See who has been asked to review.
```

### Common mistakes
- Trying to push to `main` and assuming something is broken.
- Asking an admin to "just disable protection" for a quick fix.
- Putting specific CODEOWNERS patterns above broad ones, so the broad one wins.

### Quick quiz
```quiz
? [predict] What does this push error mean?
| remote: error: GH006: Protected branch update failed for refs/heads/main.
| remote: error: Changes must be made through a pull request.
+ main is protected; push a branch and open a pull request instead
- Your credentials are wrong
- The remote repository is corrupt
- You need to fetch first
> Protection rules reject direct pushes. The PR workflow is the intended path.

? [state] CODEOWNERS contains "* @acme/web" on line 1 and "/docs/ @acme/writers" on line 2. A PR changes docs/intro.md. Who is requested?
+ @acme/writers
- @acme/web
- Both teams
- Nobody
> The last matching pattern takes precedence.

? What does "Require branches to be up to date before merging" ensure?
+ Checks ran on code that includes the latest base branch
- Every commit is signed
- The PR has at least two approvals
- Nobody can delete the branch
> Otherwise two individually green PRs could combine into a broken main.

? [tf] Branch protection on main usually prevents you from force-pushing your own feature branches too.
- True
+ False
> Rules target specific branch names or patterns; feature branches are typically unprotected.
```

### Practical exercise
````exercise Protect your practice repository
On a GitHub repository you own:
1. Add a ruleset (or branch protection rule) on `main`: require a pull request with one approval (if you're alone, allow zero or use a second account), block force pushes, and require conversation resolution.
2. Try `git push origin main` with a new commit and read the error.
3. Add `.github/CODEOWNERS` making yourself the owner of `*`, via a pull request.
---solution---
The direct push fails with a GH006 or ruleset violation message. Then:
```bash
$ git switch -c chore/codeowners
$ mkdir -p .github && echo "* @your-username" > .github/CODEOWNERS
$ git add .github/CODEOWNERS && git commit -m "Add CODEOWNERS"
$ git push -u origin chore/codeowners && gh pr create --fill
```
On subsequent PRs, you're automatically requested as a reviewer (GitHub won't request you on your own PRs, since authors can't review their own changes).
````

### What to learn next
Next: issues for planning and tracking work, and how GitHub Releases fit into the repository's workflow.
:::
