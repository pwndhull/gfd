---
id: commit-conventions
part: 14
title: Commit Conventions
minutes: 18
level: Professional
topics: 137 Commit conventions
objectives:
- Write commits in the Conventional Commits format and explain each part
- Mark breaking changes and reference issues consistently
- Explain how conventions power changelogs and automated versioning
- Enforce conventions with hooks and CI without getting in developers' way
concepts: Conventional Commits | commit message | semantic versioning | changelog | commit hook
commands: git commit | git log --grep | git commit --trailer
---
Chapter 29 covered what makes any commit message good. Many teams go further and agree on a **structured** format, so messages can be scanned by people and parsed by tools. The most widely used is **Conventional Commits**.

## Conventional Commits

```text
<type>(<optional scope>): <description>

<optional body>

<optional footer(s)>
```

Examples:

```text
feat(checkout): add coupon code field
fix(cart): round totals to whole cents
docs: explain local setup with Docker
refactor(payments)!: replace Stripe client with gateway interface

BREAKING CHANGE: PaymentService.charge() now takes a Money object.
Refs: SHOP-231
```

| Part | Meaning |
|---|---|
| **type** | The kind of change (table below) |
| **scope** | Optional area of the codebase: `checkout`, `api`, `deps` |
| **!** | Marks a breaking change (alternatively, a `BREAKING CHANGE:` footer) |
| **description** | Short, imperative summary, lowercase by convention in this style |
| **body** | Why, as in any good commit |
| **footers** | `BREAKING CHANGE: …`, `Refs: …`, `Co-authored-by: …`, `Reviewed-by: …` |

Common types:

| Type | Use for | SemVer effect (if automated) |
|---|---|---|
| `feat` | A new feature for users | MINOR |
| `fix` | A bug fix for users | PATCH |
| `docs` | Documentation only | none |
| `style` | Formatting, whitespace (no code meaning change) | none |
| `refactor` | Code change that neither fixes a bug nor adds a feature | none |
| `perf` | Performance improvement | PATCH |
| `test` | Adding or fixing tests | none |
| `build` | Build system or dependencies | none |
| `ci` | CI configuration | none |
| `chore` | Maintenance that doesn't fit elsewhere | none |
| `revert` | Reverts a previous commit | depends |
| any type with `!` | Breaking change | **MAJOR** |

Only `feat` and `fix` (and breaking changes) are defined by the specification; the rest are widespread conventions (originating in the Angular project) that teams adapt.

## Why teams adopt it

- **Scannable history**: `git log --oneline` reads like a categorised list.
- **Generated changelogs**: tools group `feat` under "Features" and `fix` under "Bug Fixes".
- **Automated versioning**: release tools (such as semantic-release or release-please) read commits since the last tag and choose the next SemVer number: any breaking change → major, any `feat` → minor, otherwise patch.
- **Searchability**:

```bash
$ git log --oneline --grep="^feat" v2.4.0..HEAD         # new features since 2.4.0
$ git log --oneline --grep="BREAKING CHANGE" -i          # breaking changes
$ git log --oneline --grep="^fix(payments)"              # payment fixes
```

## Conventions and squash merging

If your team squash-merges PRs, the **PR title** usually becomes the commit subject on `main`. Then the convention matters most for PR titles, and individual branch commits can be informal. Many teams add a CI check that validates PR titles instead of every commit.

## Trailers

Structured footers are called **trailers**, and Git understands them:

```bash
$ git commit -m "feat(search): add fuzzy matching" \
    --trailer "Co-authored-by: Sam Lee <sam@acme.dev>" \
    --trailer "Refs: SHOP-310"
```

`Co-authored-by` makes GitHub credit both people on the commit. (`--trailer` needs Git 2.32+; you can also type trailers at the end of the message yourself.) Read them back with:

```bash
$ git log -1 --format="%(trailers)"
```

## Other team conventions you'll meet

