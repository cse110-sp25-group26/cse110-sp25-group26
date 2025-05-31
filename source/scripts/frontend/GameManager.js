import { CardElement } from './CardElement.js';
import { HandElement } from './HandElement.js';
// import { Deck } from './Deck.js'; // Assuming a Deck class might be created later

/**
 * @class GameManager
 * @classdesc Manages the overall game flow, card movements, and UI interactions.
 */
export default class GameManager {
    /**
     * Initializes the GameManager, setting up references to UI elements and
     * event listeners.
     */
    constructor() {
        // UI Element References - Will be initialized by initDOMElements
        this.deckDisplay = null;
        this.deckCardCountDisplay = null;
        this.playerHand = null;
        this.playedCardsArea = null;
        this.jokersArea = null;
        this.consumablesArea = null;
        this.playSelectedButton = null;
        this.discardSelectedButton = null;

        // Game State
        this.deck = []; // Array to hold card data for the actual deck
        this.maxHandSize = 8; // Example, can be configured

        this._initDeck();
        // Defer event listener setup until DOM elements are confirmed
        // this._setupEventListeners(); 

        // TODO: Initialize HandElements for reordering if they are indeed <hand-element>
        // This will be handled in gameplay.html after elements are confirmed and GameManager is instantiated
    }

    /**
     * Initializes references to DOM elements. Call this after custom elements are defined.
     */
    initDOMElements() {
        this.deckDisplay = document.getElementById('deck');
        this.deckCardCountDisplay = document.getElementById('deck-card-count');
        this.playerHand = document.getElementById('player-hand-cards');
        this.playedCardsArea = document.getElementById('played-cards-display');
        this.jokersArea = document.getElementById('jokers-area');
        this.consumablesArea = document.getElementById('consumables-area');
        this.playSelectedButton = document.getElementById('play-selected-cards');
        this.discardSelectedButton = document.getElementById('discard-selected-cards');

        // Now that elements are assigned, setup event listeners
        this._setupEventListeners();
        this._updateDeckCount(); // Initialize deck count display

        console.log("GameManager DOM elements initialized.");
    }

    /**
     * Initializes the deck with a standard set of cards (example).
     * This should be replaced with actual game deck logic.
     */
    _initDeck() {
        const suits = ['Spades', 'Hearts', 'Clubs', 'Diamonds'];
        const types = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        
        // For testing, let's create a few cards
        for (let i = 0; i < 20; i++) {
            const suit = suits[Math.floor(Math.random() * suits.length)];
            const type = types[Math.floor(Math.random() * types.length)];
            this.deck.push({ suit, type, tooltip: `${type} of ${suit}` });
        }
        this._updateDeckCount();
        console.log("Game Manager Initialized with a test deck.");
    }

    /**
     * Sets up global event listeners for card drops and button clicks.
     */
    _setupEventListeners() {
        // Listen for cards being dropped anywhere to handle inter-hand movement
        document.addEventListener('card-dropped', (event) => {
            this._handleCardDrop(event);
        });

        if (this.playSelectedButton) {
            this.playSelectedButton.addEventListener('click', () => this.playSelectedCards());
        }
        if (this.discardSelectedButton) {
            this.discardSelectedButton.addEventListener('click', () => this.discardSelectedCards());
        }
        if (this.deckDisplay){ // Allow drawing by clicking the deck
            this.deckDisplay.addEventListener('click', () => this.dealCardToPlayerHand());
        }
    }

    _updateDeckCount() {
        if (this.deckCardCountDisplay) {
            this.deckCardCountDisplay.textContent = `${this.deck.length}/52`; // Assuming 52 total for now
        } else {
            // This might be called before initDOMElements if _initDeck calls it.
            // console.warn("deckCardCountDisplay not ready for _updateDeckCount");
        }
    }

    /**
     * Deals a card from the deck to the player's hand.
     */
    dealCardToPlayerHand() {
        if (!(this.playerHand instanceof HandElement)) {
            console.error("Player hand is not a HandElement. Cannot add card.");
            return;
        }
        if (this.deck.length === 0) {
            console.warn("Deck is empty!");
            return;
        }
        if (this.playerHand.cards.length >= this.maxHandSize) {
            console.warn("Player hand is full!");
            return;
        }

        const cardData = this.deck.pop(); // Get card from top of deck
        const cardElement = this._createCardElement(cardData);
        
        this.playerHand.addCard(cardElement);
        this._updateDeckCount();
        console.log(`Dealt ${cardData.type} of ${cardData.suit} to player hand.`);
    }

    /**
     * Creates a CardElement from card data.
     * @param {object} cardData - Object containing suit, type, tooltip.
     * @returns {CardElement} The created card element.
     */
    _createCardElement(cardData) {
        const card = new CardElement();
        card.setAttribute('suit', cardData.suit);
        card.setAttribute('type', cardData.type);
        if (cardData.tooltip) {
            card.setAttribute('tooltip', cardData.tooltip);
        }
        // Potentially set other attributes like id, value, etc.
        return card;
    }

