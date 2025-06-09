/**
 * @typedef {module:scripts/backend/Card.Card} Card
 * @typedef {module:scripts/backend/Deck.Deck} Deck
 * @typedef {module:scripts/backend/Hand.Hand} Hand
 * @typedef {module:scripts/backend/gameHandler.GameState} GameState
 */

/**
 * @typedef {object} StatsData
 * @property {object} lifetimeStats - Statistics about the player's lifetime performance.
 * @property {string} version - Version of the game data format.
 */

/**
 * @classdesc Manages game statistics persistence using LocalStorage.
 */
export class GameStorage {
	/**
	 * @class GameStorage
	 * @description Initializes the GameStorage system and ensures the storage format is correct.
	 */
	constructor() {
		/** @private */
		this.storageKey = "gameStats";

		/** @private */
		this.currentVersion = "1.0.0";

		/** @private */
		this.defaultStats = {
			gamesStarted: 0,
			gamesCompleted: 0,
			highestAnteReached: 0,
			highestRoundScore: 0,
			totalHandsPlayed: 0,
			totalJokersUsed: 0,
			uniqueJokersFound: 0,
			firstGameDate: null,
		};

		this.initializeStorage();
	}

	/**
	 * @function storageExists
	 * @description Checks if localStorage already contains game data.
	 * @returns {boolean} True if storage exists, false otherwise.
	 */
	storageExists() {
		const data = localStorage.getItem(this.storageKey);
		return data !== null;
	}

	/**
	 * @function initializeStorage
	 * @description Initializes the default game storage if no existing data is found.
	 */
	initializeStorage() {
		if (!this.storageExists()) {
			const defaultData = {
				lifetimeStats: { ...this.defaultStats },
				lastSaved: new Date().toISOString(),
				version: this.currentVersion,
			};
			this.writeToStorage(defaultData);
		}
	}

	/**
	 * @function readFromStorage
	 * @description Reads and parses the game data from localStorage.
	 * @returns {object|null} Parsed data object, or null on error.
	 */
	readFromStorage() {
		const data = localStorage.getItem(this.storageKey);
		try {
			return data ? JSON.parse(data) : null;
		} catch (err) {
			console.error("Failed to parse gameStats", err);
			return null;
		}
	}

	/**
	 * @function writeToStorage
	 * @description Saves the game data to localStorage.
	 * @param {object} data - The full data object to write.
	 */
	writeToStorage(data) {
		try {
			localStorage.setItem(this.storageKey, JSON.stringify(data));
			console.log("Game stats saved.");
		} catch (err) {
			console.error("Failed to write gameStats", err);
		}
	}

	/**
	 * @function getStats
	 * @description Gets lifetime statistics.
	 * @returns {object} The stats object.
	 */
	getStats() {
		return (
			this.readFromStorage()?.lifetimeStats || { ...this.defaultStats }
		);
	}

	/**
	 * @function updateStat
	 * @description Increments a stat by a given amount (default 1).
	 * @param {string} statKey - Name of the stat to update.
	 * @param {number} [delta=1] - Amount to add.
	 */
	updateStat(statKey, delta = 1) {
		const data = this.readFromStorage();
		if (!(statKey in data.lifetimeStats))
			data.lifetimeStats[String(statKey)] = 0;

		data.lifetimeStats[String(statKey)] += delta;

		this.writeToStorage(data);
	}

	/**
	 * @function setStat
	 * @description Sets a stat to a specific value if it's higher than the current value.
	 * @param {string} statKey - Name of the stat to update.
	 * @param {number} value - Value to set (only if higher than current).
	 */
	setStat(statKey, value) {
		const data = this.readFromStorage();
		if (!(statKey in data.lifetimeStats))
			data.lifetimeStats[String(statKey)] = 0;

		if (value > data.lifetimeStats[String(statKey)]) {
			data.lifetimeStats[String(statKey)] = value;
			this.writeToStorage(data);
		}
	}
}

