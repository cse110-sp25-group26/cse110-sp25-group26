import { Deck } from "./Deck.js";
import { Hand } from "./Hand.js";
import { Card } from "./Card.js";
import { calculateBlackjackScore } from "./utils.js";
import { UIInterface } from "./UIInterface.js";
import { GameStorage } from "./GameStorage.js";

/**
 * @classdesc Handles game logic and interactions with statistics tracking.
 */
export class gameHandler {
	/**
	 * @class gameHandler
	 * @description Initializes the game handler with default values and resets the game state.
	 * @param {UIInterface} uiInterface - The UI interface to interact with the game.
	 */
	constructor(uiInterface) {
		this.uiInterface = uiInterface;
		this.gameStorage = new GameStorage();
		this.resetGame();
		uiInterface.gameHandler = this;
	}

	/**
	 * @function resetGame
	 * @description Resets the game state to its initial values.
	 */
	resetGame() {
		// Track game started
		this.gameStorage.updateStat('gamesStarted');
		
		// Set first game date if this is the first game
		const stats = this.gameStorage.getStats();
		if (!stats.firstGameDate) {
			const data = this.gameStorage.readFromStorage();
			data.lifetimeStats.firstGameDate = new Date().toISOString();
			this.gameStorage.writeToStorage(data);
		}

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
			handsPerBlind: 4,
			blindsPerAnte: 3,
			totalAntes: 8,

			// Resources
			money: 24,
			discardCount: 4,

			// Blind requirements
			blindRequirements: [40, 60, 80],
			blindRewards: [4, 6, 8],

			// Tracking
			roundScore: 0,
			handsPlayed: 0,
			discardsUsed: 0,
			endlessMode: false,
			currentBlindName: "Small Blind",
			
			// Stats tracking
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

		this.uiInterface.newGame(false);

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
			money: this.state.money
		});

		this.dealCards();
		this.uiInterface.allowPlay();
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

		cards.forEach(card => {
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
		
		this.uiInterface.disallowPlay();

		selectedCards.forEach(card => card.toggleSelect());

		selectedCards.forEach(card => {
			this.state.hands.main.removeCard(card);
			console.log(`Discarded card: ${card.type} of ${card.suit}`);
		});

		this.uiInterface.moveMultiple(selectedCards, "handMain", "discard_pile", 0);
		selectedCards.forEach(card => {
			this.uiInterface.removeUIel(card);
		});

		this.state.discardsUsed++;
		this.uiInterface.updateScorekeeper({
			discardsRemaining: this.state.discardCount - this.state.discardsUsed
		});

		this.dealCards();

		if (this.state.hands.main.cards.length === 0) {
			console.log("Main hand is empty after discarding. Cannot play cards.");
			this.endGame(false); // Game ended in loss
			this.uiInterface.displayLoss("Main hand is empty after discarding. Game Over!");
			return;
		}
		this.uiInterface.allowPlay();
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

		this.uiInterface.disallowPlay();

		// Track hands played
		this.gameStorage.updateStat('totalHandsPlayed');

		selectedCards.forEach(card => card.toggleSelect());

		selectedCards.forEach(card => {
			this.state.hands.played.addCard(card);
			this.state.hands.main.removeCard(card);
			console.log(`Played card: ${card.type} of ${card.suit}`);
		});

		this.uiInterface.moveMultiple(selectedCards, "handMain", "handPlayed", 0);

		this.scoreHand();

		if (this.state.handsPlayed >= this.state.totalHands || this.state.roundScore >= this.state.blindRequirements[this.state.currBlind - 1]) {
			this.uiInterface.moveMultiple(this.state.hands.main.cards, "handMain", "deck", 0);
			this.state.hands.main.cards = [];
			
			if (this.state.roundScore < this.state.blindRequirements[this.state.currBlind - 1]) {
				console.log("Not enough score to advance to the next blind.");
				this.endGame(false); // Game ended in loss
				this.uiInterface.displayLoss(`Failed to meet blind requirement of ${this.state.blindRequirements[this.state.currBlind - 1]}. Game Over!`);
				return;
			}

			console.log("Should run the shop now.");

			if (this.nextBlind()) {
				console.log("Next blind reached and game continues.");
			} else {
				console.log("Game has concluded.");
			}
		} else {
			this.dealCards();
			this.uiInterface.allowPlay();
		}
	}

	/**
	 * @function scoreHand
	 * @description Scores the played hand, updates the round score, and sets up for the next round.
	 */
	scoreHand() {
		if (this.state.hands.played.cards.length === 0) {
			console.log("No cards played. No score.");
			return;
		}

		this.state.handScore = 0;
		this.state.handMult = 1;

		for (let i = 0; i < this.state.hands.played.cards.length;) {
			const card = this.state.hands.played.cards[i];
			let cardValue = card.getValue();

			this.state.handScore += cardValue;
			this.uiInterface.updateScorekeeper({
				handScore: this.state.handScore
			});

			console.log(`Card ${card.type} of ${card.suit} scored: ${cardValue}`);
			this.uiInterface.scoreCard(card, [`+${cardValue} Chips`], ["#00FF00"]);

			i += 1;
		}

		const score = calculateBlackjackScore(this.state.hands.played.cards);
		if (score > 21) {
			console.log("Score exceeds 21. Hand is bust.");

			this.state.handScore = 0;
			this.state.handMult = 1;
			
			this.uiInterface.updateScorekeeper({
				handScore: 0,
				handMult: 1
			});
			this.uiInterface.displayBust();
		} else {
			const handTotal = this.state.handScore * this.state.handMult;
			this.state.roundScore += handTotal;

			// Track highest round score
			if (this.state.roundScore > this.state.maxRoundScoreThisGame) {
				this.state.maxRoundScoreThisGame = this.state.roundScore;
				
				// Update global high score if this beats it
				const currentStats = this.gameStorage.getStats();
				if (this.state.roundScore > currentStats.highestRoundScore) {
					const data = this.gameStorage.readFromStorage();
					data.lifetimeStats.highestRoundScore = this.state.roundScore;
					this.gameStorage.writeToStorage(data);
				}
			}

			this.state.handScore = 0;
			this.state.handMult = 1;
			
			this.uiInterface.updateScorekeeper({
				roundScore: this.state.roundScore,
				handScore: 0,
				handMult: 1
			});

			this.uiInterface.moveMultiple(this.state.hands.played.cards, "handPlayed", "offscreen", 0);
			for (const card of this.state.hands.played.cards) {
				this.uiInterface.removeUIel(card);
			}
		}

		this.state.handsPlayed++;
		this.uiInterface.updateScorekeeper({
			handsRemaining: this.state.totalHands - this.state.handsPlayed
		});
		
		this.state.hands.played.cards = [];
	}

	/**
	 * @function nextBlind
	 * @description Advances to the next blind level and resets the game state.
	 * @returns {boolean} - True if the next blind was reached, false if the game is over.
	 */
	nextBlind() {
		this.uiInterface.disallowPlay();

		const baseMoney = this.state.blindRewards[this.state.currBlind - 1];

		const extras = [];
		if (this.state.totalHands - this.state.handsPlayed > 0) {
			extras.push(["Remaining Hands", this.state.totalHands - this.state.handsPlayed]);
		}

		this.state.money += baseMoney;
		for (const [, value] of extras) {
			this.state.money += value;
		}

		this.uiInterface.displayMoney(baseMoney, extras);
		this.uiInterface.updateScorekeeper({
			money: this.state.money
		});

		let nextBlind = this.state.currBlind + 1;

		if (nextBlind > this.state.blindsPerAnte) {
			this.state.currBlind = 1;
			this.state.currAnte++;
			
			// Track highest ante reached
			if (this.state.currAnte > this.state.maxAnteThisGame) {
				this.state.maxAnteThisGame = this.state.currAnte;
				
				const currentStats = this.gameStorage.getStats();
				if (this.state.currAnte > currentStats.highestAnteReached) {
					const data = this.gameStorage.readFromStorage();
					data.lifetimeStats.highestAnteReached = this.state.currAnte;
					this.gameStorage.writeToStorage(data);
				}
			}
			
			this.state.handsPlayed = 0;
			this.state.discardsUsed = 0;

			this.state.blindRequirements = this.state.blindRequirements.map(req => Math.ceil(req * 1.5));
			this.state.blindRewards = this.state.blindRewards.map(reward => Math.ceil(reward * 1.5));

			if (this.state.currAnte > this.state.totalAntes && !this.state.endlessMode) {
				this.uiInterface.displayWin();
				let enterEndlessMode = this.uiInterface.promptEndlessMode();

				if (enterEndlessMode) {
					this.state.endlessMode = true;
					console.log("Entering Endless Mode.");
				} else {
					this.endGame(true); // Game completed successfully
					this.uiInterface.exitGame();
					console.log("Game finished. Player chose not to enter Endless Mode.");
					return false;
				}
			}
		} else {
			this.state.currBlind = nextBlind;
		}

		this.state.roundScore = 0;
		this.state.handsPlayed = 0;
		this.state.discardsUsed = 0;

		this.uiInterface.moveMultiple(this.state.hands.main.cards, "handMain", "deck", 0);
		this.state.hands.main.cards = [];
		
		if (this.uiInterface.handMain.contents.length !== 0) {
			console.error("\x1b[31mUI hand is not empty after scoring.\x1b[0m");
		}

		this.state.deck.resetDeck();

		if (this.state.currBlind == 1) {
			this.state.currentBlindName = "Small Blind";
		} else if (this.state.currBlind == 2) {
			this.state.currentBlindName = "Big Blind";
		} else if (this.state.currBlind == 3) {
			this.state.currentBlindName = "Random Blind";
		}
		
		this.uiInterface.updateScorekeeper({
			ante: this.state.currAnte,
			round: this.state.currBlind,
			handsRemaining: this.state.totalHands - this.state.handsPlayed,
			discardsRemaining: this.state.discardCount - this.state.discardsUsed,
			minScore: this.state.blindRequirements[this.state.currBlind - 1],
			baseReward: this.state.blindRewards[this.state.currBlind - 1],
			blindName: this.state.currentBlindName,
			roundScore: this.state.roundScore
		});

		this.dealCards();
		this.uiInterface.allowPlay();

		return true;
	}

	/**
	 * @function useJoker
	 * @description Tracks when a joker is used in the game.
	 * @param {string} jokerName - Name/ID of the joker used
	 */
	useJoker(jokerName) {
		this.gameStorage.updateStat('totalJokersUsed');
		this.state.jokersUsedThisGame++;
		console.log(`Joker used: ${jokerName}. Total this game: ${this.state.jokersUsedThisGame}`);
	}

	/**
	 * @function endGame
	 * @description Called when the game ends, tracks completion stats.
	 * @param {boolean} completed - Whether the game was completed successfully
	 */
	endGame(completed) {
		if (completed) {
			this.gameStorage.updateStat('gamesCompleted');
			console.log("Game completed successfully!");
		}

		// Calculate final stats for this game
		const gameLength = Date.now() - this.state.gameStartTime;
		console.log(`Game lasted ${Math.round(gameLength / 1000)} seconds`);
		console.log(`Max ante reached: ${this.state.maxAnteThisGame}`);
		console.log(`Max round score: ${this.state.maxRoundScoreThisGame}`);
		console.log(`Jokers used: ${this.state.jokersUsedThisGame}`);
	}

	/**
	 * @function getGameStats
	 * @description Returns current lifetime statistics.
	 * @returns {object} The lifetime stats object
	 */
	getGameStats() {
		return this.gameStorage.getStats();
	}
}