# Sprint 3 Retrospective (June 3, 2025)

## Overview
This retrospective was similar to Sprint 2, with not much of note new to change. Things still seemed to go smoothly, and most of the bumps have been ironed out in the third week.

There were two major topics of discussion for this retrospective:
1. **More Backlog / Issues**: Currently there are a lot of bottlenecks. The Deck is finally being merged, which frees up effort for existing issues, but we need more issues for people to be working on.
2. **Codacy Docs Pass**: Codacy is currently looking at JSDoc's output and grading it as well, which is of course terrible as JSDoc minimizes several libraries, which Codacy hates.

## Resolutions for Issues
### More Backlog / Issues
I will be adding more issues over this week, notably for sound effects and an instruction guide. The exact methods for both are undetermined, but for time's sake I am thinking of using existing sound effects, and making a separate manual for the game.

### Codacy Docs Pass
Codacy is surprisingly inconfigurable and difficult to learn, so we have two options - remove the docs from the active branch, forcing everyone to rebuild; or somehow digging into Codacy's ignore comments to determine how to tell it to stop grading random code. The optimal solution was not determined during the meeting, and has become slightly less of an issue now that our own lines of code dilute the issues from JSDoc's auto-generated code enough to retain an 'A' grade.

## Review of Previous Issues
### Pipeline Friction
As I predicted, this didn't come up as an issue this sprint. We seem to have gotten more used to the pipeline.

### Codacy
Min fixed the issue with Codacy and the Deck (see the [review](./060225-sprint-3-review.md)), but that was several hours spent fiddling with a tool that doesn't give you logs. I would likely not use this in production code, but for now the issue has been staved.

### Commit Etiquette
Did not come up for discussion. We do not plan to address this as we do not have teaching content beyond the course as well as handling course material.

### Pull Request Contents
PR templates were created and merged. This was the first a good few of the team had heard of them so they will likely be more prevalent over this final week.

### Updating Deadline Task Assignments
With the surprise introduction of a code cutoff on June 8th, it looks like this was a correct assessment. The overhead of class logistics (labs, videos, etc.) and business in general (other classes, some members have jobs) has meant the original timeline was far too optimistic for the workload of team members. This is not for lack of effort, I must add, for our TA, the team has been putting in hard work to get the game going.

## Attendance
- Nathan Reed (Meeting Leader)
- Sruti Mani
- Long Hodac
- Hanbin Tan
- Yifei Xue
- Anthony Velikov
- Jason Huang
- Min Aung Paing
- Mahdi Najjar