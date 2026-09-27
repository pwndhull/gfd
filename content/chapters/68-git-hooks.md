---
id: git-hooks
part: 15
title: Git Hooks
minutes: 18
level: Advanced
topics: 149 Git hooks
objectives:
- Explain what hooks are, where they live and when each common hook runs
- Write a simple pre-commit and commit-msg hook
- Share hooks with a team using core.hooksPath or a hook manager
- Know when to bypass hooks and why CI remains the real safety net
concepts: hook | pre-commit | commit-msg | pre-push | CI
commands: git config core.hooksPath | git commit --no-verify | chmod +x
---
**Hooks** are scripts Git runs automatically at certain moments: before a commit is created, after a checkout, before a push. They're how teams run formatters, linters and message checks locally, catching problems seconds after they happen instead of minutes later in CI.

## Where hooks live

Every repository has a `.git/hooks/` folder, pre-filled with examples:

```bash
$ ls .git/hooks
applypatch-msg.sample  pre-applypatch.sample  pre-push.sample
commit-msg.sample      pre-commit.sample      pre-rebase.sample
post-update.sample     pre-merge-commit.sample prepare-commit-msg.sample
...
```

A hook is **active** when a file with the exact hook name exists (no `.sample`) and is **executable**. It can be written in any language with a proper shebang line (`#!/bin/sh`, `#!/usr/bin/env python3`, `#!/usr/bin/env node`).

## The hooks you'll meet

| Hook | Runs | Can abort? | Typical use |
|---|---|---|---|
| `pre-commit` | Before the commit message is requested | Yes | Format/lint staged files, block secrets, block conflict markers |
| `prepare-commit-msg` | Before the editor opens | Yes | Pre-fill the message (e.g. ticket ID from branch name) |
| `commit-msg` | After you write the message | Yes | Validate message format (Chapter 59) |
| `post-commit` | After the commit is made | No | Notifications |
| `pre-push` | Before `git push` sends anything | Yes | Run tests; stop pushes to protected branches |
| `post-checkout` / `post-merge` | After switch/checkout / after merge (incl. pull) | No | Reinstall dependencies when lock files changed |
| `pre-rebase` | Before a rebase starts | Yes | Prevent rebasing published branches |

"Can abort" means: if the script exits with a non-zero code, Git cancels the operation.

**Server-side hooks** (`pre-receive`, `update`, `post-receive`) run on the server during a push. GitHub.com doesn't let you install custom server hooks; it offers branch protection, rulesets and Actions instead (Chapters 53 and 55).

## A first pre-commit hook

Block commits that contain leftover conflict markers or `console.log` in staged JavaScript:

```bash title=".git/hooks/pre-commit"
#!/bin/sh
# Check only what is staged, not the whole working directory.
if git diff --cached --check; then :; else
  echo "pre-commit: fix whitespace errors or conflict markers above." >&2
  exit 1
fi

if git diff --cached -U0 -- '*.js' '*.ts' | grep -q '^+.*console\.log'; then
  echo "pre-commit: remove console.log from staged changes (or commit with --no-verify)." >&2
  exit 1
fi
```

```bash
$ chmod +x .git/hooks/pre-commit
$ git commit -m "Add coupon"
pre-commit: remove console.log from staged changes (or commit with --no-verify).
```

The commit was cancelled; nothing was recorded. Fix, re-stage, commit again.

:::tip Check staged content, not the working directory
Hooks should examine what is **about to be committed** (`git diff --cached`), since the working directory may contain unstaged edits. Hook managers like lint-staged do this automatically.
:::

## A commit-msg hook

The message file path is passed as the first argument:

```bash title=".git/hooks/commit-msg"
#!/bin/sh
pattern='^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9-]+\))?!?: .+'
if ! head -1 "$1" | grep -Eq "$pattern"; then
  echo "commit-msg: use Conventional Commits, e.g. 'fix(cart): round totals to cents'" >&2
  exit 1
fi
```

## Sharing hooks with the team

`.git/hooks/` is **not** committed or cloned, so hooks you write there are yours alone. To share:

**Option 1: `core.hooksPath`** (Git 2.9+). Commit hooks to a folder, and have each developer point Git at it once:

```bash
$ mkdir .githooks && git mv .git/hooks/pre-commit .githooks/ 2>/dev/null
$ git config core.hooksPath .githooks
```

Put that one-time `git config` in your setup script or README.

**Option 2: a hook manager**, installed as a project dependency so hooks set themselves up:

| Ecosystem | Popular tools |
|---|---|
| JavaScript/TypeScript | Husky + lint-staged |
| Python and polyglot | pre-commit (the framework) |
| Any | Lefthook |

These run only relevant tools on only the staged files, keeping hooks fast.

