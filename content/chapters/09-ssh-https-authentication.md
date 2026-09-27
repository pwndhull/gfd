---
id: ssh-https-authentication
part: 2
title: SSH, HTTPS and GitHub Setup
minutes: 24
level: Beginner
topics: 23 SSH vs HTTPS | 24 Authentication | 25 GitHub setup
objectives:
- Explain the difference between SSH and HTTPS remote URLs
- Authenticate to GitHub over HTTPS using a credential manager or token
- Create an SSH key, add it to GitHub and test the connection
- Set up a GitHub account safely, including two-factor authentication
- Switch an existing repository from one protocol to the other
concepts: SSH | HTTPS | personal access token | SSH key | credential manager | two-factor authentication
commands: ssh-keygen | ssh -T git@github.com | git remote set-url | gh auth login
---
Git can talk to GitHub over two protocols. Both are secure and both work well; teams usually have a preference. This chapter shows how each works, how to authenticate with each, and how to set up a GitHub account the way professional teams expect.

## Two kinds of remote URL

The same repository has two URLs. You can see both on GitHub under the green **Code** button.

```text
HTTPS:  https://github.com/acme/shop.git
SSH:    git@github.com:acme/shop.git
```

| | HTTPS | SSH |
|---|---|---|
| How you prove who you are | Signing in through a credential manager, or a token | A key pair stored on your computer |
| Setup effort | Very low with Git Credential Manager | About five minutes, once per computer |
| Works through strict firewalls | Yes (port 443, like any website) | Usually (port 22; GitHub also offers SSH on 443) |
| Passwords typed daily | None, once the credential manager is set up | None, once the key is loaded |
| Common preference | Beginners, Windows users, corporate networks | Many developers on macOS and Linux |

Either is fine. If your team has no preference, start with HTTPS plus a credential manager because it has the fewest steps. If your team's docs say "clone with SSH", follow the SSH section.

:::warning Your GitHub password does not work for Git
Since 2021, GitHub rejects account passwords for Git operations over HTTPS. If Git prompts for a username and password and your real password fails with "Authentication failed", that is expected. Use a credential manager (browser sign-in) or a personal access token instead.
:::

## Option 1: HTTPS with a credential manager

A **credential helper** is a program Git asks for your login details. Instead of prompting you, it signs you in once (usually through your browser) and stores the credential securely in your operating system's keychain.

- **Windows**: Git Credential Manager is installed with Git for Windows. The first time you push, a browser window opens to sign in to GitHub. That's it.
- **macOS**: Git uses the macOS Keychain helper (`osxkeychain`). You can also install Git Credential Manager via Homebrew for browser sign-in.
- **Any system with the GitHub CLI**: `gh auth login` walks you through signing in and configures Git to use it.

```bash
$ gh auth login
? Where do you use GitHub? GitHub.com
? What is your preferred protocol for Git operations on this host? HTTPS
? Authenticate Git with your GitHub credentials? Yes
? How would you like to authenticate GitHub CLI? Login with a web browser
```

Check which helper is active:

```bash
$ git config --global credential.helper
manager
```

### Personal access tokens

If you cannot use a browser sign-in (on a server, for example), GitHub lets you create a **personal access token** (PAT) in Settings → Developer settings. You paste the token wherever Git asks for a password. Treat it like a password:

- choose a **fine-grained** token limited to the repositories you need,
- give it an expiry date,
- never commit it to a repository or paste it in chat.

## Option 2: SSH keys

SSH uses a **key pair**:

- a **private key** that never leaves your computer,
- a **public key** that you give to GitHub.

When you connect, your computer proves it holds the private key without sending it. It is like having a unique physical key where GitHub keeps a record of which lock shape belongs to you.

### Step 1: check for an existing key

```bash
$ ls ~/.ssh
id_ed25519  id_ed25519.pub  known_hosts
```

If you see `id_ed25519` and `id_ed25519.pub` (or `id_rsa` and `id_rsa.pub`), you already have a key. Skip to step 3.

### Step 2: create a key

