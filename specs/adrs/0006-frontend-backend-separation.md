---
# Configuration for the Jekyll "Just the Docs" theme (optional)
parent: Decisions
nav_order: 104
title: Separate Frontend and Backend Files
# status: "accepted"
# date: 2025-05-12
# decision-makers: [Team 26]
---

# Separate Frontend and Backend Files

## Context and Problem Statement

As the project grows, mixing frontend (UI, DOM, CSS) and backend (game logic, data models) code in the same files causes delays and confusion. Developers working on one side often have to wait for the other to finish, leading to "ping-ponging" and stalling progress.  
How should we organize our codebase to allow frontend and backend work to proceed independently and efficiently?

## Decision Drivers

- Parallel development: allow frontend and backend to progress without blocking each other
- Maintainability: clear separation of concerns
- Merge conflict reduction
- Ease of testing and debugging

## Considered Options

- Separate frontend and backend files/directories
- Keep all logic in shared files
- Use a monolithic file for each feature

## Decision Outcome

Chosen option: **"Separate frontend and backend files/directories"**, because it enables parallel work, reduces merge conflicts, and clarifies responsibilities.

### Consequences

- **Good:** Frontend and backend teams can work independently; less waiting and fewer merge conflicts; easier to test and maintain code.
- **Bad:** Requires clear interface definitions and some duplication of types or data structures.
- …  

### Confirmation

Verify by code review (files in `source/scripts/frontend/` and `source/scripts/backend/` are independent), successful parallel PRs, and developer feedback on workflow speed.
