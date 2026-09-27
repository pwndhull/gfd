---
id: recovery-bad-commits
part: 16
title: "Recovery: Wrong Files, Leaked Secrets and Pushed Mistakes"
minutes: 26
level: Professional
topics: Committed the wrong file | Accidentally committed secrets | Need to undo a pushed commit
objectives:
- Remove a wrongly committed file from the last commit or from an older unpushed commit
- Respond correctly to a leaked secret: rotate first, then clean up
- Remove a file from all of history with git filter-repo, and understand the consequences
- Undo a pushed commit safely with revert
concepts: amend | interactive rebase | revert | secret | rewriting history | force push
commands: git rm --cached | git commit --amend | git rebase -i | git filter-repo | git revert | git push --force-with-lease
---
Three of the most common "oh no" moments: something that shouldn't be in a commit is in it, a secret escaped into history, or a commit that's already public needs to go. Each has a safe path and a tempting wrong one.

---

## Scenario 4: Committed the wrong file

:::scenario Situation
Your last commit includes `debug.log` and a half-edited `config/local.json` alongside the real change.
:::

### What happened

The staging area contained more than you intended when you ran `git commit` (typically after `git add .`).

### Safest recovery: the last commit, not pushed

Remove the files from the commit (keeping them on disk) and amend:

```bash
$ git rm --cached debug.log                               # stop tracking; file stays on disk
$ git restore --staged --source=HEAD~1 config/local.json  # put the previous version back in the index
$ git commit --amend --no-edit
$ echo "*.log" >> .gitignore                              # stop it happening again
```

The first command removes a file that shouldn't be tracked at all. The second undoes an unwanted *change* to a tracked file while leaving your edit in the working directory (Chapter 30).

Alternatively, unpack the whole commit and recommit precisely:

```bash
$ git reset --soft HEAD~1           # undo the commit; everything stays staged
$ git restore --staged debug.log config/local.json
$ git commit -m "Add coupon validation"
```

### An older commit, not pushed

Use interactive rebase with `edit` on the offending commit (Chapter 38):

```bash
$ git rebase -i origin/main
# change "pick" to "edit" on the commit with the wrong file
$ git rm --cached debug.log
$ git commit --amend --no-edit
$ git rebase --continue
```

### Already pushed

- **Your own branch, open PR**: do the same, then `git push --force-with-lease`, and tell reviewers.
- **Shared branch or main**: just make a new commit removing it (`git rm --cached debug.log && git commit -m "Stop tracking debug.log"`). History keeps the old file, which is harmless for a log file. If it's a **secret**, go to Scenario 5 instead.

### Dangerous alternatives

- `git rm debug.log` without `--cached` if you wanted to keep the local file (it deletes it from disk too).
- Force-pushing shared branches for cosmetic cleanup.

### Prevention

- `git status` and `git diff --staged` before every commit (Chapter 15).
- A good `.gitignore` from day one (Chapter 16); prefer `git add <paths>` or `git add -p` over `git add .`.

---

## Scenario 5: Accidentally committed secrets

:::scenario Situation
You committed `.env` containing a production database password and a payment provider API key, and pushed it. The repository is private.
:::

### What happened

The secret is now in a commit object, in your remote, in every clone and fork anyone made since, possibly in CI logs, PR caches and search indexes. **Deleting the file in a new commit does not remove it from history.** Anyone with access can run `git log -p` and read it.

### Safest recovery: rotate first, clean second

:::danger Step 1 is not a Git command
**Revoke and rotate the secret immediately**: generate a new password or key in the provider's dashboard and disable the old one. Assume it's compromised, even in a private repository. Everything else is secondary. History rewriting can take hours to coordinate; a leaked key can be abused in minutes.
:::

Then:

**Step 2: stop tracking it going forward.**

```bash
$ echo ".env" >> .gitignore
$ git rm --cached .env
$ git commit -m "Stop tracking .env"
$ git push
```

**Step 3: decide whether to purge history.** Once the secret is rotated, the old value is useless, and many teams stop here. Purge history when policy or compliance requires it, when the data can't be rotated (personal data, for example), or when you just can't have it lingering.

