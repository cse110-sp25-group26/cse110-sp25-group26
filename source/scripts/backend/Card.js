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
	}

	/**
	 * @function toggleSelect
	 * @description Toggles the selection state of the card.
	 * @returns {boolean} - The new selection state of the card.
	 */
	toggleSelect() {
		this.isSelected = !this.isSelected;
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
		return true;
	}
}