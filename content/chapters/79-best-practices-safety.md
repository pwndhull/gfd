---
id: best-practices-safety
part: 17
title: Safety Practices: Force Pushes, Secrets and Signing
minutes: 20
level: Professional
topics: Avoiding force push | Force-with-lease | Secrets | .gitignore
objectives:
- Explain when force pushing is acceptable and when it never is
- Use --force-with-lease correctly, including its blind spot
- Keep secrets out of repositories with a layered defence
- Maintain a .gitignore that protects the team
- Sign commits and tags so others can verify authorship
concepts: force push | --force-with-lease | secret | .gitignore | signed commit | protected branch
commands: git push --force-with-lease | git push --force-if-includes | git config commit.gpgsign | git log --show-signature
---
Most Git mistakes are recoverable (Part 16). A few are expensive: overwriting teammates' work on a shared branch, and leaking credentials. This chapter is about never needing Part 16 for those.

## Force pushing: the rules

A force push replaces the remote branch's history with yours (Chapter 22). The rules, in order of importance:

1. **Never force push `main`, release branches or any branch others commit to.** Protect them so you can't (Chapter 53).
2. **On your own branch, prefer not rewriting history once review has started**; if you do, tell reviewers.
3. **When you must, use `--force-with-lease`, never `--force`.**
4. **Fetch and look before you rewrite.** Rewriting on top of a stale view is how lease protection gets bypassed.

### Why --force-with-lease

```cmd
git push --force-with-lease
--force-with-lease :: Overwrite the remote branch only if it still points where your remote-tracking branch (origin/<branch>) says. If someone pushed since your last fetch, refuse.
```

| | `--force` | `--force-with-lease` |
|---|---|---|
| Overwrites the remote unconditionally | Yes | No |
| Protects a teammate's push you haven't fetched | No | **Yes** |
| Protects a teammate's push you **have** fetched but not integrated | No | **No** |

That last row is the blind spot. If you run `git fetch` (updating `origin/feature`), then rebase **without** including the teammate's new commits, the lease is satisfied (the remote still matches your `origin/feature`) and their commits are dropped. Your editor may fetch in the background, which makes this easy to hit.

### Closing the blind spot: --force-if-includes

```bash
$ git push --force-with-lease --force-if-includes
```

`--force-if-includes` (Git 2.30+) additionally checks that the remote tip you're overwriting is **included** in your local branch's history (by looking at your reflog), so a background fetch can't silently authorise dropping work. Many developers set both via an alias:

```bash
$ git config --global alias.fpush "push --force-with-lease --force-if-includes"
```

### Alternatives to force pushing

- Add new commits instead of amending (reviewers can see what changed).
- Merge `main` into your branch instead of rebasing (Chapter 58).
- Squash at merge time with GitHub's **Squash and merge** instead of rewriting the branch.

## Secrets: a layered defence

No single measure is enough. Stack them:

| Layer | What to do |
|---|---|
| **Design** | Secrets live in environment variables, a secrets manager or CI secrets, never in code (Chapter 55) |
| **Ignore** | `.env`, `*.pem`, `*.key`, credentials files in `.gitignore` from the first commit; commit `.env.example` with placeholders |
| **Local hook** | A secret scanner in `pre-commit` (gitleaks, detect-secrets, trufflehog) (Chapter 68) |
| **Review** | Reviewers look for credentials in diffs |
| **Server** | GitHub secret scanning and **push protection**, which block pushes containing known credential formats |
| **Response** | A documented plan: rotate first, then clean history if required (Chapter 73) |

:::danger Private repositories are not a safe place for secrets
Private repositories get cloned onto laptops, forked, mirrored into CI caches, and opened to new employees and contractors. Treat anything committed as widely readable, forever.
:::

## .gitignore that protects the team

A good project `.gitignore` covers four groups (Chapter 16):

```gitignore title=".gitignore (typical Node.js service)"
# Dependencies and build output
node_modules/
dist/
coverage/

# Environment and secrets
.env
.env.*
!.env.example
*.pem
*.key

# Logs and runtime files
*.log
tmp/

# Tooling caches
.eslintcache
.turbo/
```

Personal editor and OS files (`.DS_Store`, `.idea/`) belong in your **global** excludes file, not the project's. Commit lock files. Review `.gitignore` when adding new tooling that produces output.

## Signing commits and tags

