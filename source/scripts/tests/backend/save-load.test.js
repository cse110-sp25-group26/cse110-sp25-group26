/**
 * Test suite for Save/Load functionality
 */

import { GameStorage } from "../../backend/GameStorage.js";
import { gameHandler } from "../../backend/gameHandler.js";
import { WebUI } from "../../frontend/WebUI.js";

/**
 * Mock UI Interface for testing
 */
class MockUI {
	constructor() {
		this.messages = [];
		this.gameHandler = null;
	}

	showMessage(message) {
		this.messages.push(message);
		console.log("UI Message:", message);
	}

	// Stub methods for testing
	newGame() {}
	updateScorekeeper() {}
	allowPlay() {}
	disallowPlay() {}
	createUIel() {}
	removeUIel() {}
	moveMultiple() {}
	displayLoss() {}
	displayWin() {}
	displayMoney() {}
	promptEndlessMode() {
		return false;
	}
	exitGame() {}
	displayGameOver() {}
}

/**
 * Test the GameStorage functionality
 */
function testGameStorage() {
	console.log("=== Testing GameStorage ===");

	const storage = new GameStorage();

	// Test session management
	console.log("Testing session management...");
	const session = storage.startSession();
	console.log("Session started:", session);

	storage.updateSession({ levelsCompleted: 1, sessionScore: 100 });
	const updatedSession = storage.getSession();
	console.log("Session updated:", updatedSession);

	// Test statistics
	console.log("Testing statistics...");
	storage.updateStat("gamesStarted", 1);
	storage.updateStat("totalHandsPlayed", 5);
	const stats = storage.getStats();
	console.log("Stats:", stats);

	// Test save/load current game
	console.log("Testing save/load current game...");
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
	console.log("Save success:", saveSuccess);

	const hasSave = storage.hasCurrentGame();
	console.log("Has saved game:", hasSave);

	if (hasSave) {
		const loadedState = storage.loadCurrentGame();
		console.log("Loaded state ante:", loadedState.currAnte);
		console.log("Loaded state score:", loadedState.roundScore);
	}

	// Clean up
	storage.clearCurrentGame();
	console.log("Save cleared, has save now:", storage.hasCurrentGame());

	console.log("GameStorage tests completed!\n");
}

/**
 * Test the save/load integration with gameHandler
 */
function testGameHandlerSaveLoad() {
	console.log("=== Testing gameHandler Save/Load ===");

	const mockUI = new MockUI();
	const game = new gameHandler(mockUI);

	// Modify game state
	game.state.currAnte = 3;
	game.state.currBlind = 2;
	game.state.roundScore = 250;
	game.state.money = 75;

	console.log("Original game state:");
	console.log("- Ante:", game.state.currAnte);
	console.log("- Blind:", game.state.currBlind);
	console.log("- Score:", game.state.roundScore);
	console.log("- Money:", game.state.money);

	// Test save
	console.log("Saving game...");
	const saveResult = game.saveGame();
	console.log("Save result:", saveResult);
	console.log("UI messages:", mockUI.messages);

	// Reset game and test load
	console.log("Resetting game state...");
	game.resetGame(false); // Don't clear save

	console.log("Game state after reset:");
	console.log("- Ante:", game.state.currAnte);
	console.log("- Score:", game.state.roundScore);

	// Load the saved game
	console.log("Loading saved game...");
	mockUI.messages = []; // Clear messages
	const loadResult = game.loadGame();
	console.log("Load result:", loadResult);
	console.log("UI messages:", mockUI.messages);

	console.log("Game state after load:");
	console.log("- Ante:", game.state.currAnte);
	console.log("- Blind:", game.state.currBlind);
	console.log("- Score:", game.state.roundScore);
	console.log("- Money:", game.state.money);

	// Clean up
	game.gameStorage.clearCurrentGame();

	console.log("gameHandler Save/Load tests completed!\n");
}

/**
 * Test session tracking and game over statistics
 */
function testSessionTracking() {
	console.log("=== Testing Session Tracking ===");

	const storage = new GameStorage();

	// Start a session
	const session = storage.startSession();
	console.log("Session started at:", new Date(session.startTime));

	// Simulate some gameplay time
	setTimeout(() => {
		// Update session progress
		storage.updateSession({
			levelsCompleted: 2,
			sessionScore: 500,
		});

		// End the session
		const endedSession = storage.endSession();
		console.log("Session ended:");
		console.log("- Play time (ms):", endedSession.playTime);
		console.log("- Levels completed:", endedSession.levelsCompleted);
		console.log("- Session score:", endedSession.sessionScore);

		// Check updated stats
		const stats = storage.getStats();
		console.log("Updated lifetime stats:");
		console.log("- Games completed:", stats.gamesCompleted);
		console.log("- Total play time:", stats.totalPlayTime);
		console.log("- Average game length:", stats.averageGameLength);

		console.log("Session tracking tests completed!\n");
	}, 100); // Small delay to simulate gameplay time
}

/**
 * Run all tests
 */
export function runSaveLoadTests() {
	console.log("Starting Save/Load Feature Tests...\n");

	testGameStorage();
	testGameHandlerSaveLoad();
	testSessionTracking();

	console.log("All tests completed!");
}

// Run tests if this file is executed directly
if (typeof window !== "undefined") {
	runSaveLoadTests();
}

