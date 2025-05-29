import { UIInterface } from "../backend/UIInterface";
import { Card } from "../backend/Card";

/**
 * @classdesc A helper class for ConsoleUI.
 * 
 * @property {Card} card - The associated Card with this ConsoleUI Card.
 * @property {string} display - The display name for this Card.
 */
class ConsoleCardElement {
	/**
	 * @class ConsoleCardElement
	 * @description Constructs a ConsoleUI card for the Card passed.
	 * @param card - The card to construct the element on.
	 */
	constructor(card) {
		this.card = card;
		this.display = card.type + " of " + card.suit;
	}
}

/**
 * @classdesc A console interface for the game for game loop testing.
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
	}
}