**Step 4 (if purging): rewrite history with git filter-repo.** It's the tool recommended by the Git project (install it separately, e.g. `pip install git-filter-repo` or your package manager). Work in a **fresh clone**:

```bash
$ git clone git@github.com:acme/shop.git shop-cleanup
$ cd shop-cleanup
$ git filter-repo --invert-paths --path .env               # remove the file from every commit
# or replace just the secret strings, keeping the file:
$ git filter-repo --replace-text ../secrets-to-remove.txt  # lines like: sk_live_abc123==>REMOVED
$ git remote add origin git@github.com:acme/shop.git       # filter-repo removes origin as a safety measure
$ git push origin --force --all
$ git push origin --force --tags
```

(`--all` pushes local branches only, so make sure every branch that contained the secret exists locally in the clone first, e.g. `git switch` to each remote branch before filtering.)

```cmd
git filter-repo --invert-paths --path .env
filter-repo :: Rewrite the entire repository history (a separate tool, not bundled with Git).
--path .env :: Select this path.
--invert-paths :: Keep everything EXCEPT the selected paths, i.e. remove .env from all commits.
```

This rewrites **every** commit that ever contained the file, so every hash from that point changes. Consequences you must manage:

- **Everyone must re-clone** (or carefully reset every branch). If anyone pushes an old branch, the secret comes back.
- **Open pull requests** based on old history break and must be recreated or rebased.
- **GitHub keeps cached references** (for example, in old PRs). Its documentation on removing sensitive data explains contacting GitHub Support to purge them.
- **Forks and existing clones** still contain the secret. That's why rotation comes first.

The older **BFG Repo-Cleaner** does similar work and is still widely used; the Git documentation now recommends `git filter-repo` over the built-in `git filter-branch`, which is slow and error-prone.

### If you haven't pushed yet

Much simpler: nothing left your machine. Remove the file from the commit (Scenario 4: `git rm --cached` + amend, or interactive rebase for an older commit), verify with `git log -p --all -S "the-secret"` that it's gone from every local commit, then push. Rotating is still wise if there's any doubt.

### Dangerous alternatives

- Deleting the file in a new commit and thinking it's gone.
- Rewriting history but not rotating.
- Rewriting a shared repository without telling the team, then watching someone push the old history back.

### Prevention

- Never keep secrets in the repository: use environment variables, a secrets manager, or CI secrets (Chapter 55). Commit `.env.example` with placeholder values.
- `.env` in `.gitignore` from the first commit.
- Turn on GitHub's **secret scanning** and **push protection**, which block pushes containing recognisable credentials.
- A pre-commit hook scanning for secrets (Chapter 68), such as gitleaks or detect-secrets.

---

## Scenario 6: Need to undo a pushed commit

:::scenario Situation
Yesterday's commit `c07a1e4` "Change VAT calculation" is on `main`, deployed, and wrong. Other commits have landed after it.
:::

### What happened

A bad change is in shared history. People have pulled it; commits sit on top of it.

### Safest recovery: revert

```bash
$ git switch main && git pull
$ git revert c07a1e4
[main 9e2d1f0] Revert "Change VAT calculation"
$ git push                      # or open a PR with the revert, if main is protected
```

Revert adds a commit that undoes exactly that change (Chapter 42). Nothing is rewritten; teammates just pull one more commit. Explain **why** in the revert message.

