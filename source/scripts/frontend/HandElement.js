import { CardElement } from './CardElement.js';

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
		this.attachShadow({ mode: 'open' });

		// Hand container
		this._container = document.createElement('div');
		this._container.classList.add('hand');
		this.shadowRoot.appendChild(this._container);

		// Attach external CSS
		const styleLink = document.createElement('link');
		styleLink.setAttribute('rel', 'stylesheet');
		styleLink.setAttribute('href', 'hand.css');
		this.shadowRoot.appendChild(styleLink);

		// Internal state
		this.cards = [];

		// Default card width, can be overridden by attribute
		this.configuredCardWidth = 80;

		// Listen for card-dropped events to re-run layout
		// This ensures cards re-home correctly after being dragged and dropped.
		this._container.addEventListener('card-dropped', () => {
			this._updateLayout();
		});
	}

	/**
	 *
	 */
	connectedCallback() {
		if (this.hasAttribute('data-card-width')) {
			const newWidth = parseInt(this.getAttribute('data-card-width'), 10);
			if (!isNaN(newWidth) && newWidth > 0) {
				this.configuredCardWidth = newWidth;
			}
		}
		// Initial layout update if cards are added before connection, or just to apply config
		this._updateLayout();
	}

	/**
	 * @function addCard
	 * @description Adds a card to the hand.
	 * @param {CardElement} cardElement - The card element to add.
	 */
	addCard(cardElement) {
		cardElement.addEventListener('click', () => this._onCardSelect(cardElement));
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
			if (cardElement.parentElement === this._container) {
				this._container.removeChild(cardElement);
			} else if (cardElement.isConnected) {
				console.warn('CardElement parent is not the expected container during removeCard. Card:', cardElement, 'Actual Parent:', cardElement.parentElement, 'Expected Parent Container:', this._container);
				if (cardElement.parentElement) {
					try {
						cardElement.parentElement.removeChild(cardElement);
					} catch (e) {
						console.error('Failed to remove card from its unexpected parent:', e);
					}
				}
			} else {
				console.log('CardElement was not connected during removal or already removed from DOM.');
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
		selectedCards.forEach(card => this.removeCard(card));
	}

	/**
	 * @function getSelectedCards
	 * @description Returns an array of currently selected card elements.
	 * @returns {CardElement[]} An array of selected card elements.
	 */
	getSelectedCards() {
		return this.cards.filter(card => card.classList.contains('selected'));
	}

	/**
	 * @function _updateLayout
	 * @description Updates the layout of cards in the hand, scaling them to fit.
	 */
	_updateLayout() {
		const handWidth = this._container.offsetWidth || 1; // Avoid division by zero
		const cardWidth = this.configuredCardWidth; // Use configured card width
		const totalWidth = this.cards.length * cardWidth;

		let overlap = 0;
		if (totalWidth > handWidth && this.cards.length > 1) {
			overlap = (totalWidth - handWidth) / (this.cards.length - 1);
		}

		this.cards.forEach((card, index) => {
			card.style.position = 'absolute';
			card.style.left = `${index * (cardWidth - overlap)}px`;
			card.style.transform = card.classList.contains('selected') ? 'translateY(-20px)' : 'translateY(0)';
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
		const isSelected = cardElement.classList.toggle('selected');
		this.dispatchEvent(new CustomEvent('card-selected', {
			detail: { card: cardElement, selected: isSelected },
			bubbles: true,
			composed: true
		}));
		this._updateLayout();
	}
}

customElements.define('hand-element', HandElement);