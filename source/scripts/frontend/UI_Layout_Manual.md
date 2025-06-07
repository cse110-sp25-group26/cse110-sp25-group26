# Card Game UI Layout

## Overall Structure

The game interface is contained within a main `div#stage` that uses Flexbox to divide the screen into two primary sections:

1.  **`aside#scoreboard`**: A fixed-width sidebar on the left, displaying game scores, stats, and general game actions.
2.  **`main#board`**: The main game area on the right, which occupies the remaining space and contains all interactive card elements and game state information.

## 1. Scoreboard (`aside#scoreboard`)

*   **Layout**: Vertical Flexbox column.
*   **Content Sections** (from top to bottom):
    *   **Current Blind / Goal Score (`section.card.card-goal`)**:
        *   `p#current-blind-name`: Displays the name of the current blind (e.g., "Big Blind").
        *   Static text: "Score at least"
        *   `h1#goal-score`: Displays the target score for the current round/blind.
    *   **Current Round Score (`section.card.card-round`)**:
        *   Static text: "Current Round Score"
        *   `h1#round-score`: Displays the player's score accumulated in the current round.
    *   **Hand Type (`section.card.card-hand-type`)**:
        *   Static text: "Hand Type"
        *   `h2#current-hand-type`: Displays the type of poker hand currently played or being evaluated.
    *   **Chips & Multiplier (`section.card.card-chips`)**:
        *   `div.chip-row`: Contains two "chips" and a multiplier symbol.
            *   `div.chip.green > span#chip-val`: Displays the base chip value.
            *   `span.times`: "×" symbol.
            *   `div.chip.pink > span#mult-val`: Displays the multiplier value.
        *   `p.chip-label`: "Chips / Mult".
    *   **Actions (`nav.actions`)**:
        *   `button#info.btn-pill`: "Info" button.
        *   `button#options.btn-pill`: "Options" button.
    *   **Bank Balance (`div.bank-balance`)**:
        *   `span#bank-amount`: Displays the player's total money/bank.
    *   **Stats List (`ul.stats-list`)**:
        *   `li`: "Discards Left: `strong#discards-left`"
        *   `li`: "Hands Left: `strong#hands-left`"
        *   `li`: "Ante: `strong#current-ante`"

## 2. Main Game Board (`main#board`)

*   **Layout**: Vertical Flexbox column.
*   **Content Sections** (from top to bottom):
    *   **Top Info Bar (`section#top-info-bar`)**:
        *   **Layout**: Horizontal Flexbox row (space-between alignment). Stretches items vertically.
        *   `hand-element#jokers-area.card-placeholder-area`: Custom element to display Joker cards. Configured with `data-card-width="60"`.
        *   `div#round-status-display`: Displays current round status messages (e.g., "Play a hand", "Round Over").
        *   `hand-element#consumables-area.card-placeholder-area`: Custom element to display Consumable cards. Configured with `data-card-width="60"`.
    *   **Played Cards Display (`hand-element#played-cards-display`)**:
        *   **Layout**: Custom element (`<hand-element>`) that arranges cards. Configured with `data-card-width="70"`.
        *   Purpose: Displays cards the player has chosen to play for the current hand.
    *   **Hand Strip (`footer#hand-strip`)**:
        *   **Layout**: Horizontal Flexbox row.
        *   `nav.player-hand-actions`: Contains buttons for acting on selected cards in the player's hand.
            *   `button#play-selected-cards.btn-pill`: "Play Selected".
            *   `button#discard-selected-cards.btn-pill`: "Discard Selected".
        *   `hand-element#player-hand-cards`: Custom element (`<hand-element>`) displaying the cards currently in the player's hand. Configured with `data-card-width="80"`.
        *   `div#deck-area`: Contains the deck and its card count.
            *   `div#deck`: Visual representation of the draw deck. Clickable to deal cards.
            *   `p#deck-card-count`: Displays the number of cards remaining in the deck (e.g., "45/52").

## Custom Elements Used:

*   **`<hand-element>`**:
    *   Used for: `#jokers-area`, `#consumables-area`, `#played-cards-display`, `#player-hand-cards`.
    *   Manages a collection of `<card-element>`s.
    *   Supports card reordering (conditionally enabled).
    *   Card display size is configurable via the `data-card-width` attribute.
*   **`<card-element>`**:
    *   Represents a single playing card.
    *   Displays suit and type.
    *   Supports drag-and-drop functionality.

## Notes on Styling and Responsiveness:

*   Global reset and base styles are applied.
*   `gameplay.css` contains specific styles for all the above elements, including colors, spacing, borders, and typography.
*   Responsive adjustments are made using media queries (`@media (max-width: 600px)`) to reflow and resize elements for smaller screens. For example, `#top-info-bar` and `#hand-strip` switch to column layouts on smaller screens. 