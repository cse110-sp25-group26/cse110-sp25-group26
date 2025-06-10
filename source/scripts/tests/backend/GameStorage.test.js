/**
 * @description Unit tests for the GameStorage class.
 */

import { GameStorage } from "../../backend/GameStorage.js";

// Mock localStorage
const localStorageMock = (() => {
	let store = {};
	return {
		getItem(key) {
			return store[key] || null;
		},
		setItem(key, value) {
			store[key] = value.toString();
		},
		removeItem(key) {
			delete store[key];
		},
		clear() {
			store = {};
		},
	};
})();

// Mock all localStorage for the browser
global.localStorage = localStorageMock;

describe("GameStorage", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	test("constructor initializes storage if missing", () => {
		expect(localStorage.getItem("gameStats")).toBeNull();
		const storage = new GameStorage();
		expect(localStorage.getItem("gameStats")).not.toBeNull();
		expect(storage).toBeDefined();
	});

	test("readFromStorage returns parsed object", () => {
		const storage = new GameStorage();
		const data = storage.readFromStorage();
		expect(data).toHaveProperty("lifetimeStats");
		expect(data).toHaveProperty("version");
	});

	test("writeToStorage correctly writes data", () => {
		const storage = new GameStorage();
		const mock = { test: true };
		storage.writeToStorage(mock);
		expect(JSON.parse(localStorage.getItem("gameStats"))).toEqual(mock);
	});

	test("getStats returns correct lifetime stats", () => {
		const storage = new GameStorage();
		const stats = storage.getStats();

		expect(stats).toHaveProperty("gamesStarted");
		expect(stats).toHaveProperty("gamesCompleted");
		expect(stats).toHaveProperty("highestAnteReached");
		expect(stats).toHaveProperty("highestRoundScore");
		expect(stats).toHaveProperty("totalHandsPlayed");
		expect(stats).toHaveProperty("totalJokersUsed");

		// Check default values
		expect(stats.gamesStarted).toBe(0);
		expect(stats.gamesCompleted).toBe(0);
		expect(stats.highestAnteReached).toBe(0);
		expect(stats.highestRoundScore).toBe(0);
		expect(stats.totalHandsPlayed).toBe(0);
		expect(stats.totalJokersUsed).toBe(0);
	});

	test("updateStat increases stat value correctly", () => {
		const storage = new GameStorage();

		storage.updateStat("gamesStarted", 1);
		const stats = storage.getStats();
		expect(stats.gamesStarted).toBe(1);

		storage.updateStat("gamesStarted", 2);
		const updatedStats = storage.getStats();
		expect(updatedStats.gamesStarted).toBe(3);
	});

	test("updateStat initializes undefined stat keys", () => {
		const storage = new GameStorage();

		storage.updateStat("newStat", 5);
		const stats = storage.getStats();
		expect(stats.newStat).toBe(5);
	});

	test("setStat updates stat only if higher", () => {
		const storage = new GameStorage();

		// Set initial value
		storage.setStat("highestAnteReached", 5);
		let stats = storage.getStats();
		expect(stats.highestAnteReached).toBe(5);

		// Try to set lower value - should not change
		storage.setStat("highestAnteReached", 3);
		stats = storage.getStats();
		expect(stats.highestAnteReached).toBe(5);

		// Set higher value - should change
		storage.setStat("highestAnteReached", 7);
		stats = storage.getStats();
		expect(stats.highestAnteReached).toBe(7);
	});

	test("setStat initializes undefined stat keys", () => {
		const storage = new GameStorage();

		storage.setStat("newMaxStat", 10);
		const stats = storage.getStats();
		expect(stats.newMaxStat).toBe(10);
	});
});

