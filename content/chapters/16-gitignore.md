---
id: gitignore
part: 3
title: Ignoring Files with .gitignore
minutes: 20
level: Beginner
topics: 36 .gitignore
objectives:
- Explain what .gitignore does and what it cannot do
- Write ignore patterns for files, folders, extensions and exceptions
- Stop tracking a file that was committed before being ignored
- Choose between a project .gitignore, a global ignore file and .git/info/exclude
- Debug why a file is or isn't ignored
concepts: .gitignore | ignored file | untracked file | pattern | tracked file
commands: git check-ignore -v | git rm --cached | git status --ignored
---
Every project produces files that should never be committed: installed dependencies, build output, logs, editor settings and, most importantly, secrets. `.gitignore` tells Git to pretend those files do not exist, so they never show up as untracked and never get swept into a `git add .`.

## A first .gitignore

Create a file named exactly `.gitignore` (with the leading dot, no extension) at the top of the repository:

```gitignore title=".gitignore"
# Dependencies
node_modules/

# Build output
dist/
build/

# Logs
*.log

# Environment variables and secrets
.env
.env.*
!.env.example

# OS and editor clutter
.DS_Store
Thumbs.db
.idea/
.vscode/*
!.vscode/extensions.json
```

Then commit it, so everyone on the team shares the same rules:

```bash
$ git add .gitignore
$ git commit -m "Add .gitignore"
```

Now `git status` stays quiet about `node_modules/`, `.env` and the rest, and `git add .` skips them.

## Pattern rules