```cmd
ssh-keygen -t ed25519 -C "priya@acme.dev"
ssh-keygen :: The OpenSSH tool that creates key pairs. It is separate from Git but installed alongside it.
-t ed25519 :: The key type. Ed25519 is modern, short and recommended by GitHub.
-C "priya@acme.dev" :: A comment stored in the public key to help you recognise it later. Your email is conventional.
```

Press Enter to accept the default file location. When asked for a **passphrase**, set one: it encrypts the private key, so a stolen laptop does not mean a stolen key. The SSH agent (next step) means you rarely type it.

### Step 3: load the key into the SSH agent

The **SSH agent** holds your unlocked key in memory so you type the passphrase once per session.

```bash title="macOS"
$ eval "$(ssh-agent -s)"
$ ssh-add --apple-use-keychain ~/.ssh/id_ed25519
```

On macOS, also add this to `~/.ssh/config` so the key loads automatically after restarts:

```text title="~/.ssh/config"
Host github.com
  AddKeysToAgent yes
  UseKeychain yes
  IdentityFile ~/.ssh/id_ed25519
```

```bash title="Windows (Git Bash) and Linux"
$ eval "$(ssh-agent -s)"
$ ssh-add ~/.ssh/id_ed25519
```

### Step 4: add the public key to GitHub

Print the **public** key (the `.pub` file) and copy it:

```bash
$ cat ~/.ssh/id_ed25519.pub
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGq... priya@acme.dev
```

On GitHub: **Settings → SSH and GPG keys → New SSH key**. Give it a title like "Work laptop 2026", paste, and save.

:::danger Never share the private key
The file without `.pub` is your private key. It should never be pasted anywhere, emailed or committed. If you think it leaked, delete the public key from GitHub immediately and create a new pair.
:::

### Step 5: test the connection

```bash
$ ssh -T git@github.com
Hi priya-sharma! You've successfully authenticated, but GitHub does not provide shell access.
```

That slightly odd message is success. The first time, SSH asks whether to trust GitHub's host fingerprint; GitHub publishes its fingerprints in its documentation so you can compare before typing `yes`.

## Switching an existing repository between HTTPS and SSH

If you cloned with one protocol and want the other, change the remote URL. No re-cloning needed.

```cmd
git remote set-url origin git@github.com:acme/shop.git
remote set-url :: Change the URL stored for an existing remote.
origin :: Which remote to change.
git@github.com:acme/shop.git :: The new URL. Here, the SSH form.
```

```bash
$ git remote -v
origin  https://github.com/acme/shop.git (fetch)
origin  https://github.com/acme/shop.git (push)
$ git remote set-url origin git@github.com:acme/shop.git
$ git remote -v
origin  git@github.com:acme/shop.git (fetch)
origin  git@github.com:acme/shop.git (push)
```

## Setting up your GitHub account

A professional setup takes ten minutes:

1. **Username.** Choose something you are happy to have on your CV. Many companies use your personal account added to their organisation.
2. **Two-factor authentication (2FA).** GitHub requires 2FA for anyone who contributes code. Use an authenticator app or a passkey/security key, and **save the recovery codes** somewhere safe.
3. **Email settings.** Add your work email as a secondary address so work commits link to your profile. Consider "Keep my email addresses private" for personal work.
4. **Profile.** Add your real name and a photo so reviewers recognise you.
5. **Join your organisation.** Accept the invitation your team sends. Some companies require single sign-on (SSO); if so, you may need to authorise your SSH key or token for the organisation (GitHub shows a **Configure SSO** button next to the key).
6. **Authentication.** Set up HTTPS or SSH as described above.
7. **Optional: GitHub CLI.** Install `gh` to create pull requests and check CI from the terminal.

:::tip Test with your team's repository
Once set up, try `git ls-remote <your-team-repo-url>`. It lists the remote's branches without cloning anything. If it works, authentication is good. If it says "Repository not found" for a repository you know exists, you are usually not yet a member of the organisation, or SSO has not been authorised.
:::

## Troubleshooting authentication

