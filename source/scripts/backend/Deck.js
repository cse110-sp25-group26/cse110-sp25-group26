import { Card } from "./Card.js";

/**
 * @classdesc Represents a deck of cards in the game.
 *
 * @property {Card[]} availableCards - The cards available in the deck.
 * @property {Card[]} usedCards - The cards that have been used from the deck.
 * @property {Card[]} allCards - All cards in the deck, including available and used cards.
 */
export class Deck {
	/**
	 * @class Deck
	 * @description Creates a new deck of cards.
	 * @param {Card[]} cards - The cards to be included in the deck.
	 */
	constructor(cards) {
		this.availableCards = cards;
		this.usedCards = [];
		this.allCards = [...cards]; // duplicates the array
		this.shuffle();
	}

	/**
	 * @function shuffle
	 * @description Shuffles the deck of cards using the Fisher-Yates algorithm.
	 */
	shuffle() {
		for (let i = this.availableCards.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.availableCards[i], this.availableCards[j]] = [
				this.availableCards[j],
				this.availableCards[i],
			];
		}
	}

	/**
	 * @function drawCard
	 * @description Draws a card from the deck.
	 * @returns {Card|null} - The drawn card or null if no cards are available.
	 */
	drawCard() {
		if (this.availableCards.length === 0) {
			return null;
		}
		const card = this.availableCards.pop();
		this.usedCards.push(card);
		return card;
	}

	/**
	 * @function returnCard
	 * @description Returns a card to the deck.
	 * @param {Card} card - The card to be returned.
	 */
	returnCard(card) {
		const index = this.usedCards.indexOf(card);
		if (index !== -1) {
			this.usedCards.splice(index, 1);
			this.availableCards.push(card);
		}
	}

	/**
	 * @function resetDeck
	 * @description Resets the deck to its original state.
	 */
	resetDeck() {
		this.availableCards = [...this.allCards];
		this.usedCards = [];
		this.shuffle();
	}

	/**
	 * @function addCard
	 * @description Adds a new card to the deck, and shuffles the deck.
	 * @param {Card} card - The card to be added.
	 * @returns {boolean} - Returns true if the card was added successfully, false if the card already exists in the deck.
	 */
	addCard(card) {
		if (this.allCards.includes(card)) {
			console.error("Deck::addCard - Card already exists in the deck.");
			return false;
		}
		this.allCards.push(card);
		this.availableCards.push(card);
		this.shuffle();
		return true;
	}

	/**
	 * @function removeCard
	 * @description Removes a card from the deck.
	 * @param {Card} card - The card to be removed.
	 * @returns {boolean} - Returns true if the card was removed successfully, false if the card does not exist in the deck.
	 */
	removeCard(card) {
		const index = this.allCards.indexOf(card);
		if (index === -1) {
			console.error(
				"Deck::removeCard - Card does not exist in the deck."
			);
			return false;
		}
		this.allCards.splice(index, 1);
		this.availableCards.splice(this.availableCards.indexOf(card), 1);
		return true;
	}
}