## Bypassing hooks

```bash
$ git commit --no-verify -m "WIP: spike, lint later"
$ git push --no-verify
```

`--no-verify` (`-n` for commit) skips `pre-commit` and `commit-msg` (or `pre-push`). It's legitimate for WIP commits on your own branch or when a hook is broken, but it's also why **hooks are a convenience, not enforcement**: anyone can skip them, and not everyone installs them. The real gate is CI with required checks (Chapters 53 and 55). Good practice runs the same checks in both places: hooks for fast feedback, CI for the guarantee.

## Keep hooks fast and friendly

- **Fast**: under a couple of seconds for `pre-commit`. Slow hooks train people to use `--no-verify`. Put the full test suite in `pre-push` or CI.
- **Clear**: say what failed and how to fix it.
- **Auto-fix where possible**: run the formatter and re-stage, rather than just complaining.
- **Scoped**: only staged files, only relevant file types.

:::recap
### What you learned
- Hooks are executable scripts in `.git/hooks/` named after events; a non-zero exit aborts pre-* hooks.
- Common client hooks: pre-commit, prepare-commit-msg, commit-msg, pre-push, post-checkout, post-merge.
- Hooks check staged content with `git diff --cached`.
- `.git/hooks` isn't shared; use `core.hooksPath` with a committed folder or a hook manager.
- `--no-verify` bypasses hooks, so CI remains the real enforcement.

### Key terms
```terms
Hook :: A script Git runs automatically at a specific point in a command.
pre-commit hook :: Runs before a commit is created and can cancel it.
commit-msg hook :: Validates or edits the commit message.
pre-push hook :: Runs before a push and can cancel it.
core.hooksPath :: A setting pointing Git to a hooks folder other than .git/hooks.
```

### Key commands
```commands
chmod +x .git/hooks/<name> :: Make a hook executable.
git config core.hooksPath .githooks :: Use a committed hooks folder.
git commit --no-verify :: Skip pre-commit and commit-msg hooks.
git push --no-verify :: Skip the pre-push hook.
git diff --cached --check :: Detect whitespace errors and conflict markers in staged changes.
```

### Common mistakes
- Writing a hook without making it executable, so it silently never runs.
- Hooks that check the working directory instead of staged changes.
- Slow hooks that push the team towards `--no-verify`.
- Treating hooks as enforcement without CI behind them.

### Quick quiz
```quiz
? [troubleshoot] You wrote .git/hooks/pre-commit but it never runs. Most likely cause?
+ It isn't executable (chmod +x) or is still named .sample
- Hooks only run on servers
- You must push first
- Git only runs Python hooks
> Git runs only executable files with the exact hook name.

? [tf] Hooks in .git/hooks are shared with teammates when they clone.
- True
+ False
> .git/hooks isn't part of the repository's history. Use core.hooksPath or a hook manager.

? What makes a commit-msg hook reject a message?
+ Exiting with a non-zero status
- Printing any output
- Editing the message file
- Taking longer than 5 seconds
> Non-zero exit codes abort the commit.

? Why must CI still run checks even if everyone has pre-commit hooks?
+ Hooks can be skipped with --no-verify and may not be installed
- CI is faster than hooks
- Hooks can't run linters
- GitHub disables hooks
> Hooks give fast feedback; CI gives the guarantee.
```

### Practical exercise
````exercise Write two hooks
In a practice repository:
1. Add a pre-commit hook that rejects staged changes containing "DO NOT COMMIT".
2. Add a commit-msg hook that requires the subject to be at most 72 characters.
3. Test both, then bypass once with `--no-verify`.
4. Move them into `.githooks/` and configure `core.hooksPath`.
---solution---
```bash
$ cat > .git/hooks/pre-commit <<'EOF'
#!/bin/sh
if git diff --cached | grep -q '^+.*DO NOT COMMIT'; then
  echo "pre-commit: remove 'DO NOT COMMIT' lines" >&2; exit 1
fi
EOF
$ cat > .git/hooks/commit-msg <<'EOF'
#!/bin/sh
len=$(head -1 "$1" | wc -c)
[ "$len" -le 73 ] || { echo "commit-msg: subject over 72 characters" >&2; exit 1; }
EOF
$ chmod +x .git/hooks/pre-commit .git/hooks/commit-msg
$ mkdir .githooks && mv .git/hooks/pre-commit .git/hooks/commit-msg .githooks/
$ git config core.hooksPath .githooks && git add .githooks && git commit -m "Add shared hooks"
```
`wc -c` counts the newline too, hence 73. `<<'EOF'` writes the following lines into the file until the EOF marker.
````

### What to learn next
Next: aliases, to turn long commands you type daily into short, memorable ones.
:::