| Message | Usual cause | Fix |
|---|---|---|
| `Permission denied (publickey)` | SSH key not loaded or not added to GitHub | `ssh-add -l` to list loaded keys; add the key to GitHub; test with `ssh -T git@github.com` |
| `Authentication failed` over HTTPS | Account password used, or expired token | Use the credential manager or a new token |
| `Repository not found` | No access, typo in URL, or SSO not authorised | Check the URL; ask to be added; authorise SSO |
| `Host key verification failed` | SSH does not trust github.com yet, or GitHub's key changed | Remove the old entry with `ssh-keygen -R github.com` and reconnect, checking the fingerprint |

:::recap
### What you learned
- Remotes can use HTTPS (`https://github.com/...`) or SSH (`git@github.com:...`). Both are secure.
- HTTPS works best with a credential manager that signs you in through the browser. Account passwords no longer work for Git.
- SSH uses a key pair: keep the private key secret, add the public key to GitHub, test with `ssh -T git@github.com`.
- `git remote set-url` switches protocols without re-cloning.
- Enable 2FA on GitHub and store the recovery codes.

### Key terms
```terms
HTTPS remote :: A remote URL starting with https://, authenticated by a credential manager or token.
SSH remote :: A remote URL like git@github.com:org/repo.git, authenticated by an SSH key.
SSH key pair :: A private key kept on your machine and a public key given to GitHub.
SSH agent :: A background program that holds your unlocked private key.
Personal access token :: A revocable, scoped password substitute for Git over HTTPS.
Credential helper :: A program that stores and supplies your Git login securely.
```

### Key commands
```commands
ssh-keygen -t ed25519 -C "email" :: Create an SSH key pair.
ssh-add ~/.ssh/id_ed25519 :: Load a key into the SSH agent.
ssh -T git@github.com :: Test SSH authentication with GitHub.
git remote set-url origin <url> :: Change a remote's URL.
gh auth login :: Sign in with the GitHub CLI and configure Git credentials.
```

### Common mistakes
- Typing your GitHub password when Git asks for one over HTTPS.
- Pasting the private key instead of the `.pub` public key into GitHub.
- Forgetting to save 2FA recovery codes.
- Committing a token into a repository.

### Quick quiz
```quiz
? Which file should you paste into GitHub's "New SSH key" form?
- ~/.ssh/id_ed25519
+ ~/.ssh/id_ed25519.pub
- ~/.ssh/known_hosts
- ~/.gitconfig
> The `.pub` file is the public key, safe to share. The file without an extension is the private key and must never leave your machine.

? [predict] What does a successful SSH test print?
| $ ssh -T git@github.com
- Welcome to GitHub shell
+ Hi username! You've successfully authenticated, but GitHub does not provide shell access.
- Permission denied (publickey).
- Connection established
> The message confirms authentication. GitHub does not offer a shell, so the connection then closes.

? [troubleshoot] git push over HTTPS asks for a password, and your correct GitHub password fails. What is the fix?
- Reset your GitHub password
+ Use a credential manager or a personal access token instead of the account password
- Switch to the master branch
- Delete and re-clone the repository
> GitHub no longer accepts account passwords for Git operations over HTTPS.

? [scenario] You cloned with HTTPS, but your team uses SSH. What is the simplest change?
- Delete the folder and clone again with SSH
+ Run git remote set-url origin with the SSH URL
- Edit .git/HEAD
- Create a new remote called ssh and delete all branches
> `git remote set-url` changes the stored URL. Your history and branches are unaffected.
```

### Practical exercise
```exercise Connect to GitHub
1. Create or sign in to your GitHub account and enable two-factor authentication.
2. Choose HTTPS or SSH and set up authentication using this chapter's steps.
3. Test: for SSH, run `ssh -T git@github.com`; for HTTPS, run `git ls-remote https://github.com/git/git.git` (a public repository) and then try it on one of your team's repositories.
---solution---
For SSH, success is the "Hi username! You've successfully authenticated" message. For HTTPS, `git ls-remote` prints a list of hashes and branch names such as `refs/heads/main`. If the public repository works but your team's does not, check that you accepted the organisation invitation and authorised SSO for your key or token.
```

### What to learn next
Setup is done. Part 3 starts real work: creating your first repository and learning the add–commit loop you will use every day.
:::
