---
id: configuring-git
part: 2
title: Configuring Git
minutes: 22
level: Beginner
topics: 19 Git configuration | 20 Username and email | 21 Default branch | 22 Useful Git configuration
objectives:
- Explain the three configuration levels and which one wins
- Set your name and email so commits are attributed correctly
- Set main as the default branch for new repositories
- Apply a short list of settings that prevent common problems
- Inspect where any setting comes from
concepts: git config | global config | local config | user.name | user.email | default branch | line endings
commands: git config --global user.name | git config --global user.email | git config --list --show-origin | git config --global init.defaultBranch main
---
Every commit you make is stamped with a name and email. Before your first commit, tell Git who you are. While you are here, a handful of settings will make Git friendlier and prevent problems that otherwise bite newcomers in their first week.

## How Git configuration works

Git reads settings from three levels. More specific levels override broader ones.

| Level | Flag | Applies to | Stored in |
|---|---|---|---|
| System | `--system` | Every user on this computer | Git's install folder (e.g. `/etc/gitconfig`) |
| Global | `--global` | You, in every repository | `~/.gitconfig` in your home folder |
| Local | `--local` (default inside a repo) | One repository | `.git/config` in that repository |

If your global config says one email and a repository's local config says another, **local wins** for that repository. You will set almost everything at the global level.

```cmd
git config --global user.name "Priya Sharma"
git :: The Git program.
config :: The command that reads and writes settings.
--global :: Write to your personal config file, used in every repository.
user.name :: The setting's key: a section (user) and a name (name).
"Priya Sharma" :: The value. Quotes are needed because it contains a space.
```

## Your name and email

```bash
$ git config --global user.name "Priya Sharma"
$ git config --global user.email "priya@acme.dev"
```

- **Name**: shown on every commit. Use your real name, the way teammates know you.
- **Email**: should match an email on your GitHub account, so GitHub links your commits to your profile and shows your avatar. For work, use your work email.

:::warning Setting it after committing does not fix old commits
The name and email are written into each commit when it is made. Changing the config later only affects new commits. If you already made commits with the wrong identity on a branch nobody else has, Chapter 30 shows how to amend them. Pushed commits generally stay as they are.
:::

### Keeping your personal email private

For personal and open-source work, GitHub offers a no-reply address so your real email is never published in commit history. In GitHub's email settings, enable **Keep my email addresses private**; GitHub shows you an address in the form `ID+username@users.noreply.github.com`. Use that as `user.email`.

### Different identities for work and personal projects

If you use one laptop for both, set your personal identity globally and override it inside work repositories:

```bash
$ cd ~/code/acme-shop
$ git config user.email "priya@acme.dev"   # no --global: only this repository
```

For many work repositories, Git can switch identity automatically by folder using conditional includes:

```ini title="~/.gitconfig"
[user]
    name = Priya Sharma
    email = priya.personal@example.com

[includeIf "gitdir:~/code/work/"]
    path = ~/.gitconfig-work
```

```ini title="~/.gitconfig-work"
[user]
    email = priya@acme.dev
```

Every repository under `~/code/work/` now uses your work email.

## The default branch name

When you run `git init`, Git creates an initial branch. Older Git named it `master`; GitHub and most teams now use `main`. Since Git 2.28 you can choose:

```bash
$ git config --global init.defaultBranch main
```

This only affects **new** repositories you create with `git init`. Cloned repositories always use whatever the remote uses.

## Your editor

Git opens an editor when it needs a longer message: commits without `-m`, merge commits, interactive rebase. Pick one you know:

```bash
$ git config --global core.editor "code --wait"      # VS Code
$ git config --global core.editor "nano"             # simple terminal editor
$ git config --global core.editor "subl -n -w"       # Sublime Text
```

`--wait` tells VS Code not to return control to Git until you close the message tab. Without it, Git sees an empty message and aborts.

:::tip Stuck in Vim?
If Git drops you into a screen full of `~` characters, you are in Vim. Press `Esc`, then type `:wq` and Enter to save and exit, or `:q!` and Enter to quit without saving (which aborts the commit).
:::

## A recommended starter configuration

These settings are widely used on professional teams. Each prevents a specific annoyance.

```bash title="Recommended settings"
$ git config --global init.defaultBranch main
$ git config --global pull.rebase false          # or true, see below
$ git config --global fetch.prune true
$ git config --global push.autoSetupRemote true
$ git config --global rerere.enabled true
$ git config --global merge.conflictStyle zdiff3
$ git config --global core.autocrlf input        # macOS/Linux
$ git config --global core.autocrlf true         # Windows (instead of the line above)
```

| Setting | What it does | Why |
|---|---|---|
| `pull.rebase false` | When `git pull` finds divergent history, combine with a merge | Recent Git versions refuse to guess and stop with "Need to specify how to reconcile divergent branches". Setting this (or `true` for rebase) removes the ambiguity. Ask what your team prefers; Chapter 21 explains both. |
| `fetch.prune true` | Remove `origin/x` branches that were deleted on the server | Stops your branch list filling with long-gone branches |
| `push.autoSetupRemote true` | The first `git push` of a new branch sets its upstream automatically | Saves typing `-u origin <branch>` every time (Git 2.37+) |
| `rerere.enabled true` | "Reuse recorded resolution": remember how you resolved a conflict and reapply it if the same conflict reappears | Saves repeated work during rebases |
| `merge.conflictStyle zdiff3` | Conflict markers also show the original common version | Makes conflicts far easier to understand (Git 2.35+; use `diff3` on older versions) |
| `core.autocrlf` | Converts line endings between Windows (CRLF) and Unix (LF) | Prevents "every line changed" diffs in mixed-OS teams |

