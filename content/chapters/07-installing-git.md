---
id: installing-git
part: 2
title: Installing Git
minutes: 15
level: Beginner
topics: 17 Installing Git | 18 Checking the installation
objectives:
- Install Git on Windows, macOS or Linux using the recommended method
- Choose sensible options in the Windows installer
- Verify the installation and find which Git binary your terminal uses
- Open a terminal and know where you are before running Git commands
concepts: terminal | PATH | Git Bash | Command Line Tools
commands: git --version | which git | where git
---
Git is a command-line program. Editors like VS Code and IntelliJ have Git buttons, but they all run this same program underneath. Installing it properly takes ten minutes and saves hours of confusion later.

## Before you start: find a terminal

You will type Git commands into a **terminal** (also called a shell or command line).

| System | Terminal to use |
|---|---|
| Windows | **Git Bash** (installed with Git), or Windows Terminal with PowerShell |
| macOS | **Terminal** (Applications → Utilities) or iTerm2 |
| Linux | Your distribution's terminal app |
| Any | The integrated terminal inside VS Code, JetBrains IDEs, etc. |

This book's examples use a Unix-style shell (`bash`/`zsh`). On Windows, Git Bash gives you exactly that, which is why it is the easiest place to follow along.

## Installing on Windows

The standard distribution is **Git for Windows**.

