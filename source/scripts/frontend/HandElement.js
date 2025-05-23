/**
 * @class HandElement
 * @classdesc Custom web component representing a hand of cards.
 */
class HandElement extends HTMLElement {
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
        styleLink.setAttribute('href', '/source/scripts/frontend/hand.css');
        this.shadowRoot.appendChild(styleLink);

        // Internal state
        this.cards = [];
        this._draggedCard = null;
        this._originalIndex = -1;

        // Listen for card-dropped events
        this.addEventListener('card-dropped', () => {
            this._updateLayout();
        });

        // Listen for drag events
        this.addEventListener('card-dragstart', (e) => this._onDragStart(e));
        this.addEventListener('card-dragend', (e) => this._onDragEnd(e));
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
        console.log('Selected cards to remove:', selectedCards); // Debug log
        selectedCards.forEach(card => this.removeCard(card));
    }

    /**
     * @function getSelectedCards
     * @description Returns an array of currently selected card elements.
     * @returns {CardElement[]}
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
        const cardWidth = 80; // Default card width
        const totalWidth = this.cards.length * cardWidth;

        let spacing;
        if (totalWidth <= handWidth) {
            // If all cards can fit side-by-side, set spacing to card width
            spacing = cardWidth;
        } else {
            // Calculate overlap to fit cards within the hand's width
            spacing = (handWidth - cardWidth) / (this.cards.length - 1);
        }

        this.cards.forEach((card, index) => {
            card.style.position = 'absolute';
            card.style.left = `${index * spacing}px`;
            card.style.transform = card.classList.contains('selected') ? 'translateY(-20px)' : 'translateY(0)';
            card.style.zIndex = index; // Ensure cards on the right have a higher zIndex
            card.style.width = `${cardWidth}px`; // Ensure consistent width
        });
    }

    /**
     * @function _onCardSelect
     * @description Handles card selection.
     * @param {CardElement} cardElement - The selected card element.
     */
    _onCardSelect(cardElement) {
        const isSelected = cardElement.classList.toggle('selected');
        cardElement.style.transform = isSelected ? 'translateY(-20px)' : 'translateY(0)';
        this.dispatchEvent(new CustomEvent('card-selected', {
            detail: { card: cardElement, selected: isSelected },
            bubbles: true,
            composed: true
        }));
        this._updateLayout();
    }

    /**
     * @function _onDragStart
     * @description Handles the start of a drag event.
     * @param {Event} e - The drag start event.
     */
    _onDragStart(e) {
        this._draggedCard = e.detail.card;
        this._originalIndex = this.cards.indexOf(this._draggedCard);
    }

    /**
     * @function _onDragEnd
     * @description Handles the end of a drag event.
     * @param {Event} e - The drag end event.
     */
    _onDragEnd(e) {
        const { card, x, y } = e.detail;

        // Determine the drop index based on mouse position
        let dropIndex = this._getDropIndex(x, y);

        if (dropIndex === -1 || dropIndex === this._originalIndex) {
            // Invalid drop or no change in position, return card to original position
            this._updateLayout();
        } else {
            // Adjust drop index if moving from left to right
            if (this._originalIndex < dropIndex) {
                dropIndex -= 1; // Floor division adjustment
            }

            // Reorder cards
            this.cards.splice(this._originalIndex, 1); // Remove from original index
            this.cards.splice(dropIndex, 0, card); // Insert at new index

            // Notify game logic of reorder
            this.dispatchEvent(new CustomEvent('hand-reordered', {
                detail: { cards: this.cards, draggedCard: card, from: this._originalIndex, to: dropIndex },
                bubbles: true,
                composed: true
            }));

            this._updateLayout();
        }

        // Reset drag state
        this._draggedCard = null;
        this._originalIndex = -1;
    }

    /**
     * @function _getDropIndex
     * @description Calculates the drop index for a dragged card based on mouse position.
     * @param {number} x - The x-coordinate of the mouse pointer.
     * @param {number} y - The y-coordinate of the mouse pointer.
     * @returns {number} - The index where the card can be dropped, or -1 if the drop is invalid.
     */
    _getDropIndex(x, y) {
        const rect = this._container.getBoundingClientRect();
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            return -1; // Invalid drop location
        }

        const relativeX = x - rect.left;
        const cardWidth = 80; // Default card width

        // Find the index based on the mouse position relative to the edges of each card
        for (let i = 0; i < this.cards.length; i++) {
            const cardStart = i * cardWidth;
            const cardEnd = (i + 1) * cardWidth;

            if (relativeX >= cardStart && relativeX < cardEnd) {
                return i;
            }
        }

        // If the mouse is beyond the last card, return the last index
        return this.cards.length;
    }
}

customElements.define('hand-element', HandElement);