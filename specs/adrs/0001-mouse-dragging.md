---
# Configuration for the Jekyll "Just the Docs" theme (optional)
parent: Decisions
nav_order: 100
title: Enable mouse-driven card dragging
# status: "accepted"
# date: 5-11-2025
---

# Enable mouse-driven card dragging

## Context and Problem Statement

Players need an intuitive way to pick up and play cards in BalatJack.
How should users move cards within their hand and onto the table: via direct manipulation or another mechanism?

## Decision Drivers

- Usability: how naturally players can interact with cards  
- Implementation complexity: engineering effort to support smooth dragging  
- Consistency: matches common digital card-game conventions  

## Considered Options

- Drag cards with the mouse  
- Select cards then use arrow-buttons or on-screen buttons to move  
- Use a context menu on click to choose "play," "discard," etc.  

## Decision Outcome

Chosen option: **"Drag cards with the mouse"**, because it provides the most direct and familiar interaction for players.  

### Consequences

- Good: Intuitive, low friction; aligns with user expectations in digital card games  
- Bad: Requires robust hit-testing and drag-and-drop handling; may introduce edge-case bugs  

### Confirmation

Verify implementation via code review, user-testing session (players must be able to drag and drop without errors), and QA checklist for drag events.