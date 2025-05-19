import { Card } from '../../source/scripts/backend/Card.js';

// Function to create a UI element for a Card and place it on the deck
export function createUICardForDeck(card) {
    const deckContainer = document.getElementById('deck-container');
    if (!deckContainer) {
        console.error('Deck container not found');
        return;
    }

    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.textContent = `${card.type} of ${card.suit}`;
    cardElement.style.position = 'absolute';
    cardElement.style.left = '0px';
    cardElement.style.top = '0px';
    cardElement.style.zIndex = '10';

    card.UIel = cardElement;

    deckContainer.appendChild(cardElement);
}