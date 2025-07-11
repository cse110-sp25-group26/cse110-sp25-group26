import { Card } from "./Card.js";

/**
 * @classdesc Represents a hand of cards in the game.
 *
 * @property {Card[]} cards - The cards in the hand.
 * @property {string} sortMethod - The sorting method used for the hand.
 */
export class Hand {
	/**
	 * @class Hand
	 */
	constructor() {
		this.cards = [];
		this.sortMethod = null; // No sorting method by default
	}

	/**
	 * @function compareSuits
	 * @description Compares two suits.
	 * @param {string} suit1 - The first suit.
	 * @param {string} suit2 - The second suit.
	 * @returns {number} - Returns 1 if suit1 is greater than suit2, -1 if suit1 is less than suit2, and 0 if they are equal.
	 */
	static compareSuits(suit1, suit2) {
		const suitOrder = ["hearts", "diamonds", "clubs", "spades"];
		const index1 = suitOrder.indexOf(suit1);
		const index2 = suitOrder.indexOf(suit2);

		if (index1 > index2) {
			return 1;
		} else if (index1 < index2) {
			return -1;
		} else {
			return 0;
		}
	}

	/**
	 * @function compareValues
	 * @description Compares two card values.
	 * @param {string} value1 - The first card value.
	 * @param {string} value2 - The second card value.
	 * @returns {number} - Returns 1 if value1 is greater than value2, -1 if value1 is less than value2, and 0 if they are equal.
	 */
	static compareValues(value1, value2) {
		const valueOrder = [
			"2",
			"3",
			"4",
			"5",
			"6",
			"7",
			"8",
			"9",
			"10",
			"J",
			"Q",
			"K",
			"A",
		];
		const index1 = valueOrder.indexOf(value1);
		const index2 = valueOrder.indexOf(value2);

		if (index1 > index2) {
			return 1;
		} else if (index1 < index2) {
			return -1;
		} else {
			return 0;
		}
	}

	/**
	 * @function sortBySuit
	 * @description Sorts the hand by suit, then by value.
	 */
	sortBySuit() {
		this.cards.sort((a, b) => {
			const suitComparison = Hand.compareSuits(a.suit, b.suit);
			if (suitComparison !== 0) {
				return suitComparison;
			} else {
				return Hand.compareValues(a.type, b.type);
			}
		});
		this.sortMethod = "suit";

		// TODO_UI: Call back to the UI to update the hand organization
	}

	/**
	 * @function sortByValue
	 * @description Sorts the hand by value, then by suit.
	 */
	sortByValue() {
		this.cards.sort((a, b) => {
			const valueComparison = Hand.compareValues(a.type, b.type);
			if (valueComparison !== 0) {
				return valueComparison;
			} else {
				return Hand.compareSuits(a.suit, b.suit);
			}
		});
		this.sortMethod = "value";

		// TODO_UI: Call back to the UI to update the hand organization
	}

	/**
	 * @function getInsertIndex
	 * @description Gets the index to insert a card into the sorted hand.
	 * @param {Card} card - The card to insert.
	 * @returns {number} - The index to insert the card.
	 */
	getInsertIndex(card) {
		if (!this.sortMethod) {
			// No sorting method, insert at the end
			return this.cards.length;
		}

		let comparator;
		if (this.sortMethod === "suit") {
			comparator = (c1, c2) => {
				const suitComparison = Hand.compareSuits(c1.suit, c2.suit);
				if (suitComparison !== 0) {
					return suitComparison;
				}
				return Hand.compareValues(c1.type, c2.type);
			};
		} else if (this.sortMethod === "value") {
			comparator = (c1, c2) => {
				const valueComparison = Hand.compareValues(c1.type, c2.type);
				if (valueComparison !== 0) {
					return valueComparison;
				}
				return Hand.compareSuits(c1.suit, c2.suit);
			};
		} else {
			// This should not happen
			console.error(
				"Hand::getInsertIndex - Invalid sort method: " + this.sortMethod
			);
			return this.cards.length;
		}

		// Binary search to find the correct index
		let low = 0;
		let high = this.cards.length;
		while (low < high) {
			const mid = Math.floor((low + high) / 2);
			if (comparator(card, this.cards[mid]) <= 0) {
				high = mid;
			} else {
				low = mid + 1;
			}
		}
		return low;
	}

	/**
	 * @function addCard
	 * @description Adds a card to the hand. If index is not provided, adds at the sorted position if a sort method is set, otherwise at the end. If index is provided, disables sorting.
	 * @param {Card} card - The card to add.
	 * @param {number} [index=null] - The index to add the card at. If null, uses sorted index or end of hand.
	 */
	addCard(card, index = null) {
		if (index === null) {
			index = this.getInsertIndex(card);
		} else {
			this.sortMethod = null;

			if (index < 0 || index > this.cards.length) {
				console.error(
					"Hand::addCard - Invalid index " +
						index +
						". Adding to end."
				);
				index = this.cards.length;
			}
		}

		this.cards.splice(index, 0, card);

		// TODO_UI: Call back to the UI to put the card in the hand
	}

	/**
	 * @function moveCard
	 * @description Moves a card from one index to another in the hand. Disables sorting if the card moves to a different index.
	 * @param {number} fromIndex - The index to move the card from.
	 * @param {number} toIndex - The index to move the card to.
	 * @returns {boolean} - Returns true if the move was successful, false otherwise (ex. if the indices are out of bounds).
	 */
	moveCard(fromIndex, toIndex) {
		if (
			fromIndex < 0 ||
			fromIndex >= this.cards.length ||
			toIndex < 0 ||
			toIndex >= this.cards.length
		) {
			console.error("Hand::moveCard - Invalid indices.");
			return false;
		}
		if (fromIndex === toIndex) {
			return true; // No move needed
		}

		const card = this.cards.splice(fromIndex, 1)[0];
		this.cards.splice(toIndex, 0, card);
		this.sortMethod = null; // Manual rearrangement disables sorting

		// TODO_UI: Call back to the UI hand to update the hand organization

		return true;
	}

	/**
	 * @function removeCard
	 * @description Removes a card from the hand. Can take either a card
	 *              object or an index.
	 * @param {number|Card} target - The index of the card to remove or the
	 *                                card object itself.
	 * @returns {Card|null} - The removed card, or null if the card/index is
	 *                        invalid.
	 */
	removeCard(target) {
		let index = target;

		if (target instanceof Card) {
			index = this.cards.indexOf(target);
		}

		if (typeof index !== 'number' || index < 0 || index >= this.cards.length) {
			return null; // Invalid index or card not found
		}

		return this.cards.splice(index, 1)[0];
	}
}
