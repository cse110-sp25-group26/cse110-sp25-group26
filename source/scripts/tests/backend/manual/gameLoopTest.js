/**
 * @fileoverview Test file for the game loop implementation
 */

import { createConsoleGameLoop } from "../../../backend/gameLoop.js";

/**
 * Simple test function to demonstrate the game loop functionality
 */
function testGameLoop() {
	console.log("Starting game loop test...");

	// Create a console-based game loop with custom configuration
	const gameLoop = createConsoleGameLoop({
		maxDiscardsPerHand: 3,
		handsPerBlind: 3,
		blindsPerAnte: 3,
		totalAntes: 3,
	});

	// Start the game loop
	const gameHandler = gameLoop.start();

	console.log("\n---- Manual Game Loop Test ----");
	console.log(
		"You can simulate multiple hand cycles by calling these functions:"
	);

	// Example of multiple hand cycles
	simulateHandCycles(gameLoop);

	console.log("\nTest complete!");
}

/**
 * Simulate multiple hand cycles
 * @param {GameLoop} gameLoop - The game loop instance
 */
function simulateHandCycles(gameLoop) {
	console.log("\n1. First hand cycle - Discard 2 cards:");
	gameLoop.executeHandCycle([0, 1], []);

	console.log("\n2. Play 3 cards from the refreshed hand:");
	gameLoop.executeHandCycle([], [0, 1, 2]);

	console.log("\n3. Second hand - Discard 1 card and play 2:");
	gameLoop.executeHandCycle([0], [1, 2]);

	console.log("\n4. Check if blind cycle is complete:");
	const blindComplete = gameLoop.executeBlindCycle();
	console.log(`Blind cycle complete: ${blindComplete}`);

	console.log("\nCurrent game state:");
	console.log(`- Ante: ${gameLoop.gameHandler.state.currAnte}`);
	console.log(`- Blind: ${gameLoop.gameHandler.state.currBlind}`);
	console.log(`- Hands played: ${gameLoop.gameHandler.state.handsPlayed}`);
	console.log(`- Round score: ${gameLoop.gameHandler.state.roundScore}`);
}

// Run the test
testGameLoop();
