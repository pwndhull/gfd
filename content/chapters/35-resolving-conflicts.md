---
id: resolving-conflicts
part: 7
title: Resolving and Aborting Conflicts
minutes: 26
level: Intermediate
topics: 75 Resolving conflicts | 76 Aborting merges | 77 Practical conflict scenarios
objectives:
- Resolve a content conflict by hand and complete the merge
- Choose a whole side for a file with --ours and --theirs, at the right moment
- Use your editor's merge tool effectively
- Abort a merge cleanly and know what that restores
- Handle the conflicts that come up most on real teams, including lock files and deleted files
concepts: merge conflict | ours | theirs | conflict markers | merge commit | rerere
commands: git add | git merge --continue | git merge --abort | git restore --ours | git restore --theirs | git checkout -m | git diff --check
---
Resolving a conflict is a four-step routine you'll repeat for years. The mechanics take a minute; the judgement (what should the combined code actually be?) is the real work, and it gets easier with practice.

## The routine

1. **Find** the conflicted files: `git status`.
2. **Edit** each one into the correct final version and delete every marker.
3. **Mark** each file resolved: `git add <file>`.
4. **Finish** the merge: `git commit` (or `git merge --continue`).

Let's resolve the `timeout` conflict from Chapter 34's exercise.

```bash
$ git merge slow
Auto-merging config.txt
CONFLICT (content): Merge conflict in config.txt
Automatic merge failed; fix conflicts and then commit the result.
```

### Step 2: edit

```text title="config.txt (conflicted)"
<<<<<<< HEAD
timeout = 30
||||||| 5d2f90b
timeout = 10
=======
timeout = 60
>>>>>>> slow
```

Ask: **what did each side intend?** `git log --merge -p` shows the commits:

- `main`: "Raise timeout slightly" (10 → 30),
- `slow`: "Raise timeout for slow API" (10 → 60).

Both wanted a longer timeout; `slow` needs 60 for a specific API. The right answer here is 60. Edit the file to exactly the final content:

```text title="config.txt (resolved)"
timeout = 60
```

No markers, no leftovers. In real code the answer is often a combination of both sides rather than one of them.

### Step 3: mark resolved

```bash
$ git add config.txt
$ git status
On branch main
All conflicts fixed but you are still merging.
  (use "git commit" to conclude merge)

Changes to be committed:
	modified:   config.txt
```

`git add` here means "this file is resolved": it replaces the three conflict stages in the index with your version.

:::warning Check for leftover markers before adding
It is surprisingly easy to commit a stray `<<<<<<<` line. Git can check:

```bash
$ git diff --check
config.txt:3: leftover conflict marker
```

Run it before `git add` (or `git diff --cached --check` after). Most editors and many CI setups also flag markers.
:::

### Step 4: finish

```bash
$ git commit
```

Git opens your editor with a prepared message:

```text
Merge branch 'slow'

# Conflicts:
#	config.txt
```

Keep it or add a line explaining the resolution ("Kept 60s timeout needed by the payments API"). `git merge --continue` does the same thing as `git commit` here.

Finally, **test**. A merge that compiles isn't necessarily correct; run the test suite before pushing.

## Taking one side for a whole file

Sometimes you know one side is entirely right for a file, for example a generated file or a binary.

```bash
$ git restore --ours path/to/file      # keep the version from the branch you're on
$ git restore --theirs path/to/file    # keep the version from the branch being merged
$ git add path/to/file
```

(Older form: `git checkout --ours <file>` / `git checkout --theirs <file>`.)

:::mistake Choosing a side after git add does nothing
`--ours` and `--theirs` read the conflict stages that exist only **until** you `git add` the file. After that, `git restore --ours file` quietly does nothing and your markers stay. If you added too early, recreate the conflict first:

```bash
$ git checkout -m path/to/file     # "Recreated 1 merge conflict"
```
:::

:::warning ours and theirs swap during a rebase
In a merge, "ours" is the branch you're on. In a **rebase** (Part 8), Git replays your commits onto the other branch, so "ours" is the branch you're rebasing **onto** and "theirs" is **your** commit being replayed. It's the single most confusing naming in Git. Always check the content, not just the label.
:::

