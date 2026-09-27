// Starting points for the Git sandbox. Each chapter can embed one with ```viz <name>.
export interface Preset {
  title: string;
  intro: string;
  setup: string[];
  try: string[];
}

export const PRESETS: Record<string, Preset> = {
  playground: {
    title: 'Free playground',
    intro: 'A small repository with a main branch and a feature branch. Type any supported command or tap a suggestion.',
    setup: ['git commit -m "Initial commit"', 'git commit -m "Add README"', 'git commit -m "Add login page"', '@publish', 'git switch -c feature/search', 'git commit -m "Add search box"', 'git switch main'],
    try: ['git log --oneline --all', 'git switch feature/search', 'git commit -m "Search results page"', 'git merge feature/search', '@teammate main "Fix typo in header"', 'git fetch', 'git reflog'],
  },
  commits: {
    title: 'Commits form a chain',
    intro: 'Every commit points back to its parent. Make a few commits and watch main and HEAD move forward.',
    setup: ['git commit -m "Initial commit"', 'git commit -m "Add homepage"'],
    try: ['git commit -m "Add about page"', 'git commit -m "Fix footer links"', 'git log --oneline', 'git status'],
  },
  branches: {
    title: 'Branches are labels',
    intro: 'A branch is a named pointer to a commit. Creating one does not copy anything, and HEAD tells Git which branch you are on.',
    setup: ['git commit -m "Initial commit"', 'git commit -m "Add homepage"'],
    try: ['git branch feature/login', 'git switch feature/login', 'git commit -m "Add login form"', 'git switch main', 'git commit -m "Update footer"', 'git branch'],
  },
  head: {
    title: 'HEAD and detached HEAD',
    intro: 'HEAD normally points at a branch. Check out a commit directly and HEAD points at the commit instead: that is a detached HEAD.',
    setup: ['git commit -m "Initial commit"', 'git commit -m "Add homepage"', 'git commit -m "Add pricing page"'],
    try: ['git checkout HEAD~1', 'git commit -m "Experiment"', 'git switch -c experiment', 'git switch main', 'git reflog'],
  },
  'merge-ff': {
    title: 'Fast-forward merge',
    intro: 'main has not moved since feature/login was created, so Git can merge by sliding main forward. No merge commit is needed.',
    setup: ['git commit -m "Initial commit"', 'git commit -m "Add homepage"', 'git switch -c feature/login', 'git commit -m "Add login form"', 'git commit -m "Validate password"', 'git switch main'],
    try: ['git merge feature/login', 'git log --oneline'],
  },
  'merge-3way': {
    title: 'Three-way merge',
    intro: 'Both branches have new commits, so Git creates a merge commit with two parents. Try --no-ff on the other preset to compare.',
    setup: ['git commit -m "Initial commit"', 'git commit -m "Add homepage"', 'git switch -c feature/login', 'git commit -m "Add login form"', 'git commit -m "Validate password"', 'git switch main', 'git commit -m "Fix header spacing"'],
    try: ['git merge feature/login', 'git log --oneline', 'git branch -d feature/login'],
  },
  rebase: {
    title: 'Rebase replays commits',
    intro: 'Rebase copies your branch\'s commits onto a new base. Watch the originals stay behind, dimmed: they are replaced, not moved.',
    setup: ['git commit -m "Initial commit"', 'git commit -m "Add homepage"', 'git switch -c feature/login', 'git commit -m "Add login form"', 'git commit -m "Validate password"', 'git switch main', 'git commit -m "Fix header spacing"', 'git switch feature/login'],
    try: ['git rebase main', 'git switch main', 'git merge feature/login', 'git reflog'],
  },
  reset: {
    title: 'Reset moves the branch',
    intro: 'reset moves the current branch to another commit. Commits you step back over are not deleted: the reflog still knows them.',
    setup: ['git commit -m "Initial commit"', 'git commit -m "Add homepage"', 'git commit -m "Add pricing page"', 'git commit -m "Oops: debug logging"'],
    try: ['git reset --soft HEAD~1', 'git reset --hard HEAD~2', 'git reflog', 'git reset --hard D'],
  },
  revert: {
    title: 'Revert adds an undo commit',
    intro: 'revert leaves history alone and adds a new commit that undoes an old one. Safe for commits you already pushed.',
    setup: ['git commit -m "Initial commit"', 'git commit -m "Add homepage"', 'git commit -m "Change prices"', 'git commit -m "Add FAQ"', '@publish'],
    try: ['git revert C', 'git log --oneline', 'git push', 'git status'],
  },
  'cherry-pick': {
    title: 'Cherry-pick copies one commit',
    intro: 'A bug fix landed on feature/checkout, but main needs it today. Cherry-pick copies just that commit.',
    setup: ['git commit -m "Initial commit"', 'git commit -m "Add homepage"', 'git switch -c feature/checkout', 'git commit -m "Add checkout page"', 'git commit -m "Fix rounding bug in totals"', 'git commit -m "Add coupon field"', 'git switch main'],
    try: ['git cherry-pick D', 'git log --oneline --all'],
  },
  remote: {
    title: 'Fetch, pull and push',
    intro: 'origin/main is your last known copy of the server\'s main. A teammate pushes; you fetch; then you integrate and push.',
    setup: ['git commit -m "Initial commit"', 'git commit -m "Add homepage"', '@publish', 'git commit -m "Add contact page"', '@teammate main "Update prices"'],
    try: ['git status', 'git push', 'git fetch', 'git status', 'git pull', 'git push'],
  },
  'force-push': {
    title: 'Force push vs force-with-lease',
    intro: 'You rewrote your branch and need to force push. A teammate also pushed to it. See which option protects their work.',
    setup: ['git commit -m "Initial commit"', 'git switch -c feature/api', 'git commit -m "Add API client"', 'git commit -m "wip"', 'git push -u origin feature/api', '@teammate feature/api "Teammate: add retry logic"', 'git reset --soft HEAD~1', 'git commit --amend -m "Add API client"'],
    try: ['git push', 'git push --force-with-lease', 'git fetch', 'git log --oneline --all'],
  },
  tags: {
    title: 'Tags mark releases',
    intro: 'A tag is a fixed name for one commit. Unlike a branch, it does not move when you commit.',
    setup: ['git commit -m "Initial commit"', 'git commit -m "Add homepage"', 'git commit -m "Prepare 1.0"'],
    try: ['git tag -a v1.0.0 -m "First release"', 'git commit -m "Add blog"', 'git tag', 'git log --oneline'],
  },
  bisect: {
    title: 'History to search',
    intro: 'A long line of commits. In the Bisect chapter you will learn how Git finds the one that broke things in a few steps.',
    setup: ['git commit -m "Initial commit"', 'git commit -m "Add cart"', 'git commit -m "Add tax"', 'git commit -m "Refactor totals"', 'git commit -m "Add discounts"', 'git commit -m "Update styles"', 'git commit -m "Add shipping"', 'git tag v2.0 B'],
    try: ['git log --oneline', 'git checkout D', 'git switch main'],
  },
};
