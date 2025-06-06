---
# Configuration for the Jekyll "Just the Docs" theme (optional)
parent: Decisions
nav_order: 109
title: Add an Options menu
status: proposed
date: 2025-06-06
---

# Add an Options menu to the gameplay and menu

## Context and Problem Statement

We need a way for the user to control options (such as music volume) and the game state (such as saving or returning to the menu). Where should we place these options?

## Decision Drivers

- User accessibility (users can immediately tell how to use the options)  
- Clarity (options are easy to interact with)  
- Ease of implementation and maintenance  
- Modality (not interfering with the rest of the game)

## Considered Options

- Configuration file  
- JSON-based options input  
- Options menu in-game  
- Options menu in menu

## Decision Outcome

Chosen option: **Both an options menu in the game and in the menu**. This allows the user to easily configure settings without having to learn anything the average user may not be accustomed to.

### Consequences

- **Good:**  
  - Users can adjust settings in real time without restarting the game  
  - Settings are accessible both during gameplay and from the main menu  
- **Bad:**  
  - Requires additional UI implementation and maintenance  
  - Potential for interface clutter if not designed efficiently

### Confirmation

Verify during user testing that:  
- Users can easily locate and adjust the options menu  
- Changes made in-game persist when returning to the menu  
- The options interface does not obstruct core gameplay functionality

---

## Pros and Cons of the Options

### Configuration file

- **Good:** No impact on in-game UI; easy to version control  
- **Bad:** Requires users to locate and edit a file outside the game; not user-friendly for non-technical users

### JSON-based options input

- **Good:** Structured and human-readable; easy to parse  
- **Bad:** Still requires external editing; risk of syntax errors causing game issues

### Options menu in-game

- **Good:** Settings accessible without leaving gameplay; immediate feedback on changes  
- **Bad:** Requires overlay UI; potential distraction if not well-integrated

### Options menu in menu

- **Good:** Centralized location for settings before gameplay begins; keeps gameplay screen uncluttered  
- **Bad:** Cannot adjust settings while playing; requires navigating back to the menu mid-session
