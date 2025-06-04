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
	 * @description Updates the displayed deck count based on the current deck length.
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
	 * Validates the core details from a card drop event.
	 * @param {object} eventDetail - The detail object from the card-dropped event.
	 * @returns {object|null} An object with { droppedCard, dropTarget, sourceHand } or null if validation fails.
	 * @private
	 */
	_validateCardDropDetails(eventDetail) {
		const { card: droppedCard, target: dropTarget, originalHand: sourceHand } = eventDetail;

		if (!droppedCard) {
			console.warn("Card drop event missing card details.");
			return null;
		}
		if (!dropTarget && sourceHand) {
			console.log("Card dropped on an unidentifiable target. Returning to source hand.");
			sourceHand._updateLayout(); // Or sourceHand.addCard(droppedCard) if remove was already done
			return null;
		}
		if (!dropTarget) {
			console.warn("Card drop event missing target and no source hand to return to.");
			return null;
		}
		return { droppedCard, dropTarget, sourceHand };
	}

	/**
	 * Processes a card drop onto a specific HandElement.
	 * Handles reordering within the same hand or moving to a different hand.
	 * @param {CardElement} droppedCard - The card that was dropped.
	 * @param {HandElement|null} sourceHand - The hand the card originated from.
	 * @param {HandElement} targetHandElement - The hand element the card was dropped on.
	 * @returns {boolean} True if the drop was processed, false otherwise.
	 * @private
	 */
	_processDropOnSpecificHand(droppedCard, sourceHand, targetHandElement) {
		if (sourceHand && sourceHand === targetHandElement) {
			// Card dropped on the *same* hand for reordering.
			console.log(`Card reorder attempted within ${sourceHand.id}. Should be handled by other listeners.`);
			return true;
		}

		// Card dropped on a *different* valid HandElement
		console.log(`Card ${droppedCard.getAttribute('type')} of ${droppedCard.getAttribute('suit')} moving to hand: ${targetHandElement.id}`);
		if (sourceHand && sourceHand instanceof HandElement) {
			sourceHand.removeCard(droppedCard);
		}
		targetHandElement.addCard(droppedCard);
		return true; // Drop processed by moving the card.
	}

	/**
	 * Checks if the drop target is the designated played cards area or a child of it.
	 * @param {EventTarget} dropTarget - The target element where the card was dropped.
	 * @returns {boolean} True if the target is the played cards area, false otherwise.
	 * @private
	 */
	_isDropTargetPlayedArea(dropTarget) {
		if (!this.playedCardsArea) {
			return false;
		}
		return dropTarget === this.playedCardsArea || this.playedCardsArea.contains(dropTarget);
	}

	/**
	 * Processes a card drop onto the played cards area.
	 * @param {CardElement} droppedCard - The card that was dropped.
	 * @param {HandElement|null} sourceHand - The hand the card originated from.
	 * @returns {boolean} True if the drop was processed, false otherwise.
	 * @private
	 */
	_processDropOnPlayedArea(droppedCard, sourceHand) {
		if (sourceHand && sourceHand === this.playerHand) { // Only allow playing from player hand
			console.log(`Card ${droppedCard.getAttribute('type')} of ${droppedCard.getAttribute('suit')} playing to Played Cards area.`);
			sourceHand.removeCard(droppedCard);
			if (this.playedCardsArea instanceof HandElement) {
				this.playedCardsArea.addCard(droppedCard);
			} else {
				this.playedCardsArea.appendChild(droppedCard);
				droppedCard.style.position = 'relative';
				droppedCard.style.left = 'auto';
				droppedCard.style.top = 'auto';
			}
			return true; // Card played successfully.
		} else if (sourceHand && sourceHand !== this.playerHand) {
			console.log("Card dropped on played area but not from player hand. Returning to source.");
			if (sourceHand instanceof HandElement) {
				sourceHand._updateLayout();
			}
			return true; // Event processed (card returned or attempt made).
		} else if (!sourceHand) {
			console.warn("Card dropped on played area from unknown source. Action not taken.");
			return false;
		}
		return false;
	}

	/**
	 * Handles an invalid card drop attempt, usually by returning the card to its source hand.
	 * @param {HandElement|null} sourceHand - The hand the card originated from.
	 * @private
	 */
	_handleInvalidDropAttempt(sourceHand) {
		console.log("Card dropped in invalid location (not a valid hand/area or not handled by specific rules).");
		if (sourceHand && sourceHand instanceof HandElement) {
			console.log(`Returning card to source hand: ${sourceHand.id}`);
			sourceHand._updateLayout(); // Tell original hand to reclaim/re-layout.
		} else {
			// This case implies a card was dropped from an unknown source to an invalid location.
			console.warn("Card dropped in invalid location, and no valid sourceHand to return it to.");
		}
		// No explicit return true/false needed as this is the final fallback.
	}

	/**
	 * Handles the global card-dropped event to manage moves between hands/areas.
	 * @param {CustomEvent} event - The card-dropped event.
	 */
	_handleCardDrop(event) {
		const validatedDetails = this._validateCardDropDetails(event.detail);
		if (!validatedDetails) {
			return; // Validation failed, messages already logged by the helper.
		}
		const { droppedCard, dropTarget, sourceHand } = validatedDetails;

		const targetHandElement = dropTarget.closest('hand-element');
		if (targetHandElement && targetHandElement instanceof HandElement) {
			if (this._processDropOnSpecificHand(droppedCard, sourceHand, targetHandElement)) {
				return; // Drop was handled.
			}
		}
        
		if (this._isDropTargetPlayedArea(dropTarget)) {
			if (this._processDropOnPlayedArea(droppedCard, sourceHand)) {
				return; // Drop was handled.
			}
		}

		// If none of the above specific handlers processed the drop, it's an invalid attempt.
		this._handleInvalidDropAttempt(sourceHand);
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
// And then attach event listeners from gm to buttons, or call gm methods. 