### Whole-merge strategy options

To auto-resolve **every** conflicting hunk in favour of one side (while still merging non-conflicting changes from both):

```bash
$ git merge -X ours feature/x      # conflicting hunks: take ours
$ git merge -X theirs feature/x    # conflicting hunks: take theirs
```

Use sparingly and only when you truly know one side should win everywhere, such as re-merging generated output.

## Using a merge tool

Resolving in a plain text editor works, but visual tools help with larger conflicts:

- **VS Code** highlights conflicts with *Accept Current*, *Accept Incoming* and *Accept Both* buttons, and has a three-pane merge editor.
- **JetBrains IDEs** have a three-pane resolver with base in the middle.
- `git mergetool` opens whichever tool you configure (`git config --global merge.tool vscode` plus a small tool command setting, or tools like `vimdiff`, `meld`, `kdiff3`).

"Current" in these tools means ours (HEAD) and "Incoming" means theirs. "Accept Both" pastes both sides one after another, which is rarely correct code without further editing.

## Aborting

Decided you're not ready for this merge? Maybe you need to ask a teammate about their change first.

```bash
$ git merge --abort
```

This restores the branch, staging area and working directory to exactly the state before `git merge`, provided you had no uncommitted changes when you started (another reason to merge from a clean working tree). It's always safe to abort, then come back later.

After a merge is committed, `--abort` no longer applies; use `git reset --hard ORIG_HEAD` if not pushed, or `git revert -m 1` if pushed (Chapter 33).

## Practical scenarios

### Two people added different lines at the same place

```text
<<<<<<< HEAD
import { formatMoney } from './money';
=======
import { debounce } from './timing';
>>>>>>> feature/search
```

Both imports are needed. Keep both lines, remove markers. This is the most common conflict of all, and "keep both" is usually right for lists: imports, routes, config entries, changelog lines.

### Lock files

`package-lock.json`, `yarn.lock`, `poetry.lock` and friends are generated. Don't hand-edit their conflicts. Take one side and regenerate:

```bash
$ git restore --theirs package-lock.json     # start from the incoming lock file
$ npm install                                # regenerate with both sides' package.json changes
$ git add package-lock.json
```

Resolve `package.json` itself first (by hand), then regenerate the lock file.

### One side deleted the file

```bash
$ git status
	deleted by them: src/legacy.js
```

Ask why it was deleted. If the other branch replaced it (say, moved its logic elsewhere), accept the deletion and port your change to the new location:

```bash
$ git rm src/legacy.js
```

If the file should stay, keep your version:

```bash
$ git add src/legacy.js
```

### Formatting versus logic

A teammate ran a formatter over a whole file while you changed a few lines. The conflict covers the entire file. Easiest route: take their formatted version, re-apply your few logical changes on top, then run the formatter yourself.

```bash
$ git restore --theirs src/cart.js
# re-apply your small change by hand
$ npx prettier --write src/cart.js
$ git add src/cart.js
```

### Database migrations with the same number

Two branches both added `migration 0042`. Git may not even conflict (different filenames), but the app will. Renumber yours to follow theirs, and check your framework's migration dependency order.

### The same conflict again and again

Rebasing a long branch, or re-merging `main` repeatedly, can present the same conflict many times. Enable **rerere** ("reuse recorded resolution"):

```bash
$ git config --global rerere.enabled true
```

Git records how you resolved each conflict and reapplies your resolution automatically next time it sees the identical conflict. You still review and `git add`.

## Preventing painful conflicts

- **Merge or rebase from `main` often** so conflicts stay small (Chapter 58).
- **Keep branches short-lived** and pull requests small.
- **Separate formatting from logic** and use a shared formatter.
- **Talk.** If you know you'll both be changing the checkout module this week, a two-minute chat saves an hour.

:::recap
### What you learned
- Routine: find (`git status`), edit to the final content, `git add`, then `git commit` or `git merge --continue`. Then test.
- `git diff --check` catches leftover markers.
- `git restore --ours/--theirs` picks a whole side, but only before `git add`; `git checkout -m` recreates a conflict.
- In a rebase, ours and theirs are swapped compared with a merge.
- `git merge --abort` returns to the pre-merge state.
- Common cases: keep both for lists, regenerate lock files, decide deletions deliberately, re-apply logic over formatting, and enable rerere.

