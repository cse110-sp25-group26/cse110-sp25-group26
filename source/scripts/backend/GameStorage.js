/**
 * @typedef {import('./Card.js').Card} Card
 * @typedef {import('./Deck.js').Deck} Deck
 * @typedef {import('./Hand.js').Hand} Hand
 */
/**
 * @class GameStorage
 * @description Manages game data persistence using LocalStorage.
 * 
 * Data structure:
 * {
 *   saves: Array<Object>,
 *   lifetimeStats: {
 *     gamesStarted: number,
 *     gamesCompleted: number,
 *     highestAnteReached: number,
 *     highestRoundScore: number,
 *     totalHandsPlayed: number,
 *     totalJokersUsed: number,
 *     uniqueJokersFound: number,
 *     firstGameDate: string | null
 *   },
 *   unlockedJokers: string[],
 *   uniqueJokersDiscovered: string[],
 *   lastSaved: string (ISO timestamp),
 *   version: string
 * }
 */
export class GameStorage {
	/**
	 * Initializes the GameStorage system and ensures the storage format is correct.
	 */
	constructor() {
		/** @private */
		this.storageKey = 'gameData';

		/** @private */
		this.currentVersion = '1.0.0';

		/** @private */
		this.defaultStats = {
			gamesStarted: 0,
			gamesCompleted: 0,
			highestAnteReached: 0,
			highestRoundScore: 0,
			totalHandsPlayed: 0,
			totalJokersUsed: 0,
			uniqueJokersFound: 0,
			firstGameDate: null
		};

		this.initializeStorage();
	}

	/**
	 * Checks if localStorage already contains game data.
	 * @returns {boolean} True if storage exists, false otherwise.
	 */
	storageExists() {
		const data = localStorage.getItem(this.storageKey);
		return data !== null;
	}

	/**
	 * Initializes the default game storage if no existing save is found.
	 */
	initializeStorage() {
		if (!this.storageExists()) {
			const defaultData = {
				saves: [],
				lifetimeStats: { ...this.defaultStats },
				unlockedJokers: [],
				uniqueJokersDiscovered: [],
				lastSaved: new Date().toISOString(),
				version: this.currentVersion
			};
			this.writeToStorage(defaultData);
		}
	}

	/**
	 * Reads and parses the game data from localStorage.
	 * @returns {object|null} Parsed data object, or null on error.
	 */
	readFromStorage() {
		const data = localStorage.getItem(this.storageKey);
		try {
			return data ? JSON.parse(data) : null;
		} catch (err) {
			console.error("Failed to parse gameData", err);
			return null;
		}
	}

	/**
	 * Saves the game data to localStorage.
	 * @param {object} data - The full data object to write.
	 */
	writeToStorage(data) {
		try {
			localStorage.setItem(this.storageKey, JSON.stringify(data));
			console.log("Game data saved.");
		} catch (err) {
			console.error("Failed to write gameData", err);
		}
	}

	/**
	 * Adds a new game save to the saves list.
	 * @param {object} saveData - The game save to add.
	 */
	addSave(saveData) {
		const data = this.readFromStorage();
		data.saves.push(saveData);
		data.lastSaved = new Date().toISOString();
		this.writeToStorage(data);
	}

	/**
	 * Replaces an existing save at the specified index.
	 * @param {number} index - Index to replace.
	 * @param {object} saveData - The new save data.
	 * @returns {boolean} True if successful.
	 */
	overwriteSave(index, saveData) {
		const data = this.readFromStorage();
		index = Number(index);
		if (!Number.isInteger(index) || index < 0 || index >= data.saves.length) return false;
		data.saves[index] = saveData;
		data.lastSaved = new Date().toISOString();
		this.writeToStorage(data);
		return true;
	}

	/**
	 * Deletes a save from the specified index.
	 * @param {number} index - Index of the save to remove.
	 * @returns {boolean} True if deletion succeeded.
	 */
	deleteSave(index) {
		const data = this.readFromStorage();
		if (index < 0 || index >= data.saves.length) return false;
		data.saves.splice(index, 1);
		this.writeToStorage(data);
		return true;
	}

	/**
	 * Gets all saved games.
	 * @returns {object[]} Array of saved games.
	 */
	getAllSaves() {
		return this.readFromStorage()?.saves || [];
	}

	/**
	 * Gets lifetime statistics.
	 * @returns {object} The stats object.
	 */
	getStats() {
		return this.readFromStorage()?.lifetimeStats || { ...this.defaultStats };
	}

	/**
	 * Increments a stat by a given amount (default 1).
	 * @param {string} statKey - Name of the stat to update.
	 * @param {number} [delta=1] - Amount to add.
	 */
	updateStat(statKey, delta = 1) {
		const data = this.readFromStorage();

		function inc(obj, key, delta) {
			switch (key) {
				case "gamesStarted": obj.gamesStarted += delta; break;
				case "gamesCompleted": obj.gamesCompleted += delta; break;
				case "highestAnteReached": obj.highestAnteReached += delta; break;
				case "highestRoundScore": obj.highestRoundScore += delta; break;
				case "totalHandsPlayed": obj.totalHandsPlayed += delta; break;
				case "totalJokersUsed": obj.totalJokersUsed += delta; break;
				case "uniqueJokersFound": obj.uniqueJokersFound += delta; break;
				default: return false;
			}
			return true;
		}

		if (inc(data.lifetimeStats, statKey, delta)) {
			// ok
		} else if (statKey === "firstGameDate") {
			data.lifetimeStats.firstGameDate = delta;
		} else {
			throw new Error("Invalid stat key");
		}
		this.writeToStorage(data);
	}
}
