# Build Pipeline - Phase 1

Our phase 1 pipeline automates testing and documentation, while providing guidelines and a verification process to ensure code style guidelines are met.

## 1. Linting and Code Style Enforcement
Currently, our pipeline utilizes mostly manual code style enforcement and default editor linting. Code style guidelines are documented in [CODE_STYLE.md](/doc/CODE_STYLE.md), and include:
- Code case (camelCase/PascalCase)
- HTML formatting and guidelines
- CSS organizational and rule type guidelines
- General code organizational and stylistic guidelines
- Commit message formatting

Until a proper linter is implemented (likely `eslint`, but it has caused issues beyond the time available for this phase), the current linting guidelines are to use VSCode's built-in linter, and to format all JavaScript code using the integrated formatter.

## 2. Code Quality via Tool
This is not yet implemented. Both CodeClimate and Codacy require paid plans for team use, and although alternatives are available, we are yet to fully compare the efficacy of them.

## 3. Code Quality via Human Review
Pull requests to `main` and `develop` require pull requests to merge to, while `main` additionally requires both passing CI and one approving review. This is not implemented through GitHub's automatic branch protection, as our organization does not have the paid plan, but the details are specified at the top of [BRANCHING.md](/doc/BRANCHING.md).

The review process is described in [REVIEWING.md](/doc/REVIEWING.md) and defines a 5-step review process, with a reviewer checklist, to ensure the review process goes smoothly. Pull requests to `develop` require at least one peer reviewer, while pull requests to `main` require two reviews, one from a team lead.

## Unit Tests via Automation
Unit tests are present in the code, and are both manually runnable (`npm run test`) and automatically run on PR/push to `main`/`develop`. They automatically run all tests present in `source/scripts/tests/`.

Unit tests have a defined location relative to their main file - take the file tree from `source/scripts/`, add `tests/` before that, and re-root the tree back to `source/scripts`. See [TESTING.md](/doc/TESTING.md) for more information about this.

Also present in `TESTING.md` is the type of tests present. We will be using Jest to write and run unit tests.

# Documentation Generation via Automation
All JavaScript files are documented via JSDoc. This is required by the [style guidelines](/doc/CODE_STYLE.md), and in the future will be automatically assessed by the linter. Documentation should include function descriptions, class descriptions, and usage examples where necessary.

An HTML version of the documentation is present at [/doc/scripts/index.html](/doc/scripts/index.html), containing compiled JSDoc information. This may be recompiled at any time via `npm run docs`. This provides a clean, well-structured way to view nicely-formatted documentation for the codebase as a whole.

# Other Testing
We also intend to implement HTML and CSS validation via W3C, either through the review process or through automated testing. The planned automated environments have recently incurred unfixed vulnerabilities (the costs of dependencies...), so they have been left out until required.