### Key terms
```terms
Resolve :: Edit a conflicted file into its final form and mark it with git add.
--ours / --theirs :: Choose the current branch's / incoming branch's whole version of a file during a conflict.
Abort :: Cancel an in-progress merge and restore the previous state.
rerere :: Reuse recorded resolution: Git remembers and reapplies conflict resolutions.
```

### Key commands
```commands
git add <file> :: Mark a conflict as resolved.
git merge --continue :: Finish the merge (same as git commit here).
git merge --abort :: Cancel the merge.
git restore --ours <file> / --theirs <file> :: Take one side's whole file.
git checkout -m <file> :: Recreate the conflict markers for a file.
git diff --check :: Detect leftover conflict markers and whitespace errors.
git config --global rerere.enabled true :: Remember conflict resolutions.
```

### Common mistakes
- Committing conflict markers.
- Using `--ours` or `--theirs` after `git add`.
- Picking "Accept Both" in an editor without checking the resulting code.
- Hand-editing lock file conflicts.
- Pushing a resolved merge without running tests.

### Quick quiz
```quiz
? [state] You edited a conflicted file and removed the markers. git status still lists it under "Unmerged paths". What's missing?
+ git add <file> to mark it resolved
- git commit --amend
- git merge --abort
- git push
> Git doesn't know you finished until you stage the file.

? [troubleshoot] You ran git add on a conflicted file too early, then git restore --theirs file. The markers are still there. Why?
+ Adding the file removed the conflict stages, so --theirs has nothing to restore; use git checkout -m to recreate the conflict first
- restore doesn't support --theirs
- You must be on the other branch
- The merge was aborted
> The ours/theirs versions live in the index only until the file is marked resolved.

? [scenario] package-lock.json conflicts during a merge. What's the recommended approach?
- Edit the conflict markers by hand
+ Resolve package.json, take one side of the lock file, then regenerate it with the package manager
- Delete package-lock.json permanently
- Use git merge -X ours for everything
> Lock files are generated; regenerating ensures they are consistent with the merged package.json.

? [tf] During a rebase, "ours" refers to the commit of yours that is being replayed.
- True
+ False
> During a rebase, ours is the branch being rebased onto, and theirs is your commit being replayed. It's the reverse of a merge.

? What does git merge --abort restore?
+ The branch, staging area and working directory as they were before the merge started
- Only the conflicted files
- The last pushed state of the branch
- Nothing; it just deletes MERGE_HEAD
> Abort takes you back to the pre-merge state, assuming you started from a clean working tree.
```

### Practical exercise
````exercise Resolve three conflicts
Use the `conflict-lab` repository from Chapter 34:
1. Merge `slow`, resolve by keeping `timeout = 60`, verify with `git diff --check`, commit.
2. Create a conflict where both branches add a different line at the end of a list file. Resolve by keeping both lines.
3. Create a modify/delete conflict and resolve it by accepting the deletion.
---solution---
```bash
$ git merge slow
$ printf "timeout = 60\n" > config.txt
$ git diff --check && git add config.txt && git commit --no-edit

$ echo "apples" > list.txt && git add list.txt && git commit -m "Start list"
$ git switch -c a && echo "bananas" >> list.txt && git commit -am "Add bananas"
$ git switch main && echo "cherries" >> list.txt && git commit -am "Add cherries"
$ git merge a        # conflict: keep apples, cherries, bananas
$ printf "apples\ncherries\nbananas\n" > list.txt && git add list.txt && git commit --no-edit

$ echo x > old.txt && git add old.txt && git commit -m "Add old"
$ git switch -c remove && git rm old.txt && git commit -m "Remove old"
$ git switch main && echo y >> old.txt && git commit -am "Edit old"
$ git merge remove   # deleted by them
$ git rm old.txt && git commit --no-edit
```
````

### What to learn next
Merging combines histories. Part 8 introduces the other way: rebasing, which replays your commits to make history linear.
:::
