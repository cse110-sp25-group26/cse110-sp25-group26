import { UIInterface } from "../backend/UIInterface.js";
import { Card } from "../backend/Card.js";

/**
 * @classdesc A class representing a Card in the ConsoleUI.
 * 
 * @property {Card} card - The associated Card with this ConsoleUI Card.
 * @property {string} display - The display name for this Card.
 */
class ConsoleCardElement {
	/**
	 * @class ConsoleCardElement
	 * @description Constructs a ConsoleUI card for the Card passed.
	 * @param {Card} card - The card to construct the element on.
	 */
	constructor(card) {
		this.card = card;
		this.display = card.type + " of " + card.suit;
	}
}

/**
 * @classdesc A class representing a card container.
 * @property {Card[]} contents - The cards in this container
 */
class ConsoleCardContainerElement {
	/**
	 * @class ConsoleCardContainerElement
	 * @description Constructs a ConsoleUI card container.
	 */
	constructor() {
		this.contents = [];
	}

	/**
	 * @function addCard
	 * @description Adds a card to the container.
	 * @param {ConsoleCardElement} card - The card to add to the container.
	 */
	addCard(card) {
		this.contents.push(card);
	}

	/**
	 * @function removeCard
	 * @description Removes a card from the container.
	 * @param {ConsoleCardElement} card - The card to remove from the container.
	 */
	removeCard(card) {
		const index = this.contents.indexOf(card);
		if (index > -1) {
			this.contents.splice(index, 1);
		} else {
			console.warn("Card not found in container:", card);
		}
	}
}

/**
 * @classdesc A class representing a Hand in the ConsoleUI.
 * 
 * @property {Card[]} contents - The cards in this Hand
 */
class ConsoleHandElement extends ConsoleCardContainerElement {
	/**
	 * @class ConsoleHandElement
	 * @description Constructs a ConsoleUI hand.
	 */
	constructor() {
		super();
	}
}

/**
 * @classdesc A class representing the Deck in the ConsoleUI.
 * 
 * @property {Card[]} contents - The cards currently on the Deck
 */
class ConsoleDeckElement extends ConsoleCardContainerElement {
	/**
	 * @class ConsoleDeckElement
	 * @description Constructs a ConsoleUI deck.
	 */
	constructor() {
		super();
	}
}

/**
 * @classdesc A class representing the scorekeeper in the ConsoleUI.
 * 
 * @property {string} blindName - The name of the current blind.
 * @property {string} blindDescription - The description of the current blind.
 * @property {minScore} minScore - The minimum score required for the current blind.
 * @property {baseReward} baseReward - The base reward for the current blind.
 * @property {number} roundScore - The round score for the current blind.
 * @property {number} handScore - The score for the current hand.
 * @property {number} handMult - The multiplier for the current hand.
 * @property {number} handsRemaining - The number of hands remaining in the current blind.
 * @property {number} discardsRemaining - The number of discards remaining in the current blind.
 * @property {number} ante - The current Ante.
 * @property {number} round - The current round within the blind.
 * @property {number} money - The current money the player has.
 */
class ConsoleScorekeeperElement {
	/**
	 * @class ConsoleScorekeeperElement
	 * @description Constructs a ConsoleUI scorekeeper.
	 */
	constructor() {
		this.blindName = "No Blind (Game not started)";
		this.blindDescription = "No description available.";
		this.minScore = 0;
		this.baseReward = 0;
		this.roundScore = 0;
		this.handScore = 0;
		this.handMult = 1;
		this.handsRemaining = 0;
		this.discardsRemaining = 0;
		this.ante = 0;
		this.round = 0;
		this.money = 0;
	}

	/**
	 * @function update
	 * @description Updates the scorekeeper with some display information.
	 * @param {string} key - The property to update.
	 * @param {any} value - The value to set the property to.
	 */
	update(key, value) {
		switch (key) {
		default:
			if (Object.prototype.hasOwnProperty.call(this, key)) {
				this[key] = value;
			}
			else {
				console.warn(`Scorekeeper property "${key}" does not exist.`);
			}
			break;
		}
	}
}


