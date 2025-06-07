import { Deck } from "./Deck.js";
import { Hand } from "./Hand.js";
import { Card } from "./Card.js";
import { calculateBlackjackScore } from "./utils.js";
import { UIInterface } from "./UIInterface.js";
import { GameStorage } from "./GameStorage.js";

/**
 * @typedef {object} HandHolder
 * @property {Hand} main - The main hand of the player.
 * @property {Hand} played - The played hand of the player.
 * @property {Hand} joker - The joker hand of the player.
 * @property {Hand} consumable - The consumable hand of the player.
 */

/**
 * @typedef {object} GameState
 * @property {Deck}           deck             – the deck of cards
 * @property {HandHolder}     hands            – the player's hands
 * @property {number}         currAnte         – current ante value
 * @property {number}         currBlind        – current blind value
 * @property {number}         handsRemaining   – how many hands are left this round
 * @property {number}         handsPerBlind    – (config) hands per blind
 * @property {number}         blindsPerAnte    – (fixed) blinds per ante
 * @property {number}         totalAntes       – (fixed) total antes in the game
 * @property {number}         money            – player's available money
 * @property {number}         discardCount     – how many cards can be discarded
 * @property {number[]}       blindRequirements – thresholds for each blind
 * @property {number}         roundScore       – score for the current round
 * @property {number}         roundMult        – score multiplier for the round
 * @property {number}         handsPlayed      – total hands played so far
 * @property {number}         discardsUsed     – how many discards have been used
 */

/**
 * @classdesc Handles game logic and interactions.
 * 
 * @property {GameState} state - The current state of the game.
 * @property {string[]} suits - The suits of the cards.
 * @property {string[]} types - The types of the cards.
 * @property {Card[]} defaultCards - The default set of cards in the game.
 */
export class gameHandler {
	/**
	 * @class gameHandler
	 */
	constructor(uiInterface) {
		this.uiInterface = uiInterface;
		this.GameStorage = new GameStorage();
		this.resetGame();
	}

	/**
	 * @function resetGame
	 * @description Resets the game state to its initial values.
	 */
	resetGame() {
		this.state = {
			hands: {
				main: new Hand(),
				played: new Hand(),
				joker: new Hand(),
				consumable: new Hand()
			},

			// Core progression
			currAnte: 1,
			currBlind: 1,
			handsRemaining: 4,

			// Hand sizes
			handSize: 5,
			handSizeJoker: 4,
			handSizeConsumable: 2,

			// Config
			handsPerBlind: 4, // Variable
			blindsPerAnte: 3, // Fixed
			totalAntes: 8, // Fixed

			// Resources
			money: 24,
			discardCount: 4,

			// Blind requirements
			blindRequirements: [40, 60, 80],

			// Tracking
			roundScore: 0,
			roundMult: 1,
			handsPlayed: 0,
			discardsUsed: 0,
			endlessMode: false,
			currentBlindName: "Small Blind",

			// optional
			gameStartTime: Date.now(),
			maxAnteThisGame: 1,
			maxRoundScoreThisGame: 0,
			jokersUsedThisGame: 0
		};

		this.suits = ['hearts', 'diamonds', 'clubs', 'spades'];
		this.types = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
		this.defaultCards = [];
		for (let suit of this.suits) {
			for (let type of this.types) {
				this.defaultCards.push(new Card(suit, type));
			}
		}
		this.state.deck = new Deck(this.defaultCards);
	}

	/**
	 * @function dealCards
	 * @description Deals cards to the main hand until the hand is full or no cards are left in the deck.
	 */
	dealCards() {
		while (this.state.hands.main.cards.length < this.state.handSize && this.state.deck.availableCards.length > 0) {
			const card = this.state.deck.drawCard();
			if (card) {
				this.state.hands.main.addCard(card);
			} else {
				console.log("No more cards to deal.");
				break;
			}

			// TODO_UI: Call back to UI to create card UI elements, move_multiple them to the main hand
		}
	}

	/**
	 * @function selectCard
	 * @description Toggles the selection state of a card in a hand.
	 * @param {Hand} hand - The hand containing the card.
	 * @param {number} index - The index of the card in the hand.
	 * @returns {boolean} - The new selection state of the card.
	 */
	selectCard(hand, index) {
		if (index < 0 || index >= hand.cards.length) {
			console.error("Invalid card index.");
			return false;
		}
		const card = hand.cards[index];
		const newState = card.toggleSelect();

		console.log(`Card ${card.type} of ${card.suit} is now ${newState ? "selected" : "deselected"}.`);
		return newState;
	}

	/**
	 * @function discardCards
	 * @description Discards selected cards from the main hand.
	 */
	discardCards() {
		if (this.state.discardsUsed >= this.state.discardCount) {
			console.error("Maximum discards reached.");
			return;
		}

		const selectedCards = this.state.hands.main.cards.filter(card => card.isSelected);
		if (selectedCards.length === 0) {
			console.error("No cards selected for discard.");
			return;
		}

		// Deselect cards after discarding
		selectedCards.forEach(card => card.toggleSelect());

		selectedCards.forEach(card => {
			this.state.hands.main.removeCard(card);
			console.log(`Discarded card: ${card.type} of ${card.suit}`);
		});

		// TODO_UI: Call move_multiple to move said cards from main to discard pile, remove UI element for each card

		this.state.discardsUsed++;
	}

	/**
	 * @function playCards
	 * @description Plays selected cards from the main hand and scores them.
	 */
	playCards() {
		const selectedCards = this.state.hands.main.cards.filter(card => card.isSelected);
		if (selectedCards.length === 0) {
			console.error("No cards selected for play.");
			return;
		}

		// Deselect cards after playing
		selectedCards.forEach(card => card.toggleSelect());

		selectedCards.forEach(card => {
			this.state.hands.played.addCard(card);
			this.state.hands.main.removeCard(card);
			console.log(`Played card: ${card.type} of ${card.suit}`);
		});

		// TODO_UI: Call move_multiple to move said cards from main to played

		// TODO: Implement scoring logic
	}
}