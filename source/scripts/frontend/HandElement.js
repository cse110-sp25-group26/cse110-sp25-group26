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
		this._container.style.position = 'relative';
		this._container.style.width = '100%';
		this._container.style.height = '100%';
		this.shadowRoot.appendChild(this._container);

		// Attach external CSS
		const styleLink = document.createElement('link');
		styleLink.setAttribute('rel', 'stylesheet');
		styleLink.setAttribute('href', './scripts/frontend/hand.css');
		this.shadowRoot.appendChild(styleLink);

		// Internal state
		this.cards = [];
		this.configuredCardWidth = 80;
		this.verticalAlign = 'middle';

		// Listen for card-dropped events to re-run layout
		this._container.addEventListener('card-dropped', () => {
			requestAnimationFrame(() => this._updateLayout());
		});

		// Add resize observer to handle container size changes
		this._resizeObserver = new ResizeObserver(() => {
			requestAnimationFrame(() => this._updateLayout());
		});
		this._resizeObserver.observe(this._container);
	}

	connectedCallback() {
		if (this.hasAttribute('data-card-width')) {
			const newWidth = parseInt(this.getAttribute('data-card-width'), 10);
			if (!isNaN(newWidth) && newWidth > 0) {
				this.configuredCardWidth = newWidth;
			}
		}
		if (this.hasAttribute('data-vertical-align')) {
			const vAlign = this.getAttribute('data-vertical-align').toLowerCase();
			if (['top', 'middle', 'bottom'].includes(vAlign)) {
				this.verticalAlign = vAlign;
			}
		}
		// Initial layout update if cards are added before connection, or just to apply config
		requestAnimationFrame(() => this._updateLayout());
	}

	/**
	 * @function addCard
	 * @description Adds a card to the hand.
	 * @param {CardElement} cardElement - The card element to add.
	 */
	addCard(cardElement) {
		if (!cardElement || !(cardElement instanceof CardElement)) {
			console.error('Invalid card element:', cardElement);
			return;
		}

		try {
			// Remove from previous parent if needed
			if (cardElement.parentElement) {
				cardElement.parentElement.removeChild(cardElement);
			}

			// Add click listener
			cardElement.addEventListener('click', () => this._onCardSelect(cardElement));
			
			// Add to our arrays and DOM
			this.cards.push(cardElement);
			this._container.appendChild(cardElement);

			// Set initial styles
			cardElement.style.position = 'absolute';
			cardElement.style.width = `${this.configuredCardWidth}px`;
			cardElement.style.height = '120px'; // Fixed card height
			cardElement.style.zIndex = this.cards.length.toString();

			// Update layout
			requestAnimationFrame(() => this._updateLayout());
		} catch (error) {
			console.error('Error adding card:', error);
		}
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
			// Defer layout update
			requestAnimationFrame(() => this._updateLayout());
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
		const handContainer = this._container;
		if (!handContainer) return;

		// Get container dimensions, with fallbacks
		const handWidth = handContainer.offsetWidth || handContainer.clientWidth || 1;
		const handHeight = 120; // Fixed height for hands

		// Enhanced logging
		console.log(`HandElement[${this.id}] _updateLayout:`, {
			containerWidth: handWidth,
			containerHeight: handHeight,
			numCards: this.cards.length,
			cardWidth: this.configuredCardWidth,
			cards: this.cards.map(c => c ? `${c.getAttribute('type')} of ${c.getAttribute('suit')}` : 'null')
		});

		// If container is not properly sized yet, retry layout
		if (handWidth <= 1) {
			console.warn(`HandElement[${this.id}]: Container width too small (${handWidth}), retrying layout...`);
			requestAnimationFrame(() => this._updateLayout());
			return;
		}

		// Clean up any null cards from the array
		this.cards = this.cards.filter(card => card !== null && card !== undefined);

		const cardWidth = this.configuredCardWidth;
		const cardHeight = 120; // Fixed card height

		// Calculate card spacing
		const totalWidth = this.cards.length * cardWidth;
		let spacing = cardWidth;
		
		if (totalWidth > handWidth && this.cards.length > 1) {
			spacing = Math.max((handWidth - cardWidth) / (this.cards.length - 1), cardWidth * 0.3);
		}

		// Position each card
		this.cards.forEach((card, index) => {
			if (!card || !(card instanceof CardElement)) {
				console.warn(`Invalid card at index ${index}:`, card);
				return;
			}

			try {
				// Calculate horizontal position
				const left = Math.min(index * spacing, handWidth - cardWidth);
				
				// Calculate vertical position - centered in the 120px height
				const top = 0; // Cards are now aligned to top since hand height matches card height

				// Apply position with transform for better performance
				card.style.position = 'absolute';
				card.style.left = `${left}px`;
				card.style.top = `${top}px`;
				card.style.width = `${cardWidth}px`;
				card.style.height = `${cardHeight}px`;
				
				// Add selection transform
				const translateY = card.classList.contains('selected') ? -20 : 0;
				card.style.transform = `translateY(${translateY}px)`;
				
				// Ensure proper stacking
				card.style.zIndex = index.toString();
			} catch (error) {
				console.error(`Error positioning card at index ${index}:`, error);
			}
		});
	}

	/**
	 * @function _onCardSelect
	 * @description Handles card selection.
	 * @param {CardElement} cardElement - The selected card element.
	 */
	_onCardSelect(cardElement) {
		// Only handle selection if the card wasn't dragged
		if (!cardElement._wasDragged) {
			cardElement.classList.toggle('selected');
			
			// Dispatch selection event
			this.dispatchEvent(new CustomEvent('card-selected', {
				detail: { card: cardElement, selected: cardElement.classList.contains('selected') },
				bubbles: true,
				composed: true
			}));
			
			// Update layout for selection visual
			requestAnimationFrame(() => this._updateLayout());
		}
		
		// Reset drag state
		cardElement._wasDragged = false;
	}

	disconnectedCallback() {
		if (this._resizeObserver) {
			this._resizeObserver.disconnect();
		}
	}
}

customElements.define('hand-element', HandElement);