/**
 * @classdesc A console interface for the game for game loop testing.
 * 
 * @property {ConsoleHandElement} handMain - The main hand of the game.
 * @property {ConsoleHandElement} handPlayed - The played cards hand ingame.
 * @property {ConsoleDeckElement} deck - The deck of cards in the game.
 * @property {Map} origDests - A map of strings to origin and destination locations
 */
export class ConsoleUI extends UIInterface {
	/**
	 * @class ConsoleUI
	 * @description Does not currently do much, functionality may increase later.
	 */
	constructor() {
		super();
		this.canPlay = false;
	}

	/**
	 * @function createUIel
	 * @description Creates UIel object representing a given backend card.
	 * @param {Card} card - The Card object to create the UIel for
	 */
	createUIel(card) {
		card.UIel = new ConsoleCardElement(card);
		this.deck.addCard(card.UIel);
	}

	/**
	 * @function moveMultiple
	 * @description Moves cards from one location on-screen to another.
	 * @param {Card[]} cards - The cards to move. Likely uses UIel to determine the
	 * 						   respective UI elements to work with.
	 * 
	 * 						   Delay is not used in the console UI, so it has
	 * 						   been omitted for ESLint to not complain.
	 * @param {string} origin - The origin location to move each card from.
	 *                          ex: "handMain", "deck", "shopCards", "offscreen" etc.
	 * @param {string} dest - The destination location to move each card to.
	 * 							 ex: "handPlayed", "offscreen", "deck", etc.
	 */
	moveMultiple(cards, origin, dest) {

		let originContainer = this.origDests.get(origin);
		let destContainer = this.origDests.get(dest);

		if (destContainer) {
			destContainer.contents.forEach((uiel, index) => {
				console.log(`\t[${index}] ${uiel.display}`);
			});
			if (destContainer.contents.length === 0) {
				console.log("\t(No cards in destination)");
			}
		} else {
			console.log("\t(No destination container found)");
		}

		for (let i = 0; i < cards.length; i++) {
			let uiel = cards[i].UIel;

			// Remove the card from its origin
			originContainer.removeCard(uiel);

			// Add the card to its destination
			if (!destContainer) {
				// Do not implement it like this in the proper UI, this is just a debug
				// tool. This should be an actual error if the destination is not found.
				continue;
			}
			destContainer.addCard(uiel);
		}
	}

	/**
	 * @function removeUIel
	 * @description Removes UIel object for a given backend card, deconstructing
	 *              it and freeing its resources.
	 * @param {Card} card - The Card object to deconstruct the UIel for
	 */
	removeUIel(card) {
		if (card.UIel) {
			delete card.UIel;
		} else {
			console.warn("No UIel found for card:", card);
		}
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
		console.log('"' + message + '"');
		console.log("You have lost the game. Exiting...");
		this.disallowPlay();
		throw new Error("Game Over. Reset by calling game.newGame() or exit REPL (Ctrl+D).");
	}

	/**
	 * @function exitGame
	 * @description Exit the game to the main menu.
	 */
	exitGame() {
		this.disallowPlay();
		throw new Error("Game exited. Reset by calling game.newGame() or exit REPL (Ctrl+D).");
	}

	/**
	 * @function newGame
	 * @description Initialize the UI to a clean slate for a brand new game.
	 * @param {boolean} [reset=true] - Whether to reset the gameHandler state as well.
	 */
	newGame(reset = true) {
		console.log("Starting a new game...");

		this.handMain = new ConsoleHandElement();
		this.handPlayed = new ConsoleHandElement();
		this.deck = new ConsoleDeckElement();
		this.origDests = new Map([
			["handMain", this.handMain],
			["handPlayed", this.handPlayed],
			["deck", this.deck]
		]);
		this.scorekeeper = new ConsoleScorekeeperElement();

		if (reset) {
			this.gameHandler.resetGame();
		} else {
			this.allowPlay();
		}


		console.log("New game initialized.");
	}

