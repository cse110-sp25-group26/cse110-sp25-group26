# Sprint 2 Retrospective (May 26, 2025)

## Overview
This retrospective didn't have much to cover for the exact opposite reason as last time - things went quite smoothly. There were smaller bumps in the process and some pushes to main, but nothing catastrophic, and the development and documentation process appears to be moving relatively smoothly.

That said, there are a few major topics of discussion for this retrospective:
1. **Pipeline Friction**: The build pipeline does a splendid job of keeping everything uniform, but the errors it tends to throw can be a bit cryptic. We've been seeing 6 or 7 commits for some developers just trying to get the linter to pass.
2. **Codacy**: We implemented Codacy yesterday and it has been both a blessing and a curse. Min, Yifei and I have been trying to wrangle the program to work on the Deck branch, but it refuses to run. When it does work it works well, but when it doesn't, it's practically impossible to find information on why.
3. **Commit Etiquitte**: A more minor issue, but it was a point of discussion. We have had low utilization of the commit message formatting scheme defined in the [Style Guide](/doc/CODE_STYLE.md), and commit sizing is etirely unstandardized.
4. **Pull Request Contents**: Pull requests are meant to have descriptive contents explaining the changes, but we have had some pull requests with little or no information about the actual PR. This needs to be standardized somehow.

## Resolutions for Issues
### Pipeline Friction
I will continue monitoring this, but I believe there is a strong factor of unfamiliarity that will ease as we continue to use the pipeline and work with the linter/test cases.

### Codacy
As Codacy appears to function fine on most branches, we will leave it implemented for now. However, we have agreed that if it starts to cause issues we will just remove it and return to manual code review.

### Commit Etiquette
I don't believe we will be able to solve this reasonably as work continues. I do not want to make our team cut development time to monitor commit sizing and messages, as these would take up a not-insignificant amount of time. Given that we only have 2 weeks remaining, I doubt the time would be better spent planning out task commits.

### Pull Request Contents
I will write some Pull Request templates and add them to the documentation to increase standardization of pull request contents. This will require research on how GitHub implements these.

## Review of Previous Issues
### Starting Earlier
Successfully resolved. Momentum continued as I anticipated, and more frequent in-class/Slack discussion helped to keep development happening at a good pace.

### Updating Deadline Task Assignments
I do not believe we will be meeting the initially proposed deadlines for game features. I still believe we will have a fully functional game by the proposed end time, but the overhead of the Agile process has made development significantly slower than I had originally anticipated. I will bring it up with our TA on Wednesday to see what changes we should make due to this.