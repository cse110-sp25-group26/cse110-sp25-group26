import { Card } from './Card.js';
import { Deck } from './Deck.js';
import { Hand } from './Hand.js';

/**
 * @classdesc Manages game data persistence using LocalStorage.
 * 
 * structtures
 {
  "saves": [],
  "lifetimeStats": {
    "gamesStarted": 0,
    "gamesCompleted": 0,
    "highestAnteReached": 0,
    "highestRoundScore": 0,
    "totalHandsPlayed": 0,
    "totalJokersUsed": 0,
    "uniqueJokersFound": 0,
    "firstGameDate": null
  },
  "unlockedJokers": [],
  "uniqueJokersDiscovered": [],
  "lastSaved": "2025-06-02T22:30:00.000Z",
  "version": "1.0.0"
}
 */
export class GameStorage {
	/**
	 * @class GameStorage
	 * @description Initializes the storage system and ensures data structure exists.
	 */
	constructor() {
		this.storageKey = 'gameData';
		this.currentVersion = '1.0.0';
		this.defaultStats = {
			gamesStarted: 0,              // Total games ever started
			gamesCompleted: 0,            // Total games completed (reached ante 8)
			highestAnteReached: 0,        // Furthest ante ever reached (1-8)
			highestRoundScore: 0,         // Best roundScore ever achieved
			totalHandsPlayed: 0,          // Total hands played across all games
			totalJokersUsed: 0,           // Total joker cards activated
			uniqueJokersFound: 0,         // Different types of jokers discovered
			firstGameDate: null           // When they first played
		};
		this.initializeStorage();
	}

	/**
	 * @function initializeStorage
	 * @description Creates default storage structure if it doesn't exist.
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


	
}