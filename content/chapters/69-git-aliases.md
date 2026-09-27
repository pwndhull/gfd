---
id: git-aliases
part: 15
title: Git Aliases
minutes: 12
level: Intermediate
topics: 150 Git aliases
objectives:
- Create, list and remove Git aliases
- Write aliases for multi-option commands and for shell commands
- Build a small personal toolkit of genuinely useful aliases
- Avoid aliases that hide dangerous behaviour
concepts: alias | global config
commands: git config --global alias.<name> | git config --get-regexp alias | git config --global --unset alias.<name>
---
Once you've typed `git log --oneline --graph --decorate --all` fifty times, you'll want a shortcut. **Aliases** let you define your own Git sub-commands.

## Creating an alias

```cmd
git config --global alias.st "status -sb"
config --global :: Write to your personal config file.
alias.st :: Define the alias "st". After this, git st works.
"status -sb" :: What it expands to: everything after "git".
```

```bash
$ git st
## main...origin/main [ahead 1]
 M src/cart.js
```

Extra arguments are appended: `git st src/` runs `git status -sb src/`.

## A practical starter set

```bash
$ git config --global alias.st "status -sb"
$ git config --global alias.sw "switch"
$ git config --global alias.br "branch -vv --sort=-committerdate"
$ git config --global alias.lg "log --oneline --graph --decorate"
$ git config --global alias.lga "log --oneline --graph --decorate --all"
$ git config --global alias.last "log -1 --stat"
$ git config --global alias.unstage "restore --staged"
$ git config --global alias.amend "commit --amend --no-edit"
$ git config --global alias.fpush "push --force-with-lease"
$ git config --global alias.incoming "log --oneline ..@{u}"
$ git config --global alias.outgoing "log --oneline @{u}.."
```

| Alias | Why it's useful |
|---|---|
| `git st` | Status you'll read hundreds of times a day, compact |
| `git br` | Branches with upstreams, most recent first |
| `git lg` / `git lga` | The graph views from Chapter 14 |
| `git last` | "What did I just commit?" |
| `git unstage <file>` | Reads like what it does |
| `git amend` | Add staged changes to the last commit |
| `git fpush` | Makes the **safe** force push the easy one to type |
| `git incoming` / `git outgoing` | What you'd pull / push (Chapter 23) |

## Shell command aliases

Start the value with `!` to run a shell command instead of a Git sub-command:

```bash
$ git config --global alias.root '!pwd'                        # prints the repository's top folder
$ git config --global alias.gone "!git fetch --prune && git branch -vv | grep ': gone]'"
$ git config --global alias.wip '!git add -A && git commit -m "WIP" --no-verify'
```

Shell aliases run from the **top of the repository**, and can chain several commands. Quote carefully: single quotes outside, double inside, or vice versa.

## Seeing and removing aliases

```bash
$ git config --get-regexp '^alias\.'
alias.st status -sb
alias.lg log --oneline --graph --decorate
$ git config --global --unset alias.wip
```

Or open `~/.gitconfig` with `git config --global --edit`; aliases live under `[alias]`:

```ini title="~/.gitconfig"
[alias]
	st = status -sb
	lg = log --oneline --graph --decorate
	fpush = push --force-with-lease
```

## Guidelines

- **You can't override built-in commands**: an alias named `log` is ignored.
- **Don't hide danger behind a friendly name.** An alias like `git undo = reset --hard HEAD~1` destroys uncommitted work with no warning. If you alias destructive commands, make the name say so (`git nuke`), or better, don't.
- **Learn the full command first.** Aliases are for speed, not for skipping understanding. When pairing or reading documentation, you'll need the real names.
- **Keep your list short.** A dozen well-chosen aliases beats fifty you forget.

:::recap
### What you learned
- `git config --global alias.<name> "<command>"` creates an alias; arguments are appended.
- Values starting with `!` run shell commands from the repository root.
- List with `git config --get-regexp '^alias\.'`; remove with `--unset`; edit `[alias]` in `~/.gitconfig`.
- Aliases can't replace built-ins; avoid friendly names for destructive commands; learn the real commands first.

### Key terms
```terms
Alias :: A user-defined shortcut for a Git command.
Shell alias :: An alias starting with ! that runs arbitrary shell commands.
```

### Key commands
```commands
git config --global alias.<name> "<cmd>" :: Create an alias.
git config --get-regexp '^alias\.' :: List aliases.
git config --global --unset alias.<name> :: Remove an alias.
git config --global --edit :: Edit aliases in your config file.
```

### Common mistakes
- Aliasing `reset --hard` as something innocent-looking.
- Forgetting the `!` for shell aliases.
- Quoting mistakes in shell aliases that break on the first run.

### Quick quiz
```quiz
? [predict] After git config --global alias.lg "log --oneline --graph", what does git lg -5 run?
+ git log --oneline --graph -5
- git lg -5, which fails
- git log -5 only
- git --oneline --graph -5
> Extra arguments are appended to the expansion.

? What does a leading ! in an alias value mean?
+ Run it as a shell command
- Make the alias mandatory
- Run it as administrator
- Disable the alias
> Shell aliases can call other programs and chain commands.

? [tf] You can define an alias named "commit" to change git commit's behaviour.
- True
+ False
> Aliases that clash with built-in commands are ignored.
```

### Practical exercise
```exercise Build your toolkit
Add at least five aliases from this chapter that you'd genuinely use, plus one shell alias of your own. List them with `git config --get-regexp '^alias\.'`, and use each once in a practice repository.
---solution---
Any sensible set works. A good minimal toolkit is `st`, `lg`, `br`, `unstage`, `amend`, `fpush`, and the shell alias `gone` from this chapter for finding merged branches whose upstream was deleted.
```

### What to learn next
You've used Git from the outside. The last two chapters of Part 15 open the hood: Git's object database and references.
:::