- **Ticket prefixes**: `SHOP-231: Add coupon field` (common with Jira).
- **Gitmoji**: emoji prefixes. Less tool-friendly; some teams like it.
- **Linux-kernel style**: `subsystem: short description`, with `Signed-off-by:` trailers (added by `git commit -s`) certifying the Developer Certificate of Origin.

Whatever the style, the Chapter 29 fundamentals still apply: imperative subject, one logical change, a body explaining why.

## Enforcing conventions gently

- A **commit-msg hook** (Chapter 68) can check the format locally and reject bad messages with a helpful error. Tools like commitlint plus a hook manager make this a one-line setup.
- A **CI check** on PR titles works well with squash merging and doesn't depend on everyone installing hooks.
- A **commit template** reminds people of the format:

```bash
$ git config commit.template .gitmessage
```

Keep enforcement helpful: the error message should show a valid example.

:::recap
### What you learned
- Conventional Commits: `type(scope): description`, optional body and footers; `!` or `BREAKING CHANGE:` marks breaking changes.
- `feat` → minor, `fix` → patch, breaking → major, when versioning is automated.
- Structured messages enable scanning, changelogs, automated releases and precise `git log --grep` searches.
- With squash merging, the PR title is what reaches main.
- Trailers like `Co-authored-by:` add structured metadata; `git commit --trailer` and `-s` help write them.
- Enforce with hooks, CI checks and templates, with friendly error messages.

### Key terms
```terms
Conventional Commits :: A specification for structured commit messages: type(scope): description.
Commit type :: The category of a change, such as feat or fix.
Scope :: The optional area of the codebase a commit affects.
Breaking change :: An incompatible change, marked with ! or a BREAKING CHANGE footer.
Trailer :: A structured "Key: value" line at the end of a commit message.
```

### Key commands
```commands
git log --oneline --grep="^feat" :: Find feature commits.
git commit --trailer "Co-authored-by: Name <email>" :: Add a trailer.
git commit -s :: Add a Signed-off-by trailer.
git config commit.template .gitmessage :: Use a message template.
git log --format="%(trailers)" :: Show trailers.
```

### Common mistakes
- Using `feat` for internal refactors, bumping versions unnecessarily.
- Hiding a breaking change under `fix`.
- Enforcing a format with cryptic errors that frustrate the team.

### Quick quiz
```quiz
? Which message follows Conventional Commits?
+ fix(cart): prevent negative quantities
- Fixed cart bug
- cart: fix
- FIX - Cart - negative quantities
> type(scope): description in the imperative.

? [scenario] Your team uses automated releases. The last release was 3.4.2. Since then: two fix commits and one feat commit. Next version?
+ 3.5.0
- 3.4.3
- 4.0.0
- 3.4.5
> Any feat means a minor bump; patches reset to 0.

? How do you mark a breaking change?
+ An ! after the type/scope, or a BREAKING CHANGE: footer
- Use the type break
- Write it in capitals in the subject
- Tag the commit as breaking
> Either form signals a major version bump.

? [tf] With squash merging, the PR title often becomes the commit subject on main.
+ True
- False
> So teams frequently validate PR titles rather than every branch commit.
```

### Practical exercise
```exercise Rewrite in Conventional Commits
Rewrite these messages in Conventional Commits format:
1. "Fixed the thing where totals were wrong"
2. "New coupon field on checkout page"
3. "Updated README with docker instructions"
4. "Renamed PaymentService.charge to .capture (callers must update)"
5. "Upgrade eslint"
---solution---
1. `fix(cart): round totals to whole cents` (be specific about the fix)
2. `feat(checkout): add coupon code field`
3. `docs: add Docker setup instructions`
4. `refactor(payments)!: rename charge() to capture()` with a footer `BREAKING CHANGE: callers of PaymentService.charge must use capture`
5. `build(deps): upgrade eslint to 9.x` (or `chore(deps): …` depending on team convention)
```

### What to learn next
The last chapter of Part 14 covers collaborating day to day: sharing branches, pairing, and juggling several pieces of work at once.
:::
