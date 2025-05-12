# Code Review Guidelines
This document defines the standard process and quality criteria for reviewing pull requests. This process is meant to ensure that any code merged into `main` or `develop` is:
- **Correct**: Working as intended without regressions.
- **Readable**: Clear, consistent, and easy for others to understand.
- **Maintainable**: Structured and documented to facilitate future updates.
- **Performant**: Efficient in loading, rendering, and runtime behavior.
- **Accessible**: Usable by all visitors.

These guidelines apply to all contributors and contributions, whether submitting a one-line typo fix or a multi-page feature.

# High-Level Review Workflow
1. **Prepare your code**
   - Run linters and formatters (TBD: linter not yet standardized)
   - Verify local functionality, responsiveness, and accessibility.
   - Write or update tests where applicable.
2. **Open a Pull Request**
   - Target branch: Any protected branch (see the [branching guidelines](/doc/BRANCHING.md))
   - Title and description follow pull request/commit convention (see the [code style guidelines](/doc/CODE_STYLE.md))
   - Link related issue(s) or design documents.
3. **Assign Reviewer(s)**
   - At least one peer reviewer is required for pushing to `develop`.
   - Two peer reviewers, one a team lead, are required for pushing to `main`.
4. **Conduct the Review**
   - Reviewer walks throught he checklist (Section 3)
   - Use line comments for specific feedback; summary comments for overarching concerns.
   - Author addresses comments via discussion or follow-up commits.
5. **Approval and Merge**
   - All critical and major issues closed.
   - CI/CD pipeline green for required entries.
   - Final sign-off by reviewer; merge moves to merge coordinator

# Code Review Checklist
> Note: Items are catrgorized by priority:<br>
> - [P1]: Critical, must pass before merge<br>
> - [P2]: Major, highly reccomended. Exceptional cases may defer to later
> - [P3]: Minor, style or enhancement suggestions. May be logged and deferred if time requires

## General
- [P1] CI Status
  - All required automated checks are passing.
- [P2] Commit Hygiene
  - Commit messages follow convention and clearly describe "what" and "why".
  - No large "work-in-progress" commits; history is logical.
- [P2] PR Description
  - Clearly explains scope, approach, and any trade-offs.

## HTML
This section also appllies to HTML created or modified via JavaScript.

- [P1] Semantics and Structure
  - Use semantic tags appropriately.
  - Document structure via meaningful class and ID names.

[WIP] More detailed requirements will be added as the project structure becomes more well-formed.

## CSS
This section also applies to CSS created or modified via JavaScript.

- [P1] Consistency and Organization
  - CSS is clean and follows [style guidelines](/doc/CODE_STYLE.md)
  - Styles modularized: no monolithic globals
- [P1] ` !important`
  - Any uses of ` !important` are deemed wholly necessary and no viable alternative is found.
- [P2] Responsive Design
  - Layout adapts gracefully to multiple screen sizes and mobile screens.
  - Tested at key breakpoints.
- [P3] Performance
  - No unused or redundant rules.

## JavaScript
- [P1] Language Features
  - Do not use `var`. Use `let`/`const` in its stead.
  - Do not use globals unless entirely necessary. Utilize the game state object for common variables.
- [P1] Correctness and Robustness
  - Edge cases handled, user input validated/sanitized.
  - Errors caught and logged meaningfully.
- [P1] Code Style
  - Code follows consistent indentation, naming, and spacing following [style guidelines](/doc/CODE_STYLE.md)
  - No dead code or commented-out blocks.
- [P2] Performance
  - Batch DOM reads/writes
  - Limit event handler code
- [P3] Documentation and Comments
  - Complex algorithms or workarounds explained.
  - JSDoc comments present on functions, classes, and properties.


# When a PR is Ready to Merge
1. Automated Checks
   - Linting passes without error
   - Formatting applied.
   - All unit/integration tests pass
2. Functional Verification
   - Manual QA: core flows tested in at least 2 browsers (ex. Chrome and Firefox)
   - Responsive behavior verified on mobile, tablet, and desktop widths.
3. Performance
   - No new console errors or warnings.
   - Bundle size increase is justified and accepted by reviewers.
   - Animation and interaction remain smooth
4. Documentation
   - README, architecture docs, JSDoc updated if conventions changed.
   - New or changed components documented, with usage examples if necessary.
5. Review Sign-Off
   - Required peer reviewer has approved.
   - For pushes to `main`, team lead has given final approval.