    /**
     * Handles the global card-dropped event to manage moves between hands/areas.
     * @param {CustomEvent} event - The card-dropped event.
     */
    _handleCardDrop(event) {
        const droppedCard = event.detail.card; 
        const dropTarget = event.detail.target; 
        const sourceHand = event.detail.originalHand; // Use originalHand from event

        if (!droppedCard) { // Target can sometimes be null if dropped on non-interactive background
            console.warn("Card drop event missing card details.");
            return;
        }
        if (!dropTarget && sourceHand) {
            console.log("Card dropped on an unidentifiable target (e.g. background). Returning to source hand.");
            sourceHand._updateLayout();
            return;
        }
        if (!dropTarget) {
             console.warn("Card drop event missing target and no source hand to return to.");
            return;
        }

        // console.log('Source hand from event:', sourceHand ? sourceHand.id : 'none');

        const targetHandElement = dropTarget.closest('hand-element');
        // console.log('Target hand element:', targetHandElement ? targetHandElement.id : 'none');

        if (targetHandElement && targetHandElement instanceof HandElement) {
            if (sourceHand && sourceHand === targetHandElement) {
                // Card dropped on the *same* hand.
                // Reordering logic is (or should be) handled by CardMove.js and HandElement's own _updateLayout after card-dropped.
                console.log(`Card reorder attempted within ${sourceHand.id}. CardMove.js should handle.`);
                // HandElement listens to 'card-dropped' and calls _updateLayout. CardMove also listens.
                // No direct action needed here by GameManager for same-hand reorder.
                return; // Explicitly stop further processing for same-hand drops.
            }
            
            // Card dropped on a *different* valid HandElement
            console.log(`Card ${droppedCard.getAttribute('type')} moving to hand: ${targetHandElement.id}`);
            if (sourceHand && sourceHand instanceof HandElement) {
                sourceHand.removeCard(droppedCard); 
            }
            targetHandElement.addCard(droppedCard); 

        } else if (this.playedCardsArea && (dropTarget === this.playedCardsArea || this.playedCardsArea.contains(dropTarget))) {
            // Dropped on played cards area (which is also a HandElement now)
            if (sourceHand && sourceHand === this.playerHand) { // Only allow playing from player hand for now
                console.log(`Card ${droppedCard.getAttribute('type')} playing to Played Cards area.`);
                sourceHand.removeCard(droppedCard);
                if (this.playedCardsArea instanceof HandElement) {
                    this.playedCardsArea.addCard(droppedCard);
                } else {
                    // This else block should ideally not be reached if playedCardsArea is always a HandElement
                    this.playedCardsArea.appendChild(droppedCard);
                    droppedCard.style.position = 'relative'; 
                    droppedCard.style.left = 'auto';
                    droppedCard.style.top = 'auto';
                }
            } else if (sourceHand && sourceHand !== this.playerHand) {
                console.log("Card dropped on played area but not from player hand. Returning to source.");
                if (sourceHand instanceof HandElement) {
                    sourceHand._updateLayout(); // Tell original hand to reclaim/re-layout
                }
            }
        } else {
            // Dropped in an invalid location (not a known HandElement, not the played cards area)
            console.log("Card dropped in invalid location (not a valid hand/area).");
            if (sourceHand && sourceHand instanceof HandElement) {
                console.log(`Returning card to source hand: ${sourceHand.id}`);
                sourceHand._updateLayout(); 
            } else {
                console.warn("Card dropped, but no valid sourceHand to return it to.");
            }
        }
    }

    /**
     * Moves selected cards from the player's hand to the played cards area.
     */
    playSelectedCards() {
        if (!(this.playerHand instanceof HandElement)) return;
        const selectedCards = this.playerHand.getSelectedCards();
        if (selectedCards.length === 0) {
            console.log("No cards selected to play.");
            return;
        }
        selectedCards.forEach(card => {
            this.playerHand.removeCard(card);
            if (this.playedCardsArea instanceof HandElement) {
                this.playedCardsArea.addCard(card);
            } else {
                this.playedCardsArea.appendChild(card); // Manual append
                card.style.position = 'relative'; card.style.left = 'auto'; card.style.top = 'auto';
            }
            console.log(`Played ${card.getAttribute('type')} of ${card.getAttribute('suit')}`);
        });
        // Potentially trigger score calculation or other game logic here
    }

    /**
     * Removes selected cards from the player's hand (discarding them).
     */
    discardSelectedCards() {
        if (!(this.playerHand instanceof HandElement)) return;

        const selectedCards = this.playerHand.getSelectedCards();
        if (selectedCards.length === 0) {
            console.log("No cards selected to discard.");
            return;
        }
        selectedCards.forEach(card => {
            this.playerHand.removeCard(card); // HandElement removes from DOM
            console.log(`Discarded ${card.getAttribute('type')} of ${card.getAttribute('suit')}`);
            // Add to a logical discard pile array if needed for game rules, e.g., this.discardPile.push(cardData);
        });
        // Update discard count if UI_ScoreKeeper is managed here or via events
    }
}

// Make GameManager globally available for now, or instantiate it in gameplay.html script
// window.gameManager = new GameManager();
// console.log("GameManager instance created and attached to window.");

// It's better to instantiate and use it within the module script in gameplay.html
// For example:
// import GameManager from './scripts/frontend/GameManager.js';
// const gm = new GameManager();
// And then attach event listeners from gm to buttons, or call gm methods. 