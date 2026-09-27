---
id: code-review
part: 13
title: Code Review and Review Comments
minutes: 24
level: Intermediate
topics: 124 Code review | 125 Review comments
objectives:
- Explain what code review is for, and what it is not for
- Review a pull request systematically, from context to details
- Write clear, kind, actionable review comments, including suggested changes
- Respond to review feedback effectively as an author
- Use GitHub's review states: comment, approve and request changes
concepts: code review | pull request | review comment | suggested change | approval
commands: gh pr review | gh pr checkout | gh pr diff
---
Code review is the most important collaboration habit on a software team. It catches bugs, spreads knowledge ("now two people understand the billing code"), keeps the codebase consistent and helps newcomers learn the team's standards. You'll be both reviewed and reviewing from your first week.

## What review is for

**Is for:**

- correctness: does it do what it claims, including edge cases and errors?
- design: is it in the right place, at the right level of complexity?
- readability: will the next person understand it?
- tests: do they cover the change and would they catch a regression?
- security and performance risks,
- shared understanding: at least one other person now knows this code.

**Isn't for:**

- style debates a formatter or linter should settle automatically,
- rewriting the change the way you would have written it,
- gatekeeping or scoring points.

## Review states on GitHub

When you finish a review, you submit it with one of three states:

| State | Meaning | Effect |
|---|---|---|
| **Comment** | General feedback, no verdict | Doesn't block or approve |
| **Approve** | Good to merge (perhaps with optional nits) | Counts toward required approvals |
| **Request changes** | Must be addressed before merging | Blocks merging (if required reviews are enforced) until you re-review or it's dismissed |

Comments are collected as **pending** while you review and published together when you submit, so the author gets one notification rather than twenty.

## How to review a pull request

A consistent order saves time and produces better feedback:

1. **Read the description and linked issue.** What problem is this solving? If you can't tell, that's your first comment.
2. **Check CI.** If tests fail, the author probably knows; don't review details yet.
3. **Skim the whole diff** for shape: which files, how big, anything surprising (a lock file with 3,000 changed lines, a new dependency, a migration).
4. **Read the tests first.** They tell you what the author believes the code should do.
5. **Read the code carefully**, file by file. Tick **Viewed** on each file so you can track progress.
6. **Run it** if the change is behavioural: `gh pr checkout 342`, run the app or tests.
7. **Submit** with a summary and the right state.

For large PRs, it's fine to comment: "This is big to review well. Could we split the refactor into its own PR?"

## Writing review comments

Click the `+` next to any line in **Files changed** (drag to select several lines). Good comments are:

- **Specific.** Point at the exact problem and why it matters.
- **Actionable.** Say what would resolve it, or ask a genuine question.
- **Kind.** Critique code, not people. Assume competence and good intent.
- **Labelled by importance**, so the author knows what's blocking.

A common labelling convention:

| Prefix | Means |
|---|---|
| *(none)* or **blocking:** | Must change before merging |
| **suggestion:** | Worth considering; author decides |
| **nit:** | Tiny, optional polish |
| **question:** | You want to understand; may not need a change |
| **praise:** | Something done well; say it |

Compare:

| Unhelpful | Helpful |
|---|---|
| "This is wrong." | "If `items` is empty, `items[0].price` throws. Could we return 0 early? (Checkout calls this with an empty cart after the last item is removed.)" |
| "Why did you do it this way?" | "question: why fetch the user twice here? If it's to get fresh roles, a comment would help; otherwise we could reuse `user` from line 12." |
| "Rename this." | "nit: `data2` → `pendingOrders` would make the loop below easier to follow." |
| (nothing) | "praise: really clear test names, I could read the spec from them." |

### Suggested changes

For small, concrete fixes, write the replacement directly using a suggestion block in your comment:

````markdown
```suggestion
  if (items.length === 0) return 0;
```
````

The author can click **Commit suggestion** (or batch several) to apply it as a commit, without switching to their editor.

## Receiving review

Being reviewed is a skill too:

- **Don't take it personally.** Reviews are about the code and the product.
- **Reply to every comment**: "Done in 3c9e1a0", "Good catch, fixed", or a reasoned disagreement.
- **Ask when unclear.** "Do you mean X or Y?" beats guessing.
- **Disagree with reasons, then escalate calmly** if needed. A quick call often resolves in two minutes what ten comments can't.
- **Resolve conversations** once addressed (or leave that to the reviewer, per team custom).
- **Re-request review** when you've addressed everything, using the circular arrow next to the reviewer's name.
- **Push fixes as new commits** during review so reviewers can see what changed; squash later if your team wants a clean history.

