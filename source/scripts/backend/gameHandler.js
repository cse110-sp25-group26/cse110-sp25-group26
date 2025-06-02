import { Deck } from "./Deck.js";
import { Hand } from "./Hand.js";
import { Card } from "./Card.js";
import { calculateBlackjackScore } from "./utils.js";
import { UIInterface } from "./UIInterface.js";

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
 * @property {number}         totalHands   	   – how many hands may be played this ante
 * @property {number}         handsPerBlind    – (config) hands per blind
 * @property {number}         blindsPerAnte    – (fixed) blinds per ante
 * @property {number}         totalAntes       – (fixed) total antes in the game
 * @property {number}         money            – player's available money
 * @property {number}         discardCount     – how many cards can be discarded
 * @property {number[]}       blindRequirements – thresholds for each blind
 * @property {number}         roundScore       – score for the current round
 * @property {number}         handsPlayed      – total hands played so far
 * @property {number}         discardsUsed     – how many discards have been used
 * @property {number}         handScore	  	   – score for the current hand
 * @property {number}         handMult 	  	   – multiplier for the current hand
 * @property {boolean}        endlessMode      – whether the game is in endless mode
 * @property {UIInterface}	  uiInterface      - interface provided by the UI to interact with the game
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
	 * @description Initializes the game handler with default values and resets the game state.
	 * @param {UIInterface} uiInterface - The UI interface to interact with the game.
	 */
	constructor(uiInterface) {
		this.uiInterface = uiInterface;
		this.resetGame();
		uiInterface.gameHandler = this;
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
			totalHands: 4,

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
			handsPlayed: 0,
			discardsUsed: 0,
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
		let cards = [];

		while (this.state.hands.main.cards.length < this.state.handSize && this.state.deck.availableCards.length > 0) {
			const card = this.state.deck.drawCard();
			if (card) {
				this.state.hands.main.addCard(card);
			} else {
				console.log("No more cards to deal.");
				break;
			}
			cards.push(card);
		}

		// TODO_UI: Call back to UI to create card UI elements, move_multiple them to the main hand

		cards.forEach(card => {
			this.uiInterface.createUIel(card);
		});
		this.uiInterface.moveMultiple(cards, "deck", "hand_main", 0);
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
		this.uiInterface.moveMultiple(selectedCards, "hand_main", "discard_pile", 0);
		selectedCards.forEach(card => {
			this.uiInterface.removeUIel(card);
		});

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
		this.uiInterface.moveMultiple(selectedCards, "hand_main", "hand_played", 0);

		this.scoreHand();

		if (this.state.handsPlayed >= this.state.totalHands || this.state.roundScore >= this.state.blindRequirements[this.state.currBlind - 1]) {
			// TODO_UI: Call back to UI to move_multiple the main hand cards back to the deck
			this.uiInterface.moveMultiple(this.state.hands.main.cards, "hand_main", "deck", 0);

			this.state.hands.main.cards = [];
			
			if (this.state.roundScore < this.state.blindRequirements[this.state.currBlind - 1]) {
				console.log("Not enough score to advance to the next blind.");
				// TODO_UI: Call back to UI to display loss message and exit game
				return;
			}

			// TODO_UI: Call back to the UI to display the shop
			//          Requires Shop class to be implemented (not done yet)
			console.log("Should run the shop now.");

			// TODO: Should this go in the shop class?
			if (this.nextBlind()) {
				console.log("Next blind reached.");
				// TODO: Finish this
			} else {
				// TODO_UI: Call back to UI to exit the game
				console.log("Game over.");
			}
		}
	}

	/**
	 * @function scoreHand
	 * @description Scores the played hand, updates the round score, and sets up for the next round.
	 */
	scoreHand() {
		// If the hand is empty, log and return
		if (this.state.hands.played.cards.length === 0) {
			console.log("No cards played. No score.");
			return;
		}

		this.state.handScore = 0;
		this.state.handMult = 1;

		for (let i = 0; i < this.state.hands.played.cards.length;) {
			const card = this.state.hands.played.cards[i];
			
			let cardValue = card.getValue();

			// TODO_UI: Call back to UI to play scoring animation

			// TODO: Check for attributes on the card

			// TODO: Check for applicable jokers to this card
			// ->UI: Call back to UI to play joker animation (likely also score animation)

			this.state.handScore += cardValue;
			console.log(`Card ${card.type} of ${card.suit} scored: ${cardValue}`);

			// TODO_UI: Call back to UI to update the scorekeeper

			// TODO: Conditions for other increments
			i += 1;
		}
		

		// Verify that the played hand has a valid blackjack score
		const score = calculateBlackjackScore(this.state.hands.played.cards);
		if (score > 21) {
			console.log("Score exceeds 21. Hand is bust.");

			this.state.handScore = 0;
			this.state.handMult = 1;
			
			// TODO_UI: Call back to UI to display bust, update scorekeeper
		} else {
			this.state.roundScore += this.state.handScore * this.state.handMult;
			this.state.handScore = 0;
			this.state.handMult = 1;

			// TODO_UI: Call back to UI to display won money, update scorekeeper,
			//          move_multiple the played cards offscreen and remove their UI elements
		}

		this.state.handsPlayed++;

		this.uiInterface.moveMultiple(this.state.hands.played.cards, "hand_played", "deck", 0);
		
		this.state.hands.played.cards = [];
	}

	/**
	 * @function nextBlind
	 * @description Advances to the next blind level and resets the game state.
	 * @returns {boolean} - True if the next blind was reached, false if the game is over.
	 */
	nextBlind() {
		// TODO_UI: Call back to UI to display blind selection screen

		// Stubbed, should use the UI return value to determine whether to skip
		// a blind or not
		let nextBlind = this.state.currBlind + 1;

		if (nextBlind > this.state.blindsPerAnte) {
			this.state.currBlind = 1;
			this.state.currAnte++;
			this.state.handsPlayed = 0;
			this.state.discardsUsed = 0;

			if (this.state.currAnte > this.state.totalAntes && !this.state.endlessMode) {
				// TODO_UI: Game win! Call back to UI to display win screen and
				//          ask if user wants endless mode
				let enterEndlessMode = false; // STUB

				console.log("Game won!");

				if (enterEndlessMode) {
					this.state.endlessMode = true;
				} else {
					// TODO_UI: Call back to UI to exit the game (not game over)
					this.uiInterface.exitGame();
					console.log("Game finished.");
					return false;
				}
			}
		} else {
			this.state.currBlind = nextBlind;
		}

		this.state.roundScore = 0;
		this.state.handsPlayed = 0;
		this.state.discardsUsed = 0;

		this.state.deck.resetDeck();

		// TODO: There's probably a lot more stuff to reset but I don't know what yet
		//       I need to implement the tests first and just run this a bit

		return true;
	}
}