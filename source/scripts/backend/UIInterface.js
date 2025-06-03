import { Card } from "./Card.js";
import { gameHandler } from "./gameHandler.js";

// This is an abstract class, it's one case where we actually don't mind
// unused function parameters.
/* eslint-disable no-unused-vars */

/**
 * @classdesc The only object from the backend which the UI should interact with.
 *            This provides a simple interface for the UI to implement to allow
 *            for easy integration with the game loop. These functions should
 * 			  be overridden by the child class to provide the required functinality.
 * 
 * @property {gameHandler} gameHandler - The game handler object which the UI should
 * 									     interact with to get the game state. Initialized
 * 									     when this is passed to the gameHandler.
 */
export class UIInterface {
	/**
	 * @class UIInterface
	 * @description Constructs a new UIInterface, but does not allow direct construction
	 *              without an extender.
	 */
	constructor() {
		if (new.target == UIInterface) {
			if (!new.target) {
				throw new Error("UIInterface must be created with 'new'!");
			}
			throw new Error("Cannot instantiate UIInterface - make an extending class");
		}
	}

	/**
	 * @function createUIel
	 * @description Creates UIel object representing a given backend card.
	 * @param {Card} card - The Card object to create the UIel for
	 */
	createUIel(card) {
		throw new Error("createUIel must be overridden in extending class!");
	}

	/**
	 * @function moveMultiple
	 * @description Moves cards from one location on-screen to another.
	 * @param {Card[]} cards - The cards to move. Likely uses UIel to determine the
	 * 						   respective UI elements to work with.
	 * @param {string} origin - The origin location to move each card from.
	 *                          ex: "hand_main", "deck", "shop_cards", "offscreen" etc.
	 * @param {string} dest - The destination location to move each card to.
	 * 							 ex: "hand_played", "offscreen", "deck", etc.
	 * @param {number} delay - The offset between each card dispatch.
	 */
	moveMultiple(cards, origin, dest, delay) {
		throw new Error("moveMultiple must be overridden in extending class!");
	}

	/**
	 * @function removeUIel
	 * @description Removes UIel object for a given backend card, deconstructing
	 *              it and freeing its resources.
	 * @param {Card} card - The Card object to deconstruct the UIel for
	 */
	removeUIel(card) {
		throw new Error("removeUIel must be overridden in extending class!");
	}

	/**
	 * @function displayLoss
	 * @description Display a loss message when the player loses the game.
	 *              The game should exit after the loss has been displayed, at which
	 *              point the UI should allow for either return to menu or new game.
	 * @param {string} message - A message to display along with the game statistics.
	 *                           The UI handler can read gameHandler for the statistics itself.
	 */
	displayLoss(message) {
		throw new Error("displayLoss must be overridden in extending class!");
	}

	/**
	 * @function exitGame
	 * @description Exit the game to the main menu.
	 */
	exitGame() {
		throw new Error("exitGame must be overridden in extending class!");
	}

	/**
	 * @function newGame
	 * @description Initialize the UI to a clean slate for a brand new game.
	 */
	newGame() {
		throw new Error("newGame must be overridden in extending class!");
	}

	/**
	 * @function scoreCard
	 * @description Plays the scoring animation and displays text messages for a card.
	 *              If no messages given, should just play the animation.
	 * @param {Card} card - The card to animate and display text for.
	 * @param {string[]} messages - The messages to use, ex. "+10 Chips"
	 * @param {string[]} colors - 6-digit hexadecimal color codes to use for the messages.
	 */
	scoreCard(card, messages, colors) {
		throw new Error("scoreCard must be overridden in extending class!");
	}


	/**
	 * @typedef {Object} ScorekeeperData
	 * @property {string} name - The name of the scorekeeper entry.
	 * @property {number} value - The value of the scorekeeper entry.
	 */

	/**
	 * @function updateScorekeeper
	 * @description Tells the UI that the scorekeeper changed and it should update.
	 * 
	 * @param {ScorekeeperData[]} data - An array of objects containing the name and value
	 * 									of the scorekeeper entries to update.
	 */
	updateScorekeeper(data) {
		throw new Error("updateScorekeeper must be overridden in extending class!");
	}

	/**
	 * @function displayBust
	 * @description Notifies the player that the hand was bust.
	 */
	displayBust() {
		throw new Error("displayBust must be overridden in extending class!");
	}

	/**
	 * @function displayMoney
	 * @description Displays the money won by the player, both base value and some
	 * 				bonuses if any won.
	 * @param {number} base - The base amount won by the current blind.
	 * @param {[string, number][]} extras - An array of pairs of 'reason, value'
	 * 										representing any extra money won and
	 * 										the reasons why.
	 */
	displayMoney(base, extras) {
		throw new Error("displayMoney must be overridden in extending class!");
	}

	/**
	 * @function displayWin
	 * @description Display a win message when the player wins the game.
	 *              The UI should allow for either return to menu or new game,
	 *              or prompt for endless mode.
	 */
	displayWin() {
		throw new Error("displayWin must be overridden in extending class!");
	}

	/**
	 * @function promptEndlessMode
	 * @description Prompts the player if they want to enter endless mode after winning.
	 * @returns {boolean} - True if the player wants to enter endless mode, false otherwise.
	 */
	promptEndlessMode() {
		throw new Error("promptEndlessMode must be overridden in extending class!");
	}

	/**
	 * @function disallowPlay
	 * @description Disallow the user from pressing buttons that interact with
	 *              the gameplay, backend is still processing.
	 */
	disallowPlay() {
		throw new Error("disallowPlay must be overridden in extending class!");
	}

	/**
	 * @function allowPlay
	 * @description Allow the user to press buttons again now that the backend
	 *              has finished processing.
	 */
	allowPlay() {
		throw new Error("allowPlay must be overridden in extending class!");
	}
};