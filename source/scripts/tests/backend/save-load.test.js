/**
 * Test suite for Save/Load functionality
 */

import { GameStorage } from "../../backend/GameStorage.js";
import { gameHandler } from "../../backend/gameHandler.js";

/**
 * Mock UI Interface for testing
 */
class MockUI {
	/**
	 * @class
	 * @description Creates a mock UI interface for testing
	 */
	constructor() {
		this.messages = [];
		this.gameHandler = null;
	}

	/**
	 * @function showMessage
	 * @description Displays a message to the user
	 * @param {string} message - The message to display
	 */
	showMessage(message) {
		this.messages.push(message);
		console.log("UI Message:", message);
	}

	/**
	 * @function newGame
	 * @description Mock method for starting a new game
	 */
	newGame() {}

	/**
	 * @function updateScorekeeper
	 * @description Mock method for updating scorekeeper display
	 */
	updateScorekeeper() {}

	/**
	 * @function allowPlay
	 * @description Mock method for allowing player actions
	 */
	allowPlay() {}

	/**
	 * @function disallowPlay
	 * @description Mock method for disallowing player actions
	 */
	disallowPlay() {}

	/**
	 * @function createUIel
	 * @description Mock method for creating UI elements
	 */
	createUIel() {}

	/**
	 * @function removeUIel
	 * @description Mock method for removing UI elements
	 */
	removeUIel() {}

	/**
	 * @function moveMultiple
	 * @description Mock method for moving multiple cards
	 */
	moveMultiple() {}

	/**
	 * @function displayLoss
	 * @description Mock method for displaying game loss
	 */
	displayLoss() {}

	/**
	 * @function displayWin
	 * @description Mock method for displaying game win
	 */
	displayWin() {}

	/**
	 * @function displayMoney
	 * @description Mock method for displaying money earned
	 */
	displayMoney() {}

	/**
	 * @function promptEndlessMode
	 * @description Mock method for prompting endless mode
	 * @returns {boolean} False for testing
	 */
	promptEndlessMode() {
		return false;
	}

	/**
	 * @function exitGame
	 * @description Mock method for exiting the game
	 */
	exitGame() {}

	/**
	 * @function displayGameOver
	 * @description Mock method for displaying game over screen
	 */
	displayGameOver() {}
}

import { beforeEach, afterEach, expect, test, describe } from "@jest/globals";

describe("Save/Load Feature Tests", () => {
	let storage;
	let mockUI;
	let game;

	beforeEach(() => {
		storage = new GameStorage();
		mockUI = new MockUI();
		// Clear any existing saves before each test
		if (storage.hasCurrentGame()) {
			storage.clearCurrentGame();
		}
	});

	afterEach(() => {
		// Clean up after each test
		if (storage?.hasCurrentGame()) {
			storage.clearCurrentGame();
		}
	});

	describe("GameStorage", () => {
		test("session management works correctly", () => {
			const session = storage.startSession();
			expect(session).toBeDefined();
			expect(session.startTime).toBeDefined();
			expect(session.gameInProgress).toBe(true);

			storage.updateSession({ levelsCompleted: 1, sessionScore: 100 });
			const updatedSession = storage.getSession();
			expect(updatedSession.levelsCompleted).toBe(1);
			expect(updatedSession.sessionScore).toBe(100);
		});

		test("statistics tracking works correctly", () => {
			storage.updateStat("gamesStarted", 1);
			storage.updateStat("totalHandsPlayed", 5);
			const stats = storage.getStats();
			expect(stats.gamesStarted).toBe(1);
			expect(stats.totalHandsPlayed).toBe(5);
		});

		test("save/load current game works correctly", () => {
			const mockGameState = {
				currAnte: 2,
				currBlind: 1,
				roundScore: 150,
				money: 50,
				hands: {
					main: { cards: [] },
					played: { cards: [] },
					joker: { cards: [] },
					consumable: { cards: [] },
				},
				deck: {
					availableCards: [],
					usedCards: [],
				},
			};

			const saveSuccess = storage.saveCurrentGame(mockGameState);
			expect(saveSuccess).toBe(true);

			const hasSave = storage.hasCurrentGame();
			expect(hasSave).toBe(true);

			const loadedState = storage.loadCurrentGame();
			expect(loadedState.currAnte).toBe(2);
			expect(loadedState.roundScore).toBe(150);
			expect(loadedState.money).toBe(50);

			storage.clearCurrentGame();
			expect(storage.hasCurrentGame()).toBe(false);
		});
	});

	describe("gameHandler Save/Load Integration", () => {
		beforeEach(() => {
			game = new gameHandler(mockUI);
		});

		test("save and load game state correctly", () => {
			// Modify game state
			game.state.currAnte = 3;
			game.state.currBlind = 2;
			game.state.roundScore = 250;
			game.state.money = 75;

			// Test save
			const saveResult = game.saveGame();
			expect(saveResult).toBe(true);
			expect(mockUI.messages).toContain("Game saved successfully!");

			// Reset game and test load
			mockUI.messages = [];
			game.resetGame(false); // Don't clear save
			expect(game.state.currAnte).toBe(1); // Should be reset
			expect(game.state.roundScore).toBe(0); // Should be reset

			// Load the saved game
			const loadResult = game.loadGame();
			expect(loadResult).toBe(true);
			expect(mockUI.messages).toContain("Game loaded successfully!");

			// Verify state was restored
			expect(game.state.currAnte).toBe(3);
			expect(game.state.currBlind).toBe(2);
			expect(game.state.roundScore).toBe(250);
			expect(game.state.money).toBe(75);
		});
	});

	describe("Session Tracking", () => {
		test("session tracking records play time correctly", (done) => {
			const session = storage.startSession();
			expect(session.startTime).toBeDefined();

			// Simulate some gameplay time
			setTimeout(() => {
				storage.updateSession({
					levelsCompleted: 2,
					sessionScore: 500,
				});

				const endedSession = storage.endSession();
				expect(endedSession.playTime).toBeGreaterThan(0);
				expect(endedSession.levelsCompleted).toBe(2);
				expect(endedSession.sessionScore).toBe(500);

				const stats = storage.getStats();
				expect(stats.gamesCompleted).toBe(1);
				expect(stats.totalPlayTime).toBeGreaterThan(0);

				done();
			}, 100);
		});
	});
});

