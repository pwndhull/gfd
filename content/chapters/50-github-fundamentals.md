---
id: github-fundamentals
part: 13
title: GitHub Fundamentals and Repositories
minutes: 20
level: Beginner
topics: 121 GitHub fundamentals | 122 Repositories
objectives:
- Find your way around a GitHub repository page
- Understand organisations, teams and permission levels
- Create a repository with sensible defaults, and know what each option does
- Choose between cloning and forking
- Use the GitHub CLI for common tasks
concepts: GitHub | repository | fork | organisation | pull request | issue | default branch
commands: gh repo clone | gh repo create | gh browse | git clone
---
Part 2 set up your account; you've pushed and pulled ever since. This part looks at GitHub itself: the collaboration layer your team builds around Git. Everything here is a GitHub feature, not a Git one, so the same ideas appear with different names on GitLab, Bitbucket and Azure DevOps.

## The repository page

Open any repository on GitHub. The tabs along the top are the main features:

| Tab | What it's for |
|---|---|
| **Code** | Browse files and branches, read the README, get the clone URL |
| **Issues** | Tasks, bug reports and discussions (Chapter 54) |
| **Pull requests** | Proposed changes with review and checks (Chapters 51–52) |
| **Actions** | Automated workflows: tests, builds, deployments (Chapter 55) |
| **Projects** | Kanban-style planning boards |
| **Security** | Vulnerability alerts, secret scanning, security policies |
| **Insights** | Contributors, traffic, dependency graph |
| **Settings** | Access, branch rules, merge options (admins only) |

On the Code tab, a few things are worth knowing:

- The **branch selector** switches the file view between branches and tags.
- The **Code** button gives HTTPS and SSH clone URLs (and "Open with GitHub Desktop").
- The **commits** link shows history; each commit has its own page with the diff.
- Pressing `t` opens a file finder; `.` opens the repository in a browser-based VS Code editor (github.dev).
- Any file view has **Blame** and **History** buttons (the web versions of `git blame` and `git log -- <file>`).

## Accounts, organisations and teams

- A **personal account** is you.
- An **organisation** is a shared account owning repositories, such as `acme`. Companies put their repositories under one.
- **Teams** inside an organisation (such as `@acme/payments`) group people for permissions and review requests.

Permission levels on a repository, from least to most:

| Role | Can |
|---|---|
| **Read** | View and clone, open issues, comment |
| **Triage** | Manage issues and PRs (labels, assign) without writing code |
| **Write** | Push to non-protected branches, merge PRs (if rules allow) |
| **Maintain** | Manage the repository without access to sensitive settings |
| **Admin** | Everything, including settings, rules and deleting the repository |

As a new developer you'll usually get **Write** to your team's repositories. You can push branches, but `main` is typically protected, so changes go through pull requests (Chapter 53).

## Creating a repository

**+ → New repository** (or `gh repo create`). The options:

| Option | Advice |
|---|---|
| Owner | Your account or your organisation |
| Name | Short, lowercase, hyphenated: `payment-service` |
| Visibility | **Private** unless it's intended to be open source. (Enterprise accounts also have **internal**: visible to everyone in the company.) |
| Add a README | Tick it for a brand-new project. **Don't** tick it if you're about to push an existing local repository (Chapter 17). |
| Add .gitignore | Pick your language's template |
| Choose a license | Needed for open source; ask your company for internal projects |

```bash
$ gh repo create acme/payment-service --private --clone
$ gh repo create --source=. --private --push           # publish the current local repository
```

### What makes a good repository

A newcomer should be productive quickly. Good repositories have:

- a **README** explaining what it is, how to set it up, run it and test it,
- a **CONTRIBUTING.md** describing branch naming, commit style and the PR process,
- `.gitignore`, a license, and often `.editorconfig`,
- a **`.github/` folder** with PR and issue templates, `CODEOWNERS` and workflows,
- a protected default branch and required checks.

## Clone or fork?

