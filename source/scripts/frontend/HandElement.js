import { CardElement } from "./CardElement.js";

/**
 * @class HandElement
 * @classdesc Custom web component representing a hand of cards.
 */
export class HandElement extends HTMLElement {
	/**
	 * @class
	 * @description Sets up shadow DOM, structure, and event listeners.
	 */
	constructor() {
		super();
		this.attachShadow({ mode: "open" });

		// Hand container
		this._container = document.createElement("div");
		this._container.classList.add("hand");
		this.shadowRoot.appendChild(this._container);

		// Attach external CSS
		const styleLink = document.createElement("link");
		styleLink.setAttribute("rel", "stylesheet");
		styleLink.setAttribute(
			"href",
			`/source/styles/hand.css?v=${Date.now()}`
		);
		this.shadowRoot.appendChild(styleLink);

		// Internal state
		this.cards = [];

		// Listen for card-dropped events to re-run layout
		// This ensures cards re-home correctly after being dragged and dropped.
		this._container.addEventListener("card-dropped", () => {
			this._updateLayout();
		});
	}

	/**
	 * @function addCard
	 * @description Adds a card to the hand.
	 * @param {CardElement} cardElement - The card element to add.
	 */
	addCard(cardElement) {
		cardElement.addEventListener("click", () =>
			this._onCardSelect(cardElement)
		);
		this.cards.push(cardElement);
		this._container.appendChild(cardElement);
		this._updateLayout();
	}

	/**
	 * @function removeCard
	 * @description Removes a card from the hand.
	 * @param {CardElement} cardElement - The card element to remove.
	 */
	removeCard(cardElement) {
		const index = this.cards.indexOf(cardElement);
		if (index !== -1) {
			this.cards.splice(index, 1);
			if (cardElement.isConnected) {
				this._container.removeChild(cardElement);
			}
			this._updateLayout();
		}
	}

	/**
	 * @function removeSelectedCards
	 * @description Removes all selected cards from the hand.
	 */
	removeSelectedCards() {
		const selectedCards = this.getSelectedCards();
		selectedCards.forEach((card) => this.removeCard(card));
	}

	/**
	 * @function getSelectedCards
	 * @description Returns an array of currently selected card elements.
	 * @returns {CardElement[]} An array of selected card elements.
	 */
	getSelectedCards() {
		return this.cards.filter((card) => card.classList.contains("selected"));
	}

	/**
	 * @function clearCards
	 * @description Removes all cards from the hand.
	 */
	clearCards() {
		this.cards.forEach((card) => {
			if (card.isConnected) {
				this._container.removeChild(card);
			}
		});
		this.cards = [];
		this._updateLayout();
	}

	/**
	 * @function _updateLayout
	 * @description Updates the layout of cards in the hand, scaling them to fit.
	 */
	_updateLayout() {
		if (this.cards.length === 0) return;

		// Ensure container has proper styling
		this._container.style.position = "relative";
		this._container.style.display = "block"; // Override flex to work with absolute positioning
		this._container.style.width = "100%";
		this._container.style.height = "120px";

		// Wait for container to have dimensions
		setTimeout(() => {
			const handWidth = this._container.offsetWidth || 400;
			const cardWidth = 80;
			let cardSpacing = cardWidth;

			// Calculate spacing to fit all cards
			if (this.cards.length > 1) {
				const totalNeededWidth = this.cards.length * cardWidth;
				if (totalNeededWidth > handWidth) {
					// Cards need to overlap
					cardSpacing = Math.max(
						20,
						(handWidth - cardWidth) / (this.cards.length - 1)
					);
				}
			}

			console.log(
				`Layout: handWidth=${handWidth}, cardWidth=${cardWidth}, cardSpacing=${cardSpacing}, cards=${this.cards.length}`
			);

			this.cards.forEach((card, index) => {
				card.style.position = "absolute";
				card.style.left = `${index * cardSpacing}px`;
				card.style.top = "0px";
				card.style.transform = card.classList.contains("selected")
					? "translateY(-20px)"
					: "translateY(0)";
				card.style.zIndex = index.toString();
				card.style.width = `${cardWidth}px`;
				card.style.height = "120px";
			});
		}, 10);
	}

	/**
	 * @function _onCardSelect
	 * @description Handles card selection.
	 * @param {CardElement} cardElement - The selected card element.
	 */
	_onCardSelect(cardElement) {
		// If the card was part of a drag operation, don't treat this click as a selection
		if (cardElement._wasDragged) {
			return;
		}
		const isSelected = cardElement.classList.toggle("selected");
		this.dispatchEvent(
			new CustomEvent("card-selected", {
				detail: { card: cardElement, selected: isSelected },
				bubbles: true,
				composed: true,
			})
		);
		this._updateLayout();
	}
}

customElements.define("hand-element", HandElement);

