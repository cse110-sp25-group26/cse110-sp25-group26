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

	/**
	 *
	 */
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
	 * Main handler for the global 'card-dropped' event.
	 * Orchestrates card movement logic based on drop target and source.
	 * @param {CustomEvent} event - The card-dropped event.
	 */
	_handleCardDrop(event) {
		const { card: droppedCard, target: dropTarget, originalHand: sourceHand } = event.detail;

		if (!this._validateInitialDropState(droppedCard, dropTarget, sourceHand)) {
			return; // Validation failed or card was returned to source.
		}

		const targetHandElement = dropTarget.closest('hand-element');

		if (targetHandElement instanceof HandElement) {
			this._processDropOntoHand(droppedCard, sourceHand, targetHandElement);
		} else {
			// Dropped in an invalid location (not a known HandElement)
			this._returnCardToSource(droppedCard, sourceHand, `Card dropped on an invalid area (not a HandElement).`);
		}
	}

	/**
	 * Validates the initial state of a card drop event.
	 * If critical details are missing or if the card is dropped on an invalid background,
	 * it may handle returning the card to its source.
	 * @param {CardElement} droppedCard - The card that was dropped.
	 * @param {HTMLElement} dropTarget - The element the card was dropped on.
	 * @param {HandElement} sourceHand - The original hand of the card.
	 * @returns {boolean} True if processing should continue, false otherwise.
	 * @private
	 */
	_validateInitialDropState(droppedCard, dropTarget, sourceHand) {
		if (!droppedCard) {
			console.warn("Card drop event missing card details. Cannot process drop.");
			return false;
		}

		if (!dropTarget) { // Card dropped on a non-interactive background
			if (sourceHand instanceof HandElement) {
				this._returnCardToSource(droppedCard, sourceHand, "Card dropped on an unidentifiable target (e.g., background).");
			} else {
				console.warn("Card dropped on an unidentifiable target, and no source hand to return to.");
			}
			return false; // Stop further processing
		}
		return true; // All good to proceed
	}

	/**
	 * Processes a card drop when the target is a valid HandElement.
	 * Handles reordering within the same hand or moving to a different hand,
	 * including special rules for specific hands like the playedCardsArea.
	 * @param {CardElement} droppedCard - The card that was dropped.
	 * @param {HandElement} sourceHand - The original hand of the card.
	 * @param {HandElement} targetHandElement - The target hand element.
	 * @private
	 */
	_processDropOntoHand(droppedCard, sourceHand, targetHandElement) {
		// Case 1: Card dropped on the *same* hand (reorder)
		if (sourceHand instanceof HandElement && sourceHand === targetHandElement) {
			console.log(`Card reorder attempted within ${sourceHand.id}. CardMove.js should handle actual reordering.`);
			// HandElement's own _updateLayout (called via its 'card-dropped' listener) or CardMove will handle it.
			// No direct action needed here by GameManager for same-hand reorder visual confirmation.
			return;
		}

		// Case 2: Card dropped on a *different* valid HandElement
		// Rule: Moving to Played Cards Area
		if (targetHandElement === this.playedCardsArea) {
			if (!(sourceHand instanceof HandElement && sourceHand === this.playerHand)) {
				this._returnCardToSource(droppedCard, sourceHand, "Cards can only be played to Played Area from the Player Hand.");
				return;
			}
			console.log(`Card ${droppedCard.getAttribute('type')} of ${droppedCard.getAttribute('suit')} playing to Played Cards area from Player Hand.`);
		} 
		// Add other specific target hand rules here if needed (e.g., for Jokers or Consumables)
		// else if (targetHandElement === this.jokersArea) { ... }
		else {
			const sourceHandId = sourceHand instanceof HandElement ? sourceHand.id : 'an unknown source';
			console.log(`Card ${droppedCard.getAttribute('type')} of ${droppedCard.getAttribute('suit')} moving from ${sourceHandId} to hand: ${targetHandElement.id}`);
		}

		// Perform the move
		if (sourceHand instanceof HandElement) {
			sourceHand.removeCard(droppedCard);
		}
		// If sourceHand is not a HandElement (e.g., card was from a temporary area or newly created and dragged),
		// it's assumed removeChild was handled elsewhere or not needed.
		targetHandElement.addCard(droppedCard);
	}

	/**
	 * Returns a card to its source hand, if valid.
	 * @param {CardElement} droppedCard - The card to return.
	 * @param {HandElement} sourceHand - The original hand to return the card to.
	 * @param {string} [reasonMessage=null] - Optional message to log explaining why the card is being returned.
	 * @private
	 */
	_returnCardToSource(droppedCard, sourceHand, reasonMessage = null) {
		if (reasonMessage) {
			console.log(reasonMessage);
		}
		if (sourceHand instanceof HandElement) {
			console.log(`Returning card (${droppedCard.getAttribute('type')} of ${droppedCard.getAttribute('suit')}) to source hand: ${sourceHand.id}`);
			sourceHand._updateLayout(); // Tell original hand to reclaim/re-layout the card
		} else {
			console.warn(`Cannot return card (${droppedCard.getAttribute('type')} of ${droppedCard.getAttribute('suit')}). No valid sourceHand provided or card might not belong to a managed hand.`);
			// If the card is still in the DOM and has a parent, it might just stay where it was visually snapped back by draggable.
			// If not, it might be "lost" if not handled by CardElement itself.
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