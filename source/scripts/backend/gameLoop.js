/**
 * @fileoverview Game loop implementation for the card game
 * @module gameLoop
 */

import { gameHandler } from "./gameHandler.js";

/**
 * @class GameLoop
 * @classdesc Manages the game loop cycle of draw, discard, and send, repeated per hand, per blind, per ante
 */
export class GameLoop {
	/**
	 * @constructor
	 * @param {Object} config - Configuration for the game loop
	 * @param {number} config.maxDiscardsPerHand - Maximum number of discards allowed per hand
	 * @param {number} config.handsPerBlind - Number of hands per blind
	 * @param {number} config.blindsPerAnte - Number of blinds per ante
	 * @param {number} config.totalAntes - Total number of antes in the game
	 * @param {boolean} config.useConsoleUI - Whether to use console-based UI for testing
	 */
	constructor(config = {}) {
		this.gameHandler = new gameHandler();

		// Configure game state with provided values or use defaults
		this.gameHandler.state.discardCount = config.maxDiscardsPerHand || 4;
		this.gameHandler.state.handsPerBlind = config.handsPerBlind || 4;
		this.gameHandler.state.blindsPerAnte = config.blindsPerAnte || 3;
		this.gameHandler.state.totalAntes = config.totalAntes || 8;

		this.useConsoleUI = config.useConsoleUI || false;
		this.isRunning = false;
	}

	/**
	 * Start the game loop
	 */
	start() {
		this.isRunning = true;
		this.gameHandler.resetGame();
		this.setupInitialState();

		if (this.useConsoleUI) {
			this.consoleUI();
		}

		// Return the gameHandler for external UI integration
		return this.gameHandler;
	}

	/**
	 * Setup the initial game state
	 */
	setupInitialState() {
		this.gameHandler.dealCards();
		this.displayGameStatus();
	}

	/**
	 * Display current game status
	 */
	displayGameStatus() {
		if (this.useConsoleUI) {
			console.log("\n---------- GAME STATUS ----------");
			console.log(
				`Ante: ${this.gameHandler.state.currAnte}/${this.gameHandler.state.totalAntes}`
			);
			console.log(
				`Blind: ${this.gameHandler.state.currBlind}/${this.gameHandler.state.blindsPerAnte}`
			);
			console.log(
				`Hands Played: ${this.gameHandler.state.handsPlayed}/${this.gameHandler.state.totalHands}`
			);
			console.log(
				`Discards Used: ${this.gameHandler.state.discardsUsed}/${this.gameHandler.state.discardCount}`
			);
			console.log(
				`Round Score: ${this.gameHandler.state.roundScore}/${this.gameHandler.state.blindRequirements[
					this.gameHandler.state.currBlind - 1
				]
				}`
			);
			console.log(`Money: ${this.gameHandler.state.money}`);
			console.log("\nCards in hand:");

			this.gameHandler.state.hands.main.cards.forEach((card, index) => {
				console.log(
					`[${index}] ${card.type} of ${card.suit}${card.isSelected ? " (Selected)" : ""
					}`
				);
			});

			console.log("--------------------------------\n");
		}
	}