## Review in the terminal

```bash
$ gh pr diff 342                          # read the diff
$ gh pr checkout 342                      # run it locally
$ gh pr review 342 --comment -b "Looks good overall; two questions inline."
$ gh pr review 342 --approve
$ gh pr review 342 --request-changes -b "Empty-cart case crashes, see inline."
```

Line comments are easiest on the web; overall reviews work well from the terminal.

## Review etiquette for teams

- **Review promptly.** A PR waiting two days blocks a teammate. Many teams aim for a first response within one working day.
- **Keep it proportional.** A typo fix needs a glance; a payments change deserves a careful read.
- **Automate the boring parts**: formatters, linters, type checks and tests in CI, so humans focus on design and logic.
- **Approve with nits** when only optional things remain; trust the author to handle them.

:::recap
### What you learned
- Review is for correctness, design, readability, tests, risk and shared understanding, not for style a tool can enforce.
- GitHub reviews are submitted as Comment, Approve or Request changes; comments stay pending until submitted.
- Review in order: context, CI, shape, tests, code, run it, summarise.
- Good comments are specific, actionable, kind and labelled (blocking, suggestion, nit, question, praise). Suggestion blocks can be committed with one click.
- As an author: reply to everything, ask when unsure, push fixes as commits, re-request review.

### Key terms
```terms
Code review :: Teammates reading and commenting on a change before it merges.
Review comment :: Feedback attached to specific lines of a PR.
Suggested change :: A review comment containing replacement code the author can commit directly.
Approval :: A review state saying the PR is ready to merge.
Request changes :: A review state that blocks merging until addressed.
Nit :: A minor, optional polish comment.
```

### Key commands
```commands
gh pr diff <n> :: Show a PR's diff in the terminal.
gh pr checkout <n> :: Check out a PR locally to test it.
gh pr review <n> --approve :: Approve a PR.
gh pr review <n> --request-changes -b "..." :: Request changes with a summary.
gh pr review <n> --comment -b "..." :: Leave a general review comment.
```

### Common mistakes
- Nitpicking formatting that a tool should handle.
- Vague comments without a reason or a proposed fix.
- Letting PRs wait days for review.
- Ignoring comments as an author instead of replying.

### Quick quiz
```quiz
? Which review state blocks merging when reviews are required?
- Comment
- Approve
+ Request changes
- Viewed
> Request changes blocks until the reviewer approves, re-reviews or the review is dismissed.

? [scenario] A PR's tests are failing. As a reviewer, what's the most useful first step?
+ Check whether the author knows, and hold detailed review until CI is green
- Approve it anyway
- Rewrite the code yourself
- Request changes on every file
> Reviewing code that will change to fix CI wastes everyone's time.

? Which comment is most helpful?
- "This is bad."
- "Why?"
+ "If the list is empty, line 14 throws. Could we return early with 0? The cart calls this after removing the last item."
- "I would have done this differently."
> It's specific, explains impact and proposes a fix.

? [tf] A "nit:" comment means the author must change it before merging.
- True
+ False
> By convention, nits are optional polish.

? As an author, how should you respond to feedback during review?
+ Reply to each comment and push fixes as new commits to the same branch
- Close the PR and open a new one
- Force-push without comment
- Only fix comments from senior engineers
> New commits let reviewers see exactly what changed since their last look.
```

### Practical exercise
```exercise Review a real PR
Pick an open pull request in your team's repository or a busy open-source project.
1. Read its description and CI status.
2. Read the tests first, then the code.
3. Draft (don't necessarily post) three comments: one blocking or question, one suggestion, one praise. Label each.
4. Decide which review state you'd submit and write a two-sentence summary.
---solution---
There is no single right answer. Check your drafts against the four qualities: specific (points at a line and a concrete issue), actionable (proposes a fix or asks a real question), kind (about the code, not the person), and labelled. A good summary names the most important point first: "Approach looks good. One blocking issue: empty carts crash totals (inline). The rest are optional nits."
```

### What to learn next
Reviews are enforced through rules. Next: branch protection and CODEOWNERS.
:::