| The pushed thing is… | Revert with |
|---|---|
| A single commit | `git revert <hash>` |
| Several commits | `git revert --no-edit A^..C` or `-n` then one commit |
| A merged PR (merge commit) | `git revert -m 1 <merge-hash>`, or GitHub's **Revert** button on the PR |
| A squash-merged PR | `git revert <squash-commit>` (it's a normal commit) |

If later commits changed the same lines, the revert conflicts; resolve it like any conflict, keeping the later work and removing only the bad change.

### When is force-pushing acceptable instead?

Only if **all** of these hold: the branch is yours alone (not `main`, not shared), nobody has based work on it, and you use `--force-with-lease`. On a personal feature branch, `git reset --hard HEAD~1 && git push --force-with-lease` is fine. On `main`, never.

### Dangerous alternatives

- `git reset --hard <before> && git push --force` on `main`: erases teammates' commits made after it and breaks everyone's clones.
- "Fixing forward" under pressure with a rushed patch when a clean revert is available. Revert first, then fix properly.

### Prevention

- Required reviews and CI on `main` (Chapter 53).
- Feature flags for risky changes (Chapter 56), so turning something off doesn't need a Git operation at all.
- Small PRs: easier to review, and easier to revert cleanly.

:::recap
### What you learned
- Wrong file in the last unpushed commit: `git rm --cached` or `restore --staged --source=HEAD~1`, then `--amend`; older commits via interactive rebase `edit`.
- Leaked secret: rotate first. Then stop tracking; purge history with `git filter-repo` only if needed, coordinating re-clones and GitHub cleanup.
- Pushed bad commit on a shared branch: `git revert` (with `-m 1` for merges). Force push only on your own branch with `--force-with-lease`.

### Key terms
```terms
Secret rotation :: Replacing a compromised credential with a new one and disabling the old one.
git filter-repo :: A separate tool that rewrites repository history, e.g. to remove files everywhere.
Push protection :: A GitHub feature that blocks pushes containing detected secrets.
Fix forward :: Correcting a bad change with a new change rather than reverting it.
```

### Key commands
```commands
git rm --cached <file> :: Remove a file from tracking, keep it on disk.
git commit --amend --no-edit :: Rewrite the last commit's content.
git rebase -i <base> :: Edit an older unpushed commit.
git filter-repo --invert-paths --path <file> :: Remove a file from all history.
git log -p --all -S "<secret>" :: Check whether a string appears anywhere in history.
git revert <hash> :: Undo a pushed commit safely.
```

### Common mistakes
- Believing a follow-up "delete .env" commit removes the secret.
- Rewriting history before rotating the credential.
- Force-pushing main to remove a bad commit.

### Quick quiz
```quiz
? [scenario] You pushed an API key to a private repository 10 minutes ago. What is the FIRST thing to do?
+ Revoke and rotate the key with the provider
- Run git filter-repo
- Delete the file and push a new commit
- Make the repository private
> Rotation neutralises the leak immediately; cleaning history comes after, if at all.

? [tf] Deleting .env in a new commit removes the secret from the repository.
- True
+ False
> Earlier commits still contain it; anyone can read it with git log -p.

? Which is the safest way to undo a bad commit that's on main and has commits after it?
+ git revert <hash>
- git reset --hard <hash>^ and force push
- git commit --amend
- git rebase -i and drop it, then force push
> Revert undoes the change without rewriting shared history.

? [state] Your last (unpushed) commit accidentally included debug.log. You run git rm --cached debug.log and git commit --amend --no-edit. Where is debug.log now?
+ Still on disk, but no longer in the commit or tracked
- Deleted from disk
- In a new separate commit
- Still in the commit
> --cached removes it from the index only; amend rebuilds the commit without it.
```

### Practical exercise
````exercise Clean up a fake leak
In a throwaway repository:
1. Commit `.env` containing `API_KEY=sk_test_leaked123`, then two more commits.
2. Show that deleting `.env` in a new commit leaves it in history (`git log -p --all -S sk_test_leaked123`).
3. If you have git-filter-repo installed, remove `.env` from all history and verify the search returns nothing. Otherwise, because nothing is pushed, use interactive rebase `edit` on the first commit to remove it.
---solution---
```bash
$ echo "API_KEY=sk_test_leaked123" > .env && git add .env && git commit -m "Add config"
$ echo a > a && git add a && git commit -m "A" && echo b > b && git add b && git commit -m "B"
$ git rm .env && git commit -m "Remove .env"
$ git log -p --all -S sk_test_leaked123 --oneline    # still shows "Add config"
$ git filter-repo --invert-paths --path .env --force  # --force because this isn't a fresh clone
$ git log -p --all -S sk_test_leaked123 --oneline    # nothing
```
filter-repo insists on a fresh clone by default as a safety measure; `--force` overrides it for this exercise only.
````

### What to learn next
Next: history accidents: a messed-up rebase, lost commits, a regretted `reset --hard` and an accidental force push.
:::
