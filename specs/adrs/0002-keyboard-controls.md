---
# Configuration for the Jekyll "Just the Docs" theme (optional)
parent: Decisions
nav_order: 101
title: Add keyboard controls for card navigation and actions
# status: "accepted"
# date: 5-11-2025
---

# Add keyboard controls for card navigation and actions

## Context and Problem Statement

To ensure BalatJack is accessible to players who cannot or prefer not to use a mouse, we need a keyboard-driven alternative.  
How should keyboard interactions allow selecting and playing cards?

## Decision Drivers

- Accessibility: WCAG compliance, support for keyboard-only users  
- Learning curve: ease of memorizing key-bindings  
- Consistency: align with common game-control conventions  

## Considered Options

- Implement arrow-key navigation + Enter to play  
- Mouse-only interaction (no keyboard support)  
- Customizable key bindings for all actions  

## Decision Outcome

Chosen option: **"Implement arrow-key navigation + Enter to play"**, because it balances accessibility with simplicity.  

### Consequences

- Good: Enables keyboard-only play; minimal new UI  
- Bad: Must document and tutorialize controls; potential key-binding conflicts  

### Confirmation

Validate via accessibility audit and keyboard-only testing scripts; design/code review to ensure focus management.