/**
 * @classdesc Represents a playing card in the game.
 *
 * @property {boolean} isFlipped - Indicates if the card is flipped.
 * @property {boolean} isSelected - Indicates if the card is selected.
 * @property {string} suit - The suit of the card (e.g., 'hearts', 'diamonds'). Contains 'joker' or 'consumable' if the card is a joker or consumable.
 * @property {string} type - The rank of the card (e.g., 'A', '2', '3', ..., 'K'). Contains the joker or consumable type if the card is a joker or consumable.
 * @property {string[]} properties - The properties of the card (e.g., 'seal_gold', 'holo', 'alwaysFlipped')
 * @property {any} UIel - The UI element associated with the card. Type depends on the UI implementation.
 */
export class Card {
	/**
	 * @class Card
	 * @param {string} suit - The suit of the card.
	 * @param {string} type - The rank of the card.
	 */
	constructor(suit, type) {
		this.isFlipped = false;
		this.isSelected = false;
		this.suit = suit;
		this.type = type;
		this.properties = [];
	}

	/**
	 * @function flip
	 * @description Flips the card.
	 */
	flip() {
		this.isFlipped = !this.isFlipped;

		// TODO_UI: Update the UI element to reflect the new flipped state
	}

	/**
	 * @function toggleSelect
	 * @description Toggles the selection state of the card.
	 * @returns {boolean} - The new selection state of the card.
	 */
	toggleSelect() {
		this.isSelected = !this.isSelected;

		// TODO_UI: Update the UI element to reflect the new selection state

		return this.isSelected;
	}

	/**
	 * @function addProperty
	 * @description Adds a property to the card.
	 * @param {string} property - The property to add.
	 * @returns {boolean} - True if the property was added, false if it already exists.
	 */
	addProperty(property) {
		if (this.properties.includes(property)) {
			return false;
		}
		this.properties.push(property);

		// TODO_UI: Call back to the UI to update the card's properties

		return true;
	}

	/**
	 * @function removeProperty
	 * @description Removes a property from the card.
	 * @param {string} property - The property to remove.
	 * @returns {boolean} - True if the property was removed, false if it didn't exist.
	 */
	removeProperty(property) {
		const index = this.properties.indexOf(property);
		if (index === -1) {
			return false;
		}
		this.properties.splice(index, 1);

		// TODO_UI: Call back to the UI to update the card's properties

		return true;
	}

	/**
	 * @function hasProperty
	 * @description Checks if the card has a specific property.
	 * @param {string} property - The property to check.
	 * @returns {boolean} - True if the card has the property, false otherwise.
	 */
	hasProperty(property) {
		return this.properties.includes(property);
	}

	/**
	 * @function getValue
	 * @description Gets the base scoring value of the card.
	 * @returns {number} - The base value of the card.
	 */
	getValue() {
		if (this.suit === 'joker' || this.suit === 'consumable') {
			return 0; // Jokers and consumables have no base value
		}

		if (this.type === 'A') {
			return 11; // Ace is worth 11
		} else if (['K', 'Q', 'J'].includes(this.type)) {
			return 10; // Face cards are worth 10
		} else {
			return parseInt(this.type, 10); // Number cards are worth their value
		}
	}
}