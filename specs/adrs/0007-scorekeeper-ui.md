---
parent: Decisions
nav_order: 106
title: Position scorekeeper element on the left side of the screen
status: "accepted"
date: 2025-05-25
---

# Position scorekeeper element on the left side of the screen

## Context and Problem Statement
The scorekeeper is a key UI element that tracks player scores and game state.
It needs to be easily visible without obstructing the main play area.
Where should the scorekeeper be positioned to maximize usability and visibility?

## Decision Drivers

- **Visibility:** Must be easily readable without blocking important game elements
- **Ergonomics:** Should not interfere with mouse or keyboard controls
- **Conventions:** Should align with common UI patterns in digital card games

## Considered Options

- Scorekeeper on the right side of the screen
    - Common placement for menus and sidebars
    - May interfere with right-handed mouse users or touch controls
- Scorekeeper at the top of the screen
    - Keeps score visible and unobtrusive
    - May cause business in the center of the screen with Jokers, Consumables, and the Main Hand
- Scorekeeper at the bottom of the screen
    - Decently visible but interferes with the player's hand and card play area
- Scorekeeper on the left side of the screen
    - Another common placement for scoreboards
    - Keeps the main play area clear
    - May interfere with left-handed mouse users or touch controls, but this is less common

## Decision Outcome

Chosen option: **"Position scorekeeper on the left side of the screen"**, because it provides a clear view of the main play area while keeping the score easily accessible.

### Consequences

- **Good:** 
  - Keeps the main play area unobstructed
  - Familiar placement for players used to digital card games
- **Bad:**
    - May require additional styling to ensure it does not interfere with left-handed controls
    - Needs careful design to avoid cluttering the left side of the screen

### Confirmation

Review in UX design review, run responsive layout tests across screen sizes, and conduct user playtests.