	/**
	 * Execute a single hand cycle (draw, discard, play)
	 * @param {number[]} cardsToDiscard - Indices of cards to discard
	 * @param {number[]} cardsToPlay - Indices of cards to play
	 * @returns {Object} Status of the hand cycle
	 */
	executeHandCycle(cardsToDiscard = [], cardsToPlay = []) {
		// Step 1: Discard selected cards if within limits
		if (
			cardsToDiscard.length > 0 &&
			this.gameHandler.state.discardsUsed < this.gameHandler.state.discardCount
		) {
			// Select cards to discard
			cardsToDiscard.forEach((index) => {
				this.gameHandler.selectCard(this.gameHandler.state.hands.main, index);
			});

			// Discard selected cards
			this.gameHandler.discardCards();

			// Deal new cards to fill the hand
			this.gameHandler.dealCards();
		}

		// Step 2: Play selected cards
		if (cardsToPlay.length > 0) {
			// Select cards to play
			cardsToPlay.forEach((index) => {
				this.gameHandler.selectCard(this.gameHandler.state.hands.main, index);
			});

			// Play selected cards
			this.gameHandler.playCards();

			// Deal new cards to fill the hand if not end of blind
			if (
				this.gameHandler.state.handsPlayed <
				this.gameHandler.state.totalHands &&
				this.gameHandler.state.roundScore <
				this.gameHandler.state.blindRequirements[
					this.gameHandler.state.currBlind - 1
				]
			) {
				this.gameHandler.dealCards();
			}
		}

		this.displayGameStatus();

		// Return the current game state status
		return {
			isComplete:
				this.gameHandler.state.handsPlayed >=
				this.gameHandler.state.totalHands ||
				this.gameHandler.state.roundScore >=
				this.gameHandler.state.blindRequirements[
					this.gameHandler.state.currBlind - 1
				],
			currAnte: this.gameHandler.state.currAnte,
			currBlind: this.gameHandler.state.currBlind,
			roundScore: this.gameHandler.state.roundScore,
			handsPlayed: this.gameHandler.state.handsPlayed,
			discardsUsed: this.gameHandler.state.discardsUsed,
			handSize: this.gameHandler.state.hands.main.cards.length,
		};
	}

	/**
	 * Execute a blind cycle (multiple hand cycles until blind requirement is met or max hands reached)
	 * @returns {boolean} True if blind was completed successfully, false otherwise
	 */
	executeBlindCycle() {
		let blindComplete = false;

		while (this.isRunning && !blindComplete) {
			// Check if blind is complete
			if (
				this.gameHandler.state.handsPlayed >=
				this.gameHandler.state.totalHands ||
				this.gameHandler.state.roundScore >=
				this.gameHandler.state.blindRequirements[
					this.gameHandler.state.currBlind - 1
				]
			) {
				blindComplete = true;

				// Proceed to next blind if score requirement met
				if (
					this.gameHandler.state.roundScore >=
					this.gameHandler.state.blindRequirements[
						this.gameHandler.state.currBlind - 1
					]
				) {
					return this.gameHandler.nextBlind();
				} else {
					// Game over if score requirement not met
					this.isRunning = false;
					return false;
				}
			}

			// If using console UI, this function will be called interactively
			if (this.useConsoleUI) {
				return false;
			}

			// When not using console UI, this is where the external UI would trigger hand cycles
			// This loop will not run automatically without external input
			break;
		}

		return blindComplete;
	}

	/**
	 * Console-based UI for testing
	 */
	consoleUI() {
		if (!this.useConsoleUI) return;

		// This is a simple console-based UI for testing the game loop
		console.log("Console UI activated for testing");
		console.log("Available commands:");
		console.log(
			"  discard <indices> - Discard cards at specified indices (comma separated)"
		);
		console.log(
			"  play <indices> - Play cards at specified indices (comma separated)"
		);
		console.log("  quit - Exit the game");

		// In a real implementation, this would use process.stdin or similar
		// For this example, we're just defining how it would work
		console.log("\nIn a real implementation, this would accept user input.");
		console.log(
			"For now, this is just a demonstration of how the game loop works."
		);
		console.log("The following example shows a sample hand cycle:");

		// Example of a hand cycle
		console.log("\nExample: discard 0,1");
		const status1 = this.executeHandCycle([0, 1], []);

		console.log("\nExample: play 0,1,2");
		const status2 = this.executeHandCycle([], [0, 1, 2]);

		console.log(
			"\nGame loop demonstration complete. In a real implementation,"
		);
		console.log(
			"this would continue to accept user input until the game ends."
		);
	}
}

/**
 * Create a console-based game loop for testing
 * @returns {GameLoop} A new game loop instance with console UI enabled
 */
export function createConsoleGameLoop(config = {}) {
	return new GameLoop({
		...config,
		useConsoleUI: true,
	});
}

// Example usage:
// const gameLoop = createConsoleGameLoop();
// gameLoop.start();
