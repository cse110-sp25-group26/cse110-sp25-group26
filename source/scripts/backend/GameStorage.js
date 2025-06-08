/**
 * @typedef {object} GameState (see gameHandler.js)
 * @property {null} placeholder - See gameHandler.js for details.
 */

/**
 * @typedef {object} GameSave
 * @property {Date} lastSaved - The time this save data was last written to.
 * @property {GameState} gameState - The game state necessary to reload the game.
 */

/**
 * @typedef {object} SavesData
 * @property {GameSave[]} saves - List of game saves.
 * @property {Map<string,any>} lifetimeStats - Statistics about the player's lifetime performance.
 * @property {string[]} unlockedJokers - List of jokers that have been unlocked.
 * @property {string} version - Version of the game data format.
 */

/**
 * @classdesc Manages game data persistence using LocalStorage.
 */
export class GameStorage {
	/**
	 * @class GameStorage
	 * @description Initializes the GameStorage system and ensures the storage format is correct.
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
	 * @description Initializes the default game storage if no existing save is found.
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
	 * @function readFromStorage
	 * @description Reads and parses the game data from localStorage.
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
	 * @function writeToStorage
	 * @description Saves the game data to localStorage.
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
	 * @function addSave
	 * @description Adds a new game save to the saves list.
	 * @param {GameState} saveData - The game save to add.
	 */
	addSave(saveData) {
		const data = this.readFromStorage();

		let gameSave = {
			lastSaved: new Date(),
			gameState: saveData,
		};

		data.saves.push(gameSave);
		this.writeToStorage(data);
	}

	/**
	 * @function overwriteSave
	 * @description Replaces an existing save at the specified index.
	 * @param {number} index - Index to replace.
	 * @param {GameState} saveData - The new save data.
	 * @returns {boolean} True if successful.
	 */
	overwriteSave(index, saveData) {
		const data = this.readFromStorage();
		index = Number(index);

		let gameSave = {
			lastSaved: new Date(),
			gameState: saveData,
		};

		if (!Number.isInteger(index) || index < 0 || index >= data.saves.length) return false;
		data.saves[parseInt(index, 10)] = gameSave;
		this.writeToStorage(data);
		return true;
	}

	/**
	 * @function deleteSave
	 * @description Deletes a save from the specified index.
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
	 * @function getAllSaves
	 * @description Gets all saved games.
	 * @returns {GameSave[]} Array of saved games.
	 */
	getAllSaves() {
		return this.readFromStorage()?.saves || [];
	}

	/**
	 * @function getSave
	 * @description Gets a specific save by index.
	 * @param {number} index - The index of the save to fetch.
	 * @returns {GameSave|null} The saved game for this index, or null if none.
	 */
	getSave(index) {
		const data = this.readFromStorage();
		if (!data) return null;

		index = Number(index);
		if (!Number.isInteger(index) || index < 0 || index >= data.saves?.length) return null;

		return data.saves[index] || null;
	}

	/**
	 * @function getStats
	 * @description Gets lifetime statistics.
	 * @returns {Map<string,any>} The stats object.
	 */
	getStats() {
		return this.readFromStorage()?.lifetimeStats || { ...this.defaultStats };
	}


	/**
	 * @function updateStat
	 * @description Increments a stat by a given amount (default 1).
	 * @param {string} statKey - Name of the stat to update.
	 * @param {number} [delta=1] - Amount to add.
	 */
	updateStat(statKey, delta = 1) {
		const data = this.readFromStorage();
		if (!(statKey in data.lifetimeStats)) data.lifetimeStats[String(statKey)] = 0;

		data.lifetimeStats[String(statKey)] += delta;

		this.writeToStorage(data);
	}
}

