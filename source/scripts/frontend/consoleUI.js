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
 * @classdesc A console interface for the game for game loop testing.
 * 
 * @property {ConsoleHandElement} hand_main - The main hand of the game.
 * @property {ConsoleHandElement} hand_played - The played cards hand ingame.
 * @property {ConsoleDeckElement} deck - The deck of cards in the game.
 * @property {Map} orig_dests - A map of strings to origin and destination locations
 */
export class ConsoleUI extends UIInterface {
	/**
	 * @class ConsoleUI
	 * @description Does not currently do much, functionality may increase later.
	 */
	constructor() {
		super();
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
	 * @param {string} origin - The origin location to move each card from.
	 *                          ex: "hand_main", "deck", "shop_cards", "offscreen" etc.
	 * @param {string} dest - The destination location to move each card to.
	 * 							 ex: "hand_played", "offscreen", "deck", etc.
	 * @param {number} delay - The offset between each card dispatch.
	 */
	moveMultiple(cards, origin, dest, delay) {
		// No animations in console version, suppress unused warning
		delay = delay;

		let originContainer = this.orig_dests.get(origin);
		let destContainer = this.orig_dests.get(dest);

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
			console.log(`Removing UIel for card: ${card.UIel.display}`);
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

		throw new Error("reset after loss not implemented yet TODO");
	}

	/**
	 * @function exitGame
	 * @description Exit the game to the main menu.
	 */
	exitGame() {
		console.log("Exiting game...");

		throw new Error("exitGame not implemented yet TODO");
	}

	/**
	 * @function newGame
	 * @description Initialize the UI to a clean slate for a brand new game.
	 * @param {boolean} [reset=true] - Whether to reset the gameHandler state as well.
	 */
	newGame(reset = true) {
		console.log("Starting a new game...");

		this.hand_main = new ConsoleHandElement();
		this.hand_played = new ConsoleHandElement();
		this.deck = new ConsoleDeckElement();
		this.orig_dests = new Map([
			["hand_main", this.hand_main],
			["hand_played", this.hand_played],
			["deck", this.deck]
		]);

		if (reset) {
			this.gameHandler.resetGame();
			console.log("Game state has been reset.");
		}

		this.gameHandler.dealCards();

		console.log("New game initialized.");
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
		// Console doesn't support colors, so we ignore them
		colors = colors;

		console.log(`${card.UIel.display}: ${messages.join(", ")}`);
	}

	/**
	 * @function help
	 * @description Displays help information for the console UI.
	 */
	help() {
		console.log("Console UI Help:\n");
		console.log("\t`game.newGame()` - Start a new game");
		console.log("\t`game.showHand()` - Show the current hand");

		console.log("\tPress `Ctrl+D` at the prompt to exit node.");

		console.log("\n(that's it for now lol WIP)");
	}

	/**
	 * @function showHand
	 * @description Displays the current hand in the console.
	 */
	showHand() {
		console.log("Current Hand:");
		this.hand_main.contents.forEach((uiel, index) => {
			let str = `[${index}]`;
			if (uiel.card.isSelected) {
				str += "*";
			}
			str += ` ${uiel.display}`;
			console.log(str);
		});
		if (this.hand_main.contents.length === 0) {
			console.log("No cards in hand.");
		}
	}

	/**
	 * @function selectCard
	 * @description Toggles the selection state of a card in the hand.
	 * @param {number} index - The index of the card to select/deselect.
	 */
	selectCard(index) {
		if (index < 0 || index >= this.hand_main.contents.length) {
			console.warn("Invalid card index:", index);
			return;
		}

		let card = this.hand_main.contents[index].card;
		card.toggleSelect();

		console.log(`Card at index ${index} is now ${card.isSelected ? "selected" : "deselected"}.`);
	}

	/**
	 * @function selectCards
	 * @description Selects multiple cards in the hand.
	 * @param {number[]} indices - An array of indices of the cards to select.
	 */
	selectCards(indices) {
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
		this.gameHandler.discardCards();
		this.gameHandler.dealCards();
	}

	/**
	 * @function play
	 * @description Plays the selected cards from the hand.
	 */
	play() {
		this.gameHandler.playCards();
		this.gameHandler.dealCards();
	}
}