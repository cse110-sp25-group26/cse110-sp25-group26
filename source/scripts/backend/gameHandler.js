import { Deck } from "./Deck.js";
import { Hand } from "./Hand.js";
import { Card } from "./Card.js";
import { UIInterface } from "./UIInterface.js";
import { scoringHandler } from "./scoringHandler.js";
import { Joker } from "./Jokers.js";
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
 * @property {Deck}           deck            	- the deck of cards
 * @property {HandHolder}     hands           	- the player's hands
 * @property {number}         currAnte        	- current ante value
 * @property {number}         currBlind       	- current blind value
 * @property {number}         totalHands   	  	- how many hands may be played this blind
 * @property {number}         handsPerBlind   	- (config) hands per blind
 * @property {number}         blindsPerAnte   	- (fixed) blinds per ante
 * @property {number}         totalAntes      	- (fixed) total antes in the game
 * @property {number}         money           	- player's available money
 * @property {number}         discardCount    	- how many cards can be discarded
 * @property {number[]}       blindRequirements	- thresholds for each blind
 * @property {number}         roundScore      	- score for the current round
 * @property {number}         handsPlayed     	- total hands played so far
 * @property {number}         discardsUsed    	- how many discards have been used
 * @property {number}         handScore	  	  	- score for the current hand
 * @property {number}         handMult 	  	  	- multiplier for the current hand
 * @property {boolean}        endlessMode     	- whether the game is in endless mode
 * @property {UIInterface}	  uiInterface     	- interface provided by the UI to interact with the game
 * @property {string}         currentBlindName	- name of the current blind level
 * @property {number}		  interestCap       - Maximum amount that may be reached by interest
 */

/**
 * @classdesc Handles game logic and interactions.
 *
 * @property {GameState} state - The current state of the game.
 * @property {string[]} suits - The suits of the cards.
 * @property {string[]} types - The types of the cards.
 * @property {Card[]} defaultCards - The default set of cards in the game.
 * @property {object} scoringHandler - The scoring handler for this gameHandler.
 * @property {GameStorage} gameStorage - The storage handler for statistics.
 */
export class gameHandler {
	/**
	 * @class gameHandler
	 * @description Initializes the game handler with default values and resets the game state.
	 * @param {UIInterface} uiInterface - The UI interface to interact with the game.
	 */
	constructor(uiInterface) {
		this.uiInterface = uiInterface;
		this.scoringHandler = new scoringHandler(this);
		this.gameStorage = new GameStorage();
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
				consumable: new Hand(),
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
			// TODO: Determine the algorithm and update these values accordingly per ante
			blindRequirements: [40, 60, 80],
			blindRewards: [4, 6, 8],

			// Tracking
			roundScore: 0,
			handsPlayed: 0,
			discardsUsed: 0,
			endlessMode: false,
			currentBlindName: "Small Blind",

			// Economy
			interestCap: 40,
		};

		this.suits = ["hearts", "diamonds", "clubs", "spades"];
		this.types = [
			"2",
			"3",
			"4",
			"5",
			"6",
			"7",
			"8",
			"9",
			"10",
			"J",
			"Q",
			"K",
			"A",
		];
		this.defaultCards = [];
		for (let suit of this.suits) {
			for (let type of this.types) {
				this.defaultCards.push(new Card(suit, type));
			}
		}
		this.state.deck = new Deck(this.defaultCards, this);

		this.uiInterface.newGame(false); // UI sets up, might call allowPlay if !reset

		this.uiInterface.updateScorekeeper({
			ante: 1,
			round: 1,
			handsRemaining: this.state.totalHands,
			discardsRemaining: this.state.discardCount,
			minScore: this.state.blindRequirements[this.state.currBlind - 1],
			baseReward: this.state.blindRewards[this.state.currBlind - 1],
			blindName: "Small Blind",
			roundScore: 0,
			handScore: 0,
			handMult: 1,
			money: this.state.money,
		});