Anyone can set `user.name` to anyone. **Signed** commits and tags carry a cryptographic signature proving they were made by the holder of a key. GitHub shows a **Verified** badge, and branch protection can require signatures.

The simplest setup reuses your SSH key (Git 2.34+):

```bash
$ git config --global gpg.format ssh
$ git config --global user.signingkey ~/.ssh/id_ed25519.pub
$ git config --global commit.gpgsign true
$ git config --global tag.gpgsign true
```

Then add the same public key on GitHub as a **Signing key** (Settings → SSH and GPG keys → New SSH key → Key type: Signing Key).

```bash
$ git log --show-signature -1        # verify locally (needs an allowed-signers file for SSH)
```

GPG and S/MIME signing work too; use whatever your organisation standardises on.

## Other safety habits

- **`git status` before destructive commands** (`reset --hard`, `restore`, `clean`, `checkout -- .`).
- **Stash instead of discard** when unsure (Chapter 44).
- **Push feature branches daily**: the server is your backup.
- **Don't re-clone to escape a mess**; read the reflog (Chapter 43).
- **Keep Git updated**: newer versions have safer defaults and clearer messages.

:::recap
### What you learned
- Never force push shared branches; protect main and release branches.
- Use `--force-with-lease`, ideally with `--force-if-includes`, only on branches you own; fetch and look first.
- Defend against secret leaks in layers: design, ignore, hooks, review, server-side scanning with push protection, and a rotation plan.
- Maintain a project `.gitignore` for dependencies, build output, env files, logs and caches; keep personal clutter global.
- Sign commits and tags (SSH signing is easiest) to prove authorship.

### Key terms
```terms
Force push :: Replacing a remote branch's history with yours.
--force-with-lease :: A force push that refuses if the remote moved since your last fetch.
--force-if-includes :: An extra check that the remote tip you're overwriting is in your local history.
Push protection :: GitHub's server-side blocking of pushes containing detected secrets.
Signed commit :: A commit with a cryptographic signature verifying its author.
```

### Key commands
```commands
git push --force-with-lease --force-if-includes :: The safest form of force push.
git config --global gpg.format ssh :: Sign with SSH keys.
git config --global commit.gpgsign true :: Sign every commit.
git log --show-signature :: Show signature verification.
git config --global core.excludesFile ~/.gitignore_global :: Personal ignore rules.
```

### Common mistakes
- Using `--force` out of habit.
- Believing `--force-with-lease` is always safe even after a background fetch.
- Keeping "just a test key" in a private repository.
- Adding personal editor files to the project `.gitignore` instead of a global one.

### Quick quiz
```quiz
? [scenario] Your editor fetched in the background, picking up a teammate's commit on your shared branch. You rebase without including it and push with --force-with-lease. What happens?
+ The push succeeds and the teammate's commit is dropped from the branch
- The push is rejected
- Git merges their commit automatically
- The rebase fails
> The lease compares with origin/<branch>, which the fetch updated. --force-if-includes catches this.

? What is the FIRST layer of defence against leaked secrets?
+ Designing the app so secrets live outside the repository (environment variables, a secrets manager)
- git filter-repo
- A private repository
- Code review
> The best leak is one that can't happen because the secret was never in a file Git sees.

? [tf] Branch protection can require that commits be signed.
+ True
- False
> Requiring signed commits is one of the available rules.

? Which force push is safest?
- git push --force
- git push -f
+ git push --force-with-lease --force-if-includes
- git push --mirror
> Lease protects against unseen pushes; if-includes guards against fetched-but-unintegrated work.
```

### Practical exercise
````exercise Harden your setup
1. Add the `fpush` alias with both lease flags.
2. Configure SSH commit signing and add the key to GitHub as a signing key; make a signed commit and check GitHub shows "Verified".
3. Review one of your repositories' `.gitignore` files against the four groups in this chapter.
4. If you have admin access to a GitHub repository, enable secret scanning and push protection.
---solution---
```bash
$ git config --global alias.fpush "push --force-with-lease --force-if-includes"
$ git config --global gpg.format ssh
$ git config --global user.signingkey ~/.ssh/id_ed25519.pub
$ git config --global commit.gpgsign true
$ git commit --allow-empty -m "Test signed commit" && git push
```
On GitHub, the commit shows a green "Verified" label once the same public key is registered as a Signing Key. Secret scanning and push protection are under the repository's Settings → Code security.
````

### What to learn next
The final chapter of the book covers how Git interacts with CI/CD and how professional teams release.
:::