**Option A: installer.** Download it from the official site, [git-scm.com](https://git-scm.com/downloads), and run it.

**Option B: winget** (built into Windows 10 and 11):

```powershell
winget install --id Git.Git -e --source winget
```

The installer asks many questions. The defaults are good; these are the ones worth reading:

| Screen | Recommended choice | Why |
|---|---|---|
| Default editor | Visual Studio Code (or an editor you know) | The default is Vim, which confuses newcomers when Git opens it for a commit message |
| Initial branch name | **Override the default: `main`** | Matches GitHub and most modern teams |
| PATH environment | Git from the command line and also from 3rd-party software | Lets PowerShell, your IDE and other tools find `git` |
| SSH executable | Use bundled OpenSSH | Works out of the box |
| Line endings | Checkout Windows-style, commit Unix-style | Keeps repositories consistent across operating systems (Chapter 8) |
| Terminal emulator | MinTTY | Better Git Bash window |
| Credential helper | Git Credential Manager | Lets you sign in to GitHub in the browser instead of pasting tokens |

After installing, open **Git Bash** from the Start menu.

## Installing on macOS

macOS offers to install Git as part of Apple's **Command Line Tools**. The first time you type `git` in Terminal, a dialog appears; click **Install**. You can also trigger it yourself:

```bash
$ xcode-select --install
```

Apple's bundled Git is often a few versions behind. For the latest version, use [Homebrew](https://brew.sh):

```bash
$ brew install git
```

Homebrew installs Git into its own folder and puts it ahead of Apple's on your PATH (after you open a new terminal window).

## Installing on Linux

Use your distribution's package manager:

```bash
# Debian, Ubuntu, Mint
$ sudo apt update && sudo apt install git

# Fedora, RHEL
$ sudo dnf install git

# Arch
$ sudo pacman -S git
```

Ubuntu's default package can lag behind. The official Git maintainers publish a newer build via `sudo add-apt-repository ppa:git-core/ppa` if you need it.

## Checking the installation

Open a **new** terminal window (so it picks up any PATH changes) and run:

```bash
$ git --version
git version 2.46.0
```

Any version from 2.23 upward supports all everyday commands in this book (`git switch` and `git restore` arrived in 2.23). A few optional settings mention a minimum version where it matters. If yours is older than 2.23, upgrade.

### Which Git is my terminal running?

Machines sometimes have more than one Git installed (for example Apple's and Homebrew's). To see which one runs:

```bash
# macOS / Linux / Git Bash
$ which git
/opt/homebrew/bin/git

# Windows Command Prompt or PowerShell
> where git
C:\Program Files\Git\cmd\git.exe
```

```cmd
which git
which :: A shell command that prints the full path of the program that would run for a given name.
git :: The program name to look up.
```

:::mistake "git is not recognized as an internal or external command"
Windows cannot find Git on its PATH. Either the installer's PATH option was set to "Git Bash only", or the terminal was opened before installation finished. Close and reopen the terminal first. If it still fails, rerun the installer and choose "Git from the command line and also from 3rd-party software".
:::

## Terminal survival kit

A few shell commands you will use alongside Git:

| Command | Does |
|---|---|
| `pwd` | Print the folder you are in ("print working directory") |
| `ls` (or `dir` in cmd) | List files in this folder |
| `ls -a` | List including hidden files, such as `.git` |
| `cd projects/shop` | Change into a folder |
| `cd ..` | Go up one folder |
| `mkdir demo` | Create a folder |
| `clear` | Clear the screen |

:::tip Always know where you are
Git acts on the repository that contains your current folder. Many beginner accidents, like creating a repository in your home folder, come from running Git in the wrong place. Run `pwd` when in doubt.
:::

## GUI tools and editors

You can use Git through visual tools: VS Code's Source Control panel, JetBrains IDEs, GitHub Desktop, Sourcetree, GitKraken and others. They are genuinely useful, especially for reviewing diffs and resolving conflicts. This book teaches the command line first because:

- every GUI button maps to a command you will now understand,
- documentation, error messages and teammates speak in commands,
- recovery tools like `reflog` are easiest from the terminal.

Use whatever mix you like once the concepts are solid.

:::recap
### What you learned
- Windows: install Git for Windows (installer or `winget`) and use Git Bash. macOS: Command Line Tools or Homebrew. Linux: your package manager.
- In the Windows installer, pick a familiar editor, set the default branch to `main`, and use Git Credential Manager.
- Verify with `git --version` in a new terminal; 2.23 or newer is required for this book.
- `which git` / `where git` shows which installation runs.

### Key terms
```terms
Terminal :: A text window where you type commands.
PATH :: The list of folders your system searches for programs when you type a command name.
Git Bash :: A Unix-style terminal installed with Git for Windows.
Command Line Tools :: Apple's developer package that includes Git on macOS.
```

### Key commands
```commands
git --version :: Show the installed Git version.
which git :: Show which Git executable runs (macOS, Linux, Git Bash).
where git :: Show which Git executable runs (Windows cmd or PowerShell).
```

### Common mistakes
- Leaving Vim as the default editor without knowing how to exit it (type `:q!` then Enter to abandon, or `:wq` to save and quit).
- Testing in a terminal that was open before installation.
- Running Git commands from the wrong folder.

### Quick quiz
```quiz
? What is the minimum Git version for the git switch and git restore commands used in this book?
- 1.8
- 2.0
+ 2.23
- 2.40
> `switch` and `restore` were added in Git 2.23 (2019) to split up the overloaded `checkout` command.

? [troubleshoot] You installed Git on Windows, but PowerShell says "git is not recognized". What should you try first?
+ Close and reopen the terminal so it picks up the updated PATH
- Reinstall Windows
- Delete the .git folder
- Run git init
> Terminals read PATH when they start. A terminal opened before installation will not see Git until you reopen it.

? [predict] What might this print on a Mac with Homebrew?
| $ which git
+ /opt/homebrew/bin/git
- git version 2.46.0
- On branch main
- fatal: not a git repository
> `which` prints the path of the executable that runs. Homebrew installs to /opt/homebrew on Apple silicon Macs (/usr/local on Intel Macs).

? [tf] You must install GitHub Desktop to use Git.
- True
+ False
> GitHub Desktop is an optional graphical client. Git itself is a command-line program.
```

### Practical exercise
```exercise Install and verify
1. Install Git using the method for your operating system.
2. Open a new terminal and run `git --version`.
3. Run `which git` (or `where git` on Windows) and note the path.
4. Run `pwd`, then `cd` into the folder where you keep code projects (create one called `code` in your home folder if you have none).
---solution---
You should see a version of 2.23 or newer and a path such as `/usr/bin/git`, `/opt/homebrew/bin/git` or `C:\Program Files\Git\cmd\git.exe`. If the version is older than 2.23, update Git (Homebrew: `brew upgrade git`; Windows: rerun the installer; Linux: use your package manager or the git-core PPA on Ubuntu).
```

### What to learn next
Git is installed but does not know who you are yet. Next, configure your name, email, default branch and a few settings that prevent common headaches.
:::