	/**
	 * @function scoreCard
	 * @description Plays the scoring animation and displays text messages for a card.
	 *              If no messages given, should just play the animation.
	 * @param {Card} card - The card to animate and display text for.
	 * @param {string[]} messages - The message to use, ex. "+10 Chips"
	 * @param {string[]} colors - 6-digit hexadecimal color codes to use for the messages. Example: ["#FF0000", "#00FF00"]
	 */
	scoreCard(card, messages, colors) {
		// Convert the colors to ANSI escape codes for console output
		const ansiColors = colors.map(color => {
			return `\x1b[38;2;${parseInt(color.slice(1, 3), 16)};${parseInt(color.slice(3, 5), 16)};${parseInt(color.slice(5, 7), 16)}m`;
		});
		let displayMessage = card.UIel.display;

		if (messages && messages.length > 0) {
			messages.forEach((message, index) => {
				if (index < ansiColors.length) {
					displayMessage += ` ${ansiColors[index]}${message}\x1b[0m`;
				} else {
					displayMessage += ` ${message}`; // No color if no ANSI code available
				}
			});
		}

		console.log(displayMessage);
	}

	/**
	 * @function help
	 * @description Displays help information for the console UI.
	 */
	help() {
		console.log("Console UI Help:\n");
		console.log("\t`game.newGame()` - Start a new game");
		console.log("\t`game.showHand()` - Show the current hand");
		console.log("\t`game.selectCard(index)` - Select a card at the given index in the hand");
		console.log("\t`game.selectCards([index1, index2, ...])` - Select multiple cards by their indices");
		console.log("\t`game.discard()` - Discard the selected cards from the hand");
		console.log("\t`game.play()` - Play the selected cards from the hand");

		console.log("\tPress `Ctrl+D` at the prompt to exit node.");

		console.log("\n(that's it for now lol WIP)");
	}

	/**
	 * @function showHand
	 * @description Displays the current hand in the console.
	 */
	showHand() {
		console.log("Current Hand:");
		this.handMain.contents.forEach((uiel, index) => {
			let str = `[${index}]`;
			if (uiel.card.isSelected) {
				str += "*";
			}
			str += ` ${uiel.display}`;
			console.log(str);
		});
		if (this.handMain.contents.length === 0) {
			console.log("No cards in hand.");
		}
	}

	/**
	 * @function selectCard
	 * @description Toggles the selection state of a card in the hand.
	 * @param {number} index - The index of the card to select/deselect.
	 */
	selectCard(index) {
		if (!this.canPlay) {
			console.warn("Cannot select card now. Game is processing or has ended.");
			return;
		}
		if (index < 0 || index >= this.handMain.contents.length) {
			console.warn("Invalid card index:", index);
			return;
		}

		let card = this.handMain.contents[index].card;
		card.toggleSelect();

		console.log(`Card at index ${index} is now ${card.isSelected ? "selected" : "deselected"}.`);
	}

	/**
	 * @function selectCards
	 * @description Selects multiple cards in the hand.
	 * @param {number[]} indices - An array of indices of the cards to select.
	 */
	selectCards(indices) {
		if (!this.canPlay) {
			console.warn("Cannot select cards now. Game is processing or has ended.");
			return;
		}
		if (!Array.isArray(indices)) {
			console.warn("Indices must be an array.");
			return;
		}

		indices.forEach(index => {
			this.selectCard(index);
		});
	}

	/**
	 * @function discard
	 * @description Discards the selected cards from the hand.
	 */
	discard() {
		if (!this.canPlay) {
			console.warn("Cannot discard now. Game is processing or has ended.");
			return;
		}
		this.gameHandler.discardCards();
	}

	/**
	 * @function play
	 * @description Plays the selected cards from the hand.
	 */
	play() {
		if (!this.canPlay) {
			console.warn("Cannot play cards now. Game is processing or has ended.");
			return;
		}
		this.gameHandler.playCards();
	}

	/**
	 * @typedef {object} ScorekeeperData
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
		if (Array.isArray(data)) {
			data.forEach(entry => {
				this.scorekeeper.update(entry.name, entry.value);
			});
		} else if (typeof data === 'object') {
			Object.entries(data).forEach(([key, value]) => {
				this.scorekeeper.update(key, value);
			});
		} else {
			console.warn("Invalid data format for updateScorekeeper");
		}
	}

	/**
	 * @function displayBust
	 * @description Notifies the player that the hand was bust.
	 */
	displayBust() {
		console.log("Bust! You have exceeded the maximum score for this hand.");
	}

