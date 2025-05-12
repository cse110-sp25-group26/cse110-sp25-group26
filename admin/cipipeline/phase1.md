# Build Pipeline - Phase 1

Our **Phase 1 pipeline** is designed to automate key processes such as testing and documentation, while also providing clear guidelines and a robust verification process. This is done to ensure that code style guidelines are consistently met across the entire codebase, promoting maintainability and quality.

---

## 1. Linting and Code Style Enforcement

Currently, our pipeline primarily relies on **manual code style enforcement** and the default editor linting capabilities available. Code style guidelines are comprehensively documented in [CODE_STYLE.md](/doc/CODE_STYLE.md). These guidelines encompass a variety of aspects, including but not limited to:

- **Code Case Conventions**: 
  - Consistent use of `camelCase` or `PascalCase` for variable and function names.
- **HTML Formatting and Guidelines**: 
  - Clear, readable, and consistent HTML structure.
- **CSS Organizational and Rule Type Guidelines**: 
  - Ensuring that CSS rules are well-structured and logically grouped.
- **General Code Organizational and Stylistic Guidelines**:
  - Clear separation of concerns, modular code design, and adherence to naming conventions.
- **Commit Message Formatting**:
  - Structured, meaningful commit messages to ensure clear version history.

Until a more robust linting solution is implemented (likely using `eslint`), our current linting practices are as follows:

- **VSCode's Built-in Linter**:
  - Utilizing the integrated linting capabilities of VSCode.
- **JavaScript Code Formatting**:
  - Formatting all JavaScript code using the integrated VSCode formatter.

---

## 2. Code Quality via Tool

This aspect of the pipeline is **currently not implemented**. Both **CodeClimate** and **Codacy** require paid plans for team usage, which is not feasible at this stage. Although there are alternative tools available, we have not yet fully compared their efficacy or suitability for our project.

---

## 3. Code Quality via Human Review

- **Branch Protection Requirements**:
  - Pull requests (PRs) to the `main` and `develop` branches are required for merging.
  - For the `main` branch, PRs must pass continuous integration (CI) checks and receive one approving review.
  - These requirements are not enforced through GitHub's automatic branch protection settings, due to the organization's lack of a paid plan. Instead, they are defined and enforced through team guidelines.

- **Review Process Details**:
  - The review process is comprehensively defined in [REVIEWING.md](/doc/REVIEWING.md).
  - It is a **5-step review process**, complete with a reviewer checklist to ensure consistency and quality.
  - PRs to `develop` require at least one peer reviewer.
  - PRs to `main` require two reviews, including one from a team lead.

- **Manual Review Verification**:
  - Even without automatic branch protection, the team adheres to these guidelines through documented processes.

---

## 4. Unit Tests via Automation

Unit testing is an integral part of this pipeline:

- **Automated Testing Triggers**:
  - Tests are automatically executed on PRs and direct pushes to both the `main` and `develop` branches.
  - These tests can also be manually run using the command: 
    ```bash
    npm run test
    ```

- **Test Directory Structure**:
  - Unit tests are located in `source/scripts/tests/`.
  - The structure for tests is defined by re-rooting the `source/scripts/` tree into `source/scripts/tests/`.

- **Testing Framework**:
  - We utilize **Jest** for both writing and executing unit tests, ensuring a consistent testing environment.

- **Further Information**:
  - Additional details about the testing process are available in [TESTING.md](/doc/TESTING.md), including specific guidelines on test organization and expected test types.

---

## 5. Documentation Generation via Automation

Documentation is a critical aspect of maintaining code quality and usability:

- **Documentation Style**:
  - All JavaScript files are documented using **JSDoc**.
  - This is a mandatory requirement as specified in the [style guidelines](/doc/CODE_STYLE.md).

- **Required Documentation Components**:
  - Each function and class should have:
    - A clear, descriptive comment explaining its purpose.
    - Properly annotated parameters and return types.
    - Usage examples, where appropriate.

- **HTML Documentation Generation**:
  - A complete, HTML version of the documentation is available at [/doc/scripts/index.html](/doc/scripts/index.html).
  - This documentation can be recompiled at any time using:
    ```bash
    npm run docs
    ```

- **Future Improvements**:
  - We aim to enhance this process by integrating automatic documentation checks through the linter in future pipeline phases.

---

## 6. Other Testing - HTML and CSS Validation

We have plans to implement **HTML and CSS validation** using the **W3C validation tools**. However, the automated validation environments have recently experienced unresolved vulnerabilities due to dependency issues, leading to their temporary exclusion. If these dependency issues are not resolved, we will have to add manual verification to the merge requirements.

---

## Documentation Passes
![alt test](/admin/cipipeline/phase1.png)
