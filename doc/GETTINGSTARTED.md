# Getting Started

Welcome to the Go Gitters (Team 26) Repository! This quick-start guide is here to get you cloning, coding, and contributing in minutes without having to piece together the documentation first. When you do need detail, doc links are present throughout this doc where necessary.

## 1. What you'll need
| **Tool** | **Why** | **Min. Version** |
| -------- | ------- | ---------------- |
| **Git**  | Pull, branch, and push code | Any relatively recent version |
| **Node & NPM** | Run the build, tests, docs | Node 21, NPM 10 |
| **VSCode** | Built-in formatter + ESLint integration | Latest |

> **Heads-up Mac/Linux users**: Make sure `node` points to the right version in your shell.


## 2. Grab the code
```bash
# Pick a spot on your drive
cd ~/dev

# Clone with SSH (preferred) or HTTPS
# SSH
git clone git@github.com:cse110-sp25-group26/cse110-sp25-group26.git
# CLone with HTTPS
# git clone https://github.com/cse110-sp25-group26/cse110-sp25-group26.git

cd cse110-sp25-group26
```

## 3. Install dependencies
```bash
npm install
```

This pulls everything we need for linting, testing, and doc generation.

## 4. Know your branches (quick version)
| Branch | Purpose | Who pushes here? |
| ------ | ------- | ---------------- |
| `main` | Production-ready only | Merged via **release PR** + 2 reviews |
| `develop` | Next big build | Merged via PR + 1 review |
| `feature/..` | New stuff | You! PR -> `develop` |
| `bugfix/..` | Small unscheduled fixes | Off a feature branch |
| `hotfix/..` | Emergency patch on `main` | Merge back to `main` and `develop` |
| `release/vX.Y.Z` | Pre-launch polish | Team lead cuts from `develop` |

Full rules live in [doc/BRANCHING.md](/doc/BRANCHING.md).

## 5. Typical dev loop
1. Create a branch
   ```bash
   git switch -c feature/amazing-thing develop
   ```
2. Code away
   - Keep files laid out per [doc/STRUCTURE.md](/doc/STRUCTURE.md)
   - Follow the [style guide](/doc/CODE_STYLE.md) - VSCode auto-format (tabs!) + ESLint will help.
3. Run the pipeline locally
   ```bash
   # Unit tests
   npm run test

   # Lint everything
   npx eslint .

   # Regenerate docs (required for PR to dev)
   npm run docs
   ```
4. Commit following the [Angular-style](/doc/CODE_STYLE.md) message format:
   ```bash
   git commit -m "feat: Add shuffle animation"
5. Push changes, and once ready open a PR against `develop` (or the branch noted in your task)
6. Address review comments, get the ✅, and merge.

## 6. Running the game locally
We don't have a live server yet, but there are several ways to run the game. The typical 2 are:
```bash
# Go to the project root
cd ~/dev

# Built-in python server
python3 -m http.server 8080

# If PHP is installed
php -S localhost:8080

# -> open localhost:8080 in a browser to see the game!
```

## 7. Testing in a nutshell
- Tests live next to code inside `source/scripts/tests/` (mirrored tree)
- Write reasonably fast, deterministic Jest tests - try to hit edge cases.
- Docs: [doc/TESTING.md](/doc/TESTING.md)

## 8. Style highlights
- **JavaScript**: semicolons, `camelCase` for variables/functions, `PascalCase` for object classes.
- **HTML/CS**: Semantic tags, minimal ` !important` usage.
- **Tabs, not spaces**: Your editor should know, as long as it respects `.editorconfig`.

Full rules: [doc/CODE_STYLE.md](/doc/CODE_STYLE.md)

## 9. Need help?
- Branching woes? [Branch Spec](/doc/BRANCHING.md)
- PR stuck? [Review Checklist](/doc/REVIEWING.md)
- Where do I put this file? [Repo Structure](/doc/STRUCTURE.md)

Pop any further questions in the team chat and we'll try and figure them out right away. Happy coding!