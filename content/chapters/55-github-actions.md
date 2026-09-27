---
id: github-actions
part: 13
title: GitHub Actions: An Introduction
minutes: 24
level: Intermediate
topics: 130 GitHub Actions introduction
objectives:
- Explain what GitHub Actions is and how workflows connect to Git events
- Read and write a basic CI workflow that tests every pull request
- Understand triggers, jobs, steps, runners, actions and secrets
- Connect workflow results to required status checks
- Diagnose a failing check from its logs
concepts: GitHub Actions | workflow | job | step | runner | status check | secret | CI
commands: gh run list | gh run view | gh run watch | gh workflow run
---
Every time you push or open a pull request, something can happen automatically: tests run, code is linted, a preview deploys. On GitHub, that automation is **GitHub Actions**. You don't need to become a CI expert as a new developer, but you do need to read a workflow file, understand why a check failed, and fix it.

## The idea

**A workflow is a YAML file in `.github/workflows/` that says: when *this* happens in the repository, run *these* jobs.**

- The **trigger** (`on:`) is a Git or GitHub event: a push, a pull request, a tag, a schedule, or a manual button.
- A **job** runs on a fresh virtual machine called a **runner** (Linux, Windows or macOS).
- Each job has **steps**: shell commands, or reusable **actions** published by others.
- Results show up as **checks** on commits and pull requests, which branch protection can require (Chapter 53).

Because workflows are files in the repository, they're versioned, reviewed in PRs and branch-specific like everything else.

## A first CI workflow

```yaml title=".github/workflows/ci.yml" lines
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test
```

Line by line:

| Lines | Meaning |
|---|---|
| `name: CI` | Display name in the Actions tab |
| `on: pull_request` | Run for every PR (on each push to the PR's branch) |
| `on: push: branches: [main]` | Also run when commits land on `main` |
| `jobs: test:` | One job, with the ID `test` |
| `runs-on: ubuntu-latest` | Use GitHub's hosted Linux runner |
| `uses: actions/checkout@v4` | An action that clones your repository at the commit being tested |
| `uses: actions/setup-node@v4` | An action that installs Node.js (with dependency caching) |
| `run: npm ci` | A shell command: install exact dependencies from the lock file |
| `run: npm run lint`, `npm test` | Lint and test; a non-zero exit code fails the step and the job |

`@v4` pins an action to a major version. Check each action's page for its current major version when you write new workflows; teams with strict security requirements pin to a full commit hash instead.

:::internals Which commit does a PR check test?
For `pull_request` events, `actions/checkout` checks out a temporary **merge commit** of your branch into the base branch, so tests run on "what main would look like after merging". That's why a PR can fail even though your branch alone passes: something on `main` conflicts logically with your change.
:::

## Seeing results

On a PR, the checks appear near the merge box:

- a green tick with **All checks have passed**,
- a red cross with **Some checks were not successful**: click **Details** next to the failed check to open its log,
- a yellow dot while checks are still running.

From the terminal:

```bash
$ gh pr checks                 # status of checks on the current branch's PR
$ gh run list --limit 5        # recent workflow runs
$ gh run view --log-failed     # logs of the failed steps of the latest run
$ gh run watch                 # follow a run live
```

### Reading a failure

Open the failing job, expand the red step, and read from the **first** error, not the last line. Common causes:

| Symptom in the log | Likely cause | Fix |
|---|---|---|
| Test assertion failed | A real bug, or a test that needs updating | Reproduce locally with the same command |
| Lint errors | Formatting or style rule | Run the linter/formatter locally and commit |
| `npm ci` lock file mismatch | `package.json` changed without updating the lock file | Run `npm install` locally and commit the lock file |
| Passes locally, fails in CI | Different Node version, missing env var, timezone, or the merge commit includes new `main` changes | Match versions; merge `main` locally and re-run |
| "Resource not accessible" / auth errors | Missing permissions or secrets (often on PRs from forks) | Ask a maintainer; forks don't get secrets by default |

Then push a fix to the same branch. The checks run again automatically. Maintainers can also **Re-run jobs** for flaky failures.

## Other triggers you'll see

```yaml
on:
  push:
    tags: ['v*']          # releases: build and publish when a version tag is pushed (Chapter 49)
  schedule:
    - cron: '0 3 * * 1'   # every Monday at 03:00 UTC
  workflow_dispatch:      # a "Run workflow" button in the Actions tab
```

## Secrets and variables

Deploy keys and API tokens must never be committed (Chapter 79). Store them in **Settings → Secrets and variables → Actions** and reference them:

```yaml
      - run: ./deploy.sh
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

GitHub masks secret values in logs. Workflows triggered by pull requests from **forks** don't receive secrets by default, which protects them from malicious PRs.

## Workflows in the team's Git workflow

Actions ties together much of this book:

- **Required checks** (Chapter 53) block merging until CI is green.
- **Pull requests** show the checks for the merge result.
- **Tags** trigger release pipelines (Chapter 49).
- **Environments** can require approvals before deploying to production.
- **Merge queues** run checks on PRs combined with the ones ahead of them.

As a new developer, the most valuable habit is simple: **run the same commands locally that CI runs** (lint, type check, tests) before you push. Reading `.github/workflows/*.yml` tells you exactly what those commands are.

:::recap
### What you learned
- GitHub Actions runs workflows (YAML in `.github/workflows/`) in response to events like pushes, PRs, tags and schedules.
- Workflows contain jobs that run on runners; jobs contain steps that run commands or reusable actions.
- PR checks usually test the merge of your branch into the base.
- Read failures from the first error; reproduce locally; push a fix to the same branch.
- Secrets live in repository settings, never in code; forks don't receive them.
- Checks become merge gates through required status checks.

### Key terms
```terms
GitHub Actions :: GitHub's automation platform for running workflows on repository events.
Workflow :: A YAML file defining triggers and jobs.
Job :: A set of steps that runs on one runner.
Step :: A single command or action within a job.
Runner :: The machine that executes a job.
Status check :: A pass/fail result shown on a commit or PR.
Secret :: An encrypted value available to workflows but not stored in the repository.
CI :: Continuous integration: automatically building and testing every change.
```

### Key commands
```commands
gh pr checks :: Check status for the current PR.
gh run list :: Recent workflow runs.
gh run view --log-failed :: Logs for failed steps.
gh run watch :: Follow a run live.
gh workflow run <name> :: Trigger a workflow_dispatch workflow.
```

### Common mistakes
- Pushing without running tests and linters locally.
- Reading only the last lines of a failing log.
- Committing tokens in workflow files instead of using secrets.
- Re-running a failing job repeatedly instead of investigating.

### Quick quiz
```quiz
? Where do GitHub Actions workflow files live?
+ .github/workflows/ in the repository
- In Settings only, never in the repository
- In .git/hooks/
- In package.json
> Workflows are versioned files, reviewed like code.

? [scenario] Your branch passes tests locally, but the PR check fails on a test you didn't touch. A likely cause?
+ The check runs on your branch merged with the latest main, which has changes that interact with yours
- GitHub runs a different Git
- Actions ignores your commits
- The PR is a draft
> PR checks test the merge result. Merge or rebase main locally and run the tests.

? [tf] Secrets referenced as ${{ secrets.NAME }} are stored in the repository's files.
- True
+ False
> They're stored encrypted in repository or organisation settings.

? Which trigger runs a release workflow when you push a tag like v2.5.0?
+ on: push: tags: ['v*']
- on: pull_request
- on: schedule
- on: issues
> Tag pushes are push events filtered by tag pattern.
```

### Practical exercise
````exercise Add CI to your practice repository
1. Add a workflow that runs on pull requests and prints the Git log and runs a trivial test (for example `test -f README.md`).
2. Open a PR and watch the check.
3. Break the test (rename README.md in the branch), push, and read the failure with `gh run view --log-failed`.
4. Fix it and push again.
---solution---
```yaml title=".github/workflows/ci.yml"
name: CI
on:
  pull_request:
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - run: git log --oneline -5
      - run: test -f README.md
```
`fetch-depth: 0` asks checkout for full history (it's shallow by default). After renaming README.md, the last step fails with exit code 1; restoring it makes the check green again.
````

### What to learn next
You know the GitHub toolbox. Part 14 steps back to how teams organise their work with it: branching strategies and professional workflows.
:::
