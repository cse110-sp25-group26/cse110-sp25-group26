---
# Configuration for the Jekyll "Just the Docs" theme (optional)
parent: Decisions
nav_order: 107
title: Use Fisher-Yates Shuffle for Deck
status: proposed
date: 2025-05-17
---

# Use Fisher-Yates Algorithm for Deck Shuffling

## Context and Problem Statement

We need a reliable way to randomize a deck of cards for our game. A poor shuffle can bias outcomes, affecting fairness and user experience. How should we implement shuffling so that every permutation is equally likely and performance is not significantly impacted?

## Decision Drivers

- Unbiased randomness (fairness)  
- Time complexity and in-place operation (performance, memory)  
- Ease of implementation and maintenance

## Considered Options

- Fisher-Yates using `Math.random()`  
- Using `Array.sort(() => Math.random() - 0.5)`  
- Fisher-Yates using `crypto.getRandomValues()`  
- Third-party shuffle library

## Decision Outcome

Chosen option: **"Fisher-Yates using `Math.random()`"**, because it is unbiased, runs in O(n) time with O(1) extra space, and is simple to implement for non-cryptographic use.

### Consequences

- **Good:**  
  - Every permutation is equally likely  
  - In-place, linear performance  
  - Minimal code and dependencies  
- **Bad:**
  - Linear-time performance may not be good enough if the deck expands significantly
  - Not seedable, would require rework if seeded randomness is implemented

### Confirmation

Verify via code review and unit tests that:  
- Shuffle preserves deck size  
- Distribution is uniform (e.g. statistical test in CI)  
- No external sort-based hacks are used

---

## Pros and Cons of the Options

### Fisher-Yates (`Math.random()`)

- **Good:** unbiased, O(n), in-place  
- **Neutral:** uses built-in RNG  
- **Bad:** Not seedable

### `Array.sort(() => Math.random() - 0.5)`

- **Good:** very concise  
- **Bad:** biased shuffle, O(n log n), unpredictable performance

### Fisher-Yates (`crypto.getRandomValues()`)

- **Good:** unbiased, cryptographically secure  
- **Bad:** slightly more complex, potential performance overhead

### Third-party Library

- **Good:** may offer extra features (seed, reproducibility)  
- **Bad:** added dependency, potentially larger bundle

## More Information

- [Fisher-Yates on Wikipedia](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
- When to revisit: if shuffle performance or security requirements change