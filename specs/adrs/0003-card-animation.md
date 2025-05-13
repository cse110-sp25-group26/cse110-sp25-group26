---
# Configuration for the Jekyll "Just the Docs" theme (optional)
parent: Decisions
nav_order: 102
title: Animate card movements
# status: "accepted"
# date: 5-11-2025
---

# Animate card movements

## Context and Problem Statement

Instant card jumps can feel abrupt and make it hard for players to follow game flow.  
How should the UI communicate card transfers to improve user perception?

## Decision Drivers

- User perception: clarity of state changes  
- Performance: smoothness on target devices  
- Development effort: animation complexity  

## Considered Options

- Tween-based animations for moves  
- Instant reposition (no animation)  
- Simple fade-out/fade-in effect  

## Decision Outcome

Chosen option: **"Tween-based animations for moves"**, because they provide clear motion cues and a polished feel.  

### Consequences

- Good: Improves player understanding of card movements; enhances feel  
- Bad: Requires animation library integration; potential performance tuning  

### Confirmation

Verify via performance profiling (60 fps target), and user feedback session to assess clarity.