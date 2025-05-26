import { CardElement } from "./CardElement.js";
import { Card } from "../backend/Card.js";

/**
 * @classdesc UI component representing the Deck.
 * 
 * @param {HTMLElement} deckContainer - The DOM element for the Deck.
 * @param {CardElement[]} cards - The array of CardElement objects currently created.
 */
export class DeckElement {
	/**
	 * @class DeckElement
	 * @param {string} back - The card back to use for the Deck.
	 * @param {HTMLElement} deckContainer - The DOM element for the Deck.
	 */
	constructor(back, deckContainer) {
		// Verify deckContainer is a valid HTMLElement
		if (!(deckContainer instanceof HTMLElement)) {
			console.error("Invalid deck container provided.");
			return null;
		}
		this.deckContainer = deckContainer;

		// Verify back is a valid string
		if (typeof back !== "string" || back.trim() === "") {
			console.error("Invalid card back provided.");
			return null;
		}

		// Set up the deck background image
		this.deckImage = document.createElement("img");
		this.deckImage.src = "/source/res/img/" + back + ".png";
		this.deckImage.alt = "Deck";
		this.deckImage.style.width = "80px";
		this.deckImage.style.height = "120px";

		// Set up the deck container
		this.deckContainer.style.display = "flex";
		this.deckContainer.style.justifyContent = "center";
		this.deckContainer.style.alignItems = "center";
		this.deckContainer.appendChild(this.deckImage);

		// Initialize the cards array
		this.cards = [];
	}

	/**
	 * @function addCards
	 * @description Adds some cards on top of the deck.
	 * @param {Card[]} cards - The backend cards to create elements for.
	 */
	addCards(cards) {
		let zindex = 0;
		let cardElements = [];
		cards.forEach(card => {
			const cardElement = new CardElement(card, false);
			cardElement.style.position = "absolute";
			cardElement.style.zIndex = zindex++;
			cardElement.style.left = "0px";
			cardElement.style.top = "0px";

			cardElements.push(cardElement);

			card.UIel = cardElement;
		});
		this.deckContainer.append(...cardElements);
		this.cards.push(...cardElements);
	}
}