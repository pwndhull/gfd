---
id: branching-strategies
part: 14
title: Branching Strategies
minutes: 26
level: Professional
topics: 131 Feature branch workflow | 132 Trunk-based development | 133 GitFlow
objectives:
- Compare feature branch workflow, trunk-based development and GitFlow
- Explain the problem each strategy solves and what it costs
- Recognise which strategy a team uses from its branches and history
- Use feature flags to merge unfinished work safely
- Choose a strategy that fits a team's release style
concepts: feature branch | trunk-based development | GitFlow | release branch | feature flag | main
commands: git switch -c | git merge --no-ff | git tag -a
---
Every team answers the same questions: where does new work happen, how does it reach `main`, and how do releases get cut? A **branching strategy** is the team's agreed answer. You'll join a team that already has one, so the goal here is to recognise the common strategies, understand why they exist, and work well within them.

## Feature branch workflow

You met this in Chapter 27. It's the default for most teams using GitHub.

- `main` is always deployable.
- Every change gets a **short-lived branch** from `main`.
- Changes return through a **reviewed pull request** with passing checks.
- Branches are deleted after merging.

```graph Feature branch workflow
      feature/a           fix/b
      o---o               o
     /     \             / \
o---o-------o---o-------o---o   main
```

**Strengths**: simple, fits GitHub's PR model perfectly, isolates work, natural unit for review.
**Risks**: branches that live for weeks drift from `main` and become painful to merge (Chapter 58).

It's often called **GitHub Flow** when combined with "deploy from `main` after every merge".

## Trunk-based development

Everyone integrates into one shared branch, the **trunk** (`main`), very frequently: at least daily, often several times a day.

- Branches, if used, live for **hours to a day or two**, and are tiny.
- Some teams commit directly to `main` with pair programming or post-commit review; most use very small PRs.
- Unfinished features are merged **hidden behind feature flags** rather than kept on branches.
- Releases are cut from `main` continuously, or from short-lived release branches or tags.

```diagram trunk
```

**Strengths**: almost no merge conflicts (nothing diverges for long), fast feedback, continuous delivery, everyone always works on current code.
**Requirements**: strong automated tests, fast CI, feature flags, and discipline to keep changes small. Without these, a broken `main` affects everyone.

### Feature flags

A **feature flag** is a runtime switch that turns code paths on or off:

```js
if (flags.isEnabled('new-checkout', user)) {
  return renderNewCheckout(cart);
}
return renderCheckout(cart);
```

The new checkout can be merged in small pieces over two weeks while disabled in production, turned on for internal users, then for 10% of customers, then everyone. **Merging** and **releasing** become separate decisions. Flags need cleanup afterwards; old flags are technical debt.

## GitFlow

GitFlow, described by Vincent Driessen in 2010, uses several long-lived and short-lived branch types:

| Branch | Lives | Purpose |
|---|---|---|
| `main` (or `master`) | Forever | Only released code; every commit is a tagged release |
| `develop` | Forever | Integration branch for the next release |
| `feature/*` | Short | Branched from and merged back into `develop` |
| `release/*` | Short | Branched from `develop` to stabilise a release; merged into `main` **and** `develop` |
| `hotfix/*` | Short | Branched from `main` for urgent fixes; merged into `main` **and** `develop` |

```diagram gitflow
```

**Strengths**: clear structure for **scheduled, versioned releases**; supports stabilising a release while the next one continues; explicit hotfix path.
**Costs**: many branches and merges; two long-lived branches that can drift; slower feedback. Its author has since noted that for continuously delivered software (such as web apps), a simpler workflow is usually a better fit.

GitFlow still suits products with explicit versions in the field: installed desktop software, mobile apps waiting on store review, libraries, firmware.

## Side by side

| | Feature branch (GitHub Flow) | Trunk-based | GitFlow |
|---|---|---|---|
| Long-lived branches | `main` | `main` | `main`, `develop` |
| Typical branch life | Days | Hours | Days to weeks |
| Integration frequency | Per PR | Continuous | Per feature into develop; per release into main |
| Unfinished work | On its branch | Behind feature flags | On its feature branch |
| Release model | Deploy from main | Deploy from main continuously | Scheduled releases via release branches |
| Merge conflicts | Moderate | Rare and small | Frequent at release time |
| Best fit | Most teams, web apps, services | High-velocity teams with strong CI | Versioned products with release cycles |

## Recognising your team's strategy

Look at the repository on your first day:

```bash
$ git branch -r
$ git log --oneline --graph --first-parent -20 origin/main
```

