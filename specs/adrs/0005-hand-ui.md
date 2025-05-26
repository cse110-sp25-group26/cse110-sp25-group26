---
# Configuration for the Jekyll "Just the Docs" theme (optional)
parent: Decisions
nav_order: 104
title: Enable Adding, Removing, and Selecting Cards in Hand
status: "accepted"
date: 2025-05-25
---

# Enable Adding, Removing, and Selecting Cards in Hand

## Context and Problem Statement

In BalatJack, players need an intuitive and visually appealing way to manage cards in their Hand, including adding, removing, and selecting cards for gameplay. The Hand must dynamically adjust its layout to accommodate varying numbers of cards while ensuring clear interaction feedback.

## Decision Drivers

- **Usability**: Players should interact with cards naturally, with minimal learning curve.
- **Visual Clarity**: Cards must be displayed clearly, with proper scaling and overlap when necessary.
- **Implementation Complexity**: The solution should balance functionality with manageable engineering effort.
- **Consistency**: The interaction should align with conventions in digital card games.

## Considered Options

1. **Drag Cards with the Mouse**: Players can add, remove, or select card in hand, with visual feedback for selection (raised position).
2. **Select and Use Buttons**: Players click to select cards, and can select mutltiple cards at once and remove all seclect cards at once.

## Decision Outcome

Chosen option: **"Drag Cards with the Mouse"**, because it offers the most intuitive and direct interaction, closely mimicking physical card games and aligning with player expectations in digital card games like BalatJack.

### Implementation Details

- **Card Management**: The Hand class supports adding,removing and selecting Card UI elements dynamically, updating the layout in real-time.
- **Card Scaling and Layout**: 
  - If cards fit side-by-side within the Hand's width, they are placed without overlap.
  - If the total card width exceeds the Hand's width, cards overlap precisely to fit (within floating-point accuracy).
- **Card Selection**: Selected cards are visually raised above others, and the Hand notifies the game logic of selections via event triggers.
- **Drag-and-Drop**: Players can add cards to the Hand, remove them, or select them for play, with smooth hit-testing and drag handling.

### Consequences

- **Good**:
  - Intuitive interaction reduces the learning curve and enhances player engagement.
  - Dynamic scaling ensures a clean, professional presentation of cards.
  - Aligns with common digital card game conventions, improving user familiarity.
- **Bad**:
  - Drag-and-drop requires robust hit-testing and event handling, increasing implementation complexity.
  - Potential for edge-case bugs that require thorough testing.

### Confirmation

- **Code Review**: Ensure the Hand class meets all acceptance criteria (card management, scaling, and selection notification).
- **User Testing**: Conduct sessions to verify players can add, remove, and select cards via drag-and-drop without errors.
- **QA Checklist**: Validate drag events, card overlap calculations, and selection feedback for accuracy and responsiveness.
