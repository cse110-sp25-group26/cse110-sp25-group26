---
# Configuration for the Jekyll "Just the Docs" theme (optional)
parent: Decisions
nav_order: 104
title: Add, Remove, and Select Cards in Hand UI
status: "accepted"
date: 2025-05-25
---

# Add, Remove, and Select Cards in Hand UI

## Context and Problem Statement

In **BalatJack**, the player's Hand must visually reflect the game logic's `Hand` class, supporting dynamic changes in card count and providing clear, intuitive interaction. This includes:

- Adding and removing card UI elements.
- Dynamically adjusting the layout to fit the available Hand width.
- Supporting card selection with visual feedback.

These interactions must be responsive and visually polished to maintain player immersion and usability.

## Decision Drivers

- **Usability**: Players must easily interact with cards in-hand without instructions.
- **Visual Responsiveness**: The layout should gracefully scale and overlap cards as needed.
- **Interaction Feedback**: Selected cards must visually stand out.
- **Implementation Feasibility**: The design should balance fidelity with engineering effort.

## Considered Options

1. **Drag-and-Drop Interaction**  
   Players interact directly with cards using drag-and-drop. Selected cards appear raised; dragging cards can add or remove them from the Hand.

2. **Click-to-Select with Action Buttons**  
   Players click to select cards, and use on-screen buttons to play or discard them. Supports multi-selection.

## Decision Outcome

**Chosen Option: Drag-and-Drop Interaction**

This option most closely mirrors physical card games and aligns with conventions in digital card games. It offers high intuitiveness and direct manipulation with clear visual cues for selection.

## Implementation Details

- **Card Management**:
  - The `Hand` component reflects the game logic's `Hand` class.
  - Cards can be dynamically added and removed from the Hand.

- **Card Scaling and Layout**:
  - If cards fit side-by-side within the Hand's width, they are laid out with no overlap.
  - If the total card width exceeds the Hand's width, cards overlap just enough to fit the space precisely (within floating-point accuracy).

- **Card Selection**:
  - Players can click to select a card.
  - A selected card appears slightly raised relative to others.
  - The Hand notifies the game logic of selection via events.

- **Interaction Support**:
  - Drag-and-drop for adding/removing cards.
  - Smooth hit-testing and consistent interaction handling.

## Consequences

### Positive

- Clear, natural interaction model that aligns with player expectations.
- Visually dynamic scaling for various card counts improves UX.
- Direct integration with game logic simplifies syncing selected cards.

### Negative

- Requires careful handling of drag events.
- Scaling and overlap math may introduce edge-case layout bugs.

## Validation

- **Code Review**: Ensure the Hand component meets acceptance criteria: card add/remove, layout adjustment, and selection events.
- **User Testing**: Confirm players can add, remove, and select cards naturally via drag-and-drop.
- **QA Checklist**:
  - Cards are packed correctly based on available width.
  - Selected cards are visually distinct and correctly reported to the game logic.
  - Drag operations behave predictably and accurately.