- Only `main` plus many short `feature/…` and `fix/…` branches → **feature branch workflow**.
- Only `main`, very few remote branches, lots of small commits or PRs daily → **trunk-based**.
- `develop`, `release/*` and `hotfix/*` branches, and tags only on `main` → **GitFlow**.
- `main` plus `release/x.y` branches with cherry-picked fixes → feature branches **with release branches**, a common hybrid.

Also read CONTRIBUTING.md. When in doubt, ask: "Which branch do I branch from, and where do my PRs go?"

## Choosing, if it's your call

- **Deploying continuously?** Feature branches or trunk-based. Add feature flags as you grow.
- **Shipping versioned releases on a schedule, supporting old versions?** Feature branches plus release branches, or GitFlow.
- **Small team, new project?** Start with the simplest thing (feature branches and PRs to `main`) and add structure only when a real problem demands it.

:::recap
### What you learned
- Feature branch workflow: short-lived branches from `main`, merged through PRs; the common default.
- Trunk-based: integrate into `main` at least daily, tiny branches, feature flags for unfinished work; needs strong CI.
- GitFlow: `main` plus `develop`, with feature, release and hotfix branches; suits scheduled, versioned releases but adds overhead.
- Feature flags separate merging code from releasing features.
- Identify your team's strategy from its branches, history and contributing guide.

### Key terms
```terms
Branching strategy :: A team's agreed rules for branches, integration and releases.
GitHub Flow :: Feature branches merged into an always-deployable main.
Trunk-based development :: Integrating into a single main branch at least daily.
GitFlow :: A strategy with main, develop, feature, release and hotfix branches.
Feature flag :: A runtime switch that enables or disables a feature without deploying new code.
```

### Key commands
```commands
git branch -r :: See which branch types a team uses.
git log --oneline --graph --first-parent origin/main :: See how work lands on main.
git switch -c feature/<name> origin/main :: Start work in a feature branch workflow.
git switch -c feature/<name> origin/develop :: Start work in GitFlow.
```

### Common mistakes
- Branching from `main` on a GitFlow team (or from `develop` on a GitHub Flow team).
- Keeping a "feature branch" alive for a month in a trunk-based team.
- Adding GitFlow's full ceremony to a small web app that deploys daily.
- Forgetting to remove feature flags after launch.

### Quick quiz
```quiz
? In GitFlow, which branch do feature branches start from?
- main
+ develop
- release
- hotfix
> Features integrate into develop; main receives only releases and hotfixes.

? [scenario] A team merges unfinished features into main daily, hidden behind switches that are off in production. Which strategy is this?
+ Trunk-based development with feature flags
- GitFlow
- Forking workflow
- Release branching only
> Frequent integration into trunk plus flags is the hallmark of trunk-based development.

? What's the main requirement for trunk-based development to work well?
+ Strong, fast automated tests and CI, plus small changes
- A develop branch
- Long-lived feature branches
- Squash merging only
> Everyone depends on main being green at all times.

? [tf] A feature flag lets you merge code without releasing the feature to users.
+ True
- False
> Merge and release become separate decisions.

? [predict] A repository has main, develop, release/3.2 and hotfix/3.1.4 branches. Which strategy is it most likely using?
+ GitFlow
- Trunk-based development
- GitHub Flow
- No strategy
> develop plus release and hotfix branches are GitFlow's signature.
```

### Practical exercise
````exercise Identify and practise a strategy
1. For your team's repository (or a large open-source project), run `git branch -r` and `git log --oneline --graph --first-parent -30 origin/main`, and decide which strategy it uses. Write down the evidence.
2. In the sandbox (Git sandbox page, "Empty repo"), simulate GitFlow: create `develop` from main, a feature branch from develop, merge it back with `--no-ff`, create `release/1.0` from develop, merge it into main with `--no-ff`, tag `v1.0`, and merge the release back into develop.
---solution---
Evidence for (1) is the branch list and how main's first-parent history looks: a stream of "Merge pull request" commits (feature branches), many small direct commits (trunk-based), or only release merges and tags (GitFlow).

Sandbox commands for (2):
```text
git commit -m "Initial commit"
git switch -c develop
git switch -c feature/login
git commit -m "Add login"
git switch develop
git merge --no-ff feature/login
git switch -c release/1.0
git commit -m "Bump version to 1.0"
git switch main
git merge --no-ff release/1.0
git tag -a v1.0 -m "Release 1.0"
git switch develop
git merge release/1.0
```
````

### What to learn next
Whatever the strategy, pull requests and reviews are the daily rhythm. Next: the PR and code review workflow as a team process.
:::
