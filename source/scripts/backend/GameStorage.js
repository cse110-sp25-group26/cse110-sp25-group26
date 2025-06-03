
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
		this.storageKey = 'gameData';
		this.currentVersion = '1.0.0';
		this.defaultPlayerStats = {
			currentMoney: 24,        // I don't know how much money we starting with
			currentPoints: 0,        // Current score/points
			currentAnte: 1,          // Current ante level
			currentBlind: 1,         // Current blind level
			handsRemaining: 4,       // Hands left this blind
			gamesPlayed: 0,         
			gamesCompleted: 0        // Games finished successfully
		};
		this.initializeStorage();
	}
}