:::note About line endings
Windows ends lines with two characters (CR LF); macOS and Linux use one (LF). If people commit different endings, every line of a file appears changed. `core.autocrlf` handles this per machine. Many teams also add a `.gitattributes` file to the repository (for example `* text=auto`) so the rule is enforced for everyone regardless of personal settings.
:::

## Reading your configuration

```bash
$ git config user.email
priya@acme.dev

$ git config --list --show-origin
file:/Users/priya/.gitconfig    user.name=Priya Sharma
file:/Users/priya/.gitconfig    user.email=priya.personal@example.com
file:.git/config                user.email=priya@acme.dev
file:.git/config                remote.origin.url=git@github.com:acme/shop.git
...
```

```cmd
git config --list --show-origin
config :: The settings command.
--list :: Print every setting Git can see, from all levels.
--show-origin :: Also print which file each setting came from, so you can tell why a value applies.
```

When the same key appears twice, the **last** one printed is the one in effect. In the example, this repository uses `priya@acme.dev` because the local file overrides the global one.

To edit the global file directly in your editor:

```bash
$ git config --global --edit
```

To remove a setting:

```bash
$ git config --global --unset core.editor
```

:::recap
### What you learned
- Git config has system, global and local levels; the most specific wins.
- Set `user.name` and `user.email` before your first commit. The email should match your GitHub account (or use GitHub's no-reply address).
- `init.defaultBranch main` makes new repositories start on `main`.
- A few settings (`pull.rebase`, `fetch.prune`, `push.autoSetupRemote`, `rerere`, `conflictStyle`, `autocrlf`) prevent common problems.
- `git config --list --show-origin` explains where each value comes from.

### Key terms
```terms
Global config :: Your personal settings in `~/.gitconfig`, used in every repository.
Local config :: Settings in one repository's `.git/config`, overriding global ones.
Default branch :: The first branch created by `git init`, set with `init.defaultBranch`.
Line endings :: The invisible characters at the end of each line; CRLF on Windows, LF elsewhere.
```

### Key commands
```commands
git config --global user.name "Name" :: Set your commit author name.
git config --global user.email "you@example.com" :: Set your commit email.
git config --global init.defaultBranch main :: Name the first branch of new repositories main.
git config --global core.editor "code --wait" :: Use VS Code for commit messages.
git config --list --show-origin :: Show every setting and the file it came from.
git config --global --edit :: Open your global config in the editor.
```

### Common mistakes
- Committing before setting name and email, so commits show a machine username.
- Using a personal email on work commits, or vice versa.
- Setting VS Code as the editor without `--wait`, causing "Aborting commit due to empty commit message".

### Quick quiz
```quiz
? Your global config sets user.email to a personal address. Inside a work repository, you run git config user.email "you@work.com". Which email will commits in that repository use?
- The personal address, because global always wins
+ The work address, because local config overrides global
- Both addresses
- Neither; Git reports a conflict
> Settings at the local (repository) level override global ones. `git config` without `--global` writes to the local level when run inside a repository.

? [tf] Changing user.email updates the email on commits you already made.
- True
+ False
> Author details are written into each commit when it is created. Changing config affects only future commits.

? What does init.defaultBranch main change?
- It renames the default branch of every repository on your machine
+ It makes git init create its first branch as main
- It changes the default branch on GitHub
- It changes which branch git clone checks out
> The setting applies only to new repositories created with `git init`.

? [troubleshoot] You set core.editor to "code" and every commit without -m fails with "Aborting commit due to empty commit message". Why?
- VS Code is not supported
+ Without --wait, VS Code returns immediately, so Git reads an empty message
- Your email is not set
- The staging area is empty
> Use `code --wait` so Git waits until you close the message tab.
```

### Practical exercise
````exercise Configure your machine
1. Set your name and email globally.
2. Set the default branch to `main`.
3. Set an editor you are comfortable with.
4. Apply the recommended settings from this chapter (choose `pull.rebase false` unless your team says otherwise).
5. Run `git config --list --show-origin` and confirm every value came from your global config file.
---solution---
```bash
$ git config --global user.name "Your Name"
$ git config --global user.email "you@example.com"
$ git config --global init.defaultBranch main
$ git config --global core.editor "code --wait"
$ git config --global pull.rebase false
$ git config --global fetch.prune true
$ git config --global push.autoSetupRemote true
$ git config --global rerere.enabled true
$ git config --global merge.conflictStyle zdiff3
$ git config --list --show-origin
```
Each line should show `file:` followed by the path to your `.gitconfig` in your home folder.
````

### What to learn next
Git knows who you are. Next, prove it to GitHub: choosing between SSH and HTTPS, and setting up authentication.
:::
