/**
 * @typedef {module:scripts/backend/Card.Card} Card
 * @typedef {module:scripts/backend/Deck.Deck} Deck
 * @typedef {module:scripts/backend/Hand.Hand} Hand
 * @typedef {module:scripts/backend/gameHandler.GameState} GameState
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
 * @typedef {object} SessionData
 * @property {number} startTime - Game session start timestamp
 * @property {number} levelsCompleted - Number of levels completed in this session
 * @property {number} sessionScore - Total score for this session
 * @property {boolean} gameInProgress - Whether a game is currently in progress
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
		this.storageKey = "gameData";

		/** @private */
		this.currentGameKey = "currentGame";

		/** @private */
		this.sessionKey = "currentSession";

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
			totalPlayTime: 0, // in milliseconds
			averageGameLength: 0, // in milliseconds
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

		if (!Number.isInteger(index) || index < 0 || index >= data.saves.length)
			return false;
		data.saves[parseInt(index, 10)] = gameSave;
		this.writeToStorage(data);
		return true;
	}

	/**
	 * @function deleteSave
	 * @description Deletes a save from the specified index.z
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
		if (
			!Number.isInteger(index) ||
			index < 0 ||
			index >= data.saves?.length
		)
			return null;

		return data.saves[index] || null;
	}

	/**
	 * @function getStats
	 * @description Gets lifetime statistics.
	 * @returns {Map<string,any>} The stats object.
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

	// === NEW SAVE GAME FUNCTIONALITY ===

	/**
	 * @function saveCurrentGame
	 * @description Saves the current game state to a special current game slot.
	 * @param {GameState} gameState - The current game state to save.
	 * @returns {boolean} True if save was successful.
	 */
	saveCurrentGame(gameState) {
		try {
			const saveData = {
				lastSaved: new Date().toISOString(),
				gameState: this.serializeGameState(gameState),
				version: this.currentVersion,
			};
			localStorage.setItem(this.currentGameKey, JSON.stringify(saveData));
			console.log("Current game saved successfully.");
			return true;
		} catch (err) {
			console.error("Failed to save current game:", err);
			return false;
		}
	}

	/**
	 * @function loadCurrentGame
	 * @description Loads the current game state from the special current game slot.
	 * @returns {GameState|null} The loaded game state, or null if none exists.
	 */
	loadCurrentGame() {
		try {
			const data = localStorage.getItem(this.currentGameKey);
			if (!data) return null;

			const saveData = JSON.parse(data);
			return this.deserializeGameState(saveData.gameState);
		} catch (err) {
			console.error("Failed to load current game:", err);
			return null;
		}
	}

	/**
	 * @function hasCurrentGame
	 * @description Checks if there's a current game save available.
	 * @returns {boolean} True if a current game save exists.
	 */
	hasCurrentGame() {
		try {
			const data = localStorage.getItem(this.currentGameKey);
			return data !== null;
		} catch {
			return false;
		}
	}

	/**
	 * @function clearCurrentGame
	 * @description Removes the current game save (called when starting a new game).
	 */
	clearCurrentGame() {
		try {
			localStorage.removeItem(this.currentGameKey);
			console.log("Current game save cleared.");
		} catch (err) {
			console.error("Failed to clear current game:", err);
		}
	}

	/**
	 * @function startSession
	 * @description Starts a new game session for tracking statistics.
	 * @returns {SessionData} The new session data.
	 */
	startSession() {
		const sessionData = {
			startTime: Date.now(),
			levelsCompleted: 0,
			sessionScore: 0,
			gameInProgress: true,
		};

		try {
			localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
			console.log("Game session started.");
		} catch (err) {
			console.error("Failed to start session:", err);
		}

		return sessionData;
	}

	/**
	 * @function updateSession
	 * @description Updates the current session data.
	 * @param {Partial<SessionData>} updates - The session data to update.
	 */
	updateSession(updates) {
		try {
			const data = localStorage.getItem(this.sessionKey);
			const sessionData = data ? JSON.parse(data) : this.startSession();

			Object.assign(sessionData, updates);
			localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
		} catch (err) {
			console.error("Failed to update session:", err);
		}
	}

	/**
	 * @function getSession
	 * @description Gets the current session data.
	 * @returns {SessionData|null} The current session data, or null if none exists.
	 */
	getSession() {
		try {
			const data = localStorage.getItem(this.sessionKey);
			return data ? JSON.parse(data) : null;
		} catch (err) {
			console.error("Failed to get session:", err);
			return null;
		}
	}

	/**
	 * @function endSession
	 * @description Ends the current session and updates lifetime statistics.
	 * @returns {SessionData|null} The final session data with calculated play time.
	 */
	endSession() {
		try {
			const sessionData = this.getSession();
			if (!sessionData) return null;

			const playTime = Date.now() - sessionData.startTime;

			// Update lifetime statistics
			this.updateStat("totalPlayTime", playTime);
			this.updateStat("gamesCompleted", 1);

			// Calculate and update average game length
			const stats = this.getStats();
			const newAverage = stats.totalPlayTime / stats.gamesCompleted;
			const data = this.readFromStorage();
			data.lifetimeStats.averageGameLength = newAverage;
			this.writeToStorage(data);

			// Clear session data
			localStorage.removeItem(this.sessionKey);

			return {
				...sessionData,
				playTime,
				gameInProgress: false,
			};
		} catch (err) {
			console.error("Failed to end session:", err);
			return null;
		}
	}

	/**
	 * @function serializeGameState
	 * @description Converts a game state object to a JSON-serializable format.
	 * @param {GameState} gameState - The game state to serialize.
	 * @returns {object} The serialized game state.
	 */
	serializeGameState(gameState) {
		// Create a deep copy and convert non-serializable objects
		const serialized = JSON.parse(
			JSON.stringify(gameState, (key, value) => {
				// Handle specific objects that need special serialization
				if (key === "hands") {
					// Serialize hands with their cards
					const serializedHands = {};
					for (const [handName, hand] of Object.entries(value)) {
						serializedHands[handName] = {
							cards: hand.cards.map((card) => ({
								suit: card.suit,
								type: card.type,
								isSelected: card.isSelected || false,
							})),
						};
					}
					return serializedHands;
				}

				if (key === "deck") {
					// Serialize deck with available and used cards
					return {
						availableCards: value.availableCards.map((card) => ({
							suit: card.suit,
							type: card.type,
						})),
						usedCards: value.usedCards.map((card) => ({
							suit: card.suit,
							type: card.type,
						})),
					};
				}

				return value;
			})
		);

		return serialized;
	}

	/**
	 * @function deserializeGameState
	 * @description Converts a serialized game state back to the proper object format.
	 * @param {object} serializedState - The serialized game state.
	 * @returns {GameState} The deserialized game state.
	 */
	deserializeGameState(serializedState) {
		// This will be handled by the gameHandler when loading
		// Return the serialized state as-is, and let gameHandler reconstruct objects
		return serializedState;
	}
}

