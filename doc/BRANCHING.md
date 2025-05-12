# Branch Specifications

1. `main`: Holds production-ready code. _Protected_ - requires:
  - Two approving reviews, at least one from a team lead
  - Passing CI (lint, tests, build, documentation)

2. `develop`: Integrates feature work for the next major build. Merges into `main` only via release PRs. _Protected_ - requires:
- At least one approving review
- Passing CI (lint, tests, build)

3. Feature Branches: Named `feature/<short-description>` (ex. `feature/shuffle-logic`). Based on, and PRs to, `develop`.

4. Bugfix branches: Named `bugfix/<short-description>`. Based off of feature branches for smaller, unscheduled changes.

5. Hotfix branches: Off of `main`, named `hotfix/<issue-number>-<short-desc>`, merged back into both `main` and `develop`. To be used only during user testing phase.

6. Release branches: Off of `develop`, named `release/vX.Y.Z`, used for pre-completion polishing.