| Pattern | Matches |
|---|---|
| `secret.txt` | Any file or folder named `secret.txt`, in any folder |
| `/secret.txt` | Only `secret.txt` at the top of the repository (leading `/` anchors to the `.gitignore`'s folder) |
| `logs/` | Any **folder** named `logs`, and everything inside it (trailing `/` means folders only) |
| `*.log` | Any file ending in `.log`, anywhere |
| `build/*.js` | `.js` files directly inside `build/` (not in subfolders) |
| `docs/**/*.pdf` | `.pdf` files anywhere under `docs/` (`**` matches any number of folders) |
| `!keep.log` | Exception: do **not** ignore `keep.log`, even though `*.log` matched it |
| `# comment` | Comment line; ignored |
| `\#notes.txt` | A file literally named `#notes.txt` (backslash escapes the `#`) |

Two rules trip people up:

1. **A pattern containing a slash (other than at the end) is relative to the `.gitignore`'s location.** `src/temp/` in the root `.gitignore` matches only that path. A bare name like `temp/` matches a `temp` folder at any depth.
2. **You cannot re-include a file if its parent folder is excluded.** If `logs/` is ignored, `!logs/keep.log` has no effect, because Git never looks inside an ignored folder. Ignore the contents instead: `logs/*` then `!logs/keep.log`.

:::tip Start from a template
GitHub maintains a large collection of well-tested templates for most languages and frameworks at [github.com/github/gitignore](https://github.com/github/gitignore). GitHub also offers to add one when you create a repository. Frameworks like Create React App, Rails and Django generate one for you.
:::

## .gitignore only affects untracked files

This is the most important thing to know, and the cause of the most common ".gitignore isn't working!" complaint.

**If a file is already tracked, adding it to `.gitignore` does nothing.** Git keeps tracking it, and changes to it keep appearing in `git status`. Ignore rules only stop *untracked* files from being noticed.

To stop tracking a file that was committed by mistake, **remove it from the index** (so the next commit no longer contains it) while keeping it on disk:

```cmd
git rm --cached config/local.json
rm :: Remove files from Git's tracking.
--cached :: Only remove it from the staging area (index). Leave the file on your disk untouched.
config/local.json :: The path to stop tracking. Add -r to do a whole folder.
```

```bash
$ echo "config/local.json" >> .gitignore
$ git rm --cached config/local.json
rm 'config/local.json'
$ git commit -m "Stop tracking local config"
```

After this commit, the file stays on your machine and Git ignores it from now on.

:::danger This does not remove secrets from history
`git rm --cached` removes the file from **future** commits. Every earlier commit still contains it, and anyone who cloned the repository has it. If the file contained a password, API key or token, treat it as **leaked**: revoke and rotate the secret immediately. Chapter 73 covers the full recovery procedure.
:::

:::warning Teammates' copies
When you commit `git rm --cached somefile` and teammates pull, Git deletes that file from **their** working directories (from Git's point of view, the file was removed). For per-developer config files, warn the team first, and consider committing a template such as `config/local.example.json` that each person copies.
:::

## Three places to put ignore rules

| File | Shared with the team? | Use for |
|---|---|---|
| `.gitignore` (in the repository, committed) | Yes | Anything the project produces: dependencies, build output, logs, `.env` |
| Global ignore file (`core.excludesFile`) | No, just you, in every repository | Your OS and editor clutter: `.DS_Store`, `*.swp`, `.idea/` |
| `.git/info/exclude` | No, just you, just this repository | One-off personal files, such as your scratch notes in one project |

Set up a global ignore file once:

```bash
$ git config --global core.excludesFile ~/.gitignore_global
$ echo ".DS_Store" >> ~/.gitignore_global
```

Keeping personal clutter out of the project's `.gitignore` keeps that file focused on the project itself.

You can also put a `.gitignore` in a subfolder; its patterns apply relative to that folder. Most projects use a single root file for simplicity.

## Debugging ignore rules

**Why is this file ignored?**

```bash
$ git check-ignore -v dist/app.js
.gitignore:6:dist/	dist/app.js
```

```cmd
git check-ignore -v dist/app.js
check-ignore :: Check whether a path is ignored.
-v :: Verbose: print the file, line number and pattern responsible.
dist/app.js :: The path to check.
```

The output says: line 6 of `.gitignore`, pattern `dist/`, matched `dist/app.js`. If it prints nothing, the file is **not** ignored (or it is tracked; `check-ignore` only reports rules for untracked paths by default).

**What is being ignored right now?**

```bash
$ git status --ignored
```

This adds an "Ignored files" section to the usual output.

**Forcing a file in**: `git add -f path` adds a file despite ignore rules. Use it rarely and deliberately; usually a `!` exception in `.gitignore` is clearer for the team.

## What to ignore, and what not to

**Ignore:** dependency folders, build and compile output, caches, logs, coverage reports, local databases, `.env` files and any file with secrets, OS files, personal editor settings.

**Do not ignore:** lock files such as `package-lock.json`, `yarn.lock`, `Pipfile.lock`, `Gemfile.lock` or `Cargo.lock` for applications. They record the exact dependency versions everybody should use, so they belong in the repository. Also commit shared editor config the team agrees on, such as `.editorconfig` or recommended VS Code extensions.

:::recap
### What you learned
- `.gitignore` makes Git ignore untracked files matching its patterns. Commit it so the team shares it.
- Patterns: `name`, `/anchored`, `folder/`, `*.ext`, `**`, and `!exception`.
- Ignore rules do not affect tracked files. Use `git rm --cached` to stop tracking, then commit.
- Removing a secret from tracking does not remove it from history: rotate it.
- Use a global excludes file for personal clutter; `git check-ignore -v` explains any match.

### Key terms
```terms
.gitignore :: A committed file of patterns listing untracked files Git should ignore.
Ignored file :: A file matching an ignore pattern; Git does not show or add it.
Global excludes file :: A personal ignore file applied to all your repositories.
.git/info/exclude :: A personal, uncommitted ignore file for one repository.
```

### Key commands
```commands
git rm --cached <file> :: Stop tracking a file but keep it on disk.
git rm -r --cached <folder> :: Stop tracking a whole folder.
git check-ignore -v <path> :: Show which rule ignores a path.
git status --ignored :: List ignored files too.
git add -f <path> :: Force-add a file despite ignore rules.
```

### Common mistakes
- Adding an already-committed file to `.gitignore` and expecting it to disappear from status.
- Thinking `git rm --cached` removes a leaked secret from history.
- Ignoring lock files.
- Trying to re-include a file inside an ignored folder with `!`.

### Quick quiz
```quiz
? [scenario] config.json was committed last month. You add config.json to .gitignore, but git status still shows it as modified. Why?
+ .gitignore only affects untracked files; config.json is still tracked
- The pattern needs a leading slash
- .gitignore must be committed before it works
- Git caches .gitignore for 24 hours
> Run `git rm --cached config.json` and commit to stop tracking it. From then on the ignore rule applies.

? Which pattern ignores every .log file except important.log?
- *.log and -important.log
+ *.log and !important.log
- !*.log and important.log
- *.log only
> `!` negates an earlier pattern, re-including matching files, as long as their parent folder isn't ignored.

? [predict] What does this output mean?
| $ git check-ignore -v tmp/cache.db
| .gitignore:12:tmp/	tmp/cache.db
+ tmp/cache.db is ignored because of the pattern tmp/ on line 12 of .gitignore
- tmp/cache.db is tracked
- Line 12 of tmp/cache.db is ignored
- The file will be deleted
> check-ignore -v prints the source file, line number, pattern and the path it matched.

? [tf] After you run git rm --cached .env and commit, the secrets in .env are gone from the repository's history.
- True
+ False
> Earlier commits still contain the file. Treat the secret as leaked and rotate it.

? Where should .DS_Store (a macOS file) usually be ignored?
- In every project's .gitignore
+ In your global excludes file
- In .git/HEAD
- Nowhere; it should be committed
> It is personal OS clutter. Many projects also list it, but a global ignore covers all your repositories at once.
```

### Practical exercise
````exercise Ignore and un-track
In `notes-app`:
1. Create `debug.log`, a folder `node_modules/` containing any file, and `.env` containing `API_KEY=test`.
2. Write a `.gitignore` that ignores all three, and commit it.
3. Accidentally commit a file `local-settings.json`, then add it to `.gitignore` and stop tracking it properly.
4. Use `git check-ignore -v` to confirm each rule.
---solution---
```bash
$ echo "oops" > debug.log
$ mkdir node_modules && echo "x" > node_modules/pkg.js
$ echo "API_KEY=test" > .env
$ printf "node_modules/\n*.log\n.env\n" > .gitignore
$ git status -s          # only ?? .gitignore
$ git add .gitignore && git commit -m "Add .gitignore"

$ echo "{}" > local-settings.json
$ git add local-settings.json && git commit -m "Add local settings"
$ echo "local-settings.json" >> .gitignore
$ git rm --cached local-settings.json
$ git add .gitignore
$ git commit -m "Stop tracking local settings"

$ git check-ignore -v debug.log .env node_modules/pkg.js local-settings.json
```
`printf` with `\n` writes several lines at once. The file `local-settings.json` is still on disk but no longer tracked.
````

### What to learn next
You have every piece of the local workflow. The next chapter puts them together, start to finish, including publishing your repository to GitHub.
:::
