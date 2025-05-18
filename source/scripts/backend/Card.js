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
	 * @function moveTo
	 * @description - Moves the card's UI element to a target DOM container with a smooth animation.
	 *              Can be awaited to ensure the move completes before continuing.
	 * @param {HTMLElement} targetEl - The DOM element to move the card into.
	 * @returns {Promise<void>} - Resolves when the move is finished.
	 */
	async moveTo(targetEl){
      	return new Promise((resolve) => {

			// If Card has no UI element
			if(!this.UIel || !(this.UIel instanceof HTMLElement)){
				console.warn("Card has no UI element");
				resolve();
				return;
			}

			// Get current and target positions for moving card.
			const currentRect = this.UIel.getBoundingClientRect();
			const targetRect = targetEl.getBoundingClientRect();

			const deltaX = targetRect.left - currentRect.left;
			const deltaY = targetRect.top - currentRect.top;

			// For animation
			this.UIel.style.position = 'absoulte';
			this.UIel.style.transition = 'transform 0.5 ease';
			this.UIel.style.zIndex = '1000';
			this.UIel.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

			const onTransitionEnd = () => {
				// Update to the initial state after animation
				this.UIel.style.position = '';
				this.UIel.style.transition = '';
				this.UIel.style.zIndex = '';
				this.UIel.style.transform = '';
				targetEl.appendChild(this.UIel);
				this.UIel.removeEventListener('transitionend', onTransitionEnd);
				resolve();
			};

			this.UIel.addEventListener('transitionend', onTransitionEnd);
      	});
	}

}