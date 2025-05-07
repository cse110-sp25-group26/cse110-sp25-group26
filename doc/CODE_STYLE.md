# Code Style Guidelines (tentative)

## Javascript
- Always use semicolons at the end of lines.
- Use CamelCase for variables/functions, PascalCase for game objects (Card, Hand, Deck, etc.)
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
`<type>(<scope>): <short summary>`
The body and footers in the main message are optional. If you want to be detailed, check the [Conventional Commits documentation](https://www.conventionalcommits.org/en/v1.0.0/), but the full format is not required.

The types we will be using include, but are not limited to: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, and `test`.
