import { Card } from '../backend/Card.js';

/**
 * Creates a UI card element for a given Card object and places it on top of the deck.
 * The deck visually stacks cards so the last added is on top.
 * @param {Card} card - The Card object to create a UI element for.
 * @returns {HTMLElement} The created card element.
 */
export function createUICardForDeck(card) {
    // Find the deck container in the DOM
    const deckContainer = document.getElementById('deck-container');
    if (!deckContainer) {
        console.error('Deck container not found');
        return null;
    }

    // Create the card element
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.textContent = `${card.type} of ${card.suit}`;
    cardElement.style.position = 'absolute';
    cardElement.style.left = '0px';
    cardElement.style.top = '0px';

    // Set z-index so the new card is on top of previous cards
    const numCards = deckContainer.children.length;
    cardElement.style.zIndex = (10 + numCards).toString();

    // Optionally, store the UI element on the card object for later reference
    card.UIel = cardElement;

    // Add the card element to the deck container (on top)
    deckContainer.appendChild(cardElement);

    return cardElement;
}