	/**
	 * @typedef {object} MoneyBonus
	 * @property {string} 0 - The reason for the bonus
	 * @property {number} 1 - The value of the bonus
	 */

	/**
	 * @function displayMoney
	 * @description Displays the money won by the player, both base value and some
	 * 				bonuses if any won.
	 * @param {number} base - The base amount won by the current blind.
	 * @param {MoneyBonus[]} extras - An array of pairs of 'reason, value'
	 * 										representing any extra money won and
	 * 										the reasons why.
	 */
	displayMoney(base, extras) {
		if (typeof base !== 'number' || !Array.isArray(extras)) {
			console.warn("Invalid parameters for displayMoney.");
			return;
		}

		// Format as dollars.
		// Ex: 4 -> '$$$$'
		let moneyDisplay = '$'.repeat(base);
		console.log('Blind Reward: ' + moneyDisplay);

		if (extras.length > 0) {
			console.log("Bonuses:");
			extras.forEach(([reason, value]) => {
				let bonusDisplay = '$'.repeat(value);
				console.log(`\t${reason}: ${bonusDisplay}`);
			});
		}
	}

	/**
	 * @function displayWin
	 * @description Display a win message when the player wins the game.
	 */
	displayWin() {
		console.log("\n--------------------------------------");
		console.log(" CONGRATULATIONS! YOU WON THE GAME!");
		console.log("--------------------------------------");
		if (this.gameHandler && this.gameHandler.state) {
			console.log(`Final Ante Reached: ${this.gameHandler.state.currAnte}`);
			console.log(`Final Money: $${this.gameHandler.state.money}`);
		}
	}

	/**
	 * @function promptEndlessMode
	 * @description Prompts the player if they want to enter endless mode after winning.
	 * @returns {boolean} - True if the player wants to enter endless mode, false otherwise.
	 */
	promptEndlessMode() {
		console.log("\nWould you like to enter Endless Mode?");
		console.log("Type 'yes' to enter Endless Mode, or anything else to exit.");

		// We're a bit lenient on what is considered a 'yes' input, since otherwise
		// the game entirely exits.
		const input = prompt("Your choice: ").trim().toLowerCase();

		if (input === 'yes' || input === 'y' || input === 'ye') {
			console.log("Entering Endless Mode...");
			return true;
		} else {
			console.log("Exiting to main menu.");
			return false;
		}
	}

	/**
	 * @function disallowPlay
	 * @description Disallow the user from pressing buttons that interact with
	 * 			    the gameplay, backend is still processing.
	 */
	disallowPlay() {
		this.canPlay = false;
	}

	/**
	 * @function allowPlay
	 * @description Allow the user to press buttons again now that the backend
	 *              has finished processing.
	 */
	allowPlay() {
		this.canPlay = true;
	}

	/**
	 * @function printScorekeeper
	 * @description Prints the current scorekeeper state to the console.
	 */
	printScorekeeper() {
		console.log("Scorekeeper:");
		console.log(`\tBlind Name: ${this.scorekeeper.blindName}`);
		console.log(`\t\t"${this.scorekeeper.blindDescription}"`);
		console.log(`\tMinimum Score: ${this.scorekeeper.minScore}`);
		console.log(`\tBase Reward: ${this.scorekeeper.baseReward}`);
		console.log(`\tRound Score: ${this.scorekeeper.roundScore}`);
		console.log(`\tHand Score: ${this.scorekeeper.handScore}`);
		console.log(`\tHand Multiplier: ${this.scorekeeper.handMult}`);
		console.log(`\tHands Remaining: ${this.scorekeeper.handsRemaining}`);
		console.log(`\tDiscards Remaining: ${this.scorekeeper.discardsRemaining}`);
		console.log(`\tAnte: ${this.scorekeeper.ante}`);
		console.log(`\tRound: ${this.scorekeeper.round}`);
		console.log(`\tMoney: $${this.scorekeeper.money}`);
	}
}