		this.dealCards();
		this.uiInterface.allowPlay(); // Explicitly allow play after setup
	}

	/**
	 * @function dealCards
	 * @description Deals cards to the main hand until the hand is full or no cards are left in the deck.
	 */
	dealCards() {
		let cards = [];

		while (
			this.state.hands.main.cards.length < this.state.handSize &&
			this.state.deck.availableCards.length > 0
		) {
			const card = this.state.deck.drawCard();
			if (card) {
				this.state.hands.main.addCard(card);
			} else {
				console.log("No more cards to deal.");
				break;
			}
			cards.push(card);
		}

		cards.forEach((card) => {
			this.uiInterface.createUIel(card);
		});
		this.uiInterface.moveMultiple(cards, "deck", "handMain", 0);
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

		console.log(
			`Card ${card.type} of ${card.suit} is now ${
				newState ? "selected" : "deselected"
			}.`
		);
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

		const selectedCards = this.state.hands.main.cards.filter(
			(card) => card.isSelected
		);
		if (selectedCards.length === 0) {
			console.error("No cards selected for discard.");
			return;
		}

		this.uiInterface.disallowPlay();

		// Deselect cards after discarding
		selectedCards.forEach((card) => card.toggleSelect());

		selectedCards.forEach((card) => {
			this.state.hands.main.removeCard(card);
			console.log(`Discarded card: ${card.type} of ${card.suit}`);
		});

		this.uiInterface.moveMultiple(
			selectedCards,
			"handMain",
			"discard_pile",
			0
		);
		selectedCards.forEach((card) => {
			this.uiInterface.removeUIel(card);
		});

		this.state.discardsUsed++;
		this.uiInterface.updateScorekeeper({
			discardsRemaining:
				this.state.discardCount - this.state.discardsUsed,
		});

		this.dealCards();

		// If the main hand is empty after discarding, no more cards can be played
		if (this.state.hands.main.cards.length === 0) {
			console.log(
				"Main hand is empty after discarding. Cannot play cards."
			);
			this.uiInterface.displayLoss(
				"Main hand is empty after discarding. Game Over!"
			);
			return;
		}
		this.uiInterface.allowPlay();
	}

	/**
	 * @function playCards
	 * @description Plays selected cards from the main hand and scores them.
	 */
	playCards() {
		const selectedCards = this.state.hands.main.cards.filter(
			(card) => card.isSelected
		);
		if (selectedCards.length === 0) {
			console.error("No cards selected for play.");
			return;
		}

		this.uiInterface.disallowPlay();

		// Deselect cards after playing
		selectedCards.forEach((card) => card.toggleSelect());

		selectedCards.forEach((card) => {
			this.state.hands.played.addCard(card);
			this.state.hands.main.removeCard(card);
			console.log(`Played card: ${card.type} of ${card.suit}`);
		});

		this.uiInterface.moveMultiple(
			selectedCards,
			"handMain",
			"handPlayed",
			0
		);

		// Track stats - increment hands played
		this.gameStorage.updateStat("totalHandsPlayed", 1);

		this.scoringHandler.scoreHand();

		if (
			this.state.handsPlayed >= this.state.totalHands ||
			this.state.roundScore >=
				this.state.blindRequirements[this.state.currBlind - 1]
		) {
			const cardsToReturnToDeck = [...this.state.hands.main.cards];
			this.uiInterface.moveMultiple(
				this.state.hands.main.cards,
				"handMain",
				"deck",
				0
			);
			cardsToReturnToDeck.forEach((card) => {
				this.uiInterface.removeUIel(card);
			});
			this.state.hands.main.cards = [];

			if (
				this.state.roundScore <
				this.state.blindRequirements[this.state.currBlind - 1]
			) {
				console.log("Not enough score to advance to the next blind.");

				// Track highest ante reached even on loss
				this.gameStorage.setStat(
					"highestAnteReached",
					this.state.currAnte
				);

				this.uiInterface.displayLoss(
					`Failed to meet blind requirement of ${
						this.state.blindRequirements[this.state.currBlind - 1]
					}. Game Over!`
				);
				return; // Game ends here due to failing the blind
			}

			// TODO_UI: Call back to the UI to display the shop
			//          Requires Shop class to be implemented (not done yet)
			console.log("Should run the shop now.");

			// DEBUG: Add a random Joker to the Joker hand for testing
			const jokerTypes = Joker.getJokerTypes();
			const randomJokerType =
				jokerTypes[Math.floor(Math.random() * jokerTypes.length)];
			const joker = Joker.newJoker(randomJokerType);
			this.state.hands.joker.addCard(joker);

			// Track joker usage stats
			this.gameStorage.updateStat("totalJokersUsed", 1);

			this.uiInterface.createUIel(joker);
			this.uiInterface.moveMultiple([joker], "deck", "handJoker", 0);
			joker.UIel.setTooltipPosition("below");
			joker.onJokerEnter({
				gameHandler: this,
				uiInterface: this.uiInterface,
				scoringHandler: this.scoringHandler,
			});
			// END DEBUG
			// TODO: Remove the above debug code when the shop is implemented

			// TODO: Should this go in the shop class?
			if (this.nextBlind()) {
				console.log("Next blind reached and game continues.");
			} else {
				// Game ended
				console.log("Game has concluded.");
			}
		} else {
			this.dealCards();
			this.uiInterface.allowPlay();
		}
	}

	/**
	 * @function nextBlind
	 * @description Advances to the next blind level and resets the game state.
	 * @returns {boolean} - True if the next blind was reached, false if the game is over.
	 */
	nextBlind() {
		this.uiInterface.disallowPlay(); // Disallow play during blind transition/setup

		const baseMoney = this.state.blindRewards[this.state.currBlind - 1];

		// TODO: Calculate more extras
		const extras = [];
		// Add a unit for each hand remaining
		if (this.state.totalHands - this.state.handsPlayed > 0) {
			extras.push([
				"Remaining Hands",
				this.state.totalHands - this.state.handsPlayed,
			]);
		}
		// Add a 10% interest bonus
		let interest = Math.floor(baseMoney * 0.1);
		if (interest > 0 && this.state.money < this.state.interestCap) {
			if (this.state.money + interest > this.state.interestCap) {
				interest = this.state.interestCap - this.state.money;
			}
			extras.push(["Interest", interest]);
		}

		this.state.money += baseMoney;
		for (const [, value] of extras) {
			this.state.money += value;
		}

		this.uiInterface.displayMoney(baseMoney, extras);
		this.uiInterface.updateScorekeeper({
			money: this.state.money,
		});

		// Stubbed, should use the UI return value to determine whether to skip
		// a blind or not
		// TODO_UI: Call back to UI to display blind selection screen
		let nextBlind = this.state.currBlind + 1;

		if (nextBlind > this.state.blindsPerAnte) {
			this.state.currBlind = 1;
			this.state.currAnte++;
			this.state.handsPlayed = 0;
			this.state.discardsUsed = 0;

			// TODO: Add a proper formula for calculating the next blind requirements and rewards.
			// This temporary one just multiplies by 1.5
			this.state.blindRequirements = this.state.blindRequirements.map(
				(req) => Math.ceil(req * 1.5)
			);
			this.state.blindRewards = this.state.blindRewards.map((reward) =>
				Math.ceil(reward * 1.5)
			);

			if (
				this.state.currAnte > this.state.totalAntes &&
				!this.state.endlessMode
			) {
				// Track game completion stats
				this.gameStorage.updateStat("gamesCompleted", 1);
				this.gameStorage.setStat(
					"highestAnteReached",
					this.state.currAnte
				);

				this.uiInterface.displayWin();
				let enterEndlessMode = this.uiInterface.promptEndlessMode();

				if (enterEndlessMode) {
					this.state.endlessMode = true;
					console.log("Entering Endless Mode.");
				} else {
					this.uiInterface.exitGame();
					console.log(
						"Game finished. Player chose not to enter Endless Mode."
					);
					return false;
				}
			}
		} else {
			this.state.currBlind = nextBlind;
		}

		this.state.roundScore = 0;
		this.state.handsPlayed = 0;
		this.state.discardsUsed = 0;

		const cardsToReturnToDeck = [...this.state.hands.main.cards];
		this.uiInterface.moveMultiple(
			this.state.hands.main.cards,
			"handMain",
			"deck",
			0
		);
		cardsToReturnToDeck.forEach((card) => {
			this.uiInterface.removeUIel(card);
		});
		this.state.hands.main.cards = [];
		// TODO/UI: Animate the cards returning from discard to the deck

		this.state.deck.resetDeck();

		if (this.state.currBlind == 1) {
			this.state.currentBlindName = "Small Blind";
		} else if (this.state.currBlind == 2) {
			this.state.currentBlindName = "Big Blind";
		} else if (this.state.currBlind == 3) {
			// TODO: Calculate boss blind and name
			this.state.currentBlindName = "Random Blind";
		}

		this.uiInterface.updateScorekeeper({
			ante: this.state.currAnte,
			round: this.state.currBlind,
			handsRemaining: this.state.totalHands - this.state.handsPlayed,
			discardsRemaining:
				this.state.discardCount - this.state.discardsUsed,
			minScore: this.state.blindRequirements[this.state.currBlind - 1],
			baseReward: this.state.blindRewards[this.state.currBlind - 1],
			blindName: this.state.currentBlindName,
			roundScore: this.state.roundScore,
		});

		this.dealCards();
		this.uiInterface.allowPlay();

		return true;
	}
}

