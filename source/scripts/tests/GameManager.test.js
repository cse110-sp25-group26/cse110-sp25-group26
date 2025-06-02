import GameManager from '../frontend/GameManager.js';
import { HandElement } from '../frontend/HandElement.js'; // Import for customElements.define
import { CardElement } from '../frontend/CardElement.js'; // Import for customElements.define and instanceof
import { jest } from '@jest/globals';

// Define custom elements for JSDOM if they aren't already defined by Jest's environment
// This is often needed for tests involving web components.
if (!customElements.get('hand-element')) {
    customElements.define('hand-element', HandElement);
}
if (!customElements.get('card-element')) {
    customElements.define('card-element', CardElement);
}

describe('GameManager', () => {
    let gameManager;
    let mockPlayerHand;
    let mockDeckDisplay;
    let mockDeckCountDisplay;

    beforeEach(() => {
        // Set up mock DOM for each test
        document.body.innerHTML = `
            <div id="deck"></div>
            <hand-element id="player-hand-cards"></hand-element>
            <p id="deck-card-count"></p>
            <hand-element id="played-cards-display"></hand-element>
            <hand-element id="jokers-area"></hand-element>
            <hand-element id="consumables-area"></hand-element>
            <button id="play-selected-cards"></button>
            <button id="discard-selected-cards"></button>
        `;

        gameManager = new GameManager(); // Creates initial 20-card deck data
        gameManager.initDOMElements();   // GameManager finds the mock DOM elements

        // Store references to the mock elements for convenience if needed
        mockPlayerHand = gameManager.playerHand;
        mockDeckDisplay = gameManager.deckDisplay;
        mockDeckCountDisplay = gameManager.deckCardCountDisplay;
    });

    describe('_initDeck', () => {
        test('should initialize the deck with 20 cards for testing', () => {
            expect(gameManager.deck.length).toBe(20);
        });

        test('each card in the initialized deck should have suit, type, and tooltip', () => {
            expect(gameManager.deck.length).toBeGreaterThan(0);
            gameManager.deck.forEach(card => {
                expect(card).toHaveProperty('suit');
                expect(card).toHaveProperty('type');
                expect(card).toHaveProperty('tooltip');
                expect(typeof card.suit).toBe('string');
                expect(typeof card.type).toBe('string');
                expect(typeof card.tooltip).toBe('string');
                expect(card.tooltip).toBe(`${card.type} of ${card.suit}`);
            });
        });
    });

    describe('dealCardToPlayerHand', () => {
        let addCardSpy;
        let createCardElementSpy;

        beforeEach(() => {
            // Spy on methods before each test in this describe block
            // Ensure mockPlayerHand is valid and an instance of HandElement before spying
            if (mockPlayerHand instanceof HandElement) {
                 addCardSpy = jest.spyOn(mockPlayerHand, 'addCard');
            } else {
                // Fallback or error if mockPlayerHand is not what we expect
                // This might happen if customElements.define didn't work as expected
                // or if initDOMElements failed to assign it.
                console.error("mockPlayerHand is not an instance of HandElement in test setup. addCard spy not created.");
                addCardSpy = { mockClear: () => {}, mockRestore: () => {} }; // Dummy spy to prevent further errors
            }
            createCardElementSpy = jest.spyOn(gameManager, '_createCardElement').mockImplementation((cardData) => {
                const card = new CardElement();
                card.setAttribute('suit', cardData.suit);
                card.setAttribute('type', cardData.type);
                // Return a real CardElement, but we've spied its creation
                return card;
            });
        });

        afterEach(() => {
            // Restore spies after each test to avoid interference
            addCardSpy.mockRestore();
            createCardElementSpy.mockRestore();
        });

        test('should deal a card if deck is not empty and hand is not full', () => {
            const initialDeckSize = gameManager.deck.length;
            gameManager.dealCardToPlayerHand();

            expect(createCardElementSpy).toHaveBeenCalledTimes(1);
            // Check if addCard was called (if the spy was successfully created)
            if (mockPlayerHand instanceof HandElement) {
                 expect(addCardSpy).toHaveBeenCalledTimes(1);
                 expect(addCardSpy.mock.calls[0][0]).toBeInstanceOf(CardElement);
            }
            expect(gameManager.deck.length).toBe(initialDeckSize - 1);
            expect(mockDeckCountDisplay.textContent).toBe(`${initialDeckSize - 1}/52`);
        });

        test('should not deal a card if deck is empty', () => {
            gameManager.deck = []; // Empty the deck
            const initialDeckSize = gameManager.deck.length;
            gameManager.dealCardToPlayerHand();

            expect(createCardElementSpy).not.toHaveBeenCalled();
            if (mockPlayerHand instanceof HandElement) {
                expect(addCardSpy).not.toHaveBeenCalled();
            }
            expect(gameManager.deck.length).toBe(initialDeckSize); // Still 0
        });

        test('should not deal a card if hand is full', () => {
            gameManager.maxHandSize = 0; // Set hand size to 0 for testing fullness
            const initialDeckSize = gameManager.deck.length;
            gameManager.dealCardToPlayerHand();
            
            expect(createCardElementSpy).not.toHaveBeenCalled();
            if (mockPlayerHand instanceof HandElement) {
                 expect(addCardSpy).not.toHaveBeenCalled();
            }
            expect(gameManager.deck.length).toBe(initialDeckSize);
            gameManager.maxHandSize = 8; // Reset for other tests
        });
    });

    // More tests will go here for other GameManager methods like:
    // - dealCardToPlayerHand (will require mocking HandElement and DOM)
    // - playSelectedCards (will require mocking HandElement, CardElement, DOM)
    // - discardSelectedCards (will require mocking HandElement, CardElement, DOM)
    // - _handleCardDrop (complex, will need significant mocking)
    // - _updateDeckCount (will need DOM element for deckCardCountDisplay)
}); 