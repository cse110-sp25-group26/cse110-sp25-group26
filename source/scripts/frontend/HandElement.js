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

		// card animation movement test
		const animationLink = document.createElement('link');
		animationLink.setAttribute('rel', 'stylesheet');
		animationLink.setAttribute('href', '/source/scripts/frontend/card-animations.css');
		this.shadowRoot.appendChild(animationLink);
		
		// Attach external CSS
		const styleLink = document.createElement("link");
		styleLink.setAttribute("rel", "stylesheet");
		styleLink.setAttribute("href", "/source/scripts/frontend/hand.css");
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
	 * @function _updateLayout
	 * @description Updates the layout of cards in the hand, scaling them to fit.
	 */
	_updateLayout() {
		const handWidth = this._container.offsetWidth || 1; // Avoid division by zero
		const cardWidth = 80; // Default card width
		const totalWidth = this.cards.length * cardWidth;

		let overlap = 0;
		if (totalWidth > handWidth && this.cards.length > 1) {
			overlap = (totalWidth - handWidth) / (this.cards.length - 1);
		}

		this.cards.forEach((card, index) => {
			card.style.position = "absolute";
			card.style.left = `${index * (cardWidth - overlap)}px`;
			card.style.transform = card.classList.contains("selected")
				? "translateY(-20px)"
				: "translateY(0)";
			card.style.zIndex = index.toString(); // Set zIndex for stacking
			card.style.width = `${cardWidth}px`; // Ensure consistent width
		});
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
	
	/**
	 * @function addCardwithAnimation
	 * @description adding the card to player hand
	 * @param {CardElement} cardElement - The selected card element.
	 */
	addCardwithAnimation(cardElement) {
		cardElement.addEventListener('click', () => this._onCardSelect(cardElement));
		this.cards.push(cardElement);
		this._container.appendChild(cardElement);

		// For movement animation
		const deckBox = document.getElementById('card-deck')?.getBoundingClientRect();
		const handBox = this.getBoundingClientRect();
		if (deckBox && handBox) {
			const offsetX = deckBox.left - handBox.left;
			const offsetY = deckBox.top - handBox.top;
			cardElement.style.setProperty('--from-x', `${offsetX}px`);
			cardElement.style.setProperty('--from-y', `${offsetY}px`);
			cardElement._container?.classList.add('card-fly-in');
		}

		this._updateLayout();
	}

	/**
	 * @function removeSelectedCardswithAnimation
	 * @description removing card from player hand to trash 
	 */
	removeSelectedCardswithAnimation() {
		const selectedCards = this.getSelectedCards();
		const trashBox = document.getElementById('discard-pile')?.getBoundingClientRect();
		const handBox = this.getBoundingClientRect();

		selectedCards.forEach(card => {
			if (trashBox && handBox) {
				const offsetX = trashBox.left - handBox.left;
				const offsetY = trashBox.top - handBox.top;
				card.style.setProperty('--to-x', `${offsetX}px`);
				card.style.setProperty('--to-y', `${offsetY}px`);
				card._container?.classList.add('card-fly-out');

				// 
				setTimeout(() => {
					this.removeCard(card);
				}, 500);
			} else {
				this.removeCard(card); // fallback
			}
		});
	}
}

customElements.define("hand-element", HandElement);

