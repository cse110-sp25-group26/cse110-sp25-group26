
/**
 * @classdesc Manages game data persistence using LocalStorage.
 * 
 * Data Format Structure:
 * {
 *   "gameData": {
 *     "currentSave": {
 *       "playerHand": Card[],
 *       "dealerHand": Card[],
 *       "deck": Deck state,
 *       "playerMoney": number,
 *       "playerPoints": number,
 *       "gamePhase": string,
 *       "gameState": full gameHandler state
 *     } | null,
 *     "playerStats": {
 *       "currentMoney": number,
 *       "currentPoints": number,
 *       "currentAnte": number,
 *       "currentBlind": number
 *     },
 *     "unlockedJokers": string[],
 *     "lastSaved": string (ISO date),
 *     "version": string
 *   }
 * }
 */


export class GameStorage {

	constructor() {
		this.defaultStats = {
        gamesStarted: 0,              // Total games ever started
        gamesCompleted: 0,            // Total games completed (reached ante 8)
        
        highestAnteReached: 0,        // Furthest ante ever reached (1-8)
        highestRoundScore: 0,         // Best roundScore ever achieved
        
        totalHandsPlayed: 0,          // Total hands played across all games
        
        totalJokersUsed: 0,           // Total joker cards activated
        uniqueJokersFound: 0,         // Different types of jokers discovered
        
        firstGameDate: null,          // When they first played
    };
		this.initializeStorage();
	}
}





