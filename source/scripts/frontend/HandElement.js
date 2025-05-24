/**
 *
 */
class HandElement extends HTMLElement {
	/**
	 *
	 */
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._container = document.createElement('div');
		this._container.classList.add('hand');
		this.shadowRoot.appendChild(this._container);

		const styleLink = document.createElement('link');
		styleLink.setAttribute('rel', 'stylesheet');
		styleLink.setAttribute('href', '/source/scripts/frontend/hand.css');
		this.shadowRoot.appendChild(styleLink);

		this.cards = [];
		this._draggedCard = null;
		this._originalIndex = -1;

		this.addEventListener('card-dropped', () => this._updateLayout());
		this.addEventListener('card-dragstart', (e) => this._onDragStart(e));
		this.addEventListener('card-dragend', (e) => this._onDragEnd(e));
	}

	/**
	 * Adds a card to the hand.
	 * @param {HTMLElement} cardElement - The card element to add.
	 */
	addCard(cardElement) {
		cardElement.addEventListener('click', () => this._onCardSelect(cardElement));
		this.cards.push(cardElement);
		this._container.appendChild(cardElement);
		this._updateLayout();
	}

	/**
	 * Removes a card from the hand.
	 * @param {HTMLElement} cardElement - The card element to remove.
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
	 *
	 */
	removeSelectedCards() {
		const selectedCards = this.getSelectedCards();
		selectedCards.forEach(card => this.removeCard(card));
	}

	/**
	 * Gets the selected cards in the hand.
	 * @returns {HTMLElement[]} The list of selected cards.
	 */
	getSelectedCards() {
		return this.cards.filter(card => card.classList.contains('selected'));
	}

	/**
	 * Updates the layout of the cards in the hand.
	 */
	_updateLayout() {
		const handWidth = this._container.offsetWidth || 1;
		const cardWidth = 80;
		const totalWidth = this.cards.length * cardWidth;

		let spacing;
		if (totalWidth <= handWidth) {
			spacing = cardWidth;
		} else {
			spacing = (handWidth - cardWidth) / (this.cards.length - 1);
		}

		this.cards.forEach((card, index) => {
			card.style.position = 'absolute';
			card.style.left = `${index * spacing}px`;
			card.style.transform = card.classList.contains('selected') ? 'translateY(-20px)' : 'translateY(0)';
			card.style.zIndex = card.classList.contains('selected') ? this.cards.length + 1 : index;
			card.style.width = `${cardWidth}px`;
		});
	}

	/**
	 * Handles the card selection.
	 * @param {HTMLElement} cardElement - The card element to select or deselect.
	 */
	_onCardSelect(cardElement) {
		const isSelected = cardElement.classList.toggle('selected');
		cardElement.style.transform = isSelected ? 'translateY(-20px)' : 'translateY(0)';
		cardElement.style.zIndex = isSelected ? this.cards.length + 1 : this.cards.indexOf(cardElement);
		this.dispatchEvent(new CustomEvent('card-selected', {
			detail: { card: cardElement, selected: isSelected },
			bubbles: true,
			composed: true
		}));
		this._updateLayout();
	}

	/**
	 * Handles the drag start event.
	 * @param {CustomEvent} e - The drag start event.
	 */
	_onDragStart(e) {
		this._draggedCard = e.detail.card;
		this._originalIndex = this.cards.indexOf(this._draggedCard);
	}

	/**
	 * Handles the drag end event.
	 * @param {CustomEvent} e - The drag end event.
	 */
	_onDragEnd(e) {
		const { card, x } = e.detail;
		let dropIndex = this._getDropIndex(x);

		if (dropIndex === -1 || dropIndex === this._originalIndex) {
			this._updateLayout();
		} else {
			if (this._originalIndex < dropIndex) {
				dropIndex -= 1;
			}

			this.cards.splice(this._originalIndex, 1);
			this.cards.splice(dropIndex, 0, card);

			this.cards.forEach(c => this._container.appendChild(c));

			this.dispatchEvent(new CustomEvent('hand-reordered', {
				detail: { cards: this.cards, draggedCard: card, from: this._originalIndex, to: dropIndex },
				bubbles: true,
				composed: true
			}));

			this._updateLayout();
		}

		this._draggedCard = null;
		this._originalIndex = -1;
	}

	/**
	 * Determines the drop index based on the mouse position.
	 * @param {number} x - The x-coordinate of the mouse.
	 * @returns {number} The index where the card should be dropped.
	 */
	_getDropIndex(x) {
		const rect = this._container.getBoundingClientRect();

		if (x < rect.left || x > rect.right) {
			return -1;
		}

		const relativeX = x - rect.left;
		const handWidth = rect.width;
		const cardWidth = 80;
		const totalWidthNeeded = this.cards.length * cardWidth;

		let spacing;
		if (totalWidthNeeded <= handWidth) {
			spacing = cardWidth;
		} else {
			spacing = (handWidth - cardWidth) / (this.cards.length - 1);
		}

		const lastCardRight = (this.cards.length - 1) * spacing + cardWidth;
		if (relativeX >= lastCardRight) {
			return this.cards.length;
		} else if (relativeX < 0) {
			return 0;
		}

		for (let i = this.cards.length - 1; i >= 0; i--) {
			const cardLeft = i * spacing;
			const cardRight = cardLeft + cardWidth;

			if (relativeX >= cardLeft && relativeX < cardRight) {
				return i;
			}
		}

		return -1;
	}
}

customElements.define('hand-element', HandElement);