| | Clone | Fork |
|---|---|---|
| What it creates | A local copy on your computer | A server-side copy under **your** GitHub account |
| When | You have write access (your team's repositories) | You don't have write access (open source, other teams) |
| How you contribute | Push a branch to the same repository, open a PR | Push to your fork, open a PR to the original |
| Remotes | `origin` = the repository | `origin` = your fork, `upstream` = the original (Chapter 19) |

Inside a company you'll almost always clone the team's repository directly. Forks are the norm for open source.

```bash
$ gh repo fork expressjs/express --clone     # fork on GitHub, clone it, and add upstream automatically
```

## The GitHub CLI

`gh` brings GitHub features to the terminal, complementing `git`:

| Task | Command |
|---|---|
| Sign in and set up Git credentials | `gh auth login` |
| Clone by name | `gh repo clone acme/shop` |
| Open the repository in the browser | `gh browse` |
| Create a PR from the current branch | `gh pr create` |
| List PRs / check one out locally | `gh pr list` / `gh pr checkout 123` |
| See CI status for your branch | `gh pr checks` |
| Create an issue | `gh issue create` |
| Create a release | `gh release create v1.2.0 --generate-notes` |

Remember the division of labour: `git` manages history; `gh` manages GitHub objects like PRs, issues and releases.

## GitHub is not a backup of your laptop

Only what you **push** exists on GitHub. Unpushed commits, stashes, local branches, your reflog and untracked files live only on your machine. Push your branches regularly, even unfinished ones (use a draft PR to signal "not ready").

:::recap
### What you learned
- A GitHub repository page groups Code, Issues, Pull requests, Actions, Projects, Security, Insights and Settings.
- Organisations own shared repositories; teams group people; roles run from Read to Admin.
- New repositories: choose visibility, and only add a README when not pushing an existing repository.
- Clone when you have write access; fork when you don't.
- `gh` complements `git` for pull requests, issues, releases and browsing.

### Key terms
```terms
Organisation :: A shared GitHub account that owns repositories for a company or project.
Team :: A group of organisation members used for access and review requests.
Fork :: A copy of a repository under your own GitHub account.
Visibility :: Whether a repository is public, private or internal.
GitHub CLI (gh) :: GitHub's command-line tool for PRs, issues, releases and more.
```

### Key commands
```commands
gh repo clone <owner>/<repo> :: Clone by name.
gh repo create <name> --private --clone :: Create a repository and clone it.
gh repo fork <owner>/<repo> --clone :: Fork and clone with upstream configured.
gh browse :: Open the current repository in the browser.
```

### Common mistakes
- Creating a repository with a README and then pushing an unrelated local history into it.
- Forking your own team's repository instead of cloning it.
- Assuming work is backed up on GitHub before pushing.

### Quick quiz
```quiz
? [scenario] You want to contribute to an open-source project where you have no write access. First step?
+ Fork it, clone your fork, and add the original as upstream
- Clone it and push directly to main
- Ask for Admin access
- Download a zip and email changes
> Forks let you push to your own copy and propose changes through a pull request.

? Which role lets someone push to non-protected branches?
- Read
- Triage
+ Write
- None; only Admins can push
> Write allows pushing branches; protection rules still guard main.

? [tf] git and gh are two names for the same program.
- True
+ False
> git is version control. gh is GitHub's CLI for pull requests, issues and releases.

? What should a good README include for new developers?
+ What the project is, how to set it up, run it and test it
- Only the license
- The full commit history
- Every developer's email address
> A newcomer should be able to get running from the README alone.
```

### Practical exercise
```exercise Tour a real repository
Pick your team's main repository (or a popular open-source one such as `github.com/microsoft/vscode`). Find and note:
1. The default branch and how many branches exist.
2. The latest release and its tag.
3. Whether it has CONTRIBUTING.md, CODEOWNERS and PR templates (look in the root and `.github/`).
4. The Blame view of any file you'd likely edit.
If you have `gh`, run `gh repo view <owner>/<repo>` and `gh pr list --limit 5`.
---solution---
The branch selector shows the default branch; Releases appear in the right sidebar; `.github/` often contains `CODEOWNERS`, `pull_request_template.md` and `workflows/`. `gh repo view` prints the README and description; `gh pr list` shows open PRs with their branches.
```

### What to learn next
Next, the heart of team collaboration on GitHub: pull requests.
:::
