# Code Style Guidelines (tentative)

## Javascript
- Always use semicolons at the end of lines.
- Use camelCase for variables/functions, PascalCase for game objects (Card, Hand, Deck, etc.)
- Document functions with [JSDoc](https://jsdoc.app/about-getting-started)

## HTML / CSS
- Use semantic tags, avoid "divitis"
- Use brief, but descriptive tags. Aim for clean HTML code.
- Always use closing tags.
- Validate your code with W3C validators before creating pull requests.
- Avoid `!important` unless entirely necessary.
- Group rulesets in CSS per-component or per-style-achieved.

## General (all):
- Format all code with built-in VSCode formatting before creating pull requests
- Use tabs, not spaces


## Commit Messages
Commit messages should follow the form:
`<type>: <short summary>`
The body and footers in the main message are optional.

The types we will be using include, but are not limited to:
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to our CI configuration files and scripts
- `docs`: Documentation-only changes
- `feat`: A new feature
- `perf`: A code change related to performance
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `style`: Changes that do not affect the meaning of the code (whitespac,e formatting, missing semicolons, etc.)
- `test`: Modifying tests, such as adding missing tests or correcting existing ones






# Citations
- Commit message style strongly based off of [Angular's